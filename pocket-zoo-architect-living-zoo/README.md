# Pocket Zoo Architect — Living Zoo Edition

A modular, dependency-free 2.5D browser zoo-management game for GitHub Pages. This edition adds a compact icon-rail interface, deeper animal care, keeper workloads, animal happiness, and a curated zoo-news feed while preserving the complete Architect feature set.

## Deploy on GitHub Pages

Upload the project **with the folder structure intact**. Uploading only `index.html` will not work.

1. Extract the ZIP.
2. Replace the contents of your repository with everything inside the project folder.
3. Confirm that `index.html`, `src/`, `styles/`, and `tests/` are in the repository root.
4. Commit and push.
5. Keep GitHub Pages set to `main` and `/(root)`.
6. After deployment, refresh with `Ctrl + F5`.

Existing Pocket Zoo saves are migrated automatically when possible. Export a JSON save before major updates as an additional backup.

## Main controls

- Use the **left icon rail** to open one feature panel at a time.
- Close the current panel with **×** for a larger map view.
- **Inspect** and **Bulldoze** are permanent one-click tools on the rail.
- Rotate the camera with the visible left/right rotation buttons or **Q / E**.
- Zoom with **+ / −** or the mouse wheel.
- Use **Entrance** to return to the zoo entrance.

Map hover information has been removed. Select **Inspect**, then click an animal, habitat, building, employee, guest, tile, or land parcel for live details.

## Living zoo systems

- Animals eat, move, create habitat waste, lose hygiene, need grooming, may become ill, recover after treatment, age, and can occasionally have babies.
- Keepers visibly prioritise illness treatment, habitat cleaning, animal washing, grooming, and feeding.
- Animal happiness is a zoo-wide condition that affects reputation and is shown in the header and overview.
- The compact **Zoo pulse** displays recent meaningful events. The complete news panel is limited to a few events per game day, with urgent animal events taking priority.
- Events include illness, recovery, births, high animal happiness, guest cleanliness praise, objective completion, expansion purchases, employees, and annual financial results.

## Existing major systems

- Rotatable four-direction 2.5D world with accurate building and inspection after rotation
- Monthly accounting, salaries, upkeep, graphs, forecasts, admission pricing, and annual summaries
- Visible keepers, janitors, guides, guests, animals, litter, and habitat waste
- 21 animal species, including aquatic animals, primates, large mammals, birds, and farm animals
- Multiple land, snow, freshwater, and saltwater terrain types
- Six replaceable and removable path types
- Species-specific fence strength, height, and waterproofing
- 30 biome-specific foliage choices with terrain restrictions
- Habitat shelters, feeders, water, and varied enrichment
- Shops, guest facilities, rides, insect house, butterfly garden, aviary, aquarium, reptile house, bird theatre, education centre, and conservation laboratory
- Five purchasable land expansions
- Objectives, star unlocks, guided tours, browser autosave, save import/export, and legacy migration
- Custom SVG and Canvas artwork with no emoji fallback assets

## Local play

Run a static server from the project folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Documentation

- [`FEATURE_AUDIT.md`](FEATURE_AUDIT.md) — comparison with all requests from the conversation
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — source structure and extension guidelines
- [`QA_REPORT.md`](QA_REPORT.md) — automated and visual verification
- [`CHANGELOG.md`](CHANGELOG.md) — release changes
