/* Pocket Zoo Architect — ui/land */
'use strict';

function buyExpansion(id) {
    const zone = ZONES[id];
    if (!zone || state.unlocked.includes(id)) return;
    if (zone.requires && !state.unlocked.includes(zone.requires)) { toast(`Purchase ${ZONES[zone.requires].name} first.`); return; }
    if (!spend(zone.cost, 'land')) return;
    state.unlocked.push(id); structureDirty = true;
    log(`${zone.name} purchased for ${money(zone.cost)}.`);
    pushZooEvent('finance', 'The zoo expanded', `${zone.name} was purchased for ${money(zone.cost)}.`, { key: `land:${id}` });
    toast(`${zone.name} unlocked.`); renderLand(); checkGoals(); updateUI();
}

function renderLand() {
    const box = el('landGrid');
    if (!box) return;
    box.innerHTML = Object.entries(ZONES).filter(([id]) => id !== 'core').map(([id, zone]) => {
        const owned = state.unlocked.includes(id), available = !zone.requires || state.unlocked.includes(zone.requires);
        return `<div class="land-card ${owned ? 'unlocked' : ''}"><h3><span class="art-chip">${owned ? 'OWN' : 'LAND'}</span> ${zone.name}</h3><p>${zone.desc}</p><div class="metric-row"><span>Area</span><b>${zone.w * zone.h} tiles</b></div><button data-buy-land="${id}" ${owned || !available ? 'disabled' : ''}>${owned ? 'Owned' : available ? `Buy for ${money(zone.cost)}` : `Requires ${ZONES[zone.requires].name}`}</button></div>`;
    }).join('');
    $$('[data-buy-land]').forEach(button => button.onclick = () => buyExpansion(button.dataset.buyLand));
}

function openLand() { openPanel('land'); }
function closeLand() { closePanel(); }
