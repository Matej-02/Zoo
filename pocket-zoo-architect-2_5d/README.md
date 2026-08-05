# Pocket Zoo Architect — Rotatable 2.5D Edition

A modular, dependency-free browser zoo-management game designed for static hosting on GitHub Pages.

## Play and deploy

Upload the project **with its folder structure intact**. Uploading only `index.html` will not work because the game loads separate files from `src/` and `styles/`.

1. Extract the project ZIP.
2. Replace the contents of your GitHub repository with everything inside the project folder.
3. Confirm that `index.html`, `src/`, and `styles/` are in the repository root.
4. Commit and push the changes.
5. In **Settings → Pages**, deploy from `main` and `/(root)`.
6. After deployment, refresh the game with `Ctrl + F5`.

Existing Architect, Evolution, Ultimate, Deluxe, and original prototype saves are migrated automatically when possible.

## Camera controls

- **Rotate left:** Q or the left rotation button
- **Rotate right:** E or the right rotation button
- **Zoom:** + and − controls
- **Return to entrance:** Entrance button

The camera uses four genuine grid projections. Construction, hover information, inspection, and bulldozing continue to target the correct tile after rotation.

## Local play

For reliable local testing, run a static server from the project folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Included systems

- Rotatable 2.5D/isometric-style world with depth-sorted vector artwork
- Monthly accounting with day, month, and year calendar
- Income/expense graphs, category breakdowns, forecasts, and historical months
- Visible keepers, janitors, and tour guides with salaries and dismissal controls
- Staff counters, activity states, keeper feeding, janitor cleaning, and guided tours
- 21 animal species, including aquatic animals and primates
- Multiple terrain and water types
- Six path styles that can be replaced or bulldozed
- Species-specific fence strength, height, waterproofing, and gate requirements
- 30 biome-specific foliage choices with logical terrain restrictions
- Habitat enrichment, shelters, feeders, and specialist requirements
- Shops, guest services, rides, education buildings, aviaries, aquarium, insect and butterfly attractions
- Large world with five purchasable expansion parcels
- Live inspector, collapsible management panels, objectives, log, and hover help
- Browser autosave plus JSON save import/export
- Custom SVG and Canvas artwork with no emoji fallback assets

## Documentation

- [`FEATURE_AUDIT.md`](FEATURE_AUDIT.md): comparison against all requests in the conversation
- [`ARCHITECTURE.md`](ARCHITECTURE.md): module responsibilities and safe extension guidelines
- [`QA_REPORT.md`](QA_REPORT.md): automated and visual test results
- [`CHANGELOG.md`](CHANGELOG.md): release history

## Save safety

The game saves automatically in browser storage. Use **Export save** before major repository updates or browser cleanup. Use **Import save** to restore the downloaded JSON file.
