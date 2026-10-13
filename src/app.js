// ---------- app ----------
const VERSION='4.2', VDATE='12 Oct 2026';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const byId=Object.fromEntries(PROCESSES.map(p=>[p.id,p]));
const state={}, records={}, tabOf={}, sweepSel={}, held={}, mine={}, tests={}, numS={};
let report={name:'',usn:'',batch:'',inst:'',date:(d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10))(new Date()),concl:{}};
let current=null;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const store={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const defaults=id=>Object.fromEntries(byId[id].params.map(q=>[q.id,q.val]));
function runP(id,over){return byId[id].compute({...defaults(id),...over}).o;}

PROCESSES.forEach(P=>{state[P.id]=defaults(P.id);records[P.id]=[];tabOf[P.id]='th';sweepSel[P.id]={...P.sweep};held[P.id]=[];mine[P.id]={x:P.sweep.x,y:P.sweep.y,txt:''};tests[P.id]={pre:{},post:{}};});
(function restore(){const s=store.get('ntm-lab-v2')||store.get('ntm-lab-v1');if(!s)return;
  for(const id in s.state||{}) if(state[id]) for(const k in s.state[id]) if(k in state[id]) state[id][k]=s.state[id][k];
  for(const id in s.records||{}) if(records[id]&&Array.isArray(s.records[id])) records[id]=s.records[id];
  for(const id in s.mine||{}) if(mine[id]) Object.assign(mine[id],s.mine[id]);
  for(const id in s.tests||{}) if(tests[id]) tests[id]=s.tests[id];
  if(s.report) report={...report,...s.report,concl:{...(s.report.concl||{})}};})();
const save=()=>saveAll();

function fmt(x){if(x==null||!isFinite(x))return '—';const a=Math.abs(x);
  if(a>=10000)return Math.round(x).toLocaleString('en-IN');if(a>=100)return x.toFixed(0);if(a>=10)return x.toFixed(1);if(a>=1)return x.toFixed(2);if(a===0)return '0';
  return x.toPrecision(3);}
const catCol=c=>`var(${CATS[c]?.col||'--muted'})`;
const tok=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const mape=(pairs)=>pairs.length?pairs.reduce((a,[m,p])=>a+Math.abs(m/p-1),0)/pairs.length*100:NaN;
const chip=(st)=>{const [t,c]=STATUS[st]||STATUS.none;return `<span class="chip" style="--cc:var(${c})">${t}</span>`;};

// ---------- rail ----------
function buildRail(){
  const r=$('#rail');let h=`<div class="grp"><button class="home" data-go="home">Overview</button><button class="home" data-go="compare">Compare processes</button><button class="home" data-go="about">About &amp; validation</button></div>`;
  for(const c of Object.keys(CATS)){
    h+=`<div><h4><i style="background:${catCol(c)}"></i>${CATS[c].name}</h4><div class="grp">`;
    PROCESSES.filter(p=>p.cat===c).forEach(p=>{h+=`<button data-go="${p.id}"><b>${p.abbr}</b><span>${p.name.replace(' (Die-sinking)','')}</span></button>`;});
    h+=`</div></div>`;}
  r.innerHTML=h;
  r.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)location.hash=b.dataset.go;});
}
function markRail(id){document.querySelectorAll('#rail [data-go]').forEach(b=>b.setAttribute('aria-current',b.dataset.go===id?'true':'false'));
  document.querySelectorAll('.nav a').forEach(a=>{const h=a.getAttribute('href').slice(1);const on=h===id||(h==='lab'&&byId[id]);a.toggleAttribute('aria-current',!!on);if(on)a.setAttribute('aria-current','page');});}

// ---------- overview ----------
function renderHome(){
  current=null;
  const cols=Object.keys(CATS).map(c=>`<div class="cls-col" style="--c:${catCol(c)}"><header><h3>${CATS[c].name}</h3><span>${CATS[c].sub}</span></header>
    ${PROCESSES.filter(p=>p.cat===c).map(p=>`<button class="pcard" data-go="${p.id}" style="--c:${catCol(c)}"><b>${p.abbr}</b><strong>${p.name}</strong><small>${p.blurb}</small><span class="pc-st">${chip(VALID[p.id]?.status)}</span></button>`).join('')}</div>`).join('');
  const nq=PROCESSES.reduce((a,p)=>a+p.quiz.length+(PRE[p.id]||[]).length,0);
  $('#main').innerHTML=`
  <section class="hero">
    <div><div class="eyebrow">Virtual laboratory · Manufacturing processes</div>
      <h1>Non-traditional <em>machining</em> lab</h1>
      <p>${PROCESSES.length} processes: conventional NTM, hybrid and nano-finishing. Each has a pre-test, a machine you set up and operate step by step, an animated schematic, a simulator built on the governing physics, an observation table, a parametric plot, a validation report against published data, randomised numerical problems, a post-test and a printable lab record.</p></div>
    <dl class="spec">
      <dt>Processes</dt><dd><b>${PROCESSES.length} simulated</b> + ${OTHERS.length} described</dd>
      <dt>Validated</dt><dd><b>${PROCESSES.filter(p=>['validated','partial','inputs','trend'].includes(VALID[p.id]?.status)).length} of ${PROCESSES.length}</b> against published data</dd>
      <dt>Self-check</dt><dd><b>${nq} test questions</b> + ${Object.keys(NUM).length} numerical generators</dd>
      <dt>Record</dt><dd><b>Observation table · CSV · printable report</b></dd>
      <dt>Version</dt><dd><b>${VERSION}</b> · ${VDATE}</dd>
    </dl>
  </section>
  <section class="sec"><h2>Processes by energy source</h2><p class="lede">NTM processes are classified by the form of energy used to remove material. The tool need not be harder than the work, which is why these processes handle hardened steels, superalloys, ceramics and composites. The tag on each card shows how far its simulator has been checked against real data.</p>
    <div class="cls">${cols}</div></section>
  <section class="sec"><h2>How to run an experiment</h2>
    <ol class="proc"><li><b>Pre-test:</b> check the prerequisite ideas.</li>
    <li><b>Operate:</b> drag the workpiece and tool into place, switch on pumps, gas, vacuum and power in the right order (interlocks will stop you if you skip a step), run the cycle, then take instrument readings and calculate the result.</li>
    <li><b>Experiment:</b> change one parameter at a time, press <b>Record observation</b> after each setting, and use <b>Hold curve</b> to compare families of curves on the plot.</li>
    <li><b>Theory</b> and <b>Validation:</b> see the governing equations, the exact simulator model, and how far its predictions are from published data.</li>
    <li><b>Numericals</b> and <b>Post-test:</b> solve randomised problems with worked solutions, then take the post-test.</li>
    <li><b>Report:</b> enter your name and conclusions, then print or save as PDF for your lab record.</li></ol></section>
  <section class="sec"><h2>Other non-traditional and hybrid processes</h2><p class="lede">Described for reference; not simulated in this lab.</p>
    <div class="others">${OTHERS.map(o=>`<div class="other"><b style="color:${catCol(o.cat)}">${o.abbr}</b><h3>${o.name}</h3><p>${o.t}</p></div>`).join('')}</div></section>`;
  $('#main').querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>location.hash=b.dataset.go));
}

