/* Pocket Zoo Architect — systems/animals */
'use strict';

function updateAnimals(dt) { if (structureDirty)
    analyzePens(); for (const a of state.animals) {
    const p = penCache[a.penId], spec = SPECIES[a.species];
    a.hunger = clamp(a.hunger - dt * .012, 0, 100);
    if (!p?.enclosed)
        continue;
    a.moveTimer -= dt;
    if (a.moveTimer <= 0) {
        const opts = p.cells.filter(([x, y]) => { const t = tile(x, y); if (t.object || animalAt(x, y))
            return false; if (spec.aquatic)
            return ['saltWater', 'deepWater'].includes(t.ground); if (!spec.semiAquatic && isWaterGround(t.ground))
            return false; return true; });
        if (opts.length) {
            const [x, y] = opts[Math.floor(Math.random() * opts.length)];
            a.targetX = x;
            a.targetY = y;
        }
        a.moveTimer = 1.6 + Math.random() * 3.2;
    }
    const gx = a.targetX + .5, gy = a.targetY + .5, dx = gx - a.px, dy = gy - a.py, len = Math.hypot(dx, dy);
    if (len > .04) {
        a.dir = dx >= 0 ? 1 : -1;
        const sp = spec.aquatic ? .43 : ['elephant', 'hippo', 'polarBear'].includes(a.species) ? .21 : .31;
        a.px += dx / len * dt * sp;
        a.py += dy / len * dt * sp;
    }
} }
