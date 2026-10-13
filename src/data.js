// ---------- shared physical data ----------
const FARADAY = 96485;
// Thermal property sets: rho kg/m3, c J/kgK, Tm K, Lm J/kg, Tb K, Lv J/kg, alpha m2/s
const TH = {
  steel:   {name:'Tool / mild steel', rho:7850, c:470, Tm:1800, Lm:2.7e5, Tb:3134, Lv:6.09e6, a:1.2e-5},
  ss:      {name:'Stainless steel 304', rho:8000, c:500, Tm:1720, Lm:2.7e5, Tb:3100, Lv:6.1e6, a:4.0e-6},
  ti:      {name:'Ti-6Al-4V', rho:4430, c:560, Tm:1933, Lm:2.9e5, Tb:3560, Lv:8.88e6, a:2.9e-6},
  inco:    {name:'Inconel 718', rho:8190, c:435, Tm:1609, Lm:2.27e5, Tb:3186, Lv:6.3e6, a:3.1e-6},
  al:      {name:'Al 6061', rho:2700, c:900, Tm:925, Lm:3.97e5, Tb:2743, Lv:1.05e7, a:6.4e-5},
  wc:      {name:'WC-Co (cemented carbide)', rho:14500, c:200, Tm:3058, Lm:3.3e5, Tb:6000, Lv:4.0e6, a:3.0e-5},
  ni:      {name:'Nickel superalloy', rho:8900, c:444, Tm:1728, Lm:2.98e5, Tb:3186, Lv:6.3e6, a:3.5e-6},
  w:       {name:'Tungsten', rho:19300, c:134, Tm:3695, Lm:1.92e5, Tb:5828, Lv:4.38e6, a:6.6e-5},
};
// energy to melt (J/mm3) and to vaporise (J/mm3) from room temperature
const eMelt = m => m.rho*(m.c*(m.Tm-298)+m.Lm)*1e-9;
const eVap  = m => m.rho*(m.c*(m.Tb-298)+m.Lm+m.Lv)*1e-9;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

