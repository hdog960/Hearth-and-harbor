/* Hearth & Harbor — Little Atelier v2.5.13
   A complete 2.5D canvas rendering reset. Original pixel artwork, zero 3D dependencies. */
(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d',{alpha:false});
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),rand=(a,b)=>a+Math.random()*(b-a);
const hash=(n)=>{const x=Math.sin(n*127.1+8.45)*43758.5453;return x-Math.floor(x)};
const SAVE='hearth-harbor-save-v1';
const DEF=()=>({atelierStorage:{},functionalHomes:{focus:{},daily:{},uses:{},unlocks:{}},homeAspirations:{people:{},memories:[]},neighborScenes:{completed:{},history:[]},villageLife:{days:{},records:[]},festivalMarket:{crafts:{},supper:{},tastes:{}},stewardship:{phases:{},visits:{}},community:{moments:{},portraits:[]},festivals:{played:{},memories:[]},grove:{},nature:{found:{},donated:[],collectedDay:0,collectedSites:[],exhibitRewards:[],museumTourDay:0,fishing:{},bugHunt:{counts:{},best:{},total:0}},promiseDays:{},weddingPlans:{},socialPostcard:null,townHearts:{},coupleMoments:[],coupleBouquets:{},couplePlans:{},coupleDinners:{},heartStories:{},romance:{},householdAuto:{},residentHabits:{},autoBondDay:{},cooking:defaultCooking(),residenceThemes:{},residenceProps:{},residenceDaily:{},residenceDecor:{},residenceVisits:{},residentHomes:{},householdFunds:{},housingDay:0,householdMoves:[],friendVisits:{},visitSeen:[],visitCounts:{},invitedVisits:{},townTensions:{},mediationDaily:{},residentLife:{},lifeMoments:[],neighborMilestones:[],socialDaily:{},townBonds:{},townStories:[],storySeen:[],name:'Poppy',hair:0x5d4037,hairStyle:1,outfit:0xe3a0a8,skin:0xf4c5aa,coins:250,hearts:0,day:1,minute:8*60,season:0,needs:{hunger:88,fun:89,social:83,energy:100},relations:{},met:[],quests:{},inventory:[],placed:[],garden:[0,0,0,0],gardenBoost:[false,false,false,false],fish:[],homeStyle:0,sound:false,seenWelcome:false});
// v2.5: original seasonal field-guide discoveries. Four year-round + three per season.
const NATURE_SPECIES=[
 {id:'clover',name:'Lucky Clover',season:-1,kind:'leaf',hue:'#61ba77',desc:'A little patch of green luck by the footpaths.'},
 {id:'pebble',name:'Moonstone Pebble',season:-1,kind:'stone',hue:'#a4c3d7',desc:'A smooth stone that glimmers after rain.'},
 {id:'shell',name:'Pearl Shell',season:-1,kind:'shell',hue:'#efc8a7',desc:'A tiny keepsake washed in from the harbor.'},
 {id:'butterfly',name:'Honeywing Butterfly',season:-1,kind:'butterfly',hue:'#efad65',desc:'Warm golden wings fluttering over the flowers.'},
 {id:'primrose',name:'Pink Primrose',season:0,kind:'flower',hue:'#f18ab2',desc:'The first blush of spring in Maplewood.'},
 {id:'bluebell',name:'Morning Bluebell',season:0,kind:'flower',hue:'#8ea6e8',desc:'Its blue petals bow in the morning breeze.'},
 {id:'dewbug',name:'Dewdrop Beetle',season:0,kind:'beetle',hue:'#67b8b5',desc:'A glossy little friend hiding in fresh spring grass.'},
 {id:'sunpetal',name:'Sunpetal',season:1,kind:'flower',hue:'#f3cb55',desc:'Turns its glowing face toward the long summer sun.'},
 {id:'cicada',name:'Golden Cicada',season:1,kind:'beetle',hue:'#e9b25f',desc:'The gentle hum of a sleepy summer afternoon.'},
 {id:'dragonfly',name:'Lagoon Dragonfly',season:1,kind:'butterfly',hue:'#78d8d1',desc:'A flash of turquoise beside Lily Pond.'},
 {id:'acorn',name:'Amber Acorn',season:2,kind:'acorn',hue:'#b97b50',desc:'Tucked under the trees as autumn arrives.'},
 {id:'mapleleaf',name:'Crimson Maple Leaf',season:2,kind:'leaf',hue:'#e98163',desc:'A crisp red note from the autumn branches.'},
 {id:'mushroom',name:'Velvet Mushroom',season:2,kind:'mushroom',hue:'#ce8f96',desc:'A soft mushroom wearing a rose-colored cap.'},
 {id:'snowdrop',name:'Winter Snowdrop',season:3,kind:'flower',hue:'#f1f2f5',desc:'A brave bloom peeking through winter frost.'},
 {id:'frostcrystal',name:'Frost Crystal',season:3,kind:'stone',hue:'#96cee8',desc:'A tiny sparkling piece of the cold morning.'},
 {id:'pinecone',name:'Frosted Pinecone',season:3,kind:'acorn',hue:'#977c63',desc:'A woodland treasure dusted in pale snow.'}
];
const NATURE_SPOTS=[[710,545],[946,715],[712,911],[1090,1160],[420,1165],[1170,550]];
const NATURE_SEASONS=['Spring','Summer','Autumn','Winter'];
const COOKING_RECIPE_IDS=['toast','salad','soup','pancakes','eggs','noodles','fishplate','tart','biscuits','jam','skewers','dumplings'];
const COOKING_ING_IDS=['bread','butter','berry','apple','carrot','herb','flour','milk','egg','noodle','fish','honey','onion','potato'];
function defaultCooking(){return {pantry:{bread:2,butter:1,berry:4,apple:1,carrot:1,herb:1,flour:1,milk:1,egg:2,noodle:1,fish:1,honey:1,onion:1,potato:1},dishes:[],xp:0,made:0,mastered:Object.fromEntries(COOKING_RECIPE_IDS.map(id=>[id,0])),servedDaily:{},relaxed:false}}
function cleanCookingSave(raw){
 const fresh=defaultCooking();if(!raw||typeof raw!=='object'||Array.isArray(raw))return fresh;
 const list=COOKING_ING_IDS,ids=COOKING_RECIPE_IDS;
 const cap=(v,max)=>Number.isInteger(v)?Math.max(0,Math.min(max,v)):0;
 const pantry={};for(const id of list)pantry[id]=raw.pantry?.[id]===undefined?fresh.pantry[id]:cap(raw.pantry[id],99);
 const dishes=Array.isArray(raw.dishes)?raw.dishes.filter(d=>d&&ids.includes(d.id)).slice(0,30).map(d=>({id:d.id,quality:Math.max(1,Math.min(3,cap(d.quality,3)))})):[];
 const mastered={};for(const id of ids)mastered[id]=cap(raw.mastered?.[id],999);
 const servedDaily=Object.fromEntries(Object.entries(raw.servedDaily&&typeof raw.servedDaily==='object'&&!Array.isArray(raw.servedDaily)?raw.servedDaily:{}).filter(([id])=>['mabel','rosie','oliver','jun','bea','finn'].includes(id)).map(([id,day])=>[id,cap(day,9999)]));return {pantry,dishes,mastered,servedDaily,xp:cap(raw.xp,100000),made:cap(raw.made,9999),relaxed:!!raw.relaxed};
}
function cleanSave(raw){
 const d=DEF();if(!raw||typeof raw!=='object'||Array.isArray(raw))return d;
 const number=(v,f,min,max)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,min,max):f;
 const safeColor=(v,f)=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=0xffffff?v:f;
 const obj=(v)=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
 const npcIds=new Set(NPCS.map(n=>n.id));
 // No imported save may inject HTML, NaN or enormous collections into the UI.
 const needs=obj(raw.needs),relationships=obj(raw.relations),quests=obj(raw.quests);
 const safePair=/^(mabel|rosie|oliver|jun|bea|finn)\|(mabel|rosie|oliver|jun|bea|finn)$/;
 const safeStory=/^\d{1,4}:[01]$/;
 const safeVisit=/^v:(?:[1-9]\d{0,3}):[01]$/;
 const safeDay=/^[1-9]\d{0,3}$/;
 const safeTownStory=/^(?:c:[1-9]\d{0,3}:(?:mabel|rosie|oliver|jun|bea|finn)\|(?:mabel|rosie|oliver|jun|bea|finn)|\d{1,4}:[01]|v:[1-9]\d{0,3}:[01]|m:\d{1,4}:(?:mabel|rosie|oliver|jun|bea|finn)\|(?:mabel|rosie|oliver|jun|bea|finn)|[hpdw]:[1-9]\d{0,3}:(?:mabel|rosie|oliver|jun|bea|finn)\|(?:mabel|rosie|oliver|jun|bea|finn)|r:[1-9]\d{0,3}:(?:mabel|rosie|oliver|jun|bea|finn)\|(?:mabel|rosie|oliver|jun|bea|finn))$/;
 const safeCouple=/^c:([1-9]\d{0,3}):((?:mabel|rosie|oliver|jun|bea|finn)\|(?:mabel|rosie|oliver|jun|bea|finn))$/;
 const lifeRecord=obj(raw.residentLife);
 const savedHomes=Object.fromEntries([...npcIds].map((id,i)=>{
  const v=obj(raw.residentHomes)[id];return [id,typeof v==='string'&&/^h[0-5]$/.test(v)?v:`h${i}`];
 }));
 // Keep at most two residents per address, repairing malformed / imported household data.
 const occupancy={};for(const id of npcIds){const h=savedHomes[id];occupancy[h]=(occupancy[h]||0)+1;if(occupancy[h]>2){const fallback=[0,1,2,3,4,5].map(n=>`h${n}`).find(k=>(occupancy[k]||0)<2);occupancy[h]--;savedHomes[id]=fallback;occupancy[fallback]=(occupancy[fallback]||0)+1}}
 const savedFunds=Object.fromEntries(Array.from({length:6},(_,i)=>[`h${i}`,number(obj(raw.householdFunds)[`h${i}`],80+i*11,0,100000)|0]));
 const houseMoves=Array.isArray(raw.householdMoves)?raw.householdMoves.filter(x=>x&&typeof x==='object'&&npcIds.has(x.who)&&npcIds.has(x.with)&&x.who!==x.with&&/^h[0-5]$/.test(x.home)).slice(-24).map(x=>({who:x.who,with:x.with,home:x.home,day:number(x.day,1,1,9999)|0})):[];
 const savedLife=Object.fromEntries([...npcIds].map(id=>{
  const row=obj(lifeRecord[id]),ns=obj(row.needs);
  return [id,{needs:{food:number(ns.food,80,0,100),energy:number(ns.energy,85,0,100),social:number(ns.social,70,0,100),fun:number(ns.fun,80,0,100)},helpDay:number(row.helpDay,0,0,9999)|0,helpCount:number(row.helpCount,0,0,3)|0,mode:['','eat','rest','social'].includes(row.mode)?row.mode:''}];
 }));
 const moments=Array.isArray(raw.lifeMoments)?raw.lifeMoments.filter(x=>x&&typeof x==='object'&&npcIds.has(x.id)&&typeof x.title==='string'&&typeof x.text==='string').slice(-24).map(x=>({id:x.id,day:number(x.day,1,1,9999)|0,title:x.title.slice(0,80),text:x.text.slice(0,240)})):[];
 const validPair=p=>Array.isArray(p)&&p.length===2&&p.every(id=>npcIds.has(id))&&p[0]!==p[1];
 const friendVisits=Object.fromEntries(Object.entries(obj(raw.friendVisits)).filter(([key,r])=>/^([1-9]\d{0,3}):[01]$/.test(key)&&validPair(r?.pair)&&Number.isInteger(r.place)&&r.place>=0&&r.place<=3).slice(-32).map(([key,r])=>[key,{pair:r.pair.slice(),place:r.place}]));
 const invitedVisits=Object.fromEntries(Object.entries(obj(raw.invitedVisits)).filter(([day,p])=>safeDay.test(day)&&validPair(p)).slice(-8).map(([day,p])=>[day,p.slice()]));
 const visitCounts=Object.fromEntries(Object.entries(obj(raw.visitCounts)).filter(([key])=>safePair.test(key)&&key.split('|')[0]!==key.split('|')[1]).slice(0,15).map(([key,v])=>[key,number(v,0,0,999)|0]));
 const residenceDecor=Object.fromEntries(Array.from({length:6},(_,i)=>[`h${i}`,number(obj(raw.residenceDecor)[`h${i}`],0,0,3)|0]));
 const residenceVisits=Object.fromEntries(Array.from({length:6},(_,i)=>[`h${i}`,number(obj(raw.residenceVisits)[`h${i}`],0,0,9999)|0]));
 const residenceThemes=Object.fromEntries(Array.from({length:6},(_,i)=>[`h${i}`,number(obj(raw.residenceThemes)[`h${i}`],i,0,5)|0]));
 const allowedProps=['plant','flowers','books','lamp','rug','chair'];
 const residenceProps=Object.fromEntries(Array.from({length:6},(_,i)=>{
  const h=`h${i}`,rows=Array.isArray(obj(raw.residenceProps)[h])?raw.residenceProps[h]:[];
  const legacySpots=[[474,460],[677,900],[909,701]];
  return [h,rows.filter(v=>allowedProps.includes(typeof v==='string'?v:v?.kind)).slice(0,8).map((v,j)=>{
   const old=typeof v==='string',kind=old?v:v.kind,spot=legacySpots[j%3];
   return {kind,x:number(old?undefined:v.x,spot[0],265,945),y:number(old?undefined:v.y,spot[1],300,1020),rot:number(old?0:v.rot,0,0,3)|0};
  })];
 }));
 const residenceDaily=Object.fromEntries(Object.entries(obj(raw.residenceDaily)).filter(([k])=>(npcIds.has(k)||k==='player')).map(([k,v])=>[k,{day:number(obj(v).day,0,0,9999)|0,done:Array.isArray(obj(v).done)?[...new Set(v.done.filter(a=>['rest','read','tidy','meal','chat','hobby'].includes(a)))].slice(0,5):[]}]));

 const householdAuto=Object.fromEntries([...npcIds].map(id=>[id,obj(raw.householdAuto)[id]!==false]));
 // Save only validated counts/days; no imported HTML or arbitrary trait injection.
 const residentHabits=Object.fromEntries([...npcIds].map(id=>{const h=obj(obj(raw.residentHabits)[id]);return [id,{sessions:number(h.sessions,0,0,999)|0,lastDay:number(h.lastDay,0,0,9999)|0}]}));
 const autoBondDay=Object.fromEntries(Object.entries(obj(raw.autoBondDay)).filter(([key])=>safePair.test(key)).slice(0,15).map(([key,day])=>[key,number(day,0,0,9999)|0]));
 const romance=Object.fromEntries([...npcIds].map(id=>{
  const item=obj(obj(raw.romance)[id]);
  return [id,{insights:number(item.insights,0,0,3)|0,chemistry:number(item.chemistry,0,0,100)|0,dates:number(item.dates,0,0,30)|0,stage:['friend','dating','partner'].includes(item.stage)?item.stage:'friend',discoveryDay:number(item.discoveryDay,0,0,9999)|0,sparkDay:number(item.sparkDay,0,0,9999)|0,dateDay:number(item.dateDay,0,0,9999)|0,partnerDay:number(item.partnerDay,0,0,9999)|0,lastMoment:['listen','laugh','surprise'].includes(item.lastMoment)?item.lastMoment:'',lastPlace:['garden','cafe','pond'].includes(item.lastPlace)?item.lastPlace:'',lastQuality:number(item.lastQuality,0,0,3)|0,lastDay:number(item.lastDay,0,0,9999)|0}];
 }));
 // Only known residents, locations and safe statuses can be restored from an imported postcard.
 const pc=obj(raw.socialPostcard),postcard=(npcIds.has(pc.from)&&['garden','cafe','pond'].includes(pc.place)&&['pending','accepted','done','declined'].includes(pc.status)&&['friend','romance'].includes(pc.kind))?
  {day:number(pc.day,0,0,9999)|0,from:pc.from,place:pc.place,kind:pc.kind,status:pc.status}:null;
 const weddingPlans=Object.fromEntries(Object.entries(obj(raw.weddingPlans)).filter(([key,w])=>safePair.test(key)&&key.split('|')[0]!==key.split('|')[1]&&['engaged','scheduled','married'].includes(w?.status)&&['garden','cafe','pond'].includes(w?.venue)).slice(0,15).map(([key,w])=>[key,{status:w.status,proposalDay:number(w.proposalDay,0,0,9999)|0,day:number(w.day,0,0,9999)|0,venue:w.venue,vow:['kind','joy','dream'].includes(w.vow)?w.vow:'',marriedDay:number(w.marriedDay,0,0,9999)|0}]));
 const promiseDays=Object.fromEntries(Object.entries(obj(raw.promiseDays)).filter(([key,row])=>safePair.test(key)&&key.split('|')[0]!==key.split('|')[1]&&['scheduled','complete'].includes(row?.status)&&['garden','cafe','pond'].includes(row?.place)).slice(0,15).map(([key,row])=>[key,{status:row.status,day:number(row.day,0,0,9999)|0,place:row.place,lastDay:number(row.lastDay,0,0,9999)|0,count:number(row.count,0,0,999)|0,lastChoice:['note','flowers','feast'].includes(row.lastChoice)?row.lastChoice:''}]));
 const nr=obj(raw.nature),nature={
  found:Object.fromEntries(Object.entries(obj(nr.found)).filter(([k])=>NATURE_SPECIES.some(n=>n.id===k)).map(([k,v])=>[k,number(v,0,0,99)|0])),
  donated:[...new Set((Array.isArray(nr.donated)?nr.donated:[]).filter(k=>NATURE_SPECIES.some(n=>n.id===k)))].slice(0,16),
  collectedDay:number(nr.collectedDay,0,0,9999)|0,
  collectedSites:[...new Set((Array.isArray(nr.collectedSites)?nr.collectedSites:[]).filter(x=>Number.isInteger(x)&&x>=0&&x<6))].slice(0,6),
  exhibitRewards:[...new Set((Array.isArray(nr.exhibitRewards)?nr.exhibitRewards:[]).filter(x=>[4,8,12,16].includes(x)))].slice(0,4),
  museumTourDay:number(nr.museumTourDay,0,0,9999)|0,
  bugHunt:window.HearthBugHunt.safeRecord(nr.bugHunt),
  fishing:window.HearthFishing.safeRecord(nr.fishing)
 };
 const res={...d,nature,grove:window.HearthGrove.cleanRecord(raw.grove),festivals:window.HearthFestival.clean(raw.festivals),community:window.HearthCommunity.clean(raw.community),stewardship:window.HearthStewardship.clean(raw.stewardship),festivalMarket:window.HearthFestivalMarket.clean(raw.festivalMarket),villageLife:window.HearthVillageLife.clean(raw.villageLife),neighborScenes:window.HearthNeighborScenes.clean(raw.neighborScenes),homeAspirations:window.HearthAspirations.clean(raw.homeAspirations),functionalHomes:window.HearthFunctionalHomes.clean(raw.functionalHomes),atelierStorage:window.HearthAtelier.clean(raw.atelierStorage),promiseDays,weddingPlans,socialPostcard:postcard,townHearts:HearthTownHearts.clean(raw.townHearts),
   coupleMoments:Array.isArray(raw.coupleMoments)?[...new Set(raw.coupleMoments.filter(x=>typeof x==='string'&&safeCouple.test(x)&&x.split(':')[2]?.split('|').every(id=>npcIds.has(id))))].slice(-48):[],
   coupleBouquets:Object.fromEntries(Object.entries(obj(raw.coupleBouquets)).filter(([k,v])=>safeCouple.test(k)&&k.split(':')[2]?.split('|')[0]!==k.split(':')[2]?.split('|')[1]&&Number(v)===1).slice(-20).map(([k])=>[k,1])),couplePlans:Object.fromEntries(Object.entries(obj(raw.couplePlans)).filter(([k,v])=>safePair.test(k)&&['apart','together'].includes(v?.choice)).map(([k,v])=>[k,{choice:v.choice,day:number(v.day,0,0,9999)|0,home:/^h[0-5]$/.test(v.home)?v.home:''}]).slice(0,15)),coupleDinners:Object.fromEntries(Object.entries(obj(raw.coupleDinners)).filter(([k])=>safePair.test(k)).map(([k,v])=>[k,number(v,0,0,9999)|0]).slice(0,15)),romance,householdAuto,residentHabits,autoBondDay,residenceThemes,residenceProps,residenceDaily,residenceDecor,residenceVisits,residentHomes:savedHomes,householdFunds:savedFunds,housingDay:number(raw.housingDay,number(raw.day,1,1,9999)|0,0,9999)|0,householdMoves:houseMoves,friendVisits,invitedVisits,visitCounts,visitSeen:Array.isArray(raw.visitSeen)?[...new Set(raw.visitSeen.filter(x=>typeof x==='string'&&safeVisit.test(x)))].slice(-35):[],residentLife:savedLife,lifeMoments:moments,name:typeof raw.name==='string'?raw.name.trim().slice(0,18)||d.name:d.name,
   hair:safeColor(raw.hair,d.hair),outfit:safeColor(raw.outfit,d.outfit),skin:safeColor(raw.skin,d.skin),
   hairStyle:number(raw.hairStyle,d.hairStyle,0,4)|0,coins:number(raw.coins,d.coins,0,1000000),hearts:number(raw.hearts,0,0,1000000),
   day:number(raw.day,1,1,9999)|0,minute:number(raw.minute,d.minute,0,1439.999),season:number(raw.season,0,0,3)|0,
   homeStyle:number(raw.homeStyle,0,0,3)|0,seenWelcome:!!raw.seenWelcome,
   townBonds:Object.fromEntries(Object.entries(obj(raw.townBonds)).filter(([k])=>safePair.test(k)&&k.split('|')[0]!==k.split('|')[1]).slice(0,15).map(([k,v])=>[k,number(v,0,0,100)])),
   townTensions:Object.fromEntries(Object.entries(obj(raw.townTensions)).filter(([k])=>safePair.test(k)&&k.split('|')[0]!==k.split('|')[1]).slice(0,15).map(([k,v])=>[k,number(v,0,0,100)])),
   mediationDaily:Object.fromEntries(Object.entries(obj(raw.mediationDaily)).filter(([k])=>safePair.test(k)).slice(0,15).map(([k,v])=>[k,number(v,0,0,9999)|0])),
   townStories:Array.isArray(raw.townStories)?raw.townStories.filter(x=>x&&typeof x==='object'&&safeTownStory.test(x.id)&&typeof x.title==='string'&&typeof x.text==='string').slice(-24).map(x=>({id:x.id,day:number(x.day,1,1,9999)|0,title:x.title.slice(0,75),text:x.text.slice(0,240),pair:Array.isArray(x.pair)?x.pair.filter(k=>npcIds.has(k)).slice(0,2):[],outcome:['warm','misunderstanding','reconciled','visit','milestone','household','romance'].includes(x.outcome)?x.outcome:'warm'})):[],
   storySeen:Array.isArray(raw.storySeen)?[...new Set(raw.storySeen.filter(k=>typeof k==='string'&&safeStory.test(k)))].slice(-40):[],
   neighborMilestones:Array.isArray(raw.neighborMilestones)?[...new Set(raw.neighborMilestones.filter(x=>typeof x==='string'&&/^(mabel|rosie|oliver|jun|bea|finn):(25|60|90)$/.test(x)))].slice(0,18):[],
   socialDaily:Object.fromEntries(Object.entries(obj(raw.socialDaily)).filter(([id])=>npcIds.has(id)).map(([id,record])=>{const r=obj(record);return [id,{day:number(r.day,0,0,9999)|0,chat:number(r.chat,0,0,2)|0,compliment:number(r.compliment,0,0,1)|0,gift:number(r.gift,0,0,1)|0,join:number(r.join,0,0,1)|0}]})),
   needs:Object.fromEntries(Object.entries(d.needs).map(([k,v])=>[k,number(needs[k],v,0,100)])),
   relations:Object.fromEntries(Object.entries(relationships).filter(([k])=>npcIds.has(k)).map(([k,v])=>[k,number(v,0,0,100)])),
   quests:Object.fromEntries(Object.entries(quests).filter(([k])=>/^(meet|chat|fish|garden|work)(_claimed)?$/.test(k)).map(([k,v])=>[k,k.endsWith('_claimed')?!!v:number(v,0,0,100000)])),
   met:Array.isArray(raw.met)?raw.met.filter(x=>npcIds.has(x)).slice(0,6):[],
   garden:Array.from({length:4},(_,i)=>number(Array.isArray(raw.garden)?raw.garden[i]:null,0,0,2)|0),
   gardenBoost:Array.from({length:4},(_,i)=>!!(Array.isArray(raw.gardenBoost)&&raw.gardenBoost[i])),
   inventory:Array.isArray(raw.inventory)?raw.inventory.filter(x=>x==='flower-seed').slice(0,100):[],
   fish:Array.isArray(raw.fish)?raw.fish.filter(x=>typeof x==='string').slice(0,1000):[],
   placed:Array.isArray(raw.placed)?raw.placed.filter(f=>f&&furnitureTypes.some(t=>t.id===f.kind)).slice(0,80).map(f=>({kind:f.kind,x:number(f.x,550,220,940),z:number(f.z,610,300,1030),rot:number(f.rot,0,0,3)|0})):[]};
 res.cooking=cleanCookingSave(raw.cooking);
 return res;
}
let state=DEF();

const NPCS=[
 {id:'mabel',name:'Mabel',job:'Florist',trait:'Creative · Loves flowers',skin:'#c48b67',hair:'#523b31',outfit:'#f08fbd',kind:'dress',style:0,emoji:'🌸',x:720,y:594,lines:['I was just admiring the daisies. They seem extra happy today!','Do you think flowers have favorite neighbors? I think they do.','A pink blossom is like a tiny hello from spring.']},
 {id:'rosie',name:'Rosie',job:'Market owner',trait:'Cheerful · Ambitious',skin:'#e7ae85',hair:'#9b5143',outfit:'#e786a1',kind:'overalls',style:3,emoji:'🍓',x:396,y:757,lines:['Fresh peaches, just for you! Well, if you have a few coins.','I want this market to be the heart of the whole village.','I heard someone is planning a picnic by the river!']},
 {id:'oliver',name:'Oliver',job:'Baker',trait:'Warmhearted · Foodie',skin:'#f8caa0',hair:'#674332',outfit:'#82a1d6',kind:'apron',style:2,emoji:'🥐',x:948,y:525,lines:['The cinnamon buns are rising beautifully today.','I think a warm pastry can fix almost any rainy afternoon.','Maybe I should open a little strawberry tart stand.']},
 {id:'jun',name:'Jun',job:'Bookshop keeper',trait:'Shy · Bookworm',skin:'#f3d2ae',hair:'#353441',outfit:'#8bb59c',kind:'sweater',style:1,emoji:'📚',x:423,y:935,lines:['This is the quietest little corner of town. I love it.','Would you like to borrow my favorite storybook?','Sometimes I write poems about the ocean.']},
 {id:'bea',name:'Bea',job:'Artist',trait:'Outgoing · Dreamer',skin:'#986448',hair:'#39313a',outfit:'#f2bc56',kind:'dress',style:4,emoji:'🎨',x:794,y:803,lines:['I am painting the sunset in every shade of peach.','I wish the clouds would pose for my paintings.','Your outfit is giving me so many ideas!']},
 {id:'finn',name:'Finn',job:'Fisher',trait:'Relaxed · Outdoorsy',skin:'#eac5a2',hair:'#ad7b50',outfit:'#70b6be',kind:'overalls',style:2,emoji:'🐟',x:1035,y:1095,lines:['Fish always bite when you least expect it.','Come down to the pond sometime. The water sparkles at noon.','No need to rush. The whole day is yours.']}
];
const HEX=n=>'#'+((n>>>0)&0xffffff).toString(16).padStart(6,'0');
const color=n=>typeof n==='number'?HEX(n):n;
const playerDef=()=>scene==='residence'&&controlledResident?NPCS.find(n=>n.id===controlledResident)||selfPortrait():selfPortrait();
const selfPortrait=()=>({id:'player',name:state.name,skin:color(state.skin),hair:color(state.hair),outfit:color(state.outfit),kind:'dress',style:state.hairStyle??1});
let scene='town',activeResidence=null,controlledResident=null,householdQueue=[],householdBusy=false,householdCurrent=null,previousTownSpot=null,speed=1,modal=null,talk=null,placement=null,toastTimer=0,uiTimer=0;
const roomAutonomy=new Map();
let householdHold=null; // Temporary in-world activity; never serialized
let dateMoment=null; // In-world meetups; no time or rewards granted until both arrive
let player={x:597,y:654,target:null,facing:'front',walk:0,bodyBob:0},cam={x:597,y:654},W=0,H=0,DPR=1,last=0,tick=0;
let displayScale=1;let worldScale=1;
const furnitureTypes=[{id:'bed',name:'Cloud-soft bed',emoji:'🛏️',cost:95},{id:'sofa',name:'Peach sofa',emoji:'🛋️',cost:75},{id:'plant',name:'Fern in pot',emoji:'🪴',cost:25},{id:'books',name:'Storybook shelf',emoji:'📚',cost:70},{id:'lamp',name:'Honey lamp',emoji:'💡',cost:40},{id:'rug',name:'Patchwork rug',emoji:'🧶',cost:35},{id:'chair',name:'Wooden chair',emoji:'🪑',cost:30},{id:'flowers',name:'Flower vase',emoji:'💐',cost:20}];
try{state=cleanSave(JSON.parse(localStorage.getItem(SAVE)||'{}')||{})}catch(e){state=DEF()}

