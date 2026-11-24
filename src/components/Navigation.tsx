"use client";

import React from "react";
import { ArgentMark } from "./ArgentMark";

const RELEASE_URL = "https://github.com/CyR1en/Argent/releases/tag/nightly";

/**
 * Floating macOS 27 Liquid Glass capsule header mirroring Argent's top toolbar chrome.
 */
export function Navigation() {
  return (
    <header className="pointer-events-none sticky top-3 z-40 px-4 sm:px-6">
      <div className="liquid-glass-dock pointer-events-auto mx-auto flex h-12 max-w-[1080px] items-center justify-between rounded-full px-3.5 sm:px-5">
        <a
          href="#top"
          className="inline-flex items-center gap-2.5 rounded-full py-1 pr-2 text-[#f2f2f0]"
        >
          <ArgentMark size={24} />
          <span className="text-[17px] font-semibold tracking-[-0.02em]">
            Argent
          </span>
        </a>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 text-[13px] font-medium sm:flex"
        >
          <a
            href="#optical-model"
            className="text-[#b8bac2] transition-colors hover:text-[#f2f2f0]"
          >
            Optical Model
          </a>
          <a
            href="#stocks"
            className="text-[#b8bac2] transition-colors hover:text-[#f2f2f0]"
          >
            Stocks
          </a>
          <a
            href="#workflow"
            className="text-[#b8bac2] transition-colors hover:text-[#f2f2f0]"
          >
            Workflow
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/CyR1en/Argent"
            target="_blank"
            rel="noreferrer"
            className="hidden text-[12.5px] font-medium text-[#b8bac2] transition-colors hover:text-[#f2f2f0] md:inline-block"
          >
            GitHub
          </a>
          <a
            href={RELEASE_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-amber inline-flex h-8 items-center rounded-full px-4 text-[12.5px] font-semibold transition-transform duration-150 active:scale-[0.98]"
          >
            Download
          </a>
        </div>
      </div>
    </header>
  );
}
