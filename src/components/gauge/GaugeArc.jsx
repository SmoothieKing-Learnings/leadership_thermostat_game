// GaugeArc — filled half-circle with high-fidelity design metrics
// Matches the blue-white-red gradient, radial markers, and detailed labeling from the reference image.

import { useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'

// NEEDLE_TRANSITION_MS must match the CSS transition on the needle <g> below.
// The shake waits this long so the needle finishes moving before the wrapper shakes.
const NEEDLE_TRANSITION_MS = 820

const shakeVariants = {
  warn:   { x: [0, -2, 2, -1.5, 1.5, 0], rotate: [0, -0.4, 0.4, -0.3, 0.3, 0] },
  danger: { x: [0, -4, 4, -3, 3, -2, 2, 0], rotate: [0, -0.8, 0.8, -0.6, 0.6, -0.4, 0.4, 0] },
}

export default function GaugeArc({ energy }) {
  const R = 114
  const CX = 140
  const CY = 152

  // Semicircle path
  const semicircle = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY} Z`

  // Needle angle: -90 (frozen/left) -> 0 (balance) -> 90 (meltdown/right)
  const angle = (energy / 5) * 90

  // Tick marks and labels positions
  const TICKS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]

  // 3-state gauge: shake at the strong "danger" level any time the pin is
  // off Balance. The pin doesn't escalate within a state, so this is the only
  // shake level that fires.
  const absEnergy = Math.abs(energy)
  const shakeKey = absEnergy > 0.01 ? 'danger' : 'calm'

  // Imperative animation controls — no key-based remount needed
  const controls = useAnimation()
  const timerRef = useRef(null)

  useEffect(() => {
    // Clear any pending shake that hasn't fired yet
    if (timerRef.current) clearTimeout(timerRef.current)

    // Stop the current shake and reset wrapper to neutral instantly
    controls.stop()
    controls.set({ x: 0, rotate: 0 })

    if (shakeKey === 'calm') return  // nothing more to do

    // Wait for the needle CSS transition to finish, then start shaking
    timerRef.current = setTimeout(() => {
      const duration     = shakeKey === 'danger' ? 0.35 : 0.5
      const repeatDelay  = shakeKey === 'danger' ? 0.6  : 1.2
      controls.start({
        ...shakeVariants[shakeKey],
        transition: { duration, repeat: Infinity, repeatDelay, ease: 'easeInOut' },
      })
    }, NEEDLE_TRANSITION_MS)

    return () => clearTimeout(timerRef.current)
  }, [energy])   // run on every energy change so shake always yields to needle first

  return (
    <motion.div
      animate={controls}
      className="flex flex-col items-center w-full"
      style={{ padding: '0 0 2px' }}
    >
      <svg
        viewBox="0 0 280 185"
        width="100%"
        style={{ maxWidth: 290, display: 'block', overflow: 'visible' }}
        aria-label={`Store Energy: ${energy}`}
      >
        <defs>
          {/* Blue (Left) -> White (Center) -> Red (Right) */}
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#AABBFF" />
            <stop offset="42%"  stopColor="#E6ECFF" />
            <stop offset="50%"  stopColor="#FFFFFF" />
            <stop offset="58%"  stopColor="#FFE6E9" />
            <stop offset="100%" stopColor="#FF667D" />
          </linearGradient>

          {/* Mask for the center hole */}
          <mask id="gaugeMask">
            <rect width="280" height="185" fill="white" />
            <circle cx={CX} cy={CY} r="18" fill="black" />
          </mask>
        </defs>

        {/* Shadow/Outline underlying */}
        <path
          d={`M ${CX - R - 2} ${CY} A ${R + 2} ${R + 2} 0 0 1 ${CX + R + 2} ${CY} Z`}
          fill="rgba(64,0,15,0.03)"
        />

        {/* Main colored gauge */}
        <path d={semicircle} fill="url(#gaugeGrad)" mask="url(#gaugeMask)" />

        {/* Radial tick lines (no numeric labels) */}
        {TICKS.map((val) => {
          const a = (val / 5) * 90 - 90
          const rad = (a * Math.PI) / 180
          const x2 = CX + R * Math.cos(rad)
          const y2 = CY + R * Math.sin(rad)
          const x1 = CX + 24 * Math.cos(rad)
          const y1 = CY + 24 * Math.sin(rad)
          return (
            <line
              key={val}
              x1={x1} y1={y1}
              x2={x2} y2={y2}
              stroke="rgba(147,0,24,0.12)"
              strokeWidth="1"
            />
          )
        })}

        {/* Bottom Semantic Labels */}
        <g style={{ opacity: 0.8 }}>
          <text
            x={20} y={170}
            style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 9, fontWeight: 800, fill: '#004E93', textAnchor: 'start' }}
          >
            <tspan x={20} dy="0">Disengaged</tspan>
            <tspan x={20} dy="11">Deepfreeze</tspan>
          </text>
          <text
            x={260} y={170}
            style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 9, fontWeight: 800, fill: '#930018', textAnchor: 'end' }}
          >
            <tspan x={260} dy="0">Messy</tspan>
            <tspan x={260} dy="11">Meltdown</tspan>
          </text>
        </g>

        {/* Tapered Rounded Needle */}
        <g
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: `${CX}px ${CY}px`,
            transition: 'transform 800ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <path
            d={`
              M ${CX - 5} ${CY} 
              A 5 5 0 0 0 ${CX + 5} ${CY}
              L ${CX + 1.5} ${CY - R + 26}
              A 1.5 1.5 0 0 0 ${CX - 1.5} ${CY - R + 26}
              Z
            `}
            fill="#930018"
          />
        </g>

        {/* Semi-circular Hub Cover */}
        <path
           d={`M ${CX - 18} ${CY} A 18 18 0 0 1 ${CX + 18} ${CY} Z`}
           fill="#FFF9EF"
        />
        <circle cx={CX} cy={CY} r="6"  fill="#40000F" />
        <circle cx={CX} cy={CY} r="2"  fill="#FFF9EF" />
      </svg>
    </motion.div>
  )
}
