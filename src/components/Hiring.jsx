import { MessageCircle } from 'lucide-react'
import { MESSENGER_URL } from '../lib/site'
import { useReveal } from '../hooks/useReveal'
import { useAdmin } from '../lib/adminStore'

export default function Hiring() {
  const ref = useReveal()
  const { hiring } = useAdmin()
  if (!hiring.enabled) return null
  return (
    <section id="hiring" className="py-16 md:py-20">
      <div ref={ref} className="reveal mx-auto max-w-6xl px-5">
        <div role="note" className="border border-bone/70 p-7 md:p-10 flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[0.66rem] font-semibold tracking-[0.3em] uppercase">
              <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-bone animate-ping" /><span className="relative w-2 h-2 rounded-full bg-bone" /></span>
              Now hiring
            </p>
            <h2 className="display mt-4 text-3xl md:text-5xl text-balance">Barbers wanted in {hiring.city}.</h2>
            <p className="mt-4 text-chrome leading-relaxed">
              Urban City Cuts is looking for barbers to join our growing team in {hiring.city}.
            </p>
          </div>
          <a href={MESSENGER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-chrome"><MessageCircle size={15} /> Apply on Messenger</a>
        </div>
      </div>
    </section>
  )
}
