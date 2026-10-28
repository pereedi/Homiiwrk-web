import React from 'react'
import { CATEGORIES } from '../data/properties'

export default function FilterBar({
  selectedCategory,
  onSelectCategory,
  count,
  sortBy,
  onSortChange,
  onResetFilters
}) {
  return (
    <section className="sticky-filter-bar">
      <div className="container filter-bar-inner">
        {/* Category Chips Scroll */}
        <div className="category-chips-scroll" id="category-filter-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat)}
            >
              {cat === 'All' ? 'All' : cat === 'Hostel' ? 'Hostels' : cat}
            </button>
          ))}
        </div>

        {/* Controls & Counts */}
        <div className="filter-controls">
          <span className="verified-count-label">
            <strong>{count}</strong> verified stays
          </span>

          <button
            type="button"
            className="btn-filter-tune"
            onClick={onResetFilters}
            title="Reset filters"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Filters ({selectedCategory === 'All' ? '3' : '4'})</span>
          </button>

          <div className="sort-select-wrapper">
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort properties"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="price-low">Price: Lowest First</option>
              <option value="distance">Proximity to LASUCOM</option>
            </select>
            <span className="material-symbols-outlined sort-select-icon">
              expand_more
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
