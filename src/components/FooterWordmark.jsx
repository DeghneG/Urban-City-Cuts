import { useId, useRef } from 'react'

const W = 1000
const H = 150

// Giant wordmark. Dim and outlined at rest; a soft spotlight follows the pointer and lights the
// letters under it with a glow. Pointer events cover mouse, touch and pen, so a finger drag works too.
export default function FooterWordmark() {
  const id = useId().replace(/:/g, '')
  const svg = useRef(null)
  const grads = useRef([])
  const glow = useRef(null)

  const move = (e) => {
    const r = svg.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const y = ((e.clientY - r.top) / r.height) * H
    grads.current.forEach((g) => g && (g.setAttribute('cx', x), g.setAttribute('cy', y)))
    glow.current.style.opacity = 1
  }
  const leave = () => { glow.current.style.opacity = 0 }

  const text = (props) => (
    <text x="0" y="122" fontSize="150" textLength={W} lengthAdjust="spacingAndGlyphs" fontFamily="Archivo, sans-serif" fontWeight="850" style={{ fontVariationSettings: "'wdth' 118" }} {...props}>
      URBAN CITY CUTS
    </text>
  )

  return (
    <div className="w-full px-2 sm:px-4 mt-6 select-none overflow-hidden">
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
        </defs>

        {/* Resting state: dim outline */}
        {text({ fill: '#16181b', stroke: '#3a3d42', strokeWidth: 1.4 })}

        {/* Lit state: halo glow plus a crisp bright core, both clipped to the letters by the text itself */}
        <g ref={glow} style={{ opacity: 0, transition: 'opacity 0.5s ease' }}>
          <g filter={`url(#${id}-blur)`}>{text({ fill: `url(#${id}-halo)` })}</g>
          {text({ fill: `url(#${id}-core)` })}
        </g>
      </svg>
    </div>
  )
}
