/* Hearth & Harbor v2.5.11 — Roots & Keepsakes
   True household aspirations: player and six residents, three tracks,
   three completed in-world activities across separate days, legacy frames.
   Uses the existing local save and household action engine. */
(function(root){'use strict';
const IDS=['player','mabel','rosie','oliver','jun','bea','finn'];
const NAMES={player:'Poppy',mabel:'Mabel',rosie:'Rosie',oliver:'Oliver',jun:'Jun',bea:'Bea',finn:'Finn'};
const PATHS={
 maker:{name:'Cozy Maker',icon:'🪡',motif:'flower',desc:'Care for a welcoming space, then learn to slow down and make it yours.',steps:[
  {action:'tidy',title:'Tend your home',description:'Complete a tidy-up activity at home'},
  {action:'hobby',title:'Make something just for you',description:'Spend time on a personal hobby'},
  {action:'rest',title:'Rest in a home you love',description:'Take a restorative nap'}],
  ending:'A home is never just furniture. The little things you care for become part of its story.'},
 storyteller:{name:'Story Keeper',icon:'📚',motif:'book',desc:'Collect a quiet chapter, a kind word, and a memory worth preserving.',steps:[
  {action:'read',title:'Find a new chapter',description:'Complete a reading activity'},
  {action:'chat',title:'Share a little warmth',description:'Enjoy quality time or write a friendly letter'},
  {action:'hobby',title:'Follow your inspiration',description:'Spend time on a favorite hobby'}],
  ending:'Stories are more beautiful when someone is there to hear them. You have started a little tradition.'},
 nurturer:{name:'Caring Heart',icon:'🍲',motif:'heart',desc:'Fill the home with good food, laughter, and everyday acts of care.',steps:[
  {action:'meal',title:'Prepare a little comfort',description:'Complete a home meal activity'},
  {action:'chat',title:'Connect with someone',description:'Make time for conversation or a kind letter'},
  {action:'tidy',title:'Leave things lovelier',description:'Complete a tidy-up activity'}],
  ending:'Your everyday acts of care have turned a familiar room into a welcoming place.'}
};
const PATH_IDS=Object.keys(PATHS);
const DEFAULT={player:'maker',mabel:'maker',rosie:'nurturer',oliver:'nurturer',jun:'storyteller',bea:'maker',finn:'storyteller'};
const OWN = obj=>obj&&typeof obj==='object'&&!Array.isArray(obj);
const boundedDay=n=>Number.isInteger(n)&&n>=0&&n<=9999?n:0;
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const blank=id=>({path:DEFAULT[id],stage:0,lastDay:0,finished:{}});
function clean(input){
 const out={people:{},memories:[]},src=OWN(input)?input:{},from=OWN(src.people)?src.people:{};
 for(const id of IDS){
  const s=OWN(from[id])?from[id]:{},p=s.path===null?null:PATH_IDS.includes(s.path)?s.path:DEFAULT[id];
  const finished={};if(OWN(s.finished))for(const key of PATH_IDS){
   const d=boundedDay(s.finished[key]);if(d>=1)finished[key]=d;
  }
  out.people[id]={
   path:p&&finished[p]?null:p,
   stage:Number.isInteger(s.stage)&&s.stage>=0&&s.stage<=2&&!finished[p]?s.stage:0,
   lastDay:boundedDay(s.lastDay),
   finished
  };
 }
 if(Array.isArray(src.memories))for(const row of src.memories.slice(-90)){
  if(!OWN(row)||!IDS.includes(row.id)||!PATH_IDS.includes(row.path)||!Number.isInteger(row.day)||row.day<1||row.day>9999)continue;
  const stamp=out.people[row.id].finished[row.path];
  if(stamp!==row.day||out.memories.some(x=>x.id===row.id&&x.path===row.path))continue;
  out.memories.push({id:row.id,path:row.path,day:row.day});
 }
 out.memories=out.memories.slice(-21);
 return out;
}
function setup(api){
 const {getState,save,notify,updateUI,showModal,closeModal}=api;
 const state=()=>getState();
 const record=()=>{const s=state();if(!OWN(s.homeAspirations)||!OWN(s.homeAspirations.people))s.homeAspirations=clean(s.homeAspirations);return s.homeAspirations;};
 const who=id=>IDS.includes(id)?id:null;
 const status=id=>{const real=who(id);return real?record().people[real]:null;};
 const title=id=>id==='player'?(String(state().name||'Poppy').slice(0,32)):NAMES[id];
 function select(id,path){
  if(!who(id)||!PATH_IDS.includes(path))return board();
  const r=status(id);
  if(r.finished[path]){notify(title(id)+' has already completed this aspiration.');return board();}
  if(r.path!==path){
   r.path=path;r.stage=0; // An unfinished aspiration may be changed without affecting completed keepsakes.
   save();notify(title(id)+' is beginning '+PATHS[path].name+'.');
  }
  board();
 }
 function recordAction(id,kind,context={}){
  const p=status(id),s=state();
  if(!p||!p.path||!PATHS[p.path]||!Number.isInteger(s.day)||s.day<1||s.day>9999)return false;
  if(p.lastDay===s.day||p.finished[p.path]||!['home','residence'].includes(context.scene))return false;
  if(id==='player'&&context.scene!=='home')return false;
  if(id!=='player'&&(context.scene!=='residence'||!context.members?.includes(id)))return false;
  const path=PATHS[p.path],current=path.steps[p.stage];
  if(!current||kind!==current.action)return false;
  p.stage++;p.lastDay=s.day;
  if(p.stage===3){
   const completed=p.path;
   p.finished[completed]=s.day;p.path=null;p.stage=0;
   const r=record();r.memories.push({id,path:completed,day:s.day});r.memories=r.memories.slice(-21);
   s.hearts=clamp((s.hearts||0)+4,0,1000000);
   if(id==='player')s.coins=clamp((s.coins||0)+10,0,1000000);
   else s.relations[id]=clamp((s.relations[id]||0)+5,0,100);
   notify('💌 '+title(id)+' completed '+path.name+'! A keepsake now hangs at home.');
  }else notify('🌷 '+title(id)+' made progress toward '+path.name+' ('+p.stage+'/3). The next step opens tomorrow.');
  save();updateUI();
  return true;
 }
 function nextDayDescription(id){
  const s=status(id);if(!s)return '';
  if(!s.path)return 'Choose a new aspiration.';
  const step=PATHS[s.path].steps[s.stage];
  if(!step)return 'A keepsake is ready.';
  return (s.lastDay===state().day?'✓ Step completed today — tomorrow: ':'Next: ')+step.title;
 }
 function board(){
  const r=record(),s=state(),owners=IDS.map(id=>{
   const p=r.people[id],completed=PATH_IDS.filter(x=>p.finished[x]),cur=p.path?PATHS[p.path]:null;
   const choices=PATH_IDS.map(x=>'<button data-act="asp-select" data-id="'+id+'|'+x+'" '+(p.path===x?'aria-pressed="true"':p.finished[x]?'disabled':'')+'>'+PATHS[x].icon+' '+PATHS[x].name+(p.finished[x]?' ✓':p.path===x?' · Active':'')+'</button>').join('');
   return '<article class="ra-person"><header><span class="ra-avatar">'+(id==='player'?'🌼':({mabel:'🌷',rosie:'🍎',oliver:'🥐',jun:'📖',bea:'🎨',finn:'🐟'}[id]))+'</span><div><h3>'+escape(title(id))+'</h3><small>'+completed.length+'/3 aspirations remembered</small></div></header><p>'+(cur?cur.desc:'All of this track’s steps are finished. Choose another journey.')+'</p>'+(cur?'<div class="ra-steps">'+cur.steps.map((step,i)=>'<div class="'+(i<p.stage?'done':i===p.stage?'now':'')+'">'+(i<p.stage?'✓':i===p.stage?'◇':'·')+' '+step.title+'</div>').join('')+'</div><div class="ra-tip">'+nextDayDescription(id)+'</div>':'')+'<div class="ra-options">'+choices+'</div></article>';
  }).join('');
  const memories=r.memories.slice().reverse().slice(0,12).map(x=>'<div class="ra-memory"><span>'+PATHS[x.path].icon+'</span><div><b>'+escape(title(x.id))+' · '+PATHS[x.path].name+'</b><small>Day '+x.day+' · '+PATHS[x.path].ending+'</small></div></div>').join('');
  showModal('aspirations','<div class="ra-ui"><div class="ra-overline">A HOUSE IS A HOME · FAMILY FOUNDATIONS</div><h2>💌 Roots & Keepsakes</h2><p>Make room for real dreams. Choose an aspiration, then complete its three activities through the usual Daybook. Each step must happen on a different in-game day. Residents can progress while guided or through their existing home autonomy.</p><div class="ra-summary">🏡 '+r.memories.length+' lasting household keepsakes · no deadlines, upkeep or real-money purchases</div><div class="ra-people">'+owners+'</div><h3>The family memory wall</h3><div class="ra-history">'+(memories||'<p>The first framed story is waiting to be made.</p>')+'</div><button data-act="asp-close" class="ra-close">Back to your day</button></div>');
 }
 function escape(s){return String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
 function handle(act,arg){
  if(act==='asp-board')return board();
  if(act==='asp-select'){const [id,path]=String(arg).split('|');return select(id,path);}
  if(act==='asp-close')return closeModal();
 }
 // Original tiny storybook keepsake drawings are on the wall in actual dwellings.
 function drawWall(g,{home='player',members=[]}={}){
  const owners=home==='player'?['player']:members.filter(id=>who(id)&&id!=='player').slice(0,2);
  const r=record();
  g.save();
  for(let ownerIndex=0;ownerIndex<owners.length;ownerIndex++){
   const id=owners[ownerIndex],p=r.people[id];
   if(!p)continue;
   PATH_IDS.forEach((path,index)=>{
    if(!p.finished[path])return;
    const xx=home==='player'?[418,479,700][index]:(ownerIndex===0?415:667)+index*44;
    const yy=home==='player'?164:210;
    g.fillStyle='#875f50';g.fillRect(xx-15,yy-18,31,38);
    g.fillStyle='#e8b786';g.fillRect(xx-12,yy-15,25,32);
    g.fillStyle='#fff1d6';g.fillRect(xx-9,yy-12,19,26);
    g.strokeStyle='#d5ac79';g.lineWidth=1;g.strokeRect(xx-7,yy-10,15,22);
    if(path==='maker'){
     g.fillStyle='#65936a';g.fillRect(xx-1,yy-1,2,8);g.fillRect(xx-7,yy+5,7,3);
     for(let i=0;i<5;i++){let a=i*Math.PI*2/5;g.fillStyle='#eba4b9';g.beginPath();g.ellipse(xx+Math.cos(a)*5,yy-4+Math.sin(a)*5,4,3,0,0,Math.PI*2);g.fill();}
     g.fillStyle='#f8d786';g.fillRect(xx-2,yy-6,4,4);
    }else if(path==='storyteller'){
     g.fillStyle='#9bbad0';g.fillRect(xx-7,yy-8,7,17);g.fillStyle='#d9b2cc';g.fillRect(xx+1,yy-8,7,17);
     g.fillStyle='#fff0d3';g.fillRect(xx,yy-7,1,16);g.fillRect(xx-5,yy-3,4,1);g.fillRect(xx+2,yy,4,1);
    }else{
     g.fillStyle='#d88992';g.beginPath();g.moveTo(xx,yy+7);g.bezierCurveTo(xx-15,yy-1,xx-7,yy-11,xx,yy-3);
     g.bezierCurveTo(xx+7,yy-11,xx+15,yy-1,xx,yy+7);g.fill();
    }
    g.fillStyle='#a2785e';g.fillRect(xx-17,yy+20,36,3);
   });
  }
  g.restore();
 }
 return {board,select,recordAction,nextDayDescription,drawWall,handle,status,PATHS,IDS};
}
root.HearthAspirations={setup,clean,PATHS,IDS,DEFAULT};
})(window);
