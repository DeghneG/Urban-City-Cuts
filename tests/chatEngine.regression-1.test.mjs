// Regression: ISSUE-004, franchise and hiring questions lost to generic price words ("how much")
// Found by /qa on 2026-10-30
// Report: .gstack/qa-reports/
//
// Run: npm test   (Node's built-in runner; esbuild, already installed with Vite, resolves the extensionless imports)
import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'

const { outputFiles } = await build({
  entryPoints: ['src/lib/chatEngine.js'],
  bundle: true,
  format: 'esm',
  write: false,
  logLevel: 'error',
})
const { answer } = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'))

test('a franchise question about cost gets the franchise answer, not the haircut price list', () => {
  const r = answer('how much to invest in a franchise')
  assert.match(r.text, /franchising/i)
  assert.match(r.text, /no royalty fee/i)
  assert.match(r.text, /not published/i)
  assert.doesNotMatch(r.text, /Men's Haircut/)
})

test('a hiring question that contains "how much" still gets the hiring answer', () => {
  assert.match(answer('are you hiring barbers how much is the pay').text, /Pavia/)
})

test('a plain price question still gets prices', () => {
  assert.match(answer('how much is a haircut').text, /₱350/)
  assert.match(answer('how much is the vip package').text, /₱1,500/)
})

test('"beer" lists beer and soda, "haircut for a woman" finds the women\'s cut', () => {
  assert.match(answer('do you have beer').text, /Corona Beer ₱140/)
  assert.match(answer('how much is a haircut for a woman').text, /Women's Cut: ₱500/)
})

test('an unknown question falls back with a way to reach the shop', () => {
  const r = answer('asdf')
  assert.match(r.text, /not sure/i)
  assert.ok(r.links.some((l) => /Messenger|Facebook/i.test(l.label)))
})
