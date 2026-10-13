// ---------- sources ----------
const SRC={
 hyp:{t:'Hypertherm, Powermax125 Operator Manual 808080 — mechanized cut charts (metric, air plasma, best quality)',u:'https://www.parkindustries.com/wp-content/uploads/2022/03/Powermax125-mechanized-cut-charts_rev-3-2.pdf'},
 ray:{t:'Raymond Laser, Laser cutting thickness and speed chart (fiber laser, 1–3 kW)',u:'https://www.raymondlaser.com/laser-cutting-thickness-and-speed-chart/'},
 chem:{t:'Chemcut, High Temperature Ferric Chloride Etching — an evaluation of the process',u:'https://www.chemcut.net/hubfs/Technical%20papers/Hi_Temp_Ferric_EtchingMetric.pdf'},
 yan:{t:'Yanpolskiy et al., Rate of electrochemical dissolution of U10A steel under ECM conditions, Obrabotka Metallov',u:'https://journals.rcsi.science/1994-6309/article/view/292092'},
 lee:{t:'Precision current-efficiency curve measurement with a casing-type anode, Applied Sciences 11 (2021) 1425',u:'https://www.mdpi.com/2076-3417/11/4/1425'},
 ward:{t:'WARDJET, Nozzle and orifice (speed vs pressure, abrasive rate and quality data)',u:'https://www.wardjet.com/nozzle-and-orifice/'},
 fed:{t:'FedJet, Waterjet cutting carbon steel: parameter guide (75 000 psi, 0.020" orifice)',u:'https://fedjetwaterjet.com/info-detail/waterjet-cutting-carbon-steel-complete-parameter-guide-for-production-engineers'},
 sul:{t:'Sultan et al., MRR, EWR and Ra in die-sinking EDM with hollow tool, Int. J. Manufacturing Engineering (2014) 259129',u:'https://www.hindawi.com/journals/ijme/2014/259129/'},
 ps:{t:'P.C. Pandey & H.S. Shan, Modern Machining Processes, Tata McGraw-Hill — comparison table',u:''},
};

