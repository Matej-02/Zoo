/* Pocket Zoo Architect — data/foliage */
'use strict';

const FOLIAGE = {
    oak: { name: 'English oak', icon: '', cost: 20, biome: 'temperate', foliage: 2, shape: 'round', color: '#3f8a4e', category: 'foliage', desc: 'Large temperate shade tree.' },
    birch: { name: 'Silver birch', icon: '', cost: 18, biome: 'temperate', foliage: 1.5, shape: 'slim', color: '#6daa60', category: 'foliage', desc: 'Light woodland tree.' },
    maple: { name: 'Maple', icon: '', cost: 22, biome: 'temperate', foliage: 2, shape: 'round', color: '#c46b38', category: 'foliage', stars: 2, desc: 'Colourful temperate tree.' },
    woodlandBush: { name: 'Woodland shrubs', icon: '', cost: 10, biome: 'temperate', foliage: 1, shape: 'bush', color: '#4f9152', category: 'foliage', desc: 'Low forest cover.' },
    wildflowers: { name: 'Wildflower patch', icon: '', cost: 13, biome: 'temperate', foliage: .5, decor: 2, shape: 'flowers', color: '#d65d86', category: 'foliage', desc: 'Temperate meadow planting.' },
    acacia: { name: 'Acacia', icon: '', cost: 23, biome: 'savanna', foliage: 2, shape: 'flat', color: '#6d9b46', category: 'foliage', desc: 'Classic savanna browse tree.' },
    baobab: { name: 'Baobab', icon: '', cost: 32, biome: 'savanna', foliage: 3, shape: 'baobab', color: '#6f9148', category: 'foliage', stars: 2, desc: 'Massive savanna landmark tree.' },
    dryGrass: { name: 'Tall dry grass', icon: '', cost: 9, biome: 'savanna', foliage: 1, shape: 'grass', color: '#b59b45', category: 'foliage', desc: 'Natural cover for open-country species.' },
    thornBush: { name: 'Thorn bush', icon: '', cost: 11, biome: 'savanna', foliage: 1, shape: 'bush', color: '#718b45', category: 'foliage', desc: 'Hardy savanna browse.' },
    cactus: { name: 'Saguaro cactus', icon: '', cost: 17, biome: 'desert', foliage: 1.5, shape: 'cactus', color: '#3f9860', category: 'foliage', desc: 'Tall desert plant.' },
    agave: { name: 'Agave', icon: '', cost: 12, biome: 'desert', foliage: 1, shape: 'spike', color: '#5d9e7b', category: 'foliage', desc: 'Low drought-tolerant desert plant.' },
    datePalm: { name: 'Date palm', icon: '', cost: 24, biome: 'desert', foliage: 2, shape: 'palm', color: '#5b9b54', category: 'foliage', desc: 'Oasis shade tree.' },
    desertBloom: { name: 'Desert blooms', icon: '', cost: 13, biome: 'desert', foliage: .5, decor: 2, shape: 'flowers', color: '#d9687b', category: 'foliage', desc: 'Seasonal desert flowers.' },
    kapok: { name: 'Kapok tree', icon: '', cost: 28, biome: 'rainforest', foliage: 3, shape: 'jungle', color: '#278448', category: 'foliage', stars: 2, desc: 'Tall tropical canopy tree.' },
    banana: { name: 'Banana plant', icon: '', cost: 17, biome: 'rainforest', foliage: 1.5, shape: 'banana', color: '#46a658', category: 'foliage', desc: 'Broad tropical leaves.' },
    fern: { name: 'Giant fern', icon: '', cost: 13, biome: 'rainforest', foliage: 1, shape: 'fern', color: '#318d50', category: 'foliage', desc: 'Dense rainforest ground cover.' },
    bamboo: { name: 'Bamboo grove', icon: '', cost: 20, biome: 'rainforest', foliage: 2, shape: 'bamboo', color: '#58a94d', category: 'foliage', desc: 'Essential browse for pandas.' },
    rainforestVine: { name: 'Rainforest vines', icon: '', cost: 15, biome: 'rainforest', foliage: 1.5, shape: 'vine', color: '#27783e', category: 'foliage', desc: 'Climbing tropical vegetation.' },
    pine: { name: 'Mountain pine', icon: '', cost: 20, biome: 'mountain', foliage: 2, shape: 'pine', color: '#2f7451', category: 'foliage', desc: 'Cold-resistant conifer.' },
    fir: { name: 'Silver fir', icon: '', cost: 22, biome: 'mountain', foliage: 2, shape: 'pine', color: '#346a5a', category: 'foliage', desc: 'Dense mountain evergreen.' },
    alpineShrub: { name: 'Alpine shrub', icon: '', cost: 11, biome: 'mountain', foliage: 1, shape: 'bush', color: '#5c7c55', category: 'foliage', desc: 'Low mountain cover.' },
    willow: { name: 'Weeping willow', icon: '', cost: 26, biome: 'river', foliage: 2.5, shape: 'willow', color: '#4d9b55', category: 'foliage', desc: 'Shade tree for riverbanks.' },
    reeds: { name: 'Reed bed', icon: '', cost: 11, biome: 'river', foliage: 1, shape: 'reeds', color: '#708f44', category: 'foliage', desc: 'Wetland shelter and nesting cover.' },
    lilyPads: { name: 'Water lilies', icon: '', cost: 14, biome: 'river', foliage: 1, shape: 'lily', color: '#55a15d', waterPlant: true, category: 'foliage', desc: 'Freshwater floating plants.' },
    mangrove: { name: 'Mangrove', icon: '', cost: 25, biome: 'river', foliage: 2, shape: 'mangrove', color: '#3d8852', waterPlant: true, category: 'foliage', stars: 2, desc: 'Wetland roots and shelter.' },
    kelp: { name: 'Kelp forest', icon: '', cost: 18, biome: 'sea', foliage: 2, shape: 'kelp', color: '#247a59', waterPlant: true, category: 'foliage', stars: 3, desc: 'Marine vegetation for saltwater exhibits.' },
    coral: { name: 'Coral garden', icon: '', cost: 26, biome: 'sea', foliage: 2, decor: 2, shape: 'coral', color: '#dc7267', waterPlant: true, category: 'foliage', stars: 3, desc: 'Colourful marine habitat structure.' },
    seaGrass: { name: 'Seagrass bed', icon: '', cost: 14, biome: 'sea', foliage: 1.5, shape: 'grass', color: '#2d8966', waterPlant: true, category: 'foliage', stars: 3, desc: 'Feeding habitat for turtles and fish.' },
    snowPine: { name: 'Snow pine', icon: '', cost: 23, biome: 'snow', foliage: 2, shape: 'snowpine', color: '#3b7460', category: 'foliage', stars: 2, desc: 'Snow-covered evergreen.' },
    tundraBush: { name: 'Tundra shrub', icon: '', cost: 12, biome: 'snow', foliage: 1, shape: 'bush', color: '#718477', category: 'foliage', stars: 2, desc: 'Hardy low polar vegetation.' }
};

