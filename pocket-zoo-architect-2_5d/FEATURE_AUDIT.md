# Feature audit against the full conversation

This release was checked against every requested change from the prototype, Deluxe, Ultimate, Evolution, Horizons, and Architect iterations.

## Construction and habitats

| Requested feature | Status | Implementation |
|---|---|---|
| Build and remove paths | Included | Six replaceable path types; Bulldoze removes paths and refunds part of the cost. |
| Gate replaces an existing fence | Included | Matching or stronger gates convert fence tiles and charge only the price difference. |
| Several terrain and water types | Included | Grass, soil, sand, mud, rock, snow, ice, shallow freshwater, deep freshwater, and saltwater. |
| Logical foliage placement | Included | Each plant has an explicit allowed-terrain list; water plants require suitable water. |
| Separate foliage tab | Included | Thirty biome-tagged plants across temperate, savanna, desert, rainforest, mountain, river, marine, and snow biomes. |
| Species-specific foliage | Included | Habitat welfare counts only matching biomes; specialist plants such as bamboo and seagrass are enforced. |
| Different enrichment requirements | Included | Sixteen habitat objects and twelve enrichment categories are evaluated by species. |
| Different fence requirements | Included | Low, standard, heavy, high, glass, and waterproof aquatic barriers with matching gates. |
| Aquatic animals and exhibits | Included | Freshwater, semi-aquatic, marine, and polar species use water terrain and waterproof containment where required. |
| Larger zoo and expansions | Included | One starting zone plus five purchasable parcels. |
| Permanent Inspect and Bulldoze controls | Included | Both remain fixed at the bottom of the construction panel. |
| Live inspector | Included | Animal, habitat, object, guest, employee, and terrain details refresh automatically. |

## Animals, facilities, and education

| Requested feature | Status | Implementation |
|---|---|---|
| More animal variety | Included | Twenty-one habitat species, from pygmy goats and meerkats to elephants, dolphins, and sea turtles. |
| More trees and plants | Included | Thirty foliage items with individual costs, biomes, terrain restrictions, values, and map art. |
| More shops and attractions | Included | Thirteen guest facilities, including food, drinks, services, shops, rides, and comfort objects. |
| Insects, butterflies, birds, and specialist education | Included | Insect house, butterfly garden, aviary, bird theatre, reptile house, aquarium, education centre, information boards, and conservation laboratory. |
| Individual artwork instead of emoji | Included | SVG catalog art and custom Canvas map drawings; emoji fallback fields were removed. |
| Better animal and tree appearance | Included | Enlarged vector sprites, shadows, depth ordering, animated movement, varied foliage forms, and 2.5D positioning. |
| Detailed hover explanations | Included | Every construction item and map entity exposes costs, upkeep, welfare, terrain, security, and operating information. |

## Staff and guests

| Requested feature | Status | Implementation |
|---|---|---|
| Hire and dismiss keepers and janitors | Included | Both roles can be hired and dismissed independently. |
| Monthly salaries | Included | Keeper, janitor, and guide payroll appears in forecasts and is paid at month end. |
| Visible working employees | Included | Employees move on paths; keepers feed, janitors clean, and guides run tours. |
| Staff counters | Included | Current role totals are shown on cards and in the collapsible section summary. |
| Manageable litter | Included | Lower litter generation, strong bin suppression, faster janitors, and tested cleanup scaling. |
| Tour guides | Included | Guides lead visible groups between educational stops, earn tour revenue, and increase education. |
| Collapsible management sections | Included | Employees, objectives, inspector, and log collapse independently and preserve their state. |

## Economy and progression

| Requested feature | Status | Implementation |
|---|---|---|
| Clear money window | Included | Summary cards, category breakdowns, historical table, admission controls, and a cash-flow graph. |
| Monthly rather than daily accounting | Included | Days advance the calendar, while income accumulates and recurring costs settle at month end. |
| Day, month, and year display | Included | Full calendar with variable month length and year rollover. |
| Easier starting game | Included | Higher starting cash, founder support, reduced early costs, and larger introductory objective rewards. |
| Objectives and unlocks | Included | Cash-reward objectives, star progression, gated species/items, education, biodiversity, and expansion goals. |
| New Zoo button | Included | Clears current and legacy save keys before reloading a genuinely new zoo. |
| Save safety | Included | Autosave, manual save, legacy migration, portable JSON export/import, and camera-state persistence. |

## 2.5D presentation and camera

| Requested feature | Status | Implementation |
|---|---|---|
| Angled rather than top-down world | Included | True isometric-style diamond projection with vertical objects and elevated structures. |
| Rotate the world | Included | Four directions through camera buttons or Q/E keyboard shortcuts. |
| Correct building after rotation | Included | Screen coordinates are converted back into world-grid coordinates for all four views. |
| Depth ordering | Included | Foliage, fences, buildings, animals, guests, staff, and litter are sorted by projected depth. |
| Better visual feedback | Included | Compass readout, camera direction, animated water, cast shadows, locked parcel overlays, and diamond hover selection. |

## Architecture and quality

- The game remains split into data, core, systems, rendering, UI, styles, and tests.
- Save version 7 recognizes version 6 and all earlier Pocket Zoo save keys.
- The automated suite verifies 27 core regressions, including camera projection, rotation, save persistence, art fallbacks, monthly accounting, habitats, staff, litter, expansions, and reset behavior.
- Every JavaScript module passes `node --check`.
