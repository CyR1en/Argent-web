"use client";

import React, { useRef, useState } from "react";
import { PLATES, type SpecimenPlate } from "@/data/plates";
import { STOCK_FAMILIES, STOCKS, type StockFamily, type StockProfile } from "@/data/stocks";
import { Print } from "./Print";

/** The frame each family is shown on: the light it was made for. */
const FAMILY_PLATE: Record<StockFamily, SpecimenPlate> = {
  Portra: PLATES.interior,
  "Kodak Daylight": PLATES.alpine,
  Fujifilm: PLATES.ridge,
  "Tungsten & Cinema": PLATES.night,
};

const SIZES = "(min-width: 1024px) 800px, 100vw";
const CHANNELS = [
  { key: "b", label: "B", color: "#5B9BFF" },
  { key: "g", label: "G", color: "#52C97D" },
  { key: "r", label: "R", color: "#EB5757" },
] as const;

/** The stock's published Status M characteristic curves, with a readout under the pointer. */
function StatusMChart({ stock }: { stock: StockProfile }) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const width = 360;
  const height = 168;
  const pad = { left: 20, right: 4, top: 8, bottom: 24 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const maxDensity = 3.2;

  const { logH } = stock.curves;
  const minH = logH[0];
  const spanH = Math.max(0.01, logH[logH.length - 1] - minH);
  const x = (h: number) => ((h - minH) / spanH) * plotW;
  const y = (density: number) => plotH - (density / maxDensity) * plotH;

  const paths = CHANNELS.map((channel) => ({
    ...channel,
    d: stock.curves[channel.key]
      .map((density, i) => `${i === 0 ? "M" : "L"}${x(logH[i]).toFixed(1)},${y(density).toFixed(1)}`)
      .join(" "),
  }));

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const plotX = ((event.clientX - rect.left) / rect.width) * width - pad.left;
    setHover(Math.round(Math.min(1, Math.max(0, plotX / plotW)) * (logH.length - 1)));
  };

  return (
    <figure>
      <figcaption className="flex h-5 items-center justify-between font-mono text-[11.5px] tabular-nums text-muted">
        <span>Status M density</span>
        {hover !== null && (
          <span className="flex gap-3">
            <span>log H {logH[hover].toFixed(2)}</span>
            {[...CHANNELS].reverse().map((channel) => (
              <span key={channel.key} style={{ color: channel.color }}>
                {channel.label} {stock.curves[channel.key][hover].toFixed(2)}
              </span>
            ))}
          </span>
        )}
      </figcaption>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setHover(null)}
        className="mt-2 w-full cursor-crosshair touch-pan-y select-none"
        role="img"
        aria-label={`${stock.displayName} Status M characteristic curves: red, green and blue density against log exposure`}
      >
        <g transform={`translate(${pad.left},${pad.top})`}>
          {[1, 2, 3].map((density) => (
            <g key={density}>
              <line x1={0} x2={plotW} y1={y(density)} y2={y(density)} stroke="rgb(255 255 255 / 0.08)" />
              <text
                x={-8}
                y={y(density) + 3.5}
                textAnchor="end"
                className="fill-muted font-mono text-[11px] tabular-nums"
              >
                {density}
              </text>
            </g>
          ))}
          <line x1={0} x2={plotW} y1={plotH} y2={plotH} stroke="rgb(255 255 255 / 0.2)" />

          {paths.map((path) => (
            <path
              key={path.key}
              d={path.d}
              fill="none"
              stroke={path.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {hover !== null && (
            <g>
              <line
                x1={x(logH[hover])}
                x2={x(logH[hover])}
                y1={0}
                y2={plotH}
                stroke="rgb(241 194 76 / 0.6)"
                strokeDasharray="3 3"
              />
              {CHANNELS.map((channel) => (
                <circle
                  key={channel.key}
                  cx={x(logH[hover])}
                  cy={y(stock.curves[channel.key][hover])}
                  r={3.4}
                  fill={channel.color}
                  stroke="#101115"
                  strokeWidth="1.2"
                />
              ))}
            </g>
          )}

          <text x={plotW} y={plotH + 16} textAnchor="end" className="fill-muted font-mono text-[11px]">
            log exposure
          </text>
        </g>
      </svg>
    </figure>
  );
}

/** Datasheet codes such as E-4050 or AF3-176E, which must not break at their hyphens. */
const CODE = /([A-Z0-9]+(?:-[A-Z0-9]+)+)/;

function Summary({ text }: { text: string }) {
  return (
    <>
      {text.split(CODE).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="whitespace-nowrap">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

/** Fourteen stocks on one easel: pick a film, see its print and the curves it was built from. */
export function StockGallery() {
  const [stockId, setStockId] = useState("kodak-portra-400");
  const stock = STOCKS.find((candidate) => candidate.id === stockId) ?? STOCKS[0];
  const plate = FAMILY_PLATE[stock.family];

  return (
    <section id="stocks" data-backdrop="0.4" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1220px] px-4 sm:px-8">
        <h2 className="text-[clamp(2.1rem,4vw,3.2rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
          Fourteen emulsions, zero scan fits.
        </h2>
        <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.6] text-muted">
          Every stock prints from its published Kodak or Fujifilm datasheet,
          with explicit proxies where a sheet omits data.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-y-9">
          <div className="print-frame aspect-[3/2] w-full lg:col-span-8">
            <div key={plate.id} className="print-in absolute inset-0">
              <Print
                src={plate.src}
                alt={`${plate.subject}, printed on ${stock.displayName}`}
                sizes={SIZES}
                grade={stock.grade}
              />
            </div>
          </div>

          <div
            role="radiogroup"
            aria-label="Film stock"
            className="no-scrollbar -mx-4 flex gap-x-1 overflow-x-auto px-4 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:block lg:space-y-5 lg:overflow-visible lg:px-0"
          >
            {STOCK_FAMILIES.map((family) => (
              <div key={family} className="flex gap-x-1 lg:block">
                <div className="hidden px-2.5 pb-1.5 text-[12.5px] text-muted lg:block">{family}</div>
                {STOCKS.filter((candidate) => candidate.family === family).map((candidate) => {
                  const selected = candidate.id === stock.id;
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setStockId(candidate.id)}
                      className={`flex h-9 flex-none items-center whitespace-nowrap rounded-full px-3.5 text-[15px] transition-colors duration-150 lg:h-[34px] lg:w-full lg:justify-between lg:rounded-[9px] lg:px-2.5 ${
                        selected
                          ? "bg-white/12 font-medium text-ink"
                          : "text-ink-soft hover:bg-white/6 hover:text-ink"
                      }`}
                    >
                      {candidate.displayName}
                      <span
                        className={`hidden font-mono text-[12px] tabular-nums lg:block ${
                          selected ? "text-amber" : "text-muted"
                        }`}
                      >
                        {candidate.boxSpeed}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2 lg:col-span-8">
            <div>
              <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[22px] font-semibold tracking-[-0.02em]">
                {stock.displayName}
                <span className="rounded-full border border-hairline px-2.5 py-0.5 font-mono text-[11.5px] font-normal tracking-normal text-amber">
                  {stock.status === "datasheet" ? "Datasheet" : "Approximation"}
                </span>
              </h3>
              <p className="mt-2.5 text-[15px] leading-[1.6] text-muted">
                <Summary text={stock.summary} />
              </p>
              <p className="mt-3 font-mono text-[12px] leading-[1.7] tabular-nums text-ink-soft">
                ISO {stock.boxSpeed} · {stock.paper}
              </p>
            </div>

            <StatusMChart stock={stock} />
          </div>
        </div>
      </div>
    </section>
  );
}
