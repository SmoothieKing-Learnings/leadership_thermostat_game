export default function GaugeToggle({ view, onToggle }) {
  return (
    <div 
      className="flex items-center p-1 rounded-full"
      style={{
        backgroundColor: 'rgba(147,0,24,0.06)',
        border: '1px solid rgba(147,0,24,0.1)'
      }}
    >
      {/* Arc Mode Button */}
      <button
        onClick={() => view !== 'arc' && onToggle()}
        aria-label="Switch to Arc View"
        style={{
          width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',
          border: 'none', cursor: 'pointer',
          backgroundColor: view === 'arc' ? 'var(--color-brand)' : 'transparent',
          color: view === 'arc' ? 'var(--color-bg-primary)' : 'var(--color-brand)',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M4 18 A 8 8 0 0 1 20 18" />
          <line x1="12" y1="18" x2="12" y2="10" />
        </svg>
      </button>

      {/* Bar Mode Button */}
      <button
        onClick={() => view !== 'bar' && onToggle()}
        aria-label="Switch to Bar View"
        style={{
          width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%',
          border: 'none', cursor: 'pointer',
          backgroundColor: view === 'bar' ? 'var(--color-brand)' : 'transparent',
          color: view === 'bar' ? 'var(--color-bg-primary)' : 'var(--color-brand)',
          transition: 'all 0.2s ease-in-out',
          marginLeft: 4
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
           <rect x="3" y="10" width="18" height="4" rx="1" fill={view === 'bar' ? 'var(--color-bg-primary)' : 'currentColor'} stroke="none" />
           <line x1="3" y1="14" x2="21" y2="14" opacity="0.3" />
        </svg>
      </button>
    </div>
  )
}
