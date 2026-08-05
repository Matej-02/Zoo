/* Pocket Zoo Architect — systems/staff */
'use strict';

function hire(role) { if (!spend(HIRE_COST[role], 'staffHiring'))
    return; const s = { id: uid(), role, name: randomName(role), x: .5, y: ENTRANCE_Y + .5, path: [], status: 'Starting shift', task: null, workTimer: 0, cooldown: role === 'guide' ? 3 : 0, speed: role === 'janitor' ? 1.35 : role === 'guide' ? .95 : 1.05, tourStops: [], group: 0 }; state.staff.push(s); log(`${s.name} joined as ${role}. Monthly salary: ${money(SALARY[role])}.`); checkGoals(); updateUI(); }

function dismiss(role) { const list = state.staff.filter(s => s.role === role); if (!list.length) {
    toast(`No ${role} to dismiss.`);
    return;
} const s = list[list.length - 1]; state.staff.splice(state.staff.indexOf(s), 1); log(`${s.name} left the zoo staff.`); toast(`${s.name} dismissed.`); updateUI(); }

function randomAccessiblePath() { const arr = [...accessiblePaths]; if (!arr.length)
    return [0, ENTRANCE_Y]; return arr[Math.floor(Math.random() * arr.length)].split(',').map(Number); }

function assignKeeper(s) { let target = null, score = -1; for (const p of penCache) {
    if (!p.animals.length || !gateWorkspot(p))
        continue;
    const hunger = p.animals.reduce((a, b) => a + b.hunger, 0) / p.animals.length;
    const sc = 100 - hunger;
    if (sc > score) {
        score = sc;
        target = p;
    }
} if (target && score > 18) {
    const spot = gateWorkspot(target), p = pathfind(s.x, s.y, spot[0], spot[1]);
    if (p.length) {
        s.task = { type: 'feed', penId: target.id };
        s.path = p;
        s.status = `Walking to habitat ${target.id + 1}`;
        return;
    }
} const r = randomAccessiblePath(); s.path = pathfind(s.x, s.y, r[0], r[1]); s.task = { type: 'patrol' }; s.status = 'Inspecting habitats'; }

function assignJanitor(s) { if (state.litter.length) {
    let best = null, bd = 999;
    for (const l of state.litter) {
        const d = Math.abs(l.x - s.x) + Math.abs(l.y - s.y);
        if (d < bd && accessiblePaths.has(key(l.x, l.y))) {
            best = l;
            bd = d;
        }
    }
    if (best) {
        const p = pathfind(s.x, s.y, best.x, best.y);
        if (p.length || Math.floor(s.x) === best.x && Math.floor(s.y) === best.y) {
            s.task = { type: 'clean', x: best.x, y: best.y };
            s.path = p;
            s.status = 'Walking to litter';
            return;
        }
    }
} const r = randomAccessiblePath(); s.path = pathfind(s.x, s.y, r[0], r[1]); s.task = { type: 'patrol' }; s.status = 'Patrolling paths'; }

function tourCandidates() { return [...viewingTargets(), ...facilityTargets().filter(t => EDUCATION[t.o])].sort(() => Math.random() - .5); }

function startTour(s) { const c = tourCandidates(); if (c.length < 2) {
    s.cooldown = 8;
    s.status = 'Waiting for tour stops';
    return;
} const first = c[0], p = pathfind(s.x, s.y, first.x, first.y); if (!p.length) {
    s.cooldown = 5;
    return;
} s.tourStops = c.slice(0, Math.min(5, c.length)); s.task = { type: 'tour' }; s.path = p; s.group = 4 + Math.floor(Math.random() * 5); s.status = `Leading a group of ${s.group}`; earn(s.group * 5, 'tours'); state.satisfaction = clamp(state.satisfaction + 1.2, 0, 100); }

function advanceTour(s) { s.tourStops.shift(); state.education = clamp(state.education + 1.2, 0, 100); state.reputation += .5; if (!s.tourStops.length) {
    s.task = null;
    s.group = 0;
    s.cooldown = 12 + Math.random() * 12;
    s.status = 'Tour complete';
    return;
} const t = s.tourStops[0], p = pathfind(s.x, s.y, t.x, t.y); if (p.length) {
    s.path = p;
    s.status = `Tour stop: ${t.type === 'view' ? 'animal habitat' : OBJECTS[t.o]?.name || 'education'}`;
}
else
    advanceTour(s); }

function completeStaffTask(s) { if (s.task?.type === 'feed') {
    const p = penCache[s.task.penId];
    if (p)
        for (const a of p.animals)
            a.hunger = clamp(a.hunger + 42, 0, 100);
    s.status = 'Food stations refilled';
}
else if (s.task?.type === 'clean') {
    const l = state.litter.find(x => x.x === s.task.x && x.y === s.task.y);
    if (l) {
        l.amount -= 4;
        if (l.amount <= 0)
            state.litter.splice(state.litter.indexOf(l), 1);
    }
    s.status = 'Area cleaned';
} s.task = null; s.workTimer = 0; }

function updateStaff(dt) { for (const s of state.staff) {
    if (s.role === 'guide') {
        s.cooldown -= dt;
        if (s.path.length) {
            moveEntity(s, dt, s.speed);
            if (!s.path.length && s.task?.type === 'tour') {
                s.workTimer = 1.8;
                s.status = 'Giving an educational talk';
            }
        }
        else if (s.workTimer > 0) {
            s.workTimer -= dt;
            if (s.workTimer <= 0)
                advanceTour(s);
        }
        else if (!s.task && s.cooldown <= 0)
            startTour(s);
        continue;
    }
    if (s.workTimer > 0) {
        s.workTimer -= dt;
        s.status = s.role === 'keeper' ? 'Feeding animals' : 'Cleaning litter';
        if (s.workTimer <= 0)
            completeStaffTask(s);
        continue;
    }
    if (!s.path.length) {
        if (s.task?.type === 'feed') {
            s.workTimer = 1.4;
            continue;
        }
        if (s.task?.type === 'clean') {
            s.workTimer = .55;
            continue;
        }
        if (s.role === 'keeper')
            assignKeeper(s);
        else
            assignJanitor(s);
    }
    if (s.path.length)
        moveEntity(s, dt, s.speed);
} }
