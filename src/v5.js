// ================= v4.3: Listen button on Theory, feedback form gating the report =================
// ---- Listen: plays pre-recorded narration of the Principle and Effect-of-parameters text ----
const AUDIO_BASE='audio/';
const LSN={pid:null,i:0,on:false,rate:1,els:[]};
const lsnAudio=new Audio();lsnAudio.preload='auto';if('preservesPitch' in lsnAudio)lsnAudio.preservesPitch=true;
function lsnStop(){LSN.on=false;try{lsnAudio.pause();}catch(e){}LSN.els.forEach(e=>e&&e.classList.remove('reading'));const b=$('#lsn');if(b){b.textContent='▶ Listen';b.setAttribute('aria-pressed','false');}}
function lsnPlay(){const N=NARR[LSN.pid];if(!N||LSN.i>=N.n){lsnStop();LSN.i=0;const m=$('#lsnmsg');if(m)m.textContent='Finished. Press Listen to hear it again.';return;}
  const el=LSN.els[LSN.i];if(el&&!el.isConnected){lsnStop();return;}
  LSN.els.forEach(e=>e&&e.classList.remove('reading'));if(el){el.classList.add('reading');try{el.scrollIntoView({block:'nearest',behavior:reduce?'auto':'smooth'});}catch(e){}}
  lsnAudio.src=`${AUDIO_BASE}${LSN.pid}/${LSN.i}.mp3`;lsnAudio.playbackRate=LSN.rate;
  lsnAudio.play().catch(err=>{if(err&&err.name==='NotAllowedError'){lsnStop();const m=$('#lsnmsg');if(m)m.textContent='Your browser blocked the audio. Press Listen again.';}});}
lsnAudio.onended=()=>{if(!LSN.on)return;LSN.i++;setTimeout(()=>{if(LSN.on)lsnPlay();},250);};
lsnAudio.onerror=()=>{if(!LSN.on)return;lsnStop();const m=$('#lsnmsg');if(m)m.textContent='Narration is not available in this copy of the lab. It plays on the website.';};
function lsnTargets(){const pr=$('#pane .theory .prose');if(!pr)return[];const N=NARR[current.id];if(!N)return[];
  const ps=[...pr.querySelectorAll(':scope > p')].slice(0,N.np);
  const h=[...pr.querySelectorAll(':scope > h3')].find(x=>/Effect of parameters/i.test(x.textContent));
  const lis=h&&h.nextElementSibling?[...h.nextElementSibling.querySelectorAll('li')]:[];
  return [...ps,...lis].slice(0,N.n);}
const fmtDur=s=>{s=Math.round(s);return s<60?`${s} s`:`${Math.floor(s/60)} min ${String(s%60).padStart(2,'0')} s`;};
const _renderTheory5=renderTheory;
renderTheory=function(P){lsnStop();_renderTheory5(P);const N=NARR[P.id];const pr=$('#pane .theory .prose');if(!N||!pr)return;
  pr.insertAdjacentHTML('afterbegin',`<div class="listen" role="group" aria-label="Listen to this page"><button class="btn" type="button" id="lsn" aria-pressed="false">▶ Listen</button><button class="iconbtn" type="button" id="lstop">Stop</button>
    <label class="lsr" for="lrate">Speed <select id="lrate"><option value="0.85">Slow</option><option value="1" selected>Normal</option><option value="1.2">Fast</option></select></label>
    <span class="foot" id="lsnmsg" aria-live="polite">Hear the principle and the effect of parameters read aloud · ${fmtDur(N.dur.reduce((a,b)=>a+b,0))}</span></div>`);
  $('#lrate').value=String(LSN.rate);
  $('#lsn').onclick=()=>{if(LSN.on){LSN.on=false;lsnAudio.pause();$('#lsn').textContent='▶ Resume';$('#lsn').setAttribute('aria-pressed','false');return;}
    if(LSN.pid!==P.id){LSN.pid=P.id;LSN.i=0;}LSN.els=lsnTargets();LSN.on=true;$('#lsn').textContent='❚❚ Pause';$('#lsn').setAttribute('aria-pressed','true');$('#lsnmsg').textContent='Reading…';
    if(lsnAudio.src&&lsnAudio.src.includes(`/${P.id}/${LSN.i}.mp3`)&&lsnAudio.currentTime>0&&!lsnAudio.ended){LSN.els[LSN.i]&&LSN.els[LSN.i].classList.add('reading');lsnAudio.play().catch(()=>lsnStop());}else lsnPlay();};
  $('#lstop').onclick=()=>{lsnStop();LSN.i=0;lsnAudio.removeAttribute('src');$('#lsnmsg').textContent='Stopped.';};
  $('#lrate').onchange=e=>{LSN.rate=+e.target.value;lsnAudio.playbackRate=LSN.rate;};
  LSN.pid=P.id;LSN.i=0;};
