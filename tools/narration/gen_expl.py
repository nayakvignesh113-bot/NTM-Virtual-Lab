import json,subprocess,os,sys,soundfile as sf
from kokoro_onnx import Kokoro
k=Kokoro(os.environ.get('KOKORO_MODEL','kokoro-v1.0.int8.onnx'),os.environ.get('KOKORO_VOICES','voices-v1.0.bin'));X=json.load(open(os.path.join(os.path.dirname(__file__),'expl.json')));OUT=sys.argv[1]
def enc(text,path):
    a,sr=k.create(text,voice='af_heart',speed=1.0,lang='en-us');sf.write('tmp3.wav',a,sr)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i','tmp3.wav','-af','loudnorm=I=-16:TP=-1.5:LRA=11','-ac','1','-ar','24000','-b:a','40k',path],check=True)
for pid,v in X.items():
    os.makedirs(f'{OUT}/{pid}',exist_ok=True)
    for si,L in enumerate(v['lines']):
        for li,t in enumerate(L):
            p=f'{OUT}/{pid}/x{si}_{li}.mp3'
            if not os.path.exists(p):enc(t,p)
    for si,q in enumerate(v['q']):
        if q:enc(q,f'{OUT}/{pid}/xq{si}.mp3')
    print(pid,flush=True)
print('DONE',flush=True)