// ---------- compare ----------
function renderCompare(){
  current=null;
  const live=PROCESSES.map(P=>{const r=P.compute(state[P.id]);const o=P.outputs.find(x=>x.pri);return {P,o,v:r.o[o.k]};});
  $('#main').innerHTML=`
  <section><div class="eyebrow">Process selection</div><h1 style="font-size:clamp(34px,4.5vw,52px)">Compare processes</h1>
  <p class="foot" style="font-size:16px;color:var(--muted)">Classic comparison widely reproduced from Pandey &amp; Shan, <i>Modern Machining Processes</i>. Values are indicative orders of magnitude for each process.</p></section>
  <section class="sec"><div class="tablewrap" style="max-height:none"><table class="cmp"><thead><tr><th>Process</th><th class="n">MRR mm³/min</th><th class="n">Tolerance µm</th><th class="n">Ra µm</th><th class="n">Surface damage µm</th><th class="n">Power W</th></tr></thead>
  <tbody>${CLASSIC.map(r=>`<tr><td><span class="tag" style="background:${r[1]==='none'?'var(--muted)':catCol(r[1])}"></span>${r[0]}</td>${r.slice(2).map(v=>`<td class="n">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
  <p class="foot">The LBM row reflects low-power pulsed lasers of that era. A modern 2 kW fiber laser removes several thousand mm³/min in 3 mm steel; try it in the LBM simulator. WJM, AWJM and WEDM post-date the table.</p></section>
  <section class="sec"><h2>Your current simulator settings</h2><p class="lede">Primary output of each simulator at the settings you last used, with its validation status.</p>
  <div class="tablewrap" style="max-height:none"><table class="cmp"><thead><tr><th>Process</th><th>Mechanism</th><th>Validation</th><th class="n">Primary output</th><th class="n">Value</th></tr></thead><tbody>
  ${live.map(({P,o,v})=>`<tr><td><span class="tag" style="background:${catCol(P.cat)}"></span><a href="#${P.id}">${P.abbr}</a></td><td>${P.facts.mech}</td><td>${chip(VALID[P.id]?.status)}</td><td class="n">${o.label}</td><td class="n">${fmt(v)} ${o.unit}</td></tr>`).join('')}
  </tbody></table></div></section>
  <section class="sec"><h2>Quick selection guide</h2><div class="tablewrap" style="max-height:none"><table class="cmp"><thead><tr><th>If the work is…</th><th>Consider</th><th>Avoid</th></tr></thead><tbody>
  <tr><td>Hard, brittle, non-conductive (glass, ceramic)</td><td>USM, AJM, AWJM, LBM (CO₂ for glass scribing)</td><td>EDM, ECM, PAM</td></tr>
  <tr><td>Hardened conductive steel, complex 3D cavity</td><td>EDM die-sinking, ECM</td><td>WJM</td></tr>
  <tr><td>Through-profile in hardened plate, tight tolerance</td><td>WEDM</td><td>PAM</td></tr>
  <tr><td>Thick steel plate, fast and cheap</td><td>PAM, oxy-fuel, AWJM</td><td>EBM, CHM</td></tr>
  <tr><td>Heat-sensitive (composites, Ti aerospace parts)</td><td>AWJM, ECM, CHM</td><td>PAM</td></tr>
  <tr><td>Many tiny holes in thin sheet</td><td>EBM, LBM (pulsed)</td><td>USM</td></tr>
  <tr><td>Large thin skins, shallow pockets</td><td>CHM</td><td>EDM</td></tr>
  <tr><td>Soft materials: foam, rubber, food</td><td>WJM</td><td>EDM, ECM</td></tr>
  <tr><td>Carbide tools, burr-free edges</td><td>ECG</td><td>Conventional grinding (heat damage)</td></tr>
  <tr><td>Micro-holes and channels in glass</td><td>ECDM, AJM, USM</td><td>EDM, ECM</td></tr>
  <tr><td>Holes in hard ceramics with little chipping</td><td>RUM</td><td>Conventional drilling</td></tr>
  <tr><td>Turning Inconel, titanium or Si₃N₄</td><td>LAM</td><td>Conventional turning (tool wear)</td></tr>
  <tr><td>Internal passages, deburring</td><td>AFM</td><td>MRF</td></tr>
  <tr><td>Tube interiors, shafts to nanometre finish</td><td>MAF</td><td>AFM (for simple bores)</td></tr>
  <tr><td>Precision optics: form and finish</td><td>MRF, IBM</td><td>Conventional lapping alone</td></tr>
  <tr><td>Wafer planarisation</td><td>CMP</td><td>MRF</td></tr>
  </tbody></table></div></section>`;
}

// ---------- about ----------
function valSummary(id){const V=VALID[id];if(!V)return '—';
  if(V.sets){const pr=[];V.sets.filter(s=>s.role==='val').forEach(s=>s.pts.forEach(([x,y])=>pr.push([runP(id,{...s.fix,[s.x]:x})[s.y],y])));return pr.length?`${mape(pr).toFixed(0)} % mean error on ${pr.length} held-out points`:'—';}
  if(V.checks){const n=V.checks.filter(c=>{const m=c.model();return m>=c.lo*0.97&&m<=c.hi*1.03;}).length;return `${n} of ${V.checks.length} checks within published range`;}
  return '—';}
function renderAbout(){
  current=null;
  $('#main').innerHTML=`
  <section><div class="eyebrow">About this lab</div><h1 style="font-size:clamp(34px,4.5vw,52px)">About &amp; validation</h1>
  <div class="prose" style="margin-top:12px"><p>NTM Virtual Lab is an open, browser-based laboratory for non-traditional machining, built for undergraduate courses in manufacturing and advanced machining processes. It runs entirely in the browser: no login, no installation, and nothing is sent to a server. Readings, test answers and report details are stored only in the student's own browser.</p>
  <p><b>Developed by</b> Dr. Vignesh Nayak Ullal, Department of Mechanical Engineering, Mangalore Institute of Technology &amp; Engineering (MITE), Moodbidri, Karnataka.</p></div></section>
  <section class="sec"><h2>How far to trust each simulator</h2><p class="lede">Every model is stated in full on its Theory tab. Where public data exist, the Validation tab compares predictions with them, keeping calibration data separate from the data used for testing.</p>
  <div class="tablewrap" style="max-height:none"><table class="cmp"><thead><tr><th>Process</th><th>Status</th><th>Result</th><th>What it is based on</th></tr></thead><tbody>
  ${PROCESSES.map(P=>`<tr><td><a href="#${P.id}">${P.abbr}</a></td><td>${chip(VALID[P.id]?.status)}</td><td>${valSummary(P.id)}</td><td>${esc(VALID[P.id]?.summary||'')}</td></tr>`).join('')}
  </tbody></table></div>
  <p class="foot">Simulator outputs are model estimates for learning trends and orders of magnitude. They are not machine data sheets; use the manufacturer's technology tables for production settings.</p></section>
  <section class="sec"><h2>How to cite</h2><div class="eq"><div class="f" style="white-space:normal;font-size:13.5px" id="cite">Ullal, V. N. (2026). NTM Virtual Lab: an open virtual laboratory for non-traditional machining processes (Version ${VERSION}). Department of Mechanical Engineering, MITE Moodbidri. https://nayakvignesh113-bot.github.io/NTM-Virtual-Lab/</div></div>
  <button class="iconbtn" id="copycite" type="button">Copy citation</button> <span class="foot" id="citemsg" aria-live="polite"></span></section>
  <section class="sec"><h2>Version history</h2><ul class="ticks">
  <li><b>4.2</b> (13 Oct 2026): Students can submit report summaries (scores, conclusions, discussion answers, Report ID) to the faculty's Google Sheet with a class code. Source code released under CC BY-NC-SA 4.0 with citation metadata.</li>
  <li><b>4.1</b> (13 Oct 2026): Tabs reordered to the Virtual Labs sequence: Theory, Pre-test, Operate, Experiment, Numericals, Post-test, Validation, Report. Processes open on Theory. Validation tab explains what validation means.</li>
  <li><b>4.0</b> (${VDATE}): Alternative removal-rate models with a model selector and a compare-all-models overlay (AJM, CHM, ECM, EDM, LBM, EBM, PAM, CMP). Safety briefing with acknowledgement before operating each machine. Tool and consumable libraries. Comprehensive watermarked lab report with report ID, uncertainty budget, error sources, discussion questions, normalised learning gain and signatures; downloadable as HTML.</li>
  <li><b>3.1</b> (${VDATE}): Nomenclature tables for the governing equations of every process (Theory tab and lab report). Jet divergence half-angle α made a parameter in AJM. Laser beam quality, citation and rounding corrections.</li>
  <li><b>3.0</b> (${VDATE}): Added hybrid processes (ECG, ECDM, RUM, LAM) and nano-finishing processes (AFM, MAF, MRF, CMP, IBM), each with simulator, Operate tab, theory, tests and numericals.</li>
  <li><b>2.1</b> (${VDATE}): Operate tab: set up each machine by dragging parts into place, switch on pumps, gas, vacuum and power with safety interlocks, run the cycle, take instrument readings and calculate results. Runs are logged and included in the lab report.</li>
  <li><b>2.0</b> (${VDATE}): Validation tab with published data (Hypertherm plasma charts, fiber-laser charts, Chemcut etch data, ECM current-efficiency measurements, WARDJET and FedJet waterjet data). Plasma and laser models refitted with thickness-dependent losses; copper etching activation energy corrected from 45 to 18 kJ/mol; ECM now uses measured efficiencies with NaNO₃ passivation. Added pre-tests, randomised numericals, held curves, your-own-data validation and printable lab reports.</li>
  <li><b>1.0</b> (11 Oct 2026): Eleven simulators with schematics, theory, observation table, parametric plot and quiz.</li></ul></section>
  <section class="sec"><h2>Data sources</h2><ul class="ticks">${Object.values(SRC).map(s=>`<li>${s.u?`<a href="${s.u}" target="_blank" rel="noopener">${esc(s.t)}</a>`:esc(s.t)}</li>`).join('')}</ul></section>`;
  $('#copycite').onclick=()=>{const t=$('#cite').textContent;const ok=()=>$('#citemsg').textContent='Copied.';
    try{navigator.clipboard.writeText(t).then(ok,()=>{const r=document.createRange();r.selectNodeContents($('#cite'));const s=getSelection();s.removeAllRanges();s.addRange(r);$('#citemsg').textContent='Selected. Press Ctrl+C to copy.';});}catch(e){}};
}

// ---------- process page ----------
const TABS=[['th','Theory'],['pre','Pre-test'],['op','Operate'],['exp','Experiment'],['num','Numericals'],['post','Post-test'],['val','Validation'],['rep','Report']];
function renderProcess(P){
  current=P;
  const c=catCol(P.cat);
  $('#main').innerHTML=`
  <article style="--c:${c}">
    <header class="phead"><div class="abbr">${P.abbr}</div><div class="eyebrow" style="color:${c}">${CATS[P.cat].name} · ${chip(VALID[P.id]?.status)}</div><div><h1>${P.name}</h1><p>${P.blurb}</p></div></header>
    <dl class="facts"><div><dt>Energy</dt><dd>${P.facts.energy}</dd></div><div><dt>Mechanism</dt><dd>${P.facts.mech}</dd></div><div><dt>Medium</dt><dd>${P.facts.medium}</dd></div><div><dt>Tool</dt><dd>${P.facts.tool}</dd></div></dl>
    <div class="tabs" role="tablist">${TABS.map(([k,l],i)=>`<button role="tab" data-tab="${k}"><span class="tn">${i+1}</span>${l}</button>`).join('')}</div>
    <div id="pane" class="pane"></div>
  </article>`;
  $('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;tabOf[P.id]=b.dataset.tab;renderPane(P);});
  renderPane(P);
}
function renderPane(P){
  document.querySelectorAll('.tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===tabOf[P.id]));
  const tab=tabOf[P.id];
  ({pre:()=>renderTest(P,'pre'),op:()=>renderOp(P),exp:()=>renderExp(P),th:()=>renderTheory(P),val:()=>renderVal(P),num:()=>renderNum(P),post:()=>renderTest(P,'post'),rep:()=>renderReport(P)})[tab]();
}

// ---------- experiment ----------
function ctrlHTML(P){
  const s=state[P.id];
  return P.params.map(q=>{
    if(q.type==='select') return `<div class="ctrl"><label for="in-${P.id}-${q.id}">${q.label}</label><select id="in-${P.id}-${q.id}" data-k="${q.id}">${q.options.map(([v,l])=>`<option value="${v}"${s[q.id]===v?' selected':''}>${l}</option>`).join('')}</select></div>`;
    return `<div class="ctrl"><div class="row"><label for="in-${P.id}-${q.id}">${q.label}</label><output id="out-${P.id}-${q.id}">${s[q.id]} <small>${q.unit}</small></output></div>
      <input type="range" id="in-${P.id}-${q.id}" data-k="${q.id}" min="${q.min}" max="${q.max}" step="${q.step}" value="${s[q.id]}"><div class="rng"><span>${q.min}</span><span>${q.max}</span></div></div>`;
  }).join('');
}
function renderExp(P){
  const numeric=P.params.filter(q=>q.type!=='select');
  const ss=sweepSel[P.id];
  $('#pane').innerHTML=`
  <p class="aim"><b>Aim.</b> ${P.aim}</p>
  <div class="bench">
    <div class="scope">
      <div class="scope-bar"><span>SCHEMATIC · LIVE</span><button class="iconbtn" id="pause" type="button">${reduce?'Animate':'Pause'}</button></div>
      <canvas id="cv" role="img" aria-label="Animated schematic of ${P.name}"></canvas>
      <dl class="read" id="read"></dl>
      <div class="notes" id="notes"></div>
    </div>
    <form class="panel" id="ctrls" onsubmit="return false"><h3>Process parameters</h3>${ctrlHTML(P)}
      <div class="btnrow"><button class="btn" type="button" id="rec">Record observation</button><button class="btn ghost" type="button" id="reset">Reset defaults</button></div>
    </form>
  </div>
  <div class="lower">
    <div class="card"><h3>Parametric plot</h3>
      <div class="sel"><label for="sy">Plot</label><select id="sy">${P.outputs.map(o=>`<option value="${o.k}"${o.k===ss.y?' selected':''}>${o.label}</option>`).join('')}</select>
      <label for="sx">against</label><select id="sx">${numeric.map(q=>`<option value="${q.id}"${q.id===ss.x?' selected':''}>${q.label}</option>`).join('')}</select></div>
      <canvas class="chart" id="chart" role="img" aria-label="Parametric plot"></canvas>
      <div class="btnrow" style="margin-top:8px"><button class="iconbtn" type="button" id="hold">Hold curve</button><button class="iconbtn" type="button" id="clrhold">Clear held curves</button></div>
      <div class="legend" id="legend"></div>
      <p class="foot">Hold a curve, change another parameter (for example the material), and the new curve is drawn over it for comparison.</p></div>
    <div class="card"><h3>Observation table</h3>
      <div class="sel" style="justify-content:space-between"><span id="nrec"></span><span class="btnrow"><button class="iconbtn" type="button" id="csv">Copy as CSV</button><button class="iconbtn" type="button" id="clr">Clear</button></span></div>
      <div class="tablewrap" id="tbl"></div><p class="foot" id="copymsg" aria-live="polite"></p>
      <h3 style="margin-top:14px">Procedure</h3><ol class="proc">${P.procedure.map(s=>`<li>${s}</li>`).join('')}</ol></div>
  </div>`;
  $('#ctrls').addEventListener('input',e=>{const k=e.target.dataset.k;if(!k)return;const q=P.params.find(x=>x.id===k);
    state[P.id][k]=q.type==='select'?e.target.value:parseFloat(e.target.value);
    if(q.type!=='select') $(`#out-${P.id}-${k}`).innerHTML=`${state[P.id][k]} <small>${q.unit}</small>`;
    update(P);save();});
  $('#reset').onclick=()=>{state[P.id]=defaults(P.id);save();renderExp(P);};
  $('#rec').onclick=()=>{const r=P.compute(state[P.id]);records[P.id].push({p:{...state[P.id]},o:{...r.o}});save();renderTable(P);};
  $('#clr').onclick=()=>{records[P.id]=[];save();renderTable(P);};
  $('#csv').onclick=()=>copyCSV(P);
  $('#sx').onchange=e=>{ss.x=e.target.value;held[P.id]=[];drawChart(P);};
  $('#sy').onchange=e=>{ss.y=e.target.value;held[P.id]=[];drawChart(P);};
  $('#hold').onclick=()=>{const c=curve(P,state[P.id]);if(held[P.id].length>=5)held[P.id].shift();held[P.id].push({...c,label:diffLabel(P)});drawChart(P);};
  $('#clrhold').onclick=()=>{held[P.id]=[];drawChart(P);};
  const pb=$('#pause');paused=reduce;pb.onclick=()=>{paused=!paused;pb.textContent=paused?'Animate':'Pause';};
  sizeCanvas($('#cv'));sizeCanvas($('#chart'));
  update(P);renderTable(P);
}
function diffLabel(P){const s=state[P.id],d=defaults(P.id),x=sweepSel[P.id].x;
  const parts=P.params.filter(q=>q.id!==x&&s[q.id]!==d[q.id]).map(q=>q.type==='select'?(q.options.find(o=>o[0]===s[q.id])||['',''])[1].split(' (')[0]:`${q.label.split(' ')[0]} ${s[q.id]} ${q.unit}`);
  return parts.length?parts.join(', '):'Default settings';}
let paused=reduce, lastR=null;
function update(P){
  const r=P.compute(state[P.id]);lastR=r;
  $('#read').innerHTML=P.outputs.map(o=>`<div class="${o.pri?'pri':''}"><dt>${o.label}</dt><dd>${fmt(r.o[o.k])}<small>${o.unit}</small></dd></div>`).join('');
  $('#notes').innerHTML=r.notes.map(n=>`<div class="note">${n}</div>`).join('');
  drawChart(P);drawScope(performance.now());
}
function renderTable(P){
  const rows=records[P.id], el=$('#tbl');
  $('#nrec').textContent=rows.length?`${rows.length} reading${rows.length>1?'s':''}`:'No readings yet';
  el.innerHTML=rows.length?tableHTML(P):`<div class="empty">Set the parameters, then press <b>Record observation</b>. Each press adds one row here.</div>`;
}
function tableHTML(P){const rows=records[P.id], ps=P.params, os=P.outputs;
  return `<table><thead><tr><th>#</th>${ps.map(q=>`<th>${q.label}${q.unit?' ('+q.unit+')':''}</th>`).join('')}${os.map(o=>`<th>${o.label}${o.unit?' ('+o.unit+')':''}</th>`).join('')}</tr></thead><tbody>
  ${rows.map((r,i)=>`<tr><td>${i+1}</td>${ps.map(q=>`<td>${q.type==='select'?(q.options.find(x=>x[0]===r.p[q.id])||[,''])[1].split(' (')[0]:r.p[q.id]}</td>`).join('')}${os.map(o=>`<td>${fmt(r.o[o.k])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
function copyCSV(P){
  const rows=records[P.id];if(!rows.length){$('#copymsg').textContent='Nothing to copy yet. Record at least one observation.';return;}
  const q=s=>`"${String(s).replace(/"/g,'""')}"`;
  const head=['#',...P.params.map(x=>x.label+(x.unit?' ('+x.unit+')':'')),...P.outputs.map(o=>o.label+(o.unit?' ('+o.unit+')':''))].map(q).join(',');
  const body=rows.map((r,i)=>[i+1,...P.params.map(x=>r.p[x.id]),...P.outputs.map(o=>{const v=r.o[o.k];return isFinite(v)?+v.toPrecision(5):'';})].map(q).join(',')).join('\n');
  const txt=head+'\n'+body;
  const done=()=>{$('#copymsg').textContent=`Copied ${rows.length} rows. Paste into Excel or Google Sheets.`;};
  const fallback=()=>{$('#tbl').innerHTML=`<textarea readonly style="width:100%;height:200px;font-family:var(--f-mono);font-size:12px;background:var(--bg);border:0;padding:8px">${esc(txt)}</textarea>`;const ta=$('#tbl textarea');ta.focus();ta.select();$('#copymsg').textContent='Clipboard blocked here. The CSV is selected above; press Ctrl+C (⌘C) to copy.';};
  try{navigator.clipboard.writeText(txt).then(done,fallback);}catch(e){fallback();}
}

// ---------- canvas ----------
function sizeCanvas(cv){if(!cv)return;const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||600;const h=cv.clientHeight||w*0.625;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv._dpr=dpr;}
window.addEventListener('resize',()=>{if(current&&tabOf[current.id]==='op')sizeCanvas($('#ocv'));if(current&&tabOf[current.id]==='exp'){sizeCanvas($('#cv'));sizeCanvas($('#chart'));drawChart(current);drawScope(performance.now());}
  if(current&&tabOf[current.id]==='val'){renderVal(current);}});
let Ccache=null, Ctime=0;
function getC(now){if(!Ccache||now-Ctime>1000){Ccache=colors();Ctime=now;}return Ccache;}
let tAnim=0, lastNow=performance.now();
function drawScope(now){
  const cv=$('#cv');if(!cv||!current||!lastR)return;
  const c=cv.getContext('2d');const s=cv.width/640;
  c.setTransform(1,0,0,1,0,0);const C=getC(now);c.fillStyle=C.panel;c.fillRect(0,0,cv.width,cv.height);
  c.setTransform(s,0,0,cv.height/400,0,0);
  try{DRAW[current.id](c,C,tAnim,state[current.id],lastR.o);}catch(e){console.error(e);}
}
function loop(now){
  const dt=Math.min(0.05,(now-lastNow)/1000);lastNow=now;
  if(!paused) tAnim+=dt;
  if(current&&tabOf[current.id]==='exp'&&!paused&&!document.hidden) drawScope(now);
  if(current&&tabOf[current.id]==='op'&&!document.hidden) opTick(current,now);
  requestAnimationFrame(loop);
}

// ---------- generic XY plot ----------
const tf=v=>{const a=Math.abs(v);return a>=10000?Math.round(v).toLocaleString('en-IN'):String(+v.toPrecision(6));};
function nice(lo,hi,n=5){const span=hi-lo||Math.abs(hi)||1;const step0=span/n;const mag=Math.pow(10,Math.floor(Math.log10(step0)));const r=step0/mag;const step=(r<1.5?1:r<3?2:r<7?5:10)*mag;
  const a=Math.floor(lo/step)*step,b=Math.ceil(hi/step)*step;const t=[];for(let v=a;v<=b+step*0.5;v+=step)t.push(+v.toPrecision(12));return {a,b,t};}
const PAL=['--mech','--therm','--chem','--spark','--muted'];
function plotXY(cv,o){
  if(!cv)return;if(!cv._dpr)sizeCanvas(cv);const c=cv.getContext('2d');const C=getC(performance.now());
  const W=cv.width/cv._dpr,H=cv.height/cv._dpr;c.setTransform(cv._dpr,0,0,cv._dpr,0,0);c.clearRect(0,0,W,H);
  const allY=[];o.series.forEach(s=>s.ys.forEach(y=>isFinite(y)&&allY.push(y)));(o.points||[]).forEach(p=>isFinite(p.y)&&allY.push(p.y));
  if(!allY.length)return;
  let ylo=Math.min(0,...allY),yhi=Math.max(...allY)*1.04;if(yhi===ylo)yhi=ylo+1;
  const Y=nice(ylo,yhi),X=nice(o.xmin,o.xmax,6);
  const L=60,R=14,Tp=14,B=40;const px=x=>L+(x-X.a)/(X.b-X.a)*(W-L-R);const py=y=>H-B-(y-Y.a)/(Y.b-Y.a)*(H-Tp-B);
  c.font='11px "JetBrains Mono", monospace';c.fillStyle=C.muted;c.strokeStyle=C.line;c.lineWidth=1;
  Y.t.forEach(v=>{const y=Math.round(py(v))+.5;c.beginPath();c.moveTo(L,y);c.lineTo(W-R,y);c.stroke();c.textAlign='right';c.textBaseline='middle';c.fillText(tf(v),L-6,y);});
  X.t.forEach(v=>{if(v<X.a-1e-9||v>X.b+1e-9)return;const x=Math.round(px(v))+.5;c.beginPath();c.moveTo(x,H-B);c.lineTo(x,H-B+4);c.stroke();c.textAlign='center';c.textBaseline='top';c.fillText(tf(v),x,H-B+7);});
  c.strokeStyle=C.ink;c.beginPath();c.moveTo(L,H-B+.5);c.lineTo(W-R,H-B+.5);c.stroke();
  c.textAlign='center';c.fillStyle=C.muted;c.fillText(o.xlabel,(L+W-R)/2,H-16);
  c.save();c.translate(12,(Tp+H-B)/2);c.rotate(-Math.PI/2);c.textAlign='center';c.textBaseline='middle';c.fillText(o.ylabel,0,0);c.restore();
  c.save();c.beginPath();c.rect(L,Tp-4,W-L-R,H-B-Tp+4);c.clip();
  o.series.forEach(s=>{const col=s.color;c.beginPath();let st=false;s.xs.forEach((x,i)=>{if(!isFinite(s.ys[i])){st=false;return;}const X1=px(x),Y1=py(s.ys[i]);st?c.lineTo(X1,Y1):c.moveTo(X1,Y1);st=true;});
    if(s.fill){const path=new Path2D();let first=true;s.xs.forEach((x,i)=>{if(!isFinite(s.ys[i]))return;first?path.moveTo(px(x),py(s.ys[i])):path.lineTo(px(x),py(s.ys[i]));first=false;});path.lineTo(px(s.xs[s.xs.length-1]),py(Math.max(Y.a,0)));path.lineTo(px(s.xs[0]),py(Math.max(Y.a,0)));path.closePath();c.globalAlpha=0.10;c.fillStyle=col;c.fill(path);c.globalAlpha=1;}
    c.setLineDash(s.dash||[]);c.strokeStyle=col;c.lineWidth=s.width||2;c.stroke();c.setLineDash([]);});
  (o.points||[]).forEach(p=>{c.fillStyle=p.fill||C.panel;c.strokeStyle=p.color;c.lineWidth=1.8;c.beginPath();
    if(p.shape==='sq'){c.rect(px(p.x)-4,py(p.y)-4,8,8);}else c.arc(px(p.x),py(p.y),p.r||4.5,0,7);c.fill();c.stroke();});
  c.restore();
  if(o.marker&&isFinite(o.marker.y)){const m=o.marker;c.fillStyle=C.panel;c.strokeStyle=m.color;c.lineWidth=2;c.beginPath();c.arc(px(m.x),py(m.y),5,0,7);c.fill();c.stroke();
    c.fillStyle=C.ink;const right=px(m.x)>W*0.7;c.textAlign=right?'right':'left';c.textBaseline='bottom';c.fillText(m.text,px(m.x)+(right?-9:9),py(m.y)-6);}
}
function curve(P,base,xId,yId,lo,hi){const ss=sweepSel[P.id];xId=xId||ss.x;yId=yId||ss.y;const q=P.params.find(x=>x.id===xId);lo=lo??q.min;hi=hi??q.max;
  const b={...base};const xs=[],ys=[];for(let i=0;i<=60;i++){const x=lo+(hi-lo)*i/60;b[xId]=x;const y=P.compute(b).o[yId];xs.push(x);ys.push(isFinite(y)?y:NaN);}return {xs,ys};}
function drawChart(P,cvOverride){
  const cv=cvOverride||$('#chart');if(!cv)return;
  const ss=sweepSel[P.id];const q=P.params.find(x=>x.id===ss.x);const o=P.outputs.find(x=>x.k===ss.y);
  const accent=getComputedStyle(document.querySelector('article')||document.documentElement).getPropertyValue('--c').trim()||tok('--accent');
  const series=held[P.id].map((h,i)=>({xs:h.xs,ys:h.ys,color:tok(PAL[i%PAL.length]),width:1.6,dash:[5,4]}));
  const cur=curve(P,state[P.id]);series.push({...cur,color:accent,fill:held[P.id].length===0,width:2.2});
  const cy=P.compute(state[P.id]).o[o.k];
  plotXY(cv,{xmin:q.min,xmax:q.max,xlabel:`${q.label} (${q.unit})`,ylabel:`${o.label}${o.unit?' ('+o.unit+')':''}`,series,marker:{x:state[P.id][q.id],y:cy,color:accent,text:`${fmt(cy)} ${o.unit}`}});
  const lg=$('#legend');if(lg&&!cvOverride)lg.innerHTML=held[P.id].length?held[P.id].map((h,i)=>`<span><i style="border-color:var(${PAL[i%PAL.length]})"></i>${esc(h.label)}</span>`).join('')+`<span><i style="border-color:${accent};border-top-style:solid"></i>Current: ${esc(diffLabel(P))}</span>`:'';
}

// ---------- theory ----------
function nomHTML(P){const N=NOM[P.id];if(!N)return '';return `<h3>Nomenclature</h3><div class="tablewrap" style="max-height:none"><table class="nom"><thead><tr><th>Symbol</th><th>Meaning</th><th>Unit</th></tr></thead><tbody>${N.map(([s,m,u])=>`<tr><td class="sym">${s}</td><td>${m}</td><td>${u}</td></tr>`).join('')}</tbody></table></div>`;}
function renderTheory(P){
  const T=P.theory;
  $('#pane').innerHTML=`<div class="theory"><div class="prose">
    <h3>Principle</h3>${T.principle.map(p=>`<p>${p}</p>`).join('')}
    <h3>Governing relations</h3>${T.eq.map(e=>`<div class="eq"><div class="f">${e.f}</div><div class="w">${e.w}</div></div>`).join('')}
    ${nomHTML(P)}
    <h3>Effect of parameters</h3><ul class="ticks">${T.effects.map(x=>`<li>${x}</li>`).join('')}</ul>
    <div class="model">${T.model}</div></div>
    <aside class="side"><h4>Applications</h4><ul class="ticks">${T.apps.map(x=>`<li>${x}</li>`).join('')}</ul>
    <h4>Advantages</h4><ul class="ticks">${T.adv.map(x=>`<li>${x}</li>`).join('')}</ul>
    <h4>Limitations</h4><ul class="ticks">${T.lim.map(x=>`<li>${x}</li>`).join('')}</ul></aside></div>`;
}

// ---------- validation ----------
function renderVal(P){
  const V=VALID[P.id]||{status:'none',summary:''};
  const srcRef=k=>{const s=SRC[k];return s?(s.u?`<a href="${s.u}" target="_blank" rel="noopener">${esc(s.t)}</a>`:esc(s.t)):'';};
  const intro=`<p class="aim"><b>What is validation?</b> A simulator is only useful if its numbers resemble a real machine. Here the model's predictions are compared with measured data published by machine makers and researchers (cut charts, etch-rate tables, papers). Some data sets were used to tune the model's constants (<i>calibration</i>); others were kept aside and used only to test it (<i>held-out test</i>). The mean error on the held-out data tells you how far to trust the simulator's numbers; a process marked "not yet validated" shows correct trends but its absolute values are unverified. You can also enter readings from your own lab's machine below.</p>`;
  let h=`<div class="valhead">${chip(V.status)}<p>${esc(V.summary)}</p></div>`;
  if(V.sets){
    const allVal=[];
    h+=`<div class="valgrid">${V.sets.map((s,i)=>{const pairs=s.pts.map(([x,y])=>[runP(P.id,{...s.fix,[s.x]:x})[s.y],y]);if(s.role==='val')allVal.push(...pairs);
      const o=P.outputs.find(z=>z.k===s.y),q=P.params.find(z=>z.id===s.x);
      return `<div class="card vcard"><div class="vtitle"><h3>${esc(s.name)}</h3><span class="chip" style="--cc:var(${s.role==='cal'?'--muted':'--accent'})">${s.role==='cal'?'Calibration':'Held-out test'}</span></div>
      <canvas class="chart" id="vc${i}" role="img" aria-label="Model vs published data: ${esc(s.name)}"></canvas>
      <div class="vstat">Mean error <b>${mape(pairs).toFixed(1)} %</b> · max <b>${(Math.max(...pairs.map(([m,p])=>Math.abs(m/p-1)))*100).toFixed(0)} %</b> · n = ${pairs.length}</div>
      <details><summary>Point-by-point table</summary><div class="tablewrap"><table><thead><tr><th>${q.label} (${q.unit})</th><th>Published (${o.unit})</th><th>Model (${o.unit})</th><th>Error</th></tr></thead><tbody>
      ${s.pts.map(([x,y],j)=>`<tr><td>${x}</td><td>${fmt(y)}</td><td>${fmt(pairs[j][0])}</td><td>${((pairs[j][0]/y-1)*100).toFixed(0)} %</td></tr>`).join('')}</tbody></table></div></details>
      <p class="foot">Source: ${srcRef(s.src)}</p></div>`;}).join('')}</div>`;
    if(allVal.length) h=`<div class="valhead">${chip(V.status)}<p>${esc(V.summary)}</p><p class="big">Held-out mean error: <b>${mape(allVal).toFixed(1)} %</b> over ${allVal.length} points</p></div>`+h.replace(/^<div class="valhead">[\s\S]*?<\/div>/,'');
  }
  if(V.checks){
    h+=`<div class="card"><h3>Checks against published values</h3><div class="tablewrap" style="max-height:none"><table class="cmp"><thead><tr><th>Quantity</th><th class="n">Published</th><th class="n">Model</th><th>Result</th></tr></thead><tbody>
    ${V.checks.map(c=>{const m=c.model();const ok=m>=c.lo*0.97&&m<=c.hi*1.03;const off=m<c.lo?(m/c.lo-1)*100:(m/c.hi-1)*100;
      return `<tr><td>${esc(c.label)}${c.note?`<br><small class="muted">${esc(c.note)}</small>`:''}<br><small class="muted">${srcRef(c.src)}</small></td><td class="n">${esc(c.pub)}</td><td class="n">${fmt(m)} ${esc(c.unit)}</td><td>${ok?'<span class="ok">Within range</span>':`<span class="bad">${off>0?'+':''}${off.toFixed(0)} % outside</span>`}</td></tr>`;}).join('')}
    </tbody></table></div></div>`;
  }
  if(V.bands){const b=V.bands;let inside=0;
    const rows=b.rows.map(([t,lo,hi])=>{const o=runP(P.id,{...b.fix,t});const ok=hi>=o.uq&&lo<=o.u;if(ok)inside++;return `<tr><td>${t}</td><td class="n">${lo}–${hi}</td><td class="n">${fmt(o.uq)}–${fmt(o.u)}</td><td>${ok?'<span class="ok">Inside band</span>':'<span class="bad">Outside</span>'}</td></tr>`;}).join('');
    h+=`<div class="card"><h3>Published speeds vs model quality band</h3><p class="foot" style="margin-top:0">${esc(b.name)}. ${inside} of ${b.rows.length} inside.</p><div class="tablewrap" style="max-height:none"><table class="cmp"><thead><tr><th>Thickness (mm)</th><th class="n">Published (mm/min)</th><th class="n">Model Q5–Q1 (mm/min)</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table></div><p class="foot">Source: ${srcRef(b.src)}</p></div>`;}
  if(V.finding) h+=`<div class="finding"><b>What the data showed.</b> ${esc(V.finding)}</div>`;
  // own data
  const M=mine[P.id];const numeric=P.params.filter(q=>q.type!=='select');
  h+=`<div class="card mydata"><h3>Validate with your own measurements</h3>
    <p class="foot" style="margin-top:0">Run the experiment on your lab's machine. Set every other parameter on the Experiment tab to match your machine, then enter your readings below, one per line as <span class="mono">x, y</span>.</p>
    <div class="sel"><label for="mx">Varied parameter</label><select id="mx">${numeric.map(q=>`<option value="${q.id}"${q.id===M.x?' selected':''}>${q.label} (${q.unit})</option>`).join('')}</select>
    <label for="my">Measured output</label><select id="my">${P.outputs.map(o=>`<option value="${o.k}"${o.k===M.y?' selected':''}>${o.label} (${o.unit})</option>`).join('')}</select></div>
    <div class="mygrid"><textarea id="mtxt" rows="7" spellcheck="false" placeholder="e.g.\n10, 120\n20, 210\n30, 290">${esc(M.txt)}</textarea>
    <div><canvas class="chart" id="mcv" role="img" aria-label="Your measurements vs model"></canvas><div class="vstat" id="mstat"></div></div></div></div>`;
  h+=`<p class="foot">Mean error is the mean of |model ÷ published − 1|. "Calibration" sets were used to fit model constants, so their error shows fit quality, not predictive accuracy. Only "held-out test" sets show predictive accuracy.</p>`;
  $('#pane').innerHTML=intro+h;
  const accent=tok(PAL[0]),dot=tok('--therm');
  (V.sets||[]).forEach((s,i)=>{const cv=$('#vc'+i);sizeCanvas(cv);const q=P.params.find(z=>z.id===s.x),o=P.outputs.find(z=>z.k===s.y);
    const xs=s.pts.map(p=>p[0]);const lo=Math.max(q.min,Math.min(...xs)*0.9),hi=Math.min(q.max,Math.max(...xs)*1.05);
    const cu=curve(P,{...defaults(P.id),...s.fix},s.x,s.y,lo,hi);
    plotXY(cv,{xmin:lo,xmax:hi,xlabel:`${q.label} (${q.unit})`,ylabel:`${o.label} (${o.unit})`,series:[{...cu,color:accent,width:2}],points:s.pts.map(([x,y])=>({x,y,color:dot}))});});
  const drawMine=()=>{const cv=$('#mcv');sizeCanvas(cv);const q=P.params.find(z=>z.id===M.x),o=P.outputs.find(z=>z.k===M.y);
    const pts=M.txt.split(/\n/).map(l=>l.split(/[,\t; ]+/).map(Number)).filter(a=>a.length>=2&&isFinite(a[0])&&isFinite(a[1]));
    const xs=pts.map(p=>p[0]);const lo=pts.length?Math.min(q.min,...xs):q.min,hi=pts.length?Math.max(q.max,...xs):q.max;
    const cu=curve(P,state[P.id],M.x,M.y,lo,hi);
    plotXY(cv,{xmin:lo,xmax:hi,xlabel:`${q.label} (${q.unit})`,ylabel:`${o.label} (${o.unit})`,series:[{...cu,color:accent,width:2}],points:pts.map(([x,y])=>({x,y,color:dot,shape:'sq'}))});
    if(pts.length){const pairs=pts.map(([x,y])=>[P.compute({...state[P.id],[M.x]:x}).o[M.y],y]);$('#mstat').innerHTML=`Your data: mean error <b>${mape(pairs).toFixed(1)} %</b> over ${pts.length} points. Model curve uses your current Experiment settings.`;}
    else $('#mstat').textContent='Enter at least one x, y pair to compare.';};
  $('#mx').onchange=e=>{M.x=e.target.value;save();drawMine();};
  $('#my').onchange=e=>{M.y=e.target.value;save();drawMine();};
  $('#mtxt').oninput=e=>{M.txt=e.target.value;save();drawMine();};
  drawMine();
}

// ---------- tests ----------
function renderTest(P,kind){
  const Q=kind==='pre'?(PRE[P.id]||[]):P.quiz;const qs=tests[P.id][kind];
  const n=Q.length, ans=Object.keys(qs).length, right=Object.entries(qs).filter(([i,v])=>Q[i]&&Q[i].a===v).length;
  $('#pane').innerHTML=`<div class="quiz"><p class="aim">${kind==='pre'?'<b>Pre-test.</b> Check the ideas you need before the experiment. Your score goes into the lab report.':'<b>Post-test.</b> Answer after completing the experiment and numericals. Your score goes into the lab report.'}</p>
  <div class="score"><span>${ans} of ${n} answered · ${right} correct</span>${ans?'<button class="iconbtn" id="qreset" type="button">Start again</button>':''}</div>
  ${Q.map((q,i)=>`<div class="q"><p>${i+1}. ${q.q}</p><div class="opts">${q.o.map((o,j)=>{let cls='';if(i in qs){if(j===q.a)cls='right';else if(j===qs[i])cls='wrong';}return `<button type="button" class="${cls}" data-q="${i}" data-o="${j}" ${i in qs?'aria-disabled="true"':''}>${o}</button>`;}).join('')}</div>
  ${i in qs?`<div class="why"><b>${qs[i]===q.a?'Correct.':'Not quite.'}</b> ${q.why}</div>`:''}</div>`).join('')}
  ${ans===n?`<div class="btnrow"><button class="btn" type="button" id="next">${kind==='pre'?'Go to the experiment':'Go to the report'}</button></div>`:''}</div>`;
  $('#pane').querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const i=+b.dataset.q;if(i in qs)return;qs[i]=+b.dataset.o;save();renderTest(P,kind);});
  const r=$('#qreset');if(r)r.onclick=()=>{tests[P.id][kind]={};save();renderTest(P,kind);};
  const nx=$('#next');if(nx)nx.onclick=()=>{tabOf[P.id]=kind==='pre'?'op':'rep';renderPane(P);window.scrollTo(0,0);};
}
function score(P,kind){const Q=kind==='pre'?(PRE[P.id]||[]):P.quiz;const qs=tests[P.id][kind];const a=Object.keys(qs).length;return {a,n:Q.length,r:Object.entries(qs).filter(([i,v])=>Q[i]&&Q[i].a===v).length};}

// ---------- numericals ----------
function renderNum(P){
  const S=numS[P.id]||(numS[P.id]={cur:NUM[P.id](),done:false,tried:0,solved:0,attempted:0});
  const c=S.cur;
  $('#pane').innerHTML=`<div class="quiz"><p class="aim"><b>Numerical problems.</b> Each problem uses fresh random values. Answers within ±2 % are accepted.</p>
  <div class="score"><span>This session: ${S.solved} solved of ${S.attempted} attempted</span></div>
  <div class="card numcard"><p class="numq">${c.q}</p>
  <form id="nform" class="numrow" onsubmit="return false"><label for="nans" class="sr">Your answer in ${c.unit}</label><input id="nans" inputmode="decimal" autocomplete="off" placeholder="Your answer" ${S.done?'disabled':''}><span class="mono">${c.unit}</span>
  <button class="btn" type="submit" ${S.done?'disabled':''}>Check</button><button class="btn ghost" type="button" id="nshow">${S.done?'New problem':'Show solution'}</button></form>
  <div id="nfb" aria-live="polite">${S.done?S.fb:''}</div></div></div>`;
  const sol=`<div class="why"><b>Solution.</b> ${c.sol}</div>`;
  $('#nform').onsubmit=()=>{const v=parseFloat($('#nans').value.replace(/,/g,''));if(!isFinite(v)){$('#nfb').innerHTML='<div class="why">Enter a number.</div>';return false;}
    S.tried++;const ok=c.ans===0?Math.abs(v)<1e-9:Math.abs(v/c.ans-1)<=0.02;
    if(ok){S.solved++;S.attempted++;S.done=true;S.fb=`<div class="why"><b class="ok">Correct.</b> Exact answer ${fmt(c.ans)} ${c.unit}.</div>`+sol;renderNum(P);}
    else{$('#nfb').innerHTML=`<div class="why"><b class="bad">Not yet.</b> Your answer is ${((v/c.ans-1)*100).toFixed(0)} % ${v>c.ans?'high':'low'}. Check units and try again, or show the solution.</div>`;}
    return false;};
  $('#nshow').onclick=()=>{if(S.done){numS[P.id]={cur:NUM[P.id](),done:false,tried:0,solved:S.solved,attempted:S.attempted};renderNum(P);return;}
    S.attempted++;S.done=true;S.fb=`<div class="why">Answer: <b>${fmt(c.ans)} ${c.unit}</b>.</div>`+sol;renderNum(P);};
}

// ---------- report ----------
function renderReport(P){
  const pre=score(P,'pre'),post=score(P,'post');const rows=records[P.id];
  $('#pane').innerHTML=`<div class="no-print"><p class="aim"><b>Lab report.</b> Fill in your details and conclusions, then use <b>Print / Save as PDF</b>. The report collects your observations, plot and test scores for this experiment.</p>
  <form class="panel repform" id="rform" onsubmit="return false">
    <div class="ctrl"><label for="rn">Student name</label><input id="rn" value="${esc(report.name)}"></div>
    <div class="ctrl"><label for="ru">USN / roll number</label><input id="ru" value="${esc(report.usn)}"></div>
    <div class="ctrl"><label for="rb">Batch / section</label><input id="rb" value="${esc(report.batch)}"></div>
    <div class="ctrl"><label for="ri">Institution</label><input id="ri" value="${esc(report.inst)}" placeholder="e.g. MITE Moodbidri"></div>
    <div class="ctrl"><label for="rd">Date</label><input id="rd" type="date" value="${esc(report.date)}"></div>
    <div class="ctrl wide"><label for="rc">Results and conclusions</label><textarea id="rc" rows="5" placeholder="State the trends you observed, with numbers from your table, and explain them using the theory.">${esc(report.concl[P.id]||'')}</textarea></div>
    <div class="btnrow wide"><button class="btn" type="button" id="rprint">Print / Save as PDF</button><span class="foot" id="rmsg"></span></div>
  </form></div>
  <section class="sheet" id="sheet"></section>`;
  const fill=()=>{
    const img=(()=>{const cv=document.createElement('canvas');cv.style.width='720px';cv.style.height='405px';document.body.appendChild(cv);cv.width=1440;cv.height=810;cv._dpr=2;drawChart(P,cv);const u=cv.toDataURL('image/png');cv.remove();return u;})();
    const ss=sweepSel[P.id],q=P.params.find(x=>x.id===ss.x),o=P.outputs.find(x=>x.k===ss.y);
    $('#sheet').innerHTML=`<header class="sh-head"><div><div class="eyebrow">${esc(report.inst||'NTM Virtual Lab')} · Virtual laboratory record</div><h2>${P.name}</h2></div>
      <dl class="sh-meta"><dt>Name</dt><dd>${esc(report.name)||'—'}</dd><dt>USN</dt><dd>${esc(report.usn)||'—'}</dd><dt>Batch</dt><dd>${esc(report.batch)||'—'}</dd><dt>Date</dt><dd>${esc(report.date)||'—'}</dd></dl></header>
      <h3>Aim</h3><p>${P.aim}</p>
      <h3>Principle</h3><p>${P.theory.principle[0]}</p>
      <h3>Governing relations</h3>${P.theory.eq.map(e=>`<div class="eq"><div class="f">${e.f}</div></div>`).join('')}
      ${nomHTML(P)}
      <h3>Procedure</h3><ol>${P.procedure.map(s=>`<li>${s}</li>`).join('')}</ol>
      <h3>Observations</h3>${rows.length?`<div class="tablewrap" style="max-height:none">${tableHTML(P)}</div>`:'<p class="muted">No observations recorded. Record readings on the Experiment tab.</p>'}
      <h3>Graph: ${o.label} vs ${q.label}</h3><img class="sh-img" src="${img}" alt="Plot of ${o.label} against ${q.label}">
      ${runlog[P.id].length?`<h3>Machine runs and measurements</h3><div class="tablewrap" style="max-height:none">${$('#olog')?'':''}<table><thead><tr><th>Run</th><th>Settings</th><th>Readings</th><th>Result</th></tr></thead><tbody>${runlog[P.id].map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.settings)}</td><td style="white-space:normal">${r.readings.map(x=>esc(x.join(': '))).join('<br>')}</td><td>${fmt(r.ans)} ${r.unit}</td></tr>`).join('')}</tbody></table></div>`:''}
      <h3>Results and conclusions</h3><p class="sh-concl">${esc(report.concl[P.id]||'—').replace(/\n/g,'<br>')}</p>
      <h3>Assessment</h3><p>Pre-test: <b>${pre.r} / ${pre.n}</b>${pre.a<pre.n?` (${pre.a} answered)`:''} · Post-test: <b>${post.r} / ${post.n}</b>${post.a<post.n?` (${post.a} answered)`:''}</p>
      <p class="foot">Generated by NTM Virtual Lab v${VERSION}. Simulator model and validation status: ${(STATUS[VALID[P.id]?.status]||STATUS.none)[0]}. Values are model estimates.</p>`;};
  const bind=(id,k)=>$('#'+id).oninput=e=>{report[k]=e.target.value;save();fill();};
  bind('rn','name');bind('ru','usn');bind('rb','batch');bind('ri','inst');bind('rd','date');
  $('#rc').oninput=e=>{report.concl[P.id]=e.target.value;save();fill();};
  $('#rprint').onclick=()=>{try{window.print();}catch(e){}setTimeout(()=>{$('#rmsg').textContent='If no print dialog opened, this preview blocks printing. Open the lab from its website address to print.';},800);};
  fill();
}

// ---------- router ----------
function route(){
  const h=(location.hash||'#home').slice(1);
  if(byId[h]) renderProcess(byId[h]); else if(h==='compare') renderCompare(); else if(h==='about') renderAbout(); else if(h==='lab') {location.hash=PROCESSES[0].id;return;} else renderHome();
  markRail(byId[h]?h:(['compare','about'].includes(h)?h:'home'));
  window.scrollTo(0,0);
}
