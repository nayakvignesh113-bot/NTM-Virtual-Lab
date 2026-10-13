import re
FIX=[('A₀^¾','amplitude to the three-quarter power'),('(C^¼)','(the fourth root of concentration)'),('C^¼','the fourth root of concentration'),
('p^1.5','pressure to the power one point five'),('√p','the square root of pressure'),('d²','the square of the orifice diameter'),('V²','the square of the voltage'),
('∝ 1/t','inversely proportional to thickness'),('t×u','thickness times speed'),('m·mm/min','metre millimetres per minute'),
('Fe²⁺','iron ions'),('Fe(OH)₂','iron hydroxide'),('CO₂','C O 2'),('H₂','hydrogen'),('O₂','oxygen'),('NaOH','sodium hydroxide'),
('10⁶–10⁸ W/cm²','ten to the six to ten to the eight watts per square centimetre'),('A/cm²','amperes per square centimetre'),
('Iₚ','peak current'),('tₒₙ','pulse-on time'),('tₒff','pulse-off time'),('(µs to ms)','(microseconds to milliseconds)'),
('α','alpha'),('→',', which gives'),('×',' times'),('≈','about'),('∝','proportional to'),('·',' '),('~','about '),
('1/t','one over thickness'),('Yb-doped','ytterbium-doped'),('Nd:YAG','N D yag'),('YAG','yag'),(' = ',' equals '),('m/s','metres per second'),('WARDJET','Wardjet'),('Chemcut','Chem-cut')]
ACR={'AJM':'A J M','AWJM':'A W J M','CMP':'C M P','CNC':'C N C','DC':'D C','ECDM':'E C D M','ECG':'E C G','ECM':'E C M','EDM':'E D M','WEDM':'wire E D M','HAZ':'heat-affected zone','IBM':'I B M','LAM':'L A M','MAF':'M A F','MR':'M R','MRF':'M R F','MRR':'M R R','RUM':'R U M','SOD':'stand-off distance','SODs':'stand-off distances','SS':'stainless steel','USM':'U S M','WC':'tungsten carbide','LBM':'L B M','EBM':'E B M','PAM':'P A M','CHM':'C H M','WJM':'W J M','Al':'aluminium','Ti':'titanium','Cu':'copper','UV':'U V','NC':'N C'}
UNITS=[('°C',' degrees Celsius'),('µm',' micrometres'),('mm³/min',' cubic millimetres per minute'),('mm/min',' millimetres per minute'),('m/s',' metres per second'),
('kHz',' kilohertz'),('kV',' kilovolts'),('kW',' kilowatts'),('MPa',' megapascals'),('kPa',' kilopascals'),('nm',' nanometres'),('mm',' millimetres'),('bar',' bar'),('V',' volts'),('A',' amperes'),('m',' metres'),('%',' percent'),('°',' degrees'),('Hz',' hertz'),('W',' watts'),('min',' minutes'),('s',' seconds'),('g',' grams')]
def norm(t):
    for a,b in FIX:t=t.replace(a,b)
    t=re.sub(r'(\d)\s(\d{3})\b',r'\1\2',t)  # 8 000 -> 8000
    t=re.sub(r'(\d(?:\.\d+)?)\s?[–-]\s?(\d)',r'\1 to \2',t)  # ranges
    for u,w in UNITS:t=re.sub(r'(?<=\d)\s?'+re.escape(u)+r'(?![A-Za-z²³])',w,t)
    t=re.sub(r'\b('+'|'.join(sorted(map(re.escape,ACR),key=len,reverse=True))+r')\b',lambda m:ACR[m.group(1)],t)
    t=t.replace('–',' to ').replace('(',', ').replace(')',',').replace(' ,',',').replace(',,',',')
    t=re.sub(r'\s+',' ',t).strip()
    t=re.sub(r',\s*([.;:])',r'\1',t)
    t=re.sub(r',\s*$','.',t)
    return t
