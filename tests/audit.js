// Consistency audit of all simulators. Run: node tests/audit.js
const fs=require('fs');
global.window={};
const src=['data.js','extra.js','ops.js','data2.js','ops2.js','models.js','nom.js','safety.js'].map(f=>fs.readFileSync(__dirname+'/../src/'+f,'utf8')).join('\n').replace(/^const /gm,'var ').replace(/^let /gm,'var ');
global.byId={};eval(src);PROCESSES.forEach(p=>byId[p.id]=p);
const issues=[];const I=(m)=>issues.push(m);
for(const P of PROCESSES){
  const def=Object.fromEntries(P.params.map(q=>[q.id,q.val]));
  // defaults in range
  P.params.forEach(q=>{if(q.type!=='select'&&(q.val<q.min||q.val>q.max))I(`${P.id}: default ${q.id} out of range`);if(q.type==='select'&&!q.options.find(o=>o[0]===q.val))I(`${P.id}: default select ${q.id} invalid`);});
  // outputs keys exist
  const r0=P.compute(def);P.outputs.forEach(o=>{if(!(o.k in r0.o))I(`${P.id}: output ${o.k} missing`);});
  if(!P.outputs.find(o=>o.pri))I(`${P.id}: no primary output`);
  // sweep each numeric param x each select combo
  const sels=P.params.filter(q=>q.type==='select');const combos=[{}];sels.forEach(s=>{const n=[];combos.forEach(c=>s.options.forEach(([v])=>n.push({...c,[s.id]:v})));combos.splice(0,combos.length,...n);});
  let bad=0,neg=0;
  for(const cb of combos)for(const q of P.params.filter(q=>q.type!=='select'))for(let i=0;i<=20;i++){const p={...def,...cb,[q.id]:q.min+(q.max-q.min)*i/20};let r;try{r=P.compute(p);}catch(e){I(`${P.id}: throws ${e.message} at ${JSON.stringify(p)}`);bad++;continue;}
    for(const o of P.outputs){const v=r.o[o.k];const nd=P.models&&p.model!==P.models[0].id;if(!isFinite(v)&&nd)continue;if(!isFinite(v)){bad++;if(bad<3)I(`${P.id}: ${o.k}=${v} at ${q.id}=${p[q.id]} ${JSON.stringify(cb)}`);}else if(v<0){neg++;if(neg<3)I(`${P.id}: negative ${o.k}=${v.toPrecision(3)} at ${q.id}=${p[q.id]} ${JSON.stringify(cb)}`);}}}
  // quiz
  for(const [nm,Q] of [['quiz',P.quiz],['pre',PRE[P.id]||[]]]){if(!Q.length)I(`${P.id}: no ${nm}`);Q.forEach((q,i)=>{if(q.a<0||q.a>=q.o.length)I(`${P.id} ${nm}${i}: answer index`);if(new Set(q.o).size!==q.o.length)I(`${P.id} ${nm}${i}: duplicate options`);});}
  // numericals
  if(!NUM[P.id])I(`${P.id}: no numerical`);else for(let k=0;k<300;k++){const n=NUM[P.id]();if(!isFinite(n.ans)||n.ans<=0){I(`${P.id} numerical: ans ${n.ans}`);break;}
    const nums=(n.sol.match(/-?\d+(\.\d+)?(e-?\d+)?/g)||[]).map(Number);const last=nums[nums.length-1];
    if(Math.abs(last/n.ans-1)>0.02&&!(n.unit==='°'&&Math.abs(last/n.ans-1)<0.02)){I(`${P.id} numerical: solution end ${last} vs ans ${n.ans.toPrecision(4)} :: ${n.sol.slice(-80)}`);break;}}
  // validation
  if(!VALID[P.id])I(`${P.id}: no VALID`);
  // ops
  const O=OPS[P.id];if(!O){I(`${P.id}: no OPS`);continue;}
  for(let k=0;k<30;k++){const o=P.compute(def).o;const m=O.meas(def,o);if(m.ask.ans!==0&&Math.abs(m.ask.ans/m.model-1)>0.08){I(`${P.id} operate: measured ans ${m.ask.ans.toPrecision(4)} vs model ${(+m.model).toPrecision(4)}`);break;}
    const cy=O.cycle(def,o);if(!isFinite(cy.min)||cy.min<=0)I(`${P.id} operate: cycle ${cy.min}`);
    const lv=O.live({work:1,tool:1,fluid:1,on:1,prog:0.5,x:{}},def,o);if(lv.some(([a,b])=>String(b).includes('NaN')||String(b).includes('undefined')))I(`${P.id} live: ${JSON.stringify(lv)}`);}
  O.parts.forEach(pt=>{const z=pt.zone;if(z[0]<0||z[1]<0||z[0]+z[2]>640||z[1]+z[3]>400)I(`${P.id} zone ${pt.id} off-canvas ${z}`);});
  const ids=new Set([...O.parts.map(x=>x.id),...O.switches.map(x=>x.id)]);[...O.parts,...O.switches].forEach(x=>(x.req||[]).forEach(r=>{if(!ids.has(r))I(`${P.id}: req ${r} of ${x.id} not defined`);}));
}
for(const P of PROCESSES){const S=SAFETY[P.id];if(!S||!['haz','ppe','rules','emerg'].every(k=>S[k]&&S[k].length))I(P.id+': safety incomplete');const L=LIB[P.id];if(!L||!L.rows.length||L.rows.some(r=>r.length!==L.cols.length)||(L.extra&&L.extra.rows.some(r=>r.length!==L.extra.cols.length)))I(P.id+': library bad');if(!(ERRS[P.id]||[]).length)I(P.id+': no ERRS');if((DISC[P.id]||[]).length<3)I(P.id+': DISC<3');if(!NOM[P.id])I(P.id+': no NOM');}
console.log(issues.length?issues.join('\n'):'NO ISSUES');
