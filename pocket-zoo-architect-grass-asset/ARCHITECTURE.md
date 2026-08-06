# Architecture

Pocket Zoo Architect uses plain HTML, CSS, and JavaScript. It has no runtime dependency, bundler, or build step.

## Loading order

`index.html` loads scripts with `defer` in a deliberate dependency order:

1. Core configuration and constants
2. World and catalog data
3. Validation and state creation
4. Shared helpers and curated events
5. Simulation systems
6. SVG catalog art and 2.5D camera projection
7. Context-panel interfaces
8. Canvas renderer and input conversion
9. Save handling, event bindings, and startup

## Directories

### `src/core/`

- `config.js` — dimensions, 2.5D geometry, save keys, DOM helpers
- `state.js` — version-8 state, calendar, finance, animal waste, event feed, camera, and active panel
- `helpers.js` — shared calculations, technical log, curated zoo-event rate limiting
- `save.js` — save/load, migration, reset, JSON import/export
- `validation.js` — catalog-reference checks

### `src/data/`

World terrain, paths, barriers, foliage, habitat equipment, facilities, education, species, construction tools, salaries, costs, and expansions.

### `src/systems/`

- `navigation.js` — accessible paths and routing
- `habitats.js` — enclosure detection, barriers, foliage, enrichment, cleanliness, and welfare
- `building.js` — placement, replacement, bulldozing, refunds, and animal purchasing
- `animals.js` — movement, hunger, hygiene, grooming, health, illness, waste, aging, and births
- `visitors.js` — arrivals, movement, spending, satisfaction, and public litter
- `staff.js` — hiring, dismissal, salaries, task priorities, animal care, cleaning, and tours
- `finance.js` — day progression, monthly closing, annual summaries, and condition events
- `metrics.js` — reputation, cleanliness, education, satisfaction, and animal happiness
- `objectives.js` — progression and rewards

### `src/render/`

- `catalog-art.js` — SVG construction-menu art
- `camera.js` — four-direction projection and inverse coordinate conversion
- `canvas.js` — terrain, barriers, buildings, foliage, animals, care indicators, animal waste, visitors, staff, and depth sorting

### `src/ui/`

- `panels.js` — icon rail, one-panel routing, News panel, and Zoo pulse
- `construction.js` — catalog and selected-tool details
- `management.js` — overview and staff counters
- `inspector.js` — live Inspect-only information
- `finance.js` — monthly finance graph and breakdowns
- `land.js` — expansions
- `events.js` — UI bindings, camera controls, keyboard shortcuts, saving, and settings

## 2.5D coordinate model

Simulation remains in ordinary grid coordinates. `worldToScreen()` projects positions onto the diamond world. `screenToWorld()` reverses the projection so construction, inspection, and bulldozing remain accurate after rotation. Camera direction changes projection only; saved tiles are never rewritten.

## Care model

Animal care is processed once per game day. Continuous movement and keeper work run every frame. Keeper task selection uses welfare priorities so illness and critical care are not blocked by routine cleaning. Curated events are deduplicated and normally capped at three per day; high-priority events may replace a routine item.

## Stability rules

- Keep save migrations backward compatible and never reuse retired IDs.
- Keep simulation logic out of rendering and catalog data out of UI handlers.
- Keep camera rotation out of simulation coordinates.
- Add new visual items to both catalog SVG art and Canvas map art.
- Run `node --check`, `tests/regression.py`, and `tests/visual_scenario.py` after significant changes.
