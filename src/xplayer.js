// ================= v4.3: explainer player (Theory tab) =================
// Audio: audio/<id>/x<scene>_<line>.mp3 and audio/<id>/xq<scene>.mp3. Without audio files the player runs on captions and timers.
report.expl=report.expl||{};
const XP={pid:null,si:0,li:0,mode:'idle',lineT:0,last:0,voice:true,rate:1,tok:0,timer:null,xs:null,from:null,to:null,raf:0,noAudio:false};
const xAudio=new Audio();xAudio.preload='auto';if('preservesPitch' in xAudio)xAudio.preservesPitch=true;
const xEst=s=>(s.split(/\s+/).length/2.6+0.8)/XP.rate;
function xRes(id){const E=EXPL[id];const R=report.expl[id];const n=E.scenes.length;
  if(!R||!Array.isArray(R.first)||R.first.length!==n)return report.expl[id]={first:Array(n).fill(null),replays:Array(n).fill(0),done:false,t:null};return R;}
function xChecks(id){return EXPL[id].scenes.map((S,i)=>S.q?i:-1).filter(i=>i>=0);}
function xDur(id){let w=0;EXPL[id].scenes.forEach(S=>S.lines.forEach(l=>w+=l[0].split(/\s+/).length));return Math.round(w/2.6/60*10)/10;}
function xSummary(id){const R=xRes(id),Q=xChecks(id);const ans=Q.filter(i=>R.first[i]!==null);return {n:Q.length,answered:ans.length,right:ans.filter(i=>R.first[i]).length,replays:R.replays.reduce((a,b)=>a+b,0),done:R.done};}

function xCardHTML(P){const E=EXPL[P.id],S=xSummary(P.id);
  return `<section class="xcard" id="xcard" aria-label="Explainer">
   <div class="xhead"><div><div class="eyebrow">Watch &amp; check</div><h3>How ${esc(P.abbr)} works</h3><p class="foot" style="margin:2px 0 0">About ${Math.max(1,Math.round(xDur(P.id)))} min · ${E.scenes.length} short scenes · ${S.n} concept checks. A wrong answer replays the scene.</p></div>
   <div class="xstat" id="xstat">${S.answered?`${S.right} of ${S.answered} right first time`:''}</div></div>
   <div id="xbody"><button class="btn" type="button" id="xopen">▶ Watch explainer</button></div></section>`;}
function xOpen(P){const E=EXPL[P.id];XP.pid=P.id;
  $('#xbody').innerHTML=`<div class="xstage${E.custom?' custom':''}" id="xstage"><canvas id="xcv" role="img" aria-label="Animated explanation of ${esc(P.name)}"></canvas></div><div class="xread" id="xread" aria-live="off"></div>
   <div id="xbelow"><div class="caption xcap" id="xcap" aria-live="polite"></div></div>
   <div class="controls xctl"><button class="iconbtn" id="xplay" type="button">Pause</button><button class="iconbtn" id="xback" type="button">◀ Previous line</button><button class="iconbtn" id="xrep" type="button">↺ Replay scene</button><button class="iconbtn" id="xvoice" type="button" aria-pressed="${XP.voice}">${XP.voice?'Voice on':'Voice off'}</button>
   <label class="foot" for="xrate">Speed <select id="xrate"><option value="0.9">Slow</option><option value="1">Normal</option><option value="1.15">Fast</option></select></label><span class="foot" id="xnote" aria-live="polite"></span></div>
   <nav class="xchaps" id="xchaps" aria-label="Scenes"></nav>`;
  $('#xrate').value=String(XP.rate);
  $('#xplay').onclick=()=>{if(XP.mode==='play'){XP.mode='pause';clearTimeout(XP.timer);xAudio.pause();}else if(XP.mode==='pause'){XP.mode='play';if(XP.voice&&!XP.noAudio&&xAudio.src&&xAudio.currentTime>0&&!xAudio.ended)xAudio.play().catch(()=>xLine());else xLine();}xButtons();};
  $('#xback').onclick=()=>{if(XP.li>0)XP.li--;else if(XP.si>0){XP.si--;XP.li=EXPL[XP.pid].scenes[XP.si].lines.length-1;}xResume();};
  $('#xrep').onclick=()=>{if(XP.mode==='end')XP.si=EXPL[XP.pid].scenes.length-1;XP.li=0;xResume();};
  $('#xvoice').onclick=e=>{XP.voice=!XP.voice;e.target.setAttribute('aria-pressed',XP.voice);e.target.textContent=XP.voice?'Voice on':'Voice off';if(XP.mode==='play')xLine();};
  $('#xrate').onchange=e=>{XP.rate=+e.target.value;xAudio.playbackRate=XP.rate;};
  $('#xchaps').addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b)return;XP.si=+b.dataset.s;XP.li=0;xResume();});
  sizeCanvas($('#xcv'));XP.si=0;XP.li=0;XP.mode='play';xLine();xButtons();
  cancelAnimationFrame(XP.raf);XP.last=0;XP.raf=requestAnimationFrame(xFrame);}
