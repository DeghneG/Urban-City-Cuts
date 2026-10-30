import { useEffect, useRef, useState } from 'react'

// A device bezel around an iframe of the site. The iframe keeps its real pixel width (so the site's
// breakpoints behave exactly as on a phone) and the whole device is scaled down to fit its container.
export default function PhoneFrame({ src = '/', width = 390, height = 844, round = 44, reloadKey = 0, maxScale = 1, fitOffset = 0 }) {
  const wrap = useRef(null)
  const [scale, setScale] = useState(maxScale)
  const bezel = 10
  const status = round > 20 ? 34 : 0 // phones get a status bar, so the notch never covers the site

  useEffect(() => {
    const el = wrap.current
    // Fit the width of the container, and (when fitOffset is set) the height of the window as well
    const fit = () => {
      const byW = el.clientWidth / (width + bezel * 2)
      const byH = fitOffset ? (window.innerHeight - fitOffset) / (height + bezel * 2) : Infinity
      setScale(Math.max(0.2, Math.min(maxScale, byW, byH)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    window.addEventListener('resize', fit)
    return () => { ro.disconnect(); window.removeEventListener('resize', fit) }
  }, [width, height, maxScale, fitOffset])

  const outerW = width + bezel * 2
  const outerH = height + bezel * 2

  return (
    <div ref={wrap} className="w-full flex justify-center" style={{ height: outerH * scale }}>
      <div style={{ width: outerW, height: outerH, transform: `scale(${scale})`, transformOrigin: 'top center' }}>
        <div className="bg-black shadow-[0_30px_90px_rgba(0,0,0,0.65)]" style={{ width: outerW, height: outerH, borderRadius: round + bezel, padding: bezel, border: '1px solid #2a2c30' }}>
          <div className="flex flex-col overflow-hidden bg-ink" style={{ width, height, borderRadius: round }}>
            {status > 0 && (
              <div className="relative flex items-center justify-between px-8 text-[12px] font-semibold text-white bg-black" style={{ height: status, flex: 'none' }} aria-hidden="true">
                <span>9:41</span>
                <span className="absolute left-1/2 -translate-x-1/2 top-2 h-[20px] w-[92px] rounded-full bg-[#050505] border border-[#16171a]" />
                <span className="flex items-center gap-1.5">
                  <span className="flex items-end gap-[2px]">{[5, 7, 9, 11].map((h) => <i key={h} className="w-[3px] bg-white rounded-[1px]" style={{ height: h }} />)}</span>
                  <span className="relative w-[22px] h-[11px] rounded-[3px] border border-white/70"><i className="absolute inset-[1.5px] right-[4px] bg-white rounded-[1px]" /></span>
                </span>
              </div>
            )}
            <iframe
              key={reloadKey}
              src={src}
              title="Preview of the Urban City Cuts website"
              className="block bg-ink"
              style={{ width, height: height - status, border: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
