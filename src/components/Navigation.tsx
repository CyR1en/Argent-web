"use client";

import React, { useEffect, useState } from "react";
import { onScrollFrame } from "@/lib/scroll";
import { REPO_URL, RELEASE_URL } from "@/lib/site";
import { ArgentMark } from "./ArgentMark";

const SECTIONS = [
  { id: "optical-model", label: "Optical Model" },
  { id: "stocks", label: "Stocks" },
  { id: "workflow", label: "Workflow" },
];

/** The floating Liquid Glass capsule, after Argent's toolbar. It marks the section in view. */
export function Navigation() {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const sections = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (element): element is HTMLElement => element !== null
    );

    return onScrollFrame(() => {
      const middle = window.innerHeight / 2;
      const inView = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= middle && rect.bottom > middle;
      });
      return () => setCurrent(inView?.id ?? null);
    });
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 px-4 sm:px-6">
      <div className="liquid-glass-dock pointer-events-auto mx-auto flex h-12 max-w-[1080px] items-center justify-between rounded-full pl-3.5 pr-2 sm:pl-5">
        <a href="#top" className="inline-flex items-center gap-2.5 rounded-full py-1 pr-2 text-ink">
          <ArgentMark size={24} />
          <span className="text-[17px] font-semibold tracking-[-0.02em]">Argent</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-7 text-[13.5px] font-medium sm:flex">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={current === section.id ? "location" : undefined}
              className="text-muted transition-colors duration-200 hover:text-ink aria-[current]:text-ink"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden text-[13.5px] font-medium text-muted transition-colors duration-200 hover:text-ink md:inline-block"
          >
            GitHub
          </a>
          <a
            href={RELEASE_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-amber inline-flex h-8 items-center rounded-full px-4 text-[13px] font-semibold"
          >
            Download
          </a>
        </div>
      </div>
    </header>
  );
}
