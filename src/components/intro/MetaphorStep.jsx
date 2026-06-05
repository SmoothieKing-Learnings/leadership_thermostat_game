import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import GaugeArc from '../gauge/GaugeArc'

// Oscillating sequence to show the gauge "alive"
const DEMO_SEQUENCE = [0, 2, 3, 1, -1, -3, -1, 1, 0]

// ── Mini card preview ─────────────────────────────────────────────────────────
// A compact, non-interactive card sample used in the legend below.
function MiniCard({ bg, borderColor, label, title, pillText, pillColor, pillBg, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      style={{
        backgroundColor: bg,
        border: `2px solid ${borderColor}`,
        borderRadius: 14,
        padding: '12px 10px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        minWidth: 0,
        boxShadow: '0 4px 10px rgba(64,0,15,0.14), 0 12px 28px rgba(64,0,15,0.10)',
      }}
    >
      {/* Concept label — the key takeaway */}
      <p style={{
        fontFamily: '"Poppins", system-ui, sans-serif',
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--color-brand)',
        margin: 0,
        textAlign: 'center',
      }}>
        {label}
      </p>

      {/* Detail title */}
      <p style={{
        fontFamily: '"Lora", Georgia, serif',
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--color-brand-deep)',
        lineHeight: 1.3,
        textAlign: 'center',
        margin: '6px 0',
        opacity: 0.75,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
      }}>
        {title}
      </p>

      {/* Detail pill */}
      <div style={{
        backgroundColor: pillBg,
        color: pillColor,
        border: `1.5px solid ${pillColor}33`,
        borderRadius: 99,
        padding: '3px 9px',
        fontSize: 8,
        fontFamily: '"Poppins", system-ui, sans-serif',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}>
        {pillText}
      </div>
    </motion.div>
  )
}

