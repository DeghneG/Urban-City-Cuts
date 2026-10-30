import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, X, LayoutDashboard, Smartphone, ArrowRight } from 'lucide-react'
import { glideTo } from '../lib/smoothScroll'
import { DEMO_MODE } from '../lib/site'

const EMBEDDED = typeof window !== 'undefined' && window.self !== window.top
const SEEN = 'ucc-tour-seen'
const NAME_KEY = 'ucc-viewer'
const DWELL_MS = 7000 // how long auto-play rests on each stop

// One stop per section, top to bottom. `sel` is where to glide; `root` is the area the card must stay clear of.
// `chat` opens the assistant (so the card is pinned away from it); `owner` shows the dashboard and phone-preview links.
const STEPS = [
  { top: true, root: 'main > section', title: (n) => `Welcome, ${n}`, text: 'A premium, minimal site for Urban City Cuts. This tour glides down the page from top to bottom.' },
  { sel: '#craft', title: () => 'The craft', text: 'Photos open up and drift as you scroll, with the shop’s own words.' },
  { sel: '#gallery', title: () => 'Gallery', text: 'Filter by cuts, the shop, the team or events. Tap a photo for full screen.' },
  { sel: '#experience', title: () => 'The experience', text: 'Parking, Wi-Fi, café and the rest, at a glance.' },
  { sel: '#menu', title: () => 'Build your visit', text: 'Every service from the printed menu. Tap items and the total updates.' },
  { sel: '#cafe', title: () => 'The café', text: 'The full café menu, with hot and iced prices.' },
  { sel: '#branches', title: () => 'Three branches', text: 'A map of all three shops with live hours, tap-to-call and directions.' },
  { sel: '#franchise', title: () => 'Franchise', text: 'Now open for franchising, with no royalty fee.' },
  { sel: '#hiring', title: () => 'Now hiring', text: 'A hiring notice the owners can switch on or off.' },
  { end: true, root: 'footer', chat: true, title: () => 'Ask anything', text: 'A built-in assistant answers questions about hours, prices and booking. No outside AI service.' },
  { end: true, root: 'footer', owner: true, title: (n) => `That is the site, ${n}`, text: 'Sign in to edit prices, announcements and photos, or see the site on a phone.' },
]

const readName = () => { try { return localStorage.getItem(NAME_KEY) || '' } catch { return '' } }

// Pick the screen position where the card covers the least of what the visitor came to look at.
// Slots are scored by how much of the stop's text, photos and buttons they would sit on top of.
function pickSlot(step, card, prev) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const mobile = vw < 640
  const m = mobile ? 12 : 24
  const w = mobile ? vw - m * 2 : Math.min(390, vw - m * 2)
  const h = card.offsetHeight || 240
  const bottom = vh - h - m
  const top = mobile ? 78 : 92
  const slots = mobile
    ? [{ id: 'b', x: m, y: bottom }, { id: 't', x: m, y: top }]
    : [{ id: 'br', x: vw - w - m, y: bottom }, { id: 'bl', x: m, y: bottom }, { id: 'bc', x: (vw - w) / 2, y: bottom }, { id: 'tr', x: vw - w - m, y: top }, { id: 'tl', x: m, y: top }]

  // The assistant opens at the bottom right (desktop) or fills the lower screen (phone): keep clear of it
  if (step.chat) return { ...(mobile ? slots[1] : slots.find((s) => s.id === 'bl')), w }

  const root = document.querySelector(step.root || step.sel)
  const rects = root
    ? [...root.querySelectorAll('img,h1,h2,h3,p,button,a,li,iframe,.maplibregl-canvas')]
        .map((e) => e.getBoundingClientRect())
        .filter((r) => r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw)
    : []
  const overlap = (s) => rects.reduce((sum, r) => {
    const ox = Math.max(0, Math.min(s.x + w, r.right) - Math.max(s.x, r.left))
    const oy = Math.max(0, Math.min(s.y + h, r.bottom) - Math.max(s.y, r.top))
    return sum + ox * oy
  }, 0)
  const scores = slots.map((s) => ({ s, o: overlap(s) }))
  const min = Math.min(...scores.map((x) => x.o))
  // Anything within 4% of the card area of the clearest spot is "clear enough"; of those, go somewhere new
  const clear = scores.filter((x) => x.o <= min + w * h * 0.04).map((x) => x.s)
  const far = (s) => (prev ? Math.hypot(s.x - prev.x, s.y - prev.y) : 0)
  const best = clear.reduce((a, s) => (far(s) > far(a) + 1 ? s : a), clear[0])
  return { ...best, w }
}

