/* Pocket Zoo Architect — core/save */
'use strict';

function applyCollapsed() {}
function initCollapsibles() {}

function serialize() {
    return {
        ...state,
        version: 9,
        camera: { rotation: normalizedRotation() },
        inspection: null,
        visitors: [],
        staff: state.staff.map(employee => ({ ...employee, path: [], task: null, workTimer: 0, tourStops: employee.tourStops || [] }))
    };
}

function save(show = true) {
    if (resetting) return;
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(serialize()));
        if (show) toast('Zoo saved in this browser.');
    }
    catch (error) {
        console.warn('Pocket Zoo save failed.', error);
        if (show) toast('Save failed: browser storage is unavailable.');
    }
}

const OBJECT_MAP = {
    fence: 'standardFence', stonefence: 'strongFence', gate: 'standardGate', bush: 'woodlandBush', flowers: 'wildflowers', enrichment: 'activityBall', snack: 'burger', oak: 'oak', pine: 'pine', palm: 'datePalm', acacia: 'acacia', shelter: 'shelter', feeder: 'feeder'
};
const GROUND_MAP = { water: 'shallowWater' };

function normalizeTiles(oldTiles) {
    const normalized = makeTiles();
    if (Array.isArray(oldTiles)) {
        for (let y = 0; y < Math.min(ROWS, oldTiles.length); y++)
            for (let x = 0; x < Math.min(COLS, oldTiles[y]?.length || 0); x++) {
                const old = oldTiles[y][x] || {}, ground = GROUND_MAP[old.ground] || old.ground, object = OBJECT_MAP[old.object] || old.object;
                normalized[y][x] = { ground: GROUND[ground] ? ground : 'grass', object: OBJECTS[object] ? object : null };
            }
    }
    for (let x = 0; x < 7; x++) normalized[ENTRANCE_Y][x].ground = 'path';
    return normalized;
}

function migrateStaff(data) {
    if (Array.isArray(data.staff)) {
        return data.staff.filter(employee => ['keeper', 'janitor', 'guide'].includes(employee.role)).map(employee => ({
            ...employee,
            id: employee.id || uid(), name: employee.name || randomName(employee.role), path: [], status: employee.status || 'Starting shift', task: null, workTimer: 0,
            cooldown: employee.role === 'guide' ? 4 : 0, tourStops: [], group: 0,
            speed: employee.role === 'janitor' ? 1.35 : employee.role === 'guide' ? .95 : 1.05,
            x: clamp(Number(employee.x) || .5, 0, COLS - 1), y: clamp(Number(employee.y) || ENTRANCE_Y + .5, 0, ROWS - 1)
        }));
    }
    const migrated = [], counts = data.staff || {};
    for (const role of ['keeper', 'janitor'])
        for (let i = 0; i < (counts[`${role}s`] || 0); i++)
            migrated.push({ id: uid(), role, name: randomName(role), x: .5, y: ENTRANCE_Y + .5, path: [], status: 'Starting shift', task: null, workTimer: 0, cooldown: 0, tourStops: [], group: 0, speed: role === 'janitor' ? 1.35 : 1.05 });
    return migrated;
}

function normalizeLedger(ledger, fallbackCalendar) {
    const normalized = newLedger({ month: Number.isInteger(ledger?.month) ? ledger.month : fallbackCalendar.month, year: Number.isInteger(ledger?.year) ? ledger.year : fallbackCalendar.year });
    for (const [category, amount] of Object.entries(ledger?.income || {})) normalized.income[category] = Number(amount) || 0;
    for (const [category, amount] of Object.entries(ledger?.expense || {})) normalized.expense[category] = Number(amount) || 0;
    normalized.closing = Number(ledger?.closing) || 0;
    normalized.net = Number.isFinite(ledger?.net) ? ledger.net : sumObj(normalized.income) - sumObj(normalized.expense);
    return normalized;
}

