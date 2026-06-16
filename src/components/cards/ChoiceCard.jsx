import { motion } from 'framer-motion'
import CardShell, { TypeHeader, CardTitle, CardDescription, CARD_SHADOW } from './CardShell.jsx'
import { useShortViewport } from '../../utils/useViewport.js'

// 3-state outcome label for the revealed option pill — no numbers, just the
// temperature state that the chosen option drives the gauge to.
export function getChoiceOutcomeLabel(outcome) {
  if (outcome === 'meltdown') return 'Meltdown'
  if (outcome === 'freeze')   return 'Deep Freeze'
  return 'Balance'
}

// ── Option button (reading phase) ─────────────────────────────────────────────
// `fill` makes the button grow to share the available vertical space (used on
// short viewports where the type header is hidden and options expand to fit).
function OptionButton({ opt, isSelected, onSelect, fill = false }) {
  return (
    <motion.button
      onClick={() => onSelect(opt.id)}
      whileTap={{ scale: 0.98 }}
      animate={{ scale: isSelected ? 1.02 : 1 }}
      transition={{ duration: 0.15 }}
      style={{
        width: '100%',
        flex: fill ? '1 1 0' : '0 0 auto',
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--card-option-padding, 14px 20px)',
        borderRadius: 14,
        border: `2px solid ${isSelected ? 'var(--color-brand)' : 'rgba(147,0,24,0.35)'}`,
        backgroundColor: isSelected ? 'rgba(147,0,24,0.06)' : 'transparent',
        textAlign: 'center',
        cursor: 'pointer',
        fontFamily: '"Poppins", system-ui, sans-serif',
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
        fontFamily: '"Poppins", system-ui, sans-serif',
        fontSize: 'var(--revealed-option-fontsize, 12px)',
        fontWeight: 700,
        color: 'var(--color-bg-primary)',
        lineHeight: 1.4,
        margin: 0,
      }}>
        "{opt.text}"
      </p>
      <p style={{
        fontFamily: '"Poppins", system-ui, sans-serif',
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
          fontFamily: '"Poppins", system-ui, sans-serif',
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

// Compact typography/spacing tokens — mirror the `@media (max-height: 800px)`
// block in index.css. Applied inline when `compact` is set so the fixed-size
// intro card always uses the space-saving sizes regardless of viewport height
// (CSS media queries can't see the card's own box, only the viewport).
const COMPACT_VARS = {
  '--card-title-size': '22px',
  '--card-desc-size': '15px',
  '--card-padding': '14px 16px',
  '--card-option-padding': '11px 16px',
  '--card-option-fontsize': '13px',
  '--card-option-gap': '7px',
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChoiceCard({ card, selectedOption, phase, onSelectOption, compact = false }) {
  const isRevealed = phase === 'revealed' || phase === 'animating'
  // `compact` forces the space-saving layout (no type header, options fill) even
  // on tall screens — used inside the fixed-size intro card so the demo never
  // overflows. In the game it's driven purely by viewport height.
  const isShort = compact || useShortViewport(800)

  return (
    <div style={{
      perspective: 1000,
      width: '100%',
      maxWidth: 320,
      marginInline: 'auto',
      // Fill the available card-area height (capped) instead of a fixed height,
      // so the tallest of the front/back faces has the most room before scroll.
      height: '100%',
      maxHeight: 'var(--card-max-height, 500px)',
      ...(compact ? COMPACT_VARS : {}),
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
          <CardShell bg="var(--color-bg-primary)" style={{ height: '100%' }}>
            {/* Top: crown + type label — hidden on short viewports to reclaim space */}
            {!isShort && <TypeHeader label="Scenario" subtitle="You Set the Temperature" />}

            {/* Middle: title + description.
                On short screens it takes natural height (top-aligned) so the
                options below can grow into the remaining space. */}
            <div style={{
              flex: isShort ? '0 0 auto' : 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 0',
            }}>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </div>

            {/* Bottom: option buttons. On short screens they flex-grow to fill
                the freed space so the card never needs to scroll. */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--card-option-gap, 10px)',
              flex: isShort ? '1 1 auto' : '0 0 auto',
              minHeight: 0,
            }}>
              {card.options.map(opt => (
                <OptionButton
                  key={opt.id}
                  opt={opt}
                  isSelected={selectedOption === opt.id}
                  onSelect={onSelectOption}
                  fill={isShort}
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
              fontFamily: '"Lora", Georgia, serif',
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
