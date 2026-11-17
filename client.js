/*! @joxos/dsh-theme-gallery v1.1.1 | generated from src/client by scripts/build-client.mjs - edit the sources, not this file. */
(() => {
  // src/client/constants.js
  var NS = "styleGallery";
  var PANEL_ID = "style-gallery";
  var PACKAGE_ID = "@joxos/dsh-theme-gallery";
  var SOURCE = PACKAGE_ID;
  var STORAGE_KEY = "dsh.style-gallery.active";
  var CYCLE_KEY = "dsh.style-gallery.cycle";
  var CYCLE_MIN = 0.5;
  var CYCLE_MAX = 5;
  var CYCLE_STEP = 0.1;
  var CYCLE_DEFAULT = 2;
  var NATIVE_ID = "native";
  var EFFECT_STYLE_ID = "cyber";

  // src/client/styles/page.css
  var page_default = '.dsg-page{box-sizing:border-box;height:100%;overflow:auto;display:flex;flex-direction:column;align-items:center;gap:24px;padding:0 clamp(24px,4vw,48px) 48px;color:var(--dsw-alias-label-primary)}\n.dsg-page>*{width:100%;max-width:960px}\n.dsg-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-top:28px}\n[data-platform="darwin"] .dsg-head{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}\n.dsg-headText{display:flex;flex-direction:column;gap:4px;min-width:0}\n.dsg-title{margin:0;font-size:20px;font-weight:500;line-height:28px}\n.dsg-intro{margin:0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}\n.dsg-actions{display:flex;align-items:center;gap:10px;flex:none}\n.dsg-current{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;white-space:nowrap}\n.dsg-currentDot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-brand-primary)}\n.dsg-reset{appearance:none;font:inherit;font-size:13px;line-height:20px;padding:5px 12px;border-radius:var(--dsw-radius-sm);border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer}\n.dsg-reset:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}\n.dsg-reset:disabled{color:var(--dsw-alias-label-caption);cursor:default}\n.dsg-reset:focus-visible,.dsg-card:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-alias-state-business-primary);outline-offset:2px}\n.dsg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(248px,1fr));gap:16px}\n.dsg-card{appearance:none;font:inherit;text-align:left;display:flex;flex-direction:column;padding:0;overflow:hidden;cursor:pointer;color:inherit;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);transition:border-color .15s ease,box-shadow .15s ease}\n.dsg-card:hover{border-color:var(--dsw-alias-border-l4);box-shadow:var(--dsw-elevation-soft,0 2px 8px rgba(0,0,0,.08))}\n.dsg-cardOn,.dsg-cardOn:hover{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary)}\n.dsg-pvw{--pv-bg:#f4f0e3;--pv-surface:#fffdf6;--pv-sidebar:#ebe4d2;--pv-ink:#241f17;--pv-line:rgba(36,31,23,.22);--pv-brand:#d81e5b;--pv-border:rgba(36,31,23,.24);--pv-radius:var(--dsw-radius-xs);--pv-font:var(--dsw-font-family);display:flex;gap:8px;box-sizing:border-box;height:108px;padding:10px;background:var(--pv-bg);border-bottom:1px solid var(--pv-border)}\n.dsg-pvwSide{width:33%;flex:none;box-sizing:border-box;display:flex;flex-direction:column;gap:4px;padding:6px;border:1px solid var(--pv-border);border-radius:var(--pv-radius);background:var(--pv-sidebar)}\n.dsg-pvwDot{width:9px;height:9px;margin-bottom:1px;border-radius:var(--pv-radius);background:var(--pv-brand)}\n.dsg-pvwNav{height:5px;border-radius:var(--pv-radius);background:var(--pv-line)}\n.dsg-pvwNavOn{width:86%;background:var(--pv-brand)}\n.dsg-pvwNavShort{width:58%}\n.dsg-pvwMain{flex:1;min-width:0;box-sizing:border-box;display:flex;flex-direction:column;gap:5px;padding:7px;border:1px solid var(--pv-border);border-radius:var(--pv-radius);background:var(--pv-surface)}\n.dsg-pvwHead{display:flex;align-items:center;justify-content:space-between;gap:6px}\n.dsg-pvwAa{font-family:var(--pv-font);font-size:14px;font-weight:600;line-height:16px;letter-spacing:.01em;color:var(--pv-ink)}\n.dsg-pvwAccent{width:16px;height:6px;border-radius:var(--pv-radius);background:var(--pv-brand)}\n.dsg-pvwLine{height:5px;border-radius:var(--pv-radius);background:var(--pv-line)}\n.dsg-pvwLineWide{width:88%}\n.dsg-pvwLineMid{width:60%}\n.dsg-pvwCta{margin-top:auto;width:52%;height:14px;border-radius:var(--pv-radius);background:var(--pv-brand)}\n.dsg-pvw[data-style="cyber"]{--pv-bg:radial-gradient(120% 150% at 82% -8%,#e4dbff 0%,#f2efff 48%,#eaf6ff 100%);--pv-surface:rgba(255,255,255,.78);--pv-sidebar:rgba(243,240,255,.72);--pv-ink:#15102e;--pv-line:rgba(76,58,140,.22);--pv-brand:#7c3aed;--pv-border:rgba(76,58,140,.24);--pv-radius:16px;--pv-font:"Bahnschrift","DIN Alternate","Segoe UI",sans-serif}\nbody[data-ds-dark-theme] .dsg-pvw[data-style="cyber"]{--pv-bg:radial-gradient(120% 150% at 82% -10%,#0f3d4d 0%,#0a0d1f 52%,#070912 100%);--pv-surface:rgba(16,18,40,.68);--pv-sidebar:rgba(11,13,32,.72);--pv-ink:#e7f6ff;--pv-line:rgba(120,220,255,.22);--pv-brand:#22d3ee;--pv-border:rgba(120,220,255,.28)}\n.dsg-cardBody{display:flex;flex-direction:column;gap:2px;padding:12px 14px 14px}\n.dsg-cycleRow{display:flex;align-items:center;gap:8px;padding:2px 14px 14px}\n.dsg-cycleLabel{flex:none;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}\n.dsg-cycleSlider{flex:1;min-width:0;appearance:none;height:4px;border-radius:999px;background:var(--dsw-alias-border-l2);cursor:pointer}\n.dsg-cycleSlider::-webkit-slider-thumb{appearance:none;width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-brand-primary);cursor:pointer}\n.dsg-cycleSlider:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-alias-state-business-primary);outline-offset:2px}\n.dsg-cycleValue{flex:none;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}\n.dsg-cardHead{display:flex;align-items:center;justify-content:space-between;gap:8px}\n.dsg-cardName{font-size:14px;font-weight:500;line-height:22px;color:var(--dsw-alias-label-primary)}\n.dsg-cardDesc{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}\n.dsg-chip{flex:none;display:inline-flex;align-items:center;gap:5px;padding:1px 8px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover-accent);color:var(--dsw-alias-brand-primary);font-size:11px;font-weight:500;line-height:17px}\n.dsg-chipDot{width:5px;height:5px;border-radius:50%;background:currentColor}\n.dsg-foot{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}\n.dsg-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}\n/*\n * FX overlay blobs: geometry and animations unchanged; the radial gradients\n * are baked into the canvases by `src/client/effects/ambient.js`. Historical\n * literals (kept in sync with `src/client/effects/gradients.js`):\n *\n *   A radial-gradient(circle at 42% 42%,rgba(168,85,247,.7),rgba(59,130,246,.2) 46%,transparent 68%)\n *   B radial-gradient(circle at 58% 42%,rgba(34,211,238,.7),rgba(59,130,246,.22) 46%,transparent 68%)\n *   C radial-gradient(circle at 50% 50%,rgba(236,72,153,.6),rgba(124,58,237,.22) 48%,transparent 70%)\n *   D radial-gradient(circle at 50% 50%,rgba(59,130,246,.55),rgba(34,211,238,.2) 44%,transparent 68%)\n */\n.dsg-fx{position:fixed;inset:0;pointer-events:none;overflow:hidden;-webkit-mask-image:linear-gradient(to bottom,#000 0%,#000 68%,transparent 94%);mask-image:linear-gradient(to bottom,#000 0%,#000 68%,transparent 94%)}\n.dsg-fxBlob{position:absolute;border-radius:50%;opacity:.55;mix-blend-mode:screen;will-change:transform}\n.dsg-fxBlobA{width:80vmax;height:80vmax;left:-40vmax;top:-42vmax;animation:dsg-fx-a calc(11s * var(--dsg-cycle-scale,1)) ease-in-out infinite alternate}\n.dsg-fxBlobB{width:70vmax;height:70vmax;right:-36vmax;top:-28vmax;animation:dsg-fx-b calc(14s * var(--dsg-cycle-scale,1)) ease-in-out infinite alternate}\n.dsg-fxBlobC{width:86vmax;height:86vmax;left:-12vmax;bottom:-52vmax;animation:dsg-fx-c calc(17s * var(--dsg-cycle-scale,1)) ease-in-out infinite alternate}\n.dsg-fxBlobD{width:62vmax;height:62vmax;left:34vmax;top:22vmax;animation:dsg-fx-d calc(13s * var(--dsg-cycle-scale,1)) ease-in-out infinite alternate}\n@keyframes dsg-fx-a{0%{transform:translate3d(0,0,0) scale(1)}100%{transform:translate3d(34vmax,24vmax,0) scale(1.24)}}\n@keyframes dsg-fx-b{0%{transform:translate3d(0,0,0) scale(1.02)}100%{transform:translate3d(-30vmax,26vmax,0) scale(1.2) rotate(14deg)}}\n@keyframes dsg-fx-c{0%{transform:translate3d(0,0,0) scale(1)}100%{transform:translate3d(26vmax,-30vmax,0) scale(1.22)}}\n@keyframes dsg-fx-d{0%{transform:translate3d(0,0,0) scale(1.1) rotate(0)}100%{transform:translate3d(-26vmax,22vmax,0) scale(1.28) rotate(-12deg)}}\nbody:not([data-ds-dark-theme]) .dsg-fxBlob{mix-blend-mode:multiply;opacity:.2}\n';

  // src/client/cycle.js
  function createCycleStore({ storageKey, min, max, step = 0.05, fallback }) {
    let value = fallback;
    const listeners = /* @__PURE__ */ new Set();
    const clamp = (candidate) => Math.min(max, Math.max(min, candidate));
    function emit() {
      for (const listener of [...listeners]) {
        try {
          listener();
        } catch (error) {
          console.error("style-gallery: cycle listener crashed", error);
        }
      }
    }
    function getSnapshot() {
      return value;
    }
    function subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
    function readSaved() {
      try {
        const saved = Number.parseFloat(localStorage.getItem(storageKey));
        return Number.isFinite(saved) ? clamp(saved) : fallback;
      } catch (error) {
        return fallback;
      }
    }
    function apply(target = document.documentElement) {
      target.style.setProperty("--dsg-cycle-scale", String(value));
    }
    function set(next, { persist = true } = {}) {
      value = clamp(next);
      apply();
      if (!persist) return;
      try {
        localStorage.setItem(storageKey, String(value));
      } catch (error) {
      }
      emit();
    }
    function clear() {
      try {
        document.documentElement.style.removeProperty("--dsg-cycle-scale");
      } catch (error) {
      }
    }
    function clearListeners() {
      listeners.clear();
    }
    return { min, max, step, getSnapshot, subscribe, readSaved, apply, set, clear, clearListeners };
  }

  // src/client/effects/gradients.js
  var AURORA_GRADIENTS = {
    a: {
      light: { css: "radial-gradient(closest-side,rgba(124,58,237,.55),transparent)", shape: "ellipse", cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [124, 58, 237, 0.55]], [1, [0, 0, 0, 0]]] },
      dark: { css: "radial-gradient(closest-side,rgba(34,211,238,.6),transparent)", shape: "ellipse", cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [34, 211, 238, 0.6]], [1, [0, 0, 0, 0]]] }
    },
    b: {
      light: { css: "radial-gradient(closest-side,rgba(34,211,238,.5),transparent)", shape: "ellipse", cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [34, 211, 238, 0.5]], [1, [0, 0, 0, 0]]] },
      dark: { css: "radial-gradient(closest-side,rgba(168,85,247,.55),transparent)", shape: "ellipse", cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [168, 85, 247, 0.55]], [1, [0, 0, 0, 0]]] }
    },
    c: {
      light: { css: "radial-gradient(closest-side,rgba(236,72,153,.35),transparent)", shape: "ellipse", cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [236, 72, 153, 0.35]], [1, [0, 0, 0, 0]]] },
      dark: { css: "radial-gradient(closest-side,rgba(59,130,246,.5),transparent)", shape: "ellipse", cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [59, 130, 246, 0.5]], [1, [0, 0, 0, 0]]] }
    },
    d: {
      light: { css: "radial-gradient(closest-side,rgba(124,58,237,.14),transparent)", shape: "ellipse", cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [124, 58, 237, 0.14]], [1, [0, 0, 0, 0]]] },
      dark: { css: "radial-gradient(closest-side,rgba(236,72,153,.18),transparent)", shape: "ellipse", cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [236, 72, 153, 0.18]], [1, [0, 0, 0, 0]]] }
    }
  };
  var AURORA_BASE = {
    light: {
      css: "linear-gradient(155deg,#eef2ff 0%,#e6f8ff 48%,#f7edff 100%)",
      angle: 155,
      stops: [[0, [238, 242, 255, 1]], [0.48, [230, 248, 255, 1]], [1, [247, 237, 255, 1]]]
    },
    dark: {
      css: "linear-gradient(160deg,#03040b 0%,#070a1c 45%,#0a0d26 100%)",
      angle: 160,
      stops: [[0, [3, 4, 11, 1]], [0.45, [7, 10, 28, 1]], [1, [10, 13, 38, 1]]]
    }
  };
  var BLOB_GRADIENTS = {
    A: { css: "radial-gradient(circle at 42% 42%,rgba(168,85,247,.7),rgba(59,130,246,.2) 46%,transparent 68%)", shape: "circle", cx: 0.42, cy: 0.42, stops: [[0, [168, 85, 247, 0.7]], [0.46, [59, 130, 246, 0.2]], [0.68, [0, 0, 0, 0]]] },
    B: { css: "radial-gradient(circle at 58% 42%,rgba(34,211,238,.7),rgba(59,130,246,.22) 46%,transparent 68%)", shape: "circle", cx: 0.58, cy: 0.42, stops: [[0, [34, 211, 238, 0.7]], [0.46, [59, 130, 246, 0.22]], [0.68, [0, 0, 0, 0]]] },
    C: { css: "radial-gradient(circle at 50% 50%,rgba(236,72,153,.6),rgba(124,58,237,.22) 48%,transparent 70%)", shape: "circle", cx: 0.5, cy: 0.5, stops: [[0, [236, 72, 153, 0.6]], [0.48, [124, 58, 237, 0.22]], [0.7, [0, 0, 0, 0]]] },
    D: { css: "radial-gradient(circle at 50% 50%,rgba(59,130,246,.55),rgba(34,211,238,.2) 44%,transparent 68%)", shape: "circle", cx: 0.5, cy: 0.5, stops: [[0, [59, 130, 246, 0.55]], [0.44, [34, 211, 238, 0.2]], [0.68, [0, 0, 0, 0]]] }
  };
  var GEL_GRADIENTS = {
    light: [
      { css: "radial-gradient(900px 700px at 86% -4%,rgba(124,58,237,.22),transparent 58%)", shape: "ellipse", cx: 0.86, cy: -0.04, rx: 900, ry: 700, stops: [[0, [124, 58, 237, 0.22]], [0.58, [0, 0, 0, 0]]] },
      { css: "radial-gradient(800px 600px at 4% 10%,rgba(34,211,238,.2),transparent 60%)", shape: "ellipse", cx: 0.04, cy: 0.1, rx: 800, ry: 600, stops: [[0, [34, 211, 238, 0.2]], [0.6, [0, 0, 0, 0]]] },
      { css: "radial-gradient(900px 700px at 50% 116%,rgba(236,72,153,.14),transparent 62%)", shape: "ellipse", cx: 0.5, cy: 1.16, rx: 900, ry: 700, stops: [[0, [236, 72, 153, 0.14]], [0.62, [0, 0, 0, 0]]] }
    ],
    dark: [
      { css: "radial-gradient(900px 700px at 86% -4%,rgba(34,211,238,.26),transparent 58%)", shape: "ellipse", cx: 0.86, cy: -0.04, rx: 900, ry: 700, stops: [[0, [34, 211, 238, 0.26]], [0.58, [0, 0, 0, 0]]] },
      { css: "radial-gradient(800px 600px at 4% 10%,rgba(168,85,247,.24),transparent 60%)", shape: "ellipse", cx: 0.04, cy: 0.1, rx: 800, ry: 600, stops: [[0, [168, 85, 247, 0.24]], [0.6, [0, 0, 0, 0]]] },
      { css: "radial-gradient(900px 700px at 50% 116%,rgba(59,130,246,.2),transparent 62%)", shape: "ellipse", cx: 0.5, cy: 1.16, rx: 900, ry: 700, stops: [[0, [59, 130, 246, 0.2]], [0.62, [0, 0, 0, 0]]] }
    ]
  };
  var TEXTURE_CAP = { base: 80, layer: 48, blob: 64, gel: 110 };
  function rgbaCss([r, g, b, a]) {
    return `rgba(${r},${g},${b},${a})`;
  }
  function expandStops(stops, perSegment = 24) {
    const out = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const [t0, [r0, g0, b0, a0]] = stops[i];
      const [t1, [r1, g1, b1, a1]] = stops[i + 1];
      for (let k = 0; k < perSegment; k++) {
        const t = k / perSegment;
        const a = a0 + (a1 - a0) * t;
        const r = a === 0 ? r1 : (r0 * a0 + (r1 * a1 - r0 * a0) * t) / a;
        const g = a === 0 ? g1 : (g0 * a0 + (g1 * a1 - g0 * a0) * t) / a;
        const b = a === 0 ? b1 : (b0 * a0 + (b1 * a1 - b0 * a0) * t) / a;
        out.push([t0 + (t1 - t0) * t, [Math.round(r), Math.round(g), Math.round(b), a]]);
      }
    }
    out.push(stops[stops.length - 1]);
    return out;
  }
  function paintGradient(ctx, w, h2, spec) {
    const cx = spec.cx * w;
    const cy = spec.cy * h2;
    let radius;
    let scaleX = 1;
    let scaleY = 1;
    if (spec.shape === "circle") {
      radius = Math.max(
        Math.hypot(cx, cy),
        Math.hypot(w - cx, cy),
        Math.hypot(cx, h2 - cy),
        Math.hypot(w - cx, h2 - cy)
      );
    } else {
      const rx = spec.rx <= 1 ? spec.rx * w : spec.rx;
      const ry = spec.ry <= 1 ? spec.ry * h2 : spec.ry;
      radius = Math.max(1, Math.min(rx, ry));
      scaleX = rx / radius;
      scaleY = ry / radius;
    }
    ctx.save();
    if (scaleX !== 1 || scaleY !== 1) {
      ctx.translate(cx, cy);
      ctx.scale(scaleX, scaleY);
      ctx.translate(-cx, -cy);
    }
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    for (const [t, rgba] of expandStops(spec.stops)) gradient.addColorStop(t, rgbaCss(rgba));
    ctx.fillStyle = gradient;
    ctx.fillRect(-w, -h2, w * 3, h2 * 3);
    ctx.restore();
  }
  function paintBase(ctx, w, h2, spec) {
    const imageW = w * 1.6;
    const imageH = h2 * 1.6;
    const rad = spec.angle % 360 * Math.PI / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const lineLen = Math.abs(imageW * sin) + Math.abs(imageH * cos);
    const gx = imageW / 2;
    const gy = imageH / 2;
    const gradient = ctx.createLinearGradient(
      gx - sin * lineLen / 2,
      gy + cos * lineLen / 2,
      gx + sin * lineLen / 2,
      gy - cos * lineLen / 2
    );
    for (const [t, [r, g, b]] of spec.stops) gradient.addColorStop(t, `rgb(${r},${g},${b})`);
    ctx.save();
    ctx.translate((w - imageW) / 2, (h2 - imageH) / 2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, imageW, imageH);
    ctx.restore();
  }
  function backingScale(kind, cssWidth, cssHeight, cap = TEXTURE_CAP) {
    return Math.min(1, cap[kind] / Math.max(cssWidth, cssHeight));
  }

  // src/client/effects/ambient.js
  function currentTheme() {
    return document.body.hasAttribute("data-ds-dark-theme") ? "dark" : "light";
  }
  function observeTheme(callback) {
    const observer = new MutationObserver(() => callback(currentTheme()));
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
    return {
      dispose() {
        observer.disconnect();
      }
    };
  }
  function debounce(fn, ms) {
    let timer = 0;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }
  function mountAuroraStack({ caps = TEXTURE_CAP } = {}) {
    const root = document.createElement("div");
    root.className = "dsg-aurora";
    root.setAttribute("aria-hidden", "true");
    const base = document.createElement("canvas");
    base.className = "dsg-auroraBase";
    base.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    root.append(base);
    const layers = {};
    for (const id of ["a", "b", "c", "d"]) {
      const canvas = document.createElement("canvas");
      canvas.className = `dsg-auroraLayer dsg-aurora-${id}`;
      root.append(canvas);
      layers[id] = canvas;
    }
    document.body.append(root);
    function backingFor(kind, element) {
      const rect = element.getBoundingClientRect();
      const scale = backingScale(kind, rect.width, rect.height, caps);
      return { w: Math.max(1, Math.round(rect.width * scale)), h: Math.max(1, Math.round(rect.height * scale)) };
    }
    function repaint(theme2) {
      let size = backingFor("base", base);
      base.width = size.w;
      base.height = size.h;
      paintBase(base.getContext("2d"), size.w, size.h, AURORA_BASE[theme2]);
      for (const [id, canvas] of Object.entries(layers)) {
        size = backingFor("layer", canvas);
        canvas.width = size.w;
        canvas.height = size.h;
        bakeInto(canvas, AURORA_GRADIENTS[id][theme2]);
      }
    }
    const theme = observeTheme(repaint);
    repaint(currentTheme());
    return {
      root,
      layers,
      repaint,
      dispose() {
        theme.dispose();
        root.remove();
      }
    };
  }
  function bakeInto(canvas, spec) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paintGradient(ctx, canvas.width, canvas.height, spec);
  }
  function mountGelLayer({ caps = TEXTURE_CAP } = {}) {
    const canvas = document.createElement("canvas");
    canvas.className = "dsg-gel";
    canvas.setAttribute("aria-hidden", "true");
    document.body.append(canvas);
    function repaint(theme2) {
      const box = {
        w: (document.documentElement?.clientWidth || window.innerWidth) * 1.16,
        h: (document.documentElement?.clientHeight || window.innerHeight) * 1.16
      };
      const scale = backingScale("gel", box.w, box.h, caps);
      canvas.width = Math.max(1, Math.round(box.w * scale));
      canvas.height = Math.max(1, Math.round(box.h * scale));
      const ctx = canvas.getContext("2d");
      for (const spec of GEL_GRADIENTS[theme2]) {
        paintGradient(ctx, canvas.width, canvas.height, {
          ...spec,
          rx: spec.rx / box.w * canvas.width,
          ry: spec.ry / box.h * canvas.height
        });
      }
    }
    const theme = observeTheme(repaint);
    const onResize = debounce(() => repaint(currentTheme()), 200);
    window.addEventListener("resize", onResize);
    repaint(currentTheme());
    return {
      canvas,
      repaint,
      dispose() {
        theme.dispose();
        window.removeEventListener("resize", onResize);
        canvas.remove();
      }
    };
  }
  function bakeBlobs(container, { caps = TEXTURE_CAP } = {}) {
    const blobs = [...container.querySelectorAll(".dsg-fxBlob")];
    function repaint(theme2) {
      for (const canvas of blobs) {
        const id = canvas.className.match(/dsg-fxBlob([A-D])/)?.[1];
        const spec = BLOB_GRADIENTS[id];
        if (spec === void 0) continue;
        const rect = canvas.getBoundingClientRect();
        const scale = backingScale("blob", rect.width, rect.height, caps);
        canvas.width = Math.max(1, Math.round(rect.width * scale));
        canvas.height = Math.max(1, Math.round(rect.height * scale));
        bakeInto(canvas, spec);
      }
    }
    const theme = observeTheme(repaint);
    repaint(currentTheme());
    return {
      repaint,
      dispose() {
        theme.dispose();
      }
    };
  }

  // src/client/runtime.js
  var ReactModule = null;
  function bindReact(require2) {
    const react = require2("react");
    if (react === null || react === void 0 || typeof react.createElement !== "function") {
      throw new Error("style-gallery: the host React module is unavailable");
    }
    ReactModule = react;
  }
  function getReact() {
    if (ReactModule === null) {
      throw new Error("style-gallery: React was not bound before the plugin ran");
    }
    return ReactModule;
  }
  function h(...args) {
    return getReact().createElement(...args);
  }

  // src/client/components/GalleryPreview.js
  function GalleryPreview(props) {
    return h(
      "span",
      { className: "dsg-pvw", "data-style": props.styleId, "aria-hidden": "true" },
      h(
        "span",
        { className: "dsg-pvwSide" },
        h("span", { className: "dsg-pvwDot" }),
        h("span", { className: "dsg-pvwNav dsg-pvwNavOn" }),
        h("span", { className: "dsg-pvwNav" }),
        h("span", { className: "dsg-pvwNav dsg-pvwNavShort" })
      ),
      h(
        "span",
        { className: "dsg-pvwMain" },
        h(
          "span",
          { className: "dsg-pvwHead" },
          h("span", { className: "dsg-pvwAa" }, "Aa"),
          h("span", { className: "dsg-pvwAccent" })
        ),
        h("span", { className: "dsg-pvwLine dsg-pvwLineWide" }),
        h("span", { className: "dsg-pvwLine" }),
        h("span", { className: "dsg-pvwLine dsg-pvwLineMid" }),
        h("span", { className: "dsg-pvwCta" })
      )
    );
  }

  // src/client/components/GalleryPage.js
  function createGalleryPage({ styles, nativeId, translator, useActiveStyle, onSelect, cycleStore }) {
    return function GalleryPage(props) {
      const t = props !== null && props !== void 0 && typeof props.t === "function" ? props.t : translator;
      const React = getReact();
      const activeId = useActiveStyle();
      const [cycle, setCycleState] = React.useState(() => cycleStore.getSnapshot());
      const activeStyle = styles.find((spec) => spec.id === activeId);
      const activeName = activeStyle === void 0 ? t("page.native") : t(activeStyle.nameKey);
      const onCycleInput = (event) => {
        const next = Number.parseFloat(event.target.value);
        if (!Number.isFinite(next)) return;
        cycleStore.set(next);
        setCycleState(cycleStore.getSnapshot());
      };
      return h(
        "div",
        { className: "dsg-page" },
        h(
          "div",
          { className: "dsg-head" },
          h(
            "div",
            { className: "dsg-headText" },
            h("h1", { className: "dsg-title" }, t("page.title")),
            h("p", { className: "dsg-intro" }, t("page.intro"))
          ),
          h(
            "div",
            { className: "dsg-actions" },
            h(
              "span",
              { className: "dsg-current" },
              h("span", { className: "dsg-currentDot", "aria-hidden": "true" }),
              activeName
            ),
            h(
              "button",
              {
                type: "button",
                className: "dsg-reset",
                disabled: activeId === nativeId,
                onClick: () => {
                  onSelect(nativeId);
                }
              },
              t("page.reset")
            )
          )
        ),
        h(
          "div",
          { className: "dsg-grid", role: "group", "aria-label": t("page.gridLabel") },
          styles.map((spec) => {
            const active = spec.id === activeId;
            return h(
              "div",
              {
                key: spec.id,
                role: "button",
                tabIndex: 0,
                className: active ? "dsg-card dsg-cardOn" : "dsg-card",
                "aria-pressed": active,
                onClick: (event) => {
                  if (event.target !== event.currentTarget && event.target.closest(".dsg-cycleRow")) return;
                  onSelect(spec.id);
                },
                onKeyDown: (event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(spec.id);
                  }
                }
              },
              h(GalleryPreview, { styleId: spec.id }),
              h(
                "span",
                { className: "dsg-cardBody" },
                h(
                  "span",
                  { className: "dsg-cardHead" },
                  h("span", { className: "dsg-cardName" }, t(spec.nameKey)),
                  active ? h(
                    "span",
                    { className: "dsg-chip" },
                    h("span", { className: "dsg-chipDot", "aria-hidden": "true" }),
                    t("chip.active")
                  ) : null
                ),
                h("span", { className: "dsg-cardDesc" }, t(spec.descKey))
              ),
              spec.cycle ? h(
                "span",
                { className: "dsg-cycleRow" },
                h("span", { className: "dsg-cycleLabel" }, t("card.cycleLabel")),
                h("input", {
                  type: "range",
                  className: "dsg-cycleSlider",
                  min: cycleStore.min,
                  max: cycleStore.max,
                  step: cycleStore.step,
                  value: cycle,
                  "aria-label": t("card.cycleLabel"),
                  onChange: onCycleInput
                }),
                h("span", { className: "dsg-cycleValue" }, t("card.cycleValue", { value: String(parseFloat(cycle.toFixed(2))) }))
              ) : null
            );
          })
        ),
        h("p", { className: "dsg-foot" }, t("page.footnote")),
        h("span", { className: "dsg-sr", "aria-live": "polite" }, t("a11y.applied", { name: activeName }))
      );
    };
  }

  // src/client/components/GalleryIcon.js
  function GalleryIcon(props) {
    const size = props !== null && props !== void 0 && typeof props.size === "number" ? props.size : 18;
    return h(
      "svg",
      {
        width: size,
        height: size,
        viewBox: "0 0 20 20",
        fill: "none",
        "aria-hidden": "true",
        focusable: "false",
        style: { display: "block" }
      },
      h("path", {
        d: "M10 2.7a7.3 7.3 0 1 0 0 14.6c1.14 0 1.83-.83 1.83-1.86 0-1.34 1.06-1.98 2.42-1.98h.99A2.16 2.16 0 0 0 17.4 11.3 7.6 7.6 0 0 0 10 2.7Z",
        stroke: "currentColor",
        strokeWidth: 1.4,
        strokeLinejoin: "round"
      }),
      h("circle", { cx: 6.7, cy: 8.6, r: 1.15, fill: "currentColor" }),
      h("circle", { cx: 9.8, cy: 5.9, r: 1.15, fill: "currentColor" }),
      h("circle", { cx: 13.1, cy: 7.4, r: 1.15, fill: "currentColor" })
    );
  }

  // src/client/components/StyleFx.js
  function createStyleFx({ useActiveStyle, effectStyleId }) {
    return function StyleFx() {
      const activeId = useActiveStyle();
      const React = getReact();
      const ref = React.useRef(null);
      React.useEffect(() => {
        if (activeId !== effectStyleId || ref.current === null) return void 0;
        const baked = bakeBlobs(ref.current);
        return () => baked.dispose();
      }, [activeId]);
      if (activeId === effectStyleId) {
        return h(
          "div",
          { className: "dsg-fx", "aria-hidden": "true", ref },
          h("canvas", { className: "dsg-fxBlob dsg-fxBlobA" }),
          h("canvas", { className: "dsg-fxBlob dsg-fxBlobB" }),
          h("canvas", { className: "dsg-fxBlob dsg-fxBlobC" }),
          h("canvas", { className: "dsg-fxBlob dsg-fxBlobD" })
        );
      }
      return null;
    };
  }

  // src/client/dictionaries/en.js
  var en_default = {
    "entry.label": "Visual style",
    "page.title": "Visual style",
    "page.intro": "Pick a look for the whole app. It applies right away and follows your light or dark color scheme.",
    "page.reset": "Use native",
    "page.native": "Native look",
    "page.gridLabel": "Available styles",
    "page.footnote": "Styles cover every panel, dialog and the composer. The choice is saved in this browser only.",
    "chip.active": "Active",
    "a11y.applied": "Current style: {name}",
    "card.cycleLabel": "Motion cycle",
    "card.cycleValue": "{value}×",
    "style.cyber.name": "Aurora Whispers",
    "style.cyber.desc": "Aurora light drifts through glass and night — quiet, deep, and always in motion."
  };

  // src/client/dictionaries/zh.js
  var zh_default = {
    "entry.label": "视觉风格",
    "page.title": "视觉风格",
    "page.intro": "为整个应用选择一种外观。风格立即生效，并跟随你的浅色 / 深色模式。",
    "page.reset": "恢复原生",
    "page.native": "原生外观",
    "page.gridLabel": "可选风格",
    "page.footnote": "风格会应用到所有面板、对话框和输入区；选择只保存在这台设备的浏览器中。",
    "chip.active": "使用中",
    "a11y.applied": "当前风格：{name}",
    "card.cycleLabel": "动效周期",
    "card.cycleValue": "{value}×",
    "style.cyber.name": "极光絮语",
    "style.cyber.desc": "极光在夜色与玻璃之间缓慢流动，安静、深邃，从不停歇。"
  };

  // src/client/i18n.js
  var DICTIONARIES = { zh: zh_default, en: en_default };

  // src/client/presets/cyber/style.css
  var style_default = ':root{--dsw-radius-xs:10px;--dsw-radius-sm:14px;--dsw-radius-md:16px;--dsw-radius-lg:20px;--dsw-radius-xl:24px;--dsw-radius-panel:30px;--dsw-corner-shape:superellipse(1.8)}\n:root,body{--dsw-font-family:"Bahnschrift","DIN Alternate","Segoe UI Variable Display","Segoe UI",-apple-system,BlinkMacSystemFont,sans-serif!important}\n:root,body,body *{--dsw-elevation-panel:0 0 0 1px rgba(34,211,238,.28),0 20px 60px -14px rgba(34,211,238,.38);--dsw-elevation-prominent:0 0 0 1px rgba(34,211,238,.36),0 30px 80px -16px rgba(34,211,238,.5);--dsw-elevation-soft:0 12px 40px -12px rgba(34,211,238,.32);--dsw-elevation-stroke:0 0 0 1px rgba(34,211,238,.24)}\nbody *{--dsw-shadow-lv3:0 0 0 1px rgba(34,211,238,.3),0 24px 60px -20px rgba(34,211,238,.42)!important}\n/*\n * The HoverCard preview variant (changed-file previews and long references) is\n * a reading surface, not glass: it paints the translucent layer-1 background,\n * so its text sits over the aurora. It takes the composer\'s opaque input\n * surface instead. The card carries this inline custom property, which\n * survives the CSS-module hash changes between DSH builds; the previous\n * `_preview_38jqx` selector broke when the hash changed.\n */\ndiv[style*="--dsh-hover-preview-fade"]{background:var(--dsw-specific-input-major)!important}\n/*\n * Settings is a control surface, not scenery. The shared settings panel ships\n * with the translucent layer-2 background, so the drifting aurora and the page\n * behind it read through the form; it takes the composer\'s opaque input\n * surface (the same token the input box uses) in both color schemes. The\n * panel\'s `data-shortcut-modal` marker is its stable hook; the CSS-module\n * class name is hashed.\n */\n[data-shortcut-modal="settings"]{background:var(--dsw-specific-input-major)!important}\n:root,body{--dsw-menu-backdrop-filter:blur(28px) saturate(170%)}\n/*\n * Aurora background, canvas-sprite edition.\n *\n * History: the aurora started as the page-body background animated through\n * `background-position` (full-window raster every frame), then became a\n * fixed layer stack whose small radial gradients animated on the compositor\n * (`src/client/presets/cyber/style.css` at the time). This edition keeps that\n * layer stack, geometry and keyframes verbatim, but paints each gradient\n * into a small `<canvas>` that IS its compositor texture instead of a CSS\n * `image()`: gradients are low-frequency, so a capped backing store scaled\n * up by the compositor is visually identical while textures shrink by\n * 10x-100x (see `src/client/effects/`). The historical literals are kept\n * here as the visual identity record and stay machine-checked:\n *\n *   base  light linear-gradient(155deg,#eef2ff 0%,#e6f8ff 48%,#f7edff 100%)\n *   base  dark  linear-gradient(160deg,#03040b 0%,#070a1c 45%,#0a0d26 100%)\n *   a     light radial-gradient(closest-side,rgba(124,58,237,.55),transparent)\n *   a     dark  radial-gradient(closest-side,rgba(34,211,238,.6),transparent)\n *   b     light radial-gradient(closest-side,rgba(34,211,238,.5),transparent)\n *   b     dark  radial-gradient(closest-side,rgba(168,85,247,.55),transparent)\n *   c     light radial-gradient(closest-side,rgba(236,72,153,.35),transparent)\n *   c     dark  radial-gradient(closest-side,rgba(59,130,246,.5),transparent)\n *   d     light radial-gradient(closest-side,rgba(124,58,237,.14),transparent)\n *   d     dark  radial-gradient(closest-side,rgba(236,72,153,.18),transparent)\n *\n * Gel overlay (`body::after`, now the `.dsg-gel` canvas — a pseudo-element\n * cannot host a canvas; geometry, blend mode and animations are unchanged):\n *\n *   light radial-gradient(900px 700px at 86% -4%,rgba(124,58,237,.22),transparent 58%)\n *   light radial-gradient(800px 600px at 4% 10%,rgba(34,211,238,.2),transparent 60%)\n *   light radial-gradient(900px 700px at 50% 116%,rgba(236,72,153,.14),transparent 62%)\n *   dark  radial-gradient(900px 700px at 86% -4%,rgba(34,211,238,.26),transparent 58%)\n *   dark  radial-gradient(800px 600px at 4% 10%,rgba(168,85,247,.24),transparent 60%)\n *   dark  radial-gradient(900px 700px at 50% 116%,rgba(59,130,246,.2),transparent 62%)\n */\n:root body{background:none!important}\n.dsg-aurora{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}\n.dsg-auroraBase{position:absolute;inset:0;width:100%;height:100%}\n.dsg-auroraLayer{position:absolute;will-change:transform}\n.dsg-aurora-a{left:calc(99.2vw - 580px);top:calc(-14.4vh - 440.8px);width:1160px;height:881.6px;animation:dsg-drift-a calc(26s * var(--dsg-cycle-scale,1)) ease-in-out infinite alternate}\n.dsg-aurora-b{left:calc(-14vw - 522px);top:calc(1.4vh - 406px);width:1044px;height:812px;animation:dsg-drift-b calc(26s * var(--dsg-cycle-scale,1)) ease-in-out infinite alternate}\n.dsg-aurora-c{left:calc(52.6vw - 660px);top:calc(137vh - 492px);width:1320px;height:984px;animation:dsg-drift-c calc(26s * var(--dsg-cycle-scale,1)) ease-in-out infinite alternate}\n.dsg-aurora-d{left:calc(50vw - 448px);top:calc(46vh - 332.8px);width:896px;height:665.6px;animation:dsg-drift-d calc(26s * var(--dsg-cycle-scale,1)) ease-in-out infinite alternate}\nbody[data-ds-dark-theme] .dsg-aurora-d{left:calc(47.4vw - 434px);top:calc(48.6vh - 322.4px);width:868px;height:644.8px}\n.dsg-gel{position:fixed;left:-8%;top:-8%;width:116%;height:116%;pointer-events:none;z-index:2147483001;mix-blend-mode:multiply;animation:dsg-cyber-pulse calc(12s * var(--dsg-cycle-scale,1)) ease-in-out infinite alternate,dsg-cyber-sway calc(28s * var(--dsg-cycle-scale,1)) ease-in-out infinite alternate}\nbody[data-ds-dark-theme] .dsg-gel{mix-blend-mode:screen}\n@keyframes dsg-drift-a{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(-3.9vw,-3vh,0)}100%{transform:translate3d(-1.2vw,-1.2vh,0)}}\n@keyframes dsg-drift-b{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(4.2vw,3vh,0)}100%{transform:translate3d(1.2vw,-1.2vh,0)}}\n@keyframes dsg-drift-c{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(2.4vw,-1.8vh,0)}100%{transform:translate3d(-2.4vw,1.8vh,0)}}\n@keyframes dsg-drift-d{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(-1.5vw,1.2vh,0)}100%{transform:translate3d(1.2vw,-1.2vh,0)}}\n@keyframes dsg-cyber-pulse{0%{opacity:.38}100%{opacity:.72}}\n@keyframes dsg-cyber-sway{0%{transform:translate3d(-1.5%,1%,0) scale(1.03)}100%{transform:translate3d(2.5%,-1.5%,0) scale(1.07)}}\nbody[data-ds-dark-theme] h1,body[data-ds-dark-theme] h2{text-shadow:0 0 26px rgba(34,211,238,.32)}\n::selection{background:rgba(34,211,238,.3)}\n';

  // src/client/presets/pair.js
  var pair = (light, dark) => ({ light, dark });

  // src/client/presets/cyber/tokens.js
  var tokens = {
    "--dsw-alias-bg-base": pair("rgba(250, 249, 255, 0.14)", "rgba(7, 8, 20, 0.12)"),
    "--dsw-alias-bg-layer-1": pair("rgba(255, 255, 255, 0.5)", "rgba(14, 16, 36, 0.34)"),
    "--dsw-alias-bg-layer-2": pair("rgba(244, 241, 255, 0.5)", "rgba(18, 21, 44, 0.38)"),
    "--dsw-alias-bg-layer-3": pair("rgba(235, 230, 255, 0.52)", "rgba(24, 27, 54, 0.42)"),
    "--dsw-alias-bg-overlay": pair("rgba(246, 243, 255, 0.86)", "rgba(12, 14, 32, 0.86)"),
    "--dsw-alias-bg-module-platform": pair("rgba(243, 240, 255, 0.55)", "rgba(12, 14, 32, 0.5)"),
    "--dsw-alias-border-l1": pair("rgba(76, 58, 140, 0.22)", "rgba(120, 220, 255, 0.2)"),
    "--dsw-alias-border-l2": pair("rgba(76, 58, 140, 0.36)", "rgba(120, 220, 255, 0.34)"),
    "--dsw-alias-border-l3": pair("rgba(76, 58, 140, 0.48)", "rgba(120, 220, 255, 0.46)"),
    "--dsw-alias-border-l4": pair("rgba(76, 58, 140, 0.62)", "rgba(120, 220, 255, 0.6)"),
    "--dsw-alias-brand-primary": pair("#7c3aed", "#22d3ee"),
    "--dsw-alias-brand-text": pair("#ffffff", "#04121a"),
    "--dsw-alias-label-primary": pair("#15102e", "#e7f6ff"),
    "--dsw-alias-label-secondary": pair("#4f4876", "#9fb2cf"),
    "--dsw-alias-label-tertiary": pair("#6f6795", "#8ea2bf"),
    "--dsw-alias-label-caption": pair("#857ea8", "#93a9c7"),
    "--dsw-alias-label-primary-foreground": pair("#ffffff", "#04121a"),
    "--dsw-alias-state-business-primary": pair("#7c3aed", "#22d3ee"),
    "--dsw-alias-state-error-primary": pair("#dc2659", "#fb7185"),
    "--dsw-alias-state-idle-primary": pair("#b9b2d8", "#3b4460"),
    "--dsw-alias-state-success-primary": pair("#0f9d6e", "#34d399"),
    "--dsw-alias-state-warn-primary": pair("#d97706", "#fbbf24"),
    "--dsw-specific-sidebar-fill": pair("rgba(243, 240, 255, 0.32)", "rgba(9, 11, 28, 0.26)"),
    "--dsw-alias-interactive-bg-hover": pair("rgba(124, 58, 237, 0.1)", "rgba(120, 220, 255, 0.1)"),
    "--dsw-alias-interactive-bg-active": pair("rgba(124, 58, 237, 0.18)", "rgba(120, 220, 255, 0.17)"),
    "--dsw-alias-interactive-bg-hover-accent": pair("rgba(124, 58, 237, 0.18)", "rgba(34, 211, 238, 0.18)"),
    "--dsw-alias-button-primary-fill": pair("#7c3aed", "#22d3ee"),
    "--dsw-alias-button-primary-hover": pair("#6a2bd6", "#67e8f9"),
    "--dsw-menu-surface-fill": pair("rgba(252, 250, 255, 0.8)", "rgba(13, 15, 34, 0.82)"),
    "--dsw-specific-input-major": pair("#fbf9ff", "#0d1222"),
    "--dsw-alias-button-elevated-fill": pair("rgba(255, 255, 255, 0.56)", "rgba(16, 18, 40, 0.44)"),
    "--dsw-alias-label-primary-inverted": pair("#ffffff", "#04121a"),
    "--dsw-alias-tooltip-bg": pair("#1a1333", "#1c1c33"),
    "--dsw-alias-toast-bg": pair("#1a1333", "#1b1b33"),
    "--dsw-alias-toast-label": pair("#f5f3ff", "#e7f6ff"),
    "--dsw-alias-switch-thumb": pair("#ffffff", "#e7f6ff"),
    "--dsw-alias-markdown-code-block": pair("rgba(240, 236, 255, 0.52)", "rgba(11, 12, 28, 0.42)"),
    "--dsw-alias-markdown-inline-code": pair("rgba(235, 229, 255, 0.6)", "rgba(20, 21, 46, 0.5)"),
    "--dsw-alias-link": pair("#6d28d9", "#67e8f9"),
    "--dsw-alias-scrollbar-bg-l2": pair("rgba(124, 58, 237, 0.24)", "rgba(34, 211, 238, 0.26)"),
    "--dsw-alias-scrollbar-hover-l2": pair("rgba(124, 58, 237, 0.42)", "rgba(34, 211, 238, 0.46)")
  };

  // src/client/presets/cyber/index.js
  var cyber = {
    id: "cyber",
    nameKey: "style.cyber.name",
    descKey: "style.cyber.desc",
    /** Offers a motion-cycle slider on its gallery card. */
    cycle: true,
    tokens,
    structural: style_default
  };

  // src/client/presets/index.js
  var STYLES = [cyber];

  // src/client/selection.js
  function createSelectionStore({ storageKey, nativeId, styles }) {
    let activeId = nativeId;
    const listeners = /* @__PURE__ */ new Set();
    const isKnown = (id) => styles.some((spec) => spec.id === id);
    function emit() {
      for (const listener of [...listeners]) {
        try {
          listener();
        } catch (error) {
          console.error("style-gallery: selection listener crashed", error);
        }
      }
    }
    function getSnapshot() {
      return activeId;
    }
    function subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
    function readSaved() {
      try {
        const saved = localStorage.getItem(storageKey);
        return typeof saved === "string" && isKnown(saved) ? saved : nativeId;
      } catch (error) {
        return nativeId;
      }
    }
    function setActive(id, { persist = true } = {}) {
      activeId = isKnown(id) ? id : nativeId;
      if (!persist) return;
      try {
        localStorage.setItem(storageKey, activeId);
      } catch (error) {
      }
    }
    function clearListeners() {
      listeners.clear();
    }
    return { getSnapshot, subscribe, emit, readSaved, setActive, clearListeners };
  }

  // src/client/useActiveStyle.js
  function createUseActiveStyle(store) {
    return function useActiveStyle() {
      const React = getReact();
      const [id, setId] = React.useState(store.getSnapshot());
      React.useEffect(() => store.subscribe(() => setId(store.getSnapshot())), []);
      return id;
    };
  }

  // src/client/plugin.js
  function createPlugin() {
    return {
      inject: ["slots", "theme", "locale"],
      apply(ctx) {
        const theme = ctx.theme;
        const locale = ctx.locale;
        const translator = locale.bind(NS);
        const selection = createSelectionStore({ storageKey: STORAGE_KEY, nativeId: NATIVE_ID, styles: STYLES });
        const cycle = createCycleStore({
          storageKey: CYCLE_KEY,
          min: CYCLE_MIN,
          max: CYCLE_MAX,
          step: CYCLE_STEP,
          fallback: CYCLE_DEFAULT
        });
        const useActiveStyle = createUseActiveStyle(selection);
        let tokenDispose = null;
        let styleTag = null;
        let aurora = null;
        function mountAurora() {
          if (aurora !== null) return;
          aurora = { stack: mountAuroraStack(), gel: mountGelLayer() };
        }
        function unmountAurora() {
          if (aurora === null) return;
          aurora.gel.dispose();
          aurora.stack.dispose();
          aurora = null;
        }
        function commit(id) {
          const spec = STYLES.find((candidate) => candidate.id === id);
          if (spec === void 0) {
            if (tokenDispose !== null) {
              tokenDispose();
              tokenDispose = null;
            }
          } else {
            tokenDispose = theme.overrideTokens(SOURCE, spec.tokens);
          }
          if (styleTag !== null) {
            styleTag.textContent = page_default + (spec === void 0 ? "" : "\n" + spec.structural);
          }
          if (spec !== void 0 && spec.id === EFFECT_STYLE_ID) mountAurora();
          else unmountAurora();
          selection.setActive(spec === void 0 ? NATIVE_ID : spec.id);
          selection.emit();
        }
        ctx.effect(() => locale.register(NS, DICTIONARIES), "style gallery: dictionaries");
        ctx.effect(() => {
          cycle.set(cycle.readSaved(), { persist: false });
          return () => {
            cycle.clearListeners();
            cycle.clear();
          };
        }, "style gallery: motion cycle");
        ctx.effect(() => {
          const tag = document.createElement("style");
          tag.setAttribute("data-plugin-css", SOURCE);
          tag.textContent = page_default;
          document.head.append(tag);
          styleTag = tag;
          commit(selection.readSaved());
          return () => {
            if (tokenDispose !== null) {
              tokenDispose();
              tokenDispose = null;
            }
            selection.setActive(NATIVE_ID, { persist: false });
            unmountAurora();
            styleTag = null;
            tag.remove();
            selection.clearListeners();
          };
        }, "style gallery: active style layer");
        const GalleryPage = createGalleryPage({
          styles: STYLES,
          nativeId: NATIVE_ID,
          translator,
          useActiveStyle,
          onSelect: commit,
          cycleStore: cycle
        });
        const StyleFx = createStyleFx({ useActiveStyle, effectStyleId: EFFECT_STYLE_ID });
        ctx.slots.inject(
          "sidebar.panellist",
          () => ctx.slots.register(
            {
              name: "sidebar.panellist",
              id: PANEL_ID,
              order: 20,
              label: () => translator("entry.label"),
              locale: NS
            },
            GalleryIcon
          )
        );
        ctx.slots.inject(
          "main",
          () => ctx.slots.register(
            {
              name: "main",
              key: PANEL_ID,
              locale: NS
            },
            GalleryPage
          )
        );
        ctx.slots.inject(
          "shell.overlay",
          () => ctx.slots.register(
            {
              name: "shell.overlay",
              id: "style-gallery-fx",
              order: 0
            },
            StyleFx
          )
        );
      }
    };
  }

  // src/client/index.js
  window.__ModuleLoader__.load({
    id: PACKAGE_ID,
    factory(require2) {
      bindReact(require2);
      return createPlugin();
    }
  });
})();
