import React, { useState, useEffect, useRef } from 'react'
import { streamLydiaChat, fetchChatHistory, saveChatHistory, clearChatHistory } from '../../lib/lydiaApi'
import { useAuth } from '../../lib/AuthContext'

const INITIAL_GREETING = {
  role: 'assistant',
  content:
    'Good day! I am Lydia, your AI housing concierge on Homiiwrk. I assist students and young professionals in finding verified apartments, flatshares, and serviced studios across Ikeja and greater Lagos. I can also help you pair with verified flatmates or calculate budget options. Which area or apartment type would you like to explore today?',
  time: 'Just now'
}

const QUICK_SUGGESTIONS = [
  'Show verified apartments',
  'Apartments under ₦450,000',
  'Find verified flatmates',
  'Explore GRA Ikeja stays',
  'Show serviced studio options'
]

function formatCategory(rawCat, rawType) {
  if (rawCat && !String(rawCat).includes('_')) return rawCat
  const t = String(rawType || rawCat || '').toLowerCase()
  if (t === 'co_living' || t === 'co-living') return 'Co-Living'
  if (t === 'flatshare') return 'Flatshare'
  if (t === 'serviced') return 'Serviced Studio'
  if (t === 'hostel') return 'Hostel / Self-Contain'
  return 'Verified Stay'
}

function getStorageKey(email) {
  return `homiiwrk_lydia_chat_${String(email || '').trim().toLowerCase()}`
}