function xStop(){XP.tok++;clearTimeout(XP.timer);try{xAudio.pause();}catch(e){}if(XP.mode!=='idle')XP.mode='pause';cancelAnimationFrame(XP.raf);}
function xResume(){XP.mode='play';const st=$('#xstage');if(st)st.classList.remove('dim');$('#xbelow').innerHTML='<div class="caption xcap" id="xcap" aria-live="polite"></div>';xLine();xButtons();}
function xState(upTo){// simulator state for schematic scenes: defaults + all earlier cues in this scene
  const P=byId[XP.pid],E=EXPL[XP.pid];const s=defaults(P.id);const L=E.scenes[XP.si].lines;for(let i=0;i<upTo;i++){const cu=L[i][1];if(cu&&cu.set)Object.assign(s,cu.set);}return s;}
function xPlayClip(src,done,ms){const tok=++XP.tok;clearTimeout(XP.timer);
  const fb=()=>{XP.timer=setTimeout(()=>{if(tok===XP.tok)done();},ms);};
  if(!XP.voice||XP.noAudio){fb();return;}
  xAudio.src=src;xAudio.playbackRate=XP.rate;
  xAudio.onended=()=>{if(tok===XP.tok)setTimeout(()=>{if(tok===XP.tok)done();},300);};
  xAudio.onerror=()=>{if(tok!==XP.tok)return;XP.noAudio=true;const n=$('#xnote');if(n)n.textContent='Narration is not available here yet; captions only.';fb();};
  xAudio.play().catch(err=>{if(tok!==XP.tok)return;if(err&&err.name==='NotAllowedError'){const n=$('#xnote');if(n)n.textContent='Audio was blocked. Press Pause, then Resume.';}fb();});}
function xLine(){const E=EXPL[XP.pid],S=E.scenes[XP.si],[say,cue]=S.lines[XP.li];
  const cap=$('#xcap');if(cap)cap.innerHTML=`<span class="who">Scene ${XP.si+1} · ${esc(S.title)}</span>${say}`;
  XP.lineT=0;if(!E.custom){XP.from=xState(XP.li);XP.to={...XP.from,...(cue&&cue.set||{})};XP.xs={...XP.from};}
  xPlayClip(`${AUDIO_BASE}${XP.pid}/x${XP.si}_${XP.li}.mp3`,()=>{if(XP.mode==='play')xNext();},xEst(say)*1000);xChaps();}
function xNext(){const E=EXPL[XP.pid],S=E.scenes[XP.si];if(XP.li<S.lines.length-1){XP.li++;xLine();return;}
  if(S.q){xAsk();return;}if(XP.si<E.scenes.length-1){XP.si++;XP.li=0;xLine();}else xFinish();}
