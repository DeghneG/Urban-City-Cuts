import { useState } from 'react'

export const FALLBACK_VENUE = '/fallback-venue.svg'
export const FALLBACK_PORTRAIT = '/fallback-portrait.svg'
// Texture only, no wordmark — for full-bleed backgrounds that already carry text
export const FALLBACK_TEXTURE = '/fallback-texture.svg'

/**
 * Tracking the failed URL rather than a boolean lets a changed `src` retry.
 */
export default function Img({ src, fallback = FALLBACK_VENUE, alt = '', ...rest }) {
  const [brokenSrc, setBrokenSrc] = useState(null)
  const isBroken = brokenSrc === src

  return (
    <img
      src={isBroken ? fallback : src}
      alt={alt}
      onError={() => setBrokenSrc(src)}
      {...rest}
    />
  )
}