// ---------- validation sets ----------
// status: validated | partial | trend | conflict | textbook | none
const VALID={
 pam:{status:'validated',summary:'Fitted on two Hypertherm charts (mild steel, 125 A and 65 A). Tested on four charts it never saw: 105 A and 45 A mild steel, 125 A stainless, 125 A aluminium.',
  sets:[
   {name:'Mild steel, 125 A (calibration)',role:'cal',fix:{I:125,mat:'steel',gas:'air'},x:'t',y:'u',src:'hyp',pts:[[6,4980],[8,3800],[10,2750],[12,2050],[16,1260],[20,980],[25,610],[30,460],[32,400],[35,340],[40,240]]},
   {name:'Mild steel, 65 A (calibration)',role:'cal',fix:{I:65,mat:'steel',gas:'air'},x:'t',y:'u',src:'hyp',pts:[[2,5930],[3,5150],[4,4370],[6,2815],[8,1815],[10,1085],[12,845],[16,565],[20,355],[25,215]]},
   {name:'Mild steel, 105 A',role:'val',fix:{I:105,mat:'steel',gas:'air'},x:'t',y:'u',src:'hyp',pts:[[6,4110],[8,3220],[10,2410],[12,1810],[16,1050],[20,780],[25,540],[30,420],[32,370]]},
   {name:'Mild steel, 45 A',role:'val',fix:{I:45,mat:'steel',gas:'air'},x:'t',y:'u',src:'hyp',pts:[[1,8890],[1.5,8040],[2,6565],[3,3725],[4,2250],[6,1265]]},
   {name:'Stainless steel, 125 A',role:'val',fix:{I:125,mat:'ss',gas:'air'},x:'t',y:'u',src:'hyp',pts:[[6,5910],[8,4060],[10,2540],[12,2170],[16,1140],[20,940],[25,540],[30,430],[32,400],[35,320],[40,180]]},
   {name:'Aluminium, 125 A',role:'val',fix:{I:125,mat:'al',gas:'air'},x:'t',y:'u',src:'hyp',pts:[[6,7660],[8,5100],[10,2980],[16,1540],[20,1260],[25,850],[30,540],[32,430],[35,370],[40,270]]},
  ]},
 lbm:{status:'partial',summary:'Fiber laser only. The inert-gas law was fitted on 2 kW stainless and 2 kW aluminium and tested at 3 kW. The oxygen law was fitted on the 2 kW mild-steel column and tested at 1 kW. CO₂, Nd:YAG, titanium and non-metals are not validated. The chart is a vendor chart without stated focus or gas pressure, and its mild-steel column mixes power levels.',
  sets:[
   {name:'Stainless, N₂, 2 kW (calibration)',role:'cal',fix:{las:'fiber',P:2000,mat:'ss',gas:'n2'},x:'t',y:'u',src:'ray',pts:[[1,35],[2,10],[3,6],[4,3.2],[5,1.8],[6,1],[8,.6],[10,.4]]},
   {name:'Stainless, N₂, 3 kW',role:'val',fix:{las:'fiber',P:3000,mat:'ss',gas:'n2'},x:'t',y:'u',src:'ray',pts:[[1,55],[2,20],[3,8],[4,4.5],[5,3],[6,2],[8,1.2],[10,.8],[12,.5]]},
   {name:'Aluminium, N₂, 2 kW (calibration)',role:'cal',fix:{las:'fiber',P:2000,mat:'al',gas:'n2'},x:'t',y:'u',src:'ray',pts:[[1,30],[2,8],[3,4],[4,2.5],[5,1.9],[6,1],[8,.55]]},
   {name:'Aluminium, N₂, 3 kW',role:'val',fix:{las:'fiber',P:3000,mat:'al',gas:'n2'},x:'t',y:'u',src:'ray',pts:[[1,50],[2,20],[3,8],[4,4],[5,2.8],[6,1.7],[8,1.1],[10,.75],[12,.45]]},
   {name:'Mild steel, O₂, 2 kW (calibration)',role:'cal',fix:{las:'fiber',P:2000,mat:'steel',gas:'o2'},x:'t',y:'u',src:'ray',pts:[[1,9],[2,5.7],[3,3.2],[4,3],[5,2.6],[6,2.5],[8,1.3],[10,1.1],[12,.9],[14,.85],[16,.75]]},
   {name:'Mild steel, O₂, 1 kW',role:'val',fix:{las:'fiber',P:1000,mat:'steel',gas:'o2'},x:'t',y:'u',src:'ray',pts:[[1,9],[2,5.5],[3,3],[4,2.7],[5,2.1],[6,1.5],[8,1.1],[10,.85],[12,.6]]},
  ],
  finding:'The oxygen law under-predicts 1 kW speeds by about 35 %. Real speed scales less than linearly with laser power, because iron combustion supplies heat that does not depend on the beam. The model assumes linear scaling.'},
 chm:{status:'partial',summary:'Copper / ferric chloride (spray) only. The activation energy was refitted to Chemcut\'s measurements. The other etchant systems use textbook rates and are not validated.',
  checks:[
   {label:'Rate increase, 54.4 → 71.1 °C (Cu, spray)',pub:'31.6–44.8 %',lo:31.6,hi:44.8,unit:'%',model:()=>{const a=runP('chm',{sys:'cu',ag:'spray',T:54.4}).r,b=runP('chm',{sys:'cu',ag:'spray',T:71.1}).r;return (b/a-1)*100;},src:'chem'},
   {label:'Etch rate at 54.4 °C (Cu, spray)',pub:'34.8–60.9 µm/min',lo:34.8,hi:60.9,unit:'µm/min',model:()=>runP('chm',{sys:'cu',ag:'spray',T:54.4}).r*1000,src:'chem'},
   {label:'Etch rate at 71.1 °C (Cu, spray)',pub:'up to 71.3 µm/min',lo:40,hi:71.3,unit:'µm/min',model:()=>runP('chm',{sys:'cu',ag:'spray',T:71.1}).r*1000,src:'chem'},
   {label:'Slope of rate vs temperature (Cu, spray)',pub:'≈0.9–0.95 µm/min per °C',lo:0.8,hi:1.1,unit:'µm/min/°C',model:()=>{const a=runP('chm',{sys:'cu',ag:'spray',T:54.4}).r,b=runP('chm',{sys:'cu',ag:'spray',T:71.1}).r;return (b-a)*1000/16.7;},src:'chem'},
  ],
  finding:'The original model used 45 kJ/mol for every system. That predicted a 123 % rise for copper, about three times the measured rise. Spray etching of copper is limited by transport of etchant, not by reaction rate, so the model now uses 18 kJ/mol for Cu/FeCl₃.'},
 ecm:{status:'inputs',summary:'Faraday\'s law is exact. What limits accuracy is current efficiency, so the simulator now takes efficiencies from measurements instead of assuming 100 %.',
  checks:[
   {label:'U10A tool steel, 10 % NaCl, 8 V: current efficiency',pub:'70.8 %',lo:70.8,hi:70.8,unit:'%',model:()=>runP('ecm',{mat:'u10a',el:'nacl'}).eta,src:'yan',note:'Used as model input'},
   {label:'SS304, NaNO₃, J ≥ 83 A/cm²: specific removal',pub:'1.20 mm³/A·min',lo:1.16,hi:1.24,unit:'mm³/A·min',model:()=>{const o=runP('ecm',{mat:'ss',el:'nano3',f:4,V:30,k:20});return o.mrr/o.I;},src:'lee',note:'Plateau of measured curve; used as model input'},
   {label:'SS304, NaNO₃, J ≈ 20 A/cm²: specific removal',pub:'≈1.02 mm³/A·min',lo:0.97,hi:1.07,unit:'mm³/A·min',model:()=>{const o=runP('ecm',{mat:'ss',el:'nano3',f:0.2,V:10,k:15});return o.mrr/o.I;},src:'lee',note:'Interpolated from measured curve'},
  ],
  finding:'Assuming 100 % efficiency overestimates removal of tool steel by about 40 % and of stainless steel in NaNO₃ by 65 % or more. Use measured efficiencies for any design calculation.'},
 awjm:{status:'trend',summary:'Public cut charts rarely state all of pressure, orifice, tube, abrasive rate and edge quality together, so absolute speeds cannot be tested strictly. These checks test the trends and whether published speeds fall inside the model\'s quality band.',
  checks:[
   {label:'Speed ratio, 207 → 414 MPa (SS 12 mm, 0.25/0.76 mm)',pub:'≈2.9×',lo:2.6,hi:3.2,unit:'×',model:()=>runP('awjm',{p:414,dn:0.254,dm:0.76,ma:0.318,t:12.7,mat:'ss'}).u/runP('awjm',{p:207,dn:0.254,dm:0.76,ma:0.318,t:12.7,mat:'ss'}).u,src:'ward'},
   {label:'Speed gain, garnet 0.32 → 0.45 kg/min',pub:'+3.6 %',lo:1,hi:7,unit:'%',model:()=>(runP('awjm',{p:414,dn:0.254,dm:0.76,ma:0.454,t:12.7,mat:'ss'}).u/runP('awjm',{p:414,dn:0.254,dm:0.76,ma:0.318,t:12.7,mat:'ss'}).u-1)*100,src:'ward'},
   {label:'Aluminium ÷ stainless speed ratio',pub:'≈3.2×',lo:2.9,hi:3.5,unit:'×',model:()=>runP('awjm',{mat:'al'}).u/runP('awjm',{mat:'ss'}).u,src:'ward'},
  ],
  bands:{name:'Mild steel, 517 MPa, 0.51 mm orifice, 1.27 mm tube, 0.61 kg/min — published "good edge" speed vs model band (Q5 to Q1)',src:'fed',fix:{p:517,dn:0.508,dm:1.27,ma:0.61,mat:'steel'},rows:[[6,180,220],[12,90,120],[25,35,50],[50,15,22],[75,8,12],[100,5,8]]},
  finding:'Trends match within 10 %. The aluminium/stainless ratio is about 17 % low. All six published speeds fall inside the model\'s quality band, but published speed falls 36× from 6 to 100 mm against the model\'s 17×. The model does not capture the extra loss of jet energy in very thick sections.'},
 edm:{status:'conflict',summary:'Not validated. The only open dataset found disagrees with the model by about 20×. The likely cause is the operating regime, not the physics, but this cannot be confirmed without matched data.',
  checks:[
   {label:'Max MRR at 45 A (12 mm tubular Cu electrode, workpiece +, side flushing)',pub:'29 mm³/min',lo:14,hi:29,unit:'mm³/min',model:()=>runP('edm',{Ip:45,ton:400,toff:100,el:'cu'}).mrr,src:'sul'},
  ],
  finding:'This model represents roughing with large graphite electrodes, where the industry rule of thumb is about 10 mm³/min per ampere. The published test used a 50 mm² tubular copper electrode with straight polarity and side flushing, so current density and debris removal limited removal. Validate with your own machine\'s data using the panel below before trusting absolute MRR.'},
 ebm:{status:'textbook',summary:'Consistent with the classic textbook comparison table, which is not a measured validation.',
  checks:[{label:'Typical EBM removal rate',pub:'1.6 mm³/min',lo:1.2,hi:2.0,unit:'mm³/min',model:()=>runP('ebm',{}).mrr,src:'ps'}]},
 usm:{status:'none',summary:'Not yet validated. Needed: penetration rate in glass vs static force at fixed amplitude, frequency and grit (e.g. from a departmental USM machine).'},
 ajm:{status:'none',summary:'Not yet validated. Needed: MRR vs SOD and vs pressure on glass for a stated nozzle, grit and powder flow rate.'},
 wjm:{status:'none',summary:'Not yet validated. Hydraulics (velocity, flow, power) follow Bernoulli with standard coefficients. Cutting speeds for soft materials need a manufacturer cut chart.'},
 wedm:{status:'none',summary:'Not yet validated. Needed: cutting speed vs thickness from a machine technology table (wire type and diameter, work material).'},
};
const STATUS={validated:['Validated','--ok'],partial:['Partly validated','--ok'],trend:['Trend-checked','--warn'],inputs:['Uses measured inputs','--ok'],conflict:['Conflicting data','--bad'],textbook:['Textbook check only','--warn'],none:['Not yet validated','--muted']};

