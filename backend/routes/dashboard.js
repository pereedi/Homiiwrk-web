// =====================================================================
// HOMIIWRK USER DASHBOARD ROUTE
// Rented houses, agency fees paid, flatshare matches, and listed apartments
// =====================================================================
import express from 'express'
import { db } from '../db.js'

const router = express.Router()

// Dynamic runtime stores for fresh users
const userListingsStore = new Map()
const userPassesStore = new Map()
const userRentedStore = new Map()

// Predefined Demo Accounts with sample high-fidelity demonstration data
const DEMO_EMAILS = [
  'chisom.okonkwo@gmail.com',
  'babatunde.adeleke@yahoo.com',
  'admin@apexprime.ng'
]

// Demo Datasets (Strictly scoped to demo accounts)
const demoRentedStays = [
  {
    id: 'apex-scholars-haven',
    title: 'Apex Prime Studio Suites',
    category: 'Hostel / Self-Contain',
    area: 'GRA Ikeja Perimeter',
    address: 'Off Oba Akinjobi Way, Ikeja GRA, Lagos',
    annualRentFormatted: '₦450,000',
    annualRentNumber: 450000,
    rentPeriod: 'Annual Tenancy (2026 / 2027)',
    leaseStart: 'Nov 1, 2026',
    leaseEnd: 'Oct 31, 2027',
    escrowStatus: 'Escrow Protected',
    escrowBadge: 'Funds Held in Escrow',
    paymentMethod: 'Debit Card (Paystack)',
    receiptId: 'HW-REC-892104',
    landlordName: 'Chief Babatunde K.',
    landlordPhone: '+234 802 819 0012',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHrve7CQLF8KtRoAQRwAXV5gAr-BpFX2tbq_RKDir6ECZaNGlxQD21wgYQ6PN3OaRt1-jIedeHrfSzrcUAzqF2RDI6Xz1gq0NDlCwP_JlAtG5izlwjDuIg6iBbcMLMz720lDfD5NMA7nr-zolWxDUfgwjn4twmBof8DuEAsOFnfBmBGZ3oV0cLhE7NO-4H_k-XhaofgoxMjTofEKHFdwv7xkFB7DkjuXRPnhF-BVYePAG-FmW4jqmn'
  }
]

const demoAgencyPasses = [
  {
    passId: 'HW-INSP-492019',
    propertyId: 'ikeja-medics-residency',
    propertyTitle: 'Ikeja Executive Co-Living Residency',
    area: 'Hospital & Business Axis',
    feeFormatted: '₦5,000',
    feeNumber: 5000,
    paymentChannel: 'Direct WhatsApp Pairing',
    inspectionDate: 'Tomorrow, 11:00 AM',
    status: 'Scheduled',
    listerName: 'Dr. Chisom Okonkwo',
    listerRole: 'Lead Flatmate (Medical Resident)',
    whatsappUrl: `https://wa.me/2349055748233?text=Hello%20Chisom%2C%20I%20have%20paid%20the%20agency%20pairing%20fee%20(HW-INSP-492019).%20Confirming%20our%20inspection.`
  },
  {
    passId: 'HW-INSP-381920',
    propertyId: 'greenwood-student-suites',
    propertyTitle: 'Greenwood Executive Flatshare',
    area: 'GRA Ikeja Perimeter',
    feeFormatted: '₦5,000',
    feeNumber: 5000,
    paymentChannel: 'Direct WhatsApp Pairing',
    inspectionDate: 'Completed',
    status: 'Inspection Concluded',
    listerName: 'Babatunde Adeleke',
    listerRole: 'Current Tenant',
    whatsappUrl: `https://wa.me/2348120000045`
  }
]

const demoRoommateMatches = [
  {
    id: 'peer-01',
    name: 'Dr. Chisom Okonkwo',
    role: 'Medical Resident / Young Professional',
    compatibility: 96,
    budgetFormatted: '₦500,000 / yr',
    routine: 'Night shift hospital rounds, quiet sleep 8am - 2pm, immaculate hygiene',
    quietHours: '10:00 PM - 06:00 AM',
    preferredArea: 'Hospital & Business Axis',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    whatsappUrl: `https://wa.me/2349055748233?text=Hello%20Dr.%20Chisom%2C%20we%20are%20matched%20via%20Homiiwrk%20(96%25%20Match).%20Let's%20discuss%20our%20flatshare.`
  },
  {
    id: 'peer-02',
    name: 'Babatunde Adeleke',
    role: 'Finance Analyst & Dental Scholar',
    compatibility: 92,
    budgetFormatted: '₦400,000 / yr',
    routine: 'Weekday remote workstation, low audio after 9pm, non-smoker',
    quietHours: '10:00 PM - 07:00 AM',
    preferredArea: 'GRA Ikeja Perimeter',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    whatsappUrl: `https://wa.me/2348120000045?text=Hello%20Babatunde%2C%20we%20are%20matched%20via%20Homiiwrk%20(92%25%20Match).`
  },
  {
    id: 'peer-03',
    name: 'Amina Bello',
    role: 'Software Engineer & Remote Professional',
    compatibility: 89,
    budgetFormatted: '₦550,000 / yr',
    routine: 'Coding sprint routine, noise-cancelling work hours, shared utilities',
    quietHours: '11:00 PM - 07:00 AM',
    preferredArea: 'Allen & Opebi Link',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    whatsappUrl: `https://wa.me/2348020000017?text=Hello%20Amina%2C%20we%20are%20paired%20via%20Homiiwrk.`
  }
]

