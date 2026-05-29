import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import EnvironmentCard from '../cards/EnvironmentCard.jsx'
import ChoiceCard from '../cards/ChoiceCard.jsx'

const ROTATIONS = [-6, 4, -3, 5, -2, 6, -4, 3, -5, 7]

// ── Card renderer (shared between collapsed and expanded) ─────────────────────

function HistoryCardView({ entry }) {
  if (entry.type === 'environment') {
    return <EnvironmentCard card={entry} />
  }
  return (
    <ChoiceCard
      card={entry}
      selectedOption={entry.chosenOptionId}
      phase="revealed"
      onSelectOption={() => {}}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HistoryStack({ history, isExpanded, onToggle }) {
  const scrollRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)

  // Most-recent card first
  const orderedHistory = [...history].reverse()

  // Snap to start (most recent) whenever log opens
  useEffect(() => {
    if (isExpanded && scrollRef.current) {
      scrollRef.current.scrollLeft = 0
      setActiveIdx(0)
    }
  }, [isExpanded])

  // Track which card is centred
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    // card slot width = 78% of container + 12px gap
    const slotWidth = el.clientWidth * 0.78 + 12
    setActiveIdx(Math.round(el.scrollLeft / slotWidth))
  }

  const visibleStack = history.slice(-4)

  return (
    <div className="absolute inset-0" style={{ pointerEvents: isExpanded ? 'auto' : 'none' }}>

      {/* ── COLLAPSED: fanned stack ── */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-start justify-center"
            style={{ zIndex: 1, paddingTop: 'var(--card-area-pt)' }}
          >
            <div style={{
              position: 'relative',
              width: 'calc(100% - 2 * var(--card-area-px))',
              height: 'var(--card-height)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {visibleStack.map((entry, i) => {
                const stackDepth = visibleStack.length - 1 - i
                const rotation = ROTATIONS[(entry.roundNumber ?? i) % ROTATIONS.length]
                return (
                  <motion.div
                    key={entry.roundNumber ?? i}
                    initial={{ scale: 1.05, opacity: 0, y: -16 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      y: stackDepth * -3,
                      x: stackDepth * 2,
                      rotate: rotation,
                    }}
                    transition={{ type: 'spring', damping: 22, stiffness: 120 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: i,
                      pointerEvents: 'none',
                    }}
                  >
                    <HistoryCardView entry={entry} />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EXPANDED: horizontal carousel (portal escapes transform context) ── */}
      {createPortal(
        <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              backgroundColor: 'var(--color-bg-primary)',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'auto',
              maxWidth: 480,
              marginInline: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px 10px',
              flexShrink: 0,
            }}>
              <div>
                <p style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--color-brand)',
                  margin: 0,
                  lineHeight: 1.2,
                }}>
                  Leadership Log
                </p>
                <p style={{
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontSize: 11,
                  color: 'rgba(147,0,24,0.5)',
                  margin: 0,
                  marginTop: 2,
                  letterSpacing: '0.05em',
                }}>
                  {history.length} round{history.length !== 1 ? 's' : ''} played
                </p>
              </div>
              <button
                onClick={onToggle}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '2px solid rgba(147,0,24,0.3)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-brand)',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            {/* Horizontal card carousel */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              style={{
                flex: 1,
                display: 'flex',
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                gap: 12,
                paddingInline: '11%',
                alignItems: 'center',
              }}
            >
              {orderedHistory.map((entry) => (
                <div
                  key={entry.roundNumber}
                  style={{
                    flexShrink: 0,
                    width: '78%',
                    scrollSnapAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {/* Round + type badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}>
                    <span style={{
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: entry.type === 'environment' ? 'var(--gauge-cold-deep)' : 'var(--color-brand)',
                      border: `1.5px solid ${entry.type === 'environment' ? 'rgba(0,78,147,0.25)' : 'rgba(147,0,24,0.25)'}`,
                      borderRadius: 999,
                      padding: '3px 12px',
                    }}>
                      Round {entry.roundNumber} · {entry.type === 'environment' ? 'Environment' : 'Scenario'}
                    </span>
                  </div>

                  {/* Card */}
                  <HistoryCardView entry={entry} />
                </div>
              ))}
            </div>

            {/* Dot indicators */}
            {history.length > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 5,
                padding: '10px 0 16px',
                flexShrink: 0,
              }}>
                {orderedHistory.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width: i === activeIdx ? 16 : 5,
                      backgroundColor: i === activeIdx ? 'var(--color-brand)' : 'rgba(147,0,24,0.2)',
                    }}
                    transition={{ duration: 0.2 }}
                    style={{ height: 5, borderRadius: 99 }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  )
}
