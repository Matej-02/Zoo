/* Pocket Zoo Architect — systems/animals */
'use strict';

function ensureAnimalCareFields(animal) {
    animal.hygiene = clamp(Number(animal.hygiene ?? 88), 0, 100);
    animal.grooming = clamp(Number(animal.grooming ?? 88), 0, 100);
    animal.health = clamp(Number(animal.health ?? 100), 0, 100);
    animal.sick = Boolean(animal.sick);
    animal.illnessDays = Math.max(0, Number(animal.illnessDays) || 0);
    animal.ageDays = Math.max(0, Number(animal.ageDays ?? 365) || 0);
    animal.juvenile = animal.ageDays < 90;
    animal.sex = animal.sex === 'female' || animal.sex === 'male' ? animal.sex : (Math.random() < .5 ? 'female' : 'male');
    animal.lastCareDay = animal.lastCareDay || '';
}

function animalCareProfile(animal) {
    const id = animal.species;
    const large = ['elephant', 'hippo', 'polarBear', 'giraffe', 'gorilla', 'tiger', 'lion'].includes(id);
    const grooming = ['gorilla', 'orangutan', 'panda', 'lion', 'tiger', 'pygmyGoat', 'zebra'].includes(id);
    const aquatic = Boolean(SPECIES[id]?.aquatic || SPECIES[id]?.semiAquatic);
    return {
        wasteChance: aquatic ? .18 : large ? .52 : .34,
        hygieneLoss: aquatic ? .65 : large ? 1.45 : .95,
        groomingLoss: grooming ? 1.65 : .62,
        illnessBase: aquatic ? .0006 : .0009
    };
}

function addAnimalWaste(animal) {
    const x = clamp(Math.floor(animal.px), 0, COLS - 1), y = clamp(Math.floor(animal.py), 0, ROWS - 1);
    const existing = state.animalWaste.find(waste => waste.x === x && waste.y === y && waste.penId === animal.penId);
    if (existing) existing.amount = clamp(existing.amount + 1, 1, 4);
    else state.animalWaste.push({ id: uid(), x, y, amount: 1, penId: animal.penId, animalId: animal.id });
    state.animalWaste = state.animalWaste.slice(-90);
    structureDirty = true;
}

function makeBaby(parent, x, y) {
    const name = randomName('animal');
    return {
        id: uid(), name, species: parent.species,
        px: x + .5, py: y + .5, targetX: x, targetY: y, dir: 1, moveTimer: 0,
        hunger: 92, happiness: 82, hygiene: 96, grooming: 96, health: 100,
        sick: false, illnessDays: 0, ageDays: 0, juvenile: true,
        sex: Math.random() < .5 ? 'female' : 'male', penId: parent.penId,
        issues: [], animOffset: Math.random() * 10
    };
}

function tryAnimalBirths() {
    for (const pen of penCache) {
        if (!pen.enclosed || pen.cleanliness < 70) continue;
        const speciesIds = [...new Set(pen.animals.map(animal => animal.species))];
        for (const speciesId of speciesIds) {
            const adults = pen.animals.filter(animal => animal.species === speciesId && !animal.juvenile && !animal.sick && animal.health > 75 && animal.happiness > 78);
            if (adults.length < 2 || !adults.some(animal => animal.sex === 'female') || !adults.some(animal => animal.sex === 'male')) continue;
            const spec = SPECIES[speciesId], current = pen.animals.filter(animal => animal.species === speciesId).length;
            if (pen.cells.length / Math.max(1, current + 1) < spec.minArea * .8) continue;
            if (Math.random() > .006) continue;
            const open = pen.cells.filter(([x, y]) => !tile(x, y).object && !animalAt(x, y) && aquaticPlacementAllowed(spec, tile(x, y).ground));
            if (!open.length) continue;
            const [x, y] = open[Math.floor(Math.random() * open.length)], baby = makeBaby(adults[0], x, y);
            state.animals.push(baby); structureDirty = true;
            log(`${baby.name}, a young ${spec.name.toLowerCase()}, was born.`);
            pushZooEvent('animal', 'A baby was born', `${baby.name} the ${spec.name.toLowerCase()} was born in habitat ${pen.id + 1}.`, { priority: 'high', key: `birth:${baby.id}` });
        }
    }
}

function processAnimalDay() {
    for (const animal of state.animals) {
        ensureAnimalCareFields(animal);
        const profile = animalCareProfile(animal), pen = penCache[animal.penId];
        animal.ageDays++;
        if (animal.juvenile && animal.ageDays >= 90) animal.juvenile = false;
        animal.hunger = clamp(animal.hunger - (animal.juvenile ? 4 : 5.5), 0, 100);
        animal.hygiene = clamp(animal.hygiene - profile.hygieneLoss - (pen && pen.cleanliness < 60 ? 2 : 0), 0, 100);
        animal.grooming = clamp(animal.grooming - profile.groomingLoss, 0, 100);
        if (Math.random() < profile.wasteChance) addAnimalWaste(animal);
        if (animal.sick) {
            animal.illnessDays++;
            animal.health = clamp(animal.health - 3.5, 0, 100);
            animal.hunger = clamp(animal.hunger - 2, 0, 100);
        }
        else {
            const risk = profile.illnessBase + Math.max(0, 45 - animal.hygiene) * .00045 + Math.max(0, 45 - animal.happiness) * .0003 + Math.max(0, 45 - (pen?.cleanliness ?? 100)) * .00035;
            if (Math.random() < risk) {
                animal.sick = true; animal.illnessDays = 0; animal.health = clamp(animal.health - 12, 0, 100);
                log(`${animal.name} the ${SPECIES[animal.species].name.toLowerCase()} became ill.`);
                pushZooEvent('animal', 'Animal illness', `${animal.name} the ${SPECIES[animal.species].name.toLowerCase()} became ill. A keeper should treat it soon.`, { priority: 'high', key: `ill:${animal.id}:${state.calendar.year}-${state.calendar.month}` });
            }
        }
    }
    tryAnimalBirths();
}

function updateAnimals(dt) {
    if (structureDirty) analyzePens();
    for (const animal of state.animals) {
        ensureAnimalCareFields(animal);
        const pen = penCache[animal.penId], spec = SPECIES[animal.species];
        animal.hunger = clamp(animal.hunger - dt * .018, 0, 100);
        if (!pen?.enclosed) continue;
        animal.moveTimer -= dt;
        if (animal.moveTimer <= 0) {
            const options = pen.cells.filter(([x, y]) => {
                const t = tile(x, y);
                if (t.object || animalAt(x, y)) return false;
                if (spec.aquatic) return ['saltWater', 'deepWater'].includes(t.ground);
                if (!spec.semiAquatic && isWaterGround(t.ground)) return false;
                return true;
            });
            if (options.length) {
                const [x, y] = options[Math.floor(Math.random() * options.length)];
                animal.targetX = x; animal.targetY = y;
            }
            animal.moveTimer = animal.sick ? 3.5 + Math.random() * 4 : 1.6 + Math.random() * 3.2;
        }
        const gx = animal.targetX + .5, gy = animal.targetY + .5, dx = gx - animal.px, dy = gy - animal.py, len = Math.hypot(dx, dy);
        if (len > .04) {
            animal.dir = dx >= 0 ? 1 : -1;
            let speed = spec.aquatic ? .43 : ['elephant', 'hippo', 'polarBear'].includes(animal.species) ? .21 : .31;
            if (animal.juvenile) speed *= .82;
            if (animal.sick) speed *= .45;
            animal.px += dx / len * dt * speed;
            animal.py += dy / len * dt * speed;
        }
    }
}
