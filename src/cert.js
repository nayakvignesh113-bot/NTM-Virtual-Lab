// ================= v4.4: certificates (approved by faculty in the Google Sheet) =================
// Optional config.js keys: certMinPost (post-test pass %, default 60), certInstitution, certDepartment, certFaculty.
const CERT={min:CFG.certMinPost??60,inst:CFG.certInstitution||'Mangalore Institute of Technology & Engineering (MITE), Moodbidri',
  dept:CFG.certDepartment||'Department of Mechanical Engineering',fac:CFG.certFaculty||'Dr. Vignesh Nayak Ullal',
  site:'https://nayakvignesh113-bot.github.io/NTM-Virtual-Lab/'};
report.cert=report.cert||{};
const certTok=()=>{const a=new Uint8Array(12);(window.crypto||{getRandomValues:x=>x.map(()=>Math.random()*256|0)}).getRandomValues(a);return [...a].map(b=>b.toString(16).padStart(2,'0')).join('');};
async function certGet(params){const u=CFG.submitUrl+'?'+new URLSearchParams(params).toString();const r=await fetch(u);return r.json();}
async function certPost(body){const r=await fetch(CFG.submitUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});return r.json();}

// ---- eligibility ----
function certElig(P){const post=score(P,'post');const pct=post.n?post.r/post.n*100:0;
  return [{ok:post.a===post.n&&post.n>0,t:'Post-test completed'},{ok:post.a===post.n&&pct>=CERT.min,t:`Post-test score at least ${CERT.min} % (now ${post.r}/${post.n}, ${pct.toFixed(0)} %)`},
    {ok:!!report.fb[P.id],t:'Feedback form submitted'},{ok:!!report.sub[P.id],t:'Report submitted to faculty'}];}

