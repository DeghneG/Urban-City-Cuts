import { useEffect } from 'react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { setScrollLocked } from '../lib/smoothScroll'

// Full-screen viewer for a barber's work: arrows/keys to step, Esc or backdrop to close
export default function Lightbox({ images, index, onIndex, onClose, label }) {
  const open = index !== null
  const count = images.length

  useEffect(() => {
    if (!open) return
    setScrollLocked(true)
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex((index + 1) % count)
      if (e.key === 'ArrowLeft') onIndex((index - 1 + count) % count)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      setScrollLocked(false)
    }
  }, [open, index, count, onIndex, onClose])

  if (!open) return null

  const step = (d) => (e) => {
    e.stopPropagation()
    onIndex((index + d + count) % count)
  }

  return (
    <div
      className="fixed inset-0 z-[70] bg-ink/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 animate-fadeUp [animation-delay:0s] [animation-duration:0.35s]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${label}, photo ${index + 1} of ${count}`}
    >
      <img
        key={images[index]}
        src={images[index]}
        alt={`${label} ${index + 1}`}
        className="max-h-full max-w-full object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      <button onClick={onClose} aria-label="Close" className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center border border-line bg-ink/70 text-bone cursor-pointer hover:border-chrome">
        <X size={18} />
      </button>
      {count > 1 && (
        <>
          <button onClick={step(-1)} aria-label="Previous photo" className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center border border-line bg-ink/70 text-bone cursor-pointer hover:border-chrome">
            <ArrowLeft size={16} />
          </button>
          <button onClick={step(1)} aria-label="Next photo" className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center border border-line bg-ink/70 text-bone cursor-pointer hover:border-chrome">
            <ArrowRight size={16} />
          </button>
        </>
      )}
      <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[0.68rem] tracking-[0.3em] text-chrome-light">
        {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
      </span>
    </div>
  )
}
