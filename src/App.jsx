/*
 * ═══════════════════════════════════════════════════════════════════════
 * THE THERMOSTAT CHALLENGE — App.jsx
 * ═══════════════════════════════════════════════════════════════════════
 *
 * UI RESEARCH APPLIED (pre-build search, April 2026)
 * ─────────────────────────────────────────────────────────────────────
 *
 * 1. MOBILE CARD GAME UI PATTERNS
 *    Source: react-swipe-deck (GitHub), DhiWise "Building a React Tinder
 *    Card Component from Scratch", Stormotion blog.
 *    Applied:
 *    - Cards animate in from below (slide-up + fade, 300ms) matching the
 *      natural gesture vocabulary of swipeable card stacks on mobile.
 *    - Selected option gets a 1.02 scale-up and background fill, mirroring
 *      the visual "lift" convention from swipe-card UIs.
 *    - History panel uses a side-tab with rotated card corners — a common
 *      pattern for "card stack preview" in mobile card games.
 *
 * 2. GAUGE / DATA VISUALIZATION POLISH
 *    Source: fullstack.com "Building a Dynamic SVG Gauge", Medium
 *    "Animated SVG thermometer on React" (skiminock), naikus/svg-gauge.
 *    Applied:
 *    - Half-circle arc built from SVG path segments with strokeDasharray;
 *      colour zones drawn as separate arc paths, not a gradient.
 *    - Needle uses CSS `transition: transform 600ms ease-in-out` on an SVG
 *      `<g>` element with transform-origin at the pivot point.
 *    - Bar gauge segments transition background-color on 600ms ease-in-out,
 *      matching the arc needle timing for visual consistency.
 *
 * 3. EDUCATIONAL GAME FEEDBACK UX
 *    Source: Tubik "Gamification in UX", IxDF "What is Gamification",
 *    trinergydigital.com "UI/UX for Game Design".
 *    Applied:
 *    - Educational message slides down with a 250ms spring after confirm,
 *      creating the "reveal" moment that drives dopamine-linked satisfaction.
 *    - Impact pill appears alongside the message so the consequence is
 *      immediately legible before reading the explanation.
 *    - Unselected option fades to 40% opacity to sharpen focus on the
 *      chosen path without deleting context.
 *
 * 4. MOBILE MODAL & OVERLAY DESIGN
 *    Source: Temzasse/react-modal-sheet, LogRocket "Creating and styling
 *    a modal bottom sheet in React Native", viliket.github.io CSS bottom sheets.
 *    Applied:
 *    - Lose modal slides up from the bottom of the screen (bottom sheet
 *      pattern) — natural mobile gesture direction for "coming up" after failure.
 *    - Win modal scales from 0.9→1 with a centre-anchored fade (alert/success
 *      pattern), contrasting with the lose sheet to create distinct emotional tones.
 *    - History panel slides in from the right as a drawer (standard "detail
 *      panel" pattern on mobile, distinct from the bottom sheet modals).
 *
 * 5. MICROINTERACTIONS & ANIMATION
 *    Source: motion.dev (Framer Motion docs), DEV.to "Framer Motion + React:
 *    Complete Beginner's Guide 2024", e-dimensionz.com microinteractions guide.
 *    Applied:
 *    - Framer Motion `motion.div` / `motion.button` used throughout for
 *      whileTap scale and AnimatePresence exit animations.
 *    - All interactive buttons include `active:scale-95` (Tailwind) as an
 *      immediate tactile response even before Framer Motion kicks in.
 *    - AnimatePresence `mode="wait"` used in HistoryPanel carousel so old
 *      card exits before new one enters, preventing overlap jank.
 *    - Autoplay SVG countdown ring uses `strokeDashoffset` animated via
 *      CSS `transition: stroke-dashoffset 1s linear` — the recommended
 *      performant approach (compositor-only property, no layout thrash).
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from './hooks/useGameState.js'
import WelcomeScreen from './components/WelcomeScreen.jsx'
import GameScreen from './components/GameScreen.jsx'
import WinModal from './components/modals/WinModal.jsx'
import LoseModal from './components/modals/LoseModal.jsx'
import { emit, onCommand, reportSize, emitComplete } from './utils/iframeBridge.js'
import { useShortViewport } from './utils/useViewport.js'

const MIN_PLAYABLE_HEIGHT = 520

// Hide the inline splash from index.html. Idempotent.
function hideSplash() {
  if (typeof document === 'undefined') return
  const el = document.getElementById('splash')
  if (!el) return
  el.classList.add('hide')
  setTimeout(() => el.remove(), 350)
}

// Read deep-link params: ?autostart=1 / ?skipIntro=1 / ?parentOrigin=https://example.com
function readLaunchParams() {
  if (typeof window === 'undefined') return { autostart: false }
  try {
    const p = new URLSearchParams(window.location.search)
    return { autostart: p.get('autostart') === '1' || p.get('skipIntro') === '1' }
  } catch {
    return { autostart: false }
  }
}

// Interpolate between two hex colors. t = 0 returns a, t = 1 returns b.
function lerpColor(a, b, t) {
  const tt = Math.max(0, Math.min(1, t))
  const parse = (hex) => [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map(c => parseInt(c, 16))
  const [r1, g1, b1] = parse(a)
  const [r2, g2, b2] = parse(b)
  return `rgb(${Math.round(r1 + (r2 - r1) * tt)}, ${Math.round(g1 + (g2 - g1) * tt)}, ${Math.round(b1 + (b2 - b1) * tt)})`
}

// Cream base; tints warm (pink) at Meltdown, cool (blue) at Deep Freeze.
// Softer endpoints — the previous saturated tints felt overpowering. These
// land roughly halfway between cream and the old endpoints so the temperature
// signal is still clear without dominating the screen.
function getEnergyBg(energy) {
  if (energy === 0) return '#FFF9EF'
  const t = Math.min(Math.abs(energy) / 2.5, 1)
  if (energy > 0) return lerpColor('#FFF9EF', '#FFC7CB', t)
  return lerpColor('#FFF9EF', '#C7D0F7', t)
}

export default function App() {
  const {
    state,
    displayEnergy,
    startGame,
    selectOption,
    confirmChoice,
    acknowledgeEnv,
    applyEnergy,
    applyOutcome,
    restartGame,
    toggleGaugeView,
    openHistory,
    closeHistory,
  } = useGameState()

  const { screen, currentCard, selectedOption, phase, strikeBreakdown } = state

  // ── iframe wiring ───────────────────────────────────────────────────────
  const prevScreen = useRef(screen)
  const announcedRef = useRef(false)
  const skipIntroRef = useRef(null) // ScrollFunc to call startGame on ready

  // Mount: hide splash, announce ready, honor autostart params and inbound commands.
  useEffect(() => {
    hideSplash()
    emit('ready')
    reportSize()
    announcedRef.current = true

    const { autostart } = readLaunchParams()
    if (autostart) {
      // Defer so the welcome screen mount/exit transition has a frame.
      const t = setTimeout(() => startGame(), 50)
      return () => clearTimeout(t)
    }
  }, [startGame])

  // Report viewport size to the parent on resize / orientation change so an
  // embedding host (e.g. Rise 360 code block) can resize its wrapper.
  // Debounced to one emit per ~150ms of quiet, with a final emit on cleanup.
  useEffect(() => {
    if (typeof window === 'undefined') return
    let timer = null
    const schedule = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => { timer = null; reportSize() }, 150)
    }
    window.addEventListener('resize', schedule)
    window.addEventListener('orientationchange', schedule)
    return () => {
      window.removeEventListener('resize', schedule)
      window.removeEventListener('orientationchange', schedule)
      if (timer) clearTimeout(timer)
    }
  }, [])

  // Listen for parent commands.
  useEffect(() => {
    const off = onCommand((command) => {
      if (command === 'start') startGame()
      else if (command === 'restart') restartGame()
    })
    return off
  }, [startGame, restartGame])

  // Emit screen-transition events to the parent.
  useEffect(() => {
    const prev = prevScreen.current
    prevScreen.current = screen
    if (prev === screen) return
    if (prev === 'welcome' && screen === 'game') emit('start')
    else if (screen === 'win') {
      const pct = state.maxScore > 0 ? Math.round((state.score / state.maxScore) * 100) : 0
      emit('win', { score: state.score, maxScore: state.maxScore, percent: pct })
      emitComplete()
    } else if (screen === 'lose') {
      emit('lose', { strikeBreakdown })
      emitComplete()
    }
    else if ((prev === 'win' || prev === 'lose') && screen === 'welcome') emit('restart')
  }, [screen, state.score, state.maxScore, strikeBreakdown])

  // Handle "Understood" on environment card
  const handleAcknowledgeEnv = () => {
    if (!currentCard) return
    applyEnergy(currentCard.energyImpact)
  }

  // Handle "Understood" on choice card (post-reveal). Drives the 3-state
  // temperature machine directly from the chosen option's outcome.
  const handleAcknowledgeChoice = () => {
    if (!currentCard || !selectedOption) return
    const chosen = currentCard.options.find(o => o.id === selectedOption)
    if (!chosen) return
    applyOutcome(chosen.outcome)
  }

  // Keyboard shortcuts: 1/A for option A, 2/B for option B, Enter for Confirm/Understood.
  useEffect(() => {
    if (screen !== 'game' || !currentCard) return
    const onKey = (e) => {
      // Don't hijack typing in form fields.
      const tag = (e.target?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return

      const k = e.key.toLowerCase()
      if (phase === 'reading' && currentCard.type === 'choice') {
        if (k === '1' || k === 'a') { e.preventDefault(); selectOption('A'); return }
        if (k === '2' || k === 'b') { e.preventDefault(); selectOption('B'); return }
        if ((e.key === 'Enter' || e.key === ' ') && selectedOption) {
          e.preventDefault(); confirmChoice(); return
        }
      } else if (phase === 'revealed') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); handleAcknowledgeChoice()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, phase, currentCard, selectedOption, selectOption, confirmChoice])

  const energyBg = getEnergyBg(displayEnergy)
  const tooShort = useShortViewport(MIN_PLAYABLE_HEIGHT)

  return (
    <div
      style={{
        height: '100dvh',
        overflow: 'hidden',
        backgroundColor: energyBg,
        ['--bg-energy']: energyBg,
        transition: 'background-color 4000ms ease-in-out 800ms',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {tooShort && (
        <div
          role="status"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: '#FFF9EF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 320 }}>
            <p style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 22, fontWeight: 700, color: '#930018', marginBottom: 8,
            }}>
              Expand for the full experience
            </p>
            <p style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: 14, lineHeight: 1.55, color: '#40000F', opacity: 0.7, margin: 0,
            }}>
              Shift Survival needs a little more vertical room. Resize the window
              (or expand the embed) to at least {MIN_PLAYABLE_HEIGHT}px tall.
            </p>
          </div>
        </div>
      )}
      <AnimatePresence mode="wait">
        {screen === 'welcome' && (
          <motion.div
            key="welcome"
            style={{ width: '100%', height: '100%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <WelcomeScreen onStart={startGame} />
          </motion.div>
        )}

        {(screen === 'game' || screen === 'win' || screen === 'lose') && (
          <motion.div
            key="game"
            style={{ width: '100%', height: '100%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <GameScreen
              state={state}
              displayEnergy={displayEnergy}
              onSelectOption={selectOption}
              onConfirm={confirmChoice}
              onAcknowledgeEnv={handleAcknowledgeEnv}
              onAcknowledgeChoice={handleAcknowledgeChoice}
              onToggleGaugeView={toggleGaugeView}
              onOpenHistory={openHistory}
              onCloseHistory={closeHistory}
            />

            {/* Win/Lose modals — overlay on top of game screen */}
            <AnimatePresence>
              {screen === 'win' && (
                <WinModal key="win" onRestart={restartGame} score={state.score} maxScore={state.maxScore} shiftsCompleted={Math.min(state.round, 10)} />
              )}
              {screen === 'lose' && (
                <LoseModal key="lose" strikeBreakdown={strikeBreakdown} onRestart={restartGame} />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
