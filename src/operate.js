// ---------- operate engine ----------
const runlog={};PROCESSES.forEach(P=>runlog[P.id]=[]);
(function(){const s=store.get('ntm-lab-v2');if(s&&s.runlog)for(const k in s.runlog)if(runlog[k])runlog[k]=s.runlog[k];})();
const saveAll=()=>store.set('ntm-lab-v2',{state,records,mine,tests,report,runlog});
let OP=null;
const TOP=['work','tool','fluid'];
function opNew(pid){return {pid,f:{work:0,tool:0,fluid:0,on:0,prog:0,x:{}},ramps:{},phase:'setup',alarm:'',tA:0,t0:0,dur:7000,meas:null,drag:null,last:0};}
const has=(f,id)=>TOP.includes(id)?!!f[id]:!!f.x[id];
function setF(f,id,v){if(TOP.includes(id))f[id]=v?1:0;else f.x[id]=v?1:0;}
function opItems(O){const items=[...O.parts.map(x=>({...x,kind:'part'})),...O.switches.map(x=>({...x,kind:'sw'}))];
  const seq=[],av=new Set();let guard=0;while(seq.length<items.length&&guard++<50){const it=items.find(i=>!seq.includes(i)&&(i.req||[]).every(r=>av.has(r)));if(!it){items.filter(i=>!seq.includes(i)).forEach(i=>seq.push(i));break;}seq.push(it);av.add(it.id);}return seq;}
function opDerive(P){const f=OP.f,p=state[P.id];
  if(P.id==='chm'){const r=f.x.heatR??(f.x.heat?1:0);f.x.temp=25+(p.T-25)*r;}
  if(P.id==='edm'){f.x.level=f.x.fluidR??(f.fluid?1:0);}
  if(P.id==='ajm'){f.x.airR=f.x.airR??(f.x.air?1:0);}
  if(P.id==='wjm'||P.id==='awjm'){f.x.fluidR=f.x.fluidR??(f.fluid?1:0);}
  if(P.id==='ebm'||P.id==='ibm'){const v=f.x.fluidR??(f.fluid?1:0);f.x.vac=v;if(v<=0)f.x.vacTxt='1 atm';else{const torr=760*Math.pow(10,-v*7.88);const e=Math.floor(Math.log10(torr));f.x.vacTxt=`${(torr/Math.pow(10,e)).toFixed(1)}×10${String(e).replace('-','⁻').replace(/\d/g,d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d])} torr`;}}
}
function opAlarm(msg){OP.alarm=msg;const a=$('#oalarm');if(a){a.hidden=!msg;a.innerHTML=msg?`<b>Alarm.</b> ${msg}`:'';}}
function opPlace(P,partId){const O=OPS[P.id],pt=O.parts.find(x=>x.id===partId);if(!pt||OP.phase==='run')return;
  if(has(OP.f,partId)){return;}
  const miss=(pt.req||[]).filter(r=>!has(OP.f,r));
  if(miss.length){opAlarm(pt.alarm||'Complete the earlier steps first.');return;}
  setF(OP.f,partId,1);opAlarm('');opUI(P);}
function opSwitch(P,id){const O=OPS[P.id],sw=O.switches.find(x=>x.id===id);if(!sw||OP.phase==='run')return;
  const on=has(OP.f,id)||OP.ramps[id];
  if(on){ // switch off + cascade dependants
    const off=id2=>{setF(OP.f,id2,0);delete OP.ramps[id2];delete OP.f.x[id2+'R'];O.switches.filter(s=>(s.req||[]).includes(id2)&&has(OP.f,s.id)).forEach(s=>off(s.id));};off(id);opAlarm('');opDerive(P);opUI(P);return;}
  const miss=(sw.req||[]).filter(r=>!has(OP.f,r));
  if(miss.length){opAlarm(sw.alarm||'Complete the earlier steps first.');return;}
  opAlarm('');
  if(sw.ramp){OP.ramps[id]={t0:performance.now(),dur:(reduce?0.3:sw.ramp)*1000};OP.f.x[id+'R']=0;}else setF(OP.f,id,1);
  opDerive(P);opUI(P);}
