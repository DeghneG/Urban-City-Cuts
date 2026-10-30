import FooterWordmark from './FooterWordmark'
import BarberPole from './BarberPole'
import { useReveal } from '../hooks/useReveal'
import { INSTAGRAM_URL, FACEBOOK_URL, MESSENGER_URL, FOLLOWERS, CANCELLATION } from '../lib/site'

export default function Footer() {
  const ref = useReveal()
  return (
    <footer className="border-t border-line pt-10 md:pt-14 pb-10 overflow-hidden">
      {/* A barber pole stands at each far edge of the page, level with the links, spinning */}
      <div className="relative">
        <BarberPole className="absolute inset-y-0 my-auto h-fit left-3 sm:left-6 md:left-10 w-[18px] sm:w-[22px] md:w-[26px]" />
        <div ref={ref} className="reveal mx-auto max-w-6xl px-11 sm:px-16 md:px-20 min-h-[96px] sm:min-h-[117px] md:min-h-[139px] flex items-center text-sm">
          <div className="w-full flex flex-wrap items-center justify-center md:justify-between gap-x-12 gap-y-6 text-center md:text-left">
            <nav aria-label="Social" className="flex flex-wrap justify-center gap-x-8 gap-y-3">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="footer-link text-chrome">Instagram</a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="footer-link text-chrome">Facebook <span className="text-muted">({FOLLOWERS} followers)</span></a>
              <a href={MESSENGER_URL} target="_blank" rel="noopener noreferrer" className="footer-link text-chrome">Message us</a>
            </nav>
            <p className="max-w-xs text-muted leading-relaxed">{CANCELLATION}</p>
          </div>
        </div>
        <BarberPole mirror className="absolute inset-y-0 my-auto h-fit right-3 sm:right-6 md:right-10 w-[18px] sm:w-[22px] md:w-[26px]" />
      </div>

      <FooterWordmark />

      <p className="mx-auto max-w-6xl px-5 mt-8 text-xs text-muted">
        © {new Date().getFullYear()} Urban City Cuts Barbershop, Iloilo City.
      </p>
    </footer>
  )
}
