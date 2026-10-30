import { useState } from 'react'
import { RotateCcw, Smartphone, Tablet, Laptop, ArrowLeft } from 'lucide-react'
import PhoneFrame from '../components/PhoneFrame'
import { skipNextIntro } from '../lib/nav'

const DEVICES = [
  { id: 'phone', label: 'Phone', note: '390 × 844', w: 390, h: 844, round: 44, icon: Smartphone },
  { id: 'small', label: 'Small phone', note: '360 × 740', w: 360, h: 740, round: 36, icon: Smartphone },
  { id: 'tablet', label: 'Tablet', note: '768 × 1024', w: 768, h: 1024, round: 28, icon: Tablet },
  { id: 'laptop', label: 'Laptop', note: '1280 × 800', w: 1280, h: 800, round: 14, icon: Laptop },
]

// Full-screen device preview for showing the site on a phone without a phone. The frame loads the real site,
// so scrolling, the menu, the chatbot and the map all behave as they will for a visitor.
export default function Preview() {
  const [id, setId] = useState('phone')
  const [reload, setReload] = useState(0)
  const d = DEVICES.find((x) => x.id === id)
  const narrow = d.w < 700

  return (
    <div className="min-h-screen bg-ink-2 flex flex-col">
      <header className="border-b border-line bg-ink">
        <div className="mx-auto max-w-6xl px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" onClick={skipNextIntro} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm border border-line text-chrome hover:text-white hover:border-chrome" aria-label="Back to the website"><ArrowLeft size={14} /> Back<span className="hidden sm:inline"> to website</span></a>
            <img src="/img/logo-mark.png" alt="" className="hidden sm:block h-8 w-auto" />
            <div>
              <p className="display text-sm tracking-[0.1em]">Urban City Cuts</p>
              <p className="text-xs text-muted">Device preview</p>
            </div>
          </div>
          <div role="radiogroup" aria-label="Device" className="flex flex-wrap gap-2">
            {DEVICES.map((x) => (
              <button key={x.id} role="radio" aria-checked={id === x.id} onClick={() => setId(x.id)} className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm border cursor-pointer transition-colors ${id === x.id ? 'bg-bone text-ink border-bone' : 'border-line text-chrome hover:border-chrome'}`}>
                <x.icon size={15} /> {x.label} <span className={id === x.id ? 'text-ink/60' : 'text-muted'}>{x.note}</span>
              </button>
            ))}
            <button onClick={() => setReload((n) => n + 1)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm border border-line text-chrome hover:border-chrome cursor-pointer"><RotateCcw size={14} /> Replay intro</button>
          </div>
        </div>
      </header>

      <main className="flex-1 grid place-items-center px-5 py-10">
        <div className="w-full" style={{ maxWidth: narrow ? 520 : 1100 }}>
          <PhoneFrame src="/" width={d.w} height={d.h} round={d.round} reloadKey={`${id}-${reload}`} fitOffset={230} />
        </div>
      </main>

      <footer className="px-5 pb-8 text-center text-xs text-muted leading-relaxed">
        This is the live website at {typeof window !== 'undefined' ? window.location.origin : ''}. To open it on a real phone, use the same address on the shop Wi-Fi.
      </footer>
    </div>
  )
}
