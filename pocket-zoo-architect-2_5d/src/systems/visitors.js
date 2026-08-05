/* Pocket Zoo Architect — systems/visitors */
'use strict';

function nearbyObject(x, y, dict, r = 3) { let best = null, bd = 999; for (let yy = Math.max(0, y - r); yy <= Math.min(ROWS - 1, y + r); yy++)
    for (let xx = Math.max(0, x - r); xx <= Math.min(COLS - 1, x + r); xx++) {
        const o = tile(xx, yy).object;
        if (dict[o]) {
            const d = Math.abs(xx - x) + Math.abs(yy - y);
            if (d < bd) {
                bd = d;
                best = { x: xx, y: yy, o, def: dict[o] };
            }
        }
    } return best; }

function nearbyBin(x, y) { return nearbyObject(x, y, { bin: FACILITIES.bin }, 4); }

function addLitter(x, y, amount = 1) { if (!inside(x, y) || !isPathGround(tile(x, y).ground))
    return; const old = state.litter.find(l => l.x === x && l.y === y); if (old)
    old.amount = clamp(old.amount + amount, 1, 4);
else if (state.litter.length < 65)
    state.litter.push({ x, y, amount }); }

function facilityTargets() { const a = []; for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
        const o = tile(x, y).object;
        if ((FACILITIES[o] || EDUCATION[o]) && accessiblePaths.has(key(x, y)))
            a.push({ x, y, o, def: OBJECTS[o] });
    } return a; }

function viewingTargets() { const out = [], seen = new Set(); for (const p of penCache)
    if (p.animals.length)
        for (const [gx, gy] of p.gateTiles)
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const x = gx + dx, y = gy + dy, k = key(x, y);
                if (accessiblePaths.has(k) && !seen.has(k)) {
                    seen.add(k);
                    out.push({ x, y, type: 'view', penId: p.id });
                }
            } return out; }

function spawnVisitor() { if (!accessiblePaths.has(key(0, ENTRANCE_Y)))
    return; const pricePenalty = clamp((state.ticketPrice - 10) * .025, -.15, .48), base = clamp(.9 - pricePenalty + .0025 * state.reputation, .18, 1.15); if (Math.random() > base)
    return; const v = { id: uid(), x: .5, y: ENTRANCE_Y + .5, path: [], age: 0, maxAge: 55 + Math.random() * 55, speed: .72 + Math.random() * .22, satisfaction: 74 - pricePenalty * 25, hunger: 65 + Math.random() * 35, thirst: 60 + Math.random() * 40, toilet: 65 + Math.random() * 35, energy: 65 + Math.random() * 35, fun: 45 + Math.random() * 35, education: 0, color: `hsl(${Math.random() * 360} 48% 54%)`, litterCooldown: 18 + Math.random() * 28, lastGoal: '' }; state.visitors.push(v); state.totalGuests++; earn(state.ticketPrice, 'tickets'); chooseVisitorGoal(v); }

function chooseVisitorGoal(v) { const facilities = facilityTargets(), views = viewingTargets(); let candidates = []; if (v.hunger < 45)
    candidates = facilities.filter(t => t.def.need === 'hunger');
else if (v.thirst < 45)
    candidates = facilities.filter(t => t.def.need === 'thirst');
else if (v.toilet < 35)
    candidates = facilities.filter(t => t.def.service === 'toilet');
else if (v.energy < 30)
    candidates = facilities.filter(t => t.def.service === 'energy');
else if (v.fun < 45)
    candidates = [...facilities.filter(t => t.def.service === 'fun' || EDUCATION[t.o]), ...views];
else
    candidates = [...views, ...facilities]; if (!candidates.length)
    candidates = [{ x: 0, y: ENTRANCE_Y, type: 'exit' }]; const shuffled = candidates.sort(() => Math.random() - .5); for (const t of shuffled.slice(0, 12)) {
    if (`${t.x},${t.y}` === v.lastGoal)
        continue;
    const p = pathfind(v.x, v.y, t.x, t.y);
    if (p.length || Math.floor(v.x) === t.x && Math.floor(v.y) === t.y) {
        v.path = p;
        v.goal = t;
        v.lastGoal = `${t.x},${t.y}`;
        return;
    }
} v.path = pathfind(v.x, v.y, 0, ENTRANCE_Y); v.goal = { x: 0, y: ENTRANCE_Y, type: 'exit' }; }

