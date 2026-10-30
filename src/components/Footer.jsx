import FooterWordmark from './FooterWordmark'
import BarberPole from './BarberPole'
import { useReveal } from '../hooks/useReveal'
import { INSTAGRAM_URL, FACEBOOK_URL, MESSENGER_URL, FOLLOWERS, CANCELLATION } from '../lib/site'

export default function Footer() {
  const ref = useReveal()
  return (
    <footer className="border-t border-line pt-14 md:pt-20 pb-10">
      {/* A barber pole stands at each end of the footer's link row, spinning */}
      <div ref={ref} className="reveal mx-auto max-w-6xl px-5 flex items-center gap-4 md:gap-12 text-sm">
        <BarberPole className="shrink-0 w-9 sm:w-12 md:w-[4.5rem]" />
        <div className="flex-1 min-w-0 flex flex-wrap items-center justify-center md:justify-between gap-x-12 gap-y-6 text-center md:text-left">
          <nav aria-label="Social" className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="footer-link text-chrome">Instagram</a>
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="footer-link text-chrome">Facebook <span className="text-muted">({FOLLOWERS} followers)</span></a>
            <a href={MESSENGER_URL} target="_blank" rel="noopener noreferrer" className="footer-link text-chrome">Message us</a>
          </nav>
          <p className="max-w-xs text-muted leading-relaxed">{CANCELLATION}</p>
        </div>
        <BarberPole mirror className="shrink-0 w-9 sm:w-12 md:w-[4.5rem]" />
      </div>

      <FooterWordmark />

      <p className="mx-auto max-w-6xl px-5 mt-8 text-xs text-muted">
        © {new Date().getFullYear()} Urban City Cuts Barbershop, Iloilo City.
      </p>
    </footer>
  )
}
