# Argent — Web Experience

Marketing & optical showcase website for [Argent](https://github.com/CyR1en/Argent) (*Raw files, developed as film.*), built as a standalone Next.js App Router repository ready for Vercel deployment.

## Stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Visual System:** Authentic macOS 27 darkroom carbon palette (`#141518` / `#1D1E21` / `#222326`) with translucent **Liquid Glass** panels, floating filmstrip dock, and Kodachrome golden-amber (`#F1C24C` / `#E5BA54`) accents
- **Typography:** Self-hosted `Hanken Grotesk` variable font (`SIL OFL 1.1`) for headlines and UI copy, paired with `Fragment Mono` (`tabular-nums`) for EV readouts, film edge-prints, and Status M sensitometry data
- **Motion & Shaders:** WebGL2 Bayer-8 `LatentBackdrop` ported directly from Argent's Swift/Metal `OpenRollBackdropShader`, smooth Lenis scrolling, scroll-driven optical pipeline bench, and `prefers-reduced-motion` accessibility

## Local Development

```sh
pnpm install
pnpm dev
```

To regenerate [`src/data/stocks.ts`](src/data/stocks.ts) from a sibling checkout of the Argent repository:

```sh
python3 scripts/extract-stocks.py --argent-dir ../Argent
```

## Deploy to Vercel

- One-click import: [Deploy to Vercel](https://vercel.com/new/import?s=https://github.com/CyR1en/Argent-web)
- Or push/import [`CyR1en/Argent-web`](https://github.com/CyR1en/Argent-web) in the Vercel dashboard (Framework Preset: **Next.js**).
- [`vercel.json`](vercel.json) configures immutable cache headers for `/fonts/*` and `/images/*`. No environment variables are required.

## Licence & Notices

- Licensed under the [Apache License 2.0](LICENSE).
- **Hanken Grotesk** (`public/fonts/HankenGrotesk-Variable.ttf`, `src/app/fonts/HankenGrotesk-Variable.ttf`) is licensed under the SIL Open Font License 1.1 ([`public/fonts/HankenGrotesk-OFL.txt`](public/fonts/HankenGrotesk-OFL.txt)).
- **Built with DINOv3.** Kodak, Portra, Ektar, Gold, ColorPlus, UltraMax and Vision3 are trademarks of Eastman Kodak Company. Fujifilm, Fujicolor, Pro 400H, C200 and Superia are trademarks of FUJIFILM Corporation. CineStill is a trademark of CineStill Film. Sony and a7 IV are trademarks of Sony Group Corporation. Argent is not affiliated with or endorsed by any of them.