// ---------- pre-tests ----------
const PRE={
 usm:[{q:'Which property makes glass easy to machine by brittle micro-chipping?',o:['High ductility','Low fracture toughness','High electrical conductivity','Low density'],a:1,why:'Cracks start and grow easily in materials with low fracture toughness.'},
      {q:'"Ultrasonic" means a frequency above about…',o:['200 Hz','2 kHz','20 kHz','2 MHz'],a:2,why:'Roughly the upper limit of human hearing.'},
      {q:'A piezoelectric transducer converts…',o:['Heat into light','Electrical energy into mechanical vibration','Magnetism into heat','Chemical energy into current'],a:1,why:'Applied voltage changes the crystal\'s dimensions.'}],
 ajm:[{q:'If particle velocity doubles, kinetic energy per particle becomes…',o:['2×','4×','√2×','Unchanged'],a:1,why:'KE = ½mv².'},
      {q:'Erosion of a brittle surface by a hard particle happens mainly by…',o:['Melting','Crack formation and chipping','Dissolution','Plastic ploughing only'],a:1,why:'Lateral and radial cracks meet and remove chips.'},
      {q:'A common AJM abrasive is…',o:['Aluminium oxide','Graphite','Talc','Copper powder'],a:0,why:'Al₂O₃ and SiC are hard and sharp.'}],
 wjm:[{q:'By Bernoulli\'s equation, jet velocity from a pressure p varies as…',o:['p','p²','√p','1/p'],a:2,why:'v = √(2p/ρ).'},
      {q:'1 MPa equals…',o:['1 bar','10 bar','100 bar','1000 bar'],a:1,why:'1 bar = 0.1 MPa.'},
      {q:'A hydraulic intensifier raises pressure by…',o:['Heating the water','Using a large piston driving a small plunger','Using a centrifugal impeller','Adding air'],a:1,why:'Pressure ratio equals the area ratio of the two pistons.'}],
 awjm:[{q:'When slow particles are accelerated by a fast fluid in a tube, their final speed is…',o:['Higher than the fluid speed','Lower than the fluid speed','Zero','Equal to sound speed'],a:1,why:'Momentum is shared; the mixture moves slower than the original jet.'},
      {q:'Garnet abrasive has a Mohs hardness of about…',o:['3','5','7.5–8','10'],a:2,why:'Harder than most metals and glass but softer than diamond.'},
      {q:'Which material has the higher AWJ machinability number?',o:['Aluminium','Hardened steel','Titanium','Tungsten carbide'],a:0,why:'Softer, lower-strength materials erode faster.'}],
 chm:[{q:'According to the Arrhenius law, reaction rate with temperature…',o:['Falls linearly','Rises exponentially','Is constant','Rises linearly'],a:1,why:'k = A·exp(−Ea/RT).'},
      {q:'"Isotropic" etching means the etch proceeds…',o:['Only downwards','Equally in all directions','Only sideways','Along grain boundaries only'],a:1,why:'This is why undercut appears under the mask.'},
      {q:'A photoresist is…',o:['A light-sensitive polymer coating','A conductive paint','An etchant','A ceramic mask'],a:0,why:'Exposure through a phototool changes its solubility.'}],
 ecm:[{q:'Faraday\'s constant is approximately…',o:['9.65 C/mol','965 C/mol','96 485 C/mol','6.02×10²³ C/mol'],a:2,why:'Charge on one mole of electrons.'},
      {q:'In electrolysis, oxidation (metal dissolution) occurs at the…',o:['Cathode','Anode','Both','Neither'],a:1,why:'The anode gives up electrons; its metal goes into solution.'},
      {q:'In an electrolyte, current density J relates to field E by…',o:['J = κE','J = E/κ','J = κ²E','J = E²/κ'],a:0,why:'Ohm\'s law in point form; κ is conductivity.'}],
 edm:[{q:'When the field across a dielectric exceeds its strength, it…',o:['Freezes','Breaks down and forms a plasma channel','Becomes magnetic','Evaporates instantly everywhere'],a:1,why:'This breakdown is the start of each spark.'},
      {q:'Energy delivered in one rectangular pulse is…',o:['V/I','V·I·t','V·t/I','I²/t'],a:1,why:'Power × time.'},
      {q:'Duty factor is defined as…',o:['tₒff/tₒₙ','tₒₙ/(tₒₙ + tₒff)','tₒₙ × tₒff','1/tₒₙ'],a:1,why:'Fraction of each cycle during which current flows.'}],
 wedm:[{q:'Deionised water has…',o:['High conductivity','Very low conductivity','No oxygen','High viscosity'],a:1,why:'Ions are removed by resin, so it acts as a dielectric.'},
      {q:'"Kerf" is…',o:['Wire tension','Width of the cut','Spark frequency','Table speed'],a:1,why:'Material removed across the cut.'},
      {q:'Taper cuts in WEDM are made by…',o:['Tilting the table','Offsetting the upper guide from the lower guide (U–V axes)','Changing wire material','Reducing voltage'],a:1,why:'The wire then runs at an angle through the work.'}],
 lbm:[{q:'Photon energy E = hc/λ. A longer wavelength gives…',o:['Higher energy per photon','Lower energy per photon','The same energy','Zero energy'],a:1,why:'E is inversely proportional to λ.'},
      {q:'A coherent beam has…',o:['Random phase','A fixed phase relationship across the beam','Many wavelengths','No divergence at all'],a:1,why:'This is what lets it be focused tightly.'},
      {q:'Halving the focused spot diameter changes intensity by…',o:['×2','×4','×½','No change'],a:1,why:'Intensity = P/(πd²/4).'}],
 ebm:[{q:'An electron accelerated through V volts gains kinetic energy…',o:['eV','V/e','e²V','√(eV)'],a:0,why:'Work done by the field equals charge × potential difference.'},
      {q:'Electron rest-mass energy is about…',o:['0.511 keV','511 keV','938 MeV','13.6 eV'],a:1,why:'At 100+ kV, relativistic effects are significant.'},
      {q:'A magnetic lens focuses electrons using…',o:['Refraction','The Lorentz force','Gravity','Diffraction'],a:1,why:'F = q(v × B) bends the electron paths.'}],
 pam:[{q:'Plasma is…',o:['A very hot liquid','An ionised gas','A metal vapour only','A solid at high pressure'],a:1,why:'Often called the fourth state of matter.'},
      {q:'Forcing an arc through a small nozzle…',o:['Lowers its temperature','Raises current density and temperature','Has no effect','Turns it off'],a:1,why:'Constriction concentrates the same current in a smaller area.'},
      {q:'A transferred arc needs a workpiece that is…',o:['Transparent','Electrically conductive','Magnetic','Non-metallic'],a:1,why:'The work completes the electrical circuit.'}],
};

