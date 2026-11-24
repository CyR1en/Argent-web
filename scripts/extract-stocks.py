#!/usr/bin/env python3
"""Extract all 14 Argent stock profiles & Status M curves into src/data/stocks.ts."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ARGENT_DIR = Path(
    os.environ.get("ARGENT_DIR", str(REPO_ROOT.parent / "Argent"))
)
OUT_FILE = REPO_ROOT / "src" / "data" / "stocks.ts"

ORDER = [
    ("kodak-portra-160", "portra160.json"),
    ("kodak-portra-160-natural", "portra160natural.json"),
    ("kodak-portra-400", "portra400.json"),
    ("kodak-portra-800", "portra800.json"),
    ("kodak-ektar-100", "ektar100.json"),
    ("kodak-gold-200", "gold200.json"),
    ("kodak-colorplus-200", "colorplus200.json"),
    ("kodak-ultramax-400", "ultramax400.json"),
    ("fujifilm-pro-400h", "pro400h.json"),
    ("fujifilm-c200", "c200.json"),
    ("fujifilm-superia-400", "superia400.json"),
    ("kodak-vision3-500t", "vision3500t.json"),
    ("kodak-vision3-500t-cinema", "vision3500t.json"),
    ("cinestill-800t", "cinestill800t.json"),
]

META = {
    "kodak-portra-160": {
        "family": "Portra",
        "edgeCode": "KODAK PORTRA 160 · 11A",
        "summary": "Fine-grain portrait negative from datasheet E-4051 printed through the US5300381 FIG. 2 lab tone stage onto ENDURA Premier.",
        "grade": {
            "filter": "contrast(1.03) saturate(0.95) sepia(0.06) brightness(1.02)",
            "warmWash": "rgba(232, 198, 165, 0.06)",
            "shadowTint": "rgba(28, 34, 42, 0.05)",
            "grainOpacity": 0.08,
            "halationStrength": 0.08,
            "accentHex": "#D99F6B",
        },
    },
    "kodak-portra-160-natural": {
        "family": "Portra",
        "edgeCode": "PORTRA NATURAL · 12A",
        "summary": "A chosen rendering using Portra 160 curves with interlayer couplers reduced to 60% for gentler skin colour, rather than a measured film.",
        "grade": {
            "filter": "contrast(1.01) saturate(0.88) sepia(0.04) brightness(1.03)",
            "warmWash": "rgba(235, 206, 178, 0.05)",
            "shadowTint": "rgba(32, 34, 38, 0.04)",
            "grainOpacity": 0.08,
            "halationStrength": 0.07,
            "accentHex": "#CFA47D",
        },
    },
    "kodak-portra-400": {
        "family": "Portra",
        "edgeCode": "KODAK PORTRA 400 · 14A",
        "summary": "Versatile ISO 400 colour negative digitized from E-4050, balanced through US5300381 FIG. 2 lab tone onto ENDURA Premier.",
        "grade": {
            "filter": "contrast(1.06) saturate(1.02) sepia(0.08) brightness(1.01)",
            "warmWash": "rgba(234, 188, 140, 0.07)",
            "shadowTint": "rgba(25, 32, 42, 0.07)",
            "grainOpacity": 0.11,
            "halationStrength": 0.10,
            "accentHex": "#E3A25A",
        },
    },
    "kodak-portra-800": {
        "family": "Portra",
        "edgeCode": "KODAK PORTRA 800 · 18A",
        "summary": "High-speed EI 800 portrait curve from datasheet E-4040 with richer saturation, stepped PGI grain, and gentle highlight compression.",
        "grade": {
            "filter": "contrast(1.10) saturate(1.10) sepia(0.09) brightness(0.99)",
            "warmWash": "rgba(230, 175, 118, 0.09)",
            "shadowTint": "rgba(20, 28, 42, 0.10)",
            "grainOpacity": 0.16,
            "halationStrength": 0.14,
            "accentHex": "#DF8F48",
        },
    },
    "kodak-ektar-100": {
        "family": "Kodak Daylight",
        "edgeCode": "KODAK EKTAR 100 · 04A",
        "summary": "Optical print directly from E-4046 onto ENDURA Premier with high micro-contrast, deep reds, and crisp daylight saturation.",
        "grade": {
            "filter": "contrast(1.16) saturate(1.24) sepia(0.05) brightness(0.98)",
            "warmWash": "rgba(220, 145, 95, 0.06)",
            "shadowTint": "rgba(18, 28, 48, 0.12)",
            "grainOpacity": 0.06,
            "halationStrength": 0.06,
            "accentHex": "#C85A32",
        },
    },
    "kodak-gold-200": {
        "family": "Kodak Daylight",
        "edgeCode": "KODAK GOLD 200 · 09A",
        "summary": "Consumer daylight emulsion from E-7022 printed optically on ENDURA Premier with signature golden midtones and warm sunlit skin.",
        "grade": {
            "filter": "contrast(1.08) saturate(1.10) sepia(0.15) brightness(1.01)",
            "warmWash": "rgba(240, 185, 92, 0.11)",
            "shadowTint": "rgba(38, 28, 22, 0.07)",
            "grainOpacity": 0.12,
            "halationStrength": 0.10,
            "accentHex": "#DF9F42",
        },
    },
    "kodak-colorplus-200": {
        "family": "Kodak Daylight",
        "edgeCode": "COLORPLUS 200 · 07A",
        "summary": "Approximation using Gold 200 curves as a proxy with 80% interlayer coupling as a qualitative saturation adjustment.",
        "grade": {
            "filter": "contrast(1.07) saturate(1.04) sepia(0.18) brightness(1.00)",
            "warmWash": "rgba(232, 178, 100, 0.12)",
            "shadowTint": "rgba(42, 32, 20, 0.08)",
            "grainOpacity": 0.13,
            "halationStrength": 0.10,
            "accentHex": "#D4974C",
        },
    },
    "kodak-ultramax-400": {
        "family": "Kodak Daylight",
        "edgeCode": "ULTRAMAX 400 · 22A",
        "summary": "Punchy ISO 400 amateur emulsion from E-7023 printed optically onto ENDURA Premier with brisk blue response and brisk shadow contrast.",
        "grade": {
            "filter": "contrast(1.14) saturate(1.14) sepia(0.08) brightness(0.99)",
            "warmWash": "rgba(225, 168, 110, 0.07)",
            "shadowTint": "rgba(22, 36, 56, 0.10)",
            "grainOpacity": 0.15,
            "halationStrength": 0.11,
            "accentHex": "#C87A3E",
        },
    },
    "fujifilm-pro-400h": {
        "family": "Fujifilm",
        "edgeCode": "FUJI PRO 400H · 16A",
        "summary": "Three-layer portrait emulsion from AF3-176E with airy pastel highlight roll-off and cool cyan-emerald shadow transparency.",
        "grade": {
            "filter": "contrast(1.02) saturate(0.94) hue-rotate(-4deg) brightness(1.04)",
            "warmWash": "rgba(205, 224, 212, 0.07)",
            "shadowTint": "rgba(22, 46, 48, 0.09)",
            "grainOpacity": 0.09,
            "halationStrength": 0.05,
            "accentHex": "#6E9E8C",
        },
    },
    "fujifilm-c200": {
        "family": "Fujifilm",
        "edgeCode": "FUJICOLOR C200 · 10A",
        "summary": "Daylight ISO 200 datasheet curves from AF3-0249E balancing crisp greens and cool daylight skies on ENDURA Premier.",
        "grade": {
            "filter": "contrast(1.09) saturate(1.05) hue-rotate(-3deg) brightness(1.01)",
            "warmWash": "rgba(218, 226, 200, 0.06)",
            "shadowTint": "rgba(20, 44, 38, 0.09)",
            "grainOpacity": 0.11,
            "halationStrength": 0.05,
            "accentHex": "#5F9872",
        },
    },
    "fujifilm-superia-400": {
        "family": "Fujifilm",
        "edgeCode": "SUPERIA X-TRA 400 · 19A",
        "summary": "Consumer 400-speed emulsion from AF3-0217E delivering snappy foliage greens, lively magenta midtones, and cool shadow bite.",
        "grade": {
            "filter": "contrast(1.13) saturate(1.12) hue-rotate(-5deg) brightness(1.00)",
            "warmWash": "rgba(212, 222, 205, 0.06)",
            "shadowTint": "rgba(24, 48, 42, 0.11)",
            "grainOpacity": 0.14,
            "halationStrength": 0.06,
            "accentHex": "#4E8D6E",
        },
    },
    "kodak-vision3-500t": {
        "family": "Tungsten & Cinema",
        "edgeCode": "VISION3 500T · 5219",
        "summary": "Motion picture 3200 K ECN-2 curves and spectra from H-1-5219 (AHU version), with 1% anti-halation undercoat and neutral tungsten balance.",
        "grade": {
            "filter": "contrast(1.08) saturate(0.96) hue-rotate(-8deg) brightness(0.98)",
            "warmWash": "rgba(182, 202, 224, 0.09)",
            "shadowTint": "rgba(14, 28, 46, 0.14)",
            "grainOpacity": 0.12,
            "halationStrength": 0.08,
            "accentHex": "#6289B2",
        },
    },
    "kodak-vision3-500t-cinema": {
        "family": "Tungsten & Cinema",
        "edgeCode": "CINEMA 500 · 2383",
        "summary": "Bundled print variant of VISION3 500T modelling projection through Kodak VISION Color Print Film 2383 for deep theatrical shadows.",
        "grade": {
            "filter": "contrast(1.22) saturate(1.08) hue-rotate(-7deg) brightness(0.95)",
            "warmWash": "rgba(186, 204, 218, 0.06)",
            "shadowTint": "rgba(8, 22, 34, 0.22)",
            "grainOpacity": 0.13,
            "halationStrength": 0.12,
            "accentHex": "#4C7E9E",
        },
    },
    "cinestill-800t": {
        "family": "Tungsten & Cinema",
        "edgeCode": "TUNGSTEN 800 · CS41",
        "summary": "Approximation pairing CineStill 3200 K Cs41 curves with VISION3 500T proxy spectra and remjet-free 14% / 270 µm red halation.",
        "grade": {
            "filter": "contrast(1.15) saturate(1.06) hue-rotate(-10deg) brightness(0.97)",
            "warmWash": "rgba(176, 198, 232, 0.08)",
            "shadowTint": "rgba(12, 26, 48, 0.16)",
            "grainOpacity": 0.15,
            "halationStrength": 0.65,
            "accentHex": "#D94A38",
        },
    },
}


def sample_indices(n: int, target: int = 36) -> list[int]:
    if n <= target:
        return list(range(n))
    return sorted({round(i * (n - 1) / (target - 1)) for i in range(target)})


def format_pub(raw_source: object, stock_id: str) -> str:
    if stock_id == "kodak-colorplus-200":
        return "Gold 200 proxy (E-7022 · 2023-06)"
    if stock_id == "kodak-portra-160-natural":
        return "E-4051 · 60% couplers"
    if stock_id == "cinestill-800t":
        return "Cs41 2024-04 · 500T proxy"
    if isinstance(raw_source, dict):
        pub = raw_source.get("publication") or ""
        ed = raw_source.get("edition") or ""
        if pub and ed:
            return f"{pub} · {ed}"
        return pub or ed or "Published datasheet"
    return "Published datasheet"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--argent-dir",
        type=Path,
        default=DEFAULT_ARGENT_DIR,
        help="Path to a local checkout of the Argent repository",
    )
    args = parser.parse_args()
    argent_stocks = args.argent_dir / "bake" / "stocks"

    stocks = []
    for stock_id, filename in ORDER:
        raw = json.loads((argent_stocks / filename).read_text(encoding="utf-8"))
        meta = META[stock_id]
        cc = raw["characteristicCurves"]
        log_h = cc["logExposure"]
        r = cc["red"]
        g = cc["green"]
        b = cc["blue"]
        idxs = sample_indices(len(log_h), 36)

        curves = {
            "logH": [round(float(log_h[i]), 3) for i in idxs],
            "r": [round(float(r[i]), 4) for i in idxs],
            "g": [round(float(g[i]), 4) for i in idxs],
            "b": [round(float(b[i]), 4) for i in idxs],
        }

        is_cinema = stock_id == "kodak-vision3-500t-cinema"
        display_name = "Cinema 500" if is_cinema else raw["displayName"]
        modelled_film = (
            "Kodak VISION3 500T + 2383"
            if is_cinema
            else raw.get("modelledFilm", display_name)
        )
        paper = "Kodak VISION 2383" if is_cinema else "Kodak ENDURA Premier"
        print_stage = (
            "VISION 2383 projection"
            if is_cinema
            else ("US5300381 FIG. 2" if "portra" in stock_id else "Optical print")
        )

        hal = raw.get("halation")
        grain = raw.get("grain")

        stocks.append(
            {
                "id": stock_id,
                "displayName": display_name,
                "modelledFilm": modelled_film,
                "family": meta["family"],
                "edgeCode": meta["edgeCode"],
                "boxSpeed": int(raw["boxSpeed"]),
                "status": "approximation" if raw.get("status") == "approximation" else "datasheet",
                "publication": format_pub(raw.get("source"), stock_id),
                "paper": paper,
                "printStage": print_stage,
                "halation": (
                    {
                        "strength": float(hal["strength"]),
                        "radiusMicrometres": int(hal["radiusMicrometres"]),
                        "greenShare": float(hal["greenShare"]),
                    }
                    if isinstance(hal, dict)
                    else None
                ),
                "grain": (
                    {
                        "printGrainIndex": grain.get("printGrainIndex"),
                        "relativeSigma": round(float(grain["relativeSigma"]), 3)
                        if grain.get("relativeSigma") is not None
                        else None,
                    }
                    if isinstance(grain, dict)
                    else None
                ),
                "summary": meta["summary"],
                "curves": curves,
                "grade": meta["grade"],
            }
        )

    ts_header = """// Generated by scripts/extract-stocks.py from Argent/bake/stocks/*.json
