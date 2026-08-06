/* Pocket Zoo Architect — systems/staff */
'use strict';

function hire(role) {
    if (!spend(HIRE_COST[role], 'staffHiring')) return;
    const employee = { id: uid(), role, name: randomName(role), x: .5, y: ENTRANCE_Y + .5, path: [], status: 'Starting shift', task: null, workTimer: 0, cooldown: role === 'guide' ? 3 : 0, speed: role === 'janitor' ? 1.35 : role === 'guide' ? .95 : 1.05, tourStops: [], group: 0 };
    state.staff.push(employee);
    log(`${employee.name} joined as ${role}. Monthly salary: ${money(SALARY[role])}.`);
    pushZooEvent('staff', 'New employee', `${employee.name} joined the zoo as a ${role}.`, { key: `hire:${employee.id}` });
    checkGoals(); updateUI();
}

function dismiss(role) {
    const list = state.staff.filter(employee => employee.role === role);
    if (!list.length) { toast(`No ${role} to dismiss.`); return; }
    const employee = list[list.length - 1];
    state.staff.splice(state.staff.indexOf(employee), 1);
    log(`${employee.name} left the zoo staff.`); toast(`${employee.name} dismissed.`); updateUI();
}

function randomAccessiblePath() {
    const paths = [...accessiblePaths];
    if (!paths.length) return [0, ENTRANCE_Y];
    return paths[Math.floor(Math.random() * paths.length)].split(',').map(Number);
}


function staffTaskClaims(employee, role = employee.role) {
    const claims = { animals: new Set(), litter: new Set(), penTasks: new Map() };
    for (const other of state.staff) {
        if (other === employee || other.role !== role || !other.task || other.task.type === 'patrol') continue;
        if (other.task.animalId) claims.animals.add(other.task.animalId);
        if (Number.isFinite(other.task.x) && Number.isFinite(other.task.y)) claims.litter.add(key(other.task.x, other.task.y));
        if (Number.isInteger(other.task.penId)) {
            if (!claims.penTasks.has(other.task.penId)) claims.penTasks.set(other.task.penId, new Set());
            claims.penTasks.get(other.task.penId).add(other.task.type);
        }
    }
    return claims;
}

function claimHasPenTask(claims, penId, ...taskTypes) {
    const set = claims.penTasks.get(penId);
    return Boolean(set && taskTypes.some(type => set.has(type)));
}

function workspotDistance(employee, pen) {
    const spot = gateWorkspot(pen);
    return spot ? Math.abs(spot[0] + .5 - employee.x) + Math.abs(spot[1] + .5 - employee.y) : Infinity;
}

function sendKeeperToPen(employee, pen, task, status) {
    const spot = gateWorkspot(pen);
    if (!spot) return false;
    const path = pathfind(employee.x, employee.y, spot[0], spot[1]);
    if (!path.length && (Math.floor(employee.x) !== spot[0] || Math.floor(employee.y) !== spot[1])) return false;
    employee.task = task; employee.path = path; employee.status = status;
    return true;
}

