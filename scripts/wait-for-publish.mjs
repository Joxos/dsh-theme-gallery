import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Polls the public npm registry until `package.json`'s version (or an explicit
 * version) is live. Used to chain a publish on one machine with an upgrade on
 * another: the command exits 0 the moment the version resolves.
 *
 *   node scripts/wait-for-publish.mjs                 # package.json version
 *   node scripts/wait-for-publish.mjs 1.0.2           # explicit version
 *   node scripts/wait-for-publish.mjs 1.0.2 --interval 30 --max-attempts 20
 *
 * Exit codes: 0 = live, 1 = gave up or bad input.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))

const argv = process.argv.slice(2)
const flags = new Map()
const positional = []
for (let i = 0; i < argv.length; i += 1) {
  if (!argv[i].startsWith('--')) {
    positional.push(argv[i])
  } else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) {
    flags.set(argv[i], argv[++i])
  } else {
    flags.set(argv[i], true)
  }
}

const version = positional[0] ?? pkg.version
const intervalSec = Number(flags.get('--interval') ?? 60)
const maxAttempts = flags.has('--max-attempts') ? Number(flags.get('--max-attempts')) : Infinity
const registry = String(flags.get('--registry') ?? 'https://registry.npmjs.org').replace(/\/+$/, '')

if (!Number.isFinite(intervalSec) || intervalSec <= 0) {
  console.error('error: --interval must be a positive number of seconds')
  process.exit(1)
}
if (!(maxAttempts > 0)) {
  console.error('error: --max-attempts must be a positive number')
  process.exit(1)
}

const documentUrl = `${registry}/${pkg.name.replace('/', '%2F')}`
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const stamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false })

console.log(`waiting for ${pkg.name}@${version} on ${registry} (every ${intervalSec}s)`)

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const label = `[${stamp()}] attempt ${attempt}`
  try {
    const response = await fetch(`${documentUrl}?ts=${Date.now()}`, {
      headers: { accept: 'application/json', 'cache-control': 'no-cache' },
      signal: AbortSignal.timeout(20_000),
    })

    if (response.status === 404) {
      console.log(`${label}: package not on the registry yet`)
    } else if (!response.ok) {
      console.log(`${label}: registry answered HTTP ${response.status}`)
    } else {
      const document = await response.json()
      const published = document.versions?.[version]
      if (published) {
        console.log(`${label}: ${pkg.name}@${version} is live`)
        console.log(`  tarball:   ${published.dist?.tarball ?? 'unknown'}`)
        console.log(`  published: ${document.time?.[version] ?? 'unknown'}`)
        console.log(`  latest:    ${document['dist-tags']?.latest ?? 'unknown'}`)
        process.exit(0)
      }
      const latest = document['dist-tags']?.latest ?? 'unknown'
      console.log(`${label}: latest=${latest}, still waiting for ${version}`)
    }
  } catch (error) {
    const reason = error.name === 'TimeoutError' ? 'request timed out' : error.message
    console.log(`${label}: ${reason}`)
  }

  if (attempt < maxAttempts) await sleep(intervalSec * 1000)
}

console.error(`gave up: ${pkg.name}@${version} did not appear after ${maxAttempts} attempts`)
process.exit(1)
