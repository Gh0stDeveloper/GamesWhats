import { randomBytes } from 'node:crypto'
import { generateWAMessageFromContent, type WASocket } from 'baileys'
import { config } from './config.js'
import { logger } from './logger.js'

/**
 * Transporta un mini juego HTML dentro del sobre richResponse que los clientes
 * compatibles de WhatsApp reconocen como una vista HTML GenAI embebida.
 *
 * No se adjunta un archivo .html y no se abre un navegador externo. El HTML viaja
 * serializado dentro de unifiedResponse.data como un GenAIaeacdsnwHtmlPrimitive.
 *
 * Este formato es interno/no documentado por WhatsApp y puede cambiar entre versiones.
 */
export async function sendHtmlGame(socket: WASocket, chatId: string, html: string, title: string) {
  const userJid = socket.user?.id
  if (!userJid) throw new Error('La sesión de WhatsApp todavía no está autenticada.')

  const responseId = `game-${Date.now()}-${randomBytes(4).toString('hex')}`
  const payload = {
    response_id: responseId,
    sections: [
      {
        view_model: {
          primitive: {
            __typename: 'GenAIaeacdsnwHtmlPrimitive',
            payload: html,
            trusted_sources: [] as string[],
          },
          __typename: 'GenAISingleLayoutViewModel',
        },
      },
    ],
  }

  const messageContent: Record<string, unknown> = {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      messageSecret: randomBytes(32).toString('base64'),
      botMetadata: {
        messageDisclaimerText: '',
        botResponseId: responseId,
      },
    },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          submessages: [
            { messageType: 2, messageText: title },
          ],
          unifiedResponse: {
            data: Buffer.from(JSON.stringify(payload), 'utf8').toString('base64'),
          },
          contextInfo: {
            mentionedJid: [] as string[],
            groupMentions: [] as unknown[],
            statusAttributions: [] as unknown[],
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: { botJid: config.richBotJid },
            forwardOrigin: 4,
          },
        },
      },
    },
  }

  const message = generateWAMessageFromContent(chatId, messageContent as never, { userJid })
  await socket.relayMessage(chatId, message.message!, {})
  logger.info({ chatId, messageId: message.key.id, title, responseId }, 'HTML game relayed')
  return message
}
