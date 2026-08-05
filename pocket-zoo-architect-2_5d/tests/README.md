# Regression and visual checks

Run the automated browser suite from the project root:

```bash
python tests/regression.py
```

The suite launches headless Chromium, loads every production source file, and verifies **27 core behaviors**, including:

- catalog integrity and content counts;
- all four 2.5D camera directions and coordinate conversion;
- construction targeting after camera rotation;
- save migration and camera persistence;
- paths, fences, gates, terrain-aware foliage, habitats, and aquatic content;
- staff counters, salaries, dismissal, tours, litter control, and expansions;
- monthly finance rollover, forecasts, live inspection, collapsible panels, artwork, hover help, and New Zoo reset.

Generate the populated visual-QA scene and four-direction camera comparison with:

```bash
python tests/visual_scenario.py
```

Generated evidence:

- `regression-screenshot.png` — interface state captured by the automated suite;
- `world-2_5d-screenshot.png` — populated 2.5D zoo used for detailed visual inspection;
- `camera-directions.png` — the same zoo viewed from all four directions.

The tests do not alter game source files or the player's real browser save.
