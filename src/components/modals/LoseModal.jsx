import { motion } from 'framer-motion'
import logoLight from '../../assets/logo-light.png'

function formatBreakdown({ meltdown = 0, freeze = 0 }) {
  const parts = []
  if (meltdown > 0) parts.push(`${meltdown} Meltdown${meltdown > 1 ? 's' : ''}`)
  if (freeze   > 0) parts.push(`${freeze} Deep Freeze${freeze > 1 ? 's' : ''}`)
  return parts.join(' · ')
}

export default function LoseModal({ strikeBreakdown = { meltdown: 0, freeze: 0 }, onRestart }) {
  const summary = formatBreakdown(strikeBreakdown)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(64,0,15,0.88)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 0 0',
      }}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          backgroundColor: 'var(--color-brand-deep)',
          borderRadius: '24px 24px 0 0',
          padding: '40px 28px 48px',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.4)',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <img
          src={logoLight}
          alt="Energy shift"
          style={{ width: 80, height: 'auto', marginBottom: 24, marginInline: 'auto', display: 'block' }}
        />

        {/* Headline */}
        <h2
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-bg-primary)',
            marginBottom: 12,
          }}
        >
          Tough shifts.
        </h2>

        {/* Strike breakdown */}
        {summary && (
          <p
            style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,222,229,0.65)',
              marginBottom: 18,
            }}
          >
            {summary}
          </p>
        )}

        {/* Body */}
        <p
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 16,
            lineHeight: 1.7,
            color: 'var(--color-pink-light)',
            marginBottom: 32,
          }}
        >
          Some shifts just go that way. Take a breath and try again when
          you're ready.
        </p>

        {/* CTA */}
        <button
          onClick={onRestart}
          className="w-full py-4 rounded-xl font-semibold text-quiz-bg text-lg transition-all active:scale-95"
          style={{
            backgroundColor: 'var(--color-brand)',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 17,
            cursor: 'pointer',
            border: '2px solid rgba(255,255,255,0.2)',
          }}
        >
          Try Again
        </button>
      </motion.div>
    </div>
  )
}