// ---- certificate drawing (A4 landscape, 1754 × 1240 px ≈ 150 dpi) ----
function certFit(c,txt,font,size,maxW){let s=size;do{c.font=font.replace('{s}',s);if(c.measureText(txt).width<=maxW)break;s-=2;}while(s>14);return s;}
function certSpaced(c,t,cx,y,sp){const al=c.textAlign;c.textAlign='left';const ws=[...t].map(ch=>c.measureText(ch).width);let x=cx-(ws.reduce((a,b)=>a+b,0)+sp*(ws.length-1))/2;[...t].forEach((ch,i)=>{c.fillText(ch,x,y);x+=ws[i]+sp;});c.textAlign=al;}
function drawCert(cv,d){const W=1754,H=1240;cv.width=W;cv.height=H;const c=cv.getContext('2d');
  const ink='#14201E',acc='#0B6A86',gold='#9A6B12',mut='#56635F';
  c.fillStyle='#FCFBF7';c.fillRect(0,0,W,H);
  // guilloche-like border pattern
  c.save();c.strokeStyle='rgba(11,106,134,0.10)';c.lineWidth=1;for(let i=0;i<60;i++){c.beginPath();c.ellipse(W/2,H/2,W/2-40-i*2,H/2-40-i*1.4,0,0,Math.PI*2);c.stroke();}c.restore();
  c.fillStyle='#FCFBF7';c.fillRect(120,110,W-240,H-220);
  c.strokeStyle=acc;c.lineWidth=8;c.strokeRect(46,46,W-92,H-92);c.strokeStyle=gold;c.lineWidth=2;c.strokeRect(70,70,W-140,H-140);c.strokeRect(80,80,W-160,H-160);
  [[70,70],[W-70,70],[70,H-70],[W-70,H-70]].forEach(([x,y])=>{c.fillStyle=gold;c.save();c.translate(x,y);c.rotate(Math.PI/4);c.fillRect(-11,-11,22,22);c.restore();});
  // watermark seal
  c.save();c.globalAlpha=0.06;c.fillStyle=acc;c.font='700 300px "Barlow Condensed",Arial Narrow,sans-serif';c.textAlign='center';c.textBaseline='middle';c.font='700 150px "Barlow Condensed",Arial Narrow,sans-serif';c.fillText('NON-TRADITIONAL',W/2,H/2-30);c.fillText('MACHINING',W/2,H/2+120);c.restore();
  c.textAlign='center';c.textBaseline='alphabetic';
  c.fillStyle=acc;c.font='600 24px "JetBrains Mono",monospace';certSpaced(c,'NON-TRADITIONAL MACHINING VIRTUAL LAB',W/2,185,5);
  c.fillStyle=ink;certFit(c,CERT.inst,'600 {s}px "Source Sans 3",Arial,sans-serif',34,1400);c.fillText(CERT.inst,W/2,238);
  c.fillStyle=mut;c.font='400 28px "Source Sans 3",Arial,sans-serif';c.fillText(CERT.dept,W/2,278);
  c.fillStyle=ink;c.font='700 108px "Barlow Condensed",Arial Narrow,sans-serif';c.fillText('Certificate of Completion',W/2,420);
  c.strokeStyle=gold;c.lineWidth=2;c.beginPath();c.moveTo(W/2-260,452);c.lineTo(W/2+260,452);c.stroke();
  c.fillStyle=mut;c.font='italic 400 32px "Source Sans 3",Georgia,serif';c.fillText('This is to certify that',W/2,525);
  c.fillStyle=ink;certFit(c,d.name,'700 {s}px "Barlow Condensed",Arial Narrow,sans-serif',86,1300);c.fillText(d.name,W/2,625);
  c.fillStyle=mut;c.font='500 28px "JetBrains Mono",monospace';c.fillText(`USN ${d.usn}${d.section?'   ·   '+d.section:''}`,W/2,680);
  c.fillStyle=ink;c.font='400 32px "Source Sans 3",Arial,sans-serif';c.fillText('has successfully completed the virtual laboratory experiment on',W/2,760);
  c.fillStyle=acc;certFit(c,d.processName,'700 {s}px "Source Sans 3",Arial,sans-serif',52,1400);c.fillText(d.processName,W/2,835);
  c.fillStyle=mut;c.font='400 28px "Source Sans 3",Arial,sans-serif';c.fillText(`(${d.process})  ·  theory, machine operation, experiment, numericals and post-test  ·  post-test score ${d.postScore}`,W/2,885);
  // footer: date, signature, ID
  const fy=1040;c.textAlign='left';c.fillStyle=ink;c.font='600 28px "Source Sans 3",Arial,sans-serif';c.fillText(d.approvedOn||'',210,fy-12);
  c.strokeStyle=ink;c.lineWidth=1.5;c.beginPath();c.moveTo(210,fy);c.lineTo(560,fy);c.stroke();c.fillStyle=mut;c.font='400 24px "Source Sans 3",Arial,sans-serif';c.fillText('Date of approval',210,fy+34);
  c.textAlign='right';c.fillStyle=ink;c.font='italic 600 34px Georgia,"Times New Roman",serif';c.fillText(CERT.fac,W-210,fy-12);
  c.beginPath();c.moveTo(W-600,fy);c.lineTo(W-210,fy);c.stroke();c.fillStyle=mut;c.font='400 24px "Source Sans 3",Arial,sans-serif';c.fillText('Faculty convener',W-210,fy+34);
  c.textAlign='center';c.fillStyle=mut;c.font='500 21px "JetBrains Mono",monospace';c.fillText(`Certificate ID ${d.certId}   ·   verify at ${CERT.site}#verify-${d.certId}`,W/2,1118);
  if(d.draft){c.save();c.translate(W/2,H/2);c.rotate(-Math.PI/7);c.textAlign='center';c.textBaseline='middle';certFit(c,'DRAFT — NOT APPROVED','800 {s}px "Barlow Condensed",Arial Narrow,sans-serif',150,1300);c.lineWidth=5;c.strokeStyle='rgba(180,35,24,0.55)';c.fillStyle='rgba(180,35,24,0.16)';c.fillText('DRAFT — NOT APPROVED',0,0);c.strokeText('DRAFT — NOT APPROVED',0,0);c.font='600 34px "Source Sans 3",Arial,sans-serif';c.fillStyle='rgba(180,35,24,0.75)';c.fillText('Not valid until approved by the faculty convener',0,120);c.restore();}
  return cv;}