// ── Step ──────────────────────────────────────────────────────────────────────
export default function MetaphorStep() {
  const [demoIdx, setDemoIdx] = useState(0)
  const [accordionOpen, setAccordionOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setDemoIdx(i => (i + 1) % DEMO_SEQUENCE.length)
    }, 1500)
    return () => clearInterval(timer)
  }, [])

  const energy = DEMO_SEQUENCE[demoIdx]

  return (
    <div style={{ padding: '4px 24px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Live gauge */}
      <GaugeArc energy={energy} />

      {/* Headline */}
      <h2 style={{
        fontFamily: '"Lora", Georgia, serif',
        fontSize: 26,
        fontWeight: 700,
        color: 'var(--color-brand)',
        lineHeight: 1.25,
        textAlign: 'center',
        margin: '8px 0 12px',
      }}>
        You Are the Thermostat
      </h2>

      {/* Body — moved from welcome landing so the tutorial leads with how the team responds */}
      <p style={{
        fontFamily: '"Poppins", system-ui, sans-serif',
        fontSize: 13.5,
        color: 'var(--color-brand-deep)',
        lineHeight: 1.7,
        textAlign: 'left',
        marginBottom: 14,
        opacity: 0.85,
      }}>
        Your team is constantly scanning you. If you walk in with high tension or
        frustration, the energy of the entire crew will rise to match that stress.
        If you're disengaged or "checked out," the team will freeze and stop caring.
      </p>
      <p style={{
        fontFamily: '"Poppins", system-ui, sans-serif',
        fontSize: 13.5,
        color: 'var(--color-brand-deep)',
        lineHeight: 1.7,
        textAlign: 'left',
        marginBottom: 24,
        opacity: 0.85,
      }}>
        By staying steady and leading through care, you model the emotional
        resilience your team needs to perform their best. When you set a
        temperature of calm and encouragement, you give your team the confidence
        to win the shift.
      </p>

      {/* ── Three outcome legend — Deep Freeze · Steady · Meltdown ── */}
      <div style={{ display: 'flex', gap: 5, alignItems: 'stretch', marginBottom: 20 }}>
        {/* Blue — deep freeze move */}
        <MiniCard
          bg="var(--color-blue-light)"
          borderColor="rgba(0,78,147,0.35)"
          label="Deep Freeze"
          title="Apathy, disengagement"
          pillText="Energy drops"
          pillColor="var(--gauge-cold-deep)"
          pillBg="var(--color-bg-primary)"
          delay={0.05}
        />
        {/* Cream — steady / balance */}
        <MiniCard
          bg="var(--color-bg-primary)"
          borderColor="rgba(147,0,24,0.35)"
          label="Steady"
          title="Calm, care, clarity"
          pillText="You set it"
          pillColor="var(--color-brand)"
          pillBg="var(--color-pink-light)"
          delay={0.12}
        />
        {/* Pink — meltdown move */}
        <MiniCard
          bg="var(--color-pink-light)"
          borderColor="rgba(147,0,24,0.35)"
          label="Meltdown"
          title="Stress, anger, panic"
          pillText="Heat rises"
          pillColor="var(--color-brand)"
          pillBg="var(--color-bg-primary)"
          delay={0.19}
        />
      </div>

      {/* Caption rows — match legend order (Deep Freeze · Steady · Meltdown) */}
      {[
        { dot: 'var(--gauge-cold-deep)', dotBg: 'var(--color-blue-light)', text: 'Show up checked-out and the team freezes and stops caring.' },
        { dot: 'var(--color-brand)', dotBg: 'var(--color-bg-primary)', text: 'Stay steady and you give them confidence to win the shift.' },
        { dot: 'var(--color-brand)', dotBg: 'var(--color-pink-light)', text: 'Walk in tense and the whole crew rises to match it.' },
      ].map(({ dot, dotBg, text }, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 + i * 0.08, duration: 0.3 }}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: dotBg,
            border: `2px solid ${dot}`,
            flexShrink: 0,
            marginTop: 4,
          }} />
          <p style={{
            fontFamily: '"Poppins", system-ui, sans-serif',
            fontSize: 13,
            color: 'var(--color-brand-deep)',
            lineHeight: 1.6,
            margin: 0,
            opacity: 0.8,
          }}>
            {text}
          </p>
        </motion.div>
      ))}

      {/* ── "Why does this matter?" accordion ── */}
      <div style={{
        border: '1.5px solid rgba(147,0,24,0.18)',
        borderRadius: 14,
        overflow: 'hidden',
        marginTop: 8,
      }}>
        {/* Header */}
        <button
          onClick={() => setAccordionOpen(o => !o)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            gap: 8,
          }}
        >
          <span style={{
            fontFamily: '"Poppins", system-ui, sans-serif',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--color-brand)',
            textAlign: 'left',
          }}>
            Why does this matter in real life?
          </span>
          <span style={{
            fontSize: 18,
            color: 'var(--color-brand)',
            flexShrink: 0,
            lineHeight: 1,
            transform: accordionOpen ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.2s ease',
          }}>
            ↑
          </span>
        </button>

        {/* Body */}
        {accordionOpen && (
          <div style={{
            padding: '0 16px 16px',
            borderTop: '1px solid rgba(147,0,24,0.12)',
          }}>
            <p style={{
              fontFamily: '"Poppins", system-ui, sans-serif',
              fontSize: 14,
              color: 'var(--color-brand-deep)',
              lineHeight: 1.75,
              margin: '12px 0 12px',
            }}>
              Emotions move through teams the way temperature moves through a room: quietly and automatically. When a manager walks in tense, stress hormones in the brain spike across the team within minutes. Things start to slip. People pull back.
            </p>
            <p style={{
              fontFamily: '"Poppins", system-ui, sans-serif',
              fontSize: 14,
              color: 'var(--color-brand-deep)',
              lineHeight: 1.75,
              margin: 0,
            }}>
              When you stay <strong>steady</strong> (not robotic, just grounded), your team has permission to stay calm too. That's not soft leadership. That's the <strong>most powerful lever</strong> you have as a manager.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
