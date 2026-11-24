import React from "react";
import type { SpecimenPlate } from "@/data/plates";
import type { StockProfile } from "@/data/stocks";

interface FilmFrameProps {
  plate: SpecimenPlate;
  stock: StockProfile;
  /** Optional negative/print split percentage (0..100). If omitted, shows full print (or neutral RAW if compareRaw). */
  splitPercent?: number;
  compareRaw?: boolean;
  /** Render as full 35mm perforated rebate frame (default true). */
  perforated?: boolean;
  /** Render interactive seam divider / children overlay inside the picture box. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Shared 35mm film & optical print renderer used across Hero, Pipeline, and Stock Gallery.
 * Encapsulates C-41 orange negative mask simulation, stock optical grade, grain overlay,
 * red highlight halation bloom, and perforated 35mm rebate edge printing.
 */
export function FilmFrame({
  plate,
  stock,
  splitPercent,
  compareRaw = false,
  perforated = true,
  children,
  className = "",
}: FilmFrameProps) {
  const isSplit = typeof splitPercent === "number";
  const showHalation = !compareRaw && stock.grade.halationStrength > 0.02;

  return (
    <div
      className={`relative select-none overflow-hidden rounded-[6px] bg-[#090a0d] shadow-[0_28px_72px_rgba(0,0,0,0.48)] ring-1 ring-white/10 ${className}`}
    >
      {/* Top 35mm perforated sprocket strip */}
      {perforated && (
        <div className="relative h-[28px] w-full bg-[#090a0d]">
          <div className="film-rebate-bar h-full w-full" />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-[13px] font-mono text-[11px] leading-none tracking-[0.14em] text-[#E3A25A]/85 uppercase"
          >
            {stock.edgeCode}
          </span>
        </div>
      )}

      {/* Picture Gate (3:2) */}
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#121318]">
        {/* Base Print / Neutral RAW Layer */}
        <img
          src={plate.src}
          alt={`${plate.label} photographed specimen rendered on ${compareRaw ? "Neutral RAW" : stock.displayName}`}
          className="h-full w-full object-cover transition-[filter] duration-300 ease-out"
          style={{
            filter: compareRaw
              ? "contrast(0.92) saturate(0.86) brightness(1.02)"
              : stock.grade.filter,
          }}
        />

        {/* Print warm highlight wash & shadow dye curve tint */}
        {!compareRaw && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{ backgroundColor: stock.grade.warmWash, mixBlendMode: "soft-light" }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{ backgroundColor: stock.grade.shadowTint, mixBlendMode: "multiply" }}
            />
          </>
        )}

        {/* Base reflection halation bloom centered on bright specular points */}
        {showHalation && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
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

        {/* Optical silver-halide grain layer */}
        {!compareRaw && (
          <div
            aria-hidden="true"
            className="optical-grain-layer absolute inset-0 transition-opacity duration-300"
            style={{ opacity: stock.grade.grainOpacity }}
          />
        )}

        {/* Left-of-seam Colour Negative C-41 layer (for Hero Negative / Print split) */}
        {isSplit && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
              clipPath: `inset(0 ${100 - splitPercent}% 0 0)`,
            }}
          >
            <img
              src={plate.src}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
              style={{
                filter: "invert(1) hue-rotate(174deg) saturate(1.18) contrast(0.84) brightness(0.94)",
              }}
            />
            {/* Authentic Kodak C-41 orange base + coupler mask density */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(196, 98, 38, 0.52) 0%, rgba(176, 84, 32, 0.48) 100%)",
                mixBlendMode: "multiply",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                backgroundColor: "rgba(180, 90, 38, 0.22)",
                mixBlendMode: "color",
              }}
            />
            <div className="optical-grain-layer absolute inset-0 opacity-15" />
          </div>
        )}

        {children}
      </div>

      {/* Bottom 35mm perforated sprocket strip */}
      {perforated && (
        <div className="relative h-[28px] w-full bg-[#090a0d]">
          <div className="film-rebate-bar bottom h-full w-full" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 bottom-[13px] flex items-center justify-between font-mono text-[11px] leading-none tracking-[0.12em] text-[#E3A25A]/85"
          >
            <span>ISO {stock.boxSpeed}</span>
            <span>{stock.paper.toUpperCase()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
