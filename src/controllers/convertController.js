const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const libre = require('libreoffice-convert')
const util = require('util')
const prisma = require('../config/prisma.js')

if (process.env.SOFFICE_PATH) {
  process.env.LD_LIBRARY_PATH = process.env.LD_LIBRARY_PATH || ''
}

const convertAsync = util.promisify(libre.convert)

const uploadDir = path.join(__dirname, '..', '..', 'uploads')
const STORED_PDF_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/i

const removeFile = (filePath) =>
  fs.promises.unlink(filePath).catch(() => {})

const convertFile = async (req, res) => {
  let outputPath
  let saved = false

  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'Nenhum arquivo enviado' })
    }

    const inputPath = req.file.path
    const originalName = req.file.originalname
    const pdfName = originalName.replace(/\.[^/.]+$/, '') + '.pdf'

    // Nome interno aleatório: impossível de adivinhar e sem colisão entre usuários
    const storedName = `${crypto.randomUUID()}.pdf`
    outputPath = path.join(uploadDir, storedName)

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const inputBuffer = fs.readFileSync(inputPath)
    const pdfBuffer = await convertAsync(inputBuffer, '.pdf', undefined)

    fs.writeFileSync(outputPath, pdfBuffer)

    const downloadUrl = `${req.protocol}://${req.get('host')}/uploads/${storedName}`

    await prisma.conversion.create({
      data: {
        originalName,
        pdfName,
        downloadUrl
      }
    })
    saved = true

    console.log(`[SUCCESS] Arquivo convertido: ${originalName} -> ${storedName}`)

    return res.json({
      success: true,
      originalName,
      pdfName,
      downloadUrl
    })
  } catch (error) {
    console.error('[ERROR] Erro na conversão:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Erro na conversão',
      error: error.message
    })
  } finally {
    // O .docx original nunca fica guardado no servidor
    if (req.file) await removeFile(req.file.path)
    // Se algo falhou depois de gerar o PDF, não deixa PDF órfão
    if (outputPath && !saved) await removeFile(outputPath)
  }
}

const downloadFile = async (req, res) => {
  const { file } = req.params

  if (!STORED_PDF_PATTERN.test(file)) {
    return res.status(404).json({ success: false, message: 'Arquivo não encontrado' })
  }

  const filePath = path.join(uploadDir, file)

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'Arquivo expirado ou não encontrado'
    })
  }

  try {
    const conversion = await prisma.conversion.findFirst({
      where: { downloadUrl: { endsWith: `/uploads/${file}` } }
    })
    const downloadName = conversion?.pdfName || 'documento.pdf'

    res.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(downloadName)}`
    )
    res.setHeader('Cache-Control', 'private, no-store')
    return res.type('application/pdf').sendFile(filePath)
  } catch (error) {
    console.error('[ERROR] Erro no download:', error.message)
    return res.status(500).json({ success: false, message: 'Erro no download' })
  }
}

const getHistory = async (req, res) => {
  try {
    const conversions = await prisma.conversion.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return res.json({ success: true, conversions })
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico',
      error: error.message
    })
  }
}

module.exports = { convertFile, downloadFile, getHistory }
