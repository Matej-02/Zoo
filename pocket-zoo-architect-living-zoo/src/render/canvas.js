/* Pocket Zoo Architect — render/canvas */
'use strict';

function rect(x, y, w, h, fill, stroke) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
} }

function ellipse(x, y, rx, ry, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }

function line(x1, y1, x2, y2, color, width = 2) { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

function polygon(points, fill, stroke = null, width = 1) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++)
        ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.stroke();
    }
}

function insetPoints(points, amount = .12) {
    const center = points.reduce((acc, point) => ({ x: acc.x + point.x / points.length, y: acc.y + point.y / points.length }), { x: 0, y: 0 });
    return points.map(point => ({ x: point.x + (center.x - point.x) * amount, y: point.y + (center.y - point.y) * amount }));
}

function roundedLabel(text, x, y, fill = 'rgba(20,45,33,.88)') {
    ctx.save();
    ctx.font = '700 12px system-ui';
    ctx.textAlign = 'center';
    const width = ctx.measureText(text).width + 20;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - 14, width, 25, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(text, x, y + 3);
    ctx.restore();
}

function drawGround(t, x, y, locked = false) {
    const definition = GROUND[t.ground] || GROUND.grass;
    const points = tileDiamond(x, y);
    const center = tileCenterScreen(x, y);
    let fill = locked ? ((x + y) % 2 ? '#66845e' : '#6f8d66') : definition.color;

    if (!locked && isWaterGround(t.ground)) {
        const gradient = ctx.createLinearGradient(center.x, points[0].y, center.x, points[2].y);
        gradient.addColorStop(0, t.ground === 'saltWater' ? '#3f94ba' : '#78c0d1');
        gradient.addColorStop(1, definition.color);
        fill = gradient;
    }

    polygon(points, fill, locked ? 'rgba(29,58,42,.18)' : 'rgba(33,65,47,.12)', 1);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++)
        ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.clip();

    const seed = (x * 928371 + y * 1237) % 17;
    ctx.globalAlpha = locked ? .13 : .2;
    if (locked) {
        if ((x * 7 + y * 3) % 5 === 0) {
            const trunk = tileCenterScreen(x, y, 2);
            line(trunk.x, trunk.y + 5, trunk.x, trunk.y - 16, '#384f36', 3);
            polygon([{ x: trunk.x, y: trunk.y - 30 }, { x: trunk.x - 12, y: trunk.y - 7 }, { x: trunk.x + 12, y: trunk.y - 7 }], '#3e744b');
        }
    }
    else if (t.ground === 'grass') {
        ctx.strokeStyle = '#3f8243';
        ctx.lineWidth = 1.1;
        for (let i = 0; i < 5; i++) {
            const px = points[3].x + 12 + ((seed * 11 + i * 17) % Math.max(16, ISO_TILE_W - 24));
            const py = center.y - 4 + ((seed + i * 9) % 12);
            ctx.beginPath();
            ctx.moveTo(px, py + 4);
            ctx.lineTo(px + 2, py - 2);
            ctx.stroke();
        }
    }
    else if (['dirt', 'sand', 'mud', 'rock', 'snow'].includes(t.ground)) {
        ctx.fillStyle = t.ground === 'snow' ? '#8dacb5' : '#5a4935';
        for (let i = 0; i < 7; i++) {
            const dx = -22 + ((seed * 9 + i * 13) % 45);
            const dy = -7 + ((seed * 5 + i * 7) % 15);
            ctx.beginPath();
            ctx.ellipse(center.x + dx, center.y + dy, 1.5 + i % 2, .8 + i % 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    else if (isWaterGround(t.ground)) {
        const now = performance.now() / 650;
        ctx.strokeStyle = 'rgba(225,250,252,.9)';
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 3; i++) {
            const offset = Math.sin(now + x * .7 + y * .4 + i) * 4;
            ctx.beginPath();
            ctx.ellipse(center.x - 18 + i * 18 + offset, center.y - 2 + i * 2, 9, 2.5, 0, 0, Math.PI);
            ctx.stroke();
        }
    }
    else if (t.ground === 'ice') {
        ctx.strokeStyle = 'rgba(255,255,255,.82)';
        ctx.lineWidth = 1.2;
        line(center.x - 20, center.y + 4, center.x + 5, center.y - 9, ctx.strokeStyle, 1.2);
        line(center.x + 4, center.y - 8, center.x + 19, center.y + 3, ctx.strokeStyle, 1.2);
    }

    if (!locked && isPathGround(t.ground)) {
        const inset = insetPoints(points, .15);
        polygon(inset, 'rgba(255,255,255,.18)', 'rgba(80,61,42,.25)', 1);
        ctx.globalAlpha = .42;
        if (t.ground === 'boardwalk') {
            for (let i = .18; i < .9; i += .16) {
                const a = { x: inset[0].x + (inset[1].x - inset[0].x) * i, y: inset[0].y + (inset[1].y - inset[0].y) * i };
                const b = { x: inset[3].x + (inset[2].x - inset[3].x) * i, y: inset[3].y + (inset[2].y - inset[3].y) * i };
                line(a.x, a.y, b.x, b.y, '#5f3f25', 1.2);
            }
        }
        else if (t.ground === 'brickPath') {
            for (let i = .25; i < .9; i += .25) {
                const left = { x: inset[0].x + (inset[3].x - inset[0].x) * i, y: inset[0].y + (inset[3].y - inset[0].y) * i };
                const right = { x: inset[1].x + (inset[2].x - inset[1].x) * i, y: inset[1].y + (inset[2].y - inset[1].y) * i };
                line(left.x, left.y, right.x, right.y, '#7a4939', 1);
            }
            line(center.x, points[0].y + 5, center.x, points[2].y - 5, '#7a4939', 1);
        }
        else if (t.ground === 'slatePath') {
            line(inset[0].x, inset[0].y, inset[2].x, inset[2].y, '#53656c', 1);
            line(inset[1].x, inset[1].y, inset[3].x, inset[3].y, '#53656c', 1);
        }
        else if (t.ground === 'mosaicPath') {
            ctx.strokeStyle = '#8e6a30';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(center.x, center.y, 15, 7, 0, 0, Math.PI * 2);
            ctx.stroke();
            line(center.x - 16, center.y, center.x + 16, center.y, '#8e6a30', 1);
        }
        else {
            ctx.fillStyle = '#69553c';
            for (let i = 0; i < 6; i++) {
                const dx = -20 + ((seed * 7 + i * 11) % 40);
                const dy = -6 + ((seed * 3 + i * 5) % 12);
                ctx.beginPath();
                ctx.ellipse(center.x + dx, center.y + dy, 1.6, .9, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    ctx.restore();
}

function drawFoliage(id, px, py) {
    const d = FOLIAGE[id], cx = px + TILE / 2, base = py + TILE - 5;
    ctx.save();
    ctx.shadowColor = 'rgba(18,43,29,.24)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 3;
    const trunk = '#6e4f32';
    if (['round', 'slim', 'flat', 'jungle', 'willow', 'baobab', 'palm', 'pine', 'snowpine', 'mangrove', 'banana'].includes(d.shape))
        line(cx, base, cx, py + 15, trunk, d.shape === 'baobab' ? 7 : 4);
    if (d.shape === 'round') {
        ellipse(cx - 6, py + 15, 9, 8, d.color);
        ellipse(cx + 5, py + 14, 10, 9, d.color);
        ellipse(cx, py + 8, 9, 8, d.color);
    }
    else if (d.shape === 'slim') {
        ellipse(cx, py + 13, 8, 13, d.color);
        ellipse(cx - 4, py + 8, 5, 8, '#8bc177');
    }
    else if (d.shape === 'flat') {
        ellipse(cx, py + 10, 16, 6, d.color);
        ellipse(cx - 8, py + 14, 10, 5, d.color);
    }
    else if (d.shape === 'baobab') {
        ellipse(cx, py + 8, 14, 8, d.color);
        ellipse(cx - 9, py + 12, 9, 6, d.color);
        ellipse(cx + 9, py + 12, 9, 6, d.color);
    }
    else if (d.shape === 'jungle') {
        ellipse(cx, py + 8, 15, 10, d.color);
        ellipse(cx - 10, py + 14, 9, 8, '#2e9850');
        ellipse(cx + 10, py + 15, 9, 8, '#39a65a');
    }
    else if (d.shape === 'palm') {
        for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3;
            line(cx, py + 12, cx + Math.cos(a) * 14, py + 12 + Math.sin(a) * 7, d.color, 4);
        }
    }
    else if (d.shape === 'pine' || d.shape === 'snowpine') {
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = d.shape === 'snowpine' && i === 0 ? '#e9f2f3' : d.color;
            ctx.beginPath();
            ctx.moveTo(cx, py + 2 + i * 7);
            ctx.lineTo(cx - 13 + i * 2, py + 20 + i * 5);
            ctx.lineTo(cx + 13 - i * 2, py + 20 + i * 5);
            ctx.closePath();
            ctx.fill();
        }
    }
    else if (d.shape === 'willow') {
        ellipse(cx, py + 9, 13, 9, d.color);
        for (let i = -10; i <= 10; i += 5)
            line(cx + i, py + 12, cx + i, py + 29, d.color, 2);
    }
    else if (d.shape === 'banana') {
        for (let i = 0; i < 5; i++) {
            const a = -Math.PI + i * Math.PI / 4;
            ellipse(cx + Math.cos(a) * 8, py + 11 + Math.sin(a) * 4, 4, 11, d.color);
        }
    }
    else if (d.shape === 'mangrove') {
        ellipse(cx, py + 10, 13, 9, d.color);
        for (let i = -8; i <= 8; i += 4)
            line(cx + i, py + 18, cx + i * 1.4, py + 31, trunk, 2);
    }
    else if (d.shape === 'bush') {
        ellipse(cx - 6, py + 23, 9, 7, d.color);
        ellipse(cx + 5, py + 22, 10, 8, d.color);
    }
    else if (d.shape === 'flowers') {
        ellipse(cx, py + 27, 13, 4, '#5e9c50');
        for (const [qx, qy] of [[-8, -5], [0, -9], [8, -4], [-2, -2]]) {
            ellipse(cx + qx, py + 25 + qy, 3.5, 3.5, d.color);
            ellipse(cx + qx, py + 25 + qy, 1.3, 1.3, '#f3d56b');
        }
    }
    else if (d.shape === 'grass' || d.shape === 'reeds' || d.shape === 'kelp') {
        for (let i = -12; i <= 12; i += 4)
            line(cx + i, base, cx + i + (i % 3), py + 10 + (i % 4), d.color, d.shape === 'kelp' ? 3 : 2);
    }
    else if (d.shape === 'cactus') {
        line(cx, base, cx, py + 8, d.color, 6);
        line(cx, py + 19, cx - 8, py + 15, d.color, 4);
        line(cx - 8, py + 15, cx - 8, py + 11, d.color, 4);
        line(cx, py + 23, cx + 8, py + 18, d.color, 4);
    }
    else if (d.shape === 'spike' || d.shape === 'fern') {
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4;
            line(cx, py + 27, cx + Math.cos(a) * 13, py + 27 + Math.sin(a) * 9, d.color, 3);
        }
    }
    else if (d.shape === 'bamboo') {
        for (let i = -8; i <= 8; i += 6) {
            line(cx + i, base, cx + i, py + 5, '#559342', 3);
            for (let y = 10; y < 29; y += 8)
                line(cx + i - 3, py + y, cx + i + 3, py + y, '#6bb252', 1);
        }
    }
    else if (d.shape === 'vine') {
        for (let i = -9; i <= 9; i += 6) {
            ctx.strokeStyle = d.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx + i, base);
            ctx.bezierCurveTo(cx + i - 8, py + 23, cx + i + 8, py + 14, cx + i, py + 5);
            ctx.stroke();
        }
    }
    else if (d.shape === 'lily') {
        ellipse(cx - 5, py + 24, 10, 5, d.color);
        ellipse(cx + 8, py + 18, 8, 4, '#72ae68');
        for (const [qx, qy] of [[-2, 0], [2, 0], [0, -3]])
            ellipse(cx + 3 + qx, py + 18 + qy, 3, 3, '#e5a5c4');
        ellipse(cx + 3, py + 18, 1.4, 1.4, '#f3d66c');
    }
    else if (d.shape === 'coral') {
        for (const [x1, y1, x2, y2] of [[0, 30, 0, 8], [0, 19, -8, 12], [0, 24, 9, 15], [-8, 30, -8, 20], [9, 30, 9, 23]])
            line(cx + x1, py + y1, cx + x2, py + y2, d.color, 4);
    }
    ctx.restore();
}

function drawFence(id, x, y) {
    const definition = FENCES[id];
    const center = tileCenterScreen(x, y);
    const color = definition.waterproof ? '#7daebc' : definition.strength >= 4 ? '#4b565d' : definition.height >= 4 ? '#596a63' : '#76563a';
    const postHeight = 11 + definition.height * 7;
    const railLevels = definition.height >= 4 ? [8, 18, postHeight - 2] : [7, postHeight - 2];
    const neighborDirections = [[1, 0], [0, 1]];

    ctx.save();
    ctx.lineCap = 'round';
    for (const [dx, dy] of neighborDirections) {
        const nx = x + dx, ny = y + dy;
        if (!inside(nx, ny) || !FENCES[tile(nx, ny).object])
            continue;
        const other = tileCenterScreen(nx, ny);
        if (definition.waterproof) {
            polygon([
                { x: center.x, y: center.y - 4 },
                { x: other.x, y: other.y - 4 },
                { x: other.x, y: other.y - postHeight + 3 },
                { x: center.x, y: center.y - postHeight + 3 }
            ], 'rgba(157,211,226,.22)', 'rgba(92,145,160,.42)', 1);
        }
        for (const level of railLevels)
            line(center.x, center.y - level, other.x, other.y - level, color, definition.strength >= 4 ? 3.4 : 2.1);
    }

    ctx.shadowColor = 'rgba(20,35,28,.24)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 2;
    line(center.x, center.y + 3, center.x, center.y - postHeight, color, definition.strength >= 4 ? 5 : 3.4);
    ellipse(center.x, center.y - postHeight, definition.strength >= 4 ? 3.2 : 2.4, 1.8, '#d7c79d');

    if (definition.gate) {
        const gateWidth = definition.height >= 4 ? 25 : 22;
        const gateTop = center.y - postHeight + 5;
        ctx.shadowColor = 'rgba(20,35,28,.18)';
        line(center.x - gateWidth / 2, center.y + 2, center.x - gateWidth / 2, gateTop, color, 4);
        line(center.x + gateWidth / 2, center.y + 2, center.x + gateWidth / 2, gateTop, color, 4);
        line(center.x - gateWidth / 2, gateTop, center.x + gateWidth / 2, gateTop, color, 4);
        if (definition.waterproof)
            polygon([{ x: center.x - gateWidth / 2 + 2, y: center.y }, { x: center.x + gateWidth / 2 - 2, y: center.y }, { x: center.x + gateWidth / 2 - 2, y: gateTop + 2 }, { x: center.x - gateWidth / 2 + 2, y: gateTop + 2 }], 'rgba(174,222,233,.3)', null);
        line(center.x, center.y, center.x, gateTop + 2, '#b18a4e', 2);
        ellipse(center.x + 5, center.y - 9, 1.8, 1.8, '#e7c96b');
    }
    ctx.restore();
}

function drawHabitatObject(id, px, py) { const cx = px + TILE / 2; ctx.save(); ctx.shadowColor = 'rgba(25,45,35,.18)'; ctx.shadowBlur = 3; ctx.shadowOffsetY = 2; if (id === 'shelter') {
    ctx.fillStyle = '#d89f53';
    ctx.beginPath();
    ctx.moveTo(px + 4, py + 31);
    ctx.lineTo(cx, py + 5);
    ctx.lineTo(px + TILE - 4, py + 31);
    ctx.closePath();
    ctx.fill();
    rect(cx - 4, py + 20, 8, 12, '#39453e');
}
else if (id === 'cave') {
    ctx.fillStyle = '#767e7d';
    ctx.beginPath();
    ctx.arc(cx, py + 31, 16, Math.PI, 0);
    ctx.lineTo(px + TILE - 2, py + 32);
    ctx.lineTo(px + 2, py + 32);
    ctx.fill();
    ctx.fillStyle = '#27342f';
    ctx.beginPath();
    ctx.arc(cx, py + 31, 8, Math.PI, 0);
    ctx.fill();
}
else if (id === 'heatedShelter') {
    rect(px + 5, py + 13, TILE - 10, 20, '#e7d6b0');
    ctx.fillStyle = '#9e5d42';
    ctx.beginPath();
    ctx.moveTo(px + 3, py + 15);
    ctx.lineTo(cx, py + 4);
    ctx.lineTo(px + TILE - 3, py + 15);
    ctx.fill();
    rect(cx - 4, py + 23, 8, 10, '#4c5b52');
    rect(px + 26, py + 6, 4, 8, '#79604b');
}
else if (id === 'feeder') {
    ctx.fillStyle = '#8b6238';
    ctx.beginPath();
    ctx.moveTo(px + 4, py + 19);
    ctx.lineTo(px + TILE - 4, py + 19);
    ctx.lineTo(px + TILE - 8, py + 31);
    ctx.lineTo(px + 8, py + 31);
    ctx.fill();
    for (const q of [-7, 0, 7])
        ellipse(cx + q, py + 19, 3, 3, '#72a84a');
}
else if (id === 'waterPump') {
    rect(cx - 3, py + 9, 6, 22, '#688c94');
    ctx.strokeStyle = '#688c94';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx + 4, py + 14, 9, Math.PI, Math.PI * 2);
    ctx.stroke();
    line(cx + 13, py + 14, cx + 13, py + 23, '#688c94', 3);
    ellipse(cx + 13, py + 27, 3, 5, '#5fb1ce');
}
else if (id === 'activityBall') {
    ellipse(cx, py + 20, 11, 11, '#e46f55');
    line(cx - 11, py + 20, cx + 11, py + 20, '#f5d368', 2);
    ctx.strokeStyle = '#f5d368';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, py + 20, 5, 11, 0, 0, Math.PI * 2);
    ctx.stroke();
}
else if (id === 'climbingFrame') {
    line(px + 7, py + 33, px + 14, py + 5, '#765337', 3);
    line(px + TILE - 7, py + 33, px + TILE - 14, py + 5, '#765337', 3);
    line(px + 14, py + 6, px + TILE - 14, py + 6, '#765337', 3);
    line(px + 10, py + 20, px + TILE - 10, py + 20, '#765337', 3);
    for (let x = px + 15; x < px + TILE - 12; x += 5)
        line(x, py + 6, x, py + 20, '#9b7048', 1);
}
else if (id === 'scratchingPost') {
    rect(cx - 3, py + 8, 6, 23, '#a6794f');
    rect(cx - 11, py + 30, 22, 4, '#6e4b31');
    for (let y = 12; y < 29; y += 4)
        line(cx - 3, py + y, cx + 3, py + y, '#d1aa75', 1);
}
else if (id === 'burrowMound') {
    ellipse(cx, py + 29, 15, 9, '#9d7650');
    ellipse(cx, py + 29, 7, 5, '#342c25');
}
else if (id === 'swing') {
    line(px + 7, py + 34, px + 14, py + 5, '#725035', 3);
    line(px + TILE - 7, py + 34, px + TILE - 14, py + 5, '#725035', 3);
    line(px + 14, py + 5, px + TILE - 14, py + 5, '#725035', 3);
    line(cx - 6, py + 6, cx - 6, py + 25, '#5a4637', 1.5);
    line(cx + 6, py + 6, cx + 6, py + 25, '#5a4637', 1.5);
    rect(cx - 8, py + 24, 16, 3, '#96683e');
}
else if (id === 'puzzleFeeder') {
    rect(cx - 10, py + 10, 20, 20, '#d7a54d');
    for (const [qx, qy] of [[-5, -5], [5, -5], [-5, 5], [5, 5]])
        ellipse(cx + qx, py + 20 + qy, 2.5, 2.5, '#6e5431');
}
else if (id === 'logPile') {
    for (const [qx, qy, w] of [[4, 22, 28], [8, 14, 23], [13, 7, 18]]) {
        ctx.fillStyle = '#8a5c37';
        ctx.beginPath();
        ctx.roundRect(px + qx, py + qy, w, 8, 4);
        ctx.fill();
        ellipse(px + qx + 3, py + qy + 4, 3, 3, '#c08c59');
    }
}
else if (id === 'nestingPlatform') {
    line(cx, py + 33, cx, py + 12, '#775237', 4);
    rect(cx - 10, py + 10, 20, 3, '#775237');
    ctx.strokeStyle = '#9f744c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, py + 11, 8, 0, Math.PI);
    ctx.stroke();
}
else if (id === 'waterJets') {
    line(px + 4, py + 32, px + TILE - 4, py + 32, '#477f96', 4);
    ctx.strokeStyle = '#62b8d2';
    ctx.lineWidth = 2.5;
    for (const q of [-8, 4]) {
        ctx.beginPath();
        ctx.moveTo(cx + q, py + 31);
        ctx.quadraticCurveTo(cx + q + 4, py + 4, cx + q + 10, py + 31);
        ctx.stroke();
    }
}
else if (id === 'iceBlock') {
    ctx.fillStyle = '#bfe2ea';
    ctx.beginPath();
    ctx.moveTo(cx, py + 5);
    ctx.lineTo(px + TILE - 5, py + 14);
    ctx.lineTo(px + TILE - 7, py + 31);
    ctx.lineTo(cx, py + 35);
    ctx.lineTo(px + 6, py + 29);
    ctx.lineTo(px + 5, py + 14);
    ctx.closePath();
    ctx.fill();
    line(cx, py + 5, cx, py + 35, '#fff', 1);
    line(px + 5, py + 14, px + TILE - 5, py + 14, '#fff', 1);
}
else if (id === 'baskingRock') {
    ctx.fillStyle = '#887f74';
    ctx.beginPath();
    ctx.moveTo(px + 4, py + 32);
    ctx.lineTo(px + 10, py + 16);
    ctx.lineTo(cx, py + 19);
    ctx.lineTo(px + 27, py + 8);
    ctx.lineTo(px + TILE - 4, py + 32);
    ctx.fill();
    ellipse(px + 29, py + 7, 4, 4, '#e3b549');
} ctx.restore(); }

