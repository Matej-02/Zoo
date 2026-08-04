'use strict';
window.PZ_DATA = (() => {
  const {MONTHS}=window.PZ_CONFIG;
const ZONES={
 core:{name:'Founders Park',x:0,y:0,w:30,h:20,cost:0,desc:'Your original 600-tile zoo grounds.'},
 east:{name:'Eastern Meadows',x:30,y:0,w:8,h:20,cost:2800,requires:'core',desc:'160 tiles suited to savanna and family attractions.'},
 farEast:{name:'Conservation Ridge',x:38,y:0,w:8,h:20,cost:5200,requires:'east',desc:'160 premium tiles for large flagship habitats.'},
 south:{name:'River Valley',x:0,y:20,w:30,h:10,cost:3600,requires:'core',desc:'300 tiles ideal for wetlands and aquatic exhibits.'},
 southEast:{name:'Rainforest Annex',x:30,y:20,w:8,h:10,cost:4300,requires:'east',desc:'80 compact rainforest and education tiles.'},
 coast:{name:'Ocean Discovery Zone',x:38,y:20,w:8,h:10,cost:6800,requires:'farEast',desc:'80 tiles intended for marine exhibits and an aquarium district.'}
};

const GROUND={
 grass:{name:'Meadow grass',icon:'',cost:3,color:'#89c765',category:'terrain',biome:'temperate',desc:'Soft temperate ground for woodland and grazing habitats.'},
 dirt:{name:'Dry soil',icon:'',cost:4,color:'#a77b50',category:'terrain',biome:'savanna',desc:'Dry compacted soil used by savanna and desert species.'},
 sand:{name:'Desert sand',icon:'',cost:6,color:'#d9c076',category:'terrain',biome:'desert',desc:'Loose warm sand for desert species and beaches.'},
 mud:{name:'Wet mud',icon:'',cost:6,color:'#796044',category:'terrain',biome:'river',desc:'Wet riverbank terrain for semi-aquatic animals.'},
 rock:{name:'Rocky ground',icon:'',cost:8,color:'#8e9693',category:'terrain',biome:'mountain',stars:2,desc:'Hard rocky terrain for mountain animals and basking areas.'},
 snow:{name:'Snow',icon:'',cost:9,color:'#dce8eb',category:'terrain',biome:'snow',stars:2,desc:'Cold snow terrain for polar species.'},
 ice:{name:'Ice',icon:'',cost:11,color:'#b8dce5',category:'terrain',biome:'snow',stars:3,desc:'Frozen terrain for advanced cold-climate habitats.'},
 shallowWater:{name:'Shallow freshwater',icon:'',cost:12,color:'#5faac1',category:'terrain',biome:'river',desc:'Shallow freshwater for wading and riverbank animals.'},
 deepWater:{name:'Deep freshwater',icon:'',cost:16,color:'#397fa6',category:'terrain',biome:'river',stars:2,desc:'Swimmable freshwater for otters, penguins and crocodiles.'},
 saltWater:{name:'Saltwater pool',icon:'',cost:20,color:'#286f9c',category:'terrain',biome:'sea',stars:3,desc:'Marine water for seals, turtles and dolphins.'},
 naturePath:{name:'Nature trail',icon:'',cost:3,color:'#a78d64',category:'build',path:true,walkSpeed:.94,pathAppeal:.35,desc:'Cheap natural trail. Slightly slower but blends into habitats.'},
 path:{name:'Gravel path',icon:'',cost:4,color:'#c7b58b',category:'build',path:true,walkSpeed:1,pathAppeal:.25,desc:'Reliable basic guest path.'},
 brickPath:{name:'Brick promenade',icon:'',cost:7,color:'#b96f55',category:'build',path:true,walkSpeed:1.07,pathAppeal:.7,desc:'Attractive brick path that improves guest movement.'},
 slatePath:{name:'Slate avenue',icon:'',cost:9,color:'#87979c',category:'build',path:true,walkSpeed:1.12,pathAppeal:1,stars:2,desc:'Fast premium stone path with strong visual appeal.'},
 boardwalk:{name:'Timber boardwalk',icon:'',cost:8,color:'#a9794d',category:'build',path:true,walkSpeed:1.02,pathAppeal:.65,stars:2,desc:'Raised timber route suited to wetland and marine areas.'},
 mosaicPath:{name:'Mosaic plaza',icon:'',cost:13,color:'#d4b469',category:'build',path:true,walkSpeed:1.1,pathAppeal:1.6,stars:3,desc:'Decorative premium paving for busy attraction areas.'}
};

const FENCES={
 lowFence:{name:'Low farm fence',icon:'╫',cost:7,strength:1,height:1,category:'fences',desc:'For small and calm animals.'},
 standardFence:{name:'Standard fence',icon:'▥',cost:11,strength:2,height:2,category:'fences',desc:'General-purpose habitat fence.'},
 strongFence:{name:'Heavy barrier',icon:'▦',cost:18,strength:4,height:2,category:'fences',stars:2,desc:'Strong enough for large and powerful animals.'},
 highFence:{name:'High mesh fence',icon:'▤',cost:20,strength:2,height:4,category:'fences',stars:2,desc:'Tall containment for climbing primates and big cats.'},
 glassFence:{name:'Reinforced glass',icon:'▣',cost:27,strength:4,height:4,waterproof:true,category:'fences',stars:3,desc:'Premium secure viewing barrier.'},
 aquaticWall:{name:'Aquatic wall',icon:'▰',cost:31,strength:4,height:4,waterproof:true,category:'fences',stars:3,desc:'Waterproof wall for marine and deep-water habitats.'},
 lowGate:{name:'Low keeper gate',icon:'🚪',cost:20,strength:1,height:1,gate:true,category:'fences',desc:'Gate for small-animal habitats.'},
 standardGate:{name:'Keeper gate',icon:'🚪',cost:28,strength:2,height:2,gate:true,category:'fences',desc:'Standard staff entrance.'},
 strongGate:{name:'Heavy keeper gate',icon:'🚪',cost:39,strength:4,height:2,gate:true,category:'fences',stars:2,desc:'Heavy gate for elephants, hippos and similar animals.'},
 highGate:{name:'High keeper gate',icon:'🚪',cost:43,strength:2,height:4,gate:true,category:'fences',stars:2,desc:'Tall gate for primates and climbing predators.'},
 aquaticGate:{name:'Aquatic service gate',icon:'🚪',cost:54,strength:4,height:4,waterproof:true,gate:true,category:'fences',stars:3,desc:'Secure service access for aquatic exhibits.'}
};

const FOLIAGE={
 oak:{name:'English oak',icon:'🌳',cost:20,biome:'temperate',foliage:2,shape:'round',color:'#3f8a4e',category:'foliage',desc:'Large temperate shade tree.'},
 birch:{name:'Silver birch',icon:'🌳',cost:18,biome:'temperate',foliage:1.5,shape:'slim',color:'#6daa60',category:'foliage',desc:'Light woodland tree.'},
 maple:{name:'Maple',icon:'🍁',cost:22,biome:'temperate',foliage:2,shape:'round',color:'#c46b38',category:'foliage',stars:2,desc:'Colourful temperate tree.'},
 woodlandBush:{name:'Woodland shrubs',icon:'🌿',cost:10,biome:'temperate',foliage:1,shape:'bush',color:'#4f9152',category:'foliage',desc:'Low forest cover.'},
 wildflowers:{name:'Wildflower patch',icon:'🌼',cost:13,biome:'temperate',foliage:.5,decor:2,shape:'flowers',color:'#d65d86',category:'foliage',desc:'Temperate meadow planting.'},
 acacia:{name:'Acacia',icon:'🌿',cost:23,biome:'savanna',foliage:2,shape:'flat',color:'#6d9b46',category:'foliage',desc:'Classic savanna browse tree.'},
 baobab:{name:'Baobab',icon:'🌳',cost:32,biome:'savanna',foliage:3,shape:'baobab',color:'#6f9148',category:'foliage',stars:2,desc:'Massive savanna landmark tree.'},
 dryGrass:{name:'Tall dry grass',icon:'🌾',cost:9,biome:'savanna',foliage:1,shape:'grass',color:'#b59b45',category:'foliage',desc:'Natural cover for open-country species.'},
 thornBush:{name:'Thorn bush',icon:'🌿',cost:11,biome:'savanna',foliage:1,shape:'bush',color:'#718b45',category:'foliage',desc:'Hardy savanna browse.'},
 cactus:{name:'Saguaro cactus',icon:'🌵',cost:17,biome:'desert',foliage:1.5,shape:'cactus',color:'#3f9860',category:'foliage',desc:'Tall desert plant.'},
 agave:{name:'Agave',icon:'🌵',cost:12,biome:'desert',foliage:1,shape:'spike',color:'#5d9e7b',category:'foliage',desc:'Low drought-tolerant desert plant.'},
 datePalm:{name:'Date palm',icon:'🌴',cost:24,biome:'desert',foliage:2,shape:'palm',color:'#5b9b54',category:'foliage',desc:'Oasis shade tree.'},
 desertBloom:{name:'Desert blooms',icon:'🌺',cost:13,biome:'desert',foliage:.5,decor:2,shape:'flowers',color:'#d9687b',category:'foliage',desc:'Seasonal desert flowers.'},
 kapok:{name:'Kapok tree',icon:'🌳',cost:28,biome:'rainforest',foliage:3,shape:'jungle',color:'#278448',category:'foliage',stars:2,desc:'Tall tropical canopy tree.'},
 banana:{name:'Banana plant',icon:'🌿',cost:17,biome:'rainforest',foliage:1.5,shape:'banana',color:'#46a658',category:'foliage',desc:'Broad tropical leaves.'},
 fern:{name:'Giant fern',icon:'🌿',cost:13,biome:'rainforest',foliage:1,shape:'fern',color:'#318d50',category:'foliage',desc:'Dense rainforest ground cover.'},
 bamboo:{name:'Bamboo grove',icon:'🎋',cost:20,biome:'rainforest',foliage:2,shape:'bamboo',color:'#58a94d',category:'foliage',desc:'Essential browse for pandas.'},
 rainforestVine:{name:'Rainforest vines',icon:'🌿',cost:15,biome:'rainforest',foliage:1.5,shape:'vine',color:'#27783e',category:'foliage',desc:'Climbing tropical vegetation.'},
 pine:{name:'Mountain pine',icon:'🌲',cost:20,biome:'mountain',foliage:2,shape:'pine',color:'#2f7451',category:'foliage',desc:'Cold-resistant conifer.'},
 fir:{name:'Silver fir',icon:'🌲',cost:22,biome:'mountain',foliage:2,shape:'pine',color:'#346a5a',category:'foliage',desc:'Dense mountain evergreen.'},
 alpineShrub:{name:'Alpine shrub',icon:'🌿',cost:11,biome:'mountain',foliage:1,shape:'bush',color:'#5c7c55',category:'foliage',desc:'Low mountain cover.'},
 willow:{name:'Weeping willow',icon:'🌳',cost:26,biome:'river',foliage:2.5,shape:'willow',color:'#4d9b55',category:'foliage',desc:'Shade tree for riverbanks.'},
 reeds:{name:'Reed bed',icon:'🌾',cost:11,biome:'river',foliage:1,shape:'reeds',color:'#708f44',category:'foliage',desc:'Wetland shelter and nesting cover.'},
 lilyPads:{name:'Water lilies',icon:'🪷',cost:14,biome:'river',foliage:1,shape:'lily',color:'#55a15d',waterPlant:true,category:'foliage',desc:'Freshwater floating plants.'},
 mangrove:{name:'Mangrove',icon:'🌳',cost:25,biome:'river',foliage:2,shape:'mangrove',color:'#3d8852',waterPlant:true,category:'foliage',stars:2,desc:'Wetland roots and shelter.'},
 kelp:{name:'Kelp forest',icon:'🌿',cost:18,biome:'sea',foliage:2,shape:'kelp',color:'#247a59',waterPlant:true,category:'foliage',stars:3,desc:'Marine vegetation for saltwater exhibits.'},
 coral:{name:'Coral garden',icon:'🪸',cost:26,biome:'sea',foliage:2,decor:2,shape:'coral',color:'#dc7267',waterPlant:true,category:'foliage',stars:3,desc:'Colourful marine habitat structure.'},
 seaGrass:{name:'Seagrass bed',icon:'🌿',cost:14,biome:'sea',foliage:1.5,shape:'grass',color:'#2d8966',waterPlant:true,category:'foliage',stars:3,desc:'Feeding habitat for turtles and fish.'},
 snowPine:{name:'Snow pine',icon:'🌲',cost:23,biome:'snow',foliage:2,shape:'snowpine',color:'#3b7460',category:'foliage',stars:2,desc:'Snow-covered evergreen.'},
 tundraBush:{name:'Tundra shrub',icon:'🌿',cost:12,biome:'snow',foliage:1,shape:'bush',color:'#718477',category:'foliage',stars:2,desc:'Hardy low polar vegetation.'}
};
const FOLIAGE_TERRAIN={
 oak:['grass','dirt','mud'],birch:['grass','dirt','mud'],maple:['grass','dirt'],woodlandBush:['grass','dirt','mud'],wildflowers:['grass','dirt'],
 acacia:['grass','dirt','sand'],baobab:['grass','dirt','sand'],dryGrass:['grass','dirt','sand'],thornBush:['grass','dirt','sand'],
 cactus:['sand','dirt','rock'],agave:['sand','dirt','rock'],datePalm:['sand','dirt','mud'],desertBloom:['sand','dirt'],
 kapok:['grass','mud','dirt'],banana:['grass','mud'],fern:['grass','mud','dirt'],bamboo:['grass','mud','dirt'],rainforestVine:['grass','mud','dirt'],
 pine:['grass','rock','snow'],fir:['grass','rock','snow'],alpineShrub:['rock','grass','snow'],
 willow:['grass','mud'],reeds:['mud','shallowWater'],lilyPads:['shallowWater','deepWater'],mangrove:['mud','shallowWater'],
 kelp:['saltWater'],coral:['saltWater'],seaGrass:['saltWater'],snowPine:['snow','rock','grass'],tundraBush:['snow','rock','grass']
};
for(const[id,d]of Object.entries(FOLIAGE))d.allowedGrounds=FOLIAGE_TERRAIN[id]||['grass','dirt'];
const HABITAT_OBJECTS={
 shelter:{name:'Basic shelter',icon:'⛺',cost:60,category:'habitat',shelter:1,desc:'Sleeping and weather protection.'},
 cave:{name:'Rock cave',icon:'🪨',cost:88,category:'habitat',shelter:1,stars:2,desc:'Cool secure shelter for predators and mountain animals.'},
 heatedShelter:{name:'Heated shelter',icon:'🏠',cost:125,category:'habitat',shelter:1,stars:3,desc:'Climate-controlled shelter for sensitive species.'},
 feeder:{name:'Food station',icon:'🥕',cost:48,category:'habitat',feeder:1,desc:'Keepers refill this station.'},
 waterPump:{name:'Water pump',icon:'🚿',cost:62,category:'habitat',waterService:1,desc:'Fresh drinking water for land animals.'},
 activityBall:{name:'Activity ball',icon:'⚽',cost:42,category:'habitat',enrichment:'play',desc:'General play enrichment.'},
 climbingFrame:{name:'Climbing frame',icon:'🪜',cost:72,category:'habitat',enrichment:'climb',stars:2,desc:'For primates, bears and active animals.'},
 scratchingPost:{name:'Scratching post',icon:'🪵',cost:50,category:'habitat',enrichment:'scratch',desc:'For cats and other scratching species.'},
 burrowMound:{name:'Burrow mound',icon:'🕳️',cost:45,category:'habitat',enrichment:'dig',desc:'Digging and lookout enrichment.'},
 swing:{name:'Rope swing',icon:'🪢',cost:58,category:'habitat',enrichment:'swing',stars:2,desc:'Aerial enrichment for primates.'},
 puzzleFeeder:{name:'Puzzle feeder',icon:'🧩',cost:66,category:'habitat',enrichment:'puzzle',stars:2,desc:'Mental stimulation through food.'},
 logPile:{name:'Log pile',icon:'🪵',cost:38,category:'habitat',enrichment:'explore',desc:'Climbing, hiding and exploration.'},
 nestingPlatform:{name:'Nesting platform',icon:'🪺',cost:56,category:'habitat',enrichment:'nest',desc:'Elevated nesting site for birds.'},
 waterJets:{name:'Water jets',icon:'⛲',cost:95,category:'habitat',enrichment:'swim',stars:3,waterOnly:true,desc:'Aquatic play and exercise.'},
 iceBlock:{name:'Ice enrichment',icon:'🧊',cost:54,category:'habitat',enrichment:'ice',stars:2,desc:'Cold-climate sensory enrichment.'},
 baskingRock:{name:'Basking rock',icon:'☀️',cost:44,category:'habitat',enrichment:'bask',desc:'Warm resting place for reptiles.'}
};

const FACILITIES={
 burger:{name:'Burger stand',icon:'🍔',cost:155,category:'facilities',monthly:55,sale:8,need:'hunger',appeal:2,desc:'Fast food for hungry guests.'},
 icecream:{name:'Ice cream kiosk',icon:'🍦',cost:135,category:'facilities',monthly:42,sale:7,need:'hunger',appeal:2,desc:'A popular sweet treat.'},
 drinks:{name:'Drinks kiosk',icon:'🥤',cost:115,category:'facilities',monthly:36,sale:6,need:'thirst',appeal:1,desc:'Restores guest thirst.'},
 cafe:{name:'Zoo café',icon:'☕',cost:285,category:'facilities',monthly:90,sale:14,need:'hunger',appeal:4,stars:2,desc:'Higher-value food and drink.'},
 restaurant:{name:'Restaurant',icon:'🍽️',cost:490,category:'facilities',monthly:155,sale:24,need:'hunger',appeal:7,stars:3,desc:'Premium dining experience.'},
 toilet:{name:'Toilets',icon:'🚻',cost:115,category:'facilities',monthly:24,service:'toilet',appeal:1,desc:'Essential guest comfort.'},
 bench:{name:'Bench',icon:'🪑',cost:28,category:'facilities',monthly:1,service:'energy',appeal:1,desc:'A place to rest.'},
 bin:{name:'Litter bin',icon:'🗑️',cost:24,category:'facilities',monthly:2,service:'bin',appeal:1,desc:'Strongly suppresses litter nearby.'},
 gift:{name:'Gift shop',icon:'🎁',cost:255,category:'facilities',monthly:72,sale:15,appeal:4,stars:2,desc:'Souvenirs and zoo merchandise.'},
 photo:{name:'Photo booth',icon:'📷',cost:195,category:'facilities',monthly:48,sale:10,appeal:3,stars:2,desc:'Paid commemorative photographs.'},
 playground:{name:'Playground',icon:'🛝',cost:225,category:'facilities',monthly:44,sale:5,service:'fun',appeal:8,stars:2,desc:'Family play attraction.'},
 carousel:{name:'Carousel',icon:'🎠',cost:410,category:'facilities',monthly:98,sale:10,service:'fun',appeal:16,stars:3,desc:'Major family attraction.'},
 observationWheel:{name:'Observation wheel',icon:'🎡',cost:760,category:'facilities',monthly:185,sale:18,service:'fun',appeal:28,stars:4,desc:'Landmark ride with views across the zoo.'}
};

const EDUCATION={
 infoBoard:{name:'Habitat information board',icon:'ℹ️',cost:38,category:'education',monthly:1,education:4,appeal:1,desc:'Simple interpretation beside a habitat.'},
 educationCenter:{name:'Education centre',icon:'🏫',cost:320,category:'education',monthly:70,education:24,appeal:7,stars:2,desc:'Classes, talks and conservation displays.'},
 insectHouse:{name:'Insect house',icon:'🪲',cost:260,category:'education',monthly:58,education:18,appeal:12,stars:2,sale:5,desc:'Beetles, mantises and extraordinary insects.'},
 butterflyGarden:{name:'Butterfly garden',icon:'🦋',cost:310,category:'education',monthly:62,education:20,appeal:15,stars:2,sale:6,desc:'Walk-through tropical butterfly exhibit.'},
 aviary:{name:'Walk-through aviary',icon:'🦜',cost:390,category:'education',monthly:85,education:22,appeal:19,stars:3,sale:7,desc:'Free-flight birds and keeper talks.'},
 reptileHouse:{name:'Reptile house',icon:'🦎',cost:420,category:'education',monthly:92,education:25,appeal:20,stars:3,sale:8,desc:'Snakes, lizards and amphibians.'},
 aquarium:{name:'Public aquarium',icon:'🐠',cost:720,category:'education',monthly:175,education:36,appeal:34,stars:4,sale:12,desc:'Indoor marine life attraction.'},
 conservationLab:{name:'Conservation laboratory',icon:'🔬',cost:610,category:'education',monthly:130,education:42,appeal:14,stars:4,desc:'Research and visible conservation work.'},
 birdTheatre:{name:'Bird demonstration theatre',icon:'🦅',cost:480,category:'education',monthly:105,education:27,appeal:24,stars:3,sale:9,desc:'Scheduled educational flight demonstrations.'}
};

const SPECIES={
 pygmyGoat:{name:'Pygmy goat',icon:'🐐',cost:95,care:70,appeal:14,stars:1,minArea:10,social:3,terrain:{grass:6,dirt:2},biomes:['temperate'],foliage:1,shelter:1,feeder:1,enrich:['explore'],fence:{strength:1,height:1},desc:'Friendly small farm animal.'},
 capybara:{name:'Capybara',icon:'🦫',cost:135,care:95,appeal:22,stars:1,minArea:13,social:3,terrain:{grass:5,shallowWater:3},biomes:['river'],foliage:2,shelter:1,feeder:1,enrich:['swim','explore'],fence:{strength:1,height:1},semiAquatic:true,desc:'Social riverbank grazer.'},
 zebra:{name:'Zebra',icon:'🦓',cost:120,care:105,appeal:21,stars:1,minArea:14,social:2,terrain:{grass:6,dirt:3},biomes:['savanna'],foliage:2,shelter:1,feeder:1,enrich:['play','explore'],fence:{strength:2,height:2},desc:'Social savanna grazer.'},
 meerkat:{name:'Meerkat',icon:'🐾',cost:145,care:90,appeal:25,stars:1,minArea:11,social:3,terrain:{sand:6,dirt:2},biomes:['desert','savanna'],foliage:1,shelter:1,feeder:1,enrich:['dig','puzzle'],fence:{strength:1,height:2},desc:'Busy desert lookout living in groups.'},
 flamingo:{name:'Flamingo',icon:'🦩',cost:155,care:110,appeal:28,stars:1,minArea:15,social:4,terrain:{mud:3,shallowWater:5},biomes:['river'],foliage:2,shelter:1,feeder:1,enrich:['nest'],fence:{strength:1,height:2},semiAquatic:true,desc:'Colourful wetland bird living in flocks.'},
 giraffe:{name:'Giraffe',icon:'🦒',cost:205,care:145,appeal:34,stars:2,minArea:20,social:2,terrain:{grass:8,dirt:4},biomes:['savanna'],foliage:5,shelter:1,feeder:1,enrich:['puzzle','explore'],fence:{strength:2,height:3},desc:'Tall browser requiring substantial savanna foliage.'},
 kangaroo:{name:'Kangaroo',icon:'🦘',cost:215,care:135,appeal:35,stars:2,minArea:21,social:2,terrain:{grass:7,sand:4},biomes:['savanna','temperate'],foliage:2,shelter:1,feeder:1,enrich:['play'],fence:{strength:2,height:2},desc:'Active marsupial needing open terrain.'},
 riverOtter:{name:'River otter',icon:'🦦',cost:235,care:165,appeal:42,stars:2,minArea:17,social:2,terrain:{deepWater:5,shallowWater:4,rock:2},biomes:['river'],foliage:3,shelter:1,feeder:1,enrich:['swim','explore'],fence:{strength:2,height:2},semiAquatic:true,desc:'Playful swimmer in a freshwater river habitat.'},
 penguin:{name:'Penguin',icon:'🐧',cost:245,care:180,appeal:44,stars:2,minArea:18,social:4,terrain:{deepWater:5,rock:4,snow:3},biomes:['snow','sea'],foliage:1,shelter:1,feeder:1,enrich:['swim','ice'],fence:{strength:2,height:2},semiAquatic:true,desc:'Cold-climate colony swimmer.'},
 crocodile:{name:'Nile crocodile',icon:'🐊',cost:285,care:205,appeal:48,stars:2,minArea:21,social:1,terrain:{deepWater:6,mud:4,sand:2},biomes:['river'],foliage:2,shelter:1,feeder:1,enrich:['bask'],fence:{strength:4,height:2},semiAquatic:true,desc:'Powerful reptile requiring heavy barriers.'},
 seal:{name:'Harbour seal',icon:'🦭',cost:315,care:235,appeal:53,stars:3,minArea:23,social:3,terrain:{saltWater:10,rock:4},biomes:['sea'],foliage:2,shelter:1,feeder:1,enrich:['swim','puzzle'],fence:{strength:4,height:3,waterproof:true},aquatic:true,desc:'Marine swimmer requiring a secure saltwater exhibit.'},
 hippo:{name:'Hippopotamus',icon:'🦛',cost:350,care:260,appeal:57,stars:3,minArea:28,social:2,terrain:{deepWater:9,mud:6,grass:4},biomes:['river','savanna'],foliage:2,shelter:1,feeder:1,enrich:['swim'],fence:{strength:4,height:2},semiAquatic:true,desc:'Huge semi-aquatic animal with major water needs.'},
 lion:{name:'African lion',icon:'🦁',cost:330,care:245,appeal:60,stars:3,minArea:25,social:2,terrain:{grass:8,dirt:5},biomes:['savanna'],foliage:3,shelter:1,feeder:1,enrich:['scratch','puzzle'],fence:{strength:4,height:3},desc:'Popular predator requiring high, strong containment.'},
 tiger:{name:'Tiger',icon:'🐅',cost:390,care:285,appeal:69,stars:3,minArea:28,social:1,terrain:{grass:7,mud:3,shallowWater:3},biomes:['rainforest'],foliage:6,shelter:1,feeder:1,enrich:['scratch','swim'],fence:{strength:4,height:4},desc:'Solitary rainforest predator and strong climber.'},
 gorilla:{name:'Western gorilla',icon:'🦍',cost:440,care:320,appeal:75,stars:3,minArea:30,social:3,terrain:{grass:8,rock:4},biomes:['rainforest'],foliage:7,shelter:1,feeder:1,enrich:['climb','puzzle','swing'],fence:{strength:4,height:4},desc:'Intelligent primate requiring tall secure barriers.'},
 orangutan:{name:'Orangutan',icon:'🦧',cost:455,care:330,appeal:78,stars:4,minArea:29,social:2,terrain:{grass:6,rock:3},biomes:['rainforest'],foliage:8,shelter:1,feeder:1,enrich:['climb','swing','puzzle'],fence:{strength:3,height:4},desc:'Arboreal great ape needing dense tropical foliage.'},
 panda:{name:'Giant panda',icon:'🐼',cost:480,care:355,appeal:82,stars:4,minArea:27,social:2,terrain:{grass:9,rock:3},biomes:['rainforest','mountain'],foliage:8,requiredFoliage:'bamboo',shelter:1,feeder:1,enrich:['climb','puzzle'],fence:{strength:3,height:3},desc:'Rare flagship species requiring bamboo.'},
 elephant:{name:'African elephant',icon:'🐘',cost:530,care:410,appeal:92,stars:4,minArea:38,social:3,terrain:{grass:13,mud:6,shallowWater:4},biomes:['savanna'],foliage:5,shelter:1,feeder:1,enrich:['puzzle','explore'],fence:{strength:4,height:2},desc:'Enormous crowd-puller requiring heavy containment and space.'},
 polarBear:{name:'Polar bear',icon:'🐻‍❄️',cost:560,care:440,appeal:96,stars:4,minArea:34,social:1,terrain:{snow:9,ice:5,deepWater:8},biomes:['snow'],foliage:1,shelter:1,feeder:1,enrich:['swim','ice','puzzle'],fence:{strength:4,height:4},semiAquatic:true,desc:'Powerful arctic predator with demanding cold habitat.'},
 seaTurtle:{name:'Green sea turtle',icon:'🐢',cost:510,care:390,appeal:86,stars:4,minArea:30,social:2,terrain:{saltWater:18,sand:4},biomes:['sea'],foliage:7,requiredFoliage:'seaGrass',shelter:0,feeder:1,enrich:['swim'],fence:{strength:4,height:4,waterproof:true},aquatic:true,desc:'Marine turtle requiring saltwater and seagrass.'},
 dolphin:{name:'Bottlenose dolphin',icon:'🐬',cost:760,care:620,appeal:125,stars:5,minArea:48,social:3,terrain:{saltWater:30},biomes:['sea'],foliage:4,shelter:0,feeder:1,enrich:['swim','puzzle'],fence:{strength:4,height:4,waterproof:true},aquatic:true,desc:'Advanced marine species requiring a very large saltwater exhibit.'}
};

const OBJECTS={...FENCES,...FOLIAGE,...HABITAT_OBJECTS,...FACILITIES,...EDUCATION};
const TOOLS={
 inspect:{name:'Inspect',icon:'',category:'build',cost:0,desc:'Inspect animals, habitats, facilities, staff and land. The panel updates live.'},
 erase:{name:'Bulldoze',icon:'',category:'build',cost:0,desc:'Remove paths, terrain, objects, fences, facilities or animals for a partial refund.'},
 ...Object.fromEntries(Object.entries(GROUND).filter(([,v])=>v.category==='build').map(([k,v])=>[k,{...v}])),
 ...Object.fromEntries(Object.entries(GROUND).filter(([,v])=>v.category==='terrain').map(([k,v])=>[k,{...v,ground:true}])),
 ...OBJECTS,
 ...Object.fromEntries(Object.entries(SPECIES).map(([k,v])=>[k,{name:v.name,icon:'',cost:v.cost,category:'animals',stars:v.stars,desc:v.desc,animal:true}]))
};
const NAMES={animal:['Milo','Luna','Nala','Kito','Poppy','Zuri','Tala','Ravi','Nova','Mango','Koda','Maya','Pico','Tara','Indi','Suki','Bramble','Rio','Mochi','Zola'],keeper:['Alex','Sam','Jordan','Morgan','Jamie','Robin','Taylor','Casey'],janitor:['Chris','Dana','Lee','Avery','Riley','Pat','Sky','Quinn'],guide:['Amelia','Noah','Sofia','Liam','Mia','Theo','Eva','Leo']};
const CARE_MULTIPLIER=.65,SALARY={keeper:240,janitor:185,guide:280},HIRE_COST={keeper:130,janitor:100,guide:150};
const LABELS={tickets:'Admission',shops:'Food & retail',tours:'Guided tours',donations:'Donations',support:'Founder support',education:'Education activities',refunds:'Refunds',construction:'Construction',animals:'Animal purchases',staffHiring:'Recruitment',land:'Land expansion',animalCare:'Animal care',utilities:'Utilities & upkeep',payroll:'Salaries'};
  return {ZONES,GROUND,FENCES,FOLIAGE,FOLIAGE_TERRAIN,HABITAT_OBJECTS,FACILITIES,EDUCATION,SPECIES,OBJECTS,TOOLS,NAMES,CARE_MULTIPLIER,SALARY,HIRE_COST,LABELS};
})();
