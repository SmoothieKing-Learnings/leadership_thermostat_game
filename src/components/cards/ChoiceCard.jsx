import { motion } from 'framer-motion'
import CardShell, { TypeHeader, CardTitle, CardDescription, CARD_SHADOW } from './CardShell.jsx'

// 3-state outcome label for the revealed option pill — no numbers, just the
// temperature state that the chosen option drives the gauge to.
export function getChoiceOutcomeLabel(outcome) {
  if (outcome === 'meltdown') return 'Meltdown'
  if (outcome === 'freeze')   return 'Deep Freeze'
  return 'Balance'
}

// ── Option button (reading phase) ─────────────────────────────────────────────
function OptionButton({ opt, isSelected, onSelect }) {
  return (
    <motion.button
      onClick={() => onSelect(opt.id)}
      whileTap={{ scale: 0.98 }}
      animate={{ scale: isSelected ? 1.02 : 1 }}
      transition={{ duration: 0.15 }}
      style={{
        width: '100%',
        padding: 'var(--card-option-padding, 14px 20px)',
        borderRadius: 14,
        border: `2px solid ${isSelected ? 'var(--color-brand)' : 'rgba(147,0,24,0.35)'}`,
        backgroundColor: isSelected ? 'rgba(147,0,24,0.06)' : 'transparent',
        textAlign: 'center',
        cursor: 'pointer',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        fontSize: 'var(--card-option-fontsize, 13px)',
        fontWeight: 600,
        color: 'var(--color-brand)',
        lineHeight: 1.5,
        transition: 'background-color 0.15s, border-color 0.15s',
      }}
    >
      {opt.text}
    </motion.button>
  )
}

// ── Revealed option block (revealed phase) ────────────────────────────────────
function RevealedOption({ opt, isChosen }) {
  return (
    <div style={{
      border: `1.5px solid ${isChosen ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}`,
      borderRadius: 14,
      padding: 'var(--revealed-option-padding, 14px 16px)',
      opacity: isChosen ? 1 : 0.5,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--revealed-option-gap, 7px)',
      textAlign: 'center',
    }}>
      <p style={{
        fontFamily: '"DM Sans", system-ui, sans-serif',
        fontSize: 'var(--revealed-option-fontsize, 12px)',
        fontWeight: 700,
        color: 'var(--color-bg-primary)',
        lineHeight: 1.4,
        margin: 0,
      }}>
        "{opt.text}"
      </p>
      <p style={{
        fontFamily: '"DM Sans", system-ui, sans-serif',
        fontSize: 'var(--revealed-message-fontsize, 11px)',
        color: 'rgba(255,222,229,0.9)',
        lineHeight: 1.5,
        margin: 0,
      }}>
        {opt.educationalMessage}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{
          display: 'inline-block',
          border: '1.5px solid rgba(255,255,255,0.5)',
          borderRadius: 999,
          padding: 'var(--revealed-pill-padding, 4px 14px)',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: 'var(--revealed-pill-fontsize, 12px)',
          fontWeight: 600,
          color: 'var(--color-bg-primary)',
        }}>
          {getChoiceOutcomeLabel(opt.outcome)}
        </span>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChoiceCard({ card, selectedOption, phase, onSelectOption }) {
  const isRevealed = phase === 'revealed' || phase === 'animating'

  return (
    <div style={{
      perspective: 1000,
      width: '100%',
      maxWidth: 320,
      marginInline: 'auto',
      height: 'var(--card-height)',
    }}>
      <motion.div
        initial={false}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {/* ── FRONT (reading) ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}>
          <CardShell bg="var(--color-bg-primary)">
            {/* Top: crown + type label */}
            <TypeHeader label="Scenario" subtitle="You Set the Temperature" />

            {/* Middle: title + description */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 0',
            }}>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </div>

            {/* Bottom: option buttons */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--card-option-gap, 10px)' }}>
              {card.options.map(opt => (
                <OptionButton
                  key={opt.id}
                  opt={opt}
                  isSelected={selectedOption === opt.id}
                  onSelect={onSelectOption}
                />
              ))}
            </div>
          </CardShell>
        </div>

        {/* ── BACK (revealed) ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}>
          <div style={{
            backgroundColor: 'var(--color-brand)',
            border: '2px solid var(--color-brand)',
            borderRadius: 20,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'var(--card-revealed-padding, 28px 20px)',
            overflowY: 'auto',
            boxSizing: 'border-box',
            boxShadow: CARD_SHADOW,
          }}>
            <h2 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'var(--card-revealed-title-size, 24px)',
              fontWeight: 700,
              color: 'var(--color-bg-primary)',
              lineHeight: 1.2,
              marginBottom: 'var(--card-revealed-title-mb, 20px)',
              textAlign: 'center',
            }}>
              {card.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-revealed-gap, 12px)' }}>
              {card.options.map(opt => (
                <RevealedOption
                  key={opt.id}
                  opt={opt}
                  isChosen={selectedOption === opt.id}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