function drawFacility(id, px, py) { const cx = px + TILE / 2; ctx.save(); ctx.shadowColor = 'rgba(25,45,35,.22)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 3; if (id === 'bench') {
    line(px + 6, py + 22, px + TILE - 6, py + 22, '#875c37', 4);
    line(px + 8, py + 15, px + TILE - 8, py + 15, '#875c37', 4);
    line(px + 9, py + 15, px + 9, py + 31, '#5f422b', 3);
    line(px + TILE - 9, py + 15, px + TILE - 9, py + 31, '#5f422b', 3);
    ctx.restore();
    return;
} if (id === 'bin') {
    ctx.fillStyle = '#4e7781';
    ctx.beginPath();
    ctx.moveTo(px + 10, py + 11);
    ctx.lineTo(px + TILE - 10, py + 11);
    ctx.lineTo(px + TILE - 13, py + 32);
    ctx.lineTo(px + 13, py + 32);
    ctx.fill();
    line(px + 8, py + 11, px + TILE - 8, py + 11, '#334e55', 3);
    line(cx - 4, py + 7, cx + 4, py + 7, '#334e55', 3);
    ctx.restore();
    return;
} rect(px + 4, py + 9, TILE - 8, 25, '#fff1cf'); rect(px + 4, py + 9, TILE - 8, 7, '#d58d32'); if (id === 'burger') {
    ellipse(cx, py + 21, 9, 4, '#df9f43');
    line(cx - 9, py + 22, cx + 9, py + 22, '#5a8e45', 3);
    line(cx - 8, py + 26, cx + 8, py + 26, '#86452d', 4);
    ellipse(cx, py + 29, 9, 3, '#df9f43');
}
else if (id === 'icecream') {
    ctx.fillStyle = '#c78a4e';
    ctx.beginPath();
    ctx.moveTo(cx - 6, py + 20);
    ctx.lineTo(cx + 6, py + 20);
    ctx.lineTo(cx, py + 33);
    ctx.fill();
    ellipse(cx, py + 17, 7, 7, '#e9a0b8');
}
else if (id === 'drinks') {
    ctx.fillStyle = '#6fb2cf';
    ctx.beginPath();
    ctx.moveTo(cx - 8, py + 17);
    ctx.lineTo(cx + 8, py + 17);
    ctx.lineTo(cx + 6, py + 32);
    ctx.lineTo(cx - 6, py + 32);
    ctx.fill();
    line(cx + 2, py + 17, cx + 7, py + 8, '#c94f4f', 2);
}
else if (id === 'cafe') {
    ctx.strokeStyle = '#8c5b39';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 8, py + 18, 14, 10);
    ctx.beginPath();
    ctx.arc(cx + 7, py + 23, 5, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    line(cx - 4, py + 15, cx - 4, py + 11, '#8c5b39', 1);
    line(cx + 1, py + 15, cx + 1, py + 10, '#8c5b39', 1);
}
else if (id === 'restaurant') {
    ellipse(cx, py + 23, 9, 9, '#f7f3e8');
    ctx.strokeStyle = '#8e7050';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, py + 23, 8, 0, Math.PI * 2);
    ctx.stroke();
    line(cx - 13, py + 16, cx - 13, py + 30, '#6a5948', 2);
    line(cx + 13, py + 16, cx + 13, py + 30, '#6a5948', 2);
}
else if (id === 'toilet') {
    ellipse(cx - 6, py + 18, 3, 3, '#4e78a8');
    ellipse(cx + 6, py + 18, 3, 3, '#b05f86');
    line(cx - 6, py + 21, cx - 6, py + 31, '#4f5960', 3);
    line(cx + 6, py + 21, cx + 6, py + 31, '#4f5960', 3);
}
else if (id === 'gift') {
    rect(cx - 10, py + 18, 20, 14, '#d96761');
    line(cx, py + 18, cx, py + 32, '#f2d16a', 2);
    line(cx - 11, py + 18, cx + 11, py + 18, '#f2d16a', 2);
    ctx.strokeStyle = '#f2d16a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - 5, py + 16, 5, 0, Math.PI * 2);
    ctx.arc(cx + 5, py + 16, 5, 0, Math.PI * 2);
    ctx.stroke();
}
else if (id === 'photo') {
    rect(cx - 11, py + 17, 22, 14, '#59656c');
    ellipse(cx, py + 24, 6, 6, '#9dd2df');
    rect(cx - 5, py + 13, 10, 4, '#59656c');
}
else if (id === 'playground') {
    line(px + 8, py + 32, px + 17, py + 12, '#4f83a7', 3);
    line(px + 17, py + 12, px + 26, py + 12, '#4f83a7', 3);
    line(px + 26, py + 12, px + 26, py + 23, '#4f83a7', 3);
    line(px + 26, py + 23, px + TILE - 7, py + 32, '#d56a50', 4);
}
else if (id === 'carousel') {
    ctx.fillStyle = '#d75c61';
    ctx.beginPath();
    ctx.moveTo(px + 5, py + 18);
    ctx.quadraticCurveTo(cx, py + 2, px + TILE - 5, py + 18);
    ctx.fill();
    line(cx, py + 17, cx, py + 33, '#8a5939', 3);
    line(cx - 9, py + 19, cx - 9, py + 31, '#d1a14b', 2);
    line(cx + 9, py + 19, cx + 9, py + 31, '#d1a14b', 2);
}
else if (id === 'observationWheel') {
    ctx.strokeStyle = '#547d9f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, py + 21, 12, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        line(cx, py + 21, cx + Math.cos(a) * 12, py + 21 + Math.sin(a) * 12, '#547d9f', 1);
    }
    line(cx - 5, py + 33, cx + 5, py + 33, '#665041', 3);
} ctx.restore(); }

