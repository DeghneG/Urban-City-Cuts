import { useState } from 'react'
import { TrendingUp, Users, Scissors, Handshake, Phone, MessageCircle } from 'lucide-react'
import { FRANCHISE_FORM_URL, MESSENGER_URL, SHARED_PHONE, telHref, formatPhone } from '../lib/site'
import { useReveal } from '../hooks/useReveal'
import Photo from './Photo'

const PILLARS = [
  [TrendingUp, 'Proven business concept'],
  [Users, 'Continuous support'],
  [Scissors, 'Modern shop design'],
  [Handshake, 'A trusted barbershop brand'],
]

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-[0.62rem] tracking-[0.24em] uppercase text-muted">{label}</span>
      <input {...props} className="mt-2 w-full bg-transparent border-b border-line focus:border-gold outline-none py-2.5 text-bone placeholder:text-chrome-dark/60" />
    </label>
  )
}

function InquiryForm() {
  const [state, setState] = useState('idle') // idle | sending | sent | error
  const submit = async (e) => {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch(FRANCHISE_FORM_URL, { method: 'POST', body: new FormData(e.currentTarget), headers: { Accept: 'application/json' } })
      setState(res.ok ? 'sent' : 'error')
    } catch { setState('error') }
  }
  if (state === 'sent') return <p className="font-serif italic text-2xl text-gold">Thank you. We’ll be in touch soon.</p>
  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
      <Field label="Name" name="name" required autoComplete="name" />
      <Field label="Mobile number" name="phone" type="tel" required autoComplete="tel" />
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="City you have in mind" name="city" required />
      <div className="sm:col-span-2 flex items-center gap-4">
        <button disabled={state === 'sending'} className="btn btn-gold cursor-pointer disabled:opacity-60">{state === 'sending' ? 'Sending…' : 'Send inquiry'}</button>
        {state === 'error' && <span className="text-sm text-red-300" role="alert">Something went wrong. Please message us instead.</span>}
      </div>
    </form>
  )
}

export default function Franchise() {
  const a = useReveal()
  const b = useReveal(150)
  return (
    <section id="franchise" className="relative py-24 md:py-36 overflow-hidden grain">
      <Photo id="cut-06" alt="" sizes="100vw" className="absolute inset-0 w-full h-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />

      <div className="relative mx-auto max-w-6xl px-5">
        <div ref={a} className="reveal max-w-3xl">
          <p className="eyebrow !text-gold before:!bg-gold">Now open for franchising</p>
          <h2 className="display mt-6 text-5xl md:text-8xl">Franchise<br /><span className="font-serif italic normal-case font-normal text-gold">opportunity</span></h2>
          <p className="mt-8 text-lg text-chrome-light leading-relaxed max-w-xl">
            Bring the Urban City Cuts experience beyond Iloilo City. We’re looking for passionate entrepreneurs who want to build a profitable, established barbershop business in their area.
          </p>
          <p className="mt-8 inline-block bg-gold text-ink px-5 py-3 font-serif italic text-2xl md:text-3xl">No royalty fee!</p>
        </div>

        <ul ref={b} className="reveal mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
          {PILLARS.map(([Icon, label]) => (
            <li key={label} className="bg-ink/90 p-6 md:p-8 flex flex-col gap-5">
              <Icon size={26} strokeWidth={1.3} className="text-gold" />
              <span className="text-[0.7rem] font-medium tracking-[0.2em] uppercase leading-relaxed">{label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5">
            <p className="display text-2xl leading-tight">Your city could be our next destination.</p>
            <p className="mt-4 text-sm text-muted">Franchise opportunity: outside Iloilo City. Invest in a brand that cuts different.</p>
          </div>
          <div className="md:col-span-7">
            {FRANCHISE_FORM_URL ? (
              <InquiryForm />
            ) : (
              <div className="flex flex-wrap gap-3">
                <a href={MESSENGER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-gold"><MessageCircle size={15} /> Message us</a>
                <a href={telHref(SHARED_PHONE)} className="btn btn-ghost"><Phone size={15} /> {formatPhone(SHARED_PHONE)}</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
