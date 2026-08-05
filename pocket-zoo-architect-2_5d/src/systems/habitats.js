/* Pocket Zoo Architect — systems/habitats */
'use strict';

function isHabitatCell(x, y) { if (!inside(x, y) || !isUnlocked(x, y))
    return false; const t = tile(x, y); return !isPathGround(t.ground) && !isBarrier(t.object) && !isFacility(t.object); }

function analyzePens() {
    const visited = new Set();
    penCache = [];
    for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++) {
            const start = key(x, y);
            if (visited.has(start) || !isHabitatCell(x, y))
                continue;
            const q = [[x, y]], cells = [], cellSet = new Set([start]);
            visited.add(start);
            let open = false;
            const barriers = [];
            for (let i = 0; i < q.length; i++) {
                const [cx, cy] = q[i];
                cells.push([cx, cy]);
                for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const nx = cx + dx, ny = cy + dy;
                    if (!inside(nx, ny) || !isUnlocked(nx, ny)) {
                        open = true;
                        continue;
                    }
                    const nt = tile(nx, ny);
                    if (isBarrier(nt.object)) {
                        barriers.push(nt.object);
                        continue;
                    }
                    if (isPathGround(nt.ground) || isFacility(nt.object)) {
                        open = true;
                        continue;
                    }
                    if (!isHabitatCell(nx, ny)) {
                        open = true;
                        continue;
                    }
                    const nk = key(nx, ny);
                    if (!visited.has(nk)) {
                        visited.add(nk);
                        cellSet.add(nk);
                        q.push([nx, ny]);
                    }
                }
            }
            const p = { id: penCache.length, cells, cellSet, enclosed: !open && cells.length >= 2, gates: 0, gateTiles: [], animals: [], terrain: {}, foliageByBiome: {}, foliageObjects: {}, foliageTotal: 0, shelters: 0, feeders: 0, waterService: 0, enrichment: new Set(), minStrength: 99, minHeight: 99, waterproof: true, cleanliness: 100 };
            for (const [cx, cy] of cells) {
                const t = tile(cx, cy);
                p.terrain[t.ground] = (p.terrain[t.ground] || 0) + 1;
                const f = FOLIAGE[t.object];
                if (f) {
                    p.foliageByBiome[f.biome] = (p.foliageByBiome[f.biome] || 0) + f.foliage;
                    p.foliageObjects[t.object] = (p.foliageObjects[t.object] || 0) + 1;
                    p.foliageTotal += f.foliage;
                }
                const h = HABITAT_OBJECTS[t.object];
                if (h) {
                    p.shelters += h.shelter || 0;
                    p.feeders += h.feeder || 0;
                    p.waterService += h.waterService || 0;
                    if (h.enrichment)
                        p.enrichment.add(h.enrichment);
                }
            }
            const seenBarrier = new Set();
            for (const [cx, cy] of cells)
                for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const nx = cx + dx, ny = cy + dy;
                    if (!inside(nx, ny) || !isUnlocked(nx, ny))
                        continue;
                    const o = tile(nx, ny).object;
                    if (isBarrier(o)) {
                        const bk = key(nx, ny);
                        if (!seenBarrier.has(bk)) {
                            seenBarrier.add(bk);
                            const f = FENCES[o];
                            p.minStrength = Math.min(p.minStrength, f.strength);
                            p.minHeight = Math.min(p.minHeight, f.height);
                            p.waterproof = p.waterproof && !!f.waterproof;
                            if (f.gate)
                                p.gateTiles.push([nx, ny]);
                        }
                    }
                }
            p.gates = p.gateTiles.length;
            if (!seenBarrier.size) {
                p.minStrength = 0;
                p.minHeight = 0;
                p.waterproof = false;
            }
            penCache.push(p);
        }
    for (const a of state.animals) {
        const p = penCache.find(p => p.cellSet.has(key(Math.floor(a.px), Math.floor(a.py))));
        a.penId = p ? p.id : -1;
        if (p)
            p.animals.push(a);
    }
    for (const p of penCache)
        p.cleanliness = clamp(100 - state.litter.filter(l => p.cellSet.has(key(l.x, l.y))).reduce((a, b) => a + b.amount * 4, 0), 0, 100);
    structureDirty = false;
}

function gateWorkspot(p) { for (const [gx, gy] of p.gateTiles)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = gx + dx, y = gy + dy;
        if (accessiblePaths.has(key(x, y)))
            return [x, y];
    } return null; }

function animalNeeds(a, p) {
    const s = SPECIES[a.species], issues = [];
    let score = 100;
    if (!p?.enclosed) {
        issues.push('habitat is not fully enclosed');
        return { happy: 8, issues };
    }
    if (!p.gates || !gateWorkspot(p)) {
        issues.push('no keeper gate beside a connected path');
        score -= 28;
    }
    const same = p.animals.filter(x => x.species === a.species).length;
    if (same < s.social) {
        issues.push(`needs ${s.social} ${s.name.toLowerCase()} together`);
        score -= Math.min(24, (s.social - same) * 9);
    }
    const area = p.cells.length / Math.max(1, p.animals.length);
    if (area < s.minArea) {
        issues.push(`needs ${s.minArea} tiles per animal (${Math.floor(area)} available)`);
        score -= Math.min(35, (s.minArea - area) * 2);
    }
    for (const [g, n] of Object.entries(s.terrain)) {
        const have = p.terrain[g] || 0;
        if (have < n) {
            issues.push(`needs ${n} ${GROUND[g].name.toLowerCase()} tiles (${have})`);
            score -= Math.min(18, (n - have) * 2);
        }
    }
    const matching = s.biomes.reduce((n, b) => n + (p.foliageByBiome[b] || 0), 0);
    if (matching < s.foliage) {
        issues.push(`needs ${s.foliage} points of ${s.biomes.join('/')} foliage (${matching.toFixed(1)})`);
        score -= Math.min(20, (s.foliage - matching) * 3);
    }
    if (s.requiredFoliage && !p.foliageObjects[s.requiredFoliage]) {
        issues.push(`requires ${FOLIAGE[s.requiredFoliage].name.toLowerCase()}`);
        score -= 18;
    }
    if (p.shelters < s.shelter) {
        issues.push('needs a suitable shelter');
        score -= 12;
    }
    if (p.feeders < s.feeder) {
        issues.push('needs a food station');
        score -= 13;
    }
    for (const e of s.enrich || [])
        if (!p.enrichment.has(e)) {
            issues.push(`needs ${titleCase(e)} enrichment`);
            score -= 8;
        }
    if (p.minStrength < s.fence.strength) {
        issues.push(`fence strength ${p.minStrength}/${s.fence.strength}`);
        score -= 25;
    }
    if (p.minHeight < s.fence.height) {
        issues.push(`fence height ${p.minHeight}/${s.fence.height}`);
        score -= 25;
    }
    if (s.fence.waterproof && !p.waterproof) {
        issues.push('requires waterproof barriers');
        score -= 25;
    }
    if (a.hunger < 45) {
        issues.push('is hungry');
        score -= Math.min(30, (45 - a.hunger) * .7);
    }
    if (p.cleanliness < 55) {
        issues.push('habitat needs cleaning');
        score -= 14;
    }
    return { happy: Math.round(clamp(score, 0, 100)), issues };
}