// ---------- numericals (randomised) ----------
const rr=(a,b,s=1)=>Math.round((a+Math.random()*(b-a))/s)*s;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const NUM={
 usm:()=>{const m=rr(80,200,5),a1=rr(15,25),a2=rr(30,50);const ans=m*Math.pow(a2/a1,0.75);
   return {q:`A USM set-up removes ${m} mm³/min of glass at amplitude ${a1} µm. Using Shaw's model (MRR ∝ A₀^¾), estimate MRR at ${a2} µm with all else unchanged.`,unit:'mm³/min',ans,sol:`MRR₂ = ${m} × (${a2}/${a1})^0.75 = ${m} × ${(Math.pow(a2/a1,0.75)).toFixed(3)} = ${ans.toFixed(1)} mm³/min.`};},
 ajm:()=>{if(Math.random()<0.5){const d=rr(0.3,0.8,0.05),s=rr(2,12,0.5),a=rr(4,12,0.5);const ans=d+2*s*Math.tan(a*Math.PI/180);
   return {q:`An AJM nozzle has a ${d.toFixed(2)} mm bore and the jet diverges with half-angle α = ${a}°. Estimate the kerf width at an SOD of ${s} mm.`,unit:'mm',ans,sol:`w = d_n + 2·SOD·tan α = ${d.toFixed(2)} + 2 × ${s} × tan ${a}° (= ${Math.tan(a*Math.PI/180).toFixed(4)}) = ${ans.toFixed(3)} mm.`};}
   const s1=rr(1,4,0.5),s2=s1+rr(3,8,0.5),a=rr(4,12,0.5),d=rr(0.3,0.8,0.05);const w1=d+2*s1*Math.tan(a*Math.PI/180),w2=d+2*s2*Math.tan(a*Math.PI/180);const W1=+w1.toFixed(3),W2=+w2.toFixed(3);const ans=Math.atan((W2-W1)/(2*(s2-s1)))*180/Math.PI;
   return {q:`Kerf widths of ${W1} mm at SOD ${s1} mm and ${W2} mm at SOD ${s2} mm were measured in AJM. Find the jet divergence half-angle α.`,unit:'°',ans,sol:`tan α = (w₂ − w₁)/[2(SOD₂ − SOD₁)] = (${W2} − ${W1})/(2 × ${(s2-s1).toFixed(1)}) = ${((W2-W1)/(2*(s2-s1))).toFixed(4)}, so α = ${ans.toFixed(2)}°.`};},
 wjm:()=>{const p=rr(200,400,10),d=pick([0.1,0.15,0.2,0.25,0.3]);const A=Math.PI/4*Math.pow(d*1e-3,2),v=Math.sqrt(2*p*1e6/1000),Q=0.7*A*v,P=p*1e6*Q/1000;
   return {q:`Water at ${p} MPa flows through a ${d} mm orifice (C_d = 0.70, ρ = 1000 kg/m³). Find the hydraulic power in kW.`,unit:'kW',ans:P,sol:`v_th = √(2p/ρ) = ${v.toFixed(0)} m/s. A = π/4·(${d}×10⁻³)² = ${A.toExponential(3)} m². Q = 0.7·A·v_th = ${(Q*60000).toFixed(3)} L/min. P = p·Q = ${P.toFixed(2)} kW.`};},
 awjm:()=>{const vw=rr(700,900,10),mw=rr(1.5,3.5,0.1),ma=rr(0.2,0.6,0.05);const ans=0.8*vw/(1+ma/mw);
   return {q:`In an AWJ cutting head the water jet leaves the orifice at ${vw} m/s with water flow ${mw.toFixed(1)} kg/min. Garnet is added at ${ma.toFixed(2)} kg/min. With momentum-transfer efficiency 0.8, find the abrasive exit velocity.`,unit:'m/s',ans,sol:`R = ṁₐ/ṁ_w = ${(ma/mw).toFixed(3)}. vₐ = 0.8·v_w/(1+R) = 0.8 × ${vw}/${(1+ma/mw).toFixed(3)} = ${ans.toFixed(0)} m/s.`};},
 chm:()=>{const r1=rr(0.015,0.04,0.001),T1=rr(30,45),T2=T1+rr(10,25),Ea=pick([30,40,45,50]);const ans=r1*Math.exp(-Ea*1000/8.314*(1/(T2+273.15)-1/(T1+273.15)));
   return {q:`An etchant removes ${r1.toFixed(3)} mm/min at ${T1} °C. Taking E_a = ${Ea} kJ/mol, find the etch rate at ${T2} °C.`,unit:'mm/min',ans,sol:`r₂ = r₁·exp[−(E_a/R)(1/T₂ − 1/T₁)] = ${r1.toFixed(3)} × exp[−(${Ea*1000}/8.314)(1/${(T2+273.15).toFixed(2)} − 1/${(T1+273.15).toFixed(2)})] = ${ans.toFixed(4)} mm/min.`};},
 ecm:()=>{const I=rr(100,1500,50),eta=pick([0.85,0.9,0.95,1]);const v=eta*I*55.85/(2*96485*7.86)*60*1000;
   return {q:`Iron (M = 55.85 g/mol, z = 2, ρ = 7.86 g/cm³) is machined at ${I} A with current efficiency ${(eta*100).toFixed(0)} %. Find the volumetric MRR.`,unit:'mm³/min',ans:v,sol:`MRR = η·I·M/(z·F·ρ) = ${eta} × ${I} × 55.85 / (2 × 96485 × 7.86) cm³/s = ${(v/60000).toExponential(3)} cm³/s = ${v.toFixed(0)} mm³/min.`};},
 edm:()=>{const Ip=rr(5,40),ton=rr(20,300,10),toff=rr(10,200,10);const ans=25*Ip*ton/(ton+toff);
   return {q:`An EDM generator delivers ${Ip} A peak current, tₒₙ = ${ton} µs, tₒff = ${toff} µs, discharge voltage 25 V. Find the average gap power.`,unit:'W',ans,sol:`D = ${ton}/(${ton}+${toff}) = ${(ton/(ton+toff)).toFixed(3)}. P = V_d·Iₚ·D = 25 × ${Ip} × ${(ton/(ton+toff)).toFixed(3)} = ${ans.toFixed(1)} W.`};},
 wedm:()=>{const ar=rr(120,350,10),t=rr(10,150,5);const ans=ar/t;
   return {q:`A wire EDM rated at ${ar} mm²/min is cutting a ${t} mm thick die plate. What is the cutting speed along the profile?`,unit:'mm/min',ans,sol:`Speed = area rate / thickness = ${ar}/${t} = ${ans.toFixed(2)} mm/min.`};},
 lbm:()=>{const L=pick([[1.07,1.1,'fiber'],[10.6,1.2,'CO₂'],[1.064,1.3,'disk']]),F=pick([100,127,150,200]),D=pick([8,10,12,15,20]);const ans=4*L[1]*L[0]*F/(Math.PI*D);
   return {q:`A ${L[2]} laser (λ = ${L[0]} µm, M² = ${L[1]}) with a ${D} mm beam is focused by an F = ${F} mm lens. Find the focused spot diameter.`,unit:'µm',ans,sol:`d₀ = 4M²λF/(πD) = 4 × ${L[1]} × ${L[0]} µm × ${F}/(π × ${D}) = ${ans.toFixed(1)} µm.`};},
 ebm:()=>{const V=rr(50,150,5),m=pick([['steel',7.87],['aluminium',2.70],['titanium',4.51],['tungsten',19.3]]);const ans=2.2e-12*Math.pow(V*1000,2)/m[1]*1e4;
   return {q:`Estimate the electron penetration depth in ${m[0]} (ρ = ${m[1]} g/cm³) at ${V} kV using δ = 2.2×10⁻¹²·V²/ρ cm.`,unit:'µm',ans,sol:`δ = 2.2×10⁻¹² × (${V*1000})² / ${m[1]} = ${(ans/1e4).toExponential(3)} cm = ${ans.toFixed(1)} µm.`};},
 pam:()=>{const V=rr(120,180,5),I=rr(45,260,5),u=rr(400,4000,50),eta=pick([0.3,0.35,0.4]);const ans=eta*V*I/(u/60);
   return {q:`A plasma torch runs at ${V} V and ${I} A, cutting at ${u} mm/min. If ${(eta*100).toFixed(0)} % of arc power goes into the kerf, what heat is delivered per millimetre of cut?`,unit:'J/mm',ans,sol:`P = ${V} × ${I} = ${V*I} W. u = ${u}/60 = ${(u/60).toFixed(2)} mm/s. q = ηP/u = ${eta} × ${V*I}/${(u/60).toFixed(2)} = ${ans.toFixed(1)} J/mm.`};},
};
