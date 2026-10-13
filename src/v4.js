// ================= v4.0: models overlay, safety gate, libraries, comprehensive report =================
report.ack=report.ack||{};report.disc=report.disc||{};report.first=report.first||{};
if(report.faculty==null)report.faculty='';if(report.sec==null)report.sec='';
const cmpAll={};
const modelOf=P=>P.models?P.models.find(m=>m.id===state[P.id].model)||P.models[0]:null;
const tblH=(cols,rows,cls='lib')=>`<div class="tablewrap" style="max-height:none"><table class="${cls}"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
function libHTML(P,h='h3'){const L=LIB[P.id];if(!L)return '';
  return `<${h}>Tools and consumables</${h}>${tblH(L.cols,L.rows,'lib')}${L.extra?tblH(L.extra.cols,L.extra.rows,'lib'):''}${L.note?`<p class="foot">${L.note}</p>`:''}`;}
function modelsHTML(P){if(!P.models)return '';const cur=modelOf(P);
  return `<h3>Simulator models</h3><p class="foot" style="margin-top:0">This process has ${P.models.length} removal models. Choose one under <i>Simulator model</i> on the Experiment tab, and tick <i>Compare all models</i> to draw them together.</p>
  ${P.models.map(m=>`<div class="eq mdl${m===cur?' sel':''}"><div class="mname">${esc(m.name)}${m===cur?' <span class="chip" style="--cc:var(--accent)">In use</span>':''}</div><div class="f">${m.eq}</div><div class="w">${m.w}</div></div>`).join('')}`;}

// ---- theory: models + library ----
const _renderTheory=renderTheory;
renderTheory=function(P){_renderTheory(P);const pr=$('#pane .theory .prose');if(!pr)return;
  const mdl=pr.querySelector('.model');const html=modelsHTML(P)+libHTML(P);
  if(mdl)mdl.insertAdjacentHTML('beforebegin',html);else pr.insertAdjacentHTML('beforeend',html);};

// ---- experiment: compare-all-models overlay ----
const _renderExp=renderExp;
renderExp=function(P){_renderExp(P);if(!P.models)return;const r=$('#clrhold');if(!r)return;
  r.insertAdjacentHTML('afterend',`<label class="chk"><input type="checkbox" id="cmpall"${cmpAll[P.id]?' checked':''}> Compare all models</label>`);
  $('#cmpall').onchange=e=>{cmpAll[P.id]=e.target.checked;drawChart(P);};drawChart(P);};
drawChart=function(P,cvOverride){
  const cv=cvOverride||$('#chart');if(!cv)return;
  const ss=sweepSel[P.id];const q=P.params.find(x=>x.id===ss.x);const o=P.outputs.find(x=>x.k===ss.y);
  const accent=getComputedStyle(document.querySelector('article')||document.documentElement).getPropertyValue('--c').trim()||tok('--accent');
  const series=held[P.id].map((h,i)=>({xs:h.xs,ys:h.ys,color:tok(PAL[i%PAL.length]),width:1.6,dash:[5,4]}));
  const others=[];
  if(cmpAll[P.id]&&P.models){const cur=modelOf(P);P.models.forEach(m=>{if(m===cur)return;const k=others.length;const col=tok(PAL[(k+held[P.id].length+1)%PAL.length]);
    others.push({m,col:PAL[(k+held[P.id].length+1)%PAL.length]});series.push({...curve(P,{...state[P.id],model:m.id}),color:col,width:2,dash:[2,3]});});}
  const cur=curve(P,state[P.id]);series.push({...cur,color:accent,fill:held[P.id].length===0&&!others.length,width:2.2});
  const cy=P.compute(state[P.id]).o[o.k];
  plotXY(cv,{xmin:q.min,xmax:q.max,xlabel:`${q.label} (${q.unit})`,ylabel:`${o.label}${o.unit?' ('+o.unit+')':''}`,series,marker:isFinite(cy)?{x:state[P.id][q.id],y:cy,color:accent,text:`${fmt(cy)} ${o.unit}`}:null});
  cv._legend=[...held[P.id].map((h,i)=>[`var(${PAL[i%PAL.length]})`,'dashed',h.label]),...others.map(x=>[`var(${x.col})`,'dotted','Model: '+x.m.name]),[accent,'solid',(others.length?'Model in use: '+modelOf(P).name:'Current')+(held[P.id].length?': '+diffLabel(P):'')]];
  const lg=$('#legend');if(lg&&!cvOverride)lg.innerHTML=(held[P.id].length||others.length)?cv._legend.map(([c,st,l])=>`<span><i style="border-color:${c};border-top-style:${st}"></i>${esc(l)}</span>`).join(''):''+(others.length?'<span class="muted">A flat line means that model does not use this parameter.</span>':'');
};

// ---- tests: keep first-attempt scores ----
const _renderTest=renderTest;
renderTest=function(P,kind){const s=score(P,kind);const F=report.first[P.id]||(report.first[P.id]={});
  if(s.n&&s.a===s.n&&F[kind]==null){F[kind]=s.r;F[kind+'n']=s.n;save();}_renderTest(P,kind);};

// ---- operate: safety briefing and acknowledgement gate ----
function safetyHTML(P,forReport){const S=SAFETY[P.id];if(!S)return '';
  const col=(t,a)=>`<div><h4>${t}</h4><ul class="ticks">${a.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
  return `<div class="safegrid">${col('Hazards',S.haz)}${col('Personal protective equipment',S.ppe)}${col('Safe working practice',S.rules)}${col('In an emergency',S.emerg)}</div>`;}
