/* Pocket Zoo Architect — systems/metrics */
'use strict';

function calculateZooMetrics() {
    if (structureDirty) {
        refreshAccessiblePaths();
        analyzePens();
    }
    let animalAppeal = 0;
    for (const a of state.animals) {
        const n = animalNeeds(a, penCache[a.penId]);
        a.happiness = n.happy;
        a.issues = n.issues;
        animalAppeal += (SPECIES[a.species]?.appeal || 0) * a.happiness / 100;
    }
    let facilityAppeal = 0, education = 0, decor = 0, pathAppeal = 0;
    for (const row of state.tiles)
        for (const t of row) {
            const d = OBJECTS[t.object];
            if (d) {
                facilityAppeal += d.appeal || 0;
                education += d.education || 0;
                decor += d.decor || 0;
            }
            pathAppeal += GROUND[t.ground]?.pathAppeal || 0;
        }
    const variety = new Set(state.animals.map(a => a.species)).size * 14, land = (state.unlocked.length - 1) * 18, tours = countStaff('guide') * 10;
    state.education = clamp(state.education * .92 + clamp(education + tours, 0, 100) * .08, 0, 100);
    state.cleanliness = clamp(100 - state.litter.reduce((a, b) => a + b.amount * 2.2, 0) + countObject('bin') * .5, 0, 100);
    const avgAnimal = state.animals.length ? state.animals.reduce((a, b) => a + b.happiness, 0) / state.animals.length : 48, target = clamp(22 + animalAppeal + facilityAppeal + variety + decor + Math.min(35, pathAppeal * .2) + land + state.satisfaction * .25 + state.cleanliness * .18 + state.education * .22 + avgAnimal * .15, 0, 720);
    state.reputation = state.reputation * .88 + target * .12;
}
