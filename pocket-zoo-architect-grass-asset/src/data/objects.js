/* Pocket Zoo Architect — data/objects */
'use strict';

const HABITAT_OBJECTS = {
    shelter: { name: 'Basic shelter', icon: '', cost: 60, category: 'habitat', shelter: 1, desc: 'Sleeping and weather protection.' },
    cave: { name: 'Rock cave', icon: '', cost: 88, category: 'habitat', shelter: 1, stars: 2, desc: 'Cool secure shelter for predators and mountain animals.' },
    heatedShelter: { name: 'Heated shelter', icon: '', cost: 125, category: 'habitat', shelter: 1, stars: 3, desc: 'Climate-controlled shelter for sensitive species.' },
    feeder: { name: 'Food station', icon: '', cost: 48, category: 'habitat', feeder: 1, desc: 'Keepers refill this station.' },
    waterPump: { name: 'Water pump', icon: '', cost: 62, category: 'habitat', waterService: 1, desc: 'Fresh drinking water for land animals.' },
    activityBall: { name: 'Activity ball', icon: '', cost: 42, category: 'habitat', enrichment: 'play', desc: 'General play enrichment.' },
    climbingFrame: { name: 'Climbing frame', icon: '', cost: 72, category: 'habitat', enrichment: 'climb', stars: 2, desc: 'For primates, bears and active animals.' },
    scratchingPost: { name: 'Scratching post', icon: '', cost: 50, category: 'habitat', enrichment: 'scratch', desc: 'For cats and other scratching species.' },
    burrowMound: { name: 'Burrow mound', icon: '', cost: 45, category: 'habitat', enrichment: 'dig', desc: 'Digging and lookout enrichment.' },
    swing: { name: 'Rope swing', icon: '', cost: 58, category: 'habitat', enrichment: 'swing', stars: 2, desc: 'Aerial enrichment for primates.' },
    puzzleFeeder: { name: 'Puzzle feeder', icon: '', cost: 66, category: 'habitat', enrichment: 'puzzle', stars: 2, desc: 'Mental stimulation through food.' },
    logPile: { name: 'Log pile', icon: '', cost: 38, category: 'habitat', enrichment: 'explore', desc: 'Climbing, hiding and exploration.' },
    nestingPlatform: { name: 'Nesting platform', icon: '', cost: 56, category: 'habitat', enrichment: 'nest', desc: 'Elevated nesting site for birds.' },
    waterJets: { name: 'Water jets', icon: '', cost: 95, category: 'habitat', enrichment: 'swim', stars: 3, waterOnly: true, desc: 'Aquatic play and exercise.' },
    iceBlock: { name: 'Ice enrichment', icon: '', cost: 54, category: 'habitat', enrichment: 'ice', stars: 2, desc: 'Cold-climate sensory enrichment.' },
    baskingRock: { name: 'Basking rock', icon: '', cost: 44, category: 'habitat', enrichment: 'bask', desc: 'Warm resting place for reptiles.' }
};

const FACILITIES = {
    burger: { name: 'Burger stand', icon: '', cost: 155, category: 'facilities', monthly: 55, sale: 8, need: 'hunger', appeal: 2, desc: 'Fast food for hungry guests.' },
    icecream: { name: 'Ice cream kiosk', icon: '', cost: 135, category: 'facilities', monthly: 42, sale: 7, need: 'hunger', appeal: 2, desc: 'A popular sweet treat.' },
    drinks: { name: 'Drinks kiosk', icon: '', cost: 115, category: 'facilities', monthly: 36, sale: 6, need: 'thirst', appeal: 1, desc: 'Restores guest thirst.' },
    cafe: { name: 'Zoo café', icon: '', cost: 285, category: 'facilities', monthly: 90, sale: 14, need: 'hunger', appeal: 4, stars: 2, desc: 'Higher-value food and drink.' },
    restaurant: { name: 'Restaurant', icon: '', cost: 490, category: 'facilities', monthly: 155, sale: 24, need: 'hunger', appeal: 7, stars: 3, desc: 'Premium dining experience.' },
    toilet: { name: 'Toilets', icon: '', cost: 115, category: 'facilities', monthly: 24, service: 'toilet', appeal: 1, desc: 'Essential guest comfort.' },
    bench: { name: 'Bench', icon: '', cost: 28, category: 'facilities', monthly: 1, service: 'energy', appeal: 1, desc: 'A place to rest.' },
    bin: { name: 'Litter bin', icon: '', cost: 24, category: 'facilities', monthly: 2, service: 'bin', appeal: 1, desc: 'Strongly suppresses litter nearby.' },
    gift: { name: 'Gift shop', icon: '', cost: 255, category: 'facilities', monthly: 72, sale: 15, appeal: 4, stars: 2, desc: 'Souvenirs and zoo merchandise.' },
    photo: { name: 'Photo booth', icon: '', cost: 195, category: 'facilities', monthly: 48, sale: 10, appeal: 3, stars: 2, desc: 'Paid commemorative photographs.' },
    playground: { name: 'Playground', icon: '', cost: 225, category: 'facilities', monthly: 44, sale: 5, service: 'fun', appeal: 8, stars: 2, desc: 'Family play attraction.' },
    carousel: { name: 'Carousel', icon: '', cost: 410, category: 'facilities', monthly: 98, sale: 10, service: 'fun', appeal: 16, stars: 3, desc: 'Major family attraction.' },
    observationWheel: { name: 'Observation wheel', icon: '', cost: 760, category: 'facilities', monthly: 185, sale: 18, service: 'fun', appeal: 28, stars: 4, desc: 'Landmark ride with views across the zoo.' }
};

const EDUCATION = {
    infoBoard: { name: 'Habitat information board', icon: '', cost: 38, category: 'education', monthly: 1, education: 4, appeal: 1, desc: 'Simple interpretation beside a habitat.' },
    educationCenter: { name: 'Education centre', icon: '', cost: 320, category: 'education', monthly: 70, education: 24, appeal: 7, stars: 2, desc: 'Classes, talks and conservation displays.' },
    insectHouse: { name: 'Insect house', icon: '', cost: 260, category: 'education', monthly: 58, education: 18, appeal: 12, stars: 2, sale: 5, desc: 'Beetles, mantises and extraordinary insects.' },
    butterflyGarden: { name: 'Butterfly garden', icon: '', cost: 310, category: 'education', monthly: 62, education: 20, appeal: 15, stars: 2, sale: 6, desc: 'Walk-through tropical butterfly exhibit.' },
    aviary: { name: 'Walk-through aviary', icon: '', cost: 390, category: 'education', monthly: 85, education: 22, appeal: 19, stars: 3, sale: 7, desc: 'Free-flight birds and keeper talks.' },
    reptileHouse: { name: 'Reptile house', icon: '', cost: 420, category: 'education', monthly: 92, education: 25, appeal: 20, stars: 3, sale: 8, desc: 'Snakes, lizards and amphibians.' },
    aquarium: { name: 'Public aquarium', icon: '', cost: 720, category: 'education', monthly: 175, education: 36, appeal: 34, stars: 4, sale: 12, desc: 'Indoor marine life attraction.' },
    conservationLab: { name: 'Conservation laboratory', icon: '', cost: 610, category: 'education', monthly: 130, education: 42, appeal: 14, stars: 4, desc: 'Research and visible conservation work.' },
    birdTheatre: { name: 'Bird demonstration theatre', icon: '', cost: 480, category: 'education', monthly: 105, education: 27, appeal: 24, stars: 3, sale: 9, desc: 'Scheduled educational flight demonstrations.' }
};
