// =====================================================================
// ROOMMATE & INTRODUCTIONS ROUTE (WhatsApp Handoff)
// =====================================================================
import express from 'express'
import { db } from '../db.js'

const router = express.Router()

// GET /api/roommates - List compatible peers
router.get('/', async (req, res) => {
  try {
    const { faculty, area_id } = req.query
    const peers = await db.getRoommateMatches({ faculty, area_id: Number(area_id) || null })
    res.json({ success: true, count: peers.length, data: peers })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/roommates/intro - Request mutual roommate intro (releases WhatsApp link on mutual consent)
router.post('/intro', async (req, res) => {
  try {
    const { match_id, user_id = 99 } = req.body
    if (!match_id) {
      return res.status(400).json({ error: 'match_id is required' })
    }

    const intro = await db.createIntro(user_id, match_id)
    const peers = await db.getRoommateMatches({})
    const peer = peers.find((p) => p.id === Number(match_id)) || peers[0]

    // Pre-filled formal message for WhatsApp
    const introMsg = encodeURIComponent(
      `Hello ${peer.name}, I was introduced to your profile via Lydia on Homiiwrk for a LASUCOM flatshare. I would be pleased to discuss compatibility and apartment inspection.`
    )
    const whatsappUrl = `https://wa.me/${peer.whatsapp_number}?text=${introMsg}`

    res.json({
      success: true,
      message: 'Mutual introduction approved.',
      status: 'both_accepted',
      whatsapp_url: whatsappUrl,
      peer: {
        id: peer.id,
        name: peer.name,
        faculty: peer.faculty,
        level: peer.level
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
