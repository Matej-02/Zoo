/* Pocket Zoo Architect — core/config */
'use strict';

const TILE = 36, ISO_TILE_W = 72, ISO_TILE_H = 36, ISO_ELEVATION = 24, CAMERA_PAD = 170, COLS = 46, ROWS = 30, ENTRANCE_Y = 18;

const SAVE_KEY = 'pocketZooArchitectSaveV8';

const OLD_KEYS = ['pocketZooArchitectSaveV7', 'pocketZooArchitectSaveV6', 'pocketZooEvolutionSaveV4', 'pocketZooUltimateSaveV3', 'pocketZooDeluxeSaveV2', 'pocketZooSave'];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const canvas = document.getElementById('game'), ctx = canvas.getContext('2d'), wrap = document.getElementById('canvasWrap');

canvas.width = Math.ceil((COLS + ROWS) * ISO_TILE_W / 2 + CAMERA_PAD * 2);
canvas.height = Math.ceil((COLS + ROWS) * ISO_TILE_H / 2 + CAMERA_PAD * 2 + 180);

let zoom = .72, resetting = false, financeOpen = false, landOpen = false;

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const el = id => document.getElementById(id);
const setText = (id, value) => { const node = el(id); if (node) node.textContent = value; };
const setWidth = (id, value) => { const node = el(id); if (node) node.style.width = value; };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), key = (x, y) => `${x},${y}`, inside = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS;
const money = n => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString()}`;
const titleCase = s => String(s || '').replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
