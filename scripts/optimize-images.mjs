// Re-encodes every photo in "pictures of urban" as responsive WebP + AVIF.
// Widths never exceed the source, so nothing is upscaled. Quality is tuned for photos of faces and hair:
// chroma is not subsampled and the encoder runs at its slowest (best) effort.
import sharp from 'sharp'
import { readdirSync, readFileSync, mkdirSync, rmSync, writeFileSync, statSync } from 'node:fs'
import path from 'node:path'

const SRC = 'pictures of urban'
const OUT = 'public/img'
const WIDTHS = [480, 800, 1200, 1600]

for (const f of readdirSync(OUT)) if (/\.(webp|avif)$/.test(f)) rmSync(path.join(OUT, f))
mkdirSync(OUT, { recursive: true })

const files = readdirSync(SRC).filter((f) => /\.jpe?g$/i.test(f)).sort()
const manifest = {}
// Ids are permanent: a photo keeps the id it was first given, and new photos take the next free number,
// so adding files never renumbers the gallery. scripts/image-manifest.json remembers which file has which id.
const ids = JSON.parse(readFileSync('scripts/image-manifest.json', 'utf8'))
const idBySrc = new Map(Object.entries(ids).map(([id, v]) => [v.src, id]))
let next = Math.max(0, ...Object.keys(ids).map((k) => Number(k.replace('cut-', '')) || 0)) + 1
let inBytes = 0, outBytes = 0
for (const f of files) {
  const base = idBySrc.get(f) || `cut-${String(next++).padStart(2, '0')}`
  ids[base] = { src: f }
  if (base === 'logo') continue // the logo is delivered as a transparent PNG (make-logos.mjs)
  const file = path.join(SRC, f)
  inBytes += statSync(file).size
  const { width, height } = await sharp(file).metadata()
  const sizes = [...new Set(WIDTHS.filter((w) => w < width).concat(Math.min(width, 1600)))]
  for (const w of sizes) {
    const img = sharp(file).rotate().resize({ width: w, withoutEnlargement: true, kernel: 'lanczos3' })
    await img.clone().webp({ quality: 82, effort: 6, smartSubsample: false }).toFile(`${OUT}/${base}-${w}.webp`)
    await img.clone().avif({ quality: 58, effort: 6, chromaSubsampling: '4:4:4' }).toFile(`${OUT}/${base}-${w}.avif`)
  }
  manifest[base] = { w: width, h: height, sizes }
}
for (const f of readdirSync(OUT)) if (/\.(webp|avif)$/.test(f)) outBytes += statSync(path.join(OUT, f)).size
writeFileSync('src/lib/imageManifest.json', JSON.stringify(manifest, null, 1))
writeFileSync('scripts/image-manifest.json', JSON.stringify(ids, null, 2))
console.log(`source ${(inBytes / 1e6).toFixed(1)} MB -> ${(outBytes / 1e6).toFixed(1)} MB across ${readdirSync(OUT).length} files`)
