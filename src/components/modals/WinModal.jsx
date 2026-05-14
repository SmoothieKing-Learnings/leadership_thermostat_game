import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import logo from '../../assets/logo.png'

function getTier(pct) {
  if (pct >= 90) return 'Steady hand. You set the temperature.'
  if (pct >= 70) return 'You kept the thermostat humming.'
  if (pct >= 50) return 'Solid shifts. Keep blending.'
  return 'Every shift teaches you the dial.'
}

// Eased count-up: fast start, slows into the final number
function useCountUp(target, duration = 1400, delay = 600) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) return
    const timeout = setTimeout(() => {
      const start = performance.now()
      const easeOut = (t) => 1 - Math.pow(1 - t, 3)
      const step = (now) => {
        const raw = Math.min((now - start) / duration, 1)
        const eased = easeOut(raw)
        setCount(Math.round(eased * target))
        if (raw < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, duration, delay])

  return count
}

function fireConfetti() {
  // Left party popper
  confetti({
    particleCount: 80,
    angle: 60,
    spread: 65,
    origin: { x: 0, y: 0.75 },
    colors: ['#930018', '#FFDEE5', '#D6E0FF', '#FFF9EF', '#FFD700'],
    scalar: 1.1,
  })
  // Right party popper
  confetti({
    particleCount: 80,
    angle: 120,
    spread: 65,
    origin: { x: 1, y: 0.75 },
    colors: ['#930018', '#FFDEE5', '#D6E0FF', '#FFF9EF', '#FFD700'],
    scalar: 1.1,
  })
  // Second burst for more density
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 70,
      spread: 50,
      origin: { x: 0.1, y: 0.6 },
      colors: ['#930018', '#FFDEE5', '#FFD700'],
      scalar: 0.9,
    })
    confetti({
      particleCount: 40,
      angle: 110,
      spread: 50,
      origin: { x: 0.9, y: 0.6 },
      colors: ['#930018', '#D6E0FF', '#FFD700'],
      scalar: 0.9,
    })
  }, 200)
}

export default function WinModal({ onRestart, score = 0, maxScore = 0 }) {
  const pct      = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const animated = useCountUp(pct)
  const tier     = getTier(pct)

  useEffect(() => {
    const timeout = setTimeout(fireConfetti, 200)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255,249,239,0.96)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          backgroundColor: '#fff',
          borderRadius: 24,
          padding: '40px 28px',
          maxWidth: 360,
          width: '100%',
          boxShadow: '0 8px 40px rgba(64,0,15,0.18)',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <img
          src={logo}
          alt="Smoothie King"
          style={{ width: 80, height: 'auto', marginBottom: 24, marginInline: 'auto', display: 'block' }}
        />

        {/* Headline */}
        <h2
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 28,
            fontWeight: 700,
            color: '#930018',
            marginBottom: 20,
          }}
        >
          Shift 10 survived.
        </h2>

        {/* Score */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            color: 'rgba(147,0,24,0.5)',
            marginBottom: 4,
          }}>
            Thermostat Score
          </p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 64,
              fontWeight: 800,
              color: '#930018',
              lineHeight: 1,
              marginBottom: 6,
            }}
          >
            {animated}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.4 }}
            style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(64,0,15,0.45)',
            }}
          >
            {tier}
          </motion.p>
        </div>

        {/* Body */}
        <p
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 15,
            lineHeight: 1.65,
            color: '#40000F',
            marginBottom: 28,
            opacity: 0.8,
          }}
        >
          10 shifts. Team intact. You were the thermostat — the steady hand that kept the room running right.
        </p>

        {/* CTA */}
        <button
          onClick={onRestart}
          className="w-full py-4 rounded-xl font-semibold text-white text-lg transition-all active:scale-95"
          style={{
            backgroundColor: '#930018',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 17,
            cursor: 'pointer',
            border: 'none',
          }}
        >
          Play Again
        </button>
      </motion.div>
    </div>
  )
}
