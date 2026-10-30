import { useEffect, useState } from 'react'
import Photo from './Photo'
import { BRANCHES, branchStatus, bookHref, bookExternal } from '../lib/site'

// Shop interiors only (no clients in frame)
const SLIDES = [
  { id: 'main', label: 'The shop floor', alt: 'Inside Urban City Cuts: barber chairs under a hexagon light ceiling' },
  { id: 'cut-06', label: 'Under the lights', alt: 'Caped chairs beneath the hexagon ceiling' },
  { id: 'cut-01', label: 'The floor', alt: 'The barbershop floor and mirrors' },
]
const HOLD_MS = 6000

// Live count of open branches, in Manila time
function useOpenStatus() {
  const calc = () => {
    const s = BRANCHES.map((b) => branchStatus(b))
    const open = s.filter((x) => x.open).length
    return open ? { open: true, text: open === BRANCHES.length ? 'Open now at all 3 branches' : `Open now at ${open} of 3 branches` } : { open: false, text: s[0].text }
  }
  const [st, setSt] = useState(calc)
  useEffect(() => {
    const t = setInterval(() => setSt(calc()), 60_000)
    return () => clearInterval(t)
  }, [])
  return st
}

export default function Hero() {
  const [i, setI] = useState(0)
  const status = useOpenStatus()
  const bookProps = bookExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  // Advance on a timer that restarts whenever the slide changes (including a manual jump)
  useEffect(() => {
    const t = setTimeout(() => !document.hidden && setI((n) => (n + 1) % SLIDES.length), HOLD_MS)
    return () => clearTimeout(t)
  }, [i])

  return (
    <section className="relative grid lg:grid-cols-12 lg:min-h-[calc(100svh-104px)]">
      <div className="lg:col-span-7 flex flex-col justify-center px-5 py-14 md:py-20 lg:py-16 lg:pr-12 lg:pl-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))]">
        <p className="inline-flex items-center gap-3 text-xs text-chrome animate-fadeUp">
          <span className="relative flex w-2 h-2" aria-hidden="true">
            {status.open && <span className="absolute inset-0 rounded-full bg-bone opacity-60 animate-ping" />}
            <span className={`relative w-2 h-2 rounded-full ${status.open ? 'bg-bone' : 'border border-chrome-dark'}`} />
          </span>
          {status.text}
        </p>

        <h1 className="display mt-7 text-[clamp(2.2rem,5vw,4.6rem)]" aria-label="Texture on top. Clean on the sides.">
          <span className="rise"><span style={{ '--d': '0.15s' }}>Texture</span></span>
          <span className="rise"><span style={{ '--d': '0.25s' }}>on top.</span></span>
          <span className="rise"><span className="chrome-text" style={{ '--d': '0.4s' }}>Clean on</span></span>
          <span className="rise"><span className="chrome-text" style={{ '--d': '0.5s' }}>the sides.</span></span>
        </h1>

        <p className="mt-6 max-w-md text-chrome leading-relaxed animate-fadeUp [animation-delay:0.7s]">
          The perfect balance of style. Walk-ins welcome, reservations open, three branches across the city.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 animate-fadeUp [animation-delay:0.85s]">
          <a href={bookHref} {...bookProps} className="btn btn-chrome">Book your cut</a>
          <a href="#menu" className="btn btn-ghost">See prices</a>
        </div>
      </div>

      <div className="lg:col-span-5 relative min-h-[56svh] lg:min-h-0 overflow-hidden grain bg-ink-2">
        {SLIDES.map((s, n) => (
          <div key={s.id} className={`slide absolute inset-0 overflow-hidden ${n === i ? 'is-active' : ''}`} aria-hidden={n !== i}>
            <Photo id={s.id} alt={s.alt} priority={n === 0} sizes="(min-width: 1024px) 42vw, 100vw" className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-ink/70 lg:via-transparent lg:to-transparent pointer-events-none" />

        {/* Pager: each bar fills over the hold time; click to jump */}
        <div className="absolute left-5 right-5 lg:right-44 bottom-3 flex gap-2" role="group" aria-label="Photo slideshow">
          {SLIDES.map((s, n) => (
            <button key={s.id} onClick={() => setI(n)} aria-label={`Show photo: ${s.label}`} aria-current={n === i} className="group flex-1 py-4 cursor-pointer">
              <span className="block h-px bg-bone/30 group-hover:bg-bone/60 transition-colors relative overflow-hidden">
                {n < i && <span className="absolute inset-0 bg-bone" />}
                {n === i && <span key={`${i}-${s.id}`} className="pager-fill absolute inset-0 bg-bone" style={{ '--dur': `${HOLD_MS}ms` }} />}
              </span>
            </button>
          ))}
        </div>
        <p className="absolute left-5 bottom-14 font-serif italic text-lg text-bone/90" aria-live="polite">{SLIDES[i].label}</p>
      </div>
    </section>
  )
}
