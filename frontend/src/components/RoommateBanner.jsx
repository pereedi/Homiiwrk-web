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
                  smart_toy
                </span>
                <span>Lydia AI Concierge • Flatmate &amp; Housing Network</span>
              </div>

              <h2 className="banner-title">
                Find your ideal flatmate &amp; apartment with Lydia
              </h2>

              <p className="banner-desc">
                Consult our AI housing concierge for student &amp; young professional flatshares. Get matched by work/study routines, quiet hours, budget tiers, and connect securely before inspection.
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
                  <span>WhatsApp Mutual Consent</span>
                </span>
                <span className="banner-perk">
                  <span className="material-symbols-outlined banner-perk-icon">
                    auto_awesome
                  </span>
                  <span>AI Budget & Upgrade Guidance</span>
                </span>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="banner-cta-col">
              <button
                type="button"
                className="btn-banner-quiz"
                onClick={() => onNavigateToMatch?.('lydia')}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1" }}
                >
                  smart_toy
                </span>
                <span>Chat with Lydia</span>
              </button>

              <button
                type="button"
                className="btn-banner-roster"
                onClick={() => onNavigateToMatch?.('roster')}
              >
                <span>Browse Flatmates</span>
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
