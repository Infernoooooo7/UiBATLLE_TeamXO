# Pixel Arena — game storefront (Team XO)

A storefront concept for PC, PlayStation and Xbox games. Built with React + Vite and plain CSS. There's no backend: everything runs client-side.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Structure

- `src/data/games.js`: 36 games, generated from Steam store data (artwork, prices, reviews, trailer URLs) plus our own copy, platforms and genres.
- `src/data/catalog.js`: filtering, search, sorting and formatting helpers. Desktop and mobile both use these.
- `src/styles/tokens.css`: colors, fonts, spacing and radii. **Shared, so please change it carefully.**
- `src/styles/base.css`: the reset and the shared `.btn` and `.eyebrow` primitives.
- `src/components/*`: one component per file, each next to its own CSS file. Responsive tweaks live at the bottom of each CSS file.
- `public/games/<id>/`: local WebP artwork (`cover`, `hero`, `capsule`, `shot-1…4`).

Trailers stream from Steam's video CDN. When one can't load, the player says so and links to the Steam page.

The library is saved in `localStorage` under the key `backlog.library.v1`.

## Mobile work

Put mobile-only components and styles in their own files (for example `*.mobile.css`) instead of editing the desktop rules. All views share one data layer (`catalog.js`) and one library hook (`hooks/useLibrary.js`), so search, filter and library behavior stay the same at every width.
