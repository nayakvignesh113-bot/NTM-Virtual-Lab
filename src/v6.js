// ================= v4.3: numericals with graded hints =================
renderNum=function(P){
  const S=numS[P.id]||(numS[P.id]={cur:NUM[P.id](),done:false,tried:0,solved:0,attempted:0,hintN:0,withHints:0,hintsTotal:0});
  if(S.hintN==null){S.hintN=0;S.withHints=S.withHints||0;S.hintsTotal=S.hintsTotal||0;}
  const c=S.cur,H=c.hints||[];
  $('#pane').innerHTML=`<div class="quiz"><p class="aim"><b>Numerical problems.</b> ${NUM_TYPES[P.id].length} problem types, each with fresh random values. Answers within ±2 % are accepted. Stuck? Open a hint; hints used are noted in your report.</p>
  <div class="score"><span>This session: ${S.solved} solved of ${S.attempted} attempted${S.withHints?` · ${S.withHints} with hints`:''}</span></div>
  <div class="card numcard"><p class="numq">${c.q}</p>
  <div class="hints" id="nhints">${H.slice(0,S.hintN).map((h,i)=>`<div class="hint"><b>Hint ${i+1}.</b> ${h}</div>`).join('')}</div>
  <form id="nform" class="numrow" onsubmit="return false"><label for="nans" class="sr">Your answer in ${c.unit}</label><input id="nans" inputmode="decimal" autocomplete="off" placeholder="Your answer" ${S.done?'disabled':''}><span class="mono">${c.unit}</span>
  <button class="btn" type="submit" ${S.done?'disabled':''}>Check</button>
  ${!S.done&&S.hintN<H.length?`<button class="btn ghost" type="button" id="nhint">Hint ${S.hintN+1} of ${H.length}</button>`:''}
  <button class="btn ghost" type="button" id="nshow">${S.done?'New problem':'Show solution'}</button></form>
  <div id="nfb" aria-live="polite">${S.done?S.fb:''}</div></div></div>`;
  const sol=`<div class="why"><b>Solution.</b> ${c.sol}</div>`;
  const hb=$('#nhint');if(hb)hb.onclick=()=>{S.hintN++;S.hintsTotal++;const v=$('#nans').value;renderNum(P);$('#nans').value=v;$('#nans').focus();};
  $('#nform').onsubmit=()=>{const v=parseFloat($('#nans').value.replace(/,/g,''));if(!isFinite(v)){$('#nfb').innerHTML='<div class="why">Enter a number.</div>';return false;}
    S.tried++;const ok=c.ans===0?Math.abs(v)<1e-9:Math.abs(v/c.ans-1)<=0.02;
    if(ok){S.solved++;S.attempted++;if(S.hintN)S.withHints++;S.done=true;S.fb=`<div class="why"><b class="ok">Correct${S.hintN?` (with ${S.hintN} hint${S.hintN>1?'s':''})`:''}.</b> Exact answer ${fmt(c.ans)} ${c.unit}.</div>`+sol;renderNum(P);}
    else{$('#nfb').innerHTML=`<div class="why"><b class="bad">Not yet.</b> Your answer is ${((v/c.ans-1)*100).toFixed(0)} % ${v>c.ans?'high':'low'}. Check units${S.hintN<H.length?', or open a hint':''}.</div>`;}
    return false;};
  $('#nshow').onclick=()=>{if(S.done){numS[P.id]={cur:NUM[P.id](),done:false,tried:0,solved:S.solved,attempted:S.attempted,hintN:0,withHints:S.withHints,hintsTotal:S.hintsTotal};renderNum(P);return;}
    S.attempted++;S.done=true;S.fb=`<div class="why">Answer: <b>${fmt(c.ans)} ${c.unit}</b>.</div>`+sol;renderNum(P);};
};
// report + submission: note hint use
const _sheetHTML6=sheetHTML;
sheetHTML=function(P){const N=numS[P.id];let h=_sheetHTML6(P);
  if(N&&N.withHints)h=h.replace(`${N.solved} solved of ${N.attempted}`,`${N.solved} solved of ${N.attempted} (${N.withHints} with hints)`);return h;};
const _submitPayload6=submitPayload;
submitPayload=function(P){const d=_submitPayload6(P);const N=numS[P.id];d.numWithHints=N?N.withHints||0:0;return d;};
