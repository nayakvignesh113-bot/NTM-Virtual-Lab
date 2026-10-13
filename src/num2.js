// ================= v4.3: more numerical problems, each with graded hints =================
// NUMX[id] = extra problem generators. Each returns {q, unit, ans, sol, hints:[...]}.
// HINT0[id] = hints for the original generator in NUM[id]. NUM[id] then draws from all types without repeating the last one.
const _f=(x,n=2)=>(+x).toFixed(n);
const HINT0={
 usm:['Shaw\'s model gives MRR ∝ A₀^(3/4) when only the amplitude changes.','Form the ratio MRR₂/MRR₁ = (A₂/A₁)^0.75 so every other constant cancels.'],
 ajm:['The jet spreads as a cone: each side widens by SOD·tan α.','Kerf width w = d_n + 2·SOD·tan α. For two readings, subtract them to eliminate d_n.'],
 wjm:['Find the theoretical jet velocity from Bernoulli: v = √(2p/ρ). Use p in Pa.','Flow Q = C_d·A·v; hydraulic power P = p·Q. Convert W to kW at the end.'],
 awjm:['Momentum is shared between the water and the abrasive, so the abrasive leaves slower than the water.','vₐ = η·v_w/(1 + R), where R = ṁₐ/ṁ_w is the loading ratio.'],
 chm:['Etch rate follows the Arrhenius law: r ∝ exp(−E_a/RT).','Use absolute temperatures (K) and E_a in J/mol: r₂ = r₁·exp[−(E_a/R)(1/T₂ − 1/T₁)].'],
 ecm:['Faraday\'s law: mass removed per second = η·I·M/(z·F).','Divide by density for volume; 1 cm³/s = 60 000 mm³/min.'],
 edm:['Sparks occur only during tₒₙ, so the duty factor is D = tₒₙ/(tₒₙ + tₒff).','Average power = discharge voltage × peak current × duty factor.'],
 wedm:['Wire EDM machines are rated by area cut per minute (mm²/min).','Linear cutting speed = area rate ÷ workpiece thickness.'],
 lbm:['The focused spot of a real beam is M² times larger than a perfect Gaussian beam.','d₀ = 4M²λF/(πD). Keep λ in µm and F, D in mm so the answer comes out in µm.'],
 ebm:['The penetration depth grows with the square of the accelerating voltage.','Put V in volts and ρ in g/cm³; the formula gives cm, then multiply by 10⁴ for µm.'],
 pam:['Arc power is P = V·I. Only a fraction η of it reaches the kerf.','Heat per mm of cut = ηP / u, with u in mm/s (divide mm/min by 60).'],
 ecg:['Find the electrolytic removal with Faraday\'s law first.','If electrolysis is 90 % of the total, total MRR = electrolytic MRR ÷ 0.9.'],
 ecdm:['Substitute the given values straight into the depth law.','Compute r₀t/h₀ first, add 1, take the natural log, then multiply by h₀.'],
 rum:['A core drill removes only an annulus (ring), not a full circle.','Inner diameter = D − 2 × wall. MRR = feed × π/4 × (D² − dᵢ²).'],
 lam:['Find the reduced specific cutting energy u at the given homologous temperature first.','Force = u × chip area, with chip area = feed × depth of cut. 1 J/mm³ = 1000 N/mm².'],
 afm:['Ra decays exponentially towards a minimum value with the number of cycles.','Ra = Ra_min + (Ra₀ − Ra_min)·e^(−n/n₀).'],
 maf:['Magnetic pressure comes from the energy density of the field, B²/(2μ₀).','Multiply by (1 − 1/μ_r) and convert Pa to kPa.'],
 mrf:['Preston\'s law: removal rate = C_p × pressure × velocity.','Put pressure in Pa. The result is in m/s; convert to µm/min (× 6×10⁷).'],
 cmp:['Convert psi to kPa (1 psi = 6.895 kPa) and use Preston\'s law for the rate.','Time = thickness to remove ÷ removal rate. Watch nm vs m and minutes vs seconds.'],
 ibm:['Each ion knocks out Y atoms. Ion flux = J/e.','Atoms removed per m² per second = (J/e)·Y. Convert to volume with M/(N_A·ρ).'],
};
const NUMX={
 usm:[
  ()=>{const m=rr(60,200,5),f1=pick([18,20,22]),f2=pick([25,30,35,40]);const ans=m*f2/f1;
   return {q:`A USM machine removes ${m} mm³/min of glass at ${f1} kHz. In Shaw's model MRR is directly proportional to frequency. Estimate MRR at ${f2} kHz with the same amplitude, grit and force.`,unit:'mm³/min',ans,
   hints:['Every impact removes the same volume, so more impacts per second means proportionally more removal.','MRR₂ = MRR₁ × f₂/f₁.'],
   sol:`MRR₂ = ${m} × ${f2}/${f1} = ${_f(ans,1)} mm³/min.`};},
  ()=>{const D=rr(4,12,1),h=rr(2,8,0.5),m=rr(20,90,5);const V=Math.PI/4*D*D*h;const ans=V/m;
   return {q:`A ${D} mm diameter solid tool sinks a blind hole ${_f(h,1)} mm deep into alumina by USM at an MRR of ${m} mm³/min. Ignoring overcut, how long does the hole take?`,unit:'min',ans,
   hints:['Find the volume of the hole first: it is a cylinder.','Time = volume ÷ MRR, with V = π/4·D²·h.'],
   sol:`V = π/4 × ${D}² × ${_f(h,1)} = ${_f(V,1)} mm³. t = ${_f(V,1)}/${m} = ${_f(ans,2)} min.`};}],
 ajm:[
  ()=>{const d=pick([25,27,30,40,50]),v=rr(150,300,10),rho=pick([[3.95,'aluminium oxide'],[3.21,'silicon carbide']]);const mp=rho[0]*1000*Math.PI/6*Math.pow(d*1e-6,3);const ans=0.5*mp*v*v*1e9;
   return {q:`An ${rho[1]} particle (ρ = ${rho[0]} g/cm³, spherical, d = ${d} µm) hits the work at ${v} m/s in AJM. Find its kinetic energy.`,unit:'nJ',ans,
   hints:['Particle mass m = ρ·πd³/6. Use SI units: ρ in kg/m³ and d in m.','KE = ½mv². 1 J = 10⁹ nJ.'],
   sol:`m = ${rho[0]*1000} × π/6 × (${d}×10⁻⁶)³ = ${mp.toExponential(3)} kg. KE = ½ × ${mp.toExponential(3)} × ${v}² = ${_f(ans,1)} nJ.`};},
  ()=>{const ma=rr(2,15,1),d=pick([25,30,50]),rho=3.95;const mp=rho*1000*Math.PI/6*Math.pow(d*1e-6,3);const ans=ma/1000/60/mp/1e6;
   return {q:`An AJM unit feeds ${ma} g/min of aluminium oxide grit (ρ = 3.95 g/cm³, d = ${d} µm, assume spheres). How many particles leave the nozzle per second? Give the answer in millions.`,unit:'million/s',ans,
   hints:['Mass of one particle: m = ρ·πd³/6.','Particles per second = (mass flow in kg/s) ÷ (mass of one particle).'],
   sol:`m = 3950 × π/6 × (${d}×10⁻⁶)³ = ${mp.toExponential(3)} kg. ṁ = ${ma}/1000/60 = ${(ma/60000).toExponential(3)} kg/s. N = ${(ma/60000).toExponential(3)}/${mp.toExponential(3)} = ${_f(ans,2)} million/s.`};}],
 wjm:[
  ()=>{const p=rr(150,400,10),cv=pick([0.92,0.95,0.98]);const ans=cv*Math.sqrt(2*p*1e6/1000);
   return {q:`Water at ${p} MPa leaves a sapphire orifice with velocity coefficient C_v = ${cv}. Find the actual jet velocity (ρ = 1000 kg/m³).`,unit:'m/s',ans,
   hints:['All pressure energy becomes kinetic energy in the ideal case: ½ρv² = p.','v = C_v·√(2p/ρ), with p in Pa.'],
   sol:`v = ${cv} × √(2 × ${p}×10⁶/1000) = ${cv} × ${_f(Math.sqrt(2*p*1e3),1)} = ${_f(ans,0)} m/s.`};},
  ()=>{const p=rr(200,400,10),d=pick([0.15,0.2,0.25,0.3,0.35]);const v=Math.sqrt(2*p*1e6/1000),A=Math.PI/4*Math.pow(d*1e-3,2),Q=0.7*A*v;const ans=1000*Q*0.95*v;
   return {q:`A ${d} mm orifice at ${p} MPa (C_d = 0.70, C_v = 0.95) sends a water jet straight down. Find the reaction force on the cutting head.`,unit:'N',ans,
   hints:['Force = rate of change of momentum = ṁ × v_jet.','ṁ = ρ·C_d·A·√(2p/ρ); jet velocity = C_v·√(2p/ρ).'],
   sol:`v_th = ${_f(v,0)} m/s. ṁ = 1000 × 0.70 × ${A.toExponential(3)} × ${_f(v,0)} = ${_f(1000*Q,4)} kg/s. F = ṁ × 0.95 × v_th = ${_f(ans,1)} N.`};}],
 awjm:[
  ()=>{const ma=rr(0.2,0.8,0.05),va=rr(250,500,10);const ans=0.5*ma/60*va*va/1000;
   return {q:`Garnet flows at ${_f(ma,2)} kg/min and leaves the focusing tube at ${va} m/s. What kinetic power does the abrasive stream carry?`,unit:'kW',ans,
   hints:['Kinetic power = ½·ṁ·v².','Convert kg/min to kg/s first; the result is in W.'],
   sol:`ṁ = ${_f(ma,2)}/60 = ${_f(ma/60,5)} kg/s. P = ½ × ${_f(ma/60,5)} × ${va}² = ${_f(ans*1000,0)} W = ${_f(ans,3)} kW.`};},
  ()=>{const p=rr(250,400,10),d=pick([0.25,0.3,0.33,0.36]),R=pick([0.15,0.2,0.25]);const v=Math.sqrt(2*p*1e6/1000),mw=1000*0.7*Math.PI/4*Math.pow(d*1e-3,2)*v*60;const ans=R*mw;
   return {q:`An AWJ head has a ${d} mm orifice at ${p} MPa (C_d = 0.70). What garnet flow (kg/min) gives an abrasive loading ratio R = ṁₐ/ṁ_w of ${R}?`,unit:'kg/min',ans,
   hints:['Find the water mass flow first: ṁ_w = ρ·C_d·A·√(2p/ρ).','Then ṁₐ = R·ṁ_w. Convert kg/s to kg/min.'],
   sol:`v = ${_f(v,0)} m/s. ṁ_w = 1000 × 0.7 × π/4 × (${d}×10⁻³)² × ${_f(v,0)} × 60 = ${_f(mw,3)} kg/min. ṁₐ = ${R} × ${_f(mw,3)} = ${_f(ans,3)} kg/min.`};}],
 chm:[
  ()=>{const w0=rr(0.5,3,0.1),d=rr(0.1,0.8,0.05),EF=pick([1.5,2,2.5,3]);const ans=w0+2*d/EF;
   return {q:`A chemical-milling mask has a ${_f(w0,1)} mm wide opening. A groove is etched ${_f(d,2)} mm deep with an etch factor of ${EF}. Find the groove width at the surface.`,unit:'mm',ans,
   hints:['Etch factor = depth ÷ undercut, so undercut = depth ÷ EF on each side.','Width = mask opening + 2 × undercut.'],
   sol:`u = ${_f(d,2)}/${EF} = ${_f(d/EF,3)} mm. w = ${_f(w0,1)} + 2 × ${_f(d/EF,3)} = ${_f(ans,3)} mm.`};},
  ()=>{const t=rr(0.2,1.5,0.05),r=rr(0.015,0.05,0.001);const ans=t/(2*r);
   return {q:`A ${_f(t,2)} mm thick sheet is chemically blanked by etching from both sides at ${_f(r,3)} mm/min per side. How long until the part separates?`,unit:'min',ans,
   hints:['Both faces are etched at the same time, so each side only needs to go half-way.','t = (thickness/2) ÷ rate.'],
   sol:`t = (${_f(t,2)}/2)/${_f(r,3)} = ${_f(ans,1)} min.`};}],
 ecm:[
  ()=>{const k=rr(10,20,1),dV=rr(6,14,1),f=rr(0.5,3,0.1);const E=55.85e-3/2,fs=f/1000/60;const ans=k*dV*E/(7860*96485*fs)*1000;
   return {q:`Iron (M = 55.85 g/mol, z = 2, ρ = 7860 kg/m³) is machined by ECM with electrolyte conductivity κ = ${k} S/m, effective gap voltage ${dV} V and tool feed ${_f(f,1)} mm/min. Assume 100 % efficiency. Find the equilibrium gap.`,unit:'mm',ans,
   hints:['At equilibrium the dissolution rate equals the feed rate, so the gap stops changing.','y_e = κ·(V − ΔV)·(M/z) / (ρ·F·f), all in SI units (f in m/s).'],
   sol:`M/z = ${E.toExponential(4)} kg/mol. f = ${fs.toExponential(3)} m/s. y_e = ${k} × ${dV} × ${E.toExponential(4)} /(7860 × 96485 × ${fs.toExponential(3)}) = ${_f(ans,3)} mm.`};},
  ()=>{const A=rr(2,15,0.5),f=rr(0.5,3,0.1),eta=pick([0.85,0.9,1]);const vr=A*1e-4*f/1000/60;const ans=vr*7860*2*96485/(55.85e-3*eta);
   return {q:`An ECM tool with a frontal area of ${_f(A,1)} cm² feeds into iron at ${_f(f,1)} mm/min (M = 55.85 g/mol, z = 2, ρ = 7860 kg/m³, current efficiency ${eta*100} %). What current is needed?`,unit:'A',ans,
   hints:['Volume removed per second = frontal area × feed rate.','Invert Faraday\'s law: I = (volume rate × ρ × z × F)/(M × η).'],
   sol:`V̇ = ${_f(A,1)}×10⁻⁴ × ${_f(f,1)}×10⁻³/60 = ${vr.toExponential(3)} m³/s. I = ${vr.toExponential(3)} × 7860 × 2 × 96485/(0.05585 × ${eta}) = ${_f(ans,0)} A.`};}],
 edm:[
  ()=>{const C=pick([0.1,0.22,0.47,1,2.2]),V=rr(60,200,10);const ans=0.5*C*1e-6*V*V*1000;
   return {q:`An RC relaxation generator has a ${C} µF capacitor that breaks down the gap at ${V} V. Find the energy of each spark.`,unit:'mJ',ans,
   hints:['The spark releases the energy stored in the capacitor.','E = ½CV², with C in farads. 1 J = 1000 mJ.'],
   sol:`E = ½ × ${C}×10⁻⁶ × ${V}² = ${_f(ans,3)} mJ.`};},
  ()=>{const ton=rr(20,200,10),toff=rr(10,100,10),vc=rr(1,8,0.5);const fr=1e6/(ton+toff);const ans=vc*1e-4*fr*60;
   return {q:`In EDM each spark leaves a crater of ${_f(vc,1)}×10⁻⁴ mm³ on the work. With tₒₙ = ${ton} µs and tₒff = ${toff} µs, and every pulse producing a spark, find the MRR.`,unit:'mm³/min',ans,
   hints:['Spark frequency f = 1/(tₒₙ + tₒff). Convert µs to s.','MRR = crater volume × sparks per second × 60.'],
   sol:`f = 1/(${ton+toff}×10⁻⁶) = ${_f(fr,0)} sparks/s. MRR = ${_f(vc,1)}×10⁻⁴ × ${_f(fr,0)} × 60 = ${_f(ans,1)} mm³/min.`};}],
 wedm:[
  ()=>{const d=pick([0.1,0.15,0.2,0.25,0.3]),g=rr(0.015,0.05,0.005);const ans=d+2*g;
   return {q:`A ${d} mm brass wire cuts with a side spark gap of ${_f(g,3)} mm. What kerf width will the cut have?`,unit:'mm',ans,
   hints:['The spark gap appears on both sides of the wire.','Kerf = wire diameter + 2 × spark gap.'],
   sol:`Kerf = ${d} + 2 × ${_f(g,3)} = ${_f(ans,3)} mm.`};},
  ()=>{const L=rr(100,600,10),u=rr(1,6,0.5),w=rr(4,12,1);const ans=w*L/u;
   return {q:`A wire EDM job has a ${L} mm profile cut at ${_f(u,1)} mm/min. Fresh wire runs at ${w} m/min. How many metres of wire are used?`,unit:'m',ans,
   hints:['Find the cutting time first: profile length ÷ cutting speed.','Wire used = wire speed × cutting time.'],
   sol:`t = ${L}/${_f(u,1)} = ${_f(L/u,1)} min. Wire = ${w} × ${_f(L/u,1)} = ${_f(ans,0)} m.`};}],
 lbm:[
  ()=>{const P=rr(200,4000,100),d=rr(50,300,10);const ans=P/(Math.PI/4*Math.pow(d*1e-4,2))/1e6;
   return {q:`A ${P} W laser is focused to a ${d} µm spot. Find the average power density in MW/cm².`,unit:'MW/cm²',ans,
   hints:['Power density = power ÷ spot area, with area = πd²/4.','Convert the diameter to cm (1 µm = 10⁻⁴ cm). 1 MW = 10⁶ W.'],
   sol:`A = π/4 × (${d}×10⁻⁴)² = ${(Math.PI/4*Math.pow(d*1e-4,2)).toExponential(3)} cm². I = ${P}/A = ${_f(ans,2)} MW/cm².`};},
  ()=>{const P=rr(1000,4000,100),eta=pick([0.4,0.5,0.6]),t=rr(1,6,0.5),w=pick([0.15,0.2,0.25,0.3]);const e=7870*(500*1500+2.7e5);const ans=eta*P/(t*1e-3*w*1e-3*e)*60;
   return {q:`Ideal melt-and-blow cutting of steel: ${P} W laser, ${eta*100} % absorbed into the kerf, sheet ${_f(t,1)} mm thick, kerf ${w} mm. Steel: ρ = 7870 kg/m³, c = 500 J/kg·K, ΔT = 1500 K, L = 270 kJ/kg. Find the cutting speed.`,unit:'m/min',ans,
   hints:['Energy to melt one cubic metre: ρ(cΔT + L).','Absorbed power = (speed × thickness × kerf) × melt energy per m³; solve for speed and convert m/s to m/min.'],
   sol:`e = 7870 × (500 × 1500 + 270000) = ${e.toExponential(3)} J/m³. u = ${eta} × ${P}/(${_f(t,1)}×10⁻³ × ${w}×10⁻³ × ${e.toExponential(3)}) × 60 = ${_f(ans,2)} m/min.`};}],
 ebm:[
  ()=>{const V=rr(60,150,5),I=rr(1,30,1),d=rr(20,200,10);const P=V*1000*I/1000;const ans=P/(Math.PI/4*Math.pow(d*1e-4,2))/1e6;
   return {q:`An electron beam at ${V} kV and ${I} mA is focused to a ${d} µm spot. Find the power density in MW/cm².`,unit:'MW/cm²',ans,
   hints:['Beam power P = V × I (convert kV and mA).','Divide by the spot area π d²/4 in cm².'],
   sol:`P = ${V*1000} × ${I}×10⁻³ = ${_f(P,0)} W. A = ${(Math.PI/4*Math.pow(d*1e-4,2)).toExponential(3)} cm². Power density = ${_f(ans,2)} MW/cm².`};},
  ()=>{const h=rr(0.5,5,0.1),dp=rr(10,60,5),f=pick([10,25,50,100]);const n=Math.ceil(h*1000/dp);const ans=n/f;
   return {q:`EBM drills a ${_f(h,1)} mm deep hole, removing ${dp} µm per pulse at ${f} pulses per second. How long does the hole take?`,unit:'s',ans,
   hints:['Number of pulses = depth ÷ depth per pulse. Round up to a whole pulse.','Time = pulses ÷ pulse frequency.'],
   sol:`n = ⌈${_f(h*1000,0)}/${dp}⌉ = ${n} pulses. t = ${n}/${f} = ${_f(ans,2)} s.`};}],
 pam:[
  ()=>{const u=rr(500,4000,50),t=rr(3,25,1),w=rr(1.5,4,0.1);const ans=u*t*w/1000;
   return {q:`Plasma cuts ${t} mm plate at ${u} mm/min with a kerf of ${_f(w,1)} mm. Find the volumetric removal rate in cm³/min.`,unit:'cm³/min',ans,
   hints:['The removed metal is a slot: length per minute × thickness × kerf width.','MRR = u·t·w in mm³/min; 1 cm³ = 1000 mm³.'],
   sol:`MRR = ${u} × ${t} × ${_f(w,1)} = ${_f(u*t*w,0)} mm³/min = ${_f(ans,1)} cm³/min.`};},
  ()=>{const V=rr(120,160,5),I=rr(60,200,10),u=rr(800,3000,50),t=rr(6,20,1),w=rr(2,3.5,0.1);const e=7870*(500*1500+2.7e5);const Pk=u/60/1000*t*1e-3*w*1e-3*e;const ans=Pk/(V*I)*100;
   return {q:`A plasma torch at ${V} V and ${I} A cuts ${t} mm steel at ${u} mm/min with a ${_f(w,1)} mm kerf. Melting steel needs ρ(cΔT + L) = 8.03×10⁹ J/m³. What percentage of the arc power goes into melting the kerf?`,unit:'%',ans,
   hints:['Power used for melting = volume melted per second × 8.03×10⁹ J/m³.','Efficiency = melting power ÷ (V × I) × 100.'],
   sol:`V̇ = ${_f(u/60,2)}×10⁻³ × ${t}×10⁻³ × ${_f(w,1)}×10⁻³ m³/s; melting power = ${_f(Pk,0)} W. η = ${_f(Pk,0)}/${V*I} × 100 = ${_f(ans,1)} %.`};}],
 ecg:[
  ()=>{const D=pick([150,175,200,250]),N=rr(1500,3500,100);const ans=Math.PI*D*N/60000;
   return {q:`An ECG wheel of ${D} mm diameter runs at ${N} rpm. Find its peripheral speed.`,unit:'m/s',ans,
   hints:['Peripheral speed = circumference × revolutions per second.','v = πDN/60 with D in m.'],
   sol:`v = π × ${D/1000} × ${N}/60 = ${_f(ans,1)} m/s.`};},
  ()=>{const I=rr(200,1200,50),sh=rr(5,20,1);const e=0.9*I*55.85/(2*96485*7.86)*60000;const T=Math.round(e/(1-sh/100));const ans=(T-e)/T*100;
   return {q:`ECG of tool steel (Fe, M = 55.85, z = 2, ρ = 7.86 g/cm³) at ${I} A and 90 % current efficiency removes ${_f(T,0)} mm³/min in total. What percentage is removed mechanically by the wheel?`,unit:'%',ans,
   hints:['Electrolytic MRR from Faraday\'s law: η·I·M/(zFρ), converted to mm³/min.','Mechanical share = (total − electrolytic) ÷ total × 100.'],
   sol:`MRR_e = 0.9 × ${I} × 55.85/(2 × 96485 × 7.86) × 60000 = ${_f(e,1)} mm³/min. Mechanical = ${_f(T,0)} − ${_f(e,1)} = ${_f(T-e,1)} mm³/min, i.e. ${_f(ans,2)} %.`};}],
 ecdm:[
  ()=>{const r0=rr(4,12,0.5),h0=rr(150,350,10),h=rr(200,700,10);const ans=h0/r0*(Math.exp(h/h0)-1);
   return {q:`In ECDM drilling of glass, depth follows h = h₀·ln(1 + r₀t/h₀) with r₀ = ${_f(r0,1)} µm/s and h₀ = ${h0} µm. How long does it take to reach ${h} µm?`,unit:'s',ans,
   hints:['Rearrange the depth law for t: divide by h₀ and take the exponential of both sides.','t = (h₀/r₀)·(e^(h/h₀) − 1).'],
   sol:`t = (${h0}/${_f(r0,1)}) × (e^(${h}/${h0}) − 1) = ${_f(h0/r0,2)} × ${_f(Math.exp(h/h0)-1,3)} = ${_f(ans,1)} s.`};},
  ()=>{const V=rr(30,50,1),I=rr(0.2,1.2,0.05),t=rr(10,120,5);const ans=V*I*t;
   return {q:`An ECDM hole is drilled in ${t} s at ${V} V with a mean current of ${_f(I,2)} A. What electrical energy does one hole take?`,unit:'J',ans,
   hints:['Energy = power × time.','P = V × I.'],
   sol:`E = ${V} × ${_f(I,2)} × ${t} = ${_f(ans,0)} J.`};}],
 rum:[
  ()=>{const D=rr(6,20,1),N=rr(1000,5000,100);const ans=Math.PI*D*N/60000;
   return {q:`A ${D} mm RUM core drill rotates at ${N} rpm. Find the cutting speed at its outer edge.`,unit:'m/s',ans,
   hints:['Cutting speed = π × diameter × revolutions per second.','v = πDN/60 with D in m.'],
   sol:`v = π × ${D/1000} × ${N}/60 = ${_f(ans,2)} m/s.`};},
  ()=>{const T=rr(5,25,1),f=rr(0.5,4,0.1);const ans=T/f;
   return {q:`A RUM core drill feeds at ${_f(f,1)} mm/min through a ${T} mm thick ceramic plate. How long does one hole take?`,unit:'min',ans,
   hints:['The drill must travel the full plate thickness.','Time = thickness ÷ feed rate.'],
   sol:`t = ${T}/${_f(f,1)} = ${_f(ans,2)} min.`};}],
 lam:[
  ()=>{const F=rr(200,1500,50),v=rr(30,150,5);const ans=F*v/60;
   return {q:`In laser-assisted turning the cutting force is ${F} N at a cutting speed of ${v} m/min. Find the cutting power.`,unit:'W',ans,
   hints:['Power = force × velocity.','Convert m/min to m/s first.'],
   sol:`P = ${F} × ${v}/60 = ${_f(ans,0)} W.`};},
  ()=>{const u0=pick([4,4.5,5]),Ts=rr(0.2,0.5,0.05),m=pick([0.8,1,1.3]);const ans=Math.pow(Ts,m)*100;
   return {q:`Specific cutting energy softens as u = u₀(1 − T*^m) with u₀ = ${u0} J/mm³ and m = ${m}. By what percentage does laser heating to T* = ${_f(Ts,2)} reduce the cutting energy?`,unit:'%',ans,
   hints:['Reduction = (u₀ − u)/u₀.','This simplifies to T*^m, independent of u₀.'],
   sol:`Reduction = T*^m = ${_f(Ts,2)}^${m} = ${_f(ans/100,4)}, i.e. ${_f(ans,1)} %.`};}],
 afm:[
  ()=>{const Dp=rr(30,80,5),s=rr(20,80,5);const ans=Math.PI/4*Dp*Dp*s/1000;
   return {q:`An AFM machine has media cylinders of ${Dp} mm bore and a ${s} mm piston stroke. What volume of media passes through the part in one stroke?`,unit:'cm³',ans,
   hints:['Volume displaced = piston area × stroke.','Area = πD²/4. 1 cm³ = 1000 mm³.'],
   sol:`V = π/4 × ${Dp}² × ${s} = ${_f(ans*1000,0)} mm³ = ${_f(ans,1)} cm³.`};},
  ()=>{const R0=rr(1,4,0.1),Rm=rr(0.1,0.3,0.05),n0=rr(10,40,1);const Rt=+(Rm+(R0-Rm)*rr(0.15,0.5,0.05)).toFixed(3);const ans=n0*Math.log((R0-Rm)/(Rt-Rm));
   return {q:`AFM finishing follows Ra = Ra_min + (Ra₀ − Ra_min)·e^(−n/n₀) with Ra₀ = ${_f(R0,1)} µm, Ra_min = ${_f(Rm,2)} µm and n₀ = ${n0}. How many cycles are needed to reach Ra = ${_f(Rt,3)} µm?`,unit:'cycles',ans,
   hints:['Rearrange for e^(−n/n₀), then take the natural log.','n = n₀·ln[(Ra₀ − Ra_min)/(Ra − Ra_min)].'],
   sol:`n = ${n0} × ln[(${_f(R0,1)} − ${_f(Rm,2)})/(${_f(Rt,3)} − ${_f(Rm,2)})] = ${n0} × ${_f(Math.log((R0-Rm)/(Rt-Rm)),4)} = ${_f(ans,1)} cycles.`};}],
 maf:[
  ()=>{const P=rr(20,200,5),mu=rr(2,5,0.5);const ans=Math.sqrt(2*MU0*P*1000/(1-1/mu));
   return {q:`MAF needs a finishing pressure of ${P} kPa with a brush of relative permeability ${_f(mu,1)}. What flux density is required in the gap?`,unit:'T',ans,
   hints:['Start from P = B²/(2μ₀)·(1 − 1/μ_r) and solve for B.','B = √[2μ₀P/(1 − 1/μ_r)], with P in Pa and μ₀ = 4π×10⁻⁷.'],
   sol:`B = √[2 × 4π×10⁻⁷ × ${P*1000}/${_f(1-1/mu,3)}] = ${_f(ans,3)} T.`};},
  ()=>{const D=rr(20,60,5),N=rr(200,1200,50);const ans=Math.PI*D*N/60000;
   return {q:`A ${D} mm cylindrical workpiece rotates at ${N} rpm inside a MAF brush. Find the surface speed of the workpiece.`,unit:'m/s',ans,
   hints:['Surface speed = circumference × revolutions per second.','v = πDN/60 with D in m.'],
   sol:`v = π × ${D/1000} × ${N}/60 = ${_f(ans,3)} m/s.`};}],
 mrf:[
  ()=>{const Cp=pick([2,2.5,5]),P=rr(10,40,1),v=rr(0.5,3,0.1),h=rr(0.1,2,0.1);const rate=Cp*1e-13*P*1000*v*60*1e6;const ans=h/rate*60;
   return {q:`MRF must remove ${_f(h,1)} µm from a spot. Preston coefficient ${Cp}×10⁻¹³ m²/N, pressure ${P} kPa, velocity ${_f(v,1)} m/s. Find the dwell time.`,unit:'s',ans,
   hints:['Find the removal rate from Preston\'s law first.','Dwell time = depth ÷ rate. Convert minutes to seconds.'],
   sol:`Rate = ${Cp}×10⁻¹³ × ${P*1000} × ${_f(v,1)} m/s = ${_f(rate,3)} µm/min. t = ${_f(h,1)}/${_f(rate,3)} min = ${_f(ans,1)} s.`};},
  ()=>{const rate=rr(1,6,0.5),a=rr(3,12,1),b=rr(2,6,1);const ans=rate*1e-3*a*b;
   return {q:`An MRF polishing spot is ${a} mm × ${b} mm and removes ${_f(rate,1)} µm/min at its average depth. Find the volumetric removal rate.`,unit:'mm³/min',ans,
   hints:['Volume rate = removal depth rate × spot area.','Convert µm to mm (÷ 1000).'],
   sol:`V̇ = ${_f(rate,1)}×10⁻³ × ${a} × ${b} = ${_f(ans,4)} mm³/min.`};}],
 cmp:[
  ()=>{const r=rr(50,200,10),N=rr(30,120,5);const ans=2*Math.PI*r/1000*N/60;
   return {q:`In CMP the wafer centre sits ${r} mm from the platen centre and the platen turns at ${N} rpm. With head and platen at the same speed, every point sees the same relative velocity. Find it.`,unit:'m/s',ans,
   hints:['With equal rotation speeds, the relative velocity equals ω × (distance between the two centres).','ω = 2πN/60 rad/s; distance in m.'],
   sol:`v = 2π × ${N}/60 × ${r/1000} = ${_f(ans,3)} m/s.`};},
  ()=>{const m0=rr(400,900,10);const xs=[0,1,2,3,4].map(()=>m0+rr(-40,40,1));const mean=xs.reduce((a,b)=>a+b,0)/5;const sd=Math.sqrt(xs.reduce((a,b)=>a+(b-mean)**2,0)/4);const ans=sd/mean*100;
   return {q:`After CMP, film thickness at five points on a wafer is ${xs.join(', ')} nm. Find the within-wafer non-uniformity (1σ, %).`,unit:'%',ans,
   hints:['Non-uniformity = standard deviation ÷ mean × 100.','Use the sample standard deviation (divide by n − 1 = 4).'],
   sol:`Mean = ${_f(mean,1)} nm; σ = ${_f(sd,2)} nm. NU = ${_f(sd,2)}/${_f(mean,1)} × 100 = ${_f(ans,2)} %.`};}],
 ibm:[
  ()=>{const m=pick([['copper',63.55,8.96],['silicon',28.09,2.33],['gold',196.97,19.3]]),J=rr(0.2,2,0.1),Y0=rr(0.5,3,0.1);const v=Math.max(1,Math.round(J*10*Y0*(m[1]/1000)/(1.602e-19*6.022e23*m[2]*1000)*60e9));const ans=v/60/1e9*1.602e-19*6.022e23*m[2]*1000/(J*10*m[1]/1000);
   return {q:`Ion milling of ${m[0]} (M = ${m[1]} g/mol, ρ = ${m[2]} g/cm³) at ${_f(J,1)} mA/cm² removes ${v} nm/min. Find the sputter yield.`,unit:'atoms/ion',ans,
   hints:['Start from v = J·Y·M/(e·N_A·ρ) and solve for Y.','Use SI units: J in A/m² (1 mA/cm² = 10 A/m²), v in m/s, M in kg/mol, ρ in kg/m³.'],
   sol:`Y = v·e·N_A·ρ/(J·M) = ${(v/6e10).toExponential(3)} × 1.602×10⁻¹⁹ × 6.022×10²³ × ${m[2]*1000}/(${_f(J*10,0)} × ${m[1]/1000}) = ${_f(ans,3)} atoms/ion.`};},
  ()=>{const d=rr(100,2000,50),v=rr(5,60,1);const ans=d/v;
   return {q:`An ion-beam mill removes ${v} nm/min. How long does it take to mill a ${d} nm deep feature?`,unit:'min',ans,
   hints:['Ion milling removes material layer by layer at a constant rate.','Time = depth ÷ rate.'],
   sol:`t = ${d}/${v} = ${_f(ans,1)} min.`};}],
};
// Combine: original generator (with its hints) + extra ones; never serve the same type twice in a row.
const NUM_TYPES={},_numLast={};
for(const id in NUM){const base=NUM[id];NUM_TYPES[id]=[()=>({...base(),hints:HINT0[id]||[]}),...(NUMX[id]||[])];
  NUM[id]=()=>{const T=NUM_TYPES[id];let k=Math.floor(Math.random()*T.length);if(T.length>1&&k===_numLast[id])k=(k+1)%T.length;_numLast[id]=k;const p=T[k]();p.type=k;return p;};}
