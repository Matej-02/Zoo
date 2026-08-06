/* Pocket Zoo Architect — render/camera */
'use strict';

const CAMERA_DIRECTIONS = ['North-east', 'South-east', 'South-west', 'North-west'];
let cameraOrderCache = null;
let cameraOrderRotation = -1;

function normalizedRotation() {
    return ((Number(state.camera?.rotation) || 0) % 4 + 4) % 4;
}

function rotatedDimensions(rotation = normalizedRotation()) {
    return rotation % 2 === 0 ? { cols: COLS, rows: ROWS } : { cols: ROWS, rows: COLS };
}

function rotateWorldPoint(x, y, rotation = normalizedRotation()) {
    if (rotation === 1)
        return { x: ROWS - y, y: x };
    if (rotation === 2)
        return { x: COLS - x, y: ROWS - y };
    if (rotation === 3)
        return { x: y, y: COLS - x };
    return { x, y };
}

function unrotateWorldPoint(x, y, rotation = normalizedRotation()) {
    if (rotation === 1)
        return { x: y, y: ROWS - x };
    if (rotation === 2)
        return { x: COLS - x, y: ROWS - y };
    if (rotation === 3)
        return { x: COLS - y, y: x };
    return { x, y };
}

function cameraOrigin(rotation = normalizedRotation()) {
    const dims = rotatedDimensions(rotation);
    return {
        x: CAMERA_PAD + dims.rows * ISO_TILE_W / 2,
        y: CAMERA_PAD
    };
}

function worldToScreen(x, y, z = 0, rotation = normalizedRotation()) {
    const r = rotateWorldPoint(x, y, rotation);
    const origin = cameraOrigin(rotation);
    return {
        x: origin.x + (r.x - r.y) * ISO_TILE_W / 2,
        y: origin.y + (r.x + r.y) * ISO_TILE_H / 2 - z
    };
}

function screenToWorld(x, y, z = 0, rotation = normalizedRotation()) {
    const origin = cameraOrigin(rotation);
    const dx = x - origin.x;
    const dy = y - origin.y + z;
    const rotated = {
        x: dy / ISO_TILE_H + dx / ISO_TILE_W,
        y: dy / ISO_TILE_H - dx / ISO_TILE_W
    };
    return unrotateWorldPoint(rotated.x, rotated.y, rotation);
}

function tileDiamond(x, y, z = 0) {
    return [
        worldToScreen(x, y, z),
        worldToScreen(x + 1, y, z),
        worldToScreen(x + 1, y + 1, z),
        worldToScreen(x, y + 1, z)
    ];
}

function tileCenterScreen(x, y, z = 0) {
    return worldToScreen(x + .5, y + .5, z);
}

function screenDepth(x, y) {
    const r = rotateWorldPoint(x, y);
    return r.x + r.y;
}

function tileDrawOrder() {
    const rotation = normalizedRotation();
    if (cameraOrderCache && cameraOrderRotation === rotation)
        return cameraOrderCache;
    cameraOrderRotation = rotation;
    cameraOrderCache = [];
    for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++)
            cameraOrderCache.push({ x, y, depth: screenDepth(x + .5, y + .5) });
    cameraOrderCache.sort((a, b) => a.depth - b.depth || a.y - b.y || a.x - b.x);
    return cameraOrderCache;
}

function canvasPointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) * canvas.width / rect.width,
        y: (event.clientY - rect.top) * canvas.height / rect.height
    };
}

function worldPointAtViewportCenter() {
    const x = (wrap.scrollLeft + wrap.clientWidth / 2 - canvas.offsetLeft) / zoom;
    const y = (wrap.scrollTop + wrap.clientHeight / 2 - canvas.offsetTop) / zoom;
    return screenToWorld(x, y);
}

function centerOnWorld(x, y, smooth = false) {
    const point = worldToScreen(x, y);
    wrap.scrollTo({
        left: Math.max(0, canvas.offsetLeft + point.x * zoom - wrap.clientWidth / 2),
        top: Math.max(0, canvas.offsetTop + point.y * zoom - wrap.clientHeight * .58),
        behavior: smooth ? 'smooth' : 'auto'
    });
}

function updateCameraUI() {
    const rotation = normalizedRotation();
    const label = document.getElementById('cameraDirection');
    if (label)
        label.textContent = CAMERA_DIRECTIONS[rotation];
    const compass = document.getElementById('compassNeedle');
    if (compass)
        compass.style.transform = `rotate(${rotation * 90}deg)`;
}

function rotateCamera(step) {
    const focus = worldPointAtViewportCenter();
    state.camera = state.camera || { rotation: 0 };
    state.camera.rotation = (normalizedRotation() + step + 4) % 4;
    cameraOrderCache = null;
    hoverTile = null;
    updateCameraUI();
    requestAnimationFrame(() => centerOnWorld(clamp(focus.x, 0, COLS), clamp(focus.y, 0, ROWS)));
    save(false);
    toast(`View rotated: ${CAMERA_DIRECTIONS[state.camera.rotation]}.`);
}
