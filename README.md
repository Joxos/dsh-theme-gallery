# Style Gallery (`@local/dsh-style-gallery`)

A DeepSeek Harness bundle that adds a **Visual style** entry to the left sidebar
and opens a page where the whole application can be re-skinned.

Two styles, each with a light and a dark palette that follows the host's
color-scheme preference:

| id | 中文 | English | Signature |
| --- | --- | --- | --- |
| `pixel` | 像素街机 | Pixel Arcade | zero corner radius, monospace type, high-contrast arcade palette |
| `cyber` | 极光絮语 | Aurora Whispers | near-transparent glass, opaque composer, drifting aurora, large flowing aurora blobs |

`Use native` (恢复原生) removes the active layer and returns to the shipped
theme untouched.

## Design notes

Both styles intervene beyond color: translucent panels over drifting body
gradients, per-style elevation/glow tokens, texture and overlay layers,
typography and geometry. Visual directions are inspired by:

* `pixel` — 8-bit arcade cabinets and CRT pixel art.
* `cyber` — northern-lights photography, TRON: Legacy glow, Linear/Vercel dark precision.

Aurora Whispers' slow aurora drift, gel sway and pulse, and its always-on FX
overlay (large flowing aurora blobs) are part of that style's identity and run
even when the OS disables animations; pick another style if you need a still
interface. Gradients are rendered by CSS (no assets), and every effect is
removed with the style layer.

## How it works

* **Palette** — the page calls `theme.overrideTokens(source, tokens)`. The
  override layer stores a `{ light, dark }` pair per token, so switching the
  host's light/dark preference keeps working. No theme is registered and the
  user's Appearance choice is never rewritten.
* **Shape and type** — no alias token covers corner radii or the text font, so
  each style appends a small stylesheet (one `<style>` tag owned by the
  plugin's effect) that sets `--dsw-radius-*`, the text font stack, and
  per-style elevation/glow variables.
* **Surface and motion** — Aurora Whispers paints the page body with
  per-scheme gradients, translucent panel tokens, slow drift, and a
  pointer-events-none FX overlay of flowing aurora blobs. Pixel Arcade forces
  zero radii and a monospace stack. Everything is CSS-only, scoped to the
  active style, and removed with that style.
* **Persistence** — the selected id is kept in `localStorage` under
  `dsh.style-gallery.active`. The client half is `immediately: true`, so a page
  reload restores the style before the gallery is opened again.
* **Entry point** — `sidebar.panellist` id `style-gallery` plus the `main`
  panel registered under the same key (the host sidebar owns the button and
  selects the panel).

## Install

From a Harness session with Full access, install the directory through the
Plugin Manager (`install_bundle` with this folder). The Host row only exists so
the bundle is a normal profile entry; all behavior is in `client.js`.

## Files

| File | Purpose |
| --- | --- |
| `index.js` | Host half (empty `apply`), required by the patch row |
| `client.js` | Sidebar entry, page UI, theme layers, stylesheet |
| `cordis.patch.yml` | Inserts the `dsh-style-gallery` row |
| `locale/{zh,en}.json` | Plugin Manager title/description |
| `icon.svg` | Plugin artwork (palette glyph) |
