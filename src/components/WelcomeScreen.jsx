import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LandingStep from './intro/LandingStep'
import MetaphorStep from './intro/MetaphorStep'
import ChoiceDemoStep from './intro/ChoiceDemoStep'
import RulesStep from './intro/RulesStep'

// Steps that manage their own action button (no container Next button)
const SELF_NAVIGATING = new Set([0, 2])

const TOTAL_STEPS = 4

// Card chrome matches the unified quiz LayoutWrapper:
//   max-w-md (448px), bg-white/50, backdrop-blur-sm, rounded-2xl,
//   shadow-xl, border border-orange-100.
// Once the player taps Start Shift, the game canvas takes over and the card is gone.
const CARD_STYLE = {
  width: '100%',
  maxWidth: 448,
  height: '100%',
  maxHeight: 'min(720px, calc(100% - 24px))',
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  borderRadius: 16,
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
  border: '1px solid #FFEDD5',
  overflow: 'hidden',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
}

export default function WelcomeScreen({ onStart }) {
  const [step, setStep] = useState(0)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [step])

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1)
    else onStart()
  }

  const isSelfNav = SELF_NAVIGATING.has(step)
  const isLastStep = step === TOTAL_STEPS - 1

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 12px',
        boxSizing: 'border-box',
      }}
    >
      <main style={CARD_STYLE}>
        {/* ── Top bar — hidden on landing (step 0) ── */}
        {step > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 22px 8px',
              flexShrink: 0,
            }}
          >
            {/* Progress dots (excludes landing step 0) */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => {
                const tutorialStep = step - 1
                return (
                  <motion.div
                    key={i}
                    animate={{
                      width: i === tutorialStep ? 20 : 6,
                      backgroundColor:
                        i < tutorialStep
                          ? 'rgba(147,0,24,0.45)'
                          : i === tutorialStep
                          ? '#930018'
                          : 'rgba(147,0,24,0.18)',
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{ height: 6, borderRadius: 99 }}
                  />
                )
              })}
            </div>

            {/* Skip intro */}
            <button
              onClick={onStart}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontSize: 13,
                color: 'rgba(147,0,24,0.5)',
                fontWeight: 600,
                padding: '4px 2px',
              }}
            >
              Skip Intro →
            </button>
          </div>
        )}

        {/* ── Step content ── */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              {step === 0 && <LandingStep onStart={onStart} onTutorial={goNext} />}
              {step === 1 && <MetaphorStep />}
              {step === 2 && <ChoiceDemoStep onNext={goNext} />}
              {step === 3 && <RulesStep />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Container Next button — pinned to the card's bottom, hidden for self-navigating demo steps ── */}
        <AnimatePresence>
          {!isSelfNav && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              style={{
                flexShrink: 0,
                padding: '14px 24px 20px',
                backgroundColor: 'transparent',
              }}
            >
              <motion.button
                onClick={goNext}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%',
                  padding: '17px',
                  borderRadius: 16,
                  border: 'none',
                  backgroundColor: '#930018',
                  color: '#fff',
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 19,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(147,0,24,0.28)',
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isLastStep ? 'blend' : 'next'}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: 'block' }}
                  >
                    {isLastStep ? "Let's Blend!" : 'Next →'}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
