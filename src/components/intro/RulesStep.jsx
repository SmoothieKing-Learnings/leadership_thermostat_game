import { motion } from 'framer-motion'

const RULES = [
  {
    num: '1',
    title: 'Face the scenario',
    body: 'Each shift presents a real moment. One option models steady leadership. The other tips the thermostat the wrong way.',
    color: '#930018',
  },
  {
    num: '2',
    title: 'Two ways to lose a shift',
    body: 'Meltdown — too much stress, panic, or anger. Deep Freeze — apathy, disengagement, lack of care.',
    color: '#004E93',
  },
  {
    num: '3',
    title: 'Three strikes and it breaks',
    body: 'You have 3 lives. Three Meltdown or Deep Freeze moves and the thermostat is gone — team quits, reviews tank, sales plummet.',
    color: '#40000F',
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
          backgroundColor: '#930018',
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
            color: '#fff',
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
          Reach the end of shift 10 with your team intact.
          Your team doesn't need you to be perfect, but they
          do need you to be the steady hand that keeps the team running right.
        </p>
      </motion.div>

      {/* Rules label */}
      <p
        style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: '#930018',
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
                    color: '#40000F',
                    marginBottom: 4,
                    lineHeight: 1.35,
                  }}
                >
                  {rule.title}
                </p>
                <p
                  style={{
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontSize: 13,
                    color: 'rgba(64,0,15,0.58)',
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {rule.body}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
