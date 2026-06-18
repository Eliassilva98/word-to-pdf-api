require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const convertRoutes = require('./routes/convert')

const app = express()

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://frontend-repo-black.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ]

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use('/', convertRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`)
})