const _renderOp=renderOp;
renderOp=function(P){_renderOp(P);const ok=!!report.ack[P.id];
  $('#pane').insertAdjacentHTML('afterbegin',`<details class="card safety" id="osafe"${ok?'':' open'}><summary><b>Safety briefing</b> · ${P.abbr} ${ok?'<span class="chip" style="--cc:var(--ok)">Acknowledged</span>':'<span class="chip" style="--cc:var(--bad)">Read before operating</span>'}</summary>
    ${safetyHTML(P)}<label class="chk ack"><input type="checkbox" id="oack"${ok?' checked':''}> I have read this safety briefing and will follow it on the real machine.</label></details>`);
  $('#oack').onchange=e=>{if(e.target.checked)report.ack[P.id]=new Date().toISOString();else delete report.ack[P.id];save();renderOp(P);};
  safeGate(P);};
function safeGate(P){const c=$('.console');if(c)c.classList.toggle('locked',!report.ack[P.id]);}
const needAck=P=>{if(report.ack[P.id])return false;opAlarm('Read the safety briefing above and tick the acknowledgement before setting up the machine.');const d=$('#osafe');if(d){d.open=true;d.scrollIntoView({block:'nearest'});}return true;};
const _opPlace=opPlace,_opSwitch=opSwitch,_opStart=opStart;
opPlace=function(P,id){if(needAck(P))return;_opPlace(P,id);};
opSwitch=function(P,id){if(needAck(P))return;_opSwitch(P,id);};
opStart=function(P){if(needAck(P))return;_opStart(P);};

// ---- report helpers ----
function fnv(s){let h=0x811c9dc5;for(const ch of s){h^=ch.codePointAt(0);h=Math.imul(h,0x01000193)>>>0;}return h.toString(16).toUpperCase().padStart(8,'0');}
const reportId=P=>`NTM-${P.abbr.replace(/[^A-Z0-9]/gi,'')}-${fnv([P.id,report.usn.trim().toUpperCase(),report.name.trim(),report.date].join('|'))}`;
function wmSVG(txt){const t=esc(txt.toUpperCase());const w=Math.max(300,t.length*11+80);
  return `<svg class="wm" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><pattern id="wmp" width="${w}" height="150" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)"><text x="10" y="45" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="2" fill="#0B6A86" fill-opacity=".085">${t}</text><text x="${10+w/2}" y="120" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="2" fill="#0B6A86" fill-opacity=".085">${t}</text><text x="${10-w/2}" y="120" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="2" fill="#0B6A86" fill-opacity=".085">${t}</text></pattern></defs><rect width="100%" height="100%" fill="url(#wmp)"/></svg>`;}
