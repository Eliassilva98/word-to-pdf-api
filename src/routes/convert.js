const express = require('express')
const router = express.Router()
const upload = require('../config/upload.js')
const {
  convertFile,
  downloadFile,
  getHistory
} = require('../controllers/convertController.js')

router.options('/api/convert', (req, res) => {
  res.sendStatus(200)
})

router.post('/api/convert', upload.single('file'), convertFile)
router.get('/api/history', getHistory)
router.get('/uploads/:file', downloadFile)

module.exports = router

