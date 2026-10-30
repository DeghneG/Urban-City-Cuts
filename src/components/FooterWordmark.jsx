import { useId, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const W = 1000
const H = 150
const I_INDEX = 7 // "URBAN C" is 7 characters, so the I of CITY is character 7
const CAP_TOP = 17 // top and baseline of the capitals, in viewBox units
const BASELINE = 122
const BAR_H = BASELINE - CAP_TOP
const PERIOD = 34 // dark band + gap + silver band + gap

// Giant wordmark. Dim and outlined at rest; a soft spotlight follows the pointer and lights the
// letters under it with a glow. Pointer events cover mouse, touch and pen, so a finger drag works too.
// The "I" in CITY is a barber pole: GSAP slides its stripes down one period on a loop, forever.
export default function FooterWordmark() {
  const id = useId().replace(/:/g, '')
  const svg = useRef(null)
  const grads = useRef([])
  const glow = useRef(null)
  const baseText = useRef(null)
  const bands = useRef(null)
  const [bar, setBar] = useState(null) // { x, w } of the pole, measured from the real letter

  const move = (e) => {
    const r = svg.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const y = ((e.clientY - r.top) / r.height) * H
    grads.current.forEach((g) => g && (g.setAttribute('cx', x), g.setAttribute('cy', y)))
    glow.current.style.opacity = 1
  }
  const leave = () => { glow.current.style.opacity = 0 }

  // Find where the I sits. Measured from the rendered text, so it stays right whatever the font does,
  // and measured again once the display font has finished loading.
  useLayoutEffect(() => {
    const measure = () => {
      const t = baseText.current
      if (!t || t.getNumberOfChars() <= I_INDEX) return
      const r = t.getExtentOfChar(I_INDEX)
      const w = Math.max(16, r.width * 0.62)
      const x = r.x + r.width / 2 - w / 2
      setBar((prev) => (prev && Math.abs(prev.x - x) < 0.2 && Math.abs(prev.w - w) < 0.2 ? prev : { x, w }))
    }
    measure()
    document.fonts?.ready.then(measure)
    document.fonts?.addEventListener('loadingdone', measure)
    return () => document.fonts?.removeEventListener('loadingdone', measure)
  }, [])

  // The stripes climb forever; they pause off screen and rush while the wordmark is touched
  useLayoutEffect(() => {
    if (!bar || !bands.current) return
    const ctx = gsap.context(() => {
      const spin = gsap.to(bands.current, { y: PERIOD, duration: 3.6, ease: 'none', repeat: -1 })
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? spin.resume() : spin.pause()), { threshold: 0.05 })
      io.observe(svg.current)
      const fast = () => gsap.to(spin, { timeScale: 4, duration: 0.7, ease: 'power2.out' })
      const calm = () => gsap.to(spin, { timeScale: 1, duration: 1.2, ease: 'power2.inOut' })
      const el = svg.current
      el.addEventListener('pointerenter', fast)
      el.addEventListener('pointerleave', calm)
      return () => { io.disconnect(); el.removeEventListener('pointerenter', fast); el.removeEventListener('pointerleave', calm) }
    }, svg)
    return () => ctx.revert()
  }, [bar])

  // The wordmark, with the I kept in the layout (so spacing is unchanged) but not drawn
  const text = (props) => (
    <text x="0" y={BASELINE} fontSize="150" textLength={W} lengthAdjust="spacingAndGlyphs" fontFamily="Archivo, sans-serif" fontWeight="850" style={{ fontVariationSettings: "'wdth' 118" }} {...props}>
      URBAN C<tspan fill="none" stroke="none">I</tspan>TY CUTS
    </text>
  )

  // Diagonal dark and silver bands, drawn past both ends so the loop never shows a gap
  const polys = []
  if (bar) {
    const s = bar.w * 0.6
    for (let k = -2; k <= Math.ceil(BAR_H / PERIOD) + 1; k++) {
      const y = k * PERIOD
      polys.push(<polygon key={`d${k}`} points={`0,${y} ${bar.w},${y - s} ${bar.w},${y - s + 9} 0,${y + 9}`} fill="#25272b" />)
      polys.push(<polygon key={`s${k}`} points={`0,${y + 17} ${bar.w},${y + 17 - s} ${bar.w},${y + 17 - s + 9} 0,${y + 26}`} fill="#9ca3aa" />)
    }
  }

  return (
    <div className="w-full px-2 sm:px-4 mt-12 md:mt-16 select-none overflow-hidden">
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Urban City Cuts"
        className="w-full h-auto touch-pan-y cursor-default"
        onPointerMove={move}
        onPointerDown={move}
        onPointerLeave={leave}
        onPointerCancel={leave}
      >
        <defs>
          <radialGradient id={`${id}-core`} gradientUnits="userSpaceOnUse" cx="500" cy="75" r="190" ref={(el) => (grads.current[0] = el)}>
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.45" stopColor="#d9dde1" />
            <stop offset="1" stopColor="#d9dde1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-halo`} gradientUnits="userSpaceOnUse" cx="500" cy="75" r="260" ref={(el) => (grads.current[1] = el)}>
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}-blur`} x="-10%" y="-60%" width="120%" height="220%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          {/* Pole: cylinder shading over the stripes, and chrome for its caps */}
          <linearGradient id={`${id}-shade`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.55" /><stop offset="0.2" stopColor="#000" stopOpacity="0.05" /><stop offset="0.34" stopColor="#fff" stopOpacity="0.45" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.05" /><stop offset="1" stopColor="#000" stopOpacity="0.62" />
          </linearGradient>
          <linearGradient id={`${id}-ends`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.4" /><stop offset="0.1" stopColor="#000" stopOpacity="0" /><stop offset="0.9" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id={`${id}-chrome`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#5d636a" /><stop offset="0.25" stopColor="#f7f9fb" /><stop offset="0.55" stopColor="#aab0b6" /><stop offset="1" stopColor="#3a3e44" />
          </linearGradient>
          {bar && <clipPath id={`${id}-bar`}><rect width={bar.w} height={BAR_H} rx={bar.w * 0.1} /></clipPath>}
        </defs>

        {/* Resting state: dim outline */}
        {text({ ref: baseText, fill: '#16181b', stroke: '#3a3d42', strokeWidth: 1.4 })}

        {/* Lit state: halo glow plus a crisp bright core, both clipped to the letters by the text itself */}
        <g ref={glow} style={{ opacity: 0, transition: 'opacity 0.5s ease' }}>
          <g filter={`url(#${id}-blur)`}>{text({ fill: `url(#${id}-halo)` })}</g>
          {text({ fill: `url(#${id}-core)` })}
        </g>

        {/* The barber pole that stands in for the I */}
        {bar && (
          <g transform={`translate(${bar.x} ${CAP_TOP})`} pointerEvents="none">
            <rect width={bar.w} height={BAR_H} rx={bar.w * 0.1} fill="#eceef0" />
            <g clipPath={`url(#${id}-bar)`}>
              <g ref={bands}>{polys}</g>
              <rect width={bar.w} height={BAR_H} fill={`url(#${id}-shade)`} />
              <rect width={bar.w} height={BAR_H} fill={`url(#${id}-ends)`} />
            </g>
            <rect x="-4" y="-5" width={bar.w + 8} height="6" rx="2" fill={`url(#${id}-chrome)`} />
            <rect x="-4" y={BAR_H - 1} width={bar.w + 8} height="6" rx="2" fill={`url(#${id}-chrome)`} />
          </g>
        )}
      </svg>
    </div>
  )
}
