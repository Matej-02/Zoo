/* Pocket Zoo Architect — render/catalog-art */
'use strict';

function svgBox(inner, bg = '#eef4ec') { return `<svg viewBox="0 0 48 40" aria-hidden="true"><rect x="1" y="1" width="46" height="38" rx="9" fill="${bg}" stroke="rgba(30,55,42,.14)"/>${inner}</svg>`; }

function groundArt(id, d) { let inner = `<rect x="5" y="7" width="38" height="27" rx="5" fill="${d.color}"/>`; if (isPathGround(id)) {
    if (id === 'boardwalk')
        inner += `<g stroke="#694525" stroke-width="1.5">${[10, 17, 24, 31, 38].map(x => `<path d="M${x} 8v25"/>`).join('')}</g>`;
    else if (id === 'brickPath')
        inner += `<g stroke="#7b4939" stroke-width="1" opacity=".65"><path d="M5 16h38M5 25h38M14 7v9M32 7v9M23 16v9M14 25v9M32 25v9"/></g>`;
    else if (id === 'slatePath')
        inner += `<g stroke="#5f6c70" stroke-width="1"><path d="M5 20h38M18 7v27M32 7v27"/></g>`;
    else if (id === 'mosaicPath')
        inner += `<circle cx="24" cy="20" r="10" fill="none" stroke="#8f6b31" stroke-width="2"/><path d="M24 10v20M14 20h20M17 13l14 14M31 13L17 27" stroke="#8f6b31"/>`;
    else
        inner += `<g fill="#8c7c60" opacity=".65"><circle cx="12" cy="14" r="2"/><circle cx="21" cy="25" r="2.5"/><circle cx="35" cy="16" r="2"/><circle cx="35" cy="29" r="1.5"/></g>`;
}
else if (isWaterGround(id))
    inner += `<path d="M7 18q7-5 14 0t14 0t8 0M7 27q7-5 14 0t14 0t8 0" fill="none" stroke="#d9f4f6" stroke-width="2" opacity=".8"/>`;
else if (id === 'grass')
    inner += `<g stroke="#4c9144" stroke-width="1.5"><path d="M12 31l2-7m0 7l4-6M28 31l-2-8m2 8l5-7M38 31l-1-6"/></g>`;
else if (id === 'rock')
    inner += `<path d="M10 30l7-15 8 8 6-12 8 19z" fill="#6e7775" opacity=".75"/>`; return svgBox(inner, '#f7f5ee'); }

function fenceArt(id, d) { const c = d.waterproof ? '#6e9daf' : d.strength >= 4 ? '#536169' : '#77583d'; let inner = ''; if (d.gate)
    inner = `<rect x="9" y="8" width="30" height="25" rx="2" fill="#d8b56d" stroke="${c}" stroke-width="3"/><path d="M24 9v24" stroke="${c}" stroke-width="2"/><circle cx="27" cy="22" r="1.5" fill="${c}"/>`;
else
    inner = `<g stroke="${c}" stroke-width="${d.strength >= 4 ? 4 : 2.4}" stroke-linecap="round"><path d="M10 ${d.height >= 4 ? 6 : 12}v28M24 ${d.height >= 4 ? 6 : 12}v28M38 ${d.height >= 4 ? 6 : 12}v28M6 18h36M6 29h36"/></g>${d.waterproof ? '<rect x="7" y="10" width="34" height="24" rx="3" fill="#a8d8e5" opacity=".25"/>' : ''}`; return svgBox(inner, '#f4f2ea'); }