const _renderPane5=renderPane;renderPane=function(P){if(tabOf[P.id]!=='th')lsnStop();_renderPane5(P);};
window.addEventListener('hashchange',()=>lsnStop());

// ---- Feedback form: required before the report can be printed, downloaded or submitted ----
report.fb=report.fb||{};
const FBQ=[['q1','The theory (and narration) helped me understand how the process works.'],
 ['q2','Setting up and operating the virtual machine helped me understand the real set-up and its safety steps.'],
 ['q3','The experiment and plots helped me see how the process parameters affect the results.'],
 ['q4','The tests and numericals were at the right level of difficulty.'],
 ['q5','The lab was easy to use on my device.'],
 ['q6','I would recommend this virtual lab to other students.']];
const LIK=['Strongly disagree','Disagree','Neutral','Agree','Strongly agree'];
function fbDraft(pid){return report.fbd&&report.fbd[pid]||(report.fbd=report.fbd||{},report.fbd[pid]={});}
function fbHTML(P){const F=report.fb[P.id];
  if(F)return `<div class="ctrl wide fbdone" id="fbbox"><div><b class="ok">✓ Feedback recorded</b> <span class="foot">${new Date(F.t).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}${F.sent===true?' · sent to your faculty':F.sent===false?' · saved on this device':''}. Thank you. Print, download and submit are unlocked.</span></div><button class="iconbtn" type="button" id="fbedit">Change my feedback</button></div>`;
  const D=fbDraft(P.id);
  return `<fieldset class="ctrl wide fbform" id="fbbox"><legend>Feedback on this experiment <span class="foot">(required to print, download or submit the report)</span></legend>
   <p class="foot" style="margin:0 0 6px">Your honest answers help improve the lab. They are sent to your faculty with your name and USN.</p>
   <div class="liktable" role="table" aria-label="Rate each statement">
   <div class="likhead" role="row"><span role="columnheader"></span>${LIK.map(l=>`<span role="columnheader">${l}</span>`).join('')}</div>
   ${FBQ.map(([k,q],qi)=>`<div class="likrow" role="radiogroup" aria-labelledby="fbl-${k}"><span class="likq" id="fbl-${k}">${qi+1}. ${q}</span>${LIK.map((l,i)=>`<label class="likopt"><input type="radio" name="fb-${k}" value="${i+1}"${D[k]==i+1?' checked':''}><span class="likl">${l}</span></label>`).join('')}</div>`).join('')}
   </div>
   <div class="fbgrid">
    <div class="ctrl"><label for="fb-time">Time spent on this experiment</label><select id="fb-time"><option value="">Choose…</option>${['Under 30 min','30–60 min','1–2 hours','Over 2 hours'].map(o=>`<option${D.time===o?' selected':''}>${o}</option>`).join('')}</select></div>
    <div class="ctrl"><label for="fb-dev">Device used</label><select id="fb-dev"><option value="">Choose…</option>${['Phone','Tablet','Laptop / desktop','College lab computer'].map(o=>`<option${D.device===o?' selected':''}>${o}</option>`).join('')}</select></div>
   </div>
   <div class="ctrl"><label for="fb-help">What helped you understand the process most? <span class="foot">(required)</span></label><textarea id="fb-help" rows="2">${esc(D.helped||'')}</textarea></div>
   <div class="ctrl"><label for="fb-conf">What was confusing or did not work? <span class="foot">(optional)</span></label><textarea id="fb-conf" rows="2">${esc(D.confusing||'')}</textarea></div>
   <div class="ctrl"><label for="fb-sug">One suggestion to improve this experiment <span class="foot">(optional)</span></label><textarea id="fb-sug" rows="2">${esc(D.suggest||'')}</textarea></div>
   <div class="btnrow"><button class="btn" type="button" id="fbsend">Submit feedback</button><span class="foot" id="fbmsg" aria-live="polite"></span></div></fieldset>`;}
