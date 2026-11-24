import React from 'react'
import PropertyCard from './PropertyCard'

export default function ListingsSection({
  properties,
  favorites,
  onToggleFavorite,
  onViewStay,
  onResetFilters
}) {
  return (
    <section className="listings-section" id="property-directory">
      <div className="container">
        {/* Section Header */}
        <div className="listings-header">
          <div>
            <h2 className="listings-title">
              Explore Verified Accommodations
            </h2>
            <p className="listings-subtitle">
              Find apartments, flatshares, and serviced studios for young professionals &amp; students across Ikeja.
            </p>
          </div>

          <div className="proximity-badge">
            <span className="material-symbols-outlined text-[16px]">
              handshake
            </span>
            <span>Direct Pairing with Agents &amp; Verified Flatmates</span>
          </div>
        </div>

        {/* Listings Grid */}
        {properties.length > 0 ? (
          <div className="listings-grid" id="listings-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorited={favorites.includes(property.id)}
                onToggleFavorite={onToggleFavorite}
                onViewStay={onViewStay}
              />
            ))}
          </div>
        ) : (
          /* Empty State when filter yields 0 matches */
          <div className="empty-results-state" id="no-results-state">
            <div className="empty-state-icon-box">
              <span className="material-symbols-outlined text-[28px]">
                search_off
              </span>
            </div>
            <h4 className="empty-state-title">
              No accommodation matches this category yet
            </h4>
            <p className="empty-state-text">
              Our on-ground student verification team is constantly adding inspected stays in Ikeja.
            </p>
            <button
              type="button"
              className="btn-reset-filters"
              onClick={onResetFilters}
            >
              Show All Available Listings
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
