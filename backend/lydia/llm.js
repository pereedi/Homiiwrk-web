// =====================================================================
// LYDIA AI CONCIERGE ENGINE (Google Gemini & OpenAI with local fallback)
// =====================================================================
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })
dotenv.config()

import OpenAI from 'openai'
import { LYDIA_SYSTEM_PROMPT } from './prompt.js'
import { LYDIA_TOOLS, GEMINI_TOOLS, executeToolCall } from './tools.js'
import { parseBudgetKobo, formatKoboToNaira } from './budget.js'
import { db } from '../db.js'

const geminiApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' ? process.env.GEMINI_API_KEY.trim() : null
const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash'

const openaiApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '' ? process.env.OPENAI_API_KEY.trim() : null
const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null

/**
 * Process a user message and stream formal response back via callback
 * @param {Array} history - Array of { role: 'user' | 'assistant', content: string }
 * @param {Function} onChunk - Function({ textChunk, cardPayload, done })
 */
export async function streamLydiaResponse(history, onChunk) {
  // 1. Google Gemini Provider (Free Tier Active)
  if (geminiApiKey) {
    try {
      const handled = await runGeminiEngine(history, onChunk)
      if (handled) return
    } catch {
      // Gracefully fall back to local formal engine
    }
  }

  // 2. OpenAI Provider (If configured)
  if (openai) {
    try {
      const handled = await runOpenAIEngine(history, onChunk)
      if (handled) return
    } catch {
      // Gracefully fall back to local formal engine
    }
  }

  // 3. Graceful Local Formal Concierge Engine (Zero-setup offline fallback)
  await localFormalConciergeEngine(history, onChunk)
}

/**
 * Google Gemini Live Streaming & Function Calling Engine
 */
