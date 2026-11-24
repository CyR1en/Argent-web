"use client";

import React, { useEffect, useRef } from "react";
import { clamp01, onScrollFrame } from "@/lib/scroll";

const STEPS = [
  {
    title: "Rolls",
    keys: "⌘O",
    copy: "Open a folder of Sony .ARW files in place, or copy frames from a card into chronological rolls.",
  },
  {
    title: "Adjust",
    keys: "Space",
    copy: "Work over the full-bleed frame with a live histogram, a calibrated exposure ruler, and optional masks. Hold Space for the neutral RAW.",
  },
  {
    title: "Develop",
    keys: "⌘D",
    copy: "Write JPEG, HEIC, or 16-bit TIFF in sRGB, Display P3, or Adobe RGB with EXIF, GPS, and XMP intact. Source RAW files stay untouched.",
  },
];

/** The three steps of a roll, set as a ledger whose rules draw in as the section rises. */
export function WorkflowStage() {
  const listRef = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    return onScrollFrame(() => {
      const rect = list.getBoundingClientRect();
      const viewport = window.innerHeight;
      // 0 as the ledger's top enters the viewport, 1 once it has risen 60% of the way up.
      const drawn = clamp01((viewport - rect.top) / (viewport * 0.6));
      return () => list.style.setProperty("--drawn", drawn.toFixed(4));
    });
  }, []);

  return (
    <section id="workflow" data-backdrop="0.4" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1220px] px-4 sm:px-8">
        <h2 className="text-[clamp(2.1rem,4vw,3.2rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
          Built around the roll.
        </h2>
        <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.6] text-muted">
          Non-destructive recipes autosave per frame, and a stopped batch
          develop picks right back up.
        </p>

        <ol ref={listRef} className="mt-14">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="relative grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-2 py-7 sm:grid-cols-12 sm:py-9"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px origin-left bg-hairline"
                style={{
                  transform: `scaleX(clamp(0, calc(var(--drawn, 1) * 1.6 - ${index * 0.3}), 1))`,
                }}
              />
              <h3 className="text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.1] tracking-[-0.025em] sm:col-span-4">
                {step.title}
              </h3>
              <kbd className="rounded-[7px] border border-hairline bg-white/5 px-2 py-1 font-mono text-[12px] text-ink-soft sm:order-last sm:col-span-2 sm:justify-self-end">
                {step.keys}
              </kbd>
              <p className="col-span-2 max-w-[54ch] text-[15.5px] leading-[1.6] text-muted sm:col-span-6">
                {step.copy}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
