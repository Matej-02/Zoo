/* Pocket Zoo Architect — data/catalog */
'use strict';

const OBJECTS = { ...FENCES, ...FOLIAGE, ...HABITAT_OBJECTS, ...FACILITIES, ...EDUCATION };

const TOOLS = {
    inspect: { name: 'Inspect', icon: '', category: 'build', cost: 0, desc: 'Inspect animals, habitats, facilities, staff and land. The panel updates live.' },
    erase: { name: 'Bulldoze', icon: '', category: 'build', cost: 0, desc: 'Remove paths, terrain, objects, fences, facilities or animals for a partial refund.' },
    ...Object.fromEntries(Object.entries(GROUND).filter(([, v]) => v.category === 'build').map(([k, v]) => [k, { ...v }])),
    ...Object.fromEntries(Object.entries(GROUND).filter(([, v]) => v.category === 'terrain').map(([k, v]) => [k, { ...v, ground: true }])),
    ...OBJECTS,
    ...Object.fromEntries(Object.entries(SPECIES).map(([k, v]) => [k, { name: v.name, icon: '', cost: v.cost, category: 'animals', stars: v.stars, desc: v.desc, animal: true }]))
};

const NAMES = { animal: ['Milo', 'Luna', 'Nala', 'Kito', 'Poppy', 'Zuri', 'Tala', 'Ravi', 'Nova', 'Mango', 'Koda', 'Maya', 'Pico', 'Tara', 'Indi', 'Suki', 'Bramble', 'Rio', 'Mochi', 'Zola'], keeper: ['Alex', 'Sam', 'Jordan', 'Morgan', 'Jamie', 'Robin', 'Taylor', 'Casey'], janitor: ['Chris', 'Dana', 'Lee', 'Avery', 'Riley', 'Pat', 'Sky', 'Quinn'], guide: ['Amelia', 'Noah', 'Sofia', 'Liam', 'Mia', 'Theo', 'Eva', 'Leo'] };

const CARE_MULTIPLIER = .6, SALARY = { keeper: 240, janitor: 185, guide: 280 }, HIRE_COST = { keeper: 130, janitor: 100, guide: 150 };

const LABELS = { tickets: 'Admission', shops: 'Food & retail', tours: 'Guided tours', donations: 'Donations', support: 'Founder support', education: 'Education activities', refunds: 'Refunds', construction: 'Construction', animals: 'Animal purchases', staffHiring: 'Recruitment', land: 'Land expansion', animalCare: 'Animal care', utilities: 'Utilities & upkeep', payroll: 'Salaries', veterinary: 'Veterinary care' };
