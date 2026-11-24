// =====================================================================
// HOMIIWRK GLOBAL AUTHENTICATION CONTEXT
// Session persistence, reactive state, and login security dispatch
// =====================================================================
import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const DEMO_PROFILES = {
  chisom: {
    id: 'user-01',
    email: 'chisom.okonkwo@gmail.com',
    name: 'Dr. Chisom Okonkwo',
    role: 'young_professional',
    phone: '+234 905 574 8233',
    title: 'Medical Resident & Young Professional',
    department: 'Internal Medicine / LASUTH',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedDate: 'Oct 2026'
  },
  babatunde: {
    id: 'user-02',
    email: 'babatunde.adeleke@yahoo.com',
    name: 'Babatunde Adeleke',
    role: 'student',
    phone: '+234 905 574 8233',
    title: 'Dental Scholar & Analyst',
    department: 'Dentistry 500L',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDate: 'Nov 2026'
  },
  apex: {
    id: 'user-03',
    email: 'admin@apexprime.ng',
    name: 'Apex Prime Realty',
    role: 'agent',
    phone: '+234 905 574 8233',
    title: 'Verified Property Manager',
    department: 'Ikeja Enclave Real Estate',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    joinedDate: 'Aug 2026'
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('homiiwrk_user')
      return saved ? JSON.parse(saved) : DEMO_PROFILES.chisom // Default to active verified user
    } catch {
      return DEMO_PROFILES.chisom
    }
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('homiiwrk_token') || 'hw-token-demo'
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('homiiwrk_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('homiiwrk_user')
    }
  }, [user])

  useEffect(() => {
    if (token) {
      localStorage.setItem('homiiwrk_token', token)
    } else {
      localStorage.removeItem('homiiwrk_token')
    }
  }, [token])

  /**
   * Log In via API
   * Strictly enforces authentication; throws when user is not registered or password fails
   */
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.')
      }

      setUser(data.user)
      setToken(data.token)
      return { success: true, user: data.user }
    } catch (err) {
      // If error is from server rejection (e.g. 401 Not found or Wrong password), bubble up immediately
      if (err.message && !err.message.toLowerCase().includes('fetch')) {
        throw err
      }

      // Offline fallback: ONLY allow exact demo profiles if password matches
      const cleanEmail = email.toLowerCase().trim()
      const match = Object.values(DEMO_PROFILES).find((p) => p.email.toLowerCase() === cleanEmail)
      if (match) {
        if (password !== 'password123') {
          throw new Error('Incorrect password. Please verify your credentials.')
        }
        setUser(match)
        setToken(`hw-token-${Date.now()}`)
        return { success: true, user: match }
      }

      // NEVER auto-create users on login
      throw new Error(err.message || 'No account found with this email. Please sign up first.')
    }
  }

  /**
   * Register via API
   */
  const register = async ({ email, password, name, role = 'student', phone = '' }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, phone })
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. Please check your credentials.')
      }

      setUser(data.user)
      setToken(data.token)
      return {
        success: true,
        user: data.user,
        verificationUrl: data.verificationUrl
      }
    } catch (err) {
      throw err
    }
  }

  /**
   * Verify Email
   */
  const verifyEmail = async (token, email) => {
    const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token || '')}&email=${encodeURIComponent(email || '')}`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'Email verification failed')
    }
    if (user) {
      setUser((prev) => (prev ? { ...prev, email_verified_at: new Date().toISOString() } : null))
    }
    return { success: true, message: data.message }
  }

  /**
   * Quick 1-click Demo profile switcher
   */
  const selectDemoProfile = (profileKey) => {
    const profile = DEMO_PROFILES[profileKey] || DEMO_PROFILES.chisom
    setUser(profile)
    setToken(`hw-token-demo-${profileKey}`)
  }

  /**
   * Sign Out
   */
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('homiiwrk_user')
    localStorage.removeItem('homiiwrk_token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: Boolean(user),
        login,
        register,
        verifyEmail,
        logout,
        selectDemoProfile,
        demoProfiles: DEMO_PROFILES
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
