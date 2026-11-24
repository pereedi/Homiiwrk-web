import React from 'react'

const STEPS = [
  {
    number: '01',
    icon: 'travel_explore',
    badge: 'Smart Discovery',
    title: 'Find Your Stay or Ask Lydia AI',
    description:
      'Browse verified apartments, flatshares, serviced studios, and hostels across Ikeja — or tell Lydia AI your preferred location, Naira budget, and apartment type for instant matches.'
  },
  {
    number: '02',
    icon: 'chat',
    badge: '₦5,000 WhatsApp Pairing',
    title: 'Inspect Details & Connect on WhatsApp',
    description:
      'Open any listing’s dedicated property page to review photos, amenities, and lister status. Chat directly on WhatsApp to pay the flat ₦5,000 agency pairing fee and confirm your physical inspection.'
  },
  {
    number: '03',
    icon: 'verified_user',
    badge: 'Escrow Protected',
    title: 'Pay Annual or Flatshare Rent Safely',
    description:
      'After physical inspection, complete your annual rent or flatshare payment securely via the Homiiwrk Payment Gateway (Card, Paystack, or Bank Transfer Escrow) with an instant emailed receipt.'
  },
  {
    number: '04',
    icon: 'dashboard_customize',
    badge: 'Two-Sided Platform',
    title: 'List Spaces & Track Everything in One Hub',
    description:
      'Current tenants seeking flatmates and licensed real estate agents can upload shared apartments with photos in minutes and manage leases, passes, roommate matches, and listings from their dashboard.'
  }
]

export default function HowItWorks({ onExploreStays, onOpenListModal, onOpenLydia }) {
  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="container">
        <div className="hiw-header">
          <span className="hiw-eyebrow">
            <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
            <span>Simple &amp; Transparent Process</span>
          </span>
          <h2 className="hiw-title">How Homiiwrk Works</h2>
          <p className="hiw-subtitle">
            Built for students, young professionals, flatmates, and verified agents — from first search to safe key handover in four clear steps.
          </p>
        </div>

        <div className="hiw-steps-grid">
          {STEPS.map((step) => (
            <article key={step.number} className="hiw-step-card">
              <div className="hiw-step-top">
                <div className="hiw-step-icon">
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <span className="hiw-step-number">{step.number}</span>
              </div>

              <span className="hiw-step-badge">{step.badge}</span>
              <h3 className="hiw-step-title">{step.title}</h3>
              <p className="hiw-step-desc">{step.description}</p>
            </article>
          ))}
        </div>

        <div className="hiw-cta-bar">
          <div className="hiw-cta-copy">
            <strong>Ready to move in or list an available room?</strong>
            <span>Explore verified stays across Ikeja or publish your apartment to students and young professionals today.</span>
          </div>
          <div className="hiw-cta-actions">
            <button type="button" className="hiw-btn-primary" onClick={onExploreStays}>
              Explore Verified Stays
            </button>
            <button type="button" className="hiw-btn-secondary" onClick={onOpenListModal}>
              + List Your Space
            </button>
            {onOpenLydia && (
              <button type="button" className="hiw-btn-ghost" onClick={onOpenLydia}>
                Ask Lydia AI →
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
