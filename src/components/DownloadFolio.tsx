import React from "react";
import { ArgentMark } from "./ArgentMark";
import { LatentBackdrop } from "./LatentBackdrop";

const RELEASE_URL = "https://github.com/CyR1en/Argent/releases/tag/nightly";
const REPO_URL = "https://github.com/CyR1en/Argent";

/**
 * Act V: Liquid Glass Download Folio over Argent's Bayer-8 darkroom field.
 */
export function DownloadFolio() {
  return (
    <section
      id="download"
      className="relative overflow-hidden border-t border-white/10 bg-[#141518] py-24 text-[#f2f2f0] sm:py-32"
    >
      <LatentBackdrop />

      <div className="relative z-10 mx-auto max-w-[1220px] px-4 sm:px-8">
        <div className="liquid-glass-panel rounded-[22px] p-6 sm:p-10 lg:p-12">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="flex items-start gap-5">
              <ArgentMark size={54} className="shrink-0" />
              <div>
                <h2 className="text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-[#f2f2f0]">
                  A digital roll. A film finish.
                </h2>
                <p className="mt-2.5 max-w-[52ch] text-[15px] leading-[1.58] text-[#a4a6ae]">
                  Open source macOS 27 darkroom for Apple silicon. Download the
                  notarized disk image or build straight from source.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              <a
                href={RELEASE_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-amber inline-flex h-12 items-center gap-2.5 rounded-full px-7 text-[14px] font-semibold transition-transform duration-150 active:scale-[0.98]"
              >
                <span>Download Argent</span>
                <span className="font-mono text-[12px] opacity-80">DMG</span>
              </a>

              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="liquid-glass-pill inline-flex h-12 items-center rounded-full px-6 text-[14px] font-medium text-[#f2f2f0] transition-opacity hover:opacity-90"
              >
                Source on GitHub
              </a>
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-1 gap-8 border-t border-white/12 pt-8 text-[13.5px] sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#f1c24c]">
                Requirements
              </dt>
              <dd className="mt-2 leading-[1.6] text-[#d5d6dc]">
                macOS 27 on Apple silicon. Native RAW decoding for Sony a7 IV{" "}
                <span className="font-mono text-[12px]">.ARW</span> files.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#f1c24c]">
                Distribution
              </dt>
              <dd className="mt-2 leading-[1.6] text-[#d5d6dc]">
                Signed with Developer ID, notarized by Apple, and updated via
                Sparkle 2 across Stable and Nightly channels.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#f1c24c]">
                Privacy &amp; Processing
              </dt>
              <dd className="mt-2 leading-[1.6] text-[#d5d6dc]">
                All negative, print, grain, and halation rendering stays locally
                on your Mac. Source RAW files remain untouched.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#f1c24c]">
                Licence &amp; Models
              </dt>
              <dd className="mt-2 leading-[1.6] text-[#d5d6dc]">
                Open source under Apache 2.0. Optional Subject and Background
                smart masks download separately under non-commercial terms.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
