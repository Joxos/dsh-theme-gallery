import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const problems = []
const warnings = []

if (pkg.private === true) {
  problems.push('package.json still sets "private": true; remove it before publishing.')
}
if (/^@local\//.test(pkg.name)) {
  problems.push(
    `package.json name "${pkg.name}" uses the placeholder @local scope; rename the package and update cordis.patch.yml, then rebuild.`,
  )
}
if (pkg.publishConfig?.access !== 'public') {
  warnings.push('scoped packages need "publishConfig": { "access": "public" } or --access public on publish.')
}
if (typeof pkg.license !== 'string' || pkg.license.length === 0) {
  warnings.push('no "license" field; choose a license and add a LICENSE file before publishing publicly.')
}
if (typeof pkg.repository?.url !== 'string' || pkg.repository.url.length === 0) {
  warnings.push('no "repository" field; add the public repository URL for discoverability.')
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`error: ${problem}`)
  process.exit(1)
}

for (const warning of warnings) console.warn(`warning: ${warning}`)
console.log(`publish preflight passed for ${pkg.name}@${pkg.version}`)
