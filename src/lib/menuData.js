// Prices in PHP. `from: true` renders "starts at". `base` items are the one main service in a visit;
// the rest stack on top of it in the estimator.

export const NOTE = 'Prices may vary depending on hair length and volume.'

export const CATEGORIES = [
  {
    id: 'cuts',
    label: 'Cuts',
    kicker: 'Style & hair consult included',
    base: true,
    items: [
      { id: 'mens', name: "Men's Haircut", price: 350 },
      { id: 'signature', name: 'UCC Signature Cut', price: 600, badge: 'Signature' },
      { id: 'womens', name: "Women's Cut", price: 500 },
    ],
  },
  {
    id: 'packages',
    label: 'Packages',
    kicker: 'The full treatment',
    base: true,
    items: [
      { id: 'pkg-wash', name: 'Cut, Wash & Style', price: 450 },
      {
        id: 'pkg-towel',
        name: 'Cut, Wash, Style + Facial Moisturizer & Hot Towel',
        price: 550,
      },
      {
        id: 'pkg-vip',
        name: 'VIP Package',
        price: 1500,
        badge: 'VIP',
        detail: 'Cut, wash, style, hot towel, facial moisturizer, hair treatment & a 15-minute upper body massage',
      },
    ],
  },
  {
    id: 'major',
    label: 'Color & Treatments',
    kicker: 'Major services, with haircut',
    base: true,
    items: [
      { id: 'treatment', name: 'Hair Treatment', price: 900 },
      { id: 'color-m', name: 'Hair Color · Men', price: 1600, from: true },
      { id: 'color-w', name: 'Hair Color · Women', price: 2000, from: true },
      { id: 'perm-m', name: 'Perm · Men', price: 1600, from: true },
      { id: 'perm-w', name: 'Perm · Women', price: 2000, from: true },
      { id: 'braids', name: 'Braids', price: 2000 },
    ],
  },
  {
    id: 'addons',
    label: 'Add-ons',
    kicker: 'Finish it your way',
    items: [
      { id: 'brow', name: 'Eyebrow Trim', price: 80 },
      { id: 'shampoo', name: 'Shampoo w/ Quick Massage', price: 100 },
      { id: 'art', name: 'Hair Art', price: 100 },
      { id: 'shave', name: 'Regular Shave', price: 100 },
      { id: 'faceshave', name: 'Full Face Shave', price: 150 },
    ],
  },
  {
    id: 'products',
    label: 'Take-home',
    kicker: 'Keep the look going',
    items: [
      { id: 'pomade', name: 'Pomade', price: 350 },
      { id: 'powder', name: 'Textured Powder', price: 350 },
      { id: 'cream', name: 'Volumizing Cream', price: 600 },
    ],
  },
]

export const peso = (n) => `₱${n.toLocaleString('en-PH')}`

// Café. `hot` is 8oz, `iced` is 16oz; null means not served that way.
export const CAFE = {
  espresso: [
    { name: 'Americano', hot: 100, iced: 120 },
    { name: 'Cappuccino', hot: 120, iced: null },
    { name: 'Spanish Latte', hot: 130, iced: 140 },
    { name: 'Caramel Macchiato', hot: 130, iced: 145 },
    { name: 'Salted Caramel Latte', hot: 130, iced: 145 },
    { name: 'Hazelnut Latte', hot: 130, iced: 145 },
    { name: 'Dirty Matcha', hot: null, iced: 145 },
  ],
  refreshments: [
    { name: 'Chocolate', hot: 120, iced: 130 },
    { name: 'Passion Zest Tea', hot: null, iced: 125 },
    { name: 'Pure Passion Tea', hot: null, iced: 125 },
    { name: 'Tropical Duo', hot: null, iced: 125 },
    { name: 'Wintermelon Tea', hot: null, iced: 125 },
    { name: 'Matcha Latte', hot: null, iced: 140 },
  ],
  soda: [
    { name: 'Coke', price: 60 },
    { name: 'Sprite', price: 60 },
    { name: 'Royal', price: 60 },
  ],
  beer: [
    { name: 'Corona Beer', price: 140 },
    { name: 'Jack Daniels (Coke)', price: 110 },
    { name: 'Heineken', price: 130 },
  ],
  // TODO: confirm these two; the menu screenshot was cut off at the bottom
  addons: [
    { name: 'Espresso Shot', price: 60 },
    { name: 'Bottled Water', price: 20 },
  ],
}

