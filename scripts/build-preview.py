#!/usr/bin/env python3
"""Build self-contained macOS 27 Liquid Glass preview-inline.html using real stock data."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

STOCKS_TS = Path("/home/ubuntu/Argent-Web/src/data/stocks.ts")
OUT_HTML = Path("/home/ubuntu/Argent-Web/preview-inline.html")
SHARP_PATH = "/home/ubuntu/Argent-Web/node_modules/.pnpm/sharp@0.35.5_@types+node@22.20.5/node_modules/sharp"


def encode_image_data_uri(img_path: str, max_width: int = 720, quality: int = 76) -> str:
    script = (
        f"const sharp = require({json.dumps(SHARP_PATH)});"
        f"sharp({json.dumps(img_path)}).resize({{ width: {max_width}, withoutEnlargement: true }})"
        f".jpeg({{ quality: {quality}, mozjpeg: true }}).toBuffer()"
        f".then(b => process.stdout.write('data:image/jpeg;base64,' + b.toString('base64')));"
    )
    res = subprocess.run(["node", "-e", script], check=True, capture_output=True, text=True)
    return res.stdout


RIDGE_URI = encode_image_data_uri("/home/ubuntu/Argent-Web/public/images/specimen-ridge.jpg")
ALPINE_URI = encode_image_data_uri("/home/ubuntu/Argent-Web/public/images/specimen-alpine.jpg")
NIGHT_URI = encode_image_data_uri("/home/ubuntu/Argent-Web/public/images/specimen-night.jpg")
INTERIOR_URI = encode_image_data_uri("/home/ubuntu/Argent-Web/public/images/specimen-interior.jpg")

raw_ts = STOCKS_TS.read_text(encoding="utf-8")
marker = "export const STOCKS: StockProfile[] = "
idx = raw_ts.index(marker) + len(marker)
stocks_json = raw_ts[idx:].rstrip().rstrip(";")
stocks = json.loads(stocks_json)
assert len(stocks) == 14

PLATES_JSON = json.dumps(
    [
        {
            "id": "ridge",
            "frameNum": "01",
            "label": "Foothills",
            "src": RIDGE_URI,
            "camera": "Sony a7 IV · FE 50mm · ISO 100 · f/5.6",
            "halationFocus": [{"xPct": 58, "yPct": 38}, {"xPct": 44, "yPct": 47}],
        },
        {
            "id": "alpine",
            "frameNum": "02",
            "label": "Alpine",
            "src": ALPINE_URI,
            "camera": "Sony a7 IV · FE 50mm · ISO 100 · f/5.6",
            "halationFocus": [{"xPct": 24, "yPct": 31}, {"xPct": 37, "yPct": 35}],
        },
        {
            "id": "night",
            "frameNum": "03",
            "label": "Night",
            "src": NIGHT_URI,
            "camera": "Sony a7 IV · FE 35mm · ISO 800 · f/2",
            "halationFocus": [
                {"xPct": 36, "yPct": 24},
                {"xPct": 19, "yPct": 19},
                {"xPct": 55, "yPct": 43},
                {"xPct": 72, "yPct": 38},
            ],
        },
        {
            "id": "interior",
            "frameNum": "04",
            "label": "Interior",
            "src": INTERIOR_URI,
            "camera": "Sony a7 IV · FE 40mm · ISO 160 · f/2.8",
            "halationFocus": [{"xPct": 24, "yPct": 34}],
        },
    ]
)

HTML = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Argent — macOS 27 Liquid Glass Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fragment+Mono&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --sans: "Hanken Grotesk", -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    --mono: "Fragment Mono", ui-monospace, "SF Mono", Menlo, monospace;
    --ground: #141518;
    --shell: #1d1e21;
    --ws: #222326;
    --ink: #f2f2f0;
    --muted: #a4a6ae;
    --hair: rgba(255, 255, 255, 0.11);
    --amber: #f1c24c;
    --amber-line: #e5ba54;
  }

  /* Leave html, body, and outer shell transparent with zero card/border/padding */
  html, body {
    margin: 0;
    padding: 0;
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
  }
  *, *::before, *::after { box-sizing: border-box; }
  .outer-wrap { width: 100%; }

  /* Internal scrollable darkroom viewport (fixed px height, zero vh units) */
  .stage-viewport {
    position: relative;
    width: 100%;
    height: 760px;
    overflow-y: auto;
    overflow-x: hidden;
    border-radius: 14px;
    background: #141518;
    color: #f2f2f0;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.22) transparent;
  }

  ::selection { background: #f1c24c; color: #141518; }
  :focus-visible { outline: 2px solid #f1c24c; outline-offset: 2px; }

  /* Liquid Glass Surfaces */
  .lg-panel {
    background: linear-gradient(180deg, rgba(46,48,56,0.54) 0%, rgba(22,23,28,0.70) 100%);
    backdrop-filter: blur(26px) saturate(185%) brightness(1.06);
    -webkit-backdrop-filter: blur(26px) saturate(185%) brightness(1.06);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(255,255,255,0.06), 0 0 0 0.5px rgba(255,255,255,0.16), 0 18px 46px rgba(0,0,0,0.48);
  }
  .lg-dock {
    background: linear-gradient(180deg, rgba(44,46,54,0.58) 0%, rgba(24,25,30,0.74) 100%);
    backdrop-filter: blur(24px) saturate(190%) brightness(1.08);
    -webkit-backdrop-filter: blur(24px) saturate(190%) brightness(1.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.34), inset 0 -1px 0 rgba(255,255,255,0.08), 0 0 0 0.5px rgba(255,255,255,0.18), 0 16px 40px rgba(0,0,0,0.55);
  }
  .lg-pill {
    background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%);
    backdrop-filter: blur(18px) saturate(180%);
    -webkit-backdrop-filter: blur(18px) saturate(180%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.36), 0 0 0 0.5px rgba(255,255,255,0.22), 0 8px 20px rgba(0,0,0,0.34);
  }
  .btn-amber {
    background: linear-gradient(180deg, #f5ca5b 0%, #e1ae3a 100%);
    color: #141518;
    font-weight: 600;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.48), 0 2px 6px rgba(0,0,0,0.38);
  }

  /* Floating Capsule Header */
  .nav-shell {
    position: sticky; top: 10px; z-index: 35; padding: 0 14px; pointer-events: none;
  }
  .topbar {
    pointer-events: auto;
    max-width: 1000px; margin: 0 auto; height: 46px; border-radius: 999px;
    display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
  }
  .brand { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: #f2f2f0; }
  .brand span { font-size: 16px; font-weight: 600; letter-spacing: -0.02em; }
  .nav-links { display: flex; align-items: center; gap: 14px; font-size: 12.5px; }
  .nav-links button { all: unset; cursor: pointer; color: #b8bac2; font-weight: 500; }
  .nav-links button:hover { color: #f2f2f0; }
  .dl-pill {
    display: inline-flex; align-items: center; height: 28px; padding: 0 13px;
    border-radius: 999px; font-size: 12px; text-decoration: none;
  }

  .wrap { max-width: 1020px; margin: 0 auto; padding: 0 18px; }

  /* Hero */
  .hero { position: relative; padding: 26px 0 36px; overflow: hidden; }
  #latent-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .hero-head { position: relative; z-index: 2; max-width: 600px; margin: 0 auto; text-align: center; }
  .hero-head h1 {
    margin: 0; font-size: clamp(2rem, 4.4vw, 3rem); font-weight: 600;
    line-height: 1.04; letter-spacing: -0.035em; color: #f2f2f0;
  }
  .hero-head p { margin: 10px auto 0; font-size: 14px; line-height: 1.55; color: #a4a6ae; max-width: 48ch; }
  .cta-row { margin-top: 16px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
  .btn-lg {
    all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
    height: 36px; padding: 0 16px; border-radius: 999px; font-size: 13px; font-weight: 500; text-decoration: none;
  }
  .spec-strip {
    margin-top: 12px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;
    font-family: var(--mono); font-size: 11px; color: #a4a6ae;
  }

  /* Full-Bleed Split Compare Hero Stage */
  .hero-stage {
    position: relative; z-index: 2; margin-top: 22px;
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 26px 70px rgba(0,0,0,0.62);
    user-select: none;
  }
  .gate {
    position: relative; aspect-ratio: 3 / 2; width: 100%; overflow: hidden;
  }
  .gate img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .grain-layer {
    position: absolute; inset: 0; pointer-events: none; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
    background-size: 140px 140px;
  }
  .seam-hitbox { position: absolute; inset: 0; z-index: 10; cursor: ew-resize; touch-action: none; }
  .seam-line {
    position: absolute; top: 0; bottom: 0; width: 1.5px; background: #e5ba54; pointer-events: none;
  }
  .seam-disc {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(22,23,27,0.86); border: 1.5px solid #e5ba54;
    display: grid; place-items: center; color: #f2f2f0; backdrop-filter: blur(8px);
  }
  .float-pill-l, .float-pill-r {
    position: absolute; top: 12px; padding: 5px 11px; border-radius: 999px;
    font-size: 11.5px; font-weight: 500; color: #f2f2f0; pointer-events: none;
  }
  .float-pill-l { left: 12px; }
  .float-pill-r { right: 12px; }

  .space-pill-wrap {
    position: absolute; inset: auto 0 64px 0; z-index: 20; display: flex; justify-content: center; pointer-events: none;
  }
  .space-pill {
    all: unset; cursor: pointer; pointer-events: auto;
    padding: 5px 13px; border-radius: 999px; font-size: 11.5px; font-weight: 500; color: #f2f2f0;
  }

  .hero-dock-wrap {
    position: absolute; inset: auto 12px 12px 12px; z-index: 25; display: flex; justify-content: center; pointer-events: none;
  }
  .hero-dock {
    pointer-events: auto; border-radius: 13px; padding: 7px 10px;
    display: flex; align-items: center; gap: 8px; max-width: 100%; overflow-x: auto; scrollbar-width: none;
  }
  .hero-dock::-webkit-scrollbar { display: none; }
  .dock-thumb {
    all: unset; cursor: pointer; position: relative; width: 52px; height: 34px; flex: none;
    border-radius: 5px; overflow: hidden; opacity: 0.72; transition: opacity 140ms;
  }
  .dock-thumb.active { opacity: 1; box-shadow: 0 0 0 2px #f2f2f0; }
  .dock-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .dock-num {
    position: absolute; left: 3px; bottom: 3px; padding: 1px 4px; border-radius: 3px;
    background: rgba(0,0,0,0.75); font-family: var(--mono); font-size: 11px; line-height: 1; color: #f2f2f0;
  }
  .dock-stock-btn {
    all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 7px;
    height: 30px; padding: 0 11px; border-radius: 8px; background: rgba(255,255,255,0.12);
    font-size: 12px; font-weight: 500; color: #f2f2f0; white-space: nowrap;
  }

  /* Optical Pipeline */
  .sec { padding: 38px 0; border-top: 1px solid rgba(255,255,255,0.09); }
  .sec-h2 { margin: 0; font-size: clamp(1.55rem, 3vw, 2.2rem); font-weight: 600; letter-spacing: -0.025em; }
  .bench-grid { margin-top: 18px; display: grid; grid-template-columns: 1fr; gap: 16px; }
  @media (min-width: 640px) { .bench-grid { grid-template-columns: 7fr 5fr; } }
  .bench-card { border-radius: 15px; padding: 12px; }
  .bench-head { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; padding-bottom: 10px; font-family: var(--mono); font-size: 11px; color: #a4a6ae; }
  .stage-btn {
    all: unset; cursor: pointer; display: block; width: 100%; padding: 11px 14px;
    border-radius: 12px; border: 1px solid rgba(255,255,255,0.09); margin-bottom: 8px;
  }
  .stage-btn.active {
    background: linear-gradient(180deg, rgba(46,48,56,0.54), rgba(22,23,28,0.70));
    border-color: rgba(229,186,84,0.65);
  }
  .stage-btn .top { display: flex; justify-content: space-between; align-items: baseline; }
  .stage-btn .t { font-size: 15px; font-weight: 600; color: #f2f2f0; }
  .stage-btn .ev { font-family: var(--mono); font-size: 11px; color: #f1c24c; }
  .stage-btn p { margin: 4px 0 0; font-size: 12px; line-height: 1.5; color: #a4a6ae; }

  /* 35mm Stock Roll & Inspector */
  .film-rebate-dark {
    height: 11px; width: 100%; background: #0c0d10;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='12'%3E%3Cpath fill-rule='evenodd' d='M0 0h16v12H0z M5.5 3h5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z'/%3E%3C/svg%3E") repeat-x;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='12'%3E%3Cpath fill-rule='evenodd' d='M0 0h16v12H0z M5.5 3h5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z'/%3E%3C/svg%3E") repeat-x;
  }
  .strip-wrap {
    margin-top: 14px; border-radius: 10px; background: #0b0c0f; padding: 10px;
    overflow-x: auto; border: 1px solid rgba(255,255,255,0.1); scrollbar-width: none;
  }
  .strip-wrap::-webkit-scrollbar { display: none; }
  .strip-row { display: flex; gap: 8px; padding: 6px 0; width: max-content; }
  .strip-item {
    all: unset; cursor: pointer; position: relative; width: 138px; flex: none;
    border-radius: 3px; overflow: hidden; opacity: 0.78;
  }
  .strip-item.active { opacity: 1; box-shadow: 0 0 0 2px #f1c24c; }
  .strip-item img { display: block; width: 100%; aspect-ratio: 3/2; object-fit: cover; }
  .strip-lbl {
    position: absolute; inset: auto 0 0 0; padding: 5px 8px;
    background: linear-gradient(transparent, rgba(0,0,0,0.9));
    display: flex; justify-content: space-between; font-size: 11px; color: #f2f2f0;
  }
  .strip-lbl span:last-child { font-family: var(--mono); color: #e5ba54; }

  .pill-filter {
    all: unset; cursor: pointer; height: 28px; padding: 0 11px; border-radius: 999px;
    font-size: 11.5px; font-weight: 500; color: #d5d6dc;
  }
  .datasheet-grid {
    margin-top: 16px; display: grid; grid-template-columns: 1fr; gap: 16px; align-items: start;
  }
  @media (min-width: 640px) { .datasheet-grid { grid-template-columns: 7fr 5fr; } }
  .insp-card { border-radius: 15px; padding: 18px; display: flex; flex-direction: column; gap: 14px; }
  .chart-box { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; }
  .spec-dl {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; margin: 0; font-size: 11.5px;
  }
  .spec-dl dt { font-family: var(--mono); font-size: 11px; text-transform: uppercase; color: #a4a6ae; }
  .spec-dl dd { margin: 2px 0 0; font-weight: 500; color: #f2f2f0; }

  /* macOS 27 Window Showcase */
  .wf-tabs { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
  .wf-tab {
    all: unset; cursor: pointer; padding: 7px 14px; border-radius: 10px; font-size: 12px; font-weight: 500;
    border: 1px solid rgba(255,255,255,0.12); color: #a4a6ae;
  }
  .wf-tab.active {
    background: linear-gradient(180deg, rgba(46,48,56,0.54), rgba(22,23,28,0.70));
    border-color: rgba(229,186,84,0.7); color: #f2f2f0;
  }
  .mac-win {
    margin-top: 14px; border-radius: 14px; background: #222326; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.14); box-shadow: 0 24px 64px rgba(0,0,0,0.55);
  }
  .mac-tb {
    background: #1d1e21;
    padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: space-between; font-size: 12px; line-height: 1.2;
  }
  .lights { display: flex; gap: 6px; align-items: center; }
  .lights i { width: 9px; height: 9px; border-radius: 50%; display: block; }
  .mac-ws { padding: 16px; }

  /* Download Folio & Footer */
  .folio-card { border-radius: 18px; padding: 24px; }
  .folio-cols {
    margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.12);
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; font-size: 12px; line-height: 1.5;
  }
  @media (min-width: 640px) { .folio-cols { grid-template-columns: repeat(4, 1fr); } }
  .folio-cols dt { font-family: var(--mono); font-size: 11px; text-transform: uppercase; color: #f1c24c; }
  .folio-cols dd { margin: 4px 0 0; color: #d5d6dc; }
  .legal { margin-top: 18px; font-size: 11px; line-height: 1.55; color: #a4a6ae; }
</style>
</head>
<body>
<div class="outer-wrap">
  <main class="stage-viewport" id="viewport">
    <!-- Floating Liquid Glass Header -->
    <div class="nav-shell">
      <header class="topbar lg-dock">
        <a href="#hero-sec" class="brand">
          <svg width="22" height="22" viewBox="0 0 1024 1024" aria-hidden="true">
            <defs><linearGradient id="mbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34353A"/><stop offset="1" stop-color="#1B1C1F"/></linearGradient></defs>
            <rect x="64" y="64" width="896" height="896" rx="220" fill="url(#mbg)"/>
            <g transform="translate(100 100) scale(0.804688)">
              <path fill="#B45A26" d="M505 212H324A112 112 0 0 0 212 324V700A112 112 0 0 0 324 812H505Z"/>
              <path fill="#DEDFE1" d="M519 212H700A112 112 0 0 1 812 324V700A112 112 0 0 1 700 812H519V684A172 172 0 0 0 519 340Z"/>
              <path fill="#F2B27A" d="M505 340A172 172 0 0 0 505 684Z"/>
            </g>
          </svg>
          <span>Argent</span>
        </a>
        <nav class="nav-links" aria-label="Sections">
          <button type="button" data-jump="#pipeline-sec">Optical Model</button>
          <button type="button" data-jump="#stocks-sec">Stocks</button>
          <button type="button" data-jump="#workflow-sec">Workflow</button>
        </nav>
        <a href="https://github.com/CyR1en/Argent/releases/tag/nightly" target="_blank" rel="noreferrer" class="dl-pill btn-amber">Download</a>
      </header>
    </div>

    <!-- ACT I: DARKROOM HERO + LIQUID GLASS SPLIT COMPARE -->
    <section class="hero" id="hero-sec">
      <canvas id="latent-canvas" aria-hidden="true"></canvas>
      <div class="wrap">
        <div class="hero-head">
          <h1>Raw files, developed as film.</h1>
          <p>
            Native macOS 27 darkroom for Sony a7 IV. Modelled colour negative and optical print, rendered locally on Apple silicon Metal.
          </p>
          <div class="cta-row">
            <a href="https://github.com/CyR1en/Argent/releases/tag/nightly" target="_blank" rel="noreferrer" class="btn-lg btn-amber">Download for macOS</a>
            <button type="button" class="btn-lg lg-pill" data-jump="#pipeline-sec">Inside the optical chain ↓</button>
          </div>
          <div class="spec-strip">
            <span>macOS 27</span><span style="color:#e5ba54;">·</span><span>Apple silicon</span><span style="color:#e5ba54;">·</span><span>Open source Apache 2.0</span>
          </div>
        </div>

        <figure class="hero-stage" style="margin:22px 0 0;">
          <div class="gate">
            <img id="hero-print-img" src="__RIDGE_URI__" alt="Foothills specimen print">
            <div id="hero-halation" style="position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;"></div>
            <div id="hero-grain" class="grain-layer" style="opacity:0.11;"></div>

            <div id="hero-raw-clip" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;clip-path:inset(0 52% 0 0);">
              <img id="hero-raw-img" src="__RIDGE_URI__" alt="" aria-hidden="true" style="filter:contrast(0.90) saturate(0.84) brightness(1.03);">
            </div>

            <div class="seam-hitbox" id="hero-seam-hitbox" role="slider" tabindex="0" aria-label="Compare Neutral RAW against film print" aria-valuemin="8" aria-valuemax="92" aria-valuenow="48">
              <span class="float-pill-l lg-pill" id="pill-raw">Neutral RAW</span>
              <span class="float-pill-r lg-pill" id="pill-prt">Portra 400</span>
              <div class="seam-line" id="hero-seam-line" style="left:48%;">
                <div class="seam-disc">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m9 16-4-4 4-4"/><path d="m15 8 4 4-4 4"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="space-pill-wrap">
              <button type="button" class="space-pill lg-pill" id="space-hold-btn">Hold Space for the whole neutral RAW</button>
            </div>

            <div class="hero-dock-wrap">
              <nav class="hero-dock lg-dock" aria-label="Hero frames and stock">
                <div id="dock-thumbs" style="display:flex;gap:6px;align-items:center;"></div>
                <span style="width:1px;height:18px;background:rgba(255,255,255,0.16);" aria-hidden="true"></span>
                <button type="button" class="dock-stock-btn" id="dock-stock-cycle" title="Click to cycle film stock">
                  <span id="dock-swatch" style="width:9px;height:12px;border-radius:2px;border:1px solid rgba(255,255,255,0.35);background:#E3A25A;"></span>
                  <span id="dock-stock-name">Portra 400</span>
                  <span style="color:#a4a6ae;">▲</span>
                </button>
              </nav>
            </div>
          </div>
        </figure>
      </div>
    </section>

    <!-- ACT II: OPTICAL BENCH -->
    <section class="sec" id="pipeline-sec">
      <div class="wrap">
        <h2 class="sec-h2">Film physics, never a LUT preset.</h2>
        <div class="bench-grid">
          <div class="bench-card lg-panel">
            <div class="bench-head">
              <span id="pipe-readout" style="color:#f1c24c;">+1 EV · 3200 K ENLARGER ONTO PAPER</span>
              <span id="pipe-const">Neutral balance: dE2000 &lt; 0.01</span>
            </div>
            <figure class="gate" style="margin:0;border-radius:10px;">
              <img id="pipe-img" src="__RIDGE_URI__" alt="Optical pipeline stage">
              <div id="pipe-neg" style="position:absolute;inset:0;opacity:0;pointer-events:none;">
                <img src="__RIDGE_URI__" alt="" style="filter:invert(1) hue-rotate(174deg) saturate(1.18) contrast(0.84) brightness(0.94);">
                <div style="position:absolute;inset:0;background:rgba(186,92,36,0.50);mix-blend-mode:multiply;"></div>
              </div>
              <div id="pipe-halo" style="position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;opacity:0;"></div>
              <div id="pipe-grain" class="grain-layer" style="opacity:0.11;"></div>
            </figure>
          </div>
          <div id="pipe-stages"></div>
        </div>
      </div>
    </section>

    <!-- ACT III: 14-STOCK 35MM ROLL + LIQUID GLASS INSPECTOR -->
    <section class="sec" id="stocks-sec">
      <div class="wrap">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px;">
          <div>
            <h2 class="sec-h2">Fourteen emulsions, zero scan fits.</h2>
            <p style="margin:6px 0 0;font-size:13.5px;line-height:1.55;color:#a4a6ae;max-width:52ch;">
              Published Kodak and Fujifilm datasheets plus explicit proxies where sheets omit data. Pick a frame along the roll to inspect Status M curves and live Exposure.
            </p>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;" id="family-filters"></div>
        </div>

        <div class="strip-wrap">
          <div id="strip-edge-top" style="font-family:var(--mono);font-size:11px;color:rgba(229,186,84,0.82);padding:0 6px 5px;display:flex;justify-content:space-between;">
            <span>ARGENT ◄ DATASHEET ROLL ► KODAK PORTRA 400</span>
            <span>14 EXP</span>
          </div>
          <div class="film-rebate-dark"></div>
          <div class="strip-row" id="contact-strip"></div>
          <div class="film-rebate-dark"></div>
        </div>

        <div class="datasheet-grid">
          <figure style="position:relative;margin:0;border-radius:14px;overflow:hidden;box-shadow:0 22px 60px rgba(0,0,0,0.5);">
            <div class="gate">
              <img id="gal-img" src="__RIDGE_URI__" alt="Selected emulsion plate">
              <div id="gal-halo" style="position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;"></div>
              <div id="gal-grain" class="grain-layer" style="opacity:0.11;"></div>
              <span id="gal-badge" class="lg-pill" style="position:absolute;left:12px;top:12px;padding:5px 11px;border-radius:999px;font-size:11.5px;font-weight:500;">Portra 400</span>
              <nav id="gal-plates" aria-label="Choose specimen plate" class="lg-dock" style="position:absolute;right:12px;top:12px;border-radius:999px;padding:4px;display:flex;gap:4px;"></nav>
              <div style="position:absolute;inset:auto 0 12px 0;display:flex;justify-content:center;pointer-events:none;">
                <button type="button" id="raw-compare-btn" class="lg-pill" style="all:unset;cursor:pointer;pointer-events:auto;padding:5px 13px;border-radius:999px;font-size:11.5px;font-weight:500;color:#f2f2f0;background:linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08));backdrop-filter:blur(18px);box-shadow:inset 0 1px 0 rgba(255,255,255,0.35),0 6px 18px rgba(0,0,0,0.4);">Hold for Neutral RAW</button>
              </div>
            </div>
          </figure>

          <div class="insp-card lg-panel">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">
                <h3 id="gal-name" style="margin:0;font-size:21px;font-weight:600;">Portra 400</h3>
                <span id="gal-status" style="font-family:var(--mono);font-size:11px;text-transform:uppercase;padding:2px 9px;border-radius:999px;border:1px solid rgba(255,255,255,0.15);color:#f1c24c;">datasheet</span>
              </div>
              <p id="gal-summary" style="margin:6px 0 0;font-size:12.5px;line-height:1.5;color:#a4a6ae;"></p>
            </div>

            <div class="chart-box">
              <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;color:#a4a6ae;margin-bottom:4px;">
                <span>STATUS M CURVES</span>
                <span id="chart-readout"></span>
              </div>
              <svg id="hd-svg" viewBox="0 0 380 148" style="width:100%;display:block;"></svg>
            </div>

            <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;">
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;">
                <span>Exposure</span>
                <span id="ev-readout" style="font-family:var(--mono);color:#f1c24c;">+0.00 EV</span>
              </div>
              <input id="ev-slider" type="range" min="-2.5" max="2.5" step="0.25" value="0" aria-label="Exposure EV" style="width:100%;accent-color:#f1c24c;">
            </div>

            <dl class="spec-dl">
              <div><dt>Box Speed</dt><dd id="spec-iso">ISO 400</dd></div>
              <div><dt>Paper</dt><dd id="spec-paper">ENDURA Premier</dd></div>
              <div><dt>Halation</dt><dd id="spec-hal">1.5% · 180 µm</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </section>

    <!-- ACT IV: MACOS 27 WINDOW SHOWCASE -->
    <section class="sec" id="workflow-sec">
      <div class="wrap">
        <h2 class="sec-h2">Built around the roll.</h2>
        <div class="wf-tabs">
          <button type="button" class="wf-tab active" data-wf="rolls">1. Rolls (⌘O / ⌘I)</button>
          <button type="button" class="wf-tab" data-wf="adjust">2. Adjust &amp; Compare</button>
          <button type="button" class="wf-tab" data-wf="develop">3. Develop (⌘D)</button>
        </div>
        <section class="mac-win" aria-label="Argent macOS 27 application preview">
          <div class="mac-tb">
            <div class="lights">
              <i style="background:#ff5f57;"></i>
              <i style="background:#febc2e;"></i>
              <i style="background:#28c840;"></i>
              <span style="margin-left:8px;font-size:14px;font-weight:600;">Argent</span>
            </div>
            <span id="wf-title" style="font-size:12px;font-weight:600;">Rolls · 3 rolls</span>
            <span class="lg-pill" style="padding:3px 10px;border-radius:999px;font-size:11px;">macOS 27</span>
          </div>
          <div class="mac-ws" id="wf-body"></div>
        </section>
      </div>
    </section>

    <!-- ACT V: LIQUID GLASS DOWNLOAD FOLIO -->
    <section class="sec" id="download-sec">
      <div class="wrap">
        <div class="folio-card lg-panel">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;">
            <div style="display:flex;align-items:center;gap:14px;">
              <svg width="42" height="42" viewBox="0 0 1024 1024" aria-hidden="true" style="flex:none;">
                <defs><linearGradient id="fbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34353A"/><stop offset="1" stop-color="#1B1C1F"/></linearGradient></defs>
                <rect x="64" y="64" width="896" height="896" rx="220" fill="url(#fbg)"/>
                <g transform="translate(100 100) scale(0.804688)">
                  <path fill="#B45A26" d="M505 212H324A112 112 0 0 0 212 324V700A112 112 0 0 0 324 812H505Z"/>
                  <path fill="#DEDFE1" d="M519 212H700A112 112 0 0 1 812 324V700A112 112 0 0 1 700 812H519V684A172 172 0 0 0 519 340Z"/>
                  <path fill="#F2B27A" d="M505 340A172 172 0 0 0 505 684Z"/>
                </g>
              </svg>
              <div>
                <h2 class="sec-h2">A digital roll. A film finish.</h2>
                <p style="margin:4px 0 0;font-size:13px;color:#a4a6ae;">Open source macOS 27 darkroom for Apple silicon.</p>
              </div>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <a href="https://github.com/CyR1en/Argent/releases/tag/nightly" target="_blank" rel="noreferrer" class="btn-lg btn-amber">Download Argent (DMG)</a>
              <a href="https://github.com/CyR1en/Argent" target="_blank" rel="noreferrer" class="btn-lg lg-pill">GitHub</a>
            </div>
          </div>

          <dl class="folio-cols">
            <div><dt>Requirements</dt><dd>macOS 27 on Apple silicon · Sony a7 IV .ARW</dd></div>
            <div><dt>Distribution</dt><dd>Developer ID signed, Apple notarized, Sparkle 2</dd></div>
            <div><dt>Processing</dt><dd>100% local Metal GPU · Non-destructive</dd></div>
            <div><dt>Licence</dt><dd>Apache 2.0 · Optional DINOv3 masks</dd></div>
          </dl>
          <p class="legal">
            Built with DINOv3. Kodak, Portra, Ektar, Gold, ColorPlus, UltraMax, and Vision3 are trademarks of Eastman Kodak Company. Fujifilm, Fujicolor, Pro 400H, C200, and Superia are trademarks of FUJIFILM Corporation. CineStill is a trademark of CineStill Film. Sony and a7 IV are trademarks of Sony Group Corporation. Argent is not affiliated with or endorsed by any of them.
          </p>
        </div>
      </div>
    </section>
  </main>
</div>

<script>
(() => {
  const STOCKS = __STOCKS_JSON__;
  const PLATES = __PLATES_JSON__;

  document.querySelectorAll("[data-jump]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.getAttribute("data-jump"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Bayer-8 Canvas2D Latent Image backdrop with warm golden-amber pointer + corner glow
  const canvas = document.getElementById("latent-canvas");
  const ctx = canvas.getContext("2d");
  let px = -999, py = -999, pTime = 0;
  const heroSec = document.getElementById("hero-sec");
  heroSec.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    px = e.clientX - r.left; py = e.clientY - r.top;
  });
  heroSec.addEventListener("pointerleave", () => { px = -999; py = -999; });
  const bayer4 = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
  function drawLatent() {
    const w = canvas.clientWidth || 700;
    const h = canvas.clientHeight || 420;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    ctx.clearRect(0, 0, w, h);
    const step = 4;
    pTime += 0.016;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const wave = 0.5 + 0.5 * Math.sin(x * 0.011 + pTime) * Math.cos(y * 0.012 - pTime * 0.7);
        const dx = x - px, dy = y - py;
        const glow = px > 0 ? Math.exp(-(dx*dx + dy*dy) / 5600) : 0;
        const cx = x - w * 0.88, cy = y - h * 0.80;
        const corner = 0.36 * Math.exp(-(cx*cx + cy*cy) / 36000);
        const cov = (0.04 + 0.18 * wave) + (glow + corner) * 0.55;
        const thr = bayer4[(y/step)&3][(x/step)&3] / 16;
        if (cov > thr) {
          ctx.fillStyle = (glow + corner) > 0.22 ? "rgba(229,186,84,0.34)" : "rgba(216,216,212,0.14)";
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }
    requestAnimationFrame(drawLatent);
  }
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    requestAnimationFrame(drawLatent);
  } else {
    drawLatent();
  }

  // Hero Split Compare + Floating Liquid Glass Dock
  const HERO_IDS = ["kodak-portra-400", "kodak-ektar-100", "cinestill-800t", "kodak-vision3-500t-cinema", "fujifilm-pro-400h"];
  let heroStockIdx = 0;
  let heroPlateId = "ridge";
  let holdRaw = false;

  const heroRawClip = document.getElementById("hero-raw-clip");
  const heroSeamLine = document.getElementById("hero-seam-line");
  const heroHit = document.getElementById("hero-seam-hitbox");
  const pillRaw = document.getElementById("pill-raw");
  const pillPrt = document.getElementById("pill-prt");

  function setSeam(pct) {
    const p = Math.min(92, Math.max(8, pct));
    heroRawClip.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
    heroSeamLine.style.left = `${p}%`;
    heroHit.setAttribute("aria-valuenow", String(Math.round(p)));
    pillRaw.style.opacity = p > 20 ? "1" : "0";
    pillPrt.style.opacity = p < 80 ? "1" : "0";
  }

  function renderHero() {
    const s = STOCKS.find(x => x.id === HERO_IDS[heroStockIdx]);
    const p = PLATES.find(x => x.id === heroPlateId);
    const pImg = document.getElementById("hero-print-img");
    const rImg = document.getElementById("hero-raw-img");
    pImg.src = p.src; rImg.src = p.src;
    pImg.style.filter = holdRaw ? "contrast(0.90) saturate(0.84) brightness(1.03)" : s.grade.filter;
    document.getElementById("hero-grain").style.opacity = holdRaw ? "0" : String(s.grade.grainOpacity);
    heroRawClip.style.opacity = holdRaw ? "0" : "1";
    heroSeamLine.style.opacity = holdRaw ? "0" : "1";
    pillRaw.textContent = holdRaw ? "Whole frame · Neutral RAW" : "Neutral RAW";
    pillPrt.style.display = holdRaw ? "none" : "block";
    pillPrt.textContent = s.displayName;
    document.getElementById("dock-stock-name").textContent = s.displayName;
    document.getElementById("dock-swatch").style.background = s.grade.accentHex;
    const halo = document.getElementById("hero-halation");
    halo.style.opacity = holdRaw ? "0" : String(Math.min(0.95, s.grade.halationStrength));
    halo.style.backgroundImage = p.halationFocus.map(pt =>
      `radial-gradient(circle at ${pt.xPct}% ${pt.yPct}%, rgba(235,58,28,0.58) 0%, rgba(212,42,22,0.22) 10%, transparent 24%)`
    ).join(",");

    const dock = document.getElementById("dock-thumbs");
    dock.innerHTML = "";
    PLATES.forEach(pl => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dock-thumb" + (pl.id === heroPlateId ? " active" : "");
      b.innerHTML = `<img src="${pl.src}" alt="${pl.label}" style="filter:${s.grade.filter}"><span class="dock-num">${pl.frameNum}</span>`;
      b.onclick = () => { heroPlateId = pl.id; renderHero(); };
      dock.appendChild(b);
    });
  }

  heroHit.addEventListener("pointerdown", (e) => {
    heroHit.setPointerCapture(e.pointerId);
    const r = heroHit.getBoundingClientRect();
    setSeam(((e.clientX - r.left) / r.width) * 100);
  });
  heroHit.addEventListener("pointermove", (e) => {
    if (e.buttons !== 1 && e.pointerType === "mouse") return;
    const r = heroHit.getBoundingClientRect();
    setSeam(((e.clientX - r.left) / r.width) * 100);
  });
  document.getElementById("dock-stock-cycle").onclick = () => {
    heroStockIdx = (heroStockIdx + 1) % HERO_IDS.length;
    renderHero();
  };
  const spaceBtn = document.getElementById("space-hold-btn");
  spaceBtn.addEventListener("pointerdown", (e) => { e.stopPropagation(); holdRaw = true; renderHero(); });
  ["pointerup","pointerleave","pointercancel"].forEach(ev => spaceBtn.addEventListener(ev, () => {
    holdRaw = false; renderHero();
  }));
  renderHero();

  // Pipeline Bench
  const STAGES = [
    { ev: "−4 EV", t: "Scene-linear Rec. 2020", c: "Metered mid-gray: 11.49 / ISO lux·s", d: "Untouched Sony a7 IV RAW encoded ±8 stops around metered mid-gray.", neg: 0, halo: 0, grain: 0.03, filter: "contrast(0.90) saturate(0.84) brightness(1.03)", src: PLATES[0].src },
    { ev: "−1 EV", t: "Colour negative & couplers", c: "Highlight shoulder: +3 to +5.5 stops", d: "Status M curve inversion with fitted natural-reflectance matrix and couplers.", neg: 1, halo: 0, grain: 0.08, filter: "contrast(0.96) saturate(0.92)", src: PLATES[0].src },
    { ev: "+1 EV", t: "3200 K enlarger onto paper", c: "Neutral balance: dE2000 < 0.01", d: "3200 K blackbody enlarger projects through dyes onto ENDURA Premier or VISION 2383.", neg: 0, halo: 0.10, grain: 0.11, filter: "contrast(1.06) saturate(1.02) sepia(0.08)", src: PLATES[0].src },
    { ev: "+4 EV", t: "Film grain & base halation", c: "Base reflection: 180 – 270 µm", d: "Print Grain Index tables and red base-reflection halation on Apple silicon Metal.", neg: 0, halo: 0.68, grain: 0.16, filter: "contrast(1.14) saturate(1.06) hue-rotate(-8deg)", src: PLATES[2].src }
  ];
  const pipeStagesEl = document.getElementById("pipe-stages");
  let activePipe = 2;
  function renderPipe() {
    const st = STAGES[activePipe];
    document.getElementById("pipe-readout").textContent = `${st.ev} · ${st.t.toUpperCase()}`;
    document.getElementById("pipe-const").textContent = st.c;
    const img = document.getElementById("pipe-img");
    img.src = st.src; img.style.filter = st.filter;
    document.getElementById("pipe-neg").style.opacity = String(st.neg);
    document.getElementById("pipe-grain").style.opacity = String(st.grain);
    const halo = document.getElementById("pipe-halo");
    halo.style.opacity = String(st.halo);
    halo.style.backgroundImage = PLATES[2].halationFocus.map(pt =>
      `radial-gradient(circle at ${pt.xPct}% ${pt.yPct}%, rgba(235,58,28,0.65) 0%, transparent 25%)`
    ).join(",");
    pipeStagesEl.querySelectorAll(".stage-btn").forEach((el, idx) => el.classList.toggle("active", idx === activePipe));
  }
  STAGES.forEach((st, idx) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "stage-btn";
    b.innerHTML = `<div class="top"><span class="t">${st.t}</span><span class="ev">${st.ev}</span></div><p>${st.d}</p>`;
    b.onclick = () => { activePipe = idx; renderPipe(); };
    pipeStagesEl.appendChild(b);
  });
  renderPipe();

  // 14-Stock Roll & Liquid Glass Inspector
  const FAMILIES = ["All 14", "Portra", "Kodak Daylight", "Fujifilm", "Tungsten & Cinema"];
  let galFamily = "All 14";
  let galStockId = "kodak-portra-400";
  let galPlateId = "ridge";
  let galRaw = false;
  let galEV = 0;

  const famWrap = document.getElementById("family-filters");
  function renderFamilies() {
    famWrap.innerHTML = "";
    FAMILIES.forEach(f => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pill-filter " + (f === galFamily ? "btn-amber" : "lg-pill");
      b.textContent = f;
      b.onclick = () => {
        galFamily = f;
        const list = f === "All 14" ? STOCKS : STOCKS.filter(s => s.family === f);
        if (list.length) galStockId = list[0].id;
        renderFamilies(); renderStrip(); renderDatasheet();
      };
      famWrap.appendChild(b);
    });
  }

  const stripEl = document.getElementById("contact-strip");
  function renderStrip() {
    stripEl.innerHTML = "";
    const list = galFamily === "All 14" ? STOCKS : STOCKS.filter(s => s.family === galFamily);
    list.forEach((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "strip-item" + (s.id === galStockId ? " active" : "");
      const thumb = s.family === "Tungsten & Cinema" ? PLATES[2].src : PLATES[0].src;
      b.innerHTML = `<img src="${thumb}" alt="${s.displayName}" style="filter:${s.grade.filter}"><div class="strip-lbl"><span>${s.displayName}</span><span>${i+1}A</span></div>`;
      b.onclick = () => {
        galStockId = s.id;
        if (s.family === "Tungsten & Cinema" && galPlateId === "interior") galPlateId = "night";
        renderStrip(); renderDatasheet();
      };
      stripEl.appendChild(b);
    });
  }

  function renderChart(s) {
    const svg = document.getElementById("hd-svg");
    const w = 380, h = 148, padL = 28, padR = 8, padT = 8, padB = 22;
    const pw = w - padL - padR, ph = h - padT - padB;
    const { logH, r, g, b } = s.curves;
    const minH = Math.min(...logH), maxH = Math.max(...logH);
    const toD = (arr) => arr.map((v, i) => {
      const x = padL + ((logH[i] - minH) / (maxH - minH)) * pw;
      const y = padT + ph - (v / 3.2) * ph;
      return `${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    const mid = Math.round(logH.length * 0.56);
    document.getElementById("chart-readout").textContent = `H ${logH[mid].toFixed(2)} · R ${r[mid].toFixed(2)} G ${g[mid].toFixed(2)} B ${b[mid].toFixed(2)}`;
    svg.innerHTML = `
      <line x1="${padL}" y1="${padT+ph}" x2="${padL+pw}" y2="${padT+ph}" stroke="rgba(255,255,255,0.18)"/>
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT+ph}" stroke="rgba(255,255,255,0.18)"/>
      <path d="${toD(b)}" fill="none" stroke="#5B9BFF" stroke-width="2.1"/>
      <path d="${toD(g)}" fill="none" stroke="#52C97D" stroke-width="2.1"/>
      <path d="${toD(r)}" fill="none" stroke="#EB5757" stroke-width="2.2"/>
      <text x="${padL}" y="${h-4}" font-family="monospace" font-size="11" fill="#a4a6ae">${minH.toFixed(1)}</text>
      <text x="${padL+pw/2}" y="${h-4}" text-anchor="middle" font-family="monospace" font-size="11" fill="#a4a6ae">Log H</text>
      <text x="${padL+pw}" y="${h-4}" text-anchor="end" font-family="monospace" font-size="11" fill="#a4a6ae">${maxH.toFixed(1)}</text>
    `;
  }

  function renderDatasheet() {
    const s = STOCKS.find(x => x.id === galStockId) || STOCKS[2];
    const p = PLATES.find(x => x.id === galPlateId) || PLATES[0];
    const img = document.getElementById("gal-img");
    img.src = p.src;
    const evMult = Math.pow(2, galEV * 0.16);
    img.style.filter = galRaw
      ? "contrast(0.90) saturate(0.84) brightness(1.03)"
      : `${s.grade.filter} brightness(${evMult.toFixed(3)})`;
    document.getElementById("gal-grain").style.opacity = galRaw ? "0" : String(s.grade.grainOpacity);
    const halo = document.getElementById("gal-halo");
    halo.style.opacity = galRaw ? "0" : String(Math.min(0.95, s.grade.halationStrength));
    halo.style.backgroundImage = p.halationFocus.map(pt =>
      `radial-gradient(circle at ${pt.xPct}% ${pt.yPct}%, rgba(235,58,28,0.58) 0%, transparent 24%)`
    ).join(",");
    document.getElementById("gal-badge").textContent = galRaw ? "Neutral RAW" : s.displayName;
    document.getElementById("gal-name").textContent = s.displayName;
    document.getElementById("gal-status").textContent = s.status;
    document.getElementById("gal-summary").textContent = s.summary;
    document.getElementById("spec-iso").textContent = `ISO ${s.boxSpeed}`;
    document.getElementById("spec-paper").textContent = s.paper;
    document.getElementById("spec-hal").textContent = s.halation ? `${Math.round(s.halation.strength*100)}% · ${s.halation.radiusMicrometres} µm` : "Not modelled";
    renderChart(s);

    const gp = document.getElementById("gal-plates");
    gp.innerHTML = "";
    PLATES.forEach(pl => {
      const b = document.createElement("button");
      b.type = "button";
      b.style.cssText = pl.id === galPlateId
        ? "all:unset;cursor:pointer;height:24px;padding:0 9px;border-radius:999px;font-size:11px;font-weight:500;background:#f2f2f0;color:#141518;"
        : "all:unset;cursor:pointer;height:24px;padding:0 9px;border-radius:999px;font-size:11px;font-weight:500;color:#d5d6dc;";
      b.textContent = pl.label;
      b.onclick = () => { galPlateId = pl.id; renderDatasheet(); };
      gp.appendChild(b);
    });
  }

  document.getElementById("ev-slider").addEventListener("input", (e) => {
    galEV = Number(e.target.value);
    document.getElementById("ev-readout").textContent = (galEV >= 0 ? "+" : "") + galEV.toFixed(2) + " EV";
    renderDatasheet();
  });

  const rawBtn = document.getElementById("raw-compare-btn");
  rawBtn.addEventListener("pointerdown", () => { galRaw = true; rawBtn.textContent = "Showing Neutral RAW"; renderDatasheet(); });
  ["pointerup","pointerleave","pointercancel"].forEach(ev => rawBtn.addEventListener(ev, () => {
    galRaw = false; rawBtn.textContent = "Hold for Neutral RAW"; renderDatasheet();
  }));

  renderFamilies(); renderStrip(); renderDatasheet();

  // Workflow Tabs
  const wfBody = document.getElementById("wf-body");
  const wfTitle = document.getElementById("wf-title");
  function renderWf(mode) {
    if (mode === "rolls") {
      wfTitle.textContent = "Rolls · 3 rolls · 491 frames";
      wfBody.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:8px;flex-wrap:wrap;">
          <div><div style="font-size:17px;font-weight:600;">Rolls</div><div style="font-size:11.5px;color:#a4a6ae;">3 rolls · 491 frames</div></div>
          <div style="display:flex;gap:8px;font-size:11.5px;"><span class="lg-pill" style="padding:5px 10px;border-radius:7px;color:#a4a6ae;">Filter rolls</span><span class="btn-amber" style="padding:5px 11px;border-radius:7px;">+ Import roll</span></div>
        </div>
        <figure style="margin:0;background:#0b0c0f;border-radius:6px;padding:6px 8px;">
          <div style="font-family:var(--mono);font-size:11px;color:rgba(229,186,84,0.8);margin-bottom:4px;">ARGENT ◄ 27·09·26 ► MISC · 112 EXP</div>
          <div class="film-rebate-dark"></div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:6px 0;">
            <img src="${PLATES[2].src}" style="width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:2px;">
            <img src="${PLATES[0].src}" style="width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:2px;">
            <img src="${PLATES[1].src}" style="width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:2px;">
            <img src="${PLATES[3].src}" style="width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:2px;">
          </div>
          <div class="film-rebate-dark"></div>
        </figure>`;
    } else if (mode === "adjust") {
      wfTitle.textContent = "Misc · 98 of 112 · DSC04842";
      wfBody.innerHTML = `
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:12px;align-items:stretch;">
          <div style="position:relative;border-radius:8px;overflow:hidden;background:#141518;">
            <img src="${PLATES[0].src}" style="width:100%;aspect-ratio:3/2;object-fit:cover;display:block;filter:${STOCKS[2].grade.filter}">
            <span class="lg-pill" style="position:absolute;left:8px;top:8px;padding:3px 9px;border-radius:999px;font-size:11px;">Neutral RAW</span>
            <span class="lg-pill" style="position:absolute;right:8px;top:8px;padding:3px 9px;border-radius:999px;font-size:11px;">Portra 400</span>
          </div>
          <div style="background:#1a1b1f;padding:12px;border-radius:8px;font-size:12px;">
            <div style="display:flex;justify-content:space-between;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;"><span>Adjust</span><span style="color:#a4a6ae;">✓ Saved</span></div>
            <div style="margin-top:8px;color:#a4a6ae;">Exposure: <span style="color:#f1c24c;font-family:var(--mono);">0.00 EV</span></div>
            <div style="margin-top:6px;color:#a4a6ae;">Masks: <span style="color:#f1c24c;">3 masks</span></div>
            <div style="margin-top:6px;color:#a4a6ae;">Lens: From file</div>
          </div>
        </div>`;
    } else {
      wfTitle.textContent = "Develop · Misc · 36 flagged frames";
      wfBody.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-size:15px;font-weight:600;">16-bit TIFF · Display P3</div>
            <div style="margin-top:4px;font-size:12px;color:#a4a6ae;">Retains EXIF, GPS, and XMP metadata. Stopped batches resume cleanly.</div>
          </div>
          <span class="btn-amber" style="padding:7px 14px;border-radius:8px;font-size:12px;">Develop Roll ⌘D</span>
        </div>`;
    }
  }
  document.querySelectorAll(".wf-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".wf-tab").forEach(t => t.classList.toggle("active", t === tab));
      renderWf(tab.getAttribute("data-wf"));
    });
  });
  renderWf("rolls");
})();
</script>
</body>
</html>
"""

OUT_HTML.write_text(
    HTML.replace("__STOCKS_JSON__", stocks_json)
    .replace("__PLATES_JSON__", PLATES_JSON)
    .replace("__RIDGE_URI__", RIDGE_URI),
    encoding="utf-8",
)
print(f"Wrote {OUT_HTML} ({OUT_HTML.stat().st_size} bytes)")
