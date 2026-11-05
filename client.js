/**
 * Browser half of the Style Gallery bundle.
 *
 * Registers one sidebar entry ("Visual style") and its owner main panel, then
 * re-skins the whole application by stacking a `{ light, dark }` theme-token
 * layer over the active theme (the host's own light/dark preference keeps
 * working) plus a small stylesheet for the structural parts no token covers
 * (corner radii and the text font family).
 *
 * The selection is remembered in `localStorage`, so `immediately: true` lets a
 * reload restore the last style before the user opens the page again.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-style-gallery',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Locale namespace owned by this plugin. */
    const NS = 'styleGallery'
    /** One id shared by the sidebar row and the main panel it opens. */
    const PANEL_ID = 'style-gallery'
    /** Theme override source; one layer per source in the theme runtime. */
    const SOURCE = '@local/dsh-style-gallery'
    const STORAGE_KEY = 'dsh.style-gallery.active'
    const NATIVE_ID = 'native'

    /** A theme token override pair: one value for each host color scheme. */
    const pair = (light, dark) => ({ light, dark })

    /**
     * The five styles. `tokens` feed `theme.overrideTokens` (merged into the
     * active theme, so light/dark still follows the host preference) and
     * `structural` carries the radius/font rules the alias tokens do not cover.
     */
    const STYLES = [
      {
        id: 'pixel',
        nameKey: 'style.pixel.name',
        descKey: 'style.pixel.desc',
        tokens: {
          '--dsw-alias-bg-base': pair('#f4f0e3', '#0c0f0b'),
          '--dsw-alias-bg-layer-1': pair('#fffdf6', '#141812'),
          '--dsw-alias-bg-layer-2': pair('#faf5e9', '#1a2018'),
          '--dsw-alias-bg-layer-3': pair('#f2ecdc', '#222a1f'),
          '--dsw-alias-bg-overlay': pair('#ebe3d0', '#1a2018'),
          '--dsw-alias-bg-module-platform': pair('#efe8d7', '#1a2018'),
          '--dsw-alias-border-l1': pair('rgba(36, 31, 23, 0.12)', 'rgba(214, 245, 206, 0.14)'),
          '--dsw-alias-border-l2': pair('rgba(36, 31, 23, 0.22)', 'rgba(214, 245, 206, 0.24)'),
          '--dsw-alias-border-l3': pair('rgba(36, 31, 23, 0.32)', 'rgba(214, 245, 206, 0.34)'),
          '--dsw-alias-border-l4': pair('rgba(36, 31, 23, 0.46)', 'rgba(214, 245, 206, 0.48)'),
          '--dsw-alias-brand-primary': pair('#d81e5b', '#6cf39a'),
          '--dsw-alias-brand-text': pair('#fffdf6', '#06130a'),
          '--dsw-alias-label-primary': pair('#241f17', '#e0f6d9'),
          '--dsw-alias-label-secondary': pair('#5c5346', '#a9c2a0'),
          '--dsw-alias-label-tertiary': pair('#7d7364', '#7f9a78'),
          '--dsw-alias-label-caption': pair('#9c9284', '#61785c'),
          '--dsw-alias-label-primary-foreground': pair('#fff8f0', '#06130a'),
          '--dsw-alias-state-business-primary': pair('#b3174b', '#6cf39a'),
          '--dsw-alias-state-error-primary': pair('#c92a2a', '#ff7b72'),
          '--dsw-alias-state-idle-primary': pair('#b8b0a0', '#465741'),
          '--dsw-alias-state-success-primary': pair('#2f7d32', '#6cf39a'),
          '--dsw-alias-state-warn-primary': pair('#b26a00', '#ffd166'),
          '--dsw-specific-sidebar-fill': pair('#ebe4d2', '#0f130e'),
          '--dsw-alias-interactive-bg-hover': pair('rgba(36, 31, 23, 0.06)', 'rgba(160, 255, 190, 0.09)'),
          '--dsw-alias-interactive-bg-active': pair('rgba(36, 31, 23, 0.12)', 'rgba(160, 255, 190, 0.15)'),
          '--dsw-alias-interactive-bg-hover-accent': pair('rgba(216, 30, 91, 0.1)', 'rgba(108, 243, 154, 0.14)'),
          '--dsw-alias-button-primary-fill': pair('#d81e5b', '#6cf39a'),
          '--dsw-alias-button-primary-hover': pair('#b3174b', '#90f8b4'),
          '--dsw-menu-surface-fill': pair('rgba(255, 253, 246, 0.95)', 'rgba(20, 24, 18, 0.95)'),
          '--dsw-specific-input-major': pair('#fffdf6', '#141812'),
          '--dsw-alias-button-elevated-fill': pair('#fffdf6', '#141812'),
          '--dsw-alias-label-primary-inverted': pair('#fff8f0', '#06130a'),
          '--dsw-alias-tooltip-bg': pair('#241f17', '#1f2a1b'),
          '--dsw-alias-toast-bg': pair('#241f17', '#24301f'),
          '--dsw-alias-toast-label': pair('#fffdf6', '#e0f6d9'),
          '--dsw-alias-switch-thumb': pair('#fffdf6', '#e0f6d9'),
          '--dsw-alias-markdown-code-block': pair('#efe8d7', '#10140e'),
          '--dsw-alias-markdown-inline-code': pair('#e9e1cf', '#182016'),
          '--dsw-alias-link': pair('#b3174b', '#8ef7b1'),
        },
        structural: [
          ':root{--dsw-radius-xs:0px;--dsw-radius-sm:0px;--dsw-radius-md:0px;--dsw-radius-lg:0px;--dsw-radius-xl:0px;--dsw-radius-panel:0px}',
          ':root,body{--dsw-font-family:"Courier New","Lucida Console",ui-monospace,monospace!important;--ds-font-family-code:"SF Mono",Consolas,"Courier New",monospace!important}',
        ].join('\n'),
      },
      {
        id: 'cyber',
        nameKey: 'style.cyber.name',
        descKey: 'style.cyber.desc',
        tokens: {
          '--dsw-alias-bg-base': pair('rgba(250, 249, 255, 0.14)', 'rgba(7, 8, 20, 0.12)'),
          '--dsw-alias-bg-layer-1': pair('rgba(255, 255, 255, 0.5)', 'rgba(14, 16, 36, 0.34)'),
          '--dsw-alias-bg-layer-2': pair('rgba(244, 241, 255, 0.5)', 'rgba(18, 21, 44, 0.38)'),
          '--dsw-alias-bg-layer-3': pair('rgba(235, 230, 255, 0.52)', 'rgba(24, 27, 54, 0.42)'),
          '--dsw-alias-bg-overlay': pair('rgba(246, 243, 255, 0.86)', 'rgba(12, 14, 32, 0.86)'),
          '--dsw-alias-bg-module-platform': pair('rgba(243, 240, 255, 0.55)', 'rgba(12, 14, 32, 0.5)'),
          '--dsw-alias-border-l1': pair('rgba(76, 58, 140, 0.22)', 'rgba(120, 220, 255, 0.2)'),
          '--dsw-alias-border-l2': pair('rgba(76, 58, 140, 0.36)', 'rgba(120, 220, 255, 0.34)'),
          '--dsw-alias-border-l3': pair('rgba(76, 58, 140, 0.48)', 'rgba(120, 220, 255, 0.46)'),
          '--dsw-alias-border-l4': pair('rgba(76, 58, 140, 0.62)', 'rgba(120, 220, 255, 0.6)'),
          '--dsw-alias-brand-primary': pair('#7c3aed', '#22d3ee'),
          '--dsw-alias-brand-text': pair('#ffffff', '#04121a'),
          '--dsw-alias-label-primary': pair('#15102e', '#e7f6ff'),
          '--dsw-alias-label-secondary': pair('#4f4876', '#9fb2cf'),
          '--dsw-alias-label-tertiary': pair('#6f6795', '#8ea2bf'),
          '--dsw-alias-label-caption': pair('#857ea8', '#93a9c7'),
          '--dsw-alias-label-primary-foreground': pair('#ffffff', '#04121a'),
          '--dsw-alias-state-business-primary': pair('#7c3aed', '#22d3ee'),
          '--dsw-alias-state-error-primary': pair('#dc2659', '#fb7185'),
          '--dsw-alias-state-idle-primary': pair('#b9b2d8', '#3b4460'),
          '--dsw-alias-state-success-primary': pair('#0f9d6e', '#34d399'),
          '--dsw-alias-state-warn-primary': pair('#d97706', '#fbbf24'),
          '--dsw-specific-sidebar-fill': pair('rgba(243, 240, 255, 0.32)', 'rgba(9, 11, 28, 0.26)'),
          '--dsw-alias-interactive-bg-hover': pair('rgba(124, 58, 237, 0.1)', 'rgba(120, 220, 255, 0.1)'),
          '--dsw-alias-interactive-bg-active': pair('rgba(124, 58, 237, 0.18)', 'rgba(120, 220, 255, 0.17)'),
          '--dsw-alias-interactive-bg-hover-accent': pair('rgba(124, 58, 237, 0.18)', 'rgba(34, 211, 238, 0.18)'),
          '--dsw-alias-button-primary-fill': pair('#7c3aed', '#22d3ee'),
          '--dsw-alias-button-primary-hover': pair('#6a2bd6', '#67e8f9'),
          '--dsw-menu-surface-fill': pair('rgba(252, 250, 255, 0.8)', 'rgba(13, 15, 34, 0.82)'),
          '--dsw-specific-input-major': pair('#fbf9ff', '#0d1222'),
          '--dsw-alias-button-elevated-fill': pair('rgba(255, 255, 255, 0.56)', 'rgba(16, 18, 40, 0.44)'),
          '--dsw-alias-label-primary-inverted': pair('#ffffff', '#04121a'),
          '--dsw-alias-tooltip-bg': pair('#1a1333', '#1c1c33'),
          '--dsw-alias-toast-bg': pair('#1a1333', '#1b1b33'),
          '--dsw-alias-toast-label': pair('#f5f3ff', '#e7f6ff'),
          '--dsw-alias-switch-thumb': pair('#ffffff', '#e7f6ff'),
          '--dsw-alias-markdown-code-block': pair('rgba(240, 236, 255, 0.52)', 'rgba(11, 12, 28, 0.42)'),
          '--dsw-alias-markdown-inline-code': pair('rgba(235, 229, 255, 0.6)', 'rgba(20, 21, 46, 0.5)'),
          '--dsw-alias-link': pair('#6d28d9', '#67e8f9'),
          '--dsw-alias-scrollbar-bg-l2': pair('rgba(124, 58, 237, 0.24)', 'rgba(34, 211, 238, 0.26)'),
          '--dsw-alias-scrollbar-hover-l2': pair('rgba(124, 58, 237, 0.42)', 'rgba(34, 211, 238, 0.46)'),
        },
        structural: [
          ':root{--dsw-radius-xs:10px;--dsw-radius-sm:14px;--dsw-radius-md:16px;--dsw-radius-lg:20px;--dsw-radius-xl:24px;--dsw-radius-panel:30px;--dsw-corner-shape:superellipse(1.8)}',
          ':root,body{--dsw-font-family:"Bahnschrift","DIN Alternate","Segoe UI Variable Display","Segoe UI",-apple-system,BlinkMacSystemFont,sans-serif!important}',
          ':root,body,body *{--dsw-elevation-panel:0 0 0 1px rgba(34,211,238,.28),0 20px 60px -14px rgba(34,211,238,.38);--dsw-elevation-prominent:0 0 0 1px rgba(34,211,238,.36),0 30px 80px -16px rgba(34,211,238,.5);--dsw-elevation-soft:0 12px 40px -12px rgba(34,211,238,.32);--dsw-elevation-stroke:0 0 0 1px rgba(34,211,238,.24)}',
          'body *{--dsw-shadow-lv3:0 0 0 1px rgba(34,211,238,.3),0 24px 60px -20px rgba(34,211,238,.42)!important}',
          '[class*="_card_38jqx"]{--dsw-hovercard-bg:#fbf9ff!important}',
          'body[data-ds-dark-theme] [class*="_card_38jqx"]{--dsw-hovercard-bg:#0d1222!important}',
          '[class*="_preview_38jqx"]{background:var(--dsw-specific-input-major)!important}',
          ':root,body{--dsw-menu-backdrop-filter:blur(28px) saturate(170%)}',
          ':root body{background-image:radial-gradient(1000px 760px at 86% -6%,rgba(124,58,237,.55),transparent 58%),radial-gradient(900px 700px at 4% 8%,rgba(34,211,238,.5),transparent 58%),radial-gradient(1100px 820px at 52% 116%,rgba(236,72,153,.35),transparent 60%),radial-gradient(700px 520px at 50% 46%,rgba(124,58,237,.14),transparent 64%),linear-gradient(155deg,#eef2ff 0%,#e6f8ff 48%,#f7edff 100%);background-size:130% 130%,130% 130%,130% 130%,130% 130%,160% 160%;background-position:42% 22%,64% 30%,50% 46%,50% 46%,50% 50%;background-repeat:no-repeat;background-attachment:fixed;animation:dsg-cyber-drift 26s ease-in-out infinite alternate}',
          'body[data-ds-dark-theme]{background-image:radial-gradient(1000px 760px at 86% -6%,rgba(34,211,238,.6),transparent 58%),radial-gradient(900px 700px at 4% 8%,rgba(168,85,247,.55),transparent 58%),radial-gradient(1100px 820px at 52% 116%,rgba(59,130,246,.5),transparent 60%),radial-gradient(700px 520px at 48% 48%,rgba(236,72,153,.18),transparent 62%),linear-gradient(160deg,#03040b 0%,#070a1c 45%,#0a0d26 100%);background-size:130% 130%,130% 130%,130% 130%,130% 130%,160% 160%;background-position:42% 22%,64% 30%,50% 46%,50% 46%,50% 50%;background-repeat:no-repeat;background-attachment:fixed;animation:dsg-cyber-drift 26s ease-in-out infinite alternate}',
          '@keyframes dsg-cyber-drift{0%{background-position:42% 22%,64% 30%,50% 46%,50% 46%,50% 50%}50%{background-position:55% 32%,50% 20%,42% 52%,55% 42%,50% 50%}100%{background-position:46% 26%,60% 34%,58% 40%,46% 50%,50% 50%}}',
          'body::after{content:"";position:fixed;inset:-8%;pointer-events:none;z-index:2147483001;mix-blend-mode:multiply;background-image:radial-gradient(900px 700px at 86% -4%,rgba(124,58,237,.22),transparent 58%),radial-gradient(800px 600px at 4% 10%,rgba(34,211,238,.2),transparent 60%),radial-gradient(900px 700px at 50% 116%,rgba(236,72,153,.14),transparent 62%);background-repeat:no-repeat;animation:dsg-cyber-pulse 12s ease-in-out infinite alternate,dsg-cyber-sway 28s ease-in-out infinite alternate}',
          'body[data-ds-dark-theme]::after{content:"";position:fixed;inset:-8%;pointer-events:none;z-index:2147483001;mix-blend-mode:screen;background-image:radial-gradient(900px 700px at 86% -4%,rgba(34,211,238,.26),transparent 58%),radial-gradient(800px 600px at 4% 10%,rgba(168,85,247,.24),transparent 60%),radial-gradient(900px 700px at 50% 116%,rgba(59,130,246,.2),transparent 62%);background-repeat:no-repeat;animation:dsg-cyber-pulse 12s ease-in-out infinite alternate,dsg-cyber-sway 28s ease-in-out infinite alternate}',
          '@keyframes dsg-cyber-pulse{0%{opacity:.38}100%{opacity:.72}}',
          '@keyframes dsg-cyber-sway{0%{transform:translate3d(-1.5%,1%,0) scale(1.03)}100%{transform:translate3d(2.5%,-1.5%,0) scale(1.07)}}',
          'body[data-ds-dark-theme] h1,body[data-ds-dark-theme] h2{text-shadow:0 0 26px rgba(34,211,238,.32)}',
          '::selection{background:rgba(34,211,238,.3)}',

        ].join('\n'),
      },
    ]

    /** Page chrome and card previews; structural rules are appended per style. */
    const BASE_CSS = `
.dsg-page{box-sizing:border-box;height:100%;overflow:auto;display:flex;flex-direction:column;align-items:center;gap:24px;padding:0 clamp(24px,4vw,48px) 48px;color:var(--dsw-alias-label-primary)}
.dsg-page>*{width:100%;max-width:960px}
.dsg-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-top:28px}
[data-platform="darwin"] .dsg-head{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.dsg-headText{display:flex;flex-direction:column;gap:4px;min-width:0}
.dsg-title{margin:0;font-size:20px;font-weight:500;line-height:28px}
.dsg-intro{margin:0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.dsg-actions{display:flex;align-items:center;gap:10px;flex:none}
.dsg-current{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;white-space:nowrap}
.dsg-currentDot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-brand-primary)}
.dsg-reset{appearance:none;font:inherit;font-size:13px;line-height:20px;padding:5px 12px;border-radius:var(--dsw-radius-sm);border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer}
.dsg-reset:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dsg-reset:disabled{color:var(--dsw-alias-label-caption);cursor:default}
.dsg-reset:focus-visible,.dsg-card:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.dsg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(248px,1fr));gap:16px}
.dsg-card{appearance:none;font:inherit;text-align:left;display:flex;flex-direction:column;padding:0;overflow:hidden;cursor:pointer;color:inherit;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);transition:border-color .15s ease,box-shadow .15s ease}
.dsg-card:hover{border-color:var(--dsw-alias-border-l4);box-shadow:var(--dsw-elevation-soft,0 2px 8px rgba(0,0,0,.08))}
.dsg-cardOn,.dsg-cardOn:hover{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary)}
.dsg-pvw{--pv-bg:#f4f0e3;--pv-surface:#fffdf6;--pv-sidebar:#ebe4d2;--pv-ink:#241f17;--pv-line:rgba(36,31,23,.22);--pv-brand:#d81e5b;--pv-border:rgba(36,31,23,.24);--pv-radius:var(--dsw-radius-xs);--pv-font:var(--dsw-font-family);display:flex;gap:8px;box-sizing:border-box;height:108px;padding:10px;background:var(--pv-bg);border-bottom:1px solid var(--pv-border)}
.dsg-pvwSide{width:33%;flex:none;box-sizing:border-box;display:flex;flex-direction:column;gap:4px;padding:6px;border:1px solid var(--pv-border);border-radius:var(--pv-radius);background:var(--pv-sidebar)}
.dsg-pvwDot{width:9px;height:9px;margin-bottom:1px;border-radius:var(--pv-radius);background:var(--pv-brand)}
.dsg-pvwNav{height:5px;border-radius:var(--pv-radius);background:var(--pv-line)}
.dsg-pvwNavOn{width:86%;background:var(--pv-brand)}
.dsg-pvwNavShort{width:58%}
.dsg-pvwMain{flex:1;min-width:0;box-sizing:border-box;display:flex;flex-direction:column;gap:5px;padding:7px;border:1px solid var(--pv-border);border-radius:var(--pv-radius);background:var(--pv-surface)}
.dsg-pvwHead{display:flex;align-items:center;justify-content:space-between;gap:6px}
.dsg-pvwAa{font-family:var(--pv-font);font-size:14px;font-weight:600;line-height:16px;letter-spacing:.01em;color:var(--pv-ink)}
.dsg-pvwAccent{width:16px;height:6px;border-radius:var(--pv-radius);background:var(--pv-brand)}
.dsg-pvwLine{height:5px;border-radius:var(--pv-radius);background:var(--pv-line)}
.dsg-pvwLineWide{width:88%}
.dsg-pvwLineMid{width:60%}
.dsg-pvwCta{margin-top:auto;width:52%;height:14px;border-radius:var(--pv-radius);background:var(--pv-brand)}
.dsg-pvw[data-style="pixel"]{--pv-bg:#f4f0e3;--pv-surface:#fffdf6;--pv-sidebar:#ebe4d2;--pv-ink:#241f17;--pv-line:rgba(36,31,23,.22);--pv-brand:#d81e5b;--pv-border:rgba(36,31,23,.24);--pv-radius:0px;--pv-font:"Courier New","Lucida Console",ui-monospace,monospace}
body[data-ds-dark-theme] .dsg-pvw[data-style="pixel"]{--pv-bg:#0c0f0b;--pv-surface:#141812;--pv-sidebar:#0f130e;--pv-ink:#e0f6d9;--pv-line:rgba(224,246,217,.2);--pv-brand:#6cf39a;--pv-border:rgba(224,246,217,.26)}
.dsg-pvw[data-style="cyber"]{--pv-bg:radial-gradient(120% 150% at 82% -8%,#e4dbff 0%,#f2efff 48%,#eaf6ff 100%);--pv-surface:rgba(255,255,255,.78);--pv-sidebar:rgba(243,240,255,.72);--pv-ink:#15102e;--pv-line:rgba(76,58,140,.22);--pv-brand:#7c3aed;--pv-border:rgba(76,58,140,.24);--pv-radius:16px;--pv-font:"Bahnschrift","DIN Alternate","Segoe UI",sans-serif}
body[data-ds-dark-theme] .dsg-pvw[data-style="cyber"]{--pv-bg:radial-gradient(120% 150% at 82% -10%,#0f3d4d 0%,#0a0d1f 52%,#070912 100%);--pv-surface:rgba(16,18,40,.68);--pv-sidebar:rgba(11,13,32,.72);--pv-ink:#e7f6ff;--pv-line:rgba(120,220,255,.22);--pv-brand:#22d3ee;--pv-border:rgba(120,220,255,.28)}
.dsg-cardBody{display:flex;flex-direction:column;gap:2px;padding:12px 14px 14px}
.dsg-cardHead{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dsg-cardName{font-size:14px;font-weight:500;line-height:22px;color:var(--dsw-alias-label-primary)}
.dsg-cardDesc{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.dsg-chip{flex:none;display:inline-flex;align-items:center;gap:5px;padding:1px 8px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover-accent);color:var(--dsw-alias-brand-primary);font-size:11px;font-weight:500;line-height:17px}
.dsg-chipDot{width:5px;height:5px;border-radius:50%;background:currentColor}
.dsg-foot{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.dsg-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.dsg-fx{position:fixed;inset:0;pointer-events:none;overflow:hidden;-webkit-mask-image:linear-gradient(to bottom,#000 0%,#000 68%,transparent 94%);mask-image:linear-gradient(to bottom,#000 0%,#000 68%,transparent 94%)}
.dsg-fxBlob{position:absolute;border-radius:50%;opacity:.55;mix-blend-mode:screen;will-change:transform}
.dsg-fxBlobA{width:80vmax;height:80vmax;left:-40vmax;top:-42vmax;background:radial-gradient(circle at 42% 42%,rgba(168,85,247,.7),rgba(59,130,246,.2) 46%,transparent 68%);animation:dsg-fx-a 11s ease-in-out infinite alternate}
.dsg-fxBlobB{width:70vmax;height:70vmax;right:-36vmax;top:-28vmax;background:radial-gradient(circle at 58% 42%,rgba(34,211,238,.7),rgba(59,130,246,.22) 46%,transparent 68%);animation:dsg-fx-b 14s ease-in-out infinite alternate}
.dsg-fxBlobC{width:86vmax;height:86vmax;left:-12vmax;bottom:-52vmax;background:radial-gradient(circle at 50% 50%,rgba(236,72,153,.6),rgba(124,58,237,.22) 48%,transparent 70%);animation:dsg-fx-c 17s ease-in-out infinite alternate}
.dsg-fxBlobD{width:62vmax;height:62vmax;left:34vmax;top:22vmax;background:radial-gradient(circle at 50% 50%,rgba(59,130,246,.55),rgba(34,211,238,.2) 44%,transparent 68%);animation:dsg-fx-d 13s ease-in-out infinite alternate}
@keyframes dsg-fx-a{0%{transform:translate3d(0,0,0) scale(1)}100%{transform:translate3d(34vmax,24vmax,0) scale(1.24)}}
@keyframes dsg-fx-b{0%{transform:translate3d(0,0,0) scale(1.02)}100%{transform:translate3d(-30vmax,26vmax,0) scale(1.2) rotate(14deg)}}
@keyframes dsg-fx-c{0%{transform:translate3d(0,0,0) scale(1)}100%{transform:translate3d(26vmax,-30vmax,0) scale(1.22)}}
@keyframes dsg-fx-d{0%{transform:translate3d(0,0,0) scale(1.1) rotate(0)}100%{transform:translate3d(-26vmax,22vmax,0) scale(1.28) rotate(-12deg)}}
body:not([data-ds-dark-theme]) .dsg-fxBlob{mix-blend-mode:multiply;opacity:.2}
`

    const DICT_ZH = {
      'entry.label': '视觉风格',
      'page.title': '视觉风格',
      'page.intro': '为整个应用选择一种外观。风格立即生效，并跟随你的浅色 / 深色模式。',
      'page.reset': '恢复原生',
      'page.native': '原生外观',
      'page.gridLabel': '可选风格',
      'page.footnote': '风格会应用到所有面板、对话框和输入区；选择只保存在这台设备的浏览器中。',
      'chip.active': '使用中',
      'a11y.applied': '当前风格：{name}',
      'style.pixel.name': '像素街机',
      'style.pixel.desc': '零圆角、等宽字体与高对比配色，像一台 8 位街机。',
      'style.cyber.name': '极光絮语',
      'style.cyber.desc': '极光在夜色与玻璃之间缓慢流动，安静、深邃，像一场没有声音的极光。',
    }

    const DICT_EN = {
      'entry.label': 'Visual style',
      'page.title': 'Visual style',
      'page.intro': 'Pick a look for the whole app. It applies right away and follows your light or dark color scheme.',
      'page.reset': 'Use native',
      'page.native': 'Native look',
      'page.gridLabel': 'Available styles',
      'page.footnote': 'Styles cover every panel, dialog and the composer. The choice is saved in this browser only.',
      'chip.active': 'Active',
      'a11y.applied': 'Current style: {name}',
      'style.pixel.name': 'Pixel Arcade',
      'style.pixel.desc': 'Zero radius, monospace type and high-contrast color, like an 8-bit arcade.',
      'style.cyber.name': 'Aurora Whispers',
      'style.cyber.desc': 'Aurora light drifts through glass and night — quiet, deep, and always in motion.',
    }

    return {
      inject: ['slots', 'theme', 'locale'],
      apply(ctx) {
        const theme = ctx.theme
        const locale = ctx.locale
        const translator = locale.bind(NS)

        /** Shared selection state between the page and the boot-time restore. */
        const store = {
          activeId: NATIVE_ID,
          tag: null,
          tokenDispose: null,
          listeners: new Set(),
          getSnapshot() {
            return this.activeId
          },
          subscribe(listener) {
            this.listeners.add(listener)
            return () => {
              this.listeners.delete(listener)
            }
          },
          emit() {
            for (const listener of [...this.listeners]) {
              try {
                listener()
              } catch (error) {
                console.error('style-gallery: selection listener crashed', error)
              }
            }
          },
        }

        ctx.effect(() => locale.register(NS, { zh: DICT_ZH, en: DICT_EN }), 'style gallery: dictionaries')

        /** Color token layer + structural rules for one style id ('native' clears both). */
        function commit(id) {
          const spec = STYLES.find((candidate) => candidate.id === id)
          if (spec === undefined) {
            if (store.tokenDispose !== null) {
              store.tokenDispose()
              store.tokenDispose = null
            }
            store.activeId = NATIVE_ID
          } else {
            store.tokenDispose = theme.overrideTokens(SOURCE, spec.tokens)
            store.activeId = spec.id
          }
          if (store.tag !== null) {
            store.tag.textContent = BASE_CSS + (spec === undefined ? '' : '\n' + spec.structural)
          }
          try {
            localStorage.setItem(STORAGE_KEY, store.activeId)
          } catch (error) {
            /* Private mode or a blocked origin: the style still applies for this run. */
          }
          store.emit()
        }

        function readSaved() {
          try {
            const saved = localStorage.getItem(STORAGE_KEY)
            return typeof saved === 'string' && STYLES.some((spec) => spec.id === saved) ? saved : NATIVE_ID
          } catch (error) {
            return NATIVE_ID
          }
        }

        ctx.effect(() => {
          const tag = document.createElement('style')
          tag.setAttribute('data-plugin-css', SOURCE)
          tag.textContent = BASE_CSS
          document.head.append(tag)
          store.tag = tag
          commit(readSaved())
          return () => {
            if (store.tokenDispose !== null) {
              store.tokenDispose()
              store.tokenDispose = null
            }
            store.activeId = NATIVE_ID
            store.tag = null
            tag.remove()
            store.listeners.clear()
          }
        }, 'style gallery: active style layer')

        function useActiveStyle() {
          const [id, setId] = React.useState(store.getSnapshot())
          React.useEffect(() => store.subscribe(() => setId(store.getSnapshot())), [])
          return id
        }

        function GalleryIcon(props) {
          const size = props !== null && props !== undefined && typeof props.size === 'number' ? props.size : 18
          return h(
            'svg',
            {
              width: size,
              height: size,
              viewBox: '0 0 20 20',
              fill: 'none',
              'aria-hidden': 'true',
              focusable: 'false',
              style: { display: 'block' },
            },
            h('path', {
              d: 'M10 2.7a7.3 7.3 0 1 0 0 14.6c1.14 0 1.83-.83 1.83-1.86 0-1.34 1.06-1.98 2.42-1.98h.99A2.16 2.16 0 0 0 17.4 11.3 7.6 7.6 0 0 0 10 2.7Z',
              stroke: 'currentColor',
              strokeWidth: 1.4,
              strokeLinejoin: 'round',
            }),
            h('circle', { cx: 6.7, cy: 8.6, r: 1.15, fill: 'currentColor' }),
            h('circle', { cx: 9.8, cy: 5.9, r: 1.15, fill: 'currentColor' }),
            h('circle', { cx: 13.1, cy: 7.4, r: 1.15, fill: 'currentColor' }),
          )
        }

        function GalleryPreview(props) {
          return h(
            'span',
            { className: 'dsg-pvw', 'data-style': props.styleId, 'aria-hidden': 'true' },
            h(
              'span',
              { className: 'dsg-pvwSide' },
              h('span', { className: 'dsg-pvwDot' }),
              h('span', { className: 'dsg-pvwNav dsg-pvwNavOn' }),
              h('span', { className: 'dsg-pvwNav' }),
              h('span', { className: 'dsg-pvwNav dsg-pvwNavShort' }),
            ),
            h(
              'span',
              { className: 'dsg-pvwMain' },
              h(
                'span',
                { className: 'dsg-pvwHead' },
                h('span', { className: 'dsg-pvwAa' }, 'Aa'),
                h('span', { className: 'dsg-pvwAccent' }),
              ),
              h('span', { className: 'dsg-pvwLine dsg-pvwLineWide' }),
              h('span', { className: 'dsg-pvwLine' }),
              h('span', { className: 'dsg-pvwLine dsg-pvwLineMid' }),
              h('span', { className: 'dsg-pvwCta' }),
            ),
          )
        }

        function GalleryPage(props) {
          const t = props !== null && props !== undefined && typeof props.t === 'function' ? props.t : translator
          const activeId = useActiveStyle()
          const activeStyle = STYLES.find((spec) => spec.id === activeId)
          const activeName = activeStyle === undefined ? t('page.native') : t(activeStyle.nameKey)
          return h(
            'div',
            { className: 'dsg-page' },
            h(
              'div',
              { className: 'dsg-head' },
              h(
                'div',
                { className: 'dsg-headText' },
                h('h1', { className: 'dsg-title' }, t('page.title')),
                h('p', { className: 'dsg-intro' }, t('page.intro')),
              ),
              h(
                'div',
                { className: 'dsg-actions' },
                h(
                  'span',
                  { className: 'dsg-current' },
                  h('span', { className: 'dsg-currentDot', 'aria-hidden': 'true' }),
                  activeName,
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsg-reset',
                    disabled: activeId === NATIVE_ID,
                    onClick: () => {
                      commit(NATIVE_ID)
                    },
                  },
                  t('page.reset'),
                ),
              ),
            ),
            h(
              'div',
              { className: 'dsg-grid', role: 'group', 'aria-label': t('page.gridLabel') },
              STYLES.map((spec) => {
                const active = spec.id === activeId
                return h(
                  'button',
                  {
                    key: spec.id,
                    type: 'button',
                    className: active ? 'dsg-card dsg-cardOn' : 'dsg-card',
                    'aria-pressed': active,
                    onClick: () => {
                      commit(spec.id)
                    },
                  },
                  h(GalleryPreview, { styleId: spec.id }),
                  h(
                    'span',
                    { className: 'dsg-cardBody' },
                    h(
                      'span',
                      { className: 'dsg-cardHead' },
                      h('span', { className: 'dsg-cardName' }, t(spec.nameKey)),
                      active
                        ? h(
                            'span',
                            { className: 'dsg-chip' },
                            h('span', { className: 'dsg-chipDot', 'aria-hidden': 'true' }),
                            t('chip.active'),
                          )
                        : null,
                    ),
                    h('span', { className: 'dsg-cardDesc' }, t(spec.descKey)),
                  ),
                )
              }),
            ),
            h('p', { className: 'dsg-foot' }, t('page.footnote')),
            h('span', { className: 'dsg-sr', 'aria-live': 'polite' }, t('a11y.applied', { name: activeName })),
          )
        }

        function StyleFx() {
          const activeId = useActiveStyle()
          if (activeId === 'cyber') {
            return h(
              'div',
              { className: 'dsg-fx', 'aria-hidden': 'true' },
              h('div', { className: 'dsg-fxBlob dsg-fxBlobA' }),
              h('div', { className: 'dsg-fxBlob dsg-fxBlobB' }),
              h('div', { className: 'dsg-fxBlob dsg-fxBlobC' }),
              h('div', { className: 'dsg-fxBlob dsg-fxBlobD' }),
            )
          }
          return null
        }

        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: PANEL_ID,
              order: 20,
              label: () => translator('entry.label'),
              locale: NS,
            },
            GalleryIcon,
          ),
        )

        ctx.slots.inject('main', () =>
          ctx.slots.register(
            {
              name: 'main',
              key: PANEL_ID,
              locale: NS,
            },
            GalleryPage,
          ),
        )

        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            {
              name: 'shell.overlay',
              id: 'style-gallery-fx',
              order: 0,
            },
            StyleFx,
          ),
        )      },
    }
  },
})



