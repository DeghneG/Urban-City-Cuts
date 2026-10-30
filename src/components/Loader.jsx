import { useEffect, useRef, useState } from 'react'
import { setScrollLocked } from '../lib/smoothScroll'

// Mark fades up, a light sweeps across it, then the panel lifts away
const SHINE_MS = 2600
const LIFT_MS = 1100

export default function Loader() {
  const [phase, setPhase] = useState('shine') // shine → lift → done
  const count = useRef(null)
  const fill = useRef(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.documentElement
    root.classList.add('is-loading')
    setScrollLocked(true)

    let liftTimer
    const minimum = new Promise((r) => setTimeout(r, reduced ? 300 : SHINE_MS))
    // Cap the font wait so a slow network never strands the visitor on the loader
    const fonts = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2500))])

    Promise.all([minimum, fonts]).then(() => {
      setPhase('lift')
      root.classList.remove('is-loading')
      setScrollLocked(false)
      liftTimer = setTimeout(() => setPhase('done'), reduced ? 300 : LIFT_MS)
    })

    return () => {
      clearTimeout(liftTimer)
      root.classList.remove('is-loading')
      setScrollLocked(false)
    }
  }, [])

  // The percentage reads the same ease curve the CSS bar uses, written straight to the DOM (no re-renders)
  useEffect(() => {
    const start = performance.now() + 200
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    let raf
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - start) / SHINE_MS))
      const e = ease(t)
      if (count.current) count.current.textContent = String(Math.round(e * 100)).padStart(3, '0')
      if (fill.current) fill.current.style.transform = `scaleX(${e})`
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (phase === 'done') return null

  return (
    <div className={`loader ${phase === 'lift' ? 'loader--lift' : ''}`} role="status" aria-label="Loading Urban City Cuts">
      <div className="loader__inner">
        <div className="loader__mark" aria-hidden="true" style={{ width: 'clamp(9rem, 28vw, 17rem)' }}>
          <img src="/img/logo-full.png" alt="" className="w-full" />
          <div className="loader__shine" style={{ WebkitMaskImage: 'url(/img/logo-full.png)', maskImage: 'url(/img/logo-full.png)', WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', backgroundClip: 'border-box', WebkitBackgroundClip: 'border-box', color: 'inherit' }} />
        </div>
        <div className="loader__bar" aria-hidden="true"><span ref={fill} /></div>
        <p className="loader__count" aria-hidden="true"><span ref={count}>000</span> %</p>
      </div>
    </div>
  )
}
