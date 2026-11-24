"use client";

import React, { useEffect, useRef, useState } from "react";
import { PLATES } from "@/data/plates";
import { STOCKS } from "@/data/stocks";
import { clamp01, onScrollFrame, smoothstep } from "@/lib/scroll";
import { GradeWashes, Grain, Halation, halationOpacity, NEUTRAL_RAW, Photo } from "./Print";

/** The `pin` variant's condition in globals.css. */
const PIN_QUERY = "(prefers-reduced-motion: no-preference) and (min-height: 560px)";

const STOCK = STOCKS.find((stock) => stock.id === "cinestill-800t") ?? STOCKS[0];
const PLATE = PLATES.night;
const SIZES = "(min-width: 1144px) 1080px, 100vw";

/** A colour negative as CSS can draw one: inverted, then laid under the orange mask. */
const NEGATIVE = "invert(1) contrast(0.78) saturate(0.85) brightness(0.96)";
const ORANGE_MASK = "rgb(222 128 58 / 0.78)";

const STAGES = [
  {
    title: "Scene-linear RAW",
    summary: "Every frame opens as untouched scene-linear data, calibrated to the a7 IV's spectral sensitivity.",
    constant: "Metered mid-gray · 11.49 / ISO lux·s",
  },
  {
    title: "Colour negative",
    summary: "Exposure lands on a modelled negative: published Status M curves, interlayer couplers, and the orange mask.",
    constant: "Highlight shoulder · +3 to +5.5 stops",
  },
  {
    title: "Optical print",
    summary: "A 3200 K enlarger projects the negative onto modelled paper, then the print adapts to D65.",
    constant: "Neutral balance · dE2000 < 0.01",
  },
  {
    title: "Grain & halation",
    summary: "Grain follows published Print Grain Index tables. Halation is light reflecting off the film base.",
    constant: "Base reflection · 180 – 270 µm radius",
  },
];

/**
 * Where along the pinned scroll each change happens: the negative sweeps in, the print sweeps
 * over it, then grain and halation come up. Each sweep is [start, end] of the track's progress.
 */
const NEGATIVE_SWEEP = [0.08, 0.34] as const;
const PRINT_SWEEP = [0.42, 0.68] as const;
const BLOOM = [0.76, 0.94] as const;
/** The progress at which each stage's caption takes over: halfway through the change into it. */
const STAGE_STARTS = [0, 0.21, 0.55, 0.82];

/**
 * The optical chain as one pinned photograph: scrolling carries it from neutral RAW through the
 * negative and the print to grain and halation. Where the stage cannot pin, the finished print
 * stands beside all four steps.
 */
