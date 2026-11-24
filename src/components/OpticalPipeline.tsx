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

const STAGE_HISTOGRAMS = [
  // Stage 0: Scene-linear RAW (wide, gentle neutral dynamic spread)
  {
    b: "M0,54 L0,36 C28,32 62,28 96,29 C130,30 162,26 200,44 L200,54 Z",
    g: "M0,54 L0,38 C32,33 66,30 100,31 C134,32 166,28 200,46 L200,54 Z",
    r: "M0,54 L0,40 C34,34 68,31 104,32 C138,33 170,30 200,47 L200,54 Z",
  },
  // Stage 1: Colour negative & orange mask compression (mid-right warm cluster)
  {
    b: "M0,54 L0,48 C36,46 68,38 96,24 C122,12 152,22 180,44 L200,52 L200,54 Z",
    g: "M0,54 L0,46 C40,42 74,26 112,18 C144,12 168,26 190,46 L200,52 L200,54 Z",
    r: "M0,54 L0,44 C48,38 90,14 134,12 C164,10 184,26 200,46 L200,54 Z",
  },
  // Stage 2: 3200 K enlarger onto paper (rich dual-lobe balanced print)
  {
    b: "M0,54 L0,30 C25,18 45,42 75,38 C110,33 135,12 165,16 C182,18 192,38 200,48 L200,54 Z",
    g: "M0,54 L0,40 C30,28 58,20 92,26 C128,32 150,8 178,24 C190,32 195,44 200,50 L200,54 Z",
    r: "M0,54 L0,44 C28,38 52,18 85,22 C118,26 142,20 172,14 C186,11 194,35 200,50 L200,54 Z",
  },
  // Stage 3: Night tungsten halation (deep left shadow anchor + right specular spike)
  {
    b: "M0,54 L0,14 C18,10 42,26 78,42 C118,48 158,46 186,28 C194,22 198,38 200,50 L200,54 Z",
    g: "M0,54 L0,22 C24,18 52,32 88,44 C126,48 164,42 186,24 C194,18 198,38 200,50 L200,54 Z",
    r: "M0,54 L0,28 C28,24 58,36 96,44 C132,46 164,28 184,12 C192,10 197,32 200,48 L200,54 Z",
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
 * Sticky scroll-driven Liquid Glass optical bench (Act II) walking through Argent's
 * 4 physical stages with Argent's live RGB area histogram and Status M curve readout.
 */
export function OpticalPipeline() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeStage, setActiveStage] = useState(0);

  const portra400 = useMemo(
    () => STOCKS.find((s) => s.id === "kodak-portra-400") ?? STOCKS[0],
    []
  );
  const ridge = PLATES[0];
  const night = PLATES[2];

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

  const negWeight =
    smoothstep(0.14, 0.38, progress) * (1 - smoothstep(0.52, 0.72, progress));
  const printWeight = smoothstep(0.48, 0.74, progress);
  const grainWeight = smoothstep(0.70, 0.94, progress);
  const curveDraw = clamp(0.18 + progress * 0.82, 0.18, 1);

  const stageInfo = STAGES[activeStage];
  const displayPlate = activeStage === 3 ? night : ridge;
  const activeHist = STAGE_HISTOGRAMS[activeStage] ?? STAGE_HISTOGRAMS[2];

  const curveGeometry = useMemo(() => {
    const { logH, r, g, b } = portra400.curves;
    const w = 280;
    const h = 68;
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
      className="relative border-t border-white/10 bg-[#141518] text-[#f2f2f0] lg:min-h-[280vh]"
    >
      <div className="mx-auto max-w-[1220px] px-4 py-20 sm:px-8 lg:sticky lg:top-16 lg:flex lg:min-h-[calc(100vh-64px)] lg:items-center lg:py-8">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Sticky Liquid Glass Optical Bench */}
          <div className="lg:col-span-7">
            <div className="liquid-glass-panel rounded-[18px] p-4">
              {/* Top Bench Readout */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 font-mono text-[11.5px] text-[#a4a6ae]">
                <span className="tabular-nums text-[#f1c24c]">
                  {stageInfo.stopLabel} · {stageInfo.title}
                </span>
                <span className="tabular-nums">
                  {stageInfo.constantLabel}: {stageInfo.constantValue}
                </span>
              </div>

              {/* Morphing Specimen Frame */}
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[12px] bg-[#0e0f12]">
                <img
                  src={displayPlate.src}
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

                {/* Stage 2: C-41 Negative Dye & Orange Mask */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{ opacity: negWeight }}
                >
                  <img
                    src={ridge.src}
                    alt=""
                    loading="lazy"
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

                {/* Stage 3: 3200 K Enlarger Sweep */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    opacity:
                      Math.sin(clamp((progress - 0.35) / 0.35, 0, 1) * Math.PI) * 0.55,
                    background:
                      "radial-gradient(ellipse 75% 75% at 50% 45%, rgba(241, 194, 76, 0.40), rgba(180, 90, 38, 0.08) 70%, transparent 100%)",
                    mixBlendMode: "screen",
                  }}
                />

                {/* Stage 4: Optical Grain + Base Reflection Halation */}
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
                    backgroundImage: displayPlate.halationFocus
                      .map(
                        (pt) =>
                          `radial-gradient(circle at ${pt.xPct}% ${pt.yPct}%, rgba(235, 58, 28, 0.62) 0%, rgba(210, 44, 24, 0.20) 11%, rgba(180, 32, 16, 0) 25%)`
                      )
                      .join(", "),
                  }}
                />
              </div>

              {/* Bottom Telemetry: RGB Area Histogram + Status M Curve Trace */}
              <div className="mt-3.5 grid grid-cols-1 items-center gap-4 border-t border-white/10 pt-3.5 sm:grid-cols-12">
                {/* Argent-style RGB Area Histogram */}
                <div className="sm:col-span-5">
                  <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] text-[#a4a6ae]">
                    <span>RGB Response</span>
                    <span className="text-[#f1c24c]">{stageInfo.stopLabel}</span>
                  </div>
                  <svg
                    viewBox="0 0 200 54"
                    className="h-[46px] w-full rounded bg-black/35"
                    aria-hidden="true"
                  >
                    <path
                      d={activeHist.b}
                      fill="rgba(91, 155, 255, 0.45)"
                      className="transition-all duration-500 ease-out"
                    />
                    <path
                      d={activeHist.g}
                      fill="rgba(82, 201, 125, 0.42)"
                      className="transition-all duration-500 ease-out"
                    />
                    <path
                      d={activeHist.r}
                      fill="rgba(235, 87, 87, 0.42)"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                </div>

                {/* Real Portra 400 Status M Curve Trace */}
                <div className="sm:col-span-7">
                  <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] text-[#a4a6ae]">
                    <span>Portra 400 · Status M</span>
                    <span>E-4050</span>
                  </div>
                  <svg
                    viewBox={`0 0 ${curveGeometry.w} ${curveGeometry.h}`}
                    className="h-[46px] w-full overflow-visible"
                    aria-label="Portra 400 Status M sensitometric curves"
                  >
                    <line
                      x1="0"
                      y1={curveGeometry.h}
                      x2={curveGeometry.w}
                      y2={curveGeometry.h}
                      stroke="rgba(255,255,255,0.14)"
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
                        stroke="#5B9BFF"
                        strokeWidth="1.8"
                      />
                      <path
                        d={curveGeometry.gPath}
                        fill="none"
                        stroke="#52C97D"
                        strokeWidth="1.8"
                      />
                      <path
                        d={curveGeometry.rPath}
                        fill="none"
                        stroke="#EB5757"
                        strokeWidth="1.9"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Scroll Chapters */}
          <div className="lg:col-span-5">
            <h2 className="text-[clamp(2rem,3.6vw,2.85rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[#f2f2f0]">
              Film physics, never a LUT preset.
            </h2>

            <div className="mt-7 space-y-3">
              {STAGES.map((stage, index) => {
                const isActive = index === activeStage;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => jumpToStage(index)}
                    className={`w-full rounded-[14px] p-4 text-left transition-all duration-200 ${
                      isActive
                        ? "liquid-glass-panel ring-1 ring-[#e5ba54]/65"
                        : "border border-white/10 bg-white/[0.02] opacity-70 hover:border-white/20 hover:opacity-95"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[17px] font-semibold text-[#f2f2f0]">
                        {stage.title}
                      </span>
                      <span className="font-mono text-[11.5px] tabular-nums text-[#f1c24c]">
                        {stage.stopLabel}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13.5px] leading-[1.55] text-[#a4a6ae]">
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