function migrateFinance(data) {
    if (data.finance?.current)
        return { current: normalizeLedger(data.finance.current, state.calendar), history: (data.finance.history || []).slice(-48).map(ledger => normalizeLedger(ledger, state.calendar)) };
    const finance = { current: newLedger(state.calendar), history: [] };
    if (data.finance?.today) {
        for (const [category, amount] of Object.entries(data.finance.today.income || {})) finance.current.income[category] = (finance.current.income[category] || 0) + (Number(amount) || 0);
        for (const [category, amount] of Object.entries(data.finance.today.expense || {})) finance.current.expense[category] = (finance.current.expense[category] || 0) + (Number(amount) || 0);
    }
    return finance;
}

function hydrateSave(data, source = SAVE_KEY) {
    if (!data || typeof data !== 'object') throw new Error('The save file does not contain a valid zoo object.');
    const oldVersion = Number(data.version) || 1;
    state.money = Number.isFinite(data.money) ? data.money : 4300;
    state.calendar = { day: clamp(Number(data.calendar?.day ?? data.day) || 1, 1, 31), month: clamp(Number(data.calendar?.month) || 0, 0, 11), year: clamp(Number(data.calendar?.year) || 2026, 1900, 9999) };
    state.tiles = normalizeTiles(data.tiles);
    state.unlocked = Array.isArray(data.unlocked) ? data.unlocked.filter(zone => ZONES[zone]) : ['core'];
    if (!state.unlocked.includes('core')) state.unlocked.unshift('core');

    state.animals = (data.animals || []).filter(animal => SPECIES[animal.species]).map(animal => {
        const migrated = {
            ...animal,
            id: animal.id || uid(), name: animal.name || randomName('animal'),
            px: Number.isFinite(animal.px) ? animal.px : (Number(animal.x) || 0) + .5,
            py: Number.isFinite(animal.py) ? animal.py : (Number(animal.y) || 0) + .5,
            targetX: Number.isFinite(animal.targetX) ? animal.targetX : Math.floor(Number(animal.px ?? animal.x) || 0),
            targetY: Number.isFinite(animal.targetY) ? animal.targetY : Math.floor(Number(animal.py ?? animal.y) || 0),
            dir: animal.dir || 1, moveTimer: Number(animal.moveTimer) || 0,
            hunger: clamp(Number(animal.hunger ?? 82), 0, 100), happiness: clamp(Number(animal.happiness ?? 70), 0, 100),
            hygiene: clamp(Number(animal.hygiene ?? 88), 0, 100), grooming: clamp(Number(animal.grooming ?? 88), 0, 100), health: clamp(Number(animal.health ?? 100), 0, 100),
            sick: Boolean(animal.sick), illnessDays: Math.max(0, Number(animal.illnessDays) || 0), ageDays: Math.max(0, Number(animal.ageDays ?? 365) || 0),
            juvenile: Boolean(animal.juvenile) || Number(animal.ageDays) < 90, sex: ['female', 'male'].includes(animal.sex) ? animal.sex : (Math.random() < .5 ? 'female' : 'male'),
            issues: Array.isArray(animal.issues) ? animal.issues : [], animOffset: Number(animal.animOffset) || Math.random() * 10
        };
        ensureAnimalCareFields(migrated);
        return migrated;
    });

    state.visitors = [];
    state.staff = migrateStaff(data);
    state.litter = (data.litter || []).slice(0, 50).map(item => ({ x: clamp(Number(item.x) || 0, 0, COLS - 1), y: clamp(Number(item.y) || 0, 0, ROWS - 1), amount: clamp(Number(item.amount) || 1, 1, 4) }));
    state.animalWaste = (data.animalWaste || []).slice(0, 90).map(item => ({ id: item.id || uid(), x: clamp(Number(item.x) || 0, 0, COLS - 1), y: clamp(Number(item.y) || 0, 0, ROWS - 1), amount: clamp(Number(item.amount) || 1, 1, 4), penId: Number(item.penId) || 0, animalId: item.animalId || null }));
    state.ticketPrice = clamp(Number(data.ticketPrice) || 13, 5, 35);
    state.completedGoals = Array.isArray(data.completedGoals) ? data.completedGoals.filter(id => GOALS.some(goal => goal.id === id)) : [];
    state.logs = Array.isArray(data.logs) ? data.logs.slice(0, 50) : [];
    state.zooEvents = Array.isArray(data.zooEvents) ? data.zooEvents.slice(0, 90).map(event => ({ ...event, id: event.id || uid(), unread: Boolean(event.unread) })) : [];
    state.dailyEventCounter = data.dailyEventCounter && typeof data.dailyEventCounter === 'object' ? data.dailyEventCounter : { key: '', count: 0 };
    state.totalGuests = Math.max(0, Number(data.totalGuests) || 0);
    state.reputation = Math.max(0, Number(data.reputation) || 30);
    state.cleanliness = clamp(Number(data.cleanliness ?? 100), 0, 100);
    state.satisfaction = clamp(Number(data.satisfaction ?? 70), 0, 100);
    state.animalHappiness = clamp(Number(data.animalHappiness) || 0, 0, 100);
    state.education = clamp(Number(data.education) || 0, 0, 100);
    state.finance = migrateFinance(data);
    state.startupMonthsRemaining = Number.isFinite(data.startupMonthsRemaining) ? clamp(data.startupMonthsRemaining, 0, 4) : 4;
    state.inspection = null;
    state.speed = [0, 1, 3].includes(Number(data.speed)) ? Number(data.speed) : 1;
    state.selected = TOOLS[data.selected] ? data.selected : 'path';
    state.category = ['build', 'terrain', 'fences', 'habitat', 'foliage', 'animals', 'facilities', 'education'].includes(data.category) ? data.category : 'build';
    state.activePanel = PANEL_META[data.activePanel] ? data.activePanel : 'overview';
    state.camera = { rotation: ((Number(data.camera?.rotation) || 0) % 4 + 4) % 4 };
    state.pulseMinimized = Boolean(data.pulseMinimized);
    state.version = 9; state.dayTimer = 0; state.autosaveTimer = 0;

    if (oldVersion < 8 && state.money < 2800) {
        state.money += 750;
        state.logs.unshift(`${dateText()} — Living Zoo migration grant received: ${money(750)}.`);
    }
    if (source !== SAVE_KEY) state.logs.unshift(`${dateText()} — Previous Pocket Zoo save upgraded to Living Zoo.`);
    structureDirty = true;
}