function heldOutMAPE(id){const V=VALID[id];if(!V||!V.sets)return null;const pr=[];V.sets.forEach(s=>{if(s.role!=='val')return;s.pts.forEach(([x,y])=>pr.push([runP(id,{...s.fix,[s.x]:x})[s.y],y]));});return pr.length?{m:mape(pr),n:pr.length}:null;}
function valRefs(id){const V=VALID[id]||{};const k=new Set();(V.sets||[]).forEach(s=>s.src&&k.add(s.src));(V.checks||[]).forEach(c=>c.src&&k.add(c.src));if(V.bands&&V.bands.src)k.add(V.bands.src);
  return [...k].map(x=>SRC[x]).filter(Boolean).map(s=>s.u?`${esc(s.t)} <span class="mono small">${esc(s.u)}</span>`:esc(s.t));}
// GUM uncertainty: Type B from parameter-setting resolution (rectangular, u = step/√12) propagated by numerical sensitivity; Type A from repeated machine runs.
function gum(P){const ss=sweepSel[P.id],o=P.outputs.find(x=>x.k===ss.y),s=state[P.id];const f=v=>P.compute(v).o[o.k];const y=f(s);if(!isFinite(y))return null;
  const rows=[];P.params.filter(q=>q.type!=='select').forEach(q=>{const x=s[q.id],u=q.step/Math.sqrt(12);let h=Math.max(q.step,Math.abs(x)*1e-3);
    let a=Math.max(q.min,x-h),b=Math.min(q.max,x+h);if(b<=a)return;const ya=f({...s,[q.id]:a}),yb=f({...s,[q.id]:b});if(!isFinite(ya)||!isFinite(yb))return;
    const c=(yb-ya)/(b-a);if(Math.abs(c*u)<=Math.abs(y)*1e-9)return;rows.push({q,x,u,c,ci:Math.abs(c*u)});});
  const L=runlog[P.id].filter(r=>r.settings===diffLabel(P)).map(r=>r.ans).filter(isFinite);let A=null;
  if(L.length>=2){const m=L.reduce((a,b)=>a+b,0)/L.length;const sd=Math.sqrt(L.reduce((a,b)=>a+(b-m)**2,0)/(L.length-1));A={n:L.length,rel:sd/Math.sqrt(L.length)/Math.abs(m)};A.ci=A.rel*Math.abs(y);}
  const uc=Math.sqrt(rows.reduce((a,r)=>a+r.ci**2,0)+(A?A.ci**2:0));return {o,y,rows,A,uc,U:2*uc};}

