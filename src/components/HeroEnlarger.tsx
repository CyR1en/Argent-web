"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { PLATES } from "@/data/plates";
import { STOCKS } from "@/data/stocks";
import { LatentBackdrop } from "./LatentBackdrop";

const HERO_STOCK_IDS = [
  "kodak-portra-400",
  "kodak-ektar-100",
  "cinestill-800t",
  "kodak-vision3-500t-cinema",
  "fujifilm-pro-400h",
];

export function HeroEnlarger() {
  const calmRef = useRef<HTMLDivElement | null>(null);
  const frameBoxRef = useRef<HTMLDivElement | null>(null);

  const heroStocks = useMemo(
    () => STOCKS.filter((s) => HERO_STOCK_IDS.includes(s.id)),
    []
  );

  const [selectedStockId, setSelectedStockId] = useState("kodak-portra-400");
  const [selectedPlateId, setSelectedPlateId] = useState("ridge");
  const [splitPercent, setSplitPercent] = useState(50);
  const [holdWholeRaw, setHoldWholeRaw] = useState(false);
  const [stockMenuOpen, setStockMenuOpen] = useState(false);
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});
  const hasInteractedRef = useRef(false);

  const stock = useMemo(
    () => heroStocks.find((s) => s.id === selectedStockId) ?? heroStocks[0],
    [heroStocks, selectedStockId]
  );
  const plate = useMemo(
    () => PLATES.find((p) => p.id === selectedPlateId) ?? PLATES[0],
    [selectedPlateId]
  );

  // One smooth reveal sweep on initial mount unless reduced motion is preferred.
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let raf = 0;
    const start = performance.now();
    const delay = 260;
    const duration = 900;
    const from = 64;
    const to = 48;

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

  // Spacebar hold-to-compare Neutral RAW when user isn't typing in an input or inside slider focus
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "A") return;
      if ((e.target as HTMLElement | null)?.getAttribute("role") === "slider") return;
      e.preventDefault();
      setHoldWholeRaw(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      setHoldWholeRaw(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
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
    setStockMenuOpen(false);
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

  const isFlagged = Boolean(flaggedIds[plate.id]);

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#141518] pb-16 pt-8 text-[#f2f2f0] sm:pb-24 sm:pt-12"
    >
      <LatentBackdrop calmElementRef={calmRef} />

      <div className="relative z-10 mx-auto max-w-[1220px] px-4 sm:px-8">
        {/* Centered Headline Lockup */}
        <div ref={calmRef} className="mx-auto max-w-[760px] text-center">
          <h1 className="text-[clamp(2.5rem,5.2vw,4.35rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-[#f2f2f0]">
            Raw files, developed as film.
          </h1>

          <p className="mx-auto mt-4 max-w-[54ch] text-[16px] leading-[1.58] text-[#a4a6ae] sm:text-[17px]">
            Native macOS 27 darkroom for Sony a7 IV. Modelled colour negative
            and optical print, rendered locally on Apple silicon Metal.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="https://github.com/CyR1en/Argent/releases/tag/nightly"
              target="_blank"
              rel="noreferrer"
              className="btn-amber inline-flex h-11 items-center gap-2 rounded-full px-6 text-[14px] font-semibold transition-transform duration-150 active:scale-[0.98]"
            >
              <span>Download for macOS</span>
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
              className="liquid-glass-pill inline-flex h-11 items-center gap-2 rounded-full px-5 text-[13.5px] font-medium text-[#f2f2f0] transition-opacity hover:opacity-90"
            >
              <span>Inside the optical chain</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[12px] text-[#a4a6ae]">
            <span>macOS 27</span>
            <span aria-hidden="true" className="text-[#e5ba54]">·</span>
            <span>Apple silicon</span>
            <span aria-hidden="true" className="text-[#e5ba54]">·</span>
            <span>Open source Apache 2.0</span>
          </p>
        </div>

        {/* Full-Bleed Liquid Glass Split-Compare Frame (mirrors Screenshots 2 & 3) */}
        <div className="mt-10 sm:mt-12">
          <div className="relative overflow-hidden rounded-[20px] bg-[#0e0f12] shadow-[0_32px_90px_rgba(0,0,0,0.68)] ring-1 ring-white/15">
            {/* Picture Surface (3:2 / 16:10 photographic canvas) */}
            <div className="relative aspect-[3/2] max-h-[680px] w-full overflow-hidden">
              {/* Right Side: Developed Film Print */}
              <img
                src={plate.src}
                alt={`${plate.label} photographed specimen rendered on ${
                  holdWholeRaw ? "Neutral RAW" : stock.displayName
                }`}
                className="h-full w-full object-cover transition-[filter] duration-200"
                style={{
                  filter: holdWholeRaw
                    ? "contrast(0.90) saturate(0.84) brightness(1.03)"
                    : stock.grade.filter,
                }}
              />

              {/* Film Print Tonal Washes + Red Halation + Optical Grain */}
              {!holdWholeRaw && (
                <>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundColor: stock.grade.warmWash,
                      mixBlendMode: "soft-light",
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundColor: stock.grade.shadowTint,
                      mixBlendMode: "multiply",
                    }}
                  />
                  {stock.grade.halationStrength > 0.02 && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        opacity: Math.min(0.95, stock.grade.halationStrength),
                        mixBlendMode: "screen",
                        backgroundImage: plate.halationFocus
                          .map(
                            (pt) =>
                              `radial-gradient(circle at ${pt.xPct}% ${pt.yPct}%, rgba(235, 58, 28, 0.58) 0%, rgba(212, 42, 22, 0.22) 10%, rgba(180, 32, 16, 0) 24%)`
                          )
                          .join(", "),
                      }}
                    />
                  )}
                  <div
                    aria-hidden="true"
                    className="optical-grain-layer absolute inset-0"
                    style={{ opacity: stock.grade.grainOpacity }}
                  />
                </>
              )}

              {/* Left Side: Neutral RAW clipped by the vertical golden-amber seam */}
              {!holdWholeRaw && (
                <div
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - splitPercent}% 0 0)` }}
                >
                  <img
                    src={plate.src}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                    style={{
                      filter: "contrast(0.90) saturate(0.84) brightness(1.03)",
                    }}
                  />
                </div>
              )}

              {/* Interactive Seam Scrub Surface */}
              <div
                ref={frameBoxRef}
                role="slider"
                tabIndex={0}
                aria-label="Compare Neutral RAW against film print"
                aria-valuemin={8}
                aria-valuemax={92}
                aria-valuenow={Math.round(splitPercent)}
                aria-valuetext={`${Math.round(splitPercent)}% Neutral RAW, ${Math.round(
                  100 - splitPercent
                )}% ${stock.displayName}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onKeyDown={handleSliderKeyDown}
                className="absolute inset-0 z-10 cursor-ew-resize touch-none focus-visible:outline-2 focus-visible:outline-offset-[-3px]"
              >
                {/* Floating Frosted Liquid Glass Pills (top-left & top-right) */}
                {!holdWholeRaw ? (
                  <>
                    <div
                      className="liquid-glass-pill pointer-events-none absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-[#f2f2f0] transition-opacity duration-150"
                      style={{ opacity: splitPercent > 20 ? 1 : 0 }}
                    >
                      Neutral RAW
                    </div>
                    <div
                      className="liquid-glass-pill pointer-events-none absolute right-4 top-4 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-[#f2f2f0] transition-opacity duration-150"
                      style={{ opacity: splitPercent < 80 ? 1 : 0 }}
                    >
                      {stock.displayName}
                    </div>
                  </>
                ) : (
                  <div className="liquid-glass-pill pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full px-4 py-1.5 text-[12px] font-medium text-[#f1c24c]">
                    Whole frame · Neutral RAW
                  </div>
                )}

                {/* Vertical Golden-Amber Compare Seam + Circular <> Handle */}
                {!holdWholeRaw && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 w-[1.5px] bg-[#e5ba54] shadow-[0_0_12px_rgba(0,0,0,0.5)]"
                    style={{ left: `${splitPercent}%` }}
                  >
                    <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-[#e5ba54] bg-[#16171b]/85 text-[#f2f2f0] backdrop-blur-md shadow-[0_6px_18px_rgba(0,0,0,0.5)]">
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
                )}
              </div>

              {/* Floating "Hold Space for the whole neutral RAW" Liquid Glass Pill */}
              <div className="pointer-events-none absolute inset-x-0 bottom-[76px] z-20 hidden justify-center sm:flex">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setHoldWholeRaw(true);
                  }}
                  onPointerUp={() => setHoldWholeRaw(false)}
                  onPointerLeave={() => setHoldWholeRaw(false)}
                  onPointerCancel={() => setHoldWholeRaw(false)}
                  className="liquid-glass-pill pointer-events-auto rounded-full px-4 py-1.5 text-[12px] font-medium text-[#f2f2f0] transition-transform active:scale-[0.98]"
                >
                  {holdWholeRaw
                    ? "Showing whole Neutral RAW"
                    : "Hold Space for the whole neutral RAW"}
                </button>
              </div>

              {/* Suspended Floating Bottom Liquid Glass Filmstrip Dock */}
              <div className="pointer-events-none absolute inset-x-3 bottom-3.5 z-30 flex justify-center sm:inset-x-6">
                <div className="liquid-glass-dock pointer-events-auto relative flex max-w-full items-center gap-2.5 rounded-[14px] px-3 py-2">
                  {/* Left View Icons */}
                  <div className="hidden items-center gap-1 pr-1 sm:flex">
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 items-center justify-center rounded-[7px] text-[#a4a6ae]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <rect x="4" y="4" width="7" height="7" rx="1.5" />
                        <rect x="13" y="4" width="7" height="7" rx="1.5" />
                        <rect x="4" y="13" width="7" height="7" rx="1.5" />
                        <rect x="13" y="13" width="7" height="7" rx="1.5" />
                      </svg>
                    </span>
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-white/14 text-[#f2f2f0]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="M3 15l5-5 4 4 3-3 6 5" />
                      </svg>
                    </span>
                  </div>

                  {/* Frame Thumbnails */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {PLATES.map((p) => {
                      const active = p.id === plate.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPlateId(p.id)}
                          aria-label={`Select frame ${p.frameNum}: ${p.label}`}
                          className={`group relative h-9 w-[54px] flex-none overflow-hidden rounded-[6px] transition-all sm:h-10 sm:w-[60px] ${
                            active
                              ? "ring-2 ring-[#f2f2f0]"
                              : "opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={p.src}
                            alt=""
                            className="h-full w-full object-cover"
                            style={{ filter: stock.grade.filter }}
                          />
                          <span className="absolute bottom-1 left-1 rounded bg-black/75 px-1 font-mono text-[11px] leading-[1.1] text-[#f2f2f0] tabular-nums">
                            {p.frameNum}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-5 w-px bg-white/15" aria-hidden="true" />

                  {/* Flag Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setFlaggedIds((prev) => ({
                        ...prev,
                        [plate.id]: !prev[plate.id],
                      }))
                    }
                    aria-pressed={isFlagged}
                    aria-label={isFlagged ? "Unflag frame" : "Flag frame"}
                    className={`hidden h-8 w-8 items-center justify-center rounded-[8px] transition-colors sm:flex ${
                      isFlagged
                        ? "bg-[#f1c24c]/20 text-[#f1c24c]"
                        : "text-[#a4a6ae] hover:bg-white/10 hover:text-[#f2f2f0]"
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isFlagged ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
                      <path d="M5 21V5l13 4-13 5" />
                    </svg>
                  </button>

                  {/* Stock Selector Button inside Dock */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setStockMenuOpen((o) => !o)}
                      aria-expanded={stockMenuOpen}
                      className="flex h-8 items-center gap-2 rounded-[8px] bg-white/10 px-3 text-[12.5px] font-medium text-[#f2f2f0] transition-colors hover:bg-white/16"
                    >
                      <span
                        aria-hidden="true"
                        className="h-3.5 w-2.5 rounded-[2px] border border-white/30"
                        style={{ backgroundColor: stock.grade.accentHex }}
                      />
                      <span className="whitespace-nowrap">{stock.displayName}</span>
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        className="text-[#a4a6ae]"
                        aria-hidden="true"
                      >
                        <path d="m6 15 6-6 6 6" />
                      </svg>
                    </button>

                    {stockMenuOpen && (
                      <div
                        role="menu"
                        aria-label="Choose hero stock"
                        className="liquid-glass-panel absolute bottom-11 right-0 z-40 w-48 rounded-[12px] p-1.5 text-left"
                      >
                        {heroStocks.map((s) => {
                          const isCurrent = s.id === stock.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              role="menuitemradio"
                              aria-checked={isCurrent}
                              onClick={() => {
                                setSelectedStockId(s.id);
                                setStockMenuOpen(false);
                              }}
                              className={`flex w-full items-center justify-between rounded-[8px] px-2.5 py-2 text-[12.5px] transition-colors ${
                                isCurrent
                                  ? "bg-[#f1c24c] font-semibold text-[#141518]"
                                  : "text-[#f2f2f0] hover:bg-white/10"
                              }`}
                            >
                              <span>{s.displayName}</span>
                              <span
                                className={`font-mono text-[11px] tabular-nums ${
                                  isCurrent ? "text-[#141518]" : "text-[#a4a6ae]"
                                }`}
                              >
                                {s.boxSpeed}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Caption Row below Stage */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 px-1 font-mono text-[11.5px] text-[#a4a6ae]">
            <span>Drag the golden seam or press Space to inspect Neutral RAW</span>
            <span className="tabular-nums">
              {stock.publication} · {plate.cameraNote}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
