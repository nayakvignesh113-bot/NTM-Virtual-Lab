import json,subprocess,os,sys,soundfile as sf
from kokoro_onnx import Kokoro
from norm import norm
k=Kokoro(os.environ.get('KOKORO_MODEL','kokoro-v1.0.int8.onnx'),os.environ.get('KOKORO_VOICES','voices-v1.0.bin'));T=json.load(open(os.path.join(os.path.dirname(__file__),"theory.json")));OUT=sys.argv[1]
man={}
for pid,v in T.items():
    os.makedirs(f'{OUT}/{pid}',exist_ok=True);items=[]
    texts=[('Principle. ' if i==0 else '')+norm(p) for i,p in enumerate(v['principle'])]+[('Effect of parameters. ' if i==0 else '')+norm(e) for i,e in enumerate(v['effects'])]
    texts[0]=f"{v['name']}. "+texts[0]
    for i,t in enumerate(texts):
        a,sr=k.create(t,voice='af_heart',speed=1.0,lang='en-us');sf.write('tmp.wav',a,sr)
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i','tmp.wav','-af','loudnorm=I=-16:TP=-1.5:LRA=11','-ac','1','-ar','24000','-b:a','40k',f'{OUT}/{pid}/{i}.mp3'],check=True)
        items.append(round(len(a)/sr,1))
    man[pid]={'n':len(texts),'np':len(v['principle']),'dur':items}
    json.dump(man,open(f'{OUT}/manifest.json','w'));print(pid,sum(items),flush=True)
print('DONE',flush=True)
