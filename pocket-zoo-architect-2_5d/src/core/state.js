/* Pocket Zoo Architect — core/state */
'use strict';

function makeTiles() { return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({ ground: 'grass', object: null }))); }

function newLedger(calendar) { return { month: calendar.month, year: calendar.year, income: { tickets: 0, shops: 0, tours: 0, donations: 0, support: 0, education: 0, refunds: 0 }, expense: { construction: 0, animals: 0, staffHiring: 0, land: 0, animalCare: 0, utilities: 0, payroll: 0 }, closing: 0 }; }

const state = { version: 7, money: 4300, calendar: { day: 1, month: 2, year: 2026 }, dayTimer: 0, speed: 1, selected: 'path', category: 'build', tiles: makeTiles(), unlocked: ['core'], animals: [], visitors: [], staff: [], litter: [], reputation: 30, cleanliness: 100, satisfaction: 70, education: 0, totalGuests: 0, completedGoals: [], logs: [], ticketPrice: 13, finance: { current: null, history: [] }, autosaveTimer: 0, startupMonthsRemaining: 4, collapsed: {}, inspection: null, camera: { rotation: 0 } };

state.finance.current = newLedger(state.calendar);

for (let x = 0; x < 7; x++)
    state.tiles[ENTRANCE_Y][x].ground = 'path';

let penCache = [], accessiblePaths = new Set(), structureDirty = true, hoverTile = null, painting = false, lastPaint = '', toastTimer = null;
