import { useState } from 'react'
import { motion } from 'framer-motion'
import ResponsiveGauge from '../gauge/ResponsiveGauge'
import EnvironmentCard from '../cards/EnvironmentCard'
import DemoFeedbackModal from './DemoFeedbackModal'

const MOCK_ENV_CARDS = [
  {
    id: 'demo-env-freeze',
    type: 'environment',
    title: 'Skeleton Crew Morning',
    description:
      'Half the team called in last night. The floor is quiet, tasks are piling up, and the mood is flat before the day even starts.',
    energyImpact: -2,
  },
  {
    id: 'demo-env-meltdown',
    type: 'environment',
    title: 'Morning Rush',
    description:
      'Three team members called out sick. The line is out the door and guests are growing restless.',
    energyImpact: 2,
  },
]

export default function EnvDemoStep({ onNext, startEnergy = 0 }) {
  const [cardIdx, setCardIdx] = useState(0)
  const [understood, setUnderstood] = useState(false)
  const [energy, setEnergy] = useState(startEnergy)

  const card = MOCK_ENV_CARDS[cardIdx]
  const isLast = cardIdx === MOCK_ENV_CARDS.length - 1

  const handleUnderstood = () => {
    setEnergy(prev => Math.max(-5, Math.min(5, prev + card.energyImpact)))
    setUnderstood(true)
  }

  const handleNext = () => {
    if (isLast) {
      onNext()
    } else {
      setCardIdx(i => i + 1)
      setUnderstood(false)
    }
  }

  const impactLabel = card.energyImpact > 0
    ? `+${card.energyImpact} Store Energy`
    : `${card.energyImpact} Store Energy`

  const feedbackBody = isLast
    ? "Environment cards happen regardless of what you do. You can't choose them — but every round, your response to them is still yours to own."
    : "Energy can drop just as fast as it rises. Either way, the environment card is out of your hands — what happens next is still yours to shape."

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '4px 20px 8px',
        minHeight: 0,
      }}
    >
      {/* Step badge */}
      <p
        style={{
          fontFamily: '"Poppins", system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.11em',
          textTransform: 'uppercase',
          color: 'var(--gauge-cold-deep)',
          textAlign: 'center',
          marginBottom: 10,
        }}
      >
        Demo · Round 2 — Environment Card {cardIdx + 1}/{MOCK_ENV_CARDS.length}
      </p>

      {/* Gauge — inherits energy from choice demo; bar on short, arc on tall */}
      <ResponsiveGauge energy={energy} />

      {/* Context line */}
      <p
        style={{
          fontFamily: '"Poppins", system-ui, sans-serif',
          fontSize: 13,
          color: 'rgba(64,0,15,0.55)',
          textAlign: 'center',
          lineHeight: 1.6,
          margin: '6px 8px 16px',
        }}
      >
        {understood
          ? 'This shifted the store energy — outside your control.'
          : "Now something happens that you didn't choose and can't stop."}
      </p>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <EnvironmentCard card={card} />
        <DemoFeedbackModal
          visible={understood}
          impact={impactLabel}
          body={feedbackBody}
          onNext={handleNext}
          nextLabel={isLast ? 'Next →' : 'See Another →'}
        />
      </div>

      {/* Action button */}
      <div style={{ marginTop: 16, flexShrink: 0, paddingBottom: 32 }}>
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: understood ? 0.3 : 1, y: 0 }}
          whileTap={understood ? {} : { scale: 0.97 }}
          onClick={understood ? undefined : handleUnderstood}
          disabled={understood}
          style={{
            width: '100%',
            padding: '17px',
            borderRadius: 16,
            border: 'none',
            backgroundColor: 'var(--color-brand)',
            color: 'var(--color-bg-primary)',
            fontFamily: '"Lora", Georgia, serif',
            fontSize: 18,
            fontWeight: 700,
            cursor: understood ? 'default' : 'pointer',
            boxShadow: understood ? 'none' : '0 4px 18px rgba(147,0,24,0.28)',
          }}
        >
          Understood
        </motion.button>
      </div>
    </div>
  )
}
