/* Pocket Zoo Architect — ui/construction */
'use strict';

function toolDetails(id, d) { const bits = []; if (d.desc)
    bits.push(d.desc); if (d.biome)
    bits.push(`${titleCase(d.biome)} biome`); if (FOLIAGE[id])
    bits.push(`Allowed on: ${foliageTerrainText(id)}`); if (d.strength)
    bits.push(`Fence strength ${d.strength}, height ${d.height}${d.waterproof ? ', waterproof' : ''}`); if (SPECIES[id]) {
    const sp = SPECIES[id];
    bits.push(`${sp.social} social minimum · ${sp.minArea} tiles each · ${money(Math.round(sp.care * CARE_MULTIPLIER))}/month care`);
} if (d.monthly)
    bits.push(`${money(d.monthly)}/month upkeep`); if (d.sale)
    bits.push(`Earns about ${money(d.sale)} per use`); if (d.path)
    bits.push(`${Math.round((d.walkSpeed || 1) * 100)}% walking speed · ${d.pathAppeal || 0} appeal`); return bits.join(' · '); }

function categoryItems(category) { return Object.entries(TOOLS).filter(([id, v]) => v.category === category && !['inspect', 'erase'].includes(id)); }

function renderTools() {
    const items = categoryItems(state.category);
    $('#toolButtons').innerHTML = items.map(([id, d]) => `<button class="tool ${state.selected === id ? 'active' : ''} ${toolUnlocked(id) ? '' : 'locked'}" data-tool="${id}" title="${toolDetails(id, d).replace(/"/g, '&quot;')}">${d.biome ? `<span class="biome-badge">${d.biome}</span>` : ''}${!toolUnlocked(id) ? `<span class="lock-badge">${d.stars}★</span>` : ''}<span class="tool-icon">${toolArt(id, d)}</span><span class="tool-name">${d.name}</span><span class="tool-cost">${d.cost ? money(d.cost) : 'Free'}</span></button>`).join('');
    $$('#toolButtons .tool').forEach(b => { b.onclick = () => selectTool(b.dataset.tool); b.onmouseenter = () => renderSelectedTool(b.dataset.tool); b.onmouseleave = () => renderSelectedTool(); });
    renderSelectedTool();
    renderQuickTools();
}

function renderSelectedTool(preview) { const id = preview || state.selected, d = TOOLS[id] || TOOLS.inspect; $('#selectedTool').innerHTML = `<strong>${d.name}${d.cost ? ` · ${money(d.cost)}` : ''}</strong>${toolDetails(id, d)}`; }

function selectTool(id) { state.selected = id; renderTools(); renderSelectedTool(); renderQuickTools(); }

function renderQuickTools() { $$('[data-quick-tool]').forEach(b => b.classList.toggle('active', b.dataset.quickTool === state.selected)); }