function assignKeeper(employee) {
    if (structureDirty) analyzePens();
    const claims = staffTaskClaims(employee, 'keeper');
    const prioritizedAnimals = predicate => state.animals
        .filter(animal => predicate(animal) && !claims.animals.has(animal.id))
        .sort((a, b) => {
            const penA = penCache[a.penId], penB = penCache[b.penId];
            return workspotDistance(employee, penA) - workspotDistance(employee, penB)
                || (a.health ?? 100) - (b.health ?? 100)
                || (a.hygiene ?? 100) - (b.hygiene ?? 100)
                || (a.grooming ?? 100) - (b.grooming ?? 100);
        });

    for (const sick of prioritizedAnimals(animal => animal.sick)) {
        const pen = penCache[sick.penId];
        if (pen && sendKeeperToPen(employee, pen, { type: 'treat', animalId: sick.id, penId: pen.id }, `Responding to ${sick.name}'s illness`)) return;
    }
    for (const criticalHygiene of prioritizedAnimals(animal => animal.hygiene < 42)) {
        const pen = penCache[criticalHygiene.penId];
        if (pen && sendKeeperToPen(employee, pen, { type: 'wash', animalId: criticalHygiene.id, penId: pen.id }, `Preparing to clean ${criticalHygiene.name}`)) return;
    }
    for (const criticalGrooming of prioritizedAnimals(animal => animal.grooming < 38)) {
        const pen = penCache[criticalGrooming.penId];
        if (pen && sendKeeperToPen(employee, pen, { type: 'groom', animalId: criticalGrooming.id, penId: pen.id }, `Preparing to groom ${criticalGrooming.name}`)) return;
    }

    const dirtyPens = penCache
        .filter(pen => pen.animals.length && gateWorkspot(pen) && !claimHasPenTask(claims, pen.id, 'cleanHabitat'))
        .map(pen => ({ pen, waste: state.animalWaste.filter(item => pen.cellSet.has(key(item.x, item.y))).reduce((sum, item) => sum + item.amount, 0) }))
        .filter(item => item.waste >= 3)
        .sort((a, b) => b.waste - a.waste || workspotDistance(employee, a.pen) - workspotDistance(employee, b.pen));
    if (dirtyPens.length && sendKeeperToPen(employee, dirtyPens[0].pen, { type: 'cleanHabitat', penId: dirtyPens[0].pen.id }, `Walking to clean habitat ${dirtyPens[0].pen.id + 1}`)) return;

    for (const hygiene of prioritizedAnimals(animal => animal.hygiene < 68)) {
        const pen = penCache[hygiene.penId];
        if (pen && sendKeeperToPen(employee, pen, { type: 'wash', animalId: hygiene.id, penId: pen.id }, `Preparing to clean ${hygiene.name}`)) return;
    }
    for (const grooming of prioritizedAnimals(animal => animal.grooming < 64)) {
        const pen = penCache[grooming.penId];
        if (pen && sendKeeperToPen(employee, pen, { type: 'groom', animalId: grooming.id, penId: pen.id }, `Preparing to groom ${grooming.name}`)) return;
    }

    const feedTargets = penCache
        .filter(pen => pen.animals.length && gateWorkspot(pen) && !claimHasPenTask(claims, pen.id, 'feed'))
        .map(pen => ({ pen, hunger: pen.animals.reduce((sum, animal) => sum + animal.hunger, 0) / pen.animals.length }))
        .filter(item => item.hunger < 72)
        .sort((a, b) => a.hunger - b.hunger || workspotDistance(employee, a.pen) - workspotDistance(employee, b.pen));
    if (feedTargets.length && sendKeeperToPen(employee, feedTargets[0].pen, { type: 'feed', penId: feedTargets[0].pen.id }, `Walking to feed habitat ${feedTargets[0].pen.id + 1}`)) return;

    const random = randomAccessiblePath();
    employee.path = pathfind(employee.x, employee.y, random[0], random[1]);
    employee.task = { type: 'patrol' };
    employee.status = 'Inspecting animal welfare';
}

function assignJanitor(employee) {
    const claims = staffTaskClaims(employee, 'janitor');
    if (state.litter.length) {
        let best = null, bestDistance = Infinity;
        for (const litter of state.litter) {
            const litterKey = key(litter.x, litter.y);
            const distance = Math.abs(litter.x - employee.x) + Math.abs(litter.y - employee.y) - litter.amount * .18;
            if (claims.litter.has(litterKey) || !accessiblePaths.has(litterKey)) continue;
            if (distance < bestDistance) { best = litter; bestDistance = distance; }
        }
        if (best) {
            const path = pathfind(employee.x, employee.y, best.x, best.y);
            if (path.length || (Math.floor(employee.x) === best.x && Math.floor(employee.y) === best.y)) {
                employee.task = { type: 'clean', x: best.x, y: best.y };
                employee.path = path;
                employee.status = 'Walking to public litter';
                return;
            }
        }
    }
    const random = randomAccessiblePath();
    employee.path = pathfind(employee.x, employee.y, random[0], random[1]);
    employee.task = { type: 'patrol' };
    employee.status = 'Patrolling public paths';
}

function tourCandidates() { return [...viewingTargets(), ...facilityTargets().filter(target => EDUCATION[target.o])].sort(() => Math.random() - .5); }
function startTour(employee) {
    const candidates = tourCandidates();
    if (candidates.length < 2) { employee.cooldown = 8; employee.status = 'Waiting for tour stops'; return; }
    const first = candidates[0], path = pathfind(employee.x, employee.y, first.x, first.y);
    if (!path.length) { employee.cooldown = 5; return; }
    employee.tourStops = candidates.slice(0, Math.min(5, candidates.length)); employee.task = { type: 'tour' }; employee.path = path; employee.group = 4 + Math.floor(Math.random() * 5); employee.status = `Leading a group of ${employee.group}`;
    earn(employee.group * 5, 'tours'); state.satisfaction = clamp(state.satisfaction + 1.2, 0, 100);
}
function advanceTour(employee) {
    employee.tourStops.shift(); state.education = clamp(state.education + 1.2, 0, 100); state.reputation += .5;
    if (!employee.tourStops.length) { employee.task = null; employee.group = 0; employee.cooldown = 12 + Math.random() * 12; employee.status = 'Tour complete'; return; }
    const target = employee.tourStops[0], path = pathfind(employee.x, employee.y, target.x, target.y);
    if (path.length) { employee.path = path; employee.status = `Tour stop: ${target.type === 'view' ? 'animal habitat' : OBJECTS[target.o]?.name || 'education'}`; }
    else advanceTour(employee);
}

