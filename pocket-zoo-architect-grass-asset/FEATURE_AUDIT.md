# Feature audit against the full conversation

This release was checked against the complete request history from the first browser prototype through Deluxe, Ultimate, Evolution, Horizons, Architect, the rotatable 2.5D edition, and the current Living Zoo update.

## Interface and interaction

| Requested feature | Status | Implementation |
|---|---|---|
| All major controls on the left | Included | One permanent icon rail contains overview, construction categories, Inspect, Bulldoze, staff, objectives, finance, land, news, and settings. |
| Icons rather than permanent side menus | Included | Rail labels are visually hidden; accessible labels and native titles remain for discoverability. |
| One panel for the selected feature | Included | Clicking an icon opens only its matching context panel. |
| Close panel with X | Included | The panel collapses completely, expanding the world view. |
| Separate Inspect and Bulldoze selection | Included | Both are permanent one-click rail tools with clear active states. |
| Remove map hover window | Included | No map hover tooltip exists; entity and tile information is available only through Inspect. |
| Live inspection | Included | Animal care, habitat condition, staff activity, objects, guests, terrain, and land update without selecting again. |
| Visible camera rotation controls | Included | Rotate-left and rotate-right controls sit beside zoom and the compass; Q/E remain optional shortcuts. |
| Staff counters | Included | Keeper, janitor, and guide counts appear in the staff panel. |

## Construction, habitats, and world

| Requested feature | Status | Implementation |
|---|---|---|
| Build, replace, and remove paths | Included | Six path types can be upgraded or bulldozed with partial refunds. |
| Gate replaces existing fence | Included | Placing a compatible gate converts the fence and charges only the price difference. |
| Multiple terrain and water types | Included | Grass, dirt, sand, mud, rock, snow, ice, shallow water, deep water, and saltwater. |
| Logical foliage terrain | Included | Cacti require desert-compatible ground; lilies require freshwater; kelp, coral, and seagrass require saltwater; trees and shrubs use suitable land. |
| Separate biome foliage category | Included | Thirty plants across temperate, savanna, desert, rainforest, mountain, river/wetland, marine, and snow/tundra groups. |
| Animal-specific foliage | Included | Welfare counts only suitable biome foliage and specialist requirements such as bamboo or seagrass. |
| Varied enrichment | Included | Species evaluate swimming, climbing, scratching, digging, basking, nesting, puzzle, play, ice, swing, exploration, and other enrichment. |
| Different fence classes | Included | Low farm, standard, strong, high-primate, glass, and waterproof aquatic barriers with matching gates. |
| Water animals and aquatic tiles | Included | Freshwater, semi-aquatic, marine, and polar species use appropriate terrain and containment. |
| Larger zoo and expansions | Included | One starting zone and five sequentially purchasable parcels. |

## Animals and keeper care

| Requested feature | Status | Implementation |
|---|---|---|
| More animal variety | Included | Twenty-one species from pygmy goats and meerkats to elephants, sea turtles, seals, and dolphins. |
| Animals create waste | Included | Waste appears visibly inside habitats and reduces habitat and zoo cleanliness. |
| Animals need cleaning | Included | Hygiene decreases over time and can be restored by keepers. |
| Animals need grooming | Included | Grooming varies by species and creates dedicated keeper tasks. |
| Animals may fall ill | Included | Illness risk responds to hygiene, happiness, and habitat cleanliness; sick animals lose health. |
| Keepers have more work | Included | Priority queue: treatment, critical washing/grooming, habitat waste, routine washing/grooming, feeding, and welfare patrol. |
| Animal births | Included | Healthy adult pairs with sufficient space can produce juveniles that grow into adults. |
| Animal happiness as zoo condition | Included | Average happiness is visible in the header and overview and contributes to reputation. |
| Sustainable care balance | Included | Work rates and movement were tested over 60 simulated days with nine animals and two keepers. |

## Staff, guests, and education

| Requested feature | Status | Implementation |
|---|---|---|
| Hire and dismiss staff | Included | Keepers, janitors, and guides can be hired and dismissed. |
| Monthly staff salaries | Included | Payroll appears in finance forecasts and is charged at month end. |
| Visible working staff | Included | Staff walk on paths and use task-specific animation/art. |
| Manageable guest litter | Included | Bins reduce generation, janitors clean efficiently, and cleanup scaling is regression-tested. |
| Tour guides | Included | Guides lead visible groups, generate tour income, and improve education and satisfaction. |
| Insects, butterflies, birds, and education attractions | Included | Insect house, butterfly garden, aviary, bird theatre, reptile house, aquarium, information boards, education centre, and conservation laboratory. |

## Economy and progression

| Requested feature | Status | Implementation |
|---|---|---|
| Clear finance window with graphs | Included | Current-month cards, income/expense graph, category bars, forecast, admission control, and monthly history. |
| Monthly rather than daily accounting | Included | Days measure time; income accumulates and recurring care, utilities, and payroll settle monthly. |
| Day, month, and year | Included | Full calendar with correct month lengths and year rollover. |
| Easier start | Included | $4,300 starting cash, four months of founder support, reduced early costs, and stronger introductory rewards. |
| Year-end money event | Included | Annual income, spending, and surplus/deficit appear in Zoo news. |
| Objectives and unlocks | Included | Construction, guests, welfare, biodiversity, education, finance, expansion, and star progression goals. |
| New Zoo button | Included | Current and legacy save keys are cleared before a fresh reload. |
| Save safety | Included | Autosave, manual save, JSON export/import, version-8 migration, camera persistence, and previous-save upgrade support. |

## Curated zoo news

| Requested feature | Status | Implementation |
|---|---|---|
| Small what-is-happening window | Included | A compact, minimisable Zoo pulse overlays the lower map corner. |
| Detailed news panel | Included | The News icon opens a filterable event history. |
| Avoid spam | Included | Routine events are capped at three per game day and deduplicated. |
| Important events still appear | Included | High-priority illness/birth events can replace a routine event when the daily cap is full. |
| Requested examples | Included | Annual finances, illness, recovery, births, cleanliness praise, guest happiness, and animal-happiness milestones. |

## Visuals, camera, and architecture

| Requested feature | Status | Implementation |
|---|---|---|
| Angled 2.5D world | Included | True diamond projection, vertical barriers, elevated structures, shadows, and animated water. |
| Rotate world in four directions | Included | Four camera orientations with inverse projection for accurate interaction. |
| Correct depth order | Included | Terrain objects, foliage, barriers, animals, guests, employees, litter, and animal waste are depth-sorted. |
| Better art and no emoji | Included | Every construction item has custom SVG art and every map category uses Canvas/vector artwork. |
| Split project into modules | Included | 31 JavaScript modules plus separate HTML, styles, tests, and documentation. |
| Prevent regressions | Included | Catalog validation, syntax checks, save migration tests, visual scenarios, and 33 browser regression checks. |
