import path from 'node:path'
import dotenv from 'dotenv'

dotenv.config()

const prefix = (process.env.PREFIX?.trim() || '.').slice(0, 3)

export const config = {
  prefix,
  sessionDir: path.resolve(process.env.SESSION_DIR?.trim() || './data/session'),
  logLevel: process.env.LOG_LEVEL?.trim() || 'info',
  richBotJid: process.env.RICH_BOT_JID?.trim() || '867051314767696@bot',
}
