import { useEffect, useMemo, useRef, useState } from 'react'
import { X, ArrowLeft, ArrowRight, Check, Phone, MessageCircle, Copy, Coffee } from 'lucide-react'
import {
  BRANCHES, branchStatus, UNDAS, manilaParts, fmtSlot, BOOKING_URL, MESSENGER_URL, DEMO_MODE,
  telHref, formatPhone, CANCELLATION,
} from '../lib/site'
import { CATEGORIES, peso } from '../lib/menuData'
import { update } from '../lib/adminStore'
import { setScrollLocked } from '../lib/smoothScroll'

const STEPS = ['Branch', 'Service', 'Time', 'Details', 'Review']
const BASES = CATEGORIES.filter((c) => c.base)
const ADDONS = CATEGORIES.find((c) => c.id === 'addons')
const findItem = (id) => CATEGORIES.flatMap((c) => c.items).find((i) => i.id === id)

// The next two weeks in Manila time, with closure days (Undas) marked
function buildDays() {
  const fmt = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', weekday: 'short', day: 'numeric', month: 'short' })
  return Array.from({ length: 14 }, (_, n) => {
    const d = new Date(Date.now() + n * 864e5)
    const p = manilaParts(d)
    return { date: p.date, weekday: p.weekday, label: fmt.format(d), today: n === 0, closed: p.date >= UNDAS.closedFrom && p.date <= UNDAS.closedTo }
  })
}

// Half-hour starts between opening and the last half hour before closing; today's past slots are dropped
function slotsFor(branch, day) {
  if (!branch || !day) return []
  const [from, to] = ['Sat', 'Sun'].includes(day.weekday) ? branch.schedule.weekend : branch.schedule.weekday
  const out = []
  const earliest = day.today ? manilaParts().mins + 30 : 0
  for (let m = from; m <= to - 30; m += 30) if (m >= earliest) out.push(m)
  return out
}

const validPhone = (v) => /^(09\d{9}|\+?639\d{9})$/.test(v.replace(/[\s-]/g, ''))

