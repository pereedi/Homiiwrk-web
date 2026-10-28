import React from 'react'
import InteractiveHeroMedia from './InteractiveHeroMedia'

export default function Hero({ onNavigateToMatch, onOpenFullTour }) {
  return (
    <section className="hero-section">
      {/* Ambient Teal Glow Gradient */}
      <div className="hero-ambient-glow" />

      <div className="container relative">
        <div className="hero-grid">
          {/* Left Hero Content */}
          <div>
            <div className="hero-verified-badge">
              <span className="ping-indicator">
                <span className="ping-circle"></span>
                <span className="ping-dot"></span>
              </span>
              <span>LASUCOM Student Housing — Now Verified</span>
            </div>

            <h1 className="hero-title">
              Find Trusted Student Accommodation Around LASUCOM, Ikeja.
            </h1>

            <p className="hero-subtitle">
              Verified hostels. Flatshares. Co-living. Shared apartments. Trusted agents. No scams. No fake listings.
            </p>

            <div className="hero-cta-group">
              <a
                href="#match"
                className="btn-hero-primary"
                onClick={(e) => {
                  e.preventDefault()
                  onNavigateToMatch?.()
                }}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                <span>Find My Match</span>
              </a>

              <a
                href="#property-directory"
                className="btn-hero-secondary"
              >
                <span>Browse Listings</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive House-Shaped Media Walkthrough */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <InteractiveHeroMedia onOpenFullTour={onOpenFullTour} />
          </div>
        </div>

        {/* Bottom Trust Strip */}
        <div className="hero-trust-strip">
          <div className="trust-item">
            <div className="trust-icon-box">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ color: 'var(--color-tertiary-fixed-dim)', fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
            <div>
              <p className="trust-title">Every agent verified</p>
              <p className="trust-sub">LASUCOM vetted</p>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ color: 'var(--color-secondary-fixed)' }}
              >
                photo_camera
              </span>
            </div>
            <div>
              <p className="trust-title">Real photos only</p>
              <p className="trust-sub">Zero stock renders</p>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ color: 'var(--color-tertiary-fixed)' }}
              >
                check_circle
              </span>
            </div>
            <div>
              <p className="trust-title">0 scam incidents</p>
              <p className="trust-sub">Safe deposit escrow</p>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ color: 'var(--color-star)', fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            </div>
            <div>
              <p className="trust-title">Utility ratings</p>
              <p className="trust-sub">Power &amp; water index</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
