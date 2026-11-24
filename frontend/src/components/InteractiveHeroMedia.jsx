import React, { useState, useRef } from 'react'
import { HERO_ROOM_SCENES } from '../data/heroTourData'

export default function InteractiveHeroMedia({ onOpenFullTour }) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [activeHotspotId, setActiveHotspotId] = useState(null)
  const [mediaMode, setMediaMode] = useState('video') // 'video' | 'gif'
  const [shape, setShape] = useState('square') // 'square' | 'house'
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const activeScene = HERO_ROOM_SCENES[currentSceneIndex]

  // Subtle interactive parallax pan
  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5
    setPanOffset({ x: xRatio * 16, y: yRatio * 12 })
  }

  const handleMouseLeave = () => {
    setPanOffset({ x: 0, y: 0 })
    setActiveHotspotId(null)
  }

  const togglePlayPause = (e) => {
    e.stopPropagation()
    setIsPlaying((prev) => !prev)
  }

  const toggleHotspot = (id, e) => {
    e.stopPropagation()
    setActiveHotspotId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="hero-media-wrapper">
      {/* Media Frame (Rounded Square with optional House toggle) */}
      <div
        className={`hero-media-frame ${shape === 'house' ? 'shape-house' : 'shape-square'}`}
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="hero-media-container">
          {/* Top Bar: Live Status & Scene Switcher */}
          <div className="hero-media-topbar">
            <div className="hero-top-badge">
              <span className="live-pulse-dot" />
              <span>3D TOUR</span>
            </div>

            <div className="hero-scene-nav">
              {HERO_ROOM_SCENES.map((scene, idx) => (
                <button
                  key={scene.id}
                  type="button"
                  className={`scene-tab-btn ${currentSceneIndex === idx ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentSceneIndex(idx)
                    setActiveHotspotId(null)
                  }}
                >
                  {scene.name}
                </button>
              ))}
            </div>
          </div>

          {/* Media Canvas with Smooth Pan & Natural Aspect Framing */}
          <div
            className="hero-media-canvas"
            style={{
              transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
              transition: panOffset.x === 0 ? 'transform 0.4s ease-out' : 'none'
            }}
          >
            <img
              src={activeScene.image}
              alt={activeScene.title}
              className={`hero-media-img ${mediaMode === 'video' && isPlaying ? 'animated-ken-burns' : ''}`}
            />
          </div>

          {/* Contrast & Vignette Gradient */}
          <div className="hero-gradient-overlay" />

          {/* Interactive Feature Hotspots */}
          {activeScene.hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className={`interactive-hotspot ${activeHotspotId === hotspot.id ? 'active' : ''}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              onClick={(e) => toggleHotspot(hotspot.id, e)}
            >
              <div className="hotspot-beacon">
                <span className="hotspot-ring" />
                <span className="hotspot-core" />
              </div>

              {activeHotspotId === hotspot.id && (
                <div className="hotspot-tooltip" onClick={(e) => e.stopPropagation()}>
                  <h5>
                    <span>{hotspot.label}</span>
                    <button
                      type="button"
                      className="hotspot-close-btn"
                      onClick={() => setActiveHotspotId(null)}
                    >
                      ✕
                    </button>
                  </h5>
                  <p>{hotspot.detail}</p>
                </div>
              )}
            </div>
          ))}

          {/* Floating Tour Controls */}
          <div className="hero-media-controls">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="control-pill-btn"
                onClick={togglePlayPause}
                title={isPlaying ? 'Pause walkthrough' : 'Play walkthrough'}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                type="button"
                className="control-pill-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenFullTour?.(activeScene)
                }}
              >
                <span className="material-symbols-outlined text-[16px]">360</span>
                <span>360°</span>
              </button>

              <button
                type="button"
                className="control-pill-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setMediaMode((m) => (m === 'video' ? 'gif' : 'video'))
                }}
                title="Toggle HD Tour / GIF Loop"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {mediaMode === 'video' ? 'hd' : 'gif'}
                </span>
                <span>{mediaMode === 'video' ? 'HD' : 'GIF'}</span>
              </button>
            </div>

            {/* Shape Switcher: Rounded Square vs House Silhouette */}
            <button
              type="button"
              className="control-pill-btn control-shape-toggle"
              onClick={(e) => {
                e.stopPropagation()
                setShape((s) => (s === 'square' ? 'house' : 'square'))
              }}
              title={shape === 'square' ? 'Switch to House Silhouette' : 'Switch to Rounded Square'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {shape === 'square' ? 'crop_square' : 'roofing'}
              </span>
              <span>{shape === 'square' ? 'Square' : 'House'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Verified LASUCOM Residence Card */}
      <div className="hero-floating-residence-card">
        <div className="verified-card-left">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ color: 'var(--color-tertiary-fixed-dim)', fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
          <div>
            <p className="verified-card-title">Verified LASUCOM Residence</p>
            <p className="verified-card-sub">Zero duplicate inspection fees</p>
          </div>
        </div>
        <span className="verified-card-distance">5 mins away</span>
      </div>
    </div>
  )
}

