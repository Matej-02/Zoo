/* Pocket Zoo Architect — ui/finance */
'use strict';

function drawFinanceChart() {
    const c = el('financeChart');
    if (!c) return;
    const g = c.getContext('2d');
    const current = { ...state.finance.current, net: sumObj(state.finance.current.income) - sumObj(state.finance.current.expense) };
    const data = [...state.finance.history.slice(-11), current];
    g.clearRect(0, 0, c.width, c.height);
    const pad = { l: 42, r: 10, t: 16, b: 32 }, w = c.width - pad.l - pad.r, h = c.height - pad.t - pad.b;
    const max = Math.max(100, ...data.flatMap(d => [sumObj(d.income), sumObj(d.expense)]));
    g.strokeStyle = '#dfe4dd'; g.lineWidth = 1; g.font = '9px system-ui'; g.fillStyle = '#6b7770';
    for (let i = 0; i <= 4; i++) {
        const y = pad.t + h - i * h / 4;
        g.beginPath(); g.moveTo(pad.l, y); g.lineTo(c.width - pad.r, y); g.stroke();
        g.fillText(money(max * i / 4), 2, y + 3);
    }
    const group = w / Math.max(1, data.length);
    data.forEach((d, i) => {
        const inc = sumObj(d.income), exp = sumObj(d.expense), bw = Math.max(4, group * .25), x = pad.l + i * group + group * .2;
        g.fillStyle = '#3a9b67'; g.fillRect(x, pad.t + h - inc / max * h, bw, inc / max * h);
        g.fillStyle = '#d46159'; g.fillRect(x + bw + 2, pad.t + h - exp / max * h, bw, exp / max * h);
        g.fillStyle = '#6b7770'; g.textAlign = 'center';
        g.fillText(MONTHS[d.month].slice(0, 3), x + bw, pad.t + h + 13);
        g.fillText(String(d.year).slice(-2), x + bw, pad.t + h + 24);
    });
    g.textAlign = 'left';
}

function renderBars(target, obj, type) {
    const box = document.querySelector(target);
    if (!box) return;
    const rows = Object.entries(obj).filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...rows.map(row => row[1]));
    box.innerHTML = rows.map(([category, value]) => `<div class="bar-row"><span>${LABELS[category] || titleCase(category)}</span><div class="bar-track"><div class="bar-fill ${type === 'income' ? 'bar-income' : 'bar-expense'}" style="width:${value / max * 100}%"></div></div><b class="${type === 'income' ? 'positive' : 'negative'}">${money(value)}</b></div>`).join('') || '<p class="panel-intro">No transactions yet.</p>';
}

function renderFinance() {
    if (!el('finCash')) return;
    const ledger = state.finance.current, income = sumObj(ledger.income), expense = sumObj(ledger.expense), net = income - expense;
    const recurring = recurringCosts(), projectedSupport = state.startupMonthsRemaining > 0 ? 500 : 0, forecast = net + projectedSupport - recurring.total;
    setText('financePeriod', `${currentMonthName()} · figures accumulate until month end.`);
    setText('finCash', money(state.money)); setText('finIncome', money(income)); setText('finExpense', money(expense)); setText('finNet', money(net));
    el('finNet').className = net >= 0 ? 'positive' : 'negative';
    setText('finForecast', money(forecast)); el('finForecast').className = forecast >= 0 ? 'positive' : 'negative';
    setText('finNextPayroll', nextMonthText());
    el('ticketSlider').value = state.ticketPrice; setText('ticketValue', money(state.ticketPrice));
    setText('forecastPayroll', money(recurring.payroll)); setText('forecastCare', money(recurring.care)); setText('forecastUtilities', money(recurring.utilities)); setText('forecastTotal', money(recurring.total));
    renderBars('#incomeBars', ledger.income, 'income'); renderBars('#expenseBars', ledger.expense, 'expense');
    el('financeTable').innerHTML = state.finance.history.slice(-14).reverse().map(month => {
        const inc = sumObj(month.income), exp = sumObj(month.expense), result = inc - exp;
        return `<tr><td>${MONTHS[month.month]} ${month.year}</td><td class="positive">${money(inc)}</td><td class="negative">${money(exp)}</td><td class="${result >= 0 ? 'positive' : 'negative'}">${money(result)}</td></tr>`;
    }).join('') || '<tr><td colspan="4">The first report appears when the current month ends.</td></tr>';
    drawFinanceChart();
}

function openFinance() { openPanel('finance'); }
function closeFinance() { closePanel(); }