function processVisitorArrival(v, x, y) { const o = tile(x, y).object, d = OBJECTS[o]; if (d) {
    if (d.need === 'hunger' && v.hunger < 82) {
        v.hunger = 100;
        earn(d.sale || 5, 'shops');
        if (Math.random() < .11 && !nearbyBin(x, y))
            addLitter(x, y);
    }
    else if (d.need === 'thirst' && v.thirst < 85) {
        v.thirst = 100;
        earn(d.sale || 5, 'shops');
        if (Math.random() < .08 && !nearbyBin(x, y))
            addLitter(x, y);
    }
    else if (d.service === 'toilet')
        v.toilet = 100;
    else if (d.service === 'energy')
        v.energy = 100;
    else if (d.service === 'fun') {
        v.fun = 100;
        if (d.sale)
            earn(d.sale, 'shops');
    }
    else if (EDUCATION[o]) {
        v.education += d.education || 5;
        v.fun = clamp(v.fun + 18, 0, 100);
        v.satisfaction = clamp(v.satisfaction + 5, 0, 100);
        if (d.sale && Math.random() < .55)
            earn(d.sale, 'education');
    }
} if (v.goal?.type === 'view') {
    const p = penCache[v.goal.penId];
    if (p?.animals.length) {
        const avg = p.animals.reduce((a, b) => a + b.happiness, 0) / p.animals.length;
        v.fun = clamp(v.fun + 20 + avg * .13, 0, 100);
        v.education += 3;
        v.satisfaction = clamp(v.satisfaction + (avg - 50) * .07, 0, 100);
    }
} }

function updateVisitors(dt) { const capacity = clamp(18 + state.reputation * .15 + countCategory(FACILITIES) * 2, 20, 150); const chance = (.16 + state.reputation / 1300) * dt; if (state.visitors.length < capacity && Math.random() < chance)
    spawnVisitor(); for (let i = state.visitors.length - 1; i >= 0; i--) {
    const v = state.visitors[i];
    v.age += dt;
    v.hunger -= dt * .18;
    v.thirst -= dt * .23;
    v.toilet -= dt * .15;
    v.energy -= dt * .11;
    v.fun -= dt * .09;
    v.litterCooldown -= dt;
    const penalty = (v.hunger < 18 ? 5 : 0) + (v.thirst < 18 ? 6 : 0) + (v.toilet < 14 ? 8 : 0) + (v.energy < 12 ? 5 : 0) + (state.cleanliness < 55 ? 5 : 0);
    v.satisfaction = clamp(v.satisfaction - dt * penalty * .12, 0, 100);
    if (v.age > v.maxAge || v.satisfaction < 8) {
        state.satisfaction = state.satisfaction * .96 + v.satisfaction * .04;
        state.education = clamp(state.education * .995 + v.education * .005, 0, 100);
        state.visitors.splice(i, 1);
        continue;
    }
    if (!v.path.length) {
        processVisitorArrival(v, Math.floor(v.x), Math.floor(v.y));
        chooseVisitorGoal(v);
        if (!v.path.length)
            continue;
    }
    moveEntity(v, dt, v.speed);
} }

function moveEntity(e, dt, speed) { if (!e.path?.length)
    return; const [tx, ty] = e.path[0], gx = tx + .5, gy = ty + .5, dx = gx - e.x, dy = gy - e.y, len = Math.hypot(dx, dy), cx = clamp(Math.floor(e.x), 0, COLS - 1), cy = clamp(Math.floor(e.y), 0, ROWS - 1), pathBoost = GROUND[tile(cx, cy).ground]?.walkSpeed || 1; if (len < .05) {
    e.x = gx;
    e.y = gy;
    e.path.shift();
}
else {
    e.x += dx / len * dt * speed * pathBoost;
    e.y += dy / len * dt * speed * pathBoost;
} }
