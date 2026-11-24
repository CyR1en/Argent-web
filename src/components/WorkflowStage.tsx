"use client";

import React, { useState } from "react";
import { PLATES } from "@/data/plates";

type WorkflowStep = "rolls" | "adjust" | "develop";

const STEPS: { id: WorkflowStep; shortcut: string; title: string; copy: string }[] = [
  {
    id: "rolls",
    shortcut: "⌘O / ⌘I",
    title: "Rolls",
    copy: "Keep a folder of Sony a7 IV .ARW files in place or copy frames from a card into chronological rolls over Argent's Bayer-8 Latent Image canvas.",
  },
  {
    id: "adjust",
    shortcut: "Space",
    title: "Adjust & Compare",
    copy: "Full-bleed darkroom frame with a floating Liquid Glass filmstrip dock, live RGB histogram, calibrated Exposure ruler, and optional DINOv3 masks.",
  },
  {
    id: "develop",
    shortcut: "⌘D",
    title: "Develop",
    copy: "Write JPEG, HEIC, or 16-bit TIFF in sRGB, Display P3, or Adobe RGB with EXIF, GPS, and XMP intact. Source RAW files stay untouched.",
  },
];

/**
 * Act IV: Authentic interactive macOS 27 Argent application window matching the 3 user screenshots.
 */
