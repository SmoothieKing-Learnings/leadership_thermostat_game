// ResponsiveGauge — screen-size-driven gauge display.
// Shows the compact bar on short viewports and the arc on taller ones, mirroring
// the in-game default (useGameState `defaultGaugeView`: bar < 800px tall, arc
// otherwise). Used by the intro demo steps so the tutorial gauge behaves like
// the real game gauge across screen sizes.
import GaugeArc from './GaugeArc'
import GaugeBar from './GaugeBar'
import { useShortViewport } from '../../utils/useViewport.js'

export default function ResponsiveGauge({ energy }) {
  const isShort = useShortViewport(800)
  if (isShort) return <GaugeBar energy={energy} />
  // Cap the arc's width (and therefore its height) so it doesn't dominate the
  // fixed-size intro card and crowd the demo card into an internal scroll.
  return (
    <div style={{ width: '100%', maxWidth: 210, margin: '0 auto' }}>
      <GaugeArc energy={energy} />
    </div>
  )
}
