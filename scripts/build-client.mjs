import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const outfile = path.join(root, 'client.js')

await build({
  absWorkingDir: root,
  entryPoints: ['src/client/index.js'],
  outfile,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  loader: { '.css': 'text' },
  define: { __PACKAGE_ID__: JSON.stringify(pkg.name) },
  legalComments: 'none',
  charset: 'utf8',
  banner: {
    js: `/*! ${pkg.name} v${pkg.version} | generated from src/client by scripts/build-client.mjs - edit the sources, not this file. */`,
  },
  logLevel: 'warning',
})

const info = await stat(outfile)
console.log(`built client.js (${(info.size / 1024).toFixed(1)} KiB) for ${pkg.name}@${pkg.version}`)
