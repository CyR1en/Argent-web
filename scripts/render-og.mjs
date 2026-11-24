#!/usr/bin/env node
/**
 * Renders scripts/og-image.html to src/app/opengraph-image.jpg in headless Chromium.
 *
 *   node scripts/render-og.mjs [output.jpg]
 *
 * It needs Node 22 or newer and a Chromium-family browser, which it looks for in CHROME_BIN and
 * then in the usual places. It talks to the browser over the DevTools protocol, so it has no
 * dependencies.
 */
import { spawn } from "node:child_process";
import { existsSync, globSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const WIDTH = 1200;
const HEIGHT = 630;
const QUALITY = 92;

const here = path.dirname(fileURLToPath(import.meta.url));
const page = pathToFileURL(path.join(here, "og-image.html")).href;
const output = path.resolve(process.argv[2] ?? path.join(here, "../src/app/opengraph-image.jpg"));

function findBrowser() {
  const home = os.homedir();
  const candidates = [
    process.env.CHROME_BIN,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    ...globSync(`${home}/Library/Caches/ms-playwright/chromium-*/chrome-mac*/*.app/Contents/MacOS/*`),
    ...globSync(`${home}/.cache/ms-playwright/chromium-*/chrome-linux*/chrome`),
  ];
  const found = candidates.find((candidate) => candidate && existsSync(candidate));
  if (!found) throw new Error("No Chromium found. Point CHROME_BIN at one.");
  return found;
}

const profile = await mkdtemp(path.join(os.tmpdir(), "argent-og-"));
const browser = spawn(
  findBrowser(),
  [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    // The page reads the photograph into a texture, which a file: origin otherwise forbids.
    "--allow-file-access-from-files",
    // Lets WebGL fall back to software where there is no GPU.
    "--enable-unsafe-swiftshader",
    "--hide-scrollbars",
    "--no-first-run",
    // Most Linux distributions deny Chromium its sandbox, and the only page loaded is our own file.
    ...(process.platform === "linux" ? ["--no-sandbox"] : []),
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] }
);

try {
  const endpoint = await new Promise((resolve, reject) => {
    let log = "";
    browser.stderr.on("data", (chunk) => {
      log += chunk;
      const match = log.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) resolve(match[1]);
    });
    browser.on("exit", () => reject(new Error(`The browser exited before it was ready.\n${log}`)));
  });

  const socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  const pending = new Map();
  let nextId = 0;
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const call = pending.get(message.id);
    if (!call) return;
    pending.delete(message.id);
    if (message.error) call.reject(new Error(message.error.message));
    else call.resolve(message.result);
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send(
    "Emulation.setDeviceMetricsOverride",
    { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false },
    sessionId
  );
  await send("Page.navigate", { url: page }, sessionId);

  const evaluate = async (expression) =>
    (await send("Runtime.evaluate", { expression, returnByValue: true }, sessionId)).result.value;
  const deadline = Date.now() + 60_000;
  while (!(await evaluate("window.ogReady === true"))) {
    const error = await evaluate("window.ogError");
    if (error) throw new Error(`The page failed to render: ${error}`);
    if (Date.now() > deadline) throw new Error("The page did not finish rendering.");
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const { data } = await send("Page.captureScreenshot", { format: "jpeg", quality: QUALITY }, sessionId);
  await writeFile(output, Buffer.from(data, "base64"));
  console.log(`${path.relative(process.cwd(), output)}  ${WIDTH}×${HEIGHT}  ${(data.length * 0.75 / 1024).toFixed(0)} KB`);
  socket.close();
} finally {
  browser.kill();
  await rm(profile, { recursive: true, force: true, maxRetries: 5 });
}
