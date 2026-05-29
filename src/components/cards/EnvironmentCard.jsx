import { motion } from 'framer-motion'
import CardShell, { TypeHeader, CardTitle, CardDescription, ImpactPill } from './CardShell.jsx'

export function getEnvImpactLabel(impact) {
  if (impact > 0) return `+${impact} (Meltdown)`
  if (impact < 0) return `${impact} (Deepfreeze)`
  return '0 (Balanced)'
}

// Card background reflects impact direction — blue = drains energy, pink = raises energy
export function getEnvBg(energyImpact) {
  if (energyImpact > 0) return 'var(--color-pink-light)'
  if (energyImpact < 0) return 'var(--color-blue-light)'
  return 'var(--color-bg-primary)'
}

// Pill uses white bg so it pops against the coloured card background
function getEnvPill(energyImpact) {
  if (energyImpact > 0) return { bgColor: 'var(--win-accent-light)', color: 'var(--color-brand)', borderColor: 'rgba(147,0,24,0.25)' }
  if (energyImpact < 0) return { bgColor: 'var(--gauge-cold-mid)', color: 'var(--gauge-cold-deep)', borderColor: 'rgba(0,78,147,0.25)' }
  return { bgColor: 'var(--card-aged)', color: 'var(--gauge-warm-deep)', borderColor: 'rgba(26,107,42,0.25)' }
}

export default function EnvironmentCard({ card }) {
  const bg   = getEnvBg(card.energyImpact)
  const pill = getEnvPill(card.energyImpact)

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 110 }}
      style={{ width: '100%' }}
    >
      <CardShell bg={bg}>
        {/* Top: crown + type label */}
        <TypeHeader label="Environment" subtitle="Out of Your Control" />

        {/* Middle: title + description */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 0',
        }}>
          <CardTitle>{card.title}</CardTitle>
          <CardDescription>{card.description}</CardDescription>
        </div>

        {/* Bottom: filled impact pill */}
        <ImpactPill bgColor={pill.bgColor} color={pill.color} borderColor={pill.borderColor}>
          {getEnvImpactLabel(card.energyImpact)}
        </ImpactPill>
      </CardShell>
    </motion.div>
  )
}
