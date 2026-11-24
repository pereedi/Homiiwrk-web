import React from 'react'

export default function ProfilePanel({ inferredState, onSelectArea, onReset }) {
  const {
    area_name = 'All LASUCOM Hubs',
    budget_formatted = '₦350,000 - ₦600,000',
    accommodation_type = 'Self-Contain / Flatshare',
    faculty = 'Medicine & Surgery (MBBS)',
    level = 'Clinical Student',
    lifestyle = ['Quiet Hours', 'No Smoking', 'Inverter Split']
  } = inferredState || {}

  return (
    <aside className="lydia-profile-inspector" aria-label="Lydia Profile Context">
      <div className="lydia-inspector-header">
        <h4>
          <span>🛡️</span> Search Context
        </h4>
        <p>Inferred dynamically from your consultation with Lydia.</p>
      </div>

      <div className="lydia-inspector-item">
        <span className="lydia-inspector-label">Target Hub</span>
        <span className="lydia-inspector-val">{area_name}</span>
      </div>

      <div className="lydia-inspector-item">
        <span className="lydia-inspector-label">Budget Range</span>
        <span className="lydia-inspector-val" style={{ color: '#059669' }}>
          {budget_formatted}
        </span>
      </div>

      <div className="lydia-inspector-item">
        <span className="lydia-inspector-label">Housing Format</span>
        <span className="lydia-inspector-val">{accommodation_type}</span>
      </div>

      <div className="lydia-inspector-item">
        <span className="lydia-inspector-label">Academic Peer Profile</span>
        <span className="lydia-inspector-val">{faculty}</span>
        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{level}</span>
      </div>

      <div className="lydia-inspector-item">
        <span className="lydia-inspector-label">Compatibility Criteria</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
          {lifestyle.map((item, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.72rem',
                background: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: '12px',
                color: '#334155'
              }}
            >
              ✓ {item}
            </span>
          ))}
        </div>
      </div>

      <div className="lydia-privacy-note">
        <strong>Formal Privacy Guarantee:</strong> Your phone number and direct contact details remain completely confidential until mutual consent is explicitly granted for an introduction.
      </div>
    </aside>
  )
}
