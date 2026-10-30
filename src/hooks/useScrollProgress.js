import { useEffect, useRef } from 'react'

/**
 * Writes the element's scroll progress (0 → 1) to the CSS variable --p, so
 * scroll-driven motion stays in CSS and never re-renders React.
 *
 * 'pass'   — 0 when the top enters the bottom of the viewport, 1 when the bottom leaves the top.
 * 'sticky' — 0 when the top reaches the viewport top, 1 when the bottom reaches the viewport bottom
 *            (for tall wrappers around a position:sticky stage).
 */
export function useScrollProgress(mode = 'pass') {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--p', mode === 'sticky' ? '0' : '0.5')
      return
    }

    let frame = 0
    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const raw = mode === 'sticky' ? -r.top / Math.max(1, r.height - vh) : (vh - r.top) / (vh + r.height)
      el.style.setProperty('--p', Math.min(1, Math.max(0, raw)).toFixed(4))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [mode])

  return ref
}
