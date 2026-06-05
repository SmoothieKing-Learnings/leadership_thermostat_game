// Pill — reusable rounded label chip
// variant: 'env' | 'choice' | 'positive' | 'negative' | 'neutral'

const VARIANTS = {
  env:      { bg: 'var(--color-blue-light)', color: 'var(--color-brand-deep)' },
  choice:   { bg: 'var(--color-pink-light)', color: 'var(--color-brand)' },
  positive: { bg: 'var(--color-green-light)', color: 'var(--color-brand-deep)' },
  negative: { bg: 'var(--color-pink-mid)', color: 'var(--color-brand)' },
  neutral:  { bg: 'var(--color-bg-primary)', color: 'var(--color-brand)' },
}

export default function Pill({ children, variant = 'neutral', className = '' }) {
  const { bg, color } = VARIANTS[variant] ?? VARIANTS.neutral
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-body font-semibold tracking-widest uppercase ${className}`}
      style={{
        backgroundColor: bg,
        color,
        borderRadius: '999px',
        fontFamily: '"Poppins", system-ui, sans-serif',
        letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
