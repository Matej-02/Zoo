/* Pocket Zoo Architect — main */
'use strict';

const tile = (x, y) => state.tiles[y][x];
let last = performance.now(), uiTimer = 0, metricTimer = 0;

function loop(now) {
    const raw = Math.min(.05, (now - last) / 1000); last = now;
    const dt = raw * state.speed;
    if (state.speed > 0) {
        state.dayTimer += dt; state.autosaveTimer += dt; uiTimer += dt; metricTimer += dt;
        if (structureDirty) { refreshAccessiblePaths(); analyzePens(); }
        updateVisitors(dt); updateAnimals(dt); updateStaff(dt);
        if (metricTimer > 1.2) { calculateZooMetrics(); metricTimer = 0; }
        if (state.dayTimer >= 10) { state.dayTimer -= 10; advanceDay(); }
        if (state.autosaveTimer >= 35) { state.autosaveTimer = 0; save(false); }
        if (uiTimer > .35) { updateUI(); if (financeOpen) renderFinance(); uiTimer = 0; }
    }
    draw(); requestAnimationFrame(loop);
}

const validationIssues = validateCatalog();
if (validationIssues.length) console.error('Pocket Zoo catalog validation failed:', validationIssues);

const hadSave = load();
refreshAccessiblePaths(); analyzePens(); calculateZooMetrics();
renderTools(); renderGoals(); renderLog(); renderLand(); renderZooEvents(); updateUI(); updateCameraUI(); applyZoom();
openPanel(state.activePanel || 'overview');
setTimeout(centerCanvas, 60);

if (!hadSave) el('welcome').classList.remove('hidden');
log(hadSave ? 'Saved zoo loaded.' : 'A new zoo has opened.');
if (!hadSave) pushZooEvent('system', 'The zoo has opened', 'Build the entrance paths and first habitat, then hire a keeper.', { force: true, key: 'new-zoo' });

window.PocketZoo = Object.freeze({
    version: 9,
    state,
    data: Object.freeze({ ZONES, GROUND, FENCES, FOLIAGE, HABITAT_OBJECTS, FACILITIES, EDUCATION, SPECIES, TOOLS }),
    actions: Object.freeze({ selectTool, place, inspect, hire, dismiss, buyExpansion, advanceDay, closeMonth, save, exportSave, importSaveFile, rotateCamera, openPanel, closePanel, processAnimalDay, pushZooEvent }),
    diagnostics: Object.freeze({
        validateCatalog,
        getPens: () => penCache,
        getAccessiblePaths: () => new Set(accessiblePaths),
        recalculate: () => { structureDirty = true; refreshAccessiblePaths(); analyzePens(); calculateZooMetrics(); updateUI(); }
    })
});

requestAnimationFrame(loop);
