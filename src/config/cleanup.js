const fs = require('fs')
const path = require('path')

const uploadDir = path.join(__dirname, '..', '..', 'uploads')

const TTL_MINUTES = Number(process.env.FILE_TTL_MINUTES) || 60
const INTERVAL_MS = 10 * 60 * 1000

const removeExpiredFiles = async () => {
  const limit = Date.now() - TTL_MINUTES * 60 * 1000

  let entries
  try {
    entries = await fs.promises.readdir(uploadDir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    if (!entry.isFile() || entry.name === '.gitkeep') continue

    const filePath = path.join(uploadDir, entry.name)
    try {
      const { mtimeMs } = await fs.promises.stat(filePath)
      if (mtimeMs < limit) {
        await fs.promises.unlink(filePath)
        console.log(`[CLEANUP] Arquivo expirado removido: ${entry.name}`)
      }
    } catch (error) {
      console.error(`[CLEANUP] Falha ao remover ${entry.name}:`, error.message)
    }
  }
}

const startCleanup = () => {
  removeExpiredFiles()
  setInterval(removeExpiredFiles, INTERVAL_MS).unref()
  console.log(`[CLEANUP] Arquivos são apagados após ${TTL_MINUTES} minuto(s)`)
}

module.exports = { startCleanup }
