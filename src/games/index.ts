import { buildDamasHtml } from './damas.js'
import { buildDinoHtml } from './dino.js'
import { buildDoomHtml } from './doom.js'
import { buildGatoHtml } from './gato.js'
import { buildMarioHtml } from './mario.js'
import { buildNinjaHtml } from './ninja.js'
import { buildPacmanHtml } from './pacman.js'
import { buildSnakeHtml } from './snake.js'
import { buildSpaceDodgeHtml } from './space-dodge.js'
import { buildTetrisHtml } from './tetris.js'

export type GameDefinition = {
  id: string
  aliases: string[]
  title: string
  description: string
  buildHtml: () => string
}

export const games: GameDefinition[] = [
  { id: 'mario', aliases: ['plataformas'], title: 'Mini Mario', description: 'Plataformas táctiles con monedas, enemigos y meta.', buildHtml: buildMarioHtml },
  { id: 'dino', aliases: ['dinosaur', 'dinorunner'], title: 'Dino Runner', description: 'Runner táctil: salta obstáculos y suma puntos.', buildHtml: buildDinoHtml },
  { id: 'ninja', aliases: ['fruit', 'fruitslice'], title: 'Ninja Fruit Slice', description: 'Corta frutas deslizando el dedo y evita bombas.', buildHtml: buildNinjaHtml },
  { id: 'snake', aliases: ['serpiente'], title: 'Snake', description: 'Snake clásico con controles táctiles.', buildHtml: buildSnakeHtml },
  { id: 'tetris', aliases: ['tetrominos', 'blocks'], title: 'Tetris', description: 'Puzzle táctil de bloques con líneas, giro y caída rápida.', buildHtml: buildTetrisHtml },
  { id: 'pacman', aliases: ['packman', 'pac-man'], title: 'Pac-Man', description: 'Laberinto arcade táctil con puntos, vidas y fantasmas.', buildHtml: buildPacmanHtml },
  { id: 'spacedodge', aliases: ['space', 'asteroides'], title: 'Space Dodge', description: 'Mueve la nave y esquiva asteroides.', buildHtml: buildSpaceDodgeHtml },
  { id: 'doom', aliases: ['shooter'], title: 'Mini Doom', description: 'Arena shooter táctil autocontenida.', buildHtml: buildDoomHtml },
  { id: 'gato', aliases: ['tictactoe', '3enraya'], title: 'Gato', description: 'Tres en raya contra una IA local.', buildHtml: buildGatoHtml },
  { id: 'damas', aliases: ['checkers'], title: 'Damas', description: 'Damas táctiles contra una IA local.', buildHtml: buildDamasHtml },
]

export function resolveGame(name: string) {
  const key = name.trim().toLowerCase()
  return games.find((game) => game.id === key || game.aliases.includes(key))
}

export function gamesMenu(prefix: string) {
  return [
    '*GAMESWHATS · JUEGOS HTML*',
    '',
    ...games.map((game) => `${prefix}${game.id} — ${game.description}`),
    '',
    'Estos juegos se renderizan dentro de un rich response compatible de WhatsApp.',
  ].join('\n')
}