function save(){try{localStorage.setItem(SAVE,JSON.stringify(state))}catch(e){}};
function notify(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2900)}
function drawBar(id,v){$(id).style.width=clamp(v,0,100)+'%';$(id).style.background=v<25?'#ef7e79':v<50?'#e7ba65':'#67bd88'}
function updateUI(){const seasons=['SPRING','SUMMER','AUTUMN','WINTER'],h=Math.floor((state.minute%1440)/60),m=Math.floor(state.minute%60);$('dateText').textContent=`${seasons[state.season%4]} · DAY ${state.day} · ${((h+11)%12+1)}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;$('coinText').textContent=Math.floor(state.coins);$('heartText').textContent=state.hearts;const selected=scene==='residence'&&controlledResident?NPCS.find(n=>n.id===controlledResident):null,curNeeds=selected?lifeFor(selected.id).needs:null;$('playerName').textContent=selected?selected.name+' ✦':state.name;drawBar('needFood',curNeeds?curNeeds.food:state.needs.hunger);drawBar('needFun',curNeeds?curNeeds.fun:state.needs.fun);drawBar('needSocial',curNeeds?curNeeds.social:state.needs.social);drawBar('needEnergy',curNeeds?curNeeds.energy:state.needs.energy);$('locationText').textContent=scene==='grove'?'✦ CLOVERBANK GROVE ✦':scene==='museum'?'✦ THE LITTLE MUSEUM ✦':scene==='town'?'✦ MAPLEWOOD VILLAGE ✦':scene==='residence'?`✦ ${apartmentName(activeResidence).toUpperCase()} ✦`:'✦ YOUR LITTLE COTTAGE ✦';$('prompt').textContent=scene==='grove'?'FOLLOW THE TRAIL · VISIT THE THREE CLEARINGS':scene==='museum'?'TAP AN EXHIBIT · FOLLOW THE GOLDEN WALKWAY':scene==='town'?(festival.active(state.day)?'🎊 FESTIVAL DAYS · TAP THE PLAZA BOARD':'TAP TO WALK · TAP A NEIGHBOR TO CHAT'):scene==='residence'?'TAP FURNITURE · MENU → HOUSEHOLD DAYBOOK':'TAP THE KITCHEN TO COOK · TAP FURNITURE TO USE';$('townBtn').classList.toggle('active',scene==='town');$('homeBtn').classList.toggle('active',scene==='home');$('timeBtn').textContent=speed===0?'Ⅱ':speed===1?'▶':speed===2?'▶▶':'▶▶▶'}
function changeNeed(id,v){const rs=scene==='residence'&&controlledResident?lifeFor(controlledResident).needs:null;const key=rs&&id==='hunger'?'food':id;const needs=rs||state.needs;needs[key]=clamp(needs[key]+v,0,100);updateUI();save()}
function coins(v){state.coins=Math.max(0,state.coins+v);updateUI();save()}
function task(id){state.quests[id]=(state.quests[id]||0)+1;save()}
const personalityTalk={
 mabel:{compliments:['You noticed my flowers? That makes me so happy!','I pressed your compliment into my memory like a flower.'],gift:['I will put this somewhere sunny!','Oh! A new treasure for my greenhouse!']},
 rosie:{compliments:['Stop, you are making me grin like a peach!','Kind words are the best things in my market.'],gift:['For me? I should give you a loyalty card!','This deserves a special spot by my counter.']},
 oliver:{compliments:['I am blushing like a freshly baked bun!','You are sweeter than the icing!'],gift:['Thank you! You have made my entire morning.','I will save this for after the café rush.']},
 jun:{compliments:['Oh... I might write a poem about that.','You are very kind. I never know what to say.'],gift:['This is so thoughtful. I will cherish it.','I am going to keep this next to my favorite books.']},
 bea:{compliments:['You just brightened my whole color palette!','Can I paint that compliment? It was beautiful.'],gift:['This sparks so many ideas!','I love gifts with a little story behind them.']},
 finn:{compliments:['That is mighty nice of you.','Aw, you are good company.'],gift:['I will treasure it on my next fishing trip.','That is even better than a lucky catch!']}
};
// An inhabitant has a real daily destination and purpose, not a random little orbit.
// Routine destinations are public, walkable parts of the existing town.
const VILLAGER_ROUTINES={
 mabel:[{h:0,where:[790,505],doing:'resting at her cottage',icon:'🏡',mood:'sleepy'},
        {h:7,where:[806,488],doing:'tending the flower garden',icon:'🌷',mood:'inspired'},
        {h:12,where:[680,744],doing:'gathering flowers for the market',icon:'🌼',mood:'happy'},
        {h:17,where:[755,885],doing:'admiring the village blooms',icon:'🌸',mood:'peaceful'},
        {h:21,where:[790,505],doing:'heading home to rest',icon:'🏡',mood:'sleepy'}],
 rosie:[{h:0,where:[444,817],doing:'resting after market day',icon:'🌙',mood:'sleepy'},
        {h:7,where:[579,788],doing:'setting up her fruit stall',icon:'🍓',mood:'busy'},
        {h:11,where:[585,808],doing:'running her market stall',icon:'🍑',mood:'cheerful'},
        {h:17,where:[742,722],doing:'visiting her neighbors',icon:'💬',mood:'cheerful'},
        {h:21,where:[444,817],doing:'counting the day’s earnings',icon:'🌙',mood:'sleepy'}],
 oliver:[{h:0,where:[1070,541],doing:'sleeping after a long bake',icon:'🌙',mood:'sleepy'},
         {h:6,where:[1038,552],doing:'baking the morning bread',icon:'🥐',mood:'busy'},
         {h:12,where:[842,694],doing:'delivering fresh pastries',icon:'🥨',mood:'cheerful'},
         {h:16,where:[1067,548],doing:'preparing tomorrow’s dough',icon:'🍞',mood:'focused'},
         {h:21,where:[1070,541],doing:'closing the café',icon:'🌙',mood:'sleepy'}],
 jun:[{h:0,where:[485,1125],doing:'reading by lamplight',icon:'📚',mood:'sleepy'},
      {h:8,where:[515,1106],doing:'opening the bookshop',icon:'📖',mood:'focused'},
      {h:13,where:[741,826],doing:'reading outdoors',icon:'📘',mood:'peaceful'},
      {h:17,where:[509,1109],doing:'putting the books away',icon:'📚',mood:'focused'},
      {h:21,where:[485,1125],doing:'settling in with a novel',icon:'🌙',mood:'sleepy'}],
 bea:[{h:0,where:[1136,895],doing:'dreaming up new paintings',icon:'🌙',mood:'sleepy'},
      {h:8,where:[1135,870],doing:'sketching under the trees',icon:'🎨',mood:'inspired'},
      {h:12,where:[850,1054],doing:'painting the lily pond',icon:'🖌️',mood:'inspired'},
      {h:17,where:[740,775],doing:'showing off her new artwork',icon:'🖼️',mood:'cheerful'},
      {h:21,where:[1136,895],doing:'tidying her paints',icon:'🌙',mood:'sleepy'}],
 finn:[{h:0,where:[1106,1296],doing:'resting by the pond',icon:'🌙',mood:'sleepy'},
       {h:6,where:[1102,1317],doing:'watching the morning fish',icon:'🐟',mood:'peaceful'},
       {h:11,where:[898,1362],doing:'fishing at Lily Pond',icon:'🎣',mood:'focused'},
       {h:16,where:[1048,788],doing:'taking an afternoon stroll',icon:'☀️',mood:'happy'},
       {h:21,where:[1106,1296],doing:'watching the stars',icon:'⭐',mood:'peaceful'}]
};
// The Sims half: each neighbor has a separate small household simulation.
// Needs are persisted; *in-game* minutes move them, not time spent away from the app.
const RESIDENT_GOALS={
 mabel:{title:'A garden for everyone',task:'Help Mabel prepare a new community flower bed',line:'The flowers are thriving! Soon everyone will have a little patch of sunshine.',finish:'Mabel opens a flower corner for the whole neighborhood.'},
 rosie:{title:'The friendliest market',task:'Help Rosie set up an inviting fruit display',line:'Every peach looks perfect! The market feels more welcoming already.',finish:'Rosie organizes a cheerful little market celebration.'},
 oliver:{title:'A signature village pastry',task:'Help Oliver perfect his strawberry breakfast buns',line:'The next batch smells incredible! We might be onto something.',finish:'Oliver adds his new signature bun to the café menu.'},
 jun:{title:'A story worth sharing',task:'Help Jun collect ideas for a tiny illustrated book',line:'That detail belongs in chapter two. I can almost see the ending!',finish:'Jun finishes a story inspired by his neighbors.'},
 bea:{title:'A community art show',task:'Help Bea prepare paintings for a neighborhood exhibit',line:'Our colors go together beautifully. This will look wonderful!',finish:'Bea holds a small art show for her friends.'},
 finn:{title:'The pond nature guide',task:'Help Finn record the fish and wildlife around Lily Pond',line:'Another little discovery! Our pond guide is coming along.',finish:'Finn completes a handmade guide to the pond.'}
};
const lifeFor=id=>state.residentLife[id]||(state.residentLife[id]={needs:{food:80,energy:85,social:70,fun:80},helpDay:0,helpCount:0,mode:''});
function personalMood(n){
 const a=lifeFor(n.id).needs;
 if(a.energy<27)return {name:'Exhausted',icon:'💤',note:'I can barely keep my eyes open. I need to rest.'};
 if(a.food<26)return {name:'Hungry',icon:'🍞',note:'My stomach is rumbling. Something delicious would help.'};
 if(a.social<24)return {name:'Lonely',icon:'💌',note:'I would really love a little company today.'};
 if(a.fun<25)return {name:'Restless',icon:'☁️',note:'Everything feels repetitive. I want to do something fun.'};
 const strained=strainedNeighbor(n.id);
 if(strained&&strained.tension>=15)return {name:'Uneasy',icon:'🌧️',note:`I had a misunderstanding with ${strained.name}. I hope we can talk it through soon.`};
 const mood=currentRoutine(n).mood||'content';
 const icons={happy:'😊',cheerful:'🌞',inspired:'✨',focused:'🎯',peaceful:'🌷',busy:'💼',sleepy:'🌙'};
 return {name:mood.charAt(0).toUpperCase()+mood.slice(1),icon:icons[mood]||'😊',note:''};
}
function updateResidentNeeds(minutes){
 if(minutes<=0)return;
 for(const n of NPCS){
  const life=lifeFor(n.id),a=life.needs,k=activityType(n),need=(id,delta)=>a[id]=clamp(a[id]+delta*minutes,0,100);
  need('food',-.028);need('energy',-.020);need('social',-.021);need('fun',-.018);
  if(k==='rest'){need('energy',.21);need('food',.024)}
  if(k==='eat'){need('food',.24);need('energy',.018)}
  if(k==='social'||k==='meet'){need('social',.13);need('fun',.044)}
  if(k==='read'||k==='paint'||k==='fish'||k==='water'){need('fun',.088)}
  if(k==='market'||k==='bake'){need('social',.025);need('fun',.033)}
  // A self-care decision persists until the problem is actually resolved.
  if(life.mode==='rest'&&a.energy>76)life.mode='';
  else if(life.mode==='eat'&&a.food>76)life.mode='';
  else if(life.mode==='social'&&a.social>69)life.mode='';
  if(!life.mode){if(a.energy<22)life.mode='rest';else if(a.food<23)life.mode='eat';else if(a.social<19)life.mode='social'}
 }
}
function aspirationProgress(n){return lifeFor(n.id).helpCount}
function helpNeighbor(n){
 const life=lifeFor(n.id),goal=RESIDENT_GOALS[n.id],s=$('talkText');
 if(life.helpCount>=3){s.textContent=`${n.name}: “You helped make my dream come true. ${goal.finish}”`;$('emote').textContent='🏅';return}
 if(life.helpDay===state.day){s.textContent='We made lovely progress today. I will have another part ready tomorrow!';$('emote').textContent='🌼';return}
 if(state.needs.energy<9){s.textContent='You look exhausted! Get some rest first. My project will still be here.';$('emote').textContent='💤';return}
 life.helpDay=state.day;life.helpCount++;changeNeed('energy',-8);changeNeed('fun',8);
 life.needs.social=clamp(life.needs.social+18,0,100);
 life.needs.fun=clamp(life.needs.fun+14,0,100);
 const old=state.relations[n.id]||0;
 state.relations[n.id]=Math.min(100,old+8);state.hearts+=8;
 checkFriendshipMoment(n,old,state.relations[n.id]);
 $('talkRole').textContent=`${n.job} · ${friendshipRank(state.relations[n.id])} · ♥ ${state.relations[n.id]}`;
 n.emotion='happy';n.emotionUntil=tick+3;
 if(life.helpCount===3){
  const title=goal.title;
  state.lifeMoments.push({id:n.id,day:state.day,title,text:goal.finish});state.lifeMoments=state.lifeMoments.slice(-24);
  coins(65);s.textContent=`${goal.finish} Thank you for making this possible! Here's 65 coins for your help.`;$('emote').textContent='🎉';notify(`${n.name} achieved a dream! Check Town Stories 🌟`);
 }else{s.textContent=`${goal.line} (${life.helpCount}/3)`;$('emote').textContent='✨'}
 updateUI();save();
}
const FRIENDSHIP_MOMENTS={
 mabel:['I saved you my favorite flower. It reminds me of you!','I made a little patch in the garden just for us.','Somehow this town feels brighter whenever you visit.'],
 rosie:['You are officially my most cheerful regular!','I set aside the best peaches for you, always.','One day we should run a stall together!'],
 oliver:['I know exactly how you like your breakfast now.','My newest pastry is named after our friendship!','The café is your home away from home.'],
 jun:['I found a book with a character just like you.','I wrote a story about the day we met.','You are my favorite chapter of Maplewood life.'],
 bea:['I made a tiny sketch of us together!','You inspired my best painting yet.','Our friendship belongs in a gallery!'],
 finn:['The fish are biting. Want to share my lucky spot?','There is no quieter place than fishing with a friend.','You make every morning by the pond worthwhile.']
};
// Short, in-world resident meetups. A schedule is deterministic for a given day
// and period: reopening the game cannot reroll a friendship story.
const COMMUNITY_EVENTS=[
 {pair:['rosie','oliver'],title:'The secret pastry tasting',text:'Rosie helped Oliver test a peach-filled bun. The two swapped recipes and laughed about the crumbs.',doing:'sharing pastries',icon:'🥐',place:'Honeybun Café',point:[852,675]},
 {pair:['mabel','bea'],title:'A flower for a painting',text:'Mabel showed Bea a new pink bloom, and Bea promised to paint it before sunset.',doing:'sketching a flower together',icon:'🎨',place:'the garden',point:[842,570]},
 {pair:['jun','finn'],title:'Stories at Lily Pond',text:'Finn shared his favorite fishing tale while Jun found the perfect ending for a short story.',doing:'telling pond stories',icon:'📖',place:'Lily Pond',point:[860,1150]},
 {pair:['rosie','jun'],title:'A book for the market',text:'Jun lent Rosie a book of recipes, and Rosie offered to bring fresh fruit to the library.',doing:'swapping recipes',icon:'📚',place:'the market',point:[650,865]},
 {pair:['oliver','mabel'],title:'Fresh herbs and warm rolls',text:'Mabel picked fragrant herbs for Oliver, who promised to bake a special savory roll.',doing:'trading garden ideas',icon:'🌱',place:'the flower garden',point:[858,605]},
 {pair:['bea','finn'],title:'The color of the water',text:'Finn showed Bea where the pond shines in the afternoon sun. She added a new blue to her palette.',doing:'admiring the pond',icon:'🖌️',place:'Lily Pond',point:[861,1141]},
 {pair:['rosie','bea'],title:'The market window',text:'Bea designed a cheerful sign for Rosie’s stall. Rosie insisted that the whole town should see it.',doing:'planning a new market sign',icon:'🖼️',place:'the fruit market',point:[646,861]},
 {pair:['jun','mabel'],title:'Pressed flowers',text:'Jun brought Mabel an old botanical book. She tucked a flower between its pages as a thank-you.',doing:'looking through a flower book',icon:'🌸',place:'the garden',point:[856,590]},
 {pair:['oliver','finn'],title:'Breakfast for a fisherman',text:'Oliver delivered warm breakfast buns to Finn, who repaid him with a story about a giant carp.',doing:'sharing breakfast',icon:'🥨',place:'the café',point:[852,676]},
 {pair:['jun','bea'],title:'An illustrated story',text:'Jun and Bea dreamed up a tiny illustrated tale about the village’s oldest tree.',doing:'inventing a story',icon:'✨',place:'the library',point:[590,1030]},
 {pair:['mabel','rosie'],title:'The flower stall idea',text:'Mabel and Rosie planned a weekend flower stall, filling the square with colorful ideas.',doing:'planning flower arrangements',icon:'💐',place:'the market',point:[656,872]},
 {pair:['finn','rosie'],title:'A lucky catch',text:'Finn brought Rosie a lucky fishing charm. Rosie thanked him with the sweetest peach in her basket.',doing:'exchanging good-luck gifts',icon:'🐟',place:'the town square',point:[735,720]}
];
const EVENT_START=[10,16],EVENT_END=[12.75,18.75];
function communityEvent(day=state.day,minute=state.minute){
 const h=minute/60,slot=h>=EVENT_START[0]&&h<EVENT_END[0]?0:h>=EVENT_START[1]&&h<EVENT_END[1]?1:-1;
 if(slot<0)return null;
 const template=COMMUNITY_EVENTS[((day-1)*2+slot)%COMMUNITY_EVENTS.length];
 return {...template,slot,day,id:`${day}:${slot}`};
}
function pairKey(pair){return [...pair].sort().join('|')}
// Every resident brings different preferences to their relationships.  The same
// meeting can go well, reveal a small misunderstanding, or heal an old one.
// We intentionally keep friendship and tension separate: one argument should not
// erase months of companionship, and making up takes more than one good moment.
const SOCIAL_CHEMISTRY={
 'oliver|rosie':2,'bea|mabel':3,'finn|jun':-1,'jun|rosie':-2,
 'mabel|oliver':2,'bea|finn':1,'bea|rosie':1,'jun|mabel':3,
 'finn|oliver':1,'bea|jun':2,'mabel|rosie':1,'finn|rosie':-2
};
const SOCIAL_FRICTION={
 'oliver|rosie':'Rosie wanted to display the buns immediately, but Oliver wanted to finish them carefully.',
 'bea|mabel':'Bea hoped to pick the prettiest blossom to paint, while Mabel wanted to let it grow.',
 'finn|jun':'Finn interrupted the ending of Jun’s story with a joke. Jun wanted to finish reading first.',
 'jun|rosie':'Rosie preferred a lively crowd while Jun hoped for a quiet corner to read.',
 'mabel|oliver':'Oliver needed herbs for his recipe, but Mabel was saving the last bunch for seedlings.',
 'bea|finn':'Bea wanted to paint by the pond, but Finn was worried the noise would scare the fish.',
 'bea|rosie':'Rosie hoped for a bright market sign, and Bea wanted a more delicate design.',
 'jun|mabel':'Jun was worried about pressing a rare flower into a book, while Mabel wanted to preserve it.',
 'finn|oliver':'Finn was running late for breakfast, and Oliver had kept a fresh batch waiting.',
 'bea|jun':'Bea suggested changing Jun’s storybook illustrations, but Jun was attached to the originals.',
 'mabel|rosie':'Rosie wanted the flower stall nearer the busy street; Mabel preferred a quieter garden spot.',
 'finn|rosie':'Rosie wanted Finn to help stock the market, but he had already promised to check his fishing lines.'
};
function bondScore(pair){const k=pairKey(pair);return clamp((state.townBonds[k]||0)-(state.townTensions[k]||0),-100,100)}
function strainedNeighbor(id){
 const entries=Object.entries(state.townTensions).filter(([k,v])=>v>=8&&k.split('|').includes(id)).sort((a,b)=>b[1]-a[1]);
 if(!entries.length)return null;
 const [key,tension]=entries[0],otherId=key.split('|').find(x=>x!==id);
 return {id:otherId,name:NPCS.find(n=>n.id===otherId)?.name||'a neighbor',key,tension};
}
function encounterResult(ev){
 const key=pairKey(ev.pair),warmth=SOCIAL_CHEMISTRY[key]||0;
 const combined=ev.pair.reduce((sum,id)=>{const needs=lifeFor(id).needs;return sum+Math.min(needs.food,needs.energy,needs.social)},0)/3;
 // Deterministic; reloading an active encounter does not reroll the result.
 const dice=hash(ev.day*31.37+ev.slot*997+COMMUNITY_EVENTS.findIndex(e=>e.pair===ev.pair)*19.13);
 const tension=state.townTensions[key]||0;
 const friction=clamp(.17-warmth*.046+(combined<65?.16:0)+(tension>14?.12:0),.05,.52);
 if(tension>=8&&dice>.24)return 'reconciled';
 return dice<friction?'misunderstanding':'warm';
}
function latestPairStory(pair){return [...state.townStories].reverse().find(x=>pairKey(x.pair)===pairKey(pair))}
function mediateNeighbor(n){
 const issue=strainedNeighbor(n.id);
 if(!issue){$('talkText').textContent='Everyone seems to be getting along today.';return}
 if(state.mediationDaily[issue.key]===state.day){$('talkText').textContent=`You already helped ${n.name} and ${issue.name} talk things through today. A little time helps.`;return}
 if((state.relations[n.id]||0)<15){$('talkText').textContent=`${n.name} would like to know you better before sharing something so personal. Chat together first.`;return}
 if(state.needs.energy<8){$('talkText').textContent='You need a little rest before helping two neighbors through a disagreement.';return}
 state.mediationDaily[issue.key]=state.day;
 state.townTensions[issue.key]=Math.max(0,issue.tension-7);
 state.townBonds[issue.key]=clamp((state.townBonds[issue.key]||0)+2,0,100);
 changeNeed('energy',-7);changeNeed('social',8);
 for(const id of issue.key.split('|')){const needs=lifeFor(id).needs;needs.social=clamp(needs.social+7,0,100);const villager=NPCS.find(x=>x.id===id);villager.emotion='happy';villager.emotionUntil=tick+3;villager.routineKey='';}
 $('talkText').textContent=`You listened to both sides. ${n.name} and ${issue.name} feel heard, and their friendship has a chance to heal. 💛`;
 $('emote').textContent='🕊️';
 state.townStories.push({id:`m:${state.day}:${issue.key}`,day:state.day,
 title:'A little understanding',text:`You helped ${n.name} and ${issue.name} listen to each other. Their friendship is recovering.`,pair:issue.key.split('|'),outcome:'reconciled'});
 state.townStories=state.townStories.slice(-24);
 save();notify('You helped two neighbors reconnect! 🕊️');
}
function activeMeeting(n){const ev=communityEvent();if(!ev||!ev.pair.includes(n.id))return null;return ev}
function meetingPosition(ev,n){const side=ev.pair.indexOf(n.id)===0?-1:1;
 return [ev.point[0]+side*46,ev.point[1]+(side===-1?-7:8)]}
function meetingReady(ev){return ev.pair.every(id=>{const n=NPCS.find(x=>x.id===id);const [x,y]=meetingPosition(ev,n);return n&&!n.moving&&Math.hypot(n.x-x,n.y-y)<84})}
function settleCommunityEvent(){
 const ev=communityEvent();if(!ev||state.storySeen.includes(ev.id)||!meetingReady(ev))return;
 state.storySeen.push(ev.id);state.storySeen=state.storySeen.slice(-40);
 const key=pairKey(ev.pair),outcome=encounterResult(ev);
 let title=ev.title,description=ev.text;
 if(outcome==='misunderstanding'){
  state.townTensions[key]=clamp((state.townTensions[key]||0)+9,0,100);
  state.townBonds[key]=clamp((state.townBonds[key]||0)-2,0,100);
  title='A little misunderstanding';description=SOCIAL_FRICTION[key]||'Two neighbors disagreed about their plans for the day.';
 }else if(outcome==='reconciled'){
  state.townTensions[key]=Math.max(0,(state.townTensions[key]||0)-9);
  state.townBonds[key]=clamp((state.townBonds[key]||0)+4,0,100);
  title='Finding common ground';description=`${ev.pair.map(id=>NPCS.find(n=>n.id===id).name).join(' and ')} talked things through at ${ev.place}. Their friendship feels a little easier now.`;
 }else{
  state.townBonds[key]=clamp((state.townBonds[key]||0)+6,0,100);
  state.townTensions[key]=Math.max(0,(state.townTensions[key]||0)-2);
 }
 state.townStories.push({id:ev.id,day:state.day,title,text:description,pair:ev.pair,outcome});
 state.townStories=state.townStories.slice(-24);
 for(const id of ev.pair){const n=NPCS.find(x=>x.id===id);n.emotion=outcome==='misunderstanding'?'surprised':'happy';n.emotionUntil=tick+4;n.routineKey='';const a=lifeFor(id).needs;
 a.social=clamp(a.social+(outcome==='misunderstanding'?-7:16),0,100);a.fun=clamp(a.fun+(outcome==='misunderstanding'?-4:8),0,100)}
 notify(`${outcome==='misunderstanding'?'A little drama':'Village news'}: ${title} ${outcome==='misunderstanding'?'🌧️':ev.icon}`);save();
}
function latestNeighborStory(id){return [...state.townStories].reverse().find(story=>story.pair.includes(id))}
function bestNeighborFriend(id){const bonds=Object.entries(state.townBonds).filter(([k])=>k.split('|').includes(id)).sort((a,b)=>b[1]-a[1]);
 if(!bonds.length||bonds[0][1]===0)return null;
 return {name:NPCS.find(n=>n.id===bonds[0][0].split('|').find(k=>k!==id))?.name,score:bonds[0][1]};
}
// v1.7: recurring friendships that visibly influence where residents choose to go.
// Visit plans are recorded when chosen so saves/reloads never reroll a pair.
// First residential simulation: three duplex cottages, six addressable flats.
// This system deliberately does not pretend to provide editable NPC interiors yet.
const RESIDENCES=[
 {name:'Rosewood Cottages',x:1326,y:405,front:[1310,448],emoji:'🌹'},
 {name:'Willow Lane',x:1295,y:1068,front:[1310,1111],emoji:'🌿'},
 {name:'Clover Court',x:213,y:1265,front:[210,1308],emoji:'🍀'}
];
const apartmentName=home=>{const i=Number(String(home||'').slice(1));const site=RESIDENCES[Math.floor(i/2)];return site?`${site.name} · ${i%2?'B':'A'}`:'Unknown home'};
const residentHome=id=>state.residentHomes[id]||`h${NPCS.findIndex(n=>n.id===id)}`;
const householdMembers=home=>NPCS.filter(n=>residentHome(n.id)===home);
function householdFront(id){const home=residentHome(id),site=RESIDENCES[Math.floor(Number(home.slice(1))/2)]||RESIDENCES[0];
 return [site.front[0]+(Number(home.slice(1))%2?29:-28),site.front[1]+19];}
function householdState(id){const home=residentHome(id),members=householdMembers(home);return {home,members,funds:state.householdFunds[home]??0};}
const homeCandidate=(n,minimum=34,visitMin=3)=>{
 const origin=householdState(n.id);if(origin.members.length!==1)return null;
 return NPCS.filter(m=>m.id!==n.id&&householdState(m.id).members.length===1)
  .map(m=>({person:m,score:bondScore([n.id,m.id]),visits:state.visitCounts[pairKey([n.id,m.id])]||0,tension:state.townTensions[pairKey([n.id,m.id])]||0}))
  .filter(c=>c.score>=minimum&&c.visits>=visitMin&&c.tension<7)
  .sort((a,b)=>b.score-a.score)[0]||null;
};
function moveIn(who,roommate){
 const old=residentHome(who.id),dest=residentHome(roommate.id);
 if(old===dest||householdMembers(dest).length!==1||householdMembers(old).length!==1)return false;
 state.residentHomes[who.id]=dest;
 state.householdFunds[dest]=Math.min(100000,(state.householdFunds[dest]||0)+(state.householdFunds[old]||0));
 state.householdFunds[old]=0;
 state.householdMoves.push({who:who.id,with:roommate.id,home:dest,day:state.day});state.householdMoves=state.householdMoves.slice(-24);
 const story=`${who.name} moved into ${roommate.name}'s place at ${apartmentName(dest)}. The two friends are sharing household costs and making a home together.`;
 state.townStories.push({id:`h:${state.day}:${who.id}|${roommate.id}`,day:state.day,title:'A new shared home',text:story,pair:[who.id,roommate.id],outcome:'household'});
 state.townStories=state.townStories.slice(-24);who.routineKey='';roommate.routineKey='';
 lifeFor(who.id).needs.social=clamp(lifeFor(who.id).needs.social+24,0,100);
 lifeFor(roommate.id).needs.social=clamp(lifeFor(roommate.id).needs.social+24,0,100);
 save();notify(`🏡 ${who.name} and ${roommate.name} now share a home!`);return true;
}
function processHousingDay(){
 if(state.housingDay>=state.day)return;
 // Process each elapsed day once; pay residents, collect shared upkeep, and record shortfalls.
 for(let day=state.housingDay+1;day<=state.day;day++){
  if(day===1)continue;
  for(const n of NPCS){const home=residentHome(n.id);const wage={mabel:23,rosie:31,oliver:29,jun:25,bea:21,finn:23}[n.id]||20;
   state.householdFunds[home]=clamp((state.householdFunds[home]||0)+wage,0,100000)}
  const occupied=[...new Set(NPCS.map(n=>residentHome(n.id)))];
  for(const home of occupied){const residents=householdMembers(home),upkeep=12+residents.length*4;
   const enough=(state.householdFunds[home]||0)>=upkeep;
   state.householdFunds[home]=Math.max(0,(state.householdFunds[home]||0)-upkeep);
   if(!enough)residents.forEach(n=>lifeFor(n.id).needs.fun=clamp(lifeFor(n.id).needs.fun-6,0,100));
   if(residents.length===2){const key=pairKey(residents.map(n=>n.id));if(state.weddingPlans[key]?.status==='married')residents.forEach(n=>lifeFor(n.id).needs.social=clamp(lifeFor(n.id).needs.social+3,0,100));}
  }
 }
 state.housingDay=state.day;
 // A close single neighbor pair may independently decide to move in after several visits.
 const eligible=NPCS.map(n=>({n,p:homeCandidate(n,34,3)})).filter(x=>x.p&&!partnerFor(x.n.id)&&!partnerFor(x.p.person.id))
  .sort((a,b)=>b.p.score-a.p.score);
 if(eligible.length){const {n,p}=eligible[0];moveIn(n,p.person)}
 save();
}
function encourageHousemate(n){
 if((state.relations[n.id]||0)<25){$('talkText').textContent=`Get to know ${n.name} better before discussing a move (25 friendship required).`;return;}
 if(state.needs.energy<8){$('talkText').textContent='You need a little rest before helping with big life decisions.';return;}
 if(householdMembers(residentHome(n.id)).length>1){const roommates=householdMembers(residentHome(n.id)).filter(m=>m.id!==n.id);$('talkText').textContent=`I already share a home with ${roommates.map(m=>m.name).join(' and ')}. It's really nice to have company!`;return;}
 const candidate=homeCandidate(n,16,1);
 if(!candidate){$('talkText').textContent=`I'd love a housemate someday, but I'd need to know someone better. Close friends who have visited each other can discuss moving in.`;return;}
 if(moveIn(n,candidate.person)){
  changeNeed('energy',-8);$('talkText').textContent=`${n.name} beams. “${candidate.person.name} and I are moving in together! I can't wait to make the place feel like home.”`;
  $('emote').textContent='🏡';n.emotion='happy';n.emotionUntil=tick+3;
 }
}
function housingBoard(){
 const sites=RESIDENCES.map((site,i)=>[0,1].map(slot=>{
  const key=`h${i*2+slot}`,members=householdMembers(key),funds=state.householdFunds[key]||0;
  const decor=state.residenceDecor[key]||0;
  return `<div class="card"><div><b>${site.emoji} ${escapeHtml(apartmentName(key))}</b><small>${members.length?members.map(n=>escapeHtml(n.name)).join(' & '):'Vacant'} · 🪙 ${Math.round(funds)} household savings<br>${members.length===2?'Shared household':members.length?'Independent household':'Available address'} · ${['Cozy starter','Personal touches','Welcoming room','Beautiful home'][decor]}</small></div><button data-act="visit-home" data-id="${key}">Visit</button></div>`;
 }).join('')).join('');
 showModal('housing',`<h2>🏡 Little Households</h2><p>Six visitable living spaces, each with furniture, residents and their own character. You can drop in, chat and help make a place feel like home.</p>${sites}<h3>Recent moves</h3>${state.householdMoves.slice(-5).reverse().map(r=>`<div class="card"><div><b>${escapeHtml(NPCS.find(n=>n.id===r.who)?.name||'A neighbor')} & ${escapeHtml(NPCS.find(n=>n.id===r.with)?.name||'a friend')}</b><small>Moved in on Day ${r.day} · ${escapeHtml(apartmentName(r.home))}</small></div></div>`).join('')||'<p>No moves yet. Help friends grow closer and see where they settle.</p>'}`);
}
function roomResidents(){return activeResidence?householdMembers(activeResidence):[]}
function roomPositions(){return [{x:580,y:690},{x:729,y:740}]}
function enterResidence(home){
 roomAutonomy.clear();
 if(!/^h[0-5]$/.test(home))return;
 if(scene==='town')previousTownSpot={x:player.x,y:player.y};
 if(talk)closeTalk();closeModal();stopPlacement();controlledResident=null;householdQueue=[];householdBusy=false;householdCurrent=null;updateRoutineStrip();
 scene='residence';activeResidence=home;player.target=null;player.x=565;player.y=840;player.facing='back';cam.x=575;cam.y=650;
 const members=roomResidents();
 if(state.residenceVisits[home]!==state.day){state.residenceVisits[home]=state.day;
  if(members.length){state.needs.social=clamp(state.needs.social+7,0,100);notify(`A cozy visit with ${members.map(n=>n.name).join(' and ')}! 💗`)}
  else notify('A quiet, empty room — perhaps a new neighbor will move in.');
 }
 resize();updateUI();save();
}
function leaveResidence(){
 roomAutonomy.clear();
 if(scene!=='residence')return;
 if(talk)closeTalk();closeModal();stopPlacement();
 const home=activeResidence;scene='town';activeResidence=null;controlledResident=null;stopRoutine();
 const site=RESIDENCES[Math.floor(Number(home.slice(1))/2)]||RESIDENCES[0];
 const pos=previousTownSpot||{x:site.front[0],y:site.front[1]};
 const safe=nearestWalkable(pos,'town',true)||{x:600,y:650};player.x=safe.x;player.y=safe.y;
 cam.x=player.x;cam.y=player.y;player.facing='front';resize();updateUI();save();notify('Back to the village! 🌷');
}
const HOME_THEMES=[
 {name:'Rosewater',wall:'#e4b5b6',trim:'#ae727a',floor:'#f7e7d6',emoji:'🌷'},
 {name:'Sage & Honey',wall:'#aac5a3',trim:'#61998b',floor:'#f3e5c6',emoji:'🍯'},
 {name:'Lilac Dreams',wall:'#b8b3dd',trim:'#847cba',floor:'#f1e0db',emoji:'🪻'},
 {name:'Bluebell',wall:'#b4cfdd',trim:'#7dacc8',floor:'#f9e4bf',emoji:'🫐'},
 {name:'Peach Cottage',wall:'#dbb29b',trim:'#ac806c',floor:'#f4dedb',emoji:'🍑'},
 {name:'Clover Meadow',wall:'#c1d1a2',trim:'#8ba96e',floor:'#f2e9cd',emoji:'🍀'}
];
const HOME_ACTIONS={
 rest:{name:'Take a cozy nap',icon:'💤',spot:[311,510],boost:{energy:28,fun:5},desc:'Rest is better in a well-loved room.'},
 read:{name:'Read a little story',icon:'📚',spot:[340,380],boost:{fun:19,energy:-3},desc:'A peaceful chapter by the bookcase.'},
 tidy:{name:'Tidy & arrange',icon:'🧽',spot:[720,600],boost:{fun:8,energy:-6},desc:'Making a space your own is satisfying.'},
 meal:{name:'Make a simple meal',icon:'🥣',spot:[824,390],boost:{food:24,energy:2},desc:'Residents can feed themselves without a minigame.'},
 chat:{name:'Quality time',icon:'💗',spot:[787,580],boost:{social:20,fun:7},desc:'A friendly pause to connect with your household.'},
 hobby:{name:'Enjoy a favorite hobby',icon:'🎨',spot:[562,735],boost:{fun:21,energy:-2},desc:'A little time for the things you love.'}
};
// Each resident gets a distinct hobby, a favored furniture type, and a daily story.
// Profiles are authored rather than random so players can learn personalities.
const RESIDENT_HOBBIES={
 mabel:{icon:'🌷',title:'Tend flowers',thing:'A window garden',favorite:'flowers',backup:'plant',spot:[470,510],note:'Mabel gently tends little blossoms and picks out the happiest petals.',effect:'The fresh flowers make Mabel feel inspired.'},
 rosie:{icon:'🍓',title:'Arrange fruit displays',thing:'A cheerful market corner',favorite:'rug',backup:'flowers',spot:[615,790],note:'Rosie arranges colorful produce and dreams of a busy market.',effect:'Rosie has a new idea for her market stall.'},
 oliver:{icon:'🥐',title:'Try pastry ideas',thing:'A warm baking nook',favorite:'lamp',backup:'books',spot:[725,468],note:'Oliver sketches a new pastry recipe without using up pantry supplies.',effect:'Oliver thinks he has invented the perfect bun.'},
 jun:{icon:'📖',title:'Read a beloved novel',thing:'A little library',favorite:'books',backup:'lamp',spot:[407,570],note:'Jun settles in with a favorite story and a cup of tea.',effect:'Jun has found a new favorite chapter.'},
 bea:{icon:'🎨',title:'Sketch the afternoon',thing:'An inspiring green corner',favorite:'plant',backup:'rug',spot:[650,670],note:'Bea draws a miniature landscape full of bright colors.',effect:'Bea has finished a tiny new sketch.'},
 finn:{icon:'🎣',title:'Make fishing lures',thing:'A cozy armchair',favorite:'chair',backup:'plant',spot:[734,733],note:'Finn quietly ties colorful lures for his next trip to the pond.',effect:'Finn is dreaming of tomorrow’s catch.'}
};
function hobbyProfile(id){return RESIDENT_HOBBIES[id]||{icon:'🎨',title:'Enjoy a hobby',favorite:'chair',backup:'rug',spot:[560,730],note:'A little time to relax.',effect:'That was refreshing.'}}
function hobbyRecord(id){return state.residentHabits[id]||(state.residentHabits[id]={sessions:0,lastDay:0})}
function hasFavoriteFurnishing(id,home=activeResidence){const p=hobbyProfile(id);return (state.residenceProps[home]||[]).some(f=>f.kind===p.favorite)}
function finishHobbySession(n){
 const record=hobbyRecord(n.id);if(record.lastDay===state.day)return false;
 record.lastDay=state.day;record.sessions=Math.min(999,record.sessions+1);
 if(record.sessions===3){
  state.lifeMoments.push({id:n.id,day:state.day,title:`${n.name}'s little passion`,text:`After spending time on ${hobbyProfile(n.id).title.toLowerCase()}, ${n.name} found a happy new rhythm at home.`});
  state.lifeMoments=state.lifeMoments.slice(-24);
  notify(`${hobbyProfile(n.id).icon} ${n.name} is really getting into their hobby!`);
 }
 return true;
}
function householdHobbyCard(n,home=activeResidence){
 const p=hobbyProfile(n.id),r=hobbyRecord(n.id),favorite=hasFavoriteFurnishing(n.id,home);
 const f=furnitureTypes.find(f=>f.id===p.favorite);
 return `<div class="hobby-card"><span class="hobby-emoji">${p.icon}</span><div><strong>${escapeHtml(n.name)} loves to ${escapeHtml(p.title.toLowerCase())}</strong><small>${escapeHtml(p.note)}</small><small>⭐ ${r.sessions} days enjoyed · ${favorite?'✓ Favorite furnishing in this home':`Wishlist: ${f?.emoji||'🪑'} ${escapeHtml(f?.name||p.favorite)}`}</small></div></div>`;
}
function homeComfort(home=activeResidence){
 if(!home)return 0;const props=state.residenceProps[home]||[],variety=new Set(props.map(p=>typeof p==='string'?p:p.kind)).size;
 return Math.min(100,18+17*(state.residenceDecor[home]||0)+4*props.length+3*variety);
}
function controlledNeeds(){return controlledResident&&scene==='residence'?lifeFor(controlledResident).needs:null}
function selectHouseholdResident(id){
 if(scene!=='residence'||!roomResidents().some(n=>n.id===id))return;
 householdQueue=[];householdBusy=false;householdCurrent=null;updateRoutineStrip();player.target=null;roomAutonomy.delete(id);controlledResident=id;
 const i=roomResidents().findIndex(n=>n.id===id);const spot=roomPositions()[Math.max(0,i)];
 player.x=spot.x;player.y=spot.y;player.facing='front';updateUI();save();closeModal();notify(`You're guiding ${NPCS.find(n=>n.id===id).name}'s day. Tap Daybook for activities. 💗`);
}
function stopGuidingResident(){controlledResident=null;stopRoutine();player.target=null;player.x=565;player.y=840;player.facing='front';save();updateUI();notify('Poppy is in charge again! 🌷');}
function residentDayRecord(id){let v=state.residenceDaily[id];if(!v||v.day!==state.day)v=state.residenceDaily[id]={day:state.day,done:[]};return v}
// v2.3.1 — Daybook is also available inside Poppy's own cottage.
function ownHomeComfort(){return Math.min(100,24+Math.min(12,state.placed.length)*4+Math.min(8,new Set(state.placed.map(f=>f.kind)).size)*3)}
function ownDaybook(){
 if(scene!=='home')return manageHousehold();
 const comfort=ownHomeComfort(),record=residentDayRecord('player');
 showModal('daybook',`<div class="house-header"><span>🌼</span><div><h2>${escapeHtml(state.name)}'s Daybook</h2><p>Your little cottage · A home for real life</p></div></div><div class="house-comfort"><strong>✨ Home comfort ${comfort}/100</strong><span><i style="width:${comfort}%"></i></span><small>Each carefully chosen furnishing makes rest and hobbies more satisfying.</small></div><h3>Plan your afternoon</h3><p>Queue up to 3 activities. Walk between furniture and watch your needs recover. You can interrupt a routine at any time.</p><div class="house-action-grid">${Object.entries(HOME_ACTIONS).map(([k,a])=>`<button data-act="queue-self" data-id="${k}"><span>${a.icon}</span><b>${k==='chat'?'Write a friendly letter':a.name}</b><small>${record.done.includes(k)?'Already enjoyed today':'Add to routine'}</small></button>`).join('')}</div><p class="house-help">${householdQueue.length||householdCurrent?'Current routine: '+[householdCurrent,...householdQueue].filter(Boolean).map(k=>HOME_ACTIONS[k].icon).join(' → '):'Nothing planned yet. Make yourself at home!'}</p>${btn('Clear routine','clear-home-queue')}${btn('💌 My Aspirations','asp-board')}${btn('🌿 Room Functions','hf-board')}${btn('🪑 Arrange the cottage','decor')}${btn('🍳 Open the recipe book','cook-book')}`);
}
function updateRoutineStrip(){
 const strip=$('routineStrip');if(!strip)return;
 const show=(scene==='home'||scene==='residence')&&(householdBusy||householdQueue.length>0);
 strip.classList.toggle('hidden',!show);
 if(!show)return;
 const name=scene==='home'?state.name:(NPCS.find(n=>n.id===controlledResident)?.name||'Neighbor');
 $('routineOwner').textContent=`${name}'s routine`;
 $('routineTasks').textContent=[householdCurrent,...householdQueue].filter(Boolean).map((k,i)=>HOME_ACTIONS[k]?.icon+' '+HOME_ACTIONS[k]?.name+(i===0&&householdHold?' · '+Math.round(100*(1-householdHold.remaining/householdHold.duration))+'%':'')).join('  →  ');
}
function runOwnHomeAction(kind){
 const a=HOME_ACTIONS[kind];if(!a||scene!=='home')return;
 const once=!residentDayRecord('player').done.includes(kind);if(once)residentDayRecord('player').done.push(kind);
 const boost=once?1+ownHomeComfort()*.004:.35;
 for(const [key,value] of Object.entries(a.boost)){
  const target=key==='food'?'hunger':key;
  if(kind==='chat'&&key==='social'){state.needs.social=clamp(state.needs.social+11*boost,0,100);continue}
  state.needs[target]=clamp(state.needs[target]+value*boost,0,100);
 }
 if(once)homeAspirations.recordAction('player',kind,{scene:'home'});
 functionalHomes.reward('player','player',kind,state.needs,once,state.day);
 notify(`${a.icon} ${kind==='chat'?'A sweet letter is on its way!':a.desc}${once?' ✨':' (a little less restorative this time)'}`);
 updateUI();save();
}
function queueOwnHomeAction(kind){
 if(scene!=='home'||!HOME_ACTIONS[kind])return;
 if(householdQueue.length>=3)return notify('Three activities fit in your daybook.');
 householdQueue.push(kind);updateRoutineStrip();notify(`${HOME_ACTIONS[kind].icon} Added to your daybook`);
 if(!householdBusy)nextOwnHomeAction();
}
function nextOwnHomeAction(){
 if(scene!=='home'){householdCurrent=null;householdBusy=false;householdQueue=[];updateRoutineStrip();return}
 const kind=householdQueue.shift();if(!kind){householdCurrent=null;householdBusy=false;updateRoutineStrip();return}
 householdBusy=true;householdCurrent=kind;updateRoutineStrip();
 const a=HOME_ACTIONS[kind],spot=kind==='rest'?[332,430]:kind==='read'?[342,314]:kind==='meal'?[840,309]:kind==='chat'?[803,489]:[660,660];
 const pos=nearestWalkable({x:spot[0]+(spot[0]>600?-100:110),y:spot[1]+65},'home',true)||{x:575,y:660};
 goTo(pos,()=>{if(scene!=='home'||householdCurrent!==kind)return;startHouseholdHold(kind,'home','player')});
}
function startHouseholdHold(kind,where,id){
 if(scene!==where||householdCurrent!==kind||!HOME_ACTIONS[kind])return;
 householdHold={kind,where,id,remaining:3.8,duration:3.8};
 player.facing='front';updateRoutineStrip();
}
function advanceHouseholdHold(dt){
 const a=householdHold;
 if(!a||modal||talk||placement||speed===0)return;
 if(scene!==a.where||householdCurrent!==a.kind||(a.where==='residence'&&controlledResident!==a.id)){
  householdHold=null;return;
 }
 a.remaining=Math.max(0,a.remaining-dt*speed);
 if(a.remaining>0)return;
 householdHold=null;
 if(a.where==='home'){runOwnHomeAction(a.kind);nextOwnHomeAction()}
 else{runHouseholdAction(a.id,a.kind);nextHouseholdAction()}
 updateRoutineStrip();
}
function stopRoutine(){householdHold=null;householdQueue=[];householdBusy=false;householdCurrent=null;player.target=null;updateRoutineStrip()}
// v2.3.3: household autonomy only runs in the currently visited residence.
// It NEVER overrides a selected player's commands or consumes ingredients/coins.
const AUTONOMY_DEST={
 rest:[345,645],meal:[724,469],read:[420,570],tidy:[602,800],chat:[737,722]
};
function residentAutoEnabled(id){return state.householdAuto[id]!==false}
function residentAutoMode(n){
 const ns=lifeFor(n.id).needs,roommate=roomResidents().some(m=>m.id!==n.id);
 if(ns.energy<46)return 'rest';
 if(ns.food<52)return 'meal';
 if(roommate&&ns.social<63)return 'chat';
 const record=residentDayRecord(n.id);
 if(!record.done.includes('hobby')&&(ns.fun<72||(state.minute>=11*60&&state.minute<19*60)))return 'hobby';
 if(ns.fun<60)return 'read';
 const step=(Math.floor(state.minute/150)+n.id.length+state.day)%4;
 return ['tidy','read',roommate?'chat':'read','meal'][step];
}
function autoRoomPosition(n,i){
 const prior=residentHomePoseFallback(n,i);
 return {x:prior.x,y:prior.y};
}
function residentHomePoseFallback(n,i){
 const ns=lifeFor(n.id).needs,slot=Math.floor(state.minute/120)+i;
 if(ns.energy<35||state.minute>=21*60||state.minute<7*60)return{x:310+i*35,y:650+i*95,act:'💤'};
 if(ns.food<40||slot%4===0)return{x:725+i*30,y:475+i*22,act:'🍲'};
 if(ns.fun<38||slot%4===1){const shelf=(state.residenceProps[activeResidence]||[]).find(p=>p.kind==='books');return{x:shelf?Math.min(870,shelf.x+57):360+i*65,y:shelf?Math.min(980,shelf.y+38):555+i*55,act:'📚'}};
 const cozy=(state.residenceProps[activeResidence]||[]).find(p=>p.kind==='chair'||p.kind==='plant');
 return{x:cozy?Math.min(875,cozy.x+57):730-i*70,y:cozy?Math.min(960,cozy.y+44):685+i*70,act:'☕'};
}
function roomAutonomyStatus(id){const r=roomAutonomy.get(id);const verb=r?.action==='hobby'?hobbyProfile(id).title:HOME_ACTIONS[r?.action]?.name;
 return r?.phase==='walking'?'On the way to '+(verb||'an activity').toLowerCase():r?.phase==='using'?(verb||'Enjoying their day'):r?.phase==='break'?'Taking a breather':'Choosing their day';}
