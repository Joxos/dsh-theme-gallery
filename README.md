# DSH Theme Gallery (`@joxos/dsh-theme-gallery`)

A DeepSeek Harness bundle that adds a **Visual style** entry to the left sidebar
and opens a page where the whole application can be re-skinned with
**Aurora Whispers** — including a motion-cycle slider that makes every ambient
animation slower or faster.

| id | 中文 | English | Signature |
| --- | --- | --- | --- |
| `cyber` | 极光絮语 | Aurora Whispers | near-transparent glass, opaque composer, settings panel and hover previews, drifting aurora, large flowing aurora blobs, adjustable motion cycle |

`Use native` (恢复原生) removes the active layer and returns to the shipped
theme untouched.

## Design notes

The style intervenes beyond color: translucent panels over drifting body
gradients, per-style elevation/glow tokens, texture and overlay layers,
typography and geometry. Visual direction is inspired by northern-lights photography, TRON: Legacy glow
and Linear/Vercel dark precision.

Aurora Whispers' slow aurora drift, gel sway and pulse, and its always-on FX
overlay (large flowing aurora blobs) are part of that style's identity and run
even when the OS disables animations; pick another style if you need a still
interface. Gradients are baked into small canvases at load (no image assets),
and every effect is removed with the style layer.

## Performance

The ambient renderer is a canvas-sprite pipeline, validated in a real browser
by `bench/` (`node bench`):

* Every ambient gradient — base, four drift layers, gel, four FX blobs — is
  baked once into a capped backing store that **is** its compositor texture,
  stretched to its CSS box; geometry and motion stay in the original CSS
  keyframes, so animation remains compositor-driven at display refresh with
  no per-frame main-thread work.
* Ambient textures drop from ~240 MB to **~0.1 MB** on a 2560x1440 @1.5
  desktop (and from ~900 MB to the same fraction on 4K @2x — where the
  historical CSS stack no longer renders at all), at pixel fidelity: golden
  frames diffed against the historical CSS rendering stay at max channel
  delta <= 6 with 0% of pixels beyond it. The backing caps are gated tier by
  tier; the next tier down starts to slip (see
  `docs/aurora-render-perf-results.md`).
* The bake is premultiplied-exact (stop expansion compensates Canvas2D's
  straight interpolation), and the gradient literals that define the visual
  identity live on in the stylesheets and stay machine-checked against the
  specs in `src/client/effects/gradients.js`.
* Only the gel (absolute px radii) re-bakes on window resize; colour-scheme
  switches re-bake everything via a `MutationObserver` on
  `body[data-ds-dark-theme]`.

Reports land in `bench/out/report.md`; see `bench/README.md` for the metrics
and the effect-preservation gate.

## How it works

* **Palette** — the page calls `theme.overrideTokens(source, tokens)`. The
  override layer stores a `{ light, dark }` pair per token, so switching the
  host's light/dark preference keeps working. No theme is registered and the
  user's Appearance choice is never rewritten.