export default function LydiaChat({
  onSelectProperty,
  onInferredStateChange,
  isDrawer = false,
  onCloseDrawer
}) {
  const { user } = useAuth()
  const userEmail = (user?.email || '').trim().toLowerCase()

  const [messages, setMessages] = useState([INITIAL_GREETING])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [historyLoadedFor, setHistoryLoadedFor] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isStreaming])

  // Load persisted Lydia chat history whenever logged-in user changes
  useEffect(() => {
    let active = true

    if (!userEmail) {
      // Guest / Logged out view: reset visible chat without touching any user's saved history
      setMessages([INITIAL_GREETING])
      setHistoryLoadedFor('')
      return
    }

    // 1. Instant local restore from localStorage cache for snappy UX
    let cachedMessages = null
    try {
      const raw = localStorage.getItem(getStorageKey(userEmail))
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedMessages = parsed
          setMessages(parsed)
        }
      }
    } catch {
      // Ignore corrupt cache
    }

    // 2. Sync authoritative history from backend persistent store
    async function loadFromServer() {
      const serverMessages = await fetchChatHistory(userEmail)
      if (!active) return

      if (Array.isArray(serverMessages) && serverMessages.length > 0) {
        setMessages(serverMessages)
        try {
          localStorage.setItem(getStorageKey(userEmail), JSON.stringify(serverMessages))
        } catch {
          // Ignore quota errors
        }
      } else if (!cachedMessages) {
        setMessages([INITIAL_GREETING])
      }
      setHistoryLoadedFor(userEmail)
    }

    loadFromServer()
    return () => { active = false }
  }, [userEmail])

  // Auto-persist messages for signed-in user once streaming settles
  useEffect(() => {
    if (!userEmail || isStreaming || historyLoadedFor !== userEmail) return
    if (messages.length <= 1) return

    try {
      localStorage.setItem(getStorageKey(userEmail), JSON.stringify(messages))
    } catch {
      // Ignore storage quota errors
    }
    saveChatHistory(userEmail, messages)
  }, [messages, isStreaming, userEmail, historyLoadedFor])

  const handleClearChat = async () => {
    if (isStreaming) return
    const ok = window.confirm('Start a new conversation with Lydia? Your previous messages in this chat will be cleared.')
    if (!ok) return
    setMessages([INITIAL_GREETING])
    if (userEmail) {
      try {
        localStorage.removeItem(getStorageKey(userEmail))
      } catch {
        // Ignore
      }
      await clearChatHistory(userEmail)
    }
  }

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim()
    if (!text || isStreaming) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg = { role: 'user', content: text, time: now }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInputValue('')
    setIsStreaming(true)

    // Prepare assistant placeholder
    const assistantIndex = updatedMessages.length
    const assistantMsg = { role: 'assistant', content: '', cards: [], time: now }
    setMessages((prev) => [...prev, assistantMsg])

    // Update inferred state heuristic based on message content
    if (onInferredStateChange) {
      if (/gra|ikeja/i.test(text)) {
        onInferredStateChange((prev) => ({ ...prev, area_name: 'GRA Ikeja Perimeter' }))
      } else if (/hospital|lasuth/i.test(text)) {
        onInferredStateChange((prev) => ({ ...prev, area_name: 'Ikeja Hospital & Business Axis' }))
      } else if (/campus|gate/i.test(text)) {
        onInferredStateChange((prev) => ({ ...prev, area_name: 'Academic Corridor & Main Gate' }))
      }

      if (/(\d+)\s*(k|thousand|000)/i.test(text)) {
        onInferredStateChange((prev) => ({
          ...prev,
          budget_formatted: text.match(/(\d+[\d,]*\s*(k|thousand|000)?)/i)?.[0] || '₦450,000'
        }))
      }
    }

    try {
      await streamLydiaChat({
        messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        onChunk: (chunk) => {
          setMessages((prev) => {
            const next = [...prev]
            if (next[assistantIndex]) {
              next[assistantIndex] = {
                ...next[assistantIndex],
                content: next[assistantIndex].content + chunk
              }
            }
            return next
          })
        },
        onCard: (card) => {
          setMessages((prev) => {
            const next = [...prev]
            if (next[assistantIndex]) {
              const currentCards = next[assistantIndex].cards || []
              let newCards = []

              if (card && (card.type === 'listings' || card.listings) && Array.isArray(card.data || card.listings)) {
                const list = card.data || card.listings
                newCards = list.map((item) => ({ ...item, type: 'listing' }))
              } else if (card && (card.type === 'roommates' || card.matches) && Array.isArray(card.data || card.matches)) {
                const list = card.data || card.matches
                newCards = list.map((item) => ({ ...item, type: 'roommate' }))
              } else if (Array.isArray(card)) {
                newCards = card
              } else if (card) {
                newCards = [card]
              }

              next[assistantIndex] = {
                ...next[assistantIndex],
                cards: [...currentCards, ...newCards]
              }
            }
            return next
          })
        },
        onDone: () => {
          setIsStreaming(false)
        },
        onError: (err) => {
          console.error('Lydia streaming error:', err)
          setMessages((prev) => {
            const next = [...prev]
            if (next[assistantIndex]) {
              next[assistantIndex] = {
                ...next[assistantIndex],
                content:
                  next[assistantIndex].content ||
                  'I apologize for the momentary network disruption. Please allow me to re-fetch the verified records for you.'
              }
            }
            return next
          })
          setIsStreaming(false)
        }
      })
    } catch {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`lydia-chat-card ${isDrawer ? 'drawer-mode' : ''}`}>
      {/* Header */}
      <div className="lydia-chat-header">
        <div className="lydia-avatar-wrap">
          <div className="lydia-avatar">
            L<span className="lydia-status-dot" />
          </div>
          <div className="lydia-meta">
            <h3>Lydia Concierge</h3>
            <p>
              <span className="lydia-badge-lasucom">Homiiwrk AI</span>
              <span>{userEmail ? 'History Saved' : 'Available • Verified Protocol'}</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {messages.length > 1 && (
            <button
              type="button"
              onClick={handleClearChat}
              className="lydia-clear-btn"
              title="Start a new chat"
            >
              <span className="material-symbols-outlined text-[15px]">refresh</span>
              <span>New Chat</span>
            </button>
          )}
          {isDrawer && onCloseDrawer && (
            <button onClick={onCloseDrawer} className="lydia-drawer-close" aria-label="Close Concierge">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="lydia-messages-area">
        {messages.map((msg, idx) => {
          const allCards = msg.cards || []
          const listingCards = allCards
            .filter((c) => c.type === 'listing' || (c.title && c.type !== 'upgrade' && c.type !== 'roommate'))
            .sort((a, b) => (Number(a.rent_kobo || a.price || 0) - Number(b.rent_kobo || b.price || 0)))
          const otherCards = allCards.filter(
            (c) => !(c.type === 'listing' || (c.title && c.type !== 'upgrade' && c.type !== 'roommate'))
          )

          return (
            <div key={idx} className={`lydia-msg-row ${msg.role}`}>
              <div className={`lydia-msg-avatar ${msg.role === 'user' ? 'user-avatar' : ''}`}>
                {msg.role === 'user' ? (user?.name ? user.name.charAt(0).toUpperCase() : 'U') : 'L'}
              </div>
              <div style={{ maxWidth: '100%', minWidth: 0 }}>
                <div className="lydia-msg-bubble">
                  <div style={{ whiteSpace: 'pre-line' }}>{msg.content}</div>

                  {/* Properly Arranged Listing Results Block */}
                  {listingCards.length > 0 && (
                    <div className="lydia-listings-wrapper">
                      <div className="lydia-listings-summary-bar">
                        <span>Verified Stays Found ({listingCards.length})</span>
                        <span className="lydia-sort-tag">Sorted by Annual Rent</span>
                      </div>

                      <div className="lydia-cards-container">
                        {listingCards.map((card, cIdx) => {
                          const cardImage =
                            card.image ||
                            card.image_url ||
                            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&auto=format&fit=crop&q=80'
                          const rentDisplay =
                            card.rent ||
                            (card.priceFormatted
                              ? `${card.priceFormatted}/yr`
                              : card.rent_kobo
                                ? `₦${Math.round(card.rent_kobo / 100).toLocaleString()}/yr`
                                : '₦450,000/yr')
                          const categoryLabel = formatCategory(card.category, card.accommodation_type)
                          const distanceLabel =
                            typeof card.distance === 'string' && card.distance
                              ? card.distance
                              : card.distance_text || card.distanceText || '6 mins walk'
                          const topAmenities = Array.isArray(card.amenities)
                            ? card.amenities
                                .map((a) => (typeof a === 'string' ? a : a?.text))
                                .filter(Boolean)
                                .slice(0, 2)
                            : []

                          return (
                            <div key={card.slug || card.public_id || card.id || cIdx} className="lydia-listing-card-v2">
                              <div className="lydia-card-top">
                                <img
                                  src={cardImage}
                                  alt={card.title}
                                  className="lydia-listing-thumb-v2"
                                />
                                <div className="lydia-listing-info-v2">
                                  <div className="lydia-card-badges">
                                    <span className="lydia-card-index">#{cIdx + 1}</span>
                                    <span className="lydia-card-cat">{categoryLabel}</span>
                                  </div>
                                  <h4 className="lydia-card-title-v2">{card.title}</h4>
                                  <p className="lydia-card-loc-v2">
                                    📍 {card.area_name || card.location || 'Ikeja Hub'}
                                  </p>
                                  <div className="lydia-listing-perks">
                                    <span className="lydia-perk-pill">🚶 {distanceLabel}</span>
                                    {topAmenities.map((am, aIdx) => (
                                      <span key={aIdx} className="lydia-perk-pill">✓ {am}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="lydia-card-footer-v2">
                                <div>
                                  <div className="lydia-listing-price">{rentDisplay}</div>
                                  <div className="lydia-agency-note">
                                    Agency Fee: ₦5,000 (WhatsApp)
                                  </div>
                                </div>
                                {onSelectProperty && (
                                  <button
                                    type="button"
                                    onClick={() => onSelectProperty(card)}
                                    className="lydia-btn-inspect"
                                  >
                                    View Property →
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Roommate & Upgrade Cards */}
                  {otherCards.length > 0 && (
                    <div className="lydia-cards-container">
                      {otherCards.map((card, cIdx) => {
                        if (card.type === 'roommate' || card.name) {
                          const waPhone = String(card.whatsapp_number || '2349055748233').replace(/\D/g, '') || '2349055748233'
                          return (
                            <div key={cIdx} className="lydia-listing-card-v2">
                              <div className="lydia-card-top">
                                <img
                                  src={
                                    card.avatar ||
                                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                                  }
                                  alt={card.name}
                                  className="lydia-listing-thumb"
                                  style={{ borderRadius: '50%', width: '52px', height: '52px', flexShrink: 0 }}
                                />
                                <div className="lydia-listing-info-v2">
                                  <h4 className="lydia-card-title-v2">{card.name}</h4>
                                  <p className="lydia-card-loc-v2">
                                    🎓 {card.faculty || 'Young Professional'} • {card.level || 'Verified Member'}
                                  </p>
                                  <div className="lydia-listing-perks">
                                    <span className="lydia-perk-pill">⭐ {card.compatibility || 95}% Match</span>
                                    <span className="lydia-perk-pill">💰 {card.budget || card.budget_formatted || '₦400k - ₦500k'}</span>
                                  </div>
                                  <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                                    Routine: {card.study_rhythm || 'Quiet work/study hours'}
                                  </p>
                                </div>
                              </div>
                              <div className="lydia-card-footer-v2">
                                <span className="lydia-agency-note">Verified Peer Match</span>
                                <a
                                  href={`https://wa.me/${waPhone}?text=Hello%20${encodeURIComponent(card.name)}%2C%20I%20am%20paired%20with%20you%20via%20Homiiwrk%20Concierge.%20Let's%20discuss%20our%20flatshare.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="lydia-btn-inspect"
                                  style={{ background: '#25d366', textDecoration: 'none' }}
                                >
                                  Connect on WhatsApp
                                </a>
                              </div>
                            </div>
                          )
                        }

                        if (card.type === 'upgrade') {
                          return (
                            <div key={cIdx} className="lydia-upgrade-card">
                              <div>
                                <div className="lydia-upgrade-title">{card.title || 'Executive Tier Option'}</div>
                                <p className="lydia-upgrade-desc">{card.perks || 'Includes private solar inverter line, biometric lock, and continuous water.'}</p>
                              </div>
                              <span className="lydia-upgrade-delta">+{card.delta_formatted || '₦50,000'}</span>
                            </div>
                          )
                        }

                        return null
                      })}
                    </div>
                  )}
                </div>
                <div className="lydia-msg-time">{msg.time}</div>
              </div>
            </div>
          )
        })}

        {isStreaming && (
          <div className="lydia-msg-row assistant">
            <div className="lydia-msg-avatar">L</div>
            <div className="lydia-msg-bubble">
              <div className="lydia-typing-indicator">
                <span className="lydia-typing-dot" />
                <span className="lydia-typing-dot" />
                <span className="lydia-typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions Chips */}
      <div className="lydia-suggestions-bar">
        {QUICK_SUGGESTIONS.map((sugg, idx) => (
          <button
            key={idx}
            className="lydia-chip-btn"
            onClick={() => handleSendMessage(sugg)}
            disabled={isStreaming}
          >
            {sugg}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="lydia-input-bar">
        <input
          type="text"
          className="lydia-input-field"
          placeholder="Ask Lydia about apartments, locations, or flatmates..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
        />
        <button
          type="button"
          className="lydia-send-btn"
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || isStreaming}
          aria-label="Send Message"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </div>
    </div>
  )
}
