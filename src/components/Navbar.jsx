import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Menu, X } from 'lucide-react'
import { openBooking } from '../lib/site'
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
  const [menuTop, setMenuTop] = useState(68)
  const header = useRef(null)
  const bar = useRef(null)

  // One stripe cycle is 32px along the gradient, which is 32 / cos(45deg) = 45.25px along x, so this loops seamlessly
  useLayoutEffect(() => {
    const tween = gsap.to(bar.current, { backgroundPositionX: '45.2548px', duration: 1.1, ease: 'none', repeat: -1 })
    return () => tween.kill()
  }, [])

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      setSolid(window.scrollY > 40)
      // Reading progress goes straight to the bar's transform, so scrolling never re-renders React
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (bar.current) bar.current.style.clipPath = `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0)`
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Only touch the lock while the mobile menu is open. Running on mount with open=false would release
  // the lock the intro loader just took, letting visitors scroll under it.
  useEffect(() => {
    if (!open) return
    setScrollLocked(true)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onResize = () => window.innerWidth >= 768 && setOpen(false)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      setScrollLocked(false)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  // The menu starts right under the bar, wherever the bar sits (below the advisory at the top, or flush when scrolled)
  const toggle = () => {
    if (!open) setMenuTop(header.current.getBoundingClientRect().bottom)
    setOpen((o) => !o)
  }


  return (
    <>
      {/* Scroll progress: a hairline across the very top of the screen, above the navbar */}
      <div className="fixed inset-x-0 top-0 z-[55] h-[4px] pointer-events-none" aria-hidden="true">
        <div ref={bar} className="h-full w-full barber-stripes" style={{ clipPath: 'inset(0 100% 0 0)' }} />
      </div>
      <header ref={header} className={`sticky top-0 z-50 transition-colors duration-500 ${solid || open ? 'bg-ink/90 backdrop-blur-md border-b border-line' : 'bg-transparent border-b border-transparent'}`}>
        <nav className="mx-auto max-w-[1600px] h-[68px] px-5 lg:px-10 flex items-center justify-between" aria-label="Main">
          <a href="#" className="flex items-center gap-3" aria-label="Urban City Cuts, back to top">
            <img src="/img/logo-mark.png" alt="" className="h-9 w-auto" />
            <span className="display text-[0.8rem] tracking-[0.12em] leading-none whitespace-nowrap">
              Urban City Cuts
            </span>
          </a>

          <ul className="hidden md:flex items-center gap-5 lg:gap-9">
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <a href={href} className="footer-link text-[0.68rem] font-medium tracking-[0.14em] lg:tracking-[0.24em] uppercase text-chrome">{label}</a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <button onClick={() => openBooking()} className="btn btn-chrome !py-3 !px-5 hidden sm:inline-flex cursor-pointer">Book</button>
            <button onClick={toggle} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} className="md:hidden w-11 h-11 flex items-center justify-center text-bone cursor-pointer">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Sibling of the header, not a child: the header's backdrop-filter would otherwise become the
          containing block for this fixed panel and collapse it to nothing. */}
      {open && (
        <div
          className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-ink px-6 pt-8 overflow-y-auto animate-fadeUp [animation-delay:0s] [animation-duration:0.35s]"
          style={{ top: menuTop }}
        >
          <ul className="flex flex-col">
            {LINKS.map(([label, href]) => (
              <li key={href} className="border-b border-line">
                <a href={href} onClick={() => setOpen(false)} className="display block py-5 text-3xl">{label}</a>
              </li>
            ))}
          </ul>
          <button onClick={() => { setOpen(false); openBooking() }} className="btn btn-chrome w-full mt-8 cursor-pointer">Book now</button>
        </div>
      )}
    </>
  )
}
