import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { Boom } from '@hapi/boom'
import { DisconnectReason } from 'baileys'
import qrcode from 'qrcode-terminal'
import { createSocket } from './session.js'

const cleanPhone = (value: string) => value.replace(/\D/g, '')
type PairingMethod = 'qr' | 'code'

function normalizeMethod(value: string): PairingMethod | undefined {
  const normalized = value.trim().toLowerCase()
  if (['qr', 'qrcode'].includes(normalized)) return 'qr'
  if (['code', 'codigo', 'código', 'phone'].includes(normalized)) return 'code'
  return undefined
}

function disconnectStatus(error: unknown) {
  return (error as Boom | undefined)?.output?.statusCode
}

async function main() {
  const rl = readline.createInterface({ input, output })
  const envPhone = process.env.PAIRING_NUMBER ?? ''
  const envMethod = normalizeMethod(process.env.PAIRING_METHOD ?? '')
  const method = envMethod ?? (envPhone ? 'code' : normalizeMethod(await rl.question('Método de vinculación [QR/código] (QR recomendado): ')) ?? 'qr')
  let phone = ''

  if (method === 'code') {
    phone = cleanPhone(envPhone || await rl.question('Número internacional, por ejemplo 525512345678: '))
    if (phone.length < 8 || phone.length > 15) throw new Error('Número internacional inválido.')
  }
  rl.close()

  let finished = false
  let pairingCodeRequested = false
  let lastQr = ''
  let reconnects = 0
  const timeout = setTimeout(() => {
    if (!finished) {
      console.error('Tiempo agotado. Ejecuta de nuevo npm run pair.')
      process.exit(1)
    }
  }, 300_000)

  const finish = (code: number, text: string) => {
    if (finished) return
    finished = true
    clearTimeout(timeout)
    console.log(text)
    setTimeout(() => process.exit(code), 300)
  }

  const connect = async (): Promise<void> => {
    const { socket } = await createSocket()
    if (socket.authState.creds.registered && reconnects === 0) {
      finish(0, 'La sesión ya está vinculada.')
      return
    }

    socket.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      if (finished) return
      if (qr && method === 'qr' && qr !== lastQr && !socket.authState.creds.registered) {
        lastQr = qr
        console.log('\nEscanea este QR desde WhatsApp > Dispositivos vinculados:\n')
        qrcode.generate(qr, { small: true })
      }
      if (qr && method === 'code' && !pairingCodeRequested && !socket.authState.creds.registered) {
        pairingCodeRequested = true
        const code = await socket.requestPairingCode(phone)
        console.log(`\nCódigo de vinculación: ${code.match(/.{1,4}/g)?.join('-') ?? code}\n`)
      }
      if (connection === 'open') {
        finish(0, 'GamesWhats quedó vinculado correctamente.')
        return
      }
      if (connection === 'close') {
        const status = disconnectStatus(lastDisconnect?.error)
        if (status === DisconnectReason.loggedOut) {
          finish(1, 'WhatsApp cerró la sesión. Borra data/session y vuelve a vincular.')
          return
        }
        reconnects += 1
        if (reconnects > 5) {
          finish(1, 'No fue posible completar la vinculación después de varios reintentos.')
          return
        }
        setTimeout(() => void connect(), 1200)
      }
    })
  }

  await connect()
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
