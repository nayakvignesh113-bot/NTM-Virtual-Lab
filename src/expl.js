// ================= v4.3: narrated explainers with concept checks =================
// EXPL[id].scenes = [{title, lines:[[narration, cue]], q:{q,o,a,why}}]
// Cues act on the process schematic (640×400 coordinates): box:[x,y,w,h] or ring:[x,y,r] spotlight,
// set:{param:value} animates the simulator, show:[output keys] puts live readouts on screen.
// EDM uses its own close-up animation (custom:true). Checks were written to differ from every pre-test and post-test question.
const EXPL={
 edm:{custom:true,scenes:[
  {title:'The set-up',lines:[
   ['EDM removes metal with electric sparks, not with cutting force. The tool never touches the workpiece.','intro'],
   ['The tool electrode, usually copper or graphite, and the workpiece sit in a bath of dielectric fluid, an oil that does not normally conduct electricity.','parts'],
   ['A servo motor holds a tiny gap between them, typically ten to fifty micrometres, much thinner than a human hair.','gap'],
   ['A spark needs current to flow through both the tool and the work. So the workpiece must conduct electricity. Glass or ordinary ceramic simply cannot be machined this way.','glass']],
   q:{q:'Why does EDM need a servo to control the tool position?',o:['To press the tool firmly against the workpiece','To keep the spark gap constant as metal is removed','To vibrate the tool at ultrasonic frequency','To rotate the tool and spread the wear'],a:1,
    why:'As sparks erode the work, the gap would grow and sparking would stop. The servo advances the tool to hold the gap at a few tens of micrometres. If the gap closed completely the tool would short-circuit against the work.'}},
  {title:'A spark forms',lines:[
   ['Let us zoom in to the gap, about a thousand times. Both surfaces are rough at this scale. The generator now applies a voltage, typically eighty to three hundred volts.','volt'],
   ['The dielectric resists at first. The electric field is strongest where the two surfaces come closest, here.','closest'],
   ['When the field is strong enough, the fluid breaks down at that point. A spark jumps across, the voltage drops and current starts to flow.','break'],
   ['The spark becomes a thin channel of plasma, hotter than eight thousand degrees Celsius.','plasma']],
   q:{q:'Where in the gap does the spark strike?',o:['Always at the centre of the tool','At the point where the gap is smallest','At a random point far from the tool','Only at the edge of the workpiece'],a:1,
    why:'The electric field is strongest where the gap is smallest, so the dielectric breaks down there first. That is why EDM removes the high spots first and spreads sparks evenly over the surface.'}},
  {title:'Melting and flushing',lines:[
   ['The plasma melts and vaporises a tiny pool of metal on the workpiece, and a smaller one on the tool.','melt'],
   ['Vaporised fluid forms a bubble around the channel.','bubble'],
   ['Then the pulse switches off. The plasma collapses, the bubble implodes and the molten metal is blown out, leaving a small crater.','off'],
   ['During the off time the fluid flushes the debris away and becomes insulating again. The next spark then finds the new closest point, and the cycle repeats thousands of times a second.','repeat']],
   q:{q:'At what moment is most of the molten metal thrown out of the crater?',o:['As soon as the voltage is applied','While the plasma channel is at its hottest','When the pulse ends and the plasma and bubble collapse','Only when the servo retracts the tool'],a:2,
    why:'During the pulse the metal melts but is held in place by the pressure of the plasma. When the current stops, the pressure drops suddenly, the bubble implodes and the molten pool is blown out as debris.'}},
  {title:'Current and finish',lines:[
   ['Each spark is one pulse. You set its peak current, I p, its on-time, t on, and its off-time, t off.','wave'],
   ['The energy of one spark is roughly voltage times current times on-time. More energy melts a bigger crater.','energy'],
   ['Low current gives many small, shallow craters: slow removal but a fine finish. High current gives large, deep craters: fast removal but a rough surface.','compare'],
   ['So moulds are made in two stages: high current for roughing, then low current for finishing.','stages']],
   q:{q:'A mould cavity must be made quickly and end with a very fine finish. What is the best plan?',o:['Use low current throughout','Use high current throughout and polish by hand','Rough at high current, then finish at low current','Use high current with a very long off-time'],a:2,
    why:'High current removes the bulk quickly but leaves deep craters. A final pass at low current removes that rough layer with small craters, giving the fine finish without spending hours at low current.'}},
  {title:'Copying the shape',lines:[
   ['The tool also erodes, a little. Electrode material and polarity are chosen so that the workpiece erodes much faster than the tool.','wear'],
   ['As sparks remove metal, the servo feeds the tool down to keep the gap constant.','feed'],
   ['The result is a cavity that is a mirror image of the tool, slightly larger than the tool by the spark gap. This is called the overcut.','cavity'],
   ['Spark, melt, flush, repeat. That is how EDM shapes hardened steel and carbide that no cutting tool could touch.','end']],q:null}]},

 usm:{scenes:[
  {title:'The vibrating tool',lines:[
   ['Ultrasonic machining makes a tool vibrate up and down about twenty thousand times a second.',{box:[245,20,150,80]}],
   ['A piezoelectric stack turns the electrical signal into vibration. The tapered horn then magnifies it, so the tool tip moves through twenty to fifty micrometres.',{box:[255,92,132,170]}],
   ['The tool is a tough, soft metal such as mild steel. It never cuts by itself; it only hammers.',{ring:[320,276,38]}]],
   q:{q:'What does the tapered horn between the transducer and the tool do?',o:['Converts electrical energy into vibration','Magnifies the vibration amplitude and carries it to the tool','Supplies the abrasive slurry to the tool','Cools the transducer'],a:1,
    why:'The transducer makes the vibration; the horn narrows towards the tool so that the amplitude at the tip is several times larger. The tool is brazed or screwed to the end of the horn.'}},
  {title:'Hammering the grains',lines:[
   ['A slurry of hard abrasive grains, such as boron carbide in water, flows into the gap under the tool.',{box:[110,185,180,90]}],
   ['Each down-stroke hammers grains into the brittle work. A tiny chip breaks off at every impact, millions of times a minute.',{ring:[320,290,40]}],
   ['Fresh slurry must keep flowing, to carry the chips away and bring sharp grains in.',{box:[150,258,340,16]}]],
   q:{q:'What would happen if the slurry supply stopped in the middle of a cut?',o:['The tool would start cutting the work directly, faster','Removal would almost stop, because the grains do the cutting and must be renewed','The work would begin to melt','The vibration amplitude would increase'],a:1,
    why:'The tool only delivers the blows; the abrasive grains chip the work. Without fresh slurry the grains in the gap crush and blunt, the chips are not carried away, and removal practically stops.'}},
  {title:'Changing the settings',lines:[
   ['Watch the removal rate as the amplitude rises from twenty-five to fifty micrometres.',{set:{A0:50},show:['mrr','Ra']}],
   ['Coarser grit also cuts faster, but notice the surface roughness more than doubles.',{set:{d:120},show:['mrr','Ra']}],
   ['Too much static force crushes the grains under the tool, so for each job there is a best force.',{box:[400,20,140,70],show:['mrr']}]],
   q:{q:'Why does coarser grit give a rougher surface in USM?',o:['The tool vibrates harder with coarse grit','Each impact breaks off a larger chip, leaving deeper pits','Coarse grit makes the slurry hotter','There are more grains under the tool'],a:1,
    why:'A larger grain is driven deeper into the work at each blow, so the fracture crater it leaves is larger. Fine grit is used for finishing passes for the same reason.'}}]},

 ecm:{scenes:[
  {title:'The electrochemical cell',lines:[
   ['In electrochemical machining, the workpiece is the anode and the shaped tool is the cathode of a low-voltage, high-current DC supply.',{box:[25,38,95,50]}],
   ['A salt solution, the electrolyte, is pumped through the gap between them at high speed.',{box:[75,175,500,35]}],
   ['The gap is only a few tenths of a millimetre, and the tool never touches the work.',{ring:[320,185,42],show:['ge']}]],
   q:{q:'Why must the electrolyte flow through the gap at high speed?',o:['To keep the DC supply cool','To push the tool away from the work','To carry away heat, hydrogen gas and sludge so the gap stays uniform','To bring metal ions to the tool surface'],a:2,
    why:'The current heats the electrolyte, hydrogen bubbles form at the tool and dissolved metal forms sludge. All three change the conductivity in the gap. A fast flow sweeps them out so machining stays even.'}},
  {title:'Metal dissolves',lines:[
   ['Current flows through the electrolyte. Metal atoms on the work surface give up electrons and dissolve as ions.',{ring:[270,198,48]}],
   ['The dissolved metal leaves the gap as a hydroxide sludge, carried away by the flow.',{box:[440,175,150,25]}],
   ['Where the gap is narrowest, the current density is highest, so those high spots dissolve fastest. The work slowly takes the shape of the tool.',{ring:[330,182,40]}]],
   q:{q:'Why does the workpiece end up as a copy of the tool shape?',o:['The tool presses its shape into the softened work','Narrow parts of the gap carry more current and dissolve faster until the gap evens out','The electrolyte deposits metal where the gap is wide','The tool wears until it matches the work'],a:1,
    why:'Current density is inversely related to gap size. High spots on the work see a smaller gap, carry more current and dissolve faster, so every point settles at the same equilibrium gap and the work mirrors the tool.'}},
  {title:'Feed and current',lines:[
   ['Now triple the feed rate, from one to three millimetres per minute. Watch the gap close and the current rise to keep up.',{set:{f:3},show:['ge','I']}],
   ['The removal rate depends only on the current, not on how hard the metal is. That is why ECM shapes superalloys as easily as mild steel.',{show:['mrr','I']}]],
   q:{q:'The tool feed rate is tripled at the same voltage. What happens to the equilibrium gap?',o:['It triples','It stays the same','It shrinks to about one third','The tool touches the work at once'],a:2,
    why:'At equilibrium the dissolution rate must equal the feed rate. A faster feed is matched only by a higher current density, which needs a smaller gap: the equilibrium gap is inversely proportional to feed rate.'}}]},

 lbm:{scenes:[
  {title:'Making a hot spot',lines:[
   ['A laser produces a beam of light of a single wavelength. A fiber laser emits at about one micrometre.',{box:[28,36,226,54]}],
   ['A mirror turns the beam down, and a lens focuses it to a spot about a tenth of a millimetre across.',{ring:[422,132,34]}],
   ['Focusing concentrates the power to millions of watts per square centimetre, enough to melt steel in milliseconds.',{ring:[422,236,26],show:['I']}]],
   q:{q:'Why is the beam focused to a small spot instead of being used as a wide beam?',o:['So that the beam travels further','To change the wavelength of the light','To concentrate the power so the intensity is high enough to melt metal','To keep the lens cool'],a:2,
    why:'The total power stays the same, but squeezing it into a tiny area raises the intensity by thousands of times. Only then does the surface heat faster than conduction can carry the heat away.'}},
  {title:'Cutting the sheet',lines:[
   ['The spot melts a narrow column right through the sheet.',{ring:[422,246,28]}],
   ['Gas from the nozzle blows the melt out of the bottom of the cut as a shower of molten droplets.',{box:[396,146,56,80]}],
   ['As the sheet moves, the cut becomes a narrow kerf, only a few tenths of a millimetre wide.',{box:[320,232,200,30],show:['kerf']}]],
   q:{q:'In melt-and-blow laser cutting, what is the main job of the gas jet?',o:['To cool the laser source','To focus the beam onto the sheet','To blow the molten metal out of the kerf','To clean the turning mirror'],a:2,
    why:'The laser only melts the metal. The gas jet carries the melt out through the bottom of the kerf; without it, the melt would refreeze in the cut.'}},
  {title:'Power and thickness',lines:[
   ['Watch the cutting speed as power doubles from two to four kilowatts.',{set:{P:4000},show:['u','haz']}],
   ['Now make the sheet three times thicker, from three to nine millimetres, at the same power.',{set:{t:9},show:['u','haz']}],
   ['The speed falls to about a third, and the slower cut lets more heat soak into the edges.',{show:['u','haz']}]],
   q:{q:'At the same power, a laser cuts 3 mm steel at about 3.8 m/min. Roughly how fast will it cut 9 mm steel?',o:['About 3.8 m/min','About 1.3 m/min','About 7.6 m/min','It cannot cut 9 mm at all'],a:1,
    why:'Three times the thickness means three times the metal to melt per millimetre of cut, so speed falls to about a third, and a little more because more heat is lost in a thicker sheet.'}}]},

 ebm:{scenes:[
  {title:'The electron gun',lines:[
   ['In electron beam machining, a hot tungsten filament releases a cloud of electrons.',{ring:[310,25,28]}],
   ['A voltage of up to a hundred and fifty kilovolts accelerates them to more than half the speed of light.',{box:[250,52,140,30]}],
   ['Magnetic lenses focus the beam to a fine spot, and deflection coils steer it, all inside a vacuum.',{box:[240,105,160,112]}]],
   q:{q:'How can EBM drill holes at different points on a part without moving the part?',o:['Mirrors tilt to aim the beam','Deflection coils bend the beam magnetically','The filament is rotated','The anode is moved sideways'],a:1,
    why:'Electrons are charged, so a magnetic field bends their path. Deflection coils steer the beam across the part in microseconds, which is how thousands of holes can be drilled quickly.'}},
  {title:'Drilling by pulses',lines:[
   ['When the electrons hit the work, their kinetic energy turns into heat within a few micrometres of the surface.',{ring:[320,292,30],show:['del']}],
   ['The metal vaporises in microseconds, so each pulse drills a little deeper.',{ring:[320,312,32],show:['n']}],
   ['Pulsing the beam keeps the heat local, so the zone affected by heat around each hole stays very small.',{ring:[320,310,48]}]],
   q:{q:'Why is the beam pulsed rather than left on continuously when drilling?',o:['To save the filament','So heat has no time to spread, keeping the hole clean and the heat-affected zone small','To stop X-rays completely','Because the vacuum pump needs breaks'],a:1,
    why:'Each short, intense pulse vaporises metal before the heat can conduct into the surrounding material. A continuous beam would melt a wide area and leave a poor, heat-damaged hole.'}},
  {title:'Current and thickness',lines:[
   ['Watch the drilling time as the beam current doubles.',{set:{I:20},show:['th','n']}],
   ['A plate three times thicker needs many more pulses.',{set:{t:3},show:['th','n']}],
   ['That is why EBM suits thousands of fine holes in thin parts, such as turbine cooling holes and filters.',{ring:[320,310,60]}]],
   q:{q:'Which job is EBM best suited to?',o:['A 50 mm deep blind cavity in a forging die','Thousands of 0.1 mm holes in a thin combustor liner','Cutting 20 mm steel plate','Polishing a glass lens'],a:1,
    why:'EBM drills small, high aspect-ratio holes in thin sections very fast with little heat damage. Large volumes or thick plate would take too many pulses, and it cannot polish.'}}]},

 chm:{scenes:[
  {title:'Mask and bath',lines:[
   ['Chemical machining dissolves metal in a tank of etchant. There is no tool and no cutting force.',{box:[44,42,180,28]}],
   ['First the part is coated with a maskant, and the coating is cut away wherever metal must be removed.',{box:[68,156,98,22]}],
   ['Then the whole part goes into the etchant, here hot sodium hydroxide for aluminium.',{box:[150,160,340,36],show:['r']}]],
   q:{q:'Why can chemical machining thin a large aircraft skin panel without distorting it?',o:['The etchant hardens the metal','No cutting force or heat is applied, so no stresses are put into the part','The maskant holds the panel flat','The panel is frozen during etching'],a:1,
    why:'Conventional milling clamps the part and pushes on it with a cutter, which distorts thin panels. Etching removes metal uniformly with no force, so even very thin, large parts stay flat.'}},
  {title:'Depth and undercut',lines:[
   ['The etchant attacks every exposed surface at the same rate, so the floor sinks evenly.',{ring:[320,182,40],show:['d']}],
   ['But it also eats sideways, under the edge of the mask. This is the undercut.',{ring:[160,180,22],show:['u']}],
   ['Leave the part in three times longer and both the depth and the undercut grow.',{set:{time:90},show:['d','u']}]],
   q:{q:'Why does the etched groove end up wider than the opening cut in the mask?',o:['The maskant shrinks in the hot bath','The etchant also attacks sideways, under the edge of the mask','The metal expands while it is hot','The bubbles push the mask aside'],a:1,
    why:'Etching proceeds in all directions from every exposed surface. As the groove deepens, its walls also move outwards beneath the mask, so the groove is wider than the mask opening by twice the undercut.'}},
  {title:'Temperature and agitation',lines:[
   ['Watch the etch rate as the bath is heated from fifty to seventy degrees.',{set:{T:70},show:['r']}],
   ['Spraying the etchant brings fresh chemical to the surface and speeds it up further.',{set:{ag:'spray'},show:['r']}],
   ['Because the rate is so sensitive, bath temperature must be held within a degree or two, or depths will vary from part to part.',{box:[44,42,180,28],show:['r']}]],
   q:{q:'A batch of parts came out with different etch depths. What is the most likely cause?',o:['The bath temperature drifted during etching','The maskant was the wrong colour','The parts were too hard','The etchant was agitated too evenly'],a:0,
    why:'Etch rate rises roughly exponentially with temperature, so a drift of a few degrees changes the depth noticeably. Hardness has almost no effect on chemical attack.'}}]},

 afm:{scenes:[
  {title:'The flowing tool',lines:[
   ['Abrasive flow machining polishes internal passages that no rigid tool can reach.',{box:[298,172,36,155]}],
   ['A putty-like media, loaded with abrasive grit, fills two cylinders on either side of the part.',{box:[240,20,160,142]}],
   ['Pistons push the media through the passage and back again. Each round trip is one cycle.',{box:[240,335,160,45],show:['Ra']}]],
   q:{q:'Why is AFM chosen for finishing internal passages instead of grinding?',o:['It is faster than grinding on flat surfaces','The flexible media takes the shape of the passage and reaches where a rigid tool cannot','It needs no abrasive','It works only on soft metals'],a:1,
    why:'The media behaves like a stiff putty: it flows into any passage shape, including bends and cross-holes, and abrades the walls as it is forced through.'}},
  {title:'Where it cuts',lines:[
   ['As the media squeezes into the narrow passage, it stiffens and presses the grit hard against the walls.',{box:[298,172,36,155]}],
   ['The grit scrapes off peaks and burrs, so roughness falls quickly at first.',{show:['Ra']}],
   ['Later cycles remove less and less, because the peaks are already gone.',{set:{n:80},show:['Ra']}]],
   q:{q:'Why does AFM remove the most material where the passage narrows?',o:['The media is hottest there','The media is squeezed hardest there, so the grit presses and scrapes harder','The grit only sticks to narrow walls','The pistons slow down there'],a:1,
    why:'Forcing the media through a restriction raises its pressure and shear. The grit is pressed harder against the walls there, so restrictions, sharp edges and burrs are finished first.'}},
  {title:'Pressure and grit',lines:[
   ['Watch the roughness after twenty cycles as the extrusion pressure rises from six to ten megapascals.',{set:{p:10},show:['Ra']}],
   ['Adding more abrasive to the media also cuts faster.',{set:{C:60},show:['Ra']}],
   ['Finer grit gives a smoother final surface, but it needs more cycles to get there.',{show:['Ra']}]],
   q:{q:'You need a smoother final finish and can accept a longer cycle time. What should you change?',o:['Use finer grit','Use fewer cycles','Raise the pressure only','Remove the abrasive from the media'],a:0,
    why:'Finer grit makes shallower scratches, so the lowest roughness it can reach is lower. It removes material more slowly, which is why more cycles are needed.'}}]},

 mrf:{scenes:[
  {title:'A fluid that stiffens',lines:[
   ['Magnetorheological finishing uses a fluid full of tiny iron particles mixed with fine polishing abrasive.',{ring:[137,178,26]}],
   ['The fluid is pumped onto a rotating wheel, forming a thin ribbon over its rim.',{box:[220,148,200,42]}],
   ['Under the top of the wheel sits an electromagnet.',{box:[278,346,84,52],show:['P']}]],
   q:{q:'Why is the MR fluid stiff at the polishing spot but runny everywhere else in its circuit?',o:['It cools down at the polishing spot','The magnetic field is applied only near the polishing zone','The abrasive settles at the top of the wheel','The optic presses it solid'],a:1,
    why:'The electromagnet sets up a strong field only at the top of the wheel. There the iron particles chain together and the ribbon stiffens; elsewhere the fluid flows freely, so it can be pumped and recirculated.'}},
  {title:'Polishing the optic',lines:[
   ['In the field, the iron particles line up in chains, and the ribbon becomes a firm but flexible tool.',{ring:[320,152,34]}],
   ['The lens is lowered into the ribbon. Abrasive grains are dragged across the glass and wear it away very gently.',{ring:[320,138,44],show:['rr']}],
   ['Leaving the field, the fluid turns runny again and is sucked off the wheel to be reused.',{ring:[502,178,26]}]],
   q:{q:'Why does MRF leave almost no scratches or subsurface damage, unlike polishing with a hard lap?',o:['The abrasive used is softer than glass','The stiffened fluid is compliant, so the force on each grain stays very low','The lens is rotated very slowly','The fluid dissolves the glass chemically'],a:1,
    why:'The ribbon is stiff but not rigid. It conforms to the surface and limits the load each abrasive grain can apply, so grains shear material away without cracking the glass beneath.'}},
  {title:'Field and dwell time',lines:[
   ['Watch the removal rate as the field strength rises.',{set:{B:0.7},show:['rr','P']}],
   ['Removal also rises with wheel speed.',{set:{v:3},show:['rr']}],
   ['A computer varies how long the spot dwells at each point, removing more where the surface is high. This corrects lens shapes to a few nanometres.',{ring:[320,140,60]}]],
   q:{q:'How does MRF correct a shape error of a few tenths of a micrometre across a lens?',o:['By changing the lens material','By varying how long the polishing spot dwells at each point','By switching the magnet on and off rapidly','By using a larger wheel'],a:1,
    why:'The polishing spot removes a known depth per second. Measuring the surface error and then moving the spot slowly over high areas and quickly over low ones removes exactly the excess material.'}}]},

 cmp:{scenes:[
  {title:'The polisher',lines:[
   ['Chemical mechanical planarisation flattens each layer of a microchip on a silicon wafer.',{ring:[418,240,62]}],
   ['The wafer is held face-down in a carrier and pressed onto a polishing pad on a rotating platen.',{box:[340,208,160,64]}],
   ['A slurry of chemicals and nanometre-sized abrasive is dripped onto the pad.',{ring:[150,115,36]}],
   ['A diamond conditioner keeps roughening the pad, so it holds slurry and polishes at a steady rate.',{ring:[115,252,32]}]],
   q:{q:'Why is the polishing pad continually roughened by the pad conditioner?',o:['To make the pad softer','To restore the pad texture that holds slurry, keeping the removal rate steady','To remove copper from the pad','To keep the pad cool'],a:1,
    why:'Polishing glazes the pad and fills its pores with debris, so it carries less slurry and the rate falls. The diamond conditioner reopens the surface texture.'}},
  {title:'Chemistry plus abrasion',lines:[
   ['The chemistry softens the top few nanometres of the film; the abrasive then wipes the softened layer away.',{ring:[418,245,40],show:['rr']}],
   ['High points on the wafer press harder against the pad, so they are removed faster. The surface becomes flat.',{ring:[418,240,62]}],
   ['The gauge shows the film thinning.',{box:[30,25,165,42],show:['tclr']}]],
   q:{q:'Why does CMP flatten the surface, rather than just thinning it evenly?',o:['The slurry collects in the low areas','Raised areas carry more pressure against the pad, so they wear faster','The carrier tilts the wafer','The low areas are harder'],a:1,
    why:'The pad touches the high points first and hardest. Removal rate rises with local pressure, so steps are removed faster than the flat areas around them until the surface is level.'}},
  {title:'Pressure and chemistry',lines:[
   ['Watch the removal rate as the down-force rises.',{set:{P:50},show:['rr']}],
   ['Now switch from an oxide film to copper, with its own slurry chemistry.',{set:{mat:'cu'},show:['rr']}],
   ['Timing matters: polish too long and wide copper lines are scooped out.',{show:['rr','tclr']}]],
   q:{q:'Changing only the film and its slurry changed the removal rate about six-fold. What does this show?',o:['Pressure has no effect in CMP','Chemistry, not just pressure and speed, controls the removal rate','The pad was replaced','The wafer became hotter'],a:1,
    why:'The Preston coefficient depends strongly on the slurry chemistry and the film it reacts with. That is why each film, such as oxide, copper or tungsten, has its own slurry.'}}]},

 ibm:{scenes:[
  {title:'The ion source',lines:[
   ['Ion beam machining removes material atom by atom, inside a vacuum chamber.',{box:[22,62,250,30]}],
   ['Argon gas is ionised in the source, and charged grids accelerate the ions to about a thousand electron-volts.',{box:[48,146,116,108]}],
   ['A neutraliser adds electrons to the beam, so insulating targets do not charge up.',{ring:[240,292,30]}]],
   q:{q:'Why is argon, an inert gas, used for the ion beam?',o:['It is the lightest gas available','It is heavy enough to sputter well and does not react chemically with the target','It conducts electricity in the chamber','It cools the target'],a:1,
    why:'Argon atoms are heavy enough to transfer plenty of momentum to target atoms, and being inert they remove material purely physically without contaminating it chemically.'}},
  {title:'Sputtering',lines:[
   ['Each argon ion strikes the target and sets off a cascade of collisions among its atoms.',{ring:[472,200,30]}],
   ['A few surface atoms gain enough energy to fly off. This is sputtering.',{ring:[432,180,40],show:['Y']}],
   ['Material comes away at only nanometres per minute, so IBM is used for final thinning and nanoscale patterns.',{show:['rr']}]],
   q:{q:'Why is IBM unsuitable for removing a millimetre of material from a part?',o:['It cannot machine metals','It removes only nanometres per minute, so it would take far too long','It melts the part','The beam cannot be focused'],a:1,
    why:'At about a hundred nanometres per minute, one millimetre would take around a week. IBM is for removing nanometres to micrometres with atomic-scale control.'}},
  {title:'Energy and current',lines:[
   ['Watch the removal rate as the ion energy rises from one thousand to eighteen hundred electron-volts.',{set:{E:1800},show:['rr','Y']}],
   ['Doubling the current density sends twice as many ions per second.',{set:{J:2},show:['rr']}],
   ['Materials sputter at very different rates. Gold comes off far faster than tungsten.',{set:{mat:'au'},show:['rr','Y']}]],
   q:{q:'The ion current density is doubled at the same ion energy. What happens to the removal rate?',o:['It stays the same','It doubles','It halves','It rises four times'],a:1,
    why:'Each ion removes, on average, the same number of atoms (the sputter yield). Twice as many ions per second therefore remove twice as many atoms per second.'}}]},
};
