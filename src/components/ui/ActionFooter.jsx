import { motion } from 'framer-motion'
import { useDocumentVisible } from '../../utils/useViewport.js'
import heartIcon from '../../assets/SMOOTHIEKING_HEART.svg'

const LIVES_COUNT = 3
const LIFE_LABEL = 'Life'
// Stagger per life so they hop at different times and don't sync up.
const HOP_DELAYS = [0, 3.2, 6.4]

const statusLabelStyle = {
  fontFamily: '"DM Sans", system-ui, sans-serif',
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
      style={{ display: 'flex', gap: 2, alignItems: 'center', height: 26, width: '100%' }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const status = i < round ? 'done' : i === round ? 'active' : 'upcoming'
        return (
          <span
            key={i}
            style={{
              flex: 1,
              maxWidth: 28,
              height: 18,
              borderRadius: 4,
              backgroundColor:
                status === 'done' ? '#930018' :
                status === 'active' ? '#E31F26' :
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
  const documentVisible = useDocumentVisible()
  if (!card) return null

  const envImpact = card.type === 'environment' ? card.energyImpact : 0
  const understoodColor = envImpact < 0 ? '#004E93' : '#930018'

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
        backgroundColor: 'var(--bg-energy, #FFF9EF)',
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
        <div style={{ flex: 1, minWidth: 0, marginRight: 14, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
          <span style={statusLabelStyle}>Shift {Math.min(round + 1, 10)}</span>
          <div style={{ height: 26, width: '100%', display: 'flex', alignItems: 'center' }}>
            <ShiftProgress round={round} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <span style={statusLabelStyle}>Lives</span>
          <span
            aria-label={`${livesRemaining} lives remaining`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 26 }}
          >
            {Array.from({ length: LIVES_COUNT }).map((_, i) => {
              const used = i >= livesRemaining
              const shouldHop = !used && documentVisible
              return (
                <motion.img
                  key={i}
                  src={heartIcon}
                  alt={LIFE_LABEL}
                  draggable={false}
                  animate={shouldHop ? { y: [0, -5, 0, -1.4, 0] } : { y: 0 }}
                  transition={!shouldHop ? { duration: 0 } : {
                    // Springy hop: decelerating rise, fast accelerating fall,
                    // tiny secondary bounce on landing, then settle.
                    duration: 0.75,
                    times: [0, 0.42, 0.66, 0.84, 1],
                    ease: ['easeOut', 'easeIn', 'easeOut', 'easeIn'],
                    repeat: Infinity,
                    repeatDelay: 9,
                    delay: HOP_DELAYS[i],
                  }}
                  style={{
                    display: 'inline-block',
                    width: 24,
                    height: 22,
                    opacity: used ? 0.25 : 1,
                    filter: used ? 'grayscale(100%) brightness(1.4)' : 'none',
                    transition: 'opacity 250ms ease, filter 250ms ease',
                    transformOrigin: 'bottom center',
                    userSelect: 'none',
                  }}
                />
              )
            })}
          </span>
        </div>
      </div>

      {card.type === 'choice' && phase === 'reading' ? (
        <button
          onClick={onConfirm}
          disabled={!selectedOption}
          className="w-full py-4 rounded-2xl font-semibold text-white transition-all active:scale-95 shadow-lg"
          style={{
            backgroundColor: selectedOption ? '#930018' : '#C9A0A8',
            fontFamily: '"Playfair Display", Georgia, serif',
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
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-white transition-all active:scale-95 shadow-lg"
          style={{
            backgroundColor: understoodColor,
            fontFamily: '"Playfair Display", Georgia, serif',
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
