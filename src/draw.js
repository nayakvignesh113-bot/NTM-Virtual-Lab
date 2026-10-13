// ---------- canvas drawing (logical 640 × 400) ----------
const rnd=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)};
function colors(){
  const cs=getComputedStyle(document.documentElement);const g=n=>cs.getPropertyValue(n).trim();
  return {bg:g('--bg'),panel:g('--panel'),panel2:g('--panel2'),ink:g('--ink'),muted:g('--muted'),line:g('--line'),accent:g('--accent'),
    mech:g('--mech'),therm:g('--therm'),chem:g('--chem'),metal:g('--metal'),metal2:g('--metal2'),tool:g('--tool'),fluid:g('--fluid'),fluid2:g('--fluid2'),spark:g('--spark'),face:g('--face')};
}
function T(c,C,txt,x,y,o={}){c.save();c.font=`${o.w||500} ${o.s||11}px "JetBrains Mono", ui-monospace, monospace`;c.fillStyle=o.c||C.muted;c.textAlign=o.a||'left';c.textBaseline='middle';c.fillText(txt,x,y);c.restore();}
function lead(c,C,x1,y1,x2,y2){c.save();c.strokeStyle=C.muted;c.lineWidth=0.8;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.beginPath();c.arc(x2,y2,1.8,0,7);c.fillStyle=C.muted;c.fill();c.restore();}
function hatch(c,C,x,y,w,h){c.save();c.fillStyle=C.metal;c.fillRect(x,y,w,h);c.beginPath();c.rect(x,y,w,h);c.clip();c.strokeStyle=C.metal2;c.lineWidth=0.8;c.beginPath();for(let k=-h;k<w;k+=9){c.moveTo(x+k,y+h);c.lineTo(x+k+h,y);}c.stroke();c.restore();}
function hatchPath(c,C,path){c.save();path();c.clip();c.fillStyle=C.metal;c.fillRect(0,0,640,400);c.strokeStyle=C.metal2;c.lineWidth=0.8;c.beginPath();for(let k=-400;k<640;k+=9){c.moveTo(k,400);c.lineTo(k+400,0);}c.stroke();c.restore();c.save();path();c.strokeStyle=C.ink;c.lineWidth=1;c.stroke();c.restore();}
function box(c,C,x,y,w,h,fill,stroke){c.save();c.fillStyle=fill||C.panel2;c.fillRect(x,y,w,h);c.strokeStyle=stroke||C.ink;c.lineWidth=1;c.strokeRect(x+.5,y+.5,w-1,h-1);c.restore();}
function arrow(c,C,x1,y1,x2,y2,col){c.save();c.strokeStyle=col||C.ink;c.fillStyle=col||C.ink;c.lineWidth=1.4;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();const a=Math.atan2(y2-y1,x2-x1);c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-8*Math.cos(a-.4),y2-8*Math.sin(a-.4));c.lineTo(x2-8*Math.cos(a+.4),y2-8*Math.sin(a+.4));c.closePath();c.fill();c.restore();}
function glow(c,col,blur){c.shadowColor=col;c.shadowBlur=blur;}

// plate with a progressing cut (jet / beam / arc) — cut face on left with drag lines
function cutPlate(c,C,X,top,th,lag,t,spd,prog){
  const curve=(x0)=>{c.moveTo(x0,top);c.quadraticCurveTo(x0+2,top+th*0.6,x0-lag,top+th);};
  if(prog===0){hatch(c,C,28,top,584,th);c.save();c.strokeStyle=C.ink;c.strokeRect(28.5,top+.5,583,th-1);c.restore();return;}
  const x0s=prog==null?28:Math.max(28,X-prog*(X-28));
  hatchPath(c,C,()=>{c.beginPath();c.rect(28,top,584,th);});
  c.save();c.beginPath();c.moveTo(x0s,top);c.lineTo(X,top);c.quadraticCurveTo(X+2,top+th*0.6,X-lag,top+th);c.lineTo(Math.max(28,x0s-lag),top+th);c.quadraticCurveTo(x0s+2,top+th*0.6,x0s,top);c.closePath();
  c.fillStyle=C.face;c.fill();c.clip();c.strokeStyle=C.metal2;c.lineWidth=0.8;
  for(let k=0;k<26;k++){const off=(k*24+t*spd)%600;const x0=X-off;c.beginPath();curve(x0);c.stroke();}
  c.restore();
  c.save();c.strokeStyle=C.ink;c.lineWidth=1;c.strokeRect(28.5,top+.5,583,th-1);c.restore();
}

