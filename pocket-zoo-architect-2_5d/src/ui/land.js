/* Pocket Zoo Architect — ui/land */
'use strict';

function buyExpansion(id) { const z = ZONES[id]; if (!z || state.unlocked.includes(id))
    return; if (z.requires && !state.unlocked.includes(z.requires)) {
    toast(`Purchase ${ZONES[z.requires].name} first.`);
    return;
} if (!spend(z.cost, 'land'))
    return; state.unlocked.push(id); structureDirty = true; log(`${z.name} purchased for ${money(z.cost)}.`); toast(`${z.name} unlocked.`); renderLand(); checkGoals(); updateUI(); }

function renderLand() { $('#landGrid').innerHTML = Object.entries(ZONES).filter(([id]) => id !== 'core').map(([id, z]) => { const owned = state.unlocked.includes(id), available = !z.requires || state.unlocked.includes(z.requires); return `<div class="land-card ${owned ? 'unlocked' : ''}"><h3><span class="art-chip">${owned ? 'OWN' : 'LAND'}</span> ${z.name}</h3><p>${z.desc}</p><div class="metric-row"><span>Area</span><b>${z.w * z.h} tiles</b></div><button class="${owned ? 'secondary' : 'primary'}" data-buy-land="${id}" ${owned || !available ? 'disabled' : ''}>${owned ? 'Owned' : available ? `Buy for ${money(z.cost)}` : `Requires ${ZONES[z.requires].name}`}</button></div>`; }).join(''); $$('[data-buy-land]').forEach(b => b.onclick = () => buyExpansion(b.dataset.buyLand)); }

function openLand() { renderLand(); $('#landModal').classList.remove('hidden'); landOpen = true; }

function closeLand() { $('#landModal').classList.add('hidden'); landOpen = false; }
