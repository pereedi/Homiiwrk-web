import React, { useState } from 'react'
import { AREAS } from '../data/properties'
import { useAuth } from '../lib/AuthContext'

export default function ListApartmentModal({ onClose, onAddListing }) {
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
    spaces: 1,
    amenities: ['24/7 Generator', 'WiFi', 'Treated Water']
  })

  // Cloudinary image upload states
  const [uploadedImages, setUploadedImages] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const availableAmenities = [
    '24/7 Generator',
    'WiFi',
    'Treated Water',
    'Air Conditioned',
    'Fitted Kitchen',
    '24h Security Guard',
    'CCTV Monitored',
    'Car Parking',
    'Prepaid Meter'
  ]

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  // Handle Image Upload to Cloudinary via backend API
  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setIsUploading(true)
    setUploadError('')

    try {
      for (const file of files) {
        // Read file as Base64 Data URI
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = (err) => reject(err)
          reader.readAsDataURL(file)
        })

        // Dispatch upload to Cloudinary endpoint
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            folder: 'homiiwrk/apartments'
          })
        })

        if (!res.ok) {
          throw new Error('Upload failed. Please check network connection.')
        }

        const data = await res.json()
        const imageUrl = data.url || base64Data

        setUploadedImages((prev) => [
          ...prev,
          {
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            url: imageUrl,
            isPrimary: prev.length === 0 // First image is default cover
          }
        ])
      }
    } catch (err) {
      setUploadError(err.message || 'Image upload failed. You can continue with default photo.')
    } finally {
      setIsUploading(false)
      // Reset input value so same files can be re-selected if desired
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
    if (!formData.title || !formData.price) return

    const priceNum = parseInt(String(formData.price).replace(/,/g, ''), 10) || 400000
    const agencyNum = parseInt(String(formData.agencyFee).replace(/,/g, ''), 10) || 5000

    const defaultFallbackImage = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80'
    const primaryImg = uploadedImages.find((img) => img.isPrimary)?.url || uploadedImages[0]?.url || defaultFallbackImage
    const galleryUrls = uploadedImages.length > 0 ? uploadedImages.map((img) => img.url) : [defaultFallbackImage]

    const newListing = {
      id: `custom-${Date.now()}`,
      public_id: `custom-pub-${Date.now()}`,
      area_id: Number(formData.area_id),
      title: formData.title,
      category: formData.category === 'flatshare' ? 'Flatshare' : (formData.category === 'serviced' ? 'Serviced' : 'Co-living'),
      accommodation_type: formData.category,
      unit_type: formData.category === 'flatshare' ? 'two_bed' : 'self_contain',
      total_spaces: 2,
      totalSpaces: 2,
      available_spaces: Number(formData.spaces) || 1,
      availableSpaces: Number(formData.spaces) || 1,
      status: 'active',
      distance: 8,
      distanceText: '8 mins to Transit & Hubs',
      rent_kobo: priceNum * 100,
      price: priceNum,
      priceFormatted: `₦${priceNum.toLocaleString()}`,
      rent_period: 'annual',
      billingCycle: 'Annual rent · Standard tenancy',
      agencyFee_kobo: agencyNum * 100,
      agencyFee: agencyNum,
      agencyFeeFormatted: `₦${agencyNum.toLocaleString()}`,
      listerType: listerType,
      listerName: formData.listerName || (listerType === 'agent' ? 'Premier Realty Agent' : 'Verified Flatmate'),
      listerRole: listerType === 'agent' ? 'Licensed Property Agent' : 'Current Tenant / Flatmate',
      phone: formData.phone,
      listerPhoneMasked: formData.phone ? `+234 ${formData.phone.replace(/\D/g, '').slice(-10, -5)} ••• ••` : '+234 905 ••• ••33',
      listerRating: 5.0,
      rating: 5.0,
      reviewCount: 1,
      targetAudience: 'Students & Young Professionals',
      description: formData.description || 'Newly listed verified accommodation with uninterrupted electricity and clean water.',
      fullDescription: formData.description || 'Spacious, well-ventilated apartment situated in a gated security perimeter with reliable backup power, treated water, and quick transit links.',
      amenities: formData.amenities.map((text) => ({ icon: 'check_circle', text })),
      image: primaryImg,
      gallery: galleryUrls,
      address: formData.address_line || 'GRA Ikeja, Lagos',
      location: formData.address_line || 'GRA Ikeja, Lagos',
      verifiedLandlord: formData.listerName || 'Verified Property Manager',
      depositEscrow: true,
      inspectionFeeNotice: 'Agency pairing fee (₦5,000) paid directly on WhatsApp'
    }

    // Persist to backend database and use the canonical saved record across Home + Dashboard + Detail Page
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
    setIsSubmitted(true)
    setTimeout(() => {
      onClose?.()
    }, 1500)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="list-apartment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="list-modal-header">
          <div>
            <h3 className="list-modal-title">List Your Apartment or Flatshare</h3>
            <p className="list-modal-subtitle">
              Open to both individuals (current tenants seeking flatmates) and licensed real estate agents.
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {isSubmitted ? (
          <div className="list-success-view">
            <span className="material-symbols-outlined text-[48px] text-emerald-500">check_circle</span>
            <h4>Apartment Listed Successfully!</h4>
            <p>Your listing is now live in the Homiiwrk directory and saved to your personal dashboard.</p>
          </div>
        ) : (
          <form className="list-modal-form" onSubmit={handleSubmit}>
            {/* Lister Role Switcher */}
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
                  <p>I live here or hold the tenancy, looking for a roommate/sublet</p>
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
                  <p>I represent the property and manage tenant placement</p>
                </div>
              </label>
            </div>

            {/* Inputs Grid */}
            <div className="form-grid-2">
              <div className="modal-form-group">
                <label>Listing Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Spacious En-Suite Flatshare in GRA Ikeja"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="modal-form-group">
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

              <div className="modal-form-group">
                <label>Target Location / Hub *</label>
                <select
                  value={formData.area_id}
                  onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                >
                  {AREAS.filter((a) => a.id !== 100).map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label>Address / Street Line</label>
                <input
                  type="text"
                  placeholder="e.g. Off Isaac John, Ikeja GRA, Lagos"
                  value={formData.address_line}
                  onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                />
              </div>

              <div className="modal-form-group">
                <label>Annual Rent (₦) *</label>
                <input
                  type="number"
                  placeholder="e.g. 450000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Agency / Connection Fee (₦) *</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={formData.agencyFee}
                  onChange={(e) => setFormData({ ...formData, agencyFee: e.target.value })}
                  required
                />
                <span className="input-hint">Paid directly on WhatsApp prior to physical inspection</span>
              </div>

              <div className="modal-form-group">
                <label>Your Name / Business Name *</label>
                <input
                  type="text"
                  placeholder={listerType === 'agent' ? 'e.g. Bluecrest Realty Ltd' : 'e.g. Tunde Adeleke'}
                  value={formData.listerName}
                  onChange={(e) => setFormData({ ...formData, listerName: e.target.value })}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label>Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. 0905 574 8233"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Apartment Image Upload Section */}
            <div className="modal-form-group full-width image-upload-wrapper">
              <label>Apartment &amp; Shared Room Photos *</label>

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
                    Upload photos of the bedroom, living room, kitchen &amp; restroom (PNG, JPG, WebP)
                  </p>
                </div>
              </label>

              {uploadError && (
                <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                  {uploadError}
                </p>
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
            </div>

            <div className="modal-form-group full-width">
              <label>Description &amp; House Rules</label>
              <textarea
                rows="3"
                placeholder="Mention quiet hours, generator schedules, preferred roommate habits, or transport conveniences..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Amenities Checkboxes */}
            <div className="modal-form-group full-width">
              <label>Available Amenities</label>
              <div className="amenity-checkboxes-grid">
                {availableAmenities.map((amenity) => (
                  <label key={amenity} className="amenity-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-submit-listing" disabled={isUploading}>
                {isUploading ? 'Uploading Photos...' : 'Publish Listing'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
