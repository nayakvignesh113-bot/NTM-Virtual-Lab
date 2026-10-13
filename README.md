# NTM Virtual Lab

An open, browser-based virtual laboratory for **20 non-traditional, hybrid and nano-finishing machining processes**, built for undergraduate courses in manufacturing and advanced machining.

**Live lab:** <https://nayakvignesh113-bot.github.io/NTM-Virtual-Lab/>

Developed by **Dr. Vignesh Nayak Ullal**, Department of Mechanical Engineering, Mangalore Institute of Technology & Engineering (MITE), Moodbidri, Karnataka, India.

## Processes

| Group | Processes |
|---|---|
| Mechanical | USM, AJM, WJM, AWJM |
| Thermal and electrothermal | EDM, WEDM, LBM, EBM, PAM |
| Chemical and electrochemical | CHM, ECM |
| Hybrid | ECG, ECDM, RUM, LAM |
| Nano-finishing | AFM, MAF, MRF, CMP, IBM |

## What each experiment contains

Theory with governing equations and nomenclature · pre-test · **Operate** (set up the machine by placing parts and switching on pumps, gas and power through safety interlocks, run the cycle, take readings and calculate) · parametric experiment with alternative removal models · randomised numericals · post-test · validation against published data · a 21-section, watermarked lab report with uncertainty budget, which students can print, download or submit to their faculty.

Ten processes (EDM, USM, ECM, LBM, EBM, CHM, AFM, MRF, CMP, IBM) open with a narrated **explainer** of one to three minutes, with concept checks between scenes; a wrong answer replays the scene. Numericals offer three randomised problem types per process, each with graded hints. Every Theory tab has a **Listen** button that reads the principle and the effect of parameters aloud. Before a student can print, download or submit a report, they complete a short feedback form (six ratings and three short answers), which is sent to the faculty's Google Sheet.

Safety briefings, tool and consumable libraries, and validation status are given for every process. Simulator outputs are model estimates for teaching; see the *About & validation* page for how far each one has been checked against published data.

## Running and building

The lab is a single static file, `index.html`. No server, login or installation is needed; student data stays in the browser unless they choose to submit a report.

* Source files are in `src/`. Rebuild `index.html` with `sh src/build.sh`.
* Check all simulators for consistency with `node tests/audit.js`. It should print `NO ISSUES`.
* Narration audio is in `audio/<process>/`. To regenerate it after editing theory text, see `tools/narration/README.md`.
* To collect student submissions and feedback in a Google Sheet, follow `apps-script/SUBMISSIONS_SETUP.md` and put the web-app URL in `config.js`.

## How to cite

See `CITATION.cff`, or the *Cite this repository* button on GitHub.

> Ullal, V. N. (2026). *NTM Virtual Lab: an open virtual laboratory for non-traditional machining processes* (Version 4.3). Department of Mechanical Engineering, MITE Moodbidri. https://nayakvignesh113-bot.github.io/NTM-Virtual-Lab/

## License

© 2026 Vignesh Nayak Ullal. Licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/) (CC BY-NC-SA 4.0). You may use and adapt it for teaching and research with attribution; commercial use requires the author's permission. See `LICENSE.md`.
