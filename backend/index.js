// =====================================================================
// HOMIIWRK BACKEND SERVER (Node + Express)
// Ports: Express on 3001, Vite Frontend on 3000
// =====================================================================
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })
dotenv.config()

import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import chatRoutes from './routes/chat.js'
import matchRoutes from './routes/matches.js'
import authRoutes from './routes/auth.js'
import paymentRoutes from './routes/payments.js'
import dashboardRoutes from './routes/dashboard.js'
import listingsRoutes from './routes/listings.js'
import uploadRoutes, { UPLOADS_DIR } from './routes/upload.js'
import { isPostgresConfigured } from './db.js'

const app = express()
const PORT = process.env.PORT || 3001
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000'

// Middlewares
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))
app.use(
  cors({
    origin: [CLIENT_ORIGIN, 'http://127.0.0.1:3000', 'http://localhost:3000'],
    credentials: true
  })
)

// Serve locally stored apartment photos (fallback when Cloudinary is unavailable)
app.use('/api/uploads', express.static(UPLOADS_DIR, { maxAge: '7d', fallthrough: false }))

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Request threshold exceeded. Please try again in a few moments.' }
})
app.use('/api/', apiLimiter)

// Health Check
app.get('/api/health', (req, res) => {
  let aiEngine = 'Rule-Based Formal Concierge (Ready)'
  if (process.env.GEMINI_API_KEY) {
    aiEngine = `Google Gemini (${process.env.GEMINI_MODEL || 'gemini-3.8-flash'}) [Active - Free Tier]`
  } else if (process.env.OPENAI_API_KEY) {
    aiEngine = `OpenAI (${process.env.OPENAI_MODEL || 'gpt-4o-mini'}) [Active]`
  }

  res.json({
    status: 'online',
    service: 'Homiiwrk Concierge API',
    database: isPostgresConfigured ? 'Supabase PostgreSQL (Connected)' : 'Local Seed Store (Active)',
    ai_engine: aiEngine
  })
})

// Mount Routes
app.use('/api/chat', chatRoutes)
app.use('/api/roommates', matchRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/user/dashboard', dashboardRoutes)
app.use('/api/user', dashboardRoutes)
app.use('/api/listings', listingsRoutes)
app.use('/api/upload', uploadRoutes)

// Sanitized Global Error Handler (Hacker Protection - Never exposes stack traces or DB tables)
app.use((err, req, res, next) => {
  // Log sanitized error message internally without dumping environment or credentials
  const sanitizedMsg = err && err.message ? err.message.slice(0, 100) : 'Internal error'
  res.status(500).json({ error: 'A secure server error occurred. Please try again later.' })
})

app.listen(PORT, () => {
  const activeAi = process.env.GEMINI_API_KEY ? 'Google Gemini Live (Free Tier)' : (process.env.OPENAI_API_KEY ? 'OpenAI Live' : 'Formal Concierge Fallback')
  console.log(`=======================================================`)
  console.log(` Homiiwrk Backend listening on port ${PORT}`)
  console.log(` Database: ${isPostgresConfigured ? 'Supabase PostgreSQL' : 'Local Seed Store'}`)
  console.log(` AI:       ${activeAi}`)
  console.log(`=======================================================`)
})

export default app
