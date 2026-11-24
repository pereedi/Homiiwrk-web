import React, { useState } from 'react'

export default function PropertyDetailModal({ property, onClose }) {
  const [selectedImage, setSelectedImage] = useState(property?.gallery?.[0] || property?.image)
  const [isBooked, setIsBooked] = useState(false)

  if (!property) return null

  const handleBook = () => {
    setIsBooked(true)
    setTimeout(() => {
      alert(`Inspection request confirmed for ${property.title}! A verified Homiiwrk campus guide will accompany you at LASUCOM Gate. Zero inspection fee charged.`)
    }, 100)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Hero Gallery Image */}
        <div className="modal-hero-image-wrap">
          <img
            src={selectedImage}
            alt={property.title}
            className="modal-hero-image"
          />
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <span className="modal-category-tag">{property.category}</span>
          <h2 className="modal-title">{property.title}</h2>
          <p className="modal-location">
            <span className="material-symbols-outlined text-[16px]">pin_drop</span>
            <span>{property.location} · {property.distanceText}</span>
          </p>

          {/* Highlights Grid */}
          <div className="modal-highlights-grid">
            <div className="highlight-box">
              <span className="highlight-label">Guest Rating</span>
              <span className="highlight-value">★ {property.rating} / 5.0</span>
            </div>
            <div className="highlight-box">
              <span className="highlight-label">Proximity</span>
              <span className="highlight-value">{property.distance} mins walk</span>
            </div>
            <div className="highlight-box">
              <span className="highlight-label">Inspection Fee</span>
              <span className="highlight-value" style={{ color: '#059669' }}>Free (₦0)</span>
            </div>
            <div className="highlight-box">
              <span className="highlight-label">Verified By</span>
              <span className="highlight-value">Homiiwrk Vetted</span>
            </div>
          </div>

          {/* Description */}
          <h4 className="modal-section-heading">About This Residence</h4>
          <p className="modal-desc-text">{property.fullDescription}</p>

          {/* Amenities Grid */}
          <h4 className="modal-section-heading">Verified Amenities &amp; Facilities</h4>
          <div className="card-amenities-row" style={{ marginBottom: '1.5rem' }}>
            {property.amenities.map((amenity, idx) => (
              <span key={idx} className="amenity-pill" style={{ padding: '0.4rem 0.75rem' }}>
                <span className="material-symbols-outlined text-[16px]">
                  {amenity.icon}
                </span>
                <span style={{ fontSize: '13px' }}>{amenity.text}</span>
              </span>
            ))}
          </div>

          {/* Verified Landlord Guarantee Card */}
          <div className="trust-escrow-card">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
            <div>
              <p className="trust-escrow-title">
                Verified Landlord: {property.verifiedLandlord}
              </p>
              <p className="trust-escrow-desc">
                Protected by Homiiwrk Anti-Scam Safe Deposit Escrow. Your payment is held securely in escrow until you receive physical keys and verified inventory sign-off.
              </p>
            </div>
          </div>

          {/* Action & Price Bar */}
          <div className="modal-action-bar">
            <div className="modal-price-display">
              <span className="modal-price-number">{property.priceFormatted}</span>
              <span className="modal-price-note">{property.billingCycle}</span>
            </div>

            <div className="modal-buttons-group">
              <button
                type="button"
                className="btn-book-inspection"
                onClick={handleBook}
              >
                {isBooked ? '✓ Inspection Scheduled' : 'Book Free Inspection'}
              </button>
              <button
                type="button"
                className="btn-contact-agent"
                onClick={() => alert(`Connecting with LASUCOM student liaison desk for ${property.title}...`)}
              >
                WhatsApp Desk
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
