/* Pocket Zoo Architect — main */
'use strict';

const tile = (x, y) => state.tiles[y][x];

let last = performance.now();
let uiTimer = 0;
let metricTimer = 0;

function loop(now) {
    const raw = Math.min(.05, (now - last) / 1000);
    last = now;
    const dt = raw * state.speed;

    if (state.speed > 0) {
        state.dayTimer += dt;
        state.autosaveTimer += dt;
        uiTimer += dt;
        metricTimer += dt;

        if (structureDirty) {
            refreshAccessiblePaths();
            analyzePens();
        }

        updateVisitors(dt);
        updateAnimals(dt);
        updateStaff(dt);

        if (metricTimer > 1.2) {
            calculateZooMetrics();
            metricTimer = 0;
        }
        if (state.dayTimer >= 10) {
            state.dayTimer -= 10;
            advanceDay();
        }
        if (state.autosaveTimer >= 35) {
            state.autosaveTimer = 0;
            save(false);
        }
        if (uiTimer > .35) {
            updateUI();
            if (financeOpen)
                renderFinance();
            uiTimer = 0;
        }
    }

    draw();
    requestAnimationFrame(loop);
}

const validationIssues = validateCatalog();
if (validationIssues.length)
    console.error('Pocket Zoo catalog validation failed:', validationIssues);

const hadSave = load();
initCollapsibles();
applyCollapsed();
refreshAccessiblePaths();
analyzePens();
calculateZooMetrics();
renderTools();
renderGoals();
renderLog();
renderLand();
updateUI();
updateCameraUI();
applyZoom();
setTimeout(centerCanvas, 60);

if (!hadSave)
    $('#welcome').classList.remove('hidden');
log(hadSave ? 'Saved zoo loaded.' : 'A new zoo has opened.');

window.PocketZoo = Object.freeze({
    version: 7,
    state,
    data: Object.freeze({ ZONES, GROUND, FENCES, FOLIAGE, HABITAT_OBJECTS, FACILITIES, EDUCATION, SPECIES, TOOLS }),
    actions: Object.freeze({
        selectTool,
        place,
        inspect,
        hire,
        dismiss,
        buyExpansion,
        advanceDay,
        closeMonth,
        save,
        exportSave,
        importSaveFile,
        rotateCamera
    }),
    diagnostics: Object.freeze({
        validateCatalog,
        getPens: () => penCache,
        getAccessiblePaths: () => new Set(accessiblePaths),
        recalculate: () => {
            structureDirty = true;
            refreshAccessiblePaths();
            analyzePens();
            calculateZooMetrics();
            updateUI();
        }
    })
});

requestAnimationFrame(loop);
