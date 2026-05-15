import { useState, useCallback, useRef, useEffect } from 'react'
import { SHIFT_DECK } from '../data/cards'

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Build a 10-card hand from SHIFT_DECK, balanced between meltdown-leaning
// and freeze-leaning cards so a single game can't be all heat or all cold.
function buildDeck() {
  const meltdowns = shuffle(SHIFT_DECK.filter(c => c.balanceLean === 'meltdown'))
  const freezes   = shuffle(SHIFT_DECK.filter(c => c.balanceLean === 'freeze'))

  const targetHand = 10
  const half = Math.floor(targetHand / 2)

  const pickMelt = meltdowns.slice(0, Math.min(half, meltdowns.length))
  const pickFreeze = freezes.slice(0, Math.min(targetHand - pickMelt.length, freezes.length))

  // Fill any remaining slots from the larger pool if one side ran short
  let combined = [...pickMelt, ...pickFreeze]
  if (combined.length < targetHand) {
    const remaining = SHIFT_DECK.filter(c => !combined.includes(c))
    combined = [...combined, ...shuffle(remaining).slice(0, targetHand - combined.length)]
  }

  return shuffle(combined)
}

const INITIAL_STATE = {
  screen: 'welcome',
  energy: 0,
  round: 0,
  deck: [],
  history: [],
  currentCard: null,
  phase: 'reading',
  selectedOption: null,
  gaugeView: 'arc',
  historyOpen: false,
  score: 0,
  maxScore: 0,
  cardStartTime: null,
  strikes: 0,
  strikeBreakdown: { meltdown: 0, freeze: 0 },
}

// Default gauge view: bar on short viewports (< 800px tall), arc otherwise.
// Short screens get the more vertically compact bar by default.
function defaultGaugeView() {
  if (typeof window === 'undefined') return 'arc'
  return window.innerHeight < 800 ? 'bar' : 'arc'
}

// Pin position for each temperature state. The gauge visual extents remain
// at ±5, but the pin only ever lives in the narrower ±2.5 band.
const PIN_BY_OUTCOME = { success: 0, meltdown: 2.5, freeze: -2.5 }

function energyForOutcome(outcome) {
  return PIN_BY_OUTCOME[outcome] ?? 0
}

// Score model under the 3-state system: success picks earn 2 base points,
// off-balance picks earn 0. Timing bonus is only granted on success picks
// (fast, accurate leadership). Drives the win-modal tier copy.
function calcChoicePoints(card, chosenId, cardStartTime) {
  const chosen = card.options.find(o => o.id === chosenId)
  if (!chosen) return { earned: 0, possible: 2 }
  const isSuccess = chosen.outcome === 'success'
  const base = isSuccess ? 2 : 0
  const timingBonus = isSuccess && cardStartTime && (Date.now() - cardStartTime) < 6000 ? 1 : 0
  return { earned: base + timingBonus, possible: 2 }
}