// ---- comprehensive report ----
renderReport=function(P){
  const D=report.disc[P.id]||(report.disc[P.id]=[]);const Q=DISC[P.id]||[];
  $('#pane').innerHTML=`<div class="no-print"><p class="aim"><b>Lab report.</b> Fill in your details, conclusions and discussion answers. The report collects your safety acknowledgement, machine runs, observations, graph, uncertainty budget and test scores. Use <b>Print / Save as PDF</b> or <b>Download report</b>.</p>
  <form class="panel repform" id="rform" onsubmit="return false">
    <div class="ctrl"><label for="rn">Student name</label><input id="rn" value="${esc(report.name)}"></div>
    <div class="ctrl"><label for="ru">USN / roll number</label><input id="ru" value="${esc(report.usn)}"></div>
    <div class="ctrl"><label for="rs">Semester / section</label><input id="rs" value="${esc(report.sec)}"></div>
    <div class="ctrl"><label for="rb">Batch</label><input id="rb" value="${esc(report.batch)}"></div>
    <div class="ctrl"><label for="rf">Faculty in charge</label><input id="rf" value="${esc(report.faculty)}"></div>
    <div class="ctrl"><label for="ri">Institution</label><input id="ri" value="${esc(report.inst)}" placeholder="e.g. MITE Moodbidri"></div>
    <div class="ctrl"><label for="rd">Date</label><input id="rd" type="date" value="${esc(report.date)}"></div>
    <div class="ctrl wide"><label for="rc">Results and conclusions</label><textarea id="rc" rows="5" placeholder="State the trends you observed, with numbers from your table, and explain them using the theory.">${esc(report.concl[P.id]||'')}</textarea></div>
    ${Q.map((q,i)=>`<div class="ctrl wide"><label for="rq${i}">Discussion ${i+1}. ${q}</label><textarea id="rq${i}" data-i="${i}" rows="3">${esc(D[i]||'')}</textarea></div>`).join('')}
    ${submitHTML(P)}<div class="btnrow wide"><button class="btn" type="button" id="rprint">Print / Save as PDF</button><button class="btn ghost" type="button" id="rdl">Download report (.html)</button><span class="foot" id="rmsg" aria-live="polite"></span></div>
  </form></div>
  <section class="sheet" id="sheet"></section>`;
  const fill=()=>{$('#sheet').innerHTML=sheetHTML(P);};
  const bind=(id,k)=>$('#'+id).oninput=e=>{report[k]=e.target.value;save();fill();};
  bind('rn','name');bind('ru','usn');bind('rs','sec');bind('rb','batch');bind('rf','faculty');bind('ri','inst');bind('rd','date');
  $('#rc').oninput=e=>{report.concl[P.id]=e.target.value;save();fill();};
  $('#rform').querySelectorAll('[data-i]').forEach(t=>t.oninput=e=>{D[+t.dataset.i]=e.target.value;save();fill();});
  bindSubmit(P);
  $('#rprint').onclick=()=>{try{window.print();}catch(e){}setTimeout(()=>{$('#rmsg').textContent='If no print dialog opened, this preview blocks printing. Open the lab from its website address to print.';},800);};
  $('#rdl').onclick=()=>{try{const css=[...document.querySelectorAll('style')].map(s=>s.textContent).join('\n');const id=reportId(P);
    const html=`<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${id} · ${esc(P.name)}</title><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Source+Sans+3:wght@400;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"><style>${css}</style></head><body style="background:#fff"><main style="padding:24px;max-width:960px;margin:0 auto">${$('#sheet').outerHTML}</main></body></html>`;
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download=id+'.html';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);
    $('#rmsg').textContent='Report downloaded as '+id+'.html. (Downloads are blocked inside the chat preview; use the website.)';}catch(e){$('#rmsg').textContent='Download is not available here. Open the lab from its website address.';}};
  fill();
};
function sheetHTML(P){
  const id=reportId(P),ss=sweepSel[P.id],q=P.params.find(x=>x.id===ss.x),o=P.outputs.find(x=>x.k===ss.y),s=state[P.id],rows=records[P.id],L=runlog[P.id];
  const img=(()=>{const cv=document.createElement('canvas');cv.style.width='720px';cv.style.height='405px';document.body.appendChild(cv);cv.width=1440;cv.height=810;cv._dpr=2;drawChart(P,cv);const u=cv.toDataURL('image/png');const lg=cv._legend;cv.remove();return {u,lg};})();
  const inst=report.inst||'NTM Virtual Lab';const ack=report.ack[P.id];const M=modelOf(P);
  let n=0;const H=t=>`<h3><span class="sn">${++n}.</span> ${t}</h3>`;
  const pre=score(P,'pre'),post=score(P,'post'),F=report.first[P.id]||{};
  const pct=(r,k)=>k?r/k*100:NaN;const fp=pct(F.pre??NaN,F.pren),fq=pct(F.post??NaN,F.postn);
  const g=isFinite(fp)&&isFinite(fq)&&fp<100?(fq-fp)/(100-fp):NaN;const gTxt=!isFinite(g)?'—':`${g.toFixed(2)} (${g<0.3?'low':g<0.7?'medium':'high'} gain)`;
  const N=numS[P.id];const corr=L.filter(r=>r.student!=null&&(r.ans===0?Math.abs(r.student)<1e-9:Math.abs(r.student/r.ans-1)<=0.02)).length;
  const G=gum(P);const V=VALID[P.id]||{};const ho=heldOutMAPE(P.id);
  const items=opItems(OPS[P.id]).map(it=>(it.kind==='part'?'Placed the ':'Switched on the ')+it.label.replace(/^([A-Z])(?![A-Z0-9])/,m=>m.toLowerCase())+'.');
  const lastSol=[...L].reverse().find(r=>r.sol);
  const objectives=[`Set up and operate the virtual ${P.abbr} machine in the correct sequence, observing the safety interlocks.`,`Study the effect of ${q.label} on ${o.label} and explain the trend with the governing relations.`,`Take instrument readings and calculate the result for each machine run.`,`Compare the simulator with published data and estimate the uncertainty of the result.`];
  return `${wmSVG(`NTM Virtual Lab · ${inst}${report.usn?' · '+report.usn:''}`)}
  <header class="sh-head"><div><div class="eyebrow">${esc(inst)} · Virtual laboratory record</div><h2>${P.name} (${P.abbr})</h2><div class="mono small">Report ID ${id}</div></div>
    <dl class="sh-meta"><dt>Name</dt><dd>${esc(report.name)||'—'}</dd><dt>USN</dt><dd>${esc(report.usn)||'—'}</dd><dt>Sem / sec</dt><dd>${esc(report.sec)||'—'}</dd><dt>Batch</dt><dd>${esc(report.batch)||'—'}</dd><dt>Faculty</dt><dd>${esc(report.faculty)||'—'}</dd><dt>Date</dt><dd>${esc(report.date)||'—'}</dd></dl></header>
  ${H('Aim and objectives')}<p>${P.aim}</p><ol>${objectives.map(x=>`<li>${x}</li>`).join('')}</ol>
  ${H('Machine, tools and consumables')}<p><b>Energy:</b> ${P.facts.energy} · <b>Mechanism:</b> ${P.facts.mech} · <b>Medium:</b> ${P.facts.medium} · <b>Tool:</b> ${P.facts.tool}</p>${libHTML(P,'h4')}
  ${H('Safety precautions')}${safetyHTML(P,true)}<p class="${ack?'':'bad'}">${ack?`Safety briefing acknowledged on ${new Date(ack).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}.`:'Safety briefing not acknowledged.'}</p>
  ${H('Theory')}${P.theory.principle.map(p=>`<p>${p}</p>`).join('')}<h4>Governing relations</h4>${P.theory.eq.map(e=>`<div class="eq"><div class="f">${e.f}</div><div class="w">${e.w}</div></div>`).join('')}
  ${H('Nomenclature')}${nomHTML(P).replace(/<h3>Nomenclature<\/h3>/,'')}
  ${H('Simulator model used')}${M?`<div class="eq"><div class="mname">${esc(M.name)}</div><div class="f">${M.eq}</div><div class="w">${M.w}</div></div>`:''}<div class="model">${P.theory.model}</div>
  ${H('Process parameters')}${tblH(['Parameter','Setting','Unit'],P.params.map(p=>[p.label,p.type==='select'?(p.options.find(x=>x[0]===s[p.id])||[,s[p.id]])[1]:s[p.id],p.unit||'']))}
  ${H('Procedure')}<h4>Machine set-up (Operate tab)</h4><ol>${items.map(x=>`<li>${x}</li>`).join('')}<li>Started the cycle, waited for it to finish and took instrument readings.</li></ol><h4>Experiment</h4><ol>${P.procedure.map(x=>`<li>${x}</li>`).join('')}</ol>
  ${H('Observations')}${rows.length?`<div class="tablewrap" style="max-height:none">${tableHTML(P)}</div>`:'<p class="muted">No observations recorded. Record readings on the Experiment tab.</p>'}
  ${H('Machine runs and measurements')}${L.length?tblH(['Run','Settings','Readings'],L.map((r,i)=>[i+1,esc(r.settings),r.readings.map(x=>esc(x.join(': '))).join('<br>')])):'<p class="muted">No machine runs. Complete a cycle on the Operate tab.</p>'}
  ${H(`Graph: ${o.label} against ${q.label}`)}<img class="sh-img" src="${img.u}" alt="Plot of ${o.label} against ${q.label}">${img.lg&&img.lg.length>1?`<div class="legend">${img.lg.map(([c,st,l])=>`<span><i style="border-color:${c};border-top-style:${st}"></i>${esc(l)}</span>`).join('')}</div>`:''}
  ${H('Sample calculation')}${lastSol?`<p>${lastSol.q}</p><div class="why">${lastSol.sol}</div>`:'<p class="muted">Complete a machine run on the Operate tab to include a worked calculation.</p>'}
  ${H('Results')}${L.length?tblH(['Run','Your answer','Correct value','Deviation','Result'],L.map((r,i)=>{const d=r.student==null?NaN:(r.ans===0?0:(r.student/r.ans-1)*100);const ok=r.student!=null&&Math.abs(d)<=2;return [i+1,r.student==null?'—':fmt(r.student),`${fmt(r.ans)} ${r.unit}`,isFinite(d)?`${d>=0?'+':''}${d.toFixed(1)} %`:'—',r.student==null?'Solution viewed':ok?'<span class="ok">Correct (±2 %)</span>':'<span class="bad">Outside ±2 %</span>'];})):'<p class="muted">No results yet.</p>'}
  <p>Simulator value at the current settings: <b>${fmt(G?G.y:P.compute(s).o[o.k])} ${o.unit}</b> (${o.label}).</p>
  ${H('Validation of the simulator')}<p>Status: <b>${(STATUS[V.status]||STATUS.none)[0]}</b>${ho?` · held-out mean error <b>${ho.m.toFixed(1)} %</b> over ${ho.n} published points`:''}.</p><p>${esc(V.summary||'')}</p>
  ${H('Uncertainty analysis')}${G?`<p>Following the GUM: each setting is read to the resolution of its control (rectangular distribution, <i>u</i> = resolution/√12) and propagated through the simulator by numerical sensitivity coefficients <i>c</i> = ∂<i>y</i>/∂<i>x</i>. Settings that do not affect the result are omitted.${G.A?` Repeatability (Type A) is taken from ${G.A.n} machine runs at the same settings.`:' Repeat a machine run at the same settings to add a Type A repeatability term.'}</p>
    ${tblH(['Source','Value','Resolution','u(x)','Sensitivity c','|c|·u (' +esc(G.o.unit)+')','Share'],[...G.rows.map(r=>[esc(r.q.label),`${r.x} ${r.q.unit}`,`${r.q.step} ${r.q.unit}`,fmt(r.u),fmt(r.c),fmt(r.ci),G.uc?((r.ci/G.uc)**2*100).toFixed(1)+' %':'—']),...(G.A?[[`Repeatability (Type A, n = ${G.A.n})`,'—','—','—','—',fmt(G.A.ci),G.uc?((G.A.ci/G.uc)**2*100).toFixed(1)+' %':'—']]:[])])}
    <p><b>${esc(G.o.label)} = ${fmt(G.y)} ± ${fmt(G.U)} ${esc(G.o.unit)}</b> (combined standard uncertainty ${fmt(G.uc)} ${esc(G.o.unit)}; expanded with <i>k</i> = 2, about 95 % confidence; ${(G.U/Math.abs(G.y)*100).toFixed(1)} %). This covers setting resolution and repeatability only, not model error; see section ${n-1} for model error.</p>`:'<p class="muted">The selected output is not defined at these settings.</p>'}
  ${H('Sources of error')}<ul class="ticks">${(ERRS[P.id]||[]).map(x=>`<li>${x}</li>`).join('')}<li>Model error: the simulator is an idealised model (see the validation status above).</li></ul>
  ${H('Discussion')}${(DISC[P.id]||[]).map((d,i)=>`<p><b>Q${i+1}. ${d}</b></p><p class="sh-concl">${esc((report.disc[P.id]||[])[i]||'—').replace(/\n/g,'<br>')}</p>`).join('')}
  ${H('Conclusions')}<p class="sh-concl">${esc(report.concl[P.id]||'—').replace(/\n/g,'<br>')}</p>
  ${H('Assessment summary')}${tblH(['Item','First attempt','Current'],[['Pre-test',F.pre!=null?`${F.pre} / ${F.pren} (${fp.toFixed(0)} %)`:'—',`${pre.r} / ${pre.n}${pre.a<pre.n?` (${pre.a} answered)`:''}`],['Post-test',F.post!=null?`${F.post} / ${F.postn} (${fq.toFixed(0)} %)`:'—',`${post.r} / ${post.n}${post.a<post.n?` (${post.a} answered)`:''}`],['Normalised gain g = (post − pre)/(100 − pre); pre-test taken after Theory, so g measures learning from the experiment',gTxt,'—'],['Numericals (this session)','—',N?`${N.solved} solved of ${N.attempted}`:'—'],['Machine-run calculations','—',`${corr} correct of ${L.length}`]])}
  ${H('Applications')}<ul class="ticks">${P.theory.apps.map(x=>`<li>${x}</li>`).join('')}</ul>
  ${H('References')}<ol>${[...REFS_COMMON.map(esc),...valRefs(P.id)].map(x=>`<li>${x}</li>`).join('')}</ol>
  <div class="sig"><div><span></span>Student</div><div><span></span>Faculty in charge</div><div><span></span>Date</div></div>
  <p class="sh-foot">Generated by NTM Virtual Lab v${VERSION} · Report ID ${id} · ${new Date().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}<br>Simulation record for teaching. Not a certified test report. Values are model estimates.</p>`;
}

