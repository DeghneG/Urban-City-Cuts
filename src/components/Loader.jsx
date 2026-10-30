import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { setScrollLocked } from '../lib/smoothScroll'

const SHINE_MS = 2600
const FLIGHT = 2.6 // seconds the logo takes to travel to the navbar

// Intro: the logo emblem rises, a light sweeps across it, and a bar and percentage count to 100.
// While this plays, the navbar's logo spot stays empty. Then GSAP carries the whole logo, emblem and wordmark,
// slowly up to that spot while the loading screen lifts away, and the real navbar logo takes over exactly where it lands.
// Both pieces live outside the lifting panel so they can travel on their own.
export default function Loader() {
  // Arriving back from /admin or /preview skips the intro; a normal load or refresh still plays it
  const [skip] = useState(() => { try { return sessionStorage.getItem('ucc-skip-intro') === '1' } catch { return false } })
  const [phase, setPhase] = useState(skip ? 'done' : 'shine') // shine → done
  const [box, setBox] = useState(null) // where the emblem and wordmark start
  const panel = useRef(null)
  const spacer = useRef(null)
  const wordSpacer = useRef(null)
  const emblem = useRef(null)
  const word = useRef(null)
  const chrome = useRef(null)
  const count = useRef(null)
  const fill = useRef(null)

  // Put the flying pieces exactly over the spots reserved for them in the loading screen
  useLayoutEffect(() => {
    if (skip) return
    const place = () => {
      const a = spacer.current?.getBoundingClientRect()
      const b = wordSpacer.current?.getBoundingClientRect()
      if (a && b) setBox({ emblem: { left: a.left, top: a.top, width: a.width, height: a.height }, word: { left: b.left, top: b.top } })
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
    // is-loading holds the hero's entrance; logo-pending keeps the navbar logo hidden until the logo lands on it
    root.classList.add('is-loading', 'logo-pending')
    setScrollLocked(true)

    let cancelled = false
    let tl
    const minimum = new Promise((r) => setTimeout(r, SHINE_MS))
    // Cap the font wait so a slow network never strands the visitor on the loader
    const fonts = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2500))])

    Promise.all([minimum, fonts]).then(() => {
      if (cancelled || !emblem.current || !word.current) return
      const eFrom = emblem.current.getBoundingClientRect()
      const wFrom = word.current.getBoundingClientRect()
      const eTo = document.querySelector('header nav a img')?.getBoundingClientRect()
      const wTo = document.querySelector('header nav a span')?.getBoundingClientRect()
      const ex = eTo ? eTo.left + eTo.width / 2 - (eFrom.left + eFrom.width / 2) : 0
      const ey = eTo ? eTo.top + eTo.height / 2 - (eFrom.top + eFrom.height / 2) : 0
      const es = eTo ? eTo.height / eFrom.height : 1
      // The wordmark is left-aligned to its target, so only its tracking has to change on the way
      const wx = wTo ? wTo.left - wFrom.left : 0
      const wy = wTo ? wTo.top - wFrom.top : 0
      const t = FLIGHT
      const land = 0.5 + t // when the logo reaches the navbar, on the timeline's clock

      tl = gsap.timeline({ onComplete: () => { root.classList.remove('logo-pending'); setPhase('done') } })
      tl.to(chrome.current, { autoAlpha: 0, y: 6, duration: 0.6, ease: 'power2.out' }, 0)
        .to(emblem.current, { x: ex, y: ey, scale: es, duration: t, ease: 'power3.inOut' }, 0.5)
        .to(word.current, { x: wx, y: wy, letterSpacing: '0.12em', duration: t, ease: 'power3.inOut' }, 0.5)
        .to(panel.current, { yPercent: -100, duration: t * 0.85, ease: 'power3.inOut' }, 0.9)
        .add(() => { root.classList.remove('is-loading'); setScrollLocked(false) }, 1.3) // the hero begins as the screen clears
        .add(() => root.classList.remove('logo-pending'), land - 0.15) // the navbar logo fades in just under the landing logo
        .to([emblem.current, word.current], { autoAlpha: 0, duration: 0.35, ease: 'none' }, land)
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
  // Same type as the navbar wordmark, so the flying text lands as an exact match (only its letter spacing differs at the start)
  const wordClass = 'display text-[0.8rem] leading-none whitespace-nowrap'

  return (
    <>
      <div ref={panel} className="loader" style={{ transition: 'none' }} role="status" aria-label="Loading Urban City Cuts">
        <div className="loader__inner" style={{ transition: 'none' }}>
          {/* Reserved space: the real emblem and wordmark are drawn above the panel so they can fly out on their own */}
          <div ref={spacer} className="mx-auto" style={{ width: 'clamp(6.5rem, 20vw, 9.5rem)', aspectRatio: '240 / 246' }} />
          <p ref={wordSpacer} className={`${wordClass} mt-8 inline-block opacity-0`} style={{ letterSpacing: '0.34em' }} aria-hidden="true">Urban City Cuts</p>
          <div ref={chrome}>
            <div className="loader__bar" aria-hidden="true"><span ref={fill} /></div>
            <p className="loader__count" aria-hidden="true"><span ref={count}>000</span> %</p>
          </div>
        </div>
      </div>

      {box && (
        <>
          <div ref={emblem} className="fixed z-[101] pointer-events-none" style={{ ...box.emblem, willChange: 'transform' }} aria-hidden="true">
            <div className="loader__mark" style={{ display: 'block', width: '100%', height: '100%' }}>
              <img src="/img/logo-mark.png" alt="" className="w-full h-full object-contain" />
              <div className="loader__shine" style={{ ...mask, backgroundClip: 'border-box', WebkitBackgroundClip: 'border-box', color: 'inherit' }} />
            </div>
          </div>
          <p ref={word} className={`${wordClass} fixed z-[101] pointer-events-none text-bone`} style={{ ...box.word, letterSpacing: '0.34em', willChange: 'transform' }} aria-hidden="true">Urban City Cuts</p>
        </>
      )}
    </>
  )
}
