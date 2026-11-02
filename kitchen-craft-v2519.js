/* Hearth & Harbor v2.5.19 — Kitchen Craft
 * Six differentiated, accessible tap-first techniques inside the existing
 * original cooking minigames. Transient state; real ingredients/quality remain
 * owned by HearthKitchen. No parallel inventory or economy.
 */
(function(root){'use strict';
const KINDS=['chop','season','thread','fill','stamp','garnish'];
const CHOICES={
 season:[['herb','🌿 Fresh herbs'],['zest','🍋 Citrus zest'],['salt','🧂 Sea salt']],
 thread:[['carrot','🥕 Carrot'],['potato','🥔 Potato'],['onion','🧅 Onion']],
 fill:[['berry','🍓 Berry filling'],['honey','🍯 Honey cream'],['garden','🥕 Garden filling']],
 stamp:[['flower','🌸 Flower cutter'],['star','⭐ Star cutter'],['heart','💗 Heart cutter']],
 garnish:[['petal','🌸 Petals'],['leaf','🌿 Fresh leaves'],['berry','🍓 Berries'],['honey','🍯 Honey drizzle']]
};
const LABELS={
 season:['Left edge','Warm center','Right edge'],
 thread:['First vegetable','Middle vegetable','Final vegetable'],
 fill:['Left pastry pocket','Middle pastry pocket','Right pastry pocket'],
 stamp:['First biscuit','Second biscuit','Third biscuit'],
 garnish:['Left of plate','Center of plate','Right of plate']
};
const MAPS={
 season:{eggs:['salt','herb','salt'],noodles:['herb','salt','herb'],fishplate:['zest','herb','salt'],skewers:['herb','salt','zest']},
 thread:{skewers:['carrot','potato','onion']},
 fill:{tart:['berry','honey','berry'],dumplings:['garden','garden','garden']},
 stamp:{biscuits:['star','flower','heart']},
 garnish:{
  salad:['berry','leaf','petal'],pancakes:['berry','honey','berry'],
  fishplate:['leaf','petal','leaf'],tart:['berry','petal','honey'],
  dumplings:['leaf','petal','leaf'],soup:['leaf','petal','leaf']
 }
};
const DEFAULT={season:['herb','salt','zest'],thread:['carrot','onion','potato'],
 fill:['berry','honey','berry'],stamp:['flower','star','heart'],garnish:['leaf','petal','berry']};
const ESC=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function make(kind,recipe){
 if(!KINDS.includes(kind)||typeof recipe!=='string')return null;
 let expected=kind==='chop'?['0','1','2','3']:MAPS[kind]?.[recipe]||DEFAULT[kind];
 if(kind!=='chop')expected=expected.slice();
 const session={kind,recipe,expected,completed:[],selected:null,mistakes:0};
 const length=expected.length;
 function progress(){return Math.round(session.completed.length/length*100)}
 function finish(){return session.completed.length>=length}
 function score(){return Math.max(75,96-Math.min(7,session.mistakes)*3)}
 function title(){return ({
  chop:'A lovely row of tiny slices',season:'Fresh seasoning, one pinch at a time',
  thread:'Build a colorful garden skewer',fill:'Fill each little pastry pocket',
  stamp:'Press the cookie cutters',garnish:'Style the final plate'
 })[kind]}
 function helper(){
  if(kind==='chop')return 'Tap the cut marks from left to right. Each slice leaves a real mark on the board.';
  if(kind==='thread')return 'Pick a vegetable, then tap the next empty skewer position. Follow the illustrated recipe.';
  if(kind==='stamp')return 'Choose a cutter, then press it into the matching empty biscuit.';
  if(kind==='fill')return 'Choose a filling, then spoon it into the next little pastry pocket.';
  if(kind==='garnish')return 'Choose a topping and place it on the next part of the dish.';
  return 'Choose the seasoning, then sprinkle it on the next part of the plate.';
 }
 const choices=()=>CHOICES[kind]||[];
 function chosenText(value){return choices().find(([id])=>id===value)?.[1]||value}
 function render(){
  const n=session.completed.length,done=finish();
  const next=session.expected[n];
  const marks=Array.from({length:length},(_,i)=>{
   const complete=i<n,active=i===n;
   if(kind==='chop')return '<button class="kc-cut '+(complete?'is-done':'')+'" data-act="cook-craft" data-id="cut:'+i+'" '+(complete||!active?'disabled':'')+' aria-label="Slice '+(i+1)+'" aria-pressed="'+complete+'"><span>'+(complete?'✓':'╱')+'</span><small>Cut '+(i+1)+'</small></button>';
   const name=LABELS[kind][i],symbol=complete?'✓':active?'○':'·';
   return '<button class="kc-target '+(complete?'is-done':'')+'" data-act="cook-craft" data-id="place:'+i+'" '+(complete||!session.selected||!active?'disabled':'')+' aria-label="'+ESC(name)+'" aria-pressed="'+complete+'"><span>'+symbol+'</span><small>'+name+'</small></button>';
  }).join('');
  const palette=kind==='chop'?'':('<div class="kc-palette" role="group" aria-label="Choose an ingredient or tool">'+choices().map(([id,label])=>
   '<button data-act="cook-craft" data-id="pick:'+id+'" aria-pressed="'+(session.selected===id)+'">'+label+'</button>').join('')+'</div>');
  const art=root.HearthKitchenWorktopArt?.render(kind,recipe,session.completed,session.selected)||'';
  return '<section class="kc-craft" id="kCraft"><div class="kc-eyebrow">THE LITTLE KITCHEN STUDIO · '+(n+1>length?length:n+1)+' / '+length+'</div><h3>'+title()+'</h3><p>'+helper()+'</p><div class="kc-stage kc-'+kind+'"><div class="kc-woodgrain"></div>'+art+'<div class="kc-positions">'+marks+'</div></div>'+palette+
   '<div class="kc-feedback" role="status" aria-live="polite"><span>'+(done?'✨ Beautifully prepared!':
   session.mistakes?'Try another combination. Nothing is lost.':
   kind==='chop'?'Make the next careful cut.':!session.selected?'Select your ingredient or cutter.':'Selected '+chosenText(session.selected)+' · tap the highlighted spot.')+'</span><b>'+n+' of '+length+' placed</b></div></section>';
 }
 function act(code){
  if(finish()||typeof code!=='string')return {valid:false,done:finish(),progress:progress(),score:score()};
  const [verb,id,...extra]=code.split(':');
  if(extra.length)return {valid:false,done:false,progress:progress()};
  const n=session.completed.length;
  if(kind==='chop'){
   if(verb!=='cut'||id!==session.expected[n]){session.mistakes++;return {valid:false,done:false,progress:progress(),message:'Work along the chopping board from left to right.'};}
   session.completed.push(id);return {valid:true,done:finish(),progress:progress(),score:score()};
  }
  if(verb==='pick'){
   if(!choices().some(x=>x[0]===id))return {valid:false,done:false,progress:progress()};
   session.selected=id;return {valid:true,done:false,progress:progress(),score:score()};
  }
  if(verb==='place'){
   const num=Number(id);
   if(!Number.isInteger(num)||num!==n||!session.selected)return {valid:false,done:false,progress:progress()};
   if(session.selected!==session.expected[n]){
    session.mistakes++;return {valid:false,done:false,progress:progress(),message:'That ingredient or cutter fits a different part of the recipe.'};
   }
   session.completed.push(session.selected);session.selected=null;
   return {valid:true,done:finish(),progress:progress(),score:score()};
  }
  return {valid:false,done:false,progress:progress()};
 }
 return {render,act,progress,finish,score,get state(){return session}};
}
root.HearthKitchenCraft={KINDS,make,MAPS};
})(window);