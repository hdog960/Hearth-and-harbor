/* Hearth & Harbor v2.5.13 — Little Atelier: storage & safe undo.
 * Storage persists in hearth-harbor-save-v1. Undo is session-only and guards
 * against unrelated coin changes and stale room state.
 */
(function(root){'use strict';
const HOMES=['player','h0','h1','h2','h3','h4','h5'];
const TYPES=['bed','sofa','plant','books','lamp','rug','chair','flowers'];
const ROOM_TYPES=['plant','flowers','books','lamp','rug','chair'];
const validObj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const typesFor=h=>h==='player'?TYPES:ROOM_TYPES;
const cap=h=>h==='player'?40:12;
function clean(raw){
 const obj=validObj(raw)?raw:{},out={};
 for(const h of HOMES){
  const values=Array.isArray(obj[h])?obj[h]:[];
  out[h]=values.filter(item=>validObj(item)&&typesFor(h).includes(item.kind)).slice(0,cap(h)).map(item=>({
   kind:item.kind,rot:Number.isInteger(item.rot)?clamp(item.rot,0,3):0
  }));
 }
 return out;
}
function setup(api){
 const {getState,save,updateUI,notify,reopen}=api;
 const memory=new Map();
 const state=()=>getState();
 const room=()=>api.room();
 const homeValid=h=>HOMES.includes(h);
 const storage=h=>{
  const s=state();
  if(!s.atelierStorage||!HOMES.every(id=>Array.isArray(s.atelierStorage[id])))s.atelierStorage=clean(s.atelierStorage);
  return s.atelierStorage[h];
 };
 const list=h=>h==='player'?state().placed:state().residenceProps[h];
 const cloneItems=(items,h)=>Array.isArray(items)?items.map(item=>({
   kind:item.kind,x:item.x,...(h==='player'?{z:item.z}:{y:item.y}),rot:item.rot||0
 })): [];
 function snapshot(h){
  if(!homeValid(h))return null;
  const s=state(),placed=list(h);
  if(!Array.isArray(placed))return null;
  return {home:h,items:cloneItems(placed,h),stored:storage(h).map(item=>({...item})),coins:s.coins};
 }
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const stack=h=>{if(!memory.has(h))memory.set(h,{undo:[],redo:[]});return memory.get(h)};
 function commit(before,h=room()){
  if(!before||!homeValid(h)||before.home!==h)return false;
  const after=snapshot(h);
  if(!after||same(before,after))return false;
  const m=stack(h);m.undo.push({before,after});
  if(m.undo.length>10)m.undo.shift();
  m.redo=[];
  return true;
 }
 function invalidate(h){if(homeValid(h))memory.delete(h);}
 function apply(snap){
  const s=state(),h=snap.home;
  if(h==='player')s.placed=cloneItems(snap.items,h);
  else s.residenceProps[h]=cloneItems(snap.items,h);
  s.atelierStorage[h]=snap.stored.map(x=>({...x}));
  s.coins=snap.coins;save();updateUI();
 }
 function direction(which,h=room()){
  if(!homeValid(h))return false;
  const m=stack(h),from=which==='undo'?m.undo:m.redo,to=which==='undo'?m.redo:m.undo;
  if(!from.length){notify('No more furniture changes to '+which+'.');return false;}
  const pair=from[from.length-1],required=which==='undo'?pair.after:pair.before;
  // Undo is safe only while current room and coins equal the recorded state.
  if(!same(snapshot(h),required)){
   invalidate(h);notify('Your home or coin balance has changed. Start a new decorating history.');return false;
  }
  from.pop();to.push(pair);apply(which==='undo'?pair.before:pair.after);
  notify(which==='undo'?'↶ Furniture change undone.':'↷ Furniture change restored.');
  if(api.isInRoom(h))reopen();
  return true;
 }
 function storeItem(index,h=room()){
  if(!homeValid(h)||!api.isInRoom(h))return false;
  const things=list(h),stored=storage(h);
  if(!Number.isInteger(index)||index<0||index>=things.length)return false;
  if(stored.length>=cap(h)){notify('Your storage is full. Place another item first.');return false;}
  const item=things[index];
  if(!typesFor(h).includes(item.kind))return false;
  const before=snapshot(h);
  things.splice(index,1);
  stored.push({kind:item.kind,rot:item.rot||0});
  commit(before,h);save();updateUI();notify('Stored safely. You can place it again for free.');
  reopen();return true;
 }
 function storedItem(index,h=room()){
  const rows=homeValid(h)?storage(h):null;
  return Number.isInteger(index)&&rows&&index>=0&&index<rows.length?rows[index]:null;
 }
 function beginStored(index,h=room()){
  if(!homeValid(h)||!api.isInRoom(h)||!storedItem(index,h))return false;
  api.beginStored(index);return true;
 }
 function toolbar(h=room()){
  if(!homeValid(h))return '';
  const m=stack(h),u=m.undo.length,r=m.redo.length;
  const rows=storage(h);
  const labels={bed:'Cloud-soft bed',sofa:'Peach sofa',plant:'Fern in pot',
   books:'Storybook shelf',lamp:'Honey lamp',rug:'Patchwork rug',chair:'Wooden chair',flowers:'Flower vase'};
  const icons={bed:'🛏️',sofa:'🛋️',plant:'🪴',books:'📚',lamp:'💡',rug:'🧶',chair:'🪑',flowers:'💐'};
  return '<section class="at-ui"><h3>🪡 Little Atelier</h3><p>Move, store and try again without losing an item. Undo and redo are available during this decorating session.</p><div class="at-toolbar"><button data-act="at-undo" '+(!u?'disabled':'')+'>↶ Undo</button><button data-act="at-redo" '+(!r?'disabled':'')+'>↷ Redo</button><span>'+u+' change'+(u===1?'':'s')+' to undo</span></div><h4>📦 Furniture storage · '+rows.length+'/'+cap(h)+'</h4><div class="at-storage">'+(rows.map((item,i)=>'<div><span>'+icons[item.kind]+'</span><b>'+labels[item.kind]+'</b><button data-act="at-place" data-id="'+i+'">Place</button></div>').join('')||'<p>Nothing stored yet. Store a placed item here to keep it without selling.</p>')+'</div></section>';
 }
 function handle(action,id){
  if(action==='at-undo')return direction('undo');
  if(action==='at-redo')return direction('redo');
  if(action==='at-store')return storeItem(Number(id));
  if(action==='at-place')return beginStored(Number(id));
 }
 return {snapshot,commit,invalidate,direction,storeItem,storedItem,toolbar,handle,storage,beginStored,cap};
}
root.HearthAtelier={clean,setup,HOMES,TYPES,ROOM_TYPES};
})(window);
