"use client";

import React, { useEffect, useRef, useState } from "react";
import { PLATES } from "@/data/plates";
import { STOCKS } from "@/data/stocks";
import type { StableRelease } from "@/lib/release";
import { clamp01, onScrollFrame } from "@/lib/scroll";
import { NEUTRAL_RAW, Photo, Print } from "./Print";
import { ReleaseNote } from "./ReleaseNote";

const STOCK = STOCKS.find((stock) => stock.id === "kodak-portra-400") ?? STOCKS[0];
const PLATE = PLATES.ridge;
const SIZES = "(min-width: 1284px) 1220px, 100vw";

/** How far the seam may travel, as a percentage of the frame's width. */
const SPLIT_MIN = 8;
const SPLIT_MAX = 92;
/** Where the fixed navigation ends, in pixels: the frame is full size once it rises this far. */
const NAV_CLEARANCE = 76;

/**
 * The opening: the headline over the Latent image and one photograph split between its neutral
 * RAW and its print. Scrolling hands the viewport from the words to the photograph.
 */
export function HeroEnlarger({ release }: { release: StableRelease }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [split, setSplit] = useState(50);
  const interacted = useRef(false);

  // The seam settles from the right once on arrival, unless the visitor has already taken it.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const from = 66;
    const to = 50;
    const delay = 260;
    const duration = 1100;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      if (interacted.current) return;
      const t = clamp01((now - start - delay) / duration);
      setSplit(from + (to - from) * (1 - Math.pow(2, -10 * t)));
      if (t < 1) raf = requestAnimationFrame(step);
      else setSplit(to);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // --lift runs 0 to 1 as the frame rises to the navigation: the words recede and the frame comes up to size.
  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    return onScrollFrame(() => {
      const travel = Math.max(1, frame.offsetTop - NAV_CLEARANCE);
      const lift = clamp01(window.scrollY / travel);
      return () => section.style.setProperty("--lift", lift.toFixed(4));
    });
  }, []);

  const moveSplit = (next: number) => {
    interacted.current = true;
    setSplit(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, Math.round(next * 10) / 10)));
  };

  const splitFromPointer = (clientX: number) => {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;
    moveSplit(((clientX - rect.left) / Math.max(1, rect.width)) * 100);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    splitFromPointer(event.clientX);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) splitFromPointer(event.clientX);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = {
      ArrowLeft: split - 3,
      ArrowDown: split - 3,
      ArrowRight: split + 3,
      ArrowUp: split + 3,
      Home: SPLIT_MIN,
      End: SPLIT_MAX,
    };
    if (!(event.key in steps)) return;
    event.preventDefault();
    moveSplit(steps[event.key]);
  };

  return (
    <section
      id="top"
      ref={sectionRef}
      data-backdrop="1"
      className="relative pb-24 pt-28 sm:pb-36 sm:pt-36"
    >
      <div className="mx-auto max-w-[1220px] px-4 sm:px-8">
        <div
          data-backdrop-calm
          className="mx-auto max-w-[900px] text-center motion-safe:[opacity:calc(1-var(--lift,0)*0.92)] motion-safe:[transform:translateY(calc(var(--lift,0)*44px))]"
        >
          <h1 className="text-[clamp(2.5rem,5.6vw,4.5rem)] font-semibold leading-[1.03] tracking-[-0.035em]">
            Raw files, developed as film.
          </h1>

          <p className="mx-auto mt-5 max-w-[60ch] text-balance text-[16px] leading-[1.58] text-muted sm:text-[17px]">
            Native macOS 27 darkroom for Sony a7 IV. Modelled colour negative
            and optical print, rendered locally on Apple silicon Metal.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href={release.href}
              className="btn-amber inline-flex h-11 items-center gap-2 rounded-full px-6 text-[14px] font-semibold"
            >
              Download for macOS
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 4v12" />
                <path d="m7 11 5 5 5-5" />
                <path d="M5 20h14" />
              </svg>
            </a>

            <a
              href="#optical-model"
              className="liquid-glass-pill inline-flex h-11 items-center rounded-full px-5 text-[14px] font-medium text-ink transition-opacity duration-150 hover:opacity-85"
            >
              Inside the optical chain
            </a>
          </div>

          <ReleaseNote version={release.version} className="mt-4" />
        </div>

        <div
          ref={frameRef}
          className="mt-14 origin-[50%_30%] motion-safe:[transform:scale(calc(0.94+var(--lift,0)*0.06))] motion-safe:will-change-transform sm:mt-16"
        >
          <div className="print-frame aspect-[3/2] max-h-[680px] w-full">
            <Print
              src={PLATE.src}
              alt={`${PLATE.subject}, printed on ${STOCK.displayName}`}
              sizes={SIZES}
              grade={STOCK.grade}
              eager
            />

            {/* The neutral RAW, shown left of the seam. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
            >
              <Photo src={PLATE.src} alt="" sizes={SIZES} filter={NEUTRAL_RAW} eager />
            </div>

            <div
              ref={sliderRef}
              role="slider"
              tabIndex={0}
              aria-label="Compare the neutral RAW with the film print"
              aria-valuemin={SPLIT_MIN}
              aria-valuemax={SPLIT_MAX}
              aria-valuenow={Math.round(split)}
              aria-valuetext={`${Math.round(split)}% neutral RAW, ${Math.round(100 - split)}% ${STOCK.displayName}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onKeyDown={onKeyDown}
              className="absolute inset-0 cursor-ew-resize touch-pan-y select-none rounded-[20px] focus-visible:outline-offset-[-3px]"
            >
              <span
                className="liquid-glass-pill pointer-events-none absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-ink transition-opacity duration-150"
                style={{ opacity: split > 22 ? 1 : 0 }}
              >
                Neutral RAW
              </span>
              <span
                className="liquid-glass-pill pointer-events-none absolute right-4 top-4 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-ink transition-opacity duration-150"
                style={{ opacity: split < 78 ? 1 : 0 }}
              >
                {STOCK.displayName}
              </span>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 w-[1.5px] -translate-x-1/2 bg-amber-line shadow-[0_0_12px_rgb(0_0_0/0.5)]"
                style={{ left: `${split}%` }}
              >
                <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-amber-line bg-ground/85 text-ink shadow-[0_6px_18px_rgb(0_0_0/0.5)] backdrop-blur-md">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 16-4-4 4-4" />
                    <path d="m15 8 4 4-4 4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
