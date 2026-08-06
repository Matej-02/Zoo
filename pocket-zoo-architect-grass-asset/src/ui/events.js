/* Pocket Zoo Architect — ui/events */
'use strict';

$$('.rail-btn[data-panel]').forEach(button => button.onclick = () => {
    const panel = button.dataset.panel;
    if (panel === 'inspector') {
        selectTool('inspect');
        openPanel('inspector');
    }
    else openPanel(panel, button.dataset.category || null);
});

$$('.rail-btn[data-tool]').forEach(button => button.onclick = () => {
    const tool = button.dataset.tool;
    selectTool(tool);
    if (tool === 'inspect') openPanel('inspector');
    else {
        closePanel();
        setMessage('Bulldoze active. Click or drag over items to remove them.');
    }
});

el('closeContext').onclick = closePanel;
$$('.icon-btn[data-speed]').forEach(button => button.onclick = () => { state.speed = Number(button.dataset.speed); updateUI(); });
$$('[data-hire]').forEach(button => button.onclick = () => hire(button.dataset.hire));
$$('[data-dismiss]').forEach(button => button.onclick = () => dismiss(button.dataset.dismiss));

el('zoomIn').onclick = () => setZoom(zoom + .12);
el('zoomOut').onclick = () => setZoom(zoom - .12);
el('centerBtn').onclick = centerCanvas;
el('rotateLeft').onclick = () => rotateCamera(-1);
el('rotateRight').onclick = () => rotateCamera(1);

el('saveBtn').onclick = () => save(true);
el('helpBtn').onclick = () => el('welcome').classList.remove('hidden');
el('closeWelcome').onclick = el('continueBtn').onclick = () => el('welcome').classList.add('hidden');
el('startFresh').onclick = resetGame;
el('exportBtn').onclick = exportSave;
el('importBtn').onclick = () => el('importFile').click();
el('importFile').onchange = event => { const file = event.target.files?.[0]; importSaveFile(file); event.target.value = ''; };
el('resetBtn').onclick = resetGame;

el('ticketSlider').oninput = event => {
    state.ticketPrice = Number(event.target.value);
    setText('ticketValue', money(state.ticketPrice));
    setMessage(`Admission price set to ${money(state.ticketPrice)}.`);
    renderFinance();
};

el('openEventPanel').onclick = () => openPanel('events');
el('togglePulse').onclick = () => {
    state.pulseMinimized = !state.pulseMinimized;
    renderZooEvents();
    save(false);
};
$$('.event-filter').forEach(button => button.onclick = () => setEventFilter(button.dataset.eventFilter));

window.addEventListener('beforeunload', () => save(false));
window.addEventListener('keydown', event => {
    if (event.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
    if (event.key.toLowerCase() === 'q') { event.preventDefault(); rotateCamera(-1); }
    else if (event.key.toLowerCase() === 'e') { event.preventDefault(); rotateCamera(1); }
    else if (event.key === 'Escape') closePanel();
});
