// =====================================================================
// HOMIIWRK DEDICATED LIST APARTMENT PAGE (#list-space)
// Full-page responsive listing experience with live directory preview
// =====================================================================
import React, { useState } from 'react'
import { AREAS } from '../data/properties'
import { useAuth } from '../lib/AuthContext'

const AVAILABLE_AMENITIES = [
  { icon: 'bolt', text: '24/7 Generator' },
  { icon: 'wifi', text: 'High-Speed WiFi' },
  { icon: 'water_drop', text: 'Treated Water' },
  { icon: 'ac_unit', text: 'Air Conditioned' },
  { icon: 'kitchen', text: 'Fitted Kitchen' },
  { icon: 'security', text: '24h Security Guard' },
  { icon: 'videocam', text: 'CCTV Monitored' },
  { icon: 'local_parking', text: 'Car Parking' },
  { icon: 'electric_meter', text: 'Prepaid Meter' }
]

const CATEGORY_LABELS = {
  flatshare: 'Flatshare',
  co_living: 'Co-Living',
  serviced: 'Serviced Studio',
  hostel: 'Hostel'
}

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80'

export default function ListApartmentPage({ onNavigate, onAddListing }) {
  const { user } = useAuth()
  const [listerType, setListerType] = useState(user?.role === 'agent' ? 'agent' : 'individual')

  const [formData, setFormData] = useState({
    title: '',
    category: 'flatshare',
    area_id: 101,
    address_line: '',
    price: '',
    agencyFee: '5000',
    description: '',
    listerName: user?.name || '',
    phone: user?.phone || '',
    totalSpaces: 2,
    spaces: 1,
    amenities: ['24/7 Generator', 'High-Speed WiFi', 'Treated Water']
  })

  const [uploadedImages, setUploadedImages] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [publishedListing, setPublishedListing] = useState(null)

  const selectedArea = AREAS.find((a) => Number(a.id) === Number(formData.area_id))
  const previewPriceNum = parseInt(String(formData.price || '').replace(/,/g, ''), 10) || 450000
  const previewCover =
    uploadedImages.find((img) => img.isPrimary)?.url ||
    uploadedImages[0]?.url ||
    DEFAULT_FALLBACK_IMAGE

  const handleAmenityToggle = (amenityText) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityText)
        ? prev.amenities.filter((a) => a !== amenityText)
        : [...prev.amenities, amenityText]
    }))
  }

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setIsUploading(true)
    setUploadError('')

    try {
      for (const file of files) {
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = (err) => reject(err)
          reader.readAsDataURL(file)
        })

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            folder: 'homiiwrk/apartments'
          })
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Upload failed. Please check your photo and try again.')
        }

        const data = await res.json()
        const imageUrl = data.url || base64Data

        setUploadedImages((prev) => [
          ...prev,
          {
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            url: imageUrl,
            isPrimary: prev.length === 0
          }
        ])
      }
    } catch (err) {
      setUploadError(err.message || 'Image upload failed. You can retry or publish with a default photo.')
    } finally {
      setIsUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleSetPrimary = (id) => {
    setUploadedImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === id
      }))
    )
  }

  const handleRemoveImage = (id) => {
    setUploadedImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id)
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true
      }
      return filtered
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.price || isUploading || isSubmitting) return

    setIsSubmitting(true)

    const priceNum = parseInt(String(formData.price).replace(/,/g, ''), 10) || 400000
    const agencyNum = parseInt(String(formData.agencyFee).replace(/,/g, ''), 10) || 5000
    const totalSpacesNum = Math.max(1, Number(formData.totalSpaces) || 2)
    const availableSpacesNum = Math.min(totalSpacesNum, Math.max(1, Number(formData.spaces) || 1))

    const primaryImg =
      uploadedImages.find((img) => img.isPrimary)?.url ||
      uploadedImages[0]?.url ||
      DEFAULT_FALLBACK_IMAGE
    const galleryUrls =
      uploadedImages.length > 0 ? uploadedImages.map((img) => img.url) : [DEFAULT_FALLBACK_IMAGE]

    const mappedAmenities = formData.amenities.map((text) => {
      const found = AVAILABLE_AMENITIES.find((a) => a.text === text)
      return { icon: found?.icon || 'check_circle', text }
    })

    const newListing = {
      id: `custom-${Date.now()}`,
      public_id: `custom-pub-${Date.now()}`,
      area_id: Number(formData.area_id),
      title: formData.title.trim(),
      category: CATEGORY_LABELS[formData.category] || 'Flatshare',
      accommodation_type: formData.category,
      unit_type: formData.category === 'flatshare' ? 'two_bed' : 'self_contain',
      total_spaces: totalSpacesNum,
      totalSpaces: totalSpacesNum,
      available_spaces: availableSpacesNum,
      availableSpaces: availableSpacesNum,
      status: 'active',
      distance: 8,
      distanceText: selectedArea?.badge || '8 mins to Transit & Hubs',
      rent_kobo: priceNum * 100,
      price: priceNum,
      priceFormatted: `₦${priceNum.toLocaleString()}`,
      rent_period: 'annual',
      billingCycle: 'Annual rent · Standard tenancy',
      agencyFee_kobo: agencyNum * 100,
      agencyFee: agencyNum,
      agencyFeeFormatted: `₦${agencyNum.toLocaleString()}`,
      listerType,
      listerName:
        formData.listerName.trim() ||
        (listerType === 'agent' ? 'Premier Realty Agent' : 'Verified Flatmate'),
      listerRole: listerType === 'agent' ? 'Licensed Property Agent' : 'Current Tenant / Flatmate',
      phone: formData.phone.trim(),
      listerPhoneMasked: formData.phone
        ? `+234 ${formData.phone.replace(/\D/g, '').slice(-10, -5)} ••• ••`
        : '+234 905 ••• ••33',
      listerRating: 5.0,
      rating: 5.0,
      reviewCount: 1,
      targetAudience: 'Students & Young Professionals',
      description:
        formData.description.trim() ||
        'Newly listed verified accommodation with reliable power and clean water.',
      fullDescription:
        formData.description.trim() ||
        'Spacious, well-ventilated apartment situated in a gated security perimeter with reliable backup power, treated water, and quick transit links.',
      amenities: mappedAmenities,
      image: primaryImg,
      gallery: galleryUrls,
      address: formData.address_line.trim() || selectedArea?.name || 'GRA Ikeja, Lagos',
      location: formData.address_line.trim() || selectedArea?.name || 'GRA Ikeja, Lagos',
      verifiedLandlord: formData.listerName.trim() || 'Verified Property Manager',
      depositEscrow: true,
      inspectionFeeNotice: 'Agency pairing fee (₦5,000) paid directly on WhatsApp'
    }

    let canonicalListing = newListing
    try {
      const res = await fetch('/api/user/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || 'anonymous@homiiwrk.ng',
          listing: newListing
        })
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.listing) {
          canonicalListing = data.listing
        }
      }
    } catch {
      // Offline fallback uses newListing
    }

    onAddListing?.(canonicalListing)
    setPublishedListing(canonicalListing)
    setIsSubmitting(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="list-page">
      {/* Top Breadcrumb Bar (Matches PropertyDetailPage & DashboardPage) */}
      <div className="list-page-topbar">
        <div className="container list-page-topbar-inner">
          <button
            type="button"
            className="list-btn-back"
            onClick={() => onNavigate?.('home')}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Listings</span>
          </button>

          <div className="list-breadcrumbs">
            <span>Homiiwrk</span>
            <span className="list-crumb-sep">/</span>
            <span className="list-crumb-current">List Your Space</span>
          </div>
        </div>
      </div>

      {/* Page Hero Banner */}
      <div className="list-page-hero">
        <div className="container">
          <div className="list-hero-badge">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            <span>Two-Sided Verified Marketplace</span>
          </div>
          <h1 className="list-hero-title">List Your Apartment or Flatshare</h1>
          <p className="list-hero-subtitle">
            Reach vetted students and young professionals across Ikeja. Open to both individual tenants seeking a flatmate and licensed real estate agents.
          </p>
        </div>
      </div>

      <div className="container list-page-body">
        {publishedListing ? (
          <div className="list-published-card">
            <div className="list-published-icon">
              <span className="material-symbols-outlined text-[42px]">check_circle</span>
            </div>
            <h2>Your Apartment Is Now Live!</h2>
            <p>
              <strong>{publishedListing.title}</strong> has been published to the Homiiwrk directory and saved to your personal dashboard.
            </p>

            <div className="list-published-preview">
              <img src={publishedListing.image} alt={publishedListing.title} />
              <div>
                <span className="list-pub-cat">{publishedListing.category}</span>
                <h4>{publishedListing.title}</h4>
                <p>📍 {publishedListing.location}</p>
                <strong>{publishedListing.priceFormatted} / yr</strong>
              </div>
            </div>

            <div className="list-published-actions">
              <button
                type="button"
                className="list-btn-primary"
                onClick={() => onNavigate?.('property', publishedListing.id)}
              >
                <span>View Live Apartment Page →</span>
              </button>
              <button
                type="button"
                className="list-btn-secondary"
                onClick={() => onNavigate?.('dashboard')}
              >
                Manage in My Dashboard
              </button>
              <button
                type="button"
                className="list-btn-ghost"
                onClick={() => {
                  setPublishedListing(null)
                  setUploadedImages([])
                  setFormData((prev) => ({
                    ...prev,
                    title: '',
                    address_line: '',
                    price: '',
                    description: ''
                  }))
                }}
              >
                + List Another Space
              </button>
            </div>
          </div>
        ) : (
          <div className="list-page-grid">
            {/* Left Column: Structured Multi-Section Form */}
            <form className="list-form-column" onSubmit={handleSubmit}>
              {/* Section 1: Lister Profile & Property Basics */}
              <section className="list-section-card">
                <div className="list-section-head">
                  <span className="list-step-pill">01</span>
                  <div>
                    <h3>Lister Role &amp; Property Basics</h3>
                    <p>Tell prospective tenants who you are and what kind of space is available.</p>
                  </div>
                </div>

                <div className="lister-role-selector">
                  <label
                    className={`role-choice ${listerType === 'individual' ? 'active' : ''}`}
                    onClick={() => setListerType('individual')}
                  >
                    <input
                      type="radio"
                      name="lister_type"
                      checked={listerType === 'individual'}
                      onChange={() => setListerType('individual')}
                    />
                    <div>
                      <strong>👤 Individual Tenant / Flatmate</strong>
                      <p>I live here or hold the tenancy and want a compatible flatmate or sublet</p>
                    </div>
                  </label>

                  <label
                    className={`role-choice ${listerType === 'agent' ? 'active' : ''}`}
                    onClick={() => setListerType('agent')}
                  >
                    <input
                      type="radio"
                      name="lister_type"
                      checked={listerType === 'agent'}
                      onChange={() => setListerType('agent')}
                    />
                    <div>
                      <strong>🏢 Real Estate Agent / Landlord</strong>
                      <p>I represent the property and coordinate verified tenant placement</p>
                    </div>
                  </label>
                </div>

                <div className="list-fields-grid">
                  <div className="list-field full">
                    <label>Listing Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Spacious En-Suite 2-Bed Flatshare in GRA Ikeja"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="list-field">
                    <label>Housing Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="flatshare">Flatshare (Shared Apartment)</option>
                      <option value="co_living">Co-Living Space</option>
                      <option value="serviced">Serviced Studio / Mini-Flat</option>
                      <option value="hostel">Self-Contain / Hostel</option>
                    </select>
                  </div>

                  <div className="list-field">
                    <label>Target Location / Hub *</label>
                    <select
                      value={formData.area_id}
                      onChange={(e) => setFormData({ ...formData, area_id: Number(e.target.value) })}
                    >
                      {AREAS.filter((a) => a.id !== 100).map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="list-field full">
                    <label>Street / Address Line *</label>
                    <input
                      type="text"
                      placeholder="e.g. Off Isaac John Street, Ikeja GRA, Lagos"
                      value={formData.address_line}
                      onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                      required
                    />
                  </div>

                  <div className="list-field">
                    <label>Available Spaces / Rooms</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.spaces}
                      onChange={(e) => setFormData({ ...formData, spaces: e.target.value })}
                    />
                  </div>

                  <div className="list-field">
                    <label>Total Spaces in Unit</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.totalSpaces}
                      onChange={(e) => setFormData({ ...formData, totalSpaces: e.target.value })}
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Pricing & Contact */}
              <section className="list-section-card">
                <div className="list-section-head">
                  <span className="list-step-pill">02</span>
                  <div>
                    <h3>Pricing &amp; Direct WhatsApp Contact</h3>
                    <p>Set transparent annual or flatshare rent and your WhatsApp line for inspections.</p>
                  </div>
                </div>

                <div className="list-fields-grid">
                  <div className="list-field">
                    <label>Annual / Flatshare Rent (₦) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 450000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                    <span className="list-field-hint">Paid securely via Homiiwrk Payment Gateway Escrow</span>
                  </div>

                  <div className="list-field">
                    <label>Agency / Pairing Fee (₦) *</label>
                    <input
                      type="number"
                      placeholder="5000"
                      value={formData.agencyFee}
                      onChange={(e) => setFormData({ ...formData, agencyFee: e.target.value })}
                      required
                    />
                    <span className="list-field-hint">Paid directly on WhatsApp after chatting to confirm inspection</span>
                  </div>

                  <div className="list-field">
                    <label>{listerType === 'agent' ? 'Agency / Manager Name *' : 'Your Full Name *'}</label>
                    <input
                      type="text"
                      placeholder={listerType === 'agent' ? 'e.g. Bluecrest Realty Ltd' : 'e.g. Tunde Adeleke'}
                      value={formData.listerName}
                      onChange={(e) => setFormData({ ...formData, listerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="list-field">
                    <label>WhatsApp / Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 0905 574 8233"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Section 3: Apartment Photos */}
              <section className="list-section-card">
                <div className="list-section-head">
                  <span className="list-step-pill">03</span>
                  <div>
                    <h3>Apartment &amp; Shared Room Photos</h3>
                    <p>Listings with clear photos of bedrooms, living area, kitchen, and restroom get 3× more inspections.</p>
                  </div>
                </div>

                <label className={`upload-drop-zone ${isUploading ? 'disabled' : ''}`}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={isUploading}
                    onChange={handleFilesSelected}
                  />
                  <div className="upload-icon-box">
                    <span className="material-symbols-outlined text-[24px]">
                      {isUploading ? 'sync' : 'add_photo_alternate'}
                    </span>
                  </div>
                  <div>
                    <p className="upload-title">
                      {isUploading ? 'Uploading Photos...' : 'Click to Upload Apartment Photos'}
                    </p>
                    <p className="upload-subtitle">
                      Select multiple photos of the bedroom, living room, kitchen &amp; restroom (PNG, JPG, WebP)
                    </p>
                  </div>
                </label>

                {uploadError && (
                  <p className="list-upload-error">{uploadError}</p>
                )}

                {uploadedImages.length > 0 && (
                  <div className="upload-thumbs-grid">
                    {uploadedImages.map((img) => (
                      <div key={img.id} className={`thumb-card ${img.isPrimary ? 'is-primary' : ''}`}>
                        <img src={img.url} alt="Apartment preview" />
                        {img.isPrimary && <span className="thumb-primary-tag">Cover</span>}
                        <button
                          type="button"
                          className="thumb-btn-remove"
                          title="Delete photo"
                          onClick={() => handleRemoveImage(img.id)}
                        >
                          ✕
                        </button>
                        {!img.isPrimary && (
                          <button
                            type="button"
                            className="thumb-btn-set-cover"
                            onClick={() => handleSetPrimary(img.id)}
                          >
                            Set Cover
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section 4: Description & Amenities */}
              <section className="list-section-card">
                <div className="list-section-head">
                  <span className="list-step-pill">04</span>
                  <div>
                    <h3>Description, House Rules &amp; Amenities</h3>
                    <p>Highlight power reliability, study/work environment, and flatmate preferences.</p>
                  </div>
                </div>

                <div className="list-field full" style={{ marginBottom: '1.25rem' }}>
                  <label>Description &amp; House Rules</label>
                  <textarea
                    rows="4"
                    placeholder="Mention quiet hours, generator/inverter schedules, preferred roommate habits, or nearby transport links..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="list-field full">
                  <label>Available Amenities (Click to Toggle)</label>
                  <div className="list-amenity-pills">
                    {AVAILABLE_AMENITIES.map((item) => {
                      const isSelected = formData.amenities.includes(item.text)
                      return (
                        <button
                          key={item.text}
                          type="button"
                          className={`list-amenity-chip ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleAmenityToggle(item.text)}
                        >
                          <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                          <span>{item.text}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </section>

              {/* Bottom Submit Bar */}
              <div className="list-submit-bar">
                <button
                  type="button"
                  className="list-btn-ghost-dark"
                  onClick={() => onNavigate?.('home')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="list-btn-primary"
                  disabled={isUploading || isSubmitting}
                >
                  <span className="material-symbols-outlined text-[18px]">publish</span>
                  <span>
                    {isUploading
                      ? 'Uploading Photos...'
                      : isSubmitting
                        ? 'Publishing Listing...'
                        : 'Publish Listing to Homiiwrk'}
                  </span>
                </button>
              </div>
            </form>

            {/* Right Sticky Column: Live Directory Card Preview & Trust Summary */}
            <aside className="list-sidebar-column">
              <div className="list-preview-wrapper">
                <div className="list-preview-label">
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Live Directory Preview</span>
                </div>

                <article className="list-preview-card">
                  <div className="list-preview-media">
                    <img src={previewCover} alt="Listing preview" />
                    <span className="list-preview-verified">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      <span>Verified by Homiiwrk</span>
                    </span>
                    <span className="list-preview-photo-count">
                      📷 {uploadedImages.length || 1} {uploadedImages.length === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>

                  <div className="list-preview-content">
                    <div className="list-preview-meta">
                      <span className="list-preview-cat">
                        {CATEGORY_LABELS[formData.category] || 'Flatshare'}
                      </span>
                      <span className={`list-preview-role ${listerType}`}>
                        {listerType === 'agent' ? '🏢 Agent' : '👤 Flatmate'}
                      </span>
                    </div>

                    <h4 className="list-preview-title">
                      {formData.title.trim() || 'Your Listing Title Appears Here'}
                    </h4>
                    <p className="list-preview-loc">
                      📍 {formData.address_line.trim() || selectedArea?.name || 'GRA Ikeja, Lagos'}
                    </p>

                    <div className="list-preview-amenities">
                      {formData.amenities.slice(0, 3).map((am) => (
                        <span key={am} className="list-preview-am-pill">{am}</span>
                      ))}
                    </div>

                    <div className="list-preview-footer">
                      <div>
                        <span className="list-preview-price">₦{previewPriceNum.toLocaleString()}</span>
                        <span className="list-preview-cycle"> / year</span>
                      </div>
                      <span className="list-preview-fee">
                        ₦{(parseInt(String(formData.agencyFee || '5000').replace(/,/g, ''), 10) || 5000).toLocaleString()} pairing
                      </span>
                    </div>
                  </div>
                </article>

                {/* Trust & Listing Protection Notes */}
                <div className="list-trust-box">
                  <h4>How Your Listing Works</h4>
                  <ul>
                    <li>
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      <span>Appears immediately at the top of the Homiiwrk directory and in Lydia AI matches.</span>
                    </li>
                    <li>
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      <span>Interested tenants connect on WhatsApp and pay the ₦5,000 pairing fee directly before inspection.</span>
                    </li>
                    <li>
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      <span>Edit or remove your listing anytime from your personal dashboard.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