* **Shape and type** — no alias token covers corner radii or the text font, so
  each style appends a small stylesheet (one `<style>` tag owned by the
  plugin's effect) that sets `--dsw-radius-*`, the text font stack, and
  per-style elevation/glow variables.
* **Surface and motion** — Aurora Whispers paints a fixed aurora stack under the
  page body: a static gradient base plus four small gradient layers, each
  drifted by its own compositor transform. Every gradient is baked once into a
  small `<canvas>` that *is* its compositor texture (capped backing store,
  stretched to its CSS box), so the visuals are the historical CSS rasters
  while ambient textures stay tiny (see **Performance**). Translucent panel
  tokens, slow drift and a pointer-events-none FX overlay of flowing aurora
  blobs complete the surface. Settings is a control surface rather than
  scenery: the shared settings panel takes the composer's opaque input surface
  (`--dsw-specific-input-major`) instead of the translucent layer token, so
  the aurora never reads through the form. Hover previews (changed files and
  long references) take the same surface, so their text never sits over the
  aurora. The gallery card carries a motion-cycle slider that scales every
  ambient animation duration (`--dsg-cycle-scale`, saved in `localStorage`), so
  the drift can be slowed down or sped up to taste. The style is CSS-driven for
  geometry and motion, scoped to the active style, and removed with that style.
* **Persistence** — the selected id is kept in `localStorage` under
  `dsh.style-gallery.active`. The client half is `immediately: true`, so a page
  reload restores the style before the gallery is opened again.
* **Entry point** — `sidebar.panellist` id `style-gallery` plus the `main`
  panel registered under the same key (the host sidebar owns the button and
  selects the panel).
* **One browser artifact** — the DSH module loader serves each plugin as a
  self-contained bundle and cannot follow relative imports from `client.js`.
  The readable sources therefore live in `src/client`, and `esbuild` emits the
  single `client.js` the Host serves. The generated artifact is committed so a
  checkout stays installable without a build step.

## Development

Requirements: Node.js 18+ and pnpm.

```bash
pnpm install
pnpm build   # src/client -> client.js
pnpm check   # manifest, patch name, locale, icon, built artifact
pnpm test    # VM smoke test: slots, restore, token layer, disposal
pnpm bench   # ambient render benchmark + effect-fidelity gate (bench/out)
pnpm release <version>  # bump, rebuild, run every check, commit; prints the push + release commands
pnpm wait:publish  # poll npm every minute until package.json's version is live
```

Edit `src/client`, never the generated `client.js`. `pnpm build` also injects
the package name as the browser module id, so a rename cannot leave the bundle
registered under a stale name.

```text
src/client/
├─ index.js          module-loader entry (registers the lazy factory)
├─ plugin.js         locale, theme layer, stylesheet and slot registration
├─ constants.js      namespace, panel id, storage key, effect style
├─ runtime.js        React bridge for the lazy factory
├─ selection.js      selected id, persistence and subscriptions
├─ useActiveStyle.js React hook shared by the page and the overlay
├─ components/       sidebar glyph, preview, gallery page, aurora overlay
├─ effects/          canvas-sprite ambient renderer + gradient specs
├─ dictionaries/     English and Chinese copy
├─ presets/
│  └─ cyber/         tokens.js + style.css + cycle-enabled card
└─ styles/page.css   gallery page chrome
```

## Install

Local checkout: install the folder through the Plugin Manager (`install_bundle`
with this directory). The Host row only exists so the bundle is a normal profile
entry; all behavior is in the browser half.

From npm:

```powershell
dsh plugin add @joxos/dsh-theme-gallery
```

Or use Plugin Manager → Add plugin and enter the package name.

## Publishing

The package is published as `@joxos/dsh-theme-gallery`. A GitHub Release is the
only publish trigger: creating the release runs
[`.github/workflows/publish.yml`](.github/workflows/publish.yml), which checks
out that tag, rebuilds, verifies the tag matches `package.json`, and pushes the
same version to npm with a provenance attestation. Pushing a branch or a bare
tag never publishes.

Once, in the repository settings, add a granular npm automation token (publish
permission on `@joxos/dsh-theme-gallery`) as the `NPM_TOKEN` secret:

```powershell
gh secret set NPM_TOKEN
```

Every release:

```powershell
pnpm release <version>                   # bump + rebuild + check + commit
git push origin main
gh release create v<version> --generate-notes
pnpm wait:publish                        # optional: wait until npm serves it
```

`pnpm release` without a version only verifies that the current one is
releasable (clean tree, not on npm, checks green).

What the workflow guarantees:

* The release tag (`v<version>`) must be the `package.json` version, so a
  mistyped tag fails the run before anything is published.
* A version already on npm is a no-op, so re-running a release is safe.
* A pre-release goes to the `next` dist-tag instead of taking over `latest`.
* `--provenance` links the tarball to the tag and the workflow run; it needs
  `id-token: write` (already set) and a public repository.

## Files

| Path | Purpose |
| --- | --- |
| `index.js` | Host half (empty `apply`), required by the patch row |
| `src/client/**` | Browser source modules |
| `src/client/effects/**` | Canvas-sprite ambient renderer and gradient specs |
| `client.js` | Generated browser artifact served by the Host |
| `bench/**` | Render benchmark harness and effect-fidelity gate (not published) |
| `scripts/build-client.mjs` | Bundles `src/client` into `client.js` |
| `scripts/check.mjs` | Validates the manifest, patch row, locales, icon and artifact |
| `scripts/check-publish.mjs` | Rejects `private` and `@local` before publishing |
| `scripts/release.mjs` | Bumps, rebuilds, runs the checks and commits one release |
| `scripts/wait-for-publish.mjs` | Polls npm until the current version is live |
| `scripts/smoke-test.mjs` | Exercises the built bundle in a VM harness |
| `scripts/unit-test.mjs` | Unit tests for the gradient specifications |
| `cordis.patch.yml` | Inserts the `dsh-theme-gallery` row |
| `locale/{en,zh}.json` | Plugin Manager title/description |
| `icon.svg` | Plugin artwork (palette glyph) |
| `.github/workflows/publish.yml` | Release-triggered npm publish workflow |
| `docs/**` | Design and benchmark write-ups (not published) |
| `LICENSE` | MIT license |

## License

MIT © 2026 Joxos. See [LICENSE](LICENSE).
