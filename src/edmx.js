// EDM close-up animation (800×450), ported from the explainer sample
const EDMX=(function(){
// ---------------- canvas drawing ----------------
let c=null;
const W=800,H=450;const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const COL={ink:'#DDE7E5',muted:'#8FA3A0',fluid:'rgba(64,140,190,0.20)',fluidLine:'#3E86B4',steel:'#7D8B92',steelD:'#56636A',cu:'#C67A3E',cuD:'#8E5226',spark:'#FFF6C8',glow:'#FFB020',plasma:'#FF8A3D',melt:'#FF6A2F',meltT:'#FF9B6B',accent:'#4BB0CC',ok:'#6CC594',bad:'#F97066',grid:'rgba(221,231,229,0.08)'};
function txt(s,x,y,o={}){c.font=`${o.w||400} ${o.s||13}px ${o.mono?'"JetBrains Mono",monospace':'"Atkinson Hyperlegible",sans-serif'}`;c.fillStyle=o.c||COL.ink;c.textAlign=o.a||'left';c.textBaseline=o.b||'alphabetic';c.fillText(s,x,y);}
function arrow(x1,y1,x2,y2,col,w=1.5){c.strokeStyle=col;c.fillStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();const a=Math.atan2(y2-y1,x2-x1);c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-8*Math.cos(a-.4),y2-8*Math.sin(a-.4));c.lineTo(x2-8*Math.cos(a+.4),y2-8*Math.sin(a+.4));c.closePath();c.fill();}
function leader(x,y,tx,ty,label,col=COL.ink){c.strokeStyle=COL.muted;c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();c.fillStyle=COL.muted;c.beginPath();c.arc(x,y,2.5,0,7);c.fill();txt(label,tx+(tx>x?6:-6),ty+4,{a:tx>x?'left':'right',c:col,s:13.5,w:700});}
function zigzag(x1,y1,x2,y2,amp,n){c.beginPath();c.moveTo(x1,y1);for(let i=1;i<n;i++){const f=i/n;c.lineTo(x1+(x2-x1)*f+(Math.random()-.5)*amp,y1+(y2-y1)*f);}c.lineTo(x2,y2);c.stroke();}
function glowLine(fn,w,col,blur){c.save();c.shadowColor=COL.glow;c.shadowBlur=blur;c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';fn();c.restore();}
function bg(){c.fillStyle='#0C1416';c.fillRect(0,0,W,H);c.strokeStyle=COL.grid;c.lineWidth=1;for(let x=0;x<=W;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}for(let y=0;y<=H;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}}
function badge(s){c.font='400 11px "JetBrains Mono",monospace';const w=c.measureText(s).width+14;c.fillStyle='rgba(12,20,22,0.8)';c.fillRect(W-w-8,H-28,w,20);txt(s,W-15,H-14,{a:'right',mono:true,s:11,c:COL.muted});}

// --- full machine view
function fullView(ph,t){
  const tankX=250,tankY=190,tankW=440,tankH=225,lvl=225;
  // generator
  c.fillStyle='#16242A';c.strokeStyle=COL.muted;c.lineWidth=1.2;c.fillRect(30,150,150,92);c.strokeRect(30,150,150,92);
  txt('Pulse',105,180,{a:'center',w:700,s:15});txt('generator',105,198,{a:'center',w:700,s:15});
  const pulseOn=(t*6)%1<0.55;c.fillStyle=pulseOn?COL.glow:'#3a2a10';c.beginPath();c.arc(105,222,6,0,7);c.fill();
  // tank + fluid
  c.strokeStyle=COL.muted;c.lineWidth=2;c.beginPath();c.moveTo(tankX,tankY);c.lineTo(tankX,tankY+tankH);c.lineTo(tankX+tankW,tankY+tankH);c.lineTo(tankX+tankW,tankY);c.stroke();
  c.fillStyle=COL.fluid;c.fillRect(tankX+1,lvl,tankW-2,tankY+tankH-lvl-1);
  c.strokeStyle=COL.fluidLine;c.lineWidth=1.5;c.beginPath();for(let x=tankX;x<=tankX+tankW;x+=4)c.lineTo(x,lvl+Math.sin(x/18+t*2)*1.5);c.stroke();
  // workpiece
  const wx=345,wy=330,ww=250,wh=80;
  c.fillStyle=COL.steel;c.fillRect(wx,wy,ww,wh);c.fillStyle=COL.steelD;c.fillRect(wx,wy+wh-8,ww,8);
  // cavity (scene 5)
  let cav=0;if(ph==='cavity'||ph==='end')cav=1;else if(ph==='feed')cav=Math.min(1,t/6)*0.8;
  const toolW=80,tx=470-toolW/2;
  const depth=46*cav,over=4;
  if(cav>0){c.fillStyle='#0C1416';c.fillRect(tx-over,wy,toolW+2*over,depth);c.fillStyle=COL.fluid;c.fillRect(tx-over,wy,toolW+2*over,depth);
    c.strokeStyle='#B9C4C9';c.lineWidth=1;c.strokeRect(tx-over,wy,toolW+2*over,depth);}
  // tool + ram
  const gapPx=6;const toolBottom=wy-gapPx+depth;
  c.fillStyle='#2A3A40';c.fillRect(440,40,60,30);c.strokeStyle=COL.muted;c.strokeRect(440,40,60,30);txt('Servo',470,60,{a:'center',s:12,w:700});
  c.fillStyle='#4A5A60';c.fillRect(460,70,20,toolBottom-70-90);
  const ty0=toolBottom-90;c.fillStyle=COL.cu;
  if(ph==='wear'||ph==='feed'||ph==='cavity'||ph==='end'){const r=ph==='wear'?Math.min(1,t/3)*7:7;c.beginPath();c.moveTo(tx,ty0);c.lineTo(tx+toolW,ty0);c.lineTo(tx+toolW,toolBottom-r);c.quadraticCurveTo(tx+toolW,toolBottom,tx+toolW-r,toolBottom);c.lineTo(tx+r,toolBottom);c.quadraticCurveTo(tx,toolBottom,tx,toolBottom-r);c.closePath();c.fill();}
  else c.fillRect(tx,ty0,toolW,90);
  c.fillStyle=COL.cuD;c.fillRect(tx,ty0,toolW,6);
  // wires
  c.strokeStyle=COL.muted;c.lineWidth=1.5;c.beginPath();c.moveTo(180,170);c.lineTo(400,170);c.lineTo(400,ty0+20);c.lineTo(tx,ty0+20);c.stroke();
  c.beginPath();c.moveTo(180,225);c.lineTo(215,225);c.lineTo(215,395);c.lineTo(wx,395);c.stroke();
  // sparks
  if(ph!=='glass'&&pulseOn&&!RM||(RM&&ph!=='glass')){const sx=tx+8+((Math.floor(t*6)*37)%(toolW-16));glowLine(()=>zigzag(sx,toolBottom,sx,toolBottom+gapPx,4,3),1.6,COL.spark,10);}
  // feed arrow
  if(ph==='feed'){arrow(530,90,530,90+22+Math.sin(t*3)*3,COL.accent,2);txt('feed',540,108,{c:COL.accent,s:13,w:700});}
  // labels
  if(ph==='parts'){const k=Math.min(1,t/1.2);c.globalAlpha=k;leader(tx+toolW,ty0+40,640,150,'Tool electrode (Cu / graphite)',COL.cu);leader(wx+ww-30,wy+40,660,300,'Workpiece',COL.ink);leader(tankX+40,lvl+50,150,320,'Dielectric fluid',COL.accent);c.globalAlpha=1;}
  if(ph==='intro'){txt('No contact. No cutting force.',W/2,130,{a:'center',s:17,w:700,c:COL.accent});}
  if(ph==='gap'){// magnifier
    const mx=640,my=150,R=70;c.strokeStyle=COL.accent;c.lineWidth=1.5;c.beginPath();c.moveTo(tx+toolW,toolBottom);c.lineTo(mx-R*0.7,my+R*0.7);c.stroke();
    c.save();c.beginPath();c.arc(mx,my,R,0,7);c.clip();c.fillStyle='#0C1416';c.fillRect(mx-R,my-R,2*R,2*R);c.fillStyle=COL.fluid;c.fillRect(mx-R,my-R,2*R,2*R);
    c.fillStyle=COL.cu;c.fillRect(mx-R,my-R,2*R,R-14);c.fillStyle=COL.steel;c.fillRect(mx-R,my+14,2*R,R);c.restore();
    c.strokeStyle=COL.accent;c.lineWidth=2;c.beginPath();c.arc(mx,my,R,0,7);c.stroke();
    arrow(mx+30,my-26,mx+30,my-14,COL.ink,1.2);arrow(mx+30,my+26,mx+30,my+14,COL.ink,1.2);txt('10–50 µm',mx-10,my+5,{a:'center',mono:true,s:12,w:600});
    txt('gap',mx,my-R-8,{a:'center',s:13,w:700,c:COL.accent});}
  if(ph==='glass'){const gx=70,gy=300;c.fillStyle='rgba(170,220,235,0.35)';c.strokeStyle='#BFE6F0';c.lineWidth=1.5;c.fillRect(gx,gy,120,50);c.strokeRect(gx,gy,120,50);txt('Glass',gx+60,gy+30,{a:'center',w:700});
    const k=Math.min(1,t/1.5);c.strokeStyle=COL.bad;c.lineWidth=4;c.globalAlpha=k;c.beginPath();c.moveTo(gx-6,gy-6);c.lineTo(gx+126,gy+56);c.moveTo(gx+126,gy-6);c.lineTo(gx-6,gy+56);c.stroke();c.globalAlpha=1;
    txt('No current, no spark',gx+60,gy+80,{a:'center',c:COL.bad,w:700});txt('Steel, carbide, titanium: OK',470,440,{a:'center',c:COL.ok,w:700,s:13});}
  if(ph==='cavity'){c.strokeStyle=COL.accent;c.lineWidth=1.2;arrow(tx+toolW+over+76,wy+depth-8,tx+toolW+over+2,wy+depth-8,COL.accent,1.4);txt("overcut = spark gap",tx+toolW+over+82,wy+depth-4,{c:COL.accent,s:13,w:700});
    txt('Cavity = mirror image of tool',470,445,{a:'center',w:700,s:14});}
  if(ph==='wear'){txt('Tool wear ratio: usually a few %',470,180,{a:'center',c:COL.cu,w:700,s:14});}
  if(ph==='end'){txt('Spark · melt · flush · repeat',W/2,140,{a:'center',s:22,w:700,c:COL.glow});}
  badge('Full view · not to scale');
}

// --- zoomed gap view (scenes 2 and 3)
const NPT=81;const tSurf=[],wSurf=[];
(function(){seed=5;for(let i=0;i<NPT;i++){const x=i*10;tSurf.push(150+12*rnd()+6*Math.sin(i*.7));wSurf.push(300-12*rnd()-6*Math.sin(i*.9+1));}})();
const SX=400;// narrowest point x
function wPeak(x,eroded){return eroded?0:34*Math.exp(-(((x-SX)/22)**2));}
function surfY(arr,x){const i=Math.max(0,Math.min(NPT-2,Math.floor(x/10)));const f=x/10-i;return arr[i]*(1-f)+arr[i+1]*f;}
const CRATERS=[[400,26,14],[290,22,11],[515,24,12],[200,20,10],[610,22,11],[345,18,9],[460,20,10],[560,18,9],[250,18,9],[680,20,10]];
function gapView(ph,t,sceneT){
  const eroded=['off','repeat'].includes(ph);
  // fluid
  c.fillStyle=COL.fluid;c.fillRect(0,0,W,H);
  // ions/fluid specks
  c.fillStyle='rgba(140,200,230,0.35)';seed=99;for(let i=0;i<60;i++){const x=rnd()*W,y=170+rnd()*120;c.fillRect((x+t*8)%W,y+Math.sin(t+i)*2,2,2);}
  // tool (top)
  c.fillStyle=COL.cu;c.beginPath();c.moveTo(0,0);for(let x=0;x<=W;x+=10)c.lineTo(x,surfY(tSurf,x));c.lineTo(W,0);c.closePath();c.fill();
  txt('Tool',20,40,{w:700,s:16,c:'#2b1606'});
  // work (bottom)
  c.fillStyle=COL.steel;c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=5)c.lineTo(x,surfY(wSurf,x)-wPeak(x,eroded));c.lineTo(W,H);c.closePath();c.fill();
  txt('Workpiece',20,H-24,{w:700,s:16,c:'#1d2427'});
  // craters
  let nC=0;if(ph==='off')nC=t>1.2?1:0;if(ph==='repeat')nC=1+Math.min(CRATERS.length-1,Math.floor(t/0.8));
  for(let k=0;k<nC;k++){const [x,rw,rd]=CRATERS[k];const y=surfY(wSurf,x);c.fillStyle='#16343F';c.beginPath();c.ellipse(x,y,rw,rd,0,0,Math.PI);c.fill();c.strokeStyle='#C5D0D4';c.lineWidth=1.5;c.beginPath();c.ellipse(x,y,rw,rd,0,0,Math.PI);c.stroke();
    // small rim
    c.fillStyle='#9AA7AD';c.beginPath();c.ellipse(x-rw,y,4,2.5,0,0,7);c.ellipse(x+rw,y,4,2.5,0,0,7);c.fill();}
  const ty=surfY(tSurf,SX),wy=surfY(wSurf,SX)-wPeak(SX,eroded);
  // field lines
  if(ph==='volt'||ph==='closest'){const k=ph==='volt'?Math.min(1,t/3):1;c.setLineDash([4,6]);c.lineDashOffset=-t*20;for(let x=60;x<W;x+=50){const a=surfY(tSurf,x),b=surfY(wSurf,x)-wPeak(x,false);const d=b-a;c.strokeStyle=`rgba(75,176,204,${(0.15+0.6*k*Math.min(1,70/d))})`;c.lineWidth=x===SX?2.5:1.2;c.beginPath();c.moveTo(x,a+3);c.lineTo(x,b-3);c.stroke();}c.setLineDash([]);}
  if(ph==='closest'){const p=0.5+0.5*Math.sin(t*5);c.strokeStyle=COL.glow;c.lineWidth=2;c.beginPath();c.arc(SX,(ty+wy)/2,26+p*6,0,7);c.stroke();leader(SX+30,(ty+wy)/2,560,215,'Smallest gap: strongest field',COL.glow);}
  // spark & plasma
  const showSpark=(ph==='break'&&t>0.8)||ph==='plasma'||ph==='melt'||ph==='bubble';
  if(ph==='break'&&t<0.8){c.fillStyle=`rgba(255,240,180,${0.3*Math.random()})`;c.beginPath();c.arc(SX,(ty+wy)/2,8,0,7);c.fill();}
  if(ph==='bubble'||(ph==='off'&&t<1.2)){const r=ph==='bubble'?20+Math.min(1,t/2)*45:Math.max(0,65*(1-t/0.6));if(r>0){c.fillStyle='rgba(220,240,255,0.10)';c.strokeStyle='rgba(220,240,255,0.55)';c.lineWidth=1.5;c.beginPath();c.ellipse(SX,(ty+wy)/2,r*0.9,Math.min(r,(wy-ty)/2+10),0,0,7);c.fill();c.stroke();}
    if(ph==='bubble')leader(SX+55,(ty+wy)/2-20,600,170,'Vapour bubble',COL.ink);}
  if(showSpark){const wch=ph==='break'?3:ph==='plasma'?3+Math.min(1,t/1.5)*9:12;
    c.save();const g=c.createLinearGradient(SX-wch*2,0,SX+wch*2,0);g.addColorStop(0,'rgba(255,122,26,0)');g.addColorStop(.5,'rgba(255,122,26,0.85)');g.addColorStop(1,'rgba(255,122,26,0)');c.fillStyle=g;c.shadowColor=COL.glow;c.shadowBlur=30;c.fillRect(SX-wch*2,ty,wch*4,wy-ty);c.restore();
    glowLine(()=>zigzag(SX,ty,SX,wy,wch*0.8,7),2.5,COL.spark,24);
    if(ph==='plasma'){leader(SX+20,(ty+wy)/2,580,215,'Plasma channel',COL.plasma);txt('> 8 000 °C',588,236,{c:COL.plasma,mono:true,s:13,w:600});}}
  // molten pools
  if(ph==='melt'||ph==='bubble'||(ph==='off'&&t<1.0)){const k=ph==='melt'?Math.min(1,t/1.5):1;c.fillStyle=COL.melt;c.save();c.shadowColor=COL.melt;c.shadowBlur=14;c.beginPath();c.ellipse(SX,wy+2,26*k,12*k,0,0,Math.PI);c.fill();c.beginPath();c.ellipse(SX,ty-2,12*k,6*k,0,Math.PI,2*Math.PI);c.fill();c.restore();
    if(ph==='melt'){leader(SX+26,wy+6,600,262,'Molten pool on work',COL.meltT);leader(SX+12,ty-4,600,196,'Smaller pool on tool',COL.meltT);}}
  // debris after off
  if(ph==='off'||ph==='repeat'){const t0=ph==='off'?Math.max(0,t-0.4):t;seed=17;const n=ph==='off'?22:30;for(let i=0;i<n;i++){const ang=-Math.PI*(0.15+0.7*rnd());const v=60+90*rnd();let x=SX+Math.cos(ang)*v*Math.min(t0,1.2),y=wy+Math.sin(ang)*v*Math.min(t0,1.2)+30*Math.max(0,t0-1.2);if(ph==='repeat')x+=t*55;c.fillStyle=i%3?'#AEB9BE':'#E0905A';c.beginPath();c.arc(x%W,Math.min(y,wy+10),2.4,0,7);c.fill();}
    if(ph==='off')txt('Pulse off: crater left behind',W/2,H/2+4,{a:'center',w:700,s:16,c:COL.ink});}
  if(ph==='repeat'){for(let y=200;y<=260;y+=30)arrow(40+((t*120)%200),y,100+((t*120)%200),y,'rgba(75,176,204,0.8)',2);txt('Flushing',30,190,{c:COL.accent,w:700,s:14});
    const k=Math.floor(t/0.8)%CRATERS.length;const [x]=CRATERS[Math.min(CRATERS.length-1,k+1)];const flash=(t%0.8)<0.18;if(flash){const a=surfY(tSurf,x),b=surfY(wSurf,x);glowLine(()=>zigzag(x,a,x,b,8,6),2.5,COL.spark,24);}
    txt('Thousands of sparks per second',W-20,30,{a:'right',w:700,s:15,c:COL.glow});}
  // scope inset
  if(['volt','closest','break','plasma'].includes(ph))scope(ph,t);
  c.fillStyle='rgba(12,20,22,0.75)';c.fillRect(14,H/2-14,92,24);txt('× ~1000',60,H/2+3,{a:'center',mono:true,s:12,c:COL.muted});
  badge('Magnified gap');
}
function scope(ph,t){const x=560,y=18,w=220,h=110;c.fillStyle='rgba(8,14,16,0.92)';c.fillRect(x,y,w,h);c.strokeStyle=COL.muted;c.lineWidth=1;c.strokeRect(x,y,w,h);
  txt('V',x+8,y+16,{mono:true,s:11,c:COL.accent,w:600});txt('I',x+24,y+16,{mono:true,s:11,c:COL.glow,w:600});
  const span=4;const now=ph==='volt'?Math.min(t,span):ph==='closest'?span:ph==='break'?span:span;const bx=x+10,bw=w-20,by=y+h-12,bh=h-30;
  // voltage: ramps to 0.85, holds, drops to 0.25 at breakdown
  const brk=ph==='break'?2.6+Math.min(t,0.8)*0+0:ph==='plasma'?2.6:99;
  c.strokeStyle=COL.accent;c.lineWidth=2;c.beginPath();
  for(let i=0;i<=100;i++){const tt=i/100*span;if(ph==='volt'&&tt>t)break;let v=Math.min(1,tt/0.3)*0.85;if(ph==='break'&&tt>2.6&&t>0.8)v=0.25;if(ph==='plasma'&&tt>2.6)v=0.25;c.lineTo(bx+bw*tt/span,by-bh*v);}c.stroke();
  if(ph==='break'&&t>0.8||ph==='plasma'){c.strokeStyle=COL.glow;c.beginPath();c.moveTo(bx,by);c.lineTo(bx+bw*2.6/span,by);c.lineTo(bx+bw*2.65/span,by-bh*0.7);c.lineTo(bx+bw,by-bh*0.7);c.stroke();txt('breakdown',bx+bw*2.6/span-4,y+28,{a:'right',mono:true,s:10,c:COL.muted});}
}

// --- waveform & crater comparison (scene 4)
function waveView(ph,t){
  const x0=60,y0=40,w=680,h=170;
  c.strokeStyle=COL.muted;c.lineWidth=1;c.beginPath();c.moveTo(x0,y0);c.lineTo(x0,y0+h);c.lineTo(x0+w,y0+h);c.stroke();
  txt('Current',x0-8,y0+8,{a:'right',s:12,c:COL.muted});txt('time',x0+w,y0+h+16,{a:'right',s:12,c:COL.muted});
  const big=ph==='compare'&&(t%6)>3;const Ip=big?1:0.5;const ton=110,toff=60;
  c.save();c.beginPath();c.rect(x0,y0-5,Math.min(w,(RM?w:t*260)),h+10);c.clip();
  c.strokeStyle=COL.glow;c.lineWidth=2.5;c.beginPath();let x=x0+10;c.moveTo(x0,y0+h);
  while(x<x0+w){c.lineTo(x,y0+h);c.lineTo(x,y0+h-h*0.85*Ip);c.lineTo(x+ton,y0+h-h*0.85*Ip);c.lineTo(x+ton,y0+h);x+=ton+toff;}c.stroke();
  if(ph==='energy'){c.fillStyle='rgba(255,176,32,0.18)';c.fillRect(x0+10,y0+h-h*0.85*Ip,ton,h*0.85*Ip);}
  c.restore();
  const yI=y0+h-h*0.85*Ip;
  if(ph==='wave'||ph==='energy'){arrow(x0+10+ton/2,y0+h-4,x0+10+ton/2,yI+4,COL.ink,1.2);txt('Iₚ',x0+18+ton/2,(y0+h+yI)/2,{w:700,s:15});
    arrow(x0+12,yI-12,x0+8+ton,yI-12,COL.ink,1);txt('tₒₙ',x0+10+ton/2,yI-18,{a:'center',w:700,s:14});
    arrow(x0+12+ton,y0+h-14,x0+8+ton+toff,y0+h-14,COL.ink,1);txt('tₒff',x0+10+ton+toff/2,y0+h-20,{a:'center',w:700,s:14});}
  if(ph==='energy'){txt('Energy per spark  E ≈ V × Iₚ × tₒₙ',W/2,y0+h+48,{a:'center',mono:true,s:17,w:600,c:COL.glow});}
  // surface profiles
  if(ph==='compare'||ph==='stages'){
    const prof=(px,py,pw,r,label,sub,on)=>{c.fillStyle=COL.steel;c.beginPath();c.moveTo(px,py+60);let xx=px;c.lineTo(px,py);while(xx<px+pw){c.lineTo(xx,py);c.arc(xx+r,py,r,Math.PI,0,true);xx+=2*r;}c.lineTo(px+pw,py);c.lineTo(px+pw,py+60);c.closePath();c.fill();
      c.globalAlpha=on?1:0.45;txt(label,px+pw/2,py+86,{a:'center',w:700,s:15});txt(sub,px+pw/2,py+106,{a:'center',s:13,c:COL.muted});c.globalAlpha=1;};
    const on2=ph==='stages'?true:big;
    prof(90,300,260,6,'Low current','small craters · fine finish · slow',ph==='stages'||!big);
    prof(450,300,260,18,'High current','large craters · rough · fast',on2);
    if(ph==='stages'){arrow(368,330,432,330,COL.accent,2);txt('1. Roughing',580,280,{a:'center',c:COL.accent,w:700,s:14});txt('2. Finishing',220,280,{a:'center',c:COL.accent,w:700,s:14});}
    else txt(big?'Iₚ doubled →':'Iₚ low',W/2,y0+h+40,{a:'center',mono:true,s:15,c:COL.glow,w:600});}
  badge('One pulse = one spark');
}

function draw(si,ph,t){bg();if(si===0||si===4)fullView(ph,t);else if(si===1||si===2)gapView(ph,t);else waveView(ph,t);}


return {W,H,draw:(ctx,si,ph,t)=>{c=ctx;draw(si,ph,t);}};
})();
