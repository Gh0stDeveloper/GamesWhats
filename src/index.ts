import { Boom } from '@hapi/boom'
import { DisconnectReason, type WAMessage, type WASocket } from 'baileys'
import { config } from './config.js'
import { gamesMenu, resolveGame } from './games/index.js'
import { sendHtmlGame } from './html-transport.js'
import { logger } from './logger.js'
import { createSocket } from './session.js'

const processed = new Set<string>()

function rememberMessage(id?: string | null) {
  if (!id || processed.has(id)) return false
  processed.add(id)
  if (processed.size > 2000) {
    const first = processed.values().next().value as string | undefined
    if (first) processed.delete(first)
  }
  return true
}

function unwrapMessage(input: unknown): any {
  let message = input as any
  for (let i = 0; i < 4; i += 1) {
    if (message?.ephemeralMessage?.message) message = message.ephemeralMessage.message
    else if (message?.viewOnceMessage?.message) message = message.viewOnceMessage.message
    else if (message?.viewOnceMessageV2?.message) message = message.viewOnceMessageV2.message
    else if (message?.documentWithCaptionMessage?.message) message = message.documentWithCaptionMessage.message
    else break
  }
  return message
}

function messageText(message: WAMessage) {
  const content = unwrapMessage(message.message)
  return String(
    content?.conversation ??
    content?.extendedTextMessage?.text ??
    content?.imageMessage?.caption ??
    content?.videoMessage?.caption ??
    '',
  ).trim()
}

async function handleMessage(socket: WASocket, message: WAMessage) {
  const chatId = message.key.remoteJid
  if (!chatId || chatId === 'status@broadcast' || message.key.fromMe) return
  if (!rememberMessage(message.key.id)) return

  const text = messageText(message)
  if (!text.startsWith(config.prefix)) return

  const raw = text.slice(config.prefix.length).trim()
  if (!raw) return
  const [command = ''] = raw.split(/\s+/)
  const name = command.toLowerCase()

  if (['games', 'juegos', 'help', 'ayuda', 'menu', 'menú'].includes(name)) {
    await socket.sendMessage(chatId, { text: gamesMenu(config.prefix) })
    return
  }

  const game = resolveGame(name)
  if (!game) return

  try {
    await sendHtmlGame(socket, chatId, game.buildHtml(), `${game.title} · GamesWhats`)
  } catch (error) {
    logger.error({ err: error, chatId, game: game.id }, 'failed to relay HTML game')
    await socket.sendMessage(chatId, {
      text: `No se pudo mostrar ${game.title}. Este formato requiere un cliente de WhatsApp compatible con rich HTML responses.`,
    })
  }
}

async function connect(): Promise<void> {
  const { socket } = await createSocket()

  socket.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (const message of messages) {
      await handleMessage(socket, message).catch((error) => logger.error({ err: error }, 'message handler failed'))
    }
  })

  socket.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      logger.info({ jid: socket.user?.id, prefix: config.prefix }, 'GamesWhats connected')
      return
    }
    if (connection !== 'close') return

    const status = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode
    if (status === DisconnectReason.loggedOut) {
      logger.error({ status }, 'WhatsApp session logged out; run npm run pair again')
      return
    }
    logger.warn({ status }, 'connection closed; reconnecting')
    setTimeout(() => void connect().catch((error) => logger.error({ err: error }, 'reconnect failed')), 1500)
  })
}

connect().catch((error) => {
  logger.fatal({ err: error }, 'GamesWhats failed to start')
  process.exit(1)
})