export function useGameState() {
  const [state, setState] = useState(INITIAL_STATE)
  const [displayEnergy, setDisplayEnergy] = useState(0)
  const animationTimer = useRef(null)
  // Tracks whether the user has explicitly toggled the gauge view. If false,
  // viewport-driven resize is allowed to override the gauge default. If true,
  // we respect the user's manual choice across resizes.
  const gaugeManualRef = useRef(false)

  // Sync gauge view with viewport changes (iframe resize, host accordion
  // expand/collapse, tab restore). Only auto-adjusts when the user hasn't
  // manually toggled.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => {
      if (gaugeManualRef.current) return
      const next = defaultGaugeView()
      setState(prev => prev.gaugeView === next ? prev : { ...prev, gaugeView: next })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const update = useCallback((patch) => {
    setState(prev => ({ ...prev, ...patch }))
  }, [])

  // ── startGame ──────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const deck = buildDeck()
    gaugeManualRef.current = false
    setState({
      ...INITIAL_STATE,
      screen: 'game',
      deck,
      currentCard: deck[0],
      gaugeView: defaultGaugeView(),
      cardStartTime: Date.now(),
    })
    setDisplayEnergy(0)
  }, [])

  // ── selectOption ───────────────────────────────────────────────────────────
  const selectOption = useCallback((id) => {
    setState(prev => {
      if (prev.phase !== 'reading') return prev
      return { ...prev, selectedOption: id }
    })
  }, [])

  // ── confirmChoice ──────────────────────────────────────────────────────────
  const confirmChoice = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'reading' || !prev.selectedOption) return prev
      const chosen = prev.currentCard.options.find(o => o.id === prev.selectedOption)
      const { earned, possible } = calcChoicePoints(
        prev.currentCard, prev.selectedOption, prev.cardStartTime
      )

      const isStrike = chosen && chosen.outcome !== 'success'
      const breakdown = { ...prev.strikeBreakdown }
      if (isStrike && chosen.outcome === 'meltdown') breakdown.meltdown += 1
      if (isStrike && chosen.outcome === 'freeze')   breakdown.freeze   += 1

      return {
        ...prev,
        phase: 'revealed',
        score: prev.score + earned,
        maxScore: prev.maxScore + possible,
        strikes: prev.strikes + (isStrike ? 1 : 0),
        strikeBreakdown: breakdown,
      }
    })
  }, [])

  // ── acknowledgeEnv (legacy, env cards no longer in active deck) ────────────
  const acknowledgeEnv = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'reading') return prev
      return { ...prev, phase: 'animating' }
    })
  }, [])

  // ── applyOutcome ───────────────────────────────────────────────────────────
  // 3-state temperature model: the pin snaps directly to the position dictated
  // by the chosen option's outcome — no accumulation, no in-between values.
  //   outcome === 'meltdown' → energy = +2.5
  //   outcome === 'freeze'   → energy = -2.5
  //   outcome === 'success'  → energy =  0
  // The pin persists between rounds. Strikes are tracked separately in
  // confirmChoice; this function only handles state advancement.
  const applyOutcome = useCallback((outcome) => {
    setState(prev => {
      if (prev.phase === 'animating') return prev

      const newEnergy = energyForOutcome(outcome)
      const newRound = prev.round + 1

      setDisplayEnergy(newEnergy)

      let nextScreen = 'game'
      if (prev.strikes >= 3) nextScreen = 'lose'
      else if (newRound >= 10) nextScreen = 'win'

      const historyEntry = {
        ...prev.currentCard,
        roundNumber: prev.round + 1,
        appliedEnergy: newEnergy,
        energyDelta: newEnergy - prev.energy,
        chosenOptionId: prev.selectedOption,
      }

      const nextCard = prev.deck[newRound] || null

      if (animationTimer.current) clearTimeout(animationTimer.current)
      animationTimer.current = setTimeout(() => {
        setState(s => ({
          ...s,
          screen: nextScreen,
          currentCard: nextScreen === 'game' ? nextCard : s.currentCard,
          phase: 'reading',
          selectedOption: null,
          energy: newEnergy,
          round: newRound,
          history: [...s.history, historyEntry],
          cardStartTime: Date.now(),
        }))
      }, 650)

      return {
        ...prev,
        phase: 'animating',
        energy: newEnergy,
      }
    })
  }, [])

  // Backward-compatible shim — the (unused) env-card path still calls
  // applyEnergy(card.energyImpact). Translate that to an outcome so the
  // 3-state machine handles it uniformly.
  const applyEnergy = useCallback((impact) => {
    let outcome = 'success'
    if (impact === 'balance' || impact === 0) outcome = 'success'
    else if (typeof impact === 'number' && impact > 0) outcome = 'meltdown'
    else if (typeof impact === 'number' && impact < 0) outcome = 'freeze'
    applyOutcome(outcome)
  }, [applyOutcome])

  // ── nextCard ───────────────────────────────────────────────────────────────
  const nextCard = useCallback(() => {}, [])

  // ── restartGame ────────────────────────────────────────────────────────────
  const restartGame = useCallback(() => {
    if (animationTimer.current) clearTimeout(animationTimer.current)
    gaugeManualRef.current = false
    setDisplayEnergy(0)
    setState({ ...INITIAL_STATE, gaugeView: defaultGaugeView() })
  }, [])

  // ── toggleGaugeView ────────────────────────────────────────────────────────
  const toggleGaugeView = useCallback(() => {
    gaugeManualRef.current = true
    setState(prev => ({ ...prev, gaugeView: prev.gaugeView === 'arc' ? 'bar' : 'arc' }))
  }, [])

  // ── openHistory / closeHistory ─────────────────────────────────────────────
  const openHistory = useCallback(() => update({ historyOpen: true }), [update])
  const closeHistory = useCallback(() => update({ historyOpen: false }), [update])

  return {
    state,
    displayEnergy,
    startGame,
    selectOption,
    confirmChoice,
    acknowledgeEnv,
    applyEnergy,
    applyOutcome,
    nextCard,
    restartGame,
    toggleGaugeView,
    openHistory,
    closeHistory,
  }
}
