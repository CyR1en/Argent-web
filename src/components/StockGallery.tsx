"use client";

import React, { useMemo, useRef, useState } from "react";
import { PLATES } from "@/data/plates";
import { STOCKS, STOCK_FAMILIES, type StockFamily, type StockProfile } from "@/data/stocks";
import { FilmFrame } from "./FilmFrame";

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

  const w = 440;
  const h = 196;
  const padL = 34;
  const padR = 12;
  const padT = 12;
  const padB = 26;
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
    const idx = Math.round(norm * (logH.length - 1));
    setHoverIdx(idx);
  };

  return (
    <div className="rounded-[8px] border border-black/10 bg-[#f6f3ec] p-4 text-[#17181b]">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <div className="font-mono text-[11px] font-normal uppercase tracking-[0.06em] text-[#57554f]">
          Status M Characteristic Curves
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums">
          <span className="text-[#57554f]">Log H {sampleH.toFixed(2)}</span>
          <span className="text-[#b83628]">R {sampleR.toFixed(2)}</span>
          <span className="text-[#267349]">G {sampleG.toFixed(2)}</span>
          <span className="text-[#275ea3]">B {sampleB.toFixed(2)}</span>
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
                  stroke="rgba(23,24,27,0.08)"
                  strokeDasharray={dTick === 1.0 || dTick === 2.0 ? undefined : "2 3"}
                />
                <text
                  x={-7}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[#57554f] font-mono text-[9px] tabular-nums"
                >
                  {dTick.toFixed(1)}
                </text>
              </g>
            );
          })}

          <line
            x1={0}
            y1={plotH}
            x2={plotW}
            y2={plotH}
            stroke="rgba(23,24,27,0.22)"
          />
          <line x1={0} y1={0} x2={0} y2={plotH} stroke="rgba(23,24,27,0.22)" />

          {/* Curves */}
          <path d={bPath} fill="none" stroke="#275ea3" strokeWidth="2" strokeLinecap="round" />
          <path d={gPath} fill="none" stroke="#267349" strokeWidth="2" strokeLinecap="round" />
          <path d={rPath} fill="none" stroke="#b83628" strokeWidth="2.1" strokeLinecap="round" />

          {/* Crosshair */}
          <line
            x1={cursorX}
            y1={0}
            x2={cursorX}
            y2={plotH}
            stroke="rgba(23,24,27,0.35)"
            strokeDasharray="3 3"
          />
          {[
            { val: sampleB, col: "#275ea3" },
            { val: sampleG, col: "#267349" },
            { val: sampleR, col: "#b83628" },
          ].map((pt, i) => {
            const cy = plotH - ((pt.val - minD) / (maxD - minD)) * plotH;
            return (
              <circle
                key={i}
                cx={cursorX}
                cy={cy}
                r={3.2}
                fill={pt.col}
                stroke="#f6f3ec"
                strokeWidth="1.2"
              />
            );
          })}

          {/* X axis labels */}
          <text x={0} y={plotH + 17} className="fill-[#57554f] font-mono text-[9px] tabular-nums">
            {minH.toFixed(1)}
          </text>
          <text
            x={plotW / 2}
            y={plotH + 17}
            textAnchor="middle"
            className="fill-[#57554f] font-mono text-[9px]"
          >
            Log Exposure (H)
          </text>
          <text
            x={plotW}
            y={plotH + 17}
            textAnchor="end"
            className="fill-[#57554f] font-mono text-[9px] tabular-nums"
          >
            {maxH.toFixed(1)}
          </text>
        </g>
      </svg>
    </div>
  );
}

