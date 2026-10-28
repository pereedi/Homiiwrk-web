import React, { useState } from 'react'

export default function Navbar({ currentPage, onNavigate }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
            href="#"
            className="nav-link"
            onClick={(e) => {
              handleLinkClick('home', e)
              setTimeout(() => {
                const el = document.getElementById('property-directory')
                el?.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }}
          >
            How It Works
          </a>
          <a
            href="#"
            className="nav-link"
            onClick={(e) => {
              handleLinkClick('home', e)
              setTimeout(() => {
                const el = document.getElementById('campus-hubs')
                el?.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }}
          >
            Verify
          </a>
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions">
          <button
            type="button"
            className="btn-sign-in"
            onClick={() => alert('Student portal authentication connecting to backend Express & Supabase / MySQL database.')}
          >
            Sign In
          </button>

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
            href="#"
            className="mobile-nav-link"
            onClick={(e) => {
              handleLinkClick('home', e)
              setTimeout(() => {
                const el = document.getElementById('property-directory')
                el?.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }}
          >
            How It Works
          </a>
          <a
            href="#"
            className="mobile-nav-link"
            onClick={(e) => {
              handleLinkClick('home', e)
              setTimeout(() => {
                const el = document.getElementById('campus-hubs')
                el?.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }}
          >
            Verify
          </a>
          <div className="mobile-drawer-bottom">
            <button
              type="button"
              className="btn-sign-in"
              onClick={() => alert('Student portal sign in')}
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
