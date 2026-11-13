/** Synthetic user-interaction workloads run while the ambient effects play. */

const WORDS = [
  'aurora', 'glass', 'drift', 'compositor', 'texture', 'blend', 'raster',
  'layer', 'shader', 'frame', 'budget', 'night', 'quiet', 'flowing', 'panel',
]

function sentence(seed) {
  const parts = []
  for (let i = 0; i < 12; i++) parts.push(WORDS[(seed * 7 + i * 13) % WORDS.length])
  return parts.join(' ')
}

/** Append a chat message to the synthetic conversation. */
function appendMessage(chat, seed) {
  const message = document.createElement('article')
  message.className = seed % 2 === 0 ? 'msg msgUser' : 'msg msgBot'
  const head = document.createElement('div')
  head.className = 'msgHead'
  head.textContent = seed % 2 === 0 ? 'user' : 'assistant'
  const body = document.createElement('p')
  body.textContent = sentence(seed)
  message.append(head, body)
  chat.append(message)
  while (chat.childElementCount > 60) chat.firstElementChild.remove()
  chat.scrollTop = chat.scrollHeight
}

/**
 * Run one workload for `durationMs`.
 *   idle   — ambient effects only
 *   stream — simulated chat streaming (DOM churn + scroll through the
 *            translucent stack)
 *   menu   — an open backdrop-filter menu while cards toggle hover state
 */
export function runWorkload(id, durationMs) {
  return new Promise((resolve) => {
    const chat = document.getElementById('chat')
    const menu = document.getElementById('menu')
    const cards = [...document.querySelectorAll('.msg')]
    const timers = []
    const started = performance.now()
    if (id === 'menu') menu.hidden = false
    let seed = 1
    if (id === 'stream') {
      timers.push(setInterval(() => appendMessage(chat, seed++), 110))
    }
    if (id === 'menu') {
      timers.push(
        setInterval(() => {
          const node = chat.childElementCount ? chat.children[seed % chat.childElementCount] : null
          if (node) node.classList.toggle('hover')
          seed++
        }, 180),
      )
    }
    const finish = () => {
      for (const timer of timers) clearInterval(timer)
      menu.hidden = id === 'menu' ? false : true
      resolve({ id, durationMs, elapsed: Math.round(performance.now() - started), messages: chat.childElementCount })
    }
    setTimeout(finish, durationMs)
  })
}