// Gallery. `cat` drives the filter chips. Dimensions let the browser reserve space before load.
export const GALLERY = [
  { id: 'cut-04', cat: 'cuts', w: 1536, h: 2048, alt: 'Textured crop with a clean skin fade' },
  { id: 'cut-21', cat: 'cuts', w: 1536, h: 2048, alt: 'Textured fade with a clean taper, in the shop lounge' },
  { id: 'cut-10', cat: 'cuts', w: 1536, h: 2048, alt: 'Hair design fade with a pompadour top' },
  { id: 'cut-22', cat: 'cuts', w: 1536, h: 2048, alt: 'Messy crop with razor hair art at the back' },
  { id: 'cut-01', cat: 'shop', w: 1536, h: 2048, alt: 'Barbershop floor under hexagon lights' },
  { id: 'cut-23', cat: 'cuts', w: 1536, h: 2048, alt: 'Zigzag hair art on a short fade, in the chair' },
  { id: 'cut-09', cat: 'cuts', w: 1536, h: 2048, alt: 'Zigzag hair art on a clean fade' },
  { id: 'cut-24', cat: 'cuts', w: 1536, h: 2048, alt: 'Layered textured crop with a tapered nape' },
  { id: 'cut-19', cat: 'events', w: 2048, h: 1366, alt: 'Barbers at work at a live event' },
  { id: 'cut-25', cat: 'cuts', w: 1536, h: 2048, alt: 'Long textured top with a clean taper' },
  { id: 'cut-05', cat: 'cuts', w: 1536, h: 2048, alt: 'Soft textured fringe' },
  { id: 'cut-26', cat: 'cuts', w: 1536, h: 2048, alt: 'Textured fringe, tapered at the back and sides' },
  { id: 'cut-06', cat: 'shop', w: 1536, h: 2048, alt: 'Chairs and caped seats in the shop' },
  { id: 'cut-27', cat: 'events', w: 1536, h: 2048, alt: 'A barber styling blonde hair at a live event' },
  { id: 'cut-11', cat: 'cuts', w: 1536, h: 2048, alt: 'Braids into a bun' },
  { id: 'cut-28', cat: 'team', w: 2048, h: 1536, alt: 'The barbers together with their tool cases' },
  { id: 'cut-18', cat: 'events', w: 1366, h: 2048, alt: 'Barber working on a bold color cut' },
  { id: 'cut-29', cat: 'cuts', w: 1536, h: 2048, alt: 'Messy textured cut with a low taper' },
  { id: 'cut-14', cat: 'cuts', w: 959, h: 1572, alt: 'Natural textured cut' },
  { id: 'cut-30', cat: 'cuts', w: 1536, h: 2048, alt: 'Textured fringe with a mid taper, orange backdrop' },
  { id: 'cut-08', cat: 'shop', w: 1536, h: 2048, alt: 'A busy afternoon in the shop' },
  { id: 'cut-31', cat: 'cuts', w: 1536, h: 2048, alt: 'Long layered cut against an orange backdrop' },
  { id: 'cut-20', cat: 'events', w: 2048, h: 1366, alt: 'Blue fade being finished' },
  { id: 'cut-32', cat: 'events', w: 2048, h: 1365, alt: 'A barber at work in the crowd at an event' },
  { id: 'cut-02', cat: 'team', w: 1536, h: 2048, alt: 'The Urban City Cuts barbers' },
  { id: 'cut-33', cat: 'cuts', w: 1536, h: 2048, alt: 'Spiky textured top with blonde highlights' },
  { id: 'cut-07', cat: 'shop', w: 1536, h: 2048, alt: 'Clients waiting under the hexagon ceiling' },
  { id: 'cut-34', cat: 'events', w: 1536, h: 1024, alt: 'A barber trimming a client at an event' },
  { id: 'cut-12', cat: 'team', w: 1320, h: 1760, alt: 'A barber with a happy client' },
  { id: 'cut-35', cat: 'cuts', w: 1536, h: 2048, alt: 'Soft textured fringe with a clean taper' },
  { id: 'cut-17', cat: 'events', w: 2048, h: 1365, alt: 'Crowd at a live barbering event' },
  { id: 'cut-13', cat: 'team', w: 1080, h: 1440, alt: 'Barber and client after the cut' },
  { id: 'cut-03', cat: 'shop', w: 1536, h: 2048, alt: 'A full shop' },
]
export const FILTERS = [
  ['all', 'All'],
  ['cuts', 'Cuts'],
  ['shop', 'The shop'],
  ['team', 'The team'],
  ['events', 'Events'],
]
