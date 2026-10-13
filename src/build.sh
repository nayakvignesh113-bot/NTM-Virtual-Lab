#!/bin/sh
# Rebuilds ../index.html from these source files. Run: sh build.sh
cd "$(dirname "$0")"
JS="data.js extra.js ops.js draw.js data2.js draw2.js ops2.js models.js nom.js num2.js safety.js app.js operate.js v4.js narr.js v5.js v6.js expl.js edmx.js xplayer.js boot.js"
{ echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Virtual laboratory for 20 non-traditional, hybrid and nano-finishing machining processes, including USM, AJM, WJM, AWJM, CHM, ECM, EDM, WEDM, LBM, EBM, PAM, ECG, ECDM, RUM, LAM, AFM, MAF, MRF, CMP and IBM. Operate virtual machines, run validated simulators, take tests and print lab reports.">
<style>[hidden]{display:none!important}img{max-width:100%}body{margin:0}</style>'; cat head.html; cat cfgload.html; echo '</head><body>'; cat body.html; echo "<script>"; cat $JS; echo "</script></body></html>"; } > ../index.html
