// =====================================================================
// HOMIIWRK LYDIA API CLIENT (SSE Streaming & WhatsApp Intro Handoff)
// =====================================================================

const API_BASE = '/api'

/**
 * Stream conversation with Lydia AI Concierge via Server-Sent Events (SSE)
 * @param {Array} messages - Array of { role: 'user'|'assistant', content: string }
 * @param {Function} onChunk - Called with each streamed text token
 * @param {Function} onCard - Called when structured data (listings, upgrades, peers) is returned
 * @param {Function} onDone - Called when streaming completes
 * @param {Function} onError - Called on connection or streaming error
 */
export async function streamLydiaChat({ messages, onChunk, onCard, onDone, onError }) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream'
      },
      body: JSON.stringify({ messages })
    })

    if (!response.ok) {
      throw new Error(`Concierge service responded with status ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const payloadText = trimmed.replace(/^data:\s*/, '')

        if (payloadText === '[DONE]') {
          if (onDone) onDone()
          return
        }

        try {
          const parsed = JSON.parse(payloadText)
          if (parsed.error && onError) {
            onError(new Error(parsed.error))
          }
          if (parsed.chunk && onChunk) {
            onChunk(parsed.chunk)
          }
          if (parsed.card && onCard) {
            onCard(parsed.card)
          }
          if (parsed.done && onDone) {
            onDone()
          }
        } catch (e) {
          // Incomplete chunk, ignore
        }
      }
    }

    if (onDone) onDone()
  } catch (err) {
    if (onError) onError(err)
  }
}

/**
 * Fetch available LASUCOM campus areas
 */
export async function fetchAreas() {
  try {
    const res = await fetch(`${API_BASE}/chat/areas`)
    if (!res.ok) throw new Error('Failed to load campus areas')
    const json = await res.json()
    return json.data || []
  } catch (err) {
    console.warn('Using fallback areas:', err.message)
    return [
      { id: 1, name: 'GRA / College Gate', walk_minutes_to_gate: 3, listing_count: 6 },
      { id: 2, name: 'General Hospital Road', walk_minutes_to_gate: 5, listing_count: 5 },
      { id: 3, name: 'Isolo / Medical Quarters', walk_minutes_to_gate: 8, listing_count: 4 },
      { id: 4, name: 'Ayinke House Corridor', walk_minutes_to_gate: 4, listing_count: 3 },
      { id: 5, name: 'Heritage Estate Gate', walk_minutes_to_gate: 10, listing_count: 4 }
    ]
  }
}

/**
 * Fetch compatible LASUCOM flatmates
 */
export async function fetchRoommates({ faculty, areaId } = {}) {
  try {
    const params = new URLSearchParams()
    if (faculty) params.append('faculty', faculty)
    if (areaId) params.append('area_id', areaId)
    const res = await fetch(`${API_BASE}/roommates?${params.toString()}`)
    if (!res.ok) throw new Error('Failed to load roommate matches')
    const json = await res.json()
    return json.data || []
  } catch (err) {
    console.warn('Using fallback roommate matches:', err.message)
    return [
      {
        id: 1,
        name: 'Dr. (in-training) Chioma Adeyemi',
        faculty: 'Medicine & Surgery (MBBS)',
        level: '500L (Clinical)',
        area_name: 'GRA / College Gate',
        budget_range: '₦350k - ₦500k',
        study_hours: 'Night study (10pm - 4am)',
        lifestyle: ['Quiet', 'Non-smoker', 'Light cooking', 'Inverter split'],
        match_score: 96,
        whatsapp_number: '2348012345678'
      },
      {
        id: 2,
        name: 'Femi Balogun',
        faculty: 'Dental Surgery (BDS)',
        level: '400L',
        area_name: 'General Hospital Road',
        budget_range: '₦400k - ₦550k',
        study_hours: 'Flexible (Library hours)',
        lifestyle: ['Neat', 'Pre-exam silence', 'Generator fuel split'],
        match_score: 91,
        whatsapp_number: '2348023456789'
      },
      {
        id: 3,
        name: 'Zainab Bello',
        faculty: 'Nursing Science',
        level: '300L',
        area_name: 'Ayinke House Corridor',
        budget_range: '₦300k - ₦450k',
        study_hours: 'Early morning (5am - 9am)',
        lifestyle: ['Very tidy', 'Early sleeper', 'Water bill share'],
        match_score: 88,
        whatsapp_number: '2348034567890'
      }
    ]
  }
}

/**
 * Request mutual introduction with a peer
 * Returns WhatsApp handoff URL with pre-filled greeting upon mutual consent
 */
export async function requestRoommateIntro(matchId, userId = 99) {
  try {
    const res = await fetch(`${API_BASE}/roommates/intro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match_id: matchId, user_id: userId })
    })
    if (!res.ok) throw new Error('Introduction request failed')
    return await res.json()
  } catch (err) {
    console.warn('Using fallback intro generator:', err.message)
    const introMsg = encodeURIComponent(
      `Hello, I was introduced to your profile via Lydia on Homiiwrk for a LASUCOM flatshare. I would be pleased to discuss compatibility and apartment inspection.`
    )
    return {
      success: true,
      status: 'both_accepted',
      whatsapp_url: `https://wa.me/2349055748233?text=${introMsg}`,
      message: 'Mutual introduction approved.'
    }
  }
}

/**
 * Load persisted Lydia chat history for the signed-in user
 */
export async function fetchChatHistory(email) {
  if (!email) return []
  try {
    const res = await fetch(`${API_BASE}/chat/history?email=${encodeURIComponent(email)}`)
    if (!res.ok) return null
    const data = await res.json()
    return Array.isArray(data.messages) ? data.messages : []
  } catch {
    return null
  }
}

/**
 * Persist Lydia chat messages (including rendered listing/roommate cards) for the signed-in user
 */
export async function saveChatHistory(email, messages) {
  if (!email || !Array.isArray(messages)) return false
  try {
    const res = await fetch(`${API_BASE}/chat/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, messages })
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Clear persisted Lydia chat history for the signed-in user
 */
export async function clearChatHistory(email) {
  if (!email) return false
  try {
    const res = await fetch(`${API_BASE}/chat/history?email=${encodeURIComponent(email)}`, {
      method: 'DELETE'
    })
    return res.ok
  } catch {
    return false
  }
}
