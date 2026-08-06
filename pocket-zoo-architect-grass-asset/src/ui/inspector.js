/* Pocket Zoo Architect — ui/inspector */
'use strict';

function inspect(x, y) {
    const zone = zoneAt(x, y);
    if (!isUnlocked(x, y)) { state.inspection = { type: 'land', zone }; renderInspector(); return; }
    const animal = animalAt(x, y), employee = staffAt(x, y), visitor = visitorAt(x, y), t = tile(x, y), pen = penAt(x, y);
    if (animal) state.inspection = { type: 'animal', id: animal.id };
    else if (employee) state.inspection = { type: 'staff', id: employee.id };
    else if (visitor) state.inspection = { type: 'visitor', id: visitor.id };
    else if (t.object) state.inspection = { type: 'object', x, y };
    else if (pen?.enclosed) state.inspection = { type: 'habitat', x, y };
    else state.inspection = { type: 'tile', x, y };
    renderInspector();
}

function careChip(label, value, className = '') { return `<div class="care-chip"><span>${label}</span><b class="${className}">${value}</b></div>`; }

function renderInspector() {
    const target = state.inspection, box = el('inspector');
    if (!box) return;
    if (!target) { box.innerHTML = 'Click an animal, habitat, building, employee, guest or land parcel to see live details.'; return; }

    if (target.type === 'land') {
        const zone = ZONES[target.zone];
        if (!zone) { state.inspection = null; return renderInspector(); }
        box.innerHTML = `<div class="inspect-title art-title"><span class="art-chip">LAND</span><span>${zone.name}</span></div>${zone.desc}<br><span class="tag">${zone.w * zone.h} tiles</span><span class="tag">${money(zone.cost)}</span><p>${zone.requires && !state.unlocked.includes(zone.requires) ? `Requires ${ZONES[zone.requires].name}.` : 'Open the Land panel to purchase this parcel.'}</p>`;
        return;
    }

    if (target.type === 'animal') {
        const animal = state.animals.find(item => item.id === target.id);
        if (!animal) { box.innerHTML = '<span class="warn">This animal is no longer in the zoo.</span>'; return; }
        ensureAnimalCareFields(animal);
        const species = SPECIES[animal.species];
        box.innerHTML = `<div class="inspect-title art-title"><span class="art-chip">AN</span><span>${animal.name} · ${species.name}</span></div>
        <div class="care-grid">${careChip('Happiness', `${animal.happiness}%`, animal.happiness >= 75 ? 'good' : animal.happiness < 45 ? 'warn' : '')}${careChip('Health', `${Math.round(animal.health)}%`, animal.sick || animal.health < 60 ? 'warn' : 'good')}${careChip('Hunger', `${Math.round(animal.hunger)}%`, animal.hunger < 40 ? 'warn' : '')}${careChip('Hygiene', `${Math.round(animal.hygiene)}%`, animal.hygiene < 55 ? 'warn' : '')}${careChip('Grooming', `${Math.round(animal.grooming)}%`, animal.grooming < 55 ? 'warn' : '')}${careChip('Age', animal.juvenile ? `${animal.ageDays} days · young` : 'Adult')}</div>
        <span class="tag">${animal.sex}</span><span class="tag">${species.biomes.join(' / ')}</span><span class="tag">Fence ${species.fence.strength}/${species.fence.height}</span><span class="tag">${money(Math.round(species.care * CARE_MULTIPLIER))}/month</span>
        ${animal.sick ? `<p class="warn">Ill for ${animal.illnessDays} day${animal.illnessDays === 1 ? '' : 's'}. A keeper will prioritise treatment.</p>` : ''}
        ${animal.issues?.length ? `<p class="warn">${animal.issues.map(issue => `• ${issue}`).join('<br>')}</p>` : '<p class="good">All welfare needs are currently met.</p>'}`;
        return;
    }

    if (target.type === 'staff') {
        const employee = state.staff.find(item => item.id === target.id);
        if (!employee) { box.innerHTML = '<span class="warn">This employee is no longer employed.</span>'; return; }
        box.innerHTML = `<div class="inspect-title art-title">${staffArtMarkup(employee.role)}<span>${employee.name}</span></div><span class="tag">${titleCase(employee.role)}</span><span class="tag">${money(SALARY[employee.role])}/month</span><p><b>Current activity:</b><br>${employee.status}</p>${employee.role === 'guide' && employee.group ? `<p>Leading ${employee.group} visitors.</p>` : ''}`;
        return;
    }

    if (target.type === 'visitor') {
        const visitor = state.visitors.find(item => item.id === target.id);
        if (!visitor) { box.innerHTML = '<span class="warn">This guest has left the zoo.</span>'; return; }
        box.innerHTML = `<div class="inspect-title art-title"><span class="art-chip">G</span><span>Zoo guest</span></div><div class="care-grid">${careChip('Satisfaction', `${Math.round(visitor.satisfaction)}%`)}${careChip('Education', Math.round(visitor.education))}${careChip('Hunger', Math.round(visitor.hunger))}${careChip('Thirst', Math.round(visitor.thirst))}</div>`;
        return;
    }

    const x = target.x, y = target.y;
    if (!inside(x, y) || !isUnlocked(x, y)) { box.innerHTML = '<span class="warn">The inspected location is no longer available.</span>'; return; }
    const t = tile(x, y), pen = penAt(x, y);

    if (target.type === 'object') {
        if (!t.object) { box.innerHTML = '<span class="warn">The inspected object was removed.</span>'; return; }
        const definition = OBJECTS[t.object];
        box.innerHTML = `<div class="inspect-title art-title"><span class="art-chip">OBJ</span><span>${definition.name}</span></div>${definition.desc || ''}${definition.biome ? `<p><span class="tag">${titleCase(definition.biome)} foliage</span><span class="tag">${definition.foliage} foliage points</span></p><p>Allowed terrain: <b>${foliageTerrainText(t.object)}</b></p>` : ''}${definition.strength ? `<p><span class="tag">Strength ${definition.strength}</span><span class="tag">Height ${definition.height}</span>${definition.waterproof ? '<span class="tag">Waterproof</span>' : ''}</p>` : ''}${definition.monthly ? `<p>Monthly upkeep: <b>${money(definition.monthly)}</b></p>` : ''}${definition.sale ? `<p>Revenue per use: <b>${money(definition.sale)}</b></p>` : ''}`;
        return;
    }

    if (target.type === 'habitat' && pen?.enclosed) {
        const species = [...new Set(pen.animals.map(animal => SPECIES[animal.species].name))];
        const sick = pen.animals.filter(animal => animal.sick).length;
        box.innerHTML = `<div class="inspect-title art-title"><span class="art-chip">HAB</span><span>Habitat ${pen.id + 1}</span></div><div class="care-grid">${careChip('Area', `${pen.cells.length} tiles`)}${careChip('Animals', pen.animals.length)}${careChip('Cleanliness', `${Math.round(pen.cleanliness)}%`, pen.cleanliness < 55 ? 'warn' : 'good')}${careChip('Animal waste', pen.waste || 0, pen.waste ? 'warn' : 'good')}</div><div class="metric-row"><span>Fence security</span><b>${pen.minStrength}/${pen.minHeight}</b></div>${sick ? `<p class="warn">${sick} sick animal${sick === 1 ? '' : 's'} need keeper attention.</p>` : ''}<p>${species.length ? species.join(', ') : 'Empty habitat'}</p>${Object.entries(pen.foliageByBiome).map(([biome, count]) => `<span class="tag">${titleCase(biome)} ${count.toFixed(1)}</span>`).join('')}<br>${[...pen.enrichment].map(item => `<span class="tag">${titleCase(item)}</span>`).join('')}`;
        return;
    }

    box.innerHTML = `<div class="inspect-title art-title"><span class="art-chip">TILE</span><span>${GROUND[t.ground]?.name || t.ground}</span></div><span class="tag">Tile ${x}, ${y}</span>${GROUND[t.ground]?.desc ? `<p>${GROUND[t.ground].desc}</p>` : ''}${isPathGround(t.ground) ? `<p>Walking speed: <b>${Math.round((GROUND[t.ground].walkSpeed || 1) * 100)}%</b><br>Path appeal: <b>${GROUND[t.ground].pathAppeal || 0}</b></p>` : ''}${pen && !pen.enclosed ? '<p>This area is not enclosed by barriers.</p>' : ''}`;
}
