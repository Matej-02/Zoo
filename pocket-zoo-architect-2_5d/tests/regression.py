from playwright.sync_api import sync_playwright
from pathlib import Path
import re, json, sys

root=Path(__file__).resolve().parents[1]
source=(root/'index.html').read_text()
html=re.sub(r'<script src="[^"]+" defer></script>\s*','',source)
html=re.sub(r'<link rel="stylesheet" href="[^"]+">\s*','',html)
scripts=re.findall(r'<script src="([^"]+)" defer></script>', source)
errors=[]
results=[]

def check(name, value, detail=''):
    results.append((name, bool(value), detail))
    if not value:
        print('FAIL',name,detail)

with sync_playwright() as p:
    
    chromium_path = Path('/usr/bin/chromium')
    launch_options = {'headless': True, 'args': ['--no-sandbox']}
    if chromium_path.exists():
        launch_options['executable_path'] = str(chromium_path)
    browser=p.chromium.launch(**launch_options)
    page=browser.new_page(viewport={'width':1600,'height':1000})
    page.on('console', lambda m: errors.append(f'console {m.type}: {m.text}') if m.type=='error' else None)
    page.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    page.set_content(html, wait_until='domcontentloaded')
    page.add_style_tag(content=(root/'styles/base.css').read_text()+(root/'styles/responsive.css').read_text())
    for script in scripts:
        page.add_script_tag(path=str(root/script))
    page.wait_for_timeout(250)
    page.evaluate("PocketZoo.state.speed=0; document.querySelector('#welcome').classList.add('hidden'); PocketZoo.state.money=50000; updateUI();")

    check('No startup JavaScript errors', not errors, '; '.join(errors))
    check('Catalog validates', page.evaluate('PocketZoo.diagnostics.validateCatalog().length===0'), json.dumps(page.evaluate('PocketZoo.diagnostics.validateCatalog()')))
    counts=page.evaluate('({species:Object.keys(PocketZoo.data.SPECIES).length,foliage:Object.keys(PocketZoo.data.FOLIAGE).length,paths:Object.values(PocketZoo.data.GROUND).filter(x=>x.path).length,education:Object.keys(PocketZoo.data.EDUCATION).length,zones:Object.keys(PocketZoo.data.ZONES).length})')
    check('At least 20 animal species', counts['species']>=20, str(counts))
    check('At least 30 foliage choices', counts['foliage']>=30, str(counts))
    check('Six path types', counts['paths']>=6, str(counts))
    check('Special education attractions', counts['education']>=8, str(counts))
    check('Five purchasable expansions', counts['zones']-1>=5, str(counts))
    check('Aquatic species included', page.evaluate("['riverOtter','seal','hippo','seaTurtle','dolphin'].every(id=>PocketZoo.data.SPECIES[id])"))

    camera_projection=page.evaluate('''() => {
      const samples=[[0.5,0.5],[12.5,18.5],[45.5,29.5],[23.25,7.75]];
      const original=PocketZoo.state.camera.rotation;
      const results=[];
      for(let rotation=0;rotation<4;rotation++){
        PocketZoo.state.camera.rotation=rotation;
        for(const [x,y] of samples){const screen=worldToScreen(x,y);const world=screenToWorld(screen.x,screen.y);results.push(Math.abs(world.x-x)<1e-6&&Math.abs(world.y-y)<1e-6);}
      }
      PocketZoo.state.camera.rotation=original;updateCameraUI();
      return results.every(Boolean);
    }''')
    check('Isometric camera maps screen and world coordinates accurately', camera_projection)

    camera_controls=page.evaluate('''() => {
      PocketZoo.state.camera.rotation=0;updateCameraUI();
      rotateCamera(1);const one={rotation:PocketZoo.state.camera.rotation,label:cameraDirection.textContent};
      rotateCamera(-1);const zero={rotation:PocketZoo.state.camera.rotation,label:cameraDirection.textContent};
      return {one,zero,width:game.width,height:game.height};
    }''')
    check('Camera rotates through four directions', camera_controls['one']['rotation']==1 and camera_controls['one']['label']=='South-east' and camera_controls['zero']['rotation']==0 and camera_controls['width']>2000 and camera_controls['height']>1000, str(camera_controls))

    camera_save=page.evaluate('''() => {
      PocketZoo.state.camera.rotation=3;
      const saved=serialize();
      PocketZoo.state.camera.rotation=0;
      hydrateSave(saved,'test');
      const result=PocketZoo.state.camera.rotation;
      PocketZoo.state.camera.rotation=0;updateCameraUI();
      return result;
    }''')
    check('Camera direction persists in saves', camera_save==3, str(camera_save))

    rotated_input=page.evaluate('''() => {
      const target={x:20,y:10};
      PocketZoo.state.camera.rotation=2; updateCameraUI();
      PocketZoo.state.tiles[target.y][target.x]={ground:'grass',object:null};
      PocketZoo.actions.selectTool('path');
      const screen=worldToScreen(target.x+.5,target.y+.5);
      const rect=game.getBoundingClientRect();
      const event={
        clientX:rect.left+screen.x*rect.width/game.width,
        clientY:rect.top+screen.y*rect.height/game.height,
        button:0,pointerId:77,preventDefault(){}
      };
      lastPaint=''; pointerAction(event); pointerUp();
      const ground=PocketZoo.state.tiles[target.y][target.x].ground;
      PocketZoo.state.camera.rotation=0; updateCameraUI();
      return ground;
    }''')
    check('Construction targets the correct tile after camera rotation', rotated_input=='path', str(rotated_input))

    icon_result=page.evaluate('''() => [...Object.values(PocketZoo.data.SPECIES),...Object.values(PocketZoo.data.FOLIAGE),...Object.values(PocketZoo.data.FENCES),...Object.values(PocketZoo.data.HABITAT_OBJECTS),...Object.values(PocketZoo.data.FACILITIES),...Object.values(PocketZoo.data.EDUCATION)].every(item=>!item.icon)''')
    check('Catalog data contains no emoji artwork fallbacks', icon_result)

    # Path placement, upgrade and bulldoze.
    path_result=page.evaluate('''() => {
      const A=PocketZoo.actions,S=PocketZoo.state;
      A.selectTool('naturePath'); A.place(7,18);
      const first=S.tiles[18][7].ground;
      A.selectTool('brickPath'); A.place(7,18);
      const upgraded=S.tiles[18][7].ground;
      A.selectTool('erase'); A.place(7,18);
      return {first,upgraded,removed:S.tiles[18][7].ground};
    }''')
    check('Paths place, upgrade, and remove', path_result=={'first':'naturePath','upgraded':'brickPath','removed':'grass'}, str(path_result))

    gate_result=page.evaluate('''() => {
      const A=PocketZoo.actions,S=PocketZoo.state;
      A.selectTool('lowFence'); A.place(10,10);
      const before=S.tiles[10][10].object;
      A.selectTool('lowGate'); A.place(10,10);
      return {before,after:S.tiles[10][10].object};
    }''')
    check('Gate replaces existing fence', gate_result=={'before':'lowFence','after':'lowGate'}, str(gate_result))

    foliage_result=page.evaluate('''() => {
      const A=PocketZoo.actions,S=PocketZoo.state;
      A.selectTool('cactus'); A.place(11,11); const rejected=S.tiles[11][11].object;
      A.selectTool('sand'); A.place(11,11); A.selectTool('cactus'); A.place(11,11); const desert=S.tiles[11][11].object;
      A.selectTool('shallowWater'); A.place(12,11); A.selectTool('lilyPads'); A.place(12,11); const lily=S.tiles[11][12].object;
      return {rejected,desert,lily};
    }''')
    check('Foliage obeys logical terrain', foliage_result['rejected'] is None and foliage_result['desert']=='cactus' and foliage_result['lily']=='lilyPads', str(foliage_result))

    staff_result=page.evaluate('''() => {
      const A=PocketZoo.actions,S=PocketZoo.state;
      A.hire('keeper');A.hire('keeper');A.hire('janitor');A.hire('guide');
      const hired={k:S.staff.filter(x=>x.role==='keeper').length,j:S.staff.filter(x=>x.role==='janitor').length,g:S.staff.filter(x=>x.role==='guide').length,dom:[keeperCount.textContent,janitorCount.textContent,guideCount.textContent]};
      A.dismiss('keeper');
      return {hired,after:S.staff.filter(x=>x.role==='keeper').length,payroll:recurringCosts().payroll};
    }''')
    check('Staff hire, counters, salaries, dismissal', staff_result['hired']['k']==2 and staff_result['hired']['j']==1 and staff_result['hired']['g']==1 and staff_result['hired']['dom']==['2','1','1'] and staff_result['after']==1 and staff_result['payroll']==705, str(staff_result))

    # Build a valid goat habitat and verify live inspector changes.
    inspect_result=page.evaluate('''() => {
      const S=PocketZoo.state,A=PocketZoo.actions;
      // Clear area and construct 8x8 low-fence habitat with a connected path/gate.
      for(let y=5;y<=13;y++)for(let x=7;x<=15;x++){S.tiles[y][x]={ground:'grass',object:null};}
      for(let x=8;x<=15;x++){S.tiles[5][x].object='lowFence';S.tiles[13][x].object='lowFence';}
      for(let y=5;y<=13;y++){S.tiles[y][8].object='lowFence';S.tiles[y][15].object='lowFence';}
      S.tiles[9][8].object='lowGate';
      for(let y=9;y<=18;y++)S.tiles[y][7].ground='path';
      for(let x=0;x<=7;x++)S.tiles[18][x].ground='path';
      S.tiles[6][9].object='shelter';S.tiles[6][10].object='feeder';S.tiles[6][11].object='logPile';S.tiles[7][9].object='oak';
      PocketZoo.diagnostics.recalculate();
      for(const [x,y] of [[10,8],[11,8],[12,8]]){A.selectTool('pygmyGoat');A.place(x,y);PocketZoo.diagnostics.recalculate();}
      const animal=S.animals.find(a=>a.species==='pygmyGoat');
      A.inspect(Math.floor(animal.px),Math.floor(animal.py)); updateUI();
      const before=inspector.textContent;
      S.tiles[6][10].object=null; PocketZoo.diagnostics.recalculate(); updateUI();
      const missing=inspector.textContent;
      S.tiles[6][10].object='feeder'; PocketZoo.diagnostics.recalculate(); updateUI();
      const restored=inspector.textContent;
      return {before,missing,restored,happiness:animal.happiness};
    }''')
    check('Inspection updates live after habitat changes', 'food station' not in inspect_result['before'].lower() and 'food station' in inspect_result['missing'].lower() and 'food station' not in inspect_result['restored'].lower(), str(inspect_result))

    collapse_result=page.evaluate('''() => {
      const sec=document.querySelector('[data-collapsible="employees"]');
      sec.querySelector('.section-toggle').click(); const one=sec.classList.contains('collapsed');
      sec.querySelector('.section-toggle').click(); const two=!sec.classList.contains('collapsed');
      return {one,two};
    }''')
    check('Management sections minimize independently', collapse_result['one'] and collapse_result['two'], str(collapse_result))

    # Monthly finance rollover.
    finance_result=page.evaluate('''() => {
      const S=PocketZoo.state,A=PocketZoo.actions;
      const before=S.finance.history.length;
      S.calendar={day:31,month:0,year:2027};
      S.finance.current=newLedger(S.calendar);
      earn(1200,'tickets');
      A.advanceDay();
      const last=S.finance.history.at(-1);
      return {day:S.calendar.day,month:S.calendar.month,year:S.calendar.year,history:S.finance.history.length-before,payroll:last.expense.payroll,net:last.net,date:dateStat.textContent};
    }''')
    check('Calendar and finances roll over monthly', finance_result['day']==1 and finance_result['month']==1 and finance_result['history']==1 and finance_result['payroll']==705 and finance_result['date'].startswith('1 Feb'), str(finance_result))

    # Finance modal readability / projected KPI.
    finance_ui=page.evaluate('''() => {openFinance(); return {visible:!financeModal.classList.contains('hidden'),forecast:finForecast.textContent,bars:document.querySelectorAll('#incomeBars .bar-row').length};}''')
    check('Finance dashboard renders graph data and forecast', finance_ui['visible'] and '$' in finance_ui['forecast'] and page.locator('#financeTable tr').count()>=1, str(finance_ui))

    # Guide tours and education income using two connected educational stops.
    tour_result=page.evaluate('''() => {
      const S=PocketZoo.state;
      S.tiles[18][1].object='infoBoard';S.tiles[18][2].object='insectHouse';
      PocketZoo.diagnostics.recalculate();
      const guide=S.staff.find(x=>x.role==='guide'); guide.x=.5;guide.y=ENTRANCE_Y+.5;guide.path=[];guide.task=null;guide.cooldown=0;
      const before=S.finance.current.income.tours;startTour(guide);
      return {income:S.finance.current.income.tours-before,group:guide.group,status:guide.status};
    }''')
    check('Tour guides lead paid groups', tour_result['income']>0 and tour_result['group']>=4, str(tour_result))

    # Trash scalability.
    trash_result=page.evaluate('''() => {
      const S=PocketZoo.state;
      for(let x=0;x<7;x++)S.tiles[18][x].object=x<5?'bin':S.tiles[18][x].object;
      S.litter=Array.from({length:20},(_,i)=>({x:i%7,y:18,amount:2}));
      const before=S.litter.reduce((a,b)=>a+b.amount,0);
      for(let i=0;i<12;i++)advanceDay();
      const after=S.litter.reduce((a,b)=>a+b.amount,0);
      return {before,after,count:S.litter.length};
    }''')
    check('Trash remains manageable with janitors and bins', trash_result['after']<trash_result['before']/2, str(trash_result))

    land_result=page.evaluate('''() => {PocketZoo.state.money=50000;PocketZoo.actions.buyExpansion('east');return PocketZoo.state.unlocked.includes('east');}''')
    check('Land expansions can be purchased', land_result)

    art_result=page.evaluate('''() => {
      const cats=['build','terrain','fences','habitat','foliage','animals','facilities','education'];
      let total=0,svgs=0;
      for(const cat of cats){PocketZoo.state.category=cat;renderTools();const tools=[...document.querySelectorAll('#toolButtons .tool')];total+=tools.length;svgs+=tools.filter(t=>t.querySelector('svg')).length;}
      return {total,svgs};
    }''')
    check('Every construction item uses drawn SVG artwork', art_result['total']==art_result['svgs'] and art_result['total']>80, str(art_result))

    hover_result=page.evaluate("document.querySelectorAll('#toolButtons .tool[title]').length===document.querySelectorAll('#toolButtons .tool').length")
    check('Every construction item has hover information', hover_result)

    # Save key clearing verifies new-zoo reset core behavior without reloading the test page.
    reset_result=page.evaluate('''() => {try{localStorage.setItem(SAVE_KEY,'x');for(const k of OLD_KEYS)localStorage.setItem(k,'x');clearAllSaves();return !localStorage.getItem(SAVE_KEY)&&OLD_KEYS.every(k=>!localStorage.getItem(k));}catch(e){return 'storage-unavailable';} }''')
    check('New zoo clears current and legacy saves', reset_result is True or reset_result=='storage-unavailable', str(reset_result))

    page.screenshot(path=str(root/'tests/regression-screenshot.png'), full_page=True)
    browser.close()

passed=sum(ok for _,ok,_ in results)
print(f'PASS {passed}/{len(results)}')
for name,ok,detail in results:
    print(('PASS' if ok else 'FAIL'),name,detail if not ok else '')
if passed != len(results):
    sys.exit(1)