function foliageArt(id, d) { const c = d.color || '#4b9251', tr = '#725137'; let inner = ''; if (['round', 'slim', 'flat', 'jungle', 'willow', 'baobab', 'palm', 'pine', 'snowpine', 'mangrove', 'banana'].includes(d.shape))
    inner += `<path d="M24 32V17" stroke="${tr}" stroke-width="4" stroke-linecap="round"/>`; if (d.shape === 'cactus')
    inner += `<path d="M24 33V9M24 19h-8v-6M24 24h8v-7" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`;
else if (d.shape === 'pine' || d.shape === 'snowpine')
    inner += `<path d="M24 5L11 23h8l-10 11h30L29 23h8z" fill="${c}"/>${d.shape === 'snowpine' ? '<path d="M18 14h13M14 24h20" stroke="#eef6f7" stroke-width="3"/>' : ''}`;
else if (d.shape === 'palm')
    inner += `<g stroke="${c}" stroke-width="4" stroke-linecap="round"><path d="M24 16L9 10M24 16L39 10M24 16L7 18M24 16L41 18M24 16L15 5M24 16L33 5"/></g>`;
else if (d.shape === 'grass' || d.shape === 'reeds' || d.shape === 'kelp')
    inner += `<g stroke="${c}" stroke-width="2.5"><path d="M12 33l4-20M18 33l2-25M24 33V10M30 33l-2-22M36 33l-5-18"/></g>`;
else if (d.shape === 'lily')
    inner += `<ellipse cx="18" cy="25" rx="9" ry="5" fill="${c}"/><ellipse cx="31" cy="19" rx="8" ry="4.5" fill="#69aa68"/><g fill="#e9abc6"><circle cx="24" cy="18" r="4"/><circle cx="20" cy="19" r="3"/><circle cx="28" cy="19" r="3"/></g>`;
else if (d.shape === 'coral')
    inner += `<g fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"><path d="M24 34V13M24 21l-9-8M24 26l10-10M15 34V23M34 34V25"/></g>`;
else if (d.shape === 'flowers')
    inner += `<ellipse cx="24" cy="30" rx="15" ry="5" fill="#5c9651"/><g fill="${c}"><circle cx="15" cy="23" r="4"/><circle cx="24" cy="19" r="4"/><circle cx="33" cy="24" r="4"/></g><g fill="#f5d36f"><circle cx="15" cy="23" r="1.5"/><circle cx="24" cy="19" r="1.5"/><circle cx="33" cy="24" r="1.5"/></g>`;
else if (d.shape === 'spike' || d.shape === 'fern')
    inner += `<g stroke="${c}" stroke-width="3"><path d="M24 32V10M24 24L10 15M24 24L38 15M24 19L15 8M24 19L33 8M24 28L9 25M24 28L39 25"/></g>`;
else if (d.shape === 'bamboo')
    inner += `<g stroke="${c}" stroke-width="4"><path d="M16 34V7M25 34V4M34 34V9"/></g><g stroke="#86c06d"><path d="M12 15h8M21 11h8M30 20h8M21 26h8"/></g>`;
else
    inner += `<g fill="${c}"><circle cx="17" cy="18" r="10"/><circle cx="29" cy="17" r="11"/><circle cx="24" cy="10" r="9"/></g>`; return svgBox(inner, '#f0f6ed'); }

