"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";

interface PolarityShellProps {
  darkActs: React.ReactNode;
  lightActs: React.ReactNode;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpHex(hexA: [number, number, number], hexB: [number, number, number], t: number): string {
  const r = Math.round(lerp(hexA[0], hexB[0], t));
  const g = Math.round(lerp(hexA[1], hexB[1], t));
  const b = Math.round(lerp(hexA[2], hexB[2], t));
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Coordinates Lenis smooth scroll and drives the Darkroom Obsidian (#0C0D10) to Archival
 * Baryta Paper (#EEEAE2) polarity transition across the Negative/Print seam sentinel.
 */
export function PolarityShell({ darkActs, lightActs }: PolarityShellProps) {
  const seamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis: Lenis | null = null;
    let lenisRaf = 0;

    if (!reducedMotion) {
      lenis = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      const onFrame = (time: number) => {
        lenis?.raf(time);
        lenisRaf = requestAnimationFrame(onFrame);
      };
      lenisRaf = requestAnimationFrame(onFrame);
    }

    let polarityRaf = 0;
    const applyPolarity = () => {
      polarityRaf = 0;
      const seam = seamRef.current;
      if (!seam) return;
      const rect = seam.getBoundingClientRect();
      const mid = window.innerHeight * 0.55;
      // Sharp optical crossfade band centered on the seam divider so text never sits on low-contrast gray
      const raw = (mid - rect.top) / Math.max(120, rect.height * 0.7);
      const t = Math.min(1, Math.max(0, raw));
      const p = t * t * (3 - 2 * t);

      const root = document.documentElement;
      root.style.setProperty("--polarity", p.toFixed(3));
      root.style.setProperty("--ground", lerpHex([12, 13, 16], [238, 234, 226], p));
      root.style.setProperty("--surface", lerpHex([21, 23, 28], [228, 223, 213], p));
      root.style.setProperty("--surface-elevated", lerpHex([28, 31, 38], [246, 243, 236], p));

      // Keep foreground high-contrast on either side of the crossfade midpoint
      if (p < 0.5) {
        root.style.setProperty("--ink", "#edeae3");
        root.style.setProperty("--ink-muted", "#a9a49b");
        root.style.setProperty("--hairline", "rgba(237, 234, 227, 0.11)");
        root.style.setProperty("--hairline-strong", "rgba(237, 234, 227, 0.22)");
      } else {
        root.style.setProperty("--ink", "#17181b");
        root.style.setProperty("--ink-muted", "#57554f");
        root.style.setProperty("--hairline", "rgba(23, 24, 27, 0.12)");
        root.style.setProperty("--hairline-strong", "rgba(23, 24, 27, 0.24)");
      }
    };

    const onScroll = () => {
      if (!polarityRaf) polarityRaf = requestAnimationFrame(applyPolarity);
    };

    applyPolarity();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (lenisRaf) cancelAnimationFrame(lenisRaf);
      if (polarityRaf) cancelAnimationFrame(polarityRaf);
      lenis?.destroy();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div>
      {darkActs}

      {/* Optical Polarity Seam Transition (Negative Darkroom -> Silver Print Paper) */}
      <div
        ref={seamRef}
        aria-hidden="true"
        className="relative flex h-44 items-center justify-center overflow-hidden px-5 sm:h-56"
        style={{ backgroundColor: "var(--ground)" }}
      >
        <div className="mx-auto flex w-full max-w-[1280px] items-center gap-6">
          <div className="h-px flex-1" style={{ backgroundColor: "var(--hairline-strong)" }} />
          <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: "var(--ink-muted)" }}>
            <span>Negative</span>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#b45a26]" />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#dedfe1] ring-1 ring-black/20" />
            <span>Print</span>
          </div>
          <div className="h-px flex-1" style={{ backgroundColor: "var(--hairline-strong)" }} />
        </div>
      </div>

      <div
        className="bg-[#eeeae2] text-[#17181b]"
        style={
          {
            "--ground": "#eeeae2",
            "--surface": "#e4dfd5",
            "--surface-elevated": "#f6f3ec",
            "--ink": "#17181b",
            "--ink-muted": "#55524c",
            "--hairline": "rgba(23, 24, 27, 0.12)",
            "--hairline-strong": "rgba(23, 24, 27, 0.24)",
          } as React.CSSProperties
        }
      >
        {lightActs}
      </div>
    </div>
  );
}
