import React from "react";

const RELEASE_URL = "https://github.com/CyR1en/Argent/releases/tag/nightly";
const REPO_URL = "https://github.com/CyR1en/Argent";

/**
 * Archival Print Colophon (Act V) featuring Argent's banner image, DMG sprocket-chevron motif,
 * download CTA, and 4-column specification ledger.
 */
export function DownloadFolio() {
  return (
    <section
      id="download"
      className="relative border-t py-24 sm:py-32"
      style={{
        borderColor: "var(--hairline)",
        color: "var(--ink)",
      }}
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        {/* Framed Archival Print Banner */}
        <div className="overflow-hidden rounded-[8px] border border-black/10 bg-[#e4dfd5] shadow-[0_24px_64px_rgba(23,24,27,0.12)]">
          <img
            src="/images/banner.jpg"
            alt="Argent: a black-and-white print of snowy mountains lies on archival paper beside a curling strip of orange colour negative"
            className="h-auto w-full object-cover"
          />
        </div>

        {/* DMG Wordmark & 9-Sprocket Amber Chevron Motif */}
        <div className="mt-14 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div>
            <h2 className="font-display text-[clamp(2.5rem,4.8vw,4rem)] font-normal leading-[1] tracking-[-0.03em]">
              A digital roll. A film finish.
            </h2>

            {/* Iconic 9-sprocket amber gradient chevron from App/DMG/background.py */}
            <div className="mt-6 flex items-center gap-2" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, i) => {
                const opacity = 0.22 + 0.78 * Math.pow(i / 8, 1.35);
                return (
                  <span
                    key={i}
                    className="h-[11px] w-[9px] rounded-[2.5px]"
                    style={{ backgroundColor: `rgba(184, 98, 44, ${opacity.toFixed(2)})` }}
                  />
                );
              })}
              <svg
                width="14"
                height="16"
                viewBox="0 0 14 16"
                fill="none"
                className="ml-1 text-[#b8622c]"
              >
                <path
                  d="M2 2L11 8L2 14"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            <a
              href={RELEASE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2.5 rounded-full bg-[#17181b] px-7 text-[14.5px] font-medium text-[#eeeae2] transition-transform duration-150 hover:bg-[#2a2c31] active:scale-[0.98]"
            >
              <span>Download Argent</span>
              <span className="font-mono text-[12px] opacity-75">DMG</span>
            </a>

            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center rounded-full border border-black/20 px-6 text-[14.5px] font-medium text-[#17181b] transition-colors hover:border-black/45"
            >
              Source on GitHub
            </a>
          </div>
        </div>

        {/* Clean 4-Column Specification Ledger */}
        <dl
          className="mt-16 grid grid-cols-1 gap-8 border-t pt-10 text-[14px] sm:grid-cols-2 lg:grid-cols-4"
          style={{ borderColor: "var(--hairline)" }}
        >
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--ink-muted)" }}>
              Requirements
            </dt>
            <dd className="mt-2 leading-[1.6]">
              macOS 27 on Apple silicon. Native RAW decoding for Sony a7 IV{" "}
              <span className="font-mono text-[12.5px]">.ARW</span> files.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--ink-muted)" }}>
              Distribution
            </dt>
            <dd className="mt-2 leading-[1.6]">
              Signed with Developer ID, notarized by Apple, and updated via
              Sparkle 2 across Stable and Nightly channels.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--ink-muted)" }}>
              Privacy &amp; Processing
            </dt>
            <dd className="mt-2 leading-[1.6]">
              All negative, print, grain, and halation rendering stays locally on
              your Mac. Source RAW files remain untouched.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--ink-muted)" }}>
              Licence &amp; Models
            </dt>
            <dd className="mt-2 leading-[1.6]">
              Open source under Apache 2.0. Optional Subject and Background
              smart masks download separately under non-commercial terms.
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
