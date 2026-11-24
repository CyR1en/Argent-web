#!/usr/bin/env python3
"""Build self-contained interactive inline mockup preview-inline.html using real stock data."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

STOCKS_TS = Path("/home/ubuntu/Argent-Web/src/data/stocks.ts")
OUT_HTML = Path("/home/ubuntu/Argent-Web/preview-inline.html")
SHARP_PATH = "/home/ubuntu/Argent-Web/node_modules/.pnpm/sharp@0.35.5_@types+node@22.20.5/node_modules/sharp"


def encode_image_data_uri(img_path: str, max_width: int = 720, quality: int = 76) -> str:
    script = (
        f"const sharp = require({json.dumps(SHARP_PATH)});"
        f"sharp({json.dumps(img_path)}).resize({{ width: {max_width}, withoutEnlargement: true }})"
        f".jpeg({{ quality: {quality}, mozjpeg: true }}).toBuffer()"
        f".then(b => process.stdout.write('data:image/jpeg;base64,' + b.toString('base64')));"
    )
    res = subprocess.run(["node", "-e", script], check=True, capture_output=True, text=True)
    return res.stdout


ALPINE_URI = encode_image_data_uri("/home/ubuntu/Argent-Web/public/images/specimen-alpine.jpg")
NIGHT_URI = encode_image_data_uri("/home/ubuntu/Argent-Web/public/images/specimen-night.jpg")
DUNES_URI = encode_image_data_uri("/home/ubuntu/Argent-Web/public/images/specimen-dunes.jpg")
INTERIOR_URI = encode_image_data_uri("/home/ubuntu/Argent-Web/public/images/specimen-interior.jpg")
BANNER_URI = encode_image_data_uri("/home/ubuntu/Argent-Web/public/images/banner.jpg", max_width=800, quality=78)

raw_ts = STOCKS_TS.read_text(encoding="utf-8")
marker = "export const STOCKS: StockProfile[] = "
idx = raw_ts.index(marker) + len(marker)
stocks_json = raw_ts[idx:].rstrip().rstrip(";")
stocks = json.loads(stocks_json)
assert len(stocks) == 14

PLATES_JSON = json.dumps(
    [
        {
            "id": "alpine",
            "label": "Alpine",
            "src": ALPINE_URI,
            "camera": "Sony a7 IV · FE 50mm · ISO 100 · f/5.6",
            "halationFocus": [{"xPct": 24, "yPct": 31}, {"xPct": 37, "yPct": 35}],
        },
        {
            "id": "night",
            "label": "Night",
            "src": NIGHT_URI,
            "camera": "Sony a7 IV · FE 35mm · ISO 800 · f/2",
            "halationFocus": [
                {"xPct": 36, "yPct": 24},
                {"xPct": 19, "yPct": 19},
                {"xPct": 55, "yPct": 43},
                {"xPct": 72, "yPct": 38},
            ],
        },
        {
            "id": "dunes",
            "label": "Dunes",
            "src": DUNES_URI,
            "camera": "Sony a7 IV · FE 55mm · ISO 160 · f/4",
            "halationFocus": [{"xPct": 54, "yPct": 60}],
        },
        {
            "id": "interior",
            "label": "Interior",
            "src": INTERIOR_URI,
            "camera": "Sony a7 IV · FE 40mm · ISO 160 · f/2.8",
            "halationFocus": [{"xPct": 24, "yPct": 34}],
        },
    ]
)

HTML = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Argent — Interactive Website Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..600;1,6..96,400&family=Fragment+Mono&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --display: "Bodoni Moda", Didot, "Bodoni MT", Georgia, serif;
    --sans: "Hanken Grotesk", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
    --mono: "Fragment Mono", ui-monospace, "SF Mono", Menlo, monospace;
    --ground: #0c0d10;
    --surface: #15171c;
    --elevated: #1c1f26;
    --ink: #edeae3;
    --muted: #b5b0a6;
    --hair: rgba(237, 234, 227, 0.14);
    --amber: #e3a25a;
    --orange: #b45a26;
  }

  /* Leave html, body, and outer shell completely transparent with zero card/border/padding */
  html, body {
    margin: 0;
    padding: 0;
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
  }
  *, *::before, *::after { box-sizing: border-box; }

  .outer-wrap { width: 100%; }

  /* Interactive scrollable showcase viewport (fixed px height, never vh) */
  .stage-viewport {
    position: relative;
    width: 100%;
    height: 760px;
    overflow-y: auto;
    overflow-x: hidden;
    border-radius: 10px;
    background: var(--ground);
    color: var(--ink);
    scrollbar-width: thin;
    scrollbar-color: rgba(169,164,155,0.4) transparent;
    transition: background-color 140ms linear, color 140ms linear;
  }

  ::selection { background: var(--orange); color: #f7f4ee; }
  :focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }

  /* Sticky Top Bar */
  .topbar {
    position: sticky;
    top: 0;
    z-index: 30;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-bottom: 1px solid var(--hair);
    background: color-mix(in srgb, var(--ground) 90%, transparent);
    backdrop-filter: blur(12px);
  }
  .brand { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: inherit; }
  .brand span { font-family: var(--display); font-size: 18px; letter-spacing: -0.02em; }
  .nav-links { display: flex; align-items: center; gap: 16px; font-size: 12.5px; }
  .nav-links button {
    all: unset; cursor: pointer; color: var(--muted); transition: color 140ms;
  }
  .nav-links button:hover { color: var(--ink); }
  .dl-pill {
    display: inline-flex; align-items: center; gap: 5px;
    height: 30px; padding: 0 13px; border-radius: 999px;
    background: var(--ink); color: var(--ground);
    font-size: 12px; font-weight: 500; text-decoration: none;
  }

  .wrap { max-width: 1080px; margin: 0 auto; padding: 0 22px; }

  /* Hero (always anchored in darkroom obsidian for guaranteed contrast) */
  .hero {
    position: relative;
    padding: 36px 0 42px;
    overflow: hidden;
    background: #0c0d10;
    color: #edeae3;
  }
  #latent-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .hero-grid {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    align-items: center;
  }
  @media (min-width: 660px) {
    .hero-grid { grid-template-columns: 5fr 7fr; gap: 26px; }
  }
  .hero h1 {
    margin: 0;
    font-family: var(--display);
    font-size: clamp(2.1rem, 4.3vw, 3.15rem);
    font-weight: 400;
    line-height: 0.98;
    letter-spacing: -0.03em;
    color: #edeae3;
  }
  .hero .lede {
    margin: 14px 0 0;
    font-size: 14px;
    line-height: 1.55;
    color: #b5b0a6;
    max-width: 40ch;
  }
  .cta-row {
    margin-top: 18px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .btn-primary {
    display: inline-flex; align-items: center; gap: 6px;
    height: 38px; padding: 0 18px; border-radius: 999px;
    background: #edeae3; color: #0c0d10; font-size: 13px; font-weight: 500; text-decoration: none;
  }
  .btn-ghost {
    all: unset; cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px;
    height: 38px; padding: 0 15px; border-radius: 999px;
    border: 1px solid rgba(237,234,227,0.22); color: #edeae3; font-size: 12.5px;
  }
  .spec-strip {
    margin-top: 16px;
    font-family: var(--mono);
    font-size: 11px;
    color: #b5b0a6;
    display: flex; flex-wrap: wrap; gap: 8px;
  }

  /* 35mm Perforated Film Frame */
  .film-frame {
    border-radius: 7px;
    overflow: hidden;
    background: #090a0d;
    padding: 10px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.52);
    border: 1px solid rgba(255,255,255,0.12);
    user-select: none;
  }
  .rebate-sprockets {
    height: 14px;
    width: 100%;
    background: #14161d;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='14'%3E%3Cpath fill-rule='evenodd' d='M0 0h22v14H0z M6 2.5h10a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 10V4A1.5 1.5 0 0 1 6 2.5z'/%3E%3C/svg%3E") repeat-x;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='14'%3E%3Cpath fill-rule='evenodd' d='M0 0h22v14H0z M6 2.5h10a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 10V4A1.5 1.5 0 0 1 6 2.5z'/%3E%3C/svg%3E") repeat-x;
  }
  .edge-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 4px;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: rgba(227,162,90,0.88);
    text-transform: uppercase;
  }
  .gate {
    position: relative;
    aspect-ratio: 3 / 2;
    width: 100%;
    overflow: hidden;
    border-radius: 3px;
  }
  .gate img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .grain-layer {
    position: absolute; inset: 0; pointer-events: none; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
    background-size: 140px 140px;
  }
  .neg-clip {
    position: absolute; inset: 0; overflow: hidden; pointer-events: none;
  }
  .neg-clip img {
    filter: invert(1) hue-rotate(174deg) saturate(1.18) contrast(0.84) brightness(0.94);
  }
  .neg-mask-mult {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(196,98,38,0.52), rgba(176,84,32,0.48));
    mix-blend-mode: multiply;
  }
  .neg-mask-col {
    position: absolute; inset: 0;
    background: rgba(180,90,38,0.22);
    mix-blend-mode: color;
  }
  .seam-hitbox {
    position: absolute; inset: 0; z-index: 10; cursor: ew-resize; touch-action: none;
  }
  .seam-line {
    position: absolute; top: 0; bottom: 0; width: 1px; background: rgba(237,234,227,0.88);
    pointer-events: none;
  }
  .seam-disc {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(27,28,31,0.94); border: 1px solid rgba(255,255,255,0.28);
    display: grid; place-items: center; box-shadow: 0 3px 12px rgba(0,0,0,0.55);
  }
  .gate-pill-l, .gate-pill-r {
    position: absolute; bottom: 12px; padding: 4px 8px; border-radius: 5px;
    background: rgba(12,13,16,0.86); font-family: var(--mono); font-size: 11px; letter-spacing: 0.04em;
    pointer-events: none;
  }
  .gate-pill-l { left: 12px; color: #f2b27a; }
  .gate-pill-r { right: 12px; color: #edeae3; }

  .controls-bar {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .pill-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .pill-btn {
    all: unset; cursor: pointer;
    height: 28px; padding: 0 10px; border-radius: 5px; font-size: 11.5px; font-weight: 500;
    border: 1px solid rgba(255,255,255,0.16); color: #b5b0a6; transition: all 140ms;
  }
  .pill-btn:hover { color: #edeae3; border-color: rgba(255,255,255,0.32); }
  .pill-btn.active { background: #edeae3; color: #0c0d10; border-color: #edeae3; }
  .pill-btn.amber.active { background: rgba(227,162,90,0.18); color: #e3a25a; border-color: rgba(227,162,90,0.75); }

  /* Optical Pipeline Section (anchored darkroom obsidian) */
  .pipeline-sec {
    padding: 44px 0 38px;
    border-top: 1px solid rgba(237,234,227,0.09);
    background: #0c0d10;
    color: #edeae3;
  }
  .sec-h2 {
    margin: 0;
    font-family: var(--display);
    font-size: clamp(1.65rem, 3vw, 2.35rem);
    font-weight: 400;
    line-height: 1.06;
    letter-spacing: -0.025em;
  }
  .bench-grid {
    margin-top: 22px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 18px;
    align-items: start;
  }
  @media (min-width: 660px) {
    .bench-grid { grid-template-columns: 7fr 5fr; }
  }
  .bench-card {
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.12);
    background: #14161b;
    padding: 12px;
    overflow: hidden;
  }
  .bench-head {
    display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;
    padding: 0 0 10px; border-bottom: 1px solid rgba(255,255,255,0.09); margin-bottom: 12px;
    font-family: var(--mono); font-size: 11px; color: #b5b0a6;
  }
  .bench-head .hi { color: #e3a25a; }
  .stage-btn {
    all: unset; cursor: pointer; display: block; width: 100%;
    padding: 11px 14px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.1);
    margin-bottom: 8px; transition: all 140ms;
  }
  .stage-btn.active { border-color: rgba(227,162,90,0.62); background: #171a21; }
  .stage-btn .top { display: flex; justify-content: space-between; align-items: baseline; }
  .stage-btn .t { font-family: var(--display); font-size: 16px; color: #edeae3; }
  .stage-btn .ev { font-family: var(--mono); font-size: 11px; color: #e3a25a; }
  .stage-btn p { margin: 5px 0 0; font-size: 12.5px; line-height: 1.5; color: #b5b0a6; }

  /* Polarity Seam Divider */
  .polarity-seam {
    padding: 40px 0;
    display: flex;
    align-items: center;
    gap: 14px;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .polarity-seam .line { flex: 1; height: 1px; background: var(--hair); }
  .dot-neg { width: 9px; height: 9px; border-radius: 50%; background: #b45a26; display: inline-block; }
  .dot-prt { width: 9px; height: 9px; border-radius: 50%; background: #dedfe1; border: 1px solid rgba(0,0,0,0.2); display: inline-block; }

  /* Archival Baryta Paper Acts (always crisp high-contrast ink over archival paper) */
  .paper-acts {
    background: #eeeae2;
    color: #17181b;
    --ground: #eeeae2;
    --surface: #e4dfd5;
    --elevated: #f6f3ec;
    --ink: #17181b;
    --muted: #55524c;
    --hair: rgba(23, 24, 27, 0.13);
  }

  /* Stock Gallery */
  .stocks-sec { padding: 38px 0 42px; }
  .strip-wrap {
    margin-top: 16px;
    border-radius: 6px;
    background: #0b0c10;
    padding: 8px 10px;
    overflow-x: auto;
    box-shadow: 0 12px 32px rgba(0,0,0,0.18);
    scrollbar-width: none;
  }
  .strip-wrap::-webkit-scrollbar { display: none; }
  .strip-row { display: flex; gap: 8px; padding: 8px 0; width: max-content; }
  .strip-item {
    all: unset; cursor: pointer; position: relative; width: 136px; flex: none;
    border-radius: 3px; overflow: hidden; opacity: 0.82; transition: opacity 150ms;
  }
  .strip-item.active { opacity: 1; box-shadow: 0 0 0 2px #e3a25a; }
  .strip-item img { display: block; width: 100%; aspect-ratio: 3/2; object-fit: cover; }
  .strip-lbl {
    position: absolute; inset: auto 0 0 0; padding: 6px 8px;
    background: linear-gradient(transparent, rgba(0,0,0,0.88));
    display: flex; justify-content: space-between; align-items: center;
    font-size: 11px; color: #f3efe8;
  }
  .strip-lbl span:last-child { font-family: var(--mono); font-size: 11px; color: #e3a25a; }

  .datasheet-panel {
    margin-top: 18px;
    border-radius: 9px;
    border: 1px solid rgba(23,24,27,0.13);
    background: #f6f3ec;
    padding: 18px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 18px;
  }
  @media (min-width: 660px) {
    .datasheet-panel { grid-template-columns: 1fr 1fr; }
  }
  .paper-btn {
    all: unset; cursor: pointer; height: 28px; padding: 0 11px; border-radius: 5px;
    font-family: var(--mono); font-size: 11px;
    border: 1px solid rgba(23,24,27,0.16); color: #55524c;
  }
  .paper-btn.active { background: #17181b; color: #eeeae2; border-color: #17181b; }
  .paper-btn.raw-on { background: #b45a26; color: #f7f4ee; border-color: #b45a26; }

  .chart-box {
    border-radius: 7px; border: 1px solid rgba(23,24,27,0.12); background: rgba(255,255,255,0.55);
    padding: 12px;
  }
  .spec-dl {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    border-top: 1px solid rgba(23,24,27,0.12); padding-top: 12px; margin: 0; font-size: 12px;
  }
  .spec-dl dt { font-family: var(--mono); font-size: 11px; text-transform: uppercase; color: #55524c; }
  .spec-dl dd { margin: 3px 0 0; font-weight: 500; color: #17181b; }

  /* macOS Graphite Workflow Window */
  .wf-sec { padding: 28px 0 42px; }
  .mac-win {
    margin-top: 16px;
    border-radius: 12px;
    background: #2f3133;
    color: #f2f2f0;
    overflow: hidden;
    padding-bottom: 8px;
    box-shadow: 0 18px 46px rgba(0,0,0,0.2);
  }
  .mac-tb {
    padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: space-between; font-size: 12px; line-height: 1.2;
  }
  .lights { display: flex; gap: 6px; align-items: center; }
  .lights i { width: 9px; height: 9px; border-radius: 50%; display: block; }
  .mac-ws {
    margin: 8px 8px 0; border-radius: 10px; background: #373a3c; padding: 16px;
  }
  .wf-tabs { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  .wf-tab {
    all: unset; cursor: pointer; padding: 8px 13px; border-radius: 6px; font-size: 12px;
    border: 1px solid rgba(23,24,27,0.14); color: #55524c;
  }
  .wf-tab.active { background: #f6f3ec; border-color: #17181b; color: #17181b; font-weight: 500; }

  /* Archival Download Colophon */
  .folio-sec { padding: 28px 0 38px; border-top: 1px solid rgba(23,24,27,0.12); }
  .banner-box {
    border-radius: 8px; overflow: hidden; border: 1px solid rgba(23,24,27,0.12);
    box-shadow: 0 14px 36px rgba(23,24,27,0.12);
  }
  .banner-box img { display: block; width: 100%; height: auto; }
  .sprockets { display: flex; align-items: center; gap: 6px; margin-top: 14px; }
  .sprocket { width: 8px; height: 9px; border-radius: 2px; }
  .folio-cols {
    margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(23,24,27,0.12);
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; font-size: 12px; line-height: 1.5;
  }
  @media (min-width: 640px) { .folio-cols { grid-template-columns: repeat(4, 1fr); } }
  .folio-cols dt { font-family: var(--mono); font-size: 11px; text-transform: uppercase; color: #55524c; }
  .folio-cols dd { margin: 4px 0 0; color: #17181b; }
  .legal { margin-top: 20px; padding-top: 14px; border-top: 1px solid rgba(23,24,27,0.12); font-size: 11px; line-height: 1.55; color: #55524c; }
</style>
</head>
<body>
<div class="outer-wrap">
  <div class="stage-viewport" id="viewport">
    <header class="topbar">
      <a href="#hero-sec" class="brand">
        <svg width="22" height="22" viewBox="0 0 1024 1024" aria-hidden="true">
          <defs><linearGradient id="mbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34353A"/><stop offset="1" stop-color="#1B1C1F"/></linearGradient></defs>
          <rect x="64" y="64" width="896" height="896" rx="220" fill="url(#mbg)"/>
          <g transform="translate(100 100) scale(0.804688)">
            <path fill="#B45A26" d="M505 212H324A112 112 0 0 0 212 324V700A112 112 0 0 0 324 812H505Z"/>
            <path fill="#DEDFE1" d="M519 212H700A112 112 0 0 1 812 324V700A112 112 0 0 1 700 812H519V684A172 172 0 0 0 519 340Z"/>
            <path fill="#F2B27A" d="M505 340A172 172 0 0 0 505 684Z"/>
          </g>
        </svg>
        <span>Argent</span>
      </a>
      <nav class="nav-links" aria-label="Sections">
        <button type="button" data-jump="#pipeline-sec">Optical Model</button>
        <button type="button" data-jump="#stocks-sec">Stocks</button>
        <button type="button" data-jump="#workflow-sec">Workflow</button>
      </nav>
      <a href="https://github.com/CyR1en/Argent/releases/tag/nightly" target="_blank" rel="noreferrer" class="dl-pill">Download</a>
    </header>

    <!-- ACT I: DARKROOM HERO -->
    <section class="hero" id="hero-sec">
      <canvas id="latent-canvas" aria-hidden="true"></canvas>
      <div class="wrap hero-grid">
        <div>
          <h1>Raw files, developed as film.</h1>
          <p class="lede">
            Scene-linear Sony a7 IV RAW passed through modelled colour negative and optical print. Native Metal on Apple silicon, built around the digital roll.
          </p>
          <div class="cta-row">
            <a href="https://github.com/CyR1en/Argent/releases/tag/nightly" target="_blank" rel="noreferrer" class="btn-primary">Download for macOS</a>
            <button type="button" class="btn-ghost" data-jump="#pipeline-sec">Inside the optical chain ↓</button>
          </div>
          <div class="spec-strip">
            <span>macOS 27</span><span>·</span><span>Apple silicon</span><span>·</span><span>Open source Apache 2.0</span>
          </div>
        </div>

        <div>
          <div class="film-frame">
            <div class="rebate-sprockets"></div>
            <div class="edge-row">
              <span id="hero-edge">KODAK PORTRA 400 · 14A</span>
              <span id="hero-iso">ISO 400</span>
            </div>
            <div class="gate">
              <img id="hero-print-img" src="/home/ubuntu/Argent-Web/public/images/specimen-alpine.jpg" alt="Hero specimen print">
              <div id="hero-halation" style="position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;"></div>
              <div id="hero-grain" class="grain-layer" style="opacity:0.11;"></div>

              <div class="neg-clip" id="hero-neg-clip" style="clip-path: inset(0 54% 0 0);">
                <img id="hero-neg-img" src="/home/ubuntu/Argent-Web/public/images/specimen-alpine.jpg" alt="" aria-hidden="true">
                <div class="neg-mask-mult"></div>
                <div class="neg-mask-col"></div>
              </div>

              <div class="seam-hitbox" id="hero-seam-hitbox" role="slider" tabindex="0" aria-label="Negative and print optical seam" aria-valuemin="8" aria-valuemax="92" aria-valuenow="46">
                <span class="gate-pill-l" id="pill-neg">NEGATIVE · STATUS M</span>
                <span class="gate-pill-r" id="pill-prt">PRINT · ENDURA PREMIER</span>
                <div class="seam-line" id="hero-seam-line" style="left:46%;">
                  <div class="seam-disc">
                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M11 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h4V4z" fill="#B45A26"/>
                      <path d="M13 4h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4v-3.8a4.2 4.2 0 0 0 0-8.4V4z" fill="#DEDFE1"/>
                      <path d="M11 7.8a4.2 4.2 0 0 0 0 8.4V7.8z" fill="#F2B27A"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div class="edge-row">
              <span>SCENE-LINEAR REC. 2020</span>
              <span id="hero-paper">KODAK ENDURA PREMIER</span>
            </div>
            <div class="rebate-sprockets"></div>
          </div>

          <div class="controls-bar">
            <div class="pill-row" id="hero-stocks"></div>
            <div class="pill-row" id="hero-plates"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ACT II: 4-STAGE OPTICAL PIPELINE -->
    <section class="pipeline-sec" id="pipeline-sec">
      <div class="wrap">
        <h2 class="sec-h2" style="color:#edeae3;">Film physics, never a LUT preset.</h2>
        <div class="bench-grid">
          <div class="bench-card">
            <div class="bench-head">
              <span class="hi" id="pipe-readout">−4 EV · SCENE-LINEAR REC. 2020</span>
              <span id="pipe-const">Metered mid-gray: 11.49 / ISO lux·s</span>
            </div>
            <div class="gate">
              <img id="pipe-img" src="/home/ubuntu/Argent-Web/public/images/specimen-alpine.jpg" alt="Optical pipeline stage">
              <div id="pipe-neg" class="neg-clip" style="opacity:0;">
                <img src="/home/ubuntu/Argent-Web/public/images/specimen-alpine.jpg" alt="" aria-hidden="true">
                <div class="neg-mask-mult"></div>
              </div>
              <div id="pipe-halo" style="position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;opacity:0;"></div>
              <div id="pipe-grain" class="grain-layer" style="opacity:0.05;"></div>
            </div>
          </div>
          <div id="pipe-stages"></div>
        </div>
      </div>
    </section>

    <!-- POLARITY SEAM -->
    <div style="background: var(--ground);">
      <div class="wrap">
        <div class="polarity-seam" id="polarity-seam">
          <span class="line"></span>
          <span>Negative</span>
          <span class="dot-neg"></span>
          <span class="dot-prt"></span>
          <span>Print</span>
          <span class="line"></span>
        </div>
      </div>
    </div>

    <div class="paper-acts">
      <!-- ACT III: 14-STOCK CONTACT STRIP + REAL STATUS M CHART -->
      <section class="stocks-sec" id="stocks-sec">
        <div class="wrap">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px;">
            <div>
              <h2 class="sec-h2">Fourteen emulsions, zero scan fits.</h2>
              <p style="margin:8px 0 0;font-size:13.5px;line-height:1.55;color:#55524c;max-width:54ch;">
                Published Kodak and Fujifilm datasheets plus transparent proxies where sheets omit data. Click any frame along the 35mm roll to inspect its Status M density curves.
              </p>
            </div>
            <div class="pill-row" id="family-filters"></div>
          </div>

          <div class="strip-wrap">
            <div class="rebate-sprockets"></div>
            <div class="strip-row" id="contact-strip"></div>
            <div class="rebate-sprockets"></div>
          </div>

          <div class="datasheet-panel">
            <div>
              <div class="film-frame">
                <div class="rebate-sprockets"></div>
                <div class="edge-row">
                  <span id="gal-edge">KODAK PORTRA 400 · 14A</span>
                  <span id="gal-iso">ISO 400</span>
                </div>
                <div class="gate">
                  <img id="gal-img" src="/home/ubuntu/Argent-Web/public/images/specimen-interior.jpg" alt="Selected emulsion plate">
                  <div id="gal-halo" style="position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;"></div>
                  <div id="gal-grain" class="grain-layer" style="opacity:0.11;"></div>
                </div>
                <div class="edge-row">
                  <span>DEVELOPED PRINT</span>
                  <span id="gal-paper">KODAK ENDURA PREMIER</span>
                </div>
                <div class="rebate-sprockets"></div>
              </div>
              <div class="controls-bar">
                <div class="pill-row" id="gal-plates"></div>
                <button type="button" class="paper-btn" id="raw-compare-btn">Hold for Neutral RAW</button>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">
                  <h3 id="gal-name" style="margin:0;font-family:var(--display);font-size:26px;font-weight:400;">Portra 400</h3>
                  <span id="gal-status" style="font-family:var(--mono);font-size:11px;text-transform:uppercase;padding:3px 10px;border-radius:999px;border:1px solid rgba(23,24,27,0.16);color:#55524c;">datasheet</span>
                </div>
                <p id="gal-summary" style="margin:6px 0 0;font-size:12.5px;line-height:1.5;color:#55524c;"></p>
              </div>

              <div class="chart-box">
                <div style="display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:11px;color:#55524c;margin-bottom:6px;">
                  <span>STATUS M CURVES</span>
                  <span id="chart-readout"></span>
                </div>
                <svg id="hd-svg" viewBox="0 0 380 156" style="width:100%;display:block;"></svg>
              </div>

              <dl class="spec-dl">
                <div><dt>Box Speed</dt><dd id="spec-iso">ISO 400</dd></div>
                <div><dt>Paper</dt><dd id="spec-paper">ENDURA Premier</dd></div>
                <div><dt>Halation</dt><dd id="spec-hal">1.5% · 180 µm</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <!-- ACT IV: WORKFLOW -->
      <section class="wf-sec" id="workflow-sec">
        <div class="wrap">
          <h2 class="sec-h2">Built around the roll.</h2>
          <div class="wf-tabs">
            <button type="button" class="wf-tab active" data-wf="import">1. Bring in a roll (⌘O / ⌘I)</button>
            <button type="button" class="wf-tab" data-wf="film">2. Choose the film</button>
            <button type="button" class="wf-tab" data-wf="develop">3. Develop (⌘D)</button>
          </div>
          <div class="mac-win">
            <div class="mac-tb">
              <div class="lights">
                <i style="background:#ff5f57;"></i>
                <i style="background:#febc2e;"></i>
                <i style="background:#28c840;"></i>
                <span style="margin-left:8px;font-family:var(--display);font-size:15px;">Argent</span>
              </div>
              <span id="wf-title" style="font-size:12px;font-weight:600;">Rolls · 4 rolls</span>
              <span style="font-family:var(--mono);font-size:11px;opacity:0.7;">macOS 27</span>
            </div>
            <div class="mac-ws" id="wf-body"></div>
          </div>
        </div>
      </section>

      <!-- ACT V: ARCHIVAL PRINT COLOPHON -->
      <section class="folio-sec" id="download-sec">
        <div class="wrap">
          <div class="banner-box">
            <img src="/home/ubuntu/Argent-Web/public/images/banner.jpg" alt="Argent print beside orange negative strip">
          </div>
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:14px;margin-top:24px;">
            <div>
              <h2 class="sec-h2">A digital roll. A film finish.</h2>
              <div class="sprockets" aria-hidden="true" id="dmg-sprockets"></div>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <a href="https://github.com/CyR1en/Argent/releases/tag/nightly" target="_blank" rel="noreferrer" class="dl-pill" style="height:40px;padding:0 20px;font-size:13px;background:#17181b;color:#eeeae2;">Download Argent (DMG)</a>
              <a href="https://github.com/CyR1en/Argent" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;height:40px;padding:0 16px;border-radius:999px;border:1px solid rgba(23,24,27,0.22);color:#17181b;text-decoration:none;font-size:13px;">GitHub</a>
            </div>
          </div>
          <dl class="folio-cols">
            <div><dt>Requirements</dt><dd>macOS 27 on Apple silicon · Sony a7 IV .ARW</dd></div>
            <div><dt>Distribution</dt><dd>Developer ID signed, Apple notarized, Sparkle 2</dd></div>
            <div><dt>Processing</dt><dd>100% local Metal GPU · Non-destructive</dd></div>
            <div><dt>Licence</dt><dd>Apache 2.0 · Optional DINOv3 masks</dd></div>
          </dl>
          <p class="legal">
            Built with DINOv3. Kodak, Portra, Ektar, Gold, ColorPlus, UltraMax, and Vision3 are trademarks of Eastman Kodak Company. Fujifilm, Fujicolor, Pro 400H, C200, and Superia are trademarks of FUJIFILM Corporation. CineStill is a trademark of CineStill Film. Sony and a7 IV are trademarks of Sony Group Corporation. Argent is not affiliated with or endorsed by any of them.
          </p>
        </div>
      </section>
    </div>
  </div>
</div>

<script>
(() => {
  const STOCKS = __STOCKS_JSON__;
  const PLATES = __PLATES_JSON__;
  const viewport = document.getElementById("viewport");

  document.querySelectorAll("[data-jump]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.getAttribute("data-jump"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Polarity scroll interpolation inside viewport
  const seam = document.getElementById("polarity-seam");
  const root = document.documentElement;
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rgbLerp(c1, c2, t) {
    return `rgb(${Math.round(lerp(c1[0],c2[0],t))},${Math.round(lerp(c1[1],c2[1],t))},${Math.round(lerp(c1[2],c2[2],t))})`;
  }
  function updatePolarity() {
    const vRect = viewport.getBoundingClientRect();
    const sRect = seam.getBoundingClientRect();
    const mid = vRect.top + vRect.height * 0.65;
    const raw = (mid - sRect.top) / 110;
    const t = Math.min(1, Math.max(0, raw));
    const p = t * t * (3 - 2 * t);
    root.style.setProperty("--ground", rgbLerp([12,13,16], [238,234,226], p));
    if (p < 0.5) {
      root.style.setProperty("--ink", "#edeae3");
      root.style.setProperty("--muted", "#b5b0a6");
      root.style.setProperty("--hair", "rgba(237,234,227,0.14)");
    } else {
      root.style.setProperty("--ink", "#17181b");
      root.style.setProperty("--muted", "#55524c");
      root.style.setProperty("--hair", "rgba(23,24,27,0.13)");
    }
  }
  viewport.addEventListener("scroll", updatePolarity, { passive: true });
  updatePolarity();

  // Bayer-8 Canvas2D Latent Image field behind Hero
  const canvas = document.getElementById("latent-canvas");
  const ctx = canvas.getContext("2d");
  let px = -999, py = -999, pTime = 0;
  const heroSec = document.getElementById("hero-sec");
  heroSec.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    px = e.clientX - r.left; py = e.clientY - r.top;
  });
  heroSec.addEventListener("pointerleave", () => { px = -999; py = -999; });
  const bayer4 = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
  function drawLatent() {
    const w = canvas.clientWidth || 700;
    const h = canvas.clientHeight || 420;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    ctx.clearRect(0, 0, w, h);
    const step = 4;
    pTime += 0.018;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const calm = Math.min(1, Math.max(0.18, (x - w * 0.36) / 100));
        const wave = 0.5 + 0.5 * Math.sin(x * 0.011 + pTime) * Math.cos(y * 0.012 - pTime * 0.7);
        const dx = x - px, dy = y - py;
        const glow = px > 0 ? Math.exp(-(dx*dx + dy*dy) / 5200) : 0;
        const cov = (0.04 + 0.19 * wave) * calm + glow * 0.55;
        const thr = bayer4[(y/step)&3][(x/step)&3] / 16;
        if (cov > thr) {
          ctx.fillStyle = glow > 0.25 ? "rgba(227,162,90,0.34)" : "rgba(237,234,227,0.14)";
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }
    requestAnimationFrame(drawLatent);
  }
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    requestAnimationFrame(drawLatent);
  } else {
    drawLatent();
  }

  // Hero Seam Interactions
  let heroStockId = "kodak-portra-400";
  let heroPlateId = "alpine";
  const heroNegClip = document.getElementById("hero-neg-clip");
  const heroSeamLine = document.getElementById("hero-seam-line");
  const heroHit = document.getElementById("hero-seam-hitbox");
  const pillNeg = document.getElementById("pill-neg");
  const pillPrt = document.getElementById("pill-prt");

  function setSeam(pct) {
    const seamPct = Math.min(92, Math.max(8, pct));
    heroNegClip.style.clipPath = `inset(0 ${100 - seamPct}% 0 0)`;
    heroSeamLine.style.left = `${seamPct}%`;
    heroHit.setAttribute("aria-valuenow", String(Math.round(seamPct)));
    pillNeg.style.opacity = seamPct > 24 ? "1" : "0";
    pillPrt.style.opacity = seamPct < 76 ? "1" : "0";
  }
  function updateHeroRender() {
    const s = STOCKS.find(x => x.id === heroStockId);
    const p = PLATES.find(x => x.id === heroPlateId);
    document.getElementById("hero-print-img").src = p.src;
    document.getElementById("hero-neg-img").src = p.src;
    document.getElementById("hero-print-img").style.filter = s.grade.filter;
    document.getElementById("hero-grain").style.opacity = String(s.grade.grainOpacity);
    document.getElementById("hero-edge").textContent = s.edgeCode;
    document.getElementById("hero-iso").textContent = `ISO ${s.boxSpeed}`;
    document.getElementById("hero-paper").textContent = s.paper.toUpperCase();
    document.getElementById("pill-prt").textContent = "PRINT · " + (s.id === "kodak-vision3-500t-cinema" ? "VISION 2383" : "ENDURA PREMIER");
    const halo = document.getElementById("hero-halation");
    halo.style.opacity = String(Math.min(0.95, s.grade.halationStrength));
    halo.style.backgroundImage = p.halationFocus.map(pt =>
      `radial-gradient(circle at ${pt.xPct}% ${pt.yPct}%, rgba(235,58,28,0.6) 0%, rgba(212,42,22,0.22) 10%, transparent 24%)`
    ).join(",");
  }

  heroHit.addEventListener("pointerdown", (e) => {
    heroHit.setPointerCapture(e.pointerId);
    const r = heroHit.getBoundingClientRect();
    setSeam(((e.clientX - r.left) / r.width) * 100);
  });
  heroHit.addEventListener("pointermove", (e) => {
    if (e.buttons !== 1 && e.pointerType === "mouse") return;
    const r = heroHit.getBoundingClientRect();
    setSeam(((e.clientX - r.left) / r.width) * 100);
  });

  const heroStockWrap = document.getElementById("hero-stocks");
  ["kodak-portra-400", "kodak-ektar-100", "cinestill-800t", "kodak-vision3-500t-cinema"].forEach(id => {
    const s = STOCKS.find(x => x.id === id);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pill-btn" + (id === heroStockId ? " active" : "");
    b.textContent = s.displayName;
    b.onclick = () => {
      heroStockId = id;
      heroStockWrap.querySelectorAll("button").forEach(btn => btn.classList.toggle("active", btn === b));
      updateHeroRender();
    };
    heroStockWrap.appendChild(b);
  });
  const heroPlateWrap = document.getElementById("hero-plates");
  PLATES.slice(0, 3).forEach(p => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pill-btn amber" + (p.id === heroPlateId ? " active" : "");
    b.textContent = p.label;
    b.onclick = () => {
      heroPlateId = p.id;
      heroPlateWrap.querySelectorAll("button").forEach(btn => btn.classList.toggle("active", btn === b));
      updateHeroRender();
    };
    heroPlateWrap.appendChild(b);
  });
  updateHeroRender();

  // Pipeline Bench
  const STAGES = [
    { ev: "−4 EV", t: "Scene-linear Rec. 2020", c: "Metered mid-gray: 11.49 / ISO lux·s", d: "Untouched Sony a7 IV RAW encoded ±8 stops around metered mid-gray.", neg: 0, halo: 0, grain: 0.03, filter: "contrast(0.90) saturate(0.84) brightness(1.03)", src: PLATES[0].src },
    { ev: "−1 EV", t: "Colour negative & couplers", c: "Highlight shoulder: +3 to +5.5 stops", d: "Status M curve inversion with fitted natural-reflectance matrix and couplers.", neg: 1, halo: 0, grain: 0.08, filter: "contrast(0.96) saturate(0.92)", src: PLATES[0].src },
    { ev: "+1 EV", t: "3200 K enlarger onto paper", c: "Neutral balance: dE2000 < 0.01", d: "3200 K blackbody enlarger projects through dyes onto ENDURA Premier or VISION 2383.", neg: 0, halo: 0.10, grain: 0.11, filter: "contrast(1.06) saturate(1.02) sepia(0.08)", src: PLATES[0].src },
    { ev: "+4 EV", t: "Film grain & base halation", c: "Base reflection: 180 – 270 µm", d: "Print Grain Index tables and red base-reflection halation on Apple silicon Metal.", neg: 0, halo: 0.68, grain: 0.16, filter: "contrast(1.14) saturate(1.06) hue-rotate(-8deg)", src: PLATES[1].src }
  ];
  const pipeStagesEl = document.getElementById("pipe-stages");
  let activePipe = 2;
  function renderPipe() {
    const st = STAGES[activePipe];
    document.getElementById("pipe-readout").textContent = `${st.ev} · ${st.t.toUpperCase()}`;
    document.getElementById("pipe-const").textContent = st.c;
    const img = document.getElementById("pipe-img");
    img.src = st.src; img.style.filter = st.filter;
    document.getElementById("pipe-neg").style.opacity = String(st.neg);
    document.getElementById("pipe-grain").style.opacity = String(st.grain);
    const halo = document.getElementById("pipe-halo");
    halo.style.opacity = String(st.halo);
    halo.style.backgroundImage = PLATES[1].halationFocus.map(pt =>
      `radial-gradient(circle at ${pt.xPct}% ${pt.yPct}%, rgba(235,58,28,0.65) 0%, transparent 25%)`
    ).join(",");
    pipeStagesEl.querySelectorAll(".stage-btn").forEach((el, idx) => el.classList.toggle("active", idx === activePipe));
  }
  STAGES.forEach((st, idx) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "stage-btn";
    b.innerHTML = `<div class="top"><span class="t">${st.t}</span><span class="ev">${st.ev}</span></div><p>${st.d}</p>`;
    b.onclick = () => { activePipe = idx; renderPipe(); };
    pipeStagesEl.appendChild(b);
  });
  renderPipe();

  // 14-Stock Contact Strip & Real Status M Chart
  const FAMILIES = ["All 14", "Portra", "Kodak Daylight", "Fujifilm", "Tungsten & Cinema"];
  let galFamily = "All 14";
  let galStockId = "kodak-portra-400";
  let galPlateId = "interior";
  let galRaw = false;

  const famWrap = document.getElementById("family-filters");
  function renderFamilies() {
    famWrap.innerHTML = "";
    FAMILIES.forEach(f => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "paper-btn" + (f === galFamily ? " active" : "");
      b.textContent = f;
      b.onclick = () => {
        galFamily = f;
        const list = f === "All 14" ? STOCKS : STOCKS.filter(s => s.family === f);
        if (list.length) galStockId = list[0].id;
        renderFamilies();
        renderStrip();
        renderDatasheet();
      };
      famWrap.appendChild(b);
    });
  }

  const stripEl = document.getElementById("contact-strip");
  function renderStrip() {
    stripEl.innerHTML = "";
    const list = galFamily === "All 14" ? STOCKS : STOCKS.filter(s => s.family === galFamily);
    list.forEach((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "strip-item" + (s.id === galStockId ? " active" : "");
      const thumb = s.family === "Tungsten & Cinema" ? PLATES[1].src : PLATES[0].src;
      b.innerHTML = `<img src="${thumb}" alt="${s.displayName}" style="filter:${s.grade.filter}"><div class="strip-lbl"><span>${s.displayName}</span><span>${i+1}A</span></div>`;
      b.onclick = () => {
        galStockId = s.id;
        if (s.family === "Tungsten & Cinema" && galPlateId === "interior") galPlateId = "night";
        renderStrip();
        renderDatasheet();
      };
      stripEl.appendChild(b);
    });
  }

  function renderChart(s) {
    const svg = document.getElementById("hd-svg");
    const w = 380, h = 156, padL = 28, padR = 8, padT = 8, padB = 22;
    const pw = w - padL - padR, ph = h - padT - padB;
    const { logH, r, g, b } = s.curves;
    const minH = Math.min(...logH), maxH = Math.max(...logH);
    const toD = (arr) => arr.map((v, i) => {
      const x = padL + ((logH[i] - minH) / (maxH - minH)) * pw;
      const y = padT + ph - (v / 3.2) * ph;
      return `${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    const mid = Math.round(logH.length * 0.56);
    document.getElementById("chart-readout").textContent = `Log H ${logH[mid].toFixed(2)} · R ${r[mid].toFixed(2)} G ${g[mid].toFixed(2)} B ${b[mid].toFixed(2)}`;
    svg.innerHTML = `
      <line x1="${padL}" y1="${padT+ph}" x2="${padL+pw}" y2="${padT+ph}" stroke="rgba(23,24,27,0.2)"/>
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT+ph}" stroke="rgba(23,24,27,0.2)"/>
      <path d="${toD(b)}" fill="none" stroke="#275ea3" stroke-width="2"/>
      <path d="${toD(g)}" fill="none" stroke="#267349" stroke-width="2"/>
      <path d="${toD(r)}" fill="none" stroke="#b83628" stroke-width="2.1"/>
      <text x="${padL}" y="${h-4}" font-family="monospace" font-size="11" fill="#55524c">${minH.toFixed(1)}</text>
      <text x="${padL+pw/2}" y="${h-4}" text-anchor="middle" font-family="monospace" font-size="11" fill="#55524c">Log H</text>
      <text x="${padL+pw}" y="${h-4}" text-anchor="end" font-family="monospace" font-size="11" fill="#55524c">${maxH.toFixed(1)}</text>
    `;
  }

  function renderDatasheet() {
    const s = STOCKS.find(x => x.id === galStockId) || STOCKS[2];
    const p = PLATES.find(x => x.id === galPlateId) || PLATES[0];
    const img = document.getElementById("gal-img");
    img.src = p.src;
    img.style.filter = galRaw ? "contrast(0.92) saturate(0.86) brightness(1.02)" : s.grade.filter;
    document.getElementById("gal-grain").style.opacity = galRaw ? "0" : String(s.grade.grainOpacity);
    const halo = document.getElementById("gal-halo");
    halo.style.opacity = galRaw ? "0" : String(Math.min(0.95, s.grade.halationStrength));
    halo.style.backgroundImage = p.halationFocus.map(pt =>
      `radial-gradient(circle at ${pt.xPct}% ${pt.yPct}%, rgba(235,58,28,0.58) 0%, transparent 24%)`
    ).join(",");
    document.getElementById("gal-edge").textContent = s.edgeCode;
    document.getElementById("gal-iso").textContent = `ISO ${s.boxSpeed}`;
    document.getElementById("gal-paper").textContent = s.paper.toUpperCase();
    document.getElementById("gal-name").textContent = s.displayName;
    document.getElementById("gal-status").textContent = s.status;
    document.getElementById("gal-summary").textContent = s.summary;
    document.getElementById("spec-iso").textContent = `ISO ${s.boxSpeed}`;
    document.getElementById("spec-paper").textContent = s.paper;
    document.getElementById("spec-hal").textContent = s.halation ? `${Math.round(s.halation.strength*100)}% · ${s.halation.radiusMicrometres} µm` : "Not modelled";
    renderChart(s);
    const gp = document.getElementById("gal-plates");
    gp.innerHTML = "";
    PLATES.forEach(pl => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "paper-btn" + (pl.id === galPlateId ? " active" : "");
      b.textContent = pl.label;
      b.onclick = () => { galPlateId = pl.id; renderDatasheet(); };
      gp.appendChild(b);
    });
  }

  const rawBtn = document.getElementById("raw-compare-btn");
  rawBtn.addEventListener("pointerdown", () => { galRaw = true; rawBtn.classList.add("raw-on"); rawBtn.textContent = "Showing Neutral RAW"; renderDatasheet(); });
  ["pointerup","pointerleave","pointercancel"].forEach(ev => rawBtn.addEventListener(ev, () => {
    galRaw = false; rawBtn.classList.remove("raw-on"); rawBtn.textContent = "Hold for Neutral RAW"; renderDatasheet();
  }));

  renderFamilies();
  renderStrip();
  renderDatasheet();

  // Workflow Tabs
  const wfBody = document.getElementById("wf-body");
  const wfTitle = document.getElementById("wf-title");
  function renderWf(mode) {
    if (mode === "import") {
      wfTitle.textContent = "Rolls · High Sierra & Rain Corner";
      wfBody.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:8px;flex-wrap:wrap;">
          <div><div style="font-size:16px;font-weight:600;">Rolls</div><div style="font-family:var(--mono);font-size:11px;opacity:0.7;">Sony a7 IV .ARW · Capture order</div></div>
          <div style="display:flex;gap:8px;font-size:11.5px;"><span style="background:rgba(255,255,255,0.12);padding:5px 10px;border-radius:6px;">Folder ⌘O</span><span style="background:#e2e4e6;color:#1d1f21;padding:5px 10px;border-radius:6px;font-weight:600;">Import Roll ⌘I</span></div>
        </div>
        <div style="background:#0c0d14;border-radius:6px;padding:8px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
          <img src="${PLATES[0].src}" style="width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:3px;">
          <img src="${PLATES[2].src}" style="width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:3px;">
          <img src="${PLATES[3].src}" style="width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:3px;">
          <img src="${PLATES[1].src}" style="width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:3px;">
        </div>`;
    } else if (mode === "film") {
      wfTitle.textContent = "High Sierra · Frame 14A · Portra 400";
      wfBody.innerHTML = `
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:12px;align-items:center;">
          <div style="background:#2a2c2e;padding:12px;border-radius:6px;"><img src="${PLATES[0].src}" style="width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:3px;filter:${STOCKS[2].grade.filter}"></div>
          <div style="background:#2c2f31;padding:12px;border-radius:8px;font-size:12px;">
            <div style="font-weight:600;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;">Film · Auto smoothed</div>
            <div style="margin-top:8px;opacity:0.8;">Stock: Portra 400</div>
            <div style="margin-top:4px;opacity:0.8;">Rated at: EI 400</div>
            <div style="margin-top:6px;color:#e3a25a;font-family:var(--mono);font-size:11px;">DINOv3 masks ready</div>
          </div>
        </div>`;
    } else {
      wfTitle.textContent = "Develop · 36 flagged frames";
      wfBody.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-size:15px;font-weight:600;">16-bit TIFF · Display P3</div>
            <div style="margin-top:4px;font-size:12px;opacity:0.75;">Retains EXIF, GPS, and XMP metadata. Stopped batches resume cleanly.</div>
          </div>
          <span style="background:#e2e4e6;color:#1d1f21;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:600;">Develop Roll ⌘D</span>
        </div>`;
    }
  }
  document.querySelectorAll(".wf-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".wf-tab").forEach(t => t.classList.toggle("active", t === tab));
      renderWf(tab.getAttribute("data-wf"));
    });
  });
  renderWf("import");

  // DMG 9-sprocket amber chevron motif
  const spWrap = document.getElementById("dmg-sprockets");
  for (let i = 0; i < 9; i++) {
    const a = 0.22 + 0.78 * Math.pow(i / 8, 1.35);
    const d = document.createElement("span");
    d.className = "sprocket";
    d.style.background = `rgba(184,98,44,${a.toFixed(2)})`;
    spWrap.appendChild(d);
  }
  spWrap.insertAdjacentHTML("beforeend", `<svg width="11" height="13" viewBox="0 0 14 16" fill="none" style="margin-left:3px;color:#b8622c;"><path d="M2 2L11 8L2 14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
})();
</script>
</body>
</html>
"""

OUT_HTML.write_text(
    HTML.replace("__STOCKS_JSON__", stocks_json)
    .replace("__PLATES_JSON__", PLATES_JSON)
    .replace("/home/ubuntu/Argent-Web/public/images/specimen-alpine.jpg", ALPINE_URI)
    .replace("/home/ubuntu/Argent-Web/public/images/specimen-interior.jpg", INTERIOR_URI)
    .replace("/home/ubuntu/Argent-Web/public/images/banner.jpg", BANNER_URI),
    encoding="utf-8",
)
print(f"Wrote {OUT_HTML} ({OUT_HTML.stat().st_size} bytes)")
