/* Pocket Zoo Architect — ui/inspector */
'use strict';

function inspect(x, y) {
    const z = zoneAt(x, y);
    if (!isUnlocked(x, y)) {
        state.inspection = { type: 'land', zone: z };
        renderInspector();
        return;
    }
    const a = animalAt(x, y), s = staffAt(x, y), v = visitorAt(x, y), t = tile(x, y), p = penAt(x, y);
    if (a)
        state.inspection = { type: 'animal', id: a.id };
    else if (s)
        state.inspection = { type: 'staff', id: s.id };
    else if (v)
        state.inspection = { type: 'visitor', id: v.id };
    else if (t.object)
        state.inspection = { type: 'object', x, y };
    else if (p?.enclosed)
        state.inspection = { type: 'habitat', x, y };
    else
        state.inspection = { type: 'tile', x, y };
    renderInspector();
}

function renderInspector() {
    const target = state.inspection, box = $('#inspector');
    if (!target) {
        box.innerHTML = 'Select <b>Inspect</b>, then click an animal, habitat, facility, employee or locked land parcel.';
        return;
    }
    if (target.type === 'land') {
        const zone = ZONES[target.zone];
        if (!zone) {
            state.inspection = null;
            return renderInspector();
        }
        box.innerHTML = `<div class="inspect-title art-title"><span class="art-chip">LAND</span><span>${zone.name}</span></div>${zone.desc}<br><span class="tag">${zone.w * zone.h} tiles</span><span class="tag">${money(zone.cost)}</span><p>${zone.requires && !state.unlocked.includes(zone.requires) ? `Requires ${ZONES[zone.requires].name}.` : 'Open the Land window to purchase this parcel.'}</p>`;
        return;
    }
    if (target.type === 'animal') {
        const a = state.animals.find(x => x.id === target.id);
        if (!a) {
            box.innerHTML = '<span class="warn">This animal is no longer in the zoo.</span>';
            return;
        }
        const sp = SPECIES[a.species];
        box.innerHTML = `<div class="inspect-title art-title"><span class="art-chip">AN</span><span>${a.name} · ${sp.name}</span></div><div class="metric-row"><span>Happiness</span><b class="${a.happiness >= 75 ? 'good' : a.happiness < 45 ? 'warn' : ''}">${a.happiness}%</b></div><div class="metric-row"><span>Hunger</span><b>${Math.round(a.hunger)}%</b></div><div class="metric-row"><span>Monthly care</span><b>${money(Math.round(sp.care * CARE_MULTIPLIER))}</b></div><span class="tag">${sp.biomes.join(' / ')}</span><span class="tag">Fence ${sp.fence.strength}/${sp.fence.height}</span>${a.issues?.length ? `<p class="warn">${a.issues.map(i => `• ${i}`).join('<br>')}</p>` : '<p class="good">All welfare needs are currently met.</p>'}`;
        return;
    }
    if (target.type === 'staff') {
        const s = state.staff.find(x => x.id === target.id);
        if (!s) {
            box.innerHTML = '<span class="warn">This employee is no longer employed.</span>';
            return;
        }
        box.innerHTML = `<div class="inspect-title art-title">${staffArtMarkup(s.role)}<span>${s.name}</span></div><span class="tag">${titleCase(s.role)}</span><span class="tag">${money(SALARY[s.role])}/month</span><p>${s.status}</p>${s.role === 'guide' && s.group ? `Leading ${s.group} visitors.` : ''}`;
        return;
    }
    if (target.type === 'visitor') {
        const v = state.visitors.find(x => x.id === target.id);
        if (!v) {
            box.innerHTML = '<span class="warn">This guest has left the zoo.</span>';
            return;
        }
        box.innerHTML = `<div class="inspect-title art-title"><span class="art-chip">G</span><span>Zoo guest</span></div><div class="metric-row"><span>Satisfaction</span><b>${Math.round(v.satisfaction)}%</b></div><div class="metric-row"><span>Education gained</span><b>${Math.round(v.education)}</b></div><div class="metric-row"><span>Hunger / thirst</span><b>${Math.round(v.hunger)} / ${Math.round(v.thirst)}</b></div>`;
        return;
    }
    const x = target.x, y = target.y;
    if (!inside(x, y) || !isUnlocked(x, y)) {
        box.innerHTML = '<span class="warn">The inspected location is no longer available.</span>';
        return;
    }
    const t = tile(x, y), p = penAt(x, y);
    if (target.type === 'object') {
        if (!t.object) {
            box.innerHTML = '<span class="warn">The inspected object was removed.</span>';
            return;
        }
        const d = OBJECTS[t.object];
        box.innerHTML = `<div class="inspect-title art-title"><span class="art-chip">OBJ</span><span>${d.name}</span></div>${d.desc || ''}${d.biome ? `<p><span class="tag">${titleCase(d.biome)} foliage</span><span class="tag">${d.foliage} foliage points</span></p><p>Allowed terrain: <b>${foliageTerrainText(t.object)}</b></p>` : ''}${d.strength ? `<p><span class="tag">Strength ${d.strength}</span><span class="tag">Height ${d.height}</span>${d.waterproof ? '<span class="tag">Waterproof</span>' : ''}</p>` : ''}${d.monthly ? `<p>Monthly upkeep: <b>${money(d.monthly)}</b></p>` : ''}${d.sale ? `<p>Revenue per use: <b>${money(d.sale)}</b></p>` : ''}`;
        return;
    }
    if (target.type === 'habitat' && p?.enclosed) {
        const species = [...new Set(p.animals.map(a => SPECIES[a.species].name))];
        box.innerHTML = `<div class="inspect-title art-title"><span class="art-chip">HAB</span><span>Habitat ${p.id + 1}</span></div><div class="metric-row"><span>Area</span><b>${p.cells.length} tiles</b></div><div class="metric-row"><span>Animals</span><b>${p.animals.length}</b></div><div class="metric-row"><span>Fence security</span><b>${p.minStrength}/${p.minHeight}</b></div><div class="metric-row"><span>Cleanliness</span><b>${Math.round(p.cleanliness)}%</b></div><p>${species.length ? species.join(', ') : 'Empty habitat'}</p>${Object.entries(p.foliageByBiome).map(([b, n]) => `<span class="tag">${titleCase(b)} ${n.toFixed(1)}</span>`).join('')}<br>${[...p.enrichment].map(e => `<span class="tag">${titleCase(e)}</span>`).join('')}`;
        return;
    }
    box.innerHTML = `<div class="inspect-title art-title"><span class="art-chip">TILE</span><span>${GROUND[t.ground]?.name || t.ground}</span></div><span class="tag">Tile ${x}, ${y}</span>${GROUND[t.ground]?.desc ? `<p>${GROUND[t.ground].desc}</p>` : ''}${isPathGround(t.ground) ? `<p>Walking speed: <b>${Math.round((GROUND[t.ground].walkSpeed || 1) * 100)}%</b><br>Path appeal: <b>${GROUND[t.ground].pathAppeal || 0}</b></p>` : ''}${p && !p.enclosed ? '<p>This area is not enclosed by barriers.</p>' : ''}`;
}
