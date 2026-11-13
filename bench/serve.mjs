/**
 * Static server for the benchmark page.
 *
 * The theme styles are served straight from `src/client` so the baseline
 * variant is pixel-identical to what `client.js` ships; nothing is copied.
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

const VIRTUAL = {
  '/theme/cyber.css': { file: 'src/client/presets/cyber/style.css', mime: MIME['.css'] },
  '/theme/page.css': { file: 'src/client/styles/page.css', mime: MIME['.css'] },
  '/src/effects/gradients.js': { file: 'src/client/effects/gradients.js', mime: MIME['.js'] },
  '/src/effects/ambient.js': { file: 'src/client/effects/ambient.js', mime: MIME['.js'] },
}

/** Start the bench server; returns `{origin, close}`. */
export async function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost')
      if (VIRTUAL[url.pathname]) {
        const { file, mime } = VIRTUAL[url.pathname]
        const body = await readFile(path.join(root, file), 'utf8')
        response.writeHead(200, { 'Content-Type': mime })
        response.end(body)
        return
      }
      const rel = url.pathname === '/' ? 'page/index.html' : url.pathname.replace(/^\/+/, '')
      const candidates = [path.resolve(here, rel), path.resolve(here, 'page', rel)]
      let body = null
      let file = null
      for (const candidate of candidates) {
        if (!candidate.startsWith(here)) continue
        try {
          body = await readFile(candidate)
          file = candidate
          break
        } catch {
          /* try the next candidate */
        }
      }
      if (body === null || file === null) {
        response.writeHead(404).end('not found')
        return
      }
      response.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' })
      response.end(body)
    } catch {
      response.writeHead(404).end('not found')
    }
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  return {
    origin: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}
