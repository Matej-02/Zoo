/* Pocket Zoo Architect — ui/panels */
'use strict';

const PANEL_META = {
    overview: ['Zoo overview', 'The condition of your living zoo.'],
    construction: ['Construction', 'Select an item, then click or drag on the world.'],
    staff: ['Employees', 'Hire, dismiss and follow visible zoo staff.'],
    objectives: ['Objectives', 'Complete milestones for grants and progression.'],
    inspector: ['Inspector', 'Live information about the selected animal, habitat or object.'],
    finance: ['Monthly finances', 'Income accumulates during the month; recurring costs close monthly.'],
    land: ['Zoo expansion', 'Purchase adjoining parcels as the zoo grows.'],
    events: ['Zoo news', 'A curated record of meaningful events, limited to a few each day.'],
    settings: ['Save and settings', 'Portable saves, controls and starting a new zoo.']
};

const CATEGORY_NAMES = {
    build: ['Paths', 'Connect the entrance, habitats and visitor facilities.'],
    terrain: ['Terrain', 'Shape habitat surfaces, water and snow.'],
    fences: ['Fences and gates', 'Choose the security, height and waterproofing each species needs.'],
    habitat: ['Habitat equipment', 'Shelter, food, water and species-specific enrichment.'],
    foliage: ['Biome foliage', 'Plants only grow on logical terrain and count toward matching animal biomes.'],
    animals: ['Animals', 'Place animals only in secure, accessible habitats.'],
    facilities: ['Guest buildings', 'Food, toilets, retail, seating and attractions.'],
    education: ['Education', 'Insects, birds, butterflies, reptiles, conservation and aquariums.']
};

let activeEventFilter = 'all';

function syncRail() {
    $$('.rail-btn').forEach(button => {
        const categoryMatch = button.dataset.panel === 'construction' && state.activePanel === 'construction' && button.dataset.category === state.category;
        const panelMatch = button.dataset.panel && button.dataset.panel !== 'construction' && button.dataset.panel === state.activePanel;
        button.classList.toggle('active', Boolean(categoryMatch || panelMatch));
        button.classList.toggle('tool-active', button.dataset.tool === state.selected);
    });
}

function openPanel(name, category = null) {
    if (name === 'construction' && category) state.category = category;
    state.activePanel = name;
    el('main').classList.remove('panel-closed');
    el('contextPanel').classList.remove('closed');
    $$('.feature-panel').forEach(panel => panel.classList.toggle('active', panel.dataset.view === name));
    const meta = name === 'construction' ? CATEGORY_NAMES[state.category] : PANEL_META[name];
    setText('panelTitle', meta?.[0] || 'Zoo');
    setText('panelSubtitle', meta?.[1] || '');
    if (name === 'construction') renderTools();
    if (name === 'staff') renderStaff();
    if (name === 'objectives') renderGoals();
    if (name === 'inspector') renderInspector();
    if (name === 'finance') { financeOpen = true; renderFinance(); }
    else financeOpen = false;
    if (name === 'land') { landOpen = true; renderLand(); }
    else landOpen = false;
    if (name === 'events') markZooEventsRead();
    syncRail();
    save(false);
}

function closePanel() {
    el('main').classList.add('panel-closed');
    el('contextPanel').classList.add('closed');
    financeOpen = false;
    landOpen = false;
    $$('.rail-btn').forEach(button => button.classList.remove('active'));
}

function eventMark(type) {
    return type === 'animal' ? 'AN' : type === 'finance' ? '$' : type === 'guest' ? 'G' : type === 'staff' ? 'ST' : 'Z';
}

function renderZooEvents() {
    const events = state.zooEvents || [];
    const panel = el('eventFeedPanel');
    if (panel) {
        const filtered = activeEventFilter === 'all' ? events : events.filter(event => event.type === activeEventFilter);
        panel.innerHTML = filtered.map(event => `<article class="zoo-event"><span class="event-mark ${event.type}">${eventMark(event.type)}</span><div><b>${event.title}</b><p>${event.text}</p><time>${event.date}</time></div></article>`).join('') || '<div class="panel-note"><b>No matching news</b><p>Important zoo events will appear here without flooding the interface.</p></div>';
    }
    const pulse = el('zooPulseList');
    if (pulse) {
        pulse.innerHTML = events.slice(0, 4).map(event => `<div class="pulse-item ${event.type}"><i class="pulse-dot"></i><div><b>${event.title}</b><time>${event.date}</time></div></div>`).join('') || '<div class="pulse-empty">The zoo is quiet. Meaningful events will appear here.</div>';
    }
    const unread = events.filter(event => event.unread).length;
    const badge = el('eventBadge');
    if (badge) {
        badge.textContent = Math.min(99, unread);
        badge.classList.toggle('hidden', unread === 0);
    }
    const pulseBox = el('zooPulse');
    if (pulseBox) pulseBox.classList.toggle('minimized', Boolean(state.pulseMinimized));
    const toggle = el('togglePulse');
    if (toggle) toggle.textContent = state.pulseMinimized ? '+' : '−';
}

function setEventFilter(filter) {
    activeEventFilter = filter;
    $$('.event-filter').forEach(button => button.classList.toggle('active', button.dataset.eventFilter === filter));
    renderZooEvents();
}