function removeHabitatWaste(pen, amount = 6) {
    let remaining = amount;
    for (let i = state.animalWaste.length - 1; i >= 0 && remaining > 0; i--) {
        const waste = state.animalWaste[i];
        if (!pen.cellSet.has(key(waste.x, waste.y))) continue;
        const removed = Math.min(remaining, waste.amount); waste.amount -= removed; remaining -= removed;
        if (waste.amount <= 0) state.animalWaste.splice(i, 1);
    }
    structureDirty = true;
}

function completeStaffTask(employee) {
    const task = employee.task;
    if (task?.type === 'feed') {
        const pen = penCache[task.penId];
        if (pen) for (const animal of pen.animals) animal.hunger = clamp(animal.hunger + 48, 0, 100);
        employee.status = 'Food stations refilled';
    }
    else if (task?.type === 'cleanHabitat') {
        const pen = penCache[task.penId];
        if (pen) { removeHabitatWaste(pen, 18); for (const animal of pen.animals) animal.hygiene = clamp(animal.hygiene + 12, 0, 100); }
        employee.status = 'Habitat waste removed';
    }
    else if (task?.type === 'wash') {
        const animal = state.animals.find(item => item.id === task.animalId);
        if (animal) { animal.hygiene = clamp(animal.hygiene + 68, 0, 100); animal.health = clamp(animal.health + 4, 0, 100); employee.status = `${animal.name} cleaned`; }
    }
    else if (task?.type === 'groom') {
        const animal = state.animals.find(item => item.id === task.animalId);
        if (animal) { animal.grooming = clamp(animal.grooming + 72, 0, 100); animal.hygiene = clamp(animal.hygiene + 12, 0, 100); employee.status = `${animal.name} groomed`; }
    }
    else if (task?.type === 'treat') {
        const animal = state.animals.find(item => item.id === task.animalId);
        if (animal) {
            const treatment = 28; state.money -= treatment; record('expense', 'veterinary', treatment);
            animal.sick = false; animal.illnessDays = 0; animal.health = clamp(Math.max(animal.health, 82) + 12, 0, 100); animal.hygiene = clamp(animal.hygiene + 10, 0, 100);
            employee.status = `${animal.name} treated`;
            log(`${employee.name} treated ${animal.name}. Veterinary supplies cost ${money(treatment)}.`);
            pushZooEvent('animal', 'Animal recovered', `${animal.name} the ${SPECIES[animal.species].name.toLowerCase()} was treated by ${employee.name} and is recovering.`, { key: `recovered:${animal.id}:${state.calendar.year}-${state.calendar.month}-${state.calendar.day}` });
        }
    }
    else if (task?.type === 'clean') {
        const litter = state.litter.find(item => item.x === task.x && item.y === task.y);
        if (litter) { litter.amount -= 4; if (litter.amount <= 0) state.litter.splice(state.litter.indexOf(litter), 1); }
        employee.status = 'Public area cleaned';
    }
    employee.task = null; employee.workTimer = 0;
}

function taskDuration(type) {
    return { feed: 1.5, cleanHabitat: 1.3, wash: 1.8, groom: 2.1, treat: 2.5, clean: .55 }[type] || .8;
}

function taskStatus(employee) {
    const labels = { feed: 'Feeding animals', cleanHabitat: 'Cleaning habitat waste', wash: 'Cleaning an animal', groom: 'Grooming an animal', treat: 'Treating a sick animal', clean: 'Cleaning public litter' };
    return labels[employee.task?.type] || 'Working';
}

function updateStaff(dt) {
    for (const employee of state.staff) {
        if (employee.role === 'guide') {
            employee.cooldown -= dt;
            if (employee.path.length) { moveEntity(employee, dt, employee.speed); if (!employee.path.length && employee.task?.type === 'tour') { employee.workTimer = 1.8; employee.status = 'Giving an educational talk'; } }
            else if (employee.workTimer > 0) { employee.workTimer -= dt; if (employee.workTimer <= 0) advanceTour(employee); }
            else if (!employee.task && employee.cooldown <= 0) startTour(employee);
            continue;
        }
        if (employee.workTimer > 0) {
            employee.workTimer -= dt; employee.status = taskStatus(employee);
            if (employee.workTimer <= 0) completeStaffTask(employee);
            continue;
        }
        if (!employee.path.length) {
            if (employee.task && employee.task.type !== 'patrol') { employee.workTimer = taskDuration(employee.task.type); continue; }
            employee.task = null;
            if (employee.role === 'keeper') assignKeeper(employee); else assignJanitor(employee);
        }
        if (employee.path.length) moveEntity(employee, dt, employee.speed);
    }
}
