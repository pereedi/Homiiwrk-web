import React, { useState, useRef, useEffect } from 'react'
import { HERO_ROOM_SCENES } from '../data/heroTourData'

export default function InteractiveHeroMedia({ onOpenFullTour }) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [activeHotspotId, setActiveHotspotId] = useState(null)
  const [mediaMode, setMediaMode] = useState('video') // 'video' | 'gif'
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  const videoRef = useRef(null)

  const activeScene = HERO_ROOM_SCENES[currentSceneIndex]

  // Subtle interactive parallax pan based on mouse coordinates
  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5
    setPanOffset({
      x: xRatio * 20, // max 20px pan
      y: yRatio * 15
    })
  }

  const handleMouseLeave = () => {
    setPanOffset({ x: 0, y: 0 })
    setActiveHotspotId(null)
  }

  const togglePlayPause = (e) => {
    e.stopPropagation()
    setIsPlaying(!isPlaying)
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const toggleHotspot = (id, e) => {
    e.stopPropagation()
    setActiveHotspotId(activeHotspotId === id ? null : id)
  }

  return (
    <div className="hero-media-wrapper">
      {/* The House-Shaped Pentagon Silhouette */}
      <div
        className="house-silhouette-shape"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="house-media-container">
          {/* Top Live Badge */}
          <div className="house-top-badge">
            <span className="live-pulse-dot"></span>
            <span>INTERACTIVE 3D TOUR</span>
          </div>

          {/* Scene Switcher Tabs (Roof Area) */}
          <div className="house-scene-nav">
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

          {/* Media Asset with interactive pan/zoom */}
          <div
            style={{
              width: '100%',
              height: '100%',
              transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
              transition: panOffset.x === 0 ? 'transform 0.5s ease-out' : 'none'
            }}
          >
            {mediaMode === 'video' ? (
              /* Simulated High-Res Video Walkthrough with smooth motion */
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={activeScene.image}
                  alt={activeScene.title}
                  className={`house-media-asset ${isPlaying ? 'animated-ken-burns' : ''}`}
                  style={{
                    animationPlayState: isPlaying ? 'running' : 'paused'
                  }}
                />
              </div>
            ) : (
              /* Animated GIF Loop mode */
              <img
                src={activeScene.image}
                alt={activeScene.title}
                className="house-media-asset"
              />
            )}
          </div>

          {/* Vignette & Contrast Overlay */}
          <div className="house-gradient-overlay" />

          {/* Interactive Hotspot Markers */}
          {activeScene.hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className={`interactive-hotspot ${activeHotspotId === hotspot.id ? 'active' : ''}`}
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`
              }}
              onClick={(e) => toggleHotspot(hotspot.id, e)}
            >
              <div className="hotspot-beacon">
                <span className="hotspot-ring"></span>
                <span className="hotspot-core"></span>
              </div>

              {/* Hotspot Tooltip Card */}
              {activeHotspotId === hotspot.id && (
                <div
                  className="hotspot-tooltip"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h5>
                    <span>{hotspot.label}</span>
                    <span
                      style={{ cursor: 'pointer', opacity: 0.7 }}
                      onClick={() => setActiveHotspotId(null)}
                    >
                      ✕
                    </span>
                  </h5>
                  <p>{hotspot.detail}</p>
                </div>
              )}
            </div>
          ))}

          {/* Floating Tour Controls at bottom of shape */}
          <div className="house-media-controls">
            <button
              type="button"
              className="control-pill-btn"
              onClick={togglePlayPause}
              title={isPlaying ? 'Pause walkthrough' : 'Play walkthrough'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
              <span>{isPlaying ? 'Pause' : 'Tour'}</span>
            </button>

            <button
              type="button"
              className="control-pill-btn"
              onClick={(e) => {
                e.stopPropagation()
                onOpenFullTour?.(activeScene)
              }}
            >
              <span className="material-symbols-outlined text-[16px]">
                360
              </span>
              <span>360° View</span>
            </button>

            <button
              type="button"
              className="control-pill-btn"
              onClick={(e) => {
                e.stopPropagation()
                setMediaMode(mediaMode === 'video' ? 'gif' : 'video')
              }}
              title="Toggle HD Video / Low Data GIF Mode"
            >
              <span className="material-symbols-outlined text-[16px]">
                {mediaMode === 'video' ? 'hd' : 'gif'}
              </span>
              <span>{mediaMode === 'video' ? 'HD' : 'GIF'}</span>
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
