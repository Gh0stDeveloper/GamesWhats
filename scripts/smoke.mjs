import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { games, resolveGame } from '../dist/games/index.js'

assert.equal(games.length, 10, 'GamesWhats must expose exactly the ten HTML mini games')

const ids = ['mario', 'dino', 'ninja', 'snake', 'tetris', 'pacman', 'spacedodge', 'doom', 'gato', 'damas']
assert.deepEqual(games.map((game) => game.id), ids)
assert.equal(resolveGame('checkers')?.id, 'damas')
assert.equal(resolveGame('fruit')?.id, 'ninja')
assert.equal(resolveGame('dinosaur')?.id, 'dino')
assert.equal(resolveGame('packman')?.id, 'pacman')
assert.equal(resolveGame('pac-man')?.id, 'pacman')
assert.equal(resolveGame('tetrominos')?.id, 'tetris')

for (const game of games) {
  const html = game.buildHtml()
  assert.equal(typeof html, 'string')
  assert.ok(html.length > 1200, `${game.id} HTML should be a real self-contained game`)
  assert.ok(html.includes('<script>'), `${game.id} must contain its JavaScript inline`)
  assert.ok(html.includes('GAMESWHATS'), `${game.id} should use the shared game frame`)
  assert.equal(/https?:\/\//i.test(html), false, `${game.id} must not depend on remote HTTP assets`)
}

const transport = readFileSync(new URL('../src/html-transport.ts', import.meta.url), 'utf8')
for (const token of [
  'botForwardedMessage',
  'richResponseMessage',
  'unifiedResponse',
  'GenAIaeacdsnwHtmlPrimitive',
  'GenAISingleLayoutViewModel',
  'forwardedAiBotMessageInfo',
]) {
  assert.ok(transport.includes(token), `transport must preserve ${token}`)
}

console.log(`GamesWhats smoke OK · ${games.length} HTML games · no external game assets`)
