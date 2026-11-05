import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const failures = []

function check(condition, message) {
  if (!condition) failures.push(message)
}

async function read(rel) {
  return readFile(path.join(root, rel), 'utf8')
}

async function exists(rel) {
  try {
    await stat(path.join(root, rel))
    return true
  } catch (error) {
    return false
  }
}

for (const rel of ['index.js', 'client.js', 'cordis.patch.yml', 'locale/en.json', 'locale/zh.json', 'icon.svg', 'LICENSE']) {
  check(await exists(rel), `missing runtime file: ${rel}`)
}

for (const key of ['.', './client', './locale/*.json', './icon']) {
  check(typeof pkg.exports?.[key] === 'string', `package.json exports is missing "${key}"`)
}

const files = new Set(pkg.files ?? [])
for (const pattern of ['index.js', 'client.js', 'cordis.patch.yml', 'locale/*.json', 'icon.svg', 'LICENSE']) {
  check(files.has(pattern), `package.json files is missing "${pattern}"`)
}

check(pkg.license === 'MIT', 'package.json license must be MIT')

check(pkg.dsh?.bundle?.patch === './cordis.patch.yml', 'dsh.bundle.patch must point at ./cordis.patch.yml')
check(pkg.dsh?.client?.platform === 'web', 'dsh.client.platform must be "web"')
check(pkg.dsh?.client?.immediately === true, 'dsh.client.immediately must be true')
check(Array.isArray(pkg.dsh?.client?.inject), 'dsh.client.inject must be an array')

const client = await read('client.js')
check(client.includes('__ModuleLoader__.load'), 'client.js does not register a module loader factory')
check(client.includes(pkg.name), `client.js was not built for ${pkg.name}; run "pnpm build"`)
check(client.includes('.dsg-page'), 'client.js is missing the gallery stylesheet')
check(client.includes('data-plugin-css'), 'client.js is missing the plugin style tag marker')

const patch = await read('cordis.patch.yml')
const patchNames = [...patch.matchAll(/^\s*name:\s*['"]?([^'"\s]+)['"]?\s*$/gm)].map((match) => match[1])
check(
  patchNames.includes(pkg.name),
  `cordis.patch.yml does not reference ${pkg.name}; update the row name to match package.json`,
)

for (const locale of ['en', 'zh']) {
  const data = JSON.parse(await read(`locale/${locale}.json`))
  check(typeof data.meta?.title === 'string' && data.meta.title.length > 0, `locale/${locale}.json needs meta.title`)
  check(
    typeof data.meta?.description === 'string' && data.meta.description.length > 0,
    `locale/${locale}.json needs meta.description`,
  )
}

const iconPath = pkg.exports?.['./icon']
if (typeof iconPath === 'string' && iconPath.endsWith('.svg')) {
  const icon = await read(iconPath)
  check(/<svg[\s>]/.test(icon), `${iconPath} is not an SVG document`)
}

if (pkg.private === true) {
  console.warn('warning: package.json still sets "private": true; this is expected before publishing.')
}
if (/^@local\//.test(pkg.name)) {
  console.warn('warning: package.json uses the placeholder @local scope; rename it before publishing.')
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`error: ${failure}`)
  process.exit(1)
}

console.log(`check passed for ${pkg.name}@${pkg.version}`)
