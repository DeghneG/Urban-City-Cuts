import manifest from '../lib/imageManifest.json'

const set = (id, ext, sizes) => sizes.map((w) => `/img/${id}-${w}.${ext} ${w}w`).join(', ')

/**
 * Responsive photo: AVIF first, WebP fallback, and the browser picks the smallest width that stays sharp
 * for the slot (`sizes`). Width/height are the source's, so layout never shifts while it loads.
 */
export default function Photo({ id, alt, sizes = '100vw', priority = false, className = '', style, onLoad }) {
  const m = manifest[id]
  if (!m) return null
  return (
    <picture>
      <source type="image/avif" srcSet={set(id, 'avif', m.sizes)} sizes={sizes} />
      <img
        src={`/img/${id}-${m.sizes[Math.min(2, m.sizes.length - 1)]}.webp`}
        srcSet={set(id, 'webp', m.sizes)}
        sizes={sizes}
        width={m.w}
        height={m.h}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={priority ? 'high' : undefined}
        className={className}
        style={style}
        onLoad={onLoad}
      />
    </picture>
  )
}

// Largest generated width, for the lightbox
export const fullSrc = (id) => `/img/${id}-${manifest[id].sizes.at(-1)}.webp`