// ---------- process definitions ----------
const PROCESSES = [
/* ======================= USM ======================= */
{
 id:'usm', abbr:'USM', name:'Ultrasonic Machining', cat:'mech',
 blurb:'A tool vibrating at about 20 kHz hammers abrasive grains into hard, brittle work.',
 facts:{energy:'Mechanical (ultrasonic vibration)', mech:'Brittle micro-chipping by impacting grits', medium:'Abrasive slurry (B₄C, SiC, Al₂O₃ in water)', tool:'Soft steel, brass, monel; shaped like the cavity'},
 aim:'To study the effect of vibration amplitude, static feed force, grit size and slurry concentration on the material removal rate (MRR) and penetration rate in ultrasonic machining of brittle materials.',
 params:[
  {id:'A0',label:'Vibration amplitude A₀',unit:'µm',min:10,max:60,step:1,val:25},
  {id:'f',label:'Frequency f',unit:'kHz',min:18,max:40,step:0.5,val:20},
  {id:'F',label:'Static feed force F',unit:'N',min:5,max:80,step:1,val:20},
  {id:'d',label:'Mean grit diameter d',unit:'µm',min:10,max:150,step:1,val:50},
  {id:'C',label:'Slurry concentration C',unit:'% vol',min:10,max:60,step:1,val:30},
  {id:'area',label:'Tool face area',unit:'mm²',min:10,max:200,step:1,val:80},
  {id:'mat',label:'Work material',type:'select',val:'glass',options:[['glass','Soda-lime glass (index 100)'],['brass','Brass (6.6)'],['w','Tungsten (4.8)'],['ti','Titanium (4.0)'],['steel','Steel (3.9)']]},
 ],
 mats:{glass:100,brass:6.6,w:4.8,ti:4.0,steel:3.9},
 outputs:[
  {k:'mrr',label:'MRR',unit:'mm³/min',pri:1},
  {k:'pen',label:'Penetration rate',unit:'mm/min'},
  {k:'h',label:'Grit indentation depth',unit:'µm'},
  {k:'Ng',label:'Active grits under tool',unit:''},
  {k:'Ra',label:'Surface roughness Ra (est.)',unit:'µm'},
  {k:'t5',label:'Time to sink 5 mm',unit:'min'},
 ],
 sweep:{x:'F',y:'mrr'},
 compute(p){
  const R=this.mats[p.mat];
  const A=p.area*1e-6, d=p.d*1e-6, A0=p.A0*1e-6, f=p.f*1e3, C=p.C/100;
  const Ng=C*0.25*A/(Math.PI*d*d/4);
  const H=5.5e9;
  const h=Math.sqrt(8*p.F*A0/(Math.PI*H*Ng*d));
  const Vg=2/3*Math.PI*Math.pow(d*h,1.5);
  const Fc=0.6*p.area, crush=1/(1+Math.pow(p.F/Fc,3));
  const mrr=0.05*Ng*Vg*f*(R/100)*crush*1e9*60;
  const pen=mrr/p.area;
  const notes=[];
  if(p.F>0.8*Fc) notes.push(`Static force is near or above the grit-crushing limit (~${(0.69*Fc).toFixed(0)} N for this tool area). Grains fracture before they cut, so MRR falls.`);
  if(p.d>p.A0*3) notes.push('Grit is much larger than the amplitude. Grains may not be re-circulated under the tool efficiently.');
  if(R<10) notes.push('Ductile metals deform instead of chipping, so USM is rarely economical on them.');
  return {o:{mrr,pen,h:h*1e6,Ng:Math.round(Ng),Ra:0.012*p.d,t5:5/pen},notes};
 },
 theory:{
  principle:[
   'A piezoelectric or magnetostrictive transducer turns high-frequency electrical power (19–25 kHz) into longitudinal vibration. A tapered horn (concentrator) amplifies this to an amplitude of roughly 10–50 µm at the tool face.',
   'Abrasive slurry is pumped into the gap. On every downstroke the tool drives grains into the work. In hard, brittle materials each impact creates a tiny Hertzian crack field and a chip breaks away. The tool is fed down under a small static force, so the cavity takes the shape of the tool plus an overcut of about one grit size.',
   'The tool itself is made of a tough, ductile metal. It wears, but far more slowly than the brittle workpiece, because the same impacts only dent it plastically.'
  ],
  eq:[
   {f:'<var>h</var><sub>w</sub> = √( 8<var>F</var><var>A</var><sub>0</sub> / (π<var>H</var><var>N</var><sub>g</sub><var>d</var>) )',w:'Shaw\'s impact model: the static feed force F equals the time-average of the short impulsive grit forces (σπ·d·h per grit, acting for a fraction ≈ h/4A₀ of each cycle). N_g grits of diameter d indent a surface of hardness H by h_w.'},
   {f:'<var>V</var><sub>g</sub> = ⅔ π (<var>d</var>·<var>h</var><sub>w</sub>)<sup>3/2</sup>',w:'Volume of the hemispherical chip under one grit (crater radius ≈ √(d·h_w)).'},
   {f:'MRR = κ · <var>N</var><sub>g</sub> · <var>V</var><sub>g</sub> · <var>f</var>  ⇒  MRR ∝ <var>A</var><sub>0</sub><sup>3/4</sup> <var>F</var><sup>3/4</sup> <var>C</var><sup>1/4</sup>',w:'κ is the fraction of grits that actually impact per cycle. The exponents are the classical trends of Shaw\'s model.'},
  ],
  effects:['Higher amplitude raises MRR as A₀^¾; it is the strongest lever after frequency.','MRR rises with feed force, peaks, then falls once grains begin to crush.','Concentration has a weak effect (C^¼); above ~30–40 % the gain is small.','Finer grit gives a better finish (Ra scales with grit size) but lower MRR.','Brittle materials (glass, ceramics, germanium, ferrite) machine 10–25× faster than metals.'],
  apps:['Holes and cavities in glass, ceramics, quartz and ferrites','Dies and wire-drawing nozzles in WC','Coining-type shaped cavities and fine slots','Drilling of gemstones and silicon'],
  adv:['Machines non-conductive, hard, brittle materials','No thermal damage or residual tensile stress','Good finish and accuracy; burr-free'],
  lim:['Low MRR, especially on ductile metals','Tool wear needs frequent tool replacement for accurate work','Hole depth limited by slurry circulation (taper in deep holes)'],
  model:'<b>Simulator model.</b> Shaw\'s impact model with κ = 0.05, calibrated so that glass gives about 2 mm/min penetration (≈190 mm³/min with an 80 mm² tool) at 20 kHz and 25 µm. Active grits N_g = 0.25·C·A/(πd²/4). Other materials are scaled with the relative USM machinability index (glass = 100, Ghosh & Mallik). Grit crushing is a simple empirical penalty 1/(1+(F/F_c)³) with F_c = 0.6 N per mm² of tool area. Ra ≈ 0.012·d is a rule of thumb. Treat outputs as trend estimates.'
 },
 procedure:['Select the work material and fix the tool area.','Set amplitude 25 µm, frequency 20 kHz, grit 50 µm and 30 % slurry.','Vary the static force from 5 N to 80 N in steps and record MRR at each step.','Plot MRR against force and identify the optimum force.','Repeat with amplitude 15 µm and 40 µm and compare the curves.','Change grit size and note the trade-off between MRR and Ra.'],
 quiz:[
  {q:'In ultrasonic machining, material is removed mainly by…',o:['Melting and vaporisation','Micro-chipping of brittle work by hammered abrasive grains','Anodic dissolution','Chemical reaction with the slurry'],a:1,why:'The tool never touches the work. It drives grains into the surface, which fractures brittle material in tiny chips.'},
  {q:'A typical USM operating frequency is…',o:['50–60 Hz','19–25 kHz','200–300 kHz','1–2 MHz'],a:1,why:'Just above the audible range, around 20 kHz, where transducers and horns can deliver large amplitudes.'},
  {q:'By Shaw\'s analysis, how does MRR vary with vibration amplitude A₀?',o:['Independent of A₀','∝ A₀²','∝ A₀^(3/4)','∝ 1/A₀'],a:2,why:'Indentation depth grows with √(F·A₀), and chip volume with (d·h)^1.5, giving A₀^(3/4).'},
  {q:'Which work material is least suited to USM?',o:['Glass','Alumina ceramic','Annealed mild steel','Germanium'],a:2,why:'Ductile metals absorb impacts plastically rather than chipping; their relative removal rate is only a few percent of glass.'},
  {q:'Why is the USM tool made of a tough, ductile metal rather than a hard one?',o:['To conduct the current','So it deforms plastically and wears slowly while brittle work chips','To make it magnetic','To absorb slurry'],a:1,why:'A ductile tool survives the repeated impacts; a hard brittle tool would chip just like the workpiece.'},
 ]
},
/* ======================= AJM ======================= */
{
 id:'ajm', abbr:'AJM', name:'Abrasive Jet Machining', cat:'mech',
 blurb:'A high-speed stream of fine abrasive in dry gas erodes brittle and heat-sensitive material.',
 facts:{energy:'Mechanical (kinetic energy of particles)', mech:'Erosion by micro-cutting and brittle fracture', medium:'Dry air, N₂ or CO₂ carrying 10–50 µm grit', tool:'WC or sapphire nozzle, 0.2–1.0 mm bore'},
 aim:'To study how nozzle pressure, abrasive flow rate, grit size and stand-off distance (SOD) affect MRR and kerf width in abrasive jet machining.',
 params:[
  {id:'p',label:'Nozzle pressure',unit:'bar',min:2,max:10,step:0.1,val:6},
  {id:'ma',label:'Abrasive flow rate',unit:'g/min',min:2,max:20,step:0.5,val:8},
  {id:'d',label:'Grit diameter',unit:'µm',min:10,max:60,step:1,val:25},
  {id:'sod',label:'Stand-off distance',unit:'mm',min:0.5,max:15,step:0.1,val:1},
  {id:'dn',label:'Nozzle bore',unit:'mm',min:0.2,max:1.0,step:0.05,val:0.45},
  {id:'al',label:'Jet divergence half-angle α',unit:'°',min:2,max:15,step:0.5,val:7},
  {id:'ang',label:'Impact angle θ (90° = normal)',unit:'°',min:10,max:90,step:1,val:90},
  {id:'ab',label:'Abrasive',type:'select',val:'al2o3',options:[['al2o3','Aluminium oxide (ρ 3.95 g/cc)'],['sic','Silicon carbide (ρ 3.21 g/cc)'],['glass','Glass beads (ρ 2.50 g/cc)']]},
  {id:'mat',label:'Work material',type:'select',val:'glass',options:[['glass','Glass (H ≈ 5.5 GPa)'],['si','Silicon (H ≈ 10 GPa)'],['quartz','Quartz (H ≈ 11 GPa)'],['alumina','Alumina ceramic (H ≈ 15 GPa)'],['alu','Aluminium alloy, ductile (p ≈ 1.0 GPa)'],['ms','Mild steel, ductile (p ≈ 1.5 GPa)']]},
 ],
 abr:{al2o3:3950,sic:3210,glass:2500}, hard:{glass:5.5e9,si:10e9,quartz:11e9,alumina:15e9,alu:1.0e9,ms:1.5e9},
 outputs:[
  {k:'mrr',label:'MRR',unit:'mm³/min',pri:1},
  {k:'v',label:'Particle velocity',unit:'m/s'},
  {k:'N',label:'Particle flux',unit:'×10⁶ /s'},
  {k:'ke',label:'KE per particle',unit:'µJ'},
  {k:'kerf',label:'Kerf width at work',unit:'mm'},
  {k:'g',label:'SOD efficiency',unit:'%'},
 ],
 sweep:{x:'sod',y:'mrr'},
 compute(p){
  const rho=this.abr[p.ab], H=this.hard[p.mat], d=p.d*1e-6;
  const v=300*Math.sqrt(p.p/10)*(1-0.015*p.ma);
  const mp=rho*Math.PI/6*d*d*d;
  const N=(p.ma/1000/60)/mp;
  const g=Math.exp(-Math.pow(Math.log(p.sod/0.8),2)/(2*1.4*1.4));
  const th=(p.ang??90)*Math.PI/180;
  let mrr;
  if(p.model==='finnie'){const f=Math.tan(th)<=1/3?Math.sin(2*th)-3*Math.pow(Math.sin(th),2):Math.pow(Math.cos(th),2)/3;mrr=0.5*N*mp*v*v/(H*2*2)*Math.max(f,0)*g*1e9*60;}
  else mrr=0.25*N*d*d*d*Math.pow(v*Math.sin(th),1.5)*Math.pow(rho/(12*H),0.75)*g*1e9*60;
  const kerf=p.dn+2*p.sod*Math.tan(p.al*Math.PI/180);
  const notes=[];
  const ductile=p.mat==='alu'||p.mat==='ms';
  if(p.model==='finnie'&&!ductile) notes.push('Finnie\'s model describes ductile micro-cutting. For glass and ceramics the brittle-fracture model applies.');
  if(p.model!=='finnie'&&ductile) notes.push('The brittle-fracture model does not apply to ductile metals. Select Finnie\'s ductile model.');
  if(p.model==='finnie'&&(p.ang??90)>=80) notes.push('Finnie\'s model predicts almost no erosion near normal incidence, a known limitation: real ductile metals still erode slowly at 90°.');
  if(p.sod>6) notes.push('Large SOD: the jet has spread and slowed, so MRR drops and the kerf widens with a rounded edge.');
  if(p.ma>15) notes.push('High abrasive loading reduces gas velocity per particle; gains in MRR flatten.');
  if(p.sod<0.6) notes.push('Very small SOD: rebounding grit interferes with incoming grit and the nozzle wears quickly.');
  return {o:{mrr,v,N:N/1e6,ke:0.5*mp*v*v*1e6,kerf,g:g*100},notes};
 },
 theory:{
  principle:[
   'Dry gas at 2–10 bar is mixed with fine abrasive in a mixing chamber (a vibrator meters the powder) and expanded through a small nozzle. Particles leave at roughly 150–300 m/s.',
   'Each particle striking a brittle surface creates a small crater by fracture; on ductile surfaces it cuts or ploughs. The jet diverges with a half-angle α of a few degrees, so the cut width grows with stand-off distance. α depends on nozzle geometry, pressure and powder loading, and is best measured from kerf width at two SODs.',
   'AJM differs from sand blasting: grit is much finer (10–50 µm), the jet is small and controlled, and the aim is shaping rather than surface cleaning.'
  ],
  eq:[
   {f:'MRR = <var>x</var> · <var>N</var> · <var>d</var><sup>3</sup> · <var>v</var><sup>3/2</sup> · ( ρ<sub>a</sub> / 12<var>H</var><sub>w</sub> )<sup>3/4</sup>',w:'Brittle-fracture erosion model (Sarkar & Pandey form): N particles per second of diameter d, density ρₐ and velocity v striking a surface of hardness H_w.'},
   {f:'<var>N</var> = ṁ<sub>a</sub> / ( ρ<sub>a</sub> π<var>d</var><sup>3</sup>/6 )',w:'Particle flux from abrasive mass flow rate.'},
   {f:'<var>w</var> ≈ <var>d</var><sub>n</sub> + 2·SOD·tan α',w:'Approximate kerf width from nozzle bore d_n and jet divergence half-angle α. α can be found from kerf widths w₁, w₂ at two SODs: tan α = (w₂ − w₁)/[2(SOD₂ − SOD₁)].'},
  ],
  effects:['MRR grows with v^1.5, so pressure is the dominant control.','MRR rises with abrasive flow, then saturates as the gas cannot accelerate more grit.','MRR peaks at a small SOD (≈ 0.75–1 mm) and falls at larger SOD.','Larger grit removes more per impact but gives a rougher surface.','Harder work (alumina) erodes more slowly than glass.'],
  apps:['Frosting, deburring and cutting of glass and ceramics','Drilling and slotting of thin, fragile or heat-sensitive parts','Cleaning and etching of semiconductors and micro-channels','Removing coatings and flash'],
  adv:['No heat, no chemical change, no tool contact','Cuts brittle and heat-sensitive materials','Low capital cost'],
  lim:['Low MRR','Stray cutting and tapered walls','Abrasive cannot be reused; dust needs extraction','Not suitable for soft ductile metals'],
  model:'<b>Simulator model.</b> Particle velocity is an empirical fit v = 300·√(p/10)·(1 − 0.015·ṁₐ) m/s. MRR uses the brittle-erosion expression above with x = 0.25. The SOD factor is a log-normal curve centred at 0.8 mm. The divergence half-angle α defaults to 7°, an assumed typical value and not a measured one; set it from your own kerf measurements. Constants were chosen to reproduce the commonly quoted order of magnitude (≈1–15 mm³/min on glass).'
 },
 procedure:['Choose Al₂O₃ grit and glass work.','Set pressure 6 bar, flow 8 g/min, grit 25 µm.','Vary SOD from 0.5 mm to 15 mm and record MRR and kerf width.','Plot MRR vs SOD and identify the optimum SOD.','Repeat at 4 bar and 8 bar; comment on the effect of pressure.'],
 quiz:[
  {q:'Which gas must NOT be used as the AJM carrier gas?',o:['Air','Nitrogen','Carbon dioxide','Oxygen'],a:3,why:'Oxygen with fine, energetic dust is a fire and explosion hazard.'},
  {q:'Why is abrasive generally not reused in AJM?',o:['It becomes magnetic','Grains lose their sharp edges and are contaminated','It dissolves','It is too expensive to recover'],a:1,why:'Used grit is blunted and mixed with debris, so cutting ability and consistency drop.'},
  {q:'A typical AJM nozzle is made of…',o:['Mild steel','Copper','Tungsten carbide or sapphire','PTFE'],a:2,why:'The nozzle bore is itself eroded by the jet, so very hard materials are used.'},
  {q:'Increasing stand-off distance well beyond the optimum will…',o:['Increase MRR and narrow the kerf','Reduce MRR and widen the kerf','Have no effect','Increase particle velocity'],a:1,why:'The jet spreads and loses speed, spreading fewer, slower impacts over a wider area.'},
 ]
},
/* ======================= WJM ======================= */
{
 id:'wjm', abbr:'WJM', name:'Water Jet Machining', cat:'mech',
 blurb:'Water at up to 400 MPa through a jewel orifice slices soft and fibrous non-metals.',
 facts:{energy:'Mechanical (hydraulic pressure → jet kinetic energy)', mech:'Erosion and shearing by a coherent high-velocity jet', medium:'Water (often with long-chain polymer additive)', tool:'Sapphire, ruby or diamond orifice, 0.08–0.4 mm'},
 aim:'To determine jet velocity, flow rate, hydraulic power and the maximum separation speed achievable in pure water-jet cutting of soft materials.',
 params:[
  {id:'p',label:'Pump pressure',unit:'MPa',min:100,max:400,step:5,val:300},
  {id:'dn',label:'Orifice diameter',unit:'mm',min:0.08,max:0.4,step:0.01,val:0.2},
  {id:'t',label:'Material thickness',unit:'mm',min:1,max:100,step:1,val:10},
  {id:'mat',label:'Work material',type:'select',val:'rubber',options:[['foam','Polyurethane foam'],['card','Corrugated board'],['leather','Leather'],['rubber','Rubber sheet'],['abs','ABS plastic'],['ply','Plywood']]},
 ],
 es:{foam:1.15,card:12.8,leather:38,rubber:58,abs:230,ply:231},
 outputs:[
  {k:'u',label:'Max separation speed',unit:'mm/min',pri:1},
  {k:'v',label:'Jet velocity',unit:'m/s'},
  {k:'Q',label:'Water flow',unit:'L/min'},
  {k:'P',label:'Hydraulic power',unit:'kW'},
  {k:'Fj',label:'Jet thrust',unit:'N'},
  {k:'kerf',label:'Kerf width',unit:'mm'},
 ],
 sweep:{x:'p',y:'u'},
 compute(p){
  const rho=1000, A=Math.PI/4*Math.pow(p.dn*1e-3,2);
  const vth=Math.sqrt(2*p.p*1e6/rho);
  const v=0.95*vth, Q=0.70*A*vth;
  const P=p.p*1e6*Q;
  const kerf=1.1*p.dn+0.03;
  const u=P/(p.t*kerf*this.es[p.mat])*60;
  const notes=[];
  if(p.mat==='ply'||p.mat==='abs') if(u<300) notes.push('Rigid, dense materials cut slowly with pure water. Abrasive water jet is usually chosen instead.');
  if(p.t>50) notes.push('Thick sections: jet coherence falls with depth, so real speeds drop faster than this linear model predicts.');
  return {o:{u,v,Q:Q*60000,P:P/1000,Fj:rho*Q*v,kerf},notes};
 },
 theory:{
  principle:[
   'An intensifier pump raises tap water to 200–400 MPa (some systems 600 MPa). The water passes through a tiny jewel orifice where pressure energy becomes velocity: at 400 MPa the jet leaves at close to 900 m/s.',
   'The jet acts like a moving saw. Where its stagnation pressure exceeds the material\'s strength it erodes and shears a narrow kerf. Long-chain polymers are often added to keep the jet coherent over a longer distance.',
   'Pure water jets suit soft, fibrous or layered materials such as foam, rubber, food, paper, textiles and thin plastics. For metals, glass and stone, abrasive is added (see AWJM).'
  ],
  eq:[
   {f:'<var>v</var> = <var>C</var><sub>v</sub> √( 2<var>p</var> / ρ )',w:'Bernoulli jet velocity; C_v ≈ 0.95 for a sapphire orifice (compressibility neglected).'},
   {f:'<var>Q</var> = <var>C</var><sub>d</sub> · (π<var>d</var><sub>o</sub><sup>2</sup>/4) · √( 2<var>p</var> / ρ ),   <var>C</var><sub>d</sub> ≈ 0.7',w:'Volume flow through the orifice including vena-contracta losses.'},
   {f:'<var>P</var><sub>h</sub> = <var>p</var>·<var>Q</var>,   <var>u</var><sub>max</sub> = <var>P</var><sub>h</sub> / ( <var>t</var> · <var>w</var> · <var>e</var><sub>s</sub> )',w:'Separation speed from an energy balance: hydraulic power over thickness t, kerf w and effective specific cutting energy e_s.'},
  ],
  effects:['Jet velocity grows with √p; hydraulic power with p^1.5.','A larger orifice increases flow and power as d², at the cost of a wider kerf.','Cutting speed falls roughly in proportion to thickness.','Polymer additives improve coherence and reduce kerf spread.'],
  apps:['Foam, rubber, gaskets, insulation and textiles','Food (bread, frozen fish, confectionery)','Paper, cardboard and nappies','Paint stripping, cleaning and concrete hydro-demolition'],
  adv:['No heat-affected zone or dust','Very narrow kerf and minimal force on the part','Omni-directional cutting; good for nesting'],
  lim:['Limited to soft materials without abrasive','High pump and orifice maintenance','Noise; need for a catcher tank'],
  model:'<b>Simulator model.</b> Hydraulics from Bernoulli with C_v = 0.95 and C_d = 0.70. Cutting speed from the energy balance above. Effective specific energies e_s (J/mm³, which include jet efficiency) were calibrated so that a 300 MPa, 0.2 mm jet cuts 10 mm rubber at about 2 m/min and 50 mm foam at about 20 m/min. The linear dependence on thickness is a simplification.'
 },
 procedure:['Select rubber sheet, 10 mm thick.','Set orifice diameter 0.2 mm.','Vary pump pressure from 100 MPa to 400 MPa and record velocity, flow, power and separation speed.','Plot speed vs pressure; check that it follows p^1.5.','Repeat for foam and plywood and compare.'],
 quiz:[
  {q:'The theoretical jet velocity at 400 MPa is closest to…',o:['90 m/s','300 m/s','900 m/s','3000 m/s'],a:2,why:'v = √(2p/ρ) = √(2×400×10⁶/1000) ≈ 894 m/s.'},
  {q:'The water-jet orifice is usually made of…',o:['Hardened steel','Sapphire, ruby or diamond','Brass','Ceramic-coated aluminium'],a:1,why:'Only very hard jewels survive the high-velocity flow for a useful life.'},
  {q:'Pressures of 200–400 MPa are produced by…',o:['A centrifugal pump','An intensifier (hydraulic pressure amplifier)','A compressor','A gear pump'],a:1,why:'A large hydraulic piston drives a small plunger, multiplying pressure by the area ratio (often ~20:1).'},
  {q:'Why are long-chain polymers added to the water?',o:['To lubricate the pump','To keep the jet coherent and reduce spreading','To increase conductivity','To dissolve the workpiece'],a:1,why:'They increase extensional viscosity, so the jet stays tight for longer.'},
 ]
},
/* ======================= AWJM ======================= */
{
 id:'awjm', abbr:'AWJM', name:'Abrasive Water Jet Machining', cat:'mech',
 blurb:'Garnet entrained into a water jet cuts metals, stone, glass and composites without heat.',
 facts:{energy:'Mechanical (jet momentum transferred to abrasive)', mech:'Erosion by high-velocity abrasive particles', medium:'Water + garnet (typically 80 mesh)', tool:'Jewel orifice + WC/B₄C focusing (mixing) tube'},
 aim:'To study the influence of pressure, abrasive flow rate and orifice/focusing-tube size on abrasive velocity, loading ratio and the separation speed in AWJ cutting.',
 params:[
  {id:'p',label:'Pump pressure',unit:'MPa',min:150,max:600,step:5,val:380},
  {id:'dn',label:'Orifice diameter',unit:'mm',min:0.2,max:0.45,step:0.01,val:0.33},
  {id:'dm',label:'Focusing tube diameter',unit:'mm',min:0.5,max:1.5,step:0.01,val:1.0},
  {id:'ma',label:'Abrasive (garnet) flow',unit:'kg/min',min:0.05,max:1.2,step:0.01,val:0.4},
  {id:'t',label:'Material thickness',unit:'mm',min:1,max:150,step:1,val:25},
  {id:'mat',label:'Work material',type:'select',val:'steel',options:[['al','Aluminium alloy (Nm ≈ 215)'],['steel','Mild steel (Nm ≈ 87)'],['ss','Stainless steel (Nm ≈ 81)'],['ti','Titanium alloy (Nm ≈ 115)'],['glass','Glass (Nm ≈ 480)'],['granite','Granite (Nm ≈ 340)']]},
 ],
 nm:{al:215,steel:87,ss:81,ti:115,glass:480,granite:340},
 outputs:[
  {k:'u',label:'Max separation speed',unit:'mm/min',pri:1},
  {k:'uq',label:'Quality-5 finish speed (Q1 ÷ 5.8)',unit:'mm/min'},
  {k:'vw',label:'Water jet velocity',unit:'m/s'},
  {k:'va',label:'Abrasive velocity',unit:'m/s'},
  {k:'R',label:'Loading ratio ṁₐ/ṁ_w',unit:''},
  {k:'Pa',label:'Effective abrasive power',unit:'kW'},
  {k:'Q',label:'Water flow',unit:'L/min'},
  {k:'kerf',label:'Kerf (top)',unit:'mm'},
 ],
 sweep:{x:'ma',y:'u'},
 compute(p){
  const rho=1000, A=Math.PI/4*Math.pow(p.dn*1e-3,2), vth=Math.sqrt(2*p.p*1e6/rho);
  const vw=0.95*vth, mw=rho*0.70*A*vth, ma=p.ma/60;
  const R=ma/mw, va=0.8*vw/(1+R);
  const frag=Math.exp(-R/0.35);
  const Pa=0.5*ma*va*va*frag;
  const es=3220/this.nm[p.mat];
  const kerf=p.dm+0.1;
  const u=Pa/(p.t*kerf*es)*60;
  const notes=[];
  if(p.dm<2.5*p.dn) notes.push('Focusing tube is less than ~2.5× the orifice size. Real systems use a ratio of about 3 to avoid tube blockage and rapid wear.');
  if(R>0.35) notes.push('Very high loading ratio: particles collide and fragment in the tube, so extra garnet adds little.');
  if(R<0.06) notes.push('Lean abrasive loading: much of the jet energy stays in the water.');
  return {o:{u,uq:u/5.8,vw,va,R,Pa:Pa/1000,Q:mw*60,kerf},notes};
 },
 theory:{
  principle:[
   'A pure water jet is formed in a jewel orifice, then passes through a mixing chamber. The low pressure created by the jet draws in dry garnet from a hopper (venturi effect). In the focusing tube, 60–100 mm long, the water accelerates the abrasive to several hundred m/s.',
   'The abrasive particles, not the water, do the cutting. Momentum transfer is imperfect: abrasive velocity is about 0.7–0.85 of the water velocity, further reduced as the abrasive loading increases.',
   'As the jet penetrates, it loses energy and lags behind, leaving curved striation marks and a slight taper on the lower part of the cut. Slower traverse gives a smoother, squarer edge.'
  ],
  eq:[
   {f:'<var>v</var><sub>a</sub> = η<sub>m</sub> · <var>v</var><sub>w</sub> / (1 + <var>R</var>),   <var>R</var> = ṁ<sub>a</sub> / ṁ<sub>w</sub>',w:'Momentum balance in the focusing tube; η_m ≈ 0.8 is the momentum transfer efficiency.'},
   {f:'<var>P</var><sub>a</sub> = ½ ṁ<sub>a</sub> <var>v</var><sub>a</sub><sup>2</sup> · e<sup>−R/0.35</sup>',w:'Kinetic power carried by the abrasive, with an empirical fragmentation penalty.'},
   {f:'<var>u</var><sub>max</sub> = <var>P</var><sub>a</sub> / ( <var>t</var> · <var>w</var> · <var>e</var><sub>s</sub> ),   <var>e</var><sub>s</sub> ∝ 1/<var>N</var><sub>m</sub>',w:'Separation speed from an energy balance; N_m is the Zeng–Kim machinability number.'},
  ],
  effects:['Cutting speed rises steeply with pressure (≈ p^1.5).','Speed increases with abrasive flow, then flattens beyond a loading ratio of about 0.2–0.3.','Thicker plate: speed falls, taper and striations increase.','An excellent (Quality-5) edge needs about 1/6 of the separation (Quality-1) speed; WARDJET reports a 5.8× ratio for 100 mm aluminium.'],
  apps:['Profile cutting of steel, titanium, Inconel and armour plate','Glass, stone and tile (including laminated glass)','Composites (CFRP, GFRP) without delamination from heat','Aerospace parts where a heat-affected zone is not allowed'],
  adv:['No HAZ; cuts almost any material','Thick sections (100+ mm) in one pass','Low cutting forces, simple fixturing'],
  lim:['Taper and striations on thick parts','Garnet consumption and disposal','Focusing tube and orifice wear','Not suited to very precise small features'],
  model:'<b>Simulator model.</b> Hydraulics as in WJM. Momentum transfer efficiency 0.8. Effective specific energy e_s = 3220 / N_m (J/mm³), calibrated so that 380 MPa, 0.33 mm orifice, 1.0 mm tube and 0.4 kg/min garnet separate 25 mm mild steel at about 50 mm/min. Machinability numbers are indicative values in the Zeng–Kim style.'
 },
 procedure:['Select mild steel, 25 mm thick.','Set pressure 380 MPa, orifice 0.33 mm, tube 1.0 mm.','Vary garnet flow from 0.05 to 1.2 kg/min and record separation speed and loading ratio.','Plot speed vs abrasive flow; identify where it saturates.','Repeat for aluminium and granite and compare.'],
 quiz:[
  {q:'In AWJM the abrasive is introduced…',o:['Into the pump inlet','In the mixing chamber after the orifice','Directly into the workpiece','Into the catcher tank'],a:1,why:'Abrasive is entrained downstream of the orifice; putting it upstream would destroy the pump and orifice.'},
  {q:'The most common AWJ abrasive is…',o:['Diamond','Garnet','Silica sand','Boron carbide'],a:1,why:'Garnet balances hardness, toughness, cost and low free-silica content.'},
  {q:'Increasing the traverse speed generally causes…',o:['Less taper and smoother striations','More taper and more pronounced striations','No change','A heat-affected zone'],a:1,why:'The jet lags further behind and loses more energy near the bottom of the cut.'},
  {q:'The focusing (mixing) tube is commonly made of…',o:['Copper','Tungsten carbide or boron-carbide composite','Sapphire','Mild steel'],a:1,why:'It is eroded internally by the abrasive stream, so an extremely wear-resistant material is used.'},
  {q:'Which statement about AWJM is true?',o:['It leaves a large heat-affected zone','It cannot cut glass','It produces no thermal damage','It needs a conductive workpiece'],a:2,why:'The jet is cold; heat generated is carried away by the water.'},
 ]
},
/* ======================= CHM ======================= */
{
 id:'chm', abbr:'CHM', name:'Chemical Machining', cat:'chem',
 blurb:'Controlled dissolution by an etchant through openings in a protective maskant.',
 facts:{energy:'Chemical', mech:'Dissolution by chemical reaction (isotropic etching)', medium:'Etchant: NaOH, FeCl₃, HF–HNO₃ etc.', tool:'Maskant (neoprene, vinyl, photoresist) defines the area'},
 aim:'To study the etch depth and undercut produced in chemical milling as functions of etchant temperature, time and agitation.',
 params:[
  {id:'sys',label:'Material / etchant',type:'select',val:'al',options:[['al','Aluminium alloy / NaOH'],['steel','Carbon steel / FeCl₃'],['cu','Copper / FeCl₃'],['ss','Stainless steel / FeCl₃'],['ti','Titanium / HF–HNO₃']]},
  {id:'T',label:'Etchant temperature',unit:'°C',min:20,max:90,step:1,val:50},
  {id:'time',label:'Immersion time',unit:'min',min:1,max:180,step:1,val:30},
  {id:'ag',label:'Agitation',type:'select',val:'mild',options:[['none','None (still bath)'],['mild','Mild stirring'],['spray','Spray etching']]},
  {id:'w',label:'Mask opening width',unit:'mm',min:0.2,max:20,step:0.1,val:3},
 ],
 sys:{al:{r:0.018,E:1.4,Ea:45000},steel:{r:0.020,E:2.0,Ea:45000},cu:{r:0.028,E:2.5,Ea:18000},ss:{r:0.012,E:1.8,Ea:45000},ti:{r:0.025,E:1.2,Ea:45000}},
 agit:{none:0.6,mild:1,spray:1.6},
 outputs:[
  {k:'d',label:'Etch depth',unit:'mm',pri:1},
  {k:'r',label:'Etch rate',unit:'mm/min'},
  {k:'u',label:'Undercut (per side)',unit:'mm'},
  {k:'top',label:'Opening width at surface',unit:'mm'},
  {k:'E',label:'Etch factor (depth/undercut)',unit:''},
  {k:'t1',label:'Time for 1 mm depth',unit:'min'},
 ],
 sweep:{x:'T',y:'d'},
 compute(p){
  const s=this.sys[p.sys], mt=p.model==='mt', Ea=mt?18000:s.Ea, Rg=8.314;
  const r=s.r*(mt?{none:0.4,mild:1,spray:2.0}[p.ag]:this.agit[p.ag])*Math.exp(-Ea/Rg*(1/(p.T+273.15)-1/(323.15)));
  const d=r*p.time;
  const E=s.E*(p.ag==='spray'?1.25:1);
  const u=d/E;
  const notes=[];
  if(d>12) notes.push('Depths above about 12 mm are uncommon in chemical milling: undercut and surface roughness grow with depth.');
  if(p.T>80&&p.sys!=='al') notes.push('Etchant this hot will fume and attack maskant; rate control becomes poor.');
  if(2*u>p.w) notes.push('Undercut on both sides is larger than the opening, so the maskant edges are now overhanging and may tear.');
  return {o:{d,r,u,top:p.w+2*u,E,t1:1/r},notes};
 },
 theory:{
  principle:[
   'The part is cleaned, coated with a maskant, and the maskant is cut away (scribed, screen-printed or photo-exposed) where metal is to be removed. The part is then immersed in, or sprayed with, an etchant held at controlled temperature.',
   'The etchant attacks every exposed surface at about the same rate in all directions. So as the cavity deepens, it also eats sideways under the mask edge. This undercut is described by the etch factor.',
   'Depth is controlled by time. Many aerospace skins are chemically milled in steps, re-masking between immersions to create multi-level pockets.'
  ],
  eq:[
   {f:'<var>r</var> = <var>r</var><sub>ref</sub> · exp[ −(<var>E</var><sub>a</sub>/<var>R</var>)·(1/<var>T</var> − 1/<var>T</var><sub>ref</sub>) ]',w:'Arrhenius dependence of etch rate on temperature, T_ref = 50 °C. Reaction-controlled systems have E_a of about 40–50 kJ/mol. Diffusion-controlled spray etching (Cu in FeCl₃) shows only about 18 kJ/mol.'},
   {f:'<var>d</var> = <var>r</var> · <var>t</var>,   undercut <var>u</var> = <var>d</var> / <var>E</var><sub>f</sub>',w:'Depth grows linearly with time. Etch factor E_f = depth / undercut (some books use the reciprocal).'},
  ],
  effects:['When the surface reaction controls the rate, it roughly doubles for every 12–15 °C rise. When transport of fresh etchant controls it (spray etching of copper), the rise is much smaller: about 32–45 % over 17 °C in Chemcut\'s measurements.','Agitation or spraying refreshes etchant at the surface and improves etch factor.','Undercut scales with depth, so fine features need thin stock.','Surface roughness generally worsens with depth.'],
  apps:['Weight-reduction pockets in aircraft skins','Thin precision parts: shims, meshes, lead frames (photochemical machining)','Printed circuit boards','Decorative etching and nameplates'],
  adv:['Works on large, thin or complex areas in one go','No burrs, no stress, no tool wear','Low tooling cost'],
  lim:['Slow and depth-limited','Undercut limits sharp corners and small features','Hazardous chemicals and effluent treatment'],
  model:'<b>Simulator model.</b> Reference etch rates at 50 °C with mild agitation (mm/min): Al/NaOH 0.018, steel/FeCl₃ 0.020, Cu/FeCl₃ 0.028, SS/FeCl₃ 0.012, Ti/HF–HNO₃ 0.025. Activation energy 45 kJ/mol, except Cu/FeCl₃ at 18 kJ/mol, which was fitted to Chemcut\'s spray-etch data (see Validation). Only the Cu/FeCl₃ values are checked against measurements; the others are indicative. Agitation multipliers 0.6 / 1.0 / 1.6. Etch factors 1.2–2.5, improved by 25 % with spray.'
 },
 procedure:['Select aluminium / NaOH and a 3 mm mask opening.','Set temperature 50 °C and mild agitation.','Vary immersion time from 5 to 60 min and record depth and undercut.','Fix time at 30 min; vary temperature from 30 to 80 °C and record the etch rate.','Plot ln(rate) vs 1/T and confirm the activation energy from the slope.'],
 quiz:[
  {q:'The function of the maskant in CHM is to…',o:['Speed up etching','Protect areas that must not be etched','Conduct current','Cool the part'],a:1,why:'The etchant attacks every exposed surface; the maskant defines where it can reach.'},
  {q:'Etch factor (as used here) is defined as…',o:['Depth / undercut','Undercut × depth','Time / depth','Mask width / depth'],a:0,why:'A higher etch factor means less sideways attack for a given depth.'},
  {q:'A common etchant for aluminium alloys is…',o:['Sodium hydroxide','Ferric chloride only','Sulphuric acid at 5 °C','Deionised water'],a:0,why:'Hot caustic soda (NaOH) is the classic aluminium chemical-milling etchant.'},
  {q:'Raising the etchant temperature will…',o:['Reduce etch rate','Increase etch rate roughly exponentially','Stop undercutting','Have no effect'],a:1,why:'Reaction kinetics follow the Arrhenius law.'},
 ]
},
/* ======================= ECM ======================= */
{
 id:'ecm', abbr:'ECM', name:'Electrochemical Machining', cat:'chem',
 blurb:'Anodic dissolution by Faraday\'s law with a cathode tool that never wears.',
 facts:{energy:'Electrochemical (DC, 5–30 V, very high current)', mech:'Anodic dissolution of the workpiece', medium:'Flowing electrolyte: NaCl or NaNO₃ solution', tool:'Copper, brass or stainless-steel cathode'},
 aim:'To verify Faraday\'s law in ECM and study how voltage, feed rate and electrolyte conductivity set the equilibrium gap, current density and electrolyte temperature rise.',
 params:[
  {id:'V',label:'Applied voltage',unit:'V',min:5,max:30,step:0.5,val:15},
  {id:'f',label:'Tool feed rate',unit:'mm/min',min:0.1,max:5,step:0.05,val:1},
  {id:'k',label:'Electrolyte conductivity κ',unit:'S/m',min:5,max:30,step:0.5,val:15},
  {id:'A',label:'Tool frontal area',unit:'mm²',min:50,max:3000,step:10,val:500},
  {id:'Q',label:'Electrolyte flow',unit:'L/min',min:2,max:60,step:1,val:10},
  {id:'el',label:'Electrolyte',type:'select',val:'nacl',options:[['nacl','NaCl (non-passivating)'],['nano3','NaNO₃ (passivating, efficiency rises with current density)']]},
  {id:'mat',label:'Work material',type:'select',val:'fe',options:[['fe','Pure iron (Fe²⁺)'],['u10a','High-carbon tool steel U10A'],['ss','Stainless steel 304 (alloy)'],['inco','Inconel 718 (alloy)'],['ti64','Ti-6Al-4V (alloy)'],['ni','Nickel (Ni²⁺)'],['co','Cobalt (Co²⁺)'],['cu','Copper (Cu²⁺)'],['al','Aluminium (Al³⁺)'],['ti','Titanium (Ti⁴⁺)']]},
 ],
 mats:{fe:{M:55.85,z:2,rho:7.86,eta:0.95},u10a:{M:55.85,z:2,rho:7.83,eta:0.708},ss:{M:25.12,z:1,rho:8.0,eta:0.75,etaN:0.604,comp:{fe:.70,cr:.19,ni:.095,mn:.015}},inco:{M:25.21,z:1,rho:8.19,eta:0.85,comp:{ni:.525,cr:.19,fe:.185,nb:.051,mo:.03,ti:.009,al:.005}},ti64:{M:11.87,z:1,rho:4.43,eta:0.6,comp:{ti:.90,al:.06,v:.04}},ni:{M:58.69,z:2,rho:8.90,eta:0.90},co:{M:58.93,z:2,rho:8.90,eta:0.90},cu:{M:63.55,z:2,rho:8.96,eta:0.90},al:{M:26.98,z:3,rho:2.70,eta:0.85},ti:{M:47.87,z:4,rho:4.51,eta:0.60}},
 outputs:[
  {k:'ge',label:'Equilibrium gap',unit:'mm',pri:1},
  {k:'J',label:'Current density',unit:'A/cm²'},
  {k:'I',label:'Current',unit:'A'},
  {k:'mrr',label:'MRR (= feed × area)',unit:'mm³/min'},
  {k:'mg',label:'Mass removal rate',unit:'g/min'},
  {k:'dT',label:'Electrolyte temperature rise',unit:'°C'},
  {k:'Pw',label:'Power',unit:'kW'},
  {k:'se',label:'Specific energy',unit:'J/mm³'},
  {k:'eta',label:'Current efficiency',unit:'%'},
  {k:'Eq',label:'Chemical equivalent M/z',unit:'g/mol'},
 ],
 sweep:{x:'V',y:'ge'},
 compute(p){
  const m0=this.mats[p.mat], dV=1.5;
  const EL={fe:[55.85,2],cr:[52.00,3],ni:[58.69,2],mn:[54.94,2],nb:[92.91,5],mo:[95.95,3],ti:[47.87,4],al:[26.98,3],v:[50.94,3]};
  let m=m0;if(m0.comp){const c=Object.entries(m0.comp);const E=p.model==='weight'?c.reduce((a,[k,w])=>a+w*EL[k][0]/EL[k][1],0):1/c.reduce((a,[k,w])=>a+w/(EL[k][0]/EL[k][1]),0);m={...m0,M:E,z:1};}
  const Veff=Math.max(p.V-dV,0.1);
  const fs=p.f/1000/60;
  const shape=j=>{const T=[[0,0],[12.28,.814],[19.61,1.019],[27.43,1.093],[35.37,1.130],[50.68,1.183],[66.74,1.198],[83.19,1.202]];if(j>=83.19)return 1;for(let i=1;i<T.length;i++)if(j<=T[i][0]){const[a,b]=T[i-1],[c,d]=T[i];return (b+(d-b)*(j-a)/(c-a))/1.202;}return 1;};
  const base=p.el==='nano3'?(m.etaN??m.eta):m.eta;
  const gOf=eta=>eta*(m.M/1000)*p.k*Veff/(m.rho*1000*m.z*FARADAY*fs);
  let eta=base, ge=gOf(eta);
  if(p.el==='nano3'){for(let i=0;i<60;i++){const J=p.k*Veff/ge/1e4;eta=0.5*eta+0.5*base*shape(J);ge=gOf(eta);}}
  const J=p.k*Veff/ge;
  const I=J*p.A*1e-6;
  const mrr=p.f*p.A;
  const Pw=I*p.V;
  const dT=Pw/(1100*3800*p.Q/60000);
  const notes=[];
  if(ge<0.05) notes.push('Gap below about 0.05 mm: high risk of sparking and short circuit. Reduce feed or raise voltage.');
  if(ge>1) notes.push('Gap above 1 mm: dimensional control (shape replication) becomes poor.');
  if(dT>15) notes.push('Large temperature rise along the gap changes conductivity and can boil the electrolyte. Increase flow.');
  if(m0.comp) notes.push(`Alloy chemical equivalent E = ${m.M.toFixed(2)} g/mol per electron by the ${p.model==='weight'?'weight-averaged':'charge-superposition'} method.`);
  if(p.mat==='ti'||p.mat==='ti64') notes.push('Titanium forms a passive oxide film; current efficiency is low and NaCl at high voltage is usually needed.');
  if(p.el==='nano3'&&eta<0.8*base) notes.push(`NaNO₃ at this low current density: the passive film limits dissolution, so current efficiency is only ${(eta*100).toFixed(0)} %. Stray dissolution is suppressed, which is why NaNO₃ gives better accuracy.`);
  return {o:{ge:ge*1000,J:J/1e4,I,mrr,mg:mrr*m.rho/1000,dT,Pw:Pw/1000,se:Pw/(mrr/60),eta:eta*100,Eq:m.M/m.z},notes};
 },
 theory:{
  principle:[
   'The workpiece is the anode and the shaped tool is the cathode, separated by a gap of 0.1–1 mm through which electrolyte flows at 10–30 m/s. With 5–30 V applied, current densities of 20–200 A/cm² dissolve metal atoms from the anode as ions.',
   'At the anode iron goes into solution as Fe²⁺ and forms Fe(OH)₂ sludge with hydroxyl ions. At the cathode only hydrogen gas is evolved, so the tool does not wear.',
   'When the tool is fed at a constant rate, the gap settles to an equilibrium where the dissolution rate exactly equals the feed. The work then replicates the tool shape, offset by this gap.'
  ],
  eq:[
   {f:'MRR (mass) = η · <var>I</var> · <var>M</var> / ( <var>z</var> · <var>F</var> )',w:'Faraday\'s law: M atomic mass, z valence, F = 96 485 C/mol, η current efficiency.'},
   {f:'<var>I</var> = κ · (<var>V</var> − Δ<var>V</var>) · <var>A</var> / <var>g</var>',w:'Ohm\'s law across the gap; ΔV ≈ 1.5 V of electrode over-potential.'},
   {f:'<var>g</var><sub>e</sub> = η <var>M</var> κ (<var>V</var> − Δ<var>V</var>) / ( ρ <var>z</var> <var>F</var> <var>f</var> )',w:'Equilibrium gap when the dissolution velocity equals the feed rate f.'},
  ],
  effects:['At equilibrium, MRR = feed × area; voltage and conductivity only change the gap.','Higher voltage or conductivity widens the gap; faster feed narrows it.','Current and heating rise with feed; electrolyte flow must remove heat and sludge.','Passive metals (Ti) have low current efficiency.'],
  apps:['Turbine blades and blisks in nickel superalloys','Deep small holes (STEM, electro-stream drilling)','Gun-barrel rifling','Deburring of intersecting holes'],
  adv:['No tool wear; stress-free, burr-free surfaces','MRR independent of material hardness','Good finish (Ra 0.1–2.5 µm) even at high MRR'],
  lim:['High capital cost, very large currents','Corrosive electrolyte and sludge disposal','Sharp corners hard to reproduce; tool design is iterative','Only conductive work'],
  model:'<b>Simulator model.</b> Faraday + Ohm model with ΔV = 1.5 V and constant conductivity along the gap. Current efficiencies: tool steel U10A in 10 % NaCl 70.8 % (measured, Yanpolskiy et al.). SS304 in NaNO₃ follows the measured efficiency–current-density curve of Lee et al. (Appl. Sci. 2021), plateau 1.20 mm³/A·min ≈ 60 % of the Cr³⁺ Faraday value. For other metals in NaNO₃ the same curve shape is assumed. Other efficiencies are typical textbook values. The equilibrium gap is solved iteratively, because efficiency depends on current density. Temperature rise assumes electrolyte density 1100 kg/m³ and specific heat 3800 J/kg·K with all electrical power going into the electrolyte (an upper bound).'
 },
 procedure:['Select iron/steel work, κ = 15 S/m and a 500 mm² tool.','Set feed 1 mm/min and vary voltage from 5 to 30 V; record gap and current.','Fix voltage at 15 V and vary feed from 0.2 to 4 mm/min; record gap and current.','Confirm MRR = feed × area and compare with Faraday\'s law using the recorded current.','Change the electrolyte flow and note the temperature rise.'],
 quiz:[
  {q:'ECM is governed principally by…',o:['Hooke\'s law','Faraday\'s laws of electrolysis','Bernoulli\'s equation','Fourier\'s law'],a:1,why:'Mass removed is proportional to charge passed.'},
  {q:'In ECM the tool is connected as the…',o:['Anode','Cathode','Ground only','It is not connected'],a:1,why:'The work is the anode and dissolves; the tool is the cathode.'},
  {q:'Why does the ECM tool hardly wear?',o:['It is very hard','Only hydrogen gas is evolved at the cathode','It is cooled','It is coated'],a:1,why:'No metal leaves the cathode; the cathode reaction produces H₂.'},
  {q:'The equilibrium gap increases when…',o:['Feed rate is increased','Voltage is increased','Conductivity is reduced','Tool area is increased'],a:1,why:'g_e ∝ κ(V−ΔV)/f, so more voltage gives a larger gap.'},
  {q:'Commonly used ECM electrolytes are…',o:['Kerosene and paraffin','NaCl and NaNO₃ solutions','Deionised water only','Hydraulic oil'],a:1,why:'Neutral salt solutions give good conductivity with manageable corrosion.'},
 ]
},
/* ======================= EDM ======================= */
{
 id:'edm', abbr:'EDM', name:'Electric Discharge Machining (Die-sinking)', cat:'therm',
 blurb:'Thousands of controlled sparks per second melt and vaporise conductive work in a dielectric.',
 facts:{energy:'Electrothermal (pulsed DC sparks)', mech:'Melting and vaporisation; molten metal flushed away', medium:'Dielectric: hydrocarbon oil or deionised water', tool:'Copper, graphite or Cu–W electrode'},
 aim:'To study the effect of peak current, pulse-on time and pulse-off time on MRR, surface roughness, tool wear ratio and overcut in die-sinking EDM.',
 params:[
  {id:'Ip',label:'Peak current Iₚ',unit:'A',min:1,max:50,step:0.5,val:15},
  {id:'ton',label:'Pulse-on time tₒₙ',unit:'µs',min:2,max:400,step:1,val:100},
  {id:'toff',label:'Pulse-off time tₒff',unit:'µs',min:2,max:400,step:1,val:50},
  {id:'V0',label:'Supply voltage V₀ (RC model)',unit:'V',min:80,max:300,step:5,val:200},
  {id:'R',label:'Charging resistance R (RC model)',unit:'Ω',min:2,max:100,step:1,val:20},
  {id:'Cuf',label:'Capacitance C (RC model)',unit:'µF',min:0.01,max:10,step:0.01,val:1},
  {id:'rv',label:'Breakdown ratio V_d/V₀ (RC model)',unit:'',min:0.3,max:0.95,step:0.01,val:0.72},
  {id:'el',label:'Electrode',type:'select',val:'gr',options:[['cu','Electrolytic copper'],['gr','Graphite'],['cuw','Copper–tungsten']]},
  {id:'mat',label:'Work material',type:'select',val:'steel',options:[['steel','Tool steel'],['ti','Ti-6Al-4V'],['inco','Inconel 718'],['wc','WC-Co carbide'],['al','Al 6061']]},
 ],
 elec:{cu:{w:8,name:'Copper'},gr:{w:3,name:'Graphite'},cuw:{w:2,name:'Cu–W'}},
 outputs:[
  {k:'mrr',label:'MRR',unit:'mm³/min',pri:1},
  {k:'Ra',label:'Surface roughness Ra',unit:'µm'},
  {k:'E',label:'Energy per discharge',unit:'mJ'},
  {k:'fr',label:'Pulse frequency',unit:'kHz'},
  {k:'D',label:'Duty factor',unit:'%'},
  {k:'twr',label:'Tool wear ratio',unit:'%'},
  {k:'oc',label:'Overcut (per side)',unit:'mm'},
  {k:'rl',label:'Recast layer',unit:'µm'},
 ],
 sweep:{x:'Ip',y:'mrr'},
 compute(p){
  const m=TH[p.mat], Vd=25;
  if(p.model==='rc'){const C=p.Cuf*1e-6,Vb=p.rv*p.V0;const E=0.5*C*Vb*Vb;const tc=p.R*C*Math.log(1/(1-p.rv));const f=1/tc;const P=E*f;const mrr=0.1*P/eMelt(m)*60;const Em=E*1000;
    const notes=[`RC relaxation generator: each spark discharges the capacitor. Average power ${P.toFixed(0)} W; the maximum possible is V₀²/4R = ${(p.V0*p.V0/(4*p.R)).toFixed(0)} W, reached near V_d/V₀ ≈ 0.72.`];
    if(f>200000)notes.push('Very high spark frequency: in practice the gap cannot de-ionise this fast and arcing results.');
    return {o:{mrr,Ra:1.45*Math.cbrt(Em),E:Em,fr:f/1000,D:NaN,twr:clamp(this.elec[p.el].w*0.8,0.3,60),oc:0.01+0.03*Math.cbrt(Em),rl:1.2*Math.sqrt(Em)},notes};}
  const D=p.ton/(p.ton+p.toff);
  const P=Vd*p.Ip*D;
  const eta=0.12*p.ton/(p.ton+10)*Math.exp(-p.ton/800);
  const mrr=eta*P/eMelt(m)*60;
  const E=Vd*p.Ip*p.ton*1e-6*1000;
  const Ra=0.65*Math.pow(p.Ip,0.4)*Math.pow(p.ton,0.2);
  const twr=clamp(this.elec[p.el].w*Math.sqrt(50/p.ton),0.3,60);
  const notes=[];
  if(D>0.85) notes.push('Duty factor above ~85 %: too little off-time for deionisation and flushing, so arcing becomes likely.');
  if(p.ton>250) notes.push('Very long pulses: the plasma channel expands and energy density drops, so removal efficiency falls.');
  if(p.mat==='wc') notes.push('Carbide has a high melting point and conductive cobalt binder; it machines slowly and is prone to micro-cracking.');
  return {o:{mrr,Ra,E,fr:1000/(p.ton+p.toff),D:D*100,twr,oc:0.01+0.03*Math.cbrt(E),rl:1.2*Math.sqrt(E)},notes};
 },
 theory:{
  principle:[
   'The tool and workpiece are submerged in a dielectric with a gap of 10–100 µm, held by a servo. A pulse generator applies an open-circuit voltage (typically 80–300 V). When the gap breaks down, a plasma channel forms and the voltage falls to a discharge voltage of about 20–30 V while current flows.',
   'The channel reaches 8 000–12 000 °C. A small pool of metal melts and partly vaporises at both electrodes. When the pulse ends, the channel collapses and the pool is violently ejected, leaving a crater.',
   'The off-time lets the dielectric de-ionise and flush debris. Polarity and electrode material are chosen so the workpiece loses far more material than the tool. Rough settings use high current and long pulses; finishing uses small current and short pulses.'
  ],
  eq:[
   {f:'<var>E</var><sub>p</sub> = <var>V</var><sub>d</sub> · <var>I</var><sub>p</sub> · <var>t</var><sub>on</sub>',w:'Energy per discharge; V_d ≈ 25 V.'},
   {f:'<var>D</var> = <var>t</var><sub>on</sub> / (<var>t</var><sub>on</sub> + <var>t</var><sub>off</sub>),   <var>P</var> = <var>V</var><sub>d</sub><var>I</var><sub>p</sub><var>D</var>',w:'Duty factor and average gap power.'},
   {f:'MRR = η · <var>P</var> / [ ρ ( <var>c</var>Δ<var>T</var><sub>m</sub> + <var>L</var><sub>m</sub> ) ]',w:'Thermal model: a fraction η of gap power ends up melting and ejecting work material.'},
  ],
  effects:['MRR rises almost linearly with peak current.','Roughness rises with discharge energy (Iₚ and tₒₙ).','Longer tₒₙ reduces tool wear but lowers efficiency past an optimum.','Short tₒff raises MRR until arcing begins.','Graphite and Cu–W electrodes wear less than copper in roughing.'],
  apps:['Injection-mould and die cavities in hardened steel','Deep ribs and slots','Machining of carbide and superalloys','Small holes (EDM drilling) for cooling channels'],
  adv:['Any conductive material regardless of hardness','Complex 3D cavities; no cutting forces','Good accuracy; can finish to Ra < 0.5 µm'],
  lim:['Only conductive materials','Recast layer and heat-affected zone','Electrode wear and electrode-making cost','Slow compared with milling of soft metals'],
  model:'<b>Simulator model.</b> V_d = 25 V. Removal efficiency η = 0.12·tₒₙ/(tₒₙ + 10)·exp(−tₒₙ/800), giving about 10–14 mm³/min per ampere in steel roughing, which matches the common rule of thumb. Ra = 0.65·Iₚ^0.4·tₒₙ^0.2, overcut = 0.01 + 0.03·E^(1/3) mm, recast = 1.2·√E µm, and tool wear ratio = base × √(50/tₒₙ) are empirical fits of typical published trends.'
 },
 procedure:['Select graphite electrode and tool-steel work.','Set tₒₙ = 100 µs, tₒff = 50 µs.','Vary peak current from 2 A to 40 A; record MRR, Ra and overcut.','Fix Iₚ = 15 A; vary tₒₙ from 10 to 400 µs; record MRR and tool wear ratio.','Plot MRR vs Iₚ and Ra vs Iₚ; identify roughing and finishing windows.'],
 quiz:[
  {q:'Which dielectric is commonly used in die-sinking EDM?',o:['Brine','Hydrocarbon (kerosene-type) oil','Compressed air','Sulphuric acid'],a:1,why:'Hydrocarbon oils for die-sinking; deionised water for wire EDM.'},
  {q:'For EDM, the workpiece must be…',o:['Non-magnetic','Electrically conductive','Brittle','Transparent'],a:1,why:'The spark needs a conductive path through the work.'},
  {q:'Increasing peak current at fixed tₒₙ will…',o:['Raise MRR and worsen surface finish','Lower MRR and improve finish','Have no effect on finish','Stop tool wear'],a:0,why:'More energy per spark makes bigger craters.'},
  {q:'The hard, brittle re-solidified layer on an EDM surface is called the…',o:['Passive layer','Recast (white) layer','Oxide scale','Electroplated layer'],a:1,why:'Molten metal that was not ejected re-solidifies on the surface.'},
  {q:'The main purpose of the pulse-off time is to…',o:['Cool the power supply','Allow the dielectric to de-ionise and flush debris','Reverse polarity','Increase voltage'],a:1,why:'Without it, the next discharge strikes at the same spot and becomes an arc.'},
 ]
},
/* ======================= WEDM ======================= */
{
 id:'wedm', abbr:'WEDM', name:'Wire Electric Discharge Machining', cat:'therm',
 blurb:'A travelling brass wire cuts through-profiles in hardened, conductive plate by spark erosion.',
 facts:{energy:'Electrothermal (short, high-current pulses)', mech:'Melting and vaporisation along the wire', medium:'Deionised water', tool:'Brass or coated wire, 0.1–0.33 mm, fed continuously'},
 aim:'To study the effect of wire diameter, pulse settings and workpiece thickness on kerf, area cutting rate, cutting speed and surface roughness in wire EDM.',
 params:[
  {id:'dw',label:'Wire diameter',unit:'mm',min:0.1,max:0.33,step:0.01,val:0.25},
  {id:'Ip',label:'Peak current',unit:'A',min:5,max:80,step:1,val:40},
  {id:'ton',label:'Pulse-on time',unit:'µs',min:0.4,max:10,step:0.1,val:1},
  {id:'toff',label:'Pulse-off time',unit:'µs',min:2,max:50,step:0.5,val:8},
  {id:'t',label:'Workpiece thickness',unit:'mm',min:5,max:200,step:1,val:50},
  {id:'wire',label:'Wire type',type:'select',val:'brass',options:[['brass','Plain brass'],['coated','Zinc-coated brass'],['moly','Molybdenum (fast-wire, reused)']]},
  {id:'mat',label:'Work material',type:'select',val:'steel',options:[['steel','Tool steel'],['ti','Ti-6Al-4V'],['inco','Inconel 718'],['wc','WC-Co carbide'],['al','Al 6061']]},
 ],
 wires:{brass:1.0,coated:1.3,moly:0.85},
 outputs:[
  {k:'v',label:'Cutting speed',unit:'mm/min',pri:1},
  {k:'ar',label:'Area cutting rate',unit:'mm²/min'},
  {k:'kerf',label:'Kerf width',unit:'mm'},
  {k:'mrr',label:'MRR',unit:'mm³/min'},
  {k:'Ra',label:'Surface roughness Ra',unit:'µm'},
  {k:'P',label:'Average gap power',unit:'W'},
  {k:'load',label:'Wire thermal load',unit:'W/mm²'},
 ],
 sweep:{x:'t',y:'v'},
 compute(p){
  const m=TH[p.mat];
  const D=p.ton/(p.ton+p.toff), P=30*p.Ip*D;
  const eta=0.10*this.wires[p.wire]/(1+p.t/300);
  const mrr=eta*P/eMelt(m)*60;
  const kerf=p.dw+2*0.025;
  const ar=mrr/kerf;
  const load=P/(Math.PI/4*p.dw*p.dw);
  const notes=[];
  if(load>3500) notes.push('High power per unit wire cross-section: wire breakage is likely. Reduce current or increase off-time.');
  if(p.t>120) notes.push('Thick work: flushing through the gap is harder and cutting speed falls.');
  if(p.dw<0.15) notes.push('Fine wire allows small inside corners but carries less current.');
  return {o:{v:ar/p.t,ar,kerf,mrr,Ra:0.45*Math.pow(p.Ip,0.3)*Math.pow(p.ton,0.4),P,load},notes};
 },
 theory:{
  principle:[
   'A thin wire travels continuously from a supply spool, through upper and lower guides, to a take-up. The CNC moves the work (or the guides) along a programmed path. Short, high-current pulses spark between wire and work across a gap of about 20–50 µm.',
   'Deionised water is jetted coaxially from the guides to cool the wire and flush debris. Because the wire is always fresh, wire wear does not affect accuracy; used wire is scrapped (except in Chinese fast-wire machines, which reuse molybdenum wire).',
   'Upper and lower guides can be offset to cut tapers. Several skim passes at lower energy improve finish and accuracy after the rough cut.'
  ],
  eq:[
   {f:'<var>w</var> = <var>d</var><sub>w</sub> + 2<var>s</var>',w:'Kerf equals wire diameter plus two spark gaps (s ≈ 25 µm).'},
   {f:'Area rate = MRR / <var>w</var>,   cutting speed = area rate / <var>t</var>',w:'Machines are rated in mm²/min; speed for a part is that divided by thickness.'},
  ],
  effects:['Area rate rises with current and duty factor until wire breakage limits it.','Cutting speed falls almost inversely with thickness.','Coated wire flushes and discharges better, giving 20–40 % higher rates.','Finish improves with lower energy skim cuts.'],
  apps:['Punch and die sets, extrusion dies','Gears, splines and profile gauges','Aerospace and medical parts in Ti and Ni alloys','Slicing of PCD and carbide'],
  adv:['Very accurate (±2–5 µm) through-profiles','No electrode manufacture needed','Hardened material cut after heat treatment'],
  lim:['Only through-cuts in conductive material','Slow for thick sections','Wire consumption and DI-water management'],
  model:'<b>Simulator model.</b> Discharge voltage 30 V. Removal efficiency 0.10 × wire factor ÷ (1 + t/300) for flushing losses. Melting energy from the thermal property table. Calibrated so 0.25 mm brass wire in 50 mm tool steel gives a few hundred mm²/min, typical of modern machines. Ra and wire-load limits are empirical.'
 },
 procedure:['Select tool steel, 0.25 mm brass wire.','Set Iₚ = 40 A, tₒₙ = 1 µs, tₒff = 8 µs.','Vary thickness from 10 to 200 mm; record cutting speed and area rate.','Change wire type and compare area rates.','Vary off-time and note the wire load and breakage warning.'],
 quiz:[
  {q:'The usual wire material for WEDM is…',o:['Tungsten','Brass or coated brass','Mild steel','Aluminium'],a:1,why:'Brass gives good conductivity, strength and spark behaviour at low cost.'},
  {q:'The dielectric normally used in WEDM is…',o:['Kerosene','Deionised water','Air','Brine'],a:1,why:'Deionised water cools the wire well and flushes fast; its conductivity is controlled by resin.'},
  {q:'Kerf width in WEDM is approximately…',o:['Wire diameter only','Wire diameter + 2 × spark gap','Half the wire diameter','Twice the wire diameter'],a:1,why:'There is a spark gap on each side of the wire.'},
  {q:'Why is the wire fed continuously?',o:['To keep it straight only','Because it erodes and would break or lose accuracy','To increase voltage','To save dielectric'],a:1,why:'Each discharge also craters the wire, so fresh wire is supplied.'},
 ]
},
/* ======================= LBM ======================= */
{
 id:'lbm', abbr:'LBM', name:'Laser Beam Machining', cat:'therm',
 blurb:'A focused coherent beam melts or vaporises a narrow kerf; an assist gas blows it out.',
 facts:{energy:'Thermal (photon energy)', mech:'Melting / vaporisation, blown out by assist gas', medium:'Air; assist gas O₂, N₂ or air', tool:'Focused laser beam (CO₂ 10.6 µm, fiber 1.07 µm)'},
 aim:'To study the effect of laser type, power and thickness on spot size, intensity, maximum cutting speed, kerf and heat-affected zone in laser cutting.',
 params:[
  {id:'las',label:'Laser source',type:'select',val:'fiber',options:[['fiber','Multimode fiber laser, 1.07 µm (M² ≈ 8)'],['co2','CO₂ laser, 10.6 µm'],['yag','Lamp-pumped Nd:YAG, 1.064 µm']]},
  {id:'P',label:'Laser power',unit:'W',min:100,max:8000,step:50,val:2000},
  {id:'t',label:'Sheet thickness',unit:'mm',min:0.5,max:25,step:0.5,val:3},
  {id:'gas',label:'Assist gas',type:'select',val:'o2',options:[['o2','Oxygen (reactive)'],['n2','Nitrogen (inert)'],['air','Compressed air']]},
  {id:'mat',label:'Work material',type:'select',val:'steel',options:[['steel','Mild steel'],['ss','Stainless steel 304'],['al','Aluminium alloy'],['ti','Titanium alloy'],['pmma','Acrylic (PMMA)'],['ply','Plywood']]},
 ],
 lasers:{fiber:{lam:1.07e-6,M2:8,D:0.012,k0:0.0707},co2:{lam:10.6e-6,M2:1.2,D:0.020,k0:0.184},yag:{lam:1.064e-6,M2:15,D:0.012,k0:0.330}},
 coup:{fiber:{steel:.09,ss:.09,al:.05,ti:.09,pmma:.01,ply:.06},co2:{steel:.10,ss:.10,al:.03,ti:.10,pmma:.20,ply:.15},yag:{steel:.08,ss:.08,al:.045,ti:.08,pmma:.01,ply:.06}},
 es:{steel:null,ss:null,al:null,ti:null,pmma:2.2,ply:4.0},
 alpha:{steel:1.2e-5,ss:4e-6,al:6.4e-5,ti:2.9e-6,pmma:1.1e-7,ply:1.5e-7},
 outputs:[
  {k:'u',label:'Max cutting speed',unit:'m/min',pri:1},
  {k:'d0',label:'Focused spot diameter',unit:'µm'},
  {k:'I',label:'Intensity at focus',unit:'MW/cm²'},
  {k:'kerf',label:'Kerf width',unit:'mm'},
  {k:'haz',label:'HAZ width (est.)',unit:'mm'},
  {k:'le',label:'Line energy',unit:'J/mm'},
 ],
 sweep:{x:'t',y:'u'},
 compute(p){
  const L=this.lasers[p.las];
  const F=0.127;
  const d0=4*L.M2*L.lam*F/(Math.PI*L.D);
  const I=p.P/(Math.PI*d0*d0/4)/1e4/1e6;
  const metal=['steel','ss','al','ti'].includes(p.mat);
  const es=metal?eMelt(TH[p.mat]):this.es[p.mat];
  const kerf=L.k0+0.02*p.t;
  // laser-type factor relative to fiber (CO2 and YAG not validated)
  const lasF=p.las==='fiber'?1:(p.las==='co2'?0.75:0.85);
  let u;
  if(metal){
    if(p.gas==='o2'&&p.mat==='steel'){
      u=Math.min(9,11.36*(p.P/2000)*Math.pow(p.t,-0.987))*(p.las==='fiber'?1:lasF);
    } else {
      const k={ss:1,steel:1,ti:0.9,al:0.277}[p.mat]*(p.las==='co2'&&p.mat==='al'?0.4:1);
      let g=1; if(p.gas==='air') g={steel:1.15,ss:1.05,ti:1.2,al:1.0}[p.mat]; if(p.gas==='o2') g={ss:1.2,ti:1.6,al:1.0}[p.mat];
      u=0.2018*k*g*lasF*p.P*Math.exp(-p.t/(8.105*p.P/2000))/(p.t*kerf*es)*0.06;
    }
  } else {
    const k={co2:{pmma:.20,ply:.15},fiber:{pmma:.01,ply:.06},yag:{pmma:.01,ply:.06}}[p.las][p.mat];
    u=k*p.P/(p.t*kerf*es)*0.06;
  }
  if(p.model==='vap'&&metal) u*=eMelt(TH[p.mat])/eVap(TH[p.mat]);
  const us=u*1000/60;
  const haz=2*Math.sqrt(this.alpha[p.mat]*(kerf/1000)/(us/1000))*1000;
  const notes=[];
  if(p.mat==='pmma'&&p.las!=='co2') notes.push('Acrylic is nearly transparent at ~1 µm. Use a CO₂ laser for acrylic and most plastics.');
  if(p.mat==='al'&&p.las==='co2') notes.push('Aluminium reflects about 97 % at 10.6 µm; CO₂ cutting of Al is inefficient and risks back-reflection.');
  if(p.gas==='o2'&&(p.mat==='ss'||p.mat==='ti')) notes.push('Oxygen leaves an oxidised edge on stainless and titanium. Nitrogen or argon is used where a clean edge matters.');
  if(us<1) notes.push('Below about 1 mm/s the cut is unstable (heavy dross, wide HAZ). This thickness is beyond the practical limit for this power.');
  if(p.las==='yag') notes.push('Lamp-pumped Nd:YAG has poor beam quality (M² ≈ 15). It is mostly used in pulsed mode for drilling and welding.');
  return {o:{u,d0:d0*1e6,I,kerf,haz,le:p.P/us},notes};
 },
 theory:{
  principle:[
   'A laser produces a coherent, monochromatic, nearly parallel beam by stimulated emission in a gain medium (CO₂ gas, Yb-doped fibre, Nd:YAG crystal). A lens or mirror focuses it to a spot of roughly 50–200 µm in multi-kilowatt cutting heads, giving intensities of about 10⁶–10⁸ W/cm².',
   'The absorbed energy melts (and partly vaporises) a narrow column of material. A coaxial assist gas blows the melt out of the kerf. With oxygen on steel, the iron burns exothermically and adds heat, raising cutting speed.',
   'The shorter wavelength of fibre and Nd:YAG lasers is absorbed better by metals and focuses to a smaller spot. The 10.6 µm CO₂ wavelength is well absorbed by non-metals such as wood, acrylic and leather.'
  ],
  eq:[
   {f:'<var>d</var><sub>0</sub> = 4 <var>M</var><sup>2</sup> λ <var>F</var> / (π <var>D</var>)',w:'Focused spot diameter: wavelength λ, beam quality M² (1 for a perfect Gaussian beam), focal length F, beam diameter D at the lens.'},
   {f:'η<sub>c</sub> <var>P</var> e<sup>−t/t₀</sup> = <var>u</var> · <var>t</var> · <var>w</var> · ρ ( <var>c</var>Δ<var>T</var><sub>m</sub> + <var>L</var><sub>m</sub> )',w:'Lumped energy balance for melt-and-blow cutting; η_c is the effective coupling. The exponential term captures losses that rise with thickness, which the published charts clearly show.'},
   {f:'HAZ ≈ 2 √( α · <var>w</var> / <var>u</var> )',w:'Thermal diffusion length over the beam interaction time w/u.'},
  ],
  effects:['With inert gas, speed falls faster than 1/t: in the 2 kW stainless chart, t×u drops from 35 to 4 m·mm/min between 1 and 10 mm. With oxygen on mild steel, speed is almost exactly ∝ 1/t.','Shorter wavelength → smaller spot and better metal absorption.','Oxygen assist raises speed on steel; nitrogen gives oxide-free edges.','Slower cutting widens the HAZ.'],
  apps:['Sheet-metal profile cutting','Micro-drilling of turbine cooling holes and fuel injectors','Marking, scribing and engraving','Cutting of wood, acrylic, textiles and leather'],
  adv:['Fast, flexible, non-contact; easy CNC automation','Narrow kerf, small HAZ','Cuts metals and non-metals'],
  lim:['High capital cost; limited thickness','Reflective metals (Cu, Al) are harder to cut','HAZ, recast and dross on thick sections','Eye and fume hazards'],
  model:'<b>Simulator model.</b> Spot size from Gaussian-beam optics with a 127 mm lens and a 12 mm (fiber, Nd:YAG) or 20 mm (CO₂) beam; multi-kW fiber lasers are taken as multimode with M² = 8. Kerf = k₀ + 0.02·t mm with k₀ = 0.071 (fiber), 0.18 (CO₂), 0.33 (Nd:YAG), empirical. <b>Inert-gas cutting (fiber, N₂):</b> u = 0.202·k·P·exp(−t/t₀)/(t·w·e_melt), with t₀ = 8.1 mm × (P/2 kW) representing conduction and melt-ejection losses that grow with thickness. Fitted to a 2 kW stainless-steel chart; aluminium k = 0.28 fitted to the 2 kW aluminium chart. <b>Oxygen cutting of mild steel</b> follows a separate fitted law, u = 11.4·(P/2 kW)·t^−0.99 m/min, capped at 9 m/min, because iron combustion, not the beam, supplies most of the heat. CO₂ and Nd:YAG factors, titanium, air assist and the non-metals (PMMA 2.2, plywood 4.0 J/mm³) are not validated. See the Validation tab for errors against data the model was not fitted to.'
 },
 procedure:['Select a fiber laser, mild steel and oxygen assist.','Set power to 2 kW and vary thickness from 1 to 20 mm; record cutting speed and HAZ.','Switch to nitrogen and repeat; compare speeds.','Select a CO₂ laser and compare spot diameter and intensity.','Try acrylic with both lasers and explain the difference.'],
 quiz:[
  {q:'LASER stands for…',o:['Light Amplification by Stimulated Emission of Radiation','Light Absorption by Spontaneous Emission of Radiation','Linear Amplified Source of Energetic Radiation','Low Angle Scattered Electron Radiation'],a:0,why:'Stimulated emission is what makes the beam coherent and monochromatic.'},
  {q:'The wavelength of a CO₂ laser is…',o:['0.53 µm','1.06 µm','10.6 µm','193 nm'],a:2,why:'10.6 µm, in the far infrared.'},
  {q:'Using oxygen as assist gas on mild steel…',o:['Slows cutting','Adds exothermic heat and increases speed','Prevents any oxidation','Cools the lens'],a:1,why:'Iron oxidation releases heat that supplements the laser.'},
  {q:'Why is aluminium harder to laser-cut than steel?',o:['It is harder','High reflectivity and thermal conductivity','It is magnetic','It has a higher melting point'],a:1,why:'Less energy is absorbed and more is conducted away from the cut.'},
  {q:'For the same optics, a shorter wavelength gives…',o:['A larger spot','A smaller focused spot','No change in spot size','Lower intensity'],a:1,why:'d₀ ∝ M²λ, so at equal beam quality a 1 µm laser focuses about ten times smaller than a 10.6 µm CO₂ laser. Multi-kW fiber lasers are multimode (M² ≈ 5–10), which narrows the gap in practice.'},
 ]
},
/* ======================= EBM ======================= */
{
 id:'ebm', abbr:'EBM', name:'Electron Beam Machining', cat:'therm',
 blurb:'A pulsed beam of fast electrons in vacuum vaporises tiny, deep holes.',
 facts:{energy:'Thermal (kinetic energy of electrons)', mech:'Vaporisation (and melt expulsion)', medium:'High vacuum (≈10⁻⁵ torr)', tool:'Focused, pulsed electron beam (50–150 kV)'},
 aim:'To study how accelerating voltage, beam current, pulse duration and frequency affect power density, electron penetration depth, MRR and drilling time in EBM.',
 params:[
  {id:'V',label:'Accelerating voltage',unit:'kV',min:50,max:150,step:1,val:120},
  {id:'I',label:'Beam current',unit:'mA',min:1,max:40,step:0.5,val:10},
  {id:'tp',label:'Pulse duration',unit:'µs',min:10,max:1000,step:5,val:100},
  {id:'fr',label:'Pulse frequency',unit:'Hz',min:1,max:1000,step:1,val:100},
  {id:'ds',label:'Spot (hole) diameter',unit:'µm',min:20,max:400,step:5,val:100},
  {id:'t',label:'Sheet thickness',unit:'mm',min:0.1,max:5,step:0.1,val:1},
  {id:'mat',label:'Work material',type:'select',val:'steel',options:[['steel','Steel'],['ti','Ti-6Al-4V'],['ni','Nickel superalloy'],['al','Aluminium'],['w','Tungsten']]},
 ],
 outputs:[
  {k:'th',label:'Time per hole',unit:'s',pri:1},
  {k:'mrr',label:'MRR',unit:'mm³/min'},
  {k:'Pk',label:'Peak beam power',unit:'kW'},
  {k:'pd',label:'Power density',unit:'MW/cm²'},
  {k:'Ep',label:'Energy per pulse',unit:'J'},
  {k:'n',label:'Pulses per hole',unit:''},
  {k:'del',label:'Electron range',unit:'µm'},
  {k:'beta',label:'Electron speed',unit:'× c'},
 ],
 sweep:{x:'I',y:'th'},
 compute(p){
  const m=TH[p.mat];
  const Pk=p.V*1e3*p.I*1e-3;
  const Ep=Pk*p.tp*1e-6;
  const ev=p.model==='melt'?eMelt(m):eVap(m);
  const vpp=0.15*Ep/ev;
  const holeV=Math.PI/4*Math.pow(p.ds/1000,2)*p.t;
  const n=Math.ceil(holeV/vpp);
  const pd=Pk/(Math.PI/4*Math.pow(p.ds*1e-4,2))/1e6;
  const del=2.2e-12*Math.pow(p.V*1e3,2)/(m.rho/1000)*1e4;
  const g=1+p.V*1e3/511e3, beta=Math.sqrt(1-1/(g*g));
  const notes=[];
  if(p.tp*1e-6*p.fr>0.5) notes.push('Duty cycle above 50 %: heat builds up between pulses, enlarging the melt zone and HAZ.');
  if(p.t*1000/p.ds>15) notes.push('Aspect ratio above ~15:1 is difficult; vapour pressure may not expel melt from deep holes.');
  if(pd<0.1) notes.push('Power density below ~10⁵ W/cm²: the beam melts rather than vaporises, giving poor hole quality.');
  return {o:{th:n/p.fr,mrr:vpp*p.fr*60,Pk:Pk/1000,pd,Ep,n,del,beta},notes};
 },
 theory:{
  principle:[
   'Electrons are emitted from a heated tungsten filament (cathode), shaped by a negatively biased grid cup and accelerated through an anode by 50–150 kV. At 120 kV they travel at about 0.6 c.',
   'Magnetic lenses focus the beam to 10–200 µm, and deflection coils position it. The whole column and work chamber are under high vacuum so electrons are not scattered by gas molecules.',
   'Electrons penetrate a few tens of microns and convert their kinetic energy to heat below the surface. The material vaporises explosively, expelling melt. The beam is pulsed (µs to ms) so each pulse drills a little deeper while the surrounding material stays cool.'
  ],
  eq:[
   {f:'δ = 2.2×10<sup>−12</sup> · <var>V</var><sup>2</sup> / ρ   (cm; <var>V</var> in volts, ρ in g/cm³)',w:'Whiddington-type electron range in the work.'},
   {f:'<var>E</var><sub>p</sub> = <var>V</var> · <var>I</var> · <var>t</var><sub>p</sub>,   MRR = η <var>E</var><sub>p</sub> <var>f</var> / [ ρ ( <var>c</var>Δ<var>T</var><sub>b</sub> + <var>L</var><sub>m</sub> + <var>L</var><sub>v</sub> ) ]',w:'Energy per pulse and removal rate if a fraction η of beam energy vaporises material.'},
  ],
  effects:['Penetration depth grows with V², so higher voltage drills deeper per pulse.','Hole time falls with beam current and pulse duration.','Higher frequency drills faster until heat accumulates.','Materials with high vaporisation energy (W, Ni alloys) drill slowest.'],
  apps:['Thousands of small holes in turbine combustor liners and blades','Spinnerets for synthetic fibres','Filters and sieves in thin sheet','Micro-slots and engraving'],
  adv:['Very small holes (down to ~25 µm) with high aspect ratio','Any material; very high hole rates in thin sheet','Precise beam control by electromagnetic deflection'],
  lim:['Vacuum chamber limits part size and adds cycle time','X-ray generation needs shielding','High equipment cost; recast and small taper'],
  model:'<b>Simulator model.</b> Removal efficiency η = 0.15 of pulse energy to vaporisation (room temperature to boiling plus latent heats). With 120 kV, 10 mA, 100 µs and 100 Hz this gives about 1.8 mm³/min in steel, which agrees with the classic textbook value (≈1.6 mm³/min). Electron range by Whiddington\'s rule; electron speed from relativistic kinematics.'
 },
 procedure:['Select steel, 1 mm thick, 100 µm hole.','Set 120 kV, 10 mA, 100 µs, 100 Hz.','Vary beam current from 2 to 40 mA and record time per hole.','Vary accelerating voltage and record electron range; check δ ∝ V².','Compare drilling time for aluminium and tungsten.'],
 quiz:[
  {q:'EBM is carried out in vacuum mainly to…',o:['Cool the work','Prevent electron scattering by gas molecules and protect the filament','Increase beam current','Reduce noise'],a:1,why:'Collisions with air molecules would scatter and slow the electrons; the hot filament would also oxidise.'},
  {q:'At 120 kV, electrons travel at roughly…',o:['0.06 c','0.6 c','1.0 c','3 × 10³ m/s'],a:1,why:'From relativistic kinematics, γ = 1 + 120/511 ≈ 1.23, giving β ≈ 0.59.'},
  {q:'Electron penetration depth increases with accelerating voltage as…',o:['V','V²','√V','1/V'],a:1,why:'Whiddington\'s law: range ∝ V²/ρ.'},
  {q:'A safety requirement specific to EBM is…',o:['Hearing protection only','Shielding against X-rays','Fire-proof dielectric','Acid-resistant gloves'],a:1,why:'Electrons striking metal generate X-rays (Bremsstrahlung).'},
 ]
},
/* ======================= PAM ======================= */
{
 id:'pam', abbr:'PAM', name:'Plasma Arc Machining', cat:'therm',
 blurb:'A constricted arc ionises gas to 11 000–30 000 °C and blows molten metal from the kerf.',
 facts:{energy:'Thermal (electric arc in ionised gas)', mech:'Melting; molten metal blown out by gas jet', medium:'Plasma gas: air, O₂, N₂, Ar–H₂', tool:'Torch: Hf or W electrode, Cu nozzle'},
 aim:'To study how arc current, gas type and plate thickness affect arc power, cutting speed, kerf width and energy per unit length in plasma arc cutting.',
 params:[
  {id:'I',label:'Arc current',unit:'A',min:30,max:400,step:5,val:130},
  {id:'t',label:'Plate thickness',unit:'mm',min:1,max:50,step:1,val:12},
  {id:'gas',label:'Plasma gas',type:'select',val:'air',options:[['air','Air'],['o2','Oxygen'],['n2','Nitrogen'],['arh','Argon–hydrogen (H35)']]},
  {id:'mat',label:'Work material',type:'select',val:'steel',options:[['steel','Mild steel'],['ss','Stainless steel'],['al','Aluminium']]},
 ],
 outputs:[
  {k:'u',label:'Cutting speed',unit:'mm/min',pri:1},
  {k:'V',label:'Arc voltage',unit:'V'},
  {k:'P',label:'Arc power',unit:'kW'},
  {k:'kerf',label:'Kerf width',unit:'mm'},
  {k:'le',label:'Energy per metre of cut',unit:'MJ/m'},
  {k:'pierce',label:'Pierce capacity (rule of thumb)',unit:'mm'},
 ],
 sweep:{x:'t',y:'u'},
 compute(p){
  const V=100+0.4*p.I+0.9*p.t+(p.gas==='arh'?20:0);
  const P=V*p.I;
  const gas={air:{steel:1.2,ss:1.0,al:1.0},o2:{steel:1.35,ss:0.9,al:0.9},n2:{steel:1.0,ss:1.05,al:1.05},arh:{steel:0.95,ss:1.15,al:1.2}}[p.gas][p.mat];
  const es={steel:eMelt(TH.steel),ss:eMelt(TH.ss),al:eMelt(TH.al)*2.0}[p.mat];
  const kerf=0.8+0.0075*p.I+0.03*p.t;
  const raw=0.3423*gas*P*Math.exp(-p.t/(0.371*p.I))/(p.t*kerf*es)*60;
  const chartU=p.model==='chart'?PAMCHART(p.I,p.t,p.mat):null;
  const capped=p.model!=='chart'&&raw>9000;
  const us=(p.model==='chart'?chartU:Math.min(raw,9000))/60;
  const notes=[];
  if(p.model==='chart'){notes.push('Chart model: speed interpolated from Hypertherm Powermax125 mechanized charts (air plasma, best quality). Gas setting is ignored.');if(!isFinite(chartU))notes.push('This current or thickness is outside the published charts (45–125 A; listed thicknesses only), so the chart model gives no value.');}
  if(capped) notes.push('Speed limited to 9 m/min, the practical ceiling in Hypertherm\'s charts. Thin sheet at low current cannot be cut faster without losing arc stability.');
  if(p.t>0.18*p.I) notes.push('Thickness exceeds the rule-of-thumb pierce capacity for this current; start from an edge.');
  if(us*60<250) notes.push('Very slow cutting: heavy bottom dross and a wide, bevelled kerf are expected.');
  if(p.gas==='o2'&&p.mat!=='steel') notes.push('Oxygen is used for carbon steel only; on SS and Al it gives a rough, oxidised edge.');
  if(p.gas==='arh'&&p.mat==='steel') notes.push('Ar–H₂ is normally reserved for thick stainless and aluminium.');
  return {o:{u:us*60,V,P:P/1000,kerf,le:P/us/1000,pierce:0.18*p.I},notes};
 },
 theory:{
  principle:[
   'A DC arc is struck between a cathode electrode (hafnium insert in a copper holder for air/O₂; tungsten for inert gases) and the workpiece (transferred arc). Gas swirling through a small copper nozzle constricts the arc, raising its current density and temperature to 11 000–30 000 °C.',
   'The ionised gas leaves the nozzle at near-sonic speed. It melts a narrow kerf through the plate and blows the molten metal out of the bottom. With oxygen or air on mild steel, oxidation adds extra heat.',
   'In a non-transferred arc, the arc runs between electrode and nozzle, and only the hot gas reaches the work. This mode can heat non-conductive materials but is not used for heavy cutting.'
  ],
  eq:[
   {f:'<var>P</var> = <var>V</var><sub>arc</sub> · <var>I</var>,   <var>V</var><sub>arc</sub> ≈ 100 + 0.4<var>I</var> + 0.9<var>t</var>',w:'Arc power. Fitted to the arc voltages in Hypertherm\'s Powermax125 charts (≈157 V at 125 A/12 mm, 180 V at 40 mm).'},
   {f:'<var>u</var> = η<sub>th</sub> · <var>k</var><sub>gas</sub> · <var>P</var> · e<sup>−t/(0.371 I)</sup> / [ <var>t</var> · <var>w</var> · ρ ( <var>c</var>Δ<var>T</var><sub>m</sub> + <var>L</var><sub>m</sub> ) ]',w:'Energy balance on the melted kerf with η_th = 0.34. Losses grow with thickness relative to current, so the usable thickness scales with current.'},
  ],
  effects:['Cutting speed rises with current and falls roughly inversely with thickness.','Kerf widens with current; bevel (2–6°) is typical.','Oxygen gives the fastest, cleanest cuts on mild steel; Ar–H₂ for thick SS and Al.','Too fast → lag lines and top dross; too slow → bottom dross.'],
  apps:['Structural steel, shipbuilding and plate fabrication','Stainless and aluminium plate','Gouging and bevel preparation for welding','CNC profile cutting of thick plate'],
  adv:['Fast cutting of thick conductive plate','Cheaper than laser for thick sections','Works on any conductive metal'],
  lim:['Wide kerf and bevelled edges','Large HAZ compared with laser and waterjet','UV radiation, noise and fumes','Consumables (electrode, nozzle) wear'],
  model:'<b>Simulator model.</b> η_th = 0.342 and loss length 0.371 mm/A were fitted to Hypertherm Powermax125 mechanized cut charts (mild steel, air, best quality) at 125 A and 65 A only. The 105 A, 45 A, stainless and aluminium charts were held back for validation. Gas factors other than air are not validated. Aluminium uses twice its melting energy to account for high conductivity. Speeds are capped at 9 m/min. Kerf and pierce capacity (≈0.18 mm/A) are rules of thumb.'
 },
 procedure:['Select mild steel and air.','Set 130 A and vary thickness from 2 to 40 mm; record cutting speed and kerf.','Plot speed vs thickness.','Repeat at 65 A and 260 A.','Change gas to oxygen and nitrogen; compare speeds for steel and stainless.'],
 quiz:[
  {q:'The plasma arc temperature is typically…',o:['1 500–2 000 °C','3 000–5 000 °C','11 000–30 000 °C','Above 1 000 000 °C'],a:2,why:'Constriction raises the energy density of the arc far above a free arc.'},
  {q:'In a transferred-arc torch the arc runs between…',o:['Electrode and nozzle','Electrode and workpiece','Two nozzles','Workpiece and ground only'],a:1,why:'The workpiece is part of the electrical circuit.'},
  {q:'A typical drawback of plasma cutting is…',o:['It cannot cut steel','Bevelled kerf and a significant HAZ','Very low cutting speed','It needs a vacuum'],a:1,why:'The arc is wider at the top, and heat input is high.'},
  {q:'In air and oxygen plasma torches the electrode insert is usually…',o:['Tungsten','Hafnium','Graphite','Brass'],a:1,why:'Hafnium forms a refractory oxide that resists oxidising plasma; tungsten would burn away.'},
 ]
},
];

