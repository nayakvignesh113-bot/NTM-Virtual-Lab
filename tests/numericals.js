const fs=require('fs');global.window={};const d=process.argv[2]||__dirname+'/../src';
const src=['data.js','extra.js','data2.js','models.js','num2.js'].map(f=>fs.readFileSync(d+'/'+f,'utf8')).join('\n').replace(/^const /gm,'var ').replace(/^let /gm,'var ');
eval(src);let bad=0,n=0;const types={};
for(const id in NUM){types[id]=NUM_TYPES[id].length;for(let i=0;i<400;i++){const p=NUM[id]();n++;
  const nums=(p.sol.replace(/×10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,'e$1').match(/-?\d[\d,]*\.?\d*(e[⁻\-]?[⁰¹²³⁴⁵⁶⁷⁸⁹\d]+)?/g)||[]);const last=parseFloat((nums[nums.length-1]||'').replace(/,/g,''));
  const ok=isFinite(p.ans)&&p.ans>0&&p.hints&&p.hints.length>=1&&p.unit&&Math.abs(last/p.ans-1)<0.02;
  if(!ok){bad++;if(bad<12)console.log('BAD',id,p.type,p.ans,last,p.sol.slice(-90));}}}
console.log('problems',n,'bad',bad,'types per process',JSON.stringify(types));
