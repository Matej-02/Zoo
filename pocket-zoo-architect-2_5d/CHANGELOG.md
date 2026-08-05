# Changelog

## 7.0 — Rotatable 2.5D edition

- Replaced the flat top-down renderer with a true diamond-grid 2.5D projection.
- Added four camera directions, Q/E shortcuts, compass feedback, focus-preserving rotation, and camera save persistence.
- Added accurate inverse projection so construction and inspection work from every direction.
- Added depth sorting for fences, foliage, buildings, animals, visitors, employees, and litter.
- Rebuilt terrain rendering with path textures, animated water, shadows, elevated plinths, connected vertical barriers, and projected locked parcels.
- Enlarged and shaded animal and foliage artwork and removed emoji fallback data.
- Increased starting cash slightly to keep the more detailed early build accessible.
- Expanded automated regression coverage from 22 to 27 checks.
- Added a complete historical feature audit.

## 6.0 — Architect modular edition

- Split the former single-file game into data, core, systems, rendering, UI, styles, and tests.
- Added catalog validation and a public diagnostic API.
- Added robust legacy-save migration and JSON save import.
- Improved projected monthly finance reporting.
- Improved early-game balance and litter control.
- Added path replacement and broader gate conversion behavior.
- Preserved and regression-tested all major Evolution and Horizons features.
