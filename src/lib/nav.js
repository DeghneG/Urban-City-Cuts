import { useSyncExternalStore } from 'react'

// Minimal client routing for the demo paths (/, /login, /admin, /preview). No router dependency needed.
const subscribe = (cb) => {
  window.addEventListener('popstate', cb)
  window.addEventListener('ucc-nav', cb)
  return () => {
    window.removeEventListener('popstate', cb)
    window.removeEventListener('ucc-nav', cb)
  }
}
const getPath = () => window.location.pathname.replace(/\/+$/, '') || '/'

export const usePath = () => useSyncExternalStore(subscribe, getPath)

export function navigate(to, { replace = false } = {}) {
  window.history[replace ? 'replaceState' : 'pushState'](null, '', to)
  window.dispatchEvent(new Event('ucc-nav'))
  window.scrollTo(0, 0)
}

// Coming back to the site from /admin or /preview should not replay the 4-second intro
export const skipNextIntro = () => {
  try { sessionStorage.setItem('ucc-skip-intro', '1') } catch { /* private mode */ }
}
