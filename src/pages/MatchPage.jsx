import React, { useState } from 'react'
import { PEER_PROFILES } from '../data/peerProfiles'

export default function MatchPage({ onNavigateHome, onSelectProperty }) {
  const [activeTab, setActiveTab] = useState('quiz') // 'quiz' | 'roster' | 'post'
  const [facultyFilter, setFacultyFilter] = useState('All')

  // Quiz State
  const [quizStep, setQuizStep] = useState(1)
  const [facultyChoice, setFacultyChoice] = useState('Medicine & Surgery (Clinicals)')
  const [studyRhythm, setStudyRhythm] = useState('Night Owl (Quiet ward reading till 2:30 AM)')
  const [quietHours, setQuietHours] = useState('Strict 10:30 PM quiet time')
  const [budgetTier, setBudgetTier] = useState('₦350,000 - ₦500,000 / session')
  const [targetLocation, setTargetLocation] = useState('GRA Ikeja / General Hospital Axis')
  const [isQuizCompleted, setIsQuizCompleted] = useState(false)

  // Post Bio Form State
  const [bioName, setBioName] = useState('')
  const [bioFaculty, setBioFaculty] = useState('MBBS Medicine & Surgery')
  const [bioLevel, setBioLevel] = useState('400L Clinicals')
  const [bioBudget, setBioBudget] = useState('₦400,000')
  const [bioLocation, setBioLocation] = useState('Ikeja Hospital Axis')
  const [bioText, setBioText] = useState('')
  const [bioSubmitted, setBioSubmitted] = useState(false)

  // Filtered peer profiles
  const filteredPeers = PEER_PROFILES.filter((peer) => {
    if (facultyFilter === 'All') return true
    return peer.faculty.toLowerCase().includes(facultyFilter.toLowerCase())
  })

  const handleQuizNext = () => {
    if (quizStep < 4) {
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
          {/* Breadcrumb */}
          <div className="match-breadcrumb">
            <a onClick={onNavigateHome}>← Back to Accommodations</a>
            <span>/</span>
            <span>Peer Compatibility Network</span>
          </div>

          <div className="match-hero-badge">
            <span className="live-pulse-dot"></span>
            <span>LASUCOM Peer Compatibility Network</span>
          </div>

          <h1 className="match-hero-title">
            Find Your Ideal Roommate Around LASUCOM, Ikeja
          </h1>

          <p className="match-hero-desc">
            Match with verified medical, dental, physiology, or nursing scholars based on study patterns, sleep hours, budget tiers, and hygiene preferences before splitting rent.
          </p>

          {/* Key Trust Stats */}
          <div className="match-stats-grid">
            <div className="match-stat-box">
              <p className="match-stat-number">148+</p>
              <p className="match-stat-label">Active LASUCOM Seekers</p>
            </div>
            <div className="match-stat-box">
              <p className="match-stat-number">100%</p>
              <p className="match-stat-label">Faculty ID Verified</p>
            </div>
            <div className="match-stat-box">
              <p className="match-stat-number">₦0</p>
              <p className="match-stat-label">Zero Agent / Match Fees</p>
            </div>
            <div className="match-stat-box">
              <p className="match-stat-number">100%</p>
              <p className="match-stat-label">Safe Deposit Escrow</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Tab Navigation */}
      <div className="match-nav-tabs-wrapper">
        <div className="container">
          <div className="match-tabs-bar">
            <button
              type="button"
              className={`match-tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
              onClick={() => setActiveTab('quiz')}
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              <span>Interactive Match Quiz</span>
            </button>

            <button
              type="button"
              className={`match-tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
              onClick={() => setActiveTab('roster')}
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              <span>Browse Peer Roster ({PEER_PROFILES.length})</span>
            </button>

            <button
              type="button"
              className={`match-tab-btn ${activeTab === 'post' ? 'active' : ''}`}
              onClick={() => setActiveTab('post')}
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Post My Roommate Bio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container match-page-body">
        {/* ========================================= */}
        {/* TAB 1: ON-PAGE INTERACTIVE MATCH QUIZ */}
        {/* ========================================= */}
        {activeTab === 'quiz' && (
          <div className="quiz-page-container">
            <div className="quiz-page-header">
              <h2 className="quiz-page-title">LASUCOM Peer Compatibility Quiz</h2>
              <p className="quiz-page-sub">
                Our algorithm matches sleep shifts, quiet study hours, and rent budgets among healthcare scholars.
              </p>
            </div>

            <div className="quiz-page-body">
              {!isQuizCompleted ? (
                <>
                  <p className="quiz-step-counter">Step {quizStep} of 4</p>

                  <div className="quiz-progress-track">
                    <span className={`quiz-track-segment ${quizStep >= 1 ? 'active' : ''}`} />
                    <span className={`quiz-track-segment ${quizStep >= 2 ? 'active' : ''}`} />
                    <span className={`quiz-track-segment ${quizStep >= 3 ? 'active' : ''}`} />
                    <span className={`quiz-track-segment ${quizStep >= 4 ? 'active' : ''}`} />
                  </div>

                  {/* Step 1: Program */}
                  {quizStep === 1 && (
                    <div>
                      <h3 className="quiz-main-question">1. What is your faculty or program at LASUCOM?</h3>
                      <div className="quiz-choices-grid">
                        {[
                          { title: 'Medicine & Surgery (Clinicals)', desc: '300L - 600L with morning ward rounds and clinical postings.' },
                          { title: 'BDS Dentistry', desc: 'Pre-clinical and clinical dental scholars needing focused study zones.' },
                          { title: 'Nursing Sciences', desc: 'Shift rotation schedules and demanding clinical laboratory hours.' },
                          { title: 'Physiology & Anatomy (Basic Medical)', desc: 'Lecture halls, library revision, and research coursework.' },
                          { title: 'Medical Laboratory Science', desc: 'Intensive hospital diagnostic laboratory attachments.' }
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

                  {/* Step 2: Study Habits */}
                  {quizStep === 2 && (
                    <div>
                      <h3 className="quiz-main-question">2. What is your primary study rhythm?</h3>
                      <div className="quiz-choices-grid">
                        {[
                          { title: 'Night Owl (Quiet ward reading till 2:30 AM)', desc: 'Requires desk lamp and mutual silent hours late at night.' },
                          { title: 'Early Bird (4:30 AM morning study before rounds)', desc: 'Asleep early around 10 PM and wakes up before dawn.' },
                          { title: 'Library Only (Apartment is purely for resting)', desc: 'Does all revision on campus; home is for sleep and food.' },
                          { title: 'Discussion & Pod Study (Collaborative revision)', desc: 'Likes discussing clinical cases with roommate or peers.' }
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

                  {/* Step 3: Sleep & Quiet Hours */}
                  {quizStep === 3 && (
                    <div>
                      <h3 className="quiz-main-question">3. What are your quiet hour preferences?</h3>
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

                  {/* Step 4: Budget & Target Axis */}
                  {quizStep === 4 && (
                    <div>
                      <h3 className="quiz-main-question">4. What is your rent budget share per academic session?</h3>
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

                  {/* Quiz Navigation Buttons */}
                  <div className="quiz-nav-actions">
                    {quizStep > 1 ? (
                      <button
                        type="button"
                        className="btn-contact-agent"
                        onClick={() => setQuizStep(quizStep - 1)}
                      >
                        ← Back
                      </button>
                    ) : <div />}

                    <button
                      type="button"
                      className="btn-hero-primary"
                      onClick={handleQuizNext}
                    >
                      <span>{quizStep === 4 ? 'Calculate Compatible Matches' : 'Continue'}</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Completed State */
                <div className="quiz-results-banner">
                  <div className="quiz-result-badge-circle">
                    ✓
                  </div>
                  <h3 className="quiz-page-title" style={{ color: 'var(--color-on-surface)', marginBottom: '0.5rem' }}>
                    Match Calculation Complete!
                  </h3>
                  <p className="match-hero-desc" style={{ color: 'var(--color-on-surface-variant)', margin: '0 auto 2rem' }}>
                    Based on your profile (<strong>{facultyChoice}</strong> · <strong>{studyRhythm}</strong> · <strong>{budgetTier}</strong>), we have unlocked compatible verified flatmates and available accommodation splits.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-hero-primary"
                      onClick={() => setActiveTab('roster')}
                    >
                      <span>View Matched Peer Profiles (5 Matches)</span>
                      <span className="material-symbols-outlined text-[18px]">group</span>
                    </button>
                    <button
                      type="button"
                      className="btn-contact-agent"
                      onClick={() => {
                        setIsQuizCompleted(false)
                        setQuizStep(1)
                      }}
                    >
                      Retake Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 2: ROSTER FEED (PEER PROFILES) */}
        {/* ========================================= */}
        {activeTab === 'roster' && (
          <div>
            <div className="roster-header-bar">
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--color-on-surface)' }}>
                  Verified Student Roommate Seekers
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>
                  All candidates have submitted matriculation and faculty verification documents.
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

            {/* Peer Cards Grid */}
            <div className="roster-grid">
              {filteredPeers.map((peer) => (
                <article key={peer.id} className="peer-profile-card">
                  <div className="peer-card-top">
                    <img
                      src={peer.avatar}
                      alt={peer.name}
                      className="peer-avatar"
                    />
                    <div className="peer-meta-info">
                      <h4 className="peer-name">{peer.name}</h4>
                      <p className="peer-faculty">{peer.faculty}</p>
                      <p className="peer-level">{peer.level}</p>
                      <span className="peer-compatibility-pill">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        <span>{peer.compatibility}% Match</span>
                      </span>
                    </div>
                  </div>

                  <div className="peer-card-body">
                    <div>
                      <p className="peer-bio-text">{peer.bio}</p>

                      <div className="peer-looking-for-box">
                        <strong>Seeking:</strong> {peer.lookingFor}
                      </div>

                      <div className="peer-badges-row">
                        {peer.badges.map((b, idx) => (
                          <span key={idx} className="peer-badge-pill">{b}</span>
                        ))}
                      </div>
                    </div>

                    <div className="peer-card-footer">
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>Target Budget</p>
                        <p className="peer-budget">{peer.budgetFormatted}</p>
                      </div>

                      <button
                        type="button"
                        className="btn-connect-peer"
                        onClick={() => alert(`Direct connection request sent to ${peer.name}! Once they accept, you will receive private chat access.`)}
                      >
                        Connect Request
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 3: POST MY BIO FORM */}
        {/* ========================================= */}
        {activeTab === 'post' && (
          <div className="post-bio-card">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--color-on-surface)', marginBottom: '0.5rem' }}>
              Create Your Roommate Profile
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-on-surface-variant)', marginBottom: '2rem' }}>
              Publish your listing to the LASUCOM Peer Network. Your personal phone and matric number remain private until you approve a match.
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
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--color-on-surface)', marginBottom: '0.5rem' }}>
                  Profile Published to LASUCOM Roster!
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-on-surface-variant)', maxWidth: '28rem', margin: '0 auto 1.5rem' }}>
                  Your listing is now visible to vetted peers. You will be alerted when someone sends a match request.
                </p>
                <button
                  type="button"
                  className="btn-hero-primary"
                  onClick={() => {
                    setBioSubmitted(false)
                    setActiveTab('roster')
                  }}
                >
                  View Active Roster
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
                  <label className="form-label">Preferred Location / Area</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ikeja Hospital Axis or GRA perimeter"
                    value={bioLocation}
                    onChange={(e) => setBioLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">About You &amp; Flatmate Preferences</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    placeholder="Tell prospective roommates about your study routine, quiet hours, ward shift schedule, and cleanliness expectations..."
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    type="submit"
                    className="btn-hero-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>Publish Profile</span>
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
