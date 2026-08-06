/* Pocket Zoo Architect — systems/navigation */
'use strict';

function refreshAccessiblePaths() {
    accessiblePaths = new Set();
    const starts = [];
    for (let x = 0; x < 7; x++)
        if (isUnlocked(x, ENTRANCE_Y) && isPathGround(tile(x, ENTRANCE_Y).ground))
            starts.push([x, ENTRANCE_Y]);
    const q = [...starts];
    for (const [x, y] of starts)
        accessiblePaths.add(key(x, y));
    for (let i = 0; i < q.length; i++) {
        const [x, y] = q[i];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx, ny = y + dy, k = key(nx, ny);
            if (inside(nx, ny) && isUnlocked(nx, ny) && isPathGround(tile(nx, ny).ground) && !accessiblePaths.has(k)) {
                accessiblePaths.add(k);
                q.push([nx, ny]);
            }
        }
    }
}

function pathfind(sx, sy, tx, ty) {
    sx = Math.floor(sx);
    sy = Math.floor(sy);
    tx = Math.floor(tx);
    ty = Math.floor(ty);
    const sk = key(sx, sy), tk = key(tx, ty);
    if (!accessiblePaths.has(sk) || !accessiblePaths.has(tk))
        return [];
    const q = [[sx, sy]], prev = new Map([[sk, null]]);
    for (let i = 0; i < q.length; i++) {
        const [x, y] = q[i];
        if (x === tx && y === ty)
            break;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx, ny = y + dy, k = key(nx, ny);
            if (accessiblePaths.has(k) && !prev.has(k)) {
                prev.set(k, key(x, y));
                q.push([nx, ny]);
            }
        }
    }
    if (!prev.has(tk))
        return [];
    const out = [];
    let cur = tk;
    while (cur && cur !== sk) {
        out.push(cur.split(',').map(Number));
        cur = prev.get(cur);
    }
    return out.reverse();
}