const OTHERS=[
 {abbr:'IBM',name:'Ion Beam Machining',cat:'therm',t:'Argon ions accelerated to 1–10 keV in vacuum knock surface atoms off by sputtering. Atomic-scale finishing and thinning of TEM samples, optics and semiconductors.'},
 {abbr:'ECG',name:'Electrochemical Grinding',cat:'chem',t:'A conductive, metal-bonded grinding wheel acts as cathode. About 90 % of removal is electrolytic and the rest abrasive. Burr-free, stress-free grinding of carbide tools and thin sections.'},
 {abbr:'ECDM',name:'Electrochemical Discharge Machining',cat:'chem',t:'A gas film forms around a tool in an alkaline electrolyte; discharges through the film plus chemical etching machine glass, quartz and ceramics.'},
 {abbr:'PCM',name:'Photochemical Machining',cat:'chem',t:'A photoresist mask exposed through a phototool defines the pattern, then spray etching removes metal. Used for shims, meshes, encoder discs and lead frames.'},
 {abbr:'AFM',name:'Abrasive Flow Machining',cat:'mech',t:'A viscoelastic putty loaded with abrasive is extruded back and forth through internal passages to deburr, radius and polish hard-to-reach edges.'},
 {abbr:'MAF',name:'Magnetic Abrasive Finishing',cat:'mech',t:'A magnetic field holds ferromagnetic abrasive as a flexible brush against the surface. Nanometre-level finishing of tubes, bearings and medical parts.'},
 {abbr:'STEM',name:'Shaped Tube Electrolytic Machining',cat:'chem',t:'An insulated titanium tube cathode with acid electrolyte drills deep small holes (aspect ratio up to 300:1) in turbine blades.'},
 {abbr:'EDG',name:'Electrical Discharge Grinding',cat:'therm',t:'A rotating graphite or metal wheel removes material by sparking, without abrasive contact. Used for PCD tools and carbide form tools.'},
 {abbr:'LAM',name:'Laser-Assisted Machining',cat:'therm',t:'A laser softens the material just ahead of a conventional cutting tool, lowering cutting forces on ceramics, superalloys and hardened steel.'},
];

const CATS={mech:{name:'Mechanical',sub:'Kinetic energy of abrasive, water or vibration',col:'--mech'},therm:{name:'Thermal & electrothermal',sub:'Melting and vaporisation by sparks, photons, electrons or plasma',col:'--therm'},chem:{name:'Chemical & electrochemical',sub:'Dissolution by reaction or by electrolysis',col:'--chem'}};

// Classic comparison (Pandey & Shan, Modern Machining Processes) — indicative
const CLASSIC=[
 ['USM','mech','300','7.5','0.2–0.5','25','2 400'],
 ['AJM','mech','0.8','50','0.5–1.2','2.5','250'],
 ['ECM','chem','15 000','50','0.1–2.5','5','100 000'],
 ['CHM','chem','15','50','0.5–2.5','50','—'],
 ['EDM','therm','800','15','0.2–1.2','125','2 700'],
 ['EBM','therm','1.6','25','0.5–2.5','250','150 (avg)'],
 ['LBM','therm','0.1','25','0.5–1.2','125','2 (avg)'],
 ['PAM','therm','75 000','125','Rough','500','50 000'],
 ['Milling','none','50 000','50','0.5–5','25','3 000'],
];