const demoUserListings = [
  {
    id: 'ikeja-medics-residency',
    title: 'Ikeja Executive Co-Living Residency (Private Room Sublet)',
    category: 'Co-living Flatshare',
    priceFormatted: '₦520,000 / yr',
    agencyFeeFormatted: '₦5,000',
    area: 'Hospital & Business Axis',
    address: 'Near Lagos State University Teaching Hospital, Ikeja',
    status: 'Active',
    totalSpaces: 3,
    availableSpaces: 1,
    inquiriesCount: 14,
    inspectionsScheduled: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDorwPD2BIIay2AZkQwUQIZT0WJFZbhvnmS2PrZ7kCYtQGRXsPZ2ByOSFL8YWAWXpBrszk6D8p1N4vyrYmR-ubzuk1vnfCg8kyc5cODPqgSJQWcO9XYjFKizM6SsI4W4GsFBCDaCeZeKfCFez095JDQlHLqQKqLkMQ2AoteozMg9YZaXLHmR_jU4acVd0xCRWiaHyKjX4uX4Tx7-SnKefmkwkxtu624zAQ0CQjT6zma5DK9sCR3lNW5'
  }
]

/**
 * GET /api/user/dashboard
 * Aggregates personalized metrics: Fresh accounts receive 100% clean data (0 counters, zero mock leases)
 */
router.get('/', async (req, res) => {
  try {
    const rawEmail = req.query.email || ''
    const userEmail = String(rawEmail).trim().toLowerCase()

    const isDemo = DEMO_EMAILS.includes(userEmail)

    // For Demo accounts: return full demonstration preview
    if (isDemo) {
      return res.json({
        success: true,
        userEmail,
        isDemo: true,
        kpi: {
          rentedCount: demoRentedStays.length,
          agencyFeesCount: demoAgencyPasses.length,
          matchesCount: demoRoommateMatches.length,
          listingsCount: demoUserListings.length,
          totalEscrowFormatted: '₦450,000',
          totalAgencyFeesFormatted: '₦10,000'
        },
        rentedStays: demoRentedStays,
        agencyPasses: demoAgencyPasses,
        roommateMatches: demoRoommateMatches,
        userListings: demoUserListings
      })
    }

    // For Fresh/Registered Users: return their real dynamic data (Starts at ZERO)
    const rentedStays = userRentedStore.get(userEmail) || []
    const agencyPasses = userPassesStore.get(userEmail) || []
    const userListings = await db.getUserListings(userEmail)
    const roommateMatches = [] // Starts fresh

    const totalEscrowKobo = rentedStays.reduce((acc, curr) => acc + (curr.annualRentNumber || 0), 0)
    const totalAgencyKobo = agencyPasses.reduce((acc, curr) => acc + (curr.feeNumber || 5000), 0)

    const kpi = {
      rentedCount: rentedStays.length,
      agencyFeesCount: agencyPasses.length,
      matchesCount: roommateMatches.length,
      listingsCount: userListings.length,
      totalEscrowFormatted: `₦${totalEscrowKobo.toLocaleString()}`,
      totalAgencyFeesFormatted: `₦${totalAgencyKobo.toLocaleString()}`
    }

    return res.json({
      success: true,
      userEmail,
      isDemo: false,
      kpi,
      rentedStays,
      agencyPasses,
      roommateMatches,
      userListings
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve dashboard metrics.' })
  }
})

/**
 * POST /api/user/listings
 * Allows authenticated users to list apartments / flatshares and dynamically saves to their profile in database
 */
router.post('/listings', async (req, res) => {
  try {
    const { email, listing } = req.body

    if (!listing || !listing.title) {
      return res.status(400).json({ error: 'Valid listing details are required.' })
    }

    const userEmail = String(email || '').trim().toLowerCase() || 'anonymous@homiiwrk.ng'
    const savedListing = await db.saveUserListing({ email: userEmail, listing })
    const allListings = await db.getUserListings(userEmail)

    return res.status(201).json({
      success: true,
      listing: savedListing,
      totalListings: allListings.length
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to persist user listing.' })
  }
})

/**
 * DELETE /api/user/listings/:id
 * Allows authenticated users to remove/delete their listed apartment from dashboard
 */
router.delete('/listings/:id', async (req, res) => {
  try {
    const listingId = req.params.id
    const userEmail = String(req.query.email || req.body?.email || '').trim().toLowerCase()

    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID is required.' })
    }

    const deleteResult = await db.deleteUserListing({ email: userEmail, listingId })

    return res.json({
      success: true,
      removedId: listingId,
      remainingCount: deleteResult.remainingCount
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove listing.' })
  }
})

export default router
export { userListingsStore, userPassesStore, userRentedStore }
