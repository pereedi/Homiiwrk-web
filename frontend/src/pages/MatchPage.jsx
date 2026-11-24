import React, { useState, useEffect } from 'react'
import { PEER_PROFILES } from '../data/peerProfiles'
import { AREAS, PROPERTIES } from '../data/properties'
import LydiaChat from '../components/lydia/LydiaChat'
import ProfilePanel from '../components/lydia/ProfilePanel'
import MatchCard from '../components/MatchCard'
import { fetchRoommates } from '../lib/lydiaApi'

export default function MatchPage({ onNavigateHome, onSelectProperty, onApplyLocationFilter }) {
  // Tabs: 'lydia' (AI Concierge) | 'roster' (Peer Matches) | 'profile' (My Bio)
  const [activeTab, setActiveTab] = useState('lydia')
  const [facultyFilter, setFacultyFilter] = useState('All')

  // Dynamic Inferred Profile State (Synced via Lydia Conversation)
  const [inferredState, setInferredState] = useState({
    area_name: 'GRA / College Gate',
    budget_formatted: '₦350,000 - ₦550,000',
    accommodation_type: 'Self-Contain or 2-Bed Flatshare',
    faculty: 'Medicine & Surgery (MBBS)',
    level: 'Clinical Scholar',
    lifestyle: ['Quiet Hours', 'No Smoking', 'Inverter Split', 'Clean Water']
  })

  // Live Peer Matches from Backend
  const [livePeers, setLivePeers] = useState([])
  const [loadingPeers, setLoadingPeers] = useState(false)

  // Traditional Quiz Fallback State
  const [showTraditionalQuiz, setShowTraditionalQuiz] = useState(false)
  const [quizStep, setQuizStep] = useState(1)
  const [facultyChoice, setFacultyChoice] = useState('Medicine & Surgery (Clinicals)')
  const [studyRhythm, setStudyRhythm] = useState('Night Owl (Quiet ward reading till 2:30 AM)')
  const [quietHours, setQuietHours] = useState('Strict 10:30 PM quiet time')
  const [budgetTier, setBudgetTier] = useState('₦350,000 - ₦500,000 / session')
  const [preferredAreaId, setPreferredAreaId] = useState(101)
  const [isQuizCompleted, setIsQuizCompleted] = useState(false)

  // Bio Form State
  const [bioName, setBioName] = useState('')
  const [bioFaculty, setBioFaculty] = useState('MBBS Medicine & Surgery')
  const [bioLevel, setBioLevel] = useState('400L Clinicals')
  const [bioBudget, setBioBudget] = useState('₦400,000')
  const [bioLocation, setBioLocation] = useState('GRA Ikeja Perimeter')
  const [bioText, setBioText] = useState('')
  const [bioSubmitted, setBioSubmitted] = useState(false)

  // Load Peer Matches from API on mount
  useEffect(() => {
    async function loadPeers() {
      setLoadingPeers(true)
      try {
        const peers = await fetchRoommates()
        if (peers && peers.length > 0) {
          setLivePeers(peers)
        } else {
          setLivePeers(PEER_PROFILES)
        }
      } catch (e) {
        setLivePeers(PEER_PROFILES)
      } finally {
        setLoadingPeers(false)
      }
    }
    loadPeers()
  }, [])

  // Filter peers by selected faculty
  const filteredPeers = (livePeers.length > 0 ? livePeers : PEER_PROFILES).filter((peer) => {
    if (facultyFilter === 'All') return true
    return (peer.faculty || '').toLowerCase().includes(facultyFilter.toLowerCase())
  })

  const matchedApartments = PROPERTIES.filter((p) => {
    if (preferredAreaId === 100) return true
    return p.area_id === preferredAreaId
  })

  const activeSelectedArea = AREAS.find((a) => a.id === preferredAreaId) || AREAS[0]

  const handleQuizNext = () => {
    if (quizStep < 5) {
      setQuizStep(quizStep + 1)
    } else {
      setIsQuizCompleted(true)
    }
  }

  const handlePostBioSubmit = (e) => {
    e.preventDefault()
    setBioSubmitted(true)
  }

  return (
    <div className="match-page">
      {/* Hero Section */}
      <section className="match-hero-section">
        <div className="container relative">
          <div className="match-breadcrumb">
            <button
              onClick={onNavigateHome}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
            >
              ← Back to Accommodations
            </button>
            <span>/</span>
            <span>Lydia AI Concierge & Roommate Match</span>
          </div>

          <div className="match-hero-badge">
            <span className="live-pulse-dot" />
            <span>AI Housing Concierge • Young Professionals &amp; Students Network</span>
          </div>

          <h1 className="match-hero-title">
            Intelligent Accommodations &amp; Flatmate Matching
          </h1>

          <p className="match-hero-desc">
            Consult Lydia, our AI residential concierge, for verified apartments, flatshare pairings, budget calculations, and verified connection handoffs before inspection.
          </p>

          <div className="match-stats-grid">
            <div className="match-stat-box">
              <p className="match-stat-number">100%</p>
              <p className="match-stat-label">Verified Users &amp; Agents</p>
            </div>
            <div className="match-stat-box">
              <p className="match-stat-number">&lt; 8 mins</p>
              <p className="match-stat-label">Average Transit Walk Time</p>
            </div>
            <div className="match-stat-box">
              <p className="match-stat-number">Escrow</p>
              <p className="match-stat-label">Safe Agency Fee Protection</p>
            </div>
            <div className="match-stat-box">
              <p className="match-stat-number">WhatsApp</p>
              <p className="match-stat-label">Direct Pairing &amp; Pass ID</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Bar */}
      <div className="match-nav-tabs-wrapper">
        <div className="container">
          <div className="match-tabs-bar">
            <button
              type="button"
              className={`match-tab-btn ${activeTab === 'lydia' ? 'active' : ''}`}
              onClick={() => setActiveTab('lydia')}
            >
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>Chat with Lydia (Concierge)</span>
            </button>

            <button
              type="button"
              className={`match-tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
              onClick={() => setActiveTab('roster')}
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              <span>Verified Peer Matches ({filteredPeers.length})</span>
            </button>

            <button
              type="button"
              className={`match-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>My Seeker Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="container match-page-body" style={{ marginTop: '28px' }}>
        {/* ========================================= */}
        {/* TAB 1: LYDIA AI CONCIERGE WORKSPACE */}
        {/* ========================================= */}
        {activeTab === 'lydia' && (
          <div>
            <div className="lydia-workspace">
              {/* Primary Chat Window */}
              <LydiaChat
                onSelectProperty={onSelectProperty}
                onInferredStateChange={setInferredState}
                onSwitchToTraditionalQuiz={() => setShowTraditionalQuiz(!showTraditionalQuiz)}
              />

              {/* Live Context Inspector */}
              <ProfilePanel
                inferredState={inferredState}
                onSelectArea={(area) => setInferredState((prev) => ({ ...prev, area_name: area }))}
              />
            </div>

            {/* Optional Collapsible Traditional Form */}
            {showTraditionalQuiz && (
              <div className="quiz-page-container" style={{ marginTop: '32px' }}>
                <div className="quiz-page-header">
                  <h3 className="quiz-page-title">Traditional Step-by-Step Compatibility Form</h3>
                  <p className="quiz-page-sub">
                    Prefer explicit question forms over conversational AI? Complete these 5 quick steps:
                  </p>
                </div>

                <div className="quiz-page-body">
                  {!isQuizCompleted ? (
                    <>
                      <p className="quiz-step-counter">Step {quizStep} of 5</p>
                      <div className="quiz-progress-track">
                        <span className={`quiz-track-segment ${quizStep >= 1 ? 'active' : ''}`} />
                        <span className={`quiz-track-segment ${quizStep >= 2 ? 'active' : ''}`} />
                        <span className={`quiz-track-segment ${quizStep >= 3 ? 'active' : ''}`} />
                        <span className={`quiz-track-segment ${quizStep >= 4 ? 'active' : ''}`} />
                        <span className={`quiz-track-segment ${quizStep >= 5 ? 'active' : ''}`} />
                      </div>

                      {quizStep === 1 && (
                        <div>
                          <h4 className="quiz-main-question">1. What is your faculty or program at LASUCOM?</h4>
                          <div className="quiz-choices-grid">
                            {[
                              { title: 'Medicine & Surgery (Clinicals)', desc: '300L - 600L with ward rounds and clinical postings.' },
                              { title: 'BDS Dentistry', desc: 'Pre-clinical and clinical dental scholars needing focused study zones.' },
                              { title: 'Nursing Sciences', desc: 'Shift rotation schedules and clinical laboratory hours.' },
                              { title: 'Physiology & Anatomy (Basic Medical)', desc: 'Lecture halls, library revision, and research coursework.' }
                            ].map((choice) => (
                              <div
                                key={choice.title}
                                className={`quiz-choice-card ${facultyChoice === choice.title ? 'selected' : ''}`}
                                onClick={() => setFacultyChoice(choice.title)}
                              >
                                <div className="quiz-radio-indicator" />
                                <div className="quiz-choice-content">
                                  <p className="quiz-choice-title">{choice.title}</p>
                                  <p className="quiz-choice-desc">{choice.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {quizStep === 2 && (
                        <div>
                          <h4 className="quiz-main-question">2. What is your primary study rhythm?</h4>
                          <div className="quiz-choices-grid">
                            {[
                              { title: 'Night Owl (Quiet ward reading till 2:30 AM)', desc: 'Requires desk lamp and mutual silent hours late at night.' },
                              { title: 'Early Bird (4:30 AM morning study before rounds)', desc: 'Asleep early around 10 PM and wakes up before dawn.' },
                              { title: 'Library Only (Apartment is purely for resting)', desc: 'Does all revision on campus; home is for sleep and food.' }
                            ].map((choice) => (
                              <div
                                key={choice.title}
                                className={`quiz-choice-card ${studyRhythm === choice.title ? 'selected' : ''}`}
                                onClick={() => setStudyRhythm(choice.title)}
                              >
                                <div className="quiz-radio-indicator" />
                                <div className="quiz-choice-content">
                                  <p className="quiz-choice-title">{choice.title}</p>
                                  <p className="quiz-choice-desc">{choice.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {quizStep === 3 && (
                        <div>
                          <h4 className="quiz-main-question">3. What are your quiet hour preferences?</h4>
                          <div className="quiz-choices-grid">
                            {[
                              { title: 'Strict 10:30 PM quiet time', desc: 'No music, low phone volume, and zero late night guests.' },
                              { title: 'Moderate (Headphones after 11:30 PM)', desc: 'Quiet consideration while accommodating emergency calls.' },
                              { title: 'Flexible (Ward shifts vary unpredictably)', desc: 'Comfortable with irregular sleep cycles during call duties.' }
                            ].map((choice) => (
                              <div
                                key={choice.title}
                                className={`quiz-choice-card ${quietHours === choice.title ? 'selected' : ''}`}
                                onClick={() => setQuietHours(choice.title)}
                              >
                                <div className="quiz-radio-indicator" />
                                <div className="quiz-choice-content">
                                  <p className="quiz-choice-title">{choice.title}</p>
                                  <p className="quiz-choice-desc">{choice.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {quizStep === 4 && (
                        <div>
                          <h4 className="quiz-main-question">4. What is your rent budget share per academic session?</h4>
                          <div className="quiz-choices-grid">
                            {[
                              { title: '₦250,000 - ₦350,000 / session', desc: 'Budget-friendly shared twin apartment or hostel annex.' },
                              { title: '₦350,000 - ₦500,000 / session', desc: 'Standard 2-bedroom flatshare with generator backup.' },
                              { title: '₦500,000 - ₦750,000 / session', desc: 'Premium serviced co-living with 24/7 solar inverter.' }
                            ].map((choice) => (
                              <div
                                key={choice.title}
                                className={`quiz-choice-card ${budgetTier === choice.title ? 'selected' : ''}`}
                                onClick={() => setBudgetTier(choice.title)}
                              >
                                <div className="quiz-radio-indicator" />
                                <div className="quiz-choice-content">
                                  <p className="quiz-choice-title">{choice.title}</p>
                                  <p className="quiz-choice-desc">{choice.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {quizStep === 5 && (
                        <div>
                          <h4 className="quiz-main-question">5. Which campus neighborhood do you want to live in?</h4>
                          <div className="quiz-choices-grid">
                            {AREAS.map((area) => (
                              <div
                                key={area.id}
                                className={`quiz-choice-card ${preferredAreaId === area.id ? 'selected' : ''}`}
                                onClick={() => setPreferredAreaId(area.id)}
                              >
                                <div className="quiz-radio-indicator" />
                                <div className="quiz-choice-content">
                                  <div className="flex items-center justify-between">
                                    <p className="quiz-choice-title">{area.name}</p>
                                    {area.badge && <span className="quiz-area-distance-badge">{area.badge}</span>}
                                  </div>
                                  <p className="quiz-choice-desc">{area.desc || 'Vetted student housing corridor around LASUCOM.'}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="quiz-nav-actions">
                        {quizStep > 1 ? (
                          <button
                            type="button"
                            className="btn-contact-agent"
                            onClick={() => setQuizStep(quizStep - 1)}
                          >
                            ← Back
                          </button>
                        ) : (
                          <div />
                        )}

                        <button
                          type="button"
                          className="btn-hero-primary"
                          onClick={handleQuizNext}
                        >
                          <span>{quizStep === 5 ? 'Filter Verified Accommodations' : 'Continue'}</span>
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="quiz-results-banner">
                      <div className="quiz-result-badge-circle">✓</div>
                      <h3 className="quiz-page-title" style={{ color: 'var(--color-on-surface)', marginBottom: '0.5rem' }}>
                        Match Calculation Complete!
                      </h3>
                      <p className="match-hero-desc" style={{ color: 'var(--color-on-surface-variant)', margin: '0 auto 1.5rem' }}>
                        Matched with verified accommodations in <strong>{activeSelectedArea.name}</strong>.
                      </p>

                      <div className="quiz-matched-apartments-section">
                        <div className="matched-apartments-grid">
                          {matchedApartments.map((prop) => (
                            <div key={prop.id} className="matched-apartment-card">
                              <img src={prop.image} alt={prop.title} className="matched-apt-img" />
                              <div className="matched-apt-info">
                                <h5 className="matched-apt-title">{prop.title}</h5>
                                <p className="matched-apt-price">{prop.priceFormatted}</p>
                                <button
                                  type="button"
                                  className="btn-matched-view"
                                  onClick={() => onSelectProperty?.(prop)}
                                >
                                  Inspect Details
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 2: VERIFIED PEER MATCHES & WHATSAPP */}
        {/* ========================================= */}
        {activeTab === 'roster' && (
          <div>
            <div className="roster-header-bar">
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
                  Verified LASUCOM Flatmate Candidates
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#64748b' }}>
                  Lydia brokers mutual introductions. Direct WhatsApp contact is released only when both scholars grant consent.
                </p>
              </div>

              {/* Faculty Filter Chips */}
              <div className="roster-filter-chips">
                {['All', 'Medicine', 'Dentistry', 'Nursing', 'Physiotherapy'].map((fac) => (
                  <button
                    key={fac}
                    type="button"
                    className={`category-chip ${facultyFilter === fac ? 'active' : ''}`}
                    onClick={() => setFacultyFilter(fac)}
                  >
                    {fac === 'All' ? 'All Faculties' : fac}
                  </button>
                ))}
              </div>
            </div>

            {loadingPeers ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                Loading verified student profiles...
              </div>
            ) : (
              <div className="lydia-peer-grid">
                {filteredPeers.map((peer) => (
                  <MatchCard key={peer.id} peer={peer} onSelectListing={onSelectProperty} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 3: MY SEEKER PROFILE */}
        {/* ========================================= */}
        {activeTab === 'profile' && (
          <div className="post-bio-card">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              My LASUCOM Seeker Profile
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#64748b', marginBottom: '2rem' }}>
              Publish your roommate preferences. Your personal phone number remains private until you approve a mutual match introduction.
            </p>

            {bioSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div
                  style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '50%',
                    backgroundColor: '#d1fae5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    fontSize: '2rem'
                  }}
                >
                  ✓
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Profile Published to LASUCOM Network!
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#64748b', maxWidth: '28rem', margin: '0 auto 1.5rem' }}>
                  Lydia will now consider your preferences when pairing incoming flatmates.
                </p>
                <button
                  type="button"
                  className="btn-hero-primary"
                  onClick={() => {
                    setBioSubmitted(false)
                    setActiveTab('roster')
                  }}
                >
                  View Verified Roster
                </button>
              </div>
            ) : (
              <form onSubmit={handlePostBioSubmit}>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Samuel Adekunle"
                      value={bioName}
                      onChange={(e) => setBioName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Faculty / Department</label>
                    <select
                      className="form-select-box"
                      value={bioFaculty}
                      onChange={(e) => setBioFaculty(e.target.value)}
                    >
                      <option value="MBBS Medicine & Surgery">MBBS Medicine & Surgery</option>
                      <option value="BDS Dentistry">BDS Dentistry</option>
                      <option value="Nursing Sciences">Nursing Sciences</option>
                      <option value="Physiology">Physiology</option>
                      <option value="Medical Laboratory Science">Medical Laboratory Science</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Academic Year / Level</label>
                    <select
                      className="form-select-box"
                      value={bioLevel}
                      onChange={(e) => setBioLevel(e.target.value)}
                    >
                      <option value="300L Pre-Clinicals">300L Pre-Clinicals</option>
                      <option value="400L Clinicals">400L Clinicals</option>
                      <option value="500L Clinicals">500L Clinicals</option>
                      <option value="600L Final Year">600L Final Year</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Rent Share</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ₦380,000 / session"
                      value={bioBudget}
                      onChange={(e) => setBioBudget(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Housing Hub</label>
                  <select
                    className="form-select-box"
                    value={bioLocation}
                    onChange={(e) => setBioLocation(e.target.value)}
                  >
                    <option value="GRA / College Gate">GRA / College Gate</option>
                    <option value="General Hospital Road">General Hospital Road</option>
                    <option value="Isolo / Medical Quarters">Isolo / Medical Quarters</option>
                    <option value="Ayinke House Corridor">Ayinke House Corridor</option>
                    <option value="Heritage Estate Gate">Heritage Estate Gate</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Study Habits & Lifestyle Brief</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Briefly state your study rhythm, call duty schedules, quiet hours expectations, and inverter preferences..."
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-hero-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  <span>Save Profile & Enable Lydia Introductions</span>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
