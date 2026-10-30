// Rule-based answers for the inquiry chatbot. No LLM and no network: every reply is assembled from the
// same data files that drive the website, so a price or hour changed there changes here too.
import {
  BRANCHES, PERKS, FOLLOWERS, CANCELLATION, UNDAS, BOOKING_URL, INSTAGRAM_URL, FACEBOOK_URL, MESSENGER_URL,
  SHARED_PHONE, FRANCHISE_FORM_URL, branchStatus, telHref, formatPhone, directionsUrl,
} from './site'
import { CATEGORIES, CAFE, NOTE, peso } from './menuData'
import { getState } from './adminStore'

const norm = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

const CHIPS = ['Opening hours', 'Branch locations', 'Haircut prices', 'Café menu', 'How do I book?', 'Franchise', 'Now hiring']
const reply = (text, extra = {}) => ({ text, links: [], chips: [], ...extra })
const link = (label, href, external = false) => ({ label, href, external })

const branchesIn = (q) => BRANCHES.filter((b) => q.includes(norm(b.name)))
const hoursLine = (b) => b.hours.map(([d, h]) => `${d} ${h}`).join(', ')

// ---- price lookup: every service, product and café item, searchable by name --------------------------------
const STOP = new Set('the a an of w with and for to is are how much what price prices cost costs do you your i me my can there any ucc magkano mo ang ng sa po pa have get want like need rate rates'.split(' '))
const GENERIC = new Set(['cut', 'cuts', 'hair', 'men', 'mens', 'women', 'womens', 'haircut', 'tea', 'package', 'beer', 'soda', 'espresso', 'coffee'])

const buildItems = () => [
  ...CATEGORIES.flatMap((c) => c.items.map((it) => ({ ...it, group: c.label, kind: 'service' }))),
  ...CAFE.espresso.map((it) => ({ ...it, group: 'Espresso', kind: 'drink' })),
  ...CAFE.refreshments.map((it) => ({ ...it, group: 'Refreshments', kind: 'drink' })),
  ...CAFE.soda.map((it) => ({ ...it, group: 'Soda', kind: 'simple' })),
  ...CAFE.beer.map((it) => ({ ...it, group: 'Beer', kind: 'simple' })),
  ...CAFE.addons.map((it) => ({ ...it, group: 'Café add-ons', kind: 'simple' })),
].map((it) => ({ ...it, words: norm(it.name).split(' ').filter((w) => !STOP.has(w)) }))

// Rebuilt per question so prices edited in /admin are quoted correctly
let ITEMS = buildItems()

const itemLine = (it) => {
  if ('hot' in it || 'iced' in it) {
    const parts = [it.hot && `hot ${peso(it.hot)}`, it.iced && `iced ${peso(it.iced)}`].filter(Boolean)
    return `${it.name}: ${parts.join(', ')}`
  }
  return `${it.name}: ${it.from ? 'from ' : ''}${peso(it.price)}`
}

function findItems(q) {
  const qw = new Set(q.split(' ').filter((w) => !STOP.has(w)))
  const scored = ITEMS.map((it) => {
    const hits = it.words.filter((w) => qw.has(w) || qw.has(w.replace(/s$/, '')) || qw.has(w + 's'))
    const distinct = hits.filter((w) => !GENERIC.has(w)).length
    return { it, hits: hits.length, distinct }
  }).filter((x) => x.distinct > 0)
  if (!scored.length) return []
  const best = Math.max(...scored.map((x) => x.hits))
  let out = scored.filter((x) => x.hits === best).map((x) => x.it)
  // "men" / "women" narrow a list like Hair Color or Perm
  const wantW = qw.has('women') || qw.has('womens') || qw.has('girl') || qw.has('ladies')
  const wantM = qw.has('men') || qw.has('mens') || qw.has('boy') || qw.has('guy')
  if (wantW !== wantM) out = out.filter((it) => (wantW ? !/\bmen\b/i.test(it.name) : !/\bwomen\b/i.test(it.name)) || it.words.length === 0)
  return out.slice(0, 7)
}

