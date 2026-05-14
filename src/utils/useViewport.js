import { useEffect, useState } from 'react'

/**
 * Returns a flag that flips when the viewport (iframe or window) drops below the
 * given height threshold. Reactive to resize so embeds can resize fluidly.
 */
export function useShortViewport(threshold = 800) {
  const [isShort, setIsShort] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight < threshold : false
  )
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => setIsShort(window.innerHeight < threshold)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [threshold])
  return isShort
}

/**
 * True whenever document.visibilityState === 'visible'. Used to pause
 * animations when the iframe is hidden (tab switched, scrolled out of view,
 * collapsed in an accordion).
 */
export function useDocumentVisible() {
  const [visible, setVisible] = useState(() =>
    typeof document !== 'undefined' ? document.visibilityState !== 'hidden' : true
  )
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onChange = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])
  return visible
}
