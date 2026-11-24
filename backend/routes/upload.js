// =====================================================================
// HOMIIWRK IMAGE UPLOAD SERVICE
// Primary: Cloudinary CDN. Fallback: local disk storage (never fails the user).
// =====================================================================
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'

const router = express.Router()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

export const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')
const APARTMENTS_DIR = path.join(UPLOADS_DIR, 'apartments')

function getCloudinaryConfig() {
  const cloud_name = (process.env.CLOUDINARY_CLOUD_NAME || '').trim()
  const api_key = (process.env.CLOUDINARY_API_KEY || '').trim()
  const api_secret = (process.env.CLOUDINARY_API_SECRET || '').trim()
  const folder = (process.env.CLOUDINARY_FOLDER || 'homiiwrk/apartments').trim()
  const configured = Boolean(cloud_name && api_key && api_secret)
  if (configured) {
    cloudinary.config({ cloud_name, api_key, api_secret, secure: true })
  }
  return { configured, folder }
}

const ALLOWED_MIME = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif'
}
const MAX_BYTES = 10 * 1024 * 1024 // 10MB per image

/**
 * Save a base64 data URI to local disk and return its public URL
 */
function saveToDisk(dataUri) {
  const match = /^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/.exec(dataUri)
  if (!match) throw new Error('Unsupported image format.')

  const mime = match[1].toLowerCase()
  const ext = ALLOWED_MIME[mime]
  if (!ext) throw new Error('Only JPG, PNG, WebP, GIF or AVIF images are allowed.')

  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length > MAX_BYTES) throw new Error('Image is too large (max 10MB).')

  if (!fs.existsSync(APARTMENTS_DIR)) fs.mkdirSync(APARTMENTS_DIR, { recursive: true })

  const fileName = `apt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
  fs.writeFileSync(path.join(APARTMENTS_DIR, fileName), buffer)

  return { url: `/api/uploads/apartments/${fileName}`, public_id: `local/${fileName}` }
}

/**
 * POST /api/upload
 */
router.post('/', async (req, res) => {
  const { image } = req.body || {}

  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'No image data provided for upload.' })
  }

  // 1. Try Cloudinary first
  const { configured, folder } = getCloudinaryConfig()
  if (configured) {
    try {
      const result = await cloudinary.uploader.upload(image, {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }, { width: 1600, crop: 'limit' }]
      })
      return res.json({ success: true, url: result.secure_url, public_id: result.public_id, storage: 'cdn' })
    } catch (err) {
      // Log internally only, then fall through to local storage
      console.error('[Upload] Cloudinary unavailable, using local storage:', err.message)
    }
  }

  // 2. Fallback: local disk storage
  try {
    const saved = saveToDisk(image)
    return res.json({ success: true, url: saved.url, public_id: saved.public_id, storage: 'local' })
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Image upload failed.' })
  }
})

export default router