export function StockGallery() {
  const [selectedFamily, setSelectedFamily] = useState<"All 14" | StockFamily>("All 14");
  const [selectedStockId, setSelectedStockId] = useState("kodak-portra-400");
  const [selectedPlateId, setSelectedPlateId] = useState("interior");
  const [compareRaw, setCompareRaw] = useState(false);

  const stripRef = useRef<HTMLDivElement | null>(null);

  const visibleStocks = useMemo(() => {
    if (selectedFamily === "All 14") return STOCKS;
    return STOCKS.filter((s) => s.family === selectedFamily);
  }, [selectedFamily]);

  const activeStock = useMemo(() => {
    return (
      visibleStocks.find((s) => s.id === selectedStockId) ??
      visibleStocks[0] ??
      STOCKS[2]
    );
  }, [visibleStocks, selectedStockId]);

  const activePlate = useMemo(
    () => PLATES.find((p) => p.id === selectedPlateId) ?? PLATES[0],
    [selectedPlateId]
  );

  const scrollStrip = (dir: -1 | 1) => {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 420, behavior: "smooth" });
  };

  const handleSelectStock = (stock: StockProfile) => {
    setSelectedStockId(stock.id);
    if (stock.family === "Tungsten & Cinema" && selectedPlateId === "interior") {
      setSelectedPlateId("night");
    }
  };

  return (
    <section
      id="stocks"
      className="relative py-24 sm:py-32"
      style={{ color: "var(--ink)" }}
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        {/* Heading + Honest Provenance Disclosure */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h2 className="font-display text-[clamp(2.2rem,4vw,3.4rem)] font-normal leading-[1.03] tracking-[-0.028em]">
              Fourteen emulsions, zero scan fits.
            </h2>
            <p
              className="mt-4 max-w-[58ch] text-[16px] leading-[1.6]"
              style={{ color: "var(--ink-muted)" }}
            >
              Every stock prints from published Kodak and Fujifilm datasheets
              and explicit proxies where measurements are absent. Select a frame
              along the 35mm contact strip to inspect its print tone, grain index,
              and live Status M characteristic curves.
            </p>
          </div>

          {/* Family Filter */}
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
                  className="h-8 rounded-full px-3.5 text-[12.5px] font-medium transition-colors"
                  style={
                    active
                      ? { backgroundColor: "var(--ink)", color: "var(--ground)" }
                      : {
                          border: "1px solid var(--hairline-strong)",
                          color: "var(--ink-muted)",
                        }
                  }
                >
                  {family}
                </button>
              );
            })}
          </div>
        </div>

        {/* Perforated 35mm Horizontal Contact Strip */}
        <div className="mt-10">
          <div className="mb-2.5 flex items-center justify-between">
            <span
              className="font-mono text-[11px] uppercase tracking-[0.12em] tabular-nums"
              style={{ color: "var(--ink-muted)" }}
            >
              35mm Contact Strip · {visibleStocks.length}{" "}
              {visibleStocks.length === 1 ? "emulsion" : "emulsions"}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollStrip(-1)}
                aria-label="Scroll contact strip left"
                className="flex h-7 w-7 items-center justify-center rounded-full border text-[13px] transition-colors hover:opacity-80"
                style={{
                  borderColor: "var(--hairline-strong)",
                  color: "var(--ink)",
                }}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollStrip(1)}
                aria-label="Scroll contact strip right"
                className="flex h-7 w-7 items-center justify-center rounded-full border text-[13px] transition-colors hover:opacity-80"
                style={{
                  borderColor: "var(--hairline-strong)",
                  color: "var(--ink)",
                }}
              >
                →
              </button>
            </div>
          </div>

          <div
            ref={stripRef}
            className="no-scrollbar overflow-x-auto rounded-[6px] bg-[#0b0c10] shadow-[0_18px_46px_rgba(0,0,0,0.22)] ring-1 ring-black/15"
          >
            <div className="inline-block min-w-full">
              <div className="film-rebate-bar h-[20px] w-full" />
              <div className="flex items-stretch gap-2 bg-[#0b0c10] px-3 py-1">
                {visibleStocks.map((s, idx) => {
                  const selected = s.id === activeStock.id;
                  const framePlate =
                    s.family === "Tungsten & Cinema" ? PLATES[1] : PLATES[0];
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectStock(s)}
                      aria-pressed={selected}
                      className={`group relative w-[166px] flex-none text-left transition-transform duration-150 ${
                        selected
                          ? "ring-2 ring-[#e3a25a]"
                          : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[2px] bg-[#16181f]">
                        <img
                          src={framePlate.src}
                          alt={s.displayName}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          style={{ filter: s.grade.filter }}
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0"
                          style={{
                            backgroundColor: s.grade.warmWash,
                            mixBlendMode: "soft-light",
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2.5 py-2">
                          <span className="text-[12px] font-medium text-[#f3efe8]">
                            {s.displayName}
                          </span>
                          <span className="font-mono text-[11px] tabular-nums text-[#e3a25a]">
                            {idx + 1}A
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="film-rebate-bar bottom h-[20px] w-full" />
            </div>
          </div>
        </div>

        {/* Unified Archival Datasheet Plate */}
        <div
          className="mt-8 grid grid-cols-1 gap-8 rounded-[10px] border p-5 sm:p-8 lg:grid-cols-12"
          style={{
            backgroundColor: "var(--surface-elevated)",
            borderColor: "var(--hairline)",
          }}
        >
          {/* Left: Specimen Plate + Hold for Neutral RAW */}
          <div className="lg:col-span-6">
            <FilmFrame
              plate={activePlate}
              stock={activeStock}
              compareRaw={compareRaw}
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {PLATES.map((p) => {
                  const active = p.id === activePlate.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlateId(p.id)}
                      className="h-8 rounded-md px-2.5 font-mono text-[11px] transition-colors"
                      style={
                        active
                          ? { backgroundColor: "var(--ink)", color: "var(--ground)" }
                          : {
                              border: "1px solid var(--hairline-strong)",
                              color: "var(--ink-muted)",
                            }
                      }
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

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
                className="h-8 rounded-md border px-3 font-mono text-[11px] transition-colors"
                style={
                  compareRaw
                    ? {
                        backgroundColor: "#b45a26",
                        borderColor: "#b45a26",
                        color: "#f7f4ee",
                      }
                    : {
                        borderColor: "var(--hairline-strong)",
                        color: "var(--ink)",
                      }
                }
              >
                {compareRaw ? "Showing Neutral RAW" : "Hold to compare Neutral RAW"}
              </button>
            </div>
          </div>

          {/* Right: Datasheet Header, Live Status M Chart, & Ledger */}
          <div className="flex flex-col justify-between gap-5 lg:col-span-6">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="font-display text-[32px] font-normal leading-tight tracking-[-0.02em]">
                  {activeStock.displayName}
                </h3>
                <span className="rounded-full border border-black/15 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[#57554f]">
                  {activeStock.status}
                </span>
              </div>

              <p
                className="mt-2.5 text-[15px] leading-[1.58]"
                style={{ color: "var(--ink-muted)" }}
              >
                {activeStock.summary}
              </p>
            </div>

            <StatusMChart stock={activeStock} />

            {/* Clean Hairline Spec Ledger */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-black/10 pt-4 text-[13px] sm:grid-cols-3">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#57554f]">
                  Modelled Film
                </dt>
                <dd className="mt-0.5 font-medium">{activeStock.modelledFilm}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#57554f]">
                  Box Speed
                </dt>
                <dd className="mt-0.5 font-mono tabular-nums">
                  ISO {activeStock.boxSpeed}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#57554f]">
                  Paper &amp; Stage
                </dt>
                <dd className="mt-0.5">
                  {activeStock.paper}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#57554f]">
                  Datasheet
                </dt>
                <dd className="mt-0.5 font-mono text-[12px] tabular-nums">
                  {activeStock.publication}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#57554f]">
                  Halation
                </dt>
                <dd className="mt-0.5 font-mono text-[12px] tabular-nums">
                  {activeStock.halation
                    ? `${Math.round(activeStock.halation.strength * 100)}% · ${
                        activeStock.halation.radiusMicrometres
                      } µm`
                    : "Not modelled"}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#57554f]">
                  Print Grain Index
                </dt>
                <dd className="mt-0.5 font-mono text-[12px] tabular-nums">
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
