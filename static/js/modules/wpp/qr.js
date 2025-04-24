import { getQrCode } from './sessions.js'

export async function watchQr(sessionId, containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  const interval = setInterval(async () => {
    try {
      const qr = await getQrCode(sessionId)
      if (qr) {
        container.src = qr
      }
    } catch (e) {
      clearInterval(interval)
    }
  }, 3000)
}