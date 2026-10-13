// Writes theory.json (principle + effects text per process) for the narration generator.
// Run from the repository root: node tools/narration/extract.js
global.window={};const fs=require('fs');const S=__dirname+'/../../src/';
eval(['data.js','extra.js','ops.js','data2.js','ops2.js','models.js','nom.js'].map(f=>fs.readFileSync(S+f,'utf8')).join('\n').replace(/^const /gm,'var ').replace(/^let /gm,'var '));
const strip=h=>h.replace(/<[^>]+>/g,'');const out={};
for(const P of PROCESSES)out[P.id]={name:P.name,abbr:P.abbr,principle:P.theory.principle.map(strip),effects:P.theory.effects.map(strip)};
fs.writeFileSync(__dirname+'/theory.json',JSON.stringify(out,null,1));console.log('wrote theory.json for',Object.keys(out).length,'processes');
