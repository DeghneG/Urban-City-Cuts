// Demo-grade content store shared by the public site and /admin.
// Edits live in this browser's localStorage and are broadcast through the `storage` event, so a site tab
// or the phone preview updates the moment the dashboard changes something. There is no server: before
// real launch this needs a backend and a login.
import { useSyncExternalStore } from 'react'
import { CATEGORIES, CAFE } from './menuData'

const KEY = 'ucc-admin-v1'

export const SAMPLE_INQUIRIES = [
  { id: 'i1', kind: 'Franchise', name: 'Marco D.', city: 'Bacolod City', phone: '0917 555 0101', note: 'Looking at a unit near a mall. What does the franchise package include?', when: 'Today, 9:12 AM', status: 'new' },
  { id: 'i2', kind: 'Franchise', name: 'Aileen R.', city: 'Roxas City', phone: '0918 555 0102', note: 'Do you have an existing franchise I can visit first?', when: 'Yesterday, 4:40 PM', status: 'contacted' },
  { id: 'i3', kind: 'Hiring', name: 'Jerome L.', city: 'Pavia', phone: '0919 555 0103', note: 'Barber with 4 years of experience in fades and hair art. Can I send my portfolio?', when: 'Yesterday, 11:05 AM', status: 'new' },
  { id: 'i4', kind: 'Message', name: 'Kim S.', city: 'Jaro', phone: '0920 555 0104', note: 'Do you do kids haircuts on weekends?', when: 'Mon, 2:30 PM', status: 'done' },
]

const DEFAULTS = {
  advisory: { enabled: true, text: '' }, // empty text = the built-in Undas notice, which hides itself after Nov 2
  hiring: { enabled: true, city: 'Pavia' },
  prices: {},
  hiddenPhotos: [],
  inquiries: SAMPLE_INQUIRIES,
  questions: [],
}

// ---- price fields: every editable number on the site, with the default it can be reset to ----------------
export const PRICE_FIELDS = []
for (const c of CATEGORIES) {
  for (const it of c.items) PRICE_FIELDS.push({ key: `svc:${it.id}`, label: it.name, group: c.label, def: it.price, set: (v) => { it.price = v } })
}
for (const [group, rows] of [['Espresso', CAFE.espresso], ['Café refreshments', CAFE.refreshments]]) {
  for (const it of rows) {
    if (it.hot != null) PRICE_FIELDS.push({ key: `cafe:${it.name}:hot`, label: `${it.name} (hot)`, group, def: it.hot, set: (v) => { it.hot = v } })
    if (it.iced != null) PRICE_FIELDS.push({ key: `cafe:${it.name}:iced`, label: `${it.name} (iced)`, group, def: it.iced, set: (v) => { it.iced = v } })
  }
}
for (const [group, rows] of [['Soda', CAFE.soda], ['Beer', CAFE.beer], ['Café add-ons', CAFE.addons]]) {
  for (const it of rows) PRICE_FIELDS.push({ key: `cafe:${it.name}:price`, label: it.name, group, def: it.price, set: (v) => { it.price = v } })
}

// The site's data modules are plain objects, so prices are applied by writing into them in place.
function applyPrices(prices) {
  for (const f of PRICE_FIELDS) f.set(prices[f.key] ?? f.def)
}

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { ...DEFAULTS }
  }
}

let state = load()
applyPrices(state.prices)

const listeners = new Set()
const emit = () => listeners.forEach((l) => l())
const persist = () => {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* private mode: edits last until reload */ }
}

export function update(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  applyPrices(state.prices)
  persist()
  emit()
}

export function resetDemo() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  state = { ...DEFAULTS }
  applyPrices(state.prices)
  emit()
}

export function logQuestion(q, ok) {
  update((s) => ({ questions: [{ q, ok, t: Date.now() }, ...s.questions].slice(0, 40) }))
}

// Another tab (the dashboard, or the site inside the preview frame) changed something
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    state = load()
    applyPrices(state.prices)
    emit()
  })
}

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export const getState = () => state
export const useAdmin = () => useSyncExternalStore(subscribe, getState)
