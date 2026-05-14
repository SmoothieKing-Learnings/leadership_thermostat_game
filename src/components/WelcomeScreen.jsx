import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LandingStep from './intro/LandingStep'
import MetaphorStep from './intro/MetaphorStep'
import ChoiceDemoStep from './intro/ChoiceDemoStep'
import RulesStep from './intro/RulesStep'

// Steps that manage their own action button (no container Next button)
const SELF_NAVIGATING = new Set([0, 2])

const TOTAL_STEPS = 4

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
        backgroundColor: '#FFF9EF',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 480,
        margin: '0 auto',
        width: '100%',
      }}
    >
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
          /* pad bottom so content never hides behind fixed footer on non-demo steps */
          paddingBottom: isSelfNav ? 0 : 'var(--footer-height)',
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

      {/* ── Container Next button — fixed to screen bottom, hidden for self-navigating demo steps ── */}
      <AnimatePresence>
        {!isSelfNav && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              maxWidth: 480,
              marginInline: 'auto',
              zIndex: 20,
              backgroundColor: '#FFF9EF',
              padding: '14px 24px 36px',
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
    </div>
  )
}
