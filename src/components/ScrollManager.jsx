import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollToElement, scrollToTop } from '../lib/smoothScroll'

const TITLES = {
  '/': "PARE — Men's Grooming & Lifestyle | Iloilo City",
  '/team': 'Meet the Team | PARE Iloilo City',
}

// New page → top. Arriving with a #hash (e.g. /#services from the team page) → that section.
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (TITLES[pathname]) document.title = TITLES[pathname]

    if (!hash) {
      scrollToTop()
      return
    }
    // Wait a frame so the home page has rendered its sections
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(hash.slice(1))
      if (el) scrollToElement(el)
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, key])

  return null
}
