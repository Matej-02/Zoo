from playwright.sync_api import sync_playwright
from pathlib import Path
import re, json, sys

root = Path(__file__).resolve().parents[1]
source = (root / 'index.html').read_text(encoding='utf-8')
html = re.sub(r'<script src="[^"]+" defer></script>\s*', '', source)
html = re.sub(r'<link rel="stylesheet" href="[^"]+">\s*', '', html)
scripts = re.findall(r'<script src="([^"]+)" defer></script>', source)
errors, results = [], []

def check(name, value, detail=''):
    ok = bool(value)
    results.append((name, ok, detail))
    if not ok:
        print('FAIL', name, detail)

with sync_playwright() as p:
    chromium_path = Path('/usr/bin/chromium')
    launch_options = {'headless': True, 'args': ['--no-sandbox']}
    if chromium_path.exists():
        launch_options['executable_path'] = str(chromium_path)
    browser = p.chromium.launch(**launch_options)
    page = browser.new_page(viewport={'width': 1600, 'height': 1000})
    page.on('console', lambda m: errors.append(f'console {m.type}: {m.text}') if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    page.set_content(html, wait_until='domcontentloaded')
    page.add_style_tag(content=(root / 'styles/base.css').read_text() + (root / 'styles/responsive.css').read_text())
    for script in scripts:
        page.add_script_tag(path=str(root / script))
    page.wait_for_timeout(350)
    page.evaluate("""() => {
        PocketZoo.state.speed = 0;
        document.querySelector('#welcome').classList.add('hidden');
        PocketZoo.state.money = 50000;
        updateUI();
        window.__baseline = serialize();
        window.__resetTest = () => {
            hydrateSave(JSON.parse(JSON.stringify(window.__baseline)), 'test');
            PocketZoo.state.speed = 0;
            PocketZoo.state.money = 50000;
            document.querySelector('#welcome').classList.add('hidden');
            PocketZoo.diagnostics.recalculate();
            openPanel('overview');
            updateUI();
        };
        window.__setupGoatHabitat = () => {
            const S = PocketZoo.state;
            for (let y=5; y<=13; y++) for (let x=7; x<=15; x++) S.tiles[y][x] = {ground:'grass', object:null};
            for (let x=8; x<=15; x++) { S.tiles[5][x].object='lowFence'; S.tiles[13][x].object='lowFence'; }
            for (let y=5; y<=13; y++) { S.tiles[y][8].object='lowFence'; S.tiles[y][15].object='lowFence'; }
            S.tiles[9][8].object='lowGate';
            for (let y=9; y<=18; y++) S.tiles[y][7].ground='path';
            for (let x=0; x<=7; x++) S.tiles[18][x].ground='path';
            S.tiles[6][9].object='shelter'; S.tiles[6][10].object='feeder'; S.tiles[6][11].object='logPile'; S.tiles[7][9].object='oak';
            S.tiles[8][9].ground='dirt'; S.tiles[8][10].ground='dirt';
            structureDirty=true; refreshAccessiblePaths(); analyzePens();
            const pen = penAt(10,8);
            const base = (i, sex) => ({
                id:uid(), name:['Pip','Moss','Clover'][i], species:'pygmyGoat',
                px:10.5+i, py:8.5, targetX:10+i, targetY:8, dir:1, moveTimer:0,
                hunger:92, happiness:84, hygiene:90, grooming:90, health:100,
                sick:false, illnessDays:0, ageDays:400, juvenile:false, sex,
                penId:pen.id, issues:[], animOffset:i
            });
            S.animals=[base(0,'female'),base(1,'male'),base(2,'female')];
            structureDirty=true; refreshAccessiblePaths(); analyzePens(); calculateZooMetrics(); updateUI();
            return {penId:pen.id, animalId:S.animals[0].id};
        };
    }""")

    check('No startup JavaScript errors', not errors, '; '.join(errors))
    check('Catalog validates', page.evaluate('PocketZoo.diagnostics.validateCatalog().length===0'), json.dumps(page.evaluate('PocketZoo.diagnostics.validateCatalog()')))

    counts = page.evaluate("""() => ({
        species:Object.keys(PocketZoo.data.SPECIES).length,
        foliage:Object.keys(PocketZoo.data.FOLIAGE).length,
        paths:Object.values(PocketZoo.data.GROUND).filter(x=>x.path).length,
        education:Object.keys(PocketZoo.data.EDUCATION).length,
        zones:Object.keys(PocketZoo.data.ZONES).length,
        fences:Object.keys(PocketZoo.data.FENCES).length,
        habitat:Object.keys(PocketZoo.data.HABITAT_OBJECTS).length
    })""")
    check('Content variety remains extensive', counts['species'] >= 20 and counts['foliage'] >= 30 and counts['paths'] >= 6 and counts['education'] >= 8 and counts['zones'] - 1 >= 5 and counts['fences'] >= 10 and counts['habitat'] >= 12, str(counts))
    check('Aquatic species and water habitats remain included', page.evaluate("['riverOtter','seal','hippo','seaTurtle','dolphin'].every(id=>PocketZoo.data.SPECIES[id]) && ['shallowWater','deepWater','saltWater'].every(id=>PocketZoo.data.GROUND[id])"))

    camera_projection = page.evaluate("""() => {
        const samples=[[0.5,0.5],[12.5,18.5],[45.5,29.5],[23.25,7.75]], original=state.camera.rotation, result=[];
        for(let rotation=0;rotation<4;rotation++){
            state.camera.rotation=rotation;
            for(const [x,y] of samples){const s=worldToScreen(x,y),w=screenToWorld(s.x,s.y);result.push(Math.abs(w.x-x)<1e-6&&Math.abs(w.y-y)<1e-6);}
        }
        state.camera.rotation=original; updateCameraUI(); return result.every(Boolean);
    }""")
    check('2.5D camera projection is accurate in all directions', camera_projection)

    camera_controls = page.evaluate("""() => {
        state.camera.rotation=0; updateCameraUI();
        document.querySelector('#rotateRight').click(); const one={r:state.camera.rotation,label:cameraDirection.textContent};
        document.querySelector('#rotateLeft').click(); const zero={r:state.camera.rotation,label:cameraDirection.textContent};
        return {one,zero,visible:[rotateLeft,rotateRight,zoomIn,zoomOut].every(n=>n.offsetParent!==null)};
    }""")
    check('Visible rotate controls work beside zoom controls', camera_controls['visible'] and camera_controls['one']['r'] == 1 and camera_controls['zero']['r'] == 0, str(camera_controls))

    camera_save = page.evaluate("""() => {state.camera.rotation=3;const saved=serialize();state.camera.rotation=0;hydrateSave(saved,'test');const r=state.camera.rotation;state.camera.rotation=0;updateCameraUI();return r;}""")
    check('Camera direction persists in saves', camera_save == 3, str(camera_save))

    rotated_input = page.evaluate("""() => {
        __resetTest(); const target={x:20,y:10}; state.camera.rotation=2;updateCameraUI();
        state.tiles[target.y][target.x]={ground:'grass',object:null};selectTool('path');
        const s=worldToScreen(target.x+.5,target.y+.5),rect=game.getBoundingClientRect();
        pointerAction({clientX:rect.left+s.x*rect.width/game.width,clientY:rect.top+s.y*rect.height/game.height,button:0,pointerId:77,preventDefault(){}});pointerUp();
        const ground=state.tiles[target.y][target.x].ground;state.camera.rotation=0;updateCameraUI();return ground;
    }""")
    check('Construction targets the correct tile after camera rotation', rotated_input == 'path', str(rotated_input))

    rail = page.evaluate("""() => {
        const buttons=[...document.querySelectorAll('#iconRail .rail-btn')];
        return {count:buttons.length,allSvg:buttons.every(b=>b.querySelector('svg')),labelsHidden:buttons.every(b=>b.querySelector('span').getBoundingClientRect().width<=1.1)};
    }""")
    check('Left menu is an icon-only rail', rail['count'] >= 16 and rail['allSvg'] and rail['labelsHidden'], str(rail))

    panel_flow = page.evaluate("""() => {
        document.querySelector('[data-panel="construction"][data-category="terrain"]').click();
        const opened={panel:state.activePanel,category:state.category,title:panelTitle.textContent,active:document.querySelectorAll('.feature-panel.active').length,closed:contextPanel.classList.contains('closed')};
        closeContext.click();
        return {opened,closed:contextPanel.classList.contains('closed'),grid:main.classList.contains('panel-closed')};
    }""")
    check('Only one feature panel opens and closes with X', panel_flow['opened']['panel']=='construction' and panel_flow['opened']['category']=='terrain' and panel_flow['opened']['active']==1 and not panel_flow['opened']['closed'] and panel_flow['closed'] and panel_flow['grid'], str(panel_flow))

    tool_flow = page.evaluate("""() => {
        inspectToolBtn.click();const inspect={tool:state.selected,panel:state.activePanel,closed:contextPanel.classList.contains('closed')};
        eraseToolBtn.click();const erase={tool:state.selected,closed:contextPanel.classList.contains('closed'),active:eraseToolBtn.classList.contains('tool-active')};
        return {inspect,erase};
    }""")
    check('Inspect and Bulldoze are separate one-click tools', tool_flow['inspect']['tool']=='inspect' and tool_flow['inspect']['panel']=='inspector' and not tool_flow['inspect']['closed'] and tool_flow['erase']['tool']=='erase' and tool_flow['erase']['closed'] and tool_flow['erase']['active'], str(tool_flow))

    no_hover = page.evaluate("""() => !document.getElementById('hoverTip') && typeof showHover==='undefined' && !document.querySelector('.hover-tip')""")
    check('Map hover information window has been removed', no_hover)

    path_result = page.evaluate("""() => {__resetTest();selectTool('naturePath');place(7,18);const first=state.tiles[18][7].ground;selectTool('brickPath');place(7,18);const upgraded=state.tiles[18][7].ground;selectTool('erase');place(7,18);return {first,upgraded,removed:state.tiles[18][7].ground};}""")
    check('Paths place, upgrade and bulldoze correctly', path_result == {'first':'naturePath','upgraded':'brickPath','removed':'grass'}, str(path_result))

    gate_result = page.evaluate("""() => {__resetTest();selectTool('lowFence');place(10,10);const before=state.tiles[10][10].object;selectTool('lowGate');place(10,10);return {before,after:state.tiles[10][10].object};}""")
    check('Gate placement converts an existing fence', gate_result == {'before':'lowFence','after':'lowGate'}, str(gate_result))

    foliage_result = page.evaluate("""() => {
        __resetTest();selectTool('cactus');place(11,11);const rejected=state.tiles[11][11].object;
        selectTool('sand');place(11,11);selectTool('cactus');place(11,11);const desert=state.tiles[11][11].object;
        selectTool('shallowWater');place(12,11);selectTool('lilyPads');place(12,11);const lily=state.tiles[11][12].object;
        return {rejected,desert,lily};
    }""")
    check('Biome foliage obeys logical terrain', foliage_result['rejected'] is None and foliage_result['desert']=='cactus' and foliage_result['lily']=='lilyPads', str(foliage_result))

    staff_result = page.evaluate("""() => {
        __resetTest();hire('keeper');hire('keeper');hire('janitor');hire('guide');
        const hired={k:countStaff('keeper'),j:countStaff('janitor'),g:countStaff('guide'),dom:[keeperCount.textContent,janitorCount.textContent,guideCount.textContent]};
        dismiss('keeper');return {hired,after:countStaff('keeper'),payroll:recurringCosts().payroll};
    }""")
    check('Staff counters, salaries, hiring and dismissal work', staff_result['hired']['k']==2 and staff_result['hired']['j']==1 and staff_result['hired']['g']==1 and staff_result['hired']['dom']==['2','1','1'] and staff_result['after']==1 and staff_result['payroll']==705, str(staff_result))

    finance_result = page.evaluate("""() => {
        state.calendar={day:31,month:0,year:2027};state.finance.current=newLedger(state.calendar);state.finance.history=[];earn(1200,'tickets');
        const before=state.finance.history.length;advanceDay();const last=state.finance.history.at(-1);
        return {day:state.calendar.day,month:state.calendar.month,year:state.calendar.year,history:state.finance.history.length-before,payroll:last.expense.payroll,net:last.net,date:dateStat.textContent};
    }""")
    check('Calendar and finances operate monthly while days remain visible', finance_result['day']==1 and finance_result['month']==1 and finance_result['history']==1 and finance_result['payroll']==705 and finance_result['date'].startswith('1 Feb'), str(finance_result))

    finance_ui = page.evaluate("""() => {openPanel('finance');renderFinance();return {active:state.activePanel==='finance'&&!contextPanel.classList.contains('closed'),forecast:finForecast.textContent,rows:document.querySelectorAll('#financeTable tr').length,canvas:financeChart.width>0};}""")
    check('Readable finance panel renders forecast, graph and history', finance_ui['active'] and '$' in finance_ui['forecast'] and finance_ui['rows'] >= 1 and finance_ui['canvas'], str(finance_ui))

    tour_result = page.evaluate("""() => {
        __resetTest();state.tiles[18][1].object='infoBoard';state.tiles[18][2].object='insectHouse';structureDirty=true;refreshAccessiblePaths();analyzePens();
        hire('guide');const guide=state.staff.find(x=>x.role==='guide');guide.x=.5;guide.y=ENTRANCE_Y+.5;guide.path=[];guide.task=null;guide.cooldown=0;
        const before=state.finance.current.income.tours;startTour(guide);return {income:state.finance.current.income.tours-before,group:guide.group,status:guide.status};
    }""")
    check('Tour guides lead visible paid groups', tour_result['income']>0 and tour_result['group']>=4 and 'group' in tour_result['status'].lower(), str(tour_result))

    trash_result = page.evaluate("""() => {
        __resetTest();for(let x=0;x<5;x++)state.tiles[18][x].object='bin';hire('janitor');hire('janitor');hire('janitor');
        state.litter=Array.from({length:20},(_,i)=>({x:i%7,y:18,amount:2}));const before=sumObj(Object.fromEntries(state.litter.map((x,i)=>[i,x.amount])));
        for(let i=0;i<12;i++)advanceDay();const after=state.litter.reduce((s,x)=>s+x.amount,0);return {before,after,count:state.litter.length};
    }""")
    check('Public litter remains manageable with bins and janitors', trash_result['after'] < trash_result['before']/2, str(trash_result))

    land_result = page.evaluate("""() => {__resetTest();buyExpansion('east');return state.unlocked.includes('east');}""")
    check('Larger zoo expansions can be purchased', land_result)

    art_result = page.evaluate("""() => {
        const cats=['build','terrain','fences','habitat','foliage','animals','facilities','education'];let total=0,svgs=0;
        for(const cat of cats){state.category=cat;renderTools();const tools=[...document.querySelectorAll('#toolButtons .tool')];total+=tools.length;svgs+=tools.filter(t=>t.querySelector('svg')).length;}
        return {total,svgs,noIcons:[...Object.values(SPECIES),...Object.values(FOLIAGE),...Object.values(FENCES),...Object.values(HABITAT_OBJECTS),...Object.values(FACILITIES),...Object.values(EDUCATION)].every(item=>!item.icon)};
    }""")
    check('All catalog items use custom SVG/canvas art instead of emoji', art_result['total']==art_result['svgs'] and art_result['total']>80 and art_result['noIcons'], str(art_result))

    happiness_result = page.evaluate("""() => {__resetTest();__setupGoatHabitat();calculateZooMetrics();updateUI();return {metric:state.animalHappiness,header:animalHappyStat.textContent,overview:animalHappinessValue.textContent,width:animalHappinessMeter.style.width};}""")
    check('Animal happiness is a visible zoo condition', happiness_result['metric']>0 and '%' in happiness_result['header'] and '%' in happiness_result['overview'] and happiness_result['width'].endswith('%'), str(happiness_result))

    care_result = page.evaluate("""() => {
        __resetTest();const setup=__setupGoatHabitat(),animal=state.animals[0],oldRandom=Math.random;
        const before={h:animal.hygiene,g:animal.grooming,w:state.animalWaste.length};Math.random=()=>0;processAnimalDay();Math.random=oldRandom;
        return {before,after:{h:animal.hygiene,g:animal.grooming,w:state.animalWaste.length,sick:animal.sick,health:animal.health}};
    }""")
    check('Animals create waste, lose hygiene/grooming and can fall ill', care_result['after']['w']>care_result['before']['w'] and care_result['after']['h']<care_result['before']['h'] and care_result['after']['g']<care_result['before']['g'] and care_result['after']['sick'] and care_result['after']['health']<100, str(care_result))

    keeper_result = page.evaluate("""() => {
        __resetTest();const setup=__setupGoatHabitat(),animal=state.animals[0];hire('keeper');const keeper=state.staff.find(x=>x.role==='keeper');
        animal.sick=true;animal.health=48;assignKeeper(keeper);const first=keeper.task?.type;keeper.path=[];completeStaffTask(keeper);const treated=!animal.sick&&animal.health>=82;
        state.animalWaste=[{id:uid(),x:10,y:8,amount:4,penId:setup.penId,animalId:animal.id}];assignKeeper(keeper);const second=keeper.task?.type;keeper.path=[];completeStaffTask(keeper);const cleaned=state.animalWaste.length===0;
        animal.hygiene=30;assignKeeper(keeper);const third=keeper.task?.type;keeper.path=[];completeStaffTask(keeper);const washed=animal.hygiene>70;
        animal.grooming=25;assignKeeper(keeper);const fourth=keeper.task?.type;keeper.path=[];completeStaffTask(keeper);const groomed=animal.grooming>70;
        return {first,second,third,fourth,treated,cleaned,washed,groomed,status:keeper.status};
    }""")
    check('Keepers visibly prioritise treatment, habitat cleaning, washing and grooming', keeper_result['first']=='treat' and keeper_result['second']=='cleanHabitat' and keeper_result['third']=='wash' and keeper_result['fourth']=='groom' and keeper_result['treated'] and keeper_result['cleaned'] and keeper_result['washed'] and keeper_result['groomed'], str(keeper_result))

    care_balance = page.evaluate("""() => {
        __resetTest();__setupGoatHabitat();
        for(let i=3;i<9;i++)state.animals.push({id:uid(),name:`Goat ${i+1}`,species:'pygmyGoat',px:10.5+(i%3),py:8.5+Math.floor(i/3),targetX:10+(i%3),targetY:8+Math.floor(i/3),hunger:90,happiness:82,hygiene:90,grooming:90,health:100,sick:false,illnessDays:0,ageDays:400,juvenile:false,sex:i%2?'male':'female',penId:state.animals[0].penId,issues:[],animOffset:i});
        hire('keeper');hire('keeper');structureDirty=true;refreshAccessiblePaths();analyzePens();calculateZooMetrics();
        let maxWaste=0,minHygiene=100,minGrooming=100;
        for(let day=0;day<60;day++){
            processAnimalDay();calculateZooMetrics();
            for(let tick=0;tick<100;tick++)updateStaff(.1);
            maxWaste=Math.max(maxWaste,state.animalWaste.reduce((sum,item)=>sum+item.amount,0));
            minHygiene=Math.min(minHygiene,...state.animals.map(a=>a.hygiene));
            minGrooming=Math.min(minGrooming,...state.animals.map(a=>a.grooming));
        }
        return {waste:state.animalWaste.reduce((sum,item)=>sum+item.amount,0),maxWaste,minHygiene,minGrooming,sick:state.animals.filter(a=>a.sick).length};
    }""")
    check('Keeper workload remains sustainable in a medium habitat', care_balance['waste'] <= 10 and care_balance['maxWaste'] <= 12 and care_balance['minHygiene'] >= 55 and care_balance['minGrooming'] >= 45 and care_balance['sick'] <= 1, str(care_balance))

    inspector_result = page.evaluate("""() => {
        __resetTest();const setup=__setupGoatHabitat(),animal=state.animals[0];state.inspection={type:'animal',id:animal.id};openPanel('inspector');updateUI();
        const before=inspector.textContent;animal.hygiene=31;animal.grooming=28;animal.sick=true;animal.illnessDays=2;updateUI();const after=inspector.textContent;
        return {before,after,active:state.activePanel,containsAfter:after.includes('31%')&&after.includes('28%')&&after.includes('Ill for 2 days')};
    }""")
    check('Inspect panel updates live as animal care changes', inspector_result['active']=='inspector' and inspector_result['containsAfter'] and inspector_result['before']!=inspector_result['after'], str(inspector_result))

    event_limit = page.evaluate("""() => {
        state.zooEvents=[];state.dailyEventCounter={key:'',count:0};
        for(let i=0;i<6;i++)pushZooEvent('system',`Routine ${i}`,`Routine event ${i}`,{key:`r${i}`});
        const routine=state.zooEvents.length;
        pushZooEvent('animal','Urgent illness','A sick animal needs care.',{priority:'high',key:'urgent'});
        return {routine,after:state.zooEvents.length,urgent:state.zooEvents.some(e=>e.duplicateKey==='urgent'),count:state.dailyEventCounter.count};
    }""")
    check('Zoo news is limited to a few events per day while preserving urgent events', event_limit['routine']==3 and event_limit['after']==3 and event_limit['urgent'] and event_limit['count']==3, str(event_limit))

    pulse_result = page.evaluate("""() => {renderZooEvents();return {visible:zooPulse.offsetParent!==null,items:document.querySelectorAll('#zooPulseList .pulse-item').length,badge:eventBadge.textContent};}""")
    check('Compact zoo pulse shows recent meaningful events', pulse_result['visible'] and 1 <= pulse_result['items'] <= 4, str(pulse_result))

    annual_result = page.evaluate("""() => {
        state.zooEvents=[];state.dailyEventCounter={key:'',count:0};state.finance.history=[];
        for(let month=0;month<12;month++)state.finance.history.push({month,year:2030,income:{tickets:1000,shops:200},expense:{payroll:300,animalCare:100},closing:10000,net:800});
        publishYearSummary(2030);const event=state.zooEvents[0];return {title:event?.title,text:event?.text,type:event?.type};
    }""")
    check('Year-end financial result appears in zoo news', annual_result['title']=='2030 financial report' and annual_result['type']=='finance' and '$' in annual_result['text'], str(annual_result))

    birth_result = page.evaluate("""() => {
        __resetTest();__setupGoatHabitat();state.zooEvents=[];state.dailyEventCounter={key:'',count:0};for(const a of state.animals){a.happiness=95;a.health=100;a.sick=false;a.ageDays=400;a.juvenile=false;}
        const before=state.animals.length,oldRandom=Math.random;Math.random=()=>0;tryAnimalBirths();Math.random=oldRandom;
        const baby=state.animals.find(a=>a.juvenile);return {before,after:state.animals.length,baby:!!baby,event:state.zooEvents.some(e=>e.title==='A baby was born')};
    }""")
    check('Healthy compatible animals can have babies and generate one event', birth_result['after']==birth_result['before']+1 and birth_result['baby'] and birth_result['event'], str(birth_result))

    migration_result = page.evaluate("""() => {
        const old=serialize();old.version=7;delete old.animalWaste;delete old.zooEvents;delete old.animalHappiness;old.animals=[{id:'legacy',name:'Legacy',species:'pygmyGoat',px:10.5,py:10.5,targetX:10,targetY:10,hunger:80,happiness:70,penId:0}];
        hydrateSave(old,'legacy');const a=state.animals[0];return {version:state.version,waste:Array.isArray(state.animalWaste),events:Array.isArray(state.zooEvents),care:[a.hygiene,a.grooming,a.health].every(Number.isFinite),panel:state.activePanel};
    }""")
    check('Older saves migrate to new care, event and panel state', migration_result['version']==9 and migration_result['waste'] and migration_result['events'] and migration_result['care'] and migration_result['panel'], str(migration_result))

    reset_result = page.evaluate("""() => {try{localStorage.setItem(SAVE_KEY,'x');for(const k of OLD_KEYS)localStorage.setItem(k,'x');clearAllSaves();return !localStorage.getItem(SAVE_KEY)&&OLD_KEYS.every(k=>!localStorage.getItem(k));}catch(e){return 'storage-unavailable';}}""")
    check('New zoo clears current and legacy saves', reset_result is True or reset_result == 'storage-unavailable', str(reset_result))

    page.evaluate("__resetTest();openPanel('overview');document.querySelector('#welcome').classList.add('hidden');")
    page.screenshot(path=str(root / 'tests/regression-screenshot.png'), full_page=True)
    browser.close()

passed = sum(ok for _, ok, _ in results)
print(f'PASS {passed}/{len(results)}')
for name, ok, detail in results:
    print(('PASS' if ok else 'FAIL'), name, detail if not ok else '')
if passed != len(results):
    sys.exit(1)
