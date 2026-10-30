import { useState } from 'react'
import { X } from 'lucide-react'
import { UNDAS } from '../lib/site'

// Undas notice. Hides itself once the closure is over, and the visitor can dismiss it for the session.
export default function Advisory() {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem('ucc-undas') === '1' } catch { return false }
  })
  if (dismissed || Date.now() >= new Date(UNDAS.hideAfter).getTime()) return null

  const close = () => {
    setDismissed(true)
    try { sessionStorage.setItem('ucc-undas', '1') } catch { /* private mode */ }
  }

  return (
    <div role="status" className="relative bg-bone text-ink">
      <p className="mx-auto max-w-6xl px-12 py-2.5 text-center text-[0.7rem] md:text-xs font-medium tracking-wide leading-snug">
        <span className="font-semibold tracking-[0.18em] uppercase mr-2">Undas advisory</span>
        Closed November 1–2 for All Saints’ &amp; All Souls’ Day. Book your cut in advance. We’re open until then. 🕯️
      </p>
      <button onClick={close} aria-label="Dismiss advisory" className="absolute right-3 top-1/2 -translate-y-1/2 p-3.5 text-ink/60 hover:text-ink cursor-pointer">
        <X size={14} />
      </button>
    </div>
  )
}