function animalArt(id) { const c = { zebra: '#eee', giraffe: '#d7a34a', pygmyGoat: '#b98759', capybara: '#8b6748', meerkat: '#c58e4d', flamingo: '#ec789a', kangaroo: '#b87845', riverOtter: '#704d35', penguin: '#293131', crocodile: '#4e8a50', seal: '#7d8b90', hippo: '#8c7d8e', lion: '#d5a04b', tiger: '#e58a2f', gorilla: '#414746', orangutan: '#ad5b2b', panda: '#eee', elephant: '#8e979b', polarBear: '#f1f1e9', seaTurtle: '#4e8f61', dolphin: '#4d96bd' }[id] || '#8a6b4c'; let i = ''; if (id === 'giraffe')
    i = `<ellipse cx="19" cy="27" rx="13" ry="7" fill="${c}"/><path d="M28 28L32 9" stroke="${c}" stroke-width="7"/><ellipse cx="35" cy="8" rx="6" ry="4" fill="${c}"/><path d="M13 32v6M23 32v6" stroke="#795129" stroke-width="3"/>`;
else if (id === 'elephant')
    i = `<ellipse cx="21" cy="24" rx="15" ry="10" fill="${c}"/><circle cx="35" cy="20" r="8" fill="${c}"/><path d="M40 21q5 10-1 15" fill="none" stroke="${c}" stroke-width="5"/><ellipse cx="31" cy="20" rx="7" ry="9" fill="#7b8589"/><path d="M14 31v7M25 31v7" stroke="#667174" stroke-width="4"/>`;
else if (id === 'flamingo')
    i = `<ellipse cx="19" cy="19" rx="9" ry="6" fill="${c}"/><path d="M25 17q12-13 5-17" fill="none" stroke="${c}" stroke-width="4"/><circle cx="31" cy="5" r="4" fill="${c}"/><path d="M16 24v14M22 24v14" stroke="#d55a7f" stroke-width="2"/>`;
else if (id === 'penguin')
    i = `<ellipse cx="24" cy="21" rx="10" ry="16" fill="#293131"/><ellipse cx="25" cy="24" rx="6" ry="11" fill="#f2eee1"/><path d="M31 10l8 4-8 3" fill="#e1a12d"/>`;
else if (id === 'crocodile')
    i = `<rect x="7" y="16" width="32" height="12" rx="6" fill="${c}"/><path d="M7 18L1 22l6 4M39 18l8 4-8 4" fill="${c}"/><path d="M13 16l4-6 4 6m3 0l4-6 4 6" fill="#365f39"/>`;
else if (id === 'dolphin')
    i = `<path d="M6 23q14-16 32-3l9-5-4 8 4 8-10-5Q20 37 6 23z" fill="${c}"/><path d="M22 17l4-10 5 11" fill="${c}"/>`;
else if (id === 'seaTurtle')
    i = `<ellipse cx="24" cy="21" rx="13" ry="10" fill="${c}"/><ellipse cx="39" cy="21" rx="5" ry="4" fill="#6aa16e"/><path d="M14 15L6 9M14 27l-8 6M33 15l7-7M33 27l7 7" stroke="#5d9c67" stroke-width="5" stroke-linecap="round"/><path d="M12 21h24M24 11v20" stroke="#2f6845"/>`;
else if (['gorilla', 'orangutan'].includes(id))
    i = `<circle cx="25" cy="13" r="7" fill="${c}"/><ellipse cx="24" cy="26" rx="11" ry="12" fill="${c}"/><path d="M15 21L5 36M33 21l10 15" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`;
else if (id === 'kangaroo')
    i = `<ellipse cx="24" cy="22" rx="9" ry="13" fill="${c}"/><circle cx="29" cy="7" r="6" fill="${c}"/><path d="M26 3l-2-8M31 3l4-8M16 27L3 35M28 34l4 6M22 34l-2 6" stroke="#8c552f" stroke-width="4" stroke-linecap="round"/>`;
else if (id === 'zebra' || id === 'tiger')
    i = `<ellipse cx="22" cy="23" rx="15" ry="9" fill="${c}"/><circle cx="38" cy="17" r="6" fill="${c}"/><path d="M13 30v8M26 30v8M8 22L2 14" stroke="#463a31" stroke-width="3"/>${[12, 18, 24, 30].map(x => `<path d="M${x} 16l3 13" stroke="#252b29" stroke-width="2"/>`).join('')}`;
else if (id === 'lion')
    i = `<ellipse cx="21" cy="24" rx="14" ry="8" fill="${c}"/><circle cx="38" cy="17" r="9" fill="#95612f"/><circle cx="38" cy="17" r="5" fill="${c}"/><path d="M13 30v8M26 30v8M7 23L2 14" stroke="#8e6234" stroke-width="3"/>`;
else if (id === 'panda' || id === 'polarBear')
    i = `<ellipse cx="21" cy="24" rx="14" ry="9" fill="${c}"/><circle cx="38" cy="17" r="7" fill="${c}"/><circle cx="34" cy="11" r="3" fill="${id === 'panda' ? '#222' : '#ddd'}"/><circle cx="42" cy="11" r="3" fill="${id === 'panda' ? '#222' : '#ddd'}"/>${id === 'panda' ? '<ellipse cx="36" cy="17" rx="2.5" ry="3" fill="#222"/>' : ''}<path d="M13 31v7M27 31v7" stroke="${id === 'panda' ? '#222' : '#d4d4cc'}" stroke-width="4"/>`;
else if (id === 'seal' || id === 'riverOtter' || id === 'capybara')
    i = `<ellipse cx="22" cy="23" rx="17" ry="8" fill="${c}"/><circle cx="39" cy="18" r="6" fill="${c}"/><path d="M7 23L1 17M16 29l-4 8M29 29l5 7" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
else if (id === 'hippo')
    i = `<ellipse cx="22" cy="23" rx="16" ry="11" fill="${c}"/><ellipse cx="39" cy="19" rx="8" ry="7" fill="#998a9a"/><path d="M14 31v7M28 31v7" stroke="#665a66" stroke-width="5"/>`;
else
    i = `<ellipse cx="22" cy="23" rx="14" ry="8" fill="${c}"/><circle cx="38" cy="18" r="6" fill="${c}"/><path d="M14 30v8M27 30v8M8 22L2 15" stroke="#65452d" stroke-width="3"/>`; return svgBox(i, '#f4f2e9'); }

function objectArt(id, d) { const bg = EDUCATION[id] ? '#f0ecf7' : HABITAT_OBJECTS[id] ? '#edf5ec' : '#fff4de', accent = EDUCATION[id] ? '#7659aa' : HABITAT_OBJECTS[id] ? '#3c8357' : '#d58d32'; let i = `<rect x="8" y="10" width="32" height="24" rx="5" fill="#fff" stroke="${accent}" stroke-width="2"/><path d="M8 15h32" stroke="${accent}" stroke-width="5"/>`; if (id === 'bench')
    i = `<path d="M9 22h30M13 15h22M13 15v18M35 15v18" stroke="#875c37" stroke-width="4"/>`;
else if (id === 'bin')
    i = `<path d="M15 12h18l-2 23H17z" fill="#4e7781"/><path d="M13 12h22M20 8h8" stroke="#334e55" stroke-width="3"/>`;
else if (id === 'activityBall')
    i = `<circle cx="24" cy="21" r="12" fill="#e46f55"/><path d="M12 21h24M24 9q-7 12 0 24M24 9q7 12 0 24" stroke="#f7d86a" stroke-width="2"/>`;
else if (id === 'shelter')
    i = `<path d="M7 32L24 8l17 24z" fill="#d89f53" stroke="#875e32" stroke-width="2"/><path d="M20 32V22h8v10" fill="#3d4b42"/>`;
else if (id === 'cave')
    i = `<path d="M5 33q3-25 19-25t19 25z" fill="#777e7d"/><path d="M16 33q0-14 8-14t8 14" fill="#26342f"/>`;
else if (id === 'feeder')
    i = `<path d="M8 22h32l-5 12H13z" fill="#8b6238"/><g fill="#70a448"><circle cx="18" cy="22" r="3"/><circle cx="25" cy="20" r="3"/><circle cx="32" cy="22" r="3"/></g>`;
else if (id === 'climbingFrame')
    i = `<path d="M9 35L16 8l8 27M25 35l8-27 7 27M13 22h23M16 12h17" fill="none" stroke="#7b5836" stroke-width="3"/>`;
else if (id === 'swing')
    i = `<path d="M8 35L17 7h14l9 28M18 9v17M30 9v17M17 27h14" fill="none" stroke="#775236" stroke-width="3"/>`;
else if (id === 'logPile')
    i = `<g fill="#8b5e38" stroke="#5f3d25"><rect x="7" y="20" width="34" height="8" rx="4"/><rect x="11" y="12" width="27" height="8" rx="4"/><circle cx="12" cy="24" r="3" fill="#c08b57"/><circle cx="16" cy="16" r="3" fill="#c08b57"/></g>`;
else if (id === 'waterJets')
    i = `<path d="M7 34h34" stroke="#477f96" stroke-width="4"/><path d="M12 31q3-22 12 0M24 31q4-27 13 0" fill="none" stroke="#5fb6d1" stroke-width="3"/>`;
else if (id === 'iceBlock')
    i = `<path d="M12 16l12-8 12 8v16l-12 7-12-7z" fill="#bfe2ea" stroke="#6ea9b8" stroke-width="2"/><path d="M12 16l12 7 12-7M24 23v16" fill="none" stroke="#fff"/>`;
else if (id === 'baskingRock')
    i = `<path d="M7 34l7-16 10 4 7-12 10 24z" fill="#8b8174"/><circle cx="38" cy="9" r="5" fill="#e6b84d"/>`;
else if (id === 'burger')
    i = `<path d="M13 17q11-12 22 0z" fill="#df9f43"/><path d="M12 21h24" stroke="#5a8e45" stroke-width="4"/><path d="M13 25h22" stroke="#86452d" stroke-width="5"/><path d="M13 30h22" stroke="#df9f43" stroke-width="5"/>`;
else if (id === 'icecream')
    i = `<path d="M18 19h12l-6 16z" fill="#c68a4e"/><circle cx="24" cy="15" r="8" fill="#eaa0b8"/>`;
else if (id === 'drinks')
    i = `<path d="M16 14h18l-3 20H19z" fill="#6fb2cf"/><path d="M26 14l5-8" stroke="#d34f4f" stroke-width="2"/><path d="M15 14h20" stroke="#355d6e" stroke-width="2"/>`;
else if (id === 'cafe')
    i = `<path d="M12 16h19v15H12zM31 19h5q5 0 1 8h-6" fill="none" stroke="#8c5b39" stroke-width="4"/><path d="M17 10q-3-4 0-7M24 10q-3-4 0-7" stroke="#8c5b39"/>`;
else if (id === 'toilet')
    i = `<circle cx="17" cy="13" r="4" fill="#4e78a8"/><circle cx="31" cy="13" r="4" fill="#b05f86"/><path d="M17 18v15M11 24h12M31 18v15M25 24h12" stroke="#4f5960" stroke-width="3"/>`;
else if (id === 'gift')
    i = `<rect x="10" y="17" width="28" height="19" fill="#d96761"/><path d="M24 17v19M9 17h30M15 17q-6-9 2-9 7 0 7 9M33 17q6-9-2-9-7 0-7 9" fill="none" stroke="#f4d26a" stroke-width="3"/>`;
else if (id === 'photo')
    i = `<rect x="8" y="13" width="32" height="22" rx="4" fill="#59656c"/><circle cx="24" cy="24" r="8" fill="#9dd2df" stroke="#23343b" stroke-width="3"/><path d="M15 13l4-5h10l4 5" fill="#59656c"/>`;
else if (id === 'playground')
    i = `<path d="M10 34L21 10h10M21 10v14h15L25 35" fill="none" stroke="#4f83a7" stroke-width="4"/><path d="M9 34h30" stroke="#d56a50" stroke-width="3"/>`;
else if (id === 'carousel')
    i = `<path d="M8 17q16-17 32 0z" fill="#d75c61"/><path d="M24 16v21M12 35h24" stroke="#8a5939" stroke-width="3"/><path d="M15 19v14M33 19v14" stroke="#d1a14b" stroke-width="2"/>`;
else if (id === 'observationWheel')
    i = `<circle cx="24" cy="20" r="15" fill="none" stroke="#547d9f" stroke-width="3"/><path d="M24 5v30M9 20h30M13 9l22 22M35 9L13 31" stroke="#547d9f"/><path d="M18 36h12" stroke="#665041" stroke-width="4"/>`;
else if (id === 'infoBoard')
    i = `<rect x="11" y="7" width="26" height="21" rx="3" fill="#f6f0d5" stroke="#7659aa" stroke-width="2"/><path d="M17 13h14M17 18h14M17 23h9M17 28v9M31 28v9" stroke="#7659aa" stroke-width="2"/>`;
else if (id === 'insectHouse')
    i = `<ellipse cx="24" cy="21" rx="7" ry="11" fill="#4f6c45"/><circle cx="24" cy="10" r="5" fill="#354d31"/><path d="M17 16L8 9M31 16l9-7M17 24l-10 4M31 24l10 4M20 21h8" stroke="#354d31" stroke-width="2"/>`;
else if (id === 'butterflyGarden')
    i = `<path d="M23 20Q8 4 7 18q1 11 16 5M25 20Q40 4 41 18q-1 11-16 5" fill="#d96b9b"/><path d="M24 12v19" stroke="#4b403b" stroke-width="3"/>`;
else if (id === 'aviary' || id === 'birdTheatre')
    i = `<path d="M5 25q8-15 18 0q8-15 20 0q-10-5-19 8q-8-13-19-8z" fill="#4f8f77"/><path d="M24 26l7 8" stroke="#62452f" stroke-width="2"/>`;
else if (id === 'reptileHouse')
    i = `<path d="M9 27q8-16 17-3t14-8q-4 20-17 14T9 27z" fill="none" stroke="#568b4f" stroke-width="5" stroke-linecap="round"/>`;
else if (id === 'aquarium')
    i = `<path d="M6 27q10-11 21 0q9-9 16 0" fill="none" stroke="#4a9ec0" stroke-width="4"/><path d="M12 18q9-10 19 0l8-5-2 7 2 7-8-5q-10 10-19 0z" fill="#e0a245"/>`;
else if (id === 'conservationLab')
    i = `<path d="M19 6h10M22 6v12l-10 17h24L26 18V6" fill="#b9dce3" stroke="#577f8a" stroke-width="2"/><path d="M15 29h18" stroke="#4f9e77" stroke-width="5"/>`; return svgBox(i, bg); }

function toolArt(id, d) { if (id === 'grass')
    return '<img class="asset-preview" src="assets/terrain/grass.png" alt="">'; if (GROUND[id])
    return groundArt(id, d); if (FENCES[id])
    return fenceArt(id, d); if (FOLIAGE[id])
    return foliageArt(id, d); if (SPECIES[id])
    return animalArt(id); return objectArt(id, d); }

function staffArtMarkup(role) { const letter = role === 'keeper' ? 'K' : role === 'janitor' ? 'J' : 'G'; return `<span class="staff-avatar ${role}">${letter}</span>`; }
