import React, { useState } from 'react'

export default function RoommateQuizModal({ onClose, onFindMatch }) {
  const [step, setStep] = useState(1)
  const [faculty, setFaculty] = useState('MBBS Medicine & Surgery')
  const [studyHabit, setStudyHabit] = useState('Night Owl (Silent ward revision till 2 AM)')
  const [budget, setBudget] = useState('₦300,000 - ₦450,000 / year')
  const [isCompleted, setIsCompleted] = useState(false)

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handleFinish = () => {
    onFindMatch?.()
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '36rem' }} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close Quiz"
        >
          ✕
        </button>

        <div className="quiz-header">
          <h3 className="quiz-title">LASUCOM Peer Match Quiz</h3>
          <p className="quiz-sub">Find a flatmate who matches your study rhythm and clinical rotations.</p>
        </div>

        <div className="quiz-body">
          {!isCompleted ? (
            <>
              {/* Progress Bar */}
              <div className="quiz-step-progress">
                <span className={`progress-pill ${step >= 1 ? 'active' : ''}`} />
                <span className={`progress-pill ${step >= 2 ? 'active' : ''}`} />
                <span className={`progress-pill ${step >= 3 ? 'active' : ''}`} />
              </div>

              {step === 1 && (
                <div>
                  <h4 className="quiz-question-title">1. What is your faculty or program?</h4>
                  <div className="quiz-options-list">
                    {[
                      'MBBS Medicine & Surgery (Clinical Years)',
                      'BDS Dentistry',
                      'Nursing Sciences',
                      'Physiology / Anatomy / Basic Medical',
                      'Medical Laboratory Science'
                    ].map((opt) => (
                      <div
                        key={opt}
                        className={`quiz-option-card ${faculty === opt ? 'selected' : ''}`}
                        onClick={() => setFaculty(opt)}
                      >
                        <div className="quiz-option-radio" />
                        <span className="quiz-option-text">{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h4 className="quiz-question-title">2. What is your primary study pattern?</h4>
                  <div className="quiz-options-list">
                    {[
                      'Night Owl (Silent ward revision till 2 AM)',
                      'Early Bird (Study at 4:30 AM before clinical ward rounds)',
                      'Collaborative Group Reviser (Discussion pods preferred)',
                      'Library Only (Room is purely for rest and sleep)'
                    ].map((opt) => (
                      <div
                        key={opt}
                        className={`quiz-option-card ${studyHabit === opt ? 'selected' : ''}`}
                        onClick={() => setStudyHabit(opt)}
                      >
                        <div className="quiz-option-radio" />
                        <span className="quiz-option-text">{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h4 className="quiz-question-title">3. What is your target rent share per session?</h4>
                  <div className="quiz-options-list">
                    {[
                      '₦250,000 - ₦350,000 / year (Budget Twin/Shared)',
                      '₦350,000 - ₦500,000 / year (Standard Flatshare)',
                      '₦500,000 - ₦700,000 / year (Premium Serviced / Inverter)'
                    ].map((opt) => (
                      <div
                        key={opt}
                        className={`quiz-option-card ${budget === opt ? 'selected' : ''}`}
                        onClick={() => setBudget(opt)}
                      >
                        <div className="quiz-option-radio" />
                        <span className="quiz-option-text">{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="quiz-footer-nav">
                {step > 1 ? (
                  <button
                    type="button"
                    className="btn-contact-agent"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </button>
                ) : <div />}

                <button
                  type="button"
                  className="btn-hero-primary"
                  style={{ padding: '0.625rem 1.25rem', fontSize: '14px' }}
                  onClick={handleNext}
                >
                  {step === 3 ? 'Generate Matches' : 'Next Step →'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
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
              <h3 className="quiz-title" style={{ color: 'var(--color-on-surface)', marginBottom: '0.5rem' }}>
                Found 14 Compatible Peers!
              </h3>
              <p className="modal-desc-text" style={{ maxWidth: '28rem', margin: '0 auto 1.5rem' }}>
                Based on your preference for <strong>{faculty}</strong>, <strong>{studyHabit}</strong>, and <strong>{budget}</strong>, we’ve filtered matched listings with available roommate slots.
              </p>
              <button
                type="button"
                className="btn-hero-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleFinish}
              >
                View Compatible Flatshares
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
