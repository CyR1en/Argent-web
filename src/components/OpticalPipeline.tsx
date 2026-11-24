"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { PLATES } from "@/data/plates";
import { STOCKS } from "@/data/stocks";

interface PipelineStage {
  id: string;
  stopLabel: string;
  title: string;
  summary: string;
  constantLabel: string;
  constantValue: string;
}

const STAGES: PipelineStage[] = [
  {
    id: "raw",
    stopLabel: "−4 EV",
    title: "Scene-linear Rec. 2020",
    summary:
      "Every frame opens as untouched scene-linear RAW data calibrated to Sony a7 IV spectral sensitivity, log-encoded eight stops below and eight stops above mid-gray.",
    constantLabel: "Metered mid-gray",
    constantValue: "11.49 / ISO lux·s",
  },
  {
    id: "negative",
    stopLabel: "−1 EV",
    title: "Colour negative & couplers",
    summary:
      "Layer exposures pass through fitted natural-reflectance matrices, Status M curve inversion, and interlayer couplers inside a 65³ binary negative LUT.",
    constantLabel: "Highlight shoulder",
    constantValue: "+3 to +5.5 stops",
  },
  {
    id: "enlarger",
    stopLabel: "+1 EV",
    title: "3200 K enlarger onto paper",
    summary:
      "A 3200 K blackbody enlarger projects through base, orange mask, and cyan/magenta/yellow dyes onto ENDURA Premier or VISION 2383, adapted via CIE 1931 2° to D65.",
    constantLabel: "Neutral balance",
    constantValue: "dE2000 < 0.01",
  },
  {
    id: "halation",
    stopLabel: "+4 EV",
    title: "Film grain & base halation",
    summary:
      "Dye-amount Print Grain Index tables and physical film-base reflection halation execute on Apple silicon Metal in the exact same renderer for preview and export.",
    constantLabel: "Base reflection",
    constantValue: "180 – 270 µm radius",
  },
];

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Sticky scroll-driven optical bench (Act II) walking the visitor through Argent's real 4-stage
 * physical pipeline while keeping darkroom obsidian crisp and scannable on mobile.
 */
