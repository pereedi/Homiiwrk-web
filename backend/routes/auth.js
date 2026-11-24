// =====================================================================
// HOMIIWRK AUTHENTICATION ROUTE
// Persistent User Registration, Sign-In, Email Verification & Security Alerts
// Backed by PostgreSQL / Supabase + Persistent JSON storage
// =====================================================================
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { supabase } from '../db.js'
import { sendLoginSecurityAlert, sendWelcomeRegistrationEmail } from '../mailer.js'

const router = express.Router()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json')

// Demo / Seed Accounts
const mockUsers = [
  {
    id: 'user-01',
    email: 'chisom.okonkwo@gmail.com',
    password: 'password123',
    name: 'Dr. Chisom Okonkwo',
    role: 'young_professional',
    phone: '+234 905 574 8233',
    title: 'Medical Resident & Young Professional',
    department: 'Internal Medicine / LASUTH',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedDate: 'Oct 2026',
    email_verified_at: '2026-10-15T12:00:00.000Z'
  },
  {
    id: 'user-02',
    email: 'babatunde.adeleke@yahoo.com',
    password: 'password123',
    name: 'Babatunde Adeleke',
    role: 'student',
    phone: '+234 905 574 8233',
    title: 'Dental Scholar & Analyst',
    department: 'Dentistry 500L',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDate: 'Nov 2026',
    email_verified_at: '2026-11-01T12:00:00.000Z'
  },
  {
    id: 'user-03',
    email: 'admin@apexprime.ng',
    password: 'password123',
    name: 'Apex Prime Realty',
    role: 'agent',
    phone: '+234 905 574 8233',
    title: 'Verified Property Manager',
    department: 'Ikeja Enclave Real Estate',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    joinedDate: 'Aug 2026',
    email_verified_at: '2026-08-20T12:00:00.000Z'
  }
]

// Ensure data folder and persistent users.json exist
function ensureUsersFile() {
  try {
    const dir = path.dirname(USERS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(mockUsers, null, 2), 'utf-8')
    }
  } catch (err) {
    console.error('Error initializing users.json:', err.message)
  }
}

ensureUsersFile()

// Load persistent users from disk
function getPersistentUsers() {
  try {
    ensureUsersFile()
    const content = fs.readFileSync(USERS_FILE, 'utf-8')
    const list = JSON.parse(content)
    return Array.isArray(list) ? list : [...mockUsers]
  } catch {
    return [...mockUsers]
  }
}

// Save user to persistent disk storage
function savePersistentUser(newUser) {
  try {
    const users = getPersistentUsers()
    const index = users.findIndex((u) => u.email.toLowerCase() === newUser.email.toLowerCase())
    if (index >= 0) {
      users[index] = { ...users[index], ...newUser }
    } else {
      users.push(newUser)
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Error saving user to users.json:', err.message)
    return false
  }
}

// Mark user email as verified
async function markEmailVerified(email, token) {
  try {
    const users = getPersistentUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return false
    }
    user.email_verified_at = new Date().toISOString()
    user.verification_token = null
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')

    // Also update Supabase if connected
    if (supabase) {
      try {
        await supabase.from('users').update({ email_verified_at: user.email_verified_at }).eq('email', email)
      } catch {
        // Silently continue
      }
    }
    return true
  } catch (err) {
    console.error('markEmailVerified error:', err)
    return false
  }
}

// Helper to look up user in persistent storage, Supabase, or demo accounts
async function findUser(cleanEmail) {
  // 1. Check local persistent store
  const localUsers = getPersistentUsers()
  const localMatch = localUsers.find((u) => u.email.toLowerCase() === cleanEmail)
  if (localMatch) return localMatch

  // 2. Check Supabase users table
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('email', cleanEmail).limit(1)
      if (!error && Array.isArray(data) && data.length > 0) {
        const row = data[0]
        const userObj = {
          id: `sb-${row.id}`,
          email: row.email,
          password: row.password_hash || 'password123',
          name: row.full_name || 'Homiiwrk Member',
          role: row.role || 'student',
          phone: row.phone || '+234 905 574 8233',
          title: row.role === 'agent' ? 'Verified Property Manager' : 'Student & Young Professional',
          joinedDate: 'Nov 2026',
          email_verified_at: row.email_verified_at
        }
        // Cache in local persistent file for offline resilience
        savePersistentUser(userObj)
        return userObj
      }
    } catch {
      // Fallback
    }
  }

  // 3. Fallback to mock accounts
  return mockUsers.find((u) => u.email.toLowerCase() === cleanEmail) || null
}