function xAsk(){XP.tok++;clearTimeout(XP.timer);XP.mode='q';$('#xstage').classList.add('dim');const Q=EXPL[XP.pid].scenes[XP.si].q,R=xRes(XP.pid);const k=xChecks(XP.pid).indexOf(XP.si)+1;
  $('#xbelow').innerHTML=`<div class="qcard" role="group" aria-labelledby="xqh"><span class="tag">Check ${k} of ${xChecks(XP.pid).length}${R.first[XP.si]!==null?' · second look':''}</span><h4 id="xqh">${Q.q}</h4><div class="opts">${Q.o.map((o,i)=>`<button class="opt" type="button" data-i="${i}">${o}</button>`).join('')}</div><div class="fb" id="xfb" aria-live="polite"></div></div>`;
  xPlayClip(`${AUDIO_BASE}${XP.pid}/xq${XP.si}.mp3`,()=>{},100);
  document.querySelectorAll('#xbelow .opt').forEach(b=>b.onclick=()=>xAnswer(+b.dataset.i,b));xButtons();xChaps();}
function xAnswer(i,b){const Q=EXPL[XP.pid].scenes[XP.si].q,R=xRes(XP.pid);if(document.querySelector('#xbelow .opt.right'))return;XP.tok++;try{xAudio.pause();}catch(e){}
  const ok=i===Q.a;if(R.first[XP.si]===null){R.first[XP.si]=ok;}b.classList.add(ok?'right':'wrong');document.querySelectorAll('#xbelow .opt').forEach(x=>x.disabled=true);
  if(ok){$('#xfb').innerHTML=`<b class="ok">Correct.</b> ${Q.why}<div style="margin-top:10px"><button class="btn" id="xcont" type="button">Continue ▶</button></div>`;$('#xcont').onclick=()=>{const E=EXPL[XP.pid];if(XP.si<E.scenes.length-1){XP.si++;XP.li=0;xResume();}else xFinish();};$('#xcont').focus();}
  else{$('#xfb').innerHTML=`<b class="bad">Not quite.</b> Watch that part again; the answer is in it.<div style="margin-top:10px"><button class="btn" id="xrew" type="button">↺ Replay scene ${XP.si+1}</button></div>`;$('#xrew').onclick=()=>{R.replays[XP.si]++;save();XP.li=0;xResume();};$('#xrew').focus();}
  save();xStat();}
function xFinish(){XP.tok++;clearTimeout(XP.timer);XP.mode='end';const R=xRes(XP.pid);R.done=true;R.t=new Date().toISOString();save();const S=xSummary(XP.pid);
  $('#xbelow').innerHTML=`<div class="qcard"><span class="tag">Done</span><h4>${S.right} of ${S.n} checks right first time${S.replays?` · ${S.replays} scene replay${S.replays>1?'s':''}`:''}.</h4><p class="foot" style="margin:0">This result is included in your lab report. Use Replay scene or the scene strip to revisit any part.</p></div>`;xChaps();xButtons();xStat();}
function xButtons(){const p=$('#xplay');if(!p)return;p.disabled=XP.mode==='q'||XP.mode==='end';p.textContent=XP.mode==='pause'?'Resume':'Pause';$('#xback').disabled=!(XP.mode==='play'||XP.mode==='pause');}
function xChaps(){const E=EXPL[XP.pid],R=xRes(XP.pid);const el=$('#xchaps');if(!el)return;
  el.innerHTML=E.scenes.map((S,i)=>`<button class="xchap${i<XP.si||XP.mode==='end'?' done':''}${i===XP.si&&XP.mode!=='end'?' on':''}" type="button" data-s="${i}"><b>${i+1}</b> ${esc(S.title)}${S.q?` <span class="q">${R.first[i]===null?'· check':R.first[i]?'· ✓':'· ✗'}</span>`:''}</button>`).join('');}
