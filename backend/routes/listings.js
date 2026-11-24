// =====================================================================
// HOMIIWRK PUBLIC LISTINGS ROUTE
// Serves all persisted user-listed apartments & individual listing lookup
// =====================================================================
import express from 'express'
import { db } from '../db.js'

const router = express.Router()

/**
 * GET /api/listings
 * Returns all active user-listed apartments (newest first)
 */
router.get('/', async (req, res) => {
  try {
    const listings = await db.getAllUserListings()
    return res.json({
      success: true,
      count: listings.length,
      listings
    })
  } catch {
    return res.status(500).json({ error: 'Failed to load published listings.' })
  }
})

/**
 * GET /api/listings/:id
 * Returns a single user-listed apartment by id or public_id
 */
router.get('/:id', async (req, res) => {
  try {
    const listing = await db.getListingById(req.params.id)
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found.' })
    }
    return res.json({
      success: true,
      listing
    })
  } catch {
    return res.status(500).json({ error: 'Failed to retrieve listing details.' })
  }
})

export default router