// ---- intents ------------------------------------------------------------------------------------------------
const branchBlock = (b) => `${b.name}: ${b.address} (${b.landmark}). ${hoursLine(b)}.`

const INTENTS = [
  {
    id: 'greeting',
    keys: ['hi', 'hello', 'hey', 'kumusta', 'musta', 'good morning', 'good afternoon', 'good evening', 'hola'],
    run: () => reply('Hi! I can help with opening hours, branch locations, prices, the café menu, bookings, franchising and jobs. What would you like to know?', { chips: CHIPS }),
  },
  {
    id: 'openNow',
    keys: ['open now', 'open today', 'are you open', 'still open', 'open right now', 'bukas', 'open na'],
    run: (q) => {
      const list = branchesIn(q).length ? branchesIn(q) : BRANCHES
      return reply(list.map((b) => `${b.name}: ${branchStatus(b).text}`).join('\n'), { chips: ['Opening hours', 'How do I book?'] })
    },
  },
  {
    id: 'hours',
    keys: ['hours', 'opening hours', 'open', 'close', 'closing', 'closes', 'opens', 'what time', 'time', 'schedule', 'oras', 'until what time', 'sunday', 'saturday', 'weekend'],
    run: (q) => {
      const list = branchesIn(q).length ? branchesIn(q) : BRANCHES
      return reply(
        list.map((b) => `${b.name}: ${hoursLine(b)}. ${branchStatus(b).text}.`).join('\n') + '\nWalk-ins and appointments are always welcome.',
        { chips: ['Branch locations', 'How do I book?'] },
      )
    },
  },
  {
    id: 'location',
    keys: ['where', 'address', 'location', 'located', 'branch', 'branches', 'directions', 'map', 'landmark', 'near', 'saan', 'how to get', 'find you'],
    run: (q) => {
      const list = branchesIn(q).length ? branchesIn(q) : BRANCHES
      return reply(list.map(branchBlock).join('\n'), {
        links: list.map((b) => link(`Directions to ${b.name}`, directionsUrl(b), true)).concat(list.length > 1 ? [link('See the map', '#branches')] : []),
        chips: ['Opening hours', 'Contact numbers'],
      })
    },
  },
  {
    id: 'contact',
    keys: ['phone', 'number', 'numbers', 'call', 'contact', 'text', 'mobile', 'cellphone', 'tawag', 'hotline', 'reach'],
    run: (q) => {
      const list = branchesIn(q).length ? branchesIn(q) : BRANCHES
      return reply(
        list.map((b) => `${b.name}: ${b.phones.map(formatPhone).join(' / ')}`).join('\n') + `\nYou can also message us on Facebook.`,
        { links: list.map((b) => link(`Call ${b.name}`, telHref(b.phones[0]))).concat([link('Message on Facebook', MESSENGER_URL, true)]), chips: ['How do I book?'] },
      )
    },
  },
  {
    id: 'booking',
    keys: ['book', 'booking', 'reserve', 'reservation', 'reservations', 'appointment', 'appointments', 'schedule a', 'set a', 'slot', 'mag book', 'magpa book'],
    run: () =>
      reply(
        `Walk-ins and reservations are both welcome. ${BOOKING_URL ? 'Reserve online below, or ' : 'To reserve, '}call or message your branch. ${CANCELLATION}`,
        {
          links: [BOOKING_URL ? link('Book online', BOOKING_URL, true) : link('Choose a branch', '#branches'), link('Build your visit', '#menu')],
          chips: ['Cancellation policy', 'Contact numbers'],
        },
      ),
  },
  {
    id: 'walkin',
    keys: ['walk in', 'walkin', 'walk ins', 'walkins', 'no appointment', 'without appointment', 'need appointment'],
    run: () => reply('Walk-ins are always welcome. If you want a guaranteed time, reserve ahead. We are open until 8 PM at every branch.', { chips: ['How do I book?', 'Opening hours'] }),
  },
  {
    id: 'cancel',
    keys: ['cancel', 'cancellation', 'reschedule', 'resched', 'refund', 'change my appointment', 'move my appointment', 'late'],
    run: () => reply(CANCELLATION, { chips: ['How do I book?', 'Contact numbers'] }),
  },
  {
    id: 'prices',
    keys: ['price', 'prices', 'pricing', 'how much', 'cost', 'rate', 'rates', 'menu', 'services', 'service', 'magkano', 'price list', 'what do you offer', 'offer'],
    run: () =>
      reply(
        `Here are the basics:\n${CATEGORIES[0].items.map(itemLine).join('\n')}\n${NOTE}\nAsk about anything specific, like "VIP package", "perm" or "braids".`,
        { links: [link('Open the price board', '#menu')], chips: ['Packages', 'Color and perm', 'Add-ons', 'Products', 'Café menu'] },
      ),
  },
  {
    id: 'haircut',
    keys: ['haircut', 'hair cut', 'cut', 'cuts', 'fade', 'trim', 'signature', 'mens haircut', 'womens cut', 'gupit'],
    run: () => reply(`Cuts include styling and a hair consult:\n${CATEGORIES[0].items.map(itemLine).join('\n')}\n${NOTE}`, { links: [link('Build your visit', '#menu')], chips: ['Packages', 'Add-ons'] }),
  },
  {
    id: 'packages',
    keys: ['package', 'packages', 'bundle', 'combo', 'hot towel', 'facial', 'massage'],
    run: () =>
      reply(`${CATEGORIES[1].items.map((it) => itemLine(it) + (it.detail ? ` (${it.detail})` : '')).join('\n')}`, { links: [link('Build your visit', '#menu')], chips: ['Add-ons', 'Branch locations'] }),
  },
  {
    id: 'major',
    keys: ['color', 'colour', 'dye', 'perm', 'braid', 'braids', 'treatment', 'major service', 'major services', 'rebond', 'bleach'],
    run: () => reply(`Major services come with a haircut:\n${CATEGORIES[2].items.map(itemLine).join('\n')}\n${NOTE}`, { links: [link('Build your visit', '#menu')], chips: ['Add-ons', 'How do I book?'] }),
  },
  {
    id: 'addons',
    keys: ['add on', 'add ons', 'addon', 'addons', 'shave', 'eyebrow', 'brow', 'shampoo', 'hair art', 'extras'],
    run: () => reply(`Add-ons:\n${CATEGORIES[3].items.map(itemLine).join('\n')}`, { links: [link('Build your visit', '#menu')], chips: ['Haircut prices', 'Products'] }),
  },
  {
    id: 'products',
    keys: ['product', 'products', 'pomade', 'powder', 'cream', 'take home', 'styling product', 'buy'],
    run: () => reply(`Take-home products:\n${CATEGORIES[4].items.map(itemLine).join('\n')}`, { links: [link('Build your visit', '#menu')], chips: ['Haircut prices', 'Café menu'] }),
  },
  {
    id: 'cafe',
    keys: ['cafe', 'coffee', 'drink', 'drinks', 'espresso', 'beverage', 'beverages', 'tea', 'matcha', 'latte', 'cappuccino', 'americano', 'cafe menu', 'kape'],
    run: () => {
      const where = BRANCHES.filter((b) => b.cafe).map((b) => b.name).join(' and ')
      return reply(
        `Our café is at ${where}.\nEspresso: ${CAFE.espresso.map((i) => i.name).join(', ')}.\nAlso non-coffee drinks, soda and beer. Coffee starts at ${peso(Math.min(...CAFE.espresso.map((i) => i.hot || i.iced)))}. Ask about a drink to see its price.`,
        { links: [link('See the café menu', '#cafe')], chips: ['Espresso prices', 'Beer and soda', 'Branch locations'] },
      )
    },
  },
  {
    id: 'espresso',
    keys: ['espresso prices', 'espresso menu', 'coffee prices', 'coffee menu'],
    run: () => reply(`Espresso (hot 8oz / iced 16oz):\n${CAFE.espresso.map(itemLine).join('\n')}`, { links: [link('See the café menu', '#cafe')] }),
  },
  {
    id: 'beerSoda',
    keys: ['beer and soda', 'beer', 'soda', 'beers', 'alcohol', 'drinks with alcohol', 'liquor', 'corona', 'heineken', 'jack daniels', 'coke', 'sprite'],
    run: () => reply(`Soda: ${CAFE.soda.map((i) => `${i.name} ${peso(i.price)}`).join(', ')}.\nBeer: ${CAFE.beer.map((i) => `${i.name} ${peso(i.price)}`).join(', ')}.`, { links: [link('See the café menu', '#cafe')] }),
  },
  {
    id: 'perks',
    keys: ['parking', 'park', 'wifi', 'wi fi', 'internet', 'netflix', 'tv', 'aircon', 'air con', 'airconditioned', 'consult', 'consultation', 'amenities', 'facilities', 'comfortable', 'perks', 'space'],
    run: () => reply(`${PERKS.map((p) => `${p.label} (${/^(At|Before|While|Always|Room)/.test(p.note) ? p.note[0].toLowerCase() + p.note.slice(1) : p.note})`).join(', ')}.`, { chips: ['Branch locations', 'Café menu'] }),
  },
  {
    id: 'payment',
    keys: ['gcash', 'maya', 'payment', 'pay', 'cash', 'card', 'credit card', 'paymaya'],
    run: () => reply('GCash and Maya are shown as accepted on the counter signage, and cash works too. For other payment options, please check with your branch.', { chips: ['Contact numbers'] }),
  },
  {
    id: 'franchise',
    boost: 40, // a franchise question outranks generic price words like 'how much'
    keys: ['franchise', 'franchising', 'royalty', 'invest', 'investment', 'own a branch', 'open a branch', 'business opportunity', 'partner', 'start my own'],
    run: (q) =>
      reply(
        'Urban City Cuts is open for franchising outside Iloilo City, with no royalty fee. You get a proven business concept, continuous support, modern shop design and a trusted barbershop brand.' +
          (/(cost|fee|invest|capital|amount|how much|price)/.test(q) ? ' The investment amount is not published, so message or call us for details.' : ''),
        { links: [link('Franchise details', '#franchise'), FRANCHISE_FORM_URL ? link('Send an inquiry', '#franchise') : link('Message us', MESSENGER_URL, true), link(`Call ${formatPhone(SHARED_PHONE)}`, telHref(SHARED_PHONE))], chips: ['Now hiring', 'Contact numbers'] },
      ),
  },
  {
    id: 'hiring',
    boost: 40,
    keys: ['hiring', 'job', 'jobs', 'work for', 'apply', 'application', 'career', 'careers', 'vacancy', 'barber wanted', 'barbers wanted', 'pavia', 'trabaho', 'looking for barbers'],
    run: () => getState().hiring.enabled
      ? reply(`We are hiring barbers for our growing team in ${getState().hiring.city}. Message us on Facebook to apply.`, { links: [link('Apply on Messenger', MESSENGER_URL, true)], chips: ['Franchise', 'Branch locations'] })
      : reply('We have no open barber positions listed right now. Message us on Facebook and we will keep your details.', { links: [link('Message on Facebook', MESSENGER_URL, true)], chips: ['Franchise', 'Branch locations'] }),
  },
  {
    id: 'undas',
    keys: ['undas', 'all saints', 'all souls', 'november', 'nov 1', 'nov 2', 'holiday', 'holidays', 'closed', 'closure', 'closed on'],
    run: () => reply(`We are closed on November 1 and 2 for All Saints' Day and All Souls' Day. Book ahead while we are open, and see you at the shop after the break.`, { chips: ['Opening hours', 'How do I book?'] }),
  },
  {
    id: 'social',
    keys: ['instagram', 'ig', 'facebook', 'fb', 'followers', 'social', 'socials', 'posts', 'page', 'tiktok'],
    run: () => reply(`Find us on Instagram @urbancitycuts and Facebook, where ${FOLLOWERS} people follow our latest cuts.`, { links: [link('Instagram', INSTAGRAM_URL, true), link('Facebook', FACEBOOK_URL, true)] }),
  },
  {
    id: 'about',
    keys: ['about', 'who are you', 'what is urban city cuts', 'tell me about', 'what are you', 'story', 'barbershop'],
    run: () =>
      reply(`Urban City Cuts is a barbershop and café in Iloilo City with branches in ${BRANCHES.map((b) => b.name).join(', ')}. Clean fades, sharp details and a premium finish, with walk-ins welcome.`, { chips: CHIPS }),
  },
  {
    id: 'thanks',
    keys: ['thanks', 'thank you', 'salamat', 'ok thanks', 'great', 'perfect'],
    run: () => reply('You are welcome! See you at the shop.', { chips: ['How do I book?', 'Branch locations'] }),
  },
]

