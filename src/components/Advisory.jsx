import { useState } from 'react'
import { X } from 'lucide-react'
import { UNDAS } from '../lib/site'
import { useAdmin } from '../lib/adminStore'

// Top advisory. By default the Undas notice, which hides itself once the closure is over. The owner can switch it
// off or write their own message in /admin; a custom message stays up until it is turned off. Visitors can dismiss it.
export default function Advisory() {
  const { advisory } = useAdmin()
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem('ucc-undas') === '1' } catch { return false }
  })
  const custom = advisory.text.trim()
  if (!advisory.enabled || dismissed) return null
  if (!custom && Date.now() >= new Date(UNDAS.hideAfter).getTime()) return null

  const close = () => {
    setDismissed(true)
    try { sessionStorage.setItem('ucc-undas', '1') } catch { /* private mode */ }
  }

  return (
    <div role="status" className="relative bg-bone text-ink">
      <p className="mx-auto max-w-6xl px-12 py-2.5 text-center text-[0.7rem] md:text-xs font-medium tracking-wide leading-snug">
        {custom ? (
          custom
        ) : (
          <>
            <span className="font-semibold tracking-[0.18em] uppercase mr-2">Undas advisory</span>
            Closed November 1–2 for All Saints’ &amp; All Souls’ Day. Book your cut in advance. We’re open until then. 🕯️
          </>
        )}
      </p>
      <button onClick={close} aria-label="Dismiss advisory" className="absolute right-3 top-1/2 -translate-y-1/2 p-3.5 text-ink/60 hover:text-ink cursor-pointer">
        <X size={14} />
      </button>
    </div>
  )
}
