import { useMemo, useState } from 'react'
import { Instagram } from 'lucide-react'
import Lightbox from './Lightbox'
import Photo, { fullSrc } from './Photo'
import { GALLERY, FILTERS } from '../lib/menuData'
import { INSTAGRAM_URL } from '../lib/site'
import { useReveal } from '../hooks/useReveal'

// Each tile reveals on its own as it scrolls in, staggered by column so a row cascades
function Tile({ g, i, onOpen }) {
  const ref = useReveal((i % 3) * 120)
  return (
    <button
      ref={ref}
      onClick={onOpen}
      className="reveal group relative block w-full mb-3 md:mb-4 overflow-hidden cursor-zoom-in break-inside-avoid"
      aria-label={`Open photo: ${g.alt}`}
    >
      <Photo id={g.id} alt={g.alt} sizes="(min-width: 768px) 360px, 50vw" className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
      <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/25 transition-colors duration-500" />
    </button>
  )
}

export default function Gallery() {
  const [filter, setFilter] = useState('all')
  const [index, setIndex] = useState(null)
  const head = useReveal()

  const shown = useMemo(() => (filter === 'all' ? GALLERY : GALLERY.filter((g) => g.cat === filter)), [filter])
  const full = useMemo(() => shown.map((g) => fullSrc(g.id)), [shown])

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

        <div className="mt-12 columns-2 md:columns-3 gap-3 md:gap-4">
          {shown.map((g, i) => (
            <Tile key={g.id} g={g} i={i} onOpen={() => setIndex(i)} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            <Instagram size={15} /> Follow @urbancitycuts
          </a>
        </div>
      </div>

      <Lightbox images={full} index={index} onIndex={setIndex} onClose={() => setIndex(null)} label="Urban City Cuts" />
    </section>
  )
}
