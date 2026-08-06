/* Pocket Zoo Architect — systems/metrics */
'use strict';

function calculateZooMetrics() {
    if (structureDirty) { refreshAccessiblePaths(); analyzePens(); }
    let animalAppeal = 0;
    for (const animal of state.animals) {
        ensureAnimalCareFields(animal);
        const needs = animalNeeds(animal, penCache[animal.penId]);
        animal.happiness = needs.happy;
        animal.issues = needs.issues;
        animalAppeal += (SPECIES[animal.species]?.appeal || 0) * animal.happiness / 100;
    }
    state.animalHappiness = state.animals.length ? state.animals.reduce((sum, animal) => sum + animal.happiness, 0) / state.animals.length : 0;

    let facilityAppeal = 0, education = 0, decor = 0, pathAppeal = 0;
    for (const row of state.tiles)
        for (const t of row) {
            const definition = OBJECTS[t.object];
            if (definition) {
                facilityAppeal += definition.appeal || 0;
                education += definition.education || 0;
                decor += definition.decor || 0;
            }
            pathAppeal += GROUND[t.ground]?.pathAppeal || 0;
        }

    const variety = new Set(state.animals.map(animal => animal.species)).size * 14;
    const land = (state.unlocked.length - 1) * 18;
    const tours = countStaff('guide') * 10;
    state.education = clamp(state.education * .92 + clamp(education + tours, 0, 100) * .08, 0, 100);

    const publicCleanliness = clamp(100 - state.litter.reduce((sum, item) => sum + item.amount * 2.2, 0) + countObject('bin') * .5, 0, 100);
    const occupiedPens = penCache.filter(pen => pen.animals.length);
    const habitatCleanliness = occupiedPens.length ? occupiedPens.reduce((sum, pen) => sum + pen.cleanliness, 0) / occupiedPens.length : 100;
    state.cleanliness = clamp(publicCleanliness * .68 + habitatCleanliness * .32, 0, 100);

    const avgAnimal = state.animals.length ? state.animalHappiness : 48;
    const target = clamp(22 + animalAppeal + facilityAppeal + variety + decor + Math.min(35, pathAppeal * .2) + land + state.satisfaction * .25 + state.cleanliness * .18 + state.education * .22 + avgAnimal * .18, 0, 720);
    state.reputation = state.reputation * .88 + target * .12;
}
