/* Pocket Zoo Architect — render/sprite-assets */
'use strict';

const ANIMAL_SPRITES = {
    riverOtter: {
        root: 'assets/animals/river-otter/',
        sequences: {
            idle: ['idle_1.png', 'idle_2.png'],
            walk: ['walk_1.png', 'walk_2.png', 'walk_3.png'],
            eat: ['eat.png'],
            sleep: ['sleep.png']
        },
        images: {}, loaded: false
    }
};

const STATIC_ANIMAL_SPRITE_FOLDERS = {
    zebra: 'zebra', giraffe: 'giraffe', pygmyGoat: 'pygmy-goat', capybara: 'capybara', meerkat: 'meerkat',
    flamingo: 'flamingo', kangaroo: 'kangaroo', penguin: 'penguin', crocodile: 'crocodile', seal: 'seal', hippo: 'hippo',
    lion: 'lion', tiger: 'tiger', gorilla: 'gorilla', orangutan: 'orangutan', panda: 'panda', elephant: 'elephant',
    polarBear: 'polar-bear', seaTurtle: 'sea-turtle', dolphin: 'dolphin'
};

for (const [speciesId, folder] of Object.entries(STATIC_ANIMAL_SPRITE_FOLDERS)) {
    ANIMAL_SPRITES[speciesId] = {
        root: `assets/animals/${folder}/`,
        sequences: { idle: ['idle.svg'] },
        images: {}, loaded: false
    };
}

function loadAnimalSprites() {
    for (const sprite of Object.values(ANIMAL_SPRITES)) {
        let total = 0, ready = 0;
        const completed = () => { ready++; sprite.loaded = ready >= total; };
        for (const files of Object.values(sprite.sequences)) {
            for (const file of files) {
                total++;
                const image = new Image();
                image.decoding = 'async';
                image.onload = completed;
                image.onerror = completed;
                image.src = sprite.root + file;
                sprite.images[file] = image;
            }
        }
        if (!total) sprite.loaded = true;
    }
}

function getAnimalSpriteFrame(speciesId, sequence, frameIndex = 0) {
    const sprite = ANIMAL_SPRITES[speciesId];
    if (!sprite) return null;
    const frames = sprite.sequences[sequence] || sprite.sequences.idle;
    if (!frames?.length) return null;
    const file = frames[Math.abs(frameIndex) % frames.length];
    const image = sprite.images[file];
    return image?.complete && image.naturalWidth ? image : null;
}

function animalSpriteLoaded(speciesId) {
    return Boolean(ANIMAL_SPRITES[speciesId]?.loaded);
}

loadAnimalSprites();


const TERRAIN_SPRITES = {
    grass: { src: 'assets/terrain/grass.png', image: null, loaded: false }
};

function loadTerrainSprites() {
    for (const asset of Object.values(TERRAIN_SPRITES)) {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => { asset.loaded = true; };
        image.onerror = () => { asset.loaded = false; };
        image.src = asset.src;
        asset.image = image;
    }
}

function getTerrainSprite(id) {
    const asset = TERRAIN_SPRITES[id];
    const image = asset?.image;
    return asset?.loaded && image?.complete && image.naturalWidth ? image : null;
}

loadTerrainSprites();
