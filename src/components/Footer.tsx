import React from "react";
import { ArgentMark } from "./ArgentMark";

export function Footer() {
  return (
    <footer
      className="border-t py-12 text-[12.5px] leading-[1.65]"
      style={{
        borderColor: "var(--hairline)",
        color: "var(--ink-muted)",
      }}
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <ArgentMark size={22} />
            <span className="font-display text-[17px]" style={{ color: "var(--ink)" }}>
              Argent
            </span>
            <span>· Apache License 2.0</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a
              href="https://github.com/CyR1en/Argent/releases/tag/nightly"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Nightly Releases
            </a>
            <a
              href="https://github.com/CyR1en/Argent/blob/main/bake/README.md"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Inside the Film Model
            </a>
            <a
              href="https://github.com/CyR1en/Argent/blob/main/NOTICE"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Notices &amp; Licences
            </a>
          </div>
        </div>

        <p className="mt-6 max-w-[96ch] text-[11.5px] opacity-90">
          Built with DINOv3. Subject, Background, and Sky use optional models
          under their own non-commercial terms. Kodak, Portra, Ektar, Gold,
          ColorPlus, UltraMax, and Vision3 are trademarks of Eastman Kodak
          Company. Fujifilm, Fujicolor, Pro 400H, C200, and Superia are
          trademarks of FUJIFILM Corporation. CineStill is a trademark of
          CineStill Film. Sony and a7 IV are trademarks of Sony Group
          Corporation. Argent is not affiliated with or endorsed by any of them;
          a stock&apos;s name identifies which film&apos;s published datasheets
          its model follows.
        </p>
      </div>
    </footer>
  );
}
