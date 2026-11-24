import React from 'react'
import InteractiveHeroMedia from './InteractiveHeroMedia'
import { AREAS, CATEGORIES } from '../data/properties'

export default function Hero({
  selectedAreaId = 100,
  onSelectArea,
  selectedCategory = 'All',
  onSelectCategory,
  onNavigateToMatch,
  onOpenFullTour,
  onSearchListings
}) {
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    onSearchListings?.()
  }

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
              <span>Students &amp; Young Professionals Housing — Verified Marketplace</span>
            </div>

            <h1 className="hero-title">
              Find Trusted Apartments &amp; Flatshares Across Lagos.
            </h1>

            <p className="hero-subtitle">
              Listed by verified agents &amp; individual flatmates. Flatshares, serviced studios &amp; apartments. Connect securely and inspect with confidence.
            </p>

            {/* Landing Page Location & Accommodation Search Bar */}
            <form className="hero-location-searchbar" onSubmit={handleSearchSubmit}>
              {/* Location / Area Dropdown */}
              <div className="hero-search-field">
                <span className="material-symbols-outlined hero-field-icon">location_on</span>
                <div className="hero-field-text">
                  <label htmlFor="hero-area-select" className="hero-field-label">Preferred Location</label>
                  <select
                    id="hero-area-select"
                    className="hero-field-select"
                    value={selectedAreaId}
                    onChange={(e) => onSelectArea?.(Number(e.target.value))}
                  >
                    {AREAS.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name} {area.badge ? `(${area.badge})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="hero-search-divider" />

              {/* Accommodation Type Dropdown */}
              <div className="hero-search-field">
                <span className="material-symbols-outlined hero-field-icon">home</span>
                <div className="hero-field-text">
                  <label htmlFor="hero-cat-select" className="hero-field-label">Housing Type</label>
                  <select
                    id="hero-cat-select"
                    className="hero-field-select"
                    value={selectedCategory}
                    onChange={(e) => onSelectCategory?.(e.target.value)}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <button type="submit" className="hero-search-submit-btn">
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span>Find Stays</span>
              </button>
            </form>

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
                <span>Roommate Match Quiz</span>
              </a>

              <a
                href="#property-directory"
                className="btn-hero-secondary"
                onClick={(e) => {
                  e.preventDefault()
                  onSearchListings?.()
                }}
              >
                <span>Browse All Stays</span>
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
              <p className="trust-title">Every lister verified</p>
              <p className="trust-sub">ID &amp; License Vetted</p>
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