function opStart(P){const O=OPS[P.id];if(OP.phase==='run')return;
  const items=opItems(O);const miss=items.find(i=>!has(OP.f,i.id));
  if(miss){opAlarm(`Machine not ready: ${miss.kind==='part'?'place the '+miss.label.replace(/^([A-Z])(?![A-Z0-9])/,m=>m.toLowerCase()):'switch on '+miss.label.replace(/^([A-Z])(?![A-Z0-9])/,m=>m.toLowerCase())} first.`);return;}
  const r=P.compute(state[P.id]);if(!(r.o&&isFinite(Object.values(r.o)[0]))){opAlarm('These settings give no valid result. Change them and try again.');return;}
  opAlarm('');OP.phase='run';OP.f.on=1;OP.f.prog=0;OP.t0=performance.now();OP.dur=reduce?1500:7000;OP.meas=null;opUI(P);}
function opStop(P){if(OP.phase!=='run')return;OP.phase='setup';OP.f.on=0;opAlarm('Emergency stop pressed. The cycle was aborted; reset and run again.');OP.f.prog=0;opUI(P);}
function opFinish(P){const O=OPS[P.id];OP.phase='done';OP.f.on=0;OP.f.prog=1;const o=P.compute(state[P.id]).o;OP.meas={...O.meas(state[P.id],o),settings:diffLabel(P),solved:false,shown:false};opUI(P);
  const m=$('#omeas');if(m)m.scrollIntoView({behavior:reduce?'auto':'smooth',block:'nearest'});}
function opReset(P){OP=opNew(P.id);opDerive(P);opUI(P);}

