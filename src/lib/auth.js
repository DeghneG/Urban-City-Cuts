// DEMO LOGIN ONLY. The credentials below ship in the page's JavaScript, so anyone can read them and this
// protects nothing. It exists so the owners can see the dashboard flow. Before going live, replace it with a
// real sign-in (server-side sessions or a hosted auth provider) and remove these constants.
export const DEMO_USER = 'admin'
export const DEMO_PASS = 'admin123'

const KEY = 'ucc-admin-session'

export function isAuthed() {
  try { return sessionStorage.getItem(KEY) === '1' } catch { return false }
}

export function signIn(user, pass) {
  const ok = user.trim().toLowerCase() === DEMO_USER && pass === DEMO_PASS
  if (ok) {
    try { sessionStorage.setItem(KEY, '1') } catch { /* private mode: works until reload */ }
  }
  return ok
}

export function signOut() {
  try { sessionStorage.removeItem(KEY) } catch { /* ignore */ }
}
