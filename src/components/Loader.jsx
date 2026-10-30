import { useEffect, useState } from 'react'
import { setScrollLocked } from '../lib/smoothScroll'

// Mark fades up, a light sweeps across it, then the panel lifts away
const SHINE_MS = 2600
const LIFT_MS = 1100

export default function Loader() {
  const [phase, setPhase] = useState('shine') // shine → lift → done

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

  if (phase === 'done') return null

  return (
    <div className={`loader ${phase === 'lift' ? 'loader--lift' : ''}`} role="status" aria-label="Loading Urban City Cuts">
      <div className="loader__inner">
        <div className="loader__mark" aria-hidden="true" style={{ width: 'clamp(9rem, 28vw, 17rem)' }}>
          <img src="/img/logo-full.png" alt="" className="w-full" />
          <div className="loader__shine" style={{ WebkitMaskImage: 'url(/img/logo-full.png)', maskImage: 'url(/img/logo-full.png)', WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', backgroundClip: 'border-box', WebkitBackgroundClip: 'border-box', color: 'inherit' }} />
        </div>
      </div>
    </div>
  )
}