function autoDestination(kind,n,i){
 const props=state.residenceProps[activeResidence]||[];
 let p=AUTONOMY_DEST[kind];
 const h=kind==='hobby'?hobbyProfile(n.id):null;
 if(h)p=h.spot;
 const chosen=kind==='read'?props.find(x=>x.kind==='books'):kind==='chat'?props.find(x=>x.kind==='chair'):h?(props.find(x=>x.kind===h.favorite)||props.find(x=>x.kind===h.backup)):null;
 if(chosen)p=[chosen.x+60,chosen.y+45];
 const candidate={x:clamp(p[0]+i*28,280,910),y:clamp(p[1]+i*27,340,970)};
 return nearestWalkable(candidate,'residence',true)||nearestWalkable({x:575+i*75,y:760},'residence',true)||candidate;
}
function finishAutonomousAction(n,kind){
 const ns=lifeFor(n.id).needs,once=!residentDayRecord(n.id).done.includes(kind);
 if(once)residentDayRecord(n.id).done.push(kind);
 const comfort=homeComfort(activeResidence),scale=(once?0.70:0.30)*(1+Math.min(comfort,90)*.003);
 const action=HOME_ACTIONS[kind];
 for(const [name,amount] of Object.entries(action.boost)){
  if(name==='energy'&&kind==='meal')continue;
  ns[name]=clamp(ns[name]+amount*scale,0,100);
 }
 if(kind==='hobby'){
  if(once&&hasFavoriteFurnishing(n.id))ns.fun=clamp(ns.fun+8,0,100);
  if(once){finishHobbySession(n);notify(hobbyProfile(n.id).effect)}
 }
 if(kind==='chat'){
  const mates=roomResidents().filter(m=>m.id!==n.id);
  if(mates.length){
   mates.forEach(m=>{
    lifeFor(m.id).needs.social=clamp(lifeFor(m.id).needs.social+5,0,100);
    const pair=pairKey([n.id,m.id]);
    if(state.autoBondDay[pair]!==state.day){state.autoBondDay[pair]=state.day;state.townBonds[pair]=clamp((state.townBonds[pair]||0)+1,0,100)}
   });
  }
 }
 if(once)homeAspirations.recordAction(n.id,kind,{scene:'residence',members:roomResidents().map(m=>m.id)});
 functionalHomes.reward(n.id,activeResidence,kind,ns,once,state.day);
 // No autonomous purchases, salaries, meals in inventory, or repeated currency bonuses.
 save();updateUI();
}
function updateRoomAutonomy(dt){
 if(scene!=='residence'||!activeResidence||speed===0||modal||talk||placement)return;
 const members=roomResidents();
 for(let i=0;i<members.length;i++){
  const n=members[i],id=n.id;
  if(id===controlledResident||!residentAutoEnabled(id)){roomAutonomy.delete(id);continue}
  let r=roomAutonomy.get(id);
  if(!r){const pos=autoRoomPosition(n,i);r={x:pos.x,y:pos.y,action:null,phase:'break',elapsed:0,wait:1.5+i*.8,moving:false,dir:'front'};roomAutonomy.set(id,r)}
  if(r.phase==='break'){
   r.wait-=dt*speed;
   if(r.wait<=0){r.action=residentAutoMode(n);r.target=autoDestination(r.action,n,i);r.phase='walking';r.elapsed=0}
  }else if(r.phase==='walking'){
   const dx=r.target.x-r.x,dy=r.target.y-r.y,dist=Math.hypot(dx,dy),step=Math.min(dist,dt*speed*78);
   if(dist<=Math.max(step,4)){r.x=r.target.x;r.y=r.target.y;r.moving=false;r.phase='using';r.elapsed=0;r.dir='front'}
   else if(dist>0){r.x+=dx/dist*step;r.y+=dy/dist*step;r.moving=true;r.dir=dy<-.1?'back':Math.abs(dx)>Math.abs(dy)?'side':'front'}
  }else if(r.phase==='using'){
   r.moving=false;r.elapsed+=dt*speed;
   if(r.elapsed>=4.6){finishAutonomousAction(n,r.action);r.phase='break';r.wait=7+i*1.5;r.elapsed=0}
  }
 }
}
function toggleHouseholdAutonomy(id){
 if(scene!=='residence'||!roomResidents().some(n=>n.id===id))return;
 state.householdAuto[id]=!residentAutoEnabled(id);
 roomAutonomy.delete(id);save();
 notify(state.householdAuto[id]?`${NPCS.find(n=>n.id===id).name} can follow their own routines. 🌼`:'Autonomy paused. You can guide their day.');
 manageHousehold();
}
function residentHomePose(n,i){
 const r=roomAutonomy.get(n.id);
 if(r&&scene==='residence'&&n.id!==controlledResident&&residentAutoEnabled(n.id)){
  const icon=r.action==='hobby'?hobbyProfile(n.id).icon:HOME_ACTIONS[r.action]?.icon||'🌷';
  return {x:r.x,y:r.y,act:r.phase==='using'?icon:r.phase==='walking'?'👣':'☕',moving:r.moving,dir:r.dir,action:r.action,phase:r.phase};
 }
 return residentHomePoseFallback(n,i);
}
function manageHousehold(){
 if(scene==='home')return ownDaybook();
 if(scene!=='residence')return housingBoard();
 const members=roomResidents(),theme=state.residenceThemes[activeResidence]||0,style=HOME_THEMES[theme],comfort=homeComfort(),props=state.residenceProps[activeResidence]||[];
 const chosen=controlledResident?NPCS.find(n=>n.id===controlledResident):null;
 const roster=`<div class="house-roster"><button data-act="guide-self" class="${!chosen?'selected':''}">🌼 ${escapeHtml(state.name)} <small>My character</small></button>${members.map(n=>`<div class="auto-roster-member"><button data-act="guide" data-id="${n.id}" class="${chosen?.id===n.id?'selected':''}">${n.emoji} ${escapeHtml(n.name)} <small>${escapeHtml(personalMood(n).name)} · ${residentAutoEnabled(n.id)?roomAutonomyStatus(n.id):'Manual only'}</small></button><button class="auto-toggle" data-act="toggle-auto" data-id="${n.id}" aria-pressed="${residentAutoEnabled(n.id)}">${residentAutoEnabled(n.id)?'🌿 Auto ON':'⏸ Auto OFF'}</button></div>`).join('')}</div>`;
 showModal('daybook',`<div class="house-header"><span>🏡</span><div><h2>A House Is a Home</h2><p>${escapeHtml(apartmentName(activeResidence))} · ${style.emoji} ${style.name}</p></div></div><div class="house-comfort"><strong>✨ Home comfort ${comfort}/100</strong><span><i style="width:${comfort}%"></i></span><small>Decorated homes make daily routines more restorative. Comfort is capped for balance.</small></div><h3>Who will you guide?</h3>${roster}${btn('💌 Household Aspirations','asp-board')}${btn('🌿 Room Functions','hf-board')}<h3>Little passions</h3><p>Every neighbor has a favorite pastime. Decorating around their interests makes their hobbies more restorative, and three different days of practice create a special memory.</p>${members.map(n=>householdHobbyCard(n)).join('')}${chosen?`<div class="house-action-panel"><h3>${escapeHtml(chosen.name)}'s Daybook</h3><p>Queue up to 3 activities. Your resident walks to each station and performs it in order.</p><div class="house-action-grid">${Object.entries(HOME_ACTIONS).map(([k,a])=>`<button data-act="queue-home" data-id="${k}"><span>${a.icon}</span><b>${k==='hobby'?hobbyProfile(chosen.id).title:a.name}</b><small>${residentDayRecord(chosen.id).done.includes(k)?'Already enjoyed today':'Add to routine'}</small></button>`).join('')}</div><p id="queueStatus">${householdQueue.length?householdQueue.map(k=>HOME_ACTIONS[k].icon).join(' → '):'Your activity queue is empty.'}</p>${btn('Clear queued activities','clear-home-queue')}</div>`:`<p class="house-help">Choose a resident to guide their day, or keep exploring as Poppy.</p>`}<h3>Decorate this home</h3><p>Wallpaper colors are free to change. Furnishings cost coins and improve comfort.</p><div class="house-themes">${HOME_THEMES.map((v,i)=>`<button data-act="room-theme" data-id="${i}" aria-pressed="${i===theme}" class="${i===theme?'selected':''}" style="--theme:${v.wall}">${v.emoji}<small>${v.name}</small></button>`).join('')}</div><h3>Personal touches (${props.length}/8)</h3><div class="house-shop">${['plant','flowers','books','lamp','rug','chair'].map(k=>{const f=furnitureTypes.find(x=>x.id===k);return `<button data-act="room-prop" data-id="${k}" ${props.length>=8?'disabled':''}>${f.emoji} ${f.name}<small>🪙 ${Math.max(10,Math.round(f.cost*.65))}</small></button>`}).join('')}</div>${littleAtelier.toolbar(activeResidence)}${props.map((p,i)=>{const f=furnitureTypes.find(f=>f.id===p.kind);return `<div class="card"><div><b>${f?.emoji||'🌿'} ${f?.name||'Decoration'}</b><small>Drag to arrange · tap Rotate for orientation</small></div><div class="furniture-actions"><button data-act="room-move" data-id="${i}">Move</button><button data-act="at-store" data-id="${i}">Store</button><button data-act="room-sell" data-id="${i}">Sell</button></div></div>`}).join('')}${btn('Visit rooms / comfort upgrades','room-info')}`);
}
function buyResidenceProp(id){
 if(scene!=='residence')return;
 const f=furnitureTypes.find(x=>x.id===id&&['plant','flowers','books','lamp','rug','chair'].includes(id));if(!f)return;
 const p=state.residenceProps[activeResidence]||(state.residenceProps[activeResidence]=[]);
 if(p.length>=8)return notify('Eight decorations fit comfortably here. Move or sell one first.');
 const price=Math.max(10,Math.round(f.cost*.65));if(state.coins<price)return notify(`You need ${price} coins for this decoration.`);
 beginPlacement({kind:id,residence:true});
}
function runHouseholdAction(id,kind){
 if(!HOME_ACTIONS[kind]||scene!=='residence'||controlledResident!==id)return;
 const a=HOME_ACTIONS[kind],life=lifeFor(id),rec=residentDayRecord(id);
 const once=!rec.done.includes(kind);if(once)rec.done.push(kind);
 const comfort=homeComfort(),scale=once?1+.006*comfort:.38;
 for(const [key,v] of Object.entries(a.boost))life.needs[key]=clamp(life.needs[key]+v*scale,0,100);
 if(kind==='hobby'){
  if(once&&hasFavoriteFurnishing(id))life.needs.fun=clamp(life.needs.fun+8,0,100);
  if(once)finishHobbySession(NPCS.find(n=>n.id===id));
 }
 if(kind==='chat'){for(const other of roomResidents().filter(n=>n.id!==id)){lifeFor(other.id).needs.social=clamp(lifeFor(other.id).needs.social+7*scale,0,100);if(once)state.townBonds[pairKey([id,other.id])]=clamp((state.townBonds[pairKey([id,other.id])]||0)+2,0,100)}}
 if(kind==='tidy'&&once){const h=residentHome(id);state.householdFunds[h]=clamp((state.householdFunds[h]||0)+3,0,100000)}
 if(kind==='meal'){for(const other of roomResidents().filter(n=>n.id!==id)){const ns=lifeFor(other.id).needs;ns.food=clamp(ns.food+(once?9:3),0,100)}}
 if(once)state.needs.social=clamp(state.needs.social+1,0,100);
 if(once)homeAspirations.recordAction(id,kind,{scene:'residence',members:roomResidents().map(n=>n.id)});
 functionalHomes.reward(id,activeResidence,kind,life.needs,once,state.day);
 notify(`${kind==='hobby'?hobbyProfile(id).icon:a.icon} ${NPCS.find(n=>n.id===id).name}: ${kind==='hobby'?hobbyProfile(id).note:a.desc}${once?' ✨':' (repeat activity)'}`);
 save();updateUI();
}
function queueHouseholdAction(kind){
 if(scene!=='residence'||!controlledResident||!HOME_ACTIONS[kind])return;
 if(householdQueue.length>=3)return notify('Three activities fit in a routine.');
 householdQueue.push(kind);updateRoutineStrip();notify(`${HOME_ACTIONS[kind].icon} Added to the routine`);if(!householdBusy)nextHouseholdAction();
}
function nextHouseholdAction(){
 if(!controlledResident||scene!=='residence'){householdCurrent=null;householdBusy=false;householdQueue=[];updateRoutineStrip();return}
 const kind=householdQueue.shift();if(!kind){householdCurrent=null;householdBusy=false;updateRoutineStrip();return}
 householdCurrent=kind;updateRoutineStrip();householdBusy=true;const id=controlledResident,a=HOME_ACTIONS[kind];
 const pos=nearestWalkable({x:a.spot[0]+(a.spot[0]>650?-70:70),y:a.spot[1]+48},'residence',true)||{x:575,y:710};
 goTo(pos,()=>{if(controlledResident!==id||scene!=='residence'){stopRoutine();return}startHouseholdHold(kind,'residence',id)});
}
function residenceRoomMenu(){
 if(scene!=='residence'||!activeResidence)return housingBoard();
 const members=roomResidents(),decor=state.residenceDecor[activeResidence]||0;
 const labels=['Cozy starter','Personal touches','Welcoming room','Beautiful home'];
 const costs=[0,45,75,110];
 showModal('room',`<h2>🏡 ${escapeHtml(apartmentName(activeResidence))}</h2><p>${members.length?members.map(n=>n.name).join(' & ')+' live here.':'This room is vacant, but ready for a neighbor.'} Households keep their own finances, while your gifts come from your coins.</p><div class="card"><div><b>🛋️ Room comfort: ${labels[decor]}</b><small>${decor===3?'Fully decorated!':`Next improvement: ${costs[decor+1]} coins`}<br>Decor and comfort are saved for this address, even if residents move.</small></div></div>${members.map(n=>`<div class="card"><div><b>${n.emoji} ${escapeHtml(n.name)}</b><small>${escapeHtml(personalMood(n).name)} · ${friendshipRank(state.relations[n.id]||0)}</small></div><button data-act="room-chat" data-id="${n.id}">Talk</button></div>`).join('')}${decor<3?`<button class="btn" data-act="room-upgrade">🎁 Add home comforts · ${costs[decor+1]} 🪙</button>`:''}${btn('📖 Household Daybook · Control & Decor','daybook')}${btn('🚪 Leave this home','leave-home')}`);
}
function upgradeRoom(){
 if(scene!=='residence'||!activeResidence)return;
 const home=activeResidence,level=state.residenceDecor[home]||0;
 if(level>=3)return notify('This room is already beautiful! 🌷');
 const cost=[0,45,75,110][level+1];if(state.coins<cost)return notify(`You need ${cost} coins for the next upgrade.`);
 state.coins-=cost;state.residenceDecor[home]=level+1;
 for(const n of roomResidents()){const life=lifeFor(n.id);life.needs.fun=clamp(life.needs.fun+10,0,100);life.needs.energy=clamp(life.needs.energy+5,0,100)}
 save();updateUI();notify('A lovely housewarming improvement! ✨');residenceRoomMenu();
}
const VISIT_WINDOWS=[{from:13.0,to:15.55},{from:19.0,to:20.7}];
const VISIT_PLACES=[
 {name:'the café terrace',point:[895,732],icon:'☕'},
 {name:'the market benches',point:[704,843],icon:'🍓'},
 {name:'the library garden',point:[577,1093],icon:'📚'},
 {name:'the flower path',point:[822,966],icon:'🌷'}
];
function visitSlot(minute=state.minute){const h=minute/60;return VISIT_WINDOWS.findIndex(w=>h>=w.from&&h<w.to)}
function friendshipVisit(day=state.day,slot=visitSlot()){
 if(slot<0)return null;
 const visitId=`v:${day}:${slot}`,key=`${day}:${slot}`;
 let plan=state.friendVisits[key];
 if(!plan){
  // Pick an affinity-driven pair: warmth, past visits and social needs matter.
  // Strong tensions prevent visits; mediation can restore a damaged bond.
  const choices=[];
  for(let i=0;i<NPCS.length;i++)for(let j=i+1;j<NPCS.length;j++){
   const pair=[NPCS[i].id,NPCS[j].id],pairId=pairKey(pair);
   const tension=state.townTensions[pairId]||0;
   if(tension>=17)continue;
   const bond=state.townBonds[pairId]||0,chemistry=SOCIAL_CHEMISTRY[pairId]||0;
   const needs=(lifeFor(pair[0]).needs.social+lifeFor(pair[1]).needs.social)/2;
   const variation=hash(day*9.71+slot*61+i*17+j*7.3)*11;
   choices.push({pair,score:Math.min(38,bond)*.53+chemistry*3.3+(100-needs)*.085-(tension*.6)+variation+HearthTownHearts.visitBonus(state,pair)});
  }
  if(!choices.length)return null;
  choices.sort((a,b)=>b.score-a.score);
  // Avoid repeating the same pair twice in one day when alternatives exist.
  const previous=slot===1?state.friendVisits[`${day}:0`]?.pair:null;
  const chosen=choices.find(x=>!previous||pairKey(x.pair)!==pairKey(previous))||choices[0];
  const pair=slot===0&&state.invitedVisits[String(day)]?state.invitedVisits[String(day)].slice():chosen.pair;
  // Honor an invitation only when neither friend is in an unresolved dispute.
  const approved=(state.townTensions[pairKey(pair)]||0)<17?pair:chosen.pair;
  plan={pair:approved.slice(),place:Math.floor(hash(day*5.18+slot*13.7)*VISIT_PLACES.length)};
  state.friendVisits[key]=plan;
  const old=Object.keys(state.friendVisits);for(const k of old){if(Number(k.split(':')[0])<day-6)delete state.friendVisits[k]}
  save();
 }
 const place=VISIT_PLACES[plan.place];
 return {id:visitId,day,slot,pair:plan.pair,point:place.point,place:place.name,icon:place.icon,doing:'catching up',title:'A little visit'};
}
function activeFriendVisit(n){const ev=friendshipVisit();return ev&&ev.pair.includes(n.id)?ev:null}
function friendshipStatus(pair){const key=pairKey(pair),score=bondScore(pair),visits=state.visitCounts[key]||0;
 return score>=30&&visits>=3?'Best friends':score>=13&&visits>=1?'Close friends':score>=5?'Friends':'Acquaintances';}
function settleFriendVisit(){
 const visit=friendshipVisit();if(!visit||state.visitSeen.includes(visit.id)||!meetingReady(visit))return;
 const key=pairKey(visit.pair),count=(state.visitCounts[key]||0)+1;
 state.visitSeen.push(visit.id);state.visitSeen=state.visitSeen.slice(-35);
 state.visitCounts[key]=Math.min(999,count);
 state.townBonds[key]=clamp((state.townBonds[key]||0)+4,0,100);
 state.townTensions[key]=Math.max(0,(state.townTensions[key]||0)-2);
 const names=visit.pair.map(id=>NPCS.find(n=>n.id===id).name);
 const best=friendshipStatus(visit.pair)==='Best friends'&&count===3;
 const title=best?'An enduring friendship':count>1?'A familiar friendly face':'A surprise visit';
 const detail=best?`${names[0]} and ${names[1]} have become close companions after many afternoons together.`:
   `${names[0]} and ${names[1]} spent time together at ${visit.place}, sharing stories and enjoying each other's company.`;
 state.townStories.push({id:visit.id,day:visit.day,title,text:detail,pair:visit.pair.slice(),outcome:best?'milestone':'visit'});
 state.townStories=state.townStories.slice(-24);
 // A romance is possible only after repeated, real visits and mutual compatibility.
 const milestone=HearthTownHearts.onVisit(state,visit.pair,state.day,SOCIAL_CHEMISTRY[key]||0);
 if(milestone){state.townStories.push(milestone);state.townStories=state.townStories.slice(-24)}
 for(const id of visit.pair){const n=NPCS.find(x=>x.id===id);n.emotion='happy';n.emotionUntil=tick+4;n.routineKey='';const a=lifeFor(id).needs;a.social=clamp(a.social+18,0,100);a.fun=clamp(a.fun+9,0,100)}
 notify(best?'A new best-friend bond in town! 💗':`${names[0]} visited ${names[1]}! 💌`);
 save();
}
function suggestVisit(n){
 if((state.relations[n.id]||0)<20){$('talkText').textContent=`Get to know ${n.name} a little better before suggesting personal plans (20 friendship needed).`;return}
 const tomorrow=state.day+1;
 if(state.invitedVisits[String(tomorrow)]){$('talkText').textContent='You have already helped arrange a get-together for tomorrow afternoon!';return}
 if(state.needs.energy<5){$('talkText').textContent='You need some energy to help arrange a visit. Rest a little first.';return}
 const candidates=NPCS.filter(x=>x.id!==n.id&&(state.townTensions[pairKey([n.id,x.id])]||0)<17)
  .map(x=>({other:x,score:bondScore([n.id,x.id])+(SOCIAL_CHEMISTRY[pairKey([n.id,x.id])]||0)*3}))
  .sort((a,b)=>b.score-a.score);
 if(!candidates.length){$('talkText').textContent='Every possible visitor has an unresolved disagreement. Helping people reconcile may open new plans.';return}
 const other=candidates[0].other;
 state.invitedVisits[String(tomorrow)]=[n.id,other.id];
 changeNeed('energy',-5);
 const before=state.relations[n.id]||0;state.relations[n.id]=clamp(before+3,0,100);state.hearts+=3;
 checkFriendshipMoment(n,before,state.relations[n.id]);
 $('talkRole').textContent=`${n.job} · ${friendshipRank(state.relations[n.id])} · ♥ ${state.relations[n.id]}`;
 $('talkText').textContent=`${n.name} smiles. “I'll meet ${other.name} tomorrow afternoon! Thanks for helping us make plans.”`;
 $('emote').textContent='💌';n.emotion='happy';n.emotionUntil=tick+3;
 save();updateUI();notify(`A get-together is planned for Day ${tomorrow}! 💌`);
}
function visitPlans(){const slot=visitSlot(),live=friendshipVisit(),tomorrow=state.invitedVisits[String(state.day+1)];
 const all=NPCS.flatMap((n,i)=>NPCS.slice(i+1).map(m=>[n,m])).filter(([a,b])=>state.townBonds[pairKey([a.id,b.id])]>0||state.visitCounts[pairKey([a.id,b.id])]>0);
 all.sort((a,b)=>bondScore([b[0].id,b[1].id])-bondScore([a[0].id,a[1].id]));
 showModal('visits',`<h2>💌 Visiting Hours</h2><p>Neighbors choose companions based on friendship, personality and mood. Visits happen from 1:00–3:33 PM and 7:00–8:42 PM while you're playing in town.</p>
 ${live?`<div class="card"><div><b>${live.icon} Happening now</b><small>${escapeHtml(live.pair.map(id=>NPCS.find(n=>n.id===id).name).join(' & '))} at ${escapeHtml(live.place)}</small></div></div>`:'<p>There is no visit happening at this hour. Explore the town or speed up the clock.</p>'}
 ${tomorrow?`<div class="card"><div><b>📅 Tomorrow's plans</b><small>${escapeHtml(tomorrow.map(id=>NPCS.find(n=>n.id===id).name).join(' & '))} · early afternoon</small></div></div>`:''}
 <h3>Neighbor connections</h3>${all.slice(0,10).map(([a,b])=>`<div class="card"><div><b>${escapeHtml(a.name)} & ${escapeHtml(b.name)}</b><small>${friendshipStatus([a.id,b.id])} · ${Math.round(bondScore([a.id,b.id]))} closeness · ${state.visitCounts[pairKey([a.id,b.id])]||0} visits${(state.townTensions[pairKey([a.id,b.id])]||0)>=8?' · 💭 some tension':''}</small></div></div>`).join('')||'<p>More friendships will develop as neighbors meet.</p>'}`)}


const COUPLE_RITUAL_PLACES=[
 {name:'flower-lit path',point:[822,966],icon:'🌷',verb:'sharing a quiet walk',art:'flowers'},
 {name:'café terrace',point:[895,732],icon:'☕',verb:'talking over a warm drink',art:'tea'},
 {name:'library garden',point:[577,1093],icon:'📖',verb:'reading favorite pages together',art:'book'}
];
function coupleRituals(day=state.day,minute=state.minute){
 if(minute<20.75*60||minute>=22.7*60)return [];
 const connected=HearthTownHearts.connections(state,NPCS).filter(c=>['courting','partners'].includes(c.stage));
 return connected.filter(c=>{
  const [a,b]=c.key.split('|');return HearthTownHearts.available(state,[a,b])&&(state.townTensions[c.key]||0)<8;
 }).map((c,i)=>{
  const pair=c.key.split('|'),place=shared245(c.key)?{name:apartmentName(residentHome(pair[0])),point:householdFront(pair[0]),icon:'🏡',verb:'enjoying an evening at home',art:'tea'}:COUPLE_RITUAL_PLACES[(day+i)%COUPLE_RITUAL_PLACES.length];
  return {id:`c:${day}:${c.key}`,day,pair,point:place.point,place:place.name,icon:place.icon,doing:place.verb,art:place.art,stage:c.stage};
 });
}
function activeCoupleRitual(n){return coupleRituals().find(r=>r.pair.includes(n.id))||null}
function settleCoupleRituals(){
 for(const event of coupleRituals()){
  if(state.coupleMoments.includes(event.id)||!meetingReady(event))continue;
  const key=pairKey(event.pair),gift=state.coupleBouquets[event.id]===1;
  state.coupleMoments.push(event.id);state.coupleMoments=state.coupleMoments.slice(-48);
  state.townBonds[key]=clamp((state.townBonds[key]||0)+2+(gift?2:0),0,100);
  for(const id of event.pair){const n=NPCS.find(p=>p.id===id),needs=lifeFor(id).needs;
   needs.social=clamp(needs.social+12+(gift?6:0),0,100);
   needs.fun=clamp(needs.fun+8+(gift?4:0),0,100);
   n.emotion='happy';n.emotionUntil=tick+5;
  }
  const names=event.pair.map(id=>NPCS.find(n=>n.id===id).name);
  state.townStories.push({id:event.id,day:state.day,pair:event.pair.slice(),title:'An evening to remember',
   text:`${names[0]} and ${names[1]} spent a gentle evening ${event.doing} at the ${event.place}.${gift?' Your surprise flowers made the moment even sweeter.':''}`,outcome:'romance'});
  state.townStories=state.townStories.slice(-24);
  notify(`${names[0]} and ${names[1]} shared a lovely evening ${event.icon}`);save();
 }
}
function offerCoupleFlowers(key){
 const connected=HearthTownHearts.connections(state,NPCS).find(c=>c.key===key&&['courting','partners'].includes(c.stage));
 if(!connected)return notify('Those plans have changed.');
 const event=coupleRituals().find(x=>pairKey(x.pair)===key);
 if(!event)return notify('A surprise bouquet can be left during evening visiting hours (8:45–10:42 PM).');
 if(state.coupleMoments.includes(event.id))return notify('They have already enjoyed their evening together.');
 if(state.coupleBouquets[event.id])return notify('You already left a little surprise for them.');
 if(state.coins<10)return notify('A fresh bouquet costs 10 coins.');
 state.coins-=10;state.coupleBouquets[event.id]=1;save();updateUI();notify('A little bouquet is waiting for the couple! 🌸');townHeartsBoard();
}

// Shared Futures v2.4.5 — deliberately separate from marriage and generations.
const meals245={toast:'Cinnamon Toast',salad:'Fruit Salad',soup:'Vegetable Soup',pancakes:'Berry Pancakes',eggs:'Sunny Eggs',noodles:'Herb Noodles',fishplate:'Grilled Fish',tart:'Berry Tart',biscuits:'Honey Biscuits',jam:'Apple Jam',skewers:'Garden Skewers',dumplings:'Garden Dumplings'};
function committed245(key){return HearthTownHearts.connections(state,NPCS).find(c=>c.key===key&&c.stage==='partners')}
function shared245(key){let [a,b]=key.split('|');return residentHome(a)===residentHome(b)}
function ready245(key){return !!committed245(key)&&HearthTownHearts.available(state,key.split('|'))&&(state.townTensions[key]||0)<8&&state.coupleMoments.filter(m=>m.endsWith(':'+key)).length>=2}
function plans245(key){
 const c=committed245(key);if(!c)return townHeartsBoard();
 const [a,b]=key.split('|').map(id=>NPCS.find(n=>n.id===id)),shared=shared245(key),ready=ready245(key),locked=state.couplePlans[key]?.day===state.day;
 const spare=householdMembers(residentHome(a.id)).length===1&&householdMembers(residentHome(b.id)).length===1;
 const homes=[a,b].map(n=>'<button class="btn" data-act="couple-share245" data-id="'+key+'|'+residentHome(n.id)+'" '+(!ready||locked||!spare?'disabled':'')+'>🏡 Share '+escapeHtml(n.name)+'’s cottage · '+escapeHtml(apartmentName(residentHome(n.id)))+'</button>').join('');
 const dishes=(state.cooking?.dishes||[]).map((d,i)=>'<button class="btn" data-act="couple-dinner245" data-id="'+key+'|'+i+'" '+(state.coupleDinners[key]===state.day?'disabled':'')+'>🍽️ Serve '+escapeHtml(meals245[d.id]||'home cooking')+'</button>').join('');
 showModal('life-plans',`<div class="life-plan"><div class="life-plan-eyebrow">💌 THEIR NEXT CHAPTER</div><h2>${escapeHtml(a.name)} & ${escapeHtml(b.name)}</h2><p>Some love stories grow under one roof. Others bloom in two welcoming homes.</p><div class="life-plan-status">💕 ${c.sharedDays} meaningful visits · 🌙 ${state.coupleMoments.filter(m=>m.endsWith(':'+key)).length} shared evenings<br>🏡 ${shared?'Sharing '+escapeHtml(apartmentName(residentHome(a.id))):'Living in separate cottages'}</div>${!shared?'<h3>A decision for their future</h3><p>'+(ready?'They are ready to discuss sharing a home.':'They need two evenings together and no serious disagreements before deciding.')+'</p>'+homes+(!spare?'<p>One cottage is already full. Nobody will be evicted.</p>':'')+'<button class="btn secondary" data-act="couple-apart245" data-id="'+key+'" '+(!ready||locked?'disabled':'')+'>🌼 Cherish their separate homes</button>':'<h3>A home-cooked dinner</h3><p>Share a meal you made in the Hearth Kitchen. One meal per couple per day.</p>'+(dishes||'<p>Prepare a dish first!</p>')}</div><button class="btn secondary" data-act="town-hearts">← Town Hearts</button>`);
}
function sharedHome245(key,home){
 if(!ready245(key)||shared245(key)||state.couplePlans[key]?.day===state.day||!/^h[0-5]$/.test(home))return plans245(key);
 const ids=key.split('|'),receiver=NPCS.find(n=>ids.includes(n.id)&&residentHome(n.id)===home),mover=NPCS.find(n=>ids.includes(n.id)&&residentHome(n.id)!==home);
 if(!receiver||!mover||householdMembers(home).length!==1||householdMembers(residentHome(mover.id)).length!==1){notify('A cottage is full. No one will be displaced.');return plans245(key)}
 if(!moveIn(mover,receiver))return plans245(key);
 state.couplePlans[key]={choice:'together',day:state.day,home};
 state.townStories.push({id:'p:'+state.day+':'+key,day:state.day,pair:ids,title:'A home for two',text:receiver.name+' and '+mover.name+' decided to make a home together at '+apartmentName(home)+'.',outcome:'household'});state.townStories=state.townStories.slice(-24);
 save();notify('🏡 A new chapter begins!');plans245(key);
}
function apart245(key){
 if(!ready245(key)||shared245(key)||state.couplePlans[key]?.day===state.day)return plans245(key);
 state.couplePlans[key]={choice:'apart',day:state.day,home:''};
 state.townStories.push({id:'p:'+state.day+':'+key,day:state.day,pair:key.split('|'),title:'Room to grow',text:'This couple decided to enjoy separate homes and take life at their own pace.',outcome:'romance'});state.townStories=state.townStories.slice(-24);
 for(const id of key.split('|'))lifeFor(id).needs.fun=clamp(lifeFor(id).needs.fun+6,0,100);
 save();notify('🌷 A lovely choice at their own pace.');plans245(key);
}
function dinner245(key,index){
 const i=Number(index);if(!committed245(key)||!shared245(key)||!Number.isInteger(i)||i<0||i>=state.cooking.dishes.length||state.coupleDinners[key]===state.day)return plans245(key);
 const dish=state.cooking.dishes.splice(i,1)[0];
 state.coupleDinners[key]=state.day;for(const id of key.split('|')){const n=lifeFor(id).needs;n.food=clamp(n.food+22+5*dish.quality,0,100);n.fun=clamp(n.fun+5,0,100);n.social=clamp(n.social+12,0,100)}
 state.townBonds[key]=clamp((state.townBonds[key]||0)+3,0,100);
 state.townStories.push({id:'d:'+state.day+':'+key,day:state.day,pair:key.split('|'),title:'Dinner for two',text:'The couple shared '+(meals245[dish.id]||'a cozy homemade meal')+' together in their cottage.',outcome:'romance'});state.townStories=state.townStories.slice(-24);
 save();notify('🍽️ A lovely meal together!');plans245(key);
}

const coupleRecord=key=>committed245(key);
const coupleNames=key=>key.split('|').map(id=>NPCS.find(n=>n.id===id)?.name||id);
const coupleEveCount=key=>state.coupleMoments.filter(id=>id.endsWith(':'+key)).length;
const coupleLivingTogether=key=>shared245(key);
// v2.4.6 — Promises in Bloom. Weddings happen in world, not through a reward-only button.
const WEDDING_VENUES={garden:{name:'the flower garden',x:835,y:575,icon:'🌷',tone:'garden'},cafe:{name:'the café terrace',x:905,y:735,icon:'☕',tone:'cafe'},pond:{name:'the lily pond',x:921,y:1147,icon:'🪷',tone:'pond'}};
const WEDDING_VOWS={kind:{label:'Promise to care',text:'They promise to make room for each other, even on difficult days.',bond:7},joy:{label:'Promise to laugh',text:'They promise to keep finding little adventures and reasons to laugh.',bond:6},dream:{label:'Promise to encourage dreams',text:'They promise to champion each other’s passions and ambitions.',bond:8}};
const weddingNames=key=>coupleNames(key);
function weddingReadiness(key){
 const c=coupleRecord(key),plan=state.couplePlans[key];
 if(!c||!HearthTownHearts.available(state,key.split('|')))return {ok:false,reason:'They must be committed to one another first.'};
 if((state.townTensions[key]||0)>=8)return {ok:false,reason:'A little reconciliation needs to happen first.'};
 if(!plan)return {ok:false,reason:'Let them discuss their home and future first.'};
 if(coupleEveCount(key)<3)return {ok:false,reason:`They need one more meaningful evening together (${coupleEveCount(key)}/3).`};
 if(state.day<=plan.day)return {ok:false,reason:'Give them another day to reflect on their plans.'};
 return {ok:true,reason:'They are ready to talk about a lifelong promise.'};
}
function weddingActive(key){
 const w=state.weddingPlans[key];if(!w||w.status!=='scheduled'||state.day!==w.day||state.minute<18*60||state.minute>20.5*60)return null;
 const v=WEDDING_VENUES[w.venue];return {pair:key.split('|'),point:[v.x,v.y],id:`w:${w.day}:${key}`,venue:v,key};
}
function activeWedding(n){return Object.keys(state.weddingPlans).map(weddingActive).find(w=>w?.pair.includes(n.id))||null}
function weddingAtVenue(key){const event=weddingActive(key);if(!event||scene!=='town')return false;
 return meetingReady(event)&&Math.hypot(player.x-event.point[0],player.y-event.point[1])<240;
}
function weddingBoard(key){
 const c=coupleRecord(key);if(!c)return townHeartsBoard();
 const w=state.weddingPlans[key],ready=weddingReadiness(key),names=weddingNames(key),title=escapeHtml(names.join(' & '));
 const intro=`<div class="wedding-head"><div class="wedding-flowers">🌸 <span>♥</span> 🌷</div><small>THE LITTLE PROMISE BOOK</small><h2>${title}</h2><p>Every couple deserves a celebration that feels like them, whether they share one cottage or two.</p></div>`;
 let actions='';
 if(!w)actions=`<div class="wedding-note">${escapeHtml(ready.reason)}</div><button class="btn" data-act="wedding-promise" data-id="${key}" ${!ready.ok?'disabled':''}>💍 Talk about engagement</button>`;
 else if(w.status==='engaged'||(w.status==='scheduled'&&w.day<state.day)){
  actions=`<div class="wedding-note">💍 Engaged since Day ${w.proposalDay}. Choose a little celebration for ${w.status==='scheduled'?'a new day':'tomorrow'}.</div><div class="wedding-venues">${Object.entries(WEDDING_VENUES).map(([id,v])=>`<button data-act="wedding-plan" data-id="${key}|${id}">${v.icon} ${escapeHtml(v.name)}<small>Day ${state.day+1} · 6:00–8:30 PM</small></button>`).join('')}</div>`;
 }else if(w.status==='scheduled'){
  const active=weddingActive(key),atVenue=active&&weddingAtVenue(key);
  actions=`<div class="wedding-note">🌸 Celebration planned at ${escapeHtml(WEDDING_VENUES[w.venue].name)} on Day ${w.day}, 6:00–8:30 PM. You can visit the venue and take part when both partners arrive.</div>
  <button class="btn" data-act="wedding-visit" data-id="${key}">🧭 Walk to the celebration</button>
  <button class="btn" data-act="wedding-ceremony" data-id="${key}" ${atVenue?'':'disabled'}>💐 Begin the ceremony ${atVenue?'':'(meet at venue first)'}</button>`;
 }else if(w.status==='married'){
  actions=`<div class="wedding-note">💞 Married on Day ${w.marriedDay} at ${escapeHtml(WEDDING_VENUES[w.venue].name)}.<br>${escapeHtml(WEDDING_VOWS[w.vow]?.text||'They promised to care for each other.')}</div><p>Marriage does not force a shared address. Their living arrangements are still their choice.</p>`;
 }
 showModal('wedding',`<div class="wedding-sheet">${intro}${actions}<button class="btn secondary" data-act="town-hearts">← Town Hearts</button></div>`);
}
function weddingPromise(key){const ready=weddingReadiness(key);if(!ready.ok||state.weddingPlans[key])return weddingBoard(key);
 state.weddingPlans[key]={status:'engaged',proposalDay:state.day,day:0,venue:'garden',vow:'',marriedDay:0};
 const n=weddingNames(key);state.townStories.push({id:`w:${state.day}:${key}`,day:state.day,pair:key.split('|'),title:'A little promise',text:`${n[0]} and ${n[1]} decided to celebrate the life they're building together. An engagement is a promise, not a requirement to share a home.`,outcome:'romance'});
 state.townStories=state.townStories.slice(-24);save();notify(`💍 ${n.join(' & ')} are engaged!`);weddingBoard(key);
}
function weddingPlan(key,place){const w=state.weddingPlans[key];if(!w||!WEDDING_VENUES[place]||!['engaged','scheduled'].includes(w.status)||(w.status==='scheduled'&&w.day>=state.day))return weddingBoard(key);
 if(!coupleRecord(key))return townHeartsBoard();
 Object.assign(w,{status:'scheduled',day:Math.min(9999,state.day+1),venue:place});
 for(const id of key.split('|')){const n=NPCS.find(n=>n.id===id);if(n)n.routineKey=''}
 save();notify('A cozy celebration is on the calendar! ✉️');weddingBoard(key);
}
function weddingVisit(key){const w=state.weddingPlans[key];if(!w||w.status!=='scheduled')return weddingBoard(key);
 const v=WEDDING_VENUES[w.venue];closeModal();if(scene!=='town')goScene('town');const dest=nearestWalkable({x:v.x,y:v.y+112},'town',true)||{x:v.x,y:v.y+112};
 goTo(dest,()=>notify('🌸 Welcome! When both partners arrive, open Town Hearts to begin.'));notify(`Follow the path to ${v.name}.`);
}
function weddingCeremony(key){if(!weddingAtVenue(key))return weddingBoard(key);
 const w=state.weddingPlans[key],n=weddingNames(key),v=WEDDING_VENUES[w.venue];
 showModal('wedding-ceremony',`<div class="wedding-sheet wedding-ceremony"><div class="wedding-arch"><span>🌸</span><span>💗</span><span>🌼</span><div>🌿　${escapeHtml(n[0])} <span>♥</span> ${escapeHtml(n[1])}　🌿</div></div><small>DAY ${state.day} · ${escapeHtml(v.name.toUpperCase())}</small><h2>A promise in bloom</h2><p>The village grows quiet for a moment. How will they describe the life they hope to share?</p>${Object.entries(WEDDING_VOWS).map(([id,o])=>`<button class="btn" data-act="wedding-vow" data-id="${key}|${id}">💌 ${escapeHtml(o.label)}<small>${escapeHtml(o.text)}</small></button>`).join('')}<button class="btn secondary" data-act="wedding-close">Not yet — keep celebrating</button></div>`);
}
function weddingVow(key,vow){if(!WEDDING_VOWS[vow]||!weddingAtVenue(key))return weddingBoard(key);
 const w=state.weddingPlans[key];if(!w||w.status!=='scheduled')return weddingBoard(key);
 w.status='married';w.marriedDay=state.day;w.vow=vow;
 const ids=key.split('|'),names=weddingNames(key),words=WEDDING_VOWS[vow];
 state.townBonds[key]=clamp((state.townBonds[key]||0)+words.bond,0,100);
 for(const id of ids){const r=lifeFor(id).needs;r.social=clamp(r.social+25,0,100);r.fun=clamp(r.fun+22,0,100);const n=NPCS.find(n=>n.id===id);if(n){n.emotion='happy';n.emotionUntil=tick+9;n.routineKey=''}}
 state.needs.social=clamp(state.needs.social+10,0,100);
 state.townStories.push({id:`w:${state.day}:${key}`,day:state.day,pair:ids,title:'A promise in bloom',text:`${names[0]} and ${names[1]} celebrated their marriage at ${WEDDING_VENUES[w.venue].name}. ${words.text} The couple can choose to keep separate homes.`,outcome:'romance'});state.townStories=state.townStories.slice(-24);
 save();updateUI();notify(`💐 A beautiful day for ${names.join(' & ')}!`);
 showModal('wedding-finale',`<div class="wedding-sheet wedding-ceremony"><div class="wedding-arch"><span>🌼</span><span>💞</span><span>🌼</span></div><h2>Just Married!</h2><p>${escapeHtml(names.join(' & '))} celebrated their love, surrounded by their little village.</p><blockquote>${escapeHtml(words.text)}</blockquote><button class="btn" data-act="wedding-back" data-id="${key}">💗 View their story</button></div>`);
}
// v2.4.7: repeatable, optional seasonal celebrations for married residents.
const PROMISE_CHOICES={note:{icon:'💌',label:'Share a handwritten note',text:'They exchanged little promises for the days ahead.',bond:5},flowers:{icon:'🌷',label:'Bring a bouquet · 12 coins',text:'A bright bouquet turned their afternoon into a tiny celebration.',bond:7},feast:{icon:'🍓',label:'Share a homemade dish',text:'They shared a home-cooked treat and talked until the sun grew low.',bond:8}};
function promiseDue(key){const w=state.weddingPlans[key],p=state.promiseDays[key];return !!(w?.status==='married'&&state.day+1>=(p?.lastDay?p.lastDay+7:w.marriedDay+7));}
function promiseActive(key){const p=state.promiseDays[key],w=state.weddingPlans[key];if(!p||p.status!=='scheduled'||w?.status!=='married'||p.day!==state.day||state.minute<1080||state.minute>1245)return null;const v=WEDDING_VENUES[p.place];return {id:'p:'+p.day+':'+key,pair:key.split('|'),point:[v.x,v.y],place:v.name,key};}
function activePromise(n){return Object.keys(state.promiseDays).map(promiseActive).find(e=>e?.pair.includes(n.id))||null;}
function promiseAtVenue(key){const e=promiseActive(key);return !!(e&&scene==='town'&&meetingReady(e)&&Math.hypot(player.x-e.point[0],player.y-e.point[1])<240);}
function promiseBoard(key){const w=state.weddingPlans[key];if(w?.status!=='married')return townHeartsBoard();const p=state.promiseDays[key],names=coupleNames(key).map(escapeHtml).join(' & '),due=promiseDue(key),isScheduled=p?.status==='scheduled'&&p.day>=state.day,next=(p?.lastDay||w.marriedDay)+7,ready=isScheduled&&promiseAtVenue(key);let actions='';
 if(isScheduled){actions='<div class="promise-note">🗓️ Day '+p.day+' · '+escapeHtml(WEDDING_VENUES[p.place].name)+' · 6:00–8:45 PM</div><button class="btn" data-act="promise-visit" data-id="'+key+'">🧭 Walk to their celebration</button>';if(ready){actions+='<h3>Make a memory together</h3>';for(const [id,c] of Object.entries(PROMISE_CHOICES))actions+='<button class="btn promise-choice" data-act="promise-choice" data-id="'+key+'|'+id+'" '+(id==='flowers'&&state.coins<12||id==='feast'&&!state.cooking.dishes.length?'disabled':'')+'>'+c.icon+' '+c.label+'</button>';}else actions+='<p class="promise-hint">Meet the couple at their chosen location to celebrate.</p>';}
 else if(due){actions='<p>A new Promise Day is ready. Choose where to meet tomorrow:</p><div class="promise-venues">'+Object.entries(WEDDING_VENUES).map(([id,v])=>'<button data-act="promise-plan" data-id="'+key+'|'+id+'">'+v.icon+' '+escapeHtml(v.name)+'</button>').join('')+'</div>';}
 else actions='<p>Come back on Day '+(next-1)+' or later to plan their next celebration.</p>';
 showModal('promise-day','<div class="promise-sheet"><div class="promise-banner">🌼 <span>THE LITTLE PROMISE BOOK</span> 🌷</div><h2>'+names+'</h2><p>Love grows in ordinary days. Each season, help these two make a new memory together.</p><div class="promise-note">💞 Married on Day '+w.marriedDay+' · ✨ '+(p?.count||0)+' Promise Days celebrated'+(p?.lastDay?' · Last celebration Day '+p.lastDay:'')+'</div>'+actions+'<button class="btn secondary" data-act="town-hearts">← Town Hearts</button></div>');
}
function planPromise(key,place){const w=state.weddingPlans[key],p=state.promiseDays[key];if(w?.status!=='married'||!WEDDING_VENUES[place]||!promiseDue(key)||(p?.status==='scheduled'&&p.day>=state.day))return promiseBoard(key);state.promiseDays[key]={status:'scheduled',day:Math.min(9999,state.day+1),place,lastDay:p?.lastDay||0,count:p?.count||0,lastChoice:p?.lastChoice||''};for(const id of key.split('|')){const n=NPCS.find(n=>n.id===id);if(n)n.routineKey='';}save();notify('A little Promise Day is planned for tomorrow! 💌');promiseBoard(key);}
function visitPromise(key){const p=state.promiseDays[key];if(!p||p.status!=='scheduled')return promiseBoard(key);const v=WEDDING_VENUES[p.place];closeModal();if(scene!=='town')goScene('town');const dest=nearestWalkable({x:v.x,y:v.y+112},'town',true)||{x:v.x,y:v.y+112};goTo(dest,()=>notify('When the couple arrives, open Town Hearts to celebrate.'));notify('Meet them at '+v.name+'.');}
function celebratePromise(key,choice){const w=state.weddingPlans[key],p=state.promiseDays[key],c=PROMISE_CHOICES[choice];if(w?.status!=='married'||!c||!p||p.status!=='scheduled'||!promiseAtVenue(key))return promiseBoard(key);if(choice==='flowers'&&state.coins<12){notify('A bouquet costs 12 coins.');return promiseBoard(key)}if(choice==='feast'&&!state.cooking.dishes.length){notify('Prepare a dish in the Hearth Kitchen first.');return promiseBoard(key)}if(choice==='flowers')state.coins-=12;let meal='';if(choice==='feast'){const d=state.cooking.dishes.shift();meal=' They enjoyed '+(HearthKitchenRecipes[d.id]||'a homemade dish')+' together.';}p.status='complete';p.lastDay=state.day;p.count=Math.min(999,p.count+1);p.lastChoice=choice;state.townBonds[key]=clamp((state.townBonds[key]||0)+c.bond,0,100);for(const id of key.split('|')){const needs=lifeFor(id).needs;needs.social=clamp(needs.social+18,0,100);needs.fun=clamp(needs.fun+14,0,100);if(choice==='feast')needs.food=clamp(needs.food+28,0,100);const n=NPCS.find(n=>n.id===id);if(n){n.emotion='happy';n.emotionUntil=tick+7;n.routineKey='';}}if(choice==='note')state.townTensions[key]=Math.max(0,(state.townTensions[key]||0)-2);state.townStories.push({id:'p:'+state.day+':'+key,day:state.day,pair:key.split('|'),title:'A little Promise Day',text:coupleNames(key).join(' and ')+' celebrated at '+WEDDING_VENUES[p.place].name+'. '+c.text+meal,outcome:'romance'});state.townStories=state.townStories.slice(-24);save();updateUI();notify('🌸 A sweet new memory was made!');promiseBoard(key);}
function drawWeddingVenue(g){
 for(const [key,p] of Object.entries(state.promiseDays)){const e=promiseActive(key);if(!e)continue;const x=e.point[0],y=e.point[1]-45;g.save();g.textAlign='center';g.globalAlpha=.85+Math.sin(tick*2)*.1;g.font='30px system-ui';g.fillText('💌 🌼 💌',x,y-94);g.fillStyle='#fff0cb';g.font='bold 17px monospace';g.fillText('PROMISE DAY',x,y-125);g.restore();break;}
 for(const [key,w] of Object.entries(state.weddingPlans)){
  const v=WEDDING_VENUES[w.venue];if(!v||w.status!=='scheduled'||w.day!==state.day)continue;
  const x=v.x,y=v.y-48;
  g.save();g.lineWidth=8;g.strokeStyle='#e5b6a4';g.beginPath();g.moveTo(x-75,y+55);g.lineTo(x-75,y-65);g.quadraticCurveTo(x,y-136,x+75,y-65);g.lineTo(x+75,y+55);g.stroke();
  g.font='25px system-ui';g.textAlign='center';g.fillText('🌸 🌼 🌸',x,y-105);g.fillText('🌷',x-76,y+44);g.fillText('🌷',x+76,y+44);
  g.fillStyle='#fff1d7';g.font='bold 15px monospace';g.fillText('A PROMISE IN BLOOM',x,y-149);g.restore();break;
 }
}
function partnerFor(id){const c=HearthTownHearts.connections(state,NPCS).find(c=>['courting','partners'].includes(c.stage)&&c.key.split('|').includes(id));
 return c?NPCS.find(n=>n.id===c.key.split('|').find(x=>x!==id)):null;
}
function askAboutPartner(n){const loved=partnerFor(n.id);if(!loved){$('talkText').textContent=`${n.name} says they're enjoying their own pace, friendships and hobbies for now.`;return}
 const key=pairKey([n.id,loved.id]);const recent=[...state.townStories].reverse().find(x=>x.id.startsWith('c:')&&pairKey(x.pair||[])===key);
 $('talkText').textContent=recent?`“${loved.name} and I had such a lovely evening. ${recent.text.split('. ')[0].replace(/^.*? spent /,'We spent ')}. I'm holding onto that little memory.”`:`“${loved.name} and I have been finding little reasons to spend time together. A quiet evening can mean so much.”`;
 $('emote').textContent='💕';n.emotion='happy';n.emotionUntil=tick+3;
}
function drawCoupleSparkles(g){
 for(const ev of coupleRituals()){
  if(!meetingReady(ev))continue;
  const [a,b]=ev.pair.map(id=>NPCS.find(n=>n.id===id));
  const x=(a.x+b.x)/2,y=(a.y+b.y)/2-150;
  g.save();g.textAlign='center';g.font='bold 26px system-ui';
  g.globalAlpha=.7+Math.sin(tick*2)*.2;
  g.fillText(ev.icon,x,y+Math.sin(tick*3)*3);
  for(let j=0;j<3;j++){
   const t=tick*1.6+j*2.1,cx=x+Math.cos(t)*31,cy=y-13-Math.abs(Math.sin(t))*20;
   ellipse(g,j%2?'#fff2cd':'#ffaac4',cx,cy,3+j%2,4+j%2);
  }
  g.restore();
 }
}

function townHeartsBoard(){
 const pairs=HearthTownHearts.connections(state,NPCS);
 const now=coupleRituals();
 const visible=pairs.map(c=>{const event=now.find(r=>pairKey(r.pair)===c.key),done=event&&state.coupleMoments.includes(event.id),gift=event&&state.coupleBouquets[event.id],future=c.stage==='partners'?'<button data-act="couple-plans245" data-id="'+c.key+'">🏡 Life plans</button><button data-act="wedding-board" data-id="'+c.key+'">'+(state.weddingPlans[c.key]?.status==='married'?'💞 Married':state.weddingPlans[c.key]?.status==='scheduled'?'🌸 Wedding day':state.weddingPlans[c.key]?.status==='engaged'?'💍 Engaged':'💍 Promises & wedding')+'</button>'+(state.weddingPlans[c.key]?.status==='married'?'<button data-act="promise-board" data-id="'+c.key+'">💌 Promise Days</button>':''):'';
  return `<div class="card couple-heart-card"><div><b>${c.stage==='partners'?'💞':c.stage==='courting'?'💕':'🌷'} ${escapeHtml(c.names.join(' & '))}</b><small>${escapeHtml(c.label)} · ${c.sharedDays} meaningful afternoons together<br>${event?`${done?'✨ Shared tonight':'🌙 Tonight at the '+escapeHtml(event.place)} · ${escapeHtml(event.doing)}`:'Evening traditions begin at 8:45 PM during active play.'}<br>Sharing a cottage remains a separate household choice.</small></div>${event&&!done&&['courting','partners'].includes(c.stage)?`<button data-act="couple-flowers" data-id="${c.key}" ${gift||state.coins<10?'disabled':''}>${gift?'🌸 Gift left':'🌷 Flowers · 10 🪙'}</button>`:''}${future}</div>`;
 }).join('');
 showModal('town-hearts',`<h2>💕 Town Hearts</h2><p>Little relationships are growing around the village. Residents can discover feelings and choose to date after many friendly meetings. Existing partnerships and disagreements are respected.</p>${visible||'<div class="card"><div><b>🌱 Friendships first</b><small>Get to know the neighbors and spend time in town. Warm friendships may slowly become something more, but romance is never guaranteed.</small></div></div>'}<p>Love stories evolve while you play; they never progress in the background. Friendships remain valuable on their own.</p>${btn('📜 Town Stories','stories')}`);
}
function currentRoutine(n){
 if(dateMoment?.id===n.id&&scene==='town')return {h:`date-${dateMoment.place}`,where:[dateMoment.where.x,dateMoment.where.y],doing:`meeting ${state.name} for a little date`,icon:'💕',mood:'happy'};
 const ceremony=activeWedding(n);
 if(ceremony)return {h:`wedding-${ceremony.id}`,where:meetingPosition(ceremony,n),doing:'getting ready for a little wedding',icon:'💐',mood:'happy'};
 const promise=activePromise(n);
 if(promise)return {h:'promise-'+promise.id,where:meetingPosition(promise,n),doing:'celebrating a Promise Day with their partner',icon:'💌',mood:'happy'};
 const meetup=activeMeeting(n);
 if(meetup){const last=state.townStories.find(x=>x.id===meetup.id);
  if(last?.outcome==='misunderstanding'){const other=NPCS.find(x=>x.id===meetup.pair.find(id=>id!==n.id));const side=meetup.pair.indexOf(n.id)===0?-1:1;return {h:`${meetup.slot}-space`,where:[meetup.point[0]+side*105,meetup.point[1]+side*38],doing:`taking a little space after talking with ${other.name}`,icon:'🌧️',mood:'peaceful'};}
  const where=meetingPosition(meetup,n);return {h:EVENT_START[meetup.slot],where,doing:meetup.doing+' with '+NPCS.find(x=>x.id===meetup.pair.find(id=>id!==n.id)).name,icon:meetup.icon,mood:'happy',eventId:meetup.id}}

 const couple=activeCoupleRitual(n);
 if(couple){const partner=NPCS.find(x=>x.id===couple.pair.find(id=>id!==n.id));return {h:`evening-${couple.id}`,where:meetingPosition(couple,n),doing:`${couple.doing} with ${partner.name}`,icon:couple.icon,mood:'happy',coupleId:couple.id}}
 const visit=activeFriendVisit(n);
 if(visit){const other=NPCS.find(x=>x.id===visit.pair.find(id=>id!==n.id));return {h:`visit-${visit.day}-${visit.slot}`,where:meetingPosition(visit,n),doing:`visiting ${other.name} at ${visit.place}`,icon:visit.icon,mood:'happy',visitId:visit.id}}
 const care=lifeFor(n.id).mode;
 if(care==='rest')return {h:'rest-care',where:householdFront(n.id),doing:'resting at home',icon:'💤',mood:'sleepy'};
 if(care==='eat')return {h:'eat-care',where:[961,658],doing:'grabbing a snack at the café',icon:'🥐',mood:'happy'};
 if(care==='social')return {h:'social-care',where:[731,741],doing:'looking for a friendly face in town',icon:'💬',mood:'peaceful'};
 const stages=VILLAGER_ROUTINES[n.id],hour=state.minute/60;
 if(hour>=21||hour<7)return {h:`home-${residentHome(n.id)}`,where:householdFront(n.id),doing:'spending a quiet evening at home',icon:'🏡',mood:'peaceful'};
 let chosen=stages[0];for(const stage of stages){if(hour>=stage.h)chosen=stage;else break}
 return chosen;
}
// In-world activity vocabulary: each villager has a different way to pass their day.
// This derives from the live game clock; nothing continues while the game is closed.
const TASK_ART={
 mabel:{tool:'watering can',join:'Mabel shows you how to water the roots instead of the petals. Together, the flowerbed sparkles!',rest:'Mabel offers you a quiet moment among the blossoms.'},
 rosie:{tool:'fruit basket',join:'You help Rosie arrange the peaches by color. She insists you have an eye for displays!',rest:'Rosie makes room on the bench and shares a cheerful story.'},
 oliver:{tool:'pastry tray',join:'Oliver teaches you to fold dough into a little heart. The kitchen smells like cinnamon!',rest:'Oliver shares the last warm bun of the day.'},
 jun:{tool:'storybook',join:'Jun reads you the funniest paragraph from a new book, then asks you to choose the ending.',rest:'Jun recommends a wonderfully cozy bedtime story.'},
 bea:{tool:'paintbrush',join:'Bea hands you a paintbrush. You both paint the same sunset in completely different colors!',rest:'Bea tells you about her latest dream painting.'},
 finn:{tool:'fishing rod',join:'Finn lets you try his lucky fishing spot. You watch the bobber dance together.',rest:'Finn teaches you to listen for the soft sounds of the pond.'}
};
function activityType(n){
 if(activeCoupleRitual(n))return 'couple';
 if(activeMeeting(n)||activeFriendVisit(n))return 'meet';
 const care=lifeFor(n.id).mode;if(care)return care;
 const stage=currentRoutine(n),hour=state.minute/60;
 if(hour>=21||hour<6)return 'rest';
 if(n.id==='finn'&&hour>=11&&hour<16)return 'fish';
 if(n.id==='bea'&&hour>=8&&hour<17)return 'paint';
 if(n.id==='jun'&&hour>=8&&hour<21)return 'read';
 if(n.id==='oliver'&&(hour<12||hour>=16))return 'bake';
 if(n.id==='mabel'&&hour>=7&&hour<17)return 'water';
 if(n.id==='rosie'&&hour>=7&&hour<17)return 'market';
 return 'social';
}
function activityReady(n){
 const goal=n.routineGoal;return !!goal&&!n.moving&&(!n.routineRoute||!n.routineRoute.length)&&Math.hypot(n.x-goal.x,n.y-goal.y)<84;
}
// Hand-crafted pixel props are drawn in-world beside the character. They are
// animated rather than simply represented by emoji over an idle sprite.
function drawActivity(g,n,x,y){
 if(!activityReady(n)||talk===n.id)return;
 if(neighborScenes.activity(g,n,n.neighborEntry,tick))return;
 if(villageLife.drawActivity(g,n,n.villageEntry,tick))return;
 const kind=activityType(n),bounce=Math.sin(tick*3.8+n.x*.01)*3,flip=Math.sin(tick*2.2+n.y*.01)*4;
 const xx=x+31, yy=y-52+bounce;
 g.save();g.lineWidth=3;g.lineCap='round';
 if(kind==='couple'){
  const ev=activeCoupleRitual(n);g.font='bold 21px system-ui';g.textAlign='center';g.fillText(ev?.icon||'💕',xx,yy-9+Math.sin(tick*3)*2);g.textAlign='left';
  if(ev?.art==='tea'){ellipse(g,'#f8e3bb',xx,yy+8,12,4);round(g,'#d2a87e',xx-7,yy-1,14,9,3,'#986a57',2)}
  else if(ev?.art==='flowers'){ellipse(g,'#7ab88f',xx,yy+4,9,4);ellipse(g,'#eda3b9',xx,yy-1,6,6)}
 }else if(kind==='meet'){
  const e=activeMeeting(n);g.font='bold 24px system-ui';g.textAlign='center';g.fillStyle='#fff8ed';g.fillText(e.icon,xx,yy-9+Math.sin(tick*2)*2);g.textAlign='left';
  if(meetingReady(e)){ellipse(g,'#f6bfcb',x+18,y-141+Math.sin(tick*3)*3,4,4)}
 }else if(kind==='water'){
  round(g,'#77b6cc',xx-12,yy-8,24,15,3,'#487b97',2);
  line(g,'#487b97',[[xx+10,yy-4],[xx+24,yy-10]],4);
  for(let i=0;i<3;i++)ellipse(g,'#7cc8e9',xx+25+i*6,yy+flip+i*6,2,3);
  ellipse(g,'#4d9b6a',x+45,y-8,8,5);
 }else if(kind==='market'){
  round(g,'#a87b52',xx-15,yy-1,30,13,2,'#775537',2);
  line(g,'#9d7449',[[xx-10,yy],[xx-8,yy-13],[xx+8,yy-13],[xx+10,yy]],3);
  for(let i=0;i<3;i++)ellipse(g,i===0?'#f1bf5b':'#ed8b67',xx-9+i*9,yy-3-bounce*.25,6,6);
 }else if(kind==='bake'){
  round(g,'#e2b36b',xx-17,yy+2,34,7,2,'#9f744c',2);
  for(let i=0;i<3;i++){ellipse(g,'#c9783f',xx-11+i*11,yy-4+flip*.12,7,7);line(g,'#ffdb91',[[xx-14+i*11,yy-6],[xx-8+i*11,yy-1]],1)}
  for(let i=0;i<2;i++)ellipse(g,'#fff8dc99',xx+10+i*6,yy-19-bounce*2,3,5);
 }else if(kind==='read'){
  poly(g,'#83b4d3',[[xx-23,yy-12],[xx-2,yy-7],[xx-2,yy+11],[xx-23,yy+5]]);
  poly(g,'#d6b8e6',[[xx-2,yy-7],[xx+20,yy-12],[xx+20,yy+5],[xx-2,yy+11]]);
  line(g,'#fff8de',[[xx-1,yy-9],[xx-1,yy+10]],2);
  for(let i=0;i<3;i++)line(g,'#fff0e0',[[xx+2,yy-4+i*4],[xx+15,yy-6+i*4]],1);
 }else if(kind==='paint'){
  line(g,'#8c6758',[[xx-9,yy+15],[xx+13,yy-15]],3);
  round(g,'#ffb57d',xx+7,yy-20,7,13,2,'#df6e77',2);
  ellipse(g,'#fff3d1',x+45,y-13,15,12);
  for(const [a,b,c] of [[-7,-3,'#e77c9d'],[4,-6,'#85cfc2'],[2,4,'#efc96b']])ellipse(g,c,x+45+a,y-13+b,3,3);
 }else if(kind==='fish'){
  line(g,'#865a43',[[xx-12,yy+23],[xx-4,yy-27],[xx+20,yy-41]],3);
  line(g,'#c1c9c7',[[xx+20,yy-41],[xx+23,yy+15+flip]],1);
  ellipse(g,'#f08b82',xx+23,yy+17+flip,3,4);
  ellipse(g,'#7ec7de',xx+26,y+6,5,3);
 }else if(kind==='eat'){
  round(g,'#d9ae76',xx-13,yy-9,25,15,4,'#9b704e',2);
  fill(g,'#fff5c4',xx-7,yy-7,13,4);ellipse(g,'#ed8b83',xx+8,yy-9,4,3);
 }else if(kind==='rest'){
  g.font='bold 17px system-ui';g.textAlign='center';g.fillStyle='#fff9e7';g.fillText('z',xx,yy-8);g.textAlign='left';
 }else{
  g.font='18px system-ui';g.textAlign='center';g.fillText(currentRoutine(n).icon,xx,yy-9+bounce);g.textAlign='left';
 }
 // Brief animated glints on long-running tasks make work visible at a glance.
 if(kind!=='rest'&&kind!=='social'){
  const sparkle=tick*1.7+n.x*.01;
  if(Math.sin(sparkle)>.55){g.fillStyle='#fff7bc';fill(g,'#fff7bc',x+43,y-96+Math.sin(sparkle)*5,4,4)}
 }
 g.restore();
}
function friendshipRank(score){return score>=90?'Kindred spirit':score>=60?'Close friend':score>=25?'Good friend':score>=1?'New friend':'Neighbor'}
function neighborMoment(n){
 const entry=currentRoutine(n),r=state.relations[n.id]||0;
 const news=latestNeighborStory(n.id);
 if(news&&news.day>=state.day-1&&state.day%3!==0)return `${n.name} looks delighted. “${news.title}! You should read about it in Town Stories.”`;
 if(r>=60&&state.day%3===0)return `${n.name} smiles the moment you arrive. “I was hoping I’d see you today!”`;
 const feeling=personalMood(n);if(feeling.note)return `${n.name} says, “${feeling.note}”`;
 const time=state.minute/60;
 if(time<6||time>=21)return `${n.name} yawns. “Even a busy village needs a little quiet. I’m ${entry.doing}.”`;
 const lines={
 mabel:['The flower beds change every day. I notice every little bloom.','You can almost smell the fresh petals from here!'],
 rosie:['I keep a tally of which peaches everyone likes best.','I love it when the village feels like a bustling market.'],
 oliver:['Someone asked for a cinnamon bun bigger than their head!','Baking is my favorite way to make people feel welcome.'],
 jun:['Sometimes I read the same page twice because it is so lovely.','I keep a list of stories I think each neighbor would enjoy.'],
 bea:['This afternoon light makes everything look like a painting.','I collect colors the way other people collect shells.'],
 finn:['I can tell the weather by watching the pond.','The trick to fishing? Patience and a good friend.']
 }[n.id];
 const choice=(state.day+Math.floor(state.minute/180))%lines.length;
 return `${lines[choice]} I’m ${entry.doing}.`;
}
function checkFriendshipMoment(n,previous,next){
 for(let i=0;i<3;i++){const value=[25,60,90][i],key=`${n.id}:${value}`;
  if(previous<value&&next>=value&&!state.neighborMilestones.includes(key)){
   state.neighborMilestones.push(key);
   $('talkText').textContent=FRIENDSHIP_MOMENTS[n.id][i];
   $('emote').textContent='💖';notify(`${n.name} is now your ${friendshipRank(next).toLowerCase()}! 💖`);
   return true;
  }
 }
 return false;
}
// v2.4 First Sparks — original, optional relationship stories. No romance is automatic.
const HEART_PROFILES={
 mabel:{quality:'Tender & grounded',values:'quiet kindness',secret:'She presses a flower for every important memory.',dream:'A garden full of stories',date:'garden',flirt:'You make even a rainy day feel like spring.',dateLine:'Mabel shares a little bouquet and listens to the birds.'},
 rosie:{quality:'Bold & generous',values:'shared laughter',secret:'She knows everyone’s favorite fruit by heart.',dream:'A market bursting with color',date:'cafe',flirt:'You have a way of making ordinary days exciting!',dateLine:'Rosie brings peach slices and tells you a hilarious market story.'},
 oliver:{quality:'Soft-spoken & devoted',values:'small thoughtful gestures',secret:'He keeps every handwritten recipe he has ever been gifted.',dream:'A bakery where everybody belongs',date:'cafe',flirt:'I think I just forgot what I was going to say...',dateLine:'Oliver brings a little pastry with a heart baked into the crust.'},
 jun:{quality:'Quietly curious',values:'deep conversations',secret:'He writes tiny stories about the people he meets.',dream:'A library with no lonely corners',date:'garden',flirt:'I could happily spend the whole afternoon talking with you.',dateLine:'Jun reads the beginning of a story and lets you choose the ending.'},
 bea:{quality:'Playful & imaginative',values:'creative adventures',secret:'Her favorite paintings are the ones she never sells.',dream:'To paint every season',date:'pond',flirt:'You just gave me an entirely new color to paint with.',dateLine:'Bea sketches the light on the water and adds you to the picture.'},
 finn:{quality:'Patient & adventurous',values:'comfortable company',secret:'He releases his biggest catches when nobody is watching.',dream:'To know every bend in the river',date:'pond',flirt:'You make a quiet fishing trip feel like an adventure.',dateLine:'Finn shows you his lucky stone and shares the silence with you.'}
};
const MOMENT_CHOICES={listen:{icon:'💬',title:'Listen to their story',prompt:'Give them your full attention and learn something new.'},laugh:{icon:'🎈',title:'Share a little laugh',prompt:'Find something playful and enjoy the moment.'},surprise:{icon:'🎁',title:'A thoughtful surprise',prompt:'Offer a small gesture made just for them.'}};
const FAVORITE_MOMENT={mabel:'listen',rosie:'laugh',oliver:'surprise',jun:'listen',bea:'laugh',finn:'listen'};
const MOMENT_REPLIES={mabel:{listen:'Mabel talks about the first flower she ever grew, then smiles at how carefully you listened.',laugh:'Mabel laughs at a story about a mischievous garden snail.',surprise:'Mabel tucks your little keepsake into her flower journal.'},rosie:{listen:'Rosie opens up about her dreams for the market.',laugh:'Rosie makes up a ridiculous fruit pun, and you both end up laughing.',surprise:'Rosie promises your gift a special place behind the counter.'},oliver:{listen:'Oliver tells you why he learned to bake in the first place.',laugh:'A puff of flour turns into a silly baking story.',surprise:'Oliver looks delighted by the thoughtful gesture and shares a warm pastry.'},jun:{listen:'Jun shares a passage from a story he has never shown anyone.',laugh:'Jun tries a quiet joke, then beams when you laugh.',surprise:'Jun carefully saves the small memento in his favorite book.'},bea:{listen:'Bea describes a painting she hopes to make one day.',laugh:'Bea draws a playful sketch of your adventure together.',surprise:'Bea promises to paint the moment so you can both remember it.'},finn:{listen:'Finn tells you about a peaceful morning on the water.',laugh:'Finn tells a funny fishing tale, exaggerating the size of every fish.',surprise:'Finn calls your gesture a new lucky charm.'}};
const DATE_PLACES={garden:{name:'Flower Garden',icon:'🌷',point:[835,575]},cafe:{name:'Honeybun Café',icon:'🥐',point:[965,647]},pond:{name:'Lily Pond',icon:'🎣',point:[920,1160]}};
// Neighbors send one optional postcard per game day if a connection has grown naturally.
// A letter is not an automatic date: romance requires an established dating/partner stage.
const POSTCARD_LINES={
 mabel:{friend:'The garden has a little corner I would love to show you.',romance:'I saved a flower for our next afternoon together.'},
 rosie:{friend:'I have a market story that absolutely cannot wait!',romance:'Meet me for something sweet? I have a peachy surprise.'},
 oliver:{friend:'I set aside a fresh pastry. Fancy a cozy break?',romance:'I would love to share a quiet pastry with you.'},
 jun:{friend:'I found a story I think you would enjoy hearing.',romance:'I wrote a line and immediately thought of you.'},
 bea:{friend:'The light is beautiful today. Come see my new sketch!',romance:'The colors look brighter whenever we explore together.'},
 finn:{friend:'The pond is peaceful today. Fancy some fresh air?',romance:'I saved you the best view by the water.'}
};
function todaysPostcard(){const p=state.socialPostcard;return p&&p.day===state.day?p:null}
function maybeSocialPostcard(){
 if(state.minute<10*60||state.minute>20*60||todaysPostcard())return;
 const eligible=NPCS.filter(n=>state.met.includes(n.id)&&(state.relations[n.id]||0)>=18&&lifeFor(n.id).needs.energy>=15)
   .sort((a,b)=>a.id.localeCompare(b.id));
 if(!eligible.length)return;
 const prior=state.socialPostcard?.from;
 const choices=eligible.length>1?eligible.filter(n=>n.id!==prior):eligible;
 const pick=choices[Math.floor(hash(state.day*11.31+choices.length*5.19)*choices.length)];
 const heart=heartRecord(pick.id);const kind=['dating','partner'].includes(heart.stage)?'romance':'friend';
 const place=kind==='romance'?HEART_PROFILES[pick.id].date:
   ({mabel:'garden',rosie:'cafe',oliver:'cafe',jun:'garden',bea:'pond',finn:'pond'})[pick.id];
 state.socialPostcard={day:state.day,from:pick.id,place,kind,status:'pending'};
 notify(`💌 ${pick.name} left you a postcard! Open People → Postcards.`);save();
}
function postcards(){
 const p=todaysPostcard(),n=p&&NPCS.find(x=>x.id===p.from),place=p&&DATE_PLACES[p.place];
 const ready=p&&['pending','accepted'].includes(p.status);
 const detail=ready?`<div class="postcard-note"><small>${p.kind==='romance'?'💗 A THOUGHTFUL INVITATION':'🌼 A FRIENDLY INVITATION'}</small><h3>From ${escapeHtml(n.name)}</h3><p>“${escapeHtml(POSTCARD_LINES[n.id][p.kind])}”</p><div class="postcard-destination">${place.icon} ${escapeHtml(place.name)} · Today</div><div class="postcard-buttons"><button data-act="postcard-accept">${p.status==='accepted'?'Resume the visit':'💌 Let’s go!'}</button><button class="secondary" data-act="postcard-decline">Maybe another day</button></div></div>`:
  p?`<div class="postcard-note"><h3>✉️ Today's letter</h3><p>${p.status==='done'?'What a lovely afternoon. The memory is safely tucked into your journal.':'You chose to leave this invitation for another day. No friendship was lost.'}</p></div>`:
  `<div class="postcard-note"><h3>🌷 Your letterbox is quiet</h3><p>As you spend time with your neighbors, they may invite you to a favorite little spot. Check back later in the day.</p></div>`;
 showModal('postcards',`<h2>💌 Your Postcards</h2><p>Some days, a neighbor might invite you out. You're always free to say no. These are invitations, never obligations.</p>${detail}<button data-act="hearts">← Hearts & Personalities</button>`)
}
function acceptPostcard(){
 const p=todaysPostcard();if(!p||!['pending','accepted'].includes(p.status))return;
 if(dateMoment)return notify('Finish your current outing first.');
 const n=NPCS.find(x=>x.id===p.from);if(!n)return;
 if(p.kind==='romance'&&heartRecord(n.id).dateDay===state.day)return notify('You already shared a romantic outing today.');
 if(scene!=='town')goScene('town');else closeModal();
 // Accepting always starts a real walk. No friendship or romance reward is given yet.
 const ok=beginOuting(n,p.place,p.kind==='friend',true);
 if(ok){p.status='accepted';save()}
}
function declinePostcard(){const p=todaysPostcard();if(!p||!['pending','accepted'].includes(p.status))return;
 if(dateMoment?.invited)abandonDate('You can always meet up another day.');
 p.status='declined';save();postcards();notify('Invitation declined. Nobody is upset. 🌷')}
function heartRecord(id){return state.romance[id]||(state.romance[id]={insights:0,chemistry:0,dates:0,stage:'friend',discoveryDay:0,sparkDay:0,dateDay:0,partnerDay:0,lastMoment:'',lastPlace:'',lastQuality:0,lastDay:0})}
function romanceName(r){return r.stage==='partner'?'Partners':r.stage==='dating'?'Dating':r.chemistry>=20?'A little spark':'Friends'}
function heartStory(id,title,text){
 if(state.lifeMoments.some(m=>m.id===id&&m.title===title&&m.day===state.day))return;
 state.lifeMoments.push({id,day:state.day,title,text});state.lifeMoments=state.lifeMoments.slice(-24);
}
function heartNotes(){
 showModal('hearts',`<h2>💗 Hearts & Personalities</h2><div class="heart-postcard-link"><button data-act="postcards">💌 Postcards ${todaysPostcard()?.status==='pending'?'· New invitation!':'from neighbors'}</button></div><p>Affection is optional. Build friendship first, learn what matters to someone, and share thoughtful little experiences. Nobody is automatically paired up.</p>
 ${NPCS.map(n=>{const r=heartRecord(n.id),p=HEART_PROFILES[n.id];return `<div class="heart-card"><div class="heart-card-head"><strong>${escapeHtml(n.emoji+' '+n.name)}</strong><span class="heart-stage">${escapeHtml(romanceName(r))}</span></div><div class="heart-meta">${escapeHtml(p.quality)} · ♥ ${Math.round(state.relations[n.id]||0)} friendship</div><div class="heart-meter"><span style="width:${r.chemistry}%"></span></div><small>✨ ${r.chemistry} chemistry · ${r.insights}/3 discoveries · ${r.dates} dates</small>${r.lastMoment?`<div class="heart-memory">${MOMENT_CHOICES[r.lastMoment].icon} Last memory: ${escapeHtml(DATE_PLACES[r.lastPlace]?.name||'the village')} · ${escapeHtml(MOMENT_CHOICES[r.lastMoment].title)} ${r.lastQuality>=3?'✦':''}</div>`:''}<p>${r.insights?escapeHtml(p.values):'Learn what matters to them by talking.'}${r.insights>=2?`<br>📖 ${escapeHtml(p.secret)}`:''}${r.insights>=3?`<br>🌟 ${escapeHtml(p.dream)}`:''}</p><button data-act="find" data-id="${n.id}">Find ${escapeHtml(n.name)}</button></div>`}).join('')}
 <p>Romantic milestones are earned by spending time together; existing friendships, housing and town stories are unaffected.</p>`)
}
function refreshHeartTalk(n){const r=heartRecord(n.id),role=$('talkRole');role.textContent=`${n.job} · ${friendshipRank(state.relations[n.id]||0)} · 💗 ${romanceName(r)}`}
function heartConversation(n,kind){
 const r=heartRecord(n.id),p=HEART_PROFILES[n.id];const reply=t=>{$('talkText').textContent=t;$('emote').textContent='💗';n.emotion='happy';n.emotionUntil=tick+2;refreshHeartTalk(n);updateUI();save()};
 if(kind==='reflect'){
  if(!r.lastMoment)return reply('I think we still have some lovely adventures ahead of us.');
  const line=MOMENT_REPLIES[n.id][r.lastMoment];
  return reply(`Remember our day at ${DATE_PLACES[r.lastPlace]?.name||'the village'}? ${line}`);
 }
 if(kind==='discover'){
  if(r.discoveryDay===state.day)return reply('We have already shared something personal today. I like taking the time to really listen.');
  r.discoveryDay=state.day;r.insights=Math.min(3,r.insights+1);
  const lines=[`What matters most to me? ${p.values}. I don't need a perfect day—just a meaningful one.`,`Something I don't tell everyone: ${p.secret}`,`If I could make one dream come true, it would be ${p.dream.toLowerCase()}.`];
  const previous=state.relations[n.id]||0;state.relations[n.id]=Math.min(100,previous+3);checkFriendshipMoment(n,previous,state.relations[n.id]);
  return reply(lines[r.insights-1]);
 }
 if(kind==='spark'){
  if((state.relations[n.id]||0)<25)return reply('That is sweet. I would love to get to know you better first.');
  if(r.insights<2)return reply('We are becoming friends. I think the best connections start with understanding each other.');
  if(r.sparkDay===state.day)return reply('I am still smiling about our little moment earlier.');
  r.sparkDay=state.day;
  const needs=lifeFor(n.id).needs,goodMood=needs.social>=20&&needs.energy>=18;
  if(!goodMood)return reply('Could we talk when I have had a little rest? I want to give you my full attention.');
  r.chemistry=Math.min(100,r.chemistry+10+(p.date==='garden'?2:0));
  return reply(p.flirt);
 }
 if(kind==='date-invite'){
  if(scene!=='town')return reply('That sounds lovely. Meet me outside in the village and ask again!');
  if(dateMoment)return reply('We already have a little outing planned. Let us enjoy that first!');
  if((state.relations[n.id]||0)<35||r.insights<2||r.chemistry<20)return reply('I would love to know you a little better first. More conversations, and perhaps a shared spark?');
  if(r.dateDay===state.day)return reply('Today was lovely. Let us save our next adventure for another day.');
  $('talkText').textContent='Where should we spend a little time together? Choose a place and we will both walk there. 🌼';
  $('talkActions').innerHTML=Object.entries(DATE_PLACES).map(([key,v])=>`<button data-act="date-place" data-id="${key}">${v.icon} ${v.name}</button>`).join('')+'<button data-act="date-cancel">Maybe later</button>';
  return;
 }
 if(kind==='partner'){
  if(r.stage!=='dating'||r.dates<3||r.chemistry<60||(state.relations[n.id]||0)<65)return reply('We have something special. Let us keep discovering where it leads.');
  if(r.partnerDay===state.day)return reply('I would choose another day with you, too.');
  r.partnerDay=state.day;r.stage='partner';r.chemistry=Math.min(100,r.chemistry+8);
  heartStory(n.id,'A promise beneath the village sky',`${state.name} and ${n.name} decided to become partners, with many adventures still to come.`);
  return reply('I would love that. We can make room for each other in our little stories. 💕');
 }
}
function planDate(place){
 if(!talk||scene!=='town'||!DATE_PLACES[place])return;
 const n=NPCS.find(o=>o.id===talk),r=heartRecord(n.id);
 if(r.dateDay===state.day||(state.relations[n.id]||0)<35||r.chemistry<20||r.insights<2)return;
 beginOuting(n,place,false,false);
}
function beginOuting(n,place,friendly=false,invited=false){
 if(!n||scene!=='town'||dateMoment||!DATE_PLACES[place])return false;
 const site=DATE_PLACES[place];const where=nearestWalkable({x:site.point[0],y:site.point[1]},'town',true)||{x:site.point[0],y:site.point[1]};
 dateMoment={id:n.id,place,where,started:tick,arrived:false,presented:false,friendly,invited};
 n.routineKey='';n.routineRoute=[];
 closeTalk();goTo(nearestWalkable({x:where.x-54,y:where.y+22},'town',true)||where,()=>{if(dateMoment?.id===n.id)dateMoment.arrived=true});
 notify(`${site.icon} ${n.name} is meeting you at ${site.name}.`);return true;
}
function abandonDate(message='Outing canceled. No progress was lost.'){
 if(!dateMoment)return;
 const n=NPCS.find(o=>o.id===dateMoment.id);if(n)n.routineKey='';
 if(dateMoment.invited&&todaysPostcard()?.status==='accepted')state.socialPostcard.status='pending';
 dateMoment=null;player.target=null;save();
 notify(message);
}
function advanceDate(){
 if(!dateMoment||scene!=='town'||modal||talk)return;
 const d=dateMoment,n=NPCS.find(n=>n.id===d.id);if(!n){dateMoment=null;return}
 if(tick-d.started>160){abandonDate('Your outing was interrupted. You can try again another day.');return}
 if(!d.arrived||Math.hypot(n.x-d.where.x,n.y-d.where.y)>95||d.presented)return;
 if(heartRecord(n.id).dateDay===state.day){abandonDate('You already enjoyed an outing today.');return}
 d.presented=true;
 const place=DATE_PLACES[d.place];
 const pImage=charArt(selfPortrait(),'front',0,'happy').toDataURL('image/png');
 const nImage=charArt(n,'front',0,'happy').toDataURL('image/png');
 showModal('date-moment',`<div class="date-moment-head"><small>${place.icon} ${d.friendly?'A NEIGHBORLY AFTERNOON':'A LITTLE TIME TOGETHER'}</small><h2>${escapeHtml(place.name)}</h2><p>You and ${escapeHtml(n.name)} arrived together. How would you like to spend this moment?</p></div><div class="date-moment-art"><img alt="${escapeHtml(state.name)}" src="${pImage}"><span class="date-moment-heart">${place.icon} 💗</span><img alt="${escapeHtml(n.name)}" src="${nImage}"></div><div class="date-moment-options">${Object.entries(MOMENT_CHOICES).map(([key,v])=>`<button data-act="date-choice" data-id="${key}"><strong>${v.icon} ${v.title}</strong><small>${v.prompt}</small></button>`).join('')}</div><button class="date-moment-leave" data-act="date-abandon">End the outing without a memory</button>`);
}
function finishDate(moment){
 if(!dateMoment||modal!=='date-moment'||!MOMENT_CHOICES[moment])return;
 const d=dateMoment,n=NPCS.find(x=>x.id===d.id);if(!n)return;
 const r=heartRecord(n.id),p=HEART_PROFILES[n.id],place=DATE_PLACES[d.place];
 if(r.dateDay===state.day)return;
 const favorite=FAVORITE_MOMENT[n.id]===moment,idealPlace=p.date===d.place;
 const quality=1+(favorite?1:0)+(idealPlace?1:0);
 if(d.friendly){
  const before=state.relations[n.id]||0;state.relations[n.id]=clamp(before+3+quality*2,0,100);
  checkFriendshipMoment(n,before,state.relations[n.id]);
  state.needs.fun=clamp(state.needs.fun+6+quality*2,0,100);state.needs.social=clamp(state.needs.social+9+quality*2,0,100);
  const friendLife=lifeFor(n.id).needs;friendLife.social=clamp(friendLife.social+12,0,100);friendLife.fun=clamp(friendLife.fun+8,0,100);
  heartStory(n.id,`An afternoon with ${n.name}`,`${n.name} invited ${state.name} to ${place.name}. ${MOMENT_REPLIES[n.id][moment]}`);
  if(d.invited&&todaysPostcard())state.socialPostcard.status='done';
  n.emotion='happy';n.emotionUntil=tick+4;n.routineKey='';dateMoment=null;closeModal();save();updateUI();
  notify(`${place.icon} A lovely afternoon with ${n.name}! 💌`);return;
 }
 r.dateDay=state.day;r.dates++;r.lastPlace=d.place;r.lastMoment=moment;r.lastQuality=quality;r.lastDay=state.day;
 r.chemistry=Math.min(100,r.chemistry+8+quality*4);if(r.stage==='friend')r.stage='dating';
 const before=state.relations[n.id]||0;state.relations[n.id]=Math.min(100,before+4+quality*2);checkFriendshipMoment(n,before,state.relations[n.id]);
 state.needs.fun=clamp(state.needs.fun+8+quality*2,0,100);state.needs.social=clamp(state.needs.social+10+quality*2,0,100);
 const life=lifeFor(n.id).needs;life.social=clamp(life.social+12+quality,0,100);life.fun=clamp(life.fun+10+quality,0,100);
 const line=MOMENT_REPLIES[n.id][moment];
 heartStory(n.id,`A little date at ${place.name}`,`${state.name} and ${n.name} spent time together at ${place.name}. ${line}`);
 if(d.invited&&todaysPostcard())state.socialPostcard.status='done';
 n.emotion='happy';n.emotionUntil=tick+4;n.routineKey='';dateMoment=null;closeModal();save();updateUI();
 notify(`${place.icon} ${line} ${favorite?'A perfect little connection! 💗':'💗'}`);
}
const questDefs=[{id:'meet',text:'Meet 3 neighbors',max:3,reward:70},{id:'chat',text:'Have 5 friendly chats',max:5,reward:80},{id:'fish',text:'Catch 3 fish',max:3,reward:85},{id:'garden',text:'Harvest your first flowers',max:1,reward:55},{id:'work',text:'Work 2 café shifts',max:2,reward:120}];

// ===== ORIGINAL 64-ERA INSPIRED PIXEL SPRITE ARTWORK =====
const art={};function makeArt(key,w,h,fn){if(art[key])return art[key];const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;fn(g,w,h);return art[key]=c}
function fill(g,c,x,y,w,h){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function poly(g,c,p){g.fillStyle=c;g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();g.fill()}
function ellipse(g,c,x,y,w,h){g.fillStyle=c;g.beginPath();g.ellipse(x,y,w,h,0,0,TAU);g.fill()}
function line(g,c,pts,width=2){g.strokeStyle=c;g.lineWidth=width;g.lineCap='square';g.lineJoin='miter';g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke()}
function strokeRect(g,c,x,y,w,h,s=2){g.strokeStyle=c;g.lineWidth=s;g.strokeRect(x,y,w,h)}
function specks(g,seed,w,h,count,colors){for(let i=0;i<count;i++){const a=hash(seed*11+i*13.18),b=hash(seed*17+i*67.1);fill(g,colors[i%colors.length],a*w,b*h,1+Math.floor(hash(i+seed)*3),1+Math.floor(hash(i*7+seed)*2))}}

function round(g,c,x,y,w,h,r=8,stroke=null,sw=1){g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=sw;g.stroke()}}
function curved(g,c,points,width=2){g.strokeStyle=c;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.stroke()}
function oval(g,c,x,y,rx,ry,outline=null,lw=2){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fill();if(outline){g.strokeStyle=outline;g.lineWidth=lw;g.stroke()}}
function lighter(hex,f=.14){const c=String(hex).replace('#','');const n=parseInt(c,16)||0;let a=[n>>16&255,n>>8&255,n&255].map(v=>clamp(Math.round(v+(255-v)*f),0,255));return '#'+a.map(v=>v.toString(16).padStart(2,'0')).join('')}
function darker(hex,f=.22){const c=String(hex).replace('#','');const n=parseInt(c,16)||0;let a=[n>>16&255,n>>8&255,n&255].map(v=>clamp(Math.round(v*(1-f)),0,255));return '#'+a.map(v=>v.toString(16).padStart(2,'0')).join('')}

function charArt(o,dir='front',frame=0,emote='neutral'){
 const key=`C9:${o.id||o.name}:${o.skin}:${o.hair}:${o.outfit}:${o.kind}:${o.style}:${dir}:${frame}:${emote}`;
 return makeArt(key,96,132,g=>{
  const skin=o.skin||'#f3c3a0',hair=o.hair||'#54382d',dress=o.outfit||'#ef96ae';
  const outline=darker(hair,.30), hairLight=lighter(hair,.23), hairDeep=darker(hair,.24);
  const skinLight=lighter(skin,.22),skinShadow=darker(skin,.12),dressDeep=darker(dress,.23),dressLight=lighter(dress,.24);
  const isBack=dir==='back',isSide=dir==='side',walking=frame%2!==0,dy=walking?3:0;
  // tiny contact shadows, natural shoes and legs: separate shapes, no floating skirt.
  for(const side of [-1,1]){
   const xx=48+side*12,yshift=side*dy;
   round(g,'#795e59',xx-8,116+yshift,16,7,3,'#543e4b',2);
   round(g,'#c8ab98',xx-5,101+yshift,10,17,3,skinShadow,1);
   round(g,skin,xx-5,99+yshift,10,13,3);
   fill(g,'#fff3df',xx-6,114+yshift,12,3);
   round(g,side===-1?'#7e5b73':'#7e5b73',xx-10,117+yshift,22,8,4,'#544253',2);
   fill(g,'#cdbbc4',xx-6,119+yshift,9,2);
  }
  // Dress, sweater, overalls and apron are truly different silhouettes.
  if(o.kind==='overalls'){
   round(g,dressDeep,30,77,36,37,9,'#6e515d',2);
   round(g,dress,33,75,30,33,7);
   round(g,'#5988af',34,85,28,25,4,'#466d94',2);
   round(g,'#6da7d0',38,88,20,16,3);
   for(const x of [36,58]){curved(g,'#ffdfaa',[[x,80],[x,90]],3);oval(g,'#f8dd9a',x,92,2,2)}
   round(g,'#4e7d9a',41,94,14,12,2);curved(g,'#8ec9e0',[[44,98],[52,98]],1);
  }else if(o.kind==='apron'){
   round(g,dressDeep,30,76,36,38,10,'#865b62',2);round(g,dress,33,76,30,35,8);
   poly(g,'#f5e4ca',[[39,86],[57,86],[62,110],[34,110]]);
   round(g,'#fff7e4',40,85,16,11,3);round(g,'#e2bb94',41,100,14,8,3);
   curved(g,'#bc936f',[[41,100],[55,100]],1);
  }else if(o.kind==='sweater'){
   round(g,dressDeep,30,76,36,35,10,'#5e5a64',2);round(g,dress,32,76,32,32,8);
   round(g,dressLight,35,80,26,8,3);
   for(let j=0;j<3;j++)curved(g,dressDeep,[[34,91+j*4],[61,91+j*4]],1);
   round(g,'#fff1d9',33,105,30,6,2);
  }else{
   // shaped A-line skirt with moving hem and layered seam.
   poly(g,'#5f5360',[[37,76],[59,76],[68,113],[28,113]]);
   poly(g,dressDeep,[[37,78],[59,78],[66,110],[30,110]]);
   poly(g,dress,[[37,78],[59,78],[63,108],[33,108]]);
   poly(g,dressLight,[[38,81],[44,81],[38,106],[34,106]]);
   curved(g,'#fff2d1',[[35,107],[61,107]],2);
  }
  // Petite articulated sleeves and independent hands.
  for(const side of [-1,1]){
   const ax=side===-1?25:71,drop=walking?side*2:0;
   round(g,dressDeep,ax-7,78+drop,14,21,6,'#695466',2);
   round(g,dress,ax-6,78+drop,12,17,6);
   round(g,skinShadow,ax-5,94+drop,10,9,4);
   round(g,skin,ax-4,95+drop,8,7,3);
   fill(g,dressLight,ax-6,92+drop,12,3);
  }
  // Neck and ribbon soften torso-to-head transition.
  round(g,skinShadow,43,68,10,15,4);round(g,skin,44,68,8,12,3);
  oval(g,'#fff5df',48,80,12,6);oval(g,dressLight,48,79,8,3);
  if(o.kind!=='overalls'){oval(g,'#fff7e8',47,91,4,5);oval(g,'#ffe2a0',47,91,2,3)}
  // v0.9 HAIRLINE RESET: hair covers the crown, NOT the jaw or lower face.
  // Back-facing hair can retain its full silhouette; forward-facing hair
  // gets a separate crown and temples so the entire chin stays skin-colored.
  if(isBack){
   oval(g,outline,48,48,37,39);
   oval(g,hairDeep,48,46,35,38);
   oval(g,hair,46,42,33,34);
   oval(g,hairLight,38,30,17,5);
   curved(g,hairDeep,[[26,45],[27,62],[34,75]],3);
   curved(g,hairLight,[[61,31],[67,43]],2);
  }else{
   // Hair sits ABOVE the cheeks, with small separate locks at the temples.
   oval(g,hairDeep,48,32,36,23);
   oval(g,hair,48,31,33,21);
   // Face has a clean skin-colored jawline and visible ears.
   oval(g,skinShadow,48,49,31,34,darker(skin,.19),1.4);
   oval(g,skin,48,47,30,33);
   oval(g,skinLight,42,41,24,23);
   for(const side of [-1,1]){oval(g,skinShadow,48+side*30,49,6,9);oval(g,skin,48+side*30,48,5,7)}
   // Large expressive eyes with visible sclera, irises and light reflections.
   const centers=isSide?[38,55]:[36,60];
   for(const ex of centers){
    oval(g,'#654c55',ex,52,7,9);
    oval(g,'#fff9f1',ex,51,6,8);
    oval(g,o.id==='jun'?'#508b88':o.id==='bea'?'#9670b0':'#594851',ex,53,4,6);
    oval(g,'#25283b',ex,54,3,5);
    oval(g,'#ffffff',ex-2,49,2,2);
    fill(g,'#ffffff',ex+2,56,1,2);
    if(emote==='happy'){oval(g,skin,ex,52,9,9);curved(g,'#66404b',[[ex-6,51],[ex,48],[ex+6,51]],2.4)}
    if(emote==='surprised'){oval(g,'#fff9f1',ex,51,7,10);oval(g,'#25283b',ex,52,3,5)}
    curved(g,hairDeep,[[ex-6,39],[ex+2,38],[ex+6,40]],2);
   }
   oval(g,'#eda7aa',25,64,8,4);oval(g,'#eda7aa',71,64,8,4);
   oval(g,skinLight,25,62,5,2);oval(g,skinLight,71,62,5,2);
   oval(g,skinShadow,48,62,3,2);
   if(emote==='surprised')oval(g,'#a64f65',48,70,4,6);
   else if(emote==='happy'){curved(g,'#ae5e6e',[[40,69],[46,74],[51,74],[57,69]],2.2);oval(g,'#e7898d',49,74,4,2)}
   else{curved(g,'#995765',[[43,70],[48,72],[54,70]],2);fill(g,'#fff0e2',46,72,4,1)}
   // Four intentional haircuts, with highlights and shaped tapered bangs.
   poly(g,hairDeep,[[15,37],[20,20],[34,13],[54,12],[72,19],[81,34],[79,42],[66,34],[61,36],[47,27],[33,38],[23,42]]);
   poly(g,hair,[[17,35],[21,23],[37,15],[55,14],[72,21],[78,33],[70,36],[61,31],[50,28],[37,35],[24,39]]);
   if(o.style===0){ // tidy bob with distinctive side swoop
    poly(g,hair,[[19,29],[29,22],[48,19],[68,24],[75,36],[69,37],[53,27],[39,32],[25,41]]);
    oval(g,hair,20,49,6,13);oval(g,hair,76,49,6,13);
    curved(g,hairLight,[[25,27],[35,20],[54,19]],2.7);
   }else if(o.style===1){ // side-part bob
    poly(g,hair,[[20,26],[40,16],[67,19],[78,30],[62,28],[47,35],[29,35],[23,43]]);
    curved(g,hairLight,[[25,26],[40,18],[56,20]],2.5);
    oval(g,hair,21,46,6,12);
   }else if(o.style===2){ // boyish tuft with uneven fringe
    poly(g,hair,[[17,34],[23,21],[35,16],[43,10],[51,18],[58,11],[73,21],[80,34],[69,34],[61,28],[54,32],[45,29],[34,39],[24,37]]);
    curved(g,hairLight,[[28,23],[39,17],[45,18]],2.5);
   }else if(o.style===3){ // ponytail silhouette
    oval(g,outline,86,48,11,18);oval(g,hair,85,47,8,15);
    oval(g,'#ffe2ad',74,36,6,4);
    poly(g,hair,[[17,36],[24,22],[38,17],[59,19],[76,30],[71,37],[61,32],[46,30],[33,39],[22,41]]);
    curved(g,hairLight,[[26,26],[44,21],[55,24]],2.5);
   }else { // double buns with shaped fringe
    oval(g,outline,20,18,14,14);oval(g,outline,76,18,14,14);
    oval(g,hair,20,17,12,12);oval(g,hair,76,17,12,12);
    oval(g,hairLight,17,12,5,3);oval(g,hairLight,72,12,5,3);
    poly(g,hair,[[22,35],[29,22],[50,20],[70,24],[76,34],[68,37],[52,31],[39,36],[27,40]]);
   }
   // individual accessories tie people to their roles.
   if(o.id==='mabel'||o.id==='rosie'||o.id==='bea'){
    const a=o.id==='bea'?'#fbd573':o.id==='rosie'?'#9ed8d9':'#f18eb5';
    oval(g,a,72,30,7,4);oval(g,a,83,28,7,4);oval(g,'#fff6df',78,29,4,4);
   }
   if(o.id==='oliver'){
    oval(g,'#fff7e7',47,16,30,8);round(g,'#fff9ef',26,8,44,13,7,'#d8bfab',2);
    for(const ex of [33,47,60])oval(g,'#fffdf2',ex,7,12,9);
   }
   if(o.id==='finn'){oval(g,'#ddbd76',48,15,35,7);round(g,'#edce83',28,0,40,18,7);fill(g,'#8db89b',30,14,36,4)}
  }
  if(isBack){curved(g,hairLight,[[31,27],[41,20],[58,23]],3)}
  // embroidery and stitching stay legible at phone scale.
  if(o.kind==='dress'){for(const [xx,yy] of [[46,94],[50,96],[54,94],[50,91]])oval(g,'#fff0bd',xx,yy,2,2);oval(g,'#f4b758',50,94,2,2)}
 });
}
function foliageArt(kind=0){return makeArt('tree8'+kind,130,185,g=>{
 const bloom=kind===2;
 const pal=bloom?['#c85f91','#e88bb3','#f3b9d4','#ffe5df']:kind===1?['#245e51','#368864','#6bbd74','#bce39a']:['#286b54','#388b5d','#65b96e','#afe08a'];
 oval(g,'#31554b44',64,177,49,8);
 // tapered trunk with visible grain and a low branch fork
 poly(g,'#685244',[[55,87],[73,87],[76,172],[53,172]]);
 poly(g,'#a77950',[[57,84],[69,83],[70,171],[57,171]]);
 curved(g,'#d3a774',[[61,104],[61,156]],3);
 poly(g,'#795f4a',[[63,128],[30,95],[32,85],[64,112],[99,86],[104,94],[67,131]]);
 // clustered foliage has convincing volume: shadow at bottom, sunlit tier on top.
 const lumps=[[39,92,25],[78,95,24],[23,70,23],[108,71,22],[47,62,32],[81,62,31],[60,37,31],[32,43,20],[99,42,19],[65,77,31]];
 lumps.forEach(([x,y,r],i)=>{oval(g,pal[0],x+2,y+5,r+3,r*.79);oval(g,pal[1],x,y,r,r*.78);oval(g,pal[2],x-4,y-6,r*.85,r*.63)});
 for(let i=0;i<51;i++){
  const a=i*2.399,r=18+hash(i*13+kind)*44,x=64+Math.cos(a)*r,y=65+Math.sin(a)*r*.58;
  if(x<9||x>119||y<17||y>112)continue;
  const sz=2+hash(i*7)*4;
  oval(g,i%4===0?pal[3]:i%3===0?pal[1]:pal[2],x,y,sz*1.8,sz*.7);
 }
 // fruit and blossoms help every tree tell a story
 for(let i=0;i<10;i++){
  const a=i*2.4,x=64+Math.cos(a)*(18+hash(i+7)*30),y=61+Math.sin(a)*29;
  if(bloom){oval(g,'#ffe5ed',x,y,4,3);oval(g,'#f8cf72',x+1,y,1.5,1.5)}
  else if(i%2===0){oval(g,kind===1?'#f1a762':'#ffd169',x,y,4,5);oval(g,'#fff4c8',x-1,y-2,1,2)}
 }
 });}
function houseArt(kind){return makeArt('house8'+kind,224,207,g=>{
 const pal=[['#f4c2a6','#d86e86','#a74f70','#fff0d8'],['#ffe2a6','#5da5bb','#377d94','#fff5db'],['#bddcd1','#a18bbd','#76699b','#fff3e3'],['#f5c4ae','#da98af','#ad6b8d','#ffeed8']][kind%4];
 const [wall,roof,roofShade,white]=pal;const edge='#735c58',wood='#a47558';
 oval(g,'#28534b44',114,187,95,12);
 // Raised stonework and distinct right-hand facade for proper 2.5D depth.
 poly(g,'#b99b84',[[18,85],[171,75],[207,66],[206,175],[170,192],[17,187]]);
 poly(g,'#bb917e',[[170,82],[204,67],[204,174],[169,188]]);
 for(let i=0;i<8;i++)curved(g,'#f0bd9d',[[172,89+i*11],[201,76+i*11]],1);
 poly(g,wall,[[20,84],[170,84],[170,185],[20,185]]);
 for(let i=0;i<11;i++){fill(g,white+'90',23,93+i*8,144,1);fill(g,roofShade+'40',25,96+i*8,140,1)}
 // Crown molding, chunky corner posts and stone skirting.
 fill(g,'#fff8e5',18,83,153,6);fill(g,'#fff8e5',19,181,153,8);
 fill(g,'#fff3d3',20,89,6,93);fill(g,'#fff3d3',164,89,6,94);
 for(let i=0;i<5;i++)fill(g,'#d5bda7',27+i*29,185,26,3);
 // Roof facets and curved eaves, colored slate shingles with warm specular accents.
 poly(g,'#5a4552',[[8,86],[47,29],[142,24],[181,77],[212,58],[162,7],[52,16]]);
 poly(g,roofShade,[[140,26],[168,5],[217,57],[184,82]]);
 poly(g,roof,[[13,80],[51,25],[142,24],[177,78],[169,84],[142,46],[54,45],[21,90]]);
 poly(g,'#edccaa',[[54,45],[140,45],[169,85],[22,85]]);
 poly(g,roof,[[13,80],[52,24],[140,24],[152,38],[56,38],[21,89]]);
 for(let i=0;i<10;i++){
  const x=26+i*12;
  curved(g,i%2?'#fff2e477':'#713e5c55',[[x,70],[x+23,37]],1);
 }
 curved(g,'#fff4d5',[[20,86],[53,43],[140,43],[168,85]],4);
 for(let i=0;i<12;i++){const x=22+i*12;fill(g,i%3===0?'#fff0c9':roofShade,x,84+(i%2),7,3)}
 // Chimney with cap
 round(g,'#b77f6c',159,14,17,30,2,edge,2);fill(g,'#e1b69a',164,16,5,22);round(g,'#f5cba7',155,12,25,5,2);
 // Gable attic window with a flower-shaped rosette.
 round(g,white,84,55,26,20,7,edge,2);round(g,'#87cde0',89,58,16,15,4);fill(g,'#fff4d8',96,58,3,14);fill(g,'#fff4d8',89,65,16,2);
 // Symmetrical shaded windows, curtains and actual flowerboxes.
 for(const x of [31,139]){
  round(g,edge,x-6,112,37,43,3);
  round(g,white,x-9,108,41,43,4);
  round(g,'#76bed1',x-4,113,31,32,3);
  poly(g,'#b5e7db',[[x-3,115],[x+8,114],[x-1,135]]);
  fill(g,white,x+10,114,3,30);fill(g,white,x-4,127,31,3);
  round(g,roofShade,x-13,109,6,40,2);round(g,roofShade,x+31,109,6,40,2);
  for(let i=0;i<3;i++){fill(g,white,x-12,115+i*11,5,2);fill(g,white,x+32,115+i*11,4,2)}
  round(g,wood,x-14,147,50,8,2);
  oval(g,'#368b5b',x+10,146,21,8);
  for(let i=0;i<7;i++)oval(g,['#f783a9','#fee5a3','#fcf5e6'][i%3],x-8+i*7,140+(i%2)*3,3,4);
 }
 // Recessed arched doorway with window, threshold, lantern and curved front steps.
 round(g,'#fff0d8',72,111,51,77,13,edge,2);
 round(g,roofShade,77,116,41,70,10);
 round(g,'#eaa47e',81,119,33,64,8);
 round(g,'#a3d9d2',88,127,19,18,5,white,2);
 fill(g,'#fff9e2',96,127,3,18);oval(g,'#ffe4a8',107,156,3,3);
 round(g,roofShade,68,109,59,7,2);
 for(let i=0;i<6;i++)round(g,i%2===0?roof: white,70+i*9,109,9,8,1);
 round(g,'#d3bba1',69,186,60,5,2);round(g,'#f1d6b5',60,191,78,6,3);
 for(const x of [63,131]){fill(g,edge,x,119,4,8);oval(g,'#fff1b1',x+2,121,6,9);oval(g,'#c99a66',x+2,116,7,3)}
 // Entry pot + doorstep tile
 round(g,'#b66e65',28,171,18,13,3);oval(g,'#36865d',37,170,13,8);oval(g,'#eaa9bd',31,164,5,5);oval(g,'#ffdb9c',43,162,4,5);
 // Mail slot and address sign give a lived-in feeling.
 fill(g,'#876454',181,158,4,26);round(g,white,174,153,20,12,3,edge,1);fill(g,'#d57f9c',191,154,3,5);
 });}
function stallArt(){return makeArt('stall',104,88,g=>{ellipse(g,'#285e4b66',51,80,43,6);fill(g,'#875a47',10,36,5,42);fill(g,'#875a47',90,36,5,42);fill(g,'#a57453',10,60,85,17);fill(g,'#eac58d',14,60,78,4);poly(g,'#5a5260',[[7,37],[21,12],[84,12],[97,37]]);for(let j=0;j<6;j++){const x=8+j*15;poly(g,j%2?'#fff2d4':'#f88ba3',[[21+j*11,13],[28+j*10,13],[x+16,37],[x,37]])}for(let j=0;j<6;j++){fill(g,['#ffbd5f','#ff796c','#a6d67b'][j%3],22+j*11,57-(j%2)*3,7,7);fill(g,'#4b945a',24+j*11,52-(j%2)*3,3,4)}fill(g,'#e6b47b',13,69,75,5)})}
function lampArt(){return makeArt('lamp',42,106,g=>{ellipse(g,'#315a4d77',21,101,18,4);fill(g,'#315a61',17,21,8,78);fill(g,'#44787b',19,26,3,72);fill(g,'#37565e',9,21,24,5);poly(g,'#31525b',[[10,24],[12,12],[20,7],[30,12],[33,24]]);poly(g,'#e9bd74',[[14,21],[17,13],[26,13],[29,21]]);fill(g,'#fff5bc',18,15,7,6);fill(g,'#31525b',17,6,9,3);fill(g,'#f9d28a',19,1,5,6)})}
function benchArt(){return makeArt('bench',100,64,g=>{ellipse(g,'#335b4b66',52,57,41,6);for(let x of [19,74])fill(g,'#546360',x,33,5,27);fill(g,'#4a5c57',17,18,64,7);fill(g,'#c78c59',14,16,70,7);fill(g,'#e4b876',14,16,70,3);fill(g,'#c78c59',16,26,68,6);fill(g,'#805742',18,36,66,7);fill(g,'#dba675',18,34,63,6);fill(g,'#ecbe8a',19,34,62,2)})}
function shrubArt(type=0){return makeArt('shrub'+type,56,43,g=>{ellipse(g,'#315b4944',27,38,24,4);for(let j=0;j<7;j++){const x=12+(j*11)%34,y=20+hash(j+type)*11;ellipse(g,'#2f6e4d',x,y,11,9);ellipse(g,(['#79ba65','#8ccc77','#63ac5f'][j%3]),x,y-3,10,7)}for(let j=0;j<5;j++){const x=9+j*9,y=14+(j%2)*12;fill(g,type===1?'#f3b0d1':j%2?'#ffcd75':'#f9a6ab',x,y,4,4)}})}
function flowerArt(n=0){return makeArt('flower'+n,32,36,g=>{fill(g,'#4a944d',15,14,3,18);fill(g,'#77be5b',10,23,5,4);fill(g,'#77be5b',18,27,5,4);const c=['#ff7fa5','#fee088','#a698ea','#f3f0dc','#ffae61'][n%5];for(const [x,y] of [[11,8],[18,8],[11,15],[18,15],[14,5]])fill(g,c,x,y,6,6);fill(g,'#f8b84a',14,11,7,7);fill(g,'#fff3d4',15,12,2,2)})}
function grassTile(){return makeArt('grass',96,96,g=>{fill(g,'#79b879',0,0,96,96);for(let i=0;i<34;i++){const x=hash(i*28)*95,y=hash(i*11+6)*95;fill(g,['#85c37c','#6eae70','#92cb88','#75b879'][i%4],x,y,4+(i%4)*2,2+(i%3))}for(let i=0;i<13;i++){const x=hash(i*48+4)*95,y=hash(i*8+34)*95;fill(g,'#4f9761',x,y,2,5);fill(g,'#b3d78e',x+2,y-1,2,3)}return g})}
function floorTile(){return makeArt('floor',64,64,g=>{fill(g,'#e6bc80',0,0,64,64);for(let j=0;j<4;j++)for(let i=0;i<3;i++){const y=j*16,x=i*24-(j%2)*12;fill(g,'#b78962',x,y,23,1);fill(g,'#f7d59c',x+1,y+2,20,2);fill(g,'#dbab72',x+18,y+7,2,6)}})}


function flowerbedArt(seed=0){return makeArt('flowerbed8'+seed,136,65,g=>{
 oval(g,'#315a4947',68,59,66,7);oval(g,'#3b915f',68,45,63,18);
 for(let j=0;j<17;j++){
  const x=12+(j%9)*14+(j%3)*2, y=29+Math.floor(j/9)*14+hash(j+seed)*5;
  curved(g,'#477c42',[[x,y+16],[x,y-7]],2.4);oval(g,'#5fa85b',x-3,y+8,6,3);
  const c=['#ffa7b9','#f9e2a1','#bcaff4','#f9f5df','#f9bc80'][(j+seed)%5];
  for(const [px,py] of [[-3,0],[3,0],[0,-4],[0,4]])oval(g,c,x+px,y+py,4,4);
  oval(g,'#f1c663',x,y,2.6,2.6);
 }
 });}
function picnicArt(){return makeArt('picnic8',160,103,g=>{
 oval(g,'#315a4944',79,96,72,8);
 for(const x of [23,126]){round(g,'#b98965',x,45,12,39,3,'#775b57',2);round(g,'#e7b484',x-5,34,24,11,3)}
 round(g,'#987258',22,31,117,20,8,'#65524e',2);round(g,'#fff1d8',19,24,123,16,7);
 for(let x=26;x<138;x+=19)fill(g,'#e6a0a3',x,25,9,14);
 round(g,'#e7ba83',29,48,103,8,2);round(g,'#b88663',70,56,17,32,2);
 for(let i=0;i<2;i++){const x=49+i*51;oval(g,'#fff9e9',x,29,15,5);oval(g,'#f2bd8d',x,28,5,4)}
 round(g,'#d4a487',71,12,23,16,3);oval(g,'#fff2d3',83,11,10,6);oval(g,'#f1d18d',83,10,4,3);
 });}
function fenceArt(){return makeArt('fence8',170,68,g=>{
 for(let x=6;x<168;x+=21){round(g,'#d6a875',x,13,11,50,3,'#8f6f58',2);poly(g,'#f4d7a1',[[x,13],[x+6,5],[x+11,13]]);fill(g,'#fff2cc',x+2,19,2,28)}
 for(let y of [29,49])round(g,'#e2b982',0,y,170,8,2,'#937358',1);
 });}
function flowerArchArt(){return makeArt('arch8',160,187,g=>{
 oval(g,'#295f4a55',80,174,69,10);
 for(const x of [25,133]){round(g,'#a47962',x-6,63,13,109,4,'#654f45',2);curved(g,'#d7a78a',[[x-2,80],[x-2,162]],2)}
 curved(g,'#785b58',[[22,84],[29,40],[48,22],[80,13],[113,22],[133,43],[139,85]],10);
 curved(g,'#56946b',[[22,84],[29,40],[48,22],[80,13],[113,22],[133,43],[139,85]],7);
 for(let i=0;i<28;i++){const a=Math.PI*1.05+i/(27)*Math.PI*.90;const x=80+Math.cos(a)*63,y=89+Math.sin(a)*70;
  oval(g,i%2?'#5ab675':'#8acc76',x,y,11,6);
  if(i%3===0){oval(g,i%2?'#ffe4a3':'#f29db9',x,y-2,6,6);oval(g,'#fff4d0',x,y-2,2,2)}
 }
 });}
function welcomeBoardArt(){return makeArt('board8',126,112,g=>{
 oval(g,'#315b4940',61,104,48,6);
 fill(g,'#846450',25,49,9,53);fill(g,'#846450',93,49,9,53);
 round(g,'#a5785c',5,13,117,70,7,'#694f4b',3);
 round(g,'#fff2d3',12,18,103,56,6);
 g.fillStyle='#3e725c';g.textAlign='center';g.font='bold 11px system-ui';g.fillText('MAPLEWOOD',63,39);g.font='bold 10px system-ui';g.fillText('VILLAGE',63,55);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;oval(g,'#ed9eb6',101+Math.cos(a)*8,12+Math.sin(a)*7,5,5)}oval(g,'#f3ca75',101,12,4,4);
 });}

// --- THE LIVING VILLAGE: Field Notes collection (v2.5 / first vertical slice) ---
const natureRecord=()=>state.nature;
function natureSpeciesAt(site,day=state.day,season=state.season){
 const choices=NATURE_SPECIES.filter(n=>n.season===season),common=NATURE_SPECIES.filter(n=>n.season===-1);
 return site<4?choices[(day+site-1)%choices.length]:common[(day+site-4)%common.length];
}
function refreshNatureFinds(){
 if(!state?.nature)return;
 if(state.nature.collectedDay!==state.day){state.nature.collectedDay=state.day;state.nature.collectedSites=[];}
 for(let i=objects.length-1;i>=0;i--)if(objects[i].type==='discovery')objects.splice(i,1);
 NATURE_SPOTS.forEach(([x,y],site)=>{if(state.nature.collectedSites.includes(site))return;
  const spec=natureSpeciesAt(site);
  // Observations live in the actual world. Nature finds never block walking.
  put('discovery',x,y,{site,species:spec.id,action:'collect-nature'});
 });
}
function drawNatureGlyph(g,kind,x,y,c,phase=0){
 g.save();g.translate(x,y);g.scale(1.25,1.25);
 const flutter=Math.sin(phase)*2;
 if(kind==='leaf'){
  line(g,'#56794d',[[0,9],[0,-11]],3);ellipse(g,c,-7,-8,9,5);ellipse(g,c,7,-15,10,6);ellipse(g,'#dbed9a',5,-17,4,2);
 }else if(kind==='butterfly'){
  ellipse(g,c,-9,-7+flutter,10,9);ellipse(g,c,9,-7-flutter,10,9);
  ellipse(g,'#f8e5bd',-7,-8+flutter,4,4);ellipse(g,'#f8e5bd',7,-8-flutter,4,4);
  ellipse(g,'#5d5a53',0,-6,3,11);line(g,'#5d5a53',[[-1,-15],[-5,-20]],1);line(g,'#5d5a53',[[1,-15],[5,-20]],1);
 }else if(kind==='flower'){
  line(g,'#579f65',[[0,10],[0,-8]],3);for(let k=0;k<5;k++){const a=k*Math.PI*2/5;ellipse(g,c,Math.cos(a)*9,-13+Math.sin(a)*9,7,6)}ellipse(g,'#ffdfa0',0,-13,5,5);
 }else if(kind==='beetle'){
  ellipse(g,'#483c40',0,0,11,13);ellipse(g,c,-4,0,7,11);ellipse(g,c,4,0,7,11);line(g,'#e3f6db',[[0,-9],[0,9]],2);
  line(g,'#453f3b',[[-4,-10],[-10,-16]],2);line(g,'#453f3b',[[4,-10],[10,-16]],2);
 }else if(kind==='acorn'){
  ellipse(g,c,0,0,11,13);ellipse(g,'#7b5b4e',0,-10,12,6);line(g,'#624e47',[[0,-16],[3,-21]],2);
  for(let j=-1;j<=1;j++)ellipse(g,'#f0ce92',j*6,-11,2,1);
 }else if(kind==='mushroom'){
  fill(g,'#f8e9c5',-5,-2,10,16);ellipse(g,c,0,-6,16,10);ellipse(g,'#fff1cb',-6,-9,3,3);ellipse(g,'#fff1cb',6,-12,3,3);
 }else if(kind==='stone'){
  poly(g,c,[[-14,8],[-10,-7],[0,-17],[12,-9],[16,7],[8,14],[-8,13]]);
  poly(g,'#f3fcfc',[[-9,-6],[0,-13],[2,4],[-10,8]]);line(g,'#658a9c',[[2,5],[12,-6]],2);
 }else if(kind==='shell'){
  ellipse(g,c,0,-1,16,12);for(let j=-2;j<=2;j++)line(g,'#b99084',[[0,9],[j*7,-11+Math.abs(j)*3]],1);
  ellipse(g,'#fff7e5',0,7,14,5);
 }
 g.restore();
}
function drawNatureFind(g,o){
 const n=NATURE_SPECIES.find(n=>n.id===o.species);if(!n)return;
 ellipse(g,'#416c5380',o.x,o.y,21,7);
 ellipse(g,'#fff0b5',o.x,o.y-9+Math.sin(tick*2+o.site)*3,24,20);
 drawNatureGlyph(g,n.kind,o.x,o.y-11+Math.sin(tick*2+o.site)*3,n.hue,tick*4);
 for(let j=0;j<3;j++){const angle=j*TAU/3+tick*.6;fill(g,'#fff9de',o.x+Math.cos(angle)*22,o.y-11+Math.sin(angle)*20,3,3)}
}
function collectNature(obj){
 if(!obj||obj.type!=='discovery'||!Number.isInteger(obj.site)||!NATURE_SPOTS[obj.site])return;
 if(state.nature.collectedDay!==state.day)refreshNatureFinds();
 if(state.nature.collectedSites.includes(obj.site))return notify('You already explored this spot today.');
 const n=natureSpeciesAt(obj.site);if(n.id!==obj.species)return refreshNatureFinds();
 state.nature.collectedSites.push(obj.site);
 const first=!(state.nature.found[n.id]>0)&&!state.nature.donated.includes(n.id);
 state.nature.found[n.id]=Math.min(99,(state.nature.found[n.id]||0)+1);
 objects.splice(objects.indexOf(obj),1);
 state.needs.fun=clamp(state.needs.fun+(first?8:3),0,100);
 save();updateUI();notify(`${first?'✨ New discovery!':'🍃 Found another'} ${n.name} · Field Guide updated!`);
}
function natureIcon(n){return `<span class="nature-tile" style="--nature:${n.hue}" aria-hidden="true">${{flower:'✿',leaf:'❧',butterfly:'⋈',beetle:'✧',stone:'◆',shell:'◕',acorn:'♣',mushroom:'♠'}[n.kind]}</span>`}
function natureStats(){return {donated:state.nature.donated.length,seen:NATURE_SPECIES.filter(n=>state.nature.donated.includes(n.id)||state.nature.found[n.id]>0).length}}
function natureHeader(){const {seen,donated}=natureStats();return `<div class="nature-cover"><div class="nature-eyebrow">MAPLEWOOD NATURE SOCIETY</div><h2>🌿 The Field Guide</h2><p>Follow glittering wild treasures along the paths. The village changes its discoveries with the seasons.</p><div class="nature-stats"><span>🔎 ${seen} / ${NATURE_SPECIES.length} discovered</span><span>🏛️ ${donated} displayed</span><span>🍃 ${6-state.nature.collectedSites.length} finds left today</span></div></div>`}
function natureGuide(){
 const seasonal=NATURE_SEASONS[state.season];
 const cards=NATURE_SPECIES.map(n=>{const collected=state.nature.found[n.id]||0,donated=state.nature.donated.includes(n.id),visible=collected||donated;
  return `<div class="nature-card ${visible?'':'unknown'}">${natureIcon(n)}<div><b>${visible?escapeHtml(n.name):'??? Undiscovered'}</b><small>${n.season===-1?'Any season':NATURE_SEASONS[n.season]} · ${visible?escapeHtml(n.desc):'Keep exploring to reveal this treasure.'}</small><small>${donated?'✓ In the Cabinet':collected?`${collected} in your satchel`:'Not found yet'}</small></div></div>`;
 }).join('');
 showModal('nature-guide',`${natureHeader()}<div class="nature-tabs">${btn('🏛️ Walk to the Little Museum','museum-visit')}${btn('📋 Collection directory','nature-gallery')}${btn('🍃 Go exploring','nature-close')}${btn('🕸️ Hunt insects','bug-hunt')}</div><p class="nature-tip">Current season: <b>${seasonal}</b> · Wild finds refresh at the start of each new in-game day.</p><div class="nature-list">${cards}</div>`);
}
function natureCabinet(){
 const {donated}=natureStats();
 const cards=NATURE_SPECIES.map(n=>{const inSatchel=state.nature.found[n.id]||0,displayed=state.nature.donated.includes(n.id);
  return `<div class="nature-card ${displayed?'displayed':''}">${natureIcon(n)}<div><b>${displayed||inSatchel?escapeHtml(n.name):'Hidden Exhibit'}</b><small>${displayed?escapeHtml(n.desc):inSatchel?'A new treasure for the village display.':'Discover this treasure around Maplewood.'}</small></div><div class="nature-donate">${displayed?'<span>✓</span>':inSatchel?`<button data-act="nature-donate" data-id="${n.id}">Donate</button>`:'<span>🔒</span>'}</div></div>`;
 }).join('');
 showModal('nature-gallery',`<div class="nature-cover"><div class="nature-eyebrow">THE VILLAGE COLLECTION</div><h2>🏛️ Curiosity Cabinet</h2><p>Every discovery has a home here. Donate one of each treasure to fill the displays and help Maplewood flourish.</p><div class="nature-stats"><span>🏛️ ${donated} / 16 exhibits</span><span>🪙 18 coins per first donation</span></div></div><p class="nature-tip">Find the village noticeboard beside the market path, or return here from your journal.</p>${btn('🚪 Visit the Museum','museum-visit')}${btn('📖 View Field Guide','nature-guide')}<div class="nature-list">${cards}</div><p class="nature-tip">Milestone exhibitions at 4, 8, 12, and 16 donations award one-time village grants.</p>`);
}
function donateNature(id){
 const n=NATURE_SPECIES.find(n=>n.id===id);if(!n||state.nature.donated.includes(id)||!(state.nature.found[id]>0))return natureCabinet();
 state.nature.found[id]--;state.nature.donated.push(id);state.coins+=18;
 let reward=0;const count=state.nature.donated.length;
 if([4,8,12,16].includes(count)&&!state.nature.exhibitRewards.includes(count)){
  state.nature.exhibitRewards.push(count);reward=count*12;state.coins+=reward;
 }
 save();updateUI();notify(`🏛️ ${n.name} joins the display! +18 coins${reward?` · Exhibition grant +${reward}`:''}`);
 natureCabinet();
}
function trackNature(id){return natureGuide()}


function museumExhibit(i){
 const n=NATURE_SPECIES[i];if(!n)return;
 const displayed=state.nature.donated.includes(n.id),amount=state.nature.found[n.id]||0,known=displayed||amount>0;
 const html='<div class="museum-exhibit"><div class="museum-mini">'+natureIcon(n)+'</div><small>THE LITTLE MUSEUM · EXHIBIT '+String(i+1).padStart(2,'0')+'</small><h2>'+(known?escapeHtml(n.name):'A mystery exhibit')+'</h2><p>'+(known?escapeHtml(n.desc):'An empty case awaits its very first treasure.')+'</p><div class="museum-placard">'+(known?escapeHtml(n.season===-1?'Found all year':NATURE_SEASONS[n.season]):'Undiscovered')+' · '+(displayed?'✓ On display':amount?amount+' in satchel':'Waiting for a discovery')+'</div><p>'+(displayed?'This original specimen is part of Maplewood’s permanent collection.':amount?'You have this discovery in your satchel. Would you like to donate one?':'Explore the village in the right season to find its treasure.')+'</p>'+(!displayed&&amount?'<button data-act="nature-donate" data-id="'+n.id+'">Donate '+escapeHtml(n.name)+'</button>':'')+'<button data-act="museum-desk">Visit the curator</button><button data-act="museum-close">Continue exploring</button></div>';
 showModal('museum-exhibit',html);
}
function museumDesk(){
 const count=state.nature.donated.length,available=NATURE_SPECIES.filter(n=>(state.nature.found[n.id]||0)>0&&!state.nature.donated.includes(n.id)),done=state.nature.museumTourDay===state.day;
 const html='<div class="museum-desk"><div class="museum-mini museum-desk-symbol">🏛️</div><small>WELCOME TO THE LITTLE MUSEUM</small><h2>The Curator’s Desk</h2><p>Every little wonder in Maplewood deserves a place to shine. Explore the gallery or leave a discovery for everyone to enjoy.</p><div class="nature-stats"><span>🖼️ '+count+' of 16 exhibits filled</span><span>✨ '+available.length+' donations available</span></div>'+available.map(n=>'<div class="museum-offer">'+natureIcon(n)+' <b>'+escapeHtml(n.name)+'</b><button data-act="nature-donate" data-id="'+n.id+'">Donate</button></div>').join('')+(!available.length?'<p class="museum-note">No new donations in your satchel. Explore the village for more!</p>':'')+'<button data-act="museum-tour" '+(done?'disabled':'')+'>'+(done?'✓ Guided tour enjoyed today':'🌷 Take a guided tour (+8 Fun)')+'</button><button data-act="nature-gallery">Collection directory</button><button data-act="fish-aquarium">🐟 Pond Life Gallery</button><button data-act="museum-close">Back to the galleries</button></div>';
 showModal('museum-desk',html);
}
function museumTour(){
 if(scene!=='museum')return museumDesk();
 if(state.nature.museumTourDay===state.day)return museumDesk();
 state.nature.museumTourDay=state.day;state.needs.fun=clamp(state.needs.fun+8,0,100);save();updateUI();
 notify('A lovely tour of Maplewood’s little wonders! +8 Fun 🌷');museumDesk();
}
function travelToMuseum(){
 closeModal();if(scene==='museum')return museumDesk();
 if(scene!=='town')goScene('town');
 const door=objects.find(o=>o.type==='museum');if(!door)return notify('The museum is closed for repairs.');
 goTo(approachObject(door),()=>goScene('museum'));
}

const objects=[];
function put(type,x,y,opts={}){const obj={type,x,y,...opts};objects.push(obj);return obj}
function buildTown(){objects.length=0;
 for(const [x,y,type] of [[385,470,0],[925,455,1],[385,1070,2],[1060,970,3]])put('house',x,y,{kind:type,label:['Your Cottage','Honeybun Café','Storybook Library','Town Hall'][type],action:['home','cafe','library','hall'][type]});
 RESIDENCES.forEach((site,i)=>put('residence',site.x,site.y,{kind:i,action:'residence',id:String(i)}));
 put('projectboard',1250,990,{action:'stew-board'});put('festivalstand',820,667,{action:'festival-calendar'});put('museum',1314,850,{action:'museum-entry'});put('grovegate',1270,700,{action:'grove-entry'});put('stall',530,752,{action:'market'});put('pond',940,1250,{action:'fish'});put('garden',763,416,{action:'garden'});
 put('bench',730,780);put('bench',375,812);put('bench',1050,615);put('picnic',1125,830);put('board',1032,790,{action:'nature-gallery'});put('bugstand',674,980,{action:'bug-hunt'});put('arch',820,1025);put('fence',475,525);put('fence',1120,1080);for(const [x,y,k] of [[445,560,0],[780,810,1],[900,900,2],[320,925,3],[700,1125,4],[1040,550,1],[1080,895,0],[550,1010,2]])put('flowerbed',x,y,{kind:k});
 for(const [x,y] of [[610,530],[890,775],[495,1095],[1080,1165],[350,675]])put('lamp',x,y);
 for(const [x,y,n] of [[270,430,0],[265,830,1],[230,1100,0],[920,240,2],[1100,335,0],[1190,650,1],[1210,1100,0],[660,290,0],[560,1120,2],[870,1160,1],[1300,1250,0],[580,980,1],[147,650,0]])put('tree',x,y,{kind:n});
 const shrubs=[[250,590],[486,544],[1080,525],[630,405],[905,600],[1032,790],[300,995],[805,920],[1160,850],[650,1025],[1054,1087],[765,1071],[1180,1300]];
 shrubs.forEach(([x,y],i)=>put('shrub',x,y,{kind:i%2}));
 for(let i=0;i<94;i++){let x=125+hash(i*31)*1130,y=300+hash(i*37+7)*1050;
  if((Math.abs(x-610)<120&&Math.abs(y-650)<120)||(Math.abs(x-790)<160&&Math.abs(y-750)<60)||(Math.abs(x-955)<130&&Math.abs(y-1280)<120))continue;
  put('flower',x,y,{kind:i%5,scale:.60+(i%3)*.21});}
 refreshNatureFinds();
 NPCS.forEach(n=>{n.cx=n.x;n.cy=n.y;n.direction=0;n.moving=0;n.emotion='neutral';n.emotionUntil=0;n.wanderAngle=0;n.wanderDelay=0;n.routineKey='';n.routineRoute=[];n.routineGoal=null;n.routePause=0;n.pose='idle';n.moving=0;});
}
function screenX(x){return (x-cam.x)*worldScale+W/2}
function screenY(y){return (y-cam.y)*worldScale+H*.54}
function drawArt(g,img,x,y,s=1){const w=img.width*s,h=img.height*s;g.drawImage(img,Math.floor(x-w/2),Math.floor(y-h),Math.round(w),Math.round(h));}
function tileFill(g,img,x0,y0,x1,y1){let w=img.width,h=img.height;for(let y=Math.floor(y0/h)*h;y<y1;y+=h)for(let x=Math.floor(x0/w)*w;x<x1;x+=w)g.drawImage(img,x,y)}
function pathStroke(g,pts,width){g.save();g.lineJoin='round';g.lineCap='round';g.strokeStyle='#8dae76';g.lineWidth=width+9;g.beginPath();g.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)g.lineTo(...pts[i]);g.stroke();g.strokeStyle='#f4d6a4';g.lineWidth=width;g.stroke();g.strokeStyle='#f5dbad';g.lineWidth=width-12;g.stroke();g.restore()}
function drawTownGround(g){
 g.fillStyle='#77b971';g.fillRect(-100,-100,2000,1800);tileFill(g,grassTile(),0,0,1580,1520);
 // a very deliberate 2.5D town plan: winding honey-stone roads & little clearings.
 pathStroke(g,[[600,210],[600,340],[606,520],[610,660],[610,850],[660,1000],[745,1140],[840,1240]],100);
 pathStroke(g,[[200,677],[380,681],[595,685],[820,676],[1040,660],[1320,662]],92);
 pathStroke(g,[[406,440],[424,540],[470,640]],74);
 pathStroke(g,[[915,455],[902,535],[812,641]],74);
 pathStroke(g,[[381,1030],[460,914],[570,815]],71);
 pathStroke(g,[[1044,950],[953,867],[834,739]],72);
 pathStroke(g,[[1080,790],[1190,850],[1314,872]],54);
 // Side lanes connect residential cottages to the established village paths.
 pathStroke(g,[[1040,660],[1190,563],[1325,445]],49);
 pathStroke(g,[[1070,980],[1172,1079],[1300,1110]],48);
 pathStroke(g,[[380,1080],[305,1180],[218,1293]],49);
 // Town center paved cobble motif, richer than a flat square.
 ellipse(g,'#d6b690',604,650,131,99);ellipse(g,'#fae3b5',604,642,122,91);
 for(let i=0;i<43;i++){const a=i*2.4,r=28+hash(i*3)*90;const x=604+Math.cos(a)*r,y=642+Math.sin(a)*r*.65;fill(g,'#fff1c9',x,y,6,3);fill(g,'#d3b889',x+2,y+4,3,2)}
 // pond shape on the lower lane: animated gleam, lily pads, reeds, rocks.
 ellipse(g,'#527c68',940,1255,163,99);ellipse(g,'#d4bc87',939,1251,155,94);
 ellipse(g,'#4d94a5',940,1247,143,85);ellipse(g,'#74c7c3',940,1244,135,78);
 for(let i=0;i<18;i++){const a=i*2.4,r=115+hash(i)*28;ellipse(g,i%2?'#e7d6b2':'#b1c6a2',940+Math.cos(a)*r,1245+Math.sin(a)*r*.62,5+i%4,3)}
 for(let i=0;i<8;i++){let x=850+hash(i*3)*188,y=1207+hash(i*17)*88;ellipse(g,'#3e9283',x,y,12,6);ellipse(g,'#8dc971',x-2,y-2,10,5);if(i%3===0)fill(g,'#f7a2bb',x,y-9,5,6)}
 for(let i=0;i<5;i++){const x=900+i*27,y=1244+Math.sin(tick*2+i)*9;line(g,'#d3f9df',[[x-7,y],[x+5,y]],2)}
 // Garden is a recognisable place: 4 growing beds, stone border.
 fill(g,'#b48d6f',667,307,195,144);fill(g,'#f4e3bb',671,310,187,137);
 for(let i=0;i<4;i++){let x=683+(i%2)*83,y=326+Math.floor(i/2)*55;
  fill(g,'#806049',x,y,71,43);fill(g,'#a57854',x+4,y+4,63,35);
  if((state.garden[i]||0)>0){const grown=state.garden[i]===2;for(let j=0;j<5;j++){let px=x+12+(j%3)*21,py=y+12+Math.floor(j/3)*16;fill(g,'#3b8750',px,py,4,10);fill(g,grown?['#ff9cbc','#ffe6a2','#e8abed'][j%3]:'#89c96d',px-3,py-3,9,7)}}
 }
 // flourishes that make this a decorated settlement rather than a gray plane.
 for(let i=0;i<45;i++){const x=160+hash(i*12)*1100,y=250+hash(i*64)*1150;
  if(i%4===0){fill(g,'#fff5be',x,y,4,3)}else{fill(g,'#427f55',x,y,2,5);fill(g,'#9bd882',x+2,y-2,2,4)}
 }
}
function drawHomeGround(g){
 g.fillStyle='#6aa479';g.fillRect(-200,-200,2000,1800);
 // dollhouse-like 2.5D room with thick sidewalls and papered interior.
 fill(g,'#4d675a',160,195,860,956);fill(g,'#eed09b',170,207,841,926);
 for(let y=207;y<1130;y+=floorTile().height)for(let x=170;x<1011;x+=floorTile().width)g.drawImage(floorTile(),x,y);
 fill(g,'#5e6b73',158,180,864,25);const wallThemes=[['#c5daba','#89ad88'],['#f2ccdf','#ca99b1'],['#a5cedb','#75aabd'],['#f3dab2','#ceac79']];const theme=wallThemes[state.homeStyle%4];fill(g,theme[0],169,120,840,87);
 for(let x=175;x<1000;x+=34){fill(g,theme[1],x,128,2,75);fill(g,'#fff9e6',x+3,131,2,71)}
 fill(g,'#f3e2ac',165,195,850,14);fill(g,'#af9779',169,1133,845,13);
 for(const x of [300,820]){fill(g,'#b89d7a',x-55,125,111,90);fill(g,'#fff7d9',x-48,128,97,78);fill(g,'#8ac7d9',x-42,134,86,66);fill(g,'#fef6cd',x,134,6,66);fill(g,'#fef6cd',x-42,165,86,6);for(let k=0;k<3;k++)fill(g,'#fff5c6',x-36+k*30,142,15,2)}
 fill(g,'#bd735c',560,152,92,61);fill(g,'#e0a16f',568,153,76,55);fill(g,'#ffe3a1',634,180,4,5);
 ellipse(g,'#d99a78',579,524,209,120);ellipse(g,'#f3d6ad',579,516,194,112);ellipse(g,'#b8cfa5',582,524,158,85);
 // Room trim, framed keepsakes, windowsill plants and rug stitching establish depth.
 for(const x of [183,994]){fill(g,'#f9e7bc',x,201,9,930);fill(g,'#d1ab81',x+7,202,3,928)}
 for(const [xx,yy] of [[267,624],[908,700],[245,908],[903,946]]){
  ellipse(g,'#765c5844',xx,yy+18,29,7);round(g,'#b97763',xx-19,yy-1,39,23,5,'#885b50',2);
  for(let k=0;k<4;k++){oval(g,k%2?'#57985e':'#7fbf71',xx+(k-1.5)*12,yy-7-((k+1)%2)*16,17,12);}
 }
 for(let i=0;i<13;i++){const a=i*TAU/13;oval(g,'#f5d8a6',579+Math.cos(a)*176,524+Math.sin(a)*96,3,2)}
 round(g,'#ad8165',530,115,102,70,5,'#79594e',3);round(g,'#fff5dc',538,122,86,54,3);
 oval(g,'#eccb9e',581,150,24,18);oval(g,'#e88fb0',579,148,15,12);oval(g,'#fff8e2',588,142,5,4);

}
function drawResidenceGround(g){
 const unit=Number(activeResidence?.slice(1)||0),dec=state.residenceDecor[activeResidence]||0;
 const theme=HOME_THEMES[state.residenceThemes[activeResidence]??unit]||HOME_THEMES[unit];const colors=[theme.floor,theme.wall,theme.trim];
 const wall=colors[1],deep=colors[2];
 fill(g,'#618b74',-100,-100,1600,1500);
 round(g,'#4d6b62',159,120,864,1044,15,'#2d645d',6);
 fill(g,colors[0],175,250,830,885);
 for(let y=252;y<1130;y+=64)for(let x=175;x<1000;x+=64)g.drawImage(floorTile(),x,y);
 fill(g,wall,176,139,827,116);
 for(let x=190;x<990;x+=42){fill(g,deep,x,142,2,104);fill(g,'#fff3df',x+3,145,3,98)}
 fill(g,'#f8e9c9',169,246,836,13);fill(g,deep,171,1130,836,14);
 for(const x of [310,829]){
  round(g,'#a76e62',x-63,155,126,85,5);fill(g,'#f8f1d2',x-56,159,112,74);fill(g,'#88cada',x-49,165,97,62);
  fill(g,'#ffefbf',x-3,165,6,62);fill(g,'#ffefbf',x-49,193,97,6);
  for(let j=0;j<3;j++)fill(g,'#f6fbdf',x-44+j*34,175,20,3);
 }
 // The guest exit is a visible world-space door, not a hidden tab.
 round(g,'#794e4b',536,141,91,110,4);round(g,'#d69872',543,146,77,102,3);ellipse(g,'#ffe6ac',602,197,4,5);
 round(g,'#fff3dd',489,116,187,33,8,'#b68a79',2);g.fillStyle='#365f53';g.font='bold 17px sans-serif';g.textAlign='center';g.fillText('VISITING HOURS',582,139);g.textAlign='left';
 // Hand-made rug, textile seams, flower pots, framed wall art.
 ellipse(g,deep,585,626,242,108);ellipse(g,'#fff4e2',585,620,227,96);ellipse(g,wall,585,619,203,79);
 for(let i=0;i<22;i++){const a=i*TAU/22;ellipse(g,'#ffe5c3',585+Math.cos(a)*215,619+Math.sin(a)*85,3,3)}
 round(g,'#9a715c',677,167,80,65,5,'#e0bc90',4);round(g,'#fff1d5',683,172,67,55,3);ellipse(g,'#f6acac',717,193,22,14);ellipse(g,'#79b676',714,188,12,7);
 for(const [x,y] of [[211,490],[948,405],[203,890],[949,920]]){
  round(g,'#ae795c',x-23,y,46,36,5);for(let j=0;j<5;j++)ellipse(g,j%2?'#63b67a':'#399767',x+Math.sin(j*2)*21,y-16-Math.cos(j)*13,16,14);
 }
 // Room identity and comfort improve visibly in the world.
 if(dec>=1){drawFurniture(g,'flowers',466,424);drawFurniture(g,'plant',909,682)}
 if(dec>=2){drawFurniture(g,'lamp',464,834);drawFurniture(g,'rug',760,877);
  for(let i=0;i<6;i++){const x=290+i*115;ellipse(g,'#fff6de',x,258,11,5);fill(g,'#dfb17b',x,261,4,6)}}
 if(dec>=3){drawFurniture(g,'flowers',742,334);drawFurniture(g,'chair',892,825);drawFurniture(g,'books',410,896);
  for(let j=0;j<4;j++)ellipse(g,['#f7a8c3','#fff0a7','#bcaaf6','#a5dbb4'][j],441+j*67,221,8,7)}
}
function drawResidenceFurniture(g){
 const unit=Number(activeResidence?.slice(1)||0),isDouble=roomResidents().length>1;
 drawFurniture(g,'bed',311,465);
 if(isDouble)drawFurniture(g,'bed',350,757);
 drawFurniture(g,'sofa',805,515);drawFurniture(g,'kitchen',822,327);
 drawFurniture(g,'books',338,307);
 drawFurniture(g,'chair',786,801);
 drawFurniture(g,'flowers',695,554);
 const props=state.residenceProps[activeResidence]||[];
 props.forEach((f,i)=>{if(placement?.residence&&placement.moveIndex===i)return;drawPlacedFurniture(g,f)});
 if(placement?.residence){const f=placement.moveIndex!==undefined?props[placement.moveIndex]:placement;
  g.save();g.globalAlpha=.6;drawPlacedFurniture(g,{kind:f.kind,x:placement.x,y:placement.y,rot:placement.rot});g.restore();}
 const members=roomResidents();
 members.forEach((n,i)=>{if(n.id===controlledResident)return;const p=residentHomePose(n,i);drawCharacter(g,n,p.x,p.y,p.dir||'front',!!p.moving,p.phase==='using'&&p.action==='chat'?'happy':personalMood(n).name==='Cheerful'?'happy':'neutral');if(p.phase==='using'&&p.action){drawHouseholdActivity(g,p.x,p.y,p.action,Math.min(1,(roomAutonomy.get(n.id)?.elapsed||0)/4.6),i)}drawName(g,n.name,p.x,p.y-145);g.save();g.textAlign='center';g.font='21px system-ui';g.fillText(p.act,p.x+45,p.y-172+Math.sin(tick*2+i)*3);if(p.phase==='using'){g.fillStyle='#fff5c3';g.fillRect(p.x-20,p.y-166,40,4);g.fillStyle='#65bf93';g.fillRect(p.x-20,p.y-166,Math.min(40,40*(roomAutonomy.get(n.id)?.elapsed||0)/4.6),4)}g.restore()});
 if(!members.length){g.fillStyle='#547367';g.textAlign='center';g.font='bold 28px sans-serif';g.fillText('Waiting for new neighbors…',580,706);g.textAlign='left'}
}
function drawStatic(obj,g){
 const {type,x,y}=obj;
 if(type==='discovery')drawNatureFind(g,obj);
 if(type==='bugstand'){g.save();g.translate(x,y);g.fillStyle='#805c49';g.fillRect(-28,-69,8,72);g.fillRect(20,-69,8,72);g.fillStyle='#e5c78c';g.fillRect(-40,-108,80,44);g.strokeStyle='#fdf0c5';g.lineWidth=4;g.strokeRect(-40,-108,80,44);g.font='25px system-ui';g.textAlign='center';g.fillStyle='#467e64';g.fillText('🦋',0,-77);g.restore();drawName(g,'Meadow Net',x,y-125)}
 if(type==='projectboard'){stewardship.drawBoard(g,x,y);drawName(g,'Town Projects',x,y-144)}
 if(type==='festivalstand'){festival.drawStand(g,x,y,state.season,state.day);drawName(g,'Festival Plaza',x,y-141)}
 if(type==='grovegate'){HearthGrove.drawGate(g,x,y,state.season);drawName(g,'Cloverbank Grove',x,y-158)}
 if(type==='museum'){HearthMuseum.drawBuilding(g,x,y);drawName(g,'Little Museum',x,y-179);}
 if(type==='house')drawArt(g,houseArt(obj.kind),x,y,1.38);
 if(type==='residence'){drawArt(g,houseArt((obj.kind+1)%4),x,y,1.08);drawName(g,['Rosewood','Willow Lane','Clover Court'][obj.kind],x,y-213)}
 if(type==='stall')drawArt(g,stallArt(),x,y,1.60);
 if(type==='tree')drawArt(g,foliageArt(obj.kind),x,y,1.14);
 if(type==='shrub')drawArt(g,shrubArt(obj.kind),x,y,.85);
 if(type==='flower')drawArt(g,flowerArt(obj.kind),x,y,obj.scale||.8);
 if(type==='bench')drawArt(g,benchArt(),x,y,1.24);if(type==='picnic')drawArt(g,picnicArt(),x,y,1.05);if(type==='board')drawArt(g,welcomeBoardArt(),x,y,1.0);if(type==='arch')drawArt(g,flowerArchArt(),x,y,1.15);if(type==='fence')drawArt(g,fenceArt(),x,y,1.0);if(type==='flowerbed')drawArt(g,flowerbedArt(obj.kind),x,y,1.0);
 if(type==='board')drawName(g,'Curiosity Cabinet',x,y-112);
 if(type==='lamp')drawArt(g,lampArt(),x,y,1.1);
 if(type==='pond'){const s=Math.sin(tick*2)*2;ellipse(g,'#d8fcf3',x+30,y-40+s,26,2)}
 if(type==='garden'){
  for(let i=0;i<8;i++){const xx=x-99+i*24;fill(g,'#fff5de',xx,308,12,7)}
  fill(g,'#fff3d1',703,299,84,15);fill(g,'#5c745e',716,302,59,2);
 }
}
function drawHomeFurniture(g){
 // Keep original save positions compatible; draw all purchased items at their stored coordinates.
 drawFurniture(g,'bed',332,430);drawFurniture(g,'sofa',803,489);drawFurniture(g,'kitchen',840,309);drawFurniture(g,'books',342,314);
 for(let i=0;i<state.placed.length;i++){
  if(placement?.moveIndex===i)continue;
  const f=state.placed[i];drawPlacedFurniture(g,{kind:f.kind,x:Math.abs(f.x||0)<40?575+(f.x||0)*28:(f.x||540),y:Math.abs(f.z||0)<40?600+(f.z||0)*25:(f.z||500),rot:f.rot||0});
 }
 if(placement){const f=placement.moveIndex!==undefined?state.placed[placement.moveIndex]:placement;
  g.save();g.globalAlpha=.62;drawPlacedFurniture(g,{kind:f.kind,x:placement.x??575,y:placement.y??670,rot:placement.rot||0});g.restore();}
}