// Operate-mode flags: null = full live demo
let F=null;
const SF=()=>F||{work:1,tool:1,fluid:1,on:1,prog:null,x:{}};
const DRAW={
usm(c,C,t,p,o){
  const S=SF();
  const vib=S.on?(2+p.A0/60*7)*Math.sin(t*2*Math.PI*(2+p.f/20)):0;
  const wy=272, cd=S.prog==null?26:2+S.prog*40;
  if(S.work){hatch(c,C,110,wy,420,100);c.strokeStyle=C.ink;c.strokeRect(110.5,wy+.5,419,99);
  if(cd>2){c.fillStyle=C.fluid2;c.fillRect(288,wy,64,cd);
  c.strokeStyle=C.ink;c.beginPath();c.moveTo(288,wy);c.lineTo(288,wy+cd);c.lineTo(352,wy+cd);c.lineTo(352,wy);c.stroke();}}
  // slurry pool on top
  if(S.fluid){c.fillStyle=C.fluid;c.fillRect(150,wy-12,340,12);}
  const lift=(S.on||S.prog>0||S.prog==null)?0:46;
  const tb=wy+cd-8+vib*0.6-lift;
  // transducer stack
  for(let i=0;i<6;i++) box(c,C,250,24+i*10,140,10,i%2?C.panel2:C.tool);
  box(c,C,250,84,140,10,C.panel2);
  // horn
  const hy=94+vib*0.15;
  c.save();c.beginPath();c.moveTo(262,hy);c.lineTo(378,hy);c.lineTo(342,tb-34);c.lineTo(298,tb-34);c.closePath();c.fillStyle=C.panel2;c.fill();c.strokeStyle=C.ink;c.stroke();c.restore();
  if(S.tool) box(c,C,294,tb-34,52,34,C.tool);
  // slurry nozzle
  if(S.fluid){c.save();c.strokeStyle=C.fluid2;c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(130,200);c.quadraticCurveTo(230,205,268,wy-14);c.stroke();c.restore();}
  box(c,C,112,192,28,16,C.panel2);
  // grits
  c.fillStyle=C.ink;
  if(S.fluid){for(let i=0;i<70;i++){const x=152+rnd(i)*336,y=wy-11+rnd(i+50)*10;if(x>286&&x<354)continue;c.fillRect(x,y,1.8,1.8);}
  if(S.tool&&!lift)for(let i=0;i<18;i++){const x=291+rnd(i+200)*58,y=tb+1+rnd(i+300)*Math.max(1,wy+cd-tb-2);c.beginPath();c.arc(x,y+Math.sin(t*20+i)*0.6,1.6,0,7);c.fill();}}
  arrow(c,C,420,24,420,70,C.ink);T(c,C,'Static force F',430,46,{c:C.ink});
  T(c,C,'↕ A₀ = '+p.A0+' µm @ '+p.f+' kHz',430,140,{c:C.ink});
  lead(c,C,240,50,206,50);T(c,C,'Piezo transducer',96,50);
  lead(c,C,282,150,206,150);T(c,C,'Horn',166,150);
  if(S.tool){lead(c,C,294,tb-20,250,240);T(c,C,'Tool',218,240);}
  T(c,C,'Abrasive slurry',112,180);
  if(S.work){T(c,C,'Workpiece ('+(p.mat==='glass'?'glass':p.mat)+')',120,388);
  if(cd>8)T(c,C,'cavity',360,wy+Math.min(18,cd-4));}
},
ajm(c,C,t,p,o){
  const wy=320, sod=14+p.sod*13.5, tip=wy-sod;
  box(c,C,250,18,140,42,C.panel2);T(c,C,'Mixing chamber',320,39,{a:'center',c:C.ink});
  arrow(c,C,150,39,248,39,C.mech);T(c,C,'Gas + abrasive',150,26);
  c.save();c.beginPath();c.moveTo(300,60);c.lineTo(340,60);c.lineTo(328,tip);c.lineTo(312,tip);c.closePath();c.fillStyle=C.tool;c.fill();c.strokeStyle=C.ink;c.stroke();c.restore();
  const S=SF();const n=S.on?Math.round(30+p.ma*5):0, sp=o.v/260;
  c.fillStyle=C.ink;
  for(let i=0;i<n;i++){const ph=(rnd(i)+t*sp*1.2)%1;const y=tip+ph*sod;const spread=(rnd(i+7)-0.5)*2*(p.dn*7+ph*sod*Math.tan(p.al*Math.PI/180));c.fillRect(320+spread,y,1.8,1.8);}
  const kw=Math.max(8,o.kerf*16), cdp=S.prog==null?16:S.prog*22;
  if(S.work) hatchPath(c,C,()=>{c.beginPath();c.moveTo(80,wy);c.lineTo(320-kw/2,wy);c.quadraticCurveTo(320,wy+cdp,320+kw/2,wy);c.lineTo(560,wy);c.lineTo(560,388);c.lineTo(80,388);c.closePath();});
  // rebound
  c.fillStyle=C.muted;if(S.on&&S.work)for(let i=0;i<14;i++){const ph=(rnd(i+90)+t*0.8)%1;const s=rnd(i+40)>0.5?1:-1;c.fillRect(320+s*(kw/2+ph*60),wy-ph*30*rnd(i+3),1.5,1.5);}
  // SOD dimension
  c.save();c.strokeStyle=C.accent;c.fillStyle=C.accent;c.beginPath();c.moveTo(380,tip);c.lineTo(380,wy);c.stroke();c.beginPath();c.moveTo(372,tip);c.lineTo(388,tip);c.moveTo(372,wy);c.lineTo(388,wy);c.stroke();c.restore();
  T(c,C,'SOD '+p.sod.toFixed(1)+' mm',392,(tip+wy)/2,{c:C.accent});T(c,C,'α = '+p.al+'°',392,(tip+wy)/2+14,{c:C.accent});
  lead(c,C,334,100,420,100);T(c,C,'WC / sapphire nozzle',426,100);
  if(S.work){T(c,C,'Workpiece',88,376,{c:C.ink});T(c,C,'kerf ≈ '+o.kerf.toFixed(2)+' mm',260,370,{c:C.ink});}
},
_jet(c,C,t,p,o,abr){
  const S=SF();
  box(c,C,276,14,88,58,C.panel2);T(c,C,'High-pressure water',268,30,{a:'right'});
  T(c,C,p.p+' MPa',268,46,{a:'right',c:C.ink});
  c.save();c.fillStyle=C.accent;c.beginPath();c.moveTo(320,72);c.lineTo(326,78);c.lineTo(320,84);c.lineTo(314,78);c.closePath();c.fill();c.restore();
  lead(c,C,327,78,400,78);T(c,C,'Jewel orifice ø'+p.dn.toFixed(2),406,78);
  let tip=108;
  if(abr){box(c,C,292,86,56,28,C.panel2);
    box(c,C,40,26,70,34,S.x.hopper||F==null?C.tool:C.panel2);T(c,C,'Hopper',75,43,{a:'center',c:C.ink});
    c.save();c.strokeStyle=(S.x.abr||F==null)?C.tool:C.line;c.lineWidth=5;c.beginPath();c.moveTo(75,60);c.lineTo(150,70);c.quadraticCurveTo(250,80,292,100);c.stroke();c.restore();
    T(c,C,'Garnet feed',120,76);
    c.fillStyle=C.tool;if(S.on&&(S.x.abr||F==null))for(let i=0;i<10;i++){const ph=(rnd(i)+t*0.6)%1;c.fillRect(150+ph*140,70+ph*30-2+rnd(i+5)*3,2,2);}
    box(c,C,309,114,22,74,C.metal2);tip=188;lead(c,C,332,150,400,150);T(c,C,'Focusing tube (WC)',406,150);
    lead(c,C,349,100,400,112);T(c,C,'Mixing chamber',406,112);
  } else {box(c,C,306,86,28,22,C.panel2);}
  const top=tip+14;
  const th=abr?clamp(30+p.t*0.9,30,150):clamp(24+p.t*1.2,24,130);
  if(S.work) cutPlate(c,C,320,top,th,th*0.28,t,abr?22:34,S.prog);
  // jet
  if(S.on){c.save();glow(c,C.accent,8);c.strokeStyle=C.accent;c.lineWidth=abr?3:2;c.beginPath();c.moveTo(320,tip);c.lineTo(320,top);c.quadraticCurveTo(322,top+th*0.6,320-th*0.28,top+th);c.lineTo(320-th*0.28-6,395);c.stroke();c.restore();}
  if(abr&&S.on){c.fillStyle=C.tool;for(let i=0;i<16;i++){const ph=(rnd(i+11)+t*1.5)%1;c.fillRect(319,tip+ph*(top-tip),2,2);}}
  if(S.work){T(c,C,'Cut face (drag lines)',40,top+th+14);T(c,C,'Uncut work',540,top+th+14);}
  arrow(c,C,600,top-12,540,top-12,C.ink);T(c,C,'traverse',600,top-24,{a:'right'});
  T(c,C,(abr?'AWJ':'WJ')+' · '+Math.round(o.vw||o.v)+' m/s',40,top-14,{c:C.ink});
},
wjm(c,C,t,p,o){DRAW._jet(c,C,t,p,o,false)},
awjm(c,C,t,p,o){DRAW._jet(c,C,t,p,o,true)},
chm(c,C,t,p,o){
  const S=SF();
  c.fillStyle=C.fluid;c.fillRect(40,40,560,340);c.strokeStyle=C.ink;c.strokeRect(40.5,40.5,559,339);
  T(c,C,'Etchant bath · '+(F&&S.x.temp!=null?S.x.temp.toFixed(0):p.T)+' °C',52,56,{c:C.ink});
  if(F&&S.x.heat){c.save();c.strokeStyle=C.therm;c.lineWidth=2;for(let i=0;i<6;i++){c.beginPath();c.moveTo(60+i*90,368);c.lineTo(100+i*90,368);c.stroke();}c.restore();T(c,C,'heater',52,358,{c:C.therm});}
  if(!S.work){T(c,C,'Immerse the masked part here',320,200,{a:'center'});return;}
  const tau=S.prog==null?Math.min(1,((t*0.12)%1.25)):S.prog;
  const dF=o.d, uF=o.u, w=p.w;
  const sc=Math.min(420/(w+2*uF+0.2),150/(dF+0.05),120);
  const y0=170, xm=320, xl=xm-w*sc/2, xr=xm+w*sc/2;
  const d=dF*tau*sc, u=uF*tau*sc;
  const ph=Math.max(d+40,120);
  hatchPath(c,C,()=>{c.beginPath();c.moveTo(70,y0);c.lineTo(xl-u,y0);
    if(d>0.5){c.ellipse(xl,y0,u||0.1,d,0,Math.PI,Math.PI/2,true);c.lineTo(xr,y0+d);c.ellipse(xr,y0,u||0.1,d,0,Math.PI/2,0,true);}
    c.lineTo(xr+u,y0);c.lineTo(570,y0);c.lineTo(570,y0+ph);c.lineTo(70,y0+ph);c.closePath();});
  c.fillStyle=C.ink;c.fillRect(70,y0-7,xl-70,7);c.fillRect(xr,y0-7,570-xr,7);
  // bubbles
  c.strokeStyle=C.accent;if(S.on)for(let i=0;i<14;i++){const ph2=(rnd(i)+t*0.25)%1;const x=xl+rnd(i+3)*(xr-xl);c.beginPath();c.arc(x,y0+d-4-ph2*(d+80),1.5+rnd(i+8)*2,0,7);c.stroke();}
  lead(c,C,120,y0-4,120,120);T(c,C,'Maskant',100,112);
  if(d>6){c.save();c.strokeStyle=C.accent;c.beginPath();c.moveTo(xr+u+14,y0);c.lineTo(xr+u+14,y0+d);c.stroke();c.restore();T(c,C,'d = '+(dF*tau).toFixed(3)+' mm',Math.min(xr+u+20,470),y0+d/2,{c:C.accent});
   T(c,C,'u = '+(uF*tau).toFixed(3)+' mm',xl-u-6,y0+d+16,{a:'right',c:C.accent});}
  T(c,C,'t = '+(p.time*tau).toFixed(0)+' / '+p.time+' min',588,56,{a:'right',c:C.ink});
  T(c,C,'Workpiece',80,y0+ph-12,{c:C.ink});
},
ecm(c,C,t,p,o){
  const S=SF();
  const gap=clamp(o.ge*30,4,36);
  const prof=x=>180+16*Math.sin((x-220)/200*2*Math.PI);
  // tool
  if(S.tool){c.save();c.beginPath();c.moveTo(230,40);c.lineTo(410,40);c.lineTo(410,60);c.lineTo(420,prof(420));for(let x=420;x>=220;x-=4)c.lineTo(x,prof(x));c.lineTo(230,60);c.closePath();c.fillStyle=C.tool;c.fill();c.strokeStyle=C.ink;c.stroke();c.restore();}
  // work
  if(S.work)hatchPath(c,C,()=>{c.beginPath();c.moveTo(90,prof(220)+gap);c.lineTo(220,prof(220)+gap);for(let x=220;x<=420;x+=4)c.lineTo(x,prof(x)+gap);c.lineTo(560,prof(420)+gap);c.lineTo(560,350);c.lineTo(90,350);c.closePath();});
  // electrolyte in gap
  if(S.fluid){c.save();c.fillStyle=C.fluid2;c.beginPath();c.moveTo(150,prof(220));c.lineTo(220,prof(220));for(let x=220;x<=420;x+=4)c.lineTo(x,prof(x));c.lineTo(500,prof(420));c.lineTo(500,prof(420)+gap);for(let x=420;x>=220;x-=4)c.lineTo(x,prof(x)+gap);c.lineTo(150,prof(220)+gap);c.closePath();c.fill();c.restore();}
  // flow particles (ions)
  if(S.on)for(let i=0;i<34;i++){const ph=(rnd(i)+t*0.35)%1;const x=150+ph*350;const xx=clamp(x,220,420);const y=prof(xx)+gap*(0.2+0.6*rnd(i+4));c.fillStyle=i%3?C.chem:C.therm;c.beginPath();c.arc(x,y,1.8,0,7);c.fill();}
  c.strokeStyle=C.muted;if(S.on)for(let i=0;i<10;i++){const ph=(rnd(i+30)+t*0.3)%1;const x=230+ph*180;c.beginPath();c.arc(x,prof(x)+2.5,1.6,0,7);c.stroke();}
  if(S.fluid){arrow(c,C,140,prof(220)+gap/2,190,prof(220)+gap/2,C.accent);T(c,C,'Electrolyte in',60,prof(220)+gap/2-12,{c:C.accent});
  arrow(c,C,450,prof(420)+gap/2,510,prof(420)+gap/2,C.accent);T(c,C,'+ sludge out',514,prof(420)+gap/2);}
  arrow(c,C,320,10,320,36,C.ink);T(c,C,'feed '+p.f+' mm/min',330,18,{c:C.ink});
  // supply
  box(c,C,28,40,90,46,C.panel2);T(c,C,'DC '+p.V+' V',73,56,{a:'center',c:C.ink});T(c,C,(S.on?o.I.toFixed(0):'0')+' A',73,72,{a:'center',c:C.ink});
  c.save();c.strokeStyle=C.mech;c.lineWidth=1.4;c.beginPath();c.moveTo(118,50);c.lineTo(230,50);c.stroke();c.strokeStyle=C.therm;c.beginPath();c.moveTo(73,86);c.lineTo(73,330);c.lineTo(90,330);c.stroke();c.restore();
  T(c,C,'− tool (cathode)',122,44,{c:C.mech});T(c,C,'+ work (anode)',78,300,{c:C.therm});
  T(c,C,'gap '+o.ge.toFixed(3)+' mm',430,prof(420)+gap+22,{c:C.ink});
  T(c,C,'● Fe²⁺/OH⁻ sludge   ○ H₂ at cathode',150,372);
},
edm(c,C,t,p,o){
  const S=SF();
  const lvl=F?(S.x.level??(S.fluid?1:0)):1;
  if(lvl>0){c.fillStyle=C.fluid;c.fillRect(70,58+230*(1-lvl),500,230*lvl);}c.strokeStyle=C.ink;c.strokeRect(70.5,58.5,499,229);
  T(c,C,'Dielectric (hydrocarbon oil)',80,74);
  box(c,C,292,8,56,56,C.panel2);T(c,C,'Servo',360,22);
  const dep=S.prog==null?25:2+S.prog*23, lift=(S.on||S.prog>0||S.prog==null)?0:30;
  const tb=186+dep-7-lift, oc=clamp(o.oc*40,3,14);
  if(S.tool){box(c,C,272,64,96,tb-64,p.el==='gr'?C.metal2:C.tool);
  T(c,C,{cu:'Cu',gr:'Graphite',cuw:'Cu–W'}[p.el]+' electrode',380,120,{c:C.ink});}
  if(S.work)hatchPath(c,C,()=>{c.beginPath();c.moveTo(110,186);c.lineTo(272-oc,186);c.lineTo(272-oc,186+dep);c.lineTo(368+oc,186+dep);c.lineTo(368+oc,186);c.lineTo(530,186);c.lineTo(530,284);c.lineTo(110,284);c.closePath();});
  if(S.work&&dep>3){c.fillStyle=lvl>0.5?C.fluid2:C.panel;c.fillRect(272-oc,186,oc,186+dep-186);c.fillRect(368,186,oc,dep);c.fillRect(272,186+dep-7,96,7);}
  const rate=6+Math.min(30,o.fr/2);const k=Math.floor(t*rate);
  if(S.on)for(let j=0;j<2;j++){const id=k-j;const x=278+rnd(id)*84;const a=j?0.35:1;
    c.save();c.globalAlpha=a;glow(c,C.spark,14);c.strokeStyle=C.spark;c.lineWidth=1+p.Ip/20;c.beginPath();c.moveTo(x,tb);c.lineTo(x+(rnd(id+1)-0.5)*5,tb+3);c.lineTo(x+(rnd(id+2)-0.5)*5,tb+7);c.stroke();c.restore();
    c.fillStyle=C.muted;for(let q=0;q<5;q++){const ph=((t*rate)%1);c.fillRect(x+(rnd(id+q)-0.5)*40*ph,tb+3-ph*30*rnd(id+q+9),1.6,1.6);}}
  if(S.work){T(c,C,'Workpiece',120,272,{c:C.ink});if(dep>8)T(c,C,'overcut',372+oc,186+dep-12);}
  // waveform
  const y0=300;c.fillStyle=C.panel;c.fillRect(20,y0,600,94);c.strokeStyle=C.line;c.strokeRect(20.5,y0+.5,599,93);
  const per=Math.max(40,Math.min(220,(p.ton+p.toff)*0.8)), on=per*(p.ton/(p.ton+p.toff)), off=(t*40)%per;
  const vy=(v)=>y0+42-v*30, iy=(i)=>y0+86-i*30;
  c.save();c.lineWidth=1.4;c.strokeStyle=C.mech;c.beginPath();
  for(let x=24;x<616;x++){const ph=(x+off)%per;let v=0;if(S.on&&ph<on)v=ph<Math.min(8,on*0.25)?1:0.3;x===24?c.moveTo(x,vy(v)):c.lineTo(x,vy(v));}c.stroke();
  c.strokeStyle=C.therm;c.beginPath();const ih=clamp(p.Ip/50,0.15,1);
  for(let x=24;x<616;x++){const ph=(x+off)%per;let i=0;if(S.on&&ph<on&&ph>=Math.min(8,on*0.25))i=ih;x===24?c.moveTo(x,iy(i)):c.lineTo(x,iy(i));}c.stroke();c.restore();
  T(c,C,'V',604,y0+12,{c:C.mech,a:'right'});T(c,C,'I',604,y0+58,{c:C.therm,a:'right'});
  T(c,C,'tₒₙ '+p.ton+' µs · tₒff '+p.toff+' µs · '+o.fr.toFixed(1)+' kHz',28,y0+10,{c:C.ink});
},
wedm(c,C,t,p,o){
  const S=SF();if(!S.on)t=0;
  const wx=330, top=150, th=clamp(40+p.t*0.7,40,180);
  // spools
  c.strokeStyle=C.ink;c.lineWidth=1;
  [[90,60],[560,360]].forEach(([x,y],i)=>{c.beginPath();c.arc(x,y,24,0,7);c.fillStyle=C.panel2;c.fill();c.stroke();c.beginPath();c.arc(x,y,6,0,7);c.stroke();
    const a=t*(i?2:-2);c.beginPath();c.moveTo(x,y);c.lineTo(x+20*Math.cos(a),y+20*Math.sin(a));c.stroke();});
  T(c,C,'Supply spool',62,98);T(c,C,'Take-up',540,322);
  // workpiece cross-section (front) with kerf
  if(S.work){hatch(c,C,140,top,380,th);c.strokeStyle=C.ink;c.strokeRect(140.5,top+.5,379,th-1);}
  // wire path
  if(S.tool){c.save();c.strokeStyle=C.tool;c.lineWidth=2;c.beginPath();c.moveTo(114,60);c.lineTo(wx,40);c.lineTo(wx,top+th+70);c.lineTo(560,336);c.stroke();
  c.setLineDash([6,8]);c.lineDashOffset=-t*40;c.strokeStyle=C.ink;c.lineWidth=1;c.beginPath();c.moveTo(wx,40);c.lineTo(wx,top+th+70);c.stroke();c.restore();}
  // guides
  box(c,C,wx-22,top-48,44,34,C.panel2);box(c,C,wx-22,top+th+14,44,34,C.panel2);
  T(c,C,'Upper guide + DI water',wx+30,top-36);T(c,C,'Lower guide',wx+30,top+th+30);
  if(S.fluid){c.save();c.fillStyle=C.fluid2;c.fillRect(wx-6,top-14,12,14);c.fillRect(wx-6,top+th,12,14);c.restore();}
  // kerf (plan) region shown as lighter band to the left of wire inside block
  const kw=clamp(o.kerf*30,4,12);const cutw=S.prog==null?wx-140:(wx-140)*S.prog;if(S.work&&cutw>0){c.fillStyle=C.fluid2;c.fillRect(wx-cutw,top,cutw,th);
  c.fillStyle=C.face;c.globalAlpha=0.5;c.fillRect(wx-cutw,top,cutw,th);c.globalAlpha=1;}
  // sparks along wire
  const k=Math.floor(t*14);
  if(S.on)for(let j=0;j<4;j++){const y=top+rnd(k*7+j)*th;c.save();glow(c,C.spark,10);c.strokeStyle=C.spark;c.lineWidth=1.4;c.beginPath();c.moveTo(wx+1,y);c.lineTo(wx+kw/2+3,y+(rnd(j+k)-0.5)*4);c.stroke();c.restore();}
  if(S.work){if(cutw>40)T(c,C,'cut kerf',wx-cutw+10,top+12,{c:C.ink});T(c,C,'Work · t = '+p.t+' mm',380,top+th-12,{c:C.ink});}
  arrow(c,C,600,top+th/2,540,top+th/2,C.ink);T(c,C,'feed',604,top+th/2-14,{a:'right'});
  // plan inset
  const ix=24,iy=286,iw=180,ih=100;box(c,C,ix,iy,iw,ih,C.panel,C.line);T(c,C,'Plan view',ix+8,iy+12);
  const pts=[];for(let i=0;i<=120;i++){const a=i/120*2*Math.PI;const r=30+8*Math.sign(Math.sin(6*a))*Math.min(1,Math.abs(Math.sin(6*a))*3);pts.push([ix+iw/2+r*Math.cos(a),iy+ih/2+6+r*Math.sin(a)*0.9]);}
  const prog=Math.floor((S.prog==null?((t*0.08)%1):S.prog)*(pts.length-1));
  c.save();c.strokeStyle=C.line;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
  c.strokeStyle=C.therm;c.lineWidth=2;c.beginPath();pts.slice(0,prog+1).forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
  if(pts[prog]){c.fillStyle=C.spark;c.beginPath();c.arc(pts[prog][0],pts[prog][1],3,0,7);c.fill();}c.restore();
},
lbm(c,C,t,p,o){
  const S=SF();
  const L=p.las, bc=L==='co2'?C.therm:C.spark;
  if(F&&S.x.door!=null){c.save();c.setLineDash([6,4]);c.strokeStyle=S.x.door?C.ink:C.therm;c.lineWidth=1.4;c.strokeRect(16.5,98.5,607,290);c.restore();T(c,C,S.x.door?'Enclosure closed (interlock OK)':'Enclosure door OPEN',24,110,{c:S.x.door?C.muted:C.therm});}
  box(c,C,30,40,220,46,C.panel2);T(c,C,{fiber:'Fiber laser 1.07 µm',co2:'CO₂ laser 10.6 µm',yag:'Nd:YAG 1.064 µm'}[L],140,57,{a:'center',c:C.ink});T(c,C,(p.P/1000).toFixed(2)+' kW',140,73,{a:'center',c:C.ink});
  if(S.on){c.save();glow(c,bc,10);c.fillStyle=bc;c.globalAlpha=0.55;c.fillRect(250,57,170,12);c.restore();}
  c.save();c.strokeStyle=C.ink;c.lineWidth=3;c.beginPath();c.moveTo(410,48);c.lineTo(438,78);c.stroke();c.restore();T(c,C,'45° mirror',446,52);
  const top=232;
  if(S.on){c.save();glow(c,bc,10);c.fillStyle=bc;c.globalAlpha=0.55;c.beginPath();c.moveTo(418,70);c.lineTo(430,70);c.lineTo(430,128);c.lineTo(418,128);c.closePath();c.fill();
  c.beginPath();c.moveTo(416,134);c.lineTo(432,134);c.lineTo(425,top);c.lineTo(423,top);c.closePath();c.fill();c.restore();}
  c.save();c.strokeStyle=C.ink;c.fillStyle=C.panel;c.beginPath();c.ellipse(424,131,22,5,0,0,7);c.fill();c.stroke();c.restore();T(c,C,'Focusing lens',452,131);
  c.save();c.beginPath();c.moveTo(398,150);c.lineTo(450,150);c.lineTo(432,top-10);c.lineTo(416,top-10);c.closePath();c.strokeStyle=C.ink;c.stroke();c.restore();
  T(c,C,'Nozzle · '+{o2:'O₂',n2:'N₂',air:'air'}[p.gas]+' assist',460,180);
  if(S.fluid)arrow(c,C,380,160,404,170,C.accent);
  const th=clamp(14+p.t*5,14,140);
  if(S.work)cutPlate(c,C,424,top,th,th*0.22,t,28,S.prog);
  if(S.on&&S.work){c.save();glow(c,bc,14);c.fillStyle=bc;c.beginPath();c.moveTo(424,top);c.quadraticCurveTo(426,top+th*0.6,424-th*0.22,top+th);c.lineTo(424-th*0.22-3,top+th);c.quadraticCurveTo(421,top+th*0.6,421,top);c.closePath();c.fill();c.restore();
  c.fillStyle=C.spark;for(let i=0;i<26;i++){const ph=(rnd(i)+t*1.4)%1;c.fillRect(424-th*0.22-ph*60*rnd(i+3),top+th+ph*(400-top-th),1.8,1.8);}}
  T(c,C,'Molten ejecta',300,392);
  T(c,C,'spot ø '+o.d0.toFixed(0)+' µm · '+o.I.toFixed(1)+' MW/cm²',30,120,{c:C.ink});
  arrow(c,C,600,top-12,540,top-12,C.ink);
},
ebm(c,C,t,p,o){
  const S=SF();
  if(F&&S.x.vac!=null&&S.x.vac>0){c.save();c.globalAlpha=0.12*S.x.vac;c.fillStyle=C.mech;c.fillRect(110,236,420,150);c.restore();}
  c.save();c.setLineDash([4,4]);c.strokeStyle=(F&&S.x.door===0)?C.therm:C.muted;c.strokeRect(110.5,236.5,420,150);c.restore();
  T(c,C,F?(S.x.door?'Chamber '+(S.x.vacTxt||'closed'):'Chamber door OPEN'):'Vacuum chamber ≈10⁻⁵ torr',120,250);
  c.strokeStyle=C.ink;c.strokeRect(240.5,8.5,160,228);
  c.save();c.strokeStyle=C.therm;c.lineWidth=1.6;c.beginPath();c.moveTo(306,22);for(let i=0;i<6;i++)c.lineTo(310+i*5,i%2?30:22);c.stroke();c.restore();
  lead(c,C,306,26,206,26);T(c,C,'W filament (−'+p.V+' kV)',60,26);
  c.save();c.strokeStyle=C.ink;c.lineWidth=2;c.beginPath();c.moveTo(290,22);c.lineTo(290,44);c.lineTo(305,44);c.moveTo(350,22);c.lineTo(350,44);c.lineTo(335,44);c.stroke();
  c.beginPath();c.moveTo(250,70);c.lineTo(312,70);c.moveTo(328,70);c.lineTo(390,70);c.stroke();c.restore();
  lead(c,C,290,40,206,52);T(c,C,'Grid cup (bias)',102,52);
  lead(c,C,256,70,206,78);T(c,C,'Anode (0 V)',122,78);
  [[252,118],[366,118],[252,188],[366,188]].forEach(([x,y],i)=>box(c,C,x,y,22,i<2?28:20,i<2?C.tool:C.panel2));
  lead(c,C,252,132,206,132);T(c,C,'Magnetic lens',100,132);lead(c,C,252,198,206,198);T(c,C,'Deflection coils',88,198);
  c.save();c.strokeStyle=C.ink;c.lineWidth=2;c.beginPath();c.moveTo(280,162);c.lineTo(314,162);c.moveTo(326,162);c.lineTo(360,162);c.stroke();c.restore();
  const on=((t*2.2)%1)<0.4;
  const wy=292;
  if(S.on){c.save();c.globalAlpha=on?0.85:0.18;glow(c,C.accent,on?14:0);c.fillStyle=C.accent;c.beginPath();
  c.moveTo(318,40);c.lineTo(322,40);c.lineTo(330,130);c.lineTo(321,wy);c.lineTo(319,wy);c.lineTo(310,130);c.closePath();c.fill();c.restore();}
  const holes=6, done=S.prog==null?Math.floor((t*0.5)%holes):Math.floor(S.prog*holes);
  if(!S.work)return;
  hatchPath(c,C,()=>{c.beginPath();c.rect(170,wy,300,40);});
  for(let h=0;h<holes;h++){const x=200+h*40;const hx=320-(done-h)*40;if(h<done){c.fillStyle=C.bg;c.fillRect(hx-2,wy,4,40);}}
  if(on&&S.on){c.fillStyle=C.spark;for(let i=0;i<12;i++){const ph=(rnd(i)+t*3)%1;c.fillRect(320+(rnd(i+4)-0.5)*40*ph,wy-ph*40,1.8,1.8);}}
  if(S.on||S.prog==null){c.fillStyle=C.bg;c.fillRect(318,wy,4,on?40:20);}
  T(c,C,'Workpiece ('+p.t+' mm)',180,wy+54,{c:C.ink});
  T(c,C,'pulse '+p.tp+' µs @ '+p.fr+' Hz',420,214,{c:C.ink});
  T(c,C,'v ≈ '+o.beta.toFixed(2)+' c',420,230,{c:C.ink});
},
pam(c,C,t,p,o){
  const S=SF();
  const top=236;
  c.save();c.beginPath();c.moveTo(262,20);c.lineTo(378,20);c.lineTo(352,190);c.lineTo(288,190);c.closePath();c.fillStyle=C.panel2;c.fill();c.strokeStyle=C.ink;c.stroke();
  c.beginPath();c.moveTo(296,90);c.lineTo(344,90);c.lineTo(330,200);c.lineTo(310,200);c.closePath();c.fillStyle=C.tool;c.fill();c.stroke();c.restore();
  box(c,C,312,26,16,108,C.metal2);c.fillStyle=C.ink;c.fillRect(316,128,8,6);
  lead(c,C,312,60,236,60);T(c,C,'Electrode (−)',150,60);lead(c,C,320,131,236,131);T(c,C,'Hf insert',170,131);
  lead(c,C,300,170,236,170);T(c,C,'Cu nozzle',166,170);
  // swirl gas
  c.strokeStyle=C.accent;if(S.fluid)for(let i=0;i<4;i++){const y=60+((t*60+i*20)%60);c.beginPath();c.moveTo(300,y);c.quadraticCurveTo(320,y+6,340,y);c.stroke();}
  T(c,C,{air:'Air',o2:'O₂',n2:'N₂',arh:'Ar–H₂'}[p.gas]+' (swirl)',386,60,{c:C.accent});
  const th=clamp(12+p.t*2.4,12,130);
  if(S.work)cutPlate(c,C,320,top,th,th*0.3,t,20,S.prog);
  if(F&&S.x.ground){c.save();c.strokeStyle=C.therm;c.lineWidth=2;c.beginPath();c.moveTo(600,top+th/2);c.lineTo(630,top+th/2);c.lineTo(630,392);c.stroke();c.restore();}
  const wcol=3+p.I/400*7, fl=1+Math.sin(t*40)*0.15;
  if(S.on&&S.work){c.save();glow(c,C.spark,24);const g=c.createLinearGradient(320-wcol*2,0,320+wcol*2,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(0.5,'#FFF6D6');g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=C.spark;c.beginPath();c.moveTo(316,134);c.lineTo(324,134);c.lineTo(320+wcol*fl,top);c.quadraticCurveTo(322,top+th*0.6,320-th*0.3+2,top+th);c.lineTo(320-th*0.3-2,top+th);c.quadraticCurveTo(318-wcol,top+th*0.6,320-wcol*fl,top);c.closePath();c.fill();
  c.fillStyle=g;c.fillRect(320-wcol,134,wcol*2,top-134);c.restore();
  c.fillStyle=C.therm;for(let i=0;i<20;i++){const ph=(rnd(i)+t*1.1)%1;c.beginPath();c.arc(320-th*0.3-ph*50*rnd(i+5),top+th+ph*(400-top-th),1.5+rnd(i)*1.5,0,7);c.fill();}}
  T(c,C,'Plasma arc '+o.V.toFixed(0)+' V · '+p.I+' A',386,200,{c:C.ink});
  T(c,C,'+ work',580,top+th+14,{a:'right',c:C.therm});T(c,C,'dross',260,392);
  arrow(c,C,600,top-12,540,top-12,C.ink);
},
};
