'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const context = { window: {}, console };
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/config.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/data.js'), 'utf8'), context);
const C = context.window.PZ_CONFIG;
const D = context.window.PZ_DATA;
const game = fs.readFileSync(path.join(root, 'js/game.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles/main.css'), 'utf8');
const checks = {
  'large map': C.COLS >= 46 && C.ROWS >= 30,
  'calendar months': C.MONTHS.length === 12,
  'multiple expansion parcels': Object.keys(D.ZONES).length >= 6,
  'animal variety': Object.keys(D.SPECIES).length >= 20,
  'foliage variety': Object.keys(D.FOLIAGE).length >= 25,
  'biome variety': new Set(Object.values(D.FOLIAGE).map(x => x.biome)).size >= 8,
  'six path types': Object.values(D.GROUND).filter(x => x.path).length >= 6,
  'aquatic terrain': ['shallowWater','deepWater','saltWater'].every(x => D.GROUND[x]),
  'specialist fences': ['lowFence','strongFence','highFence','glassFence','aquaticWall'].every(x => D.FENCES[x]),
  'education attractions': Object.keys(D.EDUCATION).length >= 6,
  'monthly salaries': ['keeper','janitor','guide'].every(x => D.SALARY[x] > 0) && /closeMonth\(\)/.test(game),
  'staff hire and dismiss': /function hire\(role\)/.test(game) && /function dismiss\(role\)/.test(game),
  'path bulldozing': /isPathGround\(t\.ground\)/.test(game) && /t\.ground='grass'/.test(game),
  'gate replacement': /const credit=Math\.round\(existing\.cost\*\.65\)/.test(game) && /t\.object=tool/.test(game),
  'terrain-aware foliage': /foliageAllowed\(state\.selected,t\.ground\)/.test(game),
  'live inspector': /renderStaff\(\);renderQuickTools\(\);renderInspector\(\)/.test(game),
  'permanent inspect and bulldoze': (html.match(/data-quick-tool=/g)||[]).length === 2,
  'collapsible management': (html.match(/data-collapsible=/g)||[]).length >= 4,
  'staff counters': ['keeperCount','janitorCount','guideCount'].every(id => html.includes(`id="${id}"`)),
  'monthly finance UI': html.includes('Monthly finances') && html.includes('financeChart') && html.includes('financeTable'),
  'new zoo reset': /localStorage\.removeItem\(SAVE_KEY\)/.test(game) && /location\.reload\(\)/.test(game),
  'custom canvas artwork': /function drawAnimal/.test(game) && /function drawObject/.test(game),
  'hover explanations': /function showHover/.test(game) && html.includes('hoverTip'),
  'responsive layout': /@media/.test(css),
  'ordered modular scripts': html.indexOf('js/config.js') < html.indexOf('js/data.js') && html.indexOf('js/data.js') < html.indexOf('js/game.js'),
  'no external runtime dependencies': !/https?:\/\//.test(html.replace(/<meta[^>]*>/g,''))
};
let failed = 0;
for (const [name, ok] of Object.entries(checks)) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
console.log(`\n${Object.keys(checks).length - failed}/${Object.keys(checks).length} checks passed.`);
process.exitCode = failed ? 1 : 0;
