/* Pocket Zoo Architect — ui/construction */
'use strict';

function toolDetails(id, d) {
    const bits = [];
    if (d.desc) bits.push(d.desc);
    if (d.biome) bits.push(`${titleCase(d.biome)} biome`);
    if (FOLIAGE[id]) bits.push(`Allowed on: ${foliageTerrainText(id)}`);
    if (d.strength) bits.push(`Fence strength ${d.strength}, height ${d.height}${d.waterproof ? ', waterproof' : ''}`);
    if (SPECIES[id]) {
        const sp = SPECIES[id];
        bits.push(`${sp.social} social minimum · ${sp.minArea} tiles each · ${money(Math.round(sp.care * CARE_MULTIPLIER))}/month care`);
    }
    if (d.monthly) bits.push(`${money(d.monthly)}/month upkeep`);
    if (d.sale) bits.push(`Earns about ${money(d.sale)} per use`);
    if (d.path) bits.push(`${Math.round((d.walkSpeed || 1) * 100)}% walking speed · ${d.pathAppeal || 0} appeal`);
    return bits.join(' · ');
}

function categoryItems(category) {
    return Object.entries(TOOLS).filter(([id, value]) => value.category === category && !['inspect', 'erase'].includes(id));
}

function renderTools() {
    const box = el('toolButtons');
    if (!box) return;
    const items = categoryItems(state.category);
    box.innerHTML = items.map(([id, d]) => `<button class="tool ${state.selected === id ? 'active' : ''} ${toolUnlocked(id) ? '' : 'locked'}" data-tool="${id}" aria-label="${d.name}">${d.biome ? `<span class="biome-badge">${d.biome}</span>` : ''}${!toolUnlocked(id) ? `<span class="lock-badge">${d.stars}★</span>` : ''}<span class="tool-icon">${toolArt(id, d)}</span><span class="tool-name">${d.name}</span><span class="tool-cost">${d.cost ? money(d.cost) : 'Free'}</span></button>`).join('');
    $$('#toolButtons .tool').forEach(button => button.onclick = () => selectTool(button.dataset.tool));
    renderSelectedTool();
}

function renderSelectedTool() {
    const box = el('selectedTool');
    if (!box) return;
    const id = state.selected, d = TOOLS[id] || TOOLS.inspect;
    box.innerHTML = `<strong>${d.name}${d.cost ? ` · ${money(d.cost)}` : ''}</strong>${toolDetails(id, d)}`;
}

function selectTool(id) {
    state.selected = id;
    if (!['inspect', 'erase'].includes(id) && TOOLS[id]?.category) {
        state.category = TOOLS[id].category;
        if (state.activePanel === 'construction') openPanel('construction', state.category);
    }
    renderTools();
    renderSelectedTool();
    syncRail();
}

function renderQuickTools() { syncRail(); }
