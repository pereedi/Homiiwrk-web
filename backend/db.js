// =====================================================================
// HOMIIWRK DATABASE ADAPTER (PostgreSQL / Supabase with in-memory fallback)
// =====================================================================
import pg from 'pg'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LISTINGS_FILE = path.join(__dirname, 'data', 'listings.json')

function ensureListingsFile() {
  try {
    const dir = path.dirname(LISTINGS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(LISTINGS_FILE)) {
      fs.writeFileSync(LISTINGS_FILE, '[]', 'utf-8')
    }
  } catch (err) {
    console.error('Error initializing listings.json:', err.message)
  }
}

function readPersistentListings() {
  try {
    ensureListingsFile()
    const raw = fs.readFileSync(LISTINGS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writePersistentListings(list) {
  try {
    ensureListingsFile()
    fs.writeFileSync(LISTINGS_FILE, JSON.stringify(list, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Error saving listings.json:', err.message)
    return false
  }
}

function normalizeAmenities(amenities) {
  if (!Array.isArray(amenities)) return []
  return amenities.map((item) => {
    if (typeof item === 'string') return { icon: 'check_circle', text: item }
    return { icon: item?.icon || 'check_circle', text: item?.text || String(item) }
  })
}

const SEED_SLUG_BY_PUBLIC_ID = {
  'd9e03d15-5d98-4c6e-82d2-8b4b7321a001': 'apex-scholars-haven',
  'd9e03d15-5d98-4c6e-82d2-8b4b7321a002': 'ikeja-medics-residency',
  'd9e03d15-5d98-4c6e-82d2-8b4b7321a003': 'greenwood-student-suites',
  'd9e03d15-5d98-4c6e-82d2-8b4b7321a004': 'alhaji-jakande-villa-flatshare',
  'd9e03d15-5d98-4c6e-82d2-8b4b7321a005': 'prestige-coliving-hall',
  'd9e03d15-5d98-4c6e-82d2-8b4b7321a006': 'sterling-ensuite-hostel'
}

const SEED_SLUG_BY_NUMERIC_ID = {
  '1': 'apex-scholars-haven',
  '2': 'ikeja-medics-residency',
  '3': 'greenwood-student-suites',
  '4': 'alhaji-jakande-villa-flatshare',
  '5': 'prestige-coliving-hall',
  '6': 'sterling-ensuite-hostel'
}

const AREA_NAME_BY_ID = {
  100: 'All Ikeja Hubs',
  101: 'GRA Ikeja Perimeter',
  102: 'Hospital & Business Axis',
  103: 'Campus Corridor',
  104: 'Main Gate & Perimeter',
  105: 'Allen & Opebi Link'
}

function formatCategoryLabel(rawType, fallbackCategory) {
  if (fallbackCategory && !String(fallbackCategory).includes('_')) return fallbackCategory
  const t = String(rawType || '').toLowerCase()
  if (t === 'co_living' || t === 'co-living') return 'Co-Living'
  if (t === 'flatshare') return 'Flatshare'
  if (t === 'serviced') return 'Serviced Studio'
  if (t === 'hostel') return 'Hostel / Self-Contain'
  return fallbackCategory || 'Apartment'
}

function enrichListingRecord(raw, areasList = []) {
  const seedFallback = mockStore.listings.find(
    (s) =>
      (raw.public_id && s.public_id === raw.public_id) ||
      String(s.id) === String(raw.id)
  )

  const slug =
    raw.slug ||
    SEED_SLUG_BY_PUBLIC_ID[raw.public_id] ||
    SEED_SLUG_BY_NUMERIC_ID[String(raw.id)] ||
    String(raw.id)

  const areaObj = areasList.find((a) => Number(a.id) === Number(raw.area_id))
  const areaName =
    raw.area_name ||
    AREA_NAME_BY_ID[Number(raw.area_id)] ||
    areaObj?.short_name ||
    areaObj?.name ||
    'Ikeja Hub'

  const rentKobo = Number(raw.rent_kobo) || (Number(raw.price) ? Number(raw.price) * 100 : 45000000)
  const priceNum = Number(raw.price) || Math.round(rentKobo / 100)
  const defaultImg = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80'
  const image = raw.image || raw.image_url || seedFallback?.image || defaultImg
  const gallery = Array.isArray(raw.gallery) && raw.gallery.length > 0 ? raw.gallery : [image]
  const distanceText = raw.distanceText || raw.distance_text || seedFallback?.distance_text || '6 mins walk'
  const category = formatCategoryLabel(raw.accommodation_type, raw.category)
  const amenityStrings = Array.isArray(raw.amenities)
    ? raw.amenities.map((a) => (typeof a === 'string' ? a : a?.text)).filter(Boolean)
    : (seedFallback?.amenities || [])

  return {
    ...raw,
    id: raw.id ?? slug,
    slug,
    public_id: raw.public_id || seedFallback?.public_id || `pub-${slug}`,
    area_id: Number(raw.area_id) || 101,
    area_name: areaName,
    category,
    accommodation_type: raw.accommodation_type || 'flatshare',
    unit_type: raw.unit_type || 'self_contain',
    rent_kobo: rentKobo,
    price: priceNum,
    priceFormatted: raw.priceFormatted || `₦${priceNum.toLocaleString()}`,
    rent: `₦${priceNum.toLocaleString()}/yr`,
    agency_fee: '₦5,000 (Paid on WhatsApp)',
    agencyFee: Number(raw.agencyFee) || 5000,
    agencyFeeFormatted: raw.agencyFeeFormatted || '₦5,000',
    billingCycle: raw.billingCycle || 'Annual rent · Standard tenancy',
    distance: Number(raw.distance ?? raw.distance_mins) || 6,
    distance_text: distanceText,
    distanceText,
    total_spaces: Number(raw.total_spaces ?? raw.totalSpaces) || 1,
    totalSpaces: Number(raw.totalSpaces ?? raw.total_spaces) || 1,
    available_spaces: Number(raw.available_spaces ?? raw.availableSpaces) || 1,
    availableSpaces: Number(raw.availableSpaces ?? raw.available_spaces) || 1,
    location: raw.location || raw.address_line || raw.address || `${areaName}, Ikeja, Lagos`,
    address: raw.address || raw.address_line || raw.location || `${areaName}, Ikeja, Lagos`,
    description: raw.description || seedFallback?.description || 'Verified accommodation on Homiiwrk.',
    fullDescription: raw.fullDescription || raw.description || seedFallback?.description || 'Verified accommodation on Homiiwrk.',
    listerType: raw.listerType || 'agent',
    listerName: raw.listerName || 'Verified Homiiwrk Lister',
    listerRole: raw.listerRole || (raw.listerType === 'individual' ? 'Current Tenant / Flatmate' : 'Verified Real Estate Agent'),
    listerPhoneMasked: raw.listerPhoneMasked || '+234 905 ••• ••33',
    rating: Number(raw.rating) || 4.8,
    reviewCount: Number(raw.reviewCount) || 18,
    amenities: amenityStrings,
    amenitiesStructured: normalizeAmenities(raw.amenities || seedFallback?.amenities || []),
    image,
    gallery,
    status: String(raw.status || 'active').toLowerCase()
  }
}

ensureListingsFile()
// Load both backend/.env and root ../.env so editing either file works seamlessly
dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })
dotenv.config()

const { Pool } = pg

const rawDbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : ''
const supabaseUrl = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim().replace(/\/$/, '') : ''
const supabaseKey = (
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim()

export const isDirectPgConfigured = Boolean(rawDbUrl && !rawDbUrl.includes('[YOUR-PASSWORD]'))
export const isSupabaseApiConfigured = Boolean(supabaseUrl && supabaseKey)
export const isPostgresConfigured = isDirectPgConfigured || isSupabaseApiConfigured

export const supabase = isSupabaseApiConfigured
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
  : null

async function supabaseFetch(endpoint) {
  const headers = {
    apikey: supabaseKey,
    Accept: 'application/json'
  }
  if (supabaseKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${supabaseKey}`
  }
  const res = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, { headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase HTTP ${res.status}: ${text.slice(0, 160)}`)
  }
  return res.json()
}

let pool = null
if (isDirectPgConfigured) {
  pool = new Pool({
    connectionString: rawDbUrl,
    ssl: { rejectUnauthorized: false }
  })
  pool.on('error', () => {
    // Silently handle idle client error
  })
}

// In-Memory Seed Store (Matches homiiwrk PostgreSQL tables exactly)
const mockStore = {
  areas: [
    { id: 100, parent_id: 2, type: 'area', name: 'All Areas (Around LASUCOM)', short_name: 'All Areas', slug: 'all', badge: 'All 6 Hubs', desc: 'All vetted student hubs around LASUCOM Medical Campus.' },
    { id: 101, parent_id: 2, type: 'area', name: 'GRA Ikeja Perimeter', short_name: 'GRA Ikeja', slug: 'gra-ikeja', badge: '6-8 mins walk', desc: 'Tranquil gated residential enclave with private security patrols and uninterrupted study zones.' },
    { id: 102, parent_id: 2, type: 'area', name: 'Ikeja Teaching Hospital Axis', short_name: 'Hospital Axis', slug: 'hospital-axis', badge: '3-7 mins walk', desc: 'Direct walking proximity to LASUTH clinical wards, pediatric clinics, and call duty quarters.' },
    { id: 103, parent_id: 2, type: 'area', name: 'LASUCOM Campus & Auditorium Axis', short_name: 'Campus Axis', slug: 'campus-axis', badge: '4-6 mins walk', desc: 'Immediate access to lecture halls, Anatomy complex, and college digital library.' },
    { id: 104, parent_id: 2, type: 'area', name: 'College Main Gate & Perimeter', short_name: 'Main Gate', slug: 'main-gate', badge: '10-12 mins walk', desc: 'Vibrant student neighborhood with affordable flatshares, supermarkets, and commercial bus links.' },
    { id: 105, parent_id: 2, type: 'area', name: 'Allen & Opebi Link', short_name: 'Allen & Opebi', slug: 'allen-opebi', badge: '12-15 mins shuttle', desc: 'Direct shuttle corridor with modern dining, banks, and shopping facilities.' }
  ],
  listings: [
    {
      id: 1,
      public_id: 'd9e03d15-5d98-4c6e-82d2-8b4b7321a001',
      agent_id: 12,
      area_id: 101,
      title: 'Apex Scholars Haven',
      description: 'Single En-suite room tailored for clinical-year medical & dental scholars. Sound-insulated walls and 24/7 dedicated generator changeover during municipal load shedding.',
      accommodation_type: 'hostel',
      unit_type: 'self_contain',
      address_line: 'Off Oba Akinjobi Way, Ikeja GRA, Lagos',
      rent_kobo: 45000000, // ₦450,000
      rent_period: 'annual',
      total_spaces: 1,
      available_spaces: 1,
      furnished: true,
      status: 'active',
      rating: 4.9,
      distance_mins: 6,
      distance_text: '6 mins walk to Anatomy Block',
      amenities: ['24/7 Generator', 'Treated Water', 'Reading Hall', '24h Security Guard', 'Fiber Internet'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHrve7CQLF8KtRoAQRwAXV5gAr-BpFX2tbq_RKDir6ECZaNGlxQD21wgYQ6PN3OaRt1-jIedeHrfSzrcUAzqF2RDI6Xz1gq0NDlCwP_JlAtG5izlwjDuIg6iBbcMLMz720lDfD5NMA7nr-zolWxDUfgwjn4twmBof8DuEAsOFnfBmBGZ3oV0cLhE7NO-4H_k-XhaofgoxMjTofEKHFdwv7xkFB7DkjuXRPnhF-BVYePAG-FmW4jqmn'
    },
    {
      id: 2,
      public_id: 'd9e03d15-5d98-4c6e-82d2-8b4b7321a002',
      agent_id: 14,
      area_id: 102,
      title: 'Ikeja Medics Residency',
      description: 'High-end co-living apartment specifically curated for resident doctors and final-year medical students. Digital smart lock entries, common laundry, and weekly housekeeping.',
      accommodation_type: 'co_living',
      unit_type: 'one_bed',
      address_line: 'Near Lagos State University Teaching Hospital, Ikeja',
      rent_kobo: 52000000, // ₦520,000
      rent_period: 'annual',
      total_spaces: 3,
      available_spaces: 1,
      furnished: true,
      status: 'active',
      rating: 5.0,
      distance_mins: 10,
      distance_text: '10 mins walk to Ikeja Teaching Hospital',
      amenities: ['High-Speed WiFi', 'Biometric Access', 'Wash & Fold', 'Fully Equipped Kitchen', 'Air Conditioned'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDorwPD2BIIay2AZkQwUQIZT0WJFZbhvnmS2PrZ7kCYtQGRXsPZ2ByOSFL8YWAWXpBrszk6D8p1N4vyrYmR-ubzuk1vnfCg8kyc5cODPqgSJQWcO9XYjFKizM6SsI4W4GsFBCDaCeZeKfCFez095JDQlHLqQKqLkMQ2AoteozMg9YZaXLHmR_jU4acVd0xCRWiaHyKjX4uX4Tx7-SnKefmkwkxtu624zAQ0CQjT6zma5DK9sCR3lNW5'
    },
    {
      id: 3,
      public_id: 'd9e03d15-5d98-4c6e-82d2-8b4b7321a003',
      agent_id: 15,
      area_id: 101,
      title: 'Greenwood Student Suites',
      description: 'Two-bedroom apartment shared with one verified peer. Situated in a tranquil and secure gated street inside the GRA boundary, offering maximum privacy for board exam preparations.',
      accommodation_type: 'flatshare',
      unit_type: 'two_bed',
      address_line: 'GRA Ikeja Perimeter, Ikeja, Lagos',
      rent_kobo: 38000000, // ₦380,000
      rent_period: 'annual',
      total_spaces: 2,
      available_spaces: 1,
      furnished: true,
      status: 'active',
      rating: 4.8,
      distance_mins: 8,
      distance_text: '8 mins walk to College Library',
      amenities: ['Ergonomic Study', 'Fitted Kitchen', 'CCTV Monitored', 'Vehicle Parking', 'Continuous Water'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtVasEjMvbYBYsaIGSbh92jME8Hq-IDYbtkPlQcIrr9_b2TvJX2Wvf0SASTXLD6YeGCah7fUJo50axADQnMRLgwzKS2AOE5JHPVKfl2aDmyjvDfdf0A_gCG7rX6laIR1ue4px7mUIz4aODO-ndfnEs9Bsfyedjq8rP0s2dDoc7Wt6kdMXU_T5VGJHaXXXoH0DFFryNPVRfdRBMqg-IJRYjfkN2MkNfiH63eG7fPUwlHhy4-yc10WeG'
    },
    {
      id: 4,
      public_id: 'd9e03d15-5d98-4c6e-82d2-8b4b7321a004',
      agent_id: 16,
      area_id: 104,
      title: 'Alhaji Jakande Villa Flatshare',
      description: 'Affordable, spacious shared apartment within walking proximity to the main campus gates. Large ventilated balcony, twin beds with individual lockers, clean borehole water supply.',
      accommodation_type: 'flatshare',
      unit_type: 'two_bed',
      address_line: 'Near College Main Gate, Ikeja',
      rent_kobo: 32000000, // ₦320,000
      rent_period: 'annual',
      total_spaces: 2,
      available_spaces: 1,
      furnished: false,
      status: 'active',
      rating: 4.7,
      distance_mins: 12,
      distance_text: '12 mins to Main Gate',
      amenities: ['Clean Borehole', 'Gated Estate', 'Balcony View', 'Prepaid Meter'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdu7g9jILV7o8ackEkoFYFOb4k7tGucjWIbtpTNVMYASIfOY6CwB4gObH3P5kioqnmgZf2iZCdRmPja9afhmiF6YuACTB1HFV7C-dV17CoQ_Pav61xUJwGU5XuJAZF-Zydyei6J6b3DQrt9QEOnnKhwol4AyI2VxH2qucRHxz_FWb2t1g4bpWhNO0rDVS6qvrl3A-CzgI86PBcMfsIjcjSGlQWppjtIKU16km-VGOqr-uYcSWPlyP_'
    },
    {
      id: 5,
      public_id: 'd9e03d15-5d98-4c6e-82d2-8b4b7321a005',
      agent_id: 17,
      area_id: 103,
      title: 'Prestige Co-living Hall',
      description: 'Premium all-inclusive student living with uninterrupted 24/7 inverter air conditioning, fiber WiFi, on-demand barista coffee corner, and private soundproofed study booths.',
      accommodation_type: 'serviced',
      unit_type: 'self_contain',
      address_line: 'Auditorium Way, LASUCOM Medical Campus Axis',
      rent_kobo: 65000000, // ₦650,000
      rent_period: 'annual',
      total_spaces: 1,
      available_spaces: 1,
      furnished: true,
      status: 'active',
      rating: 4.9,
      distance_mins: 5,
      distance_text: '5 mins to LASUCOM Auditorium',
      amenities: ['Inverter Air-Con', 'Daily Housekeeping', 'Coffee Bar', 'Zero Power Cuts', 'Unlimited Fiber'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCl44Q7d-KMWz1THu2TlNdrmyjUBztWVl7akLz5cQ2aE6FetXDpFf1_YDmEmj560Q7dCj9WLetrFM_py_FMXYtSa8kkPQBuXiKhIjJwUuPXTPRuD7TD0ZA2o1JjPcxLLXd0sjJ5i77vBnnA-OF9opYH6ycZAtpyGi2cAbtN2mwtAnk_MIdD8w_VRJ9C3fuHLm_rI3pKKbWomAyZyaO1efAdXUenMVs8u6u2DgNXOLURGhEEp5JGI3b4'
    },
    {
      id: 6,
      public_id: 'd9e03d15-5d98-4c6e-82d2-8b4b7321a006',
      agent_id: 18,
      area_id: 104,
      title: 'Sterling En-suite Hostel',
      description: 'Modern self-contained units with private bathrooms and individual kitchenettes. Well-maintained perimeter fencing, industrial borehole water treatment plant, and night security guard.',
      accommodation_type: 'hostel',
      unit_type: 'self_contain',
      address_line: 'Campus Perimeter Road, Ikeja',
      rent_kobo: 41000000, // ₦410,000
      rent_period: 'annual',
      total_spaces: 1,
      available_spaces: 1,
      furnished: false,
      status: 'active',
      rating: 4.6,
      distance_mins: 7,
      distance_text: '7 mins to Campus Gate',
      amenities: ['Backup Generator', 'Motorcycle Park', 'Personal Cooking Bay', 'Gated Access'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqD8JJda_a8Q2jAp-bptGiC8cic1BDQJhZAfwJdEj9ATv_kTXCyk5AZkEZS5JNZJc1AokEa6uEc0iWCkLSrE47kfvb6FE4eu6dhtnms7EDC2qt7Ercwb8VFSwlfem1g6dICDZ4tf3qp0ovbcAYTEtZKDM0fcyLpGMVAyVDazuT971veBzjgFZVB1iq9xPay28e5wo0dwIqq5ala9ooYHg66P_4N7oA7q7PSRGeDTNKxz0VDOMJ0pIQ'
    }
  ],
  peers: [
    {
      id: 1,
      name: 'Dr. Chisom Okonkwo',
      faculty: 'Medicine & Surgery (Clinicals)',
      level: '500L Clinicals',
      avatar: 'https://images.unsplash.com/photo-1594824813583-09439c3a388a?w=150&h=150&fit=crop&crop=face',
      compatibility: 94,
      area_id: 101,
      area_name: 'GRA Ikeja Perimeter',
      budget_formatted: '₦400k - ₦500k',
      study_rhythm: 'Night Owl (Ward revision till 2:30 AM)',
      quiet_hours: 'Strict 10:30 PM quiet time',
      phone_masked: '+234 803 ••• ••12',
      whatsapp_number: '2348030000012',
      bio: '500L MBBS student with obstetrics call rounds. Seeking a quiet, hygiene-conscious roommate who respects nocturnal revision hours.',
      badges: ['Quiet Hours Vetted', 'Cleanliness A+', 'Non-Smoker']
    },
    {
      id: 2,
      name: 'Babatunde Adeleke',
      faculty: 'BDS Dentistry',
      level: '400L Clinicals',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      compatibility: 89,
      area_id: 102,
      area_name: 'Ikeja Teaching Hospital Axis',
      budget_formatted: '₦350k - ₦450k',
      study_rhythm: 'Early Bird (4:30 AM morning study)',
      quiet_hours: 'Moderate after 11 PM',
      phone_masked: '+234 812 ••• ••45',
      whatsapp_number: '2348120000045',
      bio: 'Dental scholar looking for a flatmate around Ikeja Hospital axis to split a 2-bedroom serviced apartment with reliable generator.',
      badges: ['Early Riser', 'Generator Split', 'Study Pod']
    },
    {
      id: 3,
      name: 'Zainab Danjuma',
      faculty: 'Nursing Sciences',
      level: '300L Clinicals',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
      compatibility: 86,
      area_id: 103,
      area_name: 'LASUCOM Campus & Auditorium Axis',
      budget_formatted: '₦300k - ₦400k',
      study_rhythm: 'Library Only',
      quiet_hours: 'Shift duty flexible',
      phone_masked: '+234 901 ••• ••78',
      whatsapp_number: '2349010000078',
      bio: 'Clinical nursing student on 8-hour shift rotations. Looking for a neat flatmate who values cleanliness and peace.',
      badges: ['Shift Respect', 'Borehole Water', 'Tidy']
    }
  ],
  conversations: new Map(),
  intros: new Map(),
  userListings: new Map()
}

// Data Access Methods
export const db = {
  async query(text, params = []) {
    if (isPostgresConfigured && pool) {
      return pool.query(text, params)
    }
    return { rows: [] }
  },

  async getAreas() {
    if (isSupabaseApiConfigured) {
      try {
        const rows = await supabaseFetch('areas?is_active=eq.true&order=id.asc')
        if (Array.isArray(rows) && rows.length > 0) {
          return rows.map((r) => ({
            ...r,
            desc: r.desc || r.desc_text || ''
          }))
        }
      } catch (err) {
        // Fallback to in-memory store
      }
    }
    if (isDirectPgConfigured && pool) {
      try {
        const res = await pool.query('SELECT * FROM areas WHERE is_active = TRUE ORDER BY id ASC')
        if (res.rows.length > 0) {
          return res.rows.map((r) => ({
            ...r,
            desc: r.desc || r.desc_text || ''
          }))
        }
      } catch (err) {
        // Fallback to in-memory store
      }
    }
    return mockStore.areas
  },

  async findArea(query) {
    if (!query) return mockStore.areas[0]
    const clean = query.toLowerCase().trim()
    const areas = await this.getAreas()

    if (clean === 'all' || clean.includes('all areas') || clean.includes('all hubs')) {
      return areas[0] || mockStore.areas[0]
    }
    
    // Fuzzy matching by name, slug, or keywords
    const match = areas.find((a) => {
      const n = a.name.toLowerCase()
      const s = a.slug.toLowerCase()
      if (clean.includes('gra') && (n.includes('gra') || s.includes('gra'))) return true
      if ((clean.includes('hospital') || clean.includes('lasuth') || clean.includes('clinic')) && n.includes('hospital')) return true
      if ((clean.includes('campus') || clean.includes('auditorium')) && n.includes('campus')) return true
      if ((clean.includes('gate') || clean.includes('main')) && n.includes('gate')) return true
      if ((clean.includes('allen') || clean.includes('opebi')) && n.includes('allen')) return true
      return n.includes(clean) || clean.includes(n)
    })
    return match || null
  },

  async searchListings({ area_id, max_rent_kobo, accommodation_type } = {}) {
    const areas = await this.getAreas().catch(() => mockStore.areas)
    let baseListings = []

    if (isSupabaseApiConfigured) {
      try {
        const filters = ['status=eq.active', 'order=rent_kobo.asc']
        if (area_id && Number(area_id) !== 100) filters.push(`area_id=eq.${encodeURIComponent(area_id)}`)
        if (max_rent_kobo) filters.push(`rent_kobo=lte.${encodeURIComponent(max_rent_kobo)}`)
        if (accommodation_type && accommodation_type !== 'All') {
          filters.push(`accommodation_type=eq.${encodeURIComponent(accommodation_type)}`)
        }
        const rows = await supabaseFetch(`listings?${filters.join('&')}`)
        if (Array.isArray(rows) && rows.length > 0) {
          baseListings = rows
        }
      } catch {
        // Fallback to seed store below
      }
    }

    if (baseListings.length === 0 && isDirectPgConfigured && pool) {
      try {
        let query = `SELECT * FROM listings WHERE status = 'active'`
        const params = []
        if (area_id && Number(area_id) !== 100) {
          params.push(area_id)
          query += ` AND area_id = $${params.length}`
        }
        if (max_rent_kobo) {
          params.push(max_rent_kobo)
          query += ` AND rent_kobo <= $${params.length}`
        }
        if (accommodation_type && accommodation_type !== 'All') {
          params.push(accommodation_type)
          query += ` AND accommodation_type = $${params.length}`
        }
        query += ` ORDER BY rent_kobo ASC`
        const res = await pool.query(query, params)
        if (res.rows.length > 0) {
          baseListings = res.rows
        }
      } catch {
        // Fallback to seed store below
      }
    }

    if (baseListings.length === 0) {
      baseListings = mockStore.listings
    }

    // Merge user-listed apartments from persistent disk store so Lydia finds newly listed spaces too
    const userListings = readPersistentListings()
    const combined = [...userListings, ...baseListings]

    const seen = new Set()
    const filtered = []

    for (const raw of combined) {
      const enriched = enrichListingRecord(raw, areas)
      if (enriched.status !== 'active') continue
      if (area_id && Number(area_id) !== 100 && Number(enriched.area_id) !== Number(area_id)) continue
      if (max_rent_kobo && Number(enriched.rent_kobo) > Number(max_rent_kobo)) continue
      if (
        accommodation_type &&
        accommodation_type !== 'All' &&
        String(enriched.accommodation_type).toLowerCase() !== String(accommodation_type).toLowerCase()
      ) {
        continue
      }

      const dedupeKey = String(enriched.public_id || enriched.slug || enriched.id).toLowerCase()
      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey)
        filtered.push(enriched)
      }
    }

    // Sort cleanly by annual rent ascending
    filtered.sort((a, b) => Number(a.rent_kobo) - Number(b.rent_kobo))
    return filtered
  },

  async getUpgrades({ area_id, budget_kobo }) {
    if (!budget_kobo) return []
    const all = await this.searchListings({ area_id, accommodation_type: 'All' })
    // Return listings 10% to 50% above target budget
    return all.filter((l) => l.rent_kobo > budget_kobo && l.rent_kobo <= budget_kobo * 1.5)
  },

  async getRoommateMatches({ faculty, area_id }) {
    if (isSupabaseApiConfigured) {
      try {
        const rows = await supabaseFetch('users?select=*,tenant_profiles!inner(*)&limit=10')
        if (Array.isArray(rows) && rows.length > 0) {
          return rows.map((u) => {
            const tp = Array.isArray(u.tenant_profiles) ? u.tenant_profiles[0] : (u.tenant_profiles || {})
            return {
              ...u,
              ...tp,
              id: u.id,
              name: u.full_name || tp.name,
              faculty: tp.occupation_or_study || 'Student / Professional'
            }
          })
        }
      } catch (err) {
        // Fallback to in-memory store
      }
    }
    if (isDirectPgConfigured && pool) {
      try {
        const res = await pool.query(`SELECT * FROM users JOIN tenant_profiles ON users.id = tenant_profiles.user_id LIMIT 10`)
        if (res.rows.length > 0) {
          return res.rows.map((r) => ({
            ...r,
            name: r.name || r.full_name,
            faculty: r.faculty || r.occupation_or_study || 'Student / Professional'
          }))
        }
      } catch (err) {
        // Fallback to in-memory store
      }
    }
    return mockStore.peers
  },

  async getConversation(id) {
    return mockStore.conversations.get(id) || null
  },

  async saveConversation(id, conv) {
    mockStore.conversations.set(id, conv)
    return conv
  },

  async createIntro(requesterId, matchId) {
    const id = Date.now()
    const record = {
      id,
      match_id: matchId,
      requester_id: requesterId || 99,
      status: 'accepted', // Auto-accept in demo so user immediately gets WhatsApp link!
      created_at: new Date().toISOString()
    }
    mockStore.intros.set(String(matchId), record)
    return record
  },

  async getIntro(matchId) {
    return mockStore.intros.get(String(matchId)) || null
  },

  /**
   * Save shared apartment listing with full user & property metadata to persistent disk (+ Supabase best-effort)
   */
  async saveUserListing({ email, listing }) {
    const userEmail = String(email || '').trim().toLowerCase()
    const listingId = String(listing.id || `custom-${Date.now()}`)
    const priceNum = parseInt(String(listing.price || 400000).replace(/,/g, ''), 10) || 400000
    const agencyNum = parseInt(String(listing.agencyFee || 5000).replace(/,/g, ''), 10) || 5000
    const defaultImg = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80'
    const gallery = Array.isArray(listing.gallery) && listing.gallery.length > 0
      ? listing.gallery.filter(Boolean)
      : [listing.image || defaultImg]
    const primaryImg = listing.image || gallery[0] || defaultImg
    const totalSpaces = Number(listing.total_spaces ?? listing.totalSpaces) || 2
    const availableSpaces = Number(listing.available_spaces ?? listing.availableSpaces) || 1
    const rawPhone = String(listing.phone || '').trim()
    const maskedPhone = listing.listerPhoneMasked || (rawPhone.length >= 7
      ? `+234 ${rawPhone.replace(/\D/g, '').slice(-10, -5)} ••• ••`
      : '+234 905 ••• ••33')

    const fullRecord = {
      id: listingId,
      public_id: listing.public_id || `pub-${listingId}`,
      area_id: Number(listing.area_id) || 101,
      title: listing.title,
      category: listing.category || 'Flatshare',
      accommodation_type: listing.accommodation_type || 'flatshare',
      unit_type: listing.unit_type || 'two_bed',
      total_spaces: totalSpaces,
      totalSpaces,
      available_spaces: availableSpaces,
      availableSpaces,
      status: 'active',
      distance: Number(listing.distance) || 8,
      distanceText: listing.distanceText || '8 mins to Transit & Hubs',
      rent_kobo: listing.rent_kobo || priceNum * 100,
      price: priceNum,
      priceFormatted: listing.priceFormatted || `₦${priceNum.toLocaleString()}`,
      rent_period: listing.rent_period || 'annual',
      billingCycle: listing.billingCycle || 'Annual rent · Standard tenancy',
      agencyFee_kobo: agencyNum * 100,
      agencyFee: agencyNum,
      agencyFeeFormatted: listing.agencyFeeFormatted || `₦${agencyNum.toLocaleString()}`,
      address: listing.location || listing.address_line || listing.address || 'GRA Ikeja, Lagos',
      location: listing.location || listing.address_line || listing.address || 'GRA Ikeja, Lagos',
      description: listing.description || 'Newly listed verified accommodation with reliable power and clean water.',
      fullDescription: listing.fullDescription || listing.description || 'Spacious, well-ventilated apartment situated in a gated security perimeter with reliable backup power, treated water, and quick transit links.',
      amenities: normalizeAmenities(listing.amenities),
      image: primaryImg,
      gallery,
      listerType: listing.listerType || 'individual',
      listerName: listing.listerName || 'Verified Resident',
      listerRole: listing.listerRole || (listing.listerType === 'agent' ? 'Licensed Property Agent' : 'Current Tenant / Flatmate'),
      listerRating: Number(listing.listerRating) || 5.0,
      rating: Number(listing.rating) || 5.0,
      reviewCount: Number(listing.reviewCount) || 1,
      targetAudience: listing.targetAudience || 'Students & Young Professionals',
      phone: rawPhone,
      listerPhoneMasked: maskedPhone,
      verifiedLandlord: listing.verifiedLandlord || listing.listerName || 'Verified Property Manager',
      depositEscrow: true,
      inspectionFeeNotice: listing.inspectionFeeNotice || 'Agency pairing fee (₦5,000) paid directly on WhatsApp',
      userEmail,
      createdAt: listing.createdAt || new Date().toISOString(),
      inquiriesCount: Number(listing.inquiriesCount) || 0,
      inspectionsScheduled: Number(listing.inspectionsScheduled) || 0
    }

    // Best-effort sync to PostgreSQL if directly reachable
    if (isDirectPgConfigured && pool) {
      try {
        await pool.query(
          `INSERT INTO listings (area_id, title, description, accommodation_type, rent_kobo, status)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [fullRecord.area_id, fullRecord.title, fullRecord.description, fullRecord.accommodation_type, fullRecord.rent_kobo, 'active']
        )
      } catch {
        // Fallback gracefully to persistent JSON store
      }
    }

    // Persist permanently to backend/data/listings.json
    const allListings = readPersistentListings()
    const updatedAll = [fullRecord, ...allListings.filter((item) => String(item.id) !== listingId)]
    writePersistentListings(updatedAll)

    return fullRecord
  },

  /**
   * Retrieve all active user-listed apartments across the marketplace (newest first)
   */
  async getAllUserListings() {
    const allListings = readPersistentListings()
    return allListings.filter((item) => String(item.status || 'active').toLowerCase() === 'active')
  },

  /**
   * Retrieve a single listing (user-listed OR seed/Supabase) by id, numeric id, public_id, or canonical slug
   */
  async getListingById(id) {
    if (!id) return null
    const target = String(id).trim().toLowerCase()

    // 1. Check user-listed apartments in persistent disk store
    const allUserListings = readPersistentListings()
    const userMatch = allUserListings.find(
      (item) =>
        String(item.id).toLowerCase() === target ||
        String(item.public_id || '').toLowerCase() === target ||
        String(item.slug || '').toLowerCase() === target
    )
    if (userMatch) return userMatch

    // 2. Check seed / Supabase listings by numeric id, public_id, or canonical slug
    const areas = await this.getAreas().catch(() => mockStore.areas)
    const seedMatch = mockStore.listings.find((item) => {
      const slug = SEED_SLUG_BY_PUBLIC_ID[item.public_id] || SEED_SLUG_BY_NUMERIC_ID[String(item.id)] || ''
      return (
        String(item.id).toLowerCase() === target ||
        String(item.public_id || '').toLowerCase() === target ||
        slug.toLowerCase() === target
      )
    })

    if (seedMatch) {
      const enriched = enrichListingRecord(seedMatch, areas)
      return {
        ...enriched,
        id: enriched.slug,
        amenities: enriched.amenitiesStructured
      }
    }

    return null
  },

  /**
   * Retrieve all listings created by a specific user
   */
  async getUserListings(email) {
    const userEmail = String(email || '').trim().toLowerCase()
    if (!userEmail) return []
    const allListings = readPersistentListings()
    return allListings.filter((item) => String(item.userEmail || '').toLowerCase() === userEmail)
  },

  /**
   * Delete a listed apartment permanently from persistent storage
   */
  async deleteUserListing({ email, listingId }) {
    const userEmail = String(email || '').trim().toLowerCase()
    const targetId = String(listingId)
    const allListings = readPersistentListings()
    const updatedAll = allListings.filter((item) => {
      if (String(item.id) !== targetId) return true
      // If email was passed, ensure ownership matches (or allow if item had no userEmail)
      if (userEmail && item.userEmail && String(item.userEmail).toLowerCase() !== userEmail) {
        return true
      }
      return false
    })
    writePersistentListings(updatedAll)
    const remainingForUser = userEmail
      ? updatedAll.filter((item) => String(item.userEmail || '').toLowerCase() === userEmail).length
      : updatedAll.length
    return { success: true, removedId: listingId, remainingCount: remainingForUser }
  }
}
