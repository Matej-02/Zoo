# Pocket Zoo Horizons — Modular Edition

A dependency-free browser zoo-management game prepared for GitHub Pages.

## Project structure

- `index.html` — interface and dialogs
- `styles/main.css` — all styling and responsive layout
- `js/config.js` — map, calendar and save configuration
- `js/data.js` — animals, foliage, terrain, paths, fences, facilities and economy data
- `js/game.js` — simulation, rendering, controls, saves and UI behavior
- `tests/smoke-test.js` — automated browser regression checks

## Publish on GitHub Pages

Upload the complete folder contents to the repository root. Keep the folder names unchanged. Configure Pages to deploy from `main` and `/(root)`.

## Important

Opening `index.html` directly also works because the project uses ordinary ordered scripts rather than JavaScript modules. Existing Horizons/Evolution/Ultimate/Deluxe saves are migrated by the game.

## Regression check

With Node.js installed, run:

```bash
node tests/regression-check.js
```

The check covers map size, expansions, animals, foliage biomes, path types, aquatic terrain, specialist fences, education attractions, monthly salaries and finance, staff controls, path removal, gate replacement, foliage restrictions, live inspection, permanent tools, collapsible panels, staff counters, reset behavior, artwork functions, hover help and script ordering.
