/**
 * iframeBridge — minimal postMessage contract between the game and its parent.
 *
 * Outbound events (game → parent):
 *   { type: 'shiftSurvival:ready'        }              fired once after mount
 *   { type: 'shiftSurvival:start'        }              player started a game
 *   { type: 'shiftSurvival:win',  score, maxScore, percent } reached shift 10
 *   { type: 'shiftSurvival:lose', strikeBreakdown }           3 strikes
 *   { type: 'shiftSurvival:restart' }                          player chose Play Again / Try Again
 *   { type: 'shiftSurvival:resize', width, height, desiredHeight }
 *       fired on mount and whenever the iframe's viewport changes (e.g. device
 *       rotate, container resize). `desiredHeight` is a 9:16-ish recommendation
 *       clamped to [520, 900] — hosts (e.g. Rise 360 code block) can resize
 *       their wrapper to this value for a responsive fit.
 *
 *   { type: 'complete' }   (Rise 360 Code Block completion contract — NOT namespaced)
 *       fired on win or lose so Rise marks the block complete. Sent via
 *       emitComplete(); this lives outside the shiftSurvival namespace because
 *       Rise listens for the bare 'complete' type.
 *
 *   { type: 'shiftSurvival:wheel', deltaY }
 *       fired on every wheel event inside the iframe so an embedding host
 *       (e.g. Rise 360) can briefly drop the iframe's pointer-events and let
 *       the parent page continue native scroll. Throttled by rAF.
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
 * Rise 360 Code Block completion signal. Rise listens for a bare
 * { type: 'complete' } message (no namespace) and marks the block — and
 * therefore the lesson — complete. Idempotent: Rise ignores repeat fires.
 */
export function emitComplete() {
  if (typeof window === 'undefined' || !inIframe()) return
  try {
    window.parent.postMessage({ type: 'complete' }, targetOrigin)
  } catch (err) {
    // No-op.
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

// Aspect-ratio target (9:16-ish) and clamp bounds for the desired-height signal.
// MIN matches MIN_PLAYABLE_HEIGHT in App.jsx — below this the game shows the
// "expand for the full experience" placeholder.
const ASPECT_RATIO = 1.6
const MIN_DESIRED_HEIGHT = 520
const MAX_DESIRED_HEIGHT = 900

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}

/**
 * Emit the current iframe viewport size plus a recommended height.
 * Safe to call repeatedly — no-op when not embedded.
 */
export function reportSize() {
  if (typeof window === 'undefined' || !inIframe()) return
  const width = window.innerWidth
  const height = window.innerHeight
  const desiredHeight = Math.round(clamp(width * ASPECT_RATIO, MIN_DESIRED_HEIGHT, MAX_DESIRED_HEIGHT))
  emit('resize', { width, height, desiredHeight })
}
