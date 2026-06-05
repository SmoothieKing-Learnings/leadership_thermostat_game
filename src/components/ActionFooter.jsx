import { motion } from 'framer-motion'

const LIVES_EMOJI = ['🍓', '🫐', '🍌']
const LIVES_LABELS = ['Strawberry', 'Blueberry', 'Banana']
// Stagger per fruit so they hop at different times and don't sync up.
const HOP_DELAYS = [0, 1.6, 3.2]

const statusLabelStyle = {
  fontFamily: '"Poppins", system-ui, sans-serif',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'rgba(64,0,15,0.55)',
  lineHeight: 1,
}

function ShiftProgress({ round, total = 10 }) {
  return (
    <span
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={round}
      aria-label={`Shift ${Math.min(round + 1, total)} of ${total}`}
      style={{ display: 'inline-flex', gap: 4, alignItems: 'center', height: 26 }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const status = i < round ? 'done' : i === round ? 'active' : 'upcoming'
        return (
          <span
            key={i}
            style={{
              width: 12,
              height: 18,
              borderRadius: 4,
              backgroundColor:
                status === 'done' ? 'var(--color-brand)' :
                status === 'active' ? 'rgba(147,0,24,0.55)' :
                'rgba(147,0,24,0.15)',
              transition: 'background-color 350ms ease',
            }}
          />
        )
      })}
    </span>
  )
}

export default function ActionFooter({
  card,
  phase,
  selectedOption,
  round = 0,
  livesRemaining = 3,
  onConfirm,
  onAcknowledge,
}) {
  if (!card) return null

  const envImpact = card.type === 'environment' ? card.energyImpact : 0
  const understoodColor = envImpact < 0 ? 'var(--gauge-cold-deep)' : 'var(--color-brand)'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 480,
        marginInline: 'auto',
        zIndex: 20,
        padding: '0 16px 32px 16px',
        backgroundColor: 'var(--bg-energy, var(--color-bg-primary))',
        transition: 'background-color 4000ms ease-in-out 800ms',
      }}
    >
      {/* Status row — shift progress + lives, with labels, above CTA */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingBottom: 10,
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
          <span style={statusLabelStyle}>Shifts</span>
          <div style={{ height: 26, display: 'flex', alignItems: 'center' }}>
            <ShiftProgress round={round} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <span style={statusLabelStyle}>Lives</span>
          <span
            aria-label={`${livesRemaining} lives remaining`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 26 }}
          >
            {LIVES_EMOJI.map((emoji, i) => {
              const used = i >= livesRemaining
              return (
                <motion.span
                  key={i}
                  role="img"
                  aria-label={LIVES_LABELS[i]}
                  animate={used ? { y: 0 } : { y: [0, -6, 0] }}
                  transition={used ? { duration: 0 } : {
                    duration: 0.55,
                    times: [0, 0.45, 1],
                    repeat: Infinity,
                    repeatDelay: 4.5,
                    delay: HOP_DELAYS[i],
                    ease: 'easeOut',
                  }}
                  style={{
                    display: 'inline-block',
                    fontSize: 22,
                    lineHeight: 1,
                    opacity: used ? 0.3 : 1,
                    filter: used ? 'grayscale(100%)' : 'none',
                    transition: 'opacity 250ms ease, filter 250ms ease',
                    transformOrigin: 'bottom center',
                  }}
                >
                  {emoji}
                </motion.span>
              )
            })}
          </span>
        </div>
      </div>

      {card.type === 'choice' && phase === 'reading' ? (
        <button
          onClick={onConfirm}
          disabled={!selectedOption}
          className="w-full py-4 rounded-2xl font-semibold text-quiz-bg transition-all active:scale-95 shadow-lg"
          style={{
            backgroundColor: selectedOption ? 'var(--color-brand)' : 'var(--gauge-warm-mid)',
            fontFamily: '"Poppins", system-ui, sans-serif',
            fontSize: 20,
            cursor: selectedOption ? 'pointer' : 'not-allowed',
            border: 'none',
            boxShadow: selectedOption ? '0 4px 20px rgba(147,0,24,0.3)' : 'none',
          }}
        >
          Confirm
        </button>
      ) : (
        <button
          onClick={onAcknowledge}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-quiz-bg transition-all active:scale-95 shadow-lg"
          style={{
            backgroundColor: understoodColor,
            fontFamily: '"Poppins", system-ui, sans-serif',
            fontSize: 20,
            border: 'none',
            boxShadow: `0 4px 20px ${envImpact < 0 ? 'rgba(0,78,147,0.3)' : 'rgba(147,0,24,0.3)'}`,
            cursor: 'pointer',
          }}
        >
          <span>Understood</span>
          <span style={{ opacity: 0.8 }}>→</span>
        </button>
      )}
    </div>
  )
}