export default function Tour() {
  const [phase, setPhase] = useState(null) // null | 'welcome' | 'tour'
  const [name, setName] = useState(readName)
  const [draft, setDraft] = useState(readName)
  const [i, setI] = useState(0)
  const [arrived, setArrived] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [slot, setSlot] = useState({ x: 24, y: 24, w: 390 })
  const run = useRef(0) // guards against a stale glide finishing after the visitor moved on
  const card = useRef(null)

  const step = STEPS[i]
  const who = name || 'friend'

  // Offer the tour once per visit, after the intro loader has lifted
  useEffect(() => {
    if (!DEMO_MODE || EMBEDDED) return
    let seen = false
    try { seen = sessionStorage.getItem(SEEN) === '1' } catch { /* private mode */ }
    // Replaying from the button skips the name question if we already have one
    const start = () => {
      setI(0); setArrived(false); setPlaying(true)
      setPhase(readName() ? 'tour' : 'welcome')
    }
    window.addEventListener('ucc-tour-start', start)
    let timer
    if (!seen) {
      const wait = () => {
        if (document.documentElement.classList.contains('is-loading')) timer = setTimeout(wait, 250)
        else timer = setTimeout(() => setPhase('welcome'), 900)
      }
      wait()
    }
    return () => { clearTimeout(timer); window.removeEventListener('ucc-tour-start', start) }
  }, [])

  const finish = useCallback(() => {
    run.current++
    setPhase(null)
    try { sessionStorage.setItem(SEEN, '1') } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent('ucc-chat', { detail: false }))
  }, [])

  const begin = (e) => {
    e.preventDefault()
    const n = draft.trim().replace(/\s+/g, ' ').slice(0, 30)
    if (!n) return
    setName(n)
    try { localStorage.setItem(NAME_KEY, n) } catch { /* private mode */ }
    setI(0); setArrived(false); setPlaying(true)
    setPhase('tour')
  }

  // Glide to the current stop. The card fades out while travelling and returns, in a free spot, on arrival.
  useEffect(() => {
    if (phase !== 'tour') return
    const id = ++run.current
    setArrived(false)
    window.dispatchEvent(new CustomEvent('ucc-chat', { detail: false }))
    const target = step.top ? 0 : step.end ? 'end' : document.querySelector(step.sel)
    glideTo(target, {
      onComplete: () => {
        if (run.current !== id) return
        setArrived(true)
        if (step.chat) window.dispatchEvent(new CustomEvent('ucc-chat', { detail: true }))
      },
    })
  }, [phase, i]) // eslint-disable-line react-hooks/exhaustive-deps

  // Choose where the card sits once the page has stopped moving (and again if the window changes size)
  useLayoutEffect(() => {
    if (phase !== 'tour' || !arrived || !card.current) return
    const place = () => card.current && setSlot((prev) => pickSlot(step, card.current, prev))
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [phase, arrived, i]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-play: rest on each stop, then move down. Pausing stops the clock; the last stop never auto-finishes.
  useEffect(() => {
    if (phase !== 'tour' || !arrived || !playing || i >= STEPS.length - 1) return
    const t = setTimeout(() => setI((n) => n + 1), DWELL_MS)
    return () => clearTimeout(t)
  }, [phase, arrived, playing, i])

  // Keyboard, and the floating buttons get out of the way while the tour runs
  useEffect(() => {
    document.documentElement.classList.toggle('tour-active', phase === 'tour')
    if (!phase) return
    const onKey = (e) => {
      if (e.key === 'Escape') finish()
      if (phase !== 'tour' || e.target.tagName === 'INPUT') return
      if (e.key === 'ArrowRight') setI((n) => Math.min(STEPS.length - 1, n + 1))
      if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1))
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('tour-active')
    }
  }, [phase, finish])

  if (!phase) return null

  if (phase === 'welcome') {
    return (
      <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-ink/75" role="dialog" aria-modal="true" aria-label="Site tour">
        <form onSubmit={begin} className="tour-card w-full max-w-md bg-ink-2 border border-line p-7 sm:p-9" style={{ paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom))' }}>
          <img src="/img/logo-mark.png" alt="" className="h-9 w-auto" />
          <h2 className="display mt-6 text-2xl sm:text-3xl">First, what is your name?</h2>
          <p className="mt-4 text-sm text-chrome leading-relaxed">Then we will take you down the whole site in about a minute, from the top of the page to the bottom. Pause or skip any time.</p>
          <label className="block mt-7">
            <span className="text-xs text-muted">Your name</span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={30}
              autoFocus
              autoComplete="given-name"
              enterKeyHint="go"
              placeholder="e.g. Maria"
              className="mt-2 w-full bg-transparent border-b border-line focus:border-bone outline-none py-3 text-lg text-bone placeholder:text-chrome-dark/60"
            />
          </label>
          <div className="mt-8 flex flex-col gap-3">
            <button type="submit" disabled={!draft.trim()} className="btn btn-chrome w-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">Start the tour <ArrowRight size={14} /></button>
            <button type="button" onClick={finish} className="btn btn-ghost w-full cursor-pointer">Explore on my own</button>
          </div>
        </form>
      </div>
    )
  }

  const last = i === STEPS.length - 1
  return (
    <div ref={card} className="fixed z-[70] left-0 top-0" style={{ width: slot.w, transform: `translate3d(${slot.x}px, ${slot.y}px, 0)` }}>
      <section
        key={i}
        role="dialog"
        aria-label={`Site tour, step ${i + 1} of ${STEPS.length}`}
        className={`${arrived ? 'tour-card' : 'opacity-0 pointer-events-none'} bg-ink-2 border border-line shadow-[0_20px_80px_rgba(0,0,0,0.7)]`}
      >
        {/* Dwell progress: fills while auto-play rests on this stop */}
        <div className="h-px bg-line relative overflow-hidden" aria-hidden="true">
          {arrived && playing && !last && <span key={i} className="pager-fill absolute inset-0 bg-bone" style={{ '--dur': `${DWELL_MS}ms` }} />}
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted tabular-nums">{i + 1} of {STEPS.length}</p>
              <h2 className="display text-xl mt-1">{step.title(who)}</h2>
            </div>
            <button onClick={finish} aria-label="End the tour" className="-m-2 p-3 text-chrome hover:text-white cursor-pointer"><X size={16} /></button>
          </div>
          <p className="mt-3 text-sm text-chrome leading-relaxed">{step.text}</p>

          {step.owner && (
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="/login" className="btn btn-chrome !py-3 !px-5"><LayoutDashboard size={14} /> Open dashboard</a>
              <a href="/preview" className="btn btn-ghost !py-3 !px-5"><Smartphone size={14} /> Phone preview</a>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-1" role="group" aria-label="Tour controls">
              <button onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} aria-label="Previous stop" className="w-11 h-11 grid place-items-center border border-line text-chrome hover:text-white hover:border-chrome disabled:opacity-30 cursor-pointer"><ChevronLeft size={18} /></button>
              <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause auto-play' : 'Resume auto-play'} className="w-11 h-11 grid place-items-center border border-line text-chrome hover:text-white hover:border-chrome cursor-pointer">{playing ? <Pause size={16} /> : <Play size={16} />}</button>
              <button onClick={() => (last ? finish() : setI((n) => n + 1))} aria-label={last ? 'Finish the tour' : 'Next stop'} className="w-11 h-11 grid place-items-center bg-bone text-ink hover:bg-white cursor-pointer">{last ? <X size={16} /> : <ChevronRight size={18} />}</button>
            </div>
            <button onClick={finish} className="text-xs text-muted hover:text-bone cursor-pointer px-2 py-3">{last ? 'Done' : 'Skip tour'}</button>
          </div>
        </div>
      </section>
    </div>
  )
}
