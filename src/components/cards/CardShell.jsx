/**
 * CardShell — single source of truth for card visual appearance.
 * All card states (environment, choice reading, choice revealed, history)
 * use this shell for consistent border, radius, height, and padding.
 */
import skCrown from '../../assets/SKcrown.svg'

export const CARD_RADIUS = 20
export const CARD_BORDER = '2px solid var(--color-brand)'
export const CARD_HEIGHT = 'var(--card-height)'
export const CARD_PADDING = 'var(--card-padding, 24px 22px)'
export const CARD_SHADOW = '0 4px 10px rgba(64, 0, 15, 0.18), 0 12px 28px rgba(64, 0, 15, 0.13)'

// ── Crown + type label ────────────────────────────────────────────────────────

export function TypeHeader({ label, subtitle }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 0, flexShrink: 0 }}>
      <img
        src={skCrown}
        alt=""
        style={{
          width: 'var(--type-header-crown-size, 22px)',
          height: 'auto',
          display: 'block',
          marginInline: 'auto',
          marginBottom: 'var(--type-header-margin-bottom, 8px)',
        }}
      />
      <p style={{
        fontFamily: '"Poppins", system-ui, sans-serif',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--color-brand)',
        margin: 0,
        marginBottom: 3,
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: '"Poppins", system-ui, sans-serif',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.06em',
        color: 'var(--color-brand)',
        opacity: 0.7,
        margin: 0,
      }}>
        {subtitle}
      </p>
    </div>
  )
}

// ── Title ─────────────────────────────────────────────────────────────────────

export function CardTitle({ children, color = 'var(--color-brand)', size }) {
  return (
    <h2 style={{
      fontFamily: '"Lora", Georgia, serif',
      fontSize: size ?? 'var(--card-title-size, 30px)',
      fontWeight: 700,
      color,
      lineHeight: 1.15,
      margin: 0,
      marginBottom: 12,
      textAlign: 'center',
    }}>
      {children}
    </h2>
  )
}

// ── Description ───────────────────────────────────────────────────────────────

export function CardDescription({ children, color = 'var(--color-brand)', opacity = 0.78 }) {
  return (
    <p style={{
      fontFamily: '"Poppins", system-ui, sans-serif',
      fontSize: 'var(--card-desc-size, 12px)',
      lineHeight: 1.5,
      color,
      opacity,
      margin: 0,
      textAlign: 'center',
      maxWidth: 260,
    }}>
      {children}
    </p>
  )
}

// ── Impact pill ───────────────────────────────────────────────────────────────

export function ImpactPill({ children, bgColor = 'transparent', color = 'var(--color-brand)', borderColor = 'var(--color-brand)' }) {
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 999,
      padding: '13px 20px',
      backgroundColor: bgColor,
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: '"Poppins", system-ui, sans-serif',
        fontSize: 16,
        fontWeight: 700,
        color,
        letterSpacing: '0.01em',
      }}>
        {children}
      </span>
    </div>
  )
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export default function CardShell({ bg = 'var(--color-bg-primary)', children, style = {} }) {
  return (
    <div style={{
      backgroundColor: bg,
      border: CARD_BORDER,
      borderRadius: CARD_RADIUS,
      width: '100%',
      maxWidth: 320,
      marginInline: 'auto',
      height: CARD_HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: CARD_PADDING,
      textAlign: 'center',
      overflowY: 'auto',
      boxSizing: 'border-box',
      boxShadow: CARD_SHADOW,
      ...style,
    }}>
      {children}
    </div>
  )
}
