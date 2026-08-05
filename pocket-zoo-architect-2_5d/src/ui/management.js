/* Pocket Zoo Architect — ui/management */
'use strict';

function staffIcon(role) { return role === 'keeper' ? 'Keeper' : role === 'janitor' ? 'Janitor' : 'Guide'; }

function renderStaff() { const r = recurringCosts(), k = countStaff('keeper'), j = countStaff('janitor'), g = countStaff('guide'); $('#payrollMini').textContent = `${money(r.payroll)}/month`; $('#keeperCount').textContent = k; $('#janitorCount').textContent = j; $('#guideCount').textContent = g; $('#staffSummary').textContent = `${k} keeper${k === 1 ? '' : 's'} · ${j} janitor${j === 1 ? '' : 's'} · ${g} guide${g === 1 ? '' : 's'}`; $('#staffList').innerHTML = state.staff.map(s => `<div class="staff-line">${staffArtMarkup(s.role)}<div><b>${s.name}</b><small>${s.status || 'Patrolling'}</small></div><span>${money(SALARY[s.role])}</span></div>`).join('') || '<div class="staff-line"><span class="art-chip">i</span><div><b>No employees</b><small>Hire staff to automate care, cleaning and tours.</small></div></div>'; }

function updateUI() {
    $('#moneyStat').textContent = money(state.money);
    $('#dateStat').textContent = dateText();
    $('#guestStat').textContent = state.visitors.length;
    const stars = getStars();
    $('#starStat').textContent = '★'.repeat(stars) + '☆'.repeat(5 - stars);
    $('#satisfactionValue').textContent = `${Math.round(state.satisfaction)}%`;
    $('#satisfactionMeter').style.width = `${state.satisfaction}%`;
    $('#cleanValue').textContent = `${Math.round(state.cleanliness)}%`;
    $('#cleanMeter').style.width = `${state.cleanliness}%`;
    $('#educationValue').textContent = Math.round(state.education);
    $('#educationMeter').style.width = `${clamp(state.education, 0, 100)}%`;
    $('#ratingLabel').textContent = ['', 'Neighbourhood zoo', 'Popular zoo', 'Regional attraction', 'Major institution', 'World-class zoo'][stars];
    $$('.icon-btn[data-speed]').forEach(b => b.classList.toggle('active', Number(b.dataset.speed) === state.speed));
    renderStaff();
    renderQuickTools();
    renderInspector();
}
