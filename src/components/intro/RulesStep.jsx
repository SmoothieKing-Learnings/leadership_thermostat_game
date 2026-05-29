import { motion } from 'framer-motion'

const RULES = [
  {
    num: '1',
    title: 'Face the Scenario',
    body: "Each round presents a real-world situation. You'll have two options. One choice models stable leadership. The other choice will tip the thermostat in the wrong direction.",
    color: 'var(--color-brand)',
  },
  {
    num: '2',
    title: 'Watch the Thermostat',
    body: 'There are two ways to lose a shift:',
    bullets: [
      {
        label: 'The Meltdown',
        text: 'Choose a path that adds too much stress, panic, or anger and the shift will end in a meltdown.',
        color: 'var(--color-brand)',
      },
      {
        label: 'The Deep Freeze',
        text: 'Choose a path that leads to apathy, disengagement, or a lack of care and the shift will end in a deep freeze.',
        color: 'var(--gauge-cold-deep)',
      },
    ],
    color: 'var(--gauge-cold-deep)',
  },
  {
    num: '3',
    title: 'Three Strikes and Our Culture is Lost',
    body: 'You have 3 lives. If you make three "Meltdown" or "Deep Freeze" moves within the 10 shifts, the thermostat breaks. Team members will quit, reviews tank, and sales plummet.',
    color: 'var(--color-brand-deep)',
  },
]

export default function RulesStep() {
  return (
    <div style={{ padding: '4px 24px 16px', display: 'flex', flexDirection: 'column' }}>

      {/* Goal block */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          backgroundColor: 'var(--color-brand)',
          borderRadius: 20,
          padding: '24px 22px 26px',
          marginBottom: 28,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.55)',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Your Goal
        </p>
        <h2
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 30,
            fontWeight: 800,
            color: 'var(--color-bg-primary)',
            lineHeight: 1.2,
            marginBottom: 12,
          }}
        >
          Survive 10 Shifts
        </h2>
        <p
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 14,
            color: 'rgba(255,222,229,0.9)',
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Survive 10 shifts by role-modeling choices that keep the team's
          energy balanced.
        </p>
      </motion.div>

      {/* Rules label */}
      <p
        style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: 'var(--color-brand)',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}
      >
        How to Play
      </p>

      {/* Rule rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {RULES.map((rule, i) => (
          <motion.div
            key={rule.num}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.35 }}
          >
            {/* Divider above each row (skip first) */}
            {i > 0 && (
              <div style={{ height: 1, backgroundColor: 'rgba(147,0,24,0.1)', margin: '0 0' }} />
            )}

            <div
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
                padding: '18px 4px',
              }}
            >
              {/* Large decorative number */}
              <span
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 34,
                  fontWeight: 800,
                  color: rule.color,
                  lineHeight: 1,
                  opacity: 0.22,
                  minWidth: 28,
                  textAlign: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {rule.num}
              </span>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--color-brand-deep)',
                    marginBottom: rule.bullets ? 6 : 4,
                    lineHeight: 1.35,
                  }}
                >
                  {rule.title}
                </p>
                <p
                  style={{
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontSize: 13,
                    color: 'rgba(64,0,15,0.65)',
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {rule.body}
                </p>
                {rule.bullets && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {rule.bullets.map((b) => (
                      <li
                        key={b.label}
                        style={{
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          fontSize: 13,
                          color: 'rgba(64,0,15,0.65)',
                          lineHeight: 1.55,
                        }}
                      >
                        <span style={{ color: b.color, fontWeight: 800 }}>{b.label}:</span> {b.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Closing reminder */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.35 }}
        style={{
          marginTop: 12,
          padding: '18px 18px 20px',
          borderRadius: 16,
          border: '1.5px solid rgba(147,0,24,0.18)',
          backgroundColor: 'rgba(147,0,24,0.04)',
        }}
      >
        <p
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 13,
            color: 'var(--color-brand-deep)',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          Reach the end of shift 10 with your team intact and the energy balanced.
          Your team doesn't need you to be perfect — they need you to be the
          <strong> steady hand</strong> that keeps the team running right.
        </p>
      </motion.div>

      {/* Section teaser */}
      <p
        style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: 'rgba(147,0,24,0.55)',
          textTransform: 'uppercase',
          marginTop: 22,
          marginBottom: 0,
          textAlign: 'center',
        }}
      >
        Next · The Role Model Scenarios
      </p>
    </div>
  )
}
