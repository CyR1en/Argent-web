"use client";

import React, { useEffect, useState } from "react";

const STOPS = [
  { id: "top", code: "01", label: "Top" },
  { id: "optical-model", code: "02", label: "Optical Chain" },
  { id: "stocks", code: "03", label: "14 Emulsions" },
  { id: "workflow", code: "04", label: "Roll Workflow" },
  { id: "download", code: "05", label: "Download" },
];

/**
 * Whisper-quiet vertical Liquid Glass exposure-stop rail fixed on the right edge on desktop viewports.
 */
export function ScrollProgressRail() {
  const [activeId, setActiveId] = useState("top");

  useEffect(() => {
    const sections = STOPS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: [0.05, 0.25, 0.6] }
    );

    sections.forEach((sec) => io.observe(sec));

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (window.scrollY < 160) {
          setActiveId("top");
          return;
        }
        const nearBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 80;
        if (nearBottom) {
          setActiveId("download");
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside
      aria-label="Page section progress"
      className="pointer-events-none fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 xl:flex"
    >
      <nav
        aria-label="Exposure stop sections"
        className="liquid-glass-dock pointer-events-auto flex flex-col gap-1.5 rounded-full px-2 py-2.5"
      >
        {STOPS.map((stop) => {
          const isActive = stop.id === activeId;
          return (
            <button
              key={stop.id}
              type="button"
              onClick={() => scrollToSection(stop.id)}
              title={stop.label}
              aria-label={`Jump to ${stop.label}`}
              aria-current={isActive ? "location" : undefined}
              className="group relative flex items-center justify-center rounded-full p-1"
            >
              <span
                className={`font-mono text-[11px] tabular-nums transition-colors ${
                  isActive
                    ? "font-semibold text-[#f1c24c]"
                    : "text-[#a4a6ae] group-hover:text-[#f2f2f0]"
                }`}
              >
                {stop.code}
              </span>
              <span className="liquid-glass-dock pointer-events-none absolute right-10 whitespace-nowrap rounded-full px-3 py-1 text-[11.5px] font-medium text-[#f2f2f0] opacity-0 transition-opacity group-hover:opacity-100">
                {stop.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
