import { useEffect, useRef } from 'react'
import Photo from './Photo'
import { useReveal } from '../hooks/useReveal'
import { useScrollProgress } from '../hooks/useScrollProgress'

const COPY =
  'From grown-out hair to a clean, stylish finish, every detail matters, and the right cut makes all the difference. Your style deserves the best. Pull up and let the results speak for themselves.'

// Words light up one by one as the paragraph scrolls through the middle of the screen
function ScrubText({ text }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const words = [...el.querySelectorAll('span')]
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      words.forEach((w) => (w.style.opacity = 1))
      return
    }
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.45 + r.height * 0.5)))
      const lit = p * (words.length + 4)
      words.forEach((w, n) => (w.style.opacity = (0.2 + 0.8 * Math.min(1, Math.max(0, lit - n))).toFixed(2)))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return (
    <p ref={ref} className="mt-8 max-w-md text-lg leading-relaxed text-bone">
      {text.split(' ').map((w, n) => <span key={n} style={{ opacity: 0.2, transition: 'opacity 0.3s linear' }}>{w} </span>)}
    </p>
  )
}

// Photo that leans toward the pointer. Pointer-only, so touch screens just see the still.
function Tilt({ children, className = '' }) {
  const ref = useRef(null)
  const move = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) scale(1.02)`
  }
  const leave = () => { ref.current.style.transform = '' }
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={`transition-transform duration-500 ease-out will-change-transform ${className}`}>
      {children}
    </div>
  )
}

export default function Craft() {
  const section = useScrollProgress('pass')
  const head = useReveal()
  const a = useReveal(100)
  const b = useReveal(350)

  return (
    <section ref={section} id="craft" className="relative py-28 md:py-44 overflow-hidden">
      {/* Outlined words that slide sideways as you scroll */}
      <div
        aria-hidden="true"
        className="display absolute left-0 top-1/2 whitespace-nowrap text-[24vw] leading-none text-transparent pointer-events-none select-none"
        style={{ WebkitTextStroke: '1px #1f2125', transform: 'translate(calc(12% - var(--p, 0.5) * 60%), -50%)' }}
      >
        Fade Texture Edge Blend Finish
      </div>

      <div className="relative mx-auto max-w-6xl px-5 grid md:grid-cols-12 gap-10 md:gap-8 items-center">
        <div ref={head} className="on-view reveal md:col-span-5 md:order-2 md:pl-6">
          <p className="eyebrow">The craft</p>
          <h2 className="display mt-6 text-4xl md:text-6xl">
            <span className="rise"><span style={{ '--d': '0s' }}>Clean fade.</span></span>
            <span className="rise"><span style={{ '--d': '0.15s' }}>Sharp details.</span></span>
            <span className="rise"><span className="chrome-text" style={{ '--d': '0.3s' }}>Premium finish.</span></span>
          </h2>
          <ScrubText text={COPY} />
          <a href="#gallery" className="inline-link mt-9">See the work</a>
        </div>

        {/* The observer watches this unclipped wrapper; a clip-path:inset(100%) target would never intersect */}
        <div ref={a} className="wipe-host md:col-span-4 md:order-1" style={{ transform: 'translateY(calc((0.5 - var(--p, 0.5)) * 110px))' }}>
          <Tilt>
            <div className="wipe">
              <Photo id="cut-04" alt="Textured crop with a clean skin fade" sizes="(min-width: 768px) 33vw, 100vw" className="w-full aspect-[3/4] object-cover" />
            </div>
          </Tilt>
        </div>

        <div ref={b} className="wipe-host md:col-span-3 md:order-3 md:mt-24" style={{ transform: 'translateY(calc((var(--p, 0.5) - 0.5) * 150px))' }}>
          <Tilt>
            <div className="wipe">
              <Photo id="cut-10" alt="Hair design on a fade with a swept top" sizes="(min-width: 768px) 25vw, 100vw" className="w-full aspect-[3/4] object-cover" />
            </div>
          </Tilt>
          <p className="mt-3 text-sm text-muted">Experience the difference at UCC.</p>
        </div>
      </div>
    </section>
  )
}