const FOLIAGE_TERRAIN = {
    oak: ['grass', 'dirt', 'mud'], birch: ['grass', 'dirt', 'mud'], maple: ['grass', 'dirt'], woodlandBush: ['grass', 'dirt', 'mud'], wildflowers: ['grass', 'dirt'],
    acacia: ['grass', 'dirt', 'sand'], baobab: ['grass', 'dirt', 'sand'], dryGrass: ['grass', 'dirt', 'sand'], thornBush: ['grass', 'dirt', 'sand'],
    cactus: ['sand', 'dirt', 'rock'], agave: ['sand', 'dirt', 'rock'], datePalm: ['sand', 'dirt', 'mud'], desertBloom: ['sand', 'dirt'],
    kapok: ['grass', 'mud', 'dirt'], banana: ['grass', 'mud'], fern: ['grass', 'mud', 'dirt'], bamboo: ['grass', 'mud', 'dirt'], rainforestVine: ['grass', 'mud', 'dirt'],
    pine: ['grass', 'rock', 'snow'], fir: ['grass', 'rock', 'snow'], alpineShrub: ['rock', 'grass', 'snow'],
    willow: ['grass', 'mud'], reeds: ['mud', 'shallowWater'], lilyPads: ['shallowWater', 'deepWater'], mangrove: ['mud', 'shallowWater'],
    kelp: ['saltWater'], coral: ['saltWater'], seaGrass: ['saltWater'], snowPine: ['snow', 'rock', 'grass'], tundraBush: ['snow', 'rock', 'grass']
};

for (const [id, d] of Object.entries(FOLIAGE))
    d.allowedGrounds = FOLIAGE_TERRAIN[id] || ['grass', 'dirt'];
