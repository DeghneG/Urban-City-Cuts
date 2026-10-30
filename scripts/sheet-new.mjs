import sharp from 'sharp'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
const DIR = 'pictures of urban'
const known = JSON.parse(readFileSync('scripts/image-manifest.json', 'utf8'))
const onSite = new Set(Object.values(known).map((v) => v.src))
const fresh = readdirSync(DIR).filter((f) => /\.jpe?g$/i.test(f) && !onSite.has(f)).sort()
writeFileSync('.gstack/new-photos.json', JSON.stringify(fresh, null, 1))
const cell = 330, cols = 5, rows = Math.ceil(fresh.length / cols)
const comps = await Promise.all(fresh.map(async (f, i) => ({
  input: await sharp(`${DIR}/${f}`).rotate().resize(cell - 8, cell - 30, { fit: 'cover' })
    .composite([{ input: Buffer.from(`<svg width="${cell - 8}" height="28"><rect width="100%" height="100%" fill="#000"/><text x="6" y="20" font-size="18" fill="#fff" font-family="Arial">N${String(i + 1).padStart(2, '0')}  ${f.slice(0, 9)}</text></svg>`), gravity: 'south' }]).png().toBuffer(),
  left: (i % cols) * cell, top: Math.floor(i / cols) * cell,
})))
await sharp({ create: { width: cols * cell, height: rows * cell, channels: 3, background: '#222' } }).composite(comps).jpeg({ quality: 82 }).toFile('.gstack/new-sheet.jpg')
console.log(fresh.map((f, i) => `N${String(i + 1).padStart(2, '0')} ${f}`).join('\n'))