export function WorkflowStage() {
  const [step, setStep] = useState<WorkflowStep>("rolls");
  const [contrast, setContrast] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [splitCompare, setSplitCompare] = useState(true);
  const [exportFormat, setExportFormat] = useState<"JPEG" | "HEIC" | "16-bit TIFF">("16-bit TIFF");
  const [exportSpace, setExportSpace] = useState<"sRGB" | "Display P3" | "Adobe RGB">("Display P3");

  return (
    <section
      id="workflow"
      className="relative border-t border-white/10 bg-[#141518] py-20 text-[#f2f2f0] sm:py-28"
    >
      <div className="mx-auto max-w-[1220px] px-4 sm:px-8">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="text-[clamp(2.1rem,4vw,3.2rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
              Built around the roll.
            </h2>
          </div>
          <div className="lg:col-span-6">
            <p className="max-w-[54ch] text-[15.5px] leading-[1.6] text-[#a4a6ae]">
              A native macOS 27 SwiftUI workspace where the photograph leads and
              every GPU step executes locally. Non-destructive recipes autosave
              per frame; a stopped batch develop picks right back up.
            </p>
          </div>
        </div>

        {/* Liquid Glass Step Selector */}
        <div className="mt-9 grid grid-cols-1 gap-3 md:grid-cols-3">
          {STEPS.map((item) => {
            const active = item.id === step;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setStep(item.id)}
                className={`rounded-[14px] p-4 text-left transition-all ${
                  active
                    ? "liquid-glass-panel ring-1 ring-[#e5ba54]/70"
                    : "border border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[17px] font-semibold text-[#f2f2f0]">
                    {item.title}
                  </span>
                  <span className="font-mono text-[11px] text-[#f1c24c]">
                    {item.shortcut}
                  </span>
                </div>
                <p className="mt-1.5 text-[13.5px] leading-[1.52] text-[#a4a6ae]">
                  {item.copy}
                </p>
              </button>
            );
          })}
        </div>

        {/* Faithful macOS 27 Argent Application Window */}
        <div className="mt-6 overflow-hidden rounded-[16px] bg-[#1d1e21] text-[#f2f2f0] shadow-[0_32px_90px_rgba(0,0,0,0.65)] ring-1 ring-white/15">
          {/* macOS Titlebar */}
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" aria-hidden="true" />
              <span className="ml-3 text-[16px] font-semibold tracking-[-0.01em] text-[#f2f2f0]">
                Argent
              </span>
            </div>

            <div className="hidden text-center sm:block">
              <div className="text-[12.5px] font-semibold leading-tight">
                {step === "rolls"
                  ? "Rolls"
                  : step === "adjust"
                    ? "Misc · 98 of 112 · DSC04842"
                    : "Develop · Misc"}
              </div>
              <div className="font-mono text-[11px] text-[#a4a6ae]">
                {step === "rolls"
                  ? "3 rolls · 491 frames"
                  : step === "adjust"
                    ? "Portra 400 · Starting from Auto"
                    : `36 frames shown · ${exportFormat} · ${exportSpace}`}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSplitCompare((v) => !v)}
              className="liquid-glass-pill rounded-full px-3 py-1 text-[12px] font-medium text-[#f2f2f0]"
            >
              {step === "adjust" ? (splitCompare ? "Split Compare" : "Full Print") : "macOS 27"}
            </button>
          </div>

          {/* Window Body: Left Glass Icon Rail + Inner Workspace */}
          <div className="grid min-h-[430px] grid-cols-1 md:grid-cols-[54px_1fr]">
            {/* Left Vertical Glass Rail */}
            <div className="hidden flex-col items-center gap-2.5 py-6 md:flex">
              {(["rolls", "adjust", "develop"] as WorkflowStep[]).map((id) => {
                const active = step === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setStep(id)}
                    aria-label={`Switch window to ${id}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-[10px] font-mono text-[11px] transition-all ${
                      active
                        ? "liquid-glass-pill text-[#f1c24c]"
                        : "text-[#a4a6ae] hover:text-white"
                    }`}
                  >
                    {id === "rolls" ? "R" : id === "adjust" ? "A" : "D"}
                  </button>
                );
              })}
            </div>

            {/* Inner Workspace Canvas */}
            <div className="m-2 rounded-[14px] bg-[#222326] p-4 sm:p-6">
              {step === "rolls" && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-[22px] font-semibold">Rolls</div>
                      <div className="mt-0.5 text-[12.5px] text-[#a4a6ae]">
                        3 rolls · 491 frames
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="liquid-glass-pill rounded-[8px] px-3 py-1.5 text-[12px] text-[#a4a6ae]">
                        Filter rolls
                      </span>
                      <span className="liquid-glass-pill rounded-[8px] px-3 py-1.5 text-[12px] text-[#f2f2f0]">
                        Newest first
                      </span>
                      <span className="btn-amber rounded-[8px] px-3.5 py-1.5 text-[12px] font-semibold">
                        + Import roll
                      </span>
                    </div>
                  </div>

                  {/* Chronological Rolls matching Screenshot 1 */}
                  <div className="mt-7 space-y-6">
                    {[
                      {
                        month: "OCTOBER 2026 · 1 roll",
                        date: "SAT OCT 24 2026",
                        name: "2026-10-24",
                        open: false,
                        count: "374 frames",
                        path: "Added in place · ~/Photography/Raw/2026-10-24",
                        edge: "ARGENT ◄ 24·10·26 ► 2026-10-24 · 374 EXP",
                        frames: [PLATES[1], PLATES[0], PLATES[3], PLATES[0]],
                      },
                      {
                        month: "SEPTEMBER 2026 · 1 roll",
                        date: "SUN SEP 27 2026",
                        name: "Misc",
                        open: true,
                        count: "112 frames",
                        path: "Added in place · ~/Photography/Raw/Misc",
                        edge: "ARGENT ◄ 27·09·26 ► MISC · 112 EXP",
                        frames: [PLATES[2], PLATES[0], PLATES[1], PLATES[3]],
                      },
                    ].map((roll) => (
                      <div key={roll.name}>
                        <div className="mb-3 flex items-center gap-3 font-mono text-[11px] tracking-[0.06em] text-[#a4a6ae]">
                          <span>{roll.month}</span>
                          <span className="h-px flex-1 bg-white/10" />
                        </div>

                        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[235px_1fr]">
                          <div
                            className={`pl-3 ${
                              roll.open
                                ? "border-l-2 border-[#f1c24c]"
                                : "border-l-2 border-transparent"
                            }`}
                          >
                            <div className="font-mono text-[11px] text-[#a4a6ae]">
                              {roll.date}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[17px] font-semibold text-[#f2f2f0]">
                                {roll.name}
                              </span>
                              {roll.open && (
                                <span className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[11px] text-[#f2f2f0]">
                                  OPEN
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-[12.5px] text-[#a4a6ae]">
                              {roll.count}
                            </div>
                            <div className="mt-1 truncate font-mono text-[11px] text-[#a4a6ae]/85">
                              {roll.path}
                            </div>
                          </div>

                          <div className="overflow-hidden rounded-[6px] bg-[#0b0c0f] p-1.5">
                            <div className="mb-1 px-1.5 font-mono text-[11px] text-[#e5ba54]/80">
                              {roll.edge}
                            </div>
                            <div className="film-rebate-dark h-[10px] w-full" />
                            <div className="grid grid-cols-4 gap-1.5 py-1.5">
                              {roll.frames.map((fr, idx) => (
                                <div
                                  key={idx}
                                  className="aspect-[3/2] overflow-hidden rounded-[2px]"
                                >
                                  <img
                                    src={fr.src}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="film-rebate-dark h-[10px] w-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === "adjust" && (
                <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
                  {/* Photo Canvas with Floating Dock */}
                  <div className="relative overflow-hidden rounded-[12px] bg-[#141518] lg:col-span-8">
                    <div className="relative aspect-[3/2] h-full w-full overflow-hidden">
                      <img
                        src={PLATES[0].src}
                        alt="Foothills specimen inside Argent Adjust workspace"
                        className="h-full w-full object-cover"
                        style={{
                          filter: `contrast(${(1.06 + contrast * 0.004).toFixed(
                            2
                          )}) brightness(${(
                            1.0 +
                            (highlights + shadows) * 0.002
                          ).toFixed(2)}) saturate(1.03)`,
                        }}
                      />

                      {splitCompare && (
                        <>
                          <div
                            className="pointer-events-none absolute inset-0 overflow-hidden"
                            style={{ clipPath: "inset(0 50% 0 0)" }}
                          >
                            <img
                              src={PLATES[0].src}
                              alt=""
                              className="h-full w-full object-cover"
                              style={{ filter: "contrast(0.90) saturate(0.84)" }}
                            />
                          </div>
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 left-1/2 w-[1.5px] bg-[#e5ba54]"
                          />
                          <span className="liquid-glass-pill pointer-events-none absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-medium">
                            Neutral RAW
                          </span>
                          <span className="liquid-glass-pill pointer-events-none absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-medium">
                            Portra 400
                          </span>
                        </>
                      )}

                      <div className="liquid-glass-dock absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-[10px] px-2.5 py-1.5">
                        {PLATES.slice(0, 3).map((p, i) => (
                          <img
                            key={p.id}
                            src={p.src}
                            alt=""
                            className={`h-7 w-10 rounded-[4px] object-cover ${
                              i === 0 ? "ring-1 ring-white" : "opacity-65"
                            }`}
                          />
                        ))}
                        <span className="h-4 w-px bg-white/15" />
                        <span className="font-mono text-[11px] text-[#f2f2f0]">
                          Portra 400
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Adjust Inspector matching Screenshots 2 & 3 */}
                  <div className="flex flex-col justify-between gap-3.5 rounded-[12px] bg-[#1a1b1f] p-4 lg:col-span-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[15px] font-semibold">Adjust</span>
                        <span className="text-[12px] text-[#a4a6ae]">✓ Saved</span>
                      </div>

                      {/* Segmented Pill */}
                      <div className="mt-3 grid grid-cols-2 rounded-[8px] bg-white/8 p-0.5 text-[12px]">
                        <span className="rounded-[6px] bg-white/16 py-1 text-center font-medium text-white">
                          All tools
                        </span>
                        <span className="py-1 text-center text-[#a4a6ae]">
                          Edited 3
                        </span>
                      </div>

                      {/* Light Sliders */}
                      <div className="mt-4 space-y-2.5 text-[12px]">
                        {[
                          { label: "Contrast", val: contrast, set: setContrast },
                          { label: "Highlights", val: highlights, set: setHighlights },
                          { label: "Shadows", val: shadows, set: setShadows },
                        ].map((ctrl) => (
                          <div key={ctrl.label}>
                            <div className="mb-1 flex justify-between text-[#d5d6dc]">
                              <span>{ctrl.label}</span>
                              <span className="font-mono tabular-nums">
                                {ctrl.val}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={-40}
                              max={40}
                              value={ctrl.val}
                              aria-label={ctrl.label}
                              onChange={(e) => ctrl.set(Number(e.target.value))}
                              className="w-full accent-[#f2f2f0]"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Tool Rows */}
                      <div className="mt-4 space-y-2 border-t border-white/10 pt-3 text-[12.5px]">
                        <div className="flex justify-between">
                          <span>Curve</span>
                          <span className="text-[#a4a6ae]">Linear</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Masks</span>
                          <span className="font-medium text-[#f1c24c]">3 masks</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lens</span>
                          <span className="text-[#a4a6ae]">From file</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-[12px]">
                      <span className="liquid-glass-pill rounded-[7px] py-1.5 text-center">
                        Compare to Auto
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setContrast(0);
                          setHighlights(0);
                          setShadows(0);
                        }}
                        className="rounded-[7px] bg-white/10 py-1.5 text-center hover:bg-white/16"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === "develop" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="space-y-4 lg:col-span-7">
                    <div className="text-[20px] font-semibold">
                      Develop 36 flagged frames
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {PLATES.slice(0, 3).map((p, i) => (
                        <div
                          key={p.id}
                          className="overflow-hidden rounded-[8px] bg-[#18191d] p-2"
                        >
                          <img
                            src={p.src}
                            alt=""
                            className="aspect-[3/2] w-full rounded-[4px] object-cover"
                          />
                          <div className="mt-1.5 font-mono text-[11px] text-[#a4a6ae]">
                            DSC04{840 + i}.ARW
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[13px] leading-[1.55] text-[#a4a6ae]">
                      Output retains EXIF, GPS, and XMP metadata from the Sony
                      a7 IV source. Recipes preserve every adjustment; stopped
                      batches resume without re-rendering finished frames.
                    </p>
                  </div>

                  <div className="space-y-4 rounded-[12px] bg-[#1a1b1f] p-4 lg:col-span-5">
                    <div>
                      <div className="mb-1.5 text-[12px] text-[#a4a6ae]">
                        Format
                      </div>
                      <div className="grid grid-cols-3 gap-1 rounded-[8px] bg-black/30 p-1 text-[12px]">
                        {(["JPEG", "HEIC", "16-bit TIFF"] as const).map((fmt) => (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => setExportFormat(fmt)}
                            className={`rounded-[6px] py-1.5 transition-colors ${
                              exportFormat === fmt
                                ? "bg-white/20 font-medium text-white"
                                : "text-[#a4a6ae] hover:text-white"
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 text-[12px] text-[#a4a6ae]">
                        Colour profile
                      </div>
                      <div className="grid grid-cols-3 gap-1 rounded-[8px] bg-black/30 p-1 text-[12px]">
                        {(["sRGB", "Display P3", "Adobe RGB"] as const).map(
                          (sp) => (
                            <button
                              key={sp}
                              type="button"
                              onClick={() => setExportSpace(sp)}
                              className={`rounded-[6px] py-1.5 transition-colors ${
                                exportSpace === sp
                                  ? "bg-white/20 font-medium text-white"
                                  : "text-[#a4a6ae] hover:text-white"
                              }`}
                            >
                              {sp}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="font-mono text-[11.5px] text-[#f1c24c]">
                        {exportFormat} · {exportSpace}
                      </span>
                      <span className="btn-amber rounded-[8px] px-3.5 py-1.5 text-[12px] font-semibold">
                        Develop Roll ⌘D
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
