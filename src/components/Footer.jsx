import FooterWordmark from './FooterWordmark'
import { useReveal } from '../hooks/useReveal'
import { INSTAGRAM_URL, FACEBOOK_URL, MESSENGER_URL, FOLLOWERS, CANCELLATION } from '../lib/site'

export default function Footer() {
  const ref = useReveal()
  return (
    <footer className="border-t border-line pt-14 md:pt-20 pb-10 overflow-hidden">
      <div ref={ref} className="reveal mx-auto max-w-6xl px-5 flex flex-wrap items-start justify-between gap-x-12 gap-y-8 text-sm">
        <nav aria-label="Social" className="flex flex-wrap gap-x-8 gap-y-3">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="footer-link text-chrome">Instagram</a>
          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="footer-link text-chrome">Facebook <span className="text-muted">({FOLLOWERS} followers)</span></a>
          <a href={MESSENGER_URL} target="_blank" rel="noopener noreferrer" className="footer-link text-chrome">Message us</a>
        </nav>
        <p className="max-w-xs text-muted leading-relaxed">{CANCELLATION}</p>
      </div>

      <FooterWordmark />

      <p className="mx-auto max-w-6xl px-5 mt-8 text-xs text-muted">
        © {new Date().getFullYear()} Urban City Cuts Barbershop, Iloilo City.
      </p>
    </footer>
  )
}
