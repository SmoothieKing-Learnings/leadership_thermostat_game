import { motion } from 'framer-motion'
import logo from '../../assets/logo.png'

export default function LandingStep({ onStart, onTutorial }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center', /* center content vertically inside the 480px-min card */
        padding: 24,              /* matches the quiz LayoutWrapper's p-6 card padding */
        textAlign: 'center',
        gap: 0,
      }}
    >
      {/* Top: brand logo */}
      <motion.img
        src={logo}
        alt="Smoothie King"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45, ease: 'easeOut' }}
        style={{ width: 96, height: 'auto', display: 'block', marginBottom: 20 }}
      />

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45 }}
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 34,
          fontWeight: 800,
          color: '#930018',
          lineHeight: 1.1,
          marginBottom: 16,
        }}
      >
        Setting<br />the Thermostat
      </motion.h1>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
        style={{
          width: 40,
          height: 2,
          backgroundColor: 'rgba(147,0,24,0.25)',
          borderRadius: 99,
          marginBottom: 16,
        }}
      />

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, duration: 0.4 }}
        style={{
          fontFamily: '"DM Sans", system-ui, sans-serif',
          fontSize: 13,
          color: '#40000F',
          lineHeight: 1.65,
          opacity: 0.78,
          maxWidth: 340,
          margin: '0 0 24px',
          textAlign: 'left',
        }}
      >
        At Smoothie King, leaders aren't just a thermometer. A thermometer only
        tells you the temperature. It just shows you how hot or cold it is. As
        a leader, you are the Thermostat. You have the power to set the temperature.
      </motion.p>

      {/* Primary + Secondary CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <motion.button
          onClick={onTutorial}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%',
            padding: '8px',
            border: 'none',
            background: 'transparent',
            color: '#930018',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Learn more &rarr;
        </motion.button>
        <motion.button
          onClick={onStart}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%',
            padding: '17px',
            borderRadius: 16,
            border: 'none',
            backgroundColor: '#930018',
            color: '#fff',
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 19,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(147,0,24,0.28)',
          }}
        >
          Start Shift
        </motion.button>
      </motion.div>
    </div>
  )
}
