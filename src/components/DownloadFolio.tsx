import React from "react";
import type { StableRelease } from "@/lib/release";
import { REPO_URL } from "@/lib/site";
import { ArgentMark } from "./ArgentMark";
import { ReleaseNote } from "./ReleaseNote";

const REQUIREMENTS = ["macOS 27", "Apple silicon", "Sony a7 IV .ARW", "Apache 2.0"];

/** The close: the download over the Latent image at full strength, its warm pool rising behind. */
export function DownloadFolio({ release }: { release: StableRelease }) {
  return (
    <section
      id="download"
      data-backdrop="1"
      data-backdrop-glow
      className="relative flex min-h-[72svh] items-center py-24 sm:min-h-[86svh] sm:py-28"
    >
      <div data-backdrop-calm className="mx-auto max-w-[760px] px-4 text-center sm:px-8">
        <ArgentMark size={60} className="mx-auto" />
        <h2 className="mt-7 text-[clamp(2.3rem,5vw,3.9rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
          A digital roll. A film finish.
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-[16px] leading-[1.6] text-muted sm:text-[17px]">
          Open source for macOS 27 on Apple silicon. Download the notarized
          disk image or build straight from source.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <a
            href={release.href}
            className="btn-amber inline-flex h-12 items-center gap-2.5 rounded-full px-7 text-[14.5px] font-semibold"
          >
            Download Argent
            <span className="font-mono text-[12px] font-normal opacity-75">DMG</span>
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="liquid-glass-pill inline-flex h-12 items-center rounded-full px-6 text-[14.5px] font-medium text-ink transition-opacity duration-150 hover:opacity-85"
          >
            Source on GitHub
          </a>
        </div>

        <ReleaseNote version={release.version} className="mt-4" />

        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-1.5 font-mono text-[12px] text-muted">
          {REQUIREMENTS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
