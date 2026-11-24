"use client";

import React from "react";
import { ArgentMark } from "./ArgentMark";

const RELEASE_URL = "https://github.com/CyR1en/Argent/releases/tag/nightly";

/**
 * Minimal top bar adapting seamlessly across the scroll polarity transition (--ground / --ink).
 */
export function Navigation() {
  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200"
      style={{
        backgroundColor: "color-mix(in srgb, var(--ground) 84%, transparent)",
        borderColor: "var(--hairline)",
        color: "var(--ink)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-5 sm:px-8">
        <a
          href="#top"
          className="inline-flex items-center gap-2.5 rounded-md py-1 focus-visible:outline-2"
        >
          <ArgentMark size={26} />
          <span className="font-display text-[20px] font-medium tracking-[-0.02em]">
            Argent
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-7 text-[13.5px] sm:flex">
          <a
            href="#optical-model"
            className="transition-opacity duration-150 hover:opacity-100"
            style={{ color: "var(--ink-muted)" }}
          >
            Optical Model
          </a>
          <a
            href="#stocks"
            className="transition-opacity duration-150 hover:opacity-100"
            style={{ color: "var(--ink-muted)" }}
          >
            Stocks
          </a>
          <a
            href="#workflow"
            className="transition-opacity duration-150 hover:opacity-100"
            style={{ color: "var(--ink-muted)" }}
          >
            Workflow
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/CyR1en/Argent"
            target="_blank"
            rel="noreferrer"
            className="hidden text-[13px] transition-opacity hover:opacity-80 md:inline-block"
            style={{ color: "var(--ink-muted)" }}
          >
            GitHub
          </a>
          <a
            href={RELEASE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-transform duration-150 active:scale-[0.98]"
            style={{
              backgroundColor: "var(--ink)",
              color: "var(--ground)",
            }}
          >
            Download
          </a>
        </div>
      </div>
    </header>
  );
}
