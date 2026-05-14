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

import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from './hooks/useGameState.js'
import WelcomeScreen from './components/WelcomeScreen.jsx'
import GameScreen from './components/GameScreen.jsx'
import WinModal from './components/modals/WinModal.jsx'
import LoseModal from './components/modals/LoseModal.jsx'

// Interpolate between two hex colors. t = 0 returns a, t = 1 returns b.
function lerpColor(a, b, t) {
  const tt = Math.max(0, Math.min(1, t))
  const parse = (hex) => [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map(c => parseInt(c, 16))
  const [r1, g1, b1] = parse(a)
  const [r2, g2, b2] = parse(b)
  return `rgb(${Math.round(r1 + (r2 - r1) * tt)}, ${Math.round(g1 + (g2 - g1) * tt)}, ${Math.round(b1 + (b2 - b1) * tt)})`
}

// Cream base; tints warm (pink) toward meltdown, cool (blue) toward deep freeze.
// Saturated endpoints so the shift is clearly visible even at energy ±1.
function getEnergyBg(energy) {
  if (energy === 0) return '#FFF9EF'
  if (energy > 0) return lerpColor('#FFF9EF', '#FF95A8', energy / 5)
  return lerpColor('#FFF9EF', '#8FA8FF', -energy / 5)
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
    restartGame,
    toggleGaugeView,
    openHistory,
    closeHistory,
  } = useGameState()

  const { screen, currentCard, selectedOption, phase, strikeBreakdown } = state

  // Handle "Understood" on environment card
  const handleAcknowledgeEnv = () => {
    if (!currentCard) return
    applyEnergy(currentCard.energyImpact)
  }

  // Handle "Understood" on choice card (post-reveal)
  const handleAcknowledgeChoice = () => {
    if (!currentCard || !selectedOption) return
    const chosen = currentCard.options.find(o => o.id === selectedOption)
    if (!chosen) return
    applyEnergy(chosen.energyImpact)
  }

  const energyBg = getEnergyBg(displayEnergy)

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
                <WinModal key="win" onRestart={restartGame} score={state.score} maxScore={state.maxScore} />
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
