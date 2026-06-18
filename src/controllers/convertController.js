const fs = require('fs')
const path = require('path')
const libre = require('libreoffice-convert')
const util = require('util')
const prisma = require('../config/prisma.js')

if (process.env.SOFFICE_PATH) {
  process.env.LD_LIBRARY_PATH = process.env.LD_LIBRARY_PATH || ''
}

const convertAsync = util.promisify(libre.convert)

const convertFile = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'Nenhum arquivo enviado' })
    }

    const inputPath = req.file.path
    const originalName = req.file.originalname
    const pdfName = originalName.replace(/\.[^/.]+$/, '') + '.pdf'

    const outputDir = path.join(__dirname, '..', '..', 'uploads')
    const outputPath = path.join(outputDir, pdfName)

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const inputBuffer = fs.readFileSync(inputPath)
    const pdfBuffer = await convertAsync(inputBuffer, '.pdf', undefined)

    fs.writeFileSync(outputPath, pdfBuffer)

    const downloadUrl = `${req.protocol}://${req.get('host')}/uploads/${pdfName}`

    await prisma.conversion.create({
      data: {
        originalName,
        pdfName,
        downloadUrl
      }
    })

    console.log(`[SUCCESS] Arquivo convertido: ${originalName} -> ${pdfName}`)

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

module.exports = { convertFile, getHistory }