// A phrase scores by its length, only when it appears as whole words in the question
const has = (q, key) => ` ${q} `.includes(` ${key} `)

export function answer(input) {
  ITEMS = buildItems()
  const q = norm(input)
  if (!q) return reply('Ask me about hours, locations, prices, the café, booking, franchising or jobs.', { chips: CHIPS })

  // Chip shortcuts that share words with several intents
  const direct = { 'opening hours': 'hours', 'branch locations': 'location', 'haircut prices': 'haircut', 'cafe menu': 'cafe', 'how do i book': 'booking', 'contact numbers': 'contact', 'cancellation policy': 'cancel', 'color and perm': 'major', 'espresso prices': 'espresso', 'beer and soda': 'beerSoda', 'now hiring': 'hiring' }
  if (direct[q]) return INTENTS.find((i) => i.id === direct[q]).run(q)

  // "haircut for a woman" has no distinctive item word, so route it to the women's cut
  if (/\b(woman|women|womens|ladies|lady|girl)\b/.test(q) && /\b(cut|haircut)\b/.test(q)) {
    const w = ITEMS.find((i) => i.id === 'womens')
    return reply(`${itemLine(w)}\n${NOTE}`, { links: [link('Build your visit', '#menu')], chips: ['How do I book?', 'Haircut prices'] })
  }

  // A specific item ("vip package", "salted caramel latte") wins over a general category
  const items = findItems(q)
  if (items.length && items.length <= 7) {
    const SERVICE_GROUPS = ['Cuts', 'Packages', 'Color & Treatments']
    const note = items.some((i) => SERVICE_GROUPS.includes(i.group))
      ? `\n${NOTE}`
      : items.some((i) => i.kind === 'drink') ? '\nHot is 8oz and iced is 16oz.' : ''
    return reply(items.map(itemLine).join('\n') + note, {
      links: [items[0].kind === 'service' ? link('Build your visit', '#menu') : link('See the café menu', '#cafe')],
      chips: ['How do I book?', 'Haircut prices'],
    })
  }

  let best = null
  for (const intent of INTENTS) {
    let score = 0
    for (const key of intent.keys) if (has(q, key)) score = Math.max(score, key.split(' ').length * 10 + key.length)
    if (score) score += intent.boost || 0
    if (score && (!best || score > best.score)) best = { intent, score }
  }
  if (best) return best.intent.run(q)

  return reply("I'm not sure about that one. I can answer questions about hours, locations, prices, the café, booking, franchising and jobs, or you can message the shop directly.", {
    links: [link('Message on Facebook', MESSENGER_URL, true)],
    chips: CHIPS,
    fallback: true,
  })
}

export const GREETING = reply('Hi, I am the Urban City Cuts assistant. Ask me about hours, branches, prices, the café, booking, franchising or jobs.', { chips: CHIPS })
