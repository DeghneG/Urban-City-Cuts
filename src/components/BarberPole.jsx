import { useId, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

// A barber pole: glass tube, chrome caps and ball finial, red and blue bands on white.
// GSAP slides the band group down by exactly one period (80 units) on a loop, so the stripes appear to climb forever.
// It pauses when off screen, rushes ahead while hovered, and fades up when it first comes into view.
const PERIOD = 80 // red band + white + blue band + white
const TUBE = { x: 8, y: 34, w: 44, h: 252 }

export default function BarberPole({ mirror = false, className = '' }) {
  const uid = useId().replace(/:/g, '')
  const root = useRef(null)
  const bands = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const spin = gsap.to(bands.current, { y: PERIOD, duration: 5.5, ease: 'none', repeat: -1 })

      // Only animate while on screen
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? spin.resume() : spin.pause()), { threshold: 0.05 })
      io.observe(root.current)

      // Rises into place the first time it appears
      gsap.from(root.current, { autoAlpha: 0, y: 36, duration: 1.4, ease: 'power3.out', delay: 0.1 })

      // Hover or touch speeds the spin up, then eases back to a calm pace
      const fast = () => gsap.to(spin, { timeScale: 4, duration: 0.7, ease: 'power2.out' })
      const calm = () => gsap.to(spin, { timeScale: 1, duration: 1.2, ease: 'power2.inOut' })
      const el = root.current
      el.addEventListener('pointerenter', fast)
      el.addEventListener('pointerleave', calm)
      el.addEventListener('pointerdown', fast)
      el.addEventListener('pointerup', calm)
      return () => {
        io.disconnect()
        el.removeEventListener('pointerenter', fast)
        el.removeEventListener('pointerleave', calm)
        el.removeEventListener('pointerdown', fast)
        el.removeEventListener('pointerup', calm)
      }
    }, root)
    return () => ctx.revert()
  }, [])

  // Red and blue bands, slanted across the tube. Drawn past both ends so the loop never shows a gap.
  const polys = []
  for (let k = -2; k <= 5; k++) {
    const y = TUBE.y + k * PERIOD
    polys.push(<polygon key={`r${k}`} points={`0,${y} 60,${y - 30} 60,${y - 10} 0,${y + 20}`} fill="#b4232c" />)
    polys.push(<polygon key={`b${k}`} points={`0,${y + 40} 60,${y + 10} 60,${y + 30} 0,${y + 60}`} fill="#1f3f7a" />)
  }

  return (
    <div ref={root} className={`select-none ${className}`} aria-hidden="true" style={{ transform: mirror ? 'scaleX(-1)' : undefined }}>
      <svg viewBox="0 0 60 320" className="block w-full h-auto overflow-visible" style={{ filter: 'drop-shadow(0 18px 28px rgba(0,0,0,0.65)) drop-shadow(0 0 22px rgba(255,255,255,0.06))' }}>
        <defs>
          <clipPath id={`${uid}-tube`}><rect x={TUBE.x} y={TUBE.y} width={TUBE.w} height={TUBE.h} rx="2" /></clipPath>
          {/* Chrome for the caps */}
          <linearGradient id={`${uid}-chrome`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#5d636a" /><stop offset="0.22" stopColor="#f7f9fb" /><stop offset="0.5" stopColor="#aab0b6" /><stop offset="0.78" stopColor="#e3e6e9" /><stop offset="1" stopColor="#3a3e44" />
          </linearGradient>
          {/* Cylinder shading laid over the stripes: dark edges, a soft highlight, a darker right side */}
          <linearGradient id={`${uid}-shade`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.6" /><stop offset="0.16" stopColor="#000" stopOpacity="0.08" /><stop offset="0.3" stopColor="#fff" stopOpacity="0.42" />
            <stop offset="0.42" stopColor="#fff" stopOpacity="0.06" /><stop offset="0.8" stopColor="#000" stopOpacity="0.18" /><stop offset="1" stopColor="#000" stopOpacity="0.68" />
          </linearGradient>
          <linearGradient id={`${uid}-ends`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.5" /><stop offset="0.08" stopColor="#000" stopOpacity="0" /><stop offset="0.92" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" />
          </linearGradient>
          <radialGradient id={`${uid}-ball`} cx="0.34" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#fff" /><stop offset="0.45" stopColor="#a4abb2" /><stop offset="1" stopColor="#25282c" />
          </radialGradient>
        </defs>

        {/* Finial ball and top cap */}
        <circle cx="30" cy="11" r="7.5" fill={`url(#${uid}-ball)`} />
        <rect x="26" y="16" width="8" height="8" fill={`url(#${uid}-chrome)`} />
        <rect x="4" y="22" width="52" height="12" rx="3.5" fill={`url(#${uid}-chrome)`} />

        {/* The tube: white glass, moving bands, then the shading on top */}
        <rect x={TUBE.x} y={TUBE.y} width={TUBE.w} height={TUBE.h} rx="2" fill="#f1f2f4" />
        <g clipPath={`url(#${uid}-tube)`}>
          <g ref={bands}>{polys}</g>
          <rect x={TUBE.x} y={TUBE.y} width={TUBE.w} height={TUBE.h} fill={`url(#${uid}-shade)`} />
          <rect x={TUBE.x} y={TUBE.y} width={TUBE.w} height={TUBE.h} fill={`url(#${uid}-ends)`} />
          <rect x="19" y={TUBE.y + 6} width="2.2" height={TUBE.h - 12} rx="1.1" fill="#fff" opacity="0.5" />
        </g>
        <rect x={TUBE.x} y={TUBE.y} width={TUBE.w} height={TUBE.h} rx="2" fill="none" stroke="#fff" strokeOpacity="0.16" />

        {/* Bottom cap and foot */}
        <rect x="4" y="286" width="52" height="12" rx="3.5" fill={`url(#${uid}-chrome)`} />
        <rect x="9" y="298" width="42" height="7" rx="2" fill={`url(#${uid}-chrome)`} />
        <rect x="14" y="305" width="32" height="6" rx="2" fill="#2a2c30" />
      </svg>
    </div>
  )
}