function drawPlacedFurniture(g,f){
 if(!f)return;g.save();g.translate(f.x,f.y);g.rotate(((f.rot||0)%4)*Math.PI/2);drawFurniture(g,f.kind,0,0);g.restore();
}
function drawFurniture(g,kind,x,y){const a=kind;
 ellipse(g,'#355e4b44',x,y+3,50,11);
 if(a==='bed'){
  fill(g,'#846054',x-76,y-68,150,76);fill(g,'#f7efdf',x-68,y-70,137,65);fill(g,'#f2c4ca',x-68,y-28,136,21);fill(g,'#e29aa3',x-68,y-7,136,7);fill(g,'#fff8e8',x-62,y-65,57,30);fill(g,'#e9e7d0',x-2,y-65,57,30);fill(g,'#906b5a',x-76,y-78,150,10);
 } else if(a==='sofa'){
  fill(g,'#765d5a',x-66,y-89,132,86);fill(g,'#df91a6',x-67,y-88,130,70);fill(g,'#f1c0c4',x-60,y-78,119,33);fill(g,'#cf8495',x-66,y-45,132,27);fill(g,'#ffeac0',x-46,y-73,32,26);fill(g,'#ffeac0',x+14,y-73,32,26);
 }else if(a==='kitchen'){
  fill(g,'#907d6e',x-88,y-94,170,82);fill(g,'#fff0d0',x-82,y-90,164,75);fill(g,'#a77a5b',x-87,y-95,175,12);for(let i=0;i<3;i++){fill(g,'#d8b58b',x-72+i*55,y-67,47,52);fill(g,'#f4d6a6',x-65+i*55,y-62,34,43)}fill(g,'#474c57',x+34,y-91,13,8);
 }else if(a==='books'){
  fill(g,'#765545',x-45,y-144,90,143);fill(g,'#d3a56e',x-40,y-138,80,133);for(let i=0;i<4;i++){fill(g,'#895d48',x-35,y-128+i*30,70,5);for(let j=0;j<6;j++){const c=['#ba7779','#65a79c','#e4c471','#7793b3'][j%4];fill(g,c,x-30+j*11,y-121+i*30,8,20)}}
 }else if(a==='chair'){fill(g,'#806957',x-28,y-65,55,62);fill(g,'#dcaa77',x-27,y-62,52,30);fill(g,'#b17d5f',x-24,y-29,48,16)}
 else if(a==='plant'){fill(g,'#aa7864',x-17,y-28,34,30);for(let j=0;j<7;j++)ellipse(g,j%2?'#4b9c67':'#6cbe73',x+Math.sin(j*2.4)*19,y-44+Math.cos(j)*10,17,16)}
 else if(a==='lamp'){fill(g,'#9e7b55',x-5,y-80,10,83);poly(g,'#ffdeb0',[[x-32,y-82],[x-23,y-112],[x+23,y-112],[x+32,y-82]])}
 else if(a==='rug'){ellipse(g,'#d17d8f',x,y,67,36);ellipse(g,'#ffe1b3',x,y,55,26);ellipse(g,'#add5b6',x,y,45,20)}
 else if(a==='flowers'){fill(g,'#82a7bd',x-11,y-35,22,30);for(let j=0;j<5;j++){line(g,'#4c9c64',[[x,y-31],[x+(j-2)*12,y-53]],2);ellipse(g,['#f98ca8','#fff1a0','#c8a8ea'][j%3],x+(j-2)*12,y-56,7,6)}}
}

