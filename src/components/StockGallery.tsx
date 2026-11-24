"use client";

import React, { useMemo, useRef, useState } from "react";
import { PLATES } from "@/data/plates";
import { STOCKS, STOCK_FAMILIES, type StockFamily, type StockProfile } from "@/data/stocks";

function buildCurvePath(
  logH: number[],
  values: number[],
  w: number,
  h: number,
  minH: number,
  maxH: number,
  minD: number,
  maxD: number
): string {
  return values
    .map((d, i) => {
      const x = ((logH[i] - minH) / Math.max(0.01, maxH - minH)) * w;
      const y = h - ((d - minD) / Math.max(0.01, maxD - minD)) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function StatusMChart({ stock }: { stock: StockProfile }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const w = 420;
  const h = 176;
  const padL = 32;
  const padR = 12;
  const padT = 10;
  const padB = 24;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const { logH, r, g, b } = stock.curves;
  const minH = Math.min(...logH);
  const maxH = Math.max(...logH);
  const minD = 0;
  const maxD = 3.2;

  const rPath = useMemo(
    () => buildCurvePath(logH, r, plotW, plotH, minH, maxH, minD, maxD),
    [logH, r, plotW, plotH, minH, maxH]
  );
  const gPath = useMemo(
    () => buildCurvePath(logH, g, plotW, plotH, minH, maxH, minD, maxD),
    [logH, g, plotW, plotH, minH, maxH]
  );
  const bPath = useMemo(
    () => buildCurvePath(logH, b, plotW, plotH, minH, maxH, minD, maxD),
    [logH, b, plotW, plotH, minH, maxH]
  );

  const activeIdx = hoverIdx ?? Math.round(logH.length * 0.56);
  const sampleH = logH[activeIdx] ?? 0;
  const sampleR = r[activeIdx] ?? 0;
  const sampleG = g[activeIdx] ?? 0;
  const sampleB = b[activeIdx] ?? 0;
  const cursorX = ((sampleH - minH) / Math.max(0.01, maxH - minH)) * plotW;

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * w - padL;
    const norm = Math.min(1, Math.max(0, relX / plotW));
    setHoverIdx(Math.round(norm * (logH.length - 1)));
  };

  return (
    <div className="border-t border-white/10 pt-3.5 text-[#f2f2f0]">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#a4a6ae]">
          Status M Curves
        </span>
        <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums">
          <span className="text-[#a4a6ae]">H {sampleH.toFixed(2)}</span>
          <span className="text-[#EB5757]">R {sampleR.toFixed(2)}</span>
          <span className="text-[#52C97D]">G {sampleG.toFixed(2)}</span>
          <span className="text-[#5B9BFF]">B {sampleB.toFixed(2)}</span>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIdx(null)}
        className="w-full cursor-crosshair touch-none select-none"
        role="img"
        aria-label={`${stock.displayName} Status M sensitometric density curves`}
      >
        <g transform={`translate(${padL},${padT})`}>
          {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((dTick) => {
            const y = plotH - ((dTick - minD) / (maxD - minD)) * plotH;
            return (
              <g key={dTick}>
                <line
                  x1={0}
                  y1={y}
                  x2={plotW}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray={dTick === 1.0 || dTick === 2.0 ? undefined : "2 3"}
                />
                <text
                  x={-7}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[#a4a6ae] font-mono text-[11px] tabular-nums"
                >
                  {dTick.toFixed(0)}
                </text>
              </g>
            );
          })}

          <line x1={0} y1={plotH} x2={plotW} y2={plotH} stroke="rgba(255,255,255,0.18)" />
          <line x1={0} y1={0} x2={0} y2={plotH} stroke="rgba(255,255,255,0.18)" />

          <path d={bPath} fill="none" stroke="#5B9BFF" strokeWidth="2.1" strokeLinecap="round" />
          <path d={gPath} fill="none" stroke="#52C97D" strokeWidth="2.1" strokeLinecap="round" />
          <path d={rPath} fill="none" stroke="#EB5757" strokeWidth="2.2" strokeLinecap="round" />

          <line
            x1={cursorX}
            y1={0}
            x2={cursorX}
            y2={plotH}
            stroke="rgba(241,194,76,0.55)"
            strokeDasharray="3 3"
          />
          {[
            { val: sampleB, col: "#5B9BFF" },
            { val: sampleG, col: "#52C97D" },
            { val: sampleR, col: "#EB5757" },
          ].map((pt, i) => {
            const cy = plotH - ((pt.val - minD) / (maxD - minD)) * plotH;
            return (
              <circle
                key={i}
                cx={cursorX}
                cy={cy}
                r={3.4}
                fill={pt.col}
                stroke="#101115"
                strokeWidth="1.2"
              />
            );
          })}

          <text x={0} y={plotH + 17} className="fill-[#a4a6ae] font-mono text-[11px] tabular-nums">
            {minH.toFixed(1)}
          </text>
          <text
            x={plotW / 2}
            y={plotH + 17}
            textAnchor="middle"
            className="fill-[#a4a6ae] font-mono text-[11px]"
          >
            Log Exposure (H)
          </text>
          <text
            x={plotW}
            y={plotH + 17}
            textAnchor="end"
            className="fill-[#a4a6ae] font-mono text-[11px] tabular-nums"
          >
            {maxH.toFixed(1)}
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Act III: Authentic Argent 35mm perforated contact strip + Liquid Glass Adjust & Sensitometry Inspector.
 */
export function StockGallery() {
  const [selectedFamily, setSelectedFamily] = useState<"All 14" | StockFamily>("All 14");
  const [selectedStockId, setSelectedStockId] = useState("kodak-portra-400");
  const [selectedPlateId, setSelectedPlateId] = useState("ridge");
  const [compareRaw, setCompareRaw] = useState(false);
  const [exposureEV, setExposureEV] = useState(0);

  const stripRef = useRef<HTMLDivElement | null>(null);

  const visibleStocks = useMemo(() => {
    if (selectedFamily === "All 14") return STOCKS;
    return STOCKS.filter((s) => s.family === selectedFamily);
  }, [selectedFamily]);

  const activeStock = useMemo(
    () => visibleStocks.find((s) => s.id === selectedStockId) ?? visibleStocks[0] ?? STOCKS[2],
    [visibleStocks, selectedStockId]
  );

  const activePlate = useMemo(
    () => PLATES.find((p) => p.id === selectedPlateId) ?? PLATES[0],
    [selectedPlateId]
  );

  const scrollStrip = (dir: -1 | 1) => {
    stripRef.current?.scrollBy({ left: dir * 420, behavior: "smooth" });
  };

  const handleSelectStock = (stock: StockProfile) => {
    setSelectedStockId(stock.id);
    if (stock.family === "Tungsten & Cinema" && selectedPlateId === "interior") {
      setSelectedPlateId("night");
    }
  };

  // Combine stock grade filter with live Exposure EV ruler offset
  const evBrightness = Math.pow(2, exposureEV * 0.16);
  const activeFilter = compareRaw
    ? "contrast(0.90) saturate(0.84) brightness(1.03)"
    : `${activeStock.grade.filter} brightness(${evBrightness.toFixed(3)})`;

  return (
    <section
      id="stocks"
      className="relative border-t border-white/10 bg-[#141518] py-20 text-[#f2f2f0] sm:py-28"
    >
      <div className="mx-auto max-w-[1220px] px-4 sm:px-8">
        {/* Heading + Liquid Glass Family Filters */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-[clamp(2.1rem,4vw,3.2rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
              Fourteen emulsions, zero scan fits.
            </h2>
            <p className="mt-3.5 max-w-[58ch] text-[15.5px] leading-[1.6] text-[#a4a6ae]">
              Every stock prints from published Kodak and Fujifilm datasheets
              and explicit proxies where sheets omit data. Pick a frame on the
              35mm roll to inspect its Status M curves and Adjust response.
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filter film stocks by family"
          >
            {STOCK_FAMILIES.map((family) => {
              const active = family === selectedFamily;
              return (
                <button
                  key={family}
                  type="button"
                  onClick={() => {
                    setSelectedFamily(family);
                    const first =
                      family === "All 14"
                        ? STOCKS[2]
                        : STOCKS.find((s) => s.family === family);
                    if (first) setSelectedStockId(first.id);
                  }}
                  className={`h-8 rounded-full px-3.5 text-[12.5px] font-medium transition-all ${
                    active
                      ? "btn-amber"
                      : "liquid-glass-pill text-[#d5d6dc] hover:text-white"
                  }`}
                >
                  {family}
                </button>
              );
            })}
          </div>
        </div>

        {/* Authentic Argent 35mm Perforated Filmstrip (mirrors Screenshot 1) */}
        <div className="mt-10">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="font-mono text-[11.5px] tracking-[0.06em] text-[#a4a6ae] tabular-nums">
              35mm Roll · {visibleStocks.length}{" "}
              {visibleStocks.length === 1 ? "emulsion" : "emulsions"}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollStrip(-1)}
                aria-label="Scroll contact strip left"
                className="liquid-glass-pill flex h-7 w-7 items-center justify-center rounded-full text-[13px] text-[#f2f2f0]"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollStrip(1)}
                aria-label="Scroll contact strip right"
                className="liquid-glass-pill flex h-7 w-7 items-center justify-center rounded-full text-[13px] text-[#f2f2f0]"
              >
                →
              </button>
            </div>
          </div>

          <div
            ref={stripRef}
            className="no-scrollbar overflow-x-auto rounded-[10px] bg-[#0b0c0f] p-2.5 shadow-[0_20px_54px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
          >
            <div className="inline-block min-w-full">
              {/* Top Edge Print */}
              <div className="mb-1 flex items-center justify-between px-2 font-mono text-[11px] tracking-[0.14em] text-[#e5ba54]/80">
                <span>ARGENT ◄ DATASHEET ROLL ► {activeStock.edgeCode}</span>
                <span>{visibleStocks.length} EXP</span>
              </div>
              <div className="film-rebate-dark h-[12px] w-full" />

              {/* Frames Row */}
              <div className="flex items-stretch gap-2 py-2">
                {visibleStocks.map((s, idx) => {
                  const selected = s.id === activeStock.id;
                  const thumbPlate =
                    s.family === "Tungsten & Cinema" ? PLATES[2] : PLATES[0];
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectStock(s)}
                      aria-pressed={selected}
                      className={`group relative w-[164px] flex-none overflow-hidden rounded-[3px] text-left transition-all duration-150 ${
                        selected
                          ? "ring-2 ring-[#f1c24c]"
                          : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#15171c]">
                        <img
                          src={thumbPlate.src}
                          alt={s.displayName}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          style={{ filter: s.grade.filter }}
                        />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/45 to-transparent px-2.5 py-1.5">
                          <span className="text-[12px] font-medium text-[#f2f2f0]">
                            {s.displayName}
                          </span>
                          <span className="font-mono text-[11px] tabular-nums text-[#e5ba54]">
                            {idx + 1}A
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="film-rebate-dark h-[12px] w-full" />
              <div className="mt-1 flex items-center gap-6 px-2 font-mono text-[11px] text-[#e5ba54]/70 tabular-nums">
                {visibleStocks.slice(0, 6).map((_, i) => (
                  <span key={i}>► {i + 1} · {i + 1}A</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Unified Full-Bleed Specimen + Liquid Glass Adjust/Sensitometry Panel */}
        <div className="mt-8 grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
          {/* Left: Clean Full-Bleed Photograph with Floating Glass Pills */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[16px] bg-[#0e0f12] shadow-[0_26px_70px_rgba(0,0,0,0.58)] ring-1 ring-white/15">
              <div className="relative aspect-[3/2] w-full overflow-hidden">
                <img
                  src={activePlate.src}
                  alt={`${activePlate.label} specimen on ${
                    compareRaw ? "Neutral RAW" : activeStock.displayName
                  }`}
                  className="h-full w-full object-cover transition-[filter] duration-200"
                  style={{ filter: activeFilter }}
                />

                {!compareRaw && (
                  <>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        backgroundColor: activeStock.grade.warmWash,
                        mixBlendMode: "soft-light",
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        backgroundColor: activeStock.grade.shadowTint,
                        mixBlendMode: "multiply",
                      }}
                    />
                    {activeStock.grade.halationStrength > 0.02 && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                          opacity: Math.min(0.95, activeStock.grade.halationStrength),
                          mixBlendMode: "screen",
                          backgroundImage: activePlate.halationFocus
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
                      style={{ opacity: activeStock.grade.grainOpacity }}
                    />
                  </>
                )}

                {/* Top-Left Stock Status Pill */}
                <div className="liquid-glass-pill pointer-events-none absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-[#f2f2f0]">
                  {compareRaw ? "Neutral RAW" : activeStock.displayName}
                </div>

                {/* Top-Right Plate Switcher Pills */}
                <div className="liquid-glass-dock absolute right-3.5 top-3.5 flex items-center gap-1 rounded-full p-1">
                  {PLATES.map((p) => {
                    const active = p.id === activePlate.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlateId(p.id)}
                        className={`h-7 rounded-full px-2.5 text-[11.5px] font-medium transition-colors ${
                          active
                            ? "bg-[#f2f2f0] text-[#141518]"
                            : "text-[#d5d6dc] hover:text-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Hold for Neutral RAW Pill */}
                <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
                  <button
                    type="button"
                    onPointerDown={() => setCompareRaw(true)}
                    onPointerUp={() => setCompareRaw(false)}
                    onPointerLeave={() => setCompareRaw(false)}
                    onPointerCancel={() => setCompareRaw(false)}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        setCompareRaw((v) => !v);
                      }
                    }}
                    aria-pressed={compareRaw}
                    className={`pointer-events-auto rounded-full px-4 py-1.5 text-[12px] font-medium transition-all ${
                      compareRaw
                        ? "btn-amber"
                        : "liquid-glass-pill text-[#f2f2f0]"
                    }`}
                  >
                    {compareRaw
                      ? "Showing Neutral RAW"
                      : "Hold to compare Neutral RAW"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Translucent Liquid Glass Adjust & Sensitometry Inspector */}
          <div className="liquid-glass-panel flex flex-col gap-4 rounded-[16px] p-5 lg:col-span-5">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-[#f2f2f0]">
                  {activeStock.displayName}
                </h3>
                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[#f1c24c]">
                  {activeStock.status}
                </span>
              </div>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-[#a4a6ae]">
                {activeStock.summary}
              </p>
            </div>

            {/* Interactive Real Status M Characteristic Curves */}
            <StatusMChart stock={activeStock} />

            {/* Argent-style Exposure Ruler (-5 to +5 EV) */}
            <div className="border-t border-white/10 pt-3.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-[#f2f2f0]">Exposure</span>
                <span className="font-mono text-[12.5px] tabular-nums text-[#f1c24c]">
                  {exposureEV >= 0 ? `+${exposureEV.toFixed(2)}` : exposureEV.toFixed(2)} EV
                </span>
              </div>

              <div className="relative mt-2.5">
                <div
                  aria-hidden="true"
                  className="pointer-events-none flex h-4 items-end justify-between px-1"
                >
                  {Array.from({ length: 21 }).map((_, idx) => {
                    const isCenter = idx === 10;
                    const isMajor = idx % 5 === 0;
                    return (
                      <span
                        key={idx}
                        className="w-px"
                        style={{
                          height: isCenter ? "14px" : isMajor ? "10px" : "6px",
                          backgroundColor: isCenter
                            ? "#f1c24c"
                            : "rgba(255,255,255,0.28)",
                        }}
                      />
                    );
                  })}
                </div>
                <input
                  type="range"
                  min={-2.5}
                  max={2.5}
                  step={0.25}
                  value={exposureEV}
                  aria-label="Print exposure compensation in EV"
                  onChange={(e) => setExposureEV(Number(e.target.value))}
                  className="mt-1 w-full cursor-pointer accent-[#f1c24c]"
                />
                <div className="mt-0.5 flex justify-between font-mono text-[11px] text-[#a4a6ae] tabular-nums">
                  <span>−5</span>
                  <span>0</span>
                  <span>+5</span>
                </div>
              </div>
            </div>

            {/* Spec Ledger */}
            <dl className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-white/10 pt-3.5 text-[12.5px] sm:grid-cols-3">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#a4a6ae]">
                  Modelled Film
                </dt>
                <dd className="mt-0.5 font-medium text-[#f2f2f0]">
                  {activeStock.modelledFilm}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#a4a6ae]">
                  Box Speed
                </dt>
                <dd className="mt-0.5 font-mono text-[#f2f2f0] tabular-nums">
                  ISO {activeStock.boxSpeed}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#a4a6ae]">
                  Paper
                </dt>
                <dd className="mt-0.5 text-[#f2f2f0]">{activeStock.paper}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#a4a6ae]">
                  Datasheet
                </dt>
                <dd className="mt-0.5 font-mono text-[#f2f2f0] tabular-nums">
                  {activeStock.publication}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#a4a6ae]">
                  Halation
                </dt>
                <dd className="mt-0.5 font-mono text-[#f2f2f0] tabular-nums">
                  {activeStock.halation
                    ? `${Math.round(activeStock.halation.strength * 100)}% · ${
                        activeStock.halation.radiusMicrometres
                      } µm`
                    : "Not modelled"}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#a4a6ae]">
                  Grain PGI
                </dt>
                <dd className="mt-0.5 font-mono text-[#f2f2f0] tabular-nums">
                  {activeStock.grain?.printGrainIndex
                    ? activeStock.grain.printGrainIndex
                        .map((v) => (v == null ? "—" : v))
                        .join(" / ")
                    : "Not published"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
