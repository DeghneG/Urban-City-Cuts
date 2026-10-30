import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { bookHref, bookExternal } from '../lib/site'
import { setScrollLocked } from '../lib/smoothScroll'

const LINKS = [
  ['Gallery', '#gallery'],
  ['Prices', '#menu'],
  ['Café', '#cafe'],
  ['Branches', '#branches'],
  ['Franchise', '#franchise'],
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setScrollLocked(open)
    return () => setScrollLocked(false)
  }, [open])

  const bookProps = bookExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-500 ${solid || open ? 'bg-ink/90 backdrop-blur-md border-b border-line' : 'bg-transparent border-b border-transparent'}`}>
      <nav className="mx-auto max-w-6xl h-[68px] px-5 flex items-center justify-between" aria-label="Main">
        <a href="#" className="flex items-center gap-3" aria-label="Urban City Cuts, back to top">
          <img src="/img/logo-mark.png" alt="" className="h-9 w-auto" />
          <span className="display text-[0.8rem] tracking-[0.12em] leading-none">
            Urban City Cuts
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-9">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="footer-link text-[0.68rem] font-medium tracking-[0.24em] uppercase text-chrome">{label}</a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href={bookHref} {...bookProps} className="btn btn-chrome !py-3 !px-5 hidden sm:inline-flex">Book</a>
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} className="md:hidden w-11 h-11 flex items-center justify-center text-bone cursor-pointer">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden fixed inset-x-0 top-[68px] bottom-0 bg-ink/98 px-6 pt-8 animate-fadeUp [animation-delay:0s] [animation-duration:0.35s]">
          <ul className="flex flex-col">
            {LINKS.map(([label, href]) => (
              <li key={href} className="border-b border-line">
                <a href={href} onClick={() => setOpen(false)} className="display block py-5 text-3xl">{label}</a>
              </li>
            ))}
          </ul>
          <a href={bookHref} {...bookProps} onClick={() => setOpen(false)} className="btn btn-chrome w-full mt-8">Book now</a>
        </div>
      )}
    </header>
  )
}