// Original pixel props and hand-drawn motion marks for daily household activities.
// Rendered in the same world coordinates as the character (never a separate menu).
function drawHouseholdActivity(g,x,y,kind,progress=0,seed=0){
 if(!HOME_ACTIONS[kind])return;
 const drift=Math.sin(tick*3+seed)*4,shimmer=Math.sin(tick*5+seed);
 g.save();
 const bx=x+46,by=y-98+drift;
 // Warm cream speech panel, pixel-stepped corners, and forest-green outline.
 g.fillStyle='#3b6054';g.fillRect(bx-38,by-37,79,69);
 g.fillStyle='#fff3d9';g.fillRect(bx-34,by-34,71,62);
 g.fillStyle='#f1e4c8';g.fillRect(bx-32,by+23,67,4);
 const px=bx-1,py=by-6;
 if(kind==='meal'){
  ellipse(g,'#a56c59',px,py+11,20,8);ellipse(g,'#fff8e7',px,py+7,18,8);
  ellipse(g,'#eca96e',px,py+6,14,5);
  for(let i=0;i<3;i++){let sx=px-12+i*12;line(g,'#78b99b',[[sx,py-2+shimmer*3],[sx+2,py-10+shimmer*3],[sx-1,py-16+shimmer*3]],2)}
  line(g,'#a9a3a0',[[px+17,py-4],[px+23,py-20]],3)
 }else if(kind==='read'){
  poly(g,'#8c6358',[[px-24,py-14],[px-2,py-7],[px+1,py+17],[px-23,py+10]]);
  poly(g,'#8c6358',[[px+1,py+17],[px+4,py-7],[px+24,py-14],[px+23,py+10]]);
  poly(g,'#fff9df',[[px-21,py-12],[px-2,py-4],[px,py+13],[px-20,py+7]]);
  poly(g,'#ffeed4',[[px+2,py+13],[px+4,py-4],[px+21,py-12],[px+20,py+7]]);
  line(g,'#bf9c95',[[px-16,py-5],[px-5,py-1]],2);line(g,'#bf9c95',[[px+6,py-1],[px+17,py-5]],2)
 }else if(kind==='rest'){
  round(g,'#f0a5b7',px-25,py-5,50,27,6,'#ba7d91',2);
  round(g,'#fff8e8',px-21,py-12,21,14,5);
  for(let i=0;i<3;i++){const sy=py-12-i*11-(tick*6%10);g.font=`bold ${13+i*2}px sans-serif`;g.fillStyle='#65859b';g.fillText('z',px+10+i*5,sy)}
 }else if(kind==='tidy'){
  line(g,'#ae8157',[[px+14,py-24],[px-7,py+20]],4);
  poly(g,'#e4ab6a',[[px-18,py+8],[px+1,py+15],[px-3,py+22],[px-24,py+15]]);
  for(let i=0;i<3;i++){const dx=px-19+i*21,dy=py-14+(i%2)*8+shimmer*2;fill(g,'#e9bf67',dx-2,dy,6,4);fill(g,'#fff5ad',dx,dy-4,2,12)}
 }else if(kind==='chat'){
  const bob=Math.sin(tick*3)*3;
  ellipse(g,'#f6a0b0',px-12,py+bob,12,11);ellipse(g,'#f6a0b0',px+10,py+bob,12,11);
  poly(g,'#df7897',[[px-23,py+bob+4],[px,py+bob+24],[px+23,py+bob+4]]);
  fill(g,'#fff1d5',px-2,py-16,5,9)
 }else if(kind==='hobby'){
  // An unfurled creative toolkit, with a small unique-colored charm.
  round(g,'#b77f63',px-24,py-3,47,25,4,'#7e5a55',2);
  poly(g,'#fff4d8',[[px-15,py-15],[px+12,py-15],[px+20,py+14],[px-18,py+14]]);
  line(g,'#63a99a',[[px-10,py+2],[px+10,py-6]],3);
  ellipse(g,'#f0a7bc',px+14,py+6,5,5)
 }
 // Completion bar reflects actual time remaining; no fake percentage on the artwork.
 fill(g,'#d9e5c4',bx-29,by+26,60,4);
 fill(g,'#6dbb93',bx-29,by+26,60*clamp(progress,0,1),4);
 g.restore();
}
function drawCharacter(g,o,x,y,dir='front',moving=false,expression='neutral'){
 ellipse(g,'#21474444',x,y-2,28,7);
 const frame=moving?Math.floor(tick*8)%2:0;
 drawArt(g,charArt(o,dir,frame,expression),x,y-(moving?Math.abs(Math.sin(tick*13))*3:Math.sin(tick*2+(o.x||0)*.001)*1.2),1.08);
}
function drawScene(){if(!W||!H)return;
 ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=false;
 ctx.fillStyle=scene==='town'?'#74b470':'#7cb58c';ctx.fillRect(0,0,W,H);
 ctx.save();ctx.translate(W/2,H*.54);ctx.scale(worldScale,worldScale);ctx.translate(-cam.x,-cam.y);
 if(scene==='town'){drawTownGround(ctx);stewardship.drawProjects(ctx,{season:state.season,tick});stewardship.festivalStalls(ctx,{season:state.season,day:state.day,tick});festivalMarket.decorate(ctx,{season:state.season,day:state.day,tick});festival.drawTown(ctx,{season:state.season,day:state.day,tick});community.drawTown(ctx,{season:state.season,day:state.day,tick});villageLife.drawDecor(ctx,{season:state.season,day:state.day,tick});neighborScenes.draw(ctx,{tick});drawWeddingVenue(ctx);}else if(scene==='grove')HearthGrove.draw(ctx,{season:state.season,record:groveRecord(),tick});else if(scene==='museum')HearthMuseum.drawRoom(ctx,{species:NATURE_SPECIES,donated:state.nature.donated,tick,season:state.season});else if(scene==='residence'){drawResidenceGround(ctx);homeAspirations.drawWall(ctx,{home:activeResidence,members:roomResidents().map(n=>n.id)});functionalHomes.draw(ctx,activeResidence);}else{drawHomeGround(ctx);homeAspirations.drawWall(ctx,{home:'player'});functionalHomes.draw(ctx,'player');}
 if(scene==='town'){
  const ordered=objects.map(o=>({...o,draw:0})).concat(NPCS.map(o=>({...o,type:'npc',draw:1})),[{type:'player',x:player.x,y:player.y,draw:2}]).sort((a,b)=>a.y-b.y);
  for(const o of ordered){if(Math.abs(o.x-cam.x)>W/worldScale*.85+230||Math.abs(o.y-cam.y)>H/worldScale*.85+230)continue;
   if(o.type==='npc'){
    const original=NPCS.find(n=>n.id===o.id);
    drawCharacter(ctx,original,o.x,o.y,original.moving>0?original.facing||'front':'front',original.moving>0,original.emotionUntil>tick?original.emotion:'neutral');
    drawActivity(ctx,original,o.x,o.y);
    if(Math.hypot(player.x-o.x,player.y-o.y)<175){
     drawName(ctx,o.name,o.x,o.y-151);
     const feeling=personalMood(original);
     if(['Exhausted','Hungry','Lonely','Restless'].includes(feeling.name)){
      ctx.save();ctx.font='18px system-ui';ctx.textAlign='center';ctx.fillText(feeling.icon,o.x-44,o.y-163);ctx.restore();
     }
     if(original.moving===0&&!talk){const activity=currentRoutine(original);
      ctx.font='18px system-ui';ctx.textAlign='center';ctx.fillText(activity.icon,o.x+48,o.y-169+Math.sin(tick*1.5+o.x)*2);ctx.textAlign='left'}
    }
   }else if(o.type==='player')drawCharacter(ctx,playerDef(),player.x,player.y,player.facing,!!player.target);
   else drawStatic(o,ctx);
  }
  drawCoupleSparkles(ctx);
 }else{
  if(scene==='residence')drawResidenceFurniture(ctx);else if(scene==='home')drawHomeFurniture(ctx);
  drawCharacter(ctx,playerDef(),player.x,player.y,player.facing,!!player.target,householdHold?.kind==='chat'?'happy':'neutral');
  if(householdHold&&householdHold.where===scene)drawHouseholdActivity(ctx,player.x,player.y,householdHold.kind,1-householdHold.remaining/householdHold.duration,3);
 }
 if(scene==='grove')HearthGrove.drawFront(ctx,{tick});
 ctx.restore();
 // soft late-afternoon/night vignette never obscures pixel art.
 const hour=state.minute/60;if(hour>=19||hour<6){const alpha=hour>=19?Math.min(.24,(hour-19)*.055):.19;ctx.fillStyle=`rgba(32,48,87,${alpha})`;ctx.fillRect(0,0,W,H)}
 if(talk){const n=NPCS.find(n=>n.id===talk);if(n){const rp=scene==='residence'?residentHomePose(n,roomResidents().findIndex(m=>m.id===n.id)):null;const sx=screenX(rp?.x??n.x),sy=screenY((rp?.y??n.y)-156);$('emote').style.left=sx+'px';$('emote').style.top=sy+'px'}}
 if(modal==='fish'&&$('bobber'))$('bobber').style.left=(((Math.sin(tick*4)+1)/2)*98)+'%';
}
function drawName(g,name,x,y){g.font='900 13px monospace';let textW=g.measureText(name).width;fill(g,'#295955',x-textW/2-8,y-14,textW+16,22);fill(g,'#fff7d7',x-textW/2-4,y-11,textW+8,17);g.textAlign='center';g.fillStyle='#3a6551';g.fillText(name,x,y+1);g.textAlign='left'}
function resize(){W=Math.max(280,innerWidth);H=Math.max(350,innerHeight);DPR=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);canvas.style.width=W+'px';canvas.style.height=H+'px';worldScale=scene==='grove'?clamp(W/530,.69,1.04):scene==='museum'?clamp(W/530,.70,1.04):scene!=='town'?clamp(W/770,.47,.86):clamp(W/530,.69,1.17);ctx.imageSmoothingEnabled=false}
// Characters navigate walkable corridors; scenery is no longer intangible.
const NAV_STEP=35;
function isWalkable(x,y,where=scene,ignoreNpc=false){
 if(where==='grove')return HearthGrove.walkable(x,y);
 if(where==='museum')return x>=532&&x<=628&&y>=290&&y<=1495;
 if(where==='home'||where==='residence'){
  if(x<215||x>958||y<260||y>1070)return false;
  for(const [fx,fy,rx,ry] of [[332,430,95,62],[803,489,85,67],[840,309,100,64],[342,314,72,70]])
   if(Math.abs(x-fx)<rx&&Math.abs(y-fy)<ry)return false;
  const placedHere=where==='residence'?state.residenceProps[activeResidence]||[]:state.placed;
  for(const f of placedHere){if(f.kind==='rug')continue;if(Math.abs(x-f.x)<47&&Math.abs(y-(f.y??f.z))<36)return false}
  return true;
 }
 if(x<80||x>1440||y<190||y>1460)return false;
 // House foundations, market, garden plots, pond, and decorative props.
 for(const o of objects){
  if(o.type==='grovegate'&&Math.abs(x-o.x)<16&&Math.abs(y-(o.y-6))<16)return false;
  if(o.type==='museum'&&Math.abs(x-o.x)<103&&y>o.y-92&&y<o.y-8)return false;
  if(o.type==='house'&&Math.abs(x-o.x)<113&&y>o.y-92&&y<o.y-8)return false;
  if(o.type==='residence'&&Math.abs(x-o.x)<95&&y>o.y-80&&y<o.y-7)return false;
  if(o.type==='stall'&&Math.abs(x-o.x)<64&&y>o.y-47&&y<o.y+5)return false;
  if(o.type==='garden'&&x>655&&x<874&&y>297&&y<459)return false;
  if(o.type==='pond'&&((x-940)/151)**2+((y-1249)/89)**2<1)return false;
  if(o.type==='tree'&&Math.hypot(x-o.x,y-(o.y-15))<23)return false;
  if(o.type==='lamp'&&Math.hypot(x-o.x,y-o.y)<13)return false;
  if(o.type==='fence'&&Math.abs(x-o.x)<71&&Math.abs(y-o.y)<17)return false;
  if(o.type==='picnic'&&Math.abs(x-o.x)<61&&Math.abs(y-o.y)<21)return false;
 }
 if(!ignoreNpc)for(const n of NPCS){if(Math.hypot(x-n.x,y-n.y)<25)return false}
 return true;
}
function nearestWalkable(dest,where=scene,ignoreNpc=false){
 const b=where==='grove'?{minx:330,maxx:860,miny:185,maxy:1380}:where==='museum'?{minx:532,maxx:628,miny:290,maxy:1495}:where!=='town'?{minx:225,maxx:947,miny:270,maxy:1055}:{minx:90,maxx:1430,miny:200,maxy:1450};
 const point={x:clamp(dest.x,b.minx,b.maxx),y:clamp(dest.y,b.miny,b.maxy)};
 if(isWalkable(point.x,point.y,where,ignoreNpc))return point;
 for(let r=16;r<=250;r+=16)for(let i=0;i<24;i++){
  const a=i*Math.PI/12,p={x:clamp(point.x+Math.cos(a)*r,b.minx,b.maxx),y:clamp(point.y+Math.sin(a)*r,b.miny,b.maxy)};
  if(isWalkable(p.x,p.y,where,ignoreNpc))return p;
 }
 return null;
}
function findPath(start,dest,where=scene){
 const b=where==='grove'?{minx:330,maxx:860,miny:185,maxy:1380}:where==='museum'?{minx:525,maxx:635,miny:280,maxy:1510}:where!=='town'?{minx:215,maxx:960,miny:260,maxy:1070}:{minx:80,maxx:1440,miny:190,maxy:1460};
 const width=Math.floor((b.maxx-b.minx)/NAV_STEP)+1,height=Math.floor((b.maxy-b.miny)/NAV_STEP)+1;
 const idx=(cx,cy)=>cy*width+cx;
 const coord=(x,y)=>({x:b.minx+x*NAV_STEP,y:b.miny+y*NAV_STEP});
 const nearest=(p)=>({x:clamp(Math.round((p.x-b.minx)/NAV_STEP),0,width-1),y:clamp(Math.round((p.y-b.miny)/NAV_STEP),0,height-1)});
 const a=nearest(start),z=nearest(dest),from=idx(a.x,a.y),to=idx(z.x,z.y);
 const pass=(x,y)=>{if(x<0||y<0||x>=width||y>=height)return false;const pt=coord(x,y);return isWalkable(pt.x,pt.y,where,true)};
 const q=[from],came=new Map([[from,-1]]),directions=[[1,0],[-1,0],[0,1],[0,-1]];
 let found=-1,closest=from,minDist=Infinity;
 for(let qi=0;qi<q.length;qi++){
  const cur=q[qi],cx=cur%width,cy=Math.floor(cur/width),d=Math.abs(cx-z.x)+Math.abs(cy-z.y);
  if(d<minDist){minDist=d;closest=cur}
  if(cur===to){found=cur;break}
  if(q.length>width*height)break;
  for(const [dx,dy] of directions){const nx=cx+dx,ny=cy+dy,n=idx(nx,ny);if(pass(nx,ny)&&!came.has(n)){came.set(n,cur);q.push(n)}}
 }
 // A nearest reachable node is better than walking through solid scenery.
 let cur=found>=0?found:closest,path=[];
 while(cur!==from&&came.has(cur)){path.push(coord(cur%width,Math.floor(cur/width)));cur=came.get(cur)}
 path.reverse();
 // Remove redundant collinear grid nodes for a smoother and more economical route.
 const simplified=[];
 for(let i=0;i<path.length;i++){
  const prev=simplified[simplified.length-1],next=path[i+1],p=path[i];
  if(prev&&next&&((prev.x===p.x&&p.x===next.x)||(prev.y===p.y&&p.y===next.y)))continue;
  simplified.push(p);
 }
 if(found>=0&&isWalkable(dest.x,dest.y,where,true))simplified.push(dest);
 return simplified;
}
function goTo(dest,after){
 const safe=nearestWalkable(dest);
 if(!safe){notify('That spot is out of reach.');return}
 const route=findPath(player,safe);
 if(!route.length&&Math.hypot(player.x-safe.x,player.y-safe.y)>32){notify('No clear path there.');return}
 player.target={x:safe.x,y:safe.y,route,after};
 if(Math.hypot(safe.x-player.x,safe.y-player.y)<24){const t=player.target;player.target=null;if(t.after)t.after()}
}
function approachObject(o){
 const access=o.type==='house'?{x:o.x+122,y:o.y+27}:
  o.type==='garden'?{x:764,y:478}:
  o.type==='pond'?{x:940,y:1360}:
  o.type==='museum'?{x:1165,y:890}:
  o.type==='grovegate'?{x:o.x-85,y:o.y+52}:
  o.type==='projectboard'?{x:o.x+75,y:o.y+65}:
  o.type==='stall'?{x:o.x+28,y:o.y+45}:{x:o.x,y:o.y+45};
 return nearestWalkable(access)||access;
}
function approachNeighbor(n){return nearestWalkable({x:n.x-51,y:n.y+35},scene,true)||{x:n.x-55,y:n.y+38}}

