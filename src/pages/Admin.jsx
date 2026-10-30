import { useMemo, useState } from 'react'
import { ExternalLink, Smartphone, RotateCcw, Check, LogOut } from 'lucide-react'
import { signOut } from '../lib/auth'
import { navigate } from '../lib/nav'
import PhoneFrame from '../components/PhoneFrame'
import { useAdmin, update, resetDemo, PRICE_FIELDS } from '../lib/adminStore'
import { BRANCHES, branchStatus, UNDAS } from '../lib/site'
import { GALLERY, peso } from '../lib/menuData'

const TABS = [
  ['overview', 'Overview'],
  ['announce', 'Announcements'],
  ['prices', 'Prices'],
  ['gallery', 'Gallery'],
  ['inbox', 'Inbox'],
]

function Card({ title, hint, children }) {
  return (
    <section className="border border-line bg-ink-2 p-6 md:p-8">
      <h2 className="display text-xl">{title}</h2>
      {hint && <p className="mt-2 text-sm text-muted max-w-xl leading-relaxed">{hint}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Toggle({ on, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex items-center gap-3 cursor-pointer text-sm"
    >
      <span className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-bone' : 'bg-line'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${on ? 'left-[22px] bg-ink' : 'left-0.5 bg-chrome-dark'}`} />
      </span>
      {label}
    </button>
  )
}

function Stat({ label, value, note }) {
  return (
    <div className="border border-line bg-ink-2 p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="display text-3xl mt-3">{value}</p>
      {note && <p className="text-xs text-muted mt-2">{note}</p>}
    </div>
  )
}

function Overview({ s }) {
  const open = BRANCHES.filter((b) => branchStatus(b).open).length
  const edits = Object.keys(s.prices).length
  const unanswered = s.questions.filter((q) => !q.ok).length
  const fresh = s.inquiries.filter((i) => i.status === 'new').length
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat label="Branches open now" value={`${open} of ${BRANCHES.length}`} note="Live, from each branch's hours" />
        <Stat label="New inquiries" value={fresh} note="Sample data in this demo" />
        <Stat label="Price changes" value={edits} note={edits ? 'Live on the site now' : 'Using the printed menu'} />
        <Stat label="Chatbot questions" value={s.questions.length} note={`${unanswered} it could not answer`} />
      </div>
      <Card title="Branch status" hint="What a visitor sees in the hero right now.">
        <ul className="divide-y divide-line">
          {BRANCHES.map((b) => {
            const st = branchStatus(b)
            return (
              <li key={b.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                <span className="font-medium">{b.name}</span>
                <span className="flex items-center gap-2 text-chrome">
                  <span className={`w-2 h-2 rounded-full ${st.open ? 'bg-bone' : 'border border-chrome-dark'}`} />
                  {st.text}
                </span>
              </li>
            )
          })}
        </ul>
      </Card>
      <Card title="Try it" hint="Everything you change here shows on the site straight away, including in the phone preview on the right. Edit a price, switch off the hiring notice, or hide a photo.">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => update({ hiring: { ...s.hiring, enabled: !s.hiring.enabled } })} className="btn btn-ghost cursor-pointer">{s.hiring.enabled ? 'Hide' : 'Show'} the hiring notice</button>
          <button onClick={() => update({ advisory: { ...s.advisory, enabled: !s.advisory.enabled } })} className="btn btn-ghost cursor-pointer">{s.advisory.enabled ? 'Hide' : 'Show'} the top advisory</button>
        </div>
      </Card>
    </div>
  )
}

function Announcements({ s }) {
  const defaultText = `Closed November ${UNDAS.closedFrom.slice(-2).replace(/^0/, '')}–${UNDAS.closedTo.slice(-2).replace(/^0/, '')} for All Saints’ & All Souls’ Day. Book your cut in advance. We’re open until then.`
  return (
    <div className="space-y-6">
      <Card title="Top advisory bar" hint="The white strip above the menu. Leave the message empty to use the built-in Undas notice, which switches itself off after November 2. A custom message stays up until you turn it off.">
        <div className="space-y-5">
          <Toggle on={s.advisory.enabled} onChange={(v) => update({ advisory: { ...s.advisory, enabled: v } })} label={s.advisory.enabled ? 'Showing on the site' : 'Hidden'} />
          <label className="block">
            <span className="text-xs text-muted">Message</span>
            <textarea
              rows={3}
              value={s.advisory.text}
              onChange={(e) => update({ advisory: { ...s.advisory, text: e.target.value } })}
              placeholder={defaultText}
              className="mt-2 w-full bg-ink border border-line focus:border-chrome outline-none p-3 text-sm leading-relaxed placeholder:text-chrome-dark/60"
            />
          </label>
        </div>
      </Card>
      <Card title="Hiring notice" hint="The “Now hiring” box near the bottom of the page.">
        <div className="space-y-5">
          <Toggle on={s.hiring.enabled} onChange={(v) => update({ hiring: { ...s.hiring, enabled: v } })} label={s.hiring.enabled ? 'Showing on the site' : 'Hidden'} />
          <label className="block max-w-xs">
            <span className="text-xs text-muted">Where are you hiring?</span>
            <input value={s.hiring.city} onChange={(e) => update({ hiring: { ...s.hiring, city: e.target.value } })} className="mt-2 w-full bg-ink border border-line focus:border-chrome outline-none p-3 text-sm" />
          </label>
        </div>
      </Card>
    </div>
  )
}

function Prices({ s }) {
  const groups = useMemo(() => {
    const m = new Map()
    for (const f of PRICE_FIELDS) m.set(f.group, [...(m.get(f.group) || []), f])
    return [...m]
  }, [])
  const set = (f, raw) => {
    const n = Number(raw)
    update((st) => {
      const prices = { ...st.prices }
      if (raw === '' || Number.isNaN(n) || n === f.def) delete prices[f.key]
      else prices[f.key] = Math.max(0, Math.round(n))
      return { prices }
    })
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted max-w-lg leading-relaxed">Change a price and it updates the price board, the café menu and what the chatbot quotes. Edited prices are highlighted.</p>
        <button onClick={() => update({ prices: {} })} disabled={!Object.keys(s.prices).length} className="btn btn-ghost cursor-pointer disabled:opacity-40"><RotateCcw size={14} /> Reset all</button>
      </div>
      {groups.map(([group, fields]) => (
        <Card key={group} title={group}>
          <ul className="divide-y divide-line">
            {fields.map((f) => {
              const edited = s.prices[f.key] != null
              return (
                <li key={f.key} className="py-3 flex items-center justify-between gap-4">
                  <label htmlFor={f.key} className={`text-sm ${edited ? 'text-white' : 'text-chrome'}`}>{f.label}</label>
                  <span className="flex items-center gap-3">
                    {edited && <span className="text-xs text-muted line-through">{peso(f.def)}</span>}
                    <span className={`flex items-center border px-3 py-2 w-28 ${edited ? 'border-bone' : 'border-line'}`}>
                      <span className="text-muted mr-1">₱</span>
                      <input id={f.key} type="number" min="0" inputMode="numeric" value={s.prices[f.key] ?? f.def} onChange={(e) => set(f, e.target.value)} className="w-full bg-transparent outline-none text-sm tabular-nums" />
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>
      ))}
    </div>
  )
}

function Gallery({ s }) {
  const toggle = (id) => update((st) => ({ hiddenPhotos: st.hiddenPhotos.includes(id) ? st.hiddenPhotos.filter((x) => x !== id) : [...st.hiddenPhotos, id] }))
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted max-w-lg leading-relaxed">Tap a photo to hide it from the website gallery, and tap again to bring it back. {GALLERY.length - s.hiddenPhotos.length} of {GALLERY.length} showing.</p>
      <ul className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-3">
        {GALLERY.map((g) => {
          const hidden = s.hiddenPhotos.includes(g.id)
          return (
            <li key={g.id}>
              <button onClick={() => toggle(g.id)} aria-pressed={!hidden} aria-label={`${g.alt}: ${hidden ? 'hidden' : 'showing'}`} className="relative block w-full aspect-[3/4] overflow-hidden border border-line cursor-pointer group">
                <img src={`/img/${g.id}-480.webp`} alt="" className={`w-full h-full object-cover transition ${hidden ? 'opacity-25 grayscale' : ''}`} loading="lazy" />
                <span className={`absolute top-2 right-2 w-6 h-6 grid place-items-center text-xs ${hidden ? 'bg-ink text-muted border border-line' : 'bg-bone text-ink'}`}>{hidden ? '' : <Check size={13} strokeWidth={3} />}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const STATUS = { new: 'New', contacted: 'Contacted', done: 'Done' }

function Inbox({ s }) {
  const setStatus = (id, status) => update((st) => ({ inquiries: st.inquiries.map((i) => (i.id === id ? { ...i, status } : i)) }))
  return (
    <div className="space-y-6">
      <Card title="Inquiries" hint="Sample messages for the demo. Once the franchise form is connected, real inquiries land here.">
        <ul className="divide-y divide-line">
          {s.inquiries.map((i) => (
            <li key={i.id} className="py-5 grid sm:grid-cols-[1fr_auto] gap-4">
              <div>
                <p className="text-sm"><span className="font-medium">{i.name}</span> <span className="text-muted">· {i.kind} · {i.city}</span></p>
                <p className="mt-2 text-sm text-chrome leading-relaxed max-w-prose">{i.note}</p>
                <p className="mt-2 text-xs text-muted">{i.phone} · {i.when}</p>
              </div>
              <select value={i.status} onChange={(e) => setStatus(i.id, e.target.value)} aria-label={`Status for ${i.name}`} className="self-start bg-ink border border-line px-3 py-2 text-sm outline-none focus:border-chrome">
                {Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Chatbot questions" hint="Real questions typed into the site's chatbot in this browser. Questions it could not answer show first, so you know what to add.">
        {s.questions.length === 0 ? (
          <p className="text-sm text-muted">Nothing yet. Open the site, ask the chatbot something, and it appears here.</p>
        ) : (
          <ul className="divide-y divide-line">
            {[...s.questions].sort((a, b) => Number(a.ok) - Number(b.ok)).map((q, n) => (
              <li key={n} className="py-3 flex items-center justify-between gap-4 text-sm">
                <span className="text-chrome">“{q.q}”</span>
                <span className={`shrink-0 text-xs px-2 py-1 border ${q.ok ? 'border-line text-muted' : 'border-bone text-bone'}`}>{q.ok ? 'Answered' : 'Needs an answer'}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default function Admin() {
  const s = useAdmin()
  const [tab, setTab] = useState('overview')
  const [reload, setReload] = useState(0)

  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/img/logo-mark.png" alt="" className="h-8 w-auto" />
            <span className="display text-sm tracking-[0.1em]">Dashboard</span>
            <span className="hidden sm:inline text-[0.65rem] px-2 py-1 border border-chrome-dark text-chrome">Demo</span>
          </div>
          <nav className="flex items-center gap-2 text-sm" aria-label="Demo links">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost !py-2.5 !px-4"><ExternalLink size={14} /> View site</a>
            <a href="/preview" target="_blank" rel="noopener noreferrer" className="btn btn-ghost !py-2.5 !px-4 hidden sm:inline-flex"><Smartphone size={14} /> Phone preview</a>
            <button onClick={() => { signOut(); navigate('/login') }} className="btn btn-ghost !py-2.5 !px-4 cursor-pointer"><LogOut size={14} /> Sign out</button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-5 py-8 grid xl:grid-cols-[minmax(0,1fr)_420px] gap-10">
        <main>
          <div role="tablist" aria-label="Dashboard sections" className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {TABS.map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`shrink-0 px-4 py-2.5 text-sm border cursor-pointer transition-colors ${tab === id ? 'bg-bone text-ink border-bone' : 'border-line text-chrome hover:border-chrome'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="mt-8" role="tabpanel">
            {tab === 'overview' && <Overview s={s} />}
            {tab === 'announce' && <Announcements s={s} />}
            {tab === 'prices' && <Prices s={s} />}
            {tab === 'gallery' && <Gallery s={s} />}
            {tab === 'inbox' && <Inbox s={s} />}
          </div>
          <div className="mt-12 pt-6 border-t border-line text-xs text-muted flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-lg leading-relaxed">Demo mode: changes are saved in this browser only and there is no login. Going live needs a real backend and sign-in.</p>
            <button onClick={() => { if (window.confirm('Reset every demo edit and the sample inbox?')) resetDemo() }} className="inline-flex items-center gap-2 cursor-pointer hover:text-bone"><RotateCcw size={13} /> Reset demo</button>
          </div>
        </main>

        <aside className="hidden xl:block" aria-label="Live phone preview">
          <div className="sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-chrome">Live phone preview</p>
              <button onClick={() => setReload((n) => n + 1)} className="text-xs text-muted hover:text-bone inline-flex items-center gap-1.5 cursor-pointer"><RotateCcw size={12} /> Replay intro</button>
            </div>
            <PhoneFrame src="/" reloadKey={reload} maxScale={0.9} fitOffset={150} />
          </div>
        </aside>
      </div>
    </div>
  )
}
