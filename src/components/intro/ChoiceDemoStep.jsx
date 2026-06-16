import { useState } from 'react'
import { motion } from 'framer-motion'
import ResponsiveGauge from '../gauge/ResponsiveGauge'
import ChoiceCard from '../cards/ChoiceCard'
import DemoFeedbackModal from './DemoFeedbackModal'

const MOCK_CHOICE = {
  id: 'demo-choice',
  type: 'choice',
  title: 'The $80 Mistake',
  description:
    'A new team member just dropped a full container of expensive collagen. They look like they\'re about to cry.',
  options: [
    {
      id: 'a',
      text: 'Help clean it and share a mistake you made.',
      energyImpact: 0,
      outcome: 'success',
      educationalMessage:
        'You lowered the pressure. You prioritized the person over the product, making it safe for them to keep learning.',
    },
    {
      id: 'b',
      text: 'Sigh and add it to the next order.',
      energyImpact: 1,
      outcome: 'meltdown',
      educationalMessage:
        'Your visible frustration spiked their anxiety. The team member goes home crying. Helping clean would have lowered the tension and built trust.',
    },
  ],
}

export default function ChoiceDemoStep({ onNext }) {
  const [selectedOption, setSelectedOption] = useState(null)
  const [phase, setPhase] = useState('reading')
  const [energy, setEnergy] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [modalImpact, setModalImpact] = useState('')
  const [modalBody, setModalBody] = useState('')

  const hasSelection = selectedOption !== null
  const isRevealed = phase === 'revealed'

  const handleConfirm = () => {
    const opt = MOCK_CHOICE.options.find(o => o.id === selectedOption)
    if (!opt) return

    const delta = typeof opt.energyImpact === 'number' ? opt.energyImpact : 0
    const newEnergy = Math.max(-5, Math.min(5, delta))

    setPhase('revealed')
    setEnergy(newEnergy)

    let impactLabel
    if (opt.outcome === 'meltdown') impactLabel = 'Meltdown move · +1 Heat'
    else if (opt.outcome === 'freeze') impactLabel = 'Deep Freeze move · −1 Energy'
    else impactLabel = 'Steady · You set it'

    setModalImpact(impactLabel)
    setModalBody(opt.educationalMessage)

    setTimeout(() => setShowModal(true), 650)
  }

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
          color: 'var(--color-brand)',
          textAlign: 'center',
          marginBottom: 10,
        }}
      >
        Demo · Shift 1 — Your Move
      </p>

      {/* Gauge — starts at 0; bar on short screens, arc on tall (matches game) */}
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
        {isRevealed
          ? 'Your choice set the temperature. See the consequence below.'
          : 'Pick a response. One sets the thermostat — the other tips it.'}
      </p>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <ChoiceCard
          card={MOCK_CHOICE}
          selectedOption={selectedOption}
          phase={phase}
          onSelectOption={isRevealed ? () => {} : setSelectedOption}
          compact
        />
        <DemoFeedbackModal
          visible={showModal}
          impact={modalImpact}
          body={modalBody}
          onNext={onNext}
        />
      </div>

      {/* Action button — matches fixed footer position */}
      <div style={{ marginTop: 16, flexShrink: 0, paddingBottom: 32 }}>
        <motion.button
          animate={{ opacity: hasSelection && !isRevealed ? 1 : 0.3 }}
          whileTap={hasSelection && !isRevealed ? { scale: 0.97 } : {}}
          onClick={hasSelection && !isRevealed ? handleConfirm : undefined}
          disabled={isRevealed}
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
            cursor: hasSelection && !isRevealed ? 'pointer' : 'default',
            boxShadow: hasSelection && !isRevealed ? '0 4px 18px rgba(147,0,24,0.28)' : 'none',
          }}
        >
          {isRevealed ? 'Confirmed' : hasSelection ? 'Confirm Choice' : 'Select an option above'}
        </motion.button>
      </div>
    </div>
  )
}