// ---- submission to the faculty's Google Sheet (configured in config.js on the website) ----
const CFG=window.NTM_CONFIG||{};
report.sub=report.sub||{};if(report.code==null)report.code='';
function submitPayload(P){const pre=score(P,'pre'),post=score(P,'post'),F=report.first[P.id]||{},L=runlog[P.id],N=numS[P.id];
  const pct=(r,k)=>k?r/k*100:NaN;const fp=pct(F.pre??NaN,F.pren),fq=pct(F.post??NaN,F.postn);const g=isFinite(fp)&&isFinite(fq)&&fp<100?(fq-fp)/(100-fp):null;
  const corr=L.filter(r=>r.student!=null&&(r.ans===0?Math.abs(r.student)<1e-9:Math.abs(r.student/r.ans-1)<=0.02)).length;const M=modelOf(P);const D=report.disc[P.id]||[];
  return {version:VERSION,reportId:reportId(P),process:P.abbr,processName:P.name,name:report.name.trim(),usn:report.usn.trim().toUpperCase(),section:report.sec,batch:report.batch,faculty:report.faculty,institution:report.inst,reportDate:report.date,classCode:report.code.trim(),
    safetyAck:report.ack[P.id]||'',preFirst:F.pre??'',preN:F.pren??'',postFirst:F.post??'',postN:F.postn??'',preNow:pre.r,postNow:post.r,gain:g==null?'':+g.toFixed(3),
    runsCorrect:corr,runsTotal:L.length,numSolved:N?N.solved:0,numAttempted:N?N.attempted:0,observations:records[P.id].length,model:M?M.name:'',
    conclusion:report.concl[P.id]||'',disc1:D[0]||'',disc2:D[1]||'',disc3:D[2]||'',clientTime:new Date().toISOString()};}
