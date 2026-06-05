import { motion, AnimatePresence } from 'framer-motion'

export default function DemoFeedbackModal({ visible, impact, body, onNext, nextLabel = 'Next →' }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            borderRadius: 20,
            backgroundColor: 'rgba(255,249,239,0.97)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: 24,
              padding: '24px 28px 28px',
              maxWidth: 360, /* shared modal width — keeps demo + win modals visually consistent */
              width: '100%',
              boxShadow: '0 8px 40px rgba(64,0,15,0.16)',
              textAlign: 'center',
            }}
          >
            {/* Tutorial tag */}
            <p
              style={{
                fontFamily: '"Poppins", system-ui, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(147,0,24,0.55)',
                margin: '0 0 16px',
              }}
            >
              Tutorial
            </p>

            {/* Impact badge */}
            <div
              style={{
                display: 'inline-block',
                backgroundColor: 'rgba(147,0,24,0.07)',
                border: '1.5px solid rgba(147,0,24,0.2)',
                borderRadius: 999,
                padding: '6px 20px',
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--color-brand)',
                  letterSpacing: '0.02em',
                }}
              >
                {impact}
              </span>
            </div>

            {/* Body */}
            <p
              style={{
                fontFamily: '"Poppins", system-ui, sans-serif',
                fontSize: 15,
                lineHeight: 1.7,
                color: 'var(--color-brand-deep)',
                marginBottom: 28,
              }}
            >
              {body}
            </p>

            {/* CTA */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onNext}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: 14,
                border: 'none',
                backgroundColor: 'var(--color-brand)',
                color: 'var(--color-bg-primary)',
                fontFamily: '"Lora", Georgia, serif',
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(147,0,24,0.25)',
              }}
            >
              {nextLabel}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