/**
 * POST /api/auth/login
 * Strict authentication: Rejects un-registered users and mismatched passwords
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' })
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const user = await findUser(cleanEmail)

    // Strict Security: DO NOT log in if user has not registered
    if (!user) {
      return res.status(401).json({
        error: 'No account found with this email. Please create an account first.'
      })
    }

    // Strict Security: Verify password credentials
    if (user.password !== password) {
      return res.status(401).json({
        error: 'Incorrect password. Please verify your credentials or reset your password.'
      })
    }

    const token = `hw-token-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`

    // Extract client metadata for security email
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
    const userAgent = req.headers['user-agent'] || 'Web Browser'

    // Dispatch Login Security Email (includes emergency Homiiwrk Support report button)
    sendLoginSecurityAlert({
      to: user.email,
      userName: user.name,
      ipAddress: String(ipAddress).split(',')[0].trim(),
      userAgent: userAgent.slice(0, 80),
      time: new Date().toUTCString()
    }).catch(() => {})

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        title: user.title,
        avatar: user.avatar,
        joinedDate: user.joinedDate,
        email_verified_at: user.email_verified_at
      }
    })
  } catch (err) {
    return res.status(500).json({ error: 'Authentication failed. Please try again.' })
  }
})

/**
 * POST /api/auth/register
 * Validates credentials, saves new account persistently, and dispatches welcome verification & security emails
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'student', phone = '' } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Full name, email address, and password are required.' })
    }

    const cleanEmail = String(email).trim().toLowerCase()

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' })
    }

    // Password strength check (min 6 characters)
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters in length.' })
    }

    const existing = await findUser(cleanEmail)
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please sign in instead.' })
    }

    const verificationToken = `hw-vtok-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000'
    const verificationUrl = `${clientOrigin}/#verify-email?token=${verificationToken}&email=${encodeURIComponent(cleanEmail)}`

    const newUser = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      password,
      name: name.trim(),
      role: role === 'agent' ? 'agent' : (role === 'young_professional' ? 'young_professional' : 'student'),
      phone: phone.trim() || '+234 905 574 8233',
      title: role === 'agent' ? 'Verified Property Manager' : (role === 'young_professional' ? 'Young Professional' : 'Student Scholar'),
      joinedDate: 'Nov 2026',
      verification_token: verificationToken,
      email_verified_at: null
    }

    // 1. Save to persistent disk database
    savePersistentUser(newUser)

    // 2. Save to Supabase users table if connected
    if (supabase) {
      try {
        await supabase.from('users').insert({
          email: cleanEmail,
          full_name: newUser.name,
          phone: newUser.phone,
          whatsapp_number: newUser.phone.replace(/\D/g, ''),
          role: newUser.role,
          password_hash: password,
          status: 'active'
        })
      } catch {
        // Continue with local persistent store
      }
    }

    const token = `hw-token-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
    const userAgent = req.headers['user-agent'] || 'Web Browser'

    // Dispatch Welcome Registration Email with "Proceed to Verify Email" button
    sendWelcomeRegistrationEmail({
      to: newUser.email,
      userName: newUser.name,
      role: newUser.role,
      phone: newUser.phone,
      verificationUrl
    }).catch(() => {})

    // Also dispatch Login Security Notice
    sendLoginSecurityAlert({
      to: newUser.email,
      userName: newUser.name,
      ipAddress: String(ipAddress).split(',')[0].trim(),
      userAgent: userAgent.slice(0, 80),
      time: new Date().toUTCString()
    }).catch(() => {})

    return res.status(201).json({
      success: true,
      token,
      verificationUrl,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone,
        title: newUser.title,
        joinedDate: newUser.joinedDate,
        email_verified_at: newUser.email_verified_at
      }
    })
  } catch (err) {
    return res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

/**
 * GET /api/auth/verify
 * Verifies email address and sets email_verified_at
 */
router.get('/verify', async (req, res) => {
  try {
    const { email, token } = req.query

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required.' })
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const verified = await markEmailVerified(cleanEmail, token)

    if (verified) {
      return res.json({
        success: true,
        message: 'Email successfully verified! Your Homiiwrk account is fully activated.'
      })
    }

    return res.status(400).json({ error: 'Unable to verify email. Please check your verification link.' })
  } catch {
    return res.status(500).json({ error: 'Email verification error. Please try again.' })
  }
})

/**
 * GET /api/auth/me
 */
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized session.' })
  }
  const users = getPersistentUsers()
  const user = users[0] || mockUsers[0]
  return res.json({ user })
})

export default router
export { getPersistentUsers, savePersistentUser }
