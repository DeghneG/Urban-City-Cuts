import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { answer, GREETING } from '../lib/chatEngine'

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
      setMsgs((m) => [...m, { from: 'bot', ...answer(q) }])
      setTyping(false)
    }, 450)
  }

  const last = msgs[msgs.length - 1]

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="ucc-chat"
        className="fixed z-[60] right-4 bottom-4 md:right-6 md:bottom-6 h-14 pl-5 pr-6 flex items-center gap-3 bg-bone text-ink shadow-[0_10px_40px_rgba(0,0,0,0.5)] cursor-pointer hover:bg-white transition-colors"
      >
        {open ? <X size={18} /> : <MessageCircle size={18} />}
        <span className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase">{open ? 'Close' : 'Ask us'}</span>
      </button>

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
                      {m.links.map((l) => (
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