function fbPayload(P,F){return {type:'feedback',version:VERSION,reportId:reportId(P),process:P.abbr,name:report.name.trim(),usn:report.usn.trim().toUpperCase(),section:report.sec,batch:report.batch,institution:report.inst,classCode:(report.code||'').trim(),
  q1:F.q1,q2:F.q2,q3:F.q3,q4:F.q4,q5:F.q5,q6:F.q6,time:F.time,device:F.device,helped:F.helped,confusing:F.confusing,suggest:F.suggest,clientTime:F.t};}
function fbBind(P){const box=$('#fbbox');if(!box)return;
  const ed=$('#fbedit');if(ed){ed.onclick=()=>{report.fbd=report.fbd||{};report.fbd[P.id]={...report.fb[P.id]};delete report.fb[P.id];save();renderReport(P);setTimeout(()=>{const b=$('#fbbox');b&&b.scrollIntoView({block:'start'});},0);};return;}
  const D=fbDraft(P.id);
  box.addEventListener('change',e=>{const t=e.target;if(t.name&&t.name.startsWith('fb-'))D[t.name.slice(3)]=+t.value;if(t.id==='fb-time')D.time=t.value;if(t.id==='fb-dev')D.device=t.value;save();});
  [['fb-help','helped'],['fb-conf','confusing'],['fb-sug','suggest']].forEach(([id,k])=>$('#'+id).oninput=e=>{D[k]=e.target.value;save();});
  $('#fbsend').onclick=async()=>{const m=$('#fbmsg');const miss=FBQ.filter(([k])=>!D[k]).map((x,i)=>FBQ.indexOf(x)+1);
    if(!report.name.trim()||!report.usn.trim()){m.innerHTML='<span class="bad">Enter your name and USN at the top of the form first.</span>';return;}
    if(miss.length){m.innerHTML=`<span class="bad">Rate every statement. Missing: ${miss.join(', ')}.</span>`;return;}
    if(!D.time||!D.device){m.innerHTML='<span class="bad">Choose the time spent and the device used.</span>';return;}
    if(!(D.helped||'').trim()||D.helped.trim().length<5){m.innerHTML='<span class="bad">Tell us briefly what helped you most.</span>';return;}
    const F={...D,t:new Date().toISOString(),sent:null};
    if(CFG.submitUrl){$('#fbsend').disabled=true;m.textContent='Sending…';let r=null;
      try{const x=await fetch(CFG.submitUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(fbPayload(P,F))});r=await x.json();}catch(e){r={unconfirmed:true};}
      $('#fbsend').disabled=false;
      if(r&&r.error==='class code'){m.innerHTML='<span class="bad">Class code not accepted.</span> Enter the class code your faculty gave you (below), then submit again.';return;}
      F.sent=!!(r&&(r.ok||r.unconfirmed));}
    else F.sent=false;
    report.fb[P.id]=F;delete report.fbd[P.id];save();renderReport(P);};}
function fbGate(P){const ok=!!report.fb[P.id];['rprint','rdl','rsub'].forEach(id=>{const b=$('#'+id);if(!b)return;if(!ok){b.disabled=true;b.title='Complete the feedback form first';}else if(id!=='rsub'||CFG.submitUrl){b.disabled=false;b.title='';}});
  const sh=$('#sheet');if(sh)sh.classList.toggle('fblocked',!ok);
  if(!ok){const r=$('#rmsg');if(r)r.textContent='Complete the feedback form above to unlock printing and download.';}}
const _renderReport5=renderReport;
renderReport=function(P){lsnStop();_renderReport5(P);const anchor=$('#rform .subbox')||$('#rform .btnrow.wide');if(anchor)anchor.insertAdjacentHTML('beforebegin',fbHTML(P));
  fbBind(P);fbGate(P);
  if(!report.fb[P.id]&&!$('#printlock'))$('#sheet').insertAdjacentHTML('beforebegin','<p class="printlock" id="printlock">This report cannot be printed until the feedback form is complete.</p>');};
const _sheetHTML5=sheetHTML;
sheetHTML=function(P){const F=report.fb[P.id];let h=_sheetHTML5(P);
  return h.replace('Simulation record for teaching.',F?`Student feedback recorded ${new Date(F.t).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}. Simulation record for teaching.`:'Simulation record for teaching.');};
const _submitPayload5=submitPayload;
submitPayload=function(P){const d=_submitPayload5(P);const F=report.fb[P.id];d.feedbackAt=F?F.t:'';return d;};
