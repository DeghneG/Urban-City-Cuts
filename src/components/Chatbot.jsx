import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, Instagram, LayoutDashboard, Smartphone, Play } from 'lucide-react'
import { answer, GREETING } from '../lib/chatEngine'
import { INSTAGRAM_URL, FACEBOOK_URL, DEMO_MODE, openBooking } from '../lib/site'
import { logQuestion } from '../lib/adminStore'

// Demo shortcuts sit beside the launcher. They are hidden inside the phone preview (an iframe of this same page).
const EMBEDDED = typeof window !== 'undefined' && window.self !== window.top
const demoBtn =
  'h-14 w-12 md:w-auto md:px-5 flex items-center justify-center gap-2.5 bg-ink-3 border border-line text-bone shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:bg-bone hover:text-ink hover:border-bone transition-colors cursor-pointer text-[0.7rem] font-semibold tracking-[0.2em] uppercase'

// Rule-based inquiry assistant. All answers come from the site's own data; nothing leaves the browser.
export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([{ from: 'bot', ...GREETING }])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const log = useRef(null)
  const input = useRef(null)

  useEffect(() => {
    if (open) input.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // The site tour opens and closes the chat to show it off
  useEffect(() => {
    const onChat = (e) => setOpen(Boolean(e.detail))
    window.addEventListener('ucc-chat', onChat)
    return () => window.removeEventListener('ucc-chat', onChat)
  }, [])

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, typing, open])

  const send = (raw) => {
    const q = raw.trim()
    if (!q || typing) return
    setMsgs((m) => [...m, { from: 'user', text: q }])
    setText('')
    setTyping(true)
    // Short pause so the reply feels like a conversation, not a page swap
    setTimeout(() => {
      const r = answer(q)
      logQuestion(q, !r.fallback)
      setMsgs((m) => [...m, { from: 'bot', ...r }])
      setTyping(false)
    }, 450)
  }

  const last = msgs[msgs.length - 1]

  return (
    <>
      {/* Social links ride above the launcher; they step aside while the chat is open */}
      {!open && (
        <nav aria-label="Social media" className="fab fixed z-[60] right-4 bottom-20 md:right-6 md:bottom-[6.5rem] flex flex-col gap-2">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram @urbancitycuts"
            title="Instagram @urbancitycuts"
            className="w-12 h-12 grid place-items-center text-white shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-110"
            style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)' }}
          >
            <Instagram size={22} strokeWidth={1.9} />
          </a>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook, Urban City Cuts"
            title="Facebook, Urban City Cuts"
            className="w-12 h-12 grid place-items-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-110"
            style={{ background: '#1877f2' }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff" aria-hidden="true">
              <path d="M16.6 13.1l.55-3.6h-3.45V7.17c0-.98.48-1.94 2.03-1.94h1.57V2.17S15.87 1.93 14.5 1.93c-2.85 0-4.7 1.72-4.7 4.84V9.5H6.64v3.6H9.8V22h3.9v-8.9h2.9z" />
            </svg>
          </a>
        </nav>
      )}

      <div className="fab fixed z-[60] right-4 bottom-4 md:right-6 md:bottom-6 flex items-center gap-2">
        {DEMO_MODE && !EMBEDDED && !open && (
          <>
            <button onClick={() => window.dispatchEvent(new Event('ucc-tour-start'))} aria-label="Replay the site tour" title="Replay the site tour" className={demoBtn}>
              <Play size={16} /><span className="hidden md:inline">Tour</span>
            </button>
            <a href="/login" aria-label="Owner dashboard (admin)" title="Owner dashboard (admin)" className={demoBtn}>
              <LayoutDashboard size={16} /><span className="hidden md:inline">Admin</span>
            </a>
            <a href="/preview" aria-label="Mobile preview" title="Mobile preview" className={demoBtn}>
              <Smartphone size={16} /><span className="hidden md:inline">Mobile</span>
            </a>
          </>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="ucc-chat"
          className="h-14 pl-5 pr-6 flex items-center gap-3 bg-bone text-ink shadow-[0_10px_40px_rgba(0,0,0,0.5)] cursor-pointer hover:bg-white transition-colors"
        >
          {open ? <X size={18} /> : <MessageCircle size={18} />}
          <span className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase">{open ? 'Close' : 'Ask us'}</span>
        </button>
      </div>

      {open && (
        <section
          id="ucc-chat"
          role="dialog"
          aria-label="Urban City Cuts assistant"
          className="fixed z-[60] right-3 left-3 sm:left-auto sm:w-[390px] bottom-[5.25rem] md:right-6 md:bottom-24 h-[min(72svh,560px)] flex flex-col bg-ink-2 border border-line shadow-[0_20px_80px_rgba(0,0,0,0.7)] animate-fadeUp [animation-delay:0s] [animation-duration:0.4s]"
        >
          <header className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
            <img src="/img/logo-mark.png" alt="" className="h-8 w-auto" />
            <div className="flex-1">
              <p className="text-sm font-medium leading-tight">Urban City Cuts</p>
              <p className="text-xs text-muted">Hours, prices, bookings and more</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-2 text-chrome hover:text-white cursor-pointer"><X size={16} /></button>
          </header>

          <div ref={log} data-lenis-prevent role="log" aria-live="polite" className="flex-1 overflow-y-auto px-4 py-5 space-y-4 text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === 'user' ? 'flex justify-end' : ''}>
                <div className={`max-w-[88%] px-3.5 py-2.5 leading-relaxed whitespace-pre-line ${m.from === 'user' ? 'bg-bone text-ink' : 'bg-ink-3 text-bone'}`}>
                  {m.text}
                  {m.links?.length > 0 && (
                    <span className="mt-3 flex flex-wrap gap-2">
                      {m.links.map((l) => l.action === 'book' ? (
                        <button key={l.label} onClick={() => { setOpen(false); openBooking() }} className="inline-flex px-3 py-1.5 bg-bone text-ink text-[0.7rem] font-semibold cursor-pointer hover:bg-white transition-colors">{l.label}</button>
                      ) : (
                        <a
                          key={l.label}
                          href={l.href}
                          {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : { onClick: () => setOpen(false) })}
                          className="inline-flex px-3 py-1.5 border border-chrome-dark text-[0.7rem] text-chrome-light hover:border-bone hover:text-white transition-colors"
                        >
                          {l.label}
                        </a>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="bg-ink-3 w-fit px-4 py-3 flex gap-1" aria-label="Typing">
                {[0, 1, 2].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full bg-chrome animate-pulse" style={{ animationDelay: `${d * 160}ms` }} />)}
              </div>
            )}
            {!typing && last.from === 'bot' && last.chips?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {last.chips.map((c) => (
                  <button key={c} onClick={() => send(c)} className="px-3 py-1.5 border border-line text-xs text-chrome hover:border-bone hover:text-white transition-colors cursor-pointer">{c}</button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(text) }} className="flex border-t border-line">
            <label htmlFor="ucc-chat-input" className="sr-only">Your question</label>
            <input
              id="ucc-chat-input"
              ref={input}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask about hours, prices, booking…"
              autoComplete="off"
              className="flex-1 bg-transparent px-4 py-4 text-sm outline-none placeholder:text-chrome-dark/70"
            />
            <button type="submit" aria-label="Send" className="px-5 text-chrome hover:text-white cursor-pointer disabled:opacity-40" disabled={!text.trim() || typing}><Send size={16} /></button>
          </form>
        </section>
      )}
    </>
  )
}
