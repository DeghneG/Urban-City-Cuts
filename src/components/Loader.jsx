import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { setScrollLocked } from '../lib/smoothScroll'

const SHINE_MS = 2600

// Intro: the logo emblem rises, a light sweeps across it, and a bar and percentage count to 100.
// Then GSAP does one continuous move: the loading screen lifts away while the emblem flies up into its
// place in the navbar, where the real logo takes over. The emblem lives outside the lifting panel so it can travel on its own.
export default function Loader() {
  // Arriving back from /admin or /preview skips the intro; a normal load or refresh still plays it
  const [skip] = useState(() => { try { return sessionStorage.getItem('ucc-skip-intro') === '1' } catch { return false } })
  const [phase, setPhase] = useState(skip ? 'done' : 'shine') // shine → done
  const [box, setBox] = useState(null) // where the emblem sits at the start
  const panel = useRef(null)
  const spacer = useRef(null)
  const emblem = useRef(null)
  const text = useRef(null)
  const count = useRef(null)
  const fill = useRef(null)

  // Put the flying emblem exactly over the spot reserved for it in the loading screen
  useLayoutEffect(() => {
    if (skip) return
    const place = () => {
      const r = spacer.current?.getBoundingClientRect()
      if (r) setBox({ left: r.left, top: r.top, width: r.width, height: r.height })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [skip])

  useEffect(() => {
    if (skip) {
      try { sessionStorage.removeItem('ucc-skip-intro') } catch { /* ignore */ }
      return
    }
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // is-loading holds the hero's entrance; logo-pending keeps the navbar logo hidden until the emblem lands
    root.classList.add('is-loading', 'logo-pending')
    setScrollLocked(true)

    let cancelled = false
    let tl
    const minimum = new Promise((r) => setTimeout(r, reduced ? 300 : SHINE_MS))
    // Cap the font wait so a slow network never strands the visitor on the loader
    const fonts = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2500))])

    Promise.all([minimum, fonts]).then(() => {
      if (cancelled || !emblem.current) return
      const from = emblem.current.getBoundingClientRect()
      const to = document.querySelector('header nav a img')?.getBoundingClientRect()
      const dx = to ? to.left + to.width / 2 - (from.left + from.width / 2) : 0
      const dy = to ? to.top + to.height / 2 - (from.top + from.height / 2) : 0
      const scale = to ? to.height / from.height : 1
      const t = reduced ? 0.35 : 1.15

      tl = gsap.timeline({ onComplete: () => { root.classList.remove('logo-pending'); setPhase('done') } })
      tl.to(text.current, { autoAlpha: 0, y: -8, duration: 0.4, ease: 'power2.out' }, 0)
        .add(() => { root.classList.remove('is-loading'); setScrollLocked(false) }, 0.3) // the hero starts as the screen lifts
        .to(panel.current, { yPercent: -100, duration: t, ease: 'power4.inOut' }, 0.35)
        .to(emblem.current, { x: dx, y: dy, scale, duration: t, ease: 'power3.inOut' }, 0.35)
        .add(() => root.classList.remove('logo-pending'), `>-0.12`) // the navbar logo fades in just under the emblem
        .to(emblem.current, { autoAlpha: 0, duration: 0.3, ease: 'none' }, '>')
    })

    return () => {
      cancelled = true
      tl?.kill()
      root.classList.remove('is-loading', 'logo-pending')
      setScrollLocked(false)
    }
  }, [skip])

  // The percentage and the bar share one clock, so they always agree
  useEffect(() => {
    if (skip) return
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
  }, [skip])

  if (phase === 'done') return null

  const mask = { WebkitMaskImage: 'url(/img/logo-mark.png)', maskImage: 'url(/img/logo-mark.png)', WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }

  return (
    <>
      <div ref={panel} className="loader" style={{ transition: 'none' }} role="status" aria-label="Loading Urban City Cuts">
        <div className="loader__inner" style={{ transition: 'none' }}>
          {/* Reserved space: the real emblem is drawn above the panel so it can fly out on its own */}
          <div ref={spacer} className="mx-auto" style={{ width: 'clamp(6.5rem, 20vw, 9.5rem)', aspectRatio: '240 / 246' }} />
          <div ref={text} className="mt-8">
            <p className="display text-[0.8rem] tracking-[0.34em] text-chrome-light" aria-hidden="true">Urban City Cuts</p>
            <div className="loader__bar" aria-hidden="true"><span ref={fill} /></div>
            <p className="loader__count" aria-hidden="true"><span ref={count}>000</span> %</p>
          </div>
        </div>
      </div>

      {box && (
        <div ref={emblem} className="fixed z-[101] pointer-events-none" style={{ ...box, willChange: 'transform' }} aria-hidden="true">
          <div className="loader__mark" style={{ display: 'block', width: '100%', height: '100%' }}>
            <img src="/img/logo-mark.png" alt="" className="w-full h-full object-contain" />
            <div className="loader__shine" style={{ ...mask, backgroundClip: 'border-box', WebkitBackgroundClip: 'border-box', color: 'inherit' }} />
          </div>
        </div>
      )}
    </>
  )
}
