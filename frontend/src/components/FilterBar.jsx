import React from 'react'
import { CATEGORIES, AREAS } from '../data/properties'

export default function FilterBar({
  selectedCategory,
  onSelectCategory,
  selectedAreaId = 100,
  onSelectArea,
  count,
  sortBy,
  onSortChange,
  onResetFilters
}) {
  const activeArea = AREAS.find((a) => a.id === selectedAreaId) || AREAS[0]

  return (
    <section className="sticky-filter-bar">
      <div className="container filter-bar-inner">
        {/* Left Side: Category Chips Scroll */}
        <div className="category-chips-scroll" id="category-filter-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right Side: Area Filter + Sort Controls */}
        <div className="filter-controls">
          {/* Quick Area Filter Pill */}
          <div className="area-filter-select-wrapper">
            <span className="material-symbols-outlined text-[16px] text-tertiary">
              location_on
            </span>
            <select
              className="area-filter-select"
              value={selectedAreaId}
              onChange={(e) => onSelectArea?.(Number(e.target.value))}
              aria-label="Filter by campus area"
            >
              {AREAS.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.shortName}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined sort-select-icon">
              expand_more
            </span>
          </div>

          <span className="verified-count-label">
            <strong>{count}</strong> {count === 1 ? 'stay' : 'stays'} in {activeArea.shortName}
          </span>

          {(selectedCategory !== 'All' || selectedAreaId !== 100) && (
            <button
              type="button"
              className="btn-filter-tune"
              onClick={onResetFilters}
              title="Reset all filters"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset</span>
            </button>
          )}

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

