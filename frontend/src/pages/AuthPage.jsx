// =====================================================================
// HOMIIWRK DEDICATED AUTHENTICATION PAGE (#auth, #login, #signup)
// Full dedicated page for Sign In & Sign Up (No Modals)
// =====================================================================
import React, { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function AuthPage({ initialMode = 'login', onNavigate }) {
  const { login, register, verifyEmail, selectDemoProfile } = useAuth()
  const [mode, setMode] = useState(initialMode === 'signup' ? 'signup' : 'login')

  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('young_professional') // 'student' | 'young_professional' | 'agent'
  const [phone, setPhone] = useState('')

  // UI States
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [verificationLink, setVerificationLink] = useState('')

  const logoUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuqkJkIRysqGPIvqI5CDOg5Z3pRzRwVaflQApCS4ecKLNdH4x-4p3TPukNnLNmA0Xe18IVosU_9ldaY_-uIpgpYc1PM6-514PM0M-vuGs7_Jpa5DjbyS3RDuIiOTUBRrIAp20MO9hdzaMU33vefma4rcxIxY0mkjyWYpQ-z9Gy4qAfXHTgN2Q_L1zLZbFxxl_aGqxa9sHjT4aO0DdnJRtsGbmE7n6wq262rv63deQOOMRy4hk1sTU__Xhnb7iDDmvPLQ'

  // Detect #verify-email hash
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('verify-email')) {
      const queryStr = hash.includes('?') ? hash.split('?')[1] : ''
      const urlParams = new URLSearchParams(queryStr)
      const token = urlParams.get('token') || ''
      const emailParam = urlParams.get('email') || ''
      if (emailParam) {
        verifyEmail(token, emailParam)
          .then((res) => {
            setSuccessMsg(res.message || '✓ Email successfully verified! You can now sign in.')
            setMode('login')
          })
          .catch((err) => {
            setErrorMsg(err.message || 'Email verification failed. Please try again.')
          })
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setVerificationLink('')
    setIsLoading(true)

    try {
      if (mode === 'login') {
        const res = await login(email, password)
        if (res.success) {
          setSuccessMsg('Signed in successfully! Redirecting to your dashboard...')
          setTimeout(() => {
            onNavigate?.('dashboard')
          }, 600)
        }
      } else {
        const res = await register({ email, password, name, role, phone })
        if (res.success) {
          setSuccessMsg('Account created successfully! Welcome to Homiiwrk.')
          if (res.verificationUrl) {
            setVerificationLink(res.verificationUrl)
          }
          setTimeout(() => {
            onNavigate?.('dashboard')
          }, 1500)
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error. Please check your details.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickDemo = (profileKey) => {
    selectDemoProfile(profileKey)
    setSuccessMsg('Demo profile loaded! Redirecting to dashboard...')
    setTimeout(() => {
      onNavigate?.('dashboard')
    }, 400)
  }

  return (
    <div className="auth-page-container">
      {/* Top Navigation Bar */}
      <div className="auth-top-nav container">
        <button
          type="button"
          className="auth-btn-back"
          onClick={() => onNavigate?.('home')}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Homiiwrk Directory</span>
        </button>

        <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate?.('home') }} className="auth-nav-logo">
          <img src={logoUrl} alt="Homiiwrk" />
        </a>
      </div>

      <div className="auth-main-layout container">
        {/* Left Side: Brand Story & Trust Value */}
        <div className="auth-brand-column">
          <div className="auth-brand-badge">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Verified Housing &amp; Flatshare Platform</span>
          </div>

          <h1 className="auth-brand-heading">
            Live Better.<br />Study &amp; Work in Comfort.
          </h1>

          <p className="auth-brand-sub">
            Built for students and young professionals across Ikeja and greater Lagos. Rent vetted apartments, find compatible flatmates, and protect your tenancy with escrow.
          </p>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <span className="material-symbols-outlined">security</span>
              </div>
              <div>
                <strong>Annual Rent Escrow Protection</strong>
                <p>Funds are secured in escrow and only released after physical inspection and official key handover.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <span className="material-symbols-outlined">handshake</span>
              </div>
              <div>
                <strong>₦5,000 WhatsApp Agency Pairing</strong>
                <p>Direct WhatsApp contact with vetted flatmates and agents for seamless inspection scheduling.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <div>
                <strong>Intelligent Peer Matching</strong>
                <p>Paired by work/study hours, quiet times, and cleanliness preferences to ensure peaceful co-living.</p>
              </div>
            </div>
          </div>

          <div className="auth-quote-card">
            <p className="auth-quote-text">
              "Found an en-suite apartment in GRA Ikeja within 48 hours. The escrow protection and direct WhatsApp connection gave me 100% peace of mind."
            </p>
            <div className="auth-quote-author">
              <strong>— Dr. Chisom Okonkwo</strong>, Medical Resident &amp; Verified Homiiwrk Member
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="auth-form-column">
          <div className="auth-card">
            {/* Tab Controls */}
            <div className="auth-tab-row">
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg('') }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg('') }}
              >
                Create Account
              </button>
            </div>

            {/* Notifications */}
            {errorMsg && (
              <div className="auth-alert error">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="auth-alert success" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>{successMsg}</span>
                </div>
                {verificationLink && (
                  <div style={{ marginTop: '0.35rem' }}>
                    <a
                      href={verificationLink}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: '#059669',
                        color: '#ffffff',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                    >
                      <span>Proceed to Verify Email →</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === 'signup' && (
                <>
                  <div className="auth-form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Babatunde Adeleke"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="auth-form-group">
                    <label>I Am Joining As *</label>
                    <div className="auth-role-selector">
                      <label className={`role-pill ${role === 'young_professional' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="role"
                          value="young_professional"
                          checked={role === 'young_professional'}
                          onChange={() => setRole('young_professional')}
                        />
                        <span>👔 Young Professional</span>
                      </label>
                      <label className={`role-pill ${role === 'student' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="role"
                          value="student"
                          checked={role === 'student'}
                          onChange={() => setRole('student')}
                        />
                        <span>🎓 Student Scholar</span>
                      </label>
                      <label className={`role-pill ${role === 'agent' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="role"
                          value="agent"
                          checked={role === 'agent'}
                          onChange={() => setRole('agent')}
                        />
                        <span>🏢 Agent / Lister</span>
                      </label>
                    </div>
                  </div>

                  <div className="auth-form-group">
                    <label>Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      className="auth-input"
                      placeholder="e.g. 0905 574 8233"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="auth-form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="e.g. chisom.okonkwo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label>Password *</label>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-auth-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : mode === 'login' ? (
                  <span>Sign In to Homiiwrk</span>
                ) : (
                  <span>Create My Verified Account</span>
                )}
              </button>
            </form>

            {/* 1-Click Demo Testing Area */}
            <div className="auth-demo-section">
              <div className="demo-divider">
                <span>OR SIGN IN WITH 1-CLICK DEMO PROFILE</span>
              </div>

              <div className="demo-profiles-grid">
                <button
                  type="button"
                  className="btn-demo-pill"
                  onClick={() => handleQuickDemo('chisom')}
                >
                  <span className="demo-avatar">🩺</span>
                  <div className="demo-info">
                    <strong>Dr. Chisom Okonkwo</strong>
                    <small>Young Professional (Medical Resident)</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="btn-demo-pill"
                  onClick={() => handleQuickDemo('babatunde')}
                >
                  <span className="demo-avatar">🎓</span>
                  <div className="demo-info">
                    <strong>Babatunde Adeleke</strong>
                    <small>Student Scholar (Dentistry &amp; Finance)</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="btn-demo-pill"
                  onClick={() => handleQuickDemo('apex')}
                >
                  <span className="demo-avatar">🏢</span>
                  <div className="demo-info">
                    <strong>Apex Prime Realty</strong>
                    <small>Verified Property Agent / Lister</small>
                  </div>
                </button>
              </div>
            </div>

            <div className="auth-security-footer">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">lock</span>
              <span>Protected by Homiiwrk 256-bit TLS &amp; Escrow Gateway Protocol</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