function load() {
    let raw = null, source = SAVE_KEY;
    try {
        raw = localStorage.getItem(SAVE_KEY);
        if (!raw)
            for (const keyName of OLD_KEYS) {
                raw = localStorage.getItem(keyName);
                if (raw) { source = keyName; break; }
            }
    }
    catch (error) { console.warn('Pocket Zoo storage could not be read.', error); return false; }
    if (!raw) return false;
    try { hydrateSave(JSON.parse(raw), source); return true; }
    catch (error) { console.warn('Pocket Zoo save could not be loaded.', error); return false; }
}

function clearAllSaves() {
    try { localStorage.removeItem(SAVE_KEY); for (const keyName of OLD_KEYS) localStorage.removeItem(keyName); }
    catch (error) { console.warn('Pocket Zoo saves could not be cleared.', error); }
}

function resetGame() {
    if (!confirm('Start a completely new zoo? All browser save data for Pocket Zoo will be removed.')) return;
    resetting = true; clearAllSaves(); location.reload();
}

function exportSave() {
    const blob = new Blob([JSON.stringify(serialize(), null, 2)], { type: 'application/json' }), link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = 'pocket-zoo-living-zoo-save.json'; link.click(); URL.revokeObjectURL(link.href);
}

async function importSaveFile(file) {
    if (!file) return;
    try {
        hydrateSave(JSON.parse(await file.text()), 'import');
        refreshAccessiblePaths(); analyzePens(); calculateZooMetrics(); renderTools(); renderGoals(); renderLog(); renderLand(); renderZooEvents(); updateUI(); openPanel(state.activePanel || 'overview'); save(false);
        toast('Save imported successfully.'); log('A portable save file was imported.');
    }
    catch (error) { console.warn('Pocket Zoo import failed.', error); toast('Import failed: choose a valid Pocket Zoo JSON save.'); }
}
