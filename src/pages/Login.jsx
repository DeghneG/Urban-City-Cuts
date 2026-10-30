import { useState } from 'react'
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react'
import { signIn, DEMO_USER, DEMO_PASS } from '../lib/auth'
import { navigate, skipNextIntro } from '../lib/nav'

// Demo sign-in. The demo credentials are pre-filled and the button has focus, so Enter (or one click) goes straight in.
export default function Login() {
  const [user, setUser] = useState(DEMO_USER)
  const [pass, setPass] = useState(DEMO_PASS)
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (busy) return
    if (!signIn(user, pass)) {
      setError('That username or password is not right. The demo login is shown below.')
      return
    }
    setError('')
    setBusy(true)
    navigate('/admin')
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink">
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-ink-2 border-r border-line overflow-hidden grain">
        <img src="/img/main-1200.webp" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/60" />
        <img src="/img/logo-full.png" alt="Urban City Cuts Barbershop" className="relative w-56" />
        <p className="relative font-serif italic text-3xl text-chrome-light leading-snug max-w-sm">Prices, photos and announcements, in one place.</p>
      </div>

      <main className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <a href="/" onClick={skipNextIntro} className="inline-flex items-center gap-2 text-sm text-chrome hover:text-white mb-10"><ArrowLeft size={13} /> Back to the website</a>
          <img src="/img/logo-mark.png" alt="" className="h-10 w-auto lg:hidden mb-6" />
          <h1 className="display text-3xl">Owner sign in</h1>
          <p className="mt-3 text-sm text-muted leading-relaxed">Sign in to edit what shows on the website.</p>

          <form onSubmit={submit} className="mt-10 space-y-6" noValidate>
            <label className="block">
              <span className="text-xs text-muted">Username</span>
              <input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoComplete="username"
                className="mt-2 w-full bg-transparent border-b border-line focus:border-bone outline-none py-3 text-bone"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Password</span>
              <span className="mt-2 flex items-center border-b border-line focus-within:border-bone">
                <input
                  type={show ? 'text' : 'password'}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  autoComplete="current-password"
                  className="flex-1 bg-transparent outline-none py-3 text-bone"
                />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="p-2 text-muted hover:text-bone cursor-pointer">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>

            {error && <p role="alert" className="text-sm text-bone border border-chrome-dark px-4 py-3 leading-relaxed">{error}</p>}

            <button type="submit" autoFocus disabled={busy} className="btn btn-chrome w-full cursor-pointer disabled:opacity-60">
              <LogIn size={15} /> {busy ? 'Opening dashboard…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-10 border border-line p-5 text-sm">
            <p className="font-medium">Demo login</p>
            <p className="mt-2 text-muted leading-relaxed">Username <span className="text-bone">{DEMO_USER}</span>, password <span className="text-bone">{DEMO_PASS}</span>. Already filled in for you.</p>
            <p className="mt-3 text-xs text-muted leading-relaxed">This is a preview login and does not protect anything yet. Real sign-in comes before the dashboard goes live.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
