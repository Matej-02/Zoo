/* Pocket Zoo Architect — ui/management */
'use strict';

function staffIcon(role) { return role === 'keeper' ? 'Keeper' : role === 'janitor' ? 'Janitor' : 'Guide'; }

function renderStaff() {
    const list = el('staffList');
    const r = recurringCosts(), k = countStaff('keeper'), j = countStaff('janitor'), g = countStaff('guide');
    setText('payrollMini', `${money(r.payroll)}/month`);
    setText('keeperCount', k);
    setText('janitorCount', j);
    setText('guideCount', g);
    setText('staffSummary', `${k} keeper${k === 1 ? '' : 's'} · ${j} janitor${j === 1 ? '' : 's'} · ${g} guide${g === 1 ? '' : 's'}`);
    if (!list) return;
    list.innerHTML = state.staff.map(s => `<div class="staff-line">${staffArtMarkup(s.role)}<div><b>${s.name}</b><small>${s.status || 'Patrolling'}</small></div><span>${money(SALARY[s.role])}</span></div>`).join('') || '<div class="staff-line"><span class="art-chip">i</span><div><b>No employees</b><small>Hire staff to automate care, cleaning and tours.</small></div></div>';
}

function updateUI() {
    setText('moneyStat', money(state.money));
    setText('dateStat', dateText());
    setText('guestStat', state.visitors.length);
    setText('animalHappyStat', state.animals.length ? `${Math.round(state.animalHappiness)}%` : '—');
    const stars = getStars();
    const starText = '★'.repeat(stars) + '☆'.repeat(5 - stars);
    setText('starStat', starText);
    setText('overviewStars', starText);
    setText('satisfactionValue', `${Math.round(state.satisfaction)}%`);
    setWidth('satisfactionMeter', `${state.satisfaction}%`);
    setText('cleanValue', `${Math.round(state.cleanliness)}%`);
    setWidth('cleanMeter', `${state.cleanliness}%`);
    setText('animalHappinessValue', state.animals.length ? `${Math.round(state.animalHappiness)}%` : 'No animals');
    setWidth('animalHappinessMeter', `${state.animals.length ? state.animalHappiness : 0}%`);
    setText('educationValue', Math.round(state.education));
    setWidth('educationMeter', `${clamp(state.education, 0, 100)}%`);
    setText('ratingLabel', ['', 'Neighbourhood zoo', 'Popular zoo', 'Regional attraction', 'Major institution', 'World-class zoo'][stars]);
    setText('animalCountOverview', state.animals.length);
    setText('speciesCountOverview', new Set(state.animals.map(animal => animal.species)).size);
    setText('staffCountOverview', state.staff.length);
    const ledger = state.finance.current, recurring = recurringCosts(), projectedSupport = state.startupMonthsRemaining > 0 ? 500 : 0;
    const forecast = sumObj(ledger.income) - sumObj(ledger.expense) + projectedSupport - recurring.total;
    setText('forecastOverview', money(forecast));
    const forecastNode = el('forecastOverview');
    if (forecastNode) forecastNode.className = forecast >= 0 ? 'positive' : 'negative';
    $$('.icon-btn[data-speed]').forEach(button => button.classList.toggle('active', Number(button.dataset.speed) === state.speed));
    renderStaff();
    renderInspector();
    renderZooEvents();
    syncRail();
}
