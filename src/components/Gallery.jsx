import { useEffect, useMemo, useState } from 'react'
import { Instagram } from 'lucide-react'
import Lightbox from './Lightbox'
import Photo, { fullSrc } from './Photo'
import { GALLERY, FILTERS } from '../lib/menuData'
import { INSTAGRAM_URL } from '../lib/site'
import { scrollToElement } from '../lib/smoothScroll'
import { useReveal } from '../hooks/useReveal'
import { useAdmin } from '../lib/adminStore'

// Three columns from tablet up, two on a phone
function useColumns() {
  const query = '(min-width: 768px)'
  const [wide, setWide] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide ? 3 : 2
}

// Each tile reveals on its own as it scrolls in, staggered by column so a row cascades
function Tile({ g, col, onOpen }) {
  const ref = useReveal(col * 120)
  return (
    <button
      ref={ref}
      onClick={onOpen}
      className="reveal group relative block w-full overflow-hidden cursor-zoom-in"
      aria-label={`Open photo: ${g.alt}`}
    >
      <Photo id={g.id} alt={g.alt} sizes="(min-width: 768px) 360px, 50vw" className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
      <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/25 transition-colors duration-500" />
    </button>
  )
}

export default function Gallery() {
  const { hiddenPhotos } = useAdmin()
  const cols = useColumns()
  const per = cols === 3 ? 9 : 8 // a whole number of rows in either layout
  const [filter, setFilter] = useState('all')
  const [count, setCount] = useState(per)
  const [index, setIndex] = useState(null)
  const head = useReveal()

  const shown = useMemo(() => GALLERY.filter((g) => !hiddenPhotos.includes(g.id) && (filter === 'all' || g.cat === filter)), [filter, hiddenPhotos])
  const full = useMemo(() => shown.map((g) => fullSrc(g.id)), [shown])
  const visible = shown.slice(0, count)
  const remaining = shown.length - visible.length

  // A new filter, or a new layout, starts again from the first batch
  useEffect(() => { setCount(per) }, [filter, per])

  // Deal photos out to the columns in order, so ones already on screen never move when more appear
  const columns = useMemo(() => {
    const out = Array.from({ length: cols }, () => [])
    visible.forEach((g, i) => out[i % cols].push({ g, i }))
    return out
  }, [visible, cols])

  const collapse = () => {
    setCount(per)
    scrollToElement(document.getElementById('gallery'))
  }

  return (
    <section id="gallery" className="py-24 md:py-32 bg-ink-2 border-y border-line">
      <div className="mx-auto max-w-6xl px-5">
        <div ref={head} className="reveal flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Gallery</p>
            <h2 className="display mt-6 text-4xl md:text-6xl">Let the results<br />speak.</h2>
          </div>
          <div role="tablist" aria-label="Filter photos" className="flex flex-wrap gap-2">
            {FILTERS.map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={filter === id}
                onClick={() => setFilter(id)}
                className={`px-4 py-2 text-[0.66rem] tracking-[0.22em] uppercase border cursor-pointer transition-colors ${filter === id ? 'bg-bone text-ink border-bone' : 'border-line text-chrome hover:border-chrome'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 flex items-start gap-3 md:gap-4">
          {columns.map((items, c) => (
            <div key={c} className="flex-1 min-w-0 flex flex-col gap-3 md:gap-4">
              {items.map(({ g, i }) => <Tile key={g.id} g={g} col={c} onOpen={() => setIndex(i)} />)}
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-5">
          <p className="text-xs text-muted tabular-nums" aria-live="polite">Showing {visible.length} of {shown.length} photos</p>
          {remaining > 0 ? (
            <button onClick={() => setCount((n) => n + per)} className="btn btn-chrome cursor-pointer">
              Show more photos <span className="opacity-60">({remaining} more)</span>
            </button>
          ) : shown.length > per ? (
            <button onClick={collapse} className="btn btn-ghost cursor-pointer">Show fewer</button>
          ) : null}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            <Instagram size={15} /> Follow @urbancitycuts
          </a>
        </div>
      </div>

      <Lightbox images={full} index={index} onIndex={setIndex} onClose={() => setIndex(null)} label="Urban City Cuts" />
    </section>
  )
}