function renderOp(P){
  const O=OPS[P.id];if(!OP||OP.pid!==P.id){OP=opNew(P.id);opDerive(P);}
  $('#pane').innerHTML=`<p class="aim"><b>Operate the machine.</b> ${O.intro} Settings come from the Experiment tab; you can also change them under <i>Machine settings</i>.</p>
  <div class="bench">
    <div class="scope">
      <div class="scope-bar"><span id="opstat">SETUP</span><span class="btnrow"><button class="iconbtn" id="oreset" type="button">Unload &amp; reset</button><button class="iconbtn estop" id="ostop" type="button">Emergency stop</button></span></div>
      <canvas id="ocv" role="img" aria-label="Machine set-up for ${P.name}"></canvas>
      <div class="alarm" id="oalarm" role="alert" hidden></div>
      <dl class="read" id="ogauges"></dl>
    </div>
    <div class="panel console">
      <h3>Control panel</h3>
      <div><div class="eyebrow">Parts · drag onto the machine or tap</div><div class="tray" id="otray"></div></div>
      <div><div class="eyebrow">Switches</div><div class="switches" id="osw"></div></div>
      <div class="cyc"><div class="eyebrow">Cycle</div><p id="ocyc"></p><button class="btn" id="ostart" type="button">Start cycle</button>
        <div class="pbar" aria-hidden="true"><i id="obar"></i></div><div class="mono small" id="oclock"></div></div>
      <details><summary>Machine settings</summary><form id="octrls" onsubmit="return false">${ctrlHTML(P)}</form></details>
    </div>
  </div>
  <div class="lower">
    <div class="card"><h3>Procedure checklist</h3><ol class="steps" id="osteps"></ol></div>
    <div class="card" id="omeas"><h3>Measurement</h3><p class="muted" id="omeasbody">Complete a cycle to take readings.</p></div>
  </div>
  <div class="card" style="margin-top:20px"><div class="vtitle"><h3>Run log</h3><span class="btnrow"><button class="iconbtn" id="olcsv" type="button">Copy as CSV</button><button class="iconbtn" id="olclr" type="button">Clear</button></span></div><div class="tablewrap" id="olog"></div><p class="foot" id="olmsg" aria-live="polite"></p></div>`;
  sizeCanvas($('#ocv'));
  $('#oreset').onclick=()=>opReset(P);$('#ostop').onclick=()=>opStop(P);$('#ostart').onclick=()=>opStart(P);
  $('#octrls').addEventListener('input',e=>{const k=e.target.dataset.k;if(!k||OP.phase==='run')return;const q=P.params.find(x=>x.id===k);
    state[P.id][k]=q.type==='select'?e.target.value:parseFloat(e.target.value);
    if(q.type!=='select'){const out=$(`#out-${P.id}-${k}`);if(out)out.innerHTML=`${state[P.id][k]} <small>${q.unit}</small>`;}
    if(OP.phase==='done'){OP.phase='setup';OP.f.prog=0;OP.meas=null;}opDerive(P);opUI(P);saveAll();});
  $('#olclr').onclick=()=>{runlog[P.id]=[];saveAll();opLog(P);};
  $('#olcsv').onclick=()=>{const L=runlog[P.id];if(!L.length){$('#olmsg').textContent='No runs yet.';return;}
    const q=s=>`"${String(s).replace(/"/g,'""')}"`;const txt=['Run,Settings,Readings,Your answer,Correct answer,Unit,Model value'].concat(L.map((r,i)=>[i+1,r.settings,r.readings.map(x=>x.join(': ')).join('; '),r.student??'',+r.ans.toPrecision(5),r.unit,+(+r.model).toPrecision(5)].map(q).join(','))).join('\n');
    try{navigator.clipboard.writeText(txt).then(()=>$('#olmsg').textContent='Copied.',()=>$('#olmsg').textContent='Clipboard blocked here.');}catch(e){}};
  // tray drag
  $('#otray').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-part]');if(!b||b.disabled)return;e.preventDefault();
    const g=document.createElement('div');g.className='dragghost';g.textContent=b.textContent;document.body.appendChild(g);
    OP.drag={part:b.dataset.part,g,x0:e.clientX,y0:e.clientY,moved:false};
    const mv=ev=>{const d=OP.drag;if(!d)return;d.moved=d.moved||Math.hypot(ev.clientX-d.x0,ev.clientY-d.y0)>6;g.style.left=ev.clientX+'px';g.style.top=ev.clientY+'px';d.cx=ev.clientX;d.cy=ev.clientY;};
    const up=ev=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);const d=OP.drag;OP.drag=null;g.remove();if(!d)return;
      if(!d.moved){opPlace(P,d.part);return;}
      const cv=$('#ocv'),r=cv.getBoundingClientRect();const lx=(ev.clientX-r.left)/r.width*640,ly=(ev.clientY-r.top)/r.height*400;
      const z=OPS[P.id].parts.find(x=>x.id===d.part).zone;const m=30;
      if(lx>=z[0]-m&&lx<=z[0]+z[2]+m&&ly>=z[1]-m&&ly<=z[1]+z[3]+m)opPlace(P,d.part);
      else opAlarm(`That is not where the ${OPS[P.id].parts.find(x=>x.id===d.part).label.replace(/^([A-Z])(?![A-Z0-9])/,m=>m.toLowerCase())} goes. Drop it on the highlighted area.`);};
    mv(e);window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);});
  $('#osw').addEventListener('click',e=>{const b=e.target.closest('[data-sw]');if(b)opSwitch(P,b.dataset.sw);});
  opUI(P);opLog(P);
}
function opUI(P){if(!$('#ocv'))return;const O=OPS[P.id],f=OP.f;
  $('#otray').innerHTML=O.parts.map(pt=>`<button type="button" class="part${has(f,pt.id)?' placed':''}" data-part="${pt.id}" ${has(f,pt.id)||OP.phase==='run'?'disabled':''}>${has(f,pt.id)?'✓ ':''}${pt.label}</button>`).join('');
  $('#osw').innerHTML=O.switches.map(sw=>{const on=has(f,sw.id),ramp=!!OP.ramps[sw.id];return `<button type="button" class="sw${on?' on':''}${ramp?' ramp':''}" data-sw="${sw.id}" aria-pressed="${on}" ${OP.phase==='run'?'disabled':''}><i class="led"></i><span>${sw.label}</span><b>${ramp?'…':on?'ON':'OFF'}</b></button>`;}).join('');
  const o=P.compute(state[P.id]).o;const cy=O.cycle(state[P.id],o);
  $('#ocyc').textContent=`${cy.label}${isFinite(cy.min)?` · about ${cy.min<1?(cy.min*60).toFixed(1)+' s':cy.min.toFixed(cy.min<10?2:1)+' min'} of machine time`:''}`;
  $('#ostart').disabled=OP.phase==='run';$('#ostop').disabled=OP.phase!=='run';
  $('#opstat').textContent={setup:'SET-UP',run:'MACHINING',done:'CYCLE COMPLETE'}[OP.phase];
  $('#octrls').querySelectorAll('input,select').forEach(i=>i.disabled=OP.phase==='run');
  const items=opItems(O);let cur=items.findIndex(i=>!has(f,i.id));
  $('#osteps').innerHTML=items.map((it,i)=>{const done=has(f,it.id);const act=i===cur;return `<li class="${done?'done':''}${act?' act':''}">${it.kind==='part'?`Place the <b>${it.label.replace(/^([A-Z])(?![A-Z0-9])/,m=>m.toLowerCase())}</b>`:`Switch on the <b>${it.label.replace(/^([A-Z])(?![A-Z0-9])/,m=>m.toLowerCase())}</b>`}${OP.ramps[it.id]?' <span class="muted">(wait…)</span>':''}</li>`;}).join('')
    +`<li class="${OP.phase!=='setup'?'done':''}${cur<0&&OP.phase==='setup'?' act':''}">Press <b>Start cycle</b></li><li class="${OP.meas&&(OP.meas.solved||OP.meas.shown)?'done':''}${OP.phase==='done'&&!(OP.meas&&OP.meas.solved)?' act':''}">Take readings and calculate the result</li>`;
  opGauges(P);opMeas(P);
  if(OP.alarm)opAlarm(OP.alarm);
}
function opGauges(P){const el=$('#ogauges');if(!el)return;const o=P.compute(state[P.id]).o;
  el.innerHTML=OPS[P.id].live(OP.f,state[P.id],o).map(([k,v])=>`<div><dt>${k}</dt><dd style="font-size:15px">${v}</dd></div>`).join('');
  const cy=OPS[P.id].cycle(state[P.id],o);const pr=OP.f.prog||0;
  $('#obar').style.width=(pr*100).toFixed(1)+'%';
  $('#oclock').textContent=OP.phase==='setup'?'':`Machine time ${cy.min*pr<1?(cy.min*pr*60).toFixed(1)+' s':(cy.min*pr).toFixed(2)+' min'} · shown ${(cy.min*60/(OP.dur/1000)).toFixed(0)}× faster`;}
