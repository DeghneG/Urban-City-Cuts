import { Car, Wifi, MessageSquare, Coffee, Tv, Snowflake, Armchair } from 'lucide-react'
import { PERKS } from '../lib/site'
import { useReveal } from '../hooks/useReveal'

const ICONS = { Car, Wifi, MessageSquare, Coffee, Tv, Snowflake, Armchair }

export default function Experience() {
  const head = useReveal()
  const grid = useReveal(150)
  return (
    <section id="experience" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div ref={head} className="reveal max-w-3xl">
          <p className="eyebrow">The experience</p>
          <h2 className="display mt-6 text-4xl md:text-6xl">More than<br />a barbershop.</h2>
          <p className="mt-6 max-w-md text-chrome leading-relaxed">Walk-ins and appointments are always welcome. Settle in, we’ve got the rest.</p>
        </div>

        <ul ref={grid} className="reveal mt-14 grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
          {PERKS.map(({ icon, label, note }) => {
            const Icon = ICONS[icon]
            return (
              <li key={label} className="bg-ink p-6 md:p-8 flex flex-col gap-5 transition-colors hover:bg-ink-3">
                <Icon size={22} strokeWidth={1.4} className="text-chrome-light" />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="mt-1 text-xs text-muted">{note}</p>
                </div>
              </li>
            )
          })}
          <li className="bg-ink p-6 md:p-8 flex flex-col justify-end">
            <p className="font-serif italic text-2xl text-chrome-light leading-tight">Good hair.<br />Better confidence.</p>
          </li>
        </ul>
      </div>
    </section>
  )
}
