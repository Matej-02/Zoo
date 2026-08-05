from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageOps, ImageDraw
import re

root = Path(__file__).resolve().parents[1]
source = (root / 'index.html').read_text()
html = re.sub(r'<script src="[^"]+" defer></script>\s*', '', source)
html = re.sub(r'<link rel="stylesheet" href="[^"]+">\s*', '', html)
scripts = re.findall(r'<script src="([^"]+)" defer></script>', source)

scenario = r'''() => {
  state.speed=0; state.money=99999; state.calendar={day:1,month:2,year:2026};
  state.finance={current:newLedger(state.calendar),history:[]};
  state.tiles=makeTiles(); state.unlocked=['core']; state.animals=[]; state.visitors=[];
  state.staff=[]; state.litter=[]; state.animalWaste=[]; state.logs=[]; state.zooEvents=[]; state.dailyEventCounter={key:'',count:0}; state.reputation=72; state.cleanliness=98;
  state.satisfaction=84; state.education=58; state.totalGuests=216; state.completedGoals=[];
  state.ticketPrice=15; state.camera.rotation=0;

  const setGround=(x,y,g)=>state.tiles[y][x].ground=g;
  const setObject=(x,y,o)=>state.tiles[y][x].object=o;
  const linePath=(x1,y1,x2,y2,g='brickPath')=>{
    if(x1===x2) for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++) setGround(x1,y,g);
    else for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++) setGround(x,y1,g);
  };
  const rectFence=(x1,y1,x2,y2,fence,gateX,gateY,gate)=>{
    for(let x=x1;x<=x2;x++){setObject(x,y1,fence);setObject(x,y2,fence);}
    for(let y=y1;y<=y2;y++){setObject(x1,y,fence);setObject(x2,y,fence);}
    setObject(gateX,gateY,gate);
  };

  linePath(0,18,29,18,'brickPath');
  linePath(7,4,7,18,'path');
  linePath(18,4,18,18,'slatePath');
  linePath(7,4,18,4,'naturePath');
  linePath(7,14,18,14,'boardwalk');

  rectFence(8,5,16,13,'standardFence',8,9,'standardGate');
  for(let y=6;y<=12;y++) for(let x=9;x<=15;x++) setGround(x,y,(x+y)%5===0?'dirt':'grass');
  setObject(10,6,'shelter'); setObject(11,6,'feeder'); setObject(12,6,'waterPump');
  setObject(14,7,'activityBall'); setObject(13,11,'logPile');
  setObject(10,10,'acacia'); setObject(14,10,'savannaGrass'); setObject(12,9,'umbrellaThorn');

  rectFence(19,5,28,14,'aquaticWall',19,9,'aquaticGate');
  for(let y=6;y<=13;y++) for(let x=20;x<=27;x++) {
    const edge=x===20||x===27||y===6||y===13;
    setGround(x,y,edge?'shallowWater':'deepWater');
  }
  for(const [x,y] of [[20,12],[21,12],[22,12]]) setGround(x,y,'mud');
  setObject(21,7,'waterJets'); setObject(26,7,'baskingRock'); setObject(20,11,'reeds');
  setObject(22,10,'lilyPads'); setObject(25,11,'riverGrass'); setObject(27,12,'willow');
  setObject(24,7,'feeder'); setObject(26,12,'shelter');

  const pathObjects=[
    [2,18,'burger'],[3,18,'drinks'],[4,18,'bin'],[5,18,'bench'],[6,18,'infoBoard'],
    [9,18,'icecream'],[10,18,'toilet'],[12,18,'gift'],[14,18,'butterflyGarden'],
    [16,18,'educationCenter'],[20,18,'photo'],[22,18,'insectHouse'],[24,18,'playground'],[27,18,'bin']
  ];
  for(const [x,y,o] of pathObjects) setObject(x,y,o);

  const animal=(species,name,x,y,dir=1)=>({
    id:uid(),name,species,px:x+.5,py:y+.5,targetX:x,targetY:y,dir,moveTimer:0,
    hunger:88,happiness:91,hygiene:88,grooming:86,health:100,sick:false,illnessDays:0,ageDays:420,juvenile:false,sex:Math.random()<.5?'female':'male',penId:0,issues:[],animOffset:Math.random()*10
  });
  state.animals.push(animal('zebra','Mara',12,10,-1),animal('zebra','Kito',14,8,1),animal('giraffe','Tamu',11,8,1));
  state.animals.push(animal('riverOtter','Ripple',23,9,-1),animal('riverOtter','Brook',25,11,1),animal('flamingo','Coral',21,12,1));
  state.animals[0].sick=true; state.animals[0].illnessDays=1; state.animals[0].health=72; state.animals[0].hygiene=54;
  state.animals[4].ageDays=48; state.animals[4].juvenile=true;

  structureDirty=true; PocketZoo.diagnostics.recalculate();
  for(const a of state.animals){const p=penAt(Math.floor(a.px),Math.floor(a.py));a.penId=p?.id??0;}

  state.staff.push(
    {id:uid(),role:'keeper',name:'Sam',x:7.5,y:16.5,path:[],status:'Inspecting habitats',task:null,workTimer:0,cooldown:0,speed:1.05,tourStops:[],group:0},
    {id:uid(),role:'janitor',name:'Lee',x:11.5,y:18.5,path:[],status:'Patrolling paths',task:null,workTimer:0,cooldown:0,speed:1.35,tourStops:[],group:0},
    {id:uid(),role:'guide',name:'Amelia',x:15.5,y:18.5,path:[],status:'Leading a tour',task:{type:'tour'},workTimer:0,cooldown:0,speed:.95,tourStops:[],group:6}
  );
  const guestColors=['#d96262','#4e82bf','#d99545','#7b5bb5','#49a56f','#c45e9a'];
  for(let i=0;i<24;i++) state.visitors.push({id:uid(),x:1.5+(i%14)*1.35,y:18.5-(i%3)*.08,path:[],age:10,maxAge:80,speed:.8,satisfaction:86,hunger:70,thirst:70,toilet:70,energy:70,fun:75,education:12,color:guestColors[i%guestColors.length],litterCooldown:30,lastGoal:''});
  state.litter=[{x:17,y:18,amount:1}];
  state.animalWaste=[{id:uid(),x:12,y:10,amount:1,penId:0,animalId:state.animals[0].id},{id:uid(),x:14,y:8,amount:1,penId:0,animalId:state.animals[1].id}];
  pushZooEvent('animal','Animal illness','Mara the zebra became ill. Keeper Sam is responding.',{priority:'high',key:'visual-ill'});
  pushZooEvent('guest','Guests praise cleanliness','Visitors are impressed by the clean paths and habitats.',{key:'visual-clean'});
  pushZooEvent('finance','February report','The zoo ended February with a $820 operating surplus.',{key:'visual-finance'});
  structureDirty=true; PocketZoo.diagnostics.recalculate(); updateUI(); applyZoom(); draw();
  document.querySelector('#welcome').classList.add('hidden');
  return true;
}'''

