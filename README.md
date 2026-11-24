# Argent — Web Experience

Marketing & optical showcase website for [Argent](https://github.com/CyR1en/Argent) (*Raw files, developed as film.*), built as a standalone Next.js App Router repository ready for Vercel deployment.

## Stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Visual System:** Authentic macOS 27 darkroom carbon palette (`#141518` / `#1D1E21` / `#222326`) with translucent **Liquid Glass** panels, floating filmstrip dock, and Kodachrome golden-amber (`#F1C24C` / `#E5BA54`) accents
- **Typography:** Self-hosted `Hanken Grotesk` variable font (`SIL OFL 1.1`) for headlines and UI copy, paired with `Fragment Mono` (`tabular-nums`) for EV readouts, film edge-prints, and Status M sensitometry data
- **Backdrop:** one fixed, full-viewport WebGL2 canvas ([`LatentBackdrop`](src/components/LatentBackdrop.tsx)) ported from Argent's Swift/Metal `OpenRollBackdropShader`. It renders one texel per 2 px cell and scales up unsmoothed, as the app does. Sections steer it with `data-backdrop` (strength), `data-backdrop-calm` (a column of words to keep clear), and `data-backdrop-glow` (the warm pool at the close).
- **Scroll:** Lenis smooths wheel scroll and in-page links. Every scroll-linked effect subscribes to one read-then-write frame bus ([`src/lib/scroll.ts`](src/lib/scroll.ts)) and writes CSS custom properties, so scrolling never re-renders React. The optical chain pins one photograph and develops it across four stages; under `prefers-reduced-motion`, or in a viewport shorter than 560 px, it shows the finished print beside all four steps instead.
- **Downloads:** the download buttons link straight to the newest stable disk image, which [`src/lib/release.ts`](src/lib/release.ts) reads from Argent's Sparkle appcast and refreshes hourly. If the feed cannot be read they open the latest release's page instead. The nightly link is a fixed URL.
- **Photographs:** [`Print`](src/components/Print.tsx) composes each frame from a CSS grade, washes, grain, and halation derived from the photograph's own highlights by an SVG filter. They are stand-ins for the look, not Argent renders.

## Local Development

```sh
pnpm install
pnpm dev
```

To regenerate [`src/data/stocks.ts`](src/data/stocks.ts) from a sibling checkout of the Argent repository:

```sh
python3 scripts/extract-stocks.py --argent-dir ../Argent
```

The social preview, [`src/app/opengraph-image.jpg`](src/app/opengraph-image.jpg), is a still of [`scripts/og-image.html`](scripts/og-image.html), which draws a specimen photograph and the glass over it in one WebGL2 pass. To render it again after changing that page (Node 22 or newer and a Chromium-family browser; set `CHROME_BIN` if none is found):

```sh
node scripts/render-og.mjs
```

## Deploy to Vercel

- One-click import: [Deploy to Vercel](https://vercel.com/new/import?s=https://github.com/CyR1en/Argent-web)
- Or push/import [`CyR1en/Argent-web`](https://github.com/CyR1en/Argent-web) in the Vercel dashboard (Framework Preset: **Next.js**).
- [`vercel.json`](vercel.json) configures immutable cache headers for `/fonts/*` and `/images/*`. No environment variables are required.

## Licence & Notices

- Licensed under the [Apache License 2.0](LICENSE).
- **Hanken Grotesk** (`public/fonts/HankenGrotesk-Variable.ttf`, `src/app/fonts/HankenGrotesk-Variable.ttf`) is licensed under the SIL Open Font License 1.1 ([`public/fonts/HankenGrotesk-OFL.txt`](public/fonts/HankenGrotesk-OFL.txt)).
- **Built with DINOv3.** Kodak, Portra, Ektar, Gold, ColorPlus, UltraMax and Vision3 are trademarks of Eastman Kodak Company. Fujifilm, Fujicolor, Pro 400H, C200 and Superia are trademarks of FUJIFILM Corporation. CineStill is a trademark of CineStill Film. Sony is a trademark of Sony Group Corporation. Argent is not affiliated with or endorsed by any of them.
