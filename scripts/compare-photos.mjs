// Which photos in "pictures of urban" are new, and does any look like one already on the site?
// A 64-bit difference hash survives re-saves, resizes and recompression, so the same photo with a different filename still matches.
import sharp from 'sharp'
import { readdirSync, readFileSync, statSync } from 'node:fs'

const DIR = 'pictures of urban'
const known = JSON.parse(readFileSync('scripts/image-manifest.json', 'utf8')) // cut-NN -> { src: original filename }
const onSite = new Map(Object.entries(known).map(([id, v]) => [v.src, id]))

async function dhash(file) {
  const px = await sharp(file).rotate().greyscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer()
  let bits = ''
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += px[y * 9 + x] > px[y * 9 + x + 1] ? '1' : '0'
  return bits
}
const dist = (a, b) => [...a].reduce((n, c, i) => n + (c !== b[i]), 0)

const files = readdirSync(DIR).filter((f) => /\.jpe?g$/i.test(f)).sort()
const hashes = {}
for (const f of files) hashes[f] = await dhash(`${DIR}/${f}`)

const fresh = files.filter((f) => !onSite.has(f))
console.log(`Folder: ${files.length} photos. On the site: ${files.length - fresh.length}. Not on the site by filename: ${fresh.length}\n`)
for (const f of fresh) {
  const { width, height } = await sharp(`${DIR}/${f}`).metadata()
  console.log(`NEW  ${f}  ${width}x${height}  ${Math.round(statSync(`${DIR}/${f}`).size / 1024)} KB`)
  const near = files.filter((g) => g !== f).map((g) => [g, dist(hashes[f], hashes[g])]).sort((a, b) => a[1] - b[1]).slice(0, 3)
  for (const [g, d] of near) console.log(`       closest: ${onSite.get(g) || '(new)'} ${g.slice(0, 22)}...  distance ${d}/64 ${d <= 10 ? '<-- LOOKS LIKE THE SAME PHOTO' : ''}`)
}
