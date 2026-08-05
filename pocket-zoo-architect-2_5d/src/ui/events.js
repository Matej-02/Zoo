/* Pocket Zoo Architect — ui/events */
'use strict';

$$('#tabs .tab').forEach(b => b.onclick = () => { state.category = b.dataset.category; $$('#tabs .tab').forEach(x => x.classList.toggle('active', x === b)); renderTools(); });

$$('[data-quick-tool]').forEach(b => b.onclick = () => selectTool(b.dataset.quickTool));

$$('.icon-btn[data-speed]').forEach(b => b.onclick = () => { state.speed = Number(b.dataset.speed); updateUI(); });

$$('[data-hire]').forEach(b => b.onclick = () => hire(b.dataset.hire));

$$('[data-dismiss]').forEach(b => b.onclick = () => dismiss(b.dataset.dismiss));

$('#zoomIn').onclick = () => { zoom = clamp(zoom + .12, .45, 1.45); applyZoom(); };

$('#zoomOut').onclick = () => { zoom = clamp(zoom - .12, .45, 1.45); applyZoom(); };

$('#centerBtn').onclick = centerCanvas;

$('#panelBtn').onclick = () => $('#rightPanel').classList.toggle('open');

$('#saveBtn').onclick = () => save(true);

$('#exportBtn').onclick = exportSave;

$('#importBtn').onclick = () => $('#importFile').click();

$('#importFile').onchange = event => {
    const file = event.target.files?.[0];
    importSaveFile(file);
    event.target.value = '';
};

$('#resetBtn').onclick = resetGame;

$('#helpBtn').onclick = () => $('#welcome').classList.remove('hidden');

$('#closeWelcome').onclick = $('#continueBtn').onclick = () => $('#welcome').classList.add('hidden');

$('#startFresh').onclick = resetGame;

$('#financeBtn').onclick = openFinance;

$('#closeFinance').onclick = closeFinance;

$('#financeModal').addEventListener('click', e => { if (e.target === $('#financeModal'))
    closeFinance(); });

$('#landBtn').onclick = openLand;

$('#closeLand').onclick = closeLand;

$('#landModal').addEventListener('click', e => { if (e.target === $('#landModal'))
    closeLand(); });

$('#ticketSlider').oninput = e => { state.ticketPrice = Number(e.target.value); $('#ticketValue').textContent = money(state.ticketPrice); setMessage(`Admission price set to ${money(state.ticketPrice)}.`); };

window.addEventListener('beforeunload', () => save(false));

window.addEventListener('resize', () => { if (innerWidth > 1080)
    $('#rightPanel').classList.remove('open'); });

$('#rotateLeft').onclick = () => rotateCamera(-1);
$('#rotateRight').onclick = () => rotateCamera(1);

window.addEventListener('keydown', event => {
    if (event.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName))
        return;
    if (event.key.toLowerCase() === 'q') {
        event.preventDefault();
        rotateCamera(-1);
    }
    else if (event.key.toLowerCase() === 'e') {
        event.preventDefault();
        rotateCamera(1);
    }
});
