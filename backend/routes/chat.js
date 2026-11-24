// =====================================================================
// CHAT API ROUTE (Server-Sent Events streaming + Persistent Per-User History)
// =====================================================================
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { streamLydiaResponse } from '../lydia/llm.js'
import { db } from '../db.js'

const router = express.Router()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CHATS_FILE = path.join(__dirname, '..', 'data', 'chats.json')

function ensureChatsFile() {
  try {
    const dir = path.dirname(CHATS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    if (!fs.existsSync(CHATS_FILE)) fs.writeFileSync(CHATS_FILE, '{}', 'utf-8')
  } catch (err) {
    console.error('Error initializing chats.json:', err.message)
  }
}

function readAllChats() {
  try {
    ensureChatsFile()
    const raw = fs.readFileSync(CHATS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function writeAllChats(chatsObj) {
  try {
    ensureChatsFile()
    fs.writeFileSync(CHATS_FILE, JSON.stringify(chatsObj, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Error saving chats.json:', err.message)
    return false
  }
}

ensureChatsFile()

// POST /api/chat - Process conversation and stream formal tokens
router.post('/', async (req, res) => {
  try {
    const { messages = [] } = req.body

    // Setup SSE Headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')

    // Stream callback
    await streamLydiaResponse(messages, ({ textChunk, cardPayload, done }) => {
      const payload = {
        chunk: textChunk || '',
        card: cardPayload || null,
        done: Boolean(done)
      }
      res.write(`data: ${JSON.stringify(payload)}\n\n`)
    })

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    console.error('Chat endpoint error:', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal concierge error' })
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message, done: true })}\n\n`)
      res.end()
    }
  }
})

// GET /api/chat/history?email=... - Restore logged-in user's previous Lydia chats
router.get('/history', (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase()
    if (!email) {
      return res.json({ success: true, messages: [] })
    }
    const allChats = readAllChats()
    const record = allChats[email]
    const messages = Array.isArray(record?.messages) ? record.messages : []
    return res.json({
      success: true,
      email,
      messages,
      updatedAt: record?.updatedAt || null
    })
  } catch {
    return res.status(500).json({ error: 'Failed to load chat history.' })
  }
})

// POST /api/chat/history - Persist logged-in user's Lydia messages + cards
router.post('/history', (req, res) => {
  try {
    const { email, messages } = req.body || {}
    const cleanEmail = String(email || '').trim().toLowerCase()
    if (!cleanEmail) {
      return res.status(400).json({ error: 'User email is required to save chat history.' })
    }
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' })
    }

    // Cap stored history to last 100 messages per user to keep payload snappy
    const trimmed = messages.slice(-100)
    const allChats = readAllChats()
    allChats[cleanEmail] = {
      email: cleanEmail,
      messages: trimmed,
      updatedAt: new Date().toISOString()
    }
    writeAllChats(allChats)

    return res.json({
      success: true,
      savedCount: trimmed.length,
      updatedAt: allChats[cleanEmail].updatedAt
    })
  } catch {
    return res.status(500).json({ error: 'Failed to save chat history.' })
  }
})

// DELETE /api/chat/history?email=... - Optional reset when user starts a New Chat
router.delete('/history', (req, res) => {
  try {
    const email = String(req.query.email || req.body?.email || '').trim().toLowerCase()
    if (!email) {
      return res.status(400).json({ error: 'User email is required.' })
    }
    const allChats = readAllChats()
    delete allChats[email]
    writeAllChats(allChats)
    return res.json({ success: true, cleared: true })
  } catch {
    return res.status(500).json({ error: 'Failed to clear chat history.' })
  }
})

// GET /api/chat/areas - Quick area listings for dropdowns
router.get('/areas', async (req, res) => {
  try {
    const areas = await db.getAreas()
    res.json({ success: true, data: areas })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
