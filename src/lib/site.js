// Every outbound link and shop fact the site uses lives here, so a change is a one-line edit.

export const INSTAGRAM_URL = 'https://www.instagram.com/urbancitycuts'
export const FACEBOOK_URL = 'https://www.facebook.com/urbancitycuts'
export const MESSENGER_URL = 'https://m.me/urbancitycuts'

// TODO: paste the GetMore booking link(s) here. Until then the Book buttons scroll to the branches.
export const BOOKING_URL = ''
export const bookHref = BOOKING_URL || '#branches'
export const bookExternal = Boolean(BOOKING_URL)

// TODO: paste a Formspree endpoint (https://formspree.io/f/xxxx) to enable the franchise form.
export const FRANCHISE_FORM_URL = ''

export const FOLLOWERS = '24K'
export const CANCELLATION = 'You can cancel or reschedule anytime before the appointment time.'
export const SHARED_PHONE = '09454939969'

// Closed for All Saints' and All Souls' Day. The advisory hides itself once Nov 2 is over (Manila time).
export const UNDAS = { closedFrom: '2026-11-01', closedTo: '2026-11-02', hideAfter: '2026-11-03T00:00:00+08:00' }

// TODO: coordinates are approximate (street level). Replace with the exact pin from Google Maps.
export const BRANCHES = [
  {
    id: 'molo',
    name: 'Molo',
    address: '2nd floor Doña Maria Bldg., Avanceña St., Molo, Iloilo City',
    landmark: 'Across Tibiao Bakery',
    hours: [
      ['Mon – Fri', '10:30 AM – 8 PM'],
      ['Sat – Sun', '11 AM – 8 PM'],
    ],
    phones: ['09637498945', SHARED_PHONE],
    schedule: { weekday: [630, 1200], weekend: [660, 1200] }, // minutes from midnight
    cafe: false,
    lng: 122.544,
    lat: 10.6975,
  },
  {
    id: 'mandurriao',
    name: 'Mandurriao',
    address: '2nd floor SDC Bldg., Guzman-Jesena St., Mandurriao, Iloilo City',
    landmark: 'Above Robinsons Easymart',
    hours: [['Mon – Sun', '10 AM – 8 PM']],
    phones: ['09098748165', SHARED_PHONE],
    schedule: { weekday: [600, 1200], weekend: [600, 1200] },
    cafe: true,
    lng: 122.5418,
    lat: 10.715,
  },
  {
    id: 'jaro',
    name: 'Jaro',
    address: '2nd floor, Lopez Jaena St., Jaro, Iloilo City',
    landmark: 'Beside the Church of Jesus Christ (near CPU)',
    hours: [['Mon – Sun', '10 AM – 8 PM']],
    phones: ['09631070864', SHARED_PHONE],
    schedule: { weekday: [600, 1200], weekend: [600, 1200] },
    cafe: true,
    lng: 122.55,
    lat: 10.7312,
  },
]

export const directionsUrl = (b) =>
  `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`

// 0963… -> +63963… for tel: links
export const telHref = (n) => `tel:+63${n.replace(/^0/, '')}`
export const formatPhone = (n) => `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}`

export const PERKS = [
  { icon: 'Car', label: 'Parking', note: 'At every branch' },
  { icon: 'Wifi', label: 'Free Wi-Fi', note: 'At every branch' },
  { icon: 'MessageSquare', label: 'Free consultation', note: 'Before every cut' },
  { icon: 'Coffee', label: 'Café', note: 'Mandurriao & Jaro' },
  { icon: 'Tv', label: 'Netflix', note: 'While you wait' },
  { icon: 'Snowflake', label: 'Cold aircon', note: 'Always' },
  { icon: 'Armchair', label: 'Plenty of space', note: 'Room to relax' },
]

const fmtTime = (m) => {
  const h = Math.floor(m / 60)
  const mm = String(m % 60).padStart(2, '0')
  return `${h % 12 || 12}${mm === '00' ? '' : ':' + mm} ${h >= 12 ? 'PM' : 'AM'}`
}

// Open/closed in Manila time, whatever timezone the visitor is in
export function branchStatus(b, now = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(now).map((x) => [x.type, x.value])
  )
  const day = `${p.year}-${p.month}-${p.day}`
  if (day >= UNDAS.closedFrom && day <= UNDAS.closedTo) return { open: false, text: 'Closed for Undas, back Nov 3' }
  const mins = (Number(p.hour) % 24) * 60 + Number(p.minute)
  const [from, to] = ['Sat', 'Sun'].includes(p.weekday) ? b.schedule.weekend : b.schedule.weekday
  if (mins >= from && mins < to) return { open: true, text: `Open now, until ${fmtTime(to)}` }
  return { open: false, text: mins < from ? `Opens today at ${fmtTime(from)}` : 'Closed, opens tomorrow' }
}