function opMeas(P){const el=$('#omeas');if(!el)return;const M=OP.meas;
  if(!M){el.innerHTML=`<h3>Measurement</h3><p class="muted">Complete a cycle to take readings.</p>`;return;}
  el.innerHTML=`<h3>Measurement</h3><table class="cmp"><tbody>${M.readings.map(([k,v])=>`<tr><td>${k}</td><td class="n">${v}</td></tr>`).join('')}</tbody></table>
   <p class="numq" style="margin:12px 0 8px">${M.ask.q}</p>
   <form class="numrow" id="omform" onsubmit="return false"><label class="sr" for="omans">Your answer in ${M.ask.unit}</label><input id="omans" inputmode="decimal" autocomplete="off" placeholder="Your answer" ${M.solved||M.shown?'disabled':''}><span class="mono">${M.ask.unit}</span>
   <button class="btn" type="submit" ${M.solved||M.shown?'disabled':''}>Check</button><button class="btn ghost" type="button" id="omshow">${M.solved||M.shown?'Run again':'Show solution'}</button></form>
   <div id="omfb">${M.fb||''}</div>`;
  const log=(student)=>{runlog[P.id].push({settings:M.settings,readings:M.readings,student,ans:M.ask.ans,unit:M.ask.unit,model:M.model,q:M.ask.q,sol:M.ask.sol,t:new Date().toISOString()});saveAll();opLog(P);};
  $('#omform').onsubmit=()=>{const v=parseFloat($('#omans').value.replace(/,/g,''));if(!isFinite(v)){$('#omfb').innerHTML='<div class="why">Enter a number.</div>';return false;}
    if(M.ask.ans===0?Math.abs(v)<1e-9:Math.abs(v/M.ask.ans-1)<=0.02){M.solved=true;M.fb=`<div class="why"><b class="ok">Correct.</b> ${M.ask.sol}<br>Simulator model value: ${fmt(M.model)} ${M.ask.unit}. The difference is measurement scatter.</div>`;log(v);opUI(P);}
    else $('#omfb').innerHTML=`<div class="why"><b class="bad">Not yet.</b> Your answer is ${((v/M.ask.ans-1)*100).toFixed(0)} % ${v>M.ask.ans?'high':'low'}. Check units.</div>`;return false;};
  $('#omshow').onclick=()=>{if(M.solved||M.shown){OP.phase='setup';OP.f.prog=0;OP.meas=null;opAlarm('');opUI(P);return;}
    M.shown=true;M.fb=`<div class="why"><b>Solution.</b> ${M.ask.sol}</div>`;log(null);opUI(P);};}
