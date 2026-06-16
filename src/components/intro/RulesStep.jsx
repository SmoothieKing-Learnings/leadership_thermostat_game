import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDocumentVisible } from '../../utils/useViewport.js'
import heartIcon from '../../assets/SMOOTHIEKING_HEART.svg'

// Three lives hearts that hop in a wave — reuses the exact keyframes/easing of
// the in-game lives hearts (ActionFooter), with a tighter stagger and shorter
// repeat so the hop is clearly visible while reading the rule.
const HEART_HOP_DELAYS = [0, 0.18, 0.36]

function HoppingHearts() {
  const visible = useDocumentVisible()
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 18 }}>
      {[0, 1, 2].map((i) => (
        <motion.img
          key={i}
          src={heartIcon}
          alt=""
          draggable={false}
          animate={visible ? { y: [0, -7, 0, -2, 0] } : { y: 0 }}
          transition={!visible ? { duration: 0 } : {
            duration: 0.75,
            times: [0, 0.42, 0.66, 0.84, 1],
            ease: ['easeOut', 'easeIn', 'easeOut', 'easeIn'],
            repeat: Infinity,
            repeatDelay: 2.2,
            delay: HEART_HOP_DELAYS[i],
          }}
          style={{ width: 30, height: 28, transformOrigin: 'bottom center', userSelect: 'none' }}
        />
      ))}
    </div>
  )
}

const RULES = [
  {
    num: '1',
    title: 'Face the Scenario',
    body: "Each round presents a real-world situation. You'll have two options. One choice models stable leadership. The other choice will tip the thermostat in the wrong direction.",
    color: 'var(--color-brand)',
  },
  {
    num: '2',
    title: 'Watch the Thermostat',
    body: 'There are two ways to lose a shift:',
    bullets: [
      {
        label: 'The Meltdown',
        text: 'Choose a path that adds too much stress, panic, or anger and the shift will end in a meltdown.',
        color: 'var(--color-brand)',
      },
      {
        label: 'The Deep Freeze',
        text: 'Choose a path that leads to apathy, disengagement, or a lack of care and the shift will end in a deep freeze.',
        color: 'var(--gauge-cold-deep)',
      },
    ],
    color: 'var(--gauge-cold-deep)',
  },
  {
    num: '3',
    title: 'Three Strikes and Our Culture is Lost',
    body: 'You have 3 lives (hearts) before it’s game over. If you make three "Meltdown" or "Deep Freeze" moves within the 10 shifts, the thermostat breaks and the game will be over. Team members will quit, reviews tank, and sales plummet.',
    color: 'var(--color-brand-deep)',
    hearts: true,
  },
]

export default function RulesStep({ onNext }) {
  const [idx, setIdx] = useState(0)
  const rule = RULES[idx]
  const isLast = idx === RULES.length - 1

  const handleCTA = () => {
    if (isLast) onNext()
    else setIdx((i) => i + 1)
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '4px 24px 8px',
        minHeight: 0,
      }}
    >
      {/* Goal block — stays visible across all three rules */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          backgroundColor: 'var(--color-brand)',
          borderRadius: 20,
          padding: '20px 22px 22px',
          marginBottom: 20,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontFamily: '"Poppins", system-ui, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.55)',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Your Goal
        </p>
        <h2
          style={{
            fontFamily: '"Lora", Georgia, serif',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-bg-primary)',
            lineHeight: 1.2,
            marginBottom: 10,
          }}
        >
          Survive 10 Shifts
        </h2>
        <p
          style={{
            fontFamily: '"Poppins", system-ui, sans-serif',
            fontSize: 14,
            color: 'rgba(255,222,229,0.9)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Survive 10 shifts by role-modeling choices that keep the team's
          energy balanced.
        </p>
      </motion.div>

      {/* How to play label + step progress dots */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontFamily: '"Poppins", system-ui, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'var(--color-brand)',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          How to Play
        </p>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {RULES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === idx ? 18 : 6,
                backgroundColor:
                  i < idx
                    ? 'rgba(147,0,24,0.45)'
                    : i === idx
                    ? 'var(--color-brand)'
                    : 'rgba(147,0,24,0.18)',
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ height: 6, borderRadius: 99 }}
            />
          ))}
        </div>
      </div>

      {/* Current rule — one at a time */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={rule.num}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              paddingTop: 4,
            }}
          >
            {/* Large decorative number */}
            <span
              style={{
                fontFamily: '"Lora", Georgia, serif',
                fontSize: 48,
                fontWeight: 700,
                color: rule.color,
                lineHeight: 1,
                opacity: 0.25,
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              {rule.num}
            </span>

            {/* Text */}
            <div style={{ width: '100%' }}>
              <p
                style={{
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  fontSize: 17,
                  fontWeight: 700,
                  color: 'var(--color-brand-deep)',
                  marginBottom: rule.bullets ? 8 : 6,
                  lineHeight: 1.3,
                }}
              >
                {rule.title}
              </p>
              <p
                style={{
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  fontSize: 14,
                  color: 'rgba(64,0,15,0.65)',
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {rule.body}
              </p>
              {rule.bullets && (
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '10px 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {rule.bullets.map((b) => (
                    <li
                      key={b.label}
                      style={{
                        fontFamily: '"Poppins", system-ui, sans-serif',
                        fontSize: 14,
                        color: 'rgba(64,0,15,0.65)',
                        lineHeight: 1.55,
                      }}
                    >
                      <span style={{ color: b.color, fontWeight: 800 }}>{b.label}:</span> {b.text}
                    </li>
                  ))}
                </ul>
              )}
              {rule.hearts && <HoppingHearts />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA — advances one rule per tap, "Let's Blend!" on the last */}
      <div style={{ marginTop: 16, flexShrink: 0, paddingBottom: 24 }}>
        <motion.button
          onClick={handleCTA}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%',
            padding: '17px',
            borderRadius: 16,
            border: 'none',
            backgroundColor: 'var(--color-brand)',
            color: 'var(--color-bg-primary)',
            fontFamily: '"Poppins", system-ui, sans-serif',
            fontSize: 19,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(147,0,24,0.28)',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={isLast ? 'blend' : 'next'}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'block' }}
            >
              {isLast ? "Let's Blend!" : 'Next →'}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  )
}
