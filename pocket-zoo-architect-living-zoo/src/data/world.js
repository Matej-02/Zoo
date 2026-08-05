/* Pocket Zoo Architect — data/world */
'use strict';

const ZONES = {
    core: { name: 'Founders Park', x: 0, y: 0, w: 30, h: 20, cost: 0, desc: 'Your original 600-tile zoo grounds.' },
    east: { name: 'Eastern Meadows', x: 30, y: 0, w: 8, h: 20, cost: 2800, requires: 'core', desc: '160 tiles suited to savanna and family attractions.' },
    farEast: { name: 'Conservation Ridge', x: 38, y: 0, w: 8, h: 20, cost: 5200, requires: 'east', desc: '160 premium tiles for large flagship habitats.' },
    south: { name: 'River Valley', x: 0, y: 20, w: 30, h: 10, cost: 3600, requires: 'core', desc: '300 tiles ideal for wetlands and aquatic exhibits.' },
    southEast: { name: 'Rainforest Annex', x: 30, y: 20, w: 8, h: 10, cost: 4300, requires: 'east', desc: '80 compact rainforest and education tiles.' },
    coast: { name: 'Ocean Discovery Zone', x: 38, y: 20, w: 8, h: 10, cost: 6800, requires: 'farEast', desc: '80 tiles intended for marine exhibits and an aquarium district.' }
};

const GROUND = {
    grass: { name: 'Meadow grass', icon: '', cost: 3, color: '#89c765', category: 'terrain', biome: 'temperate', desc: 'Soft temperate ground for woodland and grazing habitats.' },
    dirt: { name: 'Dry soil', icon: '', cost: 4, color: '#a77b50', category: 'terrain', biome: 'savanna', desc: 'Dry compacted soil used by savanna and desert species.' },
    sand: { name: 'Desert sand', icon: '', cost: 6, color: '#d9c076', category: 'terrain', biome: 'desert', desc: 'Loose warm sand for desert species and beaches.' },
    mud: { name: 'Wet mud', icon: '', cost: 6, color: '#796044', category: 'terrain', biome: 'river', desc: 'Wet riverbank terrain for semi-aquatic animals.' },
    rock: { name: 'Rocky ground', icon: '', cost: 8, color: '#8e9693', category: 'terrain', biome: 'mountain', stars: 2, desc: 'Hard rocky terrain for mountain animals and basking areas.' },
    snow: { name: 'Snow', icon: '', cost: 9, color: '#dce8eb', category: 'terrain', biome: 'snow', stars: 2, desc: 'Cold snow terrain for polar species.' },
    ice: { name: 'Ice', icon: '', cost: 11, color: '#b8dce5', category: 'terrain', biome: 'snow', stars: 3, desc: 'Frozen terrain for advanced cold-climate habitats.' },
    shallowWater: { name: 'Shallow freshwater', icon: '', cost: 12, color: '#5faac1', category: 'terrain', biome: 'river', desc: 'Shallow freshwater for wading and riverbank animals.' },
    deepWater: { name: 'Deep freshwater', icon: '', cost: 16, color: '#397fa6', category: 'terrain', biome: 'river', stars: 2, desc: 'Swimmable freshwater for otters, penguins and crocodiles.' },
    saltWater: { name: 'Saltwater pool', icon: '', cost: 20, color: '#286f9c', category: 'terrain', biome: 'sea', stars: 3, desc: 'Marine water for seals, turtles and dolphins.' },
    naturePath: { name: 'Nature trail', icon: '', cost: 3, color: '#a78d64', category: 'build', path: true, walkSpeed: .94, pathAppeal: .35, desc: 'Cheap natural trail. Slightly slower but blends into habitats.' },
    path: { name: 'Gravel path', icon: '', cost: 4, color: '#c7b58b', category: 'build', path: true, walkSpeed: 1, pathAppeal: .25, desc: 'Reliable basic guest path.' },
    brickPath: { name: 'Brick promenade', icon: '', cost: 7, color: '#b96f55', category: 'build', path: true, walkSpeed: 1.07, pathAppeal: .7, desc: 'Attractive brick path that improves guest movement.' },
    slatePath: { name: 'Slate avenue', icon: '', cost: 9, color: '#87979c', category: 'build', path: true, walkSpeed: 1.12, pathAppeal: 1, stars: 2, desc: 'Fast premium stone path with strong visual appeal.' },
    boardwalk: { name: 'Timber boardwalk', icon: '', cost: 8, color: '#a9794d', category: 'build', path: true, walkSpeed: 1.02, pathAppeal: .65, stars: 2, desc: 'Raised timber route suited to wetland and marine areas.' },
    mosaicPath: { name: 'Mosaic plaza', icon: '', cost: 13, color: '#d4b469', category: 'build', path: true, walkSpeed: 1.1, pathAppeal: 1.6, stars: 3, desc: 'Decorative premium paving for busy attraction areas.' }
};

const FENCES = {
    lowFence: { name: 'Low farm fence', icon: '', cost: 7, strength: 1, height: 1, category: 'fences', desc: 'For small and calm animals.' },
    standardFence: { name: 'Standard fence', icon: '', cost: 11, strength: 2, height: 2, category: 'fences', desc: 'General-purpose habitat fence.' },
    strongFence: { name: 'Heavy barrier', icon: '', cost: 18, strength: 4, height: 2, category: 'fences', stars: 2, desc: 'Strong enough for large and powerful animals.' },
    highFence: { name: 'High mesh fence', icon: '', cost: 20, strength: 2, height: 4, category: 'fences', stars: 2, desc: 'Tall containment for climbing primates and big cats.' },
    glassFence: { name: 'Reinforced glass', icon: '', cost: 27, strength: 4, height: 4, waterproof: true, category: 'fences', stars: 3, desc: 'Premium secure viewing barrier.' },
    aquaticWall: { name: 'Aquatic wall', icon: '', cost: 31, strength: 4, height: 4, waterproof: true, category: 'fences', stars: 3, desc: 'Waterproof wall for marine and deep-water habitats.' },
    lowGate: { name: 'Low keeper gate', icon: '', cost: 20, strength: 1, height: 1, gate: true, category: 'fences', desc: 'Gate for small-animal habitats.' },
    standardGate: { name: 'Keeper gate', icon: '', cost: 28, strength: 2, height: 2, gate: true, category: 'fences', desc: 'Standard staff entrance.' },
    strongGate: { name: 'Heavy keeper gate', icon: '', cost: 39, strength: 4, height: 2, gate: true, category: 'fences', stars: 2, desc: 'Heavy gate for elephants, hippos and similar animals.' },
    highGate: { name: 'High keeper gate', icon: '', cost: 43, strength: 2, height: 4, gate: true, category: 'fences', stars: 2, desc: 'Tall gate for primates and climbing predators.' },
    aquaticGate: { name: 'Aquatic service gate', icon: '', cost: 54, strength: 4, height: 4, waterproof: true, gate: true, category: 'fences', stars: 3, desc: 'Secure service access for aquatic exhibits.' }
};