export function OpticalPipeline() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const pinned = window.matchMedia(PIN_QUERY);
    let stop: (() => void) | undefined;

    const sync = () => {
      stop?.();
      stop = undefined;
      // Unpinned, the layers fall back to their finished state.
      for (const name of ["--neg", "--print", "--bloom", "--seam", "--seam-on", "--progress"]) {
        track.style.removeProperty(name);
      }
      if (!pinned.matches) return;

      stop = onScrollFrame(() => {
        const rect = track.getBoundingClientRect();
        const distance = rect.height - window.innerHeight;
        const progress = distance > 0 ? clamp01(-rect.top / distance) : 0;
        const neg = smoothstep(...NEGATIVE_SWEEP, progress);
        const print = smoothstep(...PRINT_SWEEP, progress);
        const sweeping = print > 0 ? print : neg;

        return () => {
          track.style.setProperty("--neg", neg.toFixed(4));
          track.style.setProperty("--print", print.toFixed(4));
          track.style.setProperty("--bloom", smoothstep(...BLOOM, progress).toFixed(4));
          track.style.setProperty("--seam", sweeping.toFixed(4));
          track.style.setProperty("--seam-on", sweeping > 0.004 && sweeping < 0.996 ? "1" : "0");
          track.style.setProperty("--progress", progress.toFixed(4));
          setStage(STAGE_STARTS.findLastIndex((start) => progress >= start));
        };
      });
    };

    sync();
    pinned.addEventListener("change", sync);
    return () => {
      pinned.removeEventListener("change", sync);
      stop?.();
    };
  }, []);

  return (
    <section id="optical-model" data-backdrop="0.55" className="relative">
      <h2 className="px-4 text-center text-[clamp(2.1rem,4vw,3.2rem)] font-semibold leading-[1.06] tracking-[-0.03em] sm:px-8">
        Film physics, never a LUT preset.
      </h2>

      <div ref={trackRef} className="pin:h-[360svh]">
        <div className="flex flex-col justify-center px-4 pb-24 pt-12 sm:px-8 pin:sticky pin:top-0 pin:h-svh pin:pb-6 pin:pt-[76px]">
          {/* As wide as the page allows, and never so tall that the caption leaves the viewport. */}
          <div className="@container mx-auto w-full max-w-[1080px] pin:w-[min(100%,calc((100svh-17.5rem)*1.5))]">
            <div className="print-frame aspect-[3/2] w-full">
              <div className="absolute inset-0 pin:[transform:scale(calc(1+var(--progress,0)*0.07))] pin:will-change-transform">
                <Photo
                  src={PLATE.src}
                  alt={`${PLATE.subject}, carried from neutral RAW to a print on ${STOCK.displayName}`}
                  sizes={SIZES}
                  filter={NEUTRAL_RAW}
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 [clip-path:inset(0_calc((1-var(--neg,1))*100%)_0_0)]"
                >
                  <Photo src={PLATE.src} alt="" sizes={SIZES} filter={NEGATIVE} />
                  <div className="absolute inset-0 mix-blend-multiply" style={{ backgroundColor: ORANGE_MASK }} />
                </div>

                <div
                  aria-hidden="true"
                  className="absolute inset-0 [clip-path:inset(0_calc((1-var(--print,1))*100%)_0_0)]"
                >
                  <Photo src={PLATE.src} alt="" sizes={SIZES} filter={STOCK.grade.filter} />
                  <GradeWashes grade={STOCK.grade} />
                </div>

                {/* Each layer carries --bloom itself: a shared wrapper would isolate their blending. */}
                <Halation
                  src={PLATE.src}
                  sizes={SIZES}
                  opacity={`calc(var(--bloom, 1) * ${halationOpacity(STOCK.grade)})`}
                />
                <Grain opacity={`calc(var(--bloom, 1) * ${STOCK.grade.grainOpacity * 1.6})`} />

                {/* The seam each sweep develops behind, in the hero seam's amber. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 hidden transition-opacity duration-200 [opacity:var(--seam-on,0)] [transform:translateX(calc(var(--seam,0)*100%))] pin:block"
                >
                  <div className="h-full w-[1.5px] -translate-x-1/2 bg-amber-line shadow-[0_0_14px_rgb(229_186_84/0.55)]" />
                </div>
              </div>
            </div>

            {/* Four segments, each filling as its stage scrolls by. */}
            <div aria-hidden="true" className="mt-6 hidden w-[220px] gap-1.5 pin:flex">
              {STAGES.map((item, index) => {
                const start = STAGE_STARTS[index];
                const span = (STAGE_STARTS[index + 1] ?? 1) - start;
                return (
                  <span key={item.title} className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/15">
                    <span
                      className="block h-full origin-left bg-amber"
                      style={{
                        transform: `scaleX(clamp(0, calc((var(--progress, 1) - ${start}) / ${span}), 1))`,
                      }}
                    />
                  </span>
                );
              })}
            </div>

            <ol className="relative mt-8 grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2 pin:mt-4 pin:block pin:h-[8.5rem] pin:@2xl:h-[6.75rem]">
              {STAGES.map((item, index) => (
                <li
                  key={item.title}
                  data-active={index === stage}
                  className="pin:absolute pin:inset-x-0 pin:top-0 pin:translate-y-2 pin:opacity-0 pin:transition-[opacity,transform] pin:duration-500 pin:ease-out-expo pin:data-[active=true]:translate-y-0 pin:data-[active=true]:opacity-100 pin:@2xl:grid pin:@2xl:grid-cols-[1fr_auto] pin:@2xl:gap-x-10"
                >
                  <div>
                    <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-ink">{item.title}</h3>
                    <p className="mt-1.5 max-w-[58ch] text-[15px] leading-[1.6] text-muted">{item.summary}</p>
                  </div>
                  <p className="mt-2.5 font-mono text-[12px] tabular-nums text-amber pin:@2xl:mt-1.5">{item.constant}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
