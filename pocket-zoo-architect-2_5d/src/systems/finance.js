/* Pocket Zoo Architect — systems/finance */
'use strict';

function record(type, category, amount) { if (!state.finance.current[type][category])
    state.finance.current[type][category] = 0; state.finance.current[type][category] += amount; }

function spend(amount, category = 'construction') { if (state.money < amount) {
    toast(`Not enough cash: ${money(amount)} required.`);
    return false;
} state.money -= amount; record('expense', category, amount); return true; }

function earn(amount, category) { state.money += amount; record('income', category, amount); }

function refund(cost) { const v = Math.round((cost || 0) * .55); earn(v, 'refunds'); return v; }

function recurringCosts() { let utilities = 0; for (const row of state.tiles)
    for (const t of row)
        utilities += OBJECTS[t.object]?.monthly || 0; const care = Math.round(state.animals.reduce((a, b) => a + (SPECIES[b.species]?.care || 0), 0) * CARE_MULTIPLIER); const payroll = state.staff.reduce((a, b) => a + (SALARY[b.role] || 0), 0); return { utilities, care, payroll, total: utilities + care + payroll }; }

function closeMonth() {
    if (state.startupMonthsRemaining > 0) {
        const grant = 500;
        earn(grant, 'support');
        state.startupMonthsRemaining--;
        log(`Founder support added ${money(grant)}. ${state.startupMonthsRemaining} supported month${state.startupMonthsRemaining === 1 ? '' : 's'} remain.`);
    }
    const r = recurringCosts();
    if (r.care) {
        state.money -= r.care;
        record('expense', 'animalCare', r.care);
    }
    if (r.utilities) {
        state.money -= r.utilities;
        record('expense', 'utilities', r.utilities);
    }
    if (r.payroll) {
        state.money -= r.payroll;
        record('expense', 'payroll', r.payroll);
    }
    const ledger = state.finance.current, inc = sumObj(ledger.income), exp = sumObj(ledger.expense);
    ledger.closing = state.money;
    ledger.net = inc - exp;
    state.finance.history.push(JSON.parse(JSON.stringify(ledger)));
    state.finance.history = state.finance.history.slice(-36);
    log(`${MONTHS[ledger.month]} ${ledger.year} closed: ${money(inc)} income, ${money(exp)} expenses, ${money(ledger.net)} net.`);
    if (ledger.net < 0)
        state.satisfaction = clamp(state.satisfaction - .5, 0, 100);
    checkGoals();
    state.finance.current = newLedger(state.calendar);
    save(false);
}

function advanceDay() {
    const max = daysInMonth(state.calendar.month, state.calendar.year);
    state.calendar.day++;
    if (state.calendar.day > max) {
        state.calendar.day = 1;
        state.calendar.month++;
        if (state.calendar.month > 11) {
            state.calendar.month = 0;
            state.calendar.year++;
        }
        closeMonth();
    }
    // Passive housekeeping makes bins and janitors scale properly without flooding the map.
    const passive = countObject('bin') * .18 + countStaff('janitor') * .9;
    for (let n = 0; n < passive; n++)
        if (state.litter.length && Math.random() < passive - Math.floor(passive) + .25) {
            const l = state.litter[Math.floor(Math.random() * state.litter.length)];
            l.amount--;
            if (l.amount <= 0)
                state.litter.splice(state.litter.indexOf(l), 1);
        }
    if (!countStaff('keeper'))
        for (const a of state.animals)
            a.hunger = clamp(a.hunger - 1.2, 0, 100);
    calculateZooMetrics();
    checkGoals();
    updateUI();
    if (financeOpen)
        renderFinance();
}
