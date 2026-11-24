"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";

interface PolarityShellProps {
  children: React.ReactNode;
}

/**
 * Coordinates Lenis smooth scroll across the continuous darkroom canvas and updates
 * --scroll-progress for subtle scroll-reactive depth lighting.
 */
export function PolarityShell({ children }: PolarityShellProps) {
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

    let scrollRaf = 0;
    const updateScrollVar = () => {
      scrollRaf = 0;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
    };

    const onScroll = () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(updateScrollVar);
    };

    updateScrollVar();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (lenisRaf) cancelAnimationFrame(lenisRaf);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      lenis?.destroy();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div className="relative bg-[#141518] text-[#f2f2f0]">{children}</div>;
}