function drawEducation(id, px, py) { const cx = px + TILE / 2; ctx.save(); ctx.shadowColor = 'rgba(25,45,35,.2)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2; rect(px + 4, py + 8, TILE - 8, 26, '#e7e2f3'); rect(px + 4, py + 8, TILE - 8, 7, '#7659aa'); if (id === 'infoBoard') {
    rect(cx - 9, py + 15, 18, 13, '#f7f1d8');
    for (let y = 18; y < 27; y += 4)
        line(cx - 6, py + y, cx + 6, py + y, '#7659aa', 1);
    line(cx - 6, py + 28, cx - 6, py + 34, '#7659aa', 2);
    line(cx + 6, py + 28, cx + 6, py + 34, '#7659aa', 2);
}
else if (id === 'educationCenter') {
    ctx.fillStyle = '#7659aa';
    ctx.beginPath();
    ctx.moveTo(cx, py + 15);
    ctx.lineTo(cx - 10, py + 21);
    ctx.lineTo(cx - 10, py + 32);
    ctx.lineTo(cx + 10, py + 32);
    ctx.lineTo(cx + 10, py + 21);
    ctx.fill();
    rect(cx - 2, py + 25, 4, 7, '#f2e9c9');
}
else if (id === 'insectHouse') {
    ellipse(cx, py + 23, 5, 8, '#506c45');
    ellipse(cx, py + 16, 4, 4, '#354d31');
    for (const [qx, qy] of [[-5, -5], [5, -5], [-6, 2], [6, 2]])
        line(cx + Math.sign(qx) * 3, py + 23 + qy / 2, cx + qx, py + 23 + qy, '#354d31', 1.5);
}
else if (id === 'butterflyGarden') {
    ctx.fillStyle = '#d96b9b';
    ctx.beginPath();
    ctx.ellipse(cx - 5, py + 22, 7, 10, -.6, 0, Math.PI * 2);
    ctx.ellipse(cx + 5, py + 22, 7, 10, .6, 0, Math.PI * 2);
    ctx.fill();
    line(cx, py + 15, cx, py + 31, '#4b403b', 2);
}
else if (id === 'aviary' || id === 'birdTheatre') {
    ctx.fillStyle = '#4f8f77';
    ctx.beginPath();
    ctx.moveTo(px + 7, py + 25);
    ctx.quadraticCurveTo(px + 15, py + 12, cx, py + 25);
    ctx.quadraticCurveTo(px + 28, py + 12, px + TILE - 7, py + 25);
    ctx.quadraticCurveTo(px + 29, py + 21, cx, py + 31);
    ctx.quadraticCurveTo(px + 16, py + 21, px + 7, py + 25);
    ctx.fill();
}
else if (id === 'reptileHouse') {
    ctx.strokeStyle = '#568b4f';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px + 8, py + 27);
    ctx.bezierCurveTo(px + 15, py + 13, px + 22, py + 34, px + TILE - 8, py + 18);
    ctx.stroke();
}
else if (id === 'aquarium') {
    ctx.strokeStyle = '#4a9ec0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + 6, py + 29);
    ctx.quadraticCurveTo(px + 13, py + 22, cx, py + 29);
    ctx.quadraticCurveTo(px + 28, py + 22, px + TILE - 6, py + 29);
    ctx.stroke();
    ctx.fillStyle = '#e0a245';
    ctx.beginPath();
    ctx.ellipse(cx, py + 21, 8, 4, 0, 0, Math.PI * 2);
    ctx.moveTo(cx + 7, py + 21);
    ctx.lineTo(cx + 13, py + 17);
    ctx.lineTo(cx + 13, py + 25);
    ctx.fill();
}
else if (id === 'conservationLab') {
    ctx.fillStyle = '#b9dce3';
    ctx.beginPath();
    ctx.moveTo(cx - 4, py + 15);
    ctx.lineTo(cx + 4, py + 15);
    ctx.lineTo(cx + 4, py + 22);
    ctx.lineTo(cx + 10, py + 32);
    ctx.lineTo(cx - 10, py + 32);
    ctx.lineTo(cx - 4, py + 22);
    ctx.fill();
    line(cx - 8, py + 28, cx + 8, py + 28, '#4f9e77', 3);
} ctx.restore(); }

