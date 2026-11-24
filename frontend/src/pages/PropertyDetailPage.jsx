import React, { useState, useEffect } from 'react'
import { PROPERTIES } from '../data/properties'
import { useAuth } from '../lib/AuthContext'

export default function PropertyDetailPage({
  propertyId,
  allProperties = PROPERTIES,
  onNavigateHome,
  onSelectProperty,
  favorites = [],
  onToggleFavorite
}) {
  const { user } = useAuth()
  const [fetchedProperty, setFetchedProperty] = useState(null)
  const [isLoadingProperty, setIsLoadingProperty] = useState(false)

  const targetId = String(propertyId || '').trim().toLowerCase()
  const localMatch =
    allProperties.find(
      (p) =>
        String(p.id).toLowerCase() === targetId ||
        String(p.public_id || '').toLowerCase() === targetId
    ) ||
    (!targetId.startsWith('custom-') && !targetId.startsWith('lst-')
      ? allProperties.find(
          (p) =>
            targetId &&
            (p.title?.toLowerCase().includes(targetId) ||
              targetId.includes(String(p.id).toLowerCase()))
        )
      : null)

  const property = localMatch || fetchedProperty
  const [activeImage, setActiveImage] = useState(property?.gallery?.[0] || property?.image || '')

  // Fetch directly from backend if listing is not yet in local allProperties (e.g., direct link or fresh reload)
  useEffect(() => {
    let active = true
    setFetchedProperty(null)

    if (localMatch || !propertyId) {
      setIsLoadingProperty(false)
      return
    }

    async function fetchSingleListing() {
      setIsLoadingProperty(true)
      try {
        const res = await fetch(`/api/listings/${encodeURIComponent(propertyId)}`)
        if (res.ok) {
          const data = await res.json()
          if (active && data.listing) {
            setFetchedProperty(data.listing)
          }
        }
      } catch {
        // Stay null -> shows clean "Property not found"
      } finally {
        if (active) setIsLoadingProperty(false)
      }
    }

    fetchSingleListing()
    return () => { active = false }
  }, [propertyId, Boolean(localMatch)])

  // Payment & Escrow State (Annual / Flatshare Rent)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isRentPaid, setIsRentPaid] = useState(false)
  const [rentEscrowRef, setRentEscrowRef] = useState(null)

  // Agency Connection & WhatsApp Pairing State (₦5,000 paid directly on WhatsApp)
  const [isFeePaid, setIsFeePaid] = useState(false)

  // Inspection Scheduler State
  const [inspectionDate, setInspectionDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })
  const [inspectionTime, setInspectionTime] = useState('11:00 AM')
  const [inspectionScheduled, setInspectionScheduled] = useState(false)
  const [inspectionPassId, setInspectionPassId] = useState(null)

  // Sync active image & reset checkout state when property loads or changes
  useEffect(() => {
    if (property) {
      setActiveImage(property.gallery?.[0] || property.image || '')
      setIsFeePaid(false)
      setIsRentPaid(false)
      setRentEscrowRef(null)
      setInspectionScheduled(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [property?.id, property?.image])

  if (isLoadingProperty) {
    return (
      <div className="property-detail-page container py-12 text-center" style={{ padding: '4rem 1rem' }}>
        <h2>Loading apartment details...</h2>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="property-detail-page container py-12 text-center" style={{ padding: '4rem 1rem' }}>
        <h2>Property not found</h2>
        <p style={{ marginTop: '0.5rem', color: 'var(--color-on-surface-variant)' }}>
          This listing may have been removed or is no longer available.
        </p>
        <button onClick={onNavigateHome} className="btn-hero-primary mt-4">
          Return to Browse Stays
        </button>
      </div>
    )
  }

  const isFavorited = favorites.includes(property.id)
  const similarStays = allProperties.filter((p) => String(p.id) !== String(property.id)).slice(0, 3)

  // Simulate Annual Rent Payment Gateway Checkout (Paystack / Escrow)
  const handleConfirmRentPayment = async () => {
    setIsProcessingPayment(true)
    const ref = `HW-ESC-${Math.floor(100000 + Math.random() * 900000)}`

    // Dispatch receipt generation and Nodemailer email notification
    try {
      await fetch('/api/payments/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user?.email || 'chisom.okonkwo@gmail.com',
          userName: user?.name || 'Homiiwrk Member',
          propertyId: property.id,
          propertyTitle: property.title,
          paymentType: 'Annual Rent Escrow Payment',
          amountFormatted: property.priceFormatted,
          paymentMethod: paymentMethod === 'card' ? 'Debit Card (Paystack Escrow)' : 'Bank Transfer (Escrow)'
        })
      })
    } catch {
      // Graceful offline fallback
    }

    setTimeout(() => {
      setIsProcessingPayment(false)
      setIsPaymentModalOpen(false)
      setIsRentPaid(true)
      setRentEscrowRef(ref)
    }, 900)
  }

  // Handle WhatsApp Connection & Unlocking Inspection Booking
  const handleUnlockWhatsAppPairing = () => {
    setIsFeePaid(true)
    if (!inspectionPassId) {
      const passId = `HW-INSP-${Math.floor(100000 + Math.random() * 900000)}`
      setInspectionPassId(passId)
    }
  }

  // Handle Inspection Booking
  const handleScheduleInspection = (e) => {
    e.preventDefault()
    setInspectionScheduled(true)
  }

  const formatWhatsAppPhone = (raw) => {
    const digits = String(raw || '').replace(/\D/g, '')
    if (!digits) return '2349055748233'
    if (digits.startsWith('234') && digits.length >= 13) return digits
    if (digits.startsWith('0') && digits.length === 11) return `234${digits.slice(1)}`
    return '2349055748233'
  }

  const whatsappNumber = formatWhatsAppPhone(property.phone)
  const whatsappMessage = encodeURIComponent(
    `Hello! I am inquiring about "${property.title}" on Homiiwrk. I want to connect, pay the ${property.agencyFeeFormatted || '₦5,000'} agency pairing fee directly, and confirm availability for physical inspection on ${inspectionDate} at ${inspectionTime}.`
  )
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  return (
    <div className="property-detail-page">
      {/* Top Breadcrumb & Back Bar */}
      <div className="prop-detail-header-bar">
        <div className="container prop-detail-header-inner">
          <button
            type="button"
            className="prop-btn-back"
            onClick={onNavigateHome}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Listings</span>
          </button>

          <div className="prop-breadcrumbs">
            <span>Homiiwrk</span>
            <span className="breadcrumb-sep">/</span>
            <span>Stays</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{property.title}</span>
          </div>
        </div>
      </div>

      <div className="container prop-detail-layout">
        {/* Main Left Content */}
        <div className="prop-main-column">
          {/* Gallery View */}
          <div className="prop-gallery-wrapper">
            <div className="prop-hero-img-box">
              <img
                src={activeImage}
                alt={property.title}
                className="prop-hero-img"
              />
              <button
                type="button"
                className={`prop-fav-btn ${isFavorited ? 'favorited' : ''}`}
                onClick={() => onToggleFavorite?.(property.id)}
                aria-label="Save stay to wishlist"
              >
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>

              <div className="prop-badge-overlay">
                <span className="prop-badge-verified">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>Homiiwrk Verified Stay</span>
                </span>
                <span className="prop-badge-category">{property.category}</span>
              </div>
            </div>

            {/* Thumbnails */}
            {property.gallery && property.gallery.length > 1 && (
              <div className="prop-thumbs-strip">
                {property.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`prop-thumb-btn ${activeImage === img ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Key Meta */}
          <div className="prop-header-card">
            <div className="prop-meta-top">
              <span className="prop-audience-pill">
                <span className="material-symbols-outlined text-[14px]">groups</span>
                <span>{property.targetAudience || 'Students & Young Professionals'}</span>
              </span>
              <span className="prop-rating-pill">
                <span className="material-symbols-outlined text-[16px] text-amber-500">star</span>
                <span>{property.rating} ({property.reviewCount} verified reviews)</span>
              </span>
            </div>

            <h1 className="prop-title">{property.title}</h1>

            <p className="prop-location-line">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span>{property.location} • <strong>{property.distanceText}</strong></span>
            </p>

            {/* Lister / Agent Profile Card */}
            <div className="prop-lister-banner">
              <div className="prop-lister-avatar">
                {property.listerType === 'agent' ? '🏢' : '👤'}
              </div>
              <div className="prop-lister-info">
                <div className="prop-lister-role-tag">
                  {property.listerType === 'agent' ? 'Verified Agency Listing' : 'Current Flatmate / Sublet Listing'}
                </div>
                <h4 className="prop-lister-name">{property.listerName}</h4>
                <p className="prop-lister-sub">{property.listerRole} • Rating: ★ {property.listerRating || 4.9}</p>
              </div>
              <div className="prop-lister-badge">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>Identity Vetted</span>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="prop-specs-grid">
              <div className="spec-card">
                <span className="spec-label">Housing Type</span>
                <span className="spec-value">{property.category} ({property.unit_type?.replace('_', ' ')})</span>
              </div>
              <div className="spec-card">
                <span className="spec-label">Availability</span>
                <span className="spec-value">{property.available_spaces} of {property.total_spaces} spaces free</span>
              </div>
              <div className="spec-card">
                <span className="spec-label">Furnishing</span>
                <span className="spec-value">Fully Furnished</span>
              </div>
              <div className="spec-card">
                <span className="spec-label">Agency Connection</span>
                <span className="spec-value" style={{ color: 'var(--color-primary)' }}>
                  {property.agencyFeeFormatted} (Pre-Inspection)
                </span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="prop-content-block">
            <h3 className="block-heading">About This Residence</h3>
            <p className="block-body-text">{property.fullDescription}</p>
            <p className="block-body-text text-muted" style={{ marginTop: '0.75rem' }}>
              Specially vetted for young professionals, corporate trainees, clinical residents, and university scholars seeking stable electricity, fiber connectivity, and dedicated security.
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="prop-content-block">
            <h3 className="block-heading">Verified Amenities &amp; Facilities</h3>
            <div className="prop-amenities-grid">
              {(property.amenities || []).map((amenity, idx) => (
                <div key={idx} className="prop-amenity-item">
                  <span className="material-symbols-outlined amenity-icon">{amenity?.icon || 'check_circle'}</span>
                  <span className="amenity-title">{typeof amenity === 'string' ? amenity : amenity?.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safe Escrow Guarantee */}
          <div className="prop-escrow-card">
            <div className="escrow-icon-wrap">
              <span className="material-symbols-outlined">security</span>
            </div>
            <div>
              <h4 className="escrow-title">Homiiwrk Anti-Fraud &amp; Safe Escrow Protection</h4>
              <p className="escrow-desc">
                Your connection fee and rent are protected by the Homiiwrk Marketplace Escrow protocol. Funds are only released after mutual physical inspection and verified inventory handover.
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Right Action / Booking Sidebar */}
        <aside className="prop-sidebar-column">
          <div className="prop-checkout-card">
            <div className="checkout-pricing">
              <div>
                <span className="checkout-price-amount">{property.priceFormatted}</span>
                <span className="checkout-price-cycle"> / year</span>
              </div>
              <div className="checkout-price-sub">{property.billingCycle}</div>

              {/* Annual Rent Payment Gateway Checkout */}
              {isRentPaid ? (
                <div className="rent-paid-badge">
                  <span className="material-symbols-outlined text-emerald-600">verified</span>
                  <div>
                    <strong>Annual Rent Escrow Funded!</strong>
                    <p style={{ margin: 0, fontSize: '0.78rem' }}>Ref: <code>{rentEscrowRef}</code></p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-pay-rent-gateway"
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  <span className="material-symbols-outlined">credit_card</span>
                  <span>Pay Rent via Payment Gateway ({property.priceFormatted})</span>
                </button>
              )}
              <p className="checkout-guarantee-note">
                🔒 Safe Escrow: Rent is held securely and only released to lister after physical inspection and official key handover.
              </p>
            </div>

            {/* Agency Connection Fee Requirement Notice */}
            <div className="agency-fee-notice-box">
              <div className="fee-notice-header">
                <span className="material-symbols-outlined text-[18px]">handshake</span>
                <strong>Agency Pairing Fee: {property.agencyFeeFormatted}</strong>
              </div>
              <p className="fee-notice-desc">
                In line with Homiiwrk policy, connect and pay the <strong>{property.agencyFeeFormatted}</strong> pairing fee directly on WhatsApp to the lister before an accompanied physical inspection is scheduled.
              </p>
            </div>

            {/* WhatsApp Connection & Physical Inspection Scheduling */}
            {!isFeePaid ? (
              <div className="checkout-actions-unpaid">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-agency"
                  onClick={handleUnlockWhatsAppPairing}
                >
                  <span className="material-symbols-outlined">chat</span>
                  <span>💬 Chat on WhatsApp &amp; Pay {property.agencyFeeFormatted} Fee</span>
                </a>

                <button
                  type="button"
                  className="btn-text-simple"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    width: '100%',
                    textAlign: 'center',
                    marginTop: '0.6rem',
                    cursor: 'pointer'
                  }}
                  onClick={handleUnlockWhatsAppPairing}
                >
                  Already chatting? Click here to schedule inspection →
                </button>

                <div className="step-preview-row">
                  <div className="step-pill active">1. ₦5,000 on WhatsApp</div>
                  <div className="step-arrow">→</div>
                  <div className="step-pill disabled">2. Physical Inspection</div>
                </div>
              </div>
            ) : (
              <div className="checkout-actions-paid">
                <div className="paid-success-banner">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  <div>
                    <strong>WhatsApp Pairing Connected!</strong>
                    <p>Pass ID: <code>{inspectionPassId}</code></p>
                  </div>
                </div>

                {!inspectionScheduled ? (
                  <form className="inspection-booking-form" onSubmit={handleScheduleInspection}>
                    <h4 className="form-heading">Schedule Physical Inspection</h4>

                    <div className="form-group">
                      <label>Select Inspection Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={inspectionDate}
                        onChange={(e) => setInspectionDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Preferred Time Slot</label>
                      <select
                        className="form-select"
                        value={inspectionTime}
                        onChange={(e) => setInspectionTime(e.target.value)}
                      >
                        <option value="10:00 AM">Morning (10:00 AM)</option>
                        <option value="12:30 PM">Afternoon (12:30 PM)</option>
                        <option value="03:00 PM">Mid-Day (03:00 PM)</option>
                        <option value="05:00 PM">Evening (05:00 PM)</option>
                      </select>
                    </div>

                    <button type="submit" className="btn-confirm-inspection">
                      Confirm Physical Inspection
                    </button>
                  </form>
                ) : (
                  <div className="inspection-confirmed-box">
                    <span className="material-symbols-outlined text-[32px] text-emerald-500">event_available</span>
                    <h4>Inspection Confirmed!</h4>
                    <p>
                      Scheduled for <strong>{inspectionDate}</strong> at <strong>{inspectionTime}</strong>. A dedicated Homiiwrk verification agent and {property.listerName} have been notified.
                    </p>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp-lister"
                    >
                      <span>💬 Chat with Lister on WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Property Fast Facts */}
            <div className="checkout-details-list">
              <div className="checkout-detail-row">
                <span>Security Deposit</span>
                <strong>Escrow Safeguarded</strong>
              </div>
              <div className="checkout-detail-row">
                <span>Lister Status</span>
                <strong>{property.listerType === 'agent' ? 'Registered Agent' : 'Current Resident'}</strong>
              </div>
              <div className="checkout-detail-row">
                <span>Direct Contact</span>
                <strong>
                  {isFeePaid
                    ? (property.phone || (property.listerPhoneMasked || '+234 905 ••• ••33').replace('••• ••', '823 44'))
                    : (property.listerPhoneMasked || '+234 905 ••• ••33')}
                </strong>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Similar Stays Row */}
      <div className="prop-similar-section container">
        <h3 className="similar-section-title">Similar Verified Stays You May Like</h3>
        <div className="similar-cards-grid">
          {similarStays.map((simProp) => (
            <div
              key={simProp.id}
              className="similar-property-card"
              onClick={() => onSelectProperty?.(simProp)}
            >
              <img src={simProp.image} alt={simProp.title} className="similar-card-img" />
              <div className="similar-card-body">
                <span className="similar-cat-tag">{simProp.category}</span>
                <h4 className="similar-card-title">{simProp.title}</h4>
                <p className="similar-card-price">{simProp.priceFormatted} <small>/ yr</small></p>
                <p className="similar-card-loc">📍 {simProp.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Gateway Modal (Simulated Paystack Flow for Annual Rent) */}
      {isPaymentModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsPaymentModalOpen(false)}>
          <div className="payment-checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-simple">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">lock</span>
                <h3>Pay Annual Rent (Escrow Protection)</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="payment-modal-body">
              <div className="payment-summary-box">
                <div className="summary-item">
                  <span>Apartment:</span>
                  <strong>{property.title}</strong>
                </div>
                <div className="summary-item">
                  <span>Lister:</span>
                  <strong>{property.listerName} ({property.listerType === 'agent' ? 'Agent' : 'Flatmate'})</strong>
                </div>
                <div className="summary-item total-row">
                  <span>Annual Rent Total:</span>
                  <span className="total-amount">{property.priceFormatted}</span>
                </div>
              </div>

              <div className="payment-method-selector">
                <label className={`method-pill ${paymentMethod === 'card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <span>💳 Debit Card (Paystack)</span>
                </label>
                <label className={`method-pill ${paymentMethod === 'bank' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={() => setPaymentMethod('bank')}
                  />
                  <span>🏦 Bank Transfer</span>
                </label>
              </div>

              {paymentMethod === 'card' ? (
                <div className="card-fields-mock">
                  <div className="mock-field">
                    <label>Card Number</label>
                    <input type="text" placeholder="5399 •••• •••• 1284" defaultValue="5399 4820 1823 1284" readOnly />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="mock-field">
                      <label>Expiry</label>
                      <input type="text" placeholder="MM/YY" defaultValue="08/28" readOnly />
                    </div>
                    <div className="mock-field">
                      <label>CVV</label>
                      <input type="password" placeholder="•••" defaultValue="849" readOnly />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bank-transfer-mock">
                  <p>Transfer <strong>{property.priceFormatted}</strong> to:</p>
                  <div className="bank-details-card">
                    <p><strong>Bank:</strong> Wema Bank / Paystack Escrow</p>
                    <p><strong>Account Name:</strong> Homiiwrk Rent Escrow - {property.title.slice(0, 18)}</p>
                    <p><strong>Account Number:</strong> <code>0281948291</code></p>
                  </div>
                </div>
              )}

              <p className="payment-security-notice">
                🔒 Escrow Guarantee: Your annual rent is held securely in Homiiwrk Escrow and released to the lister only after physical inspection and official key handover.
              </p>

              <button
                type="button"
                className="btn-pay-now"
                disabled={isProcessingPayment}
                onClick={handleConfirmRentPayment}
              >
                {isProcessingPayment ? 'Verifying Payment...' : `Confirm & Pay ${property.priceFormatted} via Escrow`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
