"use client";

import React, { useState } from "react";
import { PLATES } from "@/data/plates";

type WorkflowStep = "import" | "film" | "develop";

const STEPS: { id: WorkflowStep; shortcut: string; title: string; copy: string }[] = [
  {
    id: "import",
    shortcut: "⌘O / ⌘I",
    title: "Bring in a roll",
    copy: "Keep a folder of Sony a7 IV .ARW files in place or copy frames from a card into a chronological roll. Review in capture order and flag what stays in view.",
  },
  {
    id: "film",
    shortcut: "1–9",
    title: "Choose the film",
    copy: "Set Stock, Rated at, and Lab balance for the roll. Auto measures each frame and smooths exposure and colour decisions across the entire strip.",
  },
  {
    id: "develop",
    shortcut: "⌘D",
    title: "Develop to print",
    copy: "Write JPEG, HEIC, or 16-bit TIFF in sRGB, Display P3, or Adobe RGB with EXIF, GPS, and XMP intact. Source RAW files are never touched.",
  },
];

/**
 * Interactive macOS Graphite showcase (Act IV) matching Argent's exact Graphite.swift palette.
 */
export function WorkflowStage() {
  const [step, setStep] = useState<WorkflowStep>("import");
  const [exportFormat, setExportFormat] = useState<"JPEG" | "HEIC" | "16-bit TIFF">("16-bit TIFF");
  const [exportSpace, setExportSpace] = useState<"sRGB" | "Display P3" | "Adobe RGB">("Display P3");
  const [ratedEI, setRatedEI] = useState<200 | 400 | 800>(400);
  const [labWarmth, setLabWarmth] = useState(0);

  return (
    <section
      id="workflow"
      className="relative py-20 sm:py-28"
      style={{ color: "var(--ink)" }}
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="font-display text-[clamp(2.2rem,4vw,3.3rem)] font-normal leading-[1.04] tracking-[-0.025em]">
              Built around the roll.
            </h2>
          </div>
          <div className="lg:col-span-6">
            <p
              className="max-w-[54ch] text-[16px] leading-[1.6]"
              style={{ color: "var(--ink-muted)" }}
            >
              A native SwiftUI workspace where the photograph leads and image
              processing never leaves your Mac. Non-destructive recipes autosave
              per frame; a stopped batch develop picks right back up.
            </p>
          </div>
        </div>

        {/* Step selector pills */}
        <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
          {STEPS.map((item) => {
            const active = item.id === step;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setStep(item.id)}
                className="rounded-[8px] border p-4 text-left transition-colors"
                style={
                  active
                    ? {
                        backgroundColor: "var(--surface-elevated)",
                        borderColor: "var(--ink)",
                      }
                    : {
                        backgroundColor: "transparent",
                        borderColor: "var(--hairline)",
                      }
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-[20px] font-normal">
                    {item.title}
                  </span>
                  <span
                    className="font-mono text-[11px]"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {item.shortcut}
                  </span>
                </div>
                <p
                  className="mt-2 text-[13.5px] leading-[1.52]"
                  style={{ color: "var(--ink-muted)" }}
                >
                  {item.copy}
                </p>
              </button>
            );
          })}
        </div>

        {/* Authentic macOS Graphite Window Mockup */}
        <div className="mt-6 overflow-hidden rounded-[14px] bg-[#2f3133] text-[#f2f2f0] shadow-[0_24px_64px_rgba(0,0,0,0.22)] ring-1 ring-black/20">
          {/* macOS Titlebar Chrome */}
          <div className="relative flex h-12 items-center justify-between border-b border-white/10 px-4">
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-4 font-display text-[17px] text-[#f2f2f0]">
                Argent
              </span>
            </div>

            <div className="hidden text-center sm:block">
              <div className="text-[12.5px] font-semibold leading-tight">
                {step === "import"
                  ? "Rolls"
                  : step === "film"
                    ? "High Sierra · Frame 14A"
                    : "Develop · High Sierra"}
              </div>
              <div className="font-mono text-[11px] text-[#f2f2f0]/65">
                {step === "import"
                  ? "4 rolls · 142 frames"
                  : step === "film"
                    ? `Portra 400 · Rated ${ratedEI} · Auto`
                    : `36 frames shown · ${exportFormat} · ${exportSpace}`}
              </div>
            </div>

            <div className="font-mono text-[11px] text-[#f2f2f0]/60">
              macOS 27
            </div>
          </div>

          {/* App Body: Sidebar Rail + Workspace */}
          <div className="grid min-h-[380px] grid-cols-1 md:grid-cols-[54px_1fr]">
            {/* Left Icon Rail */}
            <div
              aria-hidden="true"
              className="hidden flex-col items-center gap-3 border-r border-white/10 py-6 md:flex"
            >
              {(["import", "film", "develop"] as WorkflowStep[]).map((id) => {
                const active = step === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setStep(id)}
                    title={id}
                    className={`flex h-9 w-9 items-center justify-center rounded-[9px] text-[11px] font-mono ${
                      active
                        ? "bg-white/15 text-[#e3a25a] ring-1 ring-white/20"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {id === "import" ? "R" : id === "film" ? "F" : "D"}
                  </button>
                );
              })}
            </div>

            {/* Inner Workspace (#373a3c) */}
            <div className="m-1.5 rounded-[12px] bg-[#373a3c] p-5 sm:p-7">
              {step === "import" && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-[22px] font-semibold">Rolls</div>
                      <div className="mt-1 font-mono text-[12px] text-[#f2f2f0]/65">
                        Chronological capture order · Sony a7 IV .ARW
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[12.5px]">
                      <span className="rounded-[7px] bg-white/10 px-3 py-1.5">
                        Add Existing Folder ⌘O
                      </span>
                      <span className="rounded-[7px] bg-[#e2e4e6] px-3 py-1.5 font-semibold text-[#1d1f21]">
                        Import Roll ⌘I
                      </span>
                    </div>
                  </div>

                  {/* Two Roll Filmstrips echoing rolls-and-import.html */}
                  <div className="mt-6 space-y-5">
                    {[
                      {
                        date: "OCT 2026",
                        name: "High Sierra Ridge",
                        stock: "Portra 400 · 36 frames",
                        edge: "KODAK PORTRA 400",
                        frames: [PLATES[0], PLATES[2], PLATES[3], PLATES[0]],
                      },
                      {
                        date: "SEP 2026",
                        name: "Rain Corner & Late Diner",
                        stock: "Tungsten 800 · 28 frames",
                        edge: "CINE 800T CS41",
                        frames: [PLATES[1], PLATES[2], PLATES[1], PLATES[3]],
                      },
                    ].map((roll) => (
                      <div
                        key={roll.name}
                        className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[210px_1fr]"
                      >
                        <div className="border-l-2 border-[#f2f2f0]/65 pl-3">
                          <div className="font-mono text-[11px] tracking-[0.06em] text-[#f2f2f0]/55">
                            {roll.date}
                          </div>
                          <div className="mt-1 text-[16px] font-semibold">
                            {roll.name}
                          </div>
                          <div className="mt-0.5 text-[12.5px] text-[#f2f2f0]/70">
                            {roll.stock}
                          </div>
                        </div>
                        <div className="overflow-hidden rounded-[5px] bg-[#0c0d14]">
                          <div className="film-rebate-bar h-[16px] w-full" />
                          <div className="grid grid-cols-4 gap-1.5 px-2 py-1">
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
                          <div className="film-rebate-bar bottom h-[16px] w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === "film" && (
                <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
                  <div className="rounded-[8px] bg-[#2a2c2e] p-5 lg:col-span-8">
                    <div className="aspect-[3/2] overflow-hidden rounded-[3px] shadow-xl">
                      <img
                        src={PLATES[0].src}
                        alt="Alpine frame in Graphite darkroom surround"
                        className="h-full w-full object-cover transition-all duration-200"
                        style={{
                          filter: `brightness(${
                            ratedEI === 800 ? 1.07 : ratedEI === 200 ? 0.94 : 1.01
                          }) contrast(1.06) sepia(${Math.max(0, 0.08 + labWarmth * 0.04).toFixed(
                            2
                          )}) saturate(${(1.02 + labWarmth * 0.04).toFixed(2)})`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-4 rounded-[10px] bg-[#2c2f31] p-4 lg:col-span-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <span className="text-[14px] font-semibold">Film</span>
                      <span className="font-mono text-[11px] text-[#e3a25a]">
                        Auto smoothed
                      </span>
                    </div>

                    <div>
                      <div className="mb-1.5 text-[12px] text-[#f2f2f0]/75">
                        Rated at (EI)
                      </div>
                      <div className="grid grid-cols-3 gap-1 rounded-[7px] bg-black/25 p-1 font-mono text-[12px]">
                        {([200, 400, 800] as const).map((ei) => (
                          <button
                            key={ei}
                            type="button"
                            onClick={() => setRatedEI(ei)}
                            className={`rounded-[5px] py-1 transition-colors ${
                              ratedEI === ei
                                ? "bg-white/20 text-white"
                                : "text-white/60 hover:text-white"
                            }`}
                          >
                            {ei}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex justify-between text-[12px] text-[#f2f2f0]/75">
                        <span>Lab balance</span>
                        <span className="font-mono tabular-nums">
                          {labWarmth > 0 ? `+${labWarmth}` : labWarmth} pts
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-2}
                        max={2}
                        step={1}
                        value={labWarmth}
                        aria-label="Lab balance preview"
                        onChange={(e) => setLabWarmth(Number(e.target.value))}
                        className="w-full accent-[#e3a25a]"
                      />
                    </div>

                    <div className="border-t border-white/10 pt-3 text-[12px] text-[#f2f2f0]/65">
                      Optional DINOv3 local masks: Subject, Background, Sky.
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
                    <div className="grid grid-cols-3 gap-2">
                      {PLATES.slice(0, 3).map((p, i) => (
                        <div key={p.id} className="overflow-hidden rounded-[4px] bg-[#2a2c2e] p-1.5">
                          <img
                            src={p.src}
                            alt=""
                            className="aspect-[3/2] w-full rounded-[2px] object-cover"
                          />
                          <div className="mt-1 font-mono text-[11px] text-[#f2f2f0]/70">
                            DSC0{418 + i}.ARW
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[12.5px] text-[#f2f2f0]/70">
                      Output retains EXIF, GPS, and XMP metadata from the Sony
                      a7 IV source. Recipes keep your settings; stopped batches
                      resume without re-rendering finished frames.
                    </p>
                  </div>

                  <div className="space-y-4 rounded-[10px] bg-[#2c2f31] p-4 lg:col-span-5">
                    <div>
                      <div className="mb-1.5 text-[12px] text-[#f2f2f0]/75">
                        Format
                      </div>
                      <div className="grid grid-cols-3 gap-1 rounded-[7px] bg-black/25 p-1 text-[12px]">
                        {(["JPEG", "HEIC", "16-bit TIFF"] as const).map((fmt) => (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => setExportFormat(fmt)}
                            className={`rounded-[5px] py-1.5 transition-colors ${
                              exportFormat === fmt
                                ? "bg-white/20 font-medium text-white"
                                : "text-white/60 hover:text-white"
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 text-[12px] text-[#f2f2f0]/75">
                        Colour profile
                      </div>
                      <div className="grid grid-cols-3 gap-1 rounded-[7px] bg-black/25 p-1 text-[12px]">
                        {(["sRGB", "Display P3", "Adobe RGB"] as const).map(
                          (sp) => (
                            <button
                              key={sp}
                              type="button"
                              onClick={() => setExportSpace(sp)}
                              className={`rounded-[5px] py-1.5 transition-colors ${
                                exportSpace === sp
                                  ? "bg-white/20 font-medium text-white"
                                  : "text-white/60 hover:text-white"
                              }`}
                            >
                              {sp}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-3">
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#e3a25a]">
                        <span>{exportFormat}</span>
                        <span>{exportSpace}</span>
                      </div>
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
