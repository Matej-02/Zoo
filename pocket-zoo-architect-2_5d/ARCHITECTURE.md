# Architecture

Pocket Zoo Architect uses plain HTML, CSS, and JavaScript. It has no runtime dependencies and needs no build process.

## Loading order

`index.html` loads scripts with `defer`. The order is intentional:

1. Core configuration and constants
2. World and catalog data
3. Catalog validation and state creation
4. Shared helpers
5. Simulation systems
6. Catalog artwork and 2.5D camera projection
7. Construction, finance, inspector, land, and management interfaces
8. 2.5D canvas renderer and input conversion
9. Save handling, event bindings, and startup

Do not reorder scripts unless their dependencies are also reviewed.

## Directories

### `src/core/`

- `config.js`: dimensions, 2.5D tile geometry, canvas size, save keys, DOM references, and formatting utilities
- `state.js`: initial state, camera state, and monthly ledger structures
- `helpers.js`: shared calculations and utility functions
- `save.js`: save/load, migration, reset, import, export, and camera persistence
- `validation.js`: cross-checks catalog references before startup

### `src/data/`

- `world.js`: terrain, paths, fences, map parcels, and expansion data
- `foliage.js`: biome-tagged plant catalog and terrain compatibility
- `objects.js`: habitat objects, shops, services, and educational attractions
- `species.js`: animal welfare, terrain, foliage, enrichment, social, and security requirements
- `catalog.js`: unified construction-tool catalog

### `src/systems/`

- `navigation.js`: paths, access, and movement routing
- `habitats.js`: enclosure detection, security, terrain, and welfare evaluation
- `building.js`: placement, replacement, bulldozing, refunds, and purchasing
- `animals.js`: movement and animal needs
- `visitors.js`: arrivals, movement, purchases, satisfaction, and litter
- `staff.js`: hiring, dismissal, salaries, tasks, cleaning, feeding, and tours
- `finance.js`: daily passage, monthly closing, payroll, upkeep, and ledger history
- `metrics.js`: zoo-wide rating, cleanliness, education, and satisfaction
- `objectives.js`: progression goals and rewards

### `src/render/`

- `catalog-art.js`: SVG construction-menu artwork
- `camera.js`: four-direction world rotation, isometric projection, inverse projection, view centering, and compass state
- `canvas.js`: diamond terrain, projected zones, connected fences, depth sorting, animals, staff, facilities, foliage, shadows, and effects

### `src/ui/`

Construction catalog, management panel, land window, finance window, inspector, and event wiring are separated by responsibility.

## 2.5D coordinate model

Simulation systems continue to use ordinary grid coordinates. The renderer converts grid corners and entity positions into screen coordinates using a diamond projection. `screenToWorld()` performs the inverse conversion for construction and inspection. Camera rotation changes only projection; it never rotates or rewrites the saved tile data.

Objects are sorted using projected depth at their ground contact point. This prevents animals and buildings from incorrectly drawing through objects that are closer to the camera.

## Adding content safely

### New animal

1. Add the species to `src/data/species.js`.
2. Reference only existing ground, fence, foliage, and enrichment IDs.
3. Add its Canvas drawing in `src/render/canvas.js` and SVG catalog art in `src/render/catalog-art.js`.
4. Confirm it appears in the animal construction catalog.
5. Run `tests/regression.py`; catalog validation reports broken references.

### New foliage

1. Add it to `src/data/foliage.js` with biome and valid terrain IDs.
2. Add its shape or dedicated art in both rendering modules.
3. Add it to species preferences only after the foliage ID exists.

### New shop or attraction

1. Add its data to `src/data/objects.js`.
2. Define price, upkeep, income/education effects, and tooltip text.
3. Add catalog and projected map artwork.
4. Check recurring costs and finance category routing.

## Stability rules

- Keep save migrations backward compatible.
- Never remove an existing ID from a live save without a migration.
- Keep simulation logic out of rendering modules.
- Keep catalog data out of UI event handlers.
- Keep camera rotation out of simulation coordinates.
- Run syntax checks and the regression suite after each feature batch.
