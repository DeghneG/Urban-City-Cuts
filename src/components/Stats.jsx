import { FOLLOWERS } from '../lib/site'
import { useReveal } from '../hooks/useReveal'

const ITEMS = [
  `${FOLLOWERS} followers`,
  'Walk-ins welcome',
  'Reservations open',
  '3 branches',
  'Free hair consultation',
  'Open until 8 PM',
]

// Slow ticker, repeated twice so the loop is seamless (the track translates by -50%)
export default function Stats() {
  const row = ITEMS.concat(ITEMS)
  const ref = useReveal()
  return (
    <div ref={ref} className="reveal border-y border-line bg-ink-2 overflow-hidden" aria-label="Highlights">
      <ul className="flex w-max animate-ticker py-5">
        {row.concat(row).map((t, i) => (
          <li key={i} className="flex items-center whitespace-nowrap text-[0.7rem] tracking-[0.3em] uppercase text-chrome" aria-hidden={i >= ITEMS.length}>
            <span className="px-8">{t}</span>
            <span className="w-1 h-1 rounded-full bg-chrome-dark" />
          </li>
        ))}
      </ul>
    </div>
  )
}
