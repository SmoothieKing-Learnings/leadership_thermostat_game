// GaugeBar — horizontal segmented bar gauge, -5 to +5

import { useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'

// BAR_TRANSITION_MS must match the Tailwind duration-700 on the active indicator below.
// The shake waits this long so the bar finishes sliding before the wrapper shakes.
const BAR_TRANSITION_MS = 720

const shakeVariants = {
  warn:   { x: [0, -2, 2, -1.5, 1.5, 0], rotate: [0, -0.4, 0.4, -0.3, 0.3, 0] },
  danger: { x: [0, -4, 4, -3, 3, -2, 2, 0], rotate: [0, -0.8, 0.8, -0.6, 0.6, -0.4, 0.4, 0] },
}

// Each segment: integer slot from -5 to +4 (10 slots)
const SLOTS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]

export default function GaugeBar({ energy }) {
  const absEnergy = Math.abs(energy)
  const shakeKey = absEnergy >= 2 ? 'danger' : absEnergy >= 1 ? 'warn' : 'calm'

  const controls = useAnimation()
  const timerRef = useRef(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    controls.stop()
    controls.set({ x: 0, rotate: 0 })

    if (shakeKey === 'calm') return

    timerRef.current = setTimeout(() => {
      const duration    = shakeKey === 'danger' ? 0.35 : 0.5
      const repeatDelay = shakeKey === 'danger' ? 0.6  : 1.2
      controls.start({
        ...shakeVariants[shakeKey],
        transition: { duration, repeat: Infinity, repeatDelay, ease: 'easeInOut' },
      })
    }, BAR_TRANSITION_MS)

    return () => clearTimeout(timerRef.current)
  }, [energy])

  return (
    <motion.div animate={controls} className="w-full px-8 py-2">
      {/* Container for the bar and its markers */}
      <div className="relative">

        {/* The Gradient Bar */}
        <div
          className="w-full h-6 rounded-full relative overflow-hidden"
          style={{
            background: 'linear-gradient(to right, #AABBFF 0%, #E6ECFF 42%, #FFFFFF 50%, #FFE6E9 58%, #FF667D 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(64,0,15,0.1), inset 0 2px 4px rgba(64,0,15,0.06)',
            backgroundClip: 'padding-box'
          }}
        >
          {/* Active indicator overlay (Highlighting the current energy zone) */}
          <div 
            className="absolute top-0 bottom-0 transition-all duration-700 ease-out"
            style={{
              left: energy >= 0 ? '50%' : `${50 + (energy / 10) * 100}%`,
              right: energy >= 0 ? `${50 - (energy / 10) * 100}%` : '50%',
              backgroundColor: energy === 0 
                ? 'transparent' 
                : (energy > 0 ? 'rgba(147,0,24,0.22)' : 'rgba(0,78,147,0.22)'),
              // More visible edge markers at the "current" level
              borderLeft: energy < 0 ? '2.5px solid #004E93' : 'none',
              borderRight: energy > 0 ? '2.5px solid #930018' : 'none',
              zIndex: 5
            }}
          />

          {/* Tick Marks (Overlaid on bar) */}
          <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-between pointer-events-none px-[1.5px]">
            {SLOTS.map((val) => (
              <div 
                key={val}
                style={{
                  width: 1,
                  height: val === 0 ? '100%' : '50%',
                  backgroundColor: val === 0 
                    ? '#40000F' 
                    : (val > 0 ? 'rgba(147,0,24,0.12)' : 'rgba(0,78,147,0.12)'),
                  marginTop: 'auto',
                  marginBottom: 'auto'
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Semantic Labels */}
        <div className="flex justify-between w-full mt-3">
          <span
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 9,
              fontWeight: 800,
              color: '#004E93',
              opacity: 0.8,
              lineHeight: 1.2
            }}
          >
            Disengaged<br />Deepfreeze
          </span>
          <span
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 9,
              fontWeight: 800,
              color: '#930018',
              opacity: 0.8,
              textAlign: 'right',
              lineHeight: 1.2
            }}
          >
            Messy<br />Meltdown
          </span>
        </div>
      </div>

    </motion.div>
  )
}