function goScene(next){if(scene==='grove'&&next==='town'){scene='town';goScene('town');player.x=1165;player.y=764;cam.x=1165;cam.y=764;updateUI();save();return;}if(scene==='museum'&&next==='town'){scene='town';goScene('town');player.x=1166;player.y=900;cam.x=1166;cam.y=900;updateUI();save();return;}if(scene==='residence'&&next==='town')return leaveResidence();if(dateMoment){const v=NPCS.find(n=>n.id===dateMoment.id);if(v)v.routineKey='';dateMoment=null;}if(talk)closeTalk();closeModal();stopPlacement();scene=next;activeResidence=null;controlledResident=null;stopRoutine();
 if(next==='grove'){const r=groveRecord();if(r.visitDay!==state.day){r.visitDay=state.day;r.visits=Math.min(9999,r.visits+1)}player.x=615;player.y=1232;cam.x=615;cam.y=1124;}else if(next==='museum'){player.x=579;player.y=1395;cam.x=579;cam.y=1230;}else if(next==='home'){player.x=575;player.y=670;cam.x=575;cam.y=650;}else{player.x=566;player.y=621;cam.x=566;cam.y=620;}
 resize();updateUI();save();notify(next==='grove'?'The woodland trail is yours to explore! 🌲':next==='museum'?'Welcome to the Little Museum! ✨':next==='home'?'Home sweet home! 🏡':'Out into the sunshine! 🌷')}