function xStat(){const el=$('#xstat');if(!el)return;const S=xSummary(XP.pid);el.textContent=S.answered?`${S.right} of ${S.answered} right first time`:'';}
function xFrame(now){const cv=$('#xcv');if(!cv||!cv.isConnected){XP.mode=XP.mode==='idle'?'idle':'pause';return;}
  const dt=Math.min(0.05,(now-(XP.last||now))/1000);XP.last=now;if(XP.mode==='play')XP.lineT+=dt;
  const E=EXPL[XP.pid],P=byId[XP.pid],c=cv.getContext('2d');const L=E.scenes[XP.si].lines;const li=XP.mode==='q'||XP.mode==='end'?L.length-1:XP.li;const cue=L[li][1];
  const t=XP.lineT+(XP.mode==='q'?3:0);
  if(E.custom){c.setTransform(cv.width/EDMX.W,0,0,cv.height/EDMX.H,0,0);EDMX.draw(c,XP.si,cue,t);$('#xread').innerHTML='';}
  else{if(XP.mode!=='q'&&XP.mode!=='end'){const k=reduce?1:Math.min(1,XP.lineT/2.5),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      for(const key in XP.to){const a=XP.from[key],b=XP.to[key];XP.xs[key]=(typeof a==='number'&&typeof b==='number')?a+(b-a)*e:(k>0.4?b:a);}}
    const xs=XP.xs||defaults(P.id);const C=getC(now);c.setTransform(1,0,0,1,0,0);c.fillStyle=C.panel;c.fillRect(0,0,cv.width,cv.height);
    const s=Math.min(cv.width/640,cv.height/400),ox=(cv.width-640*s)/2,oy=(cv.height-400*s)/2;c.setTransform(s,0,0,s,ox,oy);
    const o=P.compute(xs).o;F=null;try{DRAW[P.id](c,C,reduce?1.5:now/1000,xs,o);}catch(e){}
    if(cue&&(cue.box||cue.ring)&&XP.mode==='play'){const a=Math.min(1,XP.lineT/0.6);c.save();c.globalAlpha=0.34*a;c.fillStyle='#0b1214';c.beginPath();c.rect(-ox/s,-oy/s,cv.width/s,cv.height/s);
      if(cue.box){const [x,y,w,h]=cue.box;c.rect(x+w,y,-w,h);}else{const [x,y,r]=cue.ring;c.moveTo(x+r,y);c.arc(x,y,r,0,Math.PI*2,true);}c.fill('evenodd');c.globalAlpha=a;
      c.strokeStyle=C.accent;c.lineWidth=2.5;const p=reduce?0:2*Math.sin(now/220);if(cue.box){const [x,y,w,h]=cue.box;c.strokeRect(x-p,y-p,w+2*p,h+2*p);}else{const [x,y,r]=cue.ring;c.beginPath();c.arc(x,y,r+p,0,7);c.stroke();}c.restore();}
    const keys=cue&&cue.show||[];$('#xread').innerHTML=keys.map(k=>{const O=P.outputs.find(z=>z.k===k);return O?`<div><span>${O.label}</span><b>${fmt(o[k])}</b> <small>${O.unit}</small></div>`:'';}).join('');}
  XP.raf=requestAnimationFrame(xFrame);}

// Theory tab: explainer card at the top, above the Listen bar
const _renderTheoryX=renderTheory;
renderTheory=function(P){xStop();_renderTheoryX(P);if(!EXPL[P.id])return;const pr=$('#pane .theory .prose');if(!pr)return;
  pr.insertAdjacentHTML('afterbegin',xCardHTML(P));XP.pid=P.id;XP.mode='idle';$('#xopen').onclick=()=>{lsnStop();xOpen(P);};
  const lb=$('#lsn');if(lb){const o=lb.onclick;lb.onclick=()=>{if(XP.mode==='play'){XP.mode='pause';XP.tok++;xAudio.pause();xButtons();}o();};}};
const _renderPaneX=renderPane;renderPane=function(P){if(tabOf[P.id]!=='th')xStop();_renderPaneX(P);};
window.addEventListener('hashchange',()=>xStop());

// Report and submission
const _sheetHTMLX=sheetHTML;
sheetHTML=function(P){let h=_sheetHTMLX(P);if(!EXPL[P.id])return h;const S=xSummary(P.id);
  const row=`<tr><td>Explainer concept checks</td><td>${S.answered?`${S.right} / ${S.n}${S.answered<S.n?` (${S.answered} answered)`:''}`:'—'}</td><td>${S.replays} scene replay${S.replays===1?'':'s'}</td></tr>`;
  return h.replace(/(<tr><td>Numericals \(this session\)<\/td>)/,row+'$1');};
const _submitPayloadX=submitPayload;
submitPayload=function(P){const d=_submitPayloadX(P);if(EXPL[P.id]){const S=xSummary(P.id);d.explRight=S.answered?S.right:'';d.explN=S.n;d.explReplays=S.replays;}return d;};
