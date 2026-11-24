"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { PLATES } from "@/data/plates";
import { STOCKS } from "@/data/stocks";
import { FilmFrame } from "./FilmFrame";
import { LatentBackdrop } from "./LatentBackdrop";

const HERO_STOCK_IDS = [
  "kodak-portra-400",
  "kodak-ektar-100",
  "cinestill-800t",
  "kodak-vision3-500t-cinema",
];

const HERO_PLATE_IDS = ["alpine", "night", "dunes"];

export function HeroEnlarger() {
  const calmRef = useRef<HTMLDivElement | null>(null);
  const frameBoxRef = useRef<HTMLDivElement | null>(null);

  const heroStocks = useMemo(
    () => STOCKS.filter((s) => HERO_STOCK_IDS.includes(s.id)),
    []
  );
  const heroPlates = useMemo(
    () => PLATES.filter((p) => HERO_PLATE_IDS.includes(p.id)),
    []
  );

  const [selectedStockId, setSelectedStockId] = useState("kodak-portra-400");
  const [selectedPlateId, setSelectedPlateId] = useState("alpine");
  const [splitPercent, setSplitPercent] = useState(48);
  const hasInteractedRef = useRef(false);

  const stock = useMemo(
    () => heroStocks.find((s) => s.id === selectedStockId) ?? heroStocks[0],
    [heroStocks, selectedStockId]
  );
  const plate = useMemo(
    () => heroPlates.find((p) => p.id === selectedPlateId) ?? heroPlates[0],
    [heroPlates, selectedPlateId]
  );

  // One authored reveal sweep on initial mount unless reduced-motion is active or visitor drags first.
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let raf = 0;
    const start = performance.now();
    const delay = 260;
    const duration = 900;
    const from = 64;
    const to = 46;

    const step = (now: number) => {
      if (hasInteractedRef.current) return;
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(step);
        return;
      }
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setSplitPercent(Math.round((from + (to - from) * eased) * 10) / 10);
      if (t < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const updateSplitFromClientX = (clientX: number) => {
    const el = frameBoxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const clamped = Math.min(92, Math.max(8, Math.round(pct * 10) / 10));
    hasInteractedRef.current = true;
    setSplitPercent(clamped);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSplitFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 && e.pointerType === "mouse") return;
    updateSplitFromClientX(e.clientX);
  };

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      hasInteractedRef.current = true;
      setSplitPercent((v) => Math.max(8, Math.round((v - 3) * 10) / 10));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      hasInteractedRef.current = true;
      setSplitPercent((v) => Math.min(92, Math.round((v + 3) * 10) / 10));
    } else if (e.key === "Home") {
      e.preventDefault();
      hasInteractedRef.current = true;
      setSplitPercent(8);
    } else if (e.key === "End") {
      e.preventDefault();
      hasInteractedRef.current = true;
      setSplitPercent(92);
    }
  };

  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100svh-56px)] items-center overflow-hidden bg-[#0c0d10] py-12 text-[#edeae3] lg:py-16"
    >
      <LatentBackdrop calmElementRef={calmRef} />

      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10">
        {/* Left Calm Editorial Zone */}
        <div
          ref={calmRef}
          className="lg:col-span-5"
        >
          <h1
            className="font-display text-[clamp(2.75rem,5.2vw,4.65rem)] font-normal leading-[0.98] tracking-[-0.03em] text-[#edeae3]"
          >
            Raw files, developed as film.
          </h1>

          <p className="mt-6 max-w-[44ch] text-[17px] leading-[1.58] text-[#a9a49b]">
            Scene-linear Sony a7 IV RAW passed through modelled colour negative
            and optical print. Native Metal on Apple silicon, built around the
            digital roll.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="https://github.com/CyR1en/Argent/releases/tag/nightly"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2.5 rounded-full bg-[#edeae3] px-6 text-[14.5px] font-medium text-[#0c0d10] transition-transform duration-150 hover:bg-white active:scale-[0.98]"
            >
              <span>Download for macOS</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-[14px] text-[#edeae3] transition-colors hover:border-[#e3a25a]/60 hover:text-[#e3a25a]"
            >
              <span>Inside the optical chain</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] tracking-[0.02em] text-[#a9a49b]">
            <span>macOS 27</span>
            <span aria-hidden="true" className="text-[#e3a25a]/70">·</span>
            <span>Apple silicon</span>
            <span aria-hidden="true" className="text-[#e3a25a]/70">·</span>
            <span>Open source Apache 2.0</span>
          </p>
        </div>

        {/* Right Optical Seam Stage */}
        <div className="lg:col-span-7">
          <div className="relative">
            <FilmFrame plate={plate} stock={stock} splitPercent={splitPercent}>
              {/* Interactive pointer/touch/keyboard scrub surface covering the 3:2 picture gate */}
              <div
                ref={frameBoxRef}
                role="slider"
                tabIndex={0}
                aria-label="Negative and print optical seam position"
                aria-valuemin={8}
                aria-valuemax={92}
                aria-valuenow={Math.round(splitPercent)}
                aria-valuetext={`${Math.round(splitPercent)}% negative, ${Math.round(100 - splitPercent)}% print`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onKeyDown={handleSliderKeyDown}
                className="absolute inset-0 z-20 cursor-ew-resize touch-none focus-visible:outline-2 focus-visible:outline-offset-[-3px]"
              >
                {/* Left Negative Caption */}
                <div
                  className="pointer-events-none absolute bottom-3 left-3 rounded bg-[#0c0d10]/85 px-2.5 py-1 font-mono text-[11px] tracking-[0.06em] text-[#f2b27a] transition-opacity duration-200"
                  style={{ opacity: splitPercent > 22 ? 1 : 0 }}
                >
                  NEGATIVE · STATUS M
                </div>

                {/* Right Print Caption */}
                <div
                  className="pointer-events-none absolute bottom-3 right-3 rounded bg-[#0c0d10]/85 px-2.5 py-1 font-mono text-[11px] tracking-[0.06em] text-[#edeae3] transition-opacity duration-200"
                  style={{ opacity: splitPercent < 78 ? 1 : 0 }}
                >
                  PRINT · {stock.id === "kodak-vision3-500t-cinema" ? "VISION 2383" : "ENDURA PREMIER"}
                </div>

                {/* Vertical Optical Seam + Negative/Print Disc Handle */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 w-px bg-[#edeae3]/85 shadow-[0_0_10px_rgba(0,0,0,0.6)]"
                  style={{ left: `${splitPercent}%` }}
                >
                  <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[#1b1c1f]/95 shadow-[0_4px_16px_rgba(0,0,0,0.55)]">
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M11 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h4V4z"
                        fill="#B45A26"
                      />
                      <path
                        d="M13 4h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4v-3.8a4.2 4.2 0 0 0 0-8.4V4z"
                        fill="#DEDFE1"
                      />
                      <path d="M11 7.8a4.2 4.2 0 0 0 0 8.4V7.8z" fill="#F2B27A" />
                    </svg>
                  </div>
                </div>
              </div>
            </FilmFrame>

            {/* Specimen & Emulsion Bar directly below the frame */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Hero film stocks">
                {heroStocks.map((s) => {
                  const active = s.id === stock.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedStockId(s.id)}
                      className={`h-8 rounded-md px-3 text-[12.5px] font-medium transition-colors ${
                        active
                          ? "bg-[#edeae3] text-[#0c0d10]"
                          : "border border-white/12 bg-white/[0.03] text-[#a9a49b] hover:border-white/25 hover:text-[#edeae3]"
                      }`}
                    >
                      {s.displayName}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5" role="group" aria-label="Hero specimen photographs">
                {heroPlates.map((p) => {
                  const active = p.id === plate.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlateId(p.id)}
                      className={`h-8 rounded-md px-2.5 font-mono text-[11px] transition-colors ${
                        active
                          ? "border border-[#e3a25a]/80 bg-[#e3a25a]/14 text-[#e3a25a]"
                          : "border border-white/10 text-[#a9a49b] hover:border-white/25 hover:text-[#edeae3]"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between font-mono text-[11px] text-[#a9a49b]">
              <span>Drag the seam across negative &amp; print</span>
              <span className="tabular-nums">
                {stock.publication} · {plate.cameraNote}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