function submitHTML(P){const S=report.sub[P.id];
  return `<div class="ctrl"><label for="rk">Class code (from your faculty)</label><input id="rk" value="${esc(report.code)}" autocomplete="off"></div>
  <div class="ctrl wide subbox"><button class="btn" type="button" id="rsub"${CFG.submitUrl?'':' disabled'}>Submit to faculty</button>
  <span class="foot" id="rsubmsg" aria-live="polite">${!CFG.submitUrl?'Submission is not set up for this copy of the lab. Print or download the report instead.':S?`Last submitted ${new Date(S.t).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})} (Report ID ${esc(S.id)}). You can submit again; your faculty sees every submission.`:'Submitting sends your name, USN, scores, conclusions and discussion answers to your faculty\'s Google Sheet.'}</span></div>`;}
function bindSubmit(P){const k=$('#rk');if(k)k.oninput=e=>{report.code=e.target.value;save();};
  const b=$('#rsub');if(!b||!CFG.submitUrl)return;
  b.onclick=async()=>{const m=$('#rsubmsg');const d=submitPayload(P);
    if(!d.name||!d.usn){m.innerHTML='<span class="bad">Enter your name and USN first.</span>';return;}
    if(!d.classCode){m.innerHTML='<span class="bad">Enter the class code your faculty gave you.</span>';return;}
    b.disabled=true;m.textContent='Submitting…';
    let res=null;try{const r=await fetch(CFG.submitUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(d)});res=await r.json();}catch(e){res={unconfirmed:true};}
    b.disabled=false;
    if(res&&res.ok){report.sub[P.id]={t:new Date().toISOString(),id:d.reportId};save();m.innerHTML=`<span class="ok">Submitted.</span> Report ID ${esc(d.reportId)}. Keep this ID; your faculty will match it to the printed report.`;}
    else if(res&&res.error==='class code')m.innerHTML='<span class="bad">Class code not accepted.</span> Check it with your faculty.';
    else if(res&&res.unconfirmed)m.innerHTML='Sent, but the server reply could not be read (network or browser restriction). Ask your faculty to confirm it arrived before submitting again.';
    else m.innerHTML='<span class="bad">Submission failed.</span> '+esc(res&&res.error||'Try again later.');};}
