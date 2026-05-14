/**
 * iframeBridge — minimal postMessage contract between the game and its parent.
 *
 * Outbound events (game → parent):
 *   { type: 'shiftSurvival:ready'        }              fired once after mount
 *   { type: 'shiftSurvival:start'        }              player started a game
 *   { type: 'shiftSurvival:win',  score, maxScore, percent } reached shift 10
 *   { type: 'shiftSurvival:lose', strikeBreakdown }           3 strikes
 *   { type: 'shiftSurvival:restart' }                          player chose Play Again / Try Again
 *
 * Inbound commands (parent → game):
 *   { type: 'shiftSurvival:start'   }   start a game (skips welcome)
 *   { type: 'shiftSurvival:restart' }   restart from welcome (same as user pressing Try Again then Skip Intro)
 *
 * Security: pass `targetOrigin` if you know the parent's origin to avoid leaking
 * events to other embedders. Otherwise events go to '*'.
 */

const NAMESPACE = 'shiftSurvival'

// Read once at load. Parent can set ?parentOrigin=https://example.com (encoded).
function readTargetOrigin() {
  if (typeof window === 'undefined') return '*'
  try {
    const params = new URLSearchParams(window.location.search)
    const explicit = params.get('parentOrigin')
    if (explicit) return decodeURIComponent(explicit)
  } catch {}
  return '*'
}

const targetOrigin = readTargetOrigin()

function inIframe() {
  try {
    return typeof window !== 'undefined' && window.parent !== window
  } catch {
    return true // cross-origin access throws; assume iframe
  }
}

export function emit(event, payload = {}) {
  if (typeof window === 'undefined' || !inIframe()) return
  try {
    window.parent.postMessage({ type: `${NAMESPACE}:${event}`, ...payload }, targetOrigin)
  } catch (err) {
    // No-op on errors — never let the bridge break the game.
  }
}

/**
 * Subscribe to inbound commands. Returns an unsubscribe function.
 * The handler is called with the bare event name (e.g. "start").
 */
export function onCommand(handler) {
  if (typeof window === 'undefined') return () => {}
  const listener = (e) => {
    const data = e.data
    if (!data || typeof data !== 'object') return
    if (typeof data.type !== 'string') return
    if (!data.type.startsWith(`${NAMESPACE}:`)) return
    // If we know the parent origin, only accept messages from it.
    if (targetOrigin !== '*' && e.origin !== targetOrigin) return
    const command = data.type.slice(NAMESPACE.length + 1)
    handler(command, data)
  }
  window.addEventListener('message', listener)
  return () => window.removeEventListener('message', listener)
}

export const NAMESPACE_PREFIX = NAMESPACE
