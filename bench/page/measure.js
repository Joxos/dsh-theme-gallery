/** Measurement helpers: frame-gap probe and in-browser PNG diffing. */

/** Collect requestAnimationFrame timestamps between start() and stop(). */
export function createFrameProbe() {
  let frames = []
  let running = false
  let last = 0
  function loop(now) {
    if (!running) return
    if (last !== 0) frames.push(now - last)
    last = now
    requestAnimationFrame(loop)
  }
  return {
    start() {
      frames = []
      last = 0
      running = true
      requestAnimationFrame(loop)
    },
    stop() {
      running = false
      return summariseGaps(frames)
    },
  }
}

/** Percentile summary of inter-frame gaps. */
export function summariseGaps(gaps) {
  if (gaps.length === 0) return { frames: 0 }
  const sorted = [...gaps].sort((a, b) => a - b)
  const at = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]
  const total = gaps.reduce((sum, gap) => sum + gap, 0)
  return {
    frames: gaps.length,
    fps: Math.round((gaps.length / (total / 1000)) * 10) / 10,
    gapP50: round2(at(0.5)),
    gapP95: round2(at(0.95)),
    gapMax: round2(sorted[sorted.length - 1]),
    over16ms: gaps.filter((gap) => gap > 16.7).length,
    over33ms: gaps.filter((gap) => gap > 33.4).length,
  }
}

function round2(value) {
  return Math.round(value * 100) / 100
}

/** Decode a base64 PNG into raw RGBA bytes using the browser's decoder. */
async function decodePng(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }))
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(bitmap, 0, 0)
  return { width: bitmap.width, height: bitmap.height, data: ctx.getImageData(0, 0, bitmap.width, bitmap.height).data }
}

/**
 * Compare two base64 screenshots.
 * Returns mean absolute channel delta, max channel delta and the share of
 * pixels crossing 4/8/16 — the effect-preservation gate.
 */
export async function diffPng(base64A, base64B) {
  const [a, b] = await Promise.all([decodePng(base64A), decodePng(base64B)])
  if (a.width !== b.width || a.height !== b.height) {
    return { error: `size mismatch ${a.width}x${a.height} vs ${b.width}x${b.height}` }
  }
  let sum = 0
  let max = 0
  let over4 = 0
  let over8 = 0
  let over16 = 0
  const pixels = a.width * a.height
  for (let i = 0; i < a.data.length; i += 4) {
    let pixelMax = 0
    for (let c = 0; c < 3; c++) {
      const delta = Math.abs(a.data[i + c] - b.data[i + c])
      sum += delta
      if (delta > pixelMax) pixelMax = delta
    }
    if (pixelMax > max) max = pixelMax
    if (pixelMax > 4) over4++
    if (pixelMax > 8) over8++
    if (pixelMax > 16) over16++
  }
  return {
    width: a.width,
    height: a.height,
    meanAbs: round2(sum / (pixels * 3)),
    maxChannel: max,
    pctOver4: round2((over4 / pixels) * 100),
    pctOver8: round2((over8 / pixels) * 100),
    pctOver16: round2((over16 / pixels) * 100),
  }
}

/**
 * Analytic compositor texture budget of the mounted ambient elements.
 * Elements report their texture through `data-bench-texture="<w>x<h>"` in
 * backing-store pixels (device-independent of their layout size).
 */
export function textureBytes() {
  let pixels = 0
  const layers = []
  for (const node of document.querySelectorAll('[data-bench-texture]')) {
    const [w, h] = node.dataset.benchTexture.split('x').map(Number)
    const bytes = w * h * 4
    pixels += w * h
    layers.push({ className: node.className, w, h, kb: Math.round(bytes / 1024) })
  }
  return { totalMB: Math.round((pixels * 4) / 1024 / 102.4) / 10, layers }
}