function beginPlacement(obj){
 if(scene!=='home'&&scene!=='residence')return;
 const moving=obj.moveIndex!==undefined,fromStorage=obj.storageIndex!==undefined;
 const home=scene==='residence'?activeResidence:'player';
 const source=obj.residence?state.residenceProps[activeResidence]:state.placed;
 const item=moving?source?.[obj.moveIndex]:fromStorage?littleAtelier.storedItem(obj.storageIndex,home):obj;
 if(!item)return;
 placement={...obj,kind:item.kind,x:item.x??575,y:item.y??item.z??660,rot:item.rot||0,residence:scene==='residence',room:activeResidence};
 closeModal();const hint=$('placementHint');hint.classList.remove('hidden');
 $('placementText').textContent=moving?'Drag or tap a new spot for this item':'Drag or tap a clear space to place the item';
 $('rotatePlacement').hidden=false;notify('Arrange your furniture. Rotate or cancel any time. 🌷');
}
function stopPlacement(){placement=null;$('placementHint').classList.add('hidden');$('rotatePlacement').hidden=true}
function rotatePlacement(){if(!placement)return;placement.rot=((placement.rot||0)+1)%4;notify('Turned your furniture ↻')}
function chooseFurniturePosition(wx,wy){return{x:Math.round(clamp(wx,265,942)/12)*12,y:Math.round(clamp(wy,305,1020)/12)*12}}
function arrangePosition(wx,wy){if(!placement)return;const p=chooseFurniturePosition(wx,wy);placement.x=p.x;placement.y=p.y}
function furnitureSpotFree(pos,item,where=scene,ignore=-1){
 const fixed=where==='residence'?[[311,465,98],[805,515,97],[822,327,114],[338,307,90],[786,801,60]]:[[332,430,100],[803,489,101],[840,309,110],[342,314,92]];
 if(pos.x<272||pos.x>925||pos.y<340||pos.y>1000)return false;
 if(item.kind!=='rug'&&fixed.some(([x,y,r])=>Math.hypot((pos.x-x)*.9,(pos.y-y+25)*1.1)<r))return false;
 const list=where==='residence'?state.residenceProps[activeResidence]||[]:state.placed;
 if(list.some((o,i)=>i!==ignore&&item.kind!=='rug'&&o.kind!=='rug'&&Math.hypot(pos.x-o.x,pos.y-(o.y??o.z))<72))return false;
 if(item.kind!=='rug'&&Math.hypot(pos.x-player.x,pos.y-player.y)<48)return false;
 return true;
}
function commitPlacement(wx,wy){
 if(!placement||!['home','residence'].includes(scene))return false;
 const home=scene==='residence'?activeResidence:'player',stored=placement.storageIndex!==undefined;
 const list=scene==='residence'?state.residenceProps[activeResidence]:state.placed;
 const item=placement.moveIndex!==undefined?list[placement.moveIndex]:stored?littleAtelier.storedItem(placement.storageIndex,home):placement;
 if(!item)return false;
 const pos=chooseFurniturePosition(wx,wy),move=placement.moveIndex!==undefined,rot=placement.rot||0;
 if(!furnitureSpotFree(pos,item,scene,placement.moveIndex??-1)){
  notify('That spot is occupied. Try another clear space.');return false;
 }
 if(!move&&list.length>=(scene==='residence'?8:80)){
  notify('This room is full. Store or move another furnishing first.');return false;
 }
 const info=furnitureTypes.find(f=>f.id===item.kind);
 if(!info)return false;
 const price=move||stored?0:placement.residence?Math.max(10,Math.round(info.cost*.65)):info.cost;
 if(state.coins<price){notify('Not enough coins!');return false}
 const before=littleAtelier.snapshot(home);
 if(move){
  const old=list[placement.moveIndex];
  old.x=pos.x;if(placement.residence)old.y=pos.y;else old.z=pos.y;old.rot=rot;
 }else{
  if(stored)littleAtelier.storage(home).splice(placement.storageIndex,1);
  else state.coins-=price;
  list.push(placement.residence?{kind:item.kind,x:pos.x,y:pos.y,rot}:{kind:item.kind,x:pos.x,z:pos.y,rot});
 }
 littleAtelier.commit(before,home);
 stopPlacement();save();updateUI();
 notify(stored?'Furniture returned from storage — no extra charge! ✨':'Your room is coming together! ✨');
 return true;
}
function clickWorld(x,y){if(modal||talk)return;if(householdBusy&&!placement){stopRoutine();notify('Routine paused. You are in control.');}
 const wx=(x-W/2)/worldScale+cam.x,wy=(y-H*.54)/worldScale+cam.y;
 if(placement&&(scene==='home'||scene==='residence')){commitPlacement(wx,wy);return}
 if(scene==='grove'){
  const spot=HearthGrove.hit(wx,wy);
  if(spot){goTo({x:spot.walkX,y:spot.walkY},()=>spot.id==='exit'?goScene('town'):groveActivity(spot.id));return}
  goTo({x:clamp(wx,335,855),y:clamp(wy,190,1380)});return;
 }
 if(scene==='museum'){
  const hit=HearthMuseum.hit(wx,wy);
  if(hit?.type==='exit'){goScene('town');return}
  if(hit?.type==='desk'){goTo({x:580,y:1315},museumDesk);return}
  if(hit?.type==='exhibit'){goTo({x:hit.walkX,y:hit.y},()=>museumExhibit(hit.index));return}
  goTo({x:clamp(wx,536,624),y:clamp(wy,295,1480)});return;
 }
 if(scene==='residence'){
  if(wx>510&&wx<660&&wy>90&&wy<290){leaveResidence();return}
  const members=roomResidents();
  const near=members.filter(n=>n.id!==controlledResident).map(n=>{const p=residentHomePose(n,members.findIndex(m=>m.id===n.id));return {n,p,dist:Math.hypot(wx-p.x,wy-(p.y-68))}}).sort((a,b)=>a.dist-b.dist)[0];
  if(near&&near.dist<95){goTo(nearestWalkable({x:near.p.x-80,y:near.p.y+25},'residence',true)||{x:555,y:700},()=>openTalk(near.n.id));return}
  const owned=state.residenceProps[activeResidence]||[];
  const itemIndex=owned.findIndex(f=>Math.hypot(wx-f.x,wy-f.y)<46);
  if(itemIndex>=0){
   const item=owned[itemIndex];
   goTo(nearestWalkable({x:item.x+64,y:item.y+35},'residence',true)||{x:580,y:670},
    ()=>functionalHomes.inspect(activeResidence,itemIndex));
   return;
  }
  const furn=[{x:311,y:465,kind:'rest'},{x:805,y:515,kind:'chat'},
   {x:822,y:327,kind:'meal'},{x:338,y:307,kind:'read'},{x:786,y:801,kind:'hobby'}];
  const f=furn.find(f=>Math.hypot(wx-f.x,wy-(f.y-40))<85);
  if(f){
   if(controlledResident)queueHouseholdAction(f.kind);
   else goTo(nearestWalkable({x:f.x+(f.x>600?-105:105),y:f.y+55},'residence',true)||{x:560,y:695},
    ()=>notify('A lovely functional corner! Guide a resident in the Daybook to use it.'));
   return;
  }
  if(wx>795&&wy>965){manageHousehold();return}
  goTo({x:clamp(wx,228,945),y:clamp(wy,275,1000)});return;
 }
 if(scene==='home'){
  if(wy<220){notify('A lovely sunny view out of the window!');return}
  const itemIndex=state.placed.findIndex(f=>Math.hypot(wx-f.x,wy-f.z)<45);
  if(itemIndex>=0){
   const custom=state.placed[itemIndex];
   goTo(nearestWalkable({x:custom.x+65,y:custom.z+35},'home',true)||{x:570,y:670},
    ()=>functionalHomes.inspect('player',itemIndex));
   return;
  }
  const bounds={x:clamp(wx,225,947),y:clamp(wy,275,985)};
  const fixed=[{kind:'rest',x:332,y:430},{kind:'chat',x:803,y:489},
   {kind:'kitchen',x:840,y:309},{kind:'read',x:342,y:314}];
  const near=fixed.find(o=>Math.hypot(wx-o.x,wy-(o.y-35))<80);
  if(near){
   if(near.kind==='kitchen')goTo(nearestWalkable({x:near.x-105,y:near.y+60},'home',true)||bounds,()=>kitchen.openBook());
   else queueOwnHomeAction(near.kind);
  }else goTo(bounds);
  return;
 }
 const festivalStall=festivalMarket.hit(wx,wy);if(festivalStall){goTo(nearestWalkable({x:festivalStall.walkX,y:festivalStall.walkY},'town',true)||{x:festivalStall.walkX,y:festivalStall.walkY},()=>festivalMarket.visit(festivalStall.id));return}
 const upgrade=stewardship.hit(wx,wy);if(upgrade){goTo(nearestWalkable({x:upgrade.walkX,y:upgrade.walkY},'town',true)||{x:upgrade.walkX,y:upgrade.walkY},()=>stewardship.use(upgrade.id));return}
 const character=NPCS.map(n=>({n,dist:Math.hypot(wx-n.x,wy-(n.y-66))})).sort((a,b)=>a.dist-b.dist)[0];
 if(character&&character.dist<84){const n=character.n;goTo(approachNeighbor(n),()=>openTalk(n.id));if(player.target)player.target.npcId=n.id;return}
 const actions=objects.filter(o=>o.action).map(o=>({o,dist:Math.hypot(wx-o.x,(wy-(o.type==='house'?o.y-100:o.type==='museum'?o.y-95:o.type==='residence'?o.y-77:o.type==='festivalstand'?o.y-80:o.type==='projectboard'?o.y-88:o.y-30)))})).sort((a,b)=>a.dist-b.dist);
 const hit=actions[0];if(hit&&hit.dist<(hit.o.type==='house'?150:hit.o.type==='residence'?118:hit.o.type==='museum'?148:hit.o.type==='pond'?135:hit.o.type==='festivalstand'?118:hit.o.type==='projectboard'?115:hit.o.type==='discovery'?56:90)){
  const o=hit.o;goTo(approachObject(o),()=>perform(o.action,o));return;
 }
 goTo({x:clamp(wx,65,1460),y:clamp(wy,200,1440)});
}
function perform(action,obj){if(action==='stew-board')return stewardship.board();if(action==='festival-calendar')return festival.active(state.day)?festival.play():festival.calendar();if(action==='grove-entry')return goScene('grove');if(action==='museum-entry')return goScene('museum');if(action==='collect-nature')return collectNature(obj);if(action==='nature-gallery')return natureCabinet();if(action==='fish-guide')return fishingGame.overview();if(action==='fish-aquarium')return fishingGame.aquarium();if(action==='bug-hunt')return bugHunt.journal();if(action==='residence')return housingBoard();if(action==='home')return goScene('home');if(action==='cafe')return cafe();if(action==='library'){changeNeed('fun',16);notify('You found a beautiful new story! 📖');return}if(action==='hall')return townHall();if(action==='market')return market();if(action==='garden')return garden();if(action==='fish')return fishing();}
function update(dt){tick+=dt;advanceHouseholdHold(dt);
 if(!talk&&!modal){const next=player.target;if(next){
  const point=next.route?.[0]||{x:next.x,y:next.y};let dx=point.x-player.x,dy=point.y-player.y,d=Math.hypot(dx,dy),step=Math.min(d,dt*178);
  if(d>Math.max(step,1)+2){
   const xx=player.x+dx/d*step,yy=player.y+dy/d*step;
   if(isWalkable(xx,yy,scene,true)){player.x=xx;player.y=yy;player.facing=dy < -25?'back':Math.abs(dx)>Math.abs(dy)*1.1?'side':'front';}
   else{player.target=null;notify('Something is in the way. Tap another spot!')}
  }else{
   if(isWalkable(point.x,point.y,scene,true)){player.x=point.x;player.y=point.y}
   if(next.route?.length){next.route.shift()}
   if(!next.route?.length){player.target=null;player.facing='front';if(next.after)next.after()}
  }
 }}
 if(scene==='residence')updateRoomAutonomy(dt);
 if(scene==='town'&&!talk&&!modal&&speed>0){
  for(let i=0;i<NPCS.length;i++){
   const n=NPCS[i],normal=currentRoutine(n),entry=neighborScenes.schedule(n.id,villageLife.schedule(n.id,normal)),key=`${state.day}:${entry.h}`;
   n.villageEntry=entry;n.neighborEntry=entry;
   if(player.target?.npcId===n.id){n.moving=0;continue}
   if(n.routineKey!==key){
    n.routineKey=key;n.routineGoal=nearestWalkable({x:entry.where[0],y:entry.where[1]},'town',true);
    n.routineRoute=n.routineGoal?findPath(n,n.routineGoal,'town'):[];
    n.routePause=0;
   }
   n.routePause=Math.max(0,n.routePause-dt);
   const point=n.routineRoute?.[0];
   if(!point||n.routePause>0){n.moving=0;continue}
   const dx=point.x-n.x,dy=point.y-n.y,dist=Math.hypot(dx,dy),step=Math.min(dist,dt*(65+speed*7));
   if(dist<=Math.max(2,step+1)){
    if(isWalkable(point.x,point.y,'town',true)){n.x=point.x;n.y=point.y}
    n.routineRoute.shift();n.moving=n.routineRoute.length?1:0;
   }else{
    const xx=n.x+dx/dist*step,yy=n.y+dy/dist*step;
    const neighborBlocked=NPCS.some(other=>other!==n&&Math.hypot(xx-other.x,yy-other.y)<25);
    if(!neighborBlocked&&isWalkable(xx,yy,'town',true)){
     n.x=xx;n.y=yy;n.moving=1;n.facing=dy<-.15?'back':Math.abs(dx)>Math.abs(dy)?'side':'front';
    }else{
     n.routePause=.6+(i%4)*.13;n.moving=0;
     // Replan occasionally if another villager blocks the corridor.
     if(!neighborBlocked&&n.routineGoal)n.routineRoute=findPath(n,n.routineGoal,'town');
    }
   }
  }
  settleCommunityEvent();settleFriendVisit();settleCoupleRituals();advanceDate();maybeSocialPostcard();
 }
 if(speed>0&&!modal&&!talk&&!placement){const elapsed=dt*speed*2.0;updateResidentNeeds(elapsed);state.minute+=elapsed;while(state.minute>=1440){state.minute-=1440;state.day++;if(state.day%7===1)state.season=(state.season+1)%4;refreshNatureFinds();processHousingDay();notify('A bright new day begins! 🌞');save()}
  const rate=dt*speed*.013;if(!(scene==='residence'&&controlledResident)){state.needs.hunger=clamp(state.needs.hunger-rate*1.9,0,100);state.needs.energy=clamp(state.needs.energy-rate*1.3,0,100);
  state.needs.social=clamp(state.needs.social-rate*.6,0,100);state.needs.fun=clamp(state.needs.fun-rate*.7,0,100);}
 }
 const focus=talk?NPCS.find(n=>n.id===talk):null;const aimX=scene==='grove'?player.x:scene==='museum'?580:scene!=='town'?575:focus?(focus.x+player.x)/2:player.x;
 const aimY=scene==='grove'?clamp(player.y-60,300,1220):scene==='museum'?clamp(player.y-130,600,1260):scene!=='town'?650:focus?focus.y-26:player.y;
 cam.x+=(aimX-cam.x)*clamp(dt*4,0,1);cam.y+=(aimY-cam.y)*clamp(dt*4,0,1);
 uiTimer+=dt;if(uiTimer>.5){uiTimer=0;updateUI();}

}
function loop(now){if(!last)last=now;const dt=Math.min(.046,(now-last)/1000);last=now;try{update(dt);drawScene()}catch(e){console.error(e);notify('A scene error occurred: '+e.message)}requestAnimationFrame(loop)}
function closeModal(){if(modal==='community-game'&&typeof community!=='undefined')community.stop();if(modal==='festival-game'&&typeof festival!=='undefined')festival.stop();if(modal==='fishing-game'&&typeof fishingGame!=='undefined')fishingGame.stop();if(modal==='bug-play'&&typeof bugHunt!=='undefined')bugHunt.stop();if(modal==='date-moment'&&dateMoment)abandonDate('You ended the outing. No progress was lost.');if(typeof kitchen!=='undefined'&&kitchen.session&&modal==='cook-step'){kitchen.session=null;notify('Cooking ended. Ingredients were already used.')}modal=null;$('modal').classList.add('hidden')}
function showModal(kind,body){closeTalk();modal=kind;$('modalContent').innerHTML=body;$('modal').classList.remove('hidden')}
function btn(label,fn){return `<button class="btn" data-act="${fn}">${label}</button>`}
const festival=window.HearthFestival.setup({getState:()=>state,save,notify,showModal,closeModal,updateUI});
const community=window.HearthCommunity.setup({getState:()=>state,save,notify,showModal,closeModal,updateUI});
const stewardship=window.HearthStewardship.setup({getState:()=>state,save,updateUI,notify,showModal,closeModal,travelTo:(x,y,after)=>{if(scene!=='town')goScene('town');goTo({x,y},after);}});
const festivalMarket=window.HearthFestivalMarket.setup({getState:()=>state,save,notify,showModal,closeModal,updateUI,isTown:()=>scene==='town',travelTo:(x,y,after)=>{if(scene!=='town')goScene('town');goTo({x,y},after);},openKitchen:()=>kitchen.openBook()});
const villageLife=window.HearthVillageLife.setup({getState:()=>state,save,updateUI,notify,showModal,closeModal,findNeighbor:(id)=>{if(scene!=='town')goScene('town');const n=NPCS.find(n=>n.id===id);if(!n)return;goTo(approachNeighbor(n),()=>openTalk(id));if(player.target)player.target.npcId=id;}});
const neighborScenes=window.HearthNeighborScenes.setup({getState:()=>state,save,updateUI,notify,showModal,closeModal,getNPCs:()=>NPCS,getNormalRoutine:(id)=>{const n=NPCS.find(n=>n.id===id);return n?currentRoutine(n):null;},protectedRoutine:villageLife.protectedRoutine,travelTo:(x,y,after)=>{if(scene!=='town')goScene('town');goTo({x,y},after);}});
const homeAspirations=window.HearthAspirations.setup({getState:()=>state,save,notify,updateUI,showModal,closeModal});
const functionalHomes=window.HearthFunctionalHomes.setup({getState:()=>state,save,notify,updateUI,showModal,closeModal,getScene:()=>scene,getControlledResident:()=>controlledResident,queueAction:(kind)=>{if(scene==='home')queueOwnHomeAction(kind);else if(scene==='residence'&&controlledResident)queueHouseholdAction(kind);}});
const littleAtelier=window.HearthAtelier.setup({getState:()=>state,save,updateUI,notify,room:()=>scene==='residence'?activeResidence:'player',isInRoom:(h)=>scene==='home'&&h==='player'||scene==='residence'&&h===activeResidence,reopen:()=>scene==='home'?decorate():manageHousehold(),beginStored:(index)=>beginPlacement({storageIndex:index,residence:scene==='residence'})});
const bugHunt=window.HearthBugHunt.setup({getState:()=>state,notify,showModal,save,updateUI});
const fishingGame=window.HearthFishing.setup({getState:()=>state,notify,showModal,save,updateUI,task});
const kitchen=new window.HearthKitchen({getState:()=>state,save,coins,changeNeed,notify,showModal,getResidents:()=>scene==='residence'?roomResidents().map(n=>({id:n.id,name:n.name})):[],feedResident:(id,food,social)=>{const life=state.residentLife[id];if(life){life.needs.food=clamp(life.needs.food+food,0,100);life.needs.social=clamp(life.needs.social+social,0,100)}},bondResident:(id,amount)=>{state.relations[id]=clamp((state.relations[id]||0)+amount,0,100)}});
function buttonClick(e){const b=e.target.closest('[data-act]');if(!b)return;handleAction(b.dataset.act,b.dataset.id||'')}
function talkChoices(mode='main'){
 const options=mode==='romance'?[['spark','💞 Share a spark'],['date-invite','🌷 Ask on a date'],['reflect','📖 Remember together'],['partner','💕 Make it official'],['talk-back','← Back']]:mode==='more'?[['about-partner','💕 Ask about their partner'],['invite','📅 Arrange visit'],['housemate','🏡 Home life'],['mediate','🕊️ Make peace'],['join','✨ Join in'],['help','🌟 Help with dream'],['compliment','💗 Compliment'],['gift','🎁 Gift'],['talk-back','← Back']]:[['chat','💬 Chat'],['ask','🌤 Their day'],['discover','🌱 Get to know'],['romance-menu','💗 Feelings'],['more-talk','✨ More'],['bye','See you!']];
 if(mode==='main'&&scene==='town'&&neighborScenes.current()?.pair.includes(talk))options.splice(1,0,['nm-join','💌 Join our shared moment']);
 if(mode==='main'&&scene==='town'&&villageLife.available())options.splice(1,0,['vl-begin','🌷 Help prepare Maplewood']);
 if(mode==='main'&&scene==='town'&&['mabel','bea','finn','rosie'].includes(talk))options.splice(1,0,['stew-board','🌿 Improve the village']);
 if(mode==='main'&&scene==='town'&&festivalMarket.open()&&['bea','rosie','oliver'].includes(talk))options.splice(1,0,['fmarket-overview','🎪 Visit the festival stalls']);
 if(mode==='main'&&scene==='town'&&community.festivalOpen()&&community.hosts().some(m=>m.id===talk))options.splice(1,0,['comm-talk','🎪 Help with the festival']);
 $('talkActions').innerHTML=options.map(([act,label])=>'<button data-act="'+act+'">'+label+'</button>').join('');
}
function openTalk(id){const n=NPCS.find(a=>a.id===id);if(!n)return;closeModal();talk=id;n.emotion='happy';n.emotionUntil=tick+1.2;const r=state.relations[id]||0;
 $('talkName').textContent=n.name;$('talkRole').textContent=`${n.job} · ${friendshipRank(r)} · ♥ ${r} · ${romanceName(heartRecord(n.id))}`;$('talkPortrait').textContent='';const portrait=document.createElement('canvas');portrait.width=54;portrait.height=54;portrait.className='portrait-canvas';const pg=portrait.getContext('2d');pg.imageSmoothingEnabled=false;pg.drawImage(charArt(n,'front',0,'happy'),4,0,88,79,0,0,54,54);$('talkPortrait').append(portrait);
 $('talkText').textContent=scene==='town'?(neighborScenes.entryText(n.id)||villageLife.moodText(n.id)||(festival.active(state.day)?festival.neighborLine(n.id):neighborMoment(n))):neighborMoment(n);$('conversation').classList.remove('hidden');$('game').classList.add('talking');
 talkChoices('main');
 $('emote').textContent='💗';$('emote').hidden=false;state.met=state.met||[];if(!state.met.includes(id)){state.met.push(id);task('meet')}changeNeed('social',7);save()}
