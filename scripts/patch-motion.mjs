import fs from 'node:fs'
const edit = (p, fn) => { const s = fs.readFileSync(p, 'utf8'); const o = fn(s); if (o === s) throw new Error('no change: ' + p); fs.writeFileSync(p, o) }

// CSS: drop the three reduced-motion blocks that switch the site's signature effects off
edit('src/index.css', (c) => {
  c = c.replace(/@media \(prefers-reduced-motion: reduce\) \{\n  \.loader, \.loader__inner \{[^}]*\}\n  \.loader--lift \{[^}]*\}\n  \.loader__mark, \.loader__shine \{[^}]*\}\n\}\n\n/, '')
  c = c.replace(/@media \(prefers-reduced-motion: reduce\) \{\n  \/\* Reveals still fade in[\s\S]*?\.animate-ticker \{ animation-duration: 90s; \}\n\}\n\n/, '')
  c = c.replace(/@media \(prefers-reduced-motion: reduce\) \{\n  \/\* Keep the crossfade[\s\S]*?\.wipe img \{[^}]*\}\n\}\n\n/, '')
  return c
})

// JS: the loader always plays in full; scroll-driven motion always runs
edit('src/components/Loader.jsx', (s) => s
  .replace("    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches\n", '')
  .replace('setTimeout(r, reduced ? 300 : SHINE_MS)', 'setTimeout(r, SHINE_MS)')
  .replace('const t = reduced ? 0.45 : FLIGHT', 'const t = FLIGHT'))
edit('src/hooks/useScrollProgress.js', (s) => s.replace(/    if \(window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches\) \{\n[\s\S]*?\n      return\n    \}\n/, ''))
edit('src/components/Craft.jsx', (s) => s.replace(/    if \(window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches\) \{\n[\s\S]*?\n      return\n    \}\n/, ''))

// Lenis: a soft inertial glide (each frame closes 7.5% of the gap), which is easy to feel on a wheel or touchpad
edit('src/lib/smoothScroll.js', (s) => s.replace(/    \/\/ Slightly slower than the Lenis default feel[^\n]*\n    duration: 1\.6,\n    wheelMultiplier: 0\.85,/, '    // Inertial glide: each frame closes 7.5% of the remaining distance, so the page keeps drifting after the wheel stops\n    lerp: 0.075,\n    wheelMultiplier: 0.9,'))
console.log('motion patched')