function opLog(P){const el=$('#olog');if(!el)return;const L=runlog[P.id];
  el.innerHTML=L.length?`<table><thead><tr><th>Run</th><th>Settings</th><th>Readings</th><th>Your answer</th><th>Correct</th><th>Model</th></tr></thead><tbody>${L.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.settings)}</td><td style="white-space:normal;min-width:220px">${r.readings.map(x=>esc(x.join(': '))).join('<br>')}</td><td>${r.student==null?'shown':fmt(r.student)}</td><td>${fmt(r.ans)} ${r.unit}</td><td>${fmt(r.model)}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">Each completed cycle adds a row here and to your lab report.</div>';}
function opTick(P,now){if(!OP||OP.pid!==P.id)return;const dt=Math.min(0.05,(now-(OP.last||now))/1000);OP.last=now;let ch=false;
  for(const id in OP.ramps){const r=OP.ramps[id];const k=Math.min(1,(now-r.t0)/r.dur);OP.f.x[id+'R']=k;if(k>=1){delete OP.ramps[id];delete OP.f.x[id+'R'];setF(OP.f,id,1);ch=true;}}
  opDerive(P);
  if(OP.phase==='run'){OP.tA+=dt;OP.f.prog=Math.min(1,(now-OP.t0)/OP.dur);if(OP.f.prog>=1)opFinish(P);}
  if(ch)opUI(P);else if(now-(OP.gT||0)>120){OP.gT=now;opGauges(P);}
  drawOp(P,now);}
function drawOp(P,now){const cv=$('#ocv');if(!cv)return;const c=cv.getContext('2d');const s=cv.width/640;
  c.setTransform(1,0,0,1,0,0);const C=getC(now);c.fillStyle=C.panel;c.fillRect(0,0,cv.width,cv.height);c.setTransform(s,0,0,cv.height/400,0,0);
  const o=P.compute(state[P.id]).o;F=OP.f;try{DRAW[P.id](c,C,OP.tA,state[P.id],o);}catch(e){console.error(e);}F=null;
  // highlight drop zone for next part
  const O=OPS[P.id];const nxt=opItems(O).find(i=>!has(OP.f,i.id));const showZone=OP.drag?O.parts.find(x=>x.id===OP.drag.part):(nxt&&nxt.kind==='part'?nxt:null);
  if(showZone&&OP.phase!=='run'){const z=showZone.zone;const a=0.5+0.5*Math.sin(now/250);c.save();c.setLineDash([6,5]);c.lineDashOffset=-now/40;c.strokeStyle=C.accent;c.lineWidth=2;c.globalAlpha=0.5+0.5*a;c.strokeRect(z[0],z[1],z[2],z[3]);c.globalAlpha=0.08;c.fillStyle=C.accent;c.fillRect(z[0],z[1],z[2],z[3]);c.restore();
    T(c,C,(OP.drag?'Drop ':'Place ')+showZone.label.replace(/^([A-Z])(?![A-Z0-9])/,m=>m.toLowerCase())+' here',z[0]+z[2]/2,Math.max(12,z[1]-10),{a:'center',c:C.accent,w:600});}
}
