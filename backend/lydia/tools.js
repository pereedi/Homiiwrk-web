// =====================================================================
// LYDIA FUNCTION TOOLS DEFINITION & HANDLERS
// Grounded in database facts for Students & Young Professionals
// =====================================================================
import { db } from '../db.js'
import { parseBudgetKobo, formatKoboToNaira } from './budget.js'

export const LYDIA_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'find_area',
      description: 'Resolve a location query (e.g. GRA Ikeja, Hospital Axis, Campus Corridor, Main Gate, Allen/Opebi) to a normalized neighborhood hub.',
      parameters: {
        type: 'object',
        properties: {
          location_query: {
            type: 'string',
            description: 'The neighborhood, corridor, or landmark name mentioned by the user.'
          }
        },
        required: ['location_query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_listings',
      description: 'Search for active verified apartments in a specific area, budget ceiling, and accommodation type.',
      parameters: {
        type: 'object',
        properties: {
          area_id: {
            type: 'integer',
            description: 'The area_id to filter by.'
          },
          budget_text_or_kobo: {
            type: 'string',
            description: 'Budget amount specified by user (e.g. 400k, ₦500,000, or 45000000).'
          },
          accommodation_type: {
            type: 'string',
            enum: ['All', 'hostel', 'flatshare', 'co_living', 'serviced'],
            description: 'Optional housing category.'
          }
        },
        required: ['area_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'suggest_upgrades',
      description: 'Retrieve listings in the next price tier above the user budget and explain what extra amenities they offer.',
      parameters: {
        type: 'object',
        properties: {
          area_id: {
            type: 'integer',
            description: 'The area_id.'
          },
          budget_text: {
            type: 'string',
            description: 'Current client budget string (e.g. 400k).'
          }
        },
        required: ['area_id', 'budget_text']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'find_roommate_matches',
      description: 'Retrieve verified young professional & student flatmate candidates matching work/sleep schedules, quiet hours, and budget.',
      parameters: {
        type: 'object',
        properties: {
          faculty: {
            type: 'string',
            description: 'User occupation, study program, or industry.'
          },
          area_id: {
            type: 'integer',
            description: 'Target area_id.'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'request_intro',
      description: 'Request formal mutual pairing with a verified peer flatmate or lister to broker a verified WhatsApp connection and inspection schedule.',
      parameters: {
        type: 'object',
        properties: {
          match_id: {
            type: 'integer',
            description: 'The ID of the peer roommate match.'
          }
        },
        required: ['match_id']
      }
    }
  }
]

export const GEMINI_TOOLS = [
  {
    functionDeclarations: LYDIA_TOOLS.map((t) => ({
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters
    }))
  }
]

export async function executeToolCall(toolName, args) {
  try {
    if (toolName === 'find_area') {
      const area = await db.findArea(args.location_query)
      if (!area) {
        return {
          found: false,
          queried_location: args.location_query,
          message: `No verified accommodations are currently listed in "${args.location_query}". Our active registered hubs are in Ikeja (GRA, Hospital Axis, Campus Corridor, Main Gate, and Allen/Opebi).`
        }
      }
      const listings = await db.searchListings({ area_id: area.id })
      return {
        found: true,
        area_id: area.id,
        name: area.name,
        badge: area.badge,
        description: area.desc,
        available_listings_count: listings.length,
        sample_listings: listings.slice(0, 3).map((l) => ({
          id: l.slug || l.id,
          slug: l.slug || l.id,
          public_id: l.public_id,
          title: l.title,
          area_name: l.area_name || area.name,
          rent_kobo: l.rent_kobo,
          rent: formatKoboToNaira(l.rent_kobo) + '/yr',
          agency_fee: '₦5,000 (Paid directly on WhatsApp)',
          distance: l.distance_text || l.distanceText,
          distance_text: l.distance_text || l.distanceText,
          category: l.category || l.accommodation_type,
          accommodation_type: l.accommodation_type,
          property_url: `#property/${l.slug || l.public_id || l.id}`,
          amenities: l.amenities,
          image: l.image
        }))
      }
    }

    if (toolName === 'search_listings') {
      const budgetKobo = parseBudgetKobo(args.budget_text_or_kobo)
      const results = await db.searchListings({
        area_id: args.area_id,
        max_rent_kobo: budgetKobo,
        accommodation_type: args.accommodation_type || 'All'
      })
      return {
        total_found: results.length,
        budget_filter: budgetKobo ? formatKoboToNaira(budgetKobo) : 'Any',
        listings: results.map((l) => ({
          id: l.slug || l.id,
          slug: l.slug || l.id,
          public_id: l.public_id,
          title: l.title,
          area_name: l.area_name || 'Ikeja Hub',
          rent_kobo: l.rent_kobo,
          rent: formatKoboToNaira(l.rent_kobo) + '/yr',
          agency_fee: '₦5,000 (Paid directly on WhatsApp)',
          category: l.category || l.accommodation_type,
          accommodation_type: l.accommodation_type,
          unit_type: l.unit_type,
          distance: l.distance_text || l.distanceText,
          distance_text: l.distance_text || l.distanceText,
          property_url: `#property/${l.slug || l.public_id || l.id}`,
          amenities: l.amenities,
          image: l.image
        }))
      }
    }

    if (toolName === 'suggest_upgrades') {
      const budgetKobo = parseBudgetKobo(args.budget_text) || 40000000
      const upgrades = await db.getUpgrades({ area_id: args.area_id, budget_kobo: budgetKobo })
      return {
        current_budget: formatKoboToNaira(budgetKobo),
        upgrades: upgrades.map((u) => ({
          id: u.slug || u.id,
          slug: u.slug || u.id,
          public_id: u.public_id,
          title: u.title,
          area_name: u.area_name || 'Ikeja Hub',
          rent_kobo: u.rent_kobo,
          rent: formatKoboToNaira(u.rent_kobo) + '/yr',
          agency_fee: '₦5,000 (Paid directly on WhatsApp)',
          cost_diff: '+' + formatKoboToNaira(u.rent_kobo - budgetKobo),
          property_url: `#property/${u.slug || u.public_id || u.id}`,
          premium_amenities: u.amenities,
          image: u.image
        }))
      }
    }

    if (toolName === 'find_roommate_matches') {
      const peers = await db.getRoommateMatches({ faculty: args.faculty, area_id: args.area_id })
      return {
        count: peers.length,
        matches: peers.map((p) => ({
          id: p.id,
          name: p.name,
          faculty: p.faculty,
          level: p.level,
          compatibility: p.compatibility,
          study_rhythm: p.study_rhythm,
          quiet_hours: p.quiet_hours,
          budget: p.budget_formatted,
          area: p.area_name
        }))
      }
    }

    if (toolName === 'request_intro') {
      const intro = await db.createIntro(99, args.match_id)
      return {
        success: true,
        status: 'mutual_consent_established',
        match_id: args.match_id,
        pairing_notice: '₦5,000 agency pairing fee is paid directly on WhatsApp to finalize inspection.',
        whatsapp_url: `https://wa.me/2348030000012?text=Hello%2C%20I%20am%20paired%20with%20you%20via%20Homiiwrk%20Concierge.%20Let's%20discuss%20our%20flatshare%20and%20inspection.`
      }
    }

    return { error: 'Unknown tool' }
  } catch (err) {
    console.error('Error executing tool:', toolName, err)
    return { error: err.message }
  }
}
