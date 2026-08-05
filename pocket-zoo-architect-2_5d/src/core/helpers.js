/* Pocket Zoo Architect — core/helpers */
'use strict';

function zoneAt(x, y) { return Object.entries(ZONES).find(([, z]) => x >= z.x && y >= z.y && x < z.x + z.w && y < z.y + z.h)?.[0] || null; }

function isUnlocked(x, y) { const z = zoneAt(x, y); return !!z && state.unlocked.includes(z); }

function isPathGround(g) { return !!GROUND[g]?.path; }

function isWaterGround(g) { return ['shallowWater', 'deepWater', 'saltWater'].includes(g); }

function foliageAllowed(id, ground) { return !!FOLIAGE[id]?.allowedGrounds?.includes(ground); }

function foliageTerrainText(id) { return (FOLIAGE[id]?.allowedGrounds || []).map(g => GROUND[g]?.name || g).join(', '); }

function isBarrier(o) { return !!FENCES[o]; }

function isGate(o) { return !!FENCES[o]?.gate; }

function isFacility(o) { return !!FACILITIES[o] || !!EDUCATION[o]; }

function countObject(id) { let n = 0; for (const row of state.tiles)
    for (const t of row)
        if (t.object === id)
            n++; return n; }

function hasObject(id) { return countObject(id) > 0; }

function countCategory(dict) { let n = 0; for (const row of state.tiles)
    for (const t of row)
        if (dict[t.object])
            n++; return n; }

function countGround(id) { let n = 0; for (const row of state.tiles)
    for (const t of row)
        if (t.ground === id)
            n++; return n; }

function countStaff(role) { return state.staff.filter(s => s.role === role).length; }

function sumObj(o) { return Object.values(o || {}).reduce((a, b) => a + (Number(b) || 0), 0); }

function currentMonthName(short = false) { const m = MONTHS[state.calendar.month]; return `${short ? m.slice(0, 3) : m} ${state.calendar.year}`; }

function dateText() { return `${state.calendar.day} ${MONTHS[state.calendar.month].slice(0, 3)} ${state.calendar.year}`; }

function daysInMonth(month, year) { return new Date(year, month + 1, 0).getDate(); }

function nextMonthText() { const m = (state.calendar.month + 1) % 12, y = state.calendar.year + (state.calendar.month === 11 ? 1 : 0); return `1 ${MONTHS[m].slice(0, 3)}` + (y !== state.calendar.year ? ` ${y}` : ''); }

function getStars() { return clamp(Math.floor(state.reputation / 145) + 1, 1, 5); }

function toolUnlocked(id) { return !TOOLS[id]?.stars || getStars() >= TOOLS[id].stars; }

function randomName(type) { const a = NAMES[type]; return a[Math.floor(Math.random() * a.length)]; }

function uid() { return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`; }

function setMessage(s) { $('#message').textContent = s; }

function toast(s) { $('#toast').textContent = s; $('#toast').classList.add('show-toast'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show-toast'), 2200); }

function log(s) { state.logs.unshift(`${dateText()} — ${s}`); state.logs = state.logs.slice(0, 35); renderLog(); }

function renderLog() { $('#log').innerHTML = state.logs.map(x => `<div class="log-entry">${x}</div>`).join('') || 'No events yet.'; }

function animalAt(x, y) { return state.animals.find(a => Math.floor(a.px) === x && Math.floor(a.py) === y); }

function staffAt(x, y) { return state.staff.find(s => Math.floor(s.x) === x && Math.floor(s.y) === y); }

function visitorAt(x, y) { return state.visitors.find(v => Math.floor(v.x) === x && Math.floor(v.y) === y); }

function penAt(x, y) { return penCache.find(p => p.cellSet.has(key(x, y))); }
