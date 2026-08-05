/* Pocket Zoo Architect — ui/finance */
'use strict';

function drawFinanceChart() {
    const c = $('#financeChart'), g = c.getContext('2d'), current = { ...state.finance.current, net: sumObj(state.finance.current.income) - sumObj(state.finance.current.expense) }, data = [...state.finance.history.slice(-11), current];
    g.clearRect(0, 0, c.width, c.height);
    const pad = { l: 42, r: 12, t: 18, b: 34 }, w = c.width - pad.l - pad.r, h = c.height - pad.t - pad.b, max = Math.max(100, ...data.flatMap(d => [sumObj(d.income), sumObj(d.expense)]));
    g.strokeStyle = '#dfe4dd';
    g.lineWidth = 1;
    g.font = '9px system-ui';
    g.fillStyle = '#6b7770';
    for (let i = 0; i <= 4; i++) {
        const y = pad.t + h - i * h / 4;
        g.beginPath();
        g.moveTo(pad.l, y);
        g.lineTo(c.width - pad.r, y);
        g.stroke();
        g.fillText(money(max * i / 4), 2, y + 3);
    }
    const group = w / Math.max(1, data.length);
    data.forEach((d, i) => { const inc = sumObj(d.income), exp = sumObj(d.expense), bw = Math.max(5, group * .25), x = pad.l + i * group + group * .2; g.fillStyle = '#3a9b67'; g.fillRect(x, pad.t + h - inc / max * h, bw, inc / max * h); g.fillStyle = '#d46159'; g.fillRect(x + bw + 2, pad.t + h - exp / max * h, bw, exp / max * h); g.fillStyle = '#6b7770'; g.textAlign = 'center'; g.fillText(MONTHS[d.month].slice(0, 3), x + bw, pad.t + h + 14); g.fillText(String(d.year).slice(-2), x + bw, pad.t + h + 25); });
    g.textAlign = 'left';
}

function renderBars(target, obj, type) { const rows = Object.entries(obj).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]), mx = Math.max(1, ...rows.map(r => r[1])); $(target).innerHTML = rows.map(([k, v]) => `<div class="bar-row"><span>${LABELS[k] || titleCase(k)}</span><div class="bar-track"><div class="bar-fill ${type === 'income' ? 'bar-income' : 'bar-expense'}" style="width:${v / mx * 100}%"></div></div><b class="${type === 'income' ? 'positive' : 'negative'}">${money(v)}</b></div>`).join('') || '<p>No transactions yet.</p>'; }

function renderFinance() {
    const l = state.finance.current, inc = sumObj(l.income), exp = sumObj(l.expense), net = inc - exp, r = recurringCosts(), projectedSupport = state.startupMonthsRemaining > 0 ? 500 : 0, forecast = net + projectedSupport - r.total;
    $('#financePeriod').textContent = `${currentMonthName()} · figures accumulate until month end.`;
    $('#finCash').textContent = money(state.money);
    $('#finIncome').textContent = money(inc);
    $('#finExpense').textContent = money(exp);
    $('#finNet').textContent = money(net);
    $('#finNet').className = net >= 0 ? 'positive' : 'negative';
    $('#finForecast').textContent = money(forecast);
    $('#finForecast').className = forecast >= 0 ? 'positive' : 'negative';
    $('#finNextPayroll').textContent = nextMonthText();
    $('#ticketSlider').value = state.ticketPrice;
    $('#ticketValue').textContent = money(state.ticketPrice);
    $('#forecastPayroll').textContent = money(r.payroll);
    $('#forecastCare').textContent = money(r.care);
    $('#forecastUtilities').textContent = money(r.utilities);
    $('#forecastTotal').textContent = money(r.total);
    renderBars('#incomeBars', l.income, 'income');
    renderBars('#expenseBars', l.expense, 'expense');
    $('#financeTable').innerHTML = state.finance.history.slice(-14).reverse().map(m => { const i = sumObj(m.income), e = sumObj(m.expense), n = i - e; return `<tr><td>${MONTHS[m.month]} ${m.year}</td><td class="positive">${money(i)}</td><td class="negative">${money(e)}</td><td class="${n >= 0 ? 'positive' : 'negative'}">${money(n)}</td><td>${money(m.closing)}</td></tr>`; }).join('') || '<tr><td colspan="5">The first report appears when the current month ends.</td></tr>';
    drawFinanceChart();
}

function openFinance() { renderFinance(); $('#financeModal').classList.remove('hidden'); financeOpen = true; }

function closeFinance() { $('#financeModal').classList.add('hidden'); financeOpen = false; }
