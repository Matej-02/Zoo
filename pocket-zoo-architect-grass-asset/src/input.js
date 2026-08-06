/* Pocket Zoo Architect — input */
'use strict';

function entityHitAtScreen(point) {
    let best = null;
    const candidates = [];
    for (const animal of state.animals)
        candidates.push({ type: 'animal', x: animal.px, y: animal.py, tileX: Math.floor(animal.px), tileY: Math.floor(animal.py), radiusX: 30, radiusY: 44 });
    for (const employee of state.staff)
        candidates.push({ type: 'staff', x: employee.x, y: employee.y, tileX: Math.floor(employee.x), tileY: Math.floor(employee.y), radiusX: 18, radiusY: 34 });
    for (const visitor of state.visitors)
        candidates.push({ type: 'visitor', x: visitor.x, y: visitor.y, tileX: Math.floor(visitor.x), tileY: Math.floor(visitor.y), radiusX: 14, radiusY: 28 });
    for (const candidate of candidates) {
        const screen = worldToScreen(candidate.x, candidate.y);
        const dx = Math.abs(point.x - screen.x), dy = point.y - screen.y;
        if (dx <= candidate.radiusX && dy <= 12 && dy >= -candidate.radiusY) {
            const score = dx + Math.abs(dy) * .55;
            if (!best || score < best.score) best = { ...candidate, score };
        }
    }
    return best;
}

function eventTile(event) {
    const point = canvasPointFromEvent(event);
    if (['inspect', 'erase'].includes(state.selected)) {
        const hit = entityHitAtScreen(point);
        if (hit) return { x: hit.tileX, y: hit.tileY, point, hit };
    }
    const world = screenToWorld(point.x, point.y);
    return { x: Math.floor(world.x), y: Math.floor(world.y), point, hit: null };
}

function pointerDown(event) {
    if (event.button !== 0) return;
    painting = true; lastPaint = '';
    pointerAction(event);
    canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
}

function pointerMove(event) {
    const position = eventTile(event);
    hoverTile = { x: position.x, y: position.y };
    if (painting) pointerAction(event);
    event.preventDefault();
}

function pointerAction(event) {
    const position = eventTile(event), tileKey = key(position.x, position.y), definition = TOOLS[state.selected];
    const drag = state.selected === 'erase' || isPathGround(state.selected) || definition?.ground || !!FENCES[state.selected];
    if (tileKey !== lastPaint && (lastPaint === '' || drag)) {
        place(position.x, position.y);
        lastPaint = tileKey;
        updateUI();
    }
}

function pointerUp() { painting = false; lastPaint = ''; }

canvas.addEventListener('pointerdown', pointerDown);
canvas.addEventListener('pointermove', pointerMove);
canvas.addEventListener('pointerleave', () => { hoverTile = null; });
function setZoom(nextZoom, clientX = null, clientY = null) {
    const oldZoom = zoom;
    nextZoom = clamp(nextZoom, .38, 1.7);
    if (Math.abs(nextZoom - oldZoom) < .001) return;
    const rect = wrap.getBoundingClientRect();
    const anchorX = clientX == null ? wrap.clientWidth / 2 : clientX - rect.left;
    const anchorY = clientY == null ? wrap.clientHeight / 2 : clientY - rect.top;
    const canvasLeft = canvas.offsetLeft;
    const canvasTop = canvas.offsetTop;
    const worldX = (wrap.scrollLeft + anchorX - canvasLeft) / oldZoom;
    const worldY = (wrap.scrollTop + anchorY - canvasTop) / oldZoom;
    zoom = nextZoom;
    applyZoom();
    wrap.scrollLeft = Math.max(0, canvasLeft + worldX * zoom - anchorX);
    wrap.scrollTop = Math.max(0, canvasTop + worldY * zoom - anchorY);
}

canvas.addEventListener('wheel', event => {
    event.preventDefault();
    setZoom(zoom + (event.deltaY < 0 ? .09 : -.09), event.clientX, event.clientY);
}, { passive: false });

const touchPointers = new Map();
let pinchStartDistance = 0, pinchStartZoom = zoom, pinchCenter = null;
canvas.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch') return;
    touchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (touchPointers.size === 2) {
        painting = false;
        const points = [...touchPointers.values()];
        pinchStartDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        pinchStartZoom = zoom;
        pinchCenter = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
    }
}, { passive: false });
canvas.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch' || !touchPointers.has(event.pointerId)) return;
    touchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (touchPointers.size === 2 && pinchStartDistance > 0) {
        const points = [...touchPointers.values()];
        const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        const center = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
        if (pinchCenter) {
            wrap.scrollLeft -= center.x - pinchCenter.x;
            wrap.scrollTop -= center.y - pinchCenter.y;
        }
        setZoom(pinchStartZoom * distance / pinchStartDistance, center.x, center.y);
        pinchCenter = center;
        event.preventDefault();
    }
}, { passive: false });
function releaseTouchPointer(event) {
    touchPointers.delete(event.pointerId);
    if (touchPointers.size < 2) { pinchStartDistance = 0; pinchCenter = null; }
}
canvas.addEventListener('pointerup', releaseTouchPointer);
canvas.addEventListener('pointercancel', releaseTouchPointer);
window.addEventListener('pointerup', pointerUp);

function applyZoom() {
    canvas.style.width = `${canvas.width * zoom}px`;
    canvas.style.height = `${canvas.height * zoom}px`;
}

function centerCanvas() { centerOnWorld(3.5, ENTRANCE_Y + .5, true); }
