#!/usr/bin/env node
// Prepare one release. Run from a clean tree:
//
//   pnpm release 1.1.0   bump package.json, rebuild, run every check, commit
//   pnpm release         no argument: verify the current version is releasable
//
// The script never pushes, tags or publishes. When it is done, print the two
// commands that do: `git push` and `gh release create v<version>`. The GitHub
// Release is what triggers .github/workflows/publish.yml, which is the only
// path to npm.
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkgFile = path.join(root, 'package.json')
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/
const CHECKS = [
  'scripts/build-client.mjs',
  'scripts/check.mjs',
  'scripts/smoke-test.mjs',
  'scripts/unit-test.mjs',
]

const fail = (message) => {
  console.error(`error: ${message}`)
  process.exit(1)
}

const git = (...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()

const gitQuiet = (...args) => {
  try {
    return git(...args)
  } catch {
    return ''
  }
}

function compareVersions(a, b) {
  const split = (version) => {
    const [core, pre] = version.split('-')
    return { nums: core.split('.').map(Number), pre }
  }
  const left = split(a)
  const right = split(b)
  for (let i = 0; i < 3; i += 1) {
    if (left.nums[i] !== right.nums[i]) return left.nums[i] - right.nums[i]
  }
  if (left.pre === right.pre) return 0
  if (!left.pre) return 1
  if (!right.pre) return -1
  return left.pre < right.pre ? -1 : 1
}

const requested = process.argv[2]
if (requested !== undefined && !SEMVER.test(requested)) {
  fail(`"${requested}" is not a semver version (expected e.g. 1.1.0 or 1.1.0-beta.1)`)
}

const pkg = JSON.parse(await readFile(pkgFile, 'utf8'))
const target = requested ?? pkg.version

if (compareVersions(target, pkg.version) < 0) {
  fail(`${target} is lower than the current version ${pkg.version}`)
}

const dirty = git('status', '--porcelain')
if (dirty) {
  fail(`working tree is not clean; commit or stash first:\n${dirty}`)
}

let response
try {
  response = await fetch(`https://registry.npmjs.org/${pkg.name}/${target}`)
} catch (error) {
  fail(`could not reach the npm registry: ${error.message}`)
}
if (response.status === 200) {
  fail(`${pkg.name}@${target} is already on npm; choose a higher version`)
}
if (response.status !== 404) {
  fail(`unexpected npm registry status ${response.status} for ${pkg.name}@${target}`)
}

const versionChanged = target !== pkg.version
if (versionChanged) {
  pkg.version = target
  await writeFile(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`)
}

const node = (script) =>
  execFileSync(process.execPath, [script], { cwd: root, stdio: 'inherit' })

try {
  for (const script of CHECKS) node(script)
} catch {
  if (versionChanged) gitQuiet('checkout', '--', 'package.json', 'client.js')
  fail(`checks failed; reverted package.json and client.js`)
}

if (versionChanged) {
  git('add', '--all')
  git('commit', '-m', `release: v${target}`)
  console.log(`committed release: v${target}`)
} else if (git('status', '--porcelain')) {
  fail('checks regenerated tracked files; commit them, then re-run')
}

const branch = gitQuiet('rev-parse', '--abbrev-ref', 'HEAD') || 'main'
let tokenReady = null
try {
  const secrets = execFileSync('gh', ['secret', 'list', '--json', 'name'], {
    cwd: root,
    encoding: 'utf8',
  })
  tokenReady = secrets.includes('NPM_TOKEN')
} catch {
  tokenReady = null
}

console.log('')
console.log(`${pkg.name}@${target} is ready to release.`)
if (tokenReady === false) {
  console.log('note: repository secret NPM_TOKEN is missing; add it once with: gh secret set NPM_TOKEN')
}
console.log('')
console.log('Next:')
console.log(`  git push origin ${branch}`)
console.log(`  gh release create v${target} --title "v${target}" --generate-notes`)
console.log('')
console.log('The release triggers .github/workflows/publish.yml; `pnpm wait:publish` follows npm.')
