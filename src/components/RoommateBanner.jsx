import React from 'react'

export default function RoommateBanner({ onNavigateToMatch }) {
  return (
    <section className="roommate-banner-section" id="roommate-match">
      <div className="container">
        <div className="roommate-banner-card">
          {/* Ambient Lighting Orbs */}
          <div className="banner-ambient-orb-1" />
          <div className="banner-ambient-orb-2" />

          <div className="banner-inner-grid">
            {/* Left Content */}
            <div>
              <div className="banner-badge">
                <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--color-tertiary-fixed-dim)' }}>
                  group
                </span>
                <span>LASUCOM Peer Compatibility Network</span>
              </div>

              <h2 className="banner-title">
                Want a roommate in the same faculty or study schedule?
              </h2>

              <p className="banner-desc">
                Match with vetted medical, dental, physiology, or nursing students based on quiet study hours, budget tiers, and hygiene preferences before splitting rent.
              </p>

              <div className="banner-perks-row">
                <span className="banner-perk">
                  <span className="material-symbols-outlined banner-perk-icon">
                    verified
                  </span>
                  <span>Faculty Verified IDs</span>
                </span>
                <span className="banner-perk">
                  <span className="material-symbols-outlined banner-perk-icon">
                    lock
                  </span>
                  <span>Private Contact Control</span>
                </span>
                <span className="banner-perk">
                  <span className="material-symbols-outlined banner-perk-icon">
                    timer
                  </span>
                  <span>2-Minute Match Quiz</span>
                </span>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="banner-cta-col">
              <button
                type="button"
                className="btn-banner-quiz"
                onClick={() => onNavigateToMatch?.('quiz')}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1" }}
                >
                  psychology
                </span>
                <span>Take Roommate Quiz</span>
              </button>

              <button
                type="button"
                className="btn-banner-roster"
                onClick={() => onNavigateToMatch?.('roster')}
              >
                <span>View Roster Feed</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
