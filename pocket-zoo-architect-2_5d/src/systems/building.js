/* Pocket Zoo Architect — systems/building */
'use strict';

function objectCost(o) { return OBJECTS[o]?.cost || 0; }

function canFacility(x, y) { return isPathGround(tile(x, y).ground) && accessiblePaths.has(key(x, y)); }

function aquaticPlacementAllowed(spec, g) { if (spec.aquatic)
    return g === 'saltWater' || g === 'deepWater'; if (spec.semiAquatic)
    return true; return !isWaterGround(g); }

function place(x, y) {
    if (!inside(x, y))
        return;
    if (!isUnlocked(x, y)) {
        inspect(x, y);
        return;
    }
    const t = tile(x, y), tool = state.selected, d = TOOLS[tool];
    if (tool === 'inspect') {
        inspect(x, y);
        return;
    }
    if (!toolUnlocked(tool)) {
        toast(`Requires ${d.stars} stars.`);
        return;
    }
    if (tool === 'erase') {
        const a = animalAt(x, y);
        if (a) {
            const v = refund(SPECIES[a.species].cost);
            state.animals.splice(state.animals.indexOf(a), 1);
            structureDirty = true;
            log(`${a.name} the ${SPECIES[a.species].name.toLowerCase()} was relocated for ${money(v)}.`);
            return;
        }
        if (t.object) {
            const name = OBJECTS[t.object]?.name || t.object, v = refund(objectCost(t.object));
            t.object = null;
            structureDirty = true;
            log(`${name} removed for ${money(v)}.`);
            return;
        }
        if (t.ground !== 'grass') {
            const old = t.ground, v = refund(GROUND[old]?.cost || 0);
            t.ground = 'grass';
            structureDirty = true;
            log(`${GROUND[old]?.name || old} removed${v ? ` for ${money(v)}` : ''}.`);
        }
        else
            toast('Nothing to bulldoze on this tile.');
        return;
    }
    if (d.animal) {
        if (t.object || animalAt(x, y)) {
            toast('Choose an empty habitat tile.');
            return;
        }
        const spec = SPECIES[tool];
        if (!aquaticPlacementAllowed(spec, t.ground)) {
            toast(spec.aquatic ? 'Place this animal in deep or salt water.' : 'This animal cannot be placed on that tile.');
            return;
        }
        const p = penAt(x, y);
        if (!p?.enclosed) {
            toast('Complete the enclosed habitat first.');
            return;
        }
        if (!p.gates || !gateWorkspot(p)) {
            toast('Add a keeper gate beside a connected path.');
            return;
        }
        if (p.minStrength < spec.fence.strength || p.minHeight < spec.fence.height || (spec.fence.waterproof && !p.waterproof)) {
            toast(`This species needs fence strength ${spec.fence.strength}, height ${spec.fence.height}${spec.fence.waterproof ? ' and waterproof barriers' : ''}.`);
            return;
        }
        if (!spend(d.cost, 'animals'))
            return;
        const name = randomName('animal');
        state.animals.push({ id: uid(), name, species: tool, px: x + .5, py: y + .5, targetX: x, targetY: y, dir: 1, moveTimer: 0, hunger: 88, happiness: 70, penId: p.id, issues: [], animOffset: Math.random() * 10 });
        structureDirty = true;
        log(`${name} the ${d.name.toLowerCase()} arrived.`);
        checkGoals();
        return;
    }
    if (isPathGround(tool)) {
        if (t.object || animalAt(x, y))
            return;
        if (isPathGround(t.ground)) {
            if (t.ground === tool)
                return;
            const oldPath = GROUND[t.ground], credit = Math.round((oldPath?.cost || 0) * .7), swap = Math.max(0, d.cost - credit);
            if (!spend(swap))
                return;
            const oldName = oldPath?.name || 'path';
            t.ground = tool;
            structureDirty = true;
            log(`${oldName} upgraded to ${d.name} for ${money(swap)}.`);
            return;
        }
        if (!spend(d.cost))
            return;
        t.ground = tool;
        structureDirty = true;
        checkGoals();
        return;
    }
    if (d.ground) {
        if (t.object || t.ground === tool || isPathGround(t.ground) || animalAt(x, y))
            return;
        if (!spend(d.cost))
            return;
        t.ground = tool;
        structureDirty = true;
        return;
    }
    if (FENCES[tool]) {
        const existing = FENCES[t.object];
        if (d.gate && existing) {
            if (t.object === tool)
                return;
            const credit = Math.round(existing.cost * .65), swap = Math.max(0, d.cost - credit);
            if (!spend(swap))
                return;
            t.object = tool;
            structureDirty = true;
            log(`${existing.name} converted to ${d.name} for ${money(swap)}.`);
            checkGoals();
            return;
        }
        if (t.object || isPathGround(t.ground) || animalAt(x, y))
            return;
        if (!spend(d.cost))
            return;
        t.object = tool;
        structureDirty = true;
        checkGoals();
        return;
    }
    if (FOLIAGE[tool]) {
        if (t.object || isPathGround(t.ground) || animalAt(x, y)) {
            toast('Choose an empty habitat tile.');
            return;
        }
        if (!foliageAllowed(tool, t.ground)) {
            toast(`${d.name} can be placed on: ${foliageTerrainText(tool)}.`);
            return;
        }
        if (!spend(d.cost))
            return;
        t.object = tool;
        structureDirty = true;
        return;
    }
    if (HABITAT_OBJECTS[tool]) {
        const water = isWaterGround(t.ground);
        if (t.object || isPathGround(t.ground) || animalAt(x, y) || (d.waterOnly && !water) || (!d.waterOnly && water)) {
            toast(d.waterOnly ? 'Place this enrichment in water.' : 'Place this object on dry habitat ground.');
            return;
        }
        if (!spend(d.cost))
            return;
        t.object = tool;
        structureDirty = true;
        return;
    }
    if (FACILITIES[tool] || EDUCATION[tool]) {
        if (t.object) {
            toast('This path tile is occupied.');
            return;
        }
        if (!canFacility(x, y)) {
            toast('Place this on a connected path tile.');
            return;
        }
        if (!spend(d.cost))
            return;
        t.object = tool;
        structureDirty = true;
        log(`${d.name} opened.`);
        checkGoals();
        return;
    }
}
