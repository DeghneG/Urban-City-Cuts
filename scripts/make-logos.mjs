import sharp from 'sharp'
// Black-on-white JPG -> white-on-transparent PNG (luminance becomes inverted alpha)
async function whiteOnClear(input, out) {
  const { data, info } = await input.greyscale().raw().toBuffer({ resolveWithObject: true })
  const alpha = Buffer.from(data.map((v) => 255 - v))
  const white = Buffer.alloc(info.width * info.height * 3, 255)
  const rgba = Buffer.alloc(info.width * info.height * 4)
  for (let i = 0; i < info.width * info.height; i++) { rgba[i*4]=255; rgba[i*4+1]=255; rgba[i*4+2]=255; rgba[i*4+3]=alpha[i] }
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(out)
}
const src = 'pictures of urban/logo.jpg'
await whiteOnClear(sharp(src).extract({ left: 0, top: 380, width: 2048, height: 1300 }).resize({ width: 900 }), 'public/img/logo-full.png')
await whiteOnClear(sharp(src).extract({ left: 600, top: 420, width: 860, height: 880 }).resize({ width: 240 }), 'public/img/logo-mark.png')