// Every Status M characteristic curve and datasheet provenance figure matches Argent's bake profiles.

export type StockFamily = "Portra" | "Kodak Daylight" | "Fujifilm" | "Tungsten & Cinema";

export interface StockCurves {
  logH: number[];
  r: number[];
  g: number[];
  b: number[];
}

export interface StockGrade {
  filter: string;
  warmWash: string;
  shadowTint: string;
  grainOpacity: number;
  halationStrength: number;
  accentHex: string;
}

export interface StockProfile {
  id: string;
  displayName: string;
  modelledFilm: string;
  family: StockFamily;
  edgeCode: string;
  boxSpeed: number;
  status: "datasheet" | "approximation";
  publication: string;
  paper: string;
  printStage: string;
  halation: {
    strength: number;
    radiusMicrometres: number;
    greenShare: number;
  } | null;
  grain: {
    printGrainIndex: [number | null, number | null, number | null] | null;
    relativeSigma: number | null;
  } | null;
  summary: string;
  curves: StockCurves;
  grade: StockGrade;
}

export const STOCK_FAMILIES: StockFamily[] = [
  "Portra",
  "Kodak Daylight",
  "Fujifilm",
  "Tungsten & Cinema",
];

export const STOCKS: StockProfile[] = """

    OUT_FILE.write_text(
        ts_header + json.dumps(stocks, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(stocks)} stocks to {OUT_FILE}")


if __name__ == "__main__":
    main()
