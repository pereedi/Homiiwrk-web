import React, { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function Navbar({ currentPage, onNavigate, onOpenListModal }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isLoggedIn, logout } = useAuth()

  const logoUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuqkJkIRysqGPIvqI5CDOg5Z3pRzRwVaflQApCS4ecKLNdH4x-4p3TPukNnLNmA0Xe18IVosU_9ldaY_-uIpgpYc1PM6-514PM0M-vuGs7_Jpa5DjbyS3RDuIiOTUBRrIAp20MO9hdzaMU33vefma4rcxIxY0mkjyWYpQ-z9Gy4qAfXHTgN2Q_L1zLZbFxxl_aGqxa9sHjT4aO0DdnJRtsGbmE7n6wq262rv63deQOOMRy4hk1sTU__Xhnb7iDDmvPLQ'

  const handleLinkClick = (page, e) => {
    e?.preventDefault()
    onNavigate?.(page)
    setIsMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        {/* Brand Logo */}
        <a
          href="#"
          className="brand-logo-link"
          onClick={(e) => handleLinkClick('home', e)}
        >
          <img
            src={logoUrl}
            alt="Homiiwrk"
            className="brand-logo-img"
          />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <a
            href="#"
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick('home', e)}
          >
            Browse
          </a>
          <a
            href="#match"
            className={`nav-link ${currentPage === 'match' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick('match', e)}
          >
            Match
          </a>
          <a
            href="#match"
            className={`nav-link ${currentPage === 'match' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick('match', e)}
          >
            Roommates
          </a>
          <a
            href="#how-it-works"
            className="nav-link"
            onClick={(e) => {
              handleLinkClick('home', e)
              setTimeout(() => {
                const el = document.getElementById('how-it-works')
                el?.scrollIntoView({ behavior: 'smooth' })
              }, 120)
            }}
          >
            How It Works
          </a>
          {isLoggedIn && (
            <a
              href="#dashboard"
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={(e) => handleLinkClick('dashboard', e)}
              style={{ fontWeight: 800, color: 'var(--color-primary)' }}
            >
              Dashboard
            </a>
          )}
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions">
          {currentPage !== 'dashboard' && currentPage !== 'auth' && currentPage !== 'list' && (
            <button
              type="button"
              className="btn-list-space"
              onClick={onOpenListModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--color-primary-container)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '999px',
                padding: '0.45rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined text-[16px]">add_home</span>
              <span>List Space</span>
            </button>
          )}

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-sign-in"
                onClick={(e) => handleLinkClick('dashboard', e)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: 'var(--color-surface-container)',
                  border: '1.5px solid var(--color-outline-variant)',
                  color: 'var(--color-on-surface)'
                }}
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-600">account_circle</span>
                <span>{user?.name ? user.name.split(' ')[0] : 'Dashboard'}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-sign-in"
              onClick={(e) => handleLinkClick('auth', e)}
            >
              Sign In
            </button>
          )}

          <button
            type="button"
            aria-label="Toggle Navigation"
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer">
          <a
            href="#"
            className={`mobile-nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick('home', e)}
          >
            Browse
          </a>
          <a
            href="#match"
            className={`mobile-nav-link ${currentPage === 'match' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick('match', e)}
          >
            Match
          </a>
          <a
            href="#match"
            className={`mobile-nav-link ${currentPage === 'match' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick('match', e)}
          >
            Roommates
          </a>
          <a
            href="#how-it-works"
            className="mobile-nav-link"
            onClick={(e) => {
              handleLinkClick('home', e)
              setTimeout(() => {
                const el = document.getElementById('how-it-works')
                el?.scrollIntoView({ behavior: 'smooth' })
              }, 120)
            }}
          >
            How It Works
          </a>
          {isLoggedIn && (
            <a
              href="#dashboard"
              className={`mobile-nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={(e) => handleLinkClick('dashboard', e)}
              style={{ fontWeight: 800, color: 'var(--color-primary)' }}
            >
              Dashboard
            </a>
          )}
          <div className="mobile-drawer-bottom">
            {currentPage !== 'dashboard' && currentPage !== 'auth' && currentPage !== 'list' && (
              <button
                type="button"
                className="btn-list-space"
                style={{
                  width: '100%',
                  marginBottom: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-primary-container)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  onOpenListModal?.()
                }}
              >
                + List an Apartment
              </button>
            )}
            {isLoggedIn ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-sign-in"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={(e) => handleLinkClick('dashboard', e)}
                >
                  👤 {user?.name ? user.name.split(' ')[0] : 'My'} Dashboard
                </button>
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--color-outline-variant)',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    color: 'var(--color-on-surface-variant)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    logout()
                    onNavigate?.('auth')
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-sign-in"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={(e) => handleLinkClick('auth', e)}
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
