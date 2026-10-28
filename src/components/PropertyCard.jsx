import React from 'react'

export default function PropertyCard({ property, isFavorited, onToggleFavorite, onViewStay }) {
  return (
    <article className="property-card" data-category={property.category} data-price={property.price}>
      <div className="card-media-wrapper">
        <img
          src={property.image}
          alt={property.title}
          className="card-img"
          loading="lazy"
        />
        <div className="card-media-overlay" />

        {/* Verified by Homiiwrk Badge */}
        <div className="card-verified-tag">
          <span
            className="material-symbols-outlined text-[14px]"
            style={{ color: 'var(--color-on-tertiary-container)', fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
          <span>Verified by Homiiwrk</span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          aria-label="Save Property"
          className={`card-fav-btn ${isFavorited ? 'favorited' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(property.id)
          }}
        >
          <span className="material-symbols-outlined text-[18px]">
            favorite
          </span>
        </button>

        {/* Walking Distance Tag */}
        <div className="card-distance-tag">
          <span className="material-symbols-outlined text-[14px]">
            directions_walk
          </span>
          <span>{property.distanceText}</span>
        </div>
      </div>

      <div className="card-content">
        <div>
          <div className="card-meta-row">
            <span className="card-category-badge">{property.category}</span>
            <span className="card-rating">
              <span className="material-symbols-outlined rating-star-icon">
                star
              </span>
              <span>{property.rating} ({property.reviewCount} reviews)</span>
            </span>
          </div>

          <h3
            className="card-title"
            style={{ cursor: 'pointer' }}
            onClick={() => onViewStay(property)}
          >
            {property.title}
          </h3>

          <p className="card-description">{property.description}</p>

          {/* Amenities Pills */}
          <div className="card-amenities-row">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="amenity-pill">
                <span className="material-symbols-outlined">
                  {amenity.icon}
                </span>
                <span>{amenity.text}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="card-footer">
          <div>
            <p className="card-price-amount">{property.priceFormatted}</p>
            <p className="card-price-cycle">{property.billingCycle}</p>
          </div>

          <button
            type="button"
            className="btn-view-stay"
            onClick={() => onViewStay(property)}
          >
            View Stay
          </button>
        </div>
      </div>
    </article>
  )
}
