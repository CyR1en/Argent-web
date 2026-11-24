import React from "react";
import Image from "next/image";
import type { StockGrade } from "@/data/stocks";

/** The neutral rendering a frame has before any film is modelled. */
export const NEUTRAL_RAW = "contrast(0.9) saturate(0.84) brightness(1.03)";

/** Below this strength a stock's halation is too faint to be worth its layer. */
const VISIBLE_HALATION = 0.2;

interface PhotoProps {
  src: string;
  /** Empty for a layer that repeats a photograph already described. */
  alt: string;
  sizes: string;
  filter: string;
  /** Load at once and ahead of other images: for the photograph in the first viewport. */
  eager?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** One photograph covering its positioned parent, rendered through a CSS filter. */
export function Photo({ src, alt, sizes, filter, eager = false, className = "", style }: PhotoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      draggable={false}
      className={`object-cover ${className}`}
      style={{ filter, ...style }}
    />
  );
}

/** The warm highlight wash and the shadow tint a stock lays over its print. */
export function GradeWashes({ grade }: { grade: StockGrade }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{ backgroundColor: grade.warmWash }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{ backgroundColor: grade.shadowTint }}
      />
    </>
  );
}

/**
 * Halation drawn from the photograph itself: its highlights, spread and reddened by the
 * `#halation` filter that FilmFilters defines, screened back over the print.
 */
export function Halation({ src, sizes, opacity }: { src: string; sizes: string; opacity: number | string }) {
  return (
    <Photo
      src={src}
      alt=""
      sizes={sizes}
      filter="url(#halation)"
      className="pointer-events-none mix-blend-screen"
      style={{ opacity }}
    />
  );
}

/** How strongly a stock's halation shows, as the opacity of its layer. */
export function halationOpacity(grade: StockGrade): number {
  return Math.min(1, grade.halationStrength * 1.4);
}

export function Grain({ opacity }: { opacity: number | string }) {
  return <div aria-hidden="true" className="optical-grain-layer absolute inset-0" style={{ opacity }} />;
}

interface PrintProps {
  src: string;
  alt: string;
  sizes: string;
  grade: StockGrade;
  eager?: boolean;
}

/** A frame printed on a stock: its grade, washes, halation where the stock has it, and grain. */
export function Print({ src, alt, sizes, grade, eager }: PrintProps) {
  return (
    <>
      <Photo
        src={src}
        alt={alt}
        sizes={sizes}
        filter={grade.filter}
        eager={eager}
        className="transition-[filter] duration-300 ease-out"
      />
      <GradeWashes grade={grade} />
      {grade.halationStrength >= VISIBLE_HALATION && (
        <Halation src={src} sizes={sizes} opacity={halationOpacity(grade)} />
      )}
      <Grain opacity={grade.grainOpacity} />
    </>
  );
}

/** The SVG filters the photographs reference. Rendered once per page. */
export function FilmFilters() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter id="halation" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        {/* Luminance, kept only where it is a highlight, spread wide, then tinted the red of film base. */}
        <feColorMatrix
          type="matrix"
          values="0.3 0.55 0.15 0 0  0.3 0.55 0.15 0 0  0.3 0.55 0.15 0 0  0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="linear" slope="3.4" intercept="-1.75" />
          <feFuncG type="linear" slope="3.4" intercept="-1.75" />
          <feFuncB type="linear" slope="3.4" intercept="-1.75" />
        </feComponentTransfer>
        <feGaussianBlur stdDeviation="11" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 0.2 0 0 0  0 0 0.08 0 0  0 0 0 1 0" />
      </filter>
    </svg>
  );
}
