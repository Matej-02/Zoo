/* Pocket Zoo Architect — input */
'use strict';

function entityHitAtScreen(point) {
    let best = null;
    const candidates = [];
    for (const animal of state.animals)
        candidates.push({ type: 'animal', x: animal.px, y: animal.py, tileX: Math.floor(animal.px), tileY: Math.floor(animal.py), radiusX: 30, radiusY: 42 });
    for (const employee of state.staff)
        candidates.push({ type: 'staff', x: employee.x, y: employee.y, tileX: Math.floor(employee.x), tileY: Math.floor(employee.y), radiusX: 18, radiusY: 34 });
    for (const visitor of state.visitors)
        candidates.push({ type: 'visitor', x: visitor.x, y: visitor.y, tileX: Math.floor(visitor.x), tileY: Math.floor(visitor.y), radiusX: 14, radiusY: 28 });

    for (const candidate of candidates) {
        const screen = worldToScreen(candidate.x, candidate.y);
        const dx = Math.abs(point.x - screen.x);
        const dy = point.y - screen.y;
        if (dx <= candidate.radiusX && dy <= 12 && dy >= -candidate.radiusY) {
            const score = dx + Math.abs(dy) * .55;
            if (!best || score < best.score)
                best = { ...candidate, score };
        }
    }
    return best;
}

function eventTile(event) {
    const point = canvasPointFromEvent(event);
    if (['inspect', 'erase'].includes(state.selected)) {
        const hit = entityHitAtScreen(point);
        if (hit)
            return { x: hit.tileX, y: hit.tileY, point, hit };
    }
    const world = screenToWorld(point.x, point.y);
    return { x: Math.floor(world.x), y: Math.floor(world.y), point, hit: null };
}

function pointerDown(event) {
    if (event.button !== 0)
        return;
    painting = true;
    lastPaint = '';
    pointerAction(event);
    canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
}

function pointerMove(event) {
    const position = eventTile(event);
    hoverTile = { x: position.x, y: position.y };
    showHover(event, position);
    if (painting)
        pointerAction(event);
    event.preventDefault();
}

function pointerAction(event) {
    const position = eventTile(event);
    const k = key(position.x, position.y);
    const definition = TOOLS[state.selected];
    const drag = state.selected === 'erase' || isPathGround(state.selected) || definition?.ground || !!FENCES[state.selected];
    if (k !== lastPaint && (lastPaint === '' || drag)) {
        place(position.x, position.y);
        lastPaint = k;
        updateUI();
    }
}

function pointerUp() {
    painting = false;
    lastPaint = '';
}

function showHover(event, position) {
    const p = position;
    if (!inside(p.x, p.y)) {
        hoverTip.style.display = 'none';
        return;
    }
    let html = '';
    if (!isUnlocked(p.x, p.y)) {
        const z = ZONES[zoneAt(p.x, p.y)];
        html = `<div class="tip-title">${z.name}</div><div class="tip-line">Locked expansion · ${z.w * z.h} tiles · ${money(z.cost)}</div><div class="tip-line">${z.desc}</div>`;
    }
    else {
        const t = tile(p.x, p.y), groundDef = GROUND[t.ground], a = animalAt(p.x, p.y), s = staffAt(p.x, p.y), v = visitorAt(p.x, p.y), o = t.object, pen = penAt(p.x, p.y);
        if (a) {
            const sp = SPECIES[a.species];
            html = `<div class="tip-title">${a.name} · ${sp.name}</div><div class="tip-line">Happiness ${Math.round(a.happiness)}% · Hunger ${Math.round(a.hunger)}%</div><div class="tip-line">Care ${money(Math.round(sp.care * CARE_MULTIPLIER))}/month</div>${a.issues?.length ? `<div class="tip-line tip-bad">${a.issues[0]}</div>` : '<div class="tip-line tip-good">All current welfare needs met</div>'}`;
        }
        else if (s)
            html = `<div class="tip-title">${s.name} · ${staffIcon(s.role)}</div><div class="tip-line">${s.status}</div><div class="tip-line">Salary ${money(SALARY[s.role])}/month</div>`;
        else if (v)
            html = `<div class="tip-title">Zoo guest</div><div class="tip-line">Satisfaction ${Math.round(v.satisfaction)}% · Education ${Math.round(v.education)}</div>`;
        else if (o) {
            const d = OBJECTS[o];
            html = `<div class="tip-title">${d.name}</div><div class="tip-line">${d.desc || ''}</div>${d.monthly ? `<div class="tip-line">Upkeep ${money(d.monthly)}/month</div>` : ''}${FOLIAGE[o] ? `<div class="tip-line">Allowed on ${foliageTerrainText(o)}</div>` : ''}${FENCES[o] ? `<div class="tip-line">Strength ${d.strength} · Height ${d.height}${d.waterproof ? ' · Waterproof' : ''}</div>` : ''}`;
        }
        else
            html = `<div class="tip-title">${groundDef?.name || t.ground}</div><div class="tip-line">${groundDef?.desc || ''}</div>${isPathGround(t.ground) ? `<div class="tip-line">Walking speed ${Math.round((groundDef.walkSpeed || 1) * 100)}% · Appeal ${groundDef.pathAppeal || 0}</div>` : ''}${pen?.enclosed ? `<div class="tip-line">Habitat ${pen.id + 1} · ${pen.cells.length} tiles · ${pen.animals.length} animals</div>` : ''}`;
        const selected = TOOLS[state.selected];
        if (state.selected === 'erase')
            html += `<div class="tip-action">Click to remove ${o ? OBJECTS[o].name : groundDef?.name || 'this tile'}.</div>`;
        else if (state.selected === 'inspect')
            html += '<div class="tip-action">Click to inspect. Details will keep updating.</div>';
        else if (FOLIAGE[state.selected])
            html += `<div class="tip-action ${foliageAllowed(state.selected, t.ground) ? 'tip-good' : 'tip-bad'}">${foliageAllowed(state.selected, t.ground) ? 'Valid terrain' : 'Needs ' + foliageTerrainText(state.selected)}</div>`;
        else if (FENCES[state.selected]?.gate && FENCES[o] && !FENCES[o].gate)
            html += `<div class="tip-action tip-good">Will replace ${OBJECTS[o].name} with this gate.</div>`;
        else if (selected)
            html += `<div class="tip-action">Selected: ${selected.name}${selected.cost ? ` · ${money(selected.cost)}` : ''}</div>`;
    }
    hoverTip.innerHTML = html;
    hoverTip.style.display = 'block';
    const area = $('#canvasArea').getBoundingClientRect();
    const left = Math.min(area.width - hoverTip.offsetWidth - 8, Math.max(8, event.clientX - area.left + 14));
    const top = Math.min(area.height - hoverTip.offsetHeight - 8, Math.max(8, event.clientY - area.top + 14));
    hoverTip.style.left = `${left}px`;
    hoverTip.style.top = `${top}px`;
}

canvas.addEventListener('pointerdown', pointerDown);
canvas.addEventListener('pointermove', pointerMove);
canvas.addEventListener('pointerleave', () => {
    hoverTile = null;
    hoverTip.style.display = 'none';
});
window.addEventListener('pointerup', pointerUp);

function applyZoom() {
    canvas.style.width = `${canvas.width * zoom}px`;
    canvas.style.height = `${canvas.height * zoom}px`;
}

function centerCanvas() {
    centerOnWorld(3.5, ENTRANCE_Y + .5, true);
}
