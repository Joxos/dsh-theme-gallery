# Ambient rendering benchmark (`bench/`)

Measures the cyber preset's ambient rendering (aurora stack, gel overlay, FX
blobs) in a real Chromium (system Edge/Chrome, hardware GPU) and gates every
candidate against the historical pure-CSS baseline with deterministic golden
frames. Nothing here ships in the npm package; it is development tooling.

```bash
node bench/run.mjs            # full matrix: both themes x idle/stream/menu x 3 reps
node bench/run.mjs --quick    # one theme, short runs, no golden frames
node bench/run.mjs --variants baseline,production --themes dark --workloads menu
node bench/run.mjs --viewport 3840x2160x2   # e.g. 4K @2x fidelity re-check
node bench/run.mjs --headed   # visible window on the desktop GPU
node bench/debug-anim.mjs    # inspect CSS animation seek determinism
node bench/debug-gel.mjs     # inspect the gel canvas state
```

Requires Node 18+ and a system Edge or Chrome. No npm dependencies: the
driver speaks CDP over Node's built-in `WebSocket`.

## What it measures

Per variant x theme x workload (workloads run *while* the ambient animations
play, `bench/page/workloads.js`):

| Metric | Source |
| --- | --- |
| frame gaps (p50/p95/max, fps) | in-page rAF probe during the workload |
| per-process/thread CPU totals, paint/raster/composite slices | CDP `Tracing` (`cc`, `gpu`, `toplevel`, `devtools.timeline`), medians of 3 runs |
| style/layout/script counters | CDP `Performance.getMetrics` deltas |
| compositor texture budget | analytic: backing-store pixels x 4 bytes per ambient layer |
| visual diff | golden-frame PNG pairs at five frozen animation times, decoded and compared in-browser |

## Variants

| id | what it is |
| --- | --- |
| `baseline` | the historical pure-CSS stack, reconstructed from the gradient literals recorded in `src/client/effects/gradients.js` |
| `production` | the shipped `src/client/effects/ambient.js` renderer (canvas sprites, default caps) |
| `productionTiny` / `productionMicro` | the production renderer with halved / quartered texture caps |
| `sprite`, `spriteTiny`, `spriteMicro`, `spriteLight` | bench-side twins of the production design (kept for the record; `spriteLight` swaps the dark `screen` blend for `plus-lighter`) |
| `canvas`, `canvasLight`, `hybrid` | alternative architectures: per-frame Canvas2D pre-blend / mixed |
| `d*` | diagnostics (animation/blend/layer/will-change isolation) |

The golden-frame gate is the "don't lose the effects" contract: a candidate
is acceptable when its diff against `baseline` stays within noise
(mean abs <= ~0.4, max channel <= 8, 0% of pixels beyond that) at every
frozen animation time in both themes.

## Layout

```
bench/
├─ run.mjs          orchestration, metrics, report
├─ cdp.mjs          zero-dependency CDP client + browser launcher + trace summary
├─ serve.mjs        bench page + theme/production sources served from src/
├─ specs.mjs        Node-side gradient-spec sync check against the stylesheets
├─ debug-*.mjs      inspection utilities
├─ page/
│  ├─ index.html    bench page: synthetic app chrome + window.__bench API
│  ├─ variants.js   candidate implementations
│  ├─ easing.js     exact replicas of the CSS keyframe timelines
│  ├─ gradients.js  re-exports the production gradient specs + bench helpers
│  ├─ workloads.js  idle / chat-streaming / open-menu workloads
│  ├─ measure.js    frame probe, PNG diff, texture budget
│  └─ shell.css     translucent synthetic UI
└─ out/             results.json, report.md, screenshots (gitignored)
```

`run.mjs` refuses to measure when a gradient literal in the specs no longer
appears in `src/client/**` — the bake can never silently drift from the
stylesheets that record the visual identity.
