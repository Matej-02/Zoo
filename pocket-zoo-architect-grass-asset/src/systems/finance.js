/* Pocket Zoo Architect — systems/finance */
'use strict';

function record(type, category, amount) {
    if (!state.finance.current[type][category]) state.finance.current[type][category] = 0;
    state.finance.current[type][category] += amount;
}

function spend(amount, category = 'construction') {
    if (state.money < amount) { toast(`Not enough cash: ${money(amount)} required.`); return false; }
    state.money -= amount; record('expense', category, amount); return true;
}
function earn(amount, category) { state.money += amount; record('income', category, amount); }
function refund(cost) { const value = Math.round((cost || 0) * .55); earn(value, 'refunds'); return value; }

function recurringCosts() {
    let utilities = 0;
    for (const row of state.tiles) for (const t of row) utilities += OBJECTS[t.object]?.monthly || 0;
    const care = Math.round(state.animals.reduce((sum, animal) => sum + (SPECIES[animal.species]?.care || 0), 0) * CARE_MULTIPLIER);
    const payroll = state.staff.reduce((sum, employee) => sum + (SALARY[employee.role] || 0), 0);
    return { utilities, care, payroll, total: utilities + care + payroll };
}

function closeMonth() {
    if (state.startupMonthsRemaining > 0) {
        const grant = 500; earn(grant, 'support'); state.startupMonthsRemaining--;
        log(`Founder support added ${money(grant)}. ${state.startupMonthsRemaining} supported month${state.startupMonthsRemaining === 1 ? '' : 's'} remain.`);
    }
    const recurring = recurringCosts();
    if (recurring.care) { state.money -= recurring.care; record('expense', 'animalCare', recurring.care); }
    if (recurring.utilities) { state.money -= recurring.utilities; record('expense', 'utilities', recurring.utilities); }
    if (recurring.payroll) { state.money -= recurring.payroll; record('expense', 'payroll', recurring.payroll); }
    const ledger = state.finance.current, income = sumObj(ledger.income), expense = sumObj(ledger.expense);
    ledger.closing = state.money; ledger.net = income - expense;
    state.finance.history.push(JSON.parse(JSON.stringify(ledger))); state.finance.history = state.finance.history.slice(-48);
    log(`${MONTHS[ledger.month]} ${ledger.year} closed: ${money(income)} income, ${money(expense)} expenses, ${money(ledger.net)} net.`);
    if (ledger.net < 0) state.satisfaction = clamp(state.satisfaction - .5, 0, 100);
    checkGoals(); state.finance.current = newLedger(state.calendar); save(false);
}

function publishYearSummary(year) {
    const months = state.finance.history.filter(ledger => ledger.year === year);
    if (!months.length) return;
    const income = months.reduce((sum, ledger) => sum + sumObj(ledger.income), 0);
    const expense = months.reduce((sum, ledger) => sum + sumObj(ledger.expense), 0);
    const net = income - expense;
    pushZooEvent('finance', `${year} financial report`, `The zoo earned ${money(income)}, spent ${money(expense)} and finished the year ${net >= 0 ? 'with a surplus of' : 'with a deficit of'} ${money(Math.abs(net))}.`, { force: true, priority: 'high', key: `year:${year}` });
}

function publishDailyConditionEvents() {
    const monthKey = `${state.calendar.year}-${state.calendar.month}`;
    if (state.totalGuests >= 25 && state.cleanliness >= 92)
        pushZooEvent('guest', 'Guests praise cleanliness', `Public areas and habitats are at ${Math.round(state.cleanliness)}% cleanliness.`, { key: `clean:${monthKey}` });
    if (state.animals.length >= 2 && state.animalHappiness >= 86)
        pushZooEvent('animal', 'Animals are thriving', `Average animal happiness has reached ${Math.round(state.animalHappiness)}%.`, { key: `happy:${monthKey}` });
    if (state.satisfaction >= 88 && state.visitors.length >= 10)
        pushZooEvent('guest', 'Visitors are delighted', `Guest satisfaction is currently ${Math.round(state.satisfaction)}%.`, { key: `guesthappy:${monthKey}` });
}

function advanceDay() {
    const closingYear = state.calendar.year;
    const max = daysInMonth(state.calendar.month, state.calendar.year);
    state.calendar.day++;
    let yearChanged = false;
    if (state.calendar.day > max) {
        state.calendar.day = 1; state.calendar.month++;
        if (state.calendar.month > 11) { state.calendar.month = 0; state.calendar.year++; yearChanged = true; }
        closeMonth();
    }

    const passive = countObject('bin') * .18 + countStaff('janitor') * .9;
    for (let n = 0; n < passive; n++)
        if (state.litter.length && Math.random() < passive - Math.floor(passive) + .25) {
            const litter = state.litter[Math.floor(Math.random() * state.litter.length)];
            litter.amount--; if (litter.amount <= 0) state.litter.splice(state.litter.indexOf(litter), 1);
        }

    processAnimalDay();
    calculateZooMetrics();
    publishDailyConditionEvents();
    if (yearChanged) publishYearSummary(closingYear);
    checkGoals(); updateUI();
    if (financeOpen) renderFinance();
}