function drawIsoPlinth(x, y, fill = '#d8d5c8', height = 5, scale = .72) {
    const points = insetPoints(tileDiamond(x, y), 1 - scale);
    const lower = points.map(point => ({ x: point.x, y: point.y + height }));
    polygon([points[1], points[2], lower[2], lower[1]], '#9f9b8e');
    polygon([points[2], points[3], lower[3], lower[2]], '#85857a');
    polygon(points, fill, 'rgba(43,60,51,.22)', 1);
}

function drawObject(id, x, y) {
    if (FENCES[id])
        return drawFence(id, x, y);
    const center = tileCenterScreen(x, y);
    ctx.save();
    if (FOLIAGE[id]) {
        const definition = FOLIAGE[id];
        const tall = ['round', 'slim', 'flat', 'jungle', 'willow', 'baobab', 'palm', 'pine', 'snowpine', 'mangrove', 'banana'].includes(definition.shape);
        const scale = tall ? 1.48 : definition.shape === 'bush' || definition.shape === 'flowers' ? 1.12 : 1.25;
        ctx.translate(center.x, center.y + 2);
        ctx.scale(scale, scale);
        drawFoliage(id, -TILE / 2, -TILE + 2);
    }
    else if (HABITAT_OBJECTS[id]) {
        drawIsoPlinth(x, y, '#d6c6a4', 4, .58);
        ctx.translate(center.x, center.y - 1);
        ctx.scale(1.25, 1.25);
        drawHabitatObject(id, -TILE / 2, -TILE + 2);
    }
    else if (FACILITIES[id]) {
        drawIsoPlinth(x, y, '#e7d8b8', 6, .78);
        ctx.translate(center.x, center.y - 3);
        ctx.scale(1.38, 1.38);
        drawFacility(id, -TILE / 2, -TILE + 1);
    }
    else if (EDUCATION[id]) {
        drawIsoPlinth(x, y, '#d8d0e8', 6, .8);
        ctx.translate(center.x, center.y - 3);
        ctx.scale(1.42, 1.42);
        drawEducation(id, -TILE / 2, -TILE + 1);
    }
    ctx.restore();
}

