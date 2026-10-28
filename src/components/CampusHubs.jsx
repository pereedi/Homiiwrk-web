import React from 'react'
import { CAMPUS_HUBS } from '../data/properties'

export default function CampusHubs({ onSelectHub }) {
  return (
    <section className="campus-hubs-section" id="campus-hubs">
      <div className="container">
        <div className="hubs-header">
          <h3 className="hubs-title">
            Popular Housing Hubs Around LASUCOM
          </h3>
          <p className="hubs-subtitle">
            Direct pedestrian routes, campus shuttle access, and security ratings.
          </p>
        </div>

        <div className="hubs-grid">
          {CAMPUS_HUBS.map((hub, idx) => (
            <div
              key={idx}
              className="hub-card"
              onClick={() => onSelectHub?.(hub.title)}
            >
              <p className="hub-title">{hub.title}</p>
              <p className="hub-desc">{hub.sub}</p>
              <span className="hub-badge">{hub.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
