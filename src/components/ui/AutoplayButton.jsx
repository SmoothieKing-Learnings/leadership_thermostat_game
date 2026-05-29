export default function AutoplayButton({ active, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle Autoplay"
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: active ? 'var(--color-brand)' : 'rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 2px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}
    >
      <div 
        style={{
          width: 20,
          height: 20,
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: '50%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: active ? 'translateX(20px)' : 'translateX(0)'
        }}
      >
        <svg 
           width="10" height="10" viewBox="0 0 24 24" fill={active ? 'var(--color-brand)' : 'var(--color-text-muted)'} 
           style={{ marginLeft: active ? 0 : 1 }}
        >
          <path d="M5 3l14 9-14 9V3z" />
        </svg>
      </div>
    </button>
  )
}
