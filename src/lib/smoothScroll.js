import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

let instance = null

export function initSmoothScroll() {

  const lenis = new Lenis({
    autoRaf: true,
    // Slightly slower than the Lenis default feel: a longer glide, and each wheel notch travels a bit less
    duration: 1.6,
    wheelMultiplier: 0.85,
    // Lenis reads the section[id] scroll-margin-top in index.css, which clears the fixed navbar
    anchors: true,
  })
  instance = lenis
  // The intro loader locks scrolling before this runs; respect it until it unlocks
  if (document.documentElement.classList.contains('no-scroll')) lenis.stop()

  // Lenis only handles links that carry a hash name, so the logo's bare "#" is sent to the top here
  const toTop = (e) => {
    const link = e.target.closest?.('a[href="#"]')
    if (!link) return
    e.preventDefault()
    lenis.scrollTo(0)
  }
  document.addEventListener('click', toTop)

  return () => {
    document.removeEventListener('click', toTop)
    lenis.destroy()
    instance = null
  }
}

/* One lock for the mobile menu and the team profile. The class has to go on <html> as well as <body>:
   html carries overflow-x: clip, which stops body's overflow from reaching the viewport. */
export function setScrollLocked(locked) {
  document.documentElement.classList.toggle('no-scroll', locked)
  document.body.classList.toggle('no-scroll', locked)
  if (instance) locked ? instance.stop() : instance.start()
}

// Route changes jump, they do not glide
export function scrollToTop() {
  if (instance) instance.scrollTo(0, { immediate: true })
  else window.scrollTo(0, 0)
}

export function scrollToElement(el) {
  // After a route change the page is taller than Lenis last measured; re-measure so the target is not clamped
  if (instance) {
    instance.resize()
    instance.scrollTo(el)
  } else el.scrollIntoView({ behavior: 'smooth' })
}

// Slow, locked glide for the guided tour: ease-in-out, and longer for longer distances.
// target: an element, a pixel position, or 'end' for the bottom of the page.
export function glideTo(target, { offset = -72, onComplete } = {}) {
  const y =
    target === 'end' ? document.documentElement.scrollHeight
    : typeof target === 'number' ? target
    : target.getBoundingClientRect().top + window.scrollY + offset
  const duration = Math.min(4.2, Math.max(1.8, Math.abs(y - window.scrollY) / 850))
  if (!instance) {
    window.scrollTo({ top: y, behavior: 'smooth' })
    setTimeout(() => onComplete?.(), duration * 700)
    return
  }
  instance.resize()
  instance.scrollTo(y, {
    duration,
    easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    lock: true,
    force: true,
    onComplete,
  })
}