function closeTalk(){talk=null;$('conversation').classList.add('hidden');$('game').classList.remove('talking');$('emote').hidden=true}
function respond(kind){const n=NPCS.find(o=>o.id===talk);if(!n)return;if(['discover','spark','date-invite','partner','reflect'].includes(kind))return heartConversation(n,kind);
 if(!state.socialDaily[n.id]||state.socialDaily[n.id].day!==state.day)state.socialDaily[n.id]={day:state.day,chat:0,compliment:0,gift:0,join:0};
 const daily=state.socialDaily[n.id],r=state.relations[n.id]||0,cap=kind==='chat'?2:1;
 const voices=personalityTalk[n.id]||personalityTalk.mabel;
 if(kind==='help')return helpNeighbor(n);
 if(kind==='invite')return suggestVisit(n);
 if(kind==='about-partner')return askAboutPartner(n);
 if(kind==='housemate')return encourageHousemate(n);
 if(kind==='mediate')return mediateNeighbor(n);
 if(kind==='join'){
  if(daily.join>=1){$('talkText').textContent=`That was a lovely time together! Let's do something again tomorrow.`;$('emote').textContent='🌼';return}
  daily.join=1;
  const what=activityType(n),result=TASK_ART[n.id];
  $('talkText').textContent=what==='rest'?result.rest:result.join;
  $('emote').textContent=what==='fish'?'🎣':what==='read'?'📖':what==='paint'?'🎨':what==='bake'?'🥐':what==='water'?'🌷':'💞';
  n.emotion='happy';n.emotionUntil=tick+3;
  changeNeed('fun',13);changeNeed('social',9);changeNeed('energy',-3);
  const previous=state.relations[n.id]||0;state.relations[n.id]=Math.min(100,previous+6);state.hearts+=6;
  checkFriendshipMoment(n,previous,state.relations[n.id]);
  $('talkRole').textContent=`${n.job} · ${friendshipRank(state.relations[n.id])} · ♥ ${state.relations[n.id]}`;
  updateUI();save();return;
 }
 if(kind==='news'){
  const ev=activeMeeting(n),story=latestNeighborStory(n.id),pal=bestNeighborFriend(n.id),issue=strainedNeighbor(n.id);
  $('talkText').textContent=issue?`Things have been a little awkward with ${issue.name}. We could use some understanding.`:ev?`I'm spending time with ${NPCS.find(x=>x.id===ev.pair.find(id=>id!==n.id)).name}! We're ${ev.doing} near ${ev.place}.`:story?`${story.title} — ${story.text}`:pal?`I've become good friends with ${pal.name}. We always have something to talk about!`:'I wonder who I will bump into today? Everyone has a little story.';
  $('emote').textContent=ev?.icon||'💌';n.emotion='happy';n.emotionUntil=tick+2;return;
 }
 if(kind==='ask'){const entry=currentRoutine(n),feeling=personalMood(n);$('talkText').textContent=feeling.note?`${n.name}: “${feeling.note}”`:`${n.name} feels ${feeling.name.toLowerCase()} and is ${entry.doing}.`;$('emote').textContent=entry.icon;n.emotion=entry.mood==='sleepy'?'neutral':'happy';n.emotionUntil=tick+1.8;return}
 if(daily[kind]>=cap){$('talkText').textContent=kind==='chat'?`We've had a lovely chat already. Let's catch up tomorrow!`:kind==='compliment'?'I am still smiling from what you said earlier!':'That was so thoughtful. One gift a day is plenty!';$('emote').textContent='💛';return}
 if(kind==='gift'&&state.coins<20){$('talkText').textContent='Even a friendly hello is a gift, you know!';return}
 daily[kind]++;let gain=0;
 if(kind==='chat'){
  gain=7;task('chat');const lines=n.lines||[];const pick=(state.day+daily.chat+Math.floor(tick*.1))%lines.length;
  $('talkText').textContent=lines[pick];n.emotion='happy';$('emote').textContent='✨';changeNeed('social',13);
 }else if(kind==='compliment'){gain=12;n.emotion='happy';$('talkText').textContent=voices.compliments[(state.day+daily.compliment)%voices.compliments.length];$('emote').textContent='💕'}
 else if(kind==='gift'){coins(-20);gain=20;n.emotion='surprised';$('talkText').textContent=voices.gift[(state.day+daily.gift)%voices.gift.length];$('emote').textContent='🎁'}
 state.relations[n.id]=Math.min(100,r+gain);state.hearts+=gain;n.emotionUntil=tick+2.1;checkFriendshipMoment(n,r,state.relations[n.id]);$('talkRole').textContent=`${n.job} · ${friendshipRank(state.relations[n.id])} · ♥ ${state.relations[n.id]}`;$('heartText').textContent=state.hearts;save();
}
function people(){showModal('people',`<h2>💌 Meet the Neighbors</h2><p>Everyone has their own needs, mood and a little dream. Talk to them, help them out, and watch friendships grow.</p>${btn('💗 Hearts & Personalities','hearts')}${btn('💌 Postcards'+(todaysPostcard()?.status==='pending'?' · New!':''),'postcards')}${dateMoment?btn('✕ Cancel outing','date-abandon'):''}${btn('💌 Town Stories','stories')}${btn('💕 Town Hearts','town-hearts')}${btn('📅 Visiting Hours','visits')}${btn('🏡 Little Households','housing')}${NPCS.map(n=>{const life=lifeFor(n.id),m=personalMood(n),goal=RESIDENT_GOALS[n.id];return `<div class="card"><div><b>${n.emoji} ${n.name} · ♥ ${state.relations[n.id]||0}</b><small>${escapeHtml(n.job)} · ${escapeHtml(n.trait)}<br>${m.icon} ${m.name} · ${escapeHtml(currentRoutine(n).doing)}<br>${hobbyProfile(n.id).icon} ${escapeHtml(hobbyProfile(n.id).title)} · ${hobbyRecord(n.id).sessions} hobby days<br>🌟 ${escapeHtml(goal.title)} — ${life.helpCount}/3 ${life.helpCount>=3?'✓ Complete':''}<br>${friendshipRank(state.relations[n.id]||0)}<br>🏡 ${escapeHtml(apartmentName(residentHome(n.id)))} · 🪙 ${Math.round(state.householdFunds[residentHome(n.id)]||0)} household savings${bestNeighborFriend(n.id)?`<br>Friends with ${escapeHtml(bestNeighborFriend(n.id).name)} · ♥ ${bestNeighborFriend(n.id).score}`:''}${strainedNeighbor(n.id)?`<br>🌧️ Misunderstanding with ${escapeHtml(strainedNeighbor(n.id).name)} · ${Math.round(strainedNeighbor(n.id).tension)} tension`:''}</small><div class="mini-needs"><span>🍞 ${Math.round(life.needs.food)}</span><span>💤 ${Math.round(life.needs.energy)}</span><span>💌 ${Math.round(life.needs.social)}</span><span>🎈 ${Math.round(life.needs.fun)}</span></div></div><button data-act="find" data-id="${n.id}">Find</button></div>`}).join('')}`)}
function townStories(){const stories=[...state.townStories].reverse();const e=communityEvent();const dreams=[...state.lifeMoments].reverse();
 showModal('stories',`<h2>💌 Town Stories</h2><p>The neighbors have lives of their own, with visits between community events. Drop by the square, market, gardens, café and pond during the day to catch their little moments.</p>${e?`<div class="card"><div><b>${e.icon} Happening now: ${escapeHtml(e.title)}</b><small>${escapeHtml(e.place)} · ${escapeHtml(e.pair.map(id=>NPCS.find(n=>n.id===id).name).join(' & '))}</small></div></div>`:''}${dreams.map(moment=>`<div class="card"><div><b>🌟 ${escapeHtml(moment.title)}</b><small>Day ${moment.day} · ${escapeHtml(moment.text)}</small></div></div>`).join('')}${stories.length?stories.map(story=>`<div class="card"><div><b>${story.outcome==='misunderstanding'?'🌧️ ':story.outcome==='reconciled'?'🕊️ ':story.outcome==='visit'?'☕ ':story.outcome==='milestone'?'💗 ':'💛 '}${escapeHtml(story.title)}</b><small>Day ${story.day} · ${escapeHtml(story.text)}</small></div></div>`).join(''):'<p>No stories yet. Spend some time exploring or help a neighbor finish a dream.</p>'}<p>Stories record automatically once both neighbors arrive. Relationships can grow, strain, and heal as residents spend time together. You can also help neighbors make peace.</p>${btn('Back to journal','journal')}`)}

/* v2.5.4 · Cloverbank Grove: daily exploration, seasonal memories and life-sim rewards. */
let groveCurrent=null;
function groveRecord(){
 if(!state.grove||typeof state.grove!=='object')state.grove=HearthGrove.cleanRecord({});
 const r=state.grove;
 if(r.day!==state.day){r.day=state.day;r.done=[];}
 return r;
}
function festivalVisit(){closeModal();if(scene!=='town')goScene('town');const stand=objects.find(o=>o.type==='festivalstand');if(!stand)return festival.calendar();goTo(approachObject(stand),()=>festival.active(state.day)?festival.play():festival.calendar());}
function groveTravel(){
 closeModal();
 if(scene==='grove')return groveAlbum();
 if(scene!=='town')goScene('town');
 const gate=objects.find(o=>o.type==='grovegate');
 if(!gate)return notify('The woodland trail is being prepared.');
 const spot=approachObject(gate);
 goTo(spot,()=>goScene('grove'));
}
function groveAlbum(){
 const r=groveRecord();
 const seas=['Spring','Summer','Autumn','Winter'];
 const sites=HearthGrove.sites.filter(p=>p.id!=='exit').map(p=>
  '<div class="grove-site '+(r.done.includes(p.id)?'done':'')+'"><div class="grove-site-icon">'+p.icon+'</div><div><strong>'+p.name+'</strong><small>'+p.desc+' · '+(r.done.includes(p.id)?'✓ Enjoyed today':'Waiting for you')+'</small></div></div>'
 ).join('');
 const badge=r.seasonal.map(n=>'<span>'+seas[n]+' ✓</span>').join('');
 showModal('grove-album','<div class="grove-ui"><div class="grove-eye">THE LIVING VILLAGE · WOODLAND TRAILS</div><div class="grove-hero"><h2>🌲 Cloverbank Grove</h2><p>Follow the sunlit path into the woods. Gather ingredients, skip a stone across the brook, and send a postcard from the overlook.</p><div class="grove-stats"><span>🍃 '+r.done.length+' / 3 moments today</span><span>📖 '+r.visits+' day visits</span><span>💌 '+r.seasonal.length+' / 4 seasonal sketches</span></div></div><h3>Today on the trail</h3>'+sites+'<h3>Seasonal album</h3><div class="grove-stats">'+(badge||'<span>Your first woodland sketch is waiting.</span>')+'</div>'+(r.memories.length?'<div class="grove-letter">'+r.memories.slice(-3).map(escapeHtml).join('<hr>')+'</div>':'')+'<button data-act="grove-travel" class="grove-button">'+(scene==='grove'?'You are exploring Cloverbank':'🌿 Walk to Cloverbank Grove')+'</button></div>');
}
function groveActivity(id){
 if(scene!=='grove')return groveAlbum();
 const r=groveRecord();
 if(!['berries','brook','lookout'].includes(id))return;
 if(r.done.includes(id))return notify('You already enjoyed this little spot today. Come back tomorrow! 🍃');
 groveCurrent=id;
 let html='';
 if(id==='berries')html='<div class="grove-eye">BERRY HOLLOW · THE PANTRY</div><h2>🍓 A basket of woodland treats</h2><p>Among the leaves are sweet berries and fragrant herbs. What will you gather for your kitchen?</p><button class="grove-choice" data-act="grove-do" data-id="berries|berry"><span>🍓</span> Gather sun-ripened berries (+2)</button><button class="grove-choice" data-act="grove-do" data-id="berries|herb"><span>🌿</span> Snip aromatic garden herbs (+2)</button>';
 if(id==='brook')html='<div class="grove-eye">WHISPERING BROOK · A LITTLE GAME</div><h2>💧 Skip a stone</h2><p>Choose a pebble for the gentlest possible throw. A flat stone skims beautifully; a round or heavy one makes a satisfying splash.</p><button class="grove-choice" data-act="grove-do" data-id="brook|flat"><span>🪨</span> A broad, flat pebble</button><button class="grove-choice" data-act="grove-do" data-id="brook|round"><span>⚪</span> A smooth, round pebble</button><button class="grove-choice" data-act="grove-do" data-id="brook|heavy"><span>🔹</span> A heavy river stone</button>';
 if(id==='lookout')html='<div class="grove-eye">SUNBEAM LOOKOUT · POSTCARD STUDIO</div><h2>💌 Make a seasonal memory</h2><p>The village looks tiny from up here. Sketch the view and choose someone to share it with.</p><button class="grove-choice" data-act="grove-do" data-id="lookout|self"><span>📔</span> Keep it in my scrapbook</button>'+NPCS.map(n=>'<button class="grove-choice" data-act="grove-do" data-id="lookout|'+n.id+'"><span>'+n.emoji+'</span> Send a postcard to '+escapeHtml(n.name)+'</button>').join('');
 showModal('grove-activity','<div class="grove-ui grove-card">'+html+'<button data-act="grove-album" class="grove-button secondary">← Trail album</button></div>');
}
function groveChoose(raw){
 if(modal!=='grove-activity'||scene!=='grove'||typeof raw!=='string')return;
 const [id,choice]=raw.split('|'),r=groveRecord();
 if(id!==groveCurrent||r.done.includes(id))return;
 const seasonal=['Spring','Summer','Autumn','Winter'];
 let message='',bonus='';
 if(id==='berries'&&['berry','herb'].includes(choice)){
  const pantry=state.cooking?.pantry;
  if(!pantry)return notify('Your kitchen pantry is not ready.');
  const old=Math.max(0,Math.min(99,pantry[choice]||0));
  const gained=Math.min(2,99-old);
  pantry[choice]=old+gained;
  state.needs.fun=clamp(state.needs.fun+6,0,100);
  message=choice==='berry'?'You tucked a handful of ruby-red berries into a woven basket.':'You gathered fragrant herbs from a sun-dappled patch.';
  bonus='🍳 +'+gained+' '+(choice==='berry'?'berries':'herbs')+' for the Hearth Kitchen pantry.';
 }else if(id==='brook'&&['flat','round','heavy'].includes(choice)){
  const skips={flat:4,round:2,heavy:1}[choice];state.needs.fun=clamp(state.needs.fun+5+skips*2,0,100);
  if(skips===4){state.coins=Math.min(999999,state.coins+7);bonus='🪙 +7 little river discovery coins.'}
  message='Plip! Your stone skipped '+skips+' '+(skips===1?'time':'times')+' across the brook before disappearing beneath the ripples.';
 }else if(id==='lookout'&&(choice==='self'||NPCS.some(n=>n.id===choice))){
  if(!r.seasonal.includes(state.season))r.seasonal.push(state.season);
  state.needs.fun=clamp(state.needs.fun+10,0,100);
  if(choice!=='self'){const n=NPCS.find(n=>n.id===choice);state.relations[choice]=clamp((state.relations[choice]||0)+3,0,100);state.needs.social=clamp(state.needs.social+5,0,100);bonus='💗 +3 friendship with '+n.name;message='A postcard of the '+seasonal[state.season].toLowerCase()+' trees is on its way to '+n.name+'.'}
  else{message='You saved a '+seasonal[state.season].toLowerCase()+' woodland drawing in your little scrapbook.';bonus='📖 Seasonal sketch preserved in the album.'}
 }else return;
 r.done.push(id);r.memories.push('Day '+state.day+' · '+message);r.memories=r.memories.slice(-16);
 groveCurrent=null;
 let completed='';
 if(r.done.length===3&&r.completedDay!==state.day){r.completedDay=state.day;state.coins=Math.min(999999,state.coins+20);completed='🌟 All three woodland moments! +20 trail-completion coins.'}
 save();updateUI();
 showModal('grove-result','<div class="grove-ui"><div class="grove-hero"><div class="grove-eye">A LITTLE WOODLAND MEMORY</div><h2>✿ What a lovely moment!</h2><p>'+escapeHtml(message)+'</p><div class="grove-stats"><span>'+r.done.length+' / 3 activities today</span></div></div>'+(bonus?'<div class="grove-card">'+escapeHtml(bonus)+'</div>':'')+(completed?'<div class="grove-card">'+escapeHtml(completed)+'</div>':'')+'<button data-act="grove-album" class="grove-button">Open trail album</button><button data-act="grove-dismiss" class="grove-button secondary">Keep exploring</button></div>');
}

function journal(){const done=questDefs.filter(q=>(state.quests[q.id]||0)>=q.max).length;showModal('journal',`<h2>📜 Your Little Journal</h2><p>${done} of ${questDefs.length} village adventures completed. Claim your rewards to grow your little life!</p>${btn('💌 Read Town Stories','stories')}${btn('💕 Town Hearts','town-hearts')}${btn('📅 Visiting Hours','visits')}${btn('🏡 Little Households','housing')}${scene==='residence'||scene==='home'?btn('📖 Household Daybook','daybook'):''}${btn('🏛️ The Little Museum','museum-visit')}${btn('🦋 Field Guide & Curiosity Cabinet','nature-guide')}${btn('🕸️ Meadow Net · Catch insects','bug-hunt')}${btn('🎣 Pond Almanac · Go fishing','fish-guide')}${btn('🌲 Cloverbank Trail Album','grove-album')}${btn('🎪 Seasonal Festival Calendar','festival-calendar')}${btn('💌 Community Scrapbook','comm-board')}${btn('🌿 Town Improvement Projects','stew-board')}${btn('🎪 Festival Market Scrapbook','fmarket-overview')}${btn('🌷 Village Community Diary','vl-board')}${btn('💌 Shared Neighbor Stories','nm-book')}${btn('🏡 Household Aspirations','asp-board')}${btn('🪑 Functional Rooms & Furniture','hf-board')}${btn('🍳 Recipe Book','cook-book')}${questDefs.map(q=>{const n=state.quests[q.id]||0,claimed=state.quests[q.id+'_claimed'];return `<div class="card"><div><b>${q.text}</b><small>${Math.min(q.max,n)} / ${q.max} · 🪙 ${q.reward}</small></div><button data-act="claim" data-id="${q.id}" ${n<q.max||claimed?'disabled':''}>${claimed?'✓ Done':'Claim'}</button></div>`}).join('')}`)}
function cafe(){showModal('cafe',`<h2>🥐 Honeybun Café</h2><p>Oliver needs help serving the lunchtime crowd. A short shift earns coins and lifts your spirits. Look for Oliver working in town, too.</p><div class="card"><b>1 cozy café shift</b><b>🪙 +45</b></div>${btn('Work a shift 🥐','work')} ${btn('Have a treat (10 🪙)','eat')}`)}
function townHall(){showModal('hall',`<h2>🏛️ Maplewood Town Hall</h2><p>The village is growing around you. Meet six neighbors, spruce up your home, and complete the journal to become part of its story.</p>${btn('View your journal','journal')} ${btn('💌 Town Stories','stories')}${btn('🏡 Little Households','housing')}${btn('🎪 Festival Calendar','festival-calendar')}${btn('💌 Festival Friends','comm-board')}${btn('🌿 Town Improvement Projects','stew-board')}${btn('🎪 Browse Festival Market','fmarket-overview')}${btn('🌷 Community Diary & Neighbors','vl-board')}${btn('💌 Little Moments Together','nm-book')}${btn('🦋 Curiosity Cabinet','nature-gallery')}`)}
function market(){showModal('market',`<h2>🍓 Rosie’s Little Market</h2><p>Fresh fruit, pantry ingredients and lovely things for your home.</p>${btn('🧺 Buy pantry ingredients','cook-market')}<div class="grid"><div class="item"><span class="emoji">🍑</span><strong>Peach snack</strong><small>10 coins</small>${btn('Eat','eat')}</div><div class="item"><span class="emoji">🌻</span><strong>Flower seed</strong><small>8 coins</small>${btn('Buy','seed')}</div><div class="item"><span class="emoji">🪴</span><strong>Plant</strong><small>25 coins</small>${btn('Buy','buy-plant')}</div></div>`)}
function garden(){showModal('garden',`<h2>🌱 Community Garden</h2><p>Plant little flowers, care for them, and harvest blooms for your cottage.</p><div class="grid">${(state.garden||[0,0,0,0]).map((n,i)=>`<div class="item"><span class="emoji">${n===2?'🌸':n===1?'🌱':'🟫'}</span><strong>Plot ${i+1}</strong><small>${n===2?'Ready!':n===1?'Growing':'Empty'}</small><button class="btn" data-act="plot" data-id="${i}">${n===2?'Harvest':n===1?'Water':'Plant'}</button></div>`).join('')}</div><p>Planting is free. Premium seed packets from Rosie’s market give a better harvest. 🌻 ${state.inventory.filter(x=>x==='flower-seed').length} seed packets available.</p>`)}
function fishing(){fishingGame.overview();}
function decorate(){if(scene!=='home')goScene('home');
 showModal('decor',`<h2>🪑 Your Cozy Furniture</h2><p>Choose furniture, then tap or drag it into place. Use Rotate to change direction. Your room saves automatically.</p><h3>Wallpaper</h3><div class="swatches">${['#c5daba','#f2ccdf','#a5cedb','#f3dab2'].map((s,i)=>`<button data-act="wall" data-id="${i}" class="swatch" style="background:${s}" aria-label="Wallpaper ${i+1}" ${state.homeStyle===i?'aria-pressed="true"':''}></button>`).join('')}</div><h3>Furniture shop</h3><div class="grid">${furnitureTypes.map(f=>`<div class="item"><span class="emoji">${f.emoji}</span><strong>${f.name}</strong><small>🪙 ${f.cost}</small><button class="btn" data-act="buy" data-id="${f.id}">Choose</button></div>`).join('')}</div>${littleAtelier.toolbar('player')}${state.placed.length?`<h3>Your placed furniture</h3>${state.placed.map((f,i)=>`<div class="card"><div><b>${furnitureTypes.find(t=>t.id===f.kind)?.emoji||'🪑'} ${furnitureTypes.find(t=>t.id===f.kind)?.name||'Furniture'}</b><small>Move, rotate or sell this item</small></div><div class="furniture-actions"><button data-act="move" data-id="${i}">Move</button><button data-act="at-store" data-id="${i}">Store</button><button data-act="sell" data-id="${i}">Sell</button></div></div>`).join('')}`:''}`)}

function style(){const pendingName=$('nameInput')?.value;const outfit=['#f18bb0','#8cb2e5','#e8bc65','#83c5ad','#a29be2','#f2a577'],hair=['#453536','#895b47','#d3a76b','#393546','#b67360','#dba66a'],skin=['#f5dbb3','#eeb892','#c88d63','#8e5943','#5f4033'];
 showModal('style',`<h2>🎀 Make Your Own Villager</h2><p>A little pixel person with a style all their own.</p><label>Your name</label><input id="nameInput" class="input" maxlength="18" value="${escapeHtml(pendingName??state.name)}"/><h3>Outfit</h3><div class="swatches">${outfit.map(s=>`<button class="swatch" style="background:${s}" data-act="set-outfit" data-id="${s}"></button>`).join('')}</div><h3>Hair color</h3><div class="swatches">${hair.map(s=>`<button class="swatch" style="background:${s}" data-act="set-hair" data-id="${s}"></button>`).join('')}</div><h3>Haircut</h3><div class="haircuts">${['Bob','Side-part','Tousled','Ponytail','Buns'].map((n,i)=>`<button data-act="set-style" data-id="${i}" aria-pressed="${state.hairStyle===i}" class="haircut ${state.hairStyle===i?'selected':''}">${n}</button>`).join('')}</div><h3>Skin</h3><div class="swatches">${skin.map(s=>`<button class="swatch" style="background:${s}" data-act="set-skin" data-id="${s}"></button>`).join('')}</div>${btn('Save my look 🌷','save-look')}`)}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]))}
function menu(){showModal('menu',`<h2>⚙️ Your Village</h2><p>Hearth & Harbor: Little Atelier v2.5.13 — an original 2.5D retro life simulation. Your progress saves on this device.</p>${btn('💗 Hearts & Personalities','hearts')}${btn('💌 Postcards'+(todaysPostcard()?.status==='pending'?' · New!':''),'postcards')}${btn('💌 Town Stories','stories')}${btn('💕 Town Hearts','town-hearts')}${btn('📅 Visiting Hours','visits')}${btn('🏡 Little Households','housing')}${btn('🦋 Field Guide & Curiosity Cabinet','nature-guide')}${btn('🕸️ Meadow Net · Catch insects','bug-hunt')}${btn('🎣 Pond Almanac · Go fishing','fish-guide')}${btn('🌲 Cloverbank Grove · Explore','grove-travel')}${btn('🎪 Festival Calendar','festival-calendar')}${btn('💌 Together in Maplewood','comm-board')}${btn('🌿 Build the Village','stew-board')}${btn('🎪 Festival Market','fmarket-overview')}${btn('🌷 Village Community Diary','vl-board')}${btn('💌 Neighbors Together','nm-book')}${btn('🏡 Roots & Keepsakes','asp-board')}${btn('🪑 Rooms With Purpose','hf-board')}${btn('🍳 Hearth Kitchen','cook-book')}${scene==='residence'?btn('📖 Household Daybook','daybook')+btn('🛋️ About this home','room-info'):scene==='home'?btn('📖 Poppy’s Household Daybook','daybook'):''}${btn('💾 Save now','save')} ${btn('📤 Export backup','export')} ${btn('📥 Import backup','import')}<hr><p><strong>How to play</strong><br>Tap a destination to walk. Tap neighbors, homes, the café, fruit stall, garden and pond to interact. Use the bottom menu to explore life, style and decorating.</p><p>💚 No accounts, energy paywalls, ads or purchases.</p>`)}
function handleAction(action,id){if(action.startsWith('at-'))return littleAtelier.handle(action,id);if(action==='hf-board')return functionalHomes.board(id||(scene==='residence'?activeResidence:'player'));if(action.startsWith('hf-'))return functionalHomes.handle(action,id);if(action.startsWith('asp-'))return homeAspirations.handle(action,id);if(action==='nm-join')return neighborScenes.join(neighborScenes.current()?.id);if(action.startsWith('nm-'))return neighborScenes.handle(action,id);if(action==='vl-begin'){if(!talk)return villageLife.journal();return villageLife.begin(talk)}if(action.startsWith('vl-'))return villageLife.handle(action,id);if(action.startsWith('fmarket-'))return festivalMarket.handle(action,id);if(action.startsWith('stew-'))return stewardship.handle(action,id);if(action==='comm-talk'){if(!talk)return;return community.open(talk)}if(action==='comm-board')return community.board();if(action==='comm-find'){const n=NPCS.find(n=>n.id===id);if(!n||!community.festivalOpen()||!community.hosts().some(m=>m.id===id))return community.board();closeModal();if(scene!=='town')goScene('town');goTo(approachNeighbor(n),()=>openTalk(id));if(player.target)player.target.npcId=n.id;return;}if(action.startsWith('comm-'))return community.handle(action,id);if(action==='festival-calendar')return festival.calendar();if(action==='festival-visit')return festivalVisit();if(action==='festival-play')return festival.play();if(action.startsWith('festival-'))return festival.handle(action,id);if(action==='grove-album')return groveAlbum();if(action==='grove-travel')return groveTravel();if(action==='grove-do')return groveChoose(id);if(action==='grove-dismiss')return closeModal();if(action==='fish-guide')return fishingGame.overview();if(action==='fish-aquarium')return fishingGame.aquarium();if(action==='bug-hunt')return bugHunt.journal();if(action==='museum-visit')return travelToMuseum();if(action==='museum-desk')return museumDesk();if(action==='museum-close')return closeModal();if(action==='museum-tour')return museumTour();if(action==='museum-exhibit')return museumExhibit(Number(id));if(action==='museum-leave')return goScene('town');if(action==='nature-guide')return natureGuide();if(action==='nature-gallery')return natureCabinet();if(action==='nature-donate')return donateNature(id);if(action==='more-talk')return talkChoices('more');if(action==='romance-menu')return talkChoices('romance');if(action==='talk-back')return talkChoices('main');
 if(action==='hearts')return heartNotes();
 if(action==='postcards')return postcards();
 if(action==='postcard-accept')return acceptPostcard();
 if(action==='postcard-decline')return declinePostcard();
 if(action==='date-place')return planDate(id);
 if(action==='date-choice')return finishDate(id);
 if(action==='date-cancel'){if(talk){const who=talk;closeTalk();openTalk(who)}return}
 if(action==='date-abandon'){abandonDate('Date plans canceled. No progress was lost.');if(modal==='date-moment')closeModal();return}
 if(action.startsWith('cook-'))return kitchen.handle(action,id);
 if(action==='chat'||action==='compliment'||action==='gift'||action==='ask'||action==='join'||action==='news'||action==='help'||action==='mediate'||action==='invite'||action==='housemate')return respond(action);
 if(action==='bye')return closeTalk();
 if(action==='find'){closeModal();if(scene!=='town')goScene('town');const n=NPCS.find(n=>n.id===id);if(n){goTo(approachNeighbor(n),()=>openTalk(id));if(player.target)player.target.npcId=n.id;}return}
 if(action==='visit-home')return enterResidence(id);
 if(action==='leave-home')return leaveResidence();
 if(action==='room-info')return residenceRoomMenu();
 if(action==='daybook')return scene==='home'?ownDaybook():manageHousehold();
 if(action==='queue-self'){closeModal();return queueOwnHomeAction(id)}
 if(action==='decor')return decorate();
 if(action==='guide')return selectHouseholdResident(id);
 if(action==='toggle-auto')return toggleHouseholdAutonomy(id);
 if(action==='guide-self'){stopGuidingResident();return manageHousehold()}
 if(action==='queue-home'){if(!controlledResident)return;const who=controlledResident;closeModal();queueHouseholdAction(id);return}
 if(action==='clear-home-queue'){stopRoutine();notify('Routine cleared.');return scene==='home'?ownDaybook():manageHousehold()}
 if(action==='room-theme'){if(scene!=='residence')return;const choice=Number(id);if(!Number.isInteger(choice)||choice<0||choice>=HOME_THEMES.length)return;state.residenceThemes[activeResidence]=choice;save();notify('Your home has a whole new feeling! 🎨');return manageHousehold()}
 if(action==='room-prop')return buyResidenceProp(id);
 if(action==='room-move'){if(scene!=='residence')return;const i=Number(id),props=state.residenceProps[activeResidence]||[];if(!Number.isInteger(i)||!props[i])return;return beginPlacement({residence:true,moveIndex:i})}
 if(action==='room-sell'){if(scene!=='residence')return;const i=Number(id),props=state.residenceProps[activeResidence]||[];if(!Number.isInteger(i)||!props[i])return;const [removed]=props.splice(i,1),f=furnitureTypes.find(f=>f.id===removed.kind);state.coins+=Math.floor(Math.max(10,Math.round((f?.cost||20)*.65))/2);save();updateUI();notify('Decoration sold for half price.');return manageHousehold()}
 if(action==='room-remove-prop'){if(scene!=='residence')return;const props=state.residenceProps[activeResidence]||[];if(!props.length)return;const removed=props.pop(),item=furnitureTypes.find(f=>f.id===removed.kind);const refund=Math.floor(Math.max(10,Math.round((item?.cost||20)*.65))/2);state.coins+=refund;save();updateUI();notify('Decoration removed. '+refund+' coins refunded.');return manageHousehold()}
 if(action==='room-upgrade')return upgradeRoom();
 if(action==='room-chat'){if(scene==='residence'&&roomResidents().some(n=>n.id===id))return openTalk(id);return}
 if(action==='town-hearts')return townHeartsBoard();
 if(action==='couple-flowers')return offerCoupleFlowers(id);
 if(action==='couple-plans245')return plans245(id);
 if(action==='promise-board')return promiseBoard(id);
 if(action==='promise-plan'){const pos=id.lastIndexOf('|');if(pos>0)return planPromise(id.slice(0,pos),id.slice(pos+1));return;}
 if(action==='promise-visit')return visitPromise(id);
 if(action==='promise-choice'){const pos=id.lastIndexOf('|');if(pos>0)return celebratePromise(id.slice(0,pos),id.slice(pos+1));return;}
 if(action==='wedding-board'||action==='wedding-back')return weddingBoard(id);
 if(action==='wedding-promise')return weddingPromise(id);
 if(action==='wedding-plan'){const pos=id.lastIndexOf('|');if(pos>0)return weddingPlan(id.slice(0,pos),id.slice(pos+1));return;}
 if(action==='wedding-visit')return weddingVisit(id);
 if(action==='wedding-ceremony')return weddingCeremony(id);
 if(action==='wedding-vow'){const pos=id.lastIndexOf('|');if(pos>0)return weddingVow(id.slice(0,pos),id.slice(pos+1));return;}
 if(action==='wedding-close')return weddingBoard(Object.entries(state.weddingPlans).find(([,w])=>w.status==='scheduled'&&w.day===state.day)?.[0]||'');
 if(action==='couple-share245'){const cut=id.lastIndexOf('|');if(cut>0)return sharedHome245(id.slice(0,cut),id.slice(cut+1));return}
 if(action==='couple-apart245')return apart245(id);
 if(action==='couple-dinner245'){const cut=id.lastIndexOf('|');if(cut>0)return dinner245(id.slice(0,cut),id.slice(cut+1));return}
 if(action==='visits')return visitPlans();
 if(action==='housing')return housingBoard();
 if(action==='journal')return journal();
 if(action==='stories')return townStories();
 if(action==='claim'){const q=questDefs.find(q=>q.id===id);if(!q||state.quests[q.id+'_claimed']||(state.quests[q.id]||0)<q.max)return;state.quests[q.id+'_claimed']=true;coins(q.reward);notify(`Quest complete! +${q.reward} coins ✨`);return journal()}
 if(action==='work'){task('work');coins(45);changeNeed('energy',-13);changeNeed('fun',9);notify('Delicious work! +45 coins 🥐');return cafe()}
 if(action==='eat'){if(state.coins<10)return notify('You need 10 coins!');coins(-10);changeNeed('hunger',35);notify('Sweet and delicious! 🍑');return}
 if(action==='seed'){if(state.coins<8)return notify('You need 8 coins!');coins(-8);state.inventory.push('flower-seed');save();notify('Seeds purchased! Use them in a garden plot for a richer harvest 🌻');return}
 if(action==='buy-plant')return handleAction('buy','plant');
 if(action==='wall'){state.homeStyle=Number(id)%4;save();notify('A fresh coat of cottage color! 🎨');return}
 if(action==='buy'){const f=furnitureTypes.find(f=>f.id===id);if(!f)return;if(state.coins<f.cost)return notify('Not enough coins yet!');beginPlacement({kind:f.id});return}
 if(action==='move'){const i=Number(id);if(!Number.isInteger(i)||i<0||i>=state.placed.length)return;beginPlacement({moveIndex:i});return}
 if(action==='sell'){const i=Number(id);if(!Number.isInteger(i)||i<0||i>=state.placed.length)return;const f=state.placed.splice(i,1)[0],item=furnitureTypes.find(t=>t.id===f.kind);coins(Math.floor((item?.cost||0)/2));save();notify('Sold for half the original price ✨');return decorate()}

 if(action==='plot'){const i=Number(id);if(!Number.isInteger(i)||i<0||i>=4)return;const v=state.garden[i]||0;
 if(v===0){state.garden[i]=1;if(state.inventory.includes('flower-seed')){state.inventory.splice(state.inventory.indexOf('flower-seed'),1);state.gardenBoost[i]=true;notify('Premium seeds planted! A richer harvest awaits 🌻')}else notify('Little sprouts planted! 🌱')}
 else if(v===1){state.garden[i]=2;notify('Your flowers are blooming! 🌸')}
 else{state.garden[i]=0;const reward=state.gardenBoost[i]?38:24;state.gardenBoost[i]=false;coins(reward);task('garden');changeNeed('fun',12);notify(`Beautiful harvest! +${reward} coins 🌼`)}save();return garden()}

 if(action==='set-style'){state.hairStyle=clamp(Number(id)||0,0,4)|0;save();return style()}
 if(action==='set-outfit'||action==='set-hair'||action==='set-skin'){const n=parseInt(id.slice(1),16);if(!Number.isFinite(n))return;if(action==='set-outfit')state.outfit=n;else if(action==='set-hair')state.hair=n;else state.skin=n;save();return}

 if(action==='save-look'){const n=$('nameInput')?.value?.trim();if(n)state.name=n.slice(0,18);save();updateUI();closeModal();notify('Your new look is lovely! 🎀');return}
 if(action==='save'){save();notify('Your little world is saved! 💾');closeModal();return}
 if(action==='export'){save();const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='hearth-and-harbor-save.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);return}
 if(action==='import'){const input=document.createElement('input');input.type='file';input.accept='application/json';input.onchange=async()=>{try{if(!input.files?.[0])return;if(input.files[0].size>1500000)throw Error('Too large');const v=JSON.parse(await input.files[0].text());if(!v||typeof v!=='object'||!Number.isFinite(v.coins)||!v.needs)throw Error('Invalid save');state=cleanSave(v);save();location.reload()}catch(e){notify('That backup was not valid.')}};input.click()}

}
function bind(){
 canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture?.(e.pointerId);canvas._start={x:e.clientX,y:e.clientY}});
 canvas.addEventListener('pointermove',e=>{if(!placement||modal||talk||!canvas._start)return;
  const a=canvas._start;if(Math.hypot(a.x-e.clientX,a.y-e.clientY)>8){
   arrangePosition((e.clientX-W/2)/worldScale+cam.x,(e.clientY-H*.54)/worldScale+cam.y);
  }
 });
 canvas.addEventListener('pointerup',e=>{const a=canvas._start||{x:e.clientX,y:e.clientY};canvas._start=null;
  if(placement){clickWorld(e.clientX,e.clientY);return}
  if(Math.hypot(a.x-e.clientX,a.y-e.clientY)>25)return;clickWorld(e.clientX,e.clientY)});
 $('townBtn').onclick=()=>goScene('town');$('homeBtn').onclick=()=>goScene('home');$('peopleBtn').onclick=people;$('journalBtn').onclick=journal;$('decorateBtn').onclick=()=>scene==='residence'?manageHousehold():scene==='home'?ownDaybook():decorate();$('styleBtn').onclick=style;$('menuBtn').onclick=menu;
 $('timeBtn').onclick=()=>{speed=({0:1,1:2,2:3,3:0})[speed];updateUI()};$('cancelPlacement').onclick=()=>{stopPlacement();notify('Placement canceled — no coins spent')};$('rotatePlacement').onclick=rotatePlacement;$('routineAdd').onclick=()=>scene==='home'?ownDaybook():manageHousehold();$('routineStop').onclick=()=>{stopRoutine();notify('Routine cleared')};$('talkClose').onclick=closeTalk;$('talkActions').addEventListener('click',buttonClick);
 $('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal();else buttonClick(e)});$('closeModal').onclick=closeModal;
 addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});setInterval(save,18000);
}
function start(){buildTown();resize();bind();updateUI();cam.x=player.x;cam.y=player.y;requestAnimationFrame(loop);setTimeout(()=>$('loading').classList.add('hidden'),150);if(!state.seenWelcome){state.seenWelcome=true;save();setTimeout(()=>notify('Welcome to your cozy little village! 🌷'),800)}}
start();
})();
