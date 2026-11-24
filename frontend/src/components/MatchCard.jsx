import React, { useState } from 'react'
import { requestRoommateIntro } from '../lib/lydiaApi'

export default function MatchCard({ peer, onSelectListing }) {
  const [introStatus, setIntroStatus] = useState('idle') // 'idle' | 'requesting' | 'accepted'
  const [whatsappUrl, setWhatsappUrl] = useState(null)
  const [error, setError] = useState(null)

  const handleRequestIntro = async () => {
    setIntroStatus('requesting')
    setError(null)
    try {
      const res = await requestRoommateIntro(peer.id)
      if (res.success && res.whatsapp_url) {
        setWhatsappUrl(res.whatsapp_url)
        setIntroStatus('accepted')
      } else {
        setIntroStatus('idle')
      }
    } catch (err) {
      setError(err.message)
      setIntroStatus('idle')
    }
  }

  // Initials for avatar
  const initials = peer.name
    ? peer.name
        .split(' ')
        .filter((w) => !w.startsWith('(') && !w.startsWith('Dr.'))
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'HM'

  return (
    <div className="lydia-peer-card">
      <div className="lydia-peer-top">
        <div className="lydia-peer-avatar-wrap">
          <div className="lydia-peer-avatar">{initials}</div>
          <div className="lydia-peer-details">
            <h4>{peer.name}</h4>
            <p>
              {peer.faculty} • {peer.level}
            </p>
          </div>
        </div>
        <div className="lydia-peer-score">{peer.match_score || 92}% Match</div>
      </div>

      <div className="lydia-peer-meta-list">
        <div className="lydia-peer-meta-row">
          <span className="lydia-peer-meta-label">Preferred Hub</span>
          <span className="lydia-peer-meta-val">{peer.area_name || 'GRA / College Gate'}</span>
        </div>
        <div className="lydia-peer-meta-row">
          <span className="lydia-peer-meta-label">Target Budget</span>
          <span className="lydia-peer-meta-val" style={{ color: '#059669' }}>
            {peer.budget_range || '₦350k - ₦500k'}
          </span>
        </div>
        <div className="lydia-peer-meta-row" style={{ gridColumn: 'span 2' }}>
          <span className="lydia-peer-meta-label">Study Schedule</span>
          <span className="lydia-peer-meta-val">{peer.study_hours || 'Flexible / Clinical rotations'}</span>
        </div>
      </div>

      <div className="lydia-peer-traits">
        {(peer.lifestyle || ['Quiet Hours', 'Non-smoker', 'Inverter Split']).map((trait, idx) => (
          <span key={idx} className="lydia-trait-chip">
            {trait}
          </span>
        ))}
      </div>

      <div className="lydia-peer-actions">
        {introStatus === 'accepted' && whatsappUrl ? (
          <div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="lydia-btn-whatsapp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              Continue Introduction on WhatsApp
            </a>
            <div style={{ fontSize: '0.72rem', color: '#059669', textAlign: 'center', marginTop: '6px' }}>
              ✓ Mutual protocol satisfied. WhatsApp conversation ready.
            </div>
          </div>
        ) : (
          <button
            onClick={handleRequestIntro}
            disabled={introStatus === 'requesting'}
            className={`lydia-btn-intro ${introStatus === 'requesting' ? 'pending' : ''}`}
          >
            {introStatus === 'requesting' ? (
              'Brokering Introduction via Lydia...'
            ) : (
              <>
                <span>🤝</span> Request Mutual Introduction
              </>
            )}
          </button>
        )}
        {error && <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '4px' }}>{error}</div>}
      </div>
    </div>
  )
}