function drawAnimal(a) {
    const species = SPECIES[a.species], aquatic = species.aquatic || species.semiAquatic && isWaterGround(tile(Math.floor(a.px), Math.floor(a.py)).ground);
    const point = worldToScreen(a.px, a.py, aquatic ? 2 : 0), x = point.x, y = point.y, b = Math.sin(performance.now() / 310 + a.animOffset) * 1.1, id = a.species;
    let scale = ['elephant', 'hippo', 'polarBear', 'gorilla'].includes(id) ? 1.34 : ['giraffe', 'dolphin', 'crocodile'].includes(id) ? 1.26 : 1.18;
    if (a.juvenile) scale *= .72;
    ctx.save();
    ctx.translate(x, y + b);
    ctx.scale(scale, scale);
    const cameraFacing = [1, -1, -1, 1][normalizedRotation()];
    if (a.dir * cameraFacing < 0)
        ctx.scale(-1, 1);
    ellipse(0, 10, 11, 4, 'rgba(16,40,30,.18)');
    ctx.shadowColor = 'rgba(18,38,29,.16)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1;
    const eye = (ex, ey) => { ellipse(ex, ey, 1.3, 1.3, '#17231d'); }, leg = (lx, ly, len, c, w = 3) => line(lx, ly, lx, ly + len, c, w);
    if (id === 'zebra') {
        ellipse(-2, 0, 13, 7, '#f1eee5');
        ellipse(10, -4, 6, 5, '#f1eee5');
        for (let i = -11; i < 9; i += 5)
            line(i, -5, i + 2, 5, '#292c2a', 2);
        for (const q of [-8, 3])
            leg(q, 5, 9, '#393b38', 3);
        line(-14, 0, -20, -6, '#292c2a', 2);
        eye(12, -5);
    }
    else if (id === 'giraffe') {
        ellipse(-5, 3, 12, 7, '#d9a64b');
        line(5, 0, 9, -18, '#d9a64b', 6);
        ellipse(11, -20, 6, 4, '#d9a64b');
        for (const q of [-12, -6, 0, 7])
            ellipse(q, 2, 2.5, 2, '#8a5c2d');
        for (const q of [-9, 1])
            leg(q, 7, 12, '#9a6b32', 3);
        line(9, -23, 8, -27, '#6d4b2a', 1.5);
        line(13, -23, 14, -27, '#6d4b2a', 1.5);
        eye(13, -21);
    }
    else if (id === 'pygmyGoat') {
        ellipse(-2, 2, 12, 7, '#b8885b');
        ellipse(10, -3, 6, 5, '#a9794e');
        for (const q of [-8, 3])
            leg(q, 7, 9, '#634832', 3);
        line(9, -7, 6, -13, '#dcc9a8', 2);
        line(13, -7, 16, -13, '#dcc9a8', 2);
        line(-14, 0, -19, -5, '#60432d', 2);
        eye(12, -4);
    }
    else if (id === 'capybara') {
        ellipse(-2, 2, 14, 8, '#9a6540');
        ellipse(11, -2, 7, 6, '#a97047');
        for (const q of [-9, 4])
            leg(q, 7, 7, '#64422e', 3);
        ellipse(8, -7, 2, 2, '#6c452d');
        ellipse(14, -7, 2, 2, '#6c452d');
        eye(14, -3);
    }
    else if (id === 'meerkat') {
        ellipse(0, 1, 6, 12, '#b98a54');
        ellipse(1, -12, 5, 5, '#c79a62');
        line(-3, 10, -5, 17, '#755334', 3);
        line(3, 10, 5, 17, '#755334', 3);
        line(-5, 7, -13, 12, '#7b5836', 2);
        eye(3, -13);
    }
    else if (id === 'flamingo') {
        ellipse(-2, -2, 8, 6, '#ec6e93');
        ctx.strokeStyle = '#e76b91';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(4, -5);
        ctx.quadraticCurveTo(13, -17, 8, -24);
        ctx.stroke();
        ellipse(9, -25, 5, 3, '#f08aaa');
        line(7, -24, 14, -23, '#303630', 2);
        leg(-4, 4, 16, '#d55a7f', 2);
        leg(2, 4, 16, '#d55a7f', 2);
        eye(10, -26);
    }
    else if (id === 'kangaroo') {
        ellipse(-2, 1, 9, 12, '#b77945');
        ellipse(4, -13, 5, 7, '#bb7d49');
        line(-8, 7, -18, 14, '#85512f', 5);
        line(4, 10, 8, 19, '#704329', 4);
        line(-2, 10, -5, 19, '#704329', 4);
        line(-8, 5, -22, 10, '#8f5731', 4);
        line(2, -18, 0, -25, '#a5683c', 3);
        line(6, -18, 8, -25, '#a5683c', 3);
        eye(6, -14);
    }
    else if (id === 'riverOtter') {
        ellipse(-3, 2, 15, 6, '#704c34');
        ellipse(11, -1, 6, 5, '#7f593c');
        line(-16, 2, -24, 8, '#5b3c29', 4);
        for (const q of [-7, 4])
            leg(q, 6, 6, '#523624', 3);
        eye(13, -2);
    }
    else if (id === 'penguin') {
        ellipse(0, 0, 8, 14, '#252c2c');
        ellipse(1, 1, 5, 10, '#f2eee1');
        ellipse(0, -14, 6, 6, '#252c2c');
        line(-7, 0, -13, 7, '#252c2c', 3);
        line(7, 0, 13, 7, '#252c2c', 3);
        ctx.fillStyle = '#e1a12d';
        ctx.beginPath();
        ctx.moveTo(5, -14);
        ctx.lineTo(12, -11);
        ctx.lineTo(5, -9);
        ctx.fill();
        eye(3, -15);
    }
    else if (id === 'crocodile') {
        ctx.fillStyle = '#4e8a50';
        ctx.beginPath();
        ctx.roundRect(-17, -5, 27, 11, 5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-17, -4);
        ctx.lineTo(-27, 0);
        ctx.lineTo(-17, 4);
        ctx.fill();
        ctx.fillRect(7, -4, 14, 8);
        for (let i = -10; i < 8; i += 6) {
            ctx.fillStyle = '#365f39';
            ctx.beginPath();
            ctx.moveTo(i, -5);
            ctx.lineTo(i + 3, -11);
            ctx.lineTo(i + 6, -5);
            ctx.fill();
        }
        eye(16, -5);
    }
    else if (id === 'seal') {
        ellipse(-3, 1, 16, 8, '#77858a');
        ellipse(11, -3, 7, 6, '#849398');
        ctx.fillStyle = '#667579';
        ctx.beginPath();
        ctx.moveTo(-17, 0);
        ctx.lineTo(-25, -7);
        ctx.lineTo(-22, 2);
        ctx.lineTo(-26, 8);
        ctx.closePath();
        ctx.fill();
        line(4, 5, 10, 12, '#667579', 4);
        eye(13, -4);
    }
    else if (id === 'hippo') {
        ellipse(-3, 2, 15, 10, '#8b7c8d');
        ellipse(11, -2, 9, 7, '#988999');
        ellipse(15, 1, 7, 4, '#a393a3');
        ellipse(9, -8, 2, 2, '#675b6a');
        ellipse(16, -8, 2, 2, '#675b6a');
        for (const q of [-9, 4])
            leg(q, 9, 8, '#665a66', 4);
        eye(14, -4);
    }
    else if (id === 'lion') {
        ellipse(-3, 2, 14, 8, '#d5a04b');
        ellipse(10, -5, 9, 9, '#95612f');
        ellipse(10, -5, 6, 6, '#d5a04b');
        for (const q of [-8, 4])
            leg(q, 8, 9, '#8e6234', 3);
        line(-16, 0, -22, -7, '#8e6234', 2);
        ellipse(-22, -8, 2, 2, '#855329');
        eye(12, -6);
    }
    else if (id === 'tiger') {
        ellipse(-3, 2, 14, 8, '#e58a2f');
        ellipse(10, -4, 7, 6, '#e58a2f');
        for (let i = -11; i < 8; i += 5)
            line(i, -5, i + 3, 6, '#222725', 2);
        for (const q of [-8, 4])
            leg(q, 8, 9, '#8d4e25', 3);
        line(-16, 0, -23, -6, '#222725', 2);
        eye(12, -5);
    }
    else if (id === 'gorilla') {
        ellipse(-2, 1, 12, 12, '#3c4140');
        ellipse(2, -11, 7, 7, '#484c4a');
        line(-8, -2, -17, 11, '#303433', 6);
        line(8, -2, 17, 11, '#303433', 6);
        leg(-5, 10, 8, '#292d2c', 5);
        leg(5, 10, 8, '#292d2c', 5);
        ellipse(5, -10, 4, 3, '#6c6258');
        eye(4, -13);
    }
    else if (id === 'orangutan') {
        ellipse(0, 1, 10, 11, '#ad5b2b');
        ellipse(2, -11, 7, 7, '#bd6b34');
        line(-7, -2, -18, 12, '#9d4c23', 5);
        line(7, -2, 18, 12, '#9d4c23', 5);
        leg(-4, 10, 8, '#7c3c20', 4);
        leg(5, 10, 8, '#7c3c20', 4);
        ellipse(4, -10, 4, 3, '#d39a6b');
        eye(5, -13);
    }
    else if (id === 'panda') {
        ellipse(-2, 2, 14, 9, '#f3f2e9');
        ellipse(10, -5, 7, 6, '#f3f2e9');
        ellipse(6, -9, 3, 3, '#222');
        ellipse(14, -9, 3, 3, '#222');
        ellipse(8, -5, 2.8, 3.3, '#222');
        ellipse(-8, 5, 5, 5, '#222');
        for (const q of [-8, 4])
            leg(q, 8, 8, '#222', 4);
        eye(12, -5);
    }
    else if (id === 'elephant') {
        ellipse(-3, 1, 16, 11, '#8e979b');
        ellipse(11, -4, 9, 8, '#969fa3');
        ellipse(5, -5, 8, 9, '#7f898d');
        ctx.strokeStyle = '#969fa3';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(17, -1);
        ctx.quadraticCurveTo(22, 10, 15, 15);
        ctx.stroke();
        for (const q of [-10, 3])
            leg(q, 10, 10, '#687174', 4);
        eye(13, -5);
    }
    else if (id === 'polarBear') {
        ellipse(-3, 2, 15, 9, '#f2f1e8');
        ellipse(11, -4, 8, 7, '#f5f4ec');
        ellipse(7, -10, 3, 3, '#dddcd3');
        ellipse(15, -10, 3, 3, '#dddcd3');
        for (const q of [-9, 4])
            leg(q, 9, 8, '#d4d4cc', 4);
        ellipse(17, -3, 2, 2, '#292d2c');
        eye(13, -5);
    }
    else if (id === 'seaTurtle') {
        ellipse(0, 0, 12, 9, '#4e8f61');
        ellipse(10, -1, 5, 4, '#6aa16e');
        for (const q of [[-7, -7], [-7, 7], [6, -7], [6, 7]]) {
            ctx.fillStyle = '#5d9c67';
            ctx.beginPath();
            ctx.ellipse(q[0], q[1], 6, 2.5, Math.atan2(q[1], q[0]), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.strokeStyle = '#2f6845';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.moveTo(0, -8);
        ctx.lineTo(0, 8);
        ctx.stroke();
        eye(12, -2);
    }
    else if (id === 'dolphin') {
        ctx.fillStyle = '#4d96bd';
        ctx.beginPath();
        ctx.ellipse(-2, 0, 17, 7, -.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(12, -2);
        ctx.lineTo(24, -6);
        ctx.lineTo(18, 0);
        ctx.lineTo(25, 6);
        ctx.lineTo(12, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-2, -6);
        ctx.lineTo(4, -15);
        ctx.lineTo(7, -5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-14, -2);
        ctx.lineTo(-22, 0);
        ctx.lineTo(-14, 2);
        ctx.fill();
        eye(-10, -4);
    }
    else {
        ellipse(0, 0, 12, 8, '#8a6b4c');
        ellipse(10, -4, 6, 5, '#9a7957');
        eye(12, -5);
    }
    ctx.restore();
    if (a.happiness < 45) {
        ctx.fillStyle = '#b83e38';
        ctx.font = 'bold 12px system-ui';
        ctx.fillText('!', x + 10, y - 16);
    }
    if (a.hunger < 28) {
        ctx.fillStyle = '#cf5649';
        ctx.beginPath();
        ctx.arc(x - 6, y - 18, 4, 0, Math.PI * 2);
        ctx.fill();
        line(x - 5, y - 22, x - 3, y - 26, '#4c7e42', 1.5);
    }
    if (a.sick) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#b83e38';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y - 28, 7, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        line(x - 4, y - 28, x + 4, y - 28, '#b83e38', 2.5);
        line(x, y - 32, x, y - 24, '#b83e38', 2.5);
    }
    else if (a.grooming < 35 || a.hygiene < 35) {
        ctx.fillStyle = '#8a6c45';
        ctx.beginPath();
        ctx.arc(x + 8, y - 22, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 7px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('~', x + 8, y - 20);
    }
}

function drawPerson(person, type) {
    const point = worldToScreen(person.x, person.y, 1);
    const x = point.x, y = point.y, staffMember = type === 'staff';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.08, 1.08);
    ellipse(0, 7, 6, 3, 'rgba(0,0,0,.16)');
    ctx.fillStyle = staffMember ? (person.role === 'keeper' ? '#3a8755' : person.role === 'janitor' ? '#3d75ac' : '#b34949') : person.color;
    ctx.beginPath();
    ctx.roundRect(-5, -5, 10, 15, 4);
    ctx.fill();
    ellipse(0, -8, 4.5, 4.5, '#e9bd93');
    line(-3, 8, -4, 15, '#39443e', 2.3);
    line(3, 8, 4, 15, '#39443e', 2.3);
    if (staffMember) {
        ctx.fillStyle = person.role === 'guide' ? '#f0d05b' : person.role === 'keeper' ? '#2b5f36' : '#285885';
        ctx.fillRect(-5, -12, 10, 3);
        if (person.role === 'guide') {
            line(5, -7, 5, -20, '#71412f', 2);
            polygon([{ x: 5, y: -20 }, { x: 15, y: -16 }, { x: 5, y: -13 }], '#e94d48');
        }
        else if (person.workTimer > 0 && person.role === 'keeper') {
            const task = person.task?.type;
            if (task === 'treat') {
                ctx.fillStyle = '#f5f5ef'; ctx.fillRect(7, -18, 11, 9);
                line(9, -13.5, 16, -13.5, '#b83e38', 2);
                line(12.5, -17, 12.5, -10, '#b83e38', 2);
            }
            else if (task === 'groom' || task === 'wash') {
                line(7, -17, 16, -8, '#755332', 2);
                for (let q = 0; q < 4; q++) line(13 + q, -10, 16 + q, -7, '#d4b36a', 1);
            }
            else if (task === 'cleanHabitat') {
                line(7, -18, 14, -7, '#7b5836', 2);
                polygon([{x:11,y:-8},{x:19,y:-10},{x:18,y:-5},{x:12,y:-4}], '#6f8190');
            }
            else {
                polygon([{ x: 6, y: -15 }, { x: 15, y: -15 }, { x: 13, y: -8 }, { x: 8, y: -8 }], '#9a6b38');
                for (const q of [8, 11, 14]) ellipse(q, -16, 1.5, 1.5, '#73a94b');
            }
        }
        else if (person.workTimer > 0 && person.role === 'janitor') {
            line(7, -17, 14, -6, '#8b643e', 2);
            line(11, -8, 17, -10, '#d1aa62', 3);
        }
    }
    ctx.restore();
    if (staffMember && person.role === 'guide' && person.group) {
        for (let i = 0; i < Math.min(6, person.group); i++) {
            const angle = i * Math.PI / 3;
            ctx.fillStyle = `hsl(${i * 55} 55% 55%)`;
            ctx.beginPath();
            ctx.arc(x + Math.cos(angle) * 13, y + Math.sin(angle) * 7 + 12, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawZoneOverlay(id, zone) {
    if (id === 'core' || state.unlocked.includes(id))
        return;
    const points = [
        worldToScreen(zone.x, zone.y),
        worldToScreen(zone.x + zone.w, zone.y),
        worldToScreen(zone.x + zone.w, zone.y + zone.h),
        worldToScreen(zone.x, zone.y + zone.h)
    ];
    polygon(points, 'rgba(23,45,31,.13)', 'rgba(255,255,255,.72)', 2);
    const center = worldToScreen(zone.x + zone.w / 2, zone.y + zone.h / 2, 2);
    roundedLabel(`${zone.name} · ${money(zone.cost)}`, center.x, center.y, 'rgba(31,65,45,.9)');
}

function drawEntrance() {
    const center = tileCenterScreen(1.2, ENTRANCE_Y - .05);
    ctx.save();
    ctx.shadowColor = 'rgba(20,38,29,.25)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;
    const width = 62, height = 42;
    line(center.x - width / 2, center.y + 8, center.x - width / 2, center.y - height, '#2a5c45', 7);
    line(center.x + width / 2, center.y + 8, center.x + width / 2, center.y - height, '#2a5c45', 7);
    ctx.fillStyle = '#f1c55a';
    ctx.beginPath();
    ctx.roundRect(center.x - width / 2 + 2, center.y - height - 8, width - 4, 22, 7);
    ctx.fill();
    ctx.strokeStyle = '#8c6b27';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#173f31';
    ctx.font = '900 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('POCKET ZOO', center.x, center.y - height + 6);
    ctx.restore();
}

function renderEntityList() {
    const entities = [];
    for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++) {
            if (!isUnlocked(x, y))
                continue;
            const object = tile(x, y).object;
            if (object)
                entities.push({ kind: FENCES[object] ? 'fence' : 'object', id: object, x, y, depth: screenDepth(x + .5, y + .5) + (FENCES[object] ? .02 : .12) });
        }
    for (const litter of state.litter)
        entities.push({ kind: 'litter', data: litter, x: litter.x + .5, y: litter.y + .5, depth: screenDepth(litter.x + .5, litter.y + .5) + .05 });
    for (const waste of state.animalWaste)
        entities.push({ kind: 'animalWaste', data: waste, x: waste.x + .5, y: waste.y + .5, depth: screenDepth(waste.x + .5, waste.y + .5) + .06 });
    for (const animal of state.animals)
        entities.push({ kind: 'animal', data: animal, x: animal.px, y: animal.py, depth: screenDepth(animal.px, animal.py) + .2 });
    for (const visitor of state.visitors)
        entities.push({ kind: 'visitor', data: visitor, x: visitor.x, y: visitor.y, depth: screenDepth(visitor.x, visitor.y) + .25 });
    for (const employee of state.staff)
        entities.push({ kind: 'staff', data: employee, x: employee.x, y: employee.y, depth: screenDepth(employee.x, employee.y) + .3 });
    entities.sort((a, b) => a.depth - b.depth || a.x - b.x);
    return entities;
}

function drawLitterIso(litter) {
    const point = tileCenterScreen(litter.x, litter.y, 1);
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate((litter.x * 3 + litter.y) * .23);
    polygon([{ x: -7, y: -2 }, { x: 1, y: -5 }, { x: 7, y: 0 }, { x: -1, y: 4 }], '#f0e6cf', '#b7aa8b', .8);
    polygon([{ x: 1, y: 1 }, { x: 8, y: -1 }, { x: 10, y: 4 }, { x: 3, y: 5 }], '#d7dce1', '#aeb7bd', .8);
    if (litter.amount > 2)
        polygon([{ x: -2, y: -8 }, { x: 5, y: -6 }, { x: 3, y: -1 }, { x: -4, y: -2 }], '#c9b27d', '#927b4f', .8);
    ctx.restore();
}

function drawAnimalWasteIso(waste) {
    const point = tileCenterScreen(waste.x, waste.y, 1);
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate((waste.x * 5 + waste.y * 2) * .19);
    ellipse(-3, 1, 5, 2.8, '#6d4a2f');
    ellipse(3, 0, 4, 2.4, '#7c5535');
    if (waste.amount > 1) ellipse(0, -3, 4, 2.3, '#5e3f29');
    if (waste.amount > 3) ellipse(5, -4, 3, 2, '#805a39');
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#e8f4e3');
    sky.addColorStop(.45, '#c5dfb9');
    sky.addColorStop(1, '#94ba80');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const position of tileDrawOrder()) {
        const unlocked = isUnlocked(position.x, position.y);
        drawGround(unlocked ? tile(position.x, position.y) : { ground: 'grass' }, position.x, position.y, !unlocked);
    }

    for (const [id, zone] of Object.entries(ZONES))
        drawZoneOverlay(id, zone);

    drawEntrance();

    for (const entity of renderEntityList()) {
        if (entity.kind === 'fence' || entity.kind === 'object')
            drawObject(entity.id, entity.x, entity.y);
        else if (entity.kind === 'litter')
            drawLitterIso(entity.data);
        else if (entity.kind === 'animalWaste')
            drawAnimalWasteIso(entity.data);
        else if (entity.kind === 'animal')
            drawAnimal(entity.data);
        else if (entity.kind === 'visitor')
            drawPerson(entity.data, 'visitor');
        else if (entity.kind === 'staff')
            drawPerson(entity.data, 'staff');
    }

    if (hoverTile && inside(hoverTile.x, hoverTile.y)) {
        const points = insetPoints(tileDiamond(hoverTile.x, hoverTile.y, 3), .08);
        const color = state.selected === 'erase' ? '#d13d36' : isUnlocked(hoverTile.x, hoverTile.y) ? '#fff' : '#ffd15a';
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.28)';
        ctx.shadowBlur = 4;
        polygon(points, 'rgba(255,255,255,.08)', color, 3);
        ctx.restore();
    }
}

