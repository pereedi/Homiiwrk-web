import React, { useState } from 'react'
import { HERO_ROOM_SCENES } from '../data/heroTourData'

export default function FullTourModal({ initialScene, onClose, onBookInspection }) {
  const [selectedScene, setSelectedScene] = useState(initialScene || HERO_ROOM_SCENES[0])
  const [activeHotspot, setActiveHotspot] = useState(null)
  const [is360Active, setIs360Active] = useState(true)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '64rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close Tour"
        >
          ✕
        </button>

        {/* 360 Viewing Window */}
        <div style={{ position: 'relative', height: '400px', backgroundColor: '#000c1d', overflow: 'hidden' }}>
          <img
            src={selectedScene.image}
            alt={selectedScene.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.95)'
            }}
          />

          <div className="house-gradient-overlay" />

          {/* Top Info Strip */}
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              zIndex: 10
            }}
          >
            <div className="house-top-badge" style={{ position: 'static', transform: 'none' }}>
              <span className="live-pulse-dot"></span>
              <span>IMMERSIVE 360° INSPECTION</span>
            </div>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {selectedScene.title}
            </span>
          </div>

          {/* Hotspots */}
          {selectedScene.hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className={`interactive-hotspot ${activeHotspot?.id === hotspot.id ? 'active' : ''}`}
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`
              }}
              onClick={() => setActiveHotspot(activeHotspot?.id === hotspot.id ? null : hotspot)}
            >
              <div className="hotspot-beacon">
                <span className="hotspot-ring"></span>
                <span className="hotspot-core"></span>
              </div>

              {activeHotspot?.id === hotspot.id && (
                <div className="hotspot-tooltip" onClick={(e) => e.stopPropagation()}>
                  <h5>
                    <span>{hotspot.label}</span>
                    <span style={{ cursor: 'pointer' }} onClick={() => setActiveHotspot(null)}>✕</span>
                  </h5>
                  <p>{hotspot.detail}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Scene Selection Thumbnails & Controls */}
        <div style={{ padding: '1.25rem 2rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                Select Room / Zone to Inspect
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
                Verified actual unit located 5 minutes from LASUCOM Anatomy Hall.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-book-inspection"
                onClick={() => {
                  onBookInspection?.()
                  onClose()
                }}
              >
                Book In-Person Inspection
              </button>
            </div>
          </div>

          {/* Scene Switcher Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {HERO_ROOM_SCENES.map((scene) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => {
                  setSelectedScene(scene)
                  setActiveHotspot(null)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: selectedScene.id === scene.id ? 'var(--color-surface-container)' : 'var(--color-surface-container-low)',
                  border: selectedScene.id === scene.id ? '2px solid var(--color-secondary)' : '1px solid rgba(196, 198, 207, 0.3)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <img
                  src={scene.image}
                  alt={scene.name}
                  style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                />
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {scene.name}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
                    {scene.badge}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
