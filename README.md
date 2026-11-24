# Argent — Web Experience

Marketing & optical showcase website for [Argent](https://github.com/CyR1en/Argent) (*Raw files, developed as film.*), built as a standalone Next.js App Router repository ready for Vercel deployment.

## Stack

- **Framework:** Next.js App Router (`next`, React 19, TypeScript)
- **Styling:** Tailwind CSS v4 + dynamic scroll-driven polarity CSS tokens (Darkroom Obsidian `#0C0D10` → Archival Baryta Paper `#EEEAE2`)
- **Typography:** Bodoni Moda (editorial Didone display), Hanken Grotesk (bundled variable UI sans under SIL OFL 1.1), and Fragment Mono (tabular sensitometry & technical figures)
- **Motion & Shaders:** WebGL2 Bayer-8 `LatentBackdrop` ported directly from Argent's Swift/Metal `OpenRollBackdropShader`, smooth Lenis scrolling, and `prefers-reduced-motion` accessibility

## Local Development

```sh
pnpm install
pnpm dev
```

To regenerate [`src/data/stocks.ts`](src/data/stocks.ts) from a local checkout of `/home/ubuntu/Argent/bake/stocks`:

```sh
python3 scripts/extract-stocks.py
```

## Deploy to Vercel

1. Push this repository to its own GitHub repository.
2. Import the repository into Vercel (Framework Preset: **Next.js**).
3. `vercel.json` configures long-lived immutable cache headers for `/fonts/*` and `/images/*`. No environment variables are required.

## Attributions & Notices

- **Hanken Grotesk** (`public/fonts/HankenGrotesk-Variable.ttf`, `src/app/fonts/HankenGrotesk-Variable.ttf`) is licensed under the SIL Open Font License 1.1 (`public/fonts/HankenGrotesk-OFL.txt`).
- **Built with DINOv3.** Kodak, Portra, Ektar, Gold, ColorPlus, UltraMax and Vision3 are trademarks of Eastman Kodak Company. Fujifilm, Fujicolor, Pro 400H, C200 and Superia are trademarks of FUJIFILM Corporation. CineStill is a trademark of CineStill Film. Sony and a7 IV are trademarks of Sony Group Corporation. Argent is not affiliated with or endorsed by any of them.
