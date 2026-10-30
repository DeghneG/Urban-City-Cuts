import { CAFE, peso } from '../lib/menuData'
import Photo from './Photo'
import { useAdmin } from '../lib/adminStore'
import { useReveal } from '../hooks/useReveal'

const dash = <span className="text-chrome-dark/50" aria-label="not served">–</span>

function DrinkCard({ title, rows }) {
  return (
    <div className="border border-line bg-ink/60 p-6 md:p-8">
      <div className="flex items-end justify-between">
        <h3 className="display text-2xl">{title}</h3>
        <div className="grid grid-cols-2 gap-6 text-[0.62rem] tracking-[0.22em] uppercase text-muted text-right">
          <span>Hot<br />8oz</span>
          <span>Iced<br />16oz</span>
        </div>
      </div>
      <ul className="mt-6">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center justify-between py-3 border-t border-line text-sm">
            <span>{r.name}</span>
            <span className="grid grid-cols-2 gap-6 text-right tabular-nums w-[8.5rem]">
              <span>{r.hot ? peso(r.hot) : dash}</span>
              <span>{r.iced ? peso(r.iced) : dash}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SimpleCard({ title, rows }) {
  return (
    <div className="border border-line bg-ink/60 p-6 md:p-8">
      <h3 className="display text-2xl">{title}</h3>
      <ul className="mt-6">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center justify-between gap-4 py-3 border-t border-line text-sm">
            <span>{r.name}</span>
            <span className="tabular-nums">{peso(r.price)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Cafe() {
  useAdmin() // re-render when the owner edits a café price
  const head = useReveal()
  const a = useReveal(100)
  const b = useReveal(200)
  return (
    <section id="cafe" className="relative py-24 md:py-32 overflow-hidden">
      <Photo id="main" alt="" sizes="100vw" className="absolute inset-0 w-full h-full object-cover object-[50%_82%] opacity-[0.16]" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />

      <div className="relative mx-auto max-w-6xl px-5">
        <div ref={head} className="reveal grid md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-7">
            <p className="eyebrow">Barbershop &amp; Café</p>
            <h2 className="display mt-6 text-4xl md:text-6xl">Fresh cut.<br /><span className="font-serif italic normal-case font-normal text-chrome-light">Fresh cup.</span></h2>
          </div>
          <p className="md:col-span-5 text-chrome leading-relaxed">
            Grab an espresso while you wait, or stay for another. The café is open at our <strong className="text-bone font-medium">Mandurriao</strong> and <strong className="text-bone font-medium">Jaro</strong> branches.
          </p>
        </div>

        <div ref={a} className="reveal mt-14 grid md:grid-cols-2 gap-4">
          <DrinkCard title="Espresso" rows={CAFE.espresso} />
          <DrinkCard title="Non-coffee & refreshments" rows={CAFE.refreshments} />
        </div>
        <div ref={b} className="reveal mt-4 grid md:grid-cols-3 gap-4">
          <SimpleCard title="Soda" rows={CAFE.soda} />
          <SimpleCard title="Beer" rows={CAFE.beer} />
          <SimpleCard title="Add-ons" rows={CAFE.addons} />
        </div>
      </div>
    </section>
  )
}