export function OpticalPipeline() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeStage, setActiveStage] = useState(0);

  const portra400 = useMemo(
    () => STOCKS.find((s) => s.id === "kodak-portra-400") ?? STOCKS[0],
    []
  );
  const alpine = PLATES[0];
  const night = PLATES[1];

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setProgress(0.68);
      setActiveStage(2);
      return;
    }

    let rafId = 0;
    const measure = () => {
      rafId = 0;
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalScroll = Math.max(1, el.offsetHeight - window.innerHeight);
      const p = clamp(-rect.top / totalScroll, 0, 1);
      setProgress(p);
      setActiveStage(Math.min(3, Math.floor(p * 3.999)));
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const jumpToStage = (idx: number) => {
    setActiveStage(idx);
    const el = trackRef.current;
    if (!el) return;
    const isDesktop = window.innerWidth >= 1024;
    if (!isDesktop) {
      setProgress(idx / 3);
      return;
    }
    const top = window.scrollY + el.getBoundingClientRect().top;
    const totalScroll = Math.max(1, el.offsetHeight - window.innerHeight);
    window.scrollTo({ top: top + (idx / 3) * totalScroll, behavior: "smooth" });
  };

  // Compute physical optical layer weights from scroll progress (0..1)
  const negWeight = smoothstep(0.14, 0.38, progress) * (1 - smoothstep(0.52, 0.72, progress));
  const printWeight = smoothstep(0.48, 0.74, progress);
  const grainWeight = smoothstep(0.70, 0.94, progress);
  const curveDraw = clamp(0.15 + progress * 0.85, 0.15, 1);

  const stageInfo = STAGES[activeStage];

  // Build SVG Status M curve path from real Portra 400 data
  const curveGeometry = useMemo(() => {
    const { logH, r, g, b } = portra400.curves;
    const w = 320;
    const h = 92;
    const minX = logH[0];
    const maxX = logH[logH.length - 1];
    const minY = 0.15;
    const maxY = 2.65;
    const toPath = (arr: number[]) =>
      arr
        .map((val, i) => {
          const x = ((logH[i] - minX) / (maxX - minX)) * w;
          const y = h - ((val - minY) / (maxY - minY)) * h;
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
    return { w, h, rPath: toPath(r), gPath: toPath(g), bPath: toPath(b) };
  }, [portra400]);

  return (
    <section
      id="optical-model"
      ref={trackRef}
      className="relative bg-[#0c0d10] text-[#edeae3] lg:min-h-[300vh]"
    >
      <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 lg:sticky lg:top-14 lg:flex lg:min-h-[calc(100vh-56px)] lg:items-center lg:py-10">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Sticky Optical Stage */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-[8px] border border-white/10 bg-[#14161b] shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
              {/* Top bench readout strip */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 font-mono text-[11px] text-[#a9a49b]">
                <span className="tabular-nums text-[#e3a25a]">
                  {stageInfo.stopLabel} · {stageInfo.title.toUpperCase()}
                </span>
                <span className="tabular-nums">
                  {stageInfo.constantLabel}: {stageInfo.constantValue}
                </span>
              </div>

              {/* Morphing Specimen Plate */}
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#0a0b0e]">
                {/* Base Neutral Scene-Linear RAW */}
                <img
                  src={activeStage === 3 ? night.src : alpine.src}
                  alt={`Optical bench simulation at stage ${stageInfo.title}`}
                  className="h-full w-full object-cover transition-all duration-300"
                  style={{
                    filter:
                      printWeight > 0.25
                        ? `contrast(${(0.92 + printWeight * 0.16).toFixed(2)}) saturate(${(
                            0.84 +
                            printWeight * 0.22
                          ).toFixed(2)}) sepia(${(printWeight * 0.08).toFixed(2)})`
                        : "contrast(0.90) saturate(0.84) brightness(1.03)",
                  }}
                />

                {/* Stage 2: Negative Dye + C-41 Orange Mask Crossfade */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{ opacity: negWeight }}
                >
                  <img
                    src={alpine.src}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{
                      filter:
                        "invert(1) hue-rotate(174deg) saturate(1.18) contrast(0.84) brightness(0.94)",
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: "rgba(186, 92, 36, 0.50)",
                      mixBlendMode: "multiply",
                    }}
                  />
                </div>

                {/* Stage 3: Warm 3200 K Enlarger Exposure Sweep */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    opacity: Math.sin(clamp((progress - 0.35) / 0.35, 0, 1) * Math.PI) * 0.55,
                    background:
                      "radial-gradient(ellipse 75% 75% at 50% 45%, rgba(227, 162, 90, 0.42), rgba(180, 90, 38, 0.08) 70%, transparent 100%)",
                    mixBlendMode: "screen",
                  }}
                />

                {/* Stage 4: Optical Grain + Base Halation */}
                <div
                  aria-hidden="true"
                  className="optical-grain-layer pointer-events-none absolute inset-0"
                  style={{ opacity: 0.04 + grainWeight * 0.16 }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    opacity: grainWeight * 0.78,
                    mixBlendMode: "screen",
                    backgroundImage: (activeStage === 3 ? night : alpine).halationFocus
                      .map(
                        (pt) =>
                          `radial-gradient(circle at ${pt.xPct}% ${pt.yPct}%, rgba(235, 58, 28, 0.62) 0%, rgba(210, 44, 24, 0.20) 11%, rgba(180, 32, 16, 0) 25%)`
                      )
                      .join(", "),
                  }}
                />
              </div>

              {/* Real Portra 400 Status M Sensitometry Trace Footer */}
              <div className="grid grid-cols-1 items-center gap-4 border-t border-white/10 bg-[#101217] px-4 py-3.5 sm:grid-cols-12">
                <div className="sm:col-span-5">
                  <div className="font-mono text-[11px] text-[#edeae3]">
                    Portra 400 · Status M Density
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-[#a9a49b]">
                    Datasheet E-4050 · 36-point unmixing fit
                  </div>
                </div>
                <div className="sm:col-span-7">
                  <svg
                    viewBox={`0 0 ${curveGeometry.w} ${curveGeometry.h}`}
                    className="h-[58px] w-full overflow-visible"
                    aria-label="Portra 400 Status M red, green, and blue sensitometric curves"
                  >
                    <line
                      x1="0"
                      y1={curveGeometry.h}
                      x2={curveGeometry.w}
                      y2={curveGeometry.h}
                      stroke="rgba(237,234,227,0.16)"
                    />
                    <clipPath id="pipeline-curve-clip">
                      <rect
                        x="0"
                        y="0"
                        width={curveGeometry.w * curveDraw}
                        height={curveGeometry.h + 4}
                      />
                    </clipPath>
                    <g clipPath="url(#pipeline-curve-clip)">
                      <path
                        d={curveGeometry.bPath}
                        fill="none"
                        stroke="#5B95E5"
                        strokeWidth="1.7"
                      />
                      <path
                        d={curveGeometry.gPath}
                        fill="none"
                        stroke="#5BB97E"
                        strokeWidth="1.7"
                      />
                      <path
                        d={curveGeometry.rPath}
                        fill="none"
                        stroke="#E06452"
                        strokeWidth="1.8"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Scroll Chapters + Clickable Exposure Rail */}
          <div className="lg:col-span-5">
            <h2 className="font-display text-[clamp(2rem,3.4vw,2.9rem)] font-normal leading-[1.06] tracking-[-0.025em] text-[#edeae3]">
              Film physics, never a LUT preset.
            </h2>

            <div className="mt-8 space-y-3">
              {STAGES.map((stage, index) => {
                const isActive = index === activeStage;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => jumpToStage(index)}
                    className={`w-full rounded-[8px] border px-4 py-4 text-left transition-colors duration-200 ${
                      isActive
                        ? "border-[#e3a25a]/55 bg-[#171a21]"
                        : "border-white/8 bg-transparent opacity-65 hover:border-white/20 hover:opacity-95"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-[20px] font-normal text-[#edeae3]">
                        {stage.title}
                      </span>
                      <span className="font-mono text-[11.5px] tabular-nums text-[#e3a25a]">
                        {stage.stopLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] leading-[1.55] text-[#a9a49b]">
                      {stage.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
