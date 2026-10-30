import { useEffect, useRef, useState } from 'react'
import { Phone, Navigation, Coffee, MapPin } from 'lucide-react'
import { Map, MapMarker, MarkerContent, MarkerLabel, MarkerPopup, useMap } from './ui/map'
import { BRANCHES, directionsUrl, telHref, formatPhone, CANCELLATION, openBooking } from '../lib/site'
import { useReveal } from '../hooks/useReveal'

const CENTER = [122.5428, 10.7117] // [lng, lat], between the three branches

// Fly to the selected branch, and keep scroll-zoom off until the visitor clicks the map
// so it never hijacks the page scroll.
function MapBehavior({ selected }) {
  const { map } = useMap()
  useEffect(() => {
    if (!map) return
    map.scrollZoom.disable()
    const on = () => map.scrollZoom.enable()
    const off = () => map.scrollZoom.disable()
    const el = map.getContainer()
    el.addEventListener('click', on)
    el.addEventListener('mouseleave', off)
    return () => {
      el.removeEventListener('click', on)
      el.removeEventListener('mouseleave', off)
    }
  }, [map])

  // Fly to the selected branch; clearing the selection flies back out to all three
  const hadSelection = useRef(false)
  useEffect(() => {
    if (!map) return
    if (selected) {
      hadSelection.current = true
      map.flyTo({ center: [selected.lng, selected.lat], zoom: 14.5, duration: 1400, essential: true })
    } else if (hadSelection.current) {
      hadSelection.current = false
      map.flyTo({ center: CENTER, zoom: 12.4, duration: 1200, essential: true })
    }
  }, [map, selected])
  return null
}

function Pin() {
  return (
    <div className="w-11 h-11 rounded-full bg-bone grid place-items-center shadow-[0_0_0_6px_rgba(242,243,244,0.18)]">
      <img src="/img/logo-mark.png" alt="" className="w-6 h-6 invert" />
    </div>
  )
}

export default function Branches() {
  const [selected, setSelected] = useState(null)
  const head = useReveal()
  const body = useReveal(150)

  const reset = () => setSelected(null)

  return (
    <section id="branches" className="py-24 md:py-32 bg-ink-2 border-y border-line">
      <div className="mx-auto max-w-6xl px-5">
        <div ref={head} className="reveal flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Branches</p>
            <h2 className="display mt-6 text-4xl md:text-6xl">Three shops.<br />One standard.</h2>
          </div>
          <p className="max-w-sm text-chrome leading-relaxed">
            Open for walk-ins and reservations. Every branch is on the 2nd floor, with parking.
          </p>
        </div>

        <div ref={body} className="reveal mt-14 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 relative h-[420px] md:h-[560px] border border-line overflow-hidden lg:order-2">
            <Map theme="dark" center={CENTER} zoom={12.4} minZoom={10} className="absolute inset-0">
              <MapBehavior selected={selected} />
              {BRANCHES.map((b) => (
                <MapMarker key={b.id} longitude={b.lng} latitude={b.lat} onClick={() => setSelected(b)}>
                  <MarkerContent>
                    <div className={`transition-transform ${selected?.id === b.id ? 'scale-110' : ''}`}><Pin /></div>
                    <MarkerLabel position="bottom" className="text-bone text-xs font-semibold tracking-[0.18em] uppercase [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">{b.name}</MarkerLabel>
                  </MarkerContent>
                  <MarkerPopup className="!bg-ink !text-bone !border !border-line !p-4 !w-64">
                    <p className="display text-lg">{b.name}</p>
                    <p className="mt-2 text-xs text-chrome leading-relaxed">{b.address}</p>
                    <p className="mt-1 text-xs text-muted">{b.landmark}</p>
                    <a href={directionsUrl(b)} target="_blank" rel="noopener noreferrer" className="inline-link mt-3">Directions</a>
                  </MarkerPopup>
                </MapMarker>
              ))}
            </Map>
            {selected && (
              <button onClick={reset} className="absolute left-3 top-3 z-10 px-3 py-2 bg-ink/85 border border-line text-[0.62rem] tracking-[0.22em] uppercase cursor-pointer hover:border-chrome">
                Show all branches
              </button>
            )}
          </div>

          <ul className="lg:col-span-5 min-w-0 flex flex-col gap-4 lg:order-1">
            {BRANCHES.map((b, i) => {
              const on = selected?.id === b.id
              return (
                <li key={b.id}>
                  <article className={`border p-6 transition-colors ${on ? 'border-chrome bg-ink-3' : 'border-line bg-ink hover:border-chrome-dark'}`}>
                    <button onClick={() => setSelected(b)} aria-pressed={on} className="w-full text-left cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[0.62rem] tracking-[0.3em] uppercase text-muted">0{i + 1}</p>
                          <h3 className="display text-2xl mt-1">{b.name}</h3>
                        </div>
                        {b.cafe && <span className="inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.2em] uppercase border border-chrome-dark px-2.5 py-1 text-chrome"><Coffee size={11} /> Café</span>}
                      </div>
                      <p className="mt-4 text-sm text-chrome leading-relaxed">{b.address}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><MapPin size={13} /> {b.landmark}</p>
                    </button>

                    <dl className="mt-4 text-sm space-y-1">
                      {b.hours.map(([d, h]) => (
                        <div key={d} className="flex justify-between gap-4"><dt className="text-muted">{d}</dt><dd className="tabular-nums">{h}</dd></div>
                      ))}
                    </dl>

                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                      {b.phones.map((p) => (
                        <a key={p} href={telHref(p)} className="inline-flex items-center gap-2 text-sm footer-link tabular-nums"><Phone size={13} /> {formatPhone(p)}</a>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                      <button onClick={() => openBooking({ branch: b.id })} className="btn btn-chrome !py-3 !px-5 cursor-pointer">Book {b.name}</button>
                      <a href={directionsUrl(b)} target="_blank" rel="noopener noreferrer" className="inline-link"><Navigation size={12} /> Get directions</a>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mt-10 border border-line p-6 md:p-8 flex flex-wrap items-center justify-between gap-6 bg-ink">
          <div>
            <p className="display text-xl">Walk-ins &amp; appointments welcome</p>
            <p className="mt-2 text-sm text-muted">{CANCELLATION}</p>
          </div>
          <button onClick={() => openBooking()} className="btn btn-chrome cursor-pointer">Book your cut</button>
        </div>
      </div>
    </section>
  )
}
