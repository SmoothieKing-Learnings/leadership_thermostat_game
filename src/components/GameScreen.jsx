import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GaugeArc from './gauge/GaugeArc.jsx'
import GaugeBar from './gauge/GaugeBar.jsx'
import EnvironmentCard from './cards/EnvironmentCard.jsx'
import ChoiceCard from './cards/ChoiceCard.jsx'
import HistoryStack from './history/HistoryStack.jsx'
import ActionFooter from './ui/ActionFooter.jsx'

import logo from '../assets/logo.png'

export default function GameScreen({
  state,
  displayEnergy,
  onSelectOption,
  onConfirm,
  onAcknowledgeEnv,
  onAcknowledgeChoice,
  onToggleGaugeView,
  onOpenHistory,
  onCloseHistory,
}) {
  const {
    round,
    energy,
    currentCard,
    phase,
    selectedOption,
    gaugeView,
    history,
    historyOpen,
    strikes,
  } = state

  const livesRemaining = Math.max(0, 3 - strikes)

  if (!currentCard) return null

  const handleToggleHistory = () => {
    if (historyOpen) onCloseHistory()
    else onOpenHistory()
  }

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: 'var(--bg-energy, #FFF9EF)',
        transition: 'background-color 4000ms ease-in-out 800ms',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 480,
        margin: '0 auto',
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backgroundColor: 'var(--bg-energy, #FFF9EF)',
          transition: 'background-color 4000ms ease-in-out 800ms',
          borderBottom: '1px solid rgba(147,0,24,0.1)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Centered Logo */}
        <img
          src={logo}
          alt="Logo"
          style={{ height: 22, width: 'auto' }}
        />

        {/* History button — absolute right */}
        {history.length > 0 && (
          <button
            onClick={handleToggleHistory}
            aria-label="Open leadership log"
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: '1.5px solid rgba(147,0,24,0.25)',
              backgroundColor: 'transparent',
              color: '#930018',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
          </button>
        )}
      </header>

      {/* Gauge Container — tap to toggle between arc and bar views */}
      <button
        type="button"
        onClick={onToggleGaugeView}
        aria-label={`Switch to ${gaugeView === 'arc' ? 'bar' : 'arc'} view`}
        style={{
          backgroundColor: 'transparent',
          minHeight: 'var(--gauge-min-height, 130px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'all 0.4s ease-in-out',
          border: 'none',
          padding: 0,
          width: '100%',
          cursor: 'pointer',
        }}
      >
        <AnimatePresence mode="wait">
          {gaugeView === 'arc' ? (
            <motion.div
              key="arc"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%' }}
            >
              <GaugeArc energy={displayEnergy} />
            </motion.div>
          ) : (
            <motion.div
              key="bar"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%' }}
            >
              <GaugeBar energy={displayEnergy} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Card Stack / Deck Area — fills all remaining space between gauge and fixed footer */}
      <div
        className="relative flex flex-col"
        style={{
          isolation: 'isolate',
          flex: 1,
          minHeight: 0,
          overflow: 'visible',
          paddingTop: 'var(--card-area-pt)',
          paddingLeft: 'var(--card-area-px)',
          paddingRight: 'var(--card-area-px)',
          paddingBottom: 'calc(var(--footer-height) + 8px)',
        }}
      >
        {/* The physical history stack (Behind) */}
        <HistoryStack
          history={history}
          isExpanded={historyOpen}
          onToggle={handleToggleHistory}
        />

        {/* Current Active Card (On Top) */}
        <div className="relative z-10 w-full h-full flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, scale: 0.92, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0.4, scale: 0.82, y: 40, rotate: -4, transition: { duration: 0.25, ease: 'easeIn' } }}
              transition={{ type: 'spring', damping: 22, stiffness: 120 }}
              className="w-full flex-1 flex flex-col"
            >
              {currentCard.type === 'environment' ? (
                <EnvironmentCard
                  key={currentCard.id}
                  card={currentCard}
                />
              ) : (
                <ChoiceCard
                  key={currentCard.id}
                  card={currentCard}
                  selectedOption={selectedOption}
                  phase={phase}
                  onSelectOption={onSelectOption}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Action Footer */}
      {!historyOpen && (
        <ActionFooter
          card={currentCard}
          phase={phase}
          selectedOption={selectedOption}
          round={round}
          livesRemaining={livesRemaining}
          onConfirm={onConfirm}
          onAcknowledge={currentCard.type === 'environment' ? onAcknowledgeEnv : onAcknowledgeChoice}
        />
      )}
    </div>
  )
}