with sync_playwright() as p:
    opts={'headless':True,'args':['--no-sandbox']}
    if Path('/usr/bin/chromium').exists(): opts['executable_path']='/usr/bin/chromium'
    browser=p.chromium.launch(**opts)
    page=browser.new_page(viewport={'width':1920,'height':1080}, device_scale_factor=1)
    page.set_content(html, wait_until='domcontentloaded')
    page.add_style_tag(content=(root/'styles/base.css').read_text()+(root/'styles/responsive.css').read_text())
    for script in scripts: page.add_script_tag(path=str(root/script))
    page.wait_for_timeout(250)
    page.evaluate(scenario)
    page.evaluate('zoom=.62; applyZoom(); centerOnWorld(14.5,11.5,true);')
    page.wait_for_timeout(300)

    direction_files=[]
    for rotation in range(4):
        page.evaluate(f'PocketZoo.state.camera.rotation={rotation};updateCameraUI();draw();centerOnWorld(14.5,11.5,true);')
        page.wait_for_timeout(180)
        out=root/'tests'/f'camera-direction-{rotation+1}.png'
        page.locator('#canvasArea').screenshot(path=str(out))
        direction_files.append(out)
        if rotation==0:
            page.screenshot(path=str(root/'tests/world-2_5d-screenshot.png'),full_page=True)
    page.evaluate("openPanel('events'); renderZooEvents();")
    page.wait_for_timeout(150)
    page.screenshot(path=str(root/'tests/living-zoo-events.png'),full_page=True)
    page.evaluate("state.inspection={type:'animal',id:state.animals[0].id};openPanel('inspector');updateUI();")
    page.wait_for_timeout(150)
    page.screenshot(path=str(root/'tests/living-zoo-inspector.png'),full_page=True)
    browser.close()

images=[Image.open(p).convert('RGB') for p in direction_files]
thumb_w=900
thumbs=[]
for im in images:
    ratio=thumb_w/im.width
    thumbs.append(im.resize((thumb_w,int(im.height*ratio))))
cell_h=max(i.height for i in thumbs)
canvas=Image.new('RGB',(thumb_w*2,cell_h*2),(236,242,235))
draw=ImageDraw.Draw(canvas)
labels=['North-east','South-east','South-west','North-west']
for idx,im in enumerate(thumbs):
    x=(idx%2)*thumb_w; y=(idx//2)*cell_h
    canvas.paste(im,(x,y))
    draw.rounded_rectangle((x+14,y+14,x+142,y+46),radius=9,fill=(28,78,58))
    draw.text((x+26,y+23),labels[idx],fill='white')
canvas.save(root/'tests/camera-directions.png',quality=92)
print('Created visual QA screenshots.')