export default function Booking() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [branchId, setBranchId] = useState(null)
  const [baseId, setBaseId] = useState(null)
  const [extras, setExtras] = useState([])
  const [date, setDate] = useState(null)
  const [time, setTime] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [tried, setTried] = useState(false)
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const heading = useRef(null)
  const days = useMemo(() => (open ? buildDays() : []), [open])

  const branch = BRANCHES.find((b) => b.id === branchId)
  const base = baseId && findItem(baseId)
  const day = days.find((d) => d.date === date)
  const slots = useMemo(() => slotsFor(branch, day), [branch, day])
  const total = (base?.price || 0) + extras.reduce((s, id) => s + findItem(id).price, 0)
  const hasFrom = base?.from

  // Any Book button anywhere on the site opens this. It can arrive with a branch or services already chosen.
  useEffect(() => {
    const onBook = (e) => {
      const d = e.detail || {}
      const ids = d.services || []
      const pickedBase = ids.find((id) => BASES.some((c) => c.items.some((i) => i.id === id))) || null
      setBranchId(d.branch || null)
      setBaseId(pickedBase)
      setExtras(ids.filter((id) => ADDONS.items.some((i) => i.id === id)))
      setDate(null); setTime(null); setTried(false); setSent(false); setCopied(false)
      try { setName((n) => n || localStorage.getItem('ucc-viewer') || '') } catch { /* ignore */ }
      setStep(d.branch ? 1 : 0)
      setOpen(true)
    }
    window.addEventListener('ucc-book', onBook)
    return () => window.removeEventListener('ucc-book', onBook)
  }, [])

  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    setScrollLocked(true)
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); setScrollLocked(false) }
  }, [open])

  // Move focus to the step heading so screen readers and keyboards follow the flow
  useEffect(() => { if (open) heading.current?.focus() }, [open, step, sent])

  // A time chosen for another day or branch may not exist any more
  useEffect(() => { if (time != null && !slots.includes(time)) setTime(null) }, [slots, time])

  const dateLabel = day?.label || ''
  const serviceNames = [base?.name, ...extras.map((id) => findItem(id).name)].filter(Boolean)
  const summary = [
    'Urban City Cuts booking request',
    `Branch: ${branch?.name}`,
    `Service: ${serviceNames.join(', ')}`,
    `When: ${dateLabel}, ${time != null ? fmtSlot(time) : ''}`,
    `Name: ${name.trim()}`,
    `Mobile: ${phone.trim()}`,
    note.trim() && `Note: ${note.trim()}`,
    `Estimate: ${hasFrom ? 'from ' : ''}${peso(total)}`,
  ].filter(Boolean).join('\n')

  const canNext = [!!branch, !!base, date && time != null, true, true][step]
  const detailsOk = name.trim().length > 1 && validPhone(phone)

  const next = () => {
    if (step === 3) {
      setTried(true)
      if (!detailsOk) return
    }
    if (canNext) setStep((s) => Math.min(STEPS.length - 1, s + 1))
  }

  const send = () => {
    update((s) => ({
      inquiries: [{ id: `b${Date.now()}`, kind: 'Booking', name: name.trim(), city: branch.name, phone: phone.trim(), note: `${serviceNames.join(', ')} on ${dateLabel} at ${fmtSlot(time)}.${note.trim() ? ' ' + note.trim() : ''}`, when: 'Just now', status: 'new' }, ...s.inquiries],
    }))
    if (BOOKING_URL) window.open(BOOKING_URL, '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 2200) } catch { /* clipboard blocked */ }
  }

  if (!open) return null

  const toggleExtra = (id) => setExtras((x) => (x.includes(id) ? x.filter((v) => v !== id) : [...x, id]))

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-ink/80 sm:p-6" role="dialog" aria-modal="true" aria-label="Book a visit">
      <div className="tour-card w-full sm:max-w-2xl max-h-[94svh] sm:max-h-[88vh] flex flex-col bg-ink-2 border border-line shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
        {/* Header: title, progress, close */}
        <div className="px-5 sm:px-8 pt-5 pb-4 border-b border-line">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted">{sent ? 'Request sent' : `Step ${step + 1} of ${STEPS.length}, ${STEPS[step]}`}</p>
            <button onClick={close} aria-label="Close booking" className="-m-2 p-3 text-chrome hover:text-white cursor-pointer"><X size={18} /></button>
          </div>
          {!sent && (
            <div className="mt-3 flex gap-1.5" aria-hidden="true">
              {STEPS.map((s, n) => <span key={s} className={`h-0.5 flex-1 transition-colors duration-500 ${n <= step ? 'bg-bone' : 'bg-line'}`} />)}
            </div>
          )}
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 overscroll-contain">
          {sent ? (
            <div>
              <span className="w-12 h-12 grid place-items-center bg-bone text-ink"><Check size={22} strokeWidth={2.5} /></span>
              <h2 ref={heading} tabIndex={-1} className="display text-2xl sm:text-3xl mt-6 outline-none">Thank you, {name.trim().split(' ')[0]}</h2>
              <p className="mt-4 text-chrome leading-relaxed">
                Your request for <strong className="text-bone font-medium">{branch.name}</strong> on <strong className="text-bone font-medium">{dateLabel} at {fmtSlot(time)}</strong> is in. {DEMO_MODE ? 'In this demo it is saved to the owner dashboard inbox.' : 'Please call the branch to confirm your time.'}
              </p>
              <p className="mt-3 text-sm text-muted leading-relaxed">{CANCELLATION}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={telHref(branch.phones[0])} className="btn btn-chrome"><Phone size={14} /> Call {branch.name}</a>
                <a href={MESSENGER_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><MessageCircle size={14} /> Message us</a>
                <button onClick={close} className="btn btn-ghost cursor-pointer">Done</button>
              </div>
            </div>
          ) : (
            <>
              <h2 ref={heading} tabIndex={-1} className="display text-2xl sm:text-3xl outline-none">
                {['Which branch?', 'What are you booking?', 'When suits you?', 'Who is it for?', 'Check and send'][step]}
              </h2>

              {step === 0 && (
                <ul className="mt-6 space-y-3" role="radiogroup" aria-label="Branch">
                  {BRANCHES.map((b) => {
                    const st = branchStatus(b)
                    return (
                      <li key={b.id}>
                        <button
                          role="radio"
                          aria-checked={branchId === b.id}
                          onClick={() => { setBranchId(b.id); setStep(1) }}
                          className={`w-full text-left p-5 border cursor-pointer transition-colors ${branchId === b.id ? 'border-bone bg-ink-3' : 'border-line hover:border-chrome-dark'}`}
                        >
                          <span className="flex items-start justify-between gap-4">
                            <span className="font-serif italic text-4xl leading-none text-chrome-light">{b.name}</span>
                            {b.cafe && <span className="inline-flex items-center gap-1.5 text-[0.62rem] tracking-[0.18em] uppercase border border-chrome-dark px-2.5 py-1 text-chrome"><Coffee size={11} /> Café</span>}
                          </span>
                          <span className="block mt-3 text-sm text-chrome leading-relaxed">{b.address}</span>
                          <span className="block text-sm text-muted">{b.landmark}</span>
                          <span className="mt-3 flex items-center gap-2 text-sm">
                            <span className={`w-2 h-2 rounded-full ${st.open ? 'bg-bone' : 'border border-chrome-dark'}`} />
                            <span className={st.open ? 'text-bone' : 'text-muted'}>{st.text}</span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}

              {step === 1 && (
                <div className="mt-6 space-y-8">
                  {BASES.map((c) => (
                    <fieldset key={c.id}>
                      <legend className="font-serif italic text-lg text-chrome-light">{c.label}</legend>
                      <ul className="mt-2" role="radiogroup" aria-label={c.label}>
                        {c.items.map((it) => (
                          <li key={it.id} className="border-b border-line">
                            <button role="radio" aria-checked={baseId === it.id} onClick={() => setBaseId(it.id)} className="w-full flex items-start gap-4 py-4 text-left cursor-pointer">
                              <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border grid place-items-center ${baseId === it.id ? 'bg-bone border-bone text-ink' : 'border-chrome-dark text-transparent'}`}><Check size={12} strokeWidth={3} /></span>
                              <span className="flex-1">
                                <span className="flex justify-between gap-4"><span className={baseId === it.id ? 'text-white' : 'text-bone'}>{it.name}</span><span className="whitespace-nowrap tabular-nums">{it.from ? 'from ' : ''}{peso(it.price)}</span></span>
                                {it.detail && <span className="block mt-1 text-sm text-muted leading-relaxed">{it.detail}</span>}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </fieldset>
                  ))}
                  <fieldset>
                    <legend className="font-serif italic text-lg text-chrome-light">Add-ons</legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ADDONS.items.map((it) => (
                        <button key={it.id} aria-pressed={extras.includes(it.id)} onClick={() => toggleExtra(it.id)} className={`px-4 py-3 text-sm border cursor-pointer transition-colors ${extras.includes(it.id) ? 'bg-bone text-ink border-bone' : 'border-line text-chrome hover:border-chrome'}`}>
                          {it.name} <span className="opacity-70 tabular-nums">{peso(it.price)}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {step === 2 && (
                <div className="mt-6">
                  <p className="text-sm text-muted">Pick a day, then a start time at {branch.name}. Times are Philippine time.</p>
                  <div role="radiogroup" aria-label="Day" className="mt-5 flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0 pb-1">
                    {days.map((d) => (
                      <button key={d.date} role="radio" aria-checked={date === d.date} disabled={d.closed} onClick={() => setDate(d.date)} className={`shrink-0 min-w-[5.4rem] px-4 py-3 text-sm border text-center transition-colors ${d.closed ? 'border-line text-chrome-dark/50 cursor-not-allowed' : date === d.date ? 'bg-bone text-ink border-bone cursor-pointer' : 'border-line text-chrome hover:border-chrome cursor-pointer'}`}>
                        <span className="block text-[0.65rem] tracking-[0.12em] uppercase opacity-70">{d.today ? 'Today' : d.weekday}</span>
                        <span className="block mt-0.5">{d.label.replace(/^\w+,?\s*/, '')}</span>
                        {d.closed && <span className="block text-[0.6rem] mt-0.5">Closed</span>}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6" aria-live="polite">
                    {!date ? <p className="text-sm text-muted">Choose a day to see the open times.</p>
                      : slots.length === 0 ? <p className="text-sm text-muted">No more times today. Try another day.</p>
                      : (
                        <div role="radiogroup" aria-label="Start time" className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {slots.map((m) => (
                            <button key={m} role="radio" aria-checked={time === m} onClick={() => setTime(m)} className={`py-3 text-sm border tabular-nums cursor-pointer transition-colors ${time === m ? 'bg-bone text-ink border-bone' : 'border-line text-chrome hover:border-chrome'}`}>{fmtSlot(m)}</button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <form onSubmit={(e) => { e.preventDefault(); next() }} className="mt-6 space-y-6" noValidate>
                  <label className="block">
                    <span className="text-xs text-muted">Your name</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="mt-2 w-full bg-transparent border-b border-line focus:border-bone outline-none py-3 text-base text-bone" />
                    {tried && name.trim().length < 2 && <span role="alert" className="block mt-2 text-sm text-bone">Please enter your name.</span>}
                  </label>
                  <label className="block">
                    <span className="text-xs text-muted">Mobile number</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="09XX XXX XXXX" className="mt-2 w-full bg-transparent border-b border-line focus:border-bone outline-none py-3 text-base text-bone placeholder:text-chrome-dark/60" />
                    {tried && !validPhone(phone) && <span role="alert" className="block mt-2 text-sm text-bone">Enter a Philippine mobile number, like 0917 123 4567.</span>}
                  </label>
                  <label className="block">
                    <span className="text-xs text-muted">Anything we should know? (optional)</span>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={200} className="mt-2 w-full bg-transparent border border-line focus:border-bone outline-none p-3 text-base text-bone leading-relaxed" />
                  </label>
                  <button type="submit" className="sr-only">Continue</button>
                </form>
              )}

              {step === 4 && (
                <div className="mt-6">
                  <dl className="divide-y divide-line border-y border-line text-sm">
                    {[
                      ['Branch', `${branch.name}, ${branch.landmark}`, 0],
                      ['Service', serviceNames.join(', '), 1],
                      ['When', `${dateLabel}, ${fmtSlot(time)}`, 2],
                      ['Name', name.trim(), 3],
                      ['Mobile', formatPhoneInput(phone), 3],
                    ].map(([k, v, to]) => (
                      <div key={k} className="py-3.5 flex items-start justify-between gap-4">
                        <dt className="text-muted w-20 shrink-0">{k}</dt>
                        <dd className="flex-1 text-bone">{v}</dd>
                        <button onClick={() => setStep(to)} className="text-xs text-chrome hover:text-white underline underline-offset-4 cursor-pointer">Edit</button>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-5 flex justify-between items-baseline">
                    <span className="text-sm text-muted">{hasFrom ? 'Estimated from' : 'Estimate'}</span>
                    <span className="display text-3xl tabular-nums">{peso(total)}</span>
                  </p>
                  <p className="mt-2 text-xs text-muted leading-relaxed">Final price depends on hair length and volume. {CANCELLATION}</p>
                  <button onClick={copy} className="mt-5 inline-flex items-center gap-2 text-sm text-chrome hover:text-white cursor-pointer"><Copy size={14} /> {copied ? 'Copied' : 'Copy these details'}</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer: running total, back, continue */}
        {!sent && (
          <div className="px-5 sm:px-8 py-4 border-t border-line flex items-center justify-between gap-3" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} aria-label="Previous step" className="h-12 px-4 inline-flex items-center gap-2 text-sm border border-line text-chrome hover:text-white hover:border-chrome disabled:opacity-0 disabled:pointer-events-none cursor-pointer"><ArrowLeft size={15} /> <span className="hidden sm:inline">Back</span></button>
            <p className="text-sm text-muted tabular-nums" aria-live="polite">{base ? <>{hasFrom ? 'from ' : ''}<span className="text-bone">{peso(total)}</span></> : ''}</p>
            {step < STEPS.length - 1 ? (
              <button onClick={next} disabled={!canNext} className="btn btn-chrome !py-3.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">Continue <ArrowRight size={14} /></button>
            ) : (
              <button onClick={send} className="btn btn-chrome !py-3.5 cursor-pointer">{BOOKING_URL ? 'Continue to booking' : 'Send request'}</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Show what the visitor typed in a tidy way: 0917 123 4567
function formatPhoneInput(v) {
  const d = v.replace(/[^\d]/g, '')
  return /^09\d{9}$/.test(d) ? formatPhone(d) : v.trim()
}
