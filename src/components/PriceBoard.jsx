import { useMemo, useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { CATEGORIES, NOTE, peso } from '../lib/menuData'
import { bookHref, bookExternal, CANCELLATION } from '../lib/site'
import { useReveal } from '../hooks/useReveal'

const ALL = CATEGORIES.flatMap((c) => c.items.map((it) => ({ ...it, cat: c.id, base: Boolean(c.base) })))
const byId = Object.fromEntries(ALL.map((i) => [i.id, i]))

// Browse by tab, tap to build a visit. One main service (cut, package or color), plus any add-ons or products.
export default function PriceBoard() {
  const [tab, setTab] = useState(CATEGORIES[0].id)
  const [baseId, setBaseId] = useState(null)
  const [extras, setExtras] = useState([])
  const head = useReveal()
  const body = useReveal(150)

  const cat = CATEGORIES.find((c) => c.id === tab)
  const lines = useMemo(() => [baseId, ...extras].filter(Boolean).map((id) => byId[id]), [baseId, extras])
  const total = lines.reduce((s, l) => s + l.price, 0)
  const hasFrom = lines.some((l) => l.from)

  const pick = (item) => {
    if (item.base) setBaseId((cur) => (cur === item.id ? null : item.id))
    else setExtras((cur) => (cur.includes(item.id) ? cur.filter((x) => x !== item.id) : [...cur, item.id]))
  }
  const isOn = (item) => (item.base ? baseId === item.id : extras.includes(item.id))
  const reset = () => { setBaseId(null); setExtras([]) }
  const bookProps = bookExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <section id="menu" className="py-24 md:py-32 bg-ink-2 border-y border-line">
      <div className="mx-auto max-w-6xl px-5">
        <div ref={head} className="reveal max-w-xl">
          <p className="eyebrow">Services &amp; prices</p>
          <h2 className="display mt-6 text-4xl md:text-6xl">Build your<br />visit.</h2>
          <p className="mt-6 text-chrome leading-relaxed">Tap what you want and watch the total. Every cut comes with a free hair consultation.</p>
        </div>

        <div ref={body} className="reveal mt-14 grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Menu */}
          <div className="lg:col-span-7 min-w-0">
            <div role="tablist" aria-label="Service categories" className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={tab === c.id}
                  onClick={() => setTab(c.id)}
                  className={`shrink-0 px-4 py-2.5 text-[0.66rem] tracking-[0.2em] uppercase border cursor-pointer transition-colors ${tab === c.id ? 'bg-bone text-ink border-bone' : 'border-line text-chrome hover:border-chrome'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <p className="mt-8 font-serif italic text-xl text-chrome-light">{cat.kicker}</p>

            <ul key={cat.id} role={cat.base ? 'radiogroup' : 'group'} aria-label={cat.label} className="mt-4 animate-fadeUp [animation-delay:0s] [animation-duration:0.5s]">
              {cat.items.map((item) => {
                const it = { ...item, base: Boolean(cat.base) }
                const on = isOn(it)
                return (
                  <li key={item.id} className="border-b border-line">
                    <button
                      onClick={() => pick(it)}
                      role={cat.base ? 'radio' : undefined}
                      aria-checked={cat.base ? on : undefined}
                      aria-pressed={cat.base ? undefined : on}
                      className="group w-full flex items-start gap-4 py-5 text-left cursor-pointer"
                    >
                      <span className={`mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center border transition-colors ${cat.base ? 'rounded-full' : ''} ${on ? 'bg-bone border-bone text-ink' : 'border-chrome-dark text-transparent group-hover:border-bone'}`}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-baseline gap-3">
                          <span className={`transition-colors ${on ? 'text-white' : 'text-bone'}`}>{item.name}</span>
                          {item.badge && <span className="text-[0.58rem] tracking-[0.22em] uppercase border border-chrome-dark px-2 py-0.5 text-chrome">{item.badge}</span>}
                          <span className="flex-1 border-b border-dotted border-chrome-dark/60 translate-y-[-4px] min-w-4" aria-hidden="true" />
                          <span className="whitespace-nowrap font-medium tabular-nums">
                            {item.from && <span className="text-[0.62rem] tracking-[0.18em] uppercase text-muted mr-2">from</span>}
                            {peso(item.price)}
                          </span>
                        </span>
                        {item.detail && <span className="block mt-2 text-sm text-muted max-w-md leading-relaxed">{item.detail}</span>}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="mt-6 text-xs text-muted">{NOTE}</p>
          </div>

          {/* Ticket */}
          <aside className="lg:col-span-5 min-w-0 lg:sticky lg:top-24" aria-label="Your visit estimate">
            <div className="relative bg-bone text-ink p-7 md:p-8">
              {/* Ticket notches */}
              <span className="absolute -left-3 top-[4.6rem] w-6 h-6 rounded-full bg-ink-2" aria-hidden="true" />
              <span className="absolute -right-3 top-[4.6rem] w-6 h-6 rounded-full bg-ink-2" aria-hidden="true" />
              <div className="flex items-center justify-between">
                <p className="text-[0.66rem] font-semibold tracking-[0.3em] uppercase">Your visit</p>
                {lines.length > 0 && (
                  <button onClick={reset} className="inline-flex items-center gap-1.5 text-[0.62rem] tracking-[0.2em] uppercase text-ink/60 hover:text-ink cursor-pointer">
                    <RotateCcw size={11} /> Clear
                  </button>
                )}
              </div>
              <div className="mt-8 border-t border-dashed border-ink/30 pt-6 min-h-[8rem]">
                {lines.length === 0 ? (
                  <p className="font-serif italic text-xl text-ink/60 leading-snug">Pick a cut to start. Add-ons and products stack on top.</p>
                ) : (
                  <ul className="space-y-3 text-sm">
                    {lines.map((l) => (
                      <li key={l.id} className="flex justify-between gap-4">
                        <span>{l.name}</span>
                        <span className="tabular-nums whitespace-nowrap">{l.from ? 'from ' : ''}{peso(l.price)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-6 border-t border-dashed border-ink/30 pt-6 flex items-end justify-between">
                <span className="text-[0.66rem] font-semibold tracking-[0.3em] uppercase">{hasFrom ? 'Estimated from' : 'Total'}</span>
                <span className="display text-4xl tabular-nums">{peso(total)}</span>
              </div>
              {hasFrom && <p className="mt-3 text-xs text-ink/60">Color and perm start at the price shown; the final price depends on hair length and volume.</p>}
              <a href={bookHref} {...bookProps} className="btn btn-ink w-full mt-7">Book this visit</a>
              <p className="mt-4 text-xs text-ink/60 text-center">{CANCELLATION}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