async function certCanvas(d){try{await document.fonts.ready;}catch(e){}return drawCert(document.createElement('canvas'),d);}
// Minimal PDF writer: one full-page JPEG per A4-landscape page (no external library needed).
function pdfFromJpegs(imgs){const enc=new TextEncoder();const parts=[];let len=0;const offs=[];
  const put=x=>{const b=typeof x==='string'?enc.encode(x):x;parts.push(b);len+=b.length;};
  const obj=(n,body,stream)=>{offs[n]=len;put(`${n} 0 obj\n`);if(stream){put(body);put('stream\n');put(stream);put('\nendstream\n');}else put(body);put('endobj\n');};
  const W=841.89,H=595.28,n=imgs.length,pageIds=imgs.map((_,i)=>3+i*3);
  put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1,'<< /Type /Catalog /Pages 2 0 R >>\n');
  obj(2,`<< /Type /Pages /Count ${n} /Kids [${pageIds.map(id=>id+' 0 R').join(' ')}] >>\n`);
  imgs.forEach((im,i)=>{const pg=3+i*3,img=pg+1,ct=pg+2;const cs=`q ${W} 0 0 ${H} 0 0 cm /Im${i} Do Q`;
    obj(pg,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im${i} ${img} 0 R >> >> /Contents ${ct} 0 R >>\n`);
    obj(img,`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>\n`,im.bytes);
    obj(ct,`<< /Length ${cs.length} >>\n`,enc.encode(cs));});
  const total=3+n*3,xref=len;let x=`xref\n0 ${total}\n0000000000 65535 f \n`;for(let k=1;k<total;k++)x+=String(offs[k]).padStart(10,'0')+' 00000 n \n';
  put(x);put(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts,{type:'application/pdf'});}
const jpegBytes=cv=>{const b64=cv.toDataURL('image/jpeg',0.92).split(',')[1];const bin=atob(b64);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;};
function saveBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);}
const certFile=(d,ext)=>`Certificate-${d.process}-${String(d.usn).replace(/[^A-Za-z0-9]/g,'')}.${ext}`;
async function certPDF(list,name){const imgs=[];for(const d of list){const cv=await certCanvas(d);imgs.push({bytes:jpegBytes(cv),w:cv.width,h:cv.height});}saveBlob(pdfFromJpegs(imgs),name);}
async function certPNG(d){const cv=await certCanvas(d);cv.toBlob(b=>saveBlob(b,certFile(d,'png')),'image/png');}

// ---- student: certificate card on the Report tab ----
function certCardHTML(P){const E=certElig(P),ok=E.every(x=>x.ok),C=report.cert[P.id]||{};
  return `<div class="ctrl wide certcard" id="certbox"><h4>Certificate</h4>
   <ul class="certlist">${E.map(x=>`<li class="${x.ok?'ok':''}">${x.ok?'✓':'○'} ${x.t}</li>`).join('')}</ul>
   <div class="btnrow"><button class="btn" type="button" id="certreq"${ok&&CFG.submitUrl?'':' disabled'}>${C.certId?'Request again':'Request certificate'}</button>
   <button class="btn ghost" type="button" id="certchk"${C.certId&&CFG.submitUrl?'':' disabled'}>Check status</button></div>
   <p class="foot" id="certmsg" aria-live="polite">${!CFG.submitUrl?'Certificates need the faculty\'s Google Sheet, which is not connected to this copy of the lab.':C.status==='approved'?'Approved. Download below.':C.certId?`Requested (ID ${esc(C.certId)}). Your faculty must approve it before you can download it. Press Check status later.`:ok?'You can request your certificate. Your faculty will approve it.':'Complete the items above to request a certificate.'}</p>
   <div id="certview"></div></div>`;}
function certShow(P,d){const v=$('#certview');if(!v)return;
  v.innerHTML=`<canvas class="certprev" id="certcv" role="img" aria-label="Certificate of completion for ${esc(d.name)}"></canvas><div class="btnrow"><button class="btn" type="button" id="certpdf">Download PDF</button><button class="btn ghost" type="button" id="certpng">Download image (PNG)</button><span class="foot" id="certdl" aria-live="polite"></span></div>`;
  (async()=>{try{await document.fonts.ready;}catch(e){}drawCert($('#certcv'),d);})();
  $('#certpdf').onclick=async()=>{$('#certdl').textContent='Preparing PDF…';try{await certPDF([d],certFile(d,'pdf'));$('#certdl').textContent='Downloaded.';}catch(e){$('#certdl').textContent='Could not make the PDF; use the PNG button.';}};
  $('#certpng').onclick=()=>certPNG(d);}
function certBind(P){const C=report.cert[P.id]||(report.cert[P.id]={});const m=()=>$('#certmsg');
  if(C.status==='approved'&&C.cert)certShow(P,C.cert);
  const rq=$('#certreq');if(rq)rq.onclick=async()=>{if(!report.code.trim()){m().innerHTML='<span class="bad">Enter the class code above first.</span>';return;}
    rq.disabled=true;m().textContent='Sending request…';C.token=C.token||certTok();const post=score(P,'post');
    try{const r=await certPost({type:'certreq',classCode:report.code.trim(),name:report.name.trim(),usn:report.usn.trim().toUpperCase(),section:report.sec,process:P.abbr,processName:P.name,
        postScore:`${post.r}/${post.n} (${(post.r/post.n*100).toFixed(0)} %)`,reportId:reportId(P),token:C.token});
      if(r.ok){C.certId=r.certId;C.status=r.status;save();renderReport(P);setTimeout(()=>{const b=$('#certbox');b&&b.scrollIntoView({block:'nearest'});},0);return;}
      m().innerHTML=r.error==='class code'?'<span class="bad">Class code not accepted.</span>':`<span class="bad">Request failed: ${esc(r.error||'unknown')}</span>`;}
    catch(e){m().innerHTML='<span class="bad">Could not reach the faculty sheet.</span> Check your connection and try again.';}rq.disabled=false;};
  const ck=$('#certchk');if(ck)ck.onclick=async()=>{ck.disabled=true;m().textContent='Checking…';
    try{const r=await certGet({action:'status',usn:report.usn.trim().toUpperCase(),process:P.abbr,token:C.token||''});
      if(r.ok&&r.status==='approved'){C.status='approved';C.cert=r.cert;save();m().textContent='Approved. Download below.';certShow(P,r.cert);}
      else if(r.ok&&r.status==='pending'){C.status='pending';save();m().textContent=`Still waiting for approval (ID ${C.certId}). Check again later.`;}
      else if(r.ok&&r.status==='none'){m().textContent='No request found. Press Request certificate.';}
      else if(r.error==='token')m().innerHTML='<span class="bad">This request was made from another device or browser.</span> Press Request again to link it to this one.';
      else m().textContent='Could not check the status. Try again.';}
    catch(e){m().innerHTML='<span class="bad">Could not reach the faculty sheet.</span>';}ck.disabled=false;};}
const _renderReportC=renderReport;
renderReport=function(P){_renderReportC(P);const a=$('#rform .subbox');if(!a)return;a.insertAdjacentHTML('afterend',certCardHTML(P));certBind(P);};

// ---- faculty page (#faculty) ----
let FAC={rows:[],key:'',filter:'pending',q:'',arm:false};
try{FAC.key=sessionStorage.getItem('ntm-fac')||'';}catch(e){}
function renderFaculty(){current=null;FAC.view=FAC.view||'certs';
  $('#main').innerHTML=`<section><div class="eyebrow">Faculty</div><h1 style="font-size:clamp(32px,4vw,46px)">Certificates and reports</h1>
   <p class="lede">Approve certificate requests, issue certificates for students who never requested one, and download certificates and full lab reports.</p>
   ${CFG.submitUrl?`<form class="panel facform" id="facf" onsubmit="return false"><div class="ctrl"><label for="fkey">Faculty key</label><input id="fkey" type="password" autocomplete="current-password" value="${esc(FAC.key)}"></div><div class="btnrow"><button class="btn" type="submit">Load</button><span class="foot" id="fmsg" aria-live="polite"></span></div></form>
   <div class="factabs" role="tablist"><button type="button" role="tab" data-v="certs" aria-selected="${FAC.view==='certs'}">Certificate requests</button><button type="button" role="tab" data-v="subs" aria-selected="${FAC.view==='subs'}">Submissions &amp; reports</button></div>
   <div id="ftable"></div>`:'<p class="bad">The Google Sheet is not connected (config.js has no submitUrl).</p>'}</section>`;
  const f=$('#facf');if(!f)return;f.onsubmit=()=>{FAC.key=$('#fkey').value.trim();try{sessionStorage.setItem('ntm-fac',FAC.key);}catch(e){}facLoad();return false;};
  document.querySelectorAll('.factabs [data-v]').forEach(b=>b.onclick=()=>{FAC.view=b.dataset.v;FAC.arm=false;document.querySelectorAll('.factabs [data-v]').forEach(x=>x.setAttribute('aria-selected',x===b));facLoad();});
  if(FAC.key)facLoad();}
async function facLoad(){const m=$('#fmsg');m.textContent='Loading…';if(FAC.view==='subs')return subsLoad();
  try{const r=await certGet({action:'list',key:FAC.key});if(!r.ok){m.innerHTML=r.error==='faculty key'?'<span class="bad">Faculty key not accepted.</span> Check the FACULTY_KEY script property.':'<span class="bad">'+esc(r.error)+'</span>';$('#ftable').innerHTML='';return;}
    FAC.rows=r.rows;m.textContent=`${r.rows.length} request${r.rows.length===1?'':'s'} · ${r.rows.filter(x=>!x.approved).length} pending`;facTable();}
  catch(e){m.innerHTML='<span class="bad">Could not reach the Google Sheet.</span>';}}
function facTable(){const q=FAC.q.toLowerCase();const rows=FAC.rows.filter(r=>(FAC.filter==='all'||(FAC.filter==='pending')!==r.approved)&&(!q||(r.name+' '+r.usn+' '+r.process).toLowerCase().includes(q)));
  const pend=rows.filter(r=>!r.approved),appr=rows.filter(r=>r.approved);
  $('#ftable').innerHTML=`<div class="sel facbar"><label for="ffil">Show</label><select id="ffil">${[['pending','Pending'],['approved','Approved'],['all','All']].map(([v,l])=>`<option value="${v}"${FAC.filter===v?' selected':''}>${l}</option>`).join('')}</select>
    <label for="fq">Search</label><input id="fq" value="${esc(FAC.q)}" placeholder="Name, USN or process">
    <span class="btnrow">${pend.length?`<button class="btn" type="button" id="fapall">${FAC.arm?`Confirm: approve ${pend.length}`:`Approve all ${pend.length} shown`}</button>`:''}${appr.length?`<button class="btn ghost" type="button" id="fdlall">Download ${appr.length} certificate${appr.length>1?'s':''} (one PDF)</button>`:''}<button class="iconbtn" type="button" id="frel">Refresh</button></span></div>
   <div class="tablewrap" style="max-height:none"><table class="lib"><thead><tr><th>Requested</th><th>Name</th><th>USN</th><th>Process</th><th>Post-test</th><th>Status</th><th></th></tr></thead><tbody>
   ${rows.length?rows.map(r=>`<tr><td>${esc(r.requested)}</td><td>${esc(r.name)}</td><td class="mono">${esc(r.usn)}</td><td>${esc(r.process)}</td><td>${esc(r.postScore)}</td><td>${r.approved?`<span class="ok">Approved ${esc(r.approvedOn)}</span>`:'<span class="muted">Pending</span>'}</td>
    <td><span class="btnrow">${r.approved?`<button class="iconbtn" data-dl="${esc(r.certId)}" type="button">PDF</button><button class="iconbtn" data-ln="${esc(r.certId)}" type="button">Copy link</button><button class="iconbtn" data-rv="${esc(r.certId)}" type="button">Revoke</button>`:`<button class="iconbtn" data-ap="${esc(r.certId)}" type="button">Approve</button><button class="iconbtn" data-pv="${esc(r.certId)}" type="button">Preview</button><button class="iconbtn" data-dr="${esc(r.certId)}" type="button">Draft PDF</button>`}</span></td></tr>`).join(''):'<tr><td colspan="7" class="muted">Nothing to show.</td></tr>'}
   </tbody></table></div><div id="fprev"></div>`;
  $('#ffil').onchange=e=>{FAC.filter=e.target.value;FAC.arm=false;facTable();};
  $('#fq').oninput=e=>{FAC.q=e.target.value;FAC.arm=false;const p=e.target.selectionStart;facTable();const i=$('#fq');i.focus();i.setSelectionRange(p,p);};
  $('#frel').onclick=()=>facLoad();
  const aa=$('#fapall');if(aa)aa.onclick=()=>{if(!FAC.arm){FAC.arm=true;facTable();return;}FAC.arm=false;facSet('approve',pend.map(r=>r.certId));};
  const da=$('#fdlall');if(da)da.onclick=async()=>{da.disabled=true;da.textContent='Preparing…';try{await certPDF(appr,`Certificates-${new Date().toISOString().slice(0,10)}.pdf`);}catch(e){$('#fmsg').textContent='Could not make the PDF.';}facTable();};
  $('#ftable').querySelectorAll('[data-ap]').forEach(b=>b.onclick=()=>facSet('approve',[b.dataset.ap]));
  $('#ftable').querySelectorAll('[data-ln]').forEach(b=>b.onclick=()=>{const u=CERT.site+'#verify-'+b.dataset.ln;const ok=()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy link',1500);};
    try{navigator.clipboard.writeText(u).then(ok,()=>{$('#fmsg').textContent=u;});}catch(e){$('#fmsg').textContent=u;}});
  $('#ftable').querySelectorAll('[data-rv]').forEach(b=>b.onclick=()=>facSet('revoke',[b.dataset.rv]));
  $('#ftable').querySelectorAll('[data-dl]').forEach(b=>b.onclick=async()=>{const r=FAC.rows.find(x=>x.certId===b.dataset.dl);try{await certPDF([r],certFile(r,'pdf'));}catch(e){certPNG(r);}});
  $('#ftable').querySelectorAll('[data-dr]').forEach(b=>b.onclick=async()=>{const r=FAC.rows.find(x=>x.certId===b.dataset.dr);await certPDF([{...r,approvedOn:'(pending approval)',draft:true}],certFile(r,'pdf').replace('Certificate-','DRAFT-Certificate-'));});
  $('#ftable').querySelectorAll('[data-pv]').forEach(b=>b.onclick=async()=>{const r=FAC.rows.find(x=>x.certId===b.dataset.pv);const d={...r,approvedOn:'(pending approval)',draft:true};
    $('#fprev').innerHTML=`<h3>Preview: ${esc(r.name)}</h3><canvas class="certprev" id="fpcv" role="img" aria-label="Certificate preview"></canvas>`;try{await document.fonts.ready;}catch(e){}drawCert($('#fpcv'),d);$('#fprev').scrollIntoView({block:'nearest'});});}
async function facSet(action,ids){const m=$('#fmsg');m.textContent=action==='approve'?'Approving…':'Revoking…';
  try{const r=await certPost({action,key:FAC.key,certIds:ids});if(!r.ok){m.innerHTML='<span class="bad">'+esc(r.error)+'</span>';return;}await facLoad();}
  catch(e){m.innerHTML='<span class="bad">Could not reach the Google Sheet.</span>';}}

// ---- public verification page (#verify-ID) ----
async function renderVerify(id){current=null;
  $('#main').innerHTML=`<section><div class="eyebrow">Certificate verification</div><h1 style="font-size:clamp(30px,4vw,44px)">${esc(id)}</h1><div class="card" id="vres"><p class="muted">Checking…</p></div></section>`;
  if(!CFG.submitUrl){$('#vres').innerHTML='<p class="bad">Verification is not available on this copy of the lab.</p>';return;}
  try{const r=await certGet({action:'verify',id});const v=$('#vres');if(!v)return;
    v.innerHTML=r.valid?`<p class="ok" style="font-size:20px;margin:0 0 8px"><b>✓ Valid certificate</b></p><dl class="sh-meta"><dt>Name</dt><dd>${esc(r.cert.name)}</dd><dt>USN</dt><dd>${esc(r.cert.usn)}</dd><dt>Experiment</dt><dd>${esc(r.cert.processName)} (${esc(r.cert.process)})</dd><dt>Post-test</dt><dd>${esc(r.cert.postScore)}</dd><dt>Approved</dt><dd>${esc(r.cert.approvedOn)}</dd></dl><p class="foot">Issued by ${esc(CERT.fac)}, ${esc(CERT.dept)}, ${esc(CERT.inst)}.</p><div class="btnrow"><button class="btn" type="button" id="vpdf">Download certificate (PDF)</button><button class="btn ghost" type="button" id="vpng">Download image (PNG)</button><span class="foot" id="vmsg" aria-live="polite"></span></div>`
      :`<p class="bad" style="font-size:20px;margin:0"><b>✗ Not a valid certificate</b></p><p class="foot">${r.reason==='not approved'?'This ID exists but has not been approved, or approval was withdrawn.':'No certificate with this ID was issued.'}</p>`;
    if(r.valid){$('#vpdf').onclick=async()=>{$('#vmsg').textContent='Preparing PDF…';try{await certPDF([r.cert],certFile(r.cert,'pdf'));$('#vmsg').textContent='Downloaded.';}catch(e){$('#vmsg').textContent='Could not make the PDF; use the PNG button.';}};$('#vpng').onclick=()=>certPNG(r.cert);}}
  catch(e){$('#vres').innerHTML='<p class="bad">Could not reach the verification service. Try again later.</p>';}}
const _routeC=route;
route=function(){const h=(location.hash||'').slice(1);
  if(h==='faculty'){renderFaculty();markRail('none');window.scrollTo(0,0);return;}
  if(h.startsWith('verify-')){renderVerify(decodeURIComponent(h.slice(7)));markRail('none');window.scrollTo(0,0);return;}
  _routeC();};

// ---- faculty: submissions, full reports, issuing without a request ----
FAC.subs=[];FAC.sq='';FAC.sfil='all';
async function subsLoad(){const m=$('#fmsg');
  try{const r=await certPost({action:'subs',key:FAC.key});if(!r.ok){m.innerHTML=r.error==='faculty key'?'<span class="bad">Faculty key not accepted.</span> Check the FACULTY_KEY script property.':'<span class="bad">'+esc(r.error)+'</span> (Update Code.gs to the latest version and deploy a new version.)';$('#ftable').innerHTML='';return;}
    FAC.subs=r.rows.sort((a,b)=>String(a.usn).localeCompare(String(b.usn)));m.textContent=`${r.rows.length} submission${r.rows.length===1?'':'s'} (latest per student and process) · ${r.rows.filter(x=>x.hasReport).length} with full report`;subsTable();}
  catch(e){m.innerHTML='<span class="bad">Could not reach the Google Sheet.</span>';}}
function subsTable(){const q=FAC.sq.toLowerCase();
  const rows=FAC.subs.filter(r=>(FAC.sfil==='all'||(FAC.sfil==='nocert'&&r.cert==='none')||(FAC.sfil==='report'&&r.hasReport))&&(!q||(r.name+' '+r.usn+' '+r.process).toLowerCase().includes(q)));
  const withRep=rows.filter(r=>r.hasReport);
  $('#ftable').innerHTML=`<div class="sel facbar"><label for="sfil">Show</label><select id="sfil">${[['all','All submissions'],['nocert','Without certificate'],['report','With full report']].map(([v,l])=>`<option value="${v}"${FAC.sfil===v?' selected':''}>${l}</option>`).join('')}</select>
    <label for="sq">Search</label><input id="sq" value="${esc(FAC.sq)}" placeholder="Name, USN or process">
    <span class="btnrow">${withRep.length?`<button class="btn ghost" type="button" id="srepall">Download ${withRep.length} report${withRep.length>1?'s':''} (one file)</button>`:''}<button class="iconbtn" type="button" id="srel">Refresh</button></span></div>
   <div class="tablewrap" style="max-height:none"><table class="lib"><thead><tr><th>Submitted</th><th>Name</th><th>USN</th><th>Process</th><th>Post-test</th><th>Report</th><th>Certificate</th></tr></thead><tbody>
   ${rows.length?rows.map((r,k)=>`<tr><td>${esc(r.received)}</td><td>${esc(r.name)}</td><td class="mono">${esc(r.usn)}</td><td>${esc(r.process)}</td><td>${esc(r.post)}</td>
     <td>${r.hasReport?`<button class="iconbtn" data-rep="${k}" type="button">Download</button>`:'<span class="muted" title="Submitted before reports were stored, or not saved">Summary only</span>'}</td>
     <td>${r.cert==='approved'?'<span class="ok">Issued</span>':r.cert==='pending'?`<button class="iconbtn" data-apc="${esc(r.certId)}" type="button">Approve request</button>`:`<button class="iconbtn" data-iss="${k}" type="button">Issue certificate</button>`}</td></tr>`).join(''):'<tr><td colspan="7" class="muted">Nothing to show.</td></tr>'}
   </tbody></table></div><p class="foot">"Issue certificate" creates an approved certificate from the student's submission, even if they never requested one. Then send them the link from the Certificate requests view (Copy link); they can download it on any computer.</p>`;
  $('#sfil').onchange=e=>{FAC.sfil=e.target.value;subsTable();};
  $('#sq').oninput=e=>{FAC.sq=e.target.value;const p=e.target.selectionStart;subsTable();const i=$('#sq');i.focus();i.setSelectionRange(p,p);};
  $('#srel').onclick=()=>subsLoad();
  $('#ftable').querySelectorAll('[data-rep]').forEach(b=>b.onclick=async()=>{const r=rows[+b.dataset.rep];b.disabled=true;b.textContent='…';
    try{const x=await certPost({action:'report',key:FAC.key,reportId:r.reportId});if(!x.ok)throw new Error(x.error);saveBlob(new Blob([x.html],{type:'text/html'}),`${r.reportId}-${r.usn}.html`);b.textContent='Download';}
    catch(e){b.textContent='Failed';$('#fmsg').textContent='Could not fetch that report: '+(e.message||'');}b.disabled=false;});
  $('#ftable').querySelectorAll('[data-iss]').forEach(b=>b.onclick=async()=>{const r=rows[+b.dataset.iss];const P=PROCESSES.find(p=>p.abbr===r.process);b.disabled=true;b.textContent='Issuing…';
    try{const x=await certPost({action:'issue',key:FAC.key,usn:r.usn,process:r.process,processName:P?P.name:r.process});if(!x.ok)throw new Error(x.error);await subsLoad();}
    catch(e){b.disabled=false;b.textContent='Issue certificate';$('#fmsg').textContent='Could not issue: '+(e.message||'');}});
  $('#ftable').querySelectorAll('[data-apc]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{const x=await certPost({action:'approve',key:FAC.key,certIds:[b.dataset.apc]});if(!x.ok)throw new Error(x.error);await subsLoad();}catch(e){b.disabled=false;$('#fmsg').textContent='Could not approve.';}});
  const ra=$('#srepall');if(ra)ra.onclick=async()=>{ra.disabled=true;let css='',parts=[],n=0;
    for(const r of withRep){ra.textContent=`Fetching ${++n} of ${withRep.length}…`;
      try{const x=await certPost({action:'report',key:FAC.key,reportId:r.reportId});if(!x.ok)continue;const doc=new DOMParser().parseFromString(x.html,'text/html');
        if(!css){const st=doc.querySelector('style');css=st?st.textContent:'';}const mn=doc.querySelector('main');parts.push(`<div class="rpage">${mn?mn.innerHTML:doc.body.innerHTML}</div>`);}catch(e){}}
    const html=`<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NTM lab reports (${parts.length})</title><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Source+Sans+3:wght@400;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"><style>${css}
.rpage{padding:24px;max-width:960px;margin:0 auto 32px}@media print{.rpage{break-after:page;padding:0;margin:0}}</style></head><body style="background:#fff">${parts.join('')}</body></html>`;
    saveBlob(new Blob([html],{type:'text/html'}),`NTM-lab-reports-${new Date().toISOString().slice(0,10)}.html`);subsTable();};}

// ---- the full report goes to the faculty's Drive with each submission ----
function reportDoc(P){const css=[...document.querySelectorAll('style')].map(s=>s.textContent).join('\n');const id=reportId(P);
  return `<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${id} · ${esc(P.name)}</title><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Source+Sans+3:wght@400;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"><style>${css}</style></head><body style="background:#fff"><main style="padding:24px;max-width:960px;margin:0 auto"><section class="sheet">${sheetHTML(P)}</section></main></body></html>`;}
const _submitPayloadR=submitPayload;
submitPayload=function(P){const d=_submitPayloadR(P);try{d.reportHtml=reportDoc(P);}catch(e){}return d;};
