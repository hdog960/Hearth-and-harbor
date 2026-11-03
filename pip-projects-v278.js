/* Hearth & Harbor v2.7.8 — Pip's Independent Little Projects.
 * Dreams shape actual cottage routes, artwork, poses and optional two-part
 * interactions. Daily activities happen whether or not Poppy opens a menu.
 * Completing a project requires Pip's real current world position/time,
 * two deliberate choices, and genuine adopted guardianship.
 */
(function(root){'use strict';
const DREAMS={
 stories:{
  title:'Storybook Studio',icon:'📖',color:'#ae85ad',need:'curiosity',
  morning:{x:675,y:745,icon:'📚',prop:'open-book',title:'A Storybook Morning',note:'Pip independently imagines the next chapter'},
  afternoon:{x:562,y:734,icon:'✒️',prop:'story-scroll',title:'A Little Story Workshop',note:'Pip works on an illustrated tale'},
  scenes:[
   {prompt:'Pip has been making up a story all afternoon. Who appears on the next page?',answers:[
    ['A brave little rabbit','Pip sketches a small rabbit with a very big adventure.'],
    ['A friendly paper dragon','Pip imagines a dragon who prefers warm tea to treasure.']]},
   {prompt:'Pip wonders how the story should sound when you read it aloud.',answers:[
    ['Quiet and dreamy','Pip whispers the words as gently as falling leaves.'],
    ['Lively and silly','The last page makes you both laugh.']]}
  ]},
 kindness:{
  title:'The Cozy Helper',icon:'💗',color:'#cb9b76',need:'confidence',
  morning:{x:718,y:611,icon:'🧺',prop:'soft-basket',title:'A Gentle Helping Morning',note:'Pip independently arranges the soft cottage cushions'},
  afternoon:{x:809,y:422,icon:'🌷',prop:'table-flower',title:'A Little Welcome Table',note:'Pip makes the supper space welcoming'},
  scenes:[
   {prompt:'Pip has been preparing a cozy corner. What should the little welcome be?',answers:[
    ['A cushion for a visitor','Pip makes space for somebody to rest.'],
    ['A hand-drawn greeting','Pip draws a kind little welcome note.']]},
   {prompt:'Pip thinks about what makes a house feel like home.',answers:[
    ['A place for everyone','Pip carefully makes a little more room.'],
    ['The things we share','Pip smiles at everything you have made together.']]}
  ]},
 discover:{
  title:'The Tiny Explorer',icon:'🍀',color:'#83b19b',need:'curiosity',
  morning:{x:687,y:739,icon:'🌱',prop:'seedling',title:'A Miniature Nature Watch',note:'Pip independently watches a little seedling grow'},
  afternoon:{x:741,y:830,icon:'🔎',prop:'field-notes',title:'The Field Notes Corner',note:'Pip studies sketches of nearby plants'},
  scenes:[
   {prompt:'Pip has noticed something strange about the little plant. What should you examine?',answers:[
    ['The tiny new leaves','Pip counts the leaves in their field journal.'],
    ['The shadows nearby','You compare how the sunlight moves through the day.']]},
   {prompt:'How will you record your small discovery?',answers:[
    ['Draw it in the notebook','Pip adds careful shapes to a tiny drawing.'],
    ['Remember a thoughtful question','Pip writes one new question for tomorrow.']]}
  ]}
};
const IDS=Object.keys(DREAMS);
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const dayOK=x=>Number.isInteger(x)&&x>=1&&x<=9999;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function clean(raw){
 const seen=new Set(),out=[];
 if(Array.isArray(raw))for(const x of raw.slice(-120)){
  if(!obj(x)||!IDS.includes(x.dream)||!dayOK(x.day)||!Number.isInteger(x.slot)||![1,2].includes(x.slot)||
   !Number.isInteger(x.mask)||x.mask<0||x.mask>3||seen.has(x.day))continue;
  seen.add(x.day);out.push({day:x.day,dream:x.dream,slot:x.slot,mask:x.mask});
 }
 return out.sort((a,b)=>a.day-b.day).slice(-40);
}
function schedule(minute,child,day,baseline){
 const fallback=baseline(minute,child?.guardian);
 const focus=child?.dream?.focus,chosen=child?.dream?.chosenDay;
 if(child?.guardian!=='player'||!IDS.includes(focus)||!dayOK(chosen)||chosen>day)return fallback;
 const def=DREAMS[focus],baseRoute=fallback.route;
 const growth=root.HearthPipGrowth.lifeStage(child,day);
 const morning={...def.morning},afternoon={...def.afternoon};
 if(growth>=1){
  morning.x+=12;morning.y-=12;
  morning.title='A Growing '+def.morning.title;
  morning.note='Pip independently tackles a bigger '+def.title.toLowerCase()+' project';
 }
 if(growth>=2){
  afternoon.x-=18;afternoon.y-=14;
  afternoon.title='An Independent '+def.afternoon.title;
  afternoon.note='Pip plans the next step on their own, ready to share it with Poppy';
 }
 // A teen's selected direction affects their already real aspiration station;
 // it never fabricates completion of that project's separate play steps.
 if(growth>=3){
  const choice=root.HearthPipGrowth.clean(child.growth).thirdChoice;
  afternoon.x+=choice===0?21:-13;
  afternoon.y+=choice===0?4:15;
  afternoon.title=(choice===0?'A Curious ':'A Caring ')+def.afternoon.title;
  afternoon.note=choice===0?
   'Pip independently sketches a map for a new thoughtful adventure':
   'Pip plans how this skill might make Maplewood more welcoming';
 }
 const route=[
  {start:0,x:765,y:756,title:'Quiet rest',icon:'🌙',prop:'pillow',note:'A safe little cottage morning'},
  {start:360,...morning},
  {start:720,...afternoon},
  {start:1080,x:765,y:756,title:'Bedtime wind-down',icon:'💛',prop:'pillow',note:'A cozy end to a curious day'}
 ];
 const m=Number.isFinite(minute)?((minute%1440)+1440)%1440:0;
 const slot=Math.min(3,Math.floor(m/360)),current=route[slot],prior=route[(slot+3)%4];
 const progress=clamp((m-current.start)/75,0,1),smooth=progress*progress*(3-2*progress);
 const x=prior.x+(current.x-prior.x)*smooth,y=prior.y+(current.y-prior.y)*smooth;
 const achievements=child?.dream?.achievements?.[focus];
 const stage=Array.isArray(achievements)?Math.max(0,...achievements.filter(a=>obj(a)&&[1,2].includes(a.stage)&&dayOK(a.day)&&a.day<=day).map(a=>a.stage)):0;
 return {...fallback,scene:'home',x,y,moving:progress<1&&Math.hypot(current.x-prior.x,current.y-prior.y)>2,
  facing:current.x>prior.x?'side':current.y<prior.y?'back':'front',
  label:current.title,icon:current.icon,prop:current.prop,note:current.note,
  next:route[(slot+1)%4].title,nextAt:((slot+1)%4)*360,slot,progress,
  route:route.map(r=>({start:r.start,title:r.title,icon:r.icon,note:r.note})),
  project:slot===1||slot===2,focus,stage,growthStage:growth,activeDream:def.title};
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild(),day=()=>dayOK(state().day)?state().day:1;
 const records=()=>Array.isArray(child().projects)?child().projects:[];
 const current=()=>api.location?.();
 let session=null;
 const present=()=>{
  const p=current();
  return !!p&&p.project===true&&IDS.includes(p.focus)&&api.getScene?.()==='home'&&child().guardian==='player'&&
   dayOK(child().guardianDay)&&child().guardianDay<=day()&&api.nearChild?.(125)===true;
 };
 const completedToday=()=>records().some(r=>r.day===day());
 const eligible=()=>present()&&!completedToday()&&!session;
 function panel(){
  const p=current(),valid=child().guardian==='player'&&IDS.includes(child().dream?.focus);
  if(!valid)return '<section class="pi278-panel"><div class="pi278-header"><h3>🪶 Pip’s Little Projects</h3><p>Once you have welcomed Pip home and chosen a childhood dream, their interests will guide their everyday activities in your playable cottage.</p></div></section>';
  const interest=DREAMS[child().dream.focus],now=present(),past=records().filter(r=>r.day<=day()),played=completedToday();
  return '<section class="pi278-panel"><div class="pi278-header"><small>LITTLE MOMENTS THAT HAPPEN ON THEIR OWN</small><h3>'+interest.icon+' Pip’s Little Projects</h3><p>Pip independently follows '+esc(interest.title)+' through a real morning and afternoon routine. No button is needed for Pip to begin.</p><strong>'+(p?.project&&p.focus===child().dream.focus?esc(p.label):'A little break from the day')+'</strong></div>'+
   '<div class="pi278-status">'+(played?'✓ Today’s shared project was already finished.':now?'🌱 Pip is working on a real little project right now.':'Visit Pip at their cottage work spot between 6 AM and 6 PM to join in.')+'</div>'+
   (eligible()?'<button data-act="pi278-start">🌷 Join Pip at their project</button>':'')+
   '<h3>Our shared little projects</h3><ul class="pi278-history">'+
   (past.length?past.slice(-6).reverse().map(x=>'<li>Day '+x.day+' · '+DREAMS[x.dream].icon+' '+esc(DREAMS[x.dream].title)+'</li>').join(''):'<li>Pip’s project table has room for its first shared memory.</li>')+'</ul>'+
   '<p>Join only by standing beside Pip while the project is actually happening. Poppy and Pip each keep their own real experiences.</p></section>';
 }
 function start(){
  if(!eligible())return false;
  const p=current();session={day:day(),dream:p.focus,slot:p.slot,step:0,mask:0};return page();
 }
 function validSession(){
  if(!session||!present())return false;
  const p=current();return session.day===day()&&session.dream===p.focus&&session.slot===p.slot&&!completedToday();
 }
 function page(){
  if(!validSession()){session=null;return false}
  const def=DREAMS[session.dream],part=def.scenes[session.step];if(!part)return false;
  api.showModal?.('little-sprouts','<section class="ls272-book pi278-story"><div class="ls272-cover"><small>'+def.icon+' WORKING TOGETHER · '+(session.step+1)+' OF 2</small><h2>'+esc(def.title)+'</h2><p>'+esc(part.prompt)+'</p></div><div class="ls272-activity">'+part.answers.map(([title],i)=>'<button data-act="pi278-answer" data-id="'+i+'">'+esc(title)+'</button>').join('')+'</div><button class="ls272-secondary" data-act="pi278-cancel">Leave the project for another time</button></section>');
  return true;
 }
 function choose(i){
  if(!Number.isInteger(i)||i<0||i>1||!validSession()){session=null;return false}
  const part=DREAMS[session.dream].scenes[session.step];if(!part)return false;
  if(i===1)session.mask|=(1<<session.step);
  const reply=part.answers[i][1];session.step++;
  if(session.step<2){
   api.showModal?.('little-sprouts','<section class="ls272-book pi278-story"><div class="ls272-cover"><small>🌷 A LITTLE PROJECT IN PROGRESS</small><h2>Making memories</h2><p>'+esc(reply)+'</p></div><button data-act="pi278-next">Continue the shared project</button><button class="ls272-secondary" data-act="pi278-cancel">Leave the project</button></section>');
   return true;
  }
  const record={day:session.day,dream:session.dream,slot:session.slot,mask:session.mask};
  session=null;
  if(completedToday())return false;
  const c=child();c.projects=clean([...records(),record]);
  const need=DREAMS[record.dream].need;
  c.needs[need]=Math.min(100,Math.max(0,c.needs[need]||0)+7);
  c.needs.joy=Math.min(100,Math.max(0,c.needs.joy||0)+3);
  api.save?.();api.updateUI?.();
  api.notify?.('🌷 A genuine '+DREAMS[record.dream].title+' memory with Pip! '+need+' +7, Joy +3.');
  api.showModal?.('little-sprouts','<section class="ls272-book pi278-story"><div class="ls272-cover"><small>A NEW SHARED LITTLE MOMENT</small><h2>'+DREAMS[record.dream].icon+' '+esc(DREAMS[record.dream].title)+'</h2><p>'+esc(reply)+'</p></div><p>The day’s project happened in the cottage—not from an instant-reward menu. Pip will return to their independent routine.</p><button data-act="pi278-book">Return to Pip’s Daybook</button></section>');
  return true;
 }
 function handle(action,id){
  if(action==='pi278-start')return start();
  if(action==='pi278-next')return page();
  if(action==='pi278-answer')return choose(Number(id));
  if(action==='pi278-cancel'){session=null;return api.openBook?.()}
  if(action==='pi278-book')return api.openBook?.();
  return false;
 }
 function drawProp(g,p,tick=0){
  if(!g||!p?.project||!IDS.includes(p.focus))return false;
  const x=Math.round(p.x+39),y=Math.round(p.y-17+Math.sin(tick*1.7)*1.5),focus=p.focus;
  g.save();g.lineWidth=1;
  // Warm hand-drawn chunky-pixel illustrations, not glyphs or HUD stickers.
  g.fillStyle='#886957';g.fillRect(x-20,y+15,42,5);g.fillRect(x-17,y+20,5,11);g.fillRect(x+14,y+20,5,11);
  if(focus==='stories'){
   g.fillStyle='#f3dfa9';g.fillRect(x-17,y-5,33,21);
   g.fillStyle='#a47f9b';g.fillRect(x-2,y-5,4,21);
   g.fillStyle='#835c77';g.fillRect(x-13,y+2,8,2);g.fillRect(x+5,y+4,7,2);
   g.fillStyle='#a77e7e';g.fillRect(x+10,y-13,4,12);g.fillRect(x+8,y-15,8,3);
  }else if(focus==='kindness'){
   g.fillStyle='#dfba88';g.fillRect(x-15,y-3,28,18);
   g.fillStyle='#9a7659';g.fillRect(x-12,y-8,22,5);g.fillRect(x-12,y+3,3,10);g.fillRect(x+7,y+3,3,10);
   g.fillStyle='#d19aab';g.fillRect(x-9,y-13,20,12);
   g.fillStyle='#f0d5ba';g.fillRect(x-5,y-9,12,5);
  }else{
   g.fillStyle='#c5aa91';g.fillRect(x-15,y+1,29,15);
   g.fillStyle='#f5ead0';g.fillRect(x-10,y+2,20,11);
   g.fillStyle='#719f7a';g.fillRect(x-2,y-14,3,16);
   g.fillRect(x-11,y-13,10,5);g.fillRect(x+2,y-18,10,6);
   g.fillStyle='#537e66';g.fillRect(x-7,y-16,5,3);
  }
  if(p.stage>=1){
   g.fillStyle='#fff0c9';g.fillRect(x+20,y-27,11,11);
   g.fillStyle=DREAMS[focus].color;g.fillRect(x+23,y-24,5,5);
  }
  if(p.stage>=2){
   g.fillStyle=DREAMS[focus].color;g.fillRect(x-26,y-25,7,7);
   g.fillStyle='#fff0d4';g.fillRect(x-24,y-23,3,3);
  }
  if(p.growthStage>=1){
   g.fillStyle='#f7e8c8';g.fillRect(x-27,y+5,8,11);
   g.fillStyle='#bb9d85';g.fillRect(x-26,y+7,6,3);
  }
  if(p.growthStage>=2){
   g.fillStyle=DREAMS[focus].color;g.fillRect(x+25,y-19,10,17);
   g.fillStyle='#fff0dc';g.fillRect(x+27,y-16,6,8);
  }
  g.restore();return true;
 }
 return {clean,schedule,panel,start,page,choose,eligible,handle,drawProp,records,get session(){return session}};
}
root.HearthPipProjects={setup,clean,schedule,DREAMS};
})(window);