async function runGeminiEngine(history, onChunk) {
  const contents = history.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content || '' }]
  }))

  const requestBody = {
    systemInstruction: {
      parts: [{ text: LYDIA_SYSTEM_PROMPT }]
    },
    contents,
    tools: GEMINI_TOOLS,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024
    }
  }

  // Initial call with tools to evaluate intent and check for function calls
  const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`
  const response = await fetch(genUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(5000)
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API error status ${response.status}: ${errText.slice(0, 100)}`)
  }

  const data = await response.json()
  const candidate = data.candidates?.[0]
  const parts = candidate?.content?.parts || []

  // Check for function calls (tool invocation)
  const fnCallPart = parts.find((p) => p.functionCall)
  if (fnCallPart && fnCallPart.functionCall) {
    const fnName = fnCallPart.functionCall.name
    const fnArgs = fnCallPart.functionCall.args || {}

    // Execute tool against Supabase / database
    const result = await executeToolCall(fnName, fnArgs)

    // Capture structured UI cards
    let capturedPayload = null
    if (result.listings) capturedPayload = { type: 'listings', data: result.listings }
    if (result.upgrades) capturedPayload = { type: 'upgrades', data: result.upgrades }
    if (result.matches) capturedPayload = { type: 'roommates', data: result.matches }
    if (result.sample_listings) capturedPayload = { type: 'listings', data: result.sample_listings }
    if (result.whatsapp_url) capturedPayload = { type: 'whatsapp_intro', data: result }

    // Build follow-up with tool response preserving candidate.content for thoughtSignature
    const followUpContents = [
      ...contents,
      candidate.content,
      {
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: fnName,
              response: { content: result }
            }
          }
        ]
      }
    ]

    // Stream final formal synthesis from Gemini via SSE
    const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?alt=sse&key=${geminiApiKey}`
    const streamRes = await fetch(streamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: LYDIA_SYSTEM_PROMPT }] },
        contents: followUpContents,
        generationConfig: { temperature: 0.3 }
      }),
      signal: AbortSignal.timeout(5000)
    })

    if (!streamRes.ok) {
      throw new Error(`Gemini stream error status ${streamRes.status}`)
    }

    const reader = streamRes.body.getReader()
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
        const jsonStr = trimmed.replace(/^data:\s*/, '')
        try {
          const parsed = JSON.parse(jsonStr)
          const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || ''
          if (textChunk) {
            onChunk({ textChunk, cardPayload: null, done: false })
          }
        } catch (e) {
          // Incomplete chunk
        }
      }
    }

    if (capturedPayload) {
      onChunk({ textChunk: '', cardPayload: capturedPayload, done: false })
    }

    onChunk({ textChunk: '', cardPayload: null, done: true })
    return true
  }

  // Direct text response without tool call
  const directText = parts.map((p) => p.text || '').join('')
  if (directText) {
    onChunk({ textChunk: directText, cardPayload: null, done: true })
    return true
  }

  return false
}

/**
 * OpenAI Live Streaming & Tool Calling Engine
 */
async function runOpenAIEngine(history, onChunk) {
  const messages = [
    { role: 'system', content: LYDIA_SYSTEM_PROMPT },
    ...history
  ]

  let runner = await openai.chat.completions.create({
    model: openaiModel,
    messages,
    tools: LYDIA_TOOLS,
    tool_choice: 'auto',
    temperature: 0.3
  })

  let choice = runner.choices[0]
  let assistantMsg = choice.message

  if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
    messages.push(assistantMsg)
    let capturedPayload = null

    for (const toolCall of assistantMsg.tool_calls) {
      const fnName = toolCall.function.name
      const fnArgs = JSON.parse(toolCall.function.arguments || '{}')
      const result = await executeToolCall(fnName, fnArgs)

      if (result.listings) capturedPayload = { type: 'listings', data: result.listings }
      if (result.upgrades) capturedPayload = { type: 'upgrades', data: result.upgrades }
      if (result.matches) capturedPayload = { type: 'roommates', data: result.matches }
      if (result.whatsapp_url) capturedPayload = { type: 'whatsapp_intro', data: result }

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result)
      })
    }

    const stream = await openai.chat.completions.create({
      model: openaiModel,
      messages,
      stream: true,
      temperature: 0.3
    })

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || ''
      if (text) {
        onChunk({ textChunk: text, cardPayload: null, done: false })
      }
    }

    if (capturedPayload) {
      onChunk({ textChunk: '', cardPayload: capturedPayload, done: false })
    }

    onChunk({ textChunk: '', cardPayload: null, done: true })
    return true
  }

  onChunk({ textChunk: assistantMsg.content || '', cardPayload: null, done: true })
  return true
}

/**
 * Intelligent formal dialogue engine grounded in local database records
 * Built for Students & Young Professionals
 */
async function localFormalConciergeEngine(history, onChunk) {
  const lastUserMsg = history.filter((m) => m.role === 'user').pop()?.content || ''
  const clean = lastUserMsg.toLowerCase().trim()

  // 1. Check for location queries - specifically unlisted locations vs registered Ikeja hubs
  const UNLISTED_LOCATIONS = [
    'ikorodu', 'lekki', 'yaba', 'surulere', 'ajah', 'epe', 'badagry', 'agege',
    'oshodi', 'festac', 'maryland', 'victoria island', 'vi', 'ikoyi', 'alimosho',
    'egbeda', 'bariga', 'akoka', 'magodo', 'ogba', 'ojodu', 'berger', 'mushin',
    'apapa', 'abuja', 'ibadan', 'benin', 'port harcourt', 'enugu', 'kano',
    'isolo', 'gbagada', 'shomolu', 'ketu', 'mile 12', 'mile 2', 'sango', 'otta', 'ota'
  ]

  const matchedUnlisted = UNLISTED_LOCATIONS.find((loc) => clean.includes(loc))

  const previousAssistantMsg = history.filter((m) => m.role === 'assistant').pop()?.content?.toLowerCase() || ''
  const botAskedForLocation =
    previousAssistantMsg.includes('location') ||
    previousAssistantMsg.includes('neighborhood') ||
    previousAssistantMsg.includes('area') ||
    previousAssistantMsg.includes('where')

  const isRegisteredArea =
    clean.includes('gra') ||
    clean.includes('hospital') ||
    clean.includes('campus') ||
    clean.includes('gate') ||
    clean.includes('allen') ||
    clean.includes('opebi') ||
    clean.includes('lasuth') ||
    clean.includes('lasucom')

  let detectedUnlisted = null
  if (matchedUnlisted) {
    detectedUnlisted = matchedUnlisted.charAt(0).toUpperCase() + matchedUnlisted.slice(1)
  } else if (botAskedForLocation && !isRegisteredArea && !clean.includes('ikeja') && clean.length > 2 && clean.split(' ').length <= 4) {
    const foundArea = await db.findArea(clean)
    if (!foundArea) {
      detectedUnlisted = lastUserMsg.trim()
    }
  } else {
    const matchLoc = clean.match(/(?:in|at|around|near|for)\s+([a-zA-Z\s]+)/i)
    if (matchLoc) {
      const candidate = matchLoc[1].trim()
      if (!isRegisteredArea && !candidate.includes('ikeja') && candidate.length > 2) {
        const foundArea = await db.findArea(candidate)
        if (!foundArea) {
          detectedUnlisted = candidate.charAt(0).toUpperCase() + candidate.slice(1)
        }
      }
    }
  }

  // If an unlisted location is queried, respond immediately without delay and with NO listings
  if (detectedUnlisted) {
    const reply = `Currently, we do not have any verified accommodations listed in **${detectedUnlisted}**. Our active registered hubs are currently in **Ikeja** (including GRA Ikeja Perimeter, Hospital & Business Axis, Campus Corridor, Main Gate & Perimeter, and Allen & Opebi Link).\n\nWould you like to explore available stays or flatshares in one of our Ikeja hubs?`
    await simulateStream(reply, onChunk)
    onChunk({ textChunk: '', cardPayload: null, done: true })
    return
  }

  // 2. Registered Area briefing intent
  if (
    isRegisteredArea ||
    clean.includes('where') ||
    clean.includes('location') ||
    clean.includes('area') ||
    clean.includes('neighborhood') ||
    clean.includes('corridor')
  ) {
    const area = await db.findArea(clean)
    if (!area) {
      const reply = `Currently, we do not have any verified accommodations listed in **${lastUserMsg.trim()}**. Our active registered hubs are currently in **Ikeja** (including GRA Ikeja Perimeter, Hospital & Business Axis, Campus Corridor, Main Gate & Perimeter, and Allen & Opebi Link).\n\nWould you like to explore available stays or flatshares in one of our Ikeja hubs?`
      await simulateStream(reply, onChunk)
      onChunk({ textChunk: '', cardPayload: null, done: true })
      return
    }

    const listings = await db.searchListings({ area_id: area.id })
    const reply = `Good day. Regarding the **${area.name}** perimeter in Ikeja:\n\nThis corridor is approximately ${area.badge || '6-8 minutes walk to transit & campus hubs'}. It is favored by students and young professionals for its quiet environment, reliable electricity, and security. We currently have ${listings.length} verified accommodation options active in this hub.\n\n*Note: In accordance with Homiiwrk policy, prospective tenants connect and pay the ₦5,000 agency pairing fee directly on WhatsApp before an accompanied physical inspection is scheduled. Annual rent is paid securely through our escrow payment gateway.*\n\nHere are the available verified stays:`

    await simulateStream(reply, onChunk)
    if (listings.length > 0) {
      onChunk({ textChunk: '', cardPayload: { type: 'listings', data: listings }, done: false })
    }
    onChunk({ textChunk: '', cardPayload: null, done: true })
    return
  }

  // 3. Budget or Pricing intent
  const parsedBudgetKobo = parseBudgetKobo(clean)
  if (
    parsedBudgetKobo > 0 ||
    clean.includes('budget') ||
    clean.includes('kobo') ||
    clean.includes('naira') ||
    clean.includes('price') ||
    clean.includes('cost') ||
    clean.includes('cheap') ||
    clean.includes('afford')
  ) {
    const budgetKobo = parsedBudgetKobo || 45000000
    const listings = await db.searchListings({ max_rent_kobo: budgetKobo })
    const upgrades = await db.getUpgrades({ area_id: 101, budget_kobo: budgetKobo })

    let reply = `Certainly. For a budget of **${formatKoboToNaira(budgetKobo)}** per session, I have identified ${listings.length} verified apartments that meet your financial allocation.\n\n*Reminder: You may review each apartment's full specs on its dedicated page. The agency pairing fee is ₦5,000 paid directly on WhatsApp to confirm physical inspection, while your annual rent is processed securely via payment gateway.*\n\nHere are the top matches within your budget:`

    await simulateStream(reply, onChunk)
    if (listings.length > 0) {
      onChunk({ textChunk: '', cardPayload: { type: 'listings', data: listings }, done: false })
    }

    if (upgrades && upgrades.length > 0) {
      const upgrade = upgrades[0]
      const deltaFormatted = formatKoboToNaira(upgrade.rent_kobo - budgetKobo)
      onChunk({
        textChunk: `\n\nAdditionally, should your budget permit an incremental **+${deltaFormatted}**, the **${upgrade.title}** provides premium amenities including ${upgrade.amenities?.slice(0, 3).join(', ')}.`,
        cardPayload: {
          type: 'upgrade',
          title: upgrade.title,
          delta_formatted: deltaFormatted,
          perks: `Unlocks: ${upgrade.amenities?.join(', ')}`
        },
        done: false
      })
    }

    onChunk({ textChunk: '', cardPayload: null, done: true })
    return
  }

  // 4. Roommate / Flatmate match intent
  if (
    clean.includes('roommate') ||
    clean.includes('flatmate') ||
    clean.includes('peer') ||
    clean.includes('partner') ||
    clean.includes('share') ||
    clean.includes('split') ||
    clean.includes('mbbs') ||
    clean.includes('dentistry') ||
    clean.includes('nursing') ||
    clean.includes('co-living')
  ) {
    const matches = await db.getRoommateMatches({})
    const reply = `Pleased to assist. On Homiiwrk, we pair students and young working professionals by work/study routines, quiet hours, and hygiene standards. Here are verified peers currently seeking flatmates in Ikeja:`

    await simulateStream(reply, onChunk)
    onChunk({ textChunk: '', cardPayload: { type: 'roommates', data: matches }, done: false })
    onChunk({ textChunk: '', cardPayload: null, done: true })
    return
  }

  // 5. General Apartment / Housing Search intent
  if (
    clean.includes('apartment') ||
    clean.includes('flat') ||
    clean.includes('stay') ||
    clean.includes('house') ||
    clean.includes('hostel') ||
    clean.includes('studio') ||
    clean.includes('room') ||
    clean.includes('ikeja') ||
    clean.includes('available') ||
    clean.includes('listing') ||
    clean.includes('rent') ||
    clean.includes('see') ||
    clean.includes('find') ||
    clean.includes('search') ||
    clean.includes('show') ||
    clean.includes('what') ||
    clean.includes('help')
  ) {
    const listings = await db.searchListings({ accommodation_type: 'All' })
    const reply = `Good day. We currently have ${listings.length} verified apartments and flatshares available for students and young professionals across our Ikeja hubs.\n\nAll properties feature verified landlord/agent credentials, reliable electricity, treated water, and 24/7 security. Note that prospective tenants connect and pay the ₦5,000 agency pairing fee on WhatsApp to confirm physical inspection, and annual rent is paid securely via payment gateway.\n\nAllow me to present the verified stays:`

    await simulateStream(reply, onChunk)
    if (listings.length > 0) {
      onChunk({ textChunk: '', cardPayload: { type: 'listings', data: listings }, done: false })
    }
    onChunk({ textChunk: '', cardPayload: null, done: true })
    return
  }

  // 6. Default Courteous Formal Concierge Response + Sample Listings
  const sampleListings = await db.searchListings({ accommodation_type: 'All' })
  const defaultReply = `Good day! I am Lydia, your AI residential concierge on Homiiwrk. I assist students and young professionals with verified accommodations, budget planning, and flatmate matching across Ikeja and greater Lagos.\n\nYou may ask me about:\n• Verified apartments in **GRA Ikeja**, **Hospital Axis**, or **Campus Corridor**\n• Specific rent budgets (e.g. *"Show apartments under ₦450,000"*)\n• Flatmate & roommate pairing based on sleep/work routines\n\n*Note: All accommodations feature a flat ₦5,000 agency pairing fee paid directly on WhatsApp to confirm inspection, while annual rent is processed securely via payment gateway.*\n\nHere are some of our top verified stays to get you started:`

  await simulateStream(defaultReply, onChunk)
  if (sampleListings.length > 0) {
    onChunk({ textChunk: '', cardPayload: { type: 'listings', data: sampleListings.slice(0, 3) }, done: false })
  }
  onChunk({ textChunk: '', cardPayload: null, done: true })
}

/**
 * Simulate word-by-word streaming for smooth UI feel in fallback mode
 */
async function simulateStream(fullText, onChunk) {
  const words = fullText.split(' ')
  for (let i = 0; i < words.length; i++) {
    const space = i === words.length - 1 ? '' : ' '
    onChunk({ textChunk: words[i] + space, cardPayload: null, done: false })
    await new Promise((r) => setTimeout(r, 15))
  }
}
