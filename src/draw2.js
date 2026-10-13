// ---------- schematics for hybrid and nano-finishing processes ----------
Object.assign(DRAW,{
ecg(c,C,t,p,o){const S=SF();if(!S.on)t=F?t:t;
  const cx=320,cy=150,R=95,wy=252;
  // power
  box(c,C,24,30,96,46,C.panel2);T(c,C,'DC '+p.V+' V',72,46,{a:'center',c:C.ink});T(c,C,(S.on?o.I.toFixed(0):'0')+' A',72,62,{a:'center',c:C.ink});
  if(S.work){hatch(c,C,110,wy,420,110);c.strokeStyle=C.ink;c.strokeRect(110.5,wy+.5,419,109);
    const len=S.prog==null?150:S.prog*300;if(len>0){c.fillStyle=C.face;c.fillRect(Math.max(110,cx+20-len),wy,Math.min(len,cx+20-110),5);}
    T(c,C,'Workpiece (+ anode)',120,wy+98,{c:C.therm});}
  if(S.tool){const a=S.on?t*6:0;c.save();c.beginPath();c.arc(cx,cy,R,0,7);c.fillStyle=C.metal2;c.fill();c.strokeStyle=C.ink;c.stroke();
    c.beginPath();c.arc(cx,cy,R-10,0,7);c.fillStyle=C.panel2;c.fill();c.stroke();
    c.fillStyle=C.tool;for(let i=0;i<48;i++){const th=a+i*Math.PI/24;c.beginPath();c.arc(cx+(R-4)*Math.cos(th),cy+(R-4)*Math.sin(th),2.2,0,7);c.fill();}
    c.strokeStyle=C.ink;for(let i=0;i<4;i++){const th=a+i*Math.PI/2;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+(R-12)*Math.cos(th),cy+(R-12)*Math.sin(th));c.stroke();}c.restore();
    T(c,C,'Diamond wheel',cx+R+10,cy-66,{c:C.ink});T(c,C,'(− cathode)',cx+R+10,cy-52,{c:C.mech});}
  if(S.fluid){c.save();c.strokeStyle=C.fluid2;c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(150,150);c.quadraticCurveTo(220,240,cx-30,wy-4);c.stroke();c.restore();box(c,C,130,138,30,18,C.panel2);T(c,C,'Electrolyte',100,126,{c:C.accent,a:'right'});
    c.fillStyle=C.fluid2;c.fillRect(cx-60,wy-6,120,6);}
  if(S.on&&S.tool&&S.work){for(let i=0;i<18;i++){const ph=(rnd(i)+t*0.6)%1;c.fillStyle=i%3?C.chem:C.therm;c.beginPath();c.arc(cx-60+ph*140,wy-3+(rnd(i+3)-0.5)*3,1.6,0,7);c.fill();}}
  T(c,C,'gap ≈ '+p.g+' mm (grain protrusion)',cx+70,wy-14,{c:C.ink});
  if(S.on){arrow(c,C,560,wy+40,500,wy+40,C.ink);T(c,C,'table feed',560,wy+26,{a:'right'});}
},
ecdm(c,C,t,p,o){const S=SF();
  c.strokeStyle=C.ink;c.strokeRect(60.5,140.5,520,240);
  if(S.fluid){c.fillStyle=C.fluid;c.fillRect(61,150,518,230);T(c,C,'NaOH '+p.c+' wt %',70,166,{c:C.accent});}
  box(c,C,522,170,14,190,C.metal2);T(c,C,'Anode (+)',500,160,{c:C.therm});
  const wy=300;const dep=S.prog==null?24:Math.min(48,(o.h/600)*48*(S.prog||0)/(1));
  if(S.work){hatchPath(c,C,()=>{c.beginPath();c.moveTo(150,wy);c.lineTo(312,wy);c.lineTo(314,wy+dep);c.lineTo(326,wy+dep);c.lineTo(328,wy);c.lineTo(490,wy);c.lineTo(490,wy+60);c.lineTo(150,wy+60);c.closePath();});T(c,C,'Glass workpiece',160,wy+50,{c:C.ink});}
  const tipY=S.work?wy+dep-2:wy-2;const lift=(S.on||S.prog>0||S.prog==null)?0:40;
  if(S.tool){box(c,C,316,30,8,tipY-30-lift,C.tool);T(c,C,'Tool (− cathode) ø'+p.d+' mm',332,60,{c:C.ink});}
  box(c,C,24,30,90,46,C.panel2);T(c,C,'DC '+p.V+' V',69,46,{a:'center',c:C.ink});T(c,C,'V_c ≈ '+o.Vc.toFixed(1)+' V',69,62,{a:'center',c:C.muted});
  if(S.on&&S.tool){c.strokeStyle=C.muted;for(let i=0;i<14;i++){const ph=(rnd(i)+t*0.8)%1;c.beginPath();c.arc(312+rnd(i+2)*16,tipY-lift-ph*80,1.5+rnd(i)*2,0,7);c.stroke();}
    if(p.V>o.Vc){const k=Math.floor(t*16);for(let j=0;j<2;j++){const x=314+rnd(k+j)*12;c.save();glow(c,C.spark,12);c.strokeStyle=C.spark;c.lineWidth=1.4;c.beginPath();c.moveTo(x,tipY-lift-6);c.lineTo(x+(rnd(k+j+5)-0.5)*10,tipY-lift+2);c.stroke();c.restore();}
      T(c,C,'gas film + discharges',340,tipY-lift-20,{c:C.therm});}}
  T(c,C,'depth '+(S.prog==null?o.h:o.h*(S.prog||0)).toFixed(0)+' µm',340,wy+dep+14,{c:C.ink});
},
rum(c,C,t,p,o){const S=SF();
  const vib=S.on&&p.A0>0?(1+p.A0/40*4)*Math.sin(t*40):0;
  box(c,C,250,14,140,56,C.panel2);T(c,C,'Spindle '+p.N+' rpm',320,42,{a:'center',c:C.ink});
  for(let i=0;i<4;i++)box(c,C,272,70+i*8+vib*0.2,96,8,i%2?C.panel2:C.tool);
  T(c,C,'Ultrasonic transducer',378,84);
  const wy=260,dep=S.prog==null?30:S.prog*60;const lift=(S.on||S.prog>0||S.prog==null)?0:30;
  const half=clamp(p.D*3.2,20,48),wall=clamp(p.w*5,4,10);const tb=wy+dep+vib-lift;
  if(S.work){hatch(c,C,130,wy,380,110);c.strokeStyle=C.ink;c.strokeRect(130.5,wy+.5,379,109);
    if(dep>0){c.fillStyle=C.panel;c.fillRect(320-half,wy,wall,dep);c.fillRect(320+half-wall,wy,wall,dep);}
    T(c,C,'Ceramic workpiece',140,wy+98,{c:C.ink});}
  if(S.tool){const y0=104;c.save();c.fillStyle=C.metal2;c.fillRect(320-half,y0,wall,tb-y0);c.fillRect(320+half-wall,y0,wall,tb-y0);c.fillRect(320-half,y0,2*half,10);
    c.beginPath();c.rect(320-half,y0+10,2*half,tb-y0-10);c.clip();c.strokeStyle=C.ink;c.globalAlpha=0.35;const off=S.on?(t*30)%14:0;for(let y=y0-20;y<tb+20;y+=14){c.beginPath();c.moveTo(320-half,y+off);c.lineTo(320+half,y+off+10);c.stroke();}c.restore();
    c.fillStyle=C.tool;c.fillRect(320-half,tb-6,wall,6);c.fillRect(320+half-wall,tb-6,wall,6);
    lead(c,C,320+half,tb-20,440,200);T(c,C,'Diamond core drill',446,200);}
  if(S.fluid&&S.tool){c.save();c.setLineDash([4,6]);c.lineDashOffset=-(S.on?t*40:0);c.strokeStyle=C.accent;c.lineWidth=2;c.beginPath();c.moveTo(320,60);c.lineTo(320,tb);c.stroke();c.restore();T(c,C,'Through-tool coolant',236,140,{c:C.accent,a:'right'});lead(c,C,318,140,242,140);}
  T(c,C,(p.A0>0?'↕ '+p.A0+' µm @ 20 kHz':'No vibration (conventional)'),410,120,{c:C.ink});
},
lam(c,C,t,p,o){const S=SF();
  box(c,C,24,110,44,180,C.panel2);T(c,C,'Chuck',46,300,{a:'center'});
  const y0=140,h=120,xT=430;const cut=S.prog==null?200:S.prog*300;
  if(S.work){hatch(c,C,68,y0,452,h);
    if(cut>0){c.fillStyle=C.panel;c.fillRect(Math.max(68,xT-cut),y0,Math.min(cut,xT-68),8);}
    c.strokeStyle=C.ink;c.strokeRect(68.5,y0+.5,451,h-1);
    if(S.on){c.save();c.beginPath();c.rect(68,y0,452,h);c.clip();c.strokeStyle=C.metal2;c.globalAlpha=0.6;const off=(t*80)%30;for(let x=60;x<540;x+=30){c.beginPath();c.moveTo(x+off,y0);c.lineTo(x+off-12,y0+h);c.stroke();}c.restore();}
    T(c,C,p.mat==='si3n4'?'Si₃N₄ bar':(p.mat==='ti'?'Ti-6Al-4V bar':'Inconel 718 bar'),80,y0+h+14,{c:C.ink});}
  // laser
  box(c,C,470,10,120,40,C.panel2);T(c,C,'Laser head',530,30,{a:'center',c:C.ink});
  const las=S.on&&(F==null||S.x.las);const spotX=xT+30;
  if(las&&S.work){c.save();glow(c,C.spark,12);c.fillStyle=C.spark;c.globalAlpha=0.6;c.beginPath();c.moveTo(522,50);c.lineTo(538,50);c.lineTo(spotX+4,y0);c.lineTo(spotX-4,y0);c.closePath();c.fill();c.restore();
    const g=c.createRadialGradient(spotX,y0+4,2,spotX,y0+4,40);g.addColorStop(0,C.spark);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.globalAlpha=0.8;c.fillRect(spotX-40,y0,80,40);c.globalAlpha=1;
    T(c,C,'laser spot · '+o.T.toFixed(0)+' °C',spotX+10,y0-28,{c:C.therm});}
  if(S.tool){c.save();c.beginPath();c.moveTo(xT-14,y0-50);c.lineTo(xT+14,y0-50);c.lineTo(xT+4,y0);c.lineTo(xT-6,y0);c.closePath();c.fillStyle=C.tool;c.fill();c.strokeStyle=C.ink;c.stroke();c.restore();
    box(c,C,xT-20,y0-90,40,40,C.panel2);T(c,C,'Insert + tool post',xT-30,y0-100,{a:'right'});
    if(S.on&&S.work){c.save();c.strokeStyle=C.therm;c.lineWidth=2;c.beginPath();const k=(t*3)%1;c.arc(xT-20,y0-12,10+k*8,-0.4,2.6);c.stroke();c.restore();}}
  if(S.on){arrow(c,C,xT-20,y0+h+34,xT-90,y0+h+34,C.ink);T(c,C,'feed',xT-20,y0+h+48,{a:'right'});}
  T(c,C,'Fc ≈ '+o.Fc.toFixed(0)+' N',30,40,{c:C.ink});
},
afm(c,C,t,p,o){const S=SF();
  const dir=S.on?Math.sin(t*1.6):0;
  // cylinders
  [[240,20],[240,270]].forEach(([x,y],i)=>{c.strokeStyle=C.ink;c.strokeRect(x+.5,y+.5,159,109);
    const lvl=S.fluid?(i===0?0.5+0.4*dir:0.5-0.4*dir):0;if(lvl>0){c.fillStyle=C.tool;c.globalAlpha=0.55;const hh=110*lvl;c.fillRect(x+1,i===0?y+110-hh:y,158,hh);c.globalAlpha=1;}
    const py=i===0?y+110*(1-lvl)-10:y+110*lvl;box(c,C,x+4,clamp(py,y,y+100),152,10,C.metal2);});
  T(c,C,'Upper media cylinder',410,40);T(c,C,'Lower media cylinder',410,360);
  // fixture + work with passage
  c.strokeStyle=C.ink;c.strokeRect(180.5,130.5,279,139);T(c,C,'Fixture',190,144);
  if(S.work){hatchPath(c,C,()=>{c.beginPath();c.rect(240,140,160,120);});c.fillStyle=S.fluid?C.tool:C.panel;c.globalAlpha=S.fluid?0.55:1;c.fillRect(304,140,32,120);c.globalAlpha=1;
    c.strokeStyle=C.ink;c.strokeRect(304.5,140.5,31,119);T(c,C,'Workpiece passage',410,200);}
  if(S.on&&S.work&&S.fluid){c.fillStyle=C.ink;for(let i=0;i<30;i++){const ph=(rnd(i)+t*0.5*Math.sign(dir||1))%1;const y=140+((ph+1)%1)*120;c.fillRect(306+rnd(i+4)*28,y,1.8,1.8);}
    arrow(c,C,470,200-30*Math.sign(dir),470,200+30*Math.sign(dir),C.accent);}
  T(c,C,'Ra '+(S.prog==null?o.Ra:(p.Ra0-(p.Ra0-o.Ra)*(S.prog||0))).toFixed(2)+' µm',24,200,{c:C.ink});
  T(c,C,p.p+' MPa · '+p.C+' % abrasive',24,216);
},
maf(c,C,t,p,o){const S=SF();
  const mag=F==null||S.x.mag;
  box(c,C,250,40,140,92,C.therm);T(c,C,'N',320,86,{a:'center',c:C.panel,s:22,w:700});
  box(c,C,250,268,140,92,C.mech);T(c,C,'S',320,314,{a:'center',c:C.panel,s:22,w:700});
  T(c,C,(mag?'Field '+p.B+' T':'Magnet off'),400,60,{c:mag?C.ink:C.muted});
  const y0=170,h=60;
  if(S.work){hatch(c,C,90,y0,460,h);c.strokeStyle=C.ink;c.strokeRect(90.5,y0+.5,459,h-1);
    if(S.on){c.save();c.beginPath();c.rect(90,y0,460,h);c.clip();c.strokeStyle=C.metal2;c.globalAlpha=0.6;const off=(t*60)%24;for(let x=80;x<560;x+=24){c.beginPath();c.moveTo(x+off,y0);c.lineTo(x+off-10,y0+h);c.stroke();}c.restore();}
    T(c,C,'Rotating workpiece',100,y0+h+16,{c:C.ink});}
  if(S.fluid){c.fillStyle=C.ink;
    if(mag){for(let k=0;k<12;k++){const x=258+k*11;for(let j=0;j<7;j++){const jit=S.on?Math.sin(t*8+k+j)*0.8:0;c.beginPath();c.arc(x+jit,134+j*5,2,0,7);c.fill();c.beginPath();c.arc(x+jit,234+j*5,2,0,7);c.fill();}}T(c,C,'Magnetic abrasive brush',400,150);}
    else{for(let i=0;i<60;i++){c.beginPath();c.arc(258+rnd(i)*124,258+rnd(i+9)*8,1.8,0,7);c.fill();}T(c,C,'Loose abrasive (no field)',400,250);}}
  T(c,C,'P_m = '+o.Pm.toFixed(1)+' kPa',24,40,{c:C.ink});
  T(c,C,'Ra '+(S.prog==null?o.Ra:(p.Ra0-(p.Ra0-o.Ra)*(S.prog||0))).toFixed(3)+' µm',24,56,{c:C.ink});
},
mrf(c,C,t,p,o){const S=SF();const mag=F==null||S.x.mag;const spin=S.on||F==null||S.x.spin;
  const cx=320,cy=262,R=100;
  c.save();c.beginPath();c.arc(cx,cy,R,0,7);c.fillStyle=C.panel2;c.fill();c.strokeStyle=C.ink;c.stroke();
  const a=spin?t*2:0;for(let i=0;i<6;i++){c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+R*Math.cos(a+i*Math.PI/3),cy+R*Math.sin(a+i*Math.PI/3));c.stroke();}c.restore();
  box(c,C,cx-40,cy+R-10,80,40,mag?C.therm:C.panel2);T(c,C,'Electromagnet'+(mag?' ON':''),cx+50,cy+R+12,{c:mag?C.therm:C.muted});
  if(S.fluid){c.save();c.lineWidth=mag?9:5;c.strokeStyle=mag?C.mech:C.fluid2;c.beginPath();c.arc(cx,cy,R+5,Math.PI*1.12,Math.PI*1.88);c.stroke();c.restore();
    box(c,C,120,170,36,16,C.panel2);T(c,C,'MR fluid nozzle',96,160,{c:C.accent});box(c,C,486,170,36,16,C.panel2);T(c,C,'Suction',504,200,{a:'center'});
    if(spin){c.fillStyle=C.ink;for(let i=0;i<20;i++){const ph=(rnd(i)+t*0.4)%1;const an=Math.PI*1.12+ph*Math.PI*0.76;c.beginPath();c.arc(cx+(R+5)*Math.cos(an),cy+(R+5)*Math.sin(an),1.4,0,7);c.fill();}}}
  if(S.work){const down=(S.on||S.prog>0||S.prog==null)?0:-30;const ly=cy-R-26+down;
    c.save();c.beginPath();c.ellipse(cx,ly,70,16,0,0,7);c.fillStyle=C.face;c.fill();c.strokeStyle=C.ink;c.stroke();c.restore();box(c,C,cx-10,ly-70,20,56,C.metal2);
    T(c,C,'Optic (lens) on spindle',cx-82,ly-40,{c:C.ink,a:'right'});
    if(S.on&&mag){c.save();glow(c,C.accent,10);c.fillStyle=C.accent;c.globalAlpha=0.5;c.beginPath();c.ellipse(cx,cy-R-6,18,5,0,0,7);c.fill();c.restore();T(c,C,'polishing spot',cx+26,cy-R-22,{c:C.accent});}}
  T(c,C,o.rr.toFixed(2)+' µm/min · P '+o.P.toFixed(0)+' kPa',24,40,{c:C.ink});
},
cmp(c,C,t,p,o){const S=SF();const spin=S.on||F==null||S.x.spin;
  const cx=320,cy=280;
  c.save();c.beginPath();c.ellipse(cx,cy,270,80,0,0,7);c.fillStyle=C.panel2;c.fill();c.strokeStyle=C.ink;c.stroke();
  c.beginPath();c.ellipse(cx,cy+16,270,80,0,0,Math.PI);c.stroke();
  const a=spin?t*0.8:0;c.strokeStyle=C.line;for(let i=0;i<8;i++){const an=a+i*Math.PI/4;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+250*Math.cos(an),cy+72*Math.sin(an));c.stroke();}c.restore();
  T(c,C,'Polishing pad on rotating platen',40,380,{c:C.ink});
  if(S.fluid){box(c,C,120,90,60,16,C.panel2);T(c,C,'Slurry arm',150,80,{a:'center',c:C.accent});c.fillStyle=C.fluid2;for(let i=0;i<5;i++){const ph=(rnd(i)+t*1.2)%1;c.beginPath();c.arc(170,106+ph*130,2.5,0,7);c.fill();}
    c.fillStyle=C.fluid;c.beginPath();c.ellipse(cx-40,cy,160,40,0,0,7);c.fill();}
  box(c,C,90,250,60,14,C.metal2);T(c,C,'Pad conditioner',60,240);
  const down=(F==null||S.x.down)?0:-40;
  const wx=410+(spin?Math.cos(t*0.6)*14:0),wy=250+down;
  box(c,C,wx-8,60,16,wy-70,C.metal2);
  c.save();c.beginPath();c.ellipse(wx,wy-10,72,20,0,0,7);c.fillStyle=C.metal2;c.fill();c.strokeStyle=C.ink;c.stroke();c.restore();
  if(S.work){c.save();c.beginPath();c.ellipse(wx,wy,64,16,0,0,7);c.fillStyle=C.face;c.fill();c.strokeStyle=C.ink;c.stroke();c.restore();}
  T(c,C,'Wafer carrier'+(S.work?' + wafer (face down)':''),wx+80,wy-30,{c:C.ink});
  // film thickness inset
  const ix=24,iy=24;box(c,C,ix,iy,170,44,C.panel,C.line);T(c,C,'Film remaining',ix+8,iy+12);
  const frac=S.prog==null?0.5:Math.max(0,1-(S.prog||0)*Math.min(1,o.rr*1/(p.h)));c.fillStyle=C.accent;c.fillRect(ix+8,iy+24,150*frac,10);c.strokeStyle=C.line;c.strokeRect(ix+8.5,iy+24.5,150,10);
},
ibm(c,C,t,p,o){const S=SF();
  if(F&&S.x.vac>0){c.save();c.globalAlpha=0.12*S.x.vac;c.fillStyle=C.mech;c.fillRect(20,60,600,320);c.restore();}
  c.save();c.setLineDash([4,4]);c.strokeStyle=(F&&S.x.door===0)?C.therm:C.muted;c.strokeRect(20.5,60.5,600,320);c.restore();
  T(c,C,F?(S.x.door?'Chamber '+(S.x.vacTxt||'closed'):'Chamber door OPEN'):'Vacuum chamber ≈10⁻⁴ torr',30,76);
  box(c,C,50,150,90,100,C.panel2);T(c,C,'Ar⁺ ion source',95,140,{a:'center',c:C.ink});
  c.strokeStyle=C.ink;for(let i=0;i<3;i++){c.beginPath();c.moveTo(146+i*6,155);c.lineTo(146+i*6,245);c.stroke();}T(c,C,'grids',152,260);
  const beam=S.on||F==null;const tx=470,ty=200;
  if(beam){c.save();c.fillStyle=C.accent;c.globalAlpha=0.25;c.beginPath();c.moveTo(160,160);c.lineTo(tx,ty-40);c.lineTo(tx,ty+40);c.lineTo(160,240);c.closePath();c.fill();c.restore();
    c.fillStyle=C.accent;for(let i=0;i<30;i++){const ph=(rnd(i)+t*1.5)%1;c.fillRect(160+ph*(tx-160),200+(rnd(i+3)-0.5)*(80-ph*0),2,2);}
    if(F==null||S.x.neut){c.save();c.strokeStyle=C.therm;c.lineWidth=1.4;c.beginPath();c.moveTo(220,290);for(let i=0;i<6;i++)c.lineTo(226+i*6,i%2?296:290);c.stroke();c.restore();T(c,C,'neutraliser e⁻',210,310,{c:C.therm});}}
  if(S.work){c.save();c.translate(tx,ty);c.rotate(p.th*Math.PI/180);c.fillStyle=C.metal;c.fillRect(0,-60,26,120);c.strokeStyle=C.ink;c.strokeRect(0.5,-59.5,25,119);c.restore();
    T(c,C,'Target · θ = '+p.th+'°',tx+40,ty+80,{c:C.ink});
    if(S.on||F==null){c.fillStyle=C.spark;for(let i=0;i<16;i++){const ph=(rnd(i+20)+t*1.2)%1;const an=Math.PI+(rnd(i)-0.5)*1.6;c.fillRect(tx-2+Math.cos(an)*ph*90,ty+(rnd(i+7)-0.5)*60+Math.sin(an)*ph*60,1.8,1.8);}T(c,C,'sputtered atoms',tx-150,ty-70,{c:C.therm});}}
  T(c,C,'Y = '+o.Y.toFixed(2)+' · '+o.rr.toFixed(1)+' nm/min',380,100,{c:C.ink});
},
});
