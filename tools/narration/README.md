# Theory narration

The Listen button on each Theory tab plays `audio/<process>/<n>.mp3`: first the Principle paragraphs, then the Effect of parameters points, in the order they appear on the page.

Audio was generated with [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) (Apache 2.0), voice `af_heart`, normalised to −16 LUFS, MP3 40 kbit/s mono.

## Regenerate after editing theory text

```sh
pip install kokoro-onnx soundfile          # plus ffmpeg on the PATH
# download kokoro-v1.0.int8.onnx and voices-v1.0.bin from the kokoro-onnx GitHub releases
node tools/narration/extract.js            # writes tools/narration/theory.json
python3 tools/narration/generate.py audio  # writes audio/<process>/*.mp3 and audio/manifest.json
python3 tools/narration/make_narr.py       # writes src/narr.js
sh src/build.sh                            # rebuilds index.html
```

`norm.py` turns symbols, units and formulas into speakable words (for example `A/cm²` → "amperes per square centimetre"). Add an entry there if a new term is read badly.

## Explainers

Explainer scripts are in `src/expl.js`. Each line is read from `audio/<process>/x<scene>_<line>.mp3`, and each concept check from `audio/<process>/xq<scene>.mp3`. After editing a line, delete its MP3 and regenerate:

```sh
node -e "const fs=require('fs');eval(fs.readFileSync('src/expl.js','utf8').replace('const EXPL','global.EXPL'));const o={};for(const id in EXPL)o[id]={lines:EXPL[id].scenes.map(S=>S.lines.map(l=>l[0])),q:EXPL[id].scenes.map(S=>S.q?S.q.q:null)};fs.writeFileSync('tools/narration/expl.json',JSON.stringify(o))"
python3 tools/narration/gen_expl.py audio   # only missing line clips are generated; check clips are always regenerated
```

Without audio files (for example when the page is opened from a local file), the explainer still runs with captions and timed scenes.
