/* Pocket Zoo Architect — systems/objectives */
'use strict';

const GOALS = [
    { id: 'paths', title: 'Open the gates', text: 'Build 20 connected path tiles', reward: 180, test: () => accessiblePaths.size >= 20 },
    { id: 'securePen', title: 'Secure habitat', text: 'Build an enclosed habitat with a connected gate', reward: 250, test: () => penCache.some(p => p.enclosed && gateWorkspot(p) && p.cells.length >= 12) },
    { id: 'firstAnimals', title: 'First residents', text: 'Welcome three animals to the zoo', reward: 260, test: () => state.animals.length >= 3 },
    { id: 'biome', title: 'Biome designer', text: 'Reach 80% happiness for two animals', reward: 300, test: () => state.animals.filter(a => a.happiness >= 80).length >= 2 },
    { id: 'team', title: 'Complete team', text: 'Hire a keeper, janitor and tour guide', reward: 360, test: () => countStaff('keeper') && countStaff('janitor') && countStaff('guide') },
    { id: 'education', title: 'Learning zoo', text: 'Reach 40 education points', reward: 300, test: () => state.education >= 40 },
    { id: 'aquatic', title: 'Life aquatic', text: 'Keep an aquatic or semi-aquatic species above 75% happiness', reward: 380, test: () => state.animals.some(a => (SPECIES[a.species].aquatic || SPECIES[a.species].semiAquatic) && a.happiness >= 75) },
    { id: 'variety', title: 'Biodiversity', text: 'Display six different animal species', reward: 480, test: () => new Set(state.animals.map(a => a.species)).size >= 6 },
    { id: 'expand', title: 'Growing institution', text: 'Purchase a land expansion', reward: 450, test: () => state.unlocked.length >= 2 },
    { id: 'clean', title: 'Clean and comfortable', text: 'Maintain 90% cleanliness with 35 guests', reward: 340, test: () => state.cleanliness >= 90 && state.totalGuests >= 35 },
    { id: 'profit', title: 'Sustainable month', text: 'Complete a month with at least $750 profit', reward: 650, test: () => state.finance.history.some(m => m.net >= 750) },
    { id: 'fourStars', title: 'Regional landmark', text: 'Reach four stars', reward: 900, test: () => getStars() >= 4 }
];

function checkGoals() { for (const g of GOALS)
    if (!state.completedGoals.includes(g.id) && g.test()) {
        state.completedGoals.push(g.id);
        earn(g.reward, 'donations');
        log(`Objective complete: ${g.title}. Grant received: ${money(g.reward)}.`);
        toast(`${g.title}: +${money(g.reward)}`);
    } renderGoals(); }

function renderGoals() { $('#goals').innerHTML = GOALS.map(g => { const done = state.completedGoals.includes(g.id); return `<div class="goal"><span class="goal-status ${done ? 'done' : ''}"></span><div><b>${g.title}</b><small>${g.text}</small></div><span class="reward">${done ? 'Done' : money(g.reward)}</span></div>`; }).join(''); }
