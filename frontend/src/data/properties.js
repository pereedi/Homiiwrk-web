// =====================================================================
// HOMIIWRK MARKETPLACE DATA LAYER
// Aligned with Supabase / PostgreSQL schema: areas, listings, amenities, matches
// Money represented as integer KOBO (NGN 500,000 = 50000000)
// Supports both Students & Young Professionals
// =====================================================================

export const AREAS = [
  {
    id: 100,
    parent_id: 2, // Ikeja LGA
    type: 'area',
    name: 'All Hubs & Neighborhoods',
    shortName: 'All Hubs',
    slug: 'all',
    badge: 'All 6 Key Hubs'
  },
  {
    id: 101,
    parent_id: 2,
    type: 'area',
    name: 'GRA Ikeja Perimeter',
    shortName: 'GRA Ikeja',
    slug: 'gra-ikeja',
    badge: '6-8 mins walk',
    desc: 'Quiet gated residential enclave with private security patrols and high-speed fiber internet.'
  },
  {
    id: 102,
    parent_id: 2,
    type: 'area',
    name: 'Ikeja Hospital & Business Axis',
    shortName: 'Hospital Axis',
    slug: 'hospital-axis',
    badge: '3-7 mins walk',
    desc: 'Immediate proximity to healthcare centers, business offices, and commuter hubs.'
  },
  {
    id: 103,
    parent_id: 2,
    type: 'area',
    name: 'Campus & Academic Corridor',
    shortName: 'Campus Corridor',
    slug: 'campus-axis',
    badge: '4-6 mins walk',
    desc: 'Walkable corridor to lecture auditoriums, digital libraries, and collaborative study hubs.'
  },
  {
    id: 104,
    parent_id: 2,
    type: 'area',
    name: 'Main Gate & Perimeter Commercial Hub',
    shortName: 'Main Gate',
    slug: 'main-gate',
    badge: '10-12 mins walk',
    desc: 'Vibrant neighborhood with affordable flatshares, supermarkets, and commercial transit links.'
  },
  {
    id: 105,
    parent_id: 2,
    type: 'area',
    name: 'Allen & Opebi Link',
    shortName: 'Allen & Opebi',
    slug: 'allen-opebi',
    badge: '12-15 mins shuttle',
    desc: 'Direct transit links, restaurants, banking halls, and tech co-working spaces.'
  }
]

export const PROPERTIES = [
  {
    id: 'apex-scholars-haven',
    public_id: 'd9e03d15-5d98-4c6e-82d2-8b4b7321a001',
    agent_id: 12,
    area_id: 101, // GRA Ikeja
    title: 'Apex Prime Studio Suites',
    category: 'Hostel',
    accommodation_type: 'hostel',
    unit_type: 'self_contain',
    total_spaces: 1,
    available_spaces: 1,
    status: 'active',
    distance: 6,
    distanceText: '6 mins walk to Ikeja Central',
    rent_kobo: 45000000,
    price: 450000,
    priceFormatted: '₦450,000',
    rent_period: 'annual',
    billingCycle: 'Annual rent · Standard tenancy',
    agencyFee_kobo: 500000,
    agencyFee: 5000,
    agencyFeeFormatted: '₦5,000',
    listerType: 'agent', // 'agent' | 'individual'
    listerName: 'Apex Prime Real Estate',
    listerRole: 'Verified Real Estate Agent',
    listerPhoneMasked: '+234 802 ••• ••12',
    listerRating: 4.9,
    rating: 4.9,
    reviewCount: 28,
    targetAudience: 'Students & Young Professionals',
    description: 'Single en-suite room tailored for focused students and early-career professionals.',
    fullDescription: 'Apex Prime Studio Suites is designed specifically for students and young professionals seeking quiet, uninterrupted productivity. Located within a secure pedestrian corridor in GRA Ikeja, each unit features an en-suite bathroom, dedicated study desk, sound-insulated partition walls, and 24/7 dedicated generator changeover during municipal load shedding.',
    amenities: [
      { icon: 'bolt', text: '24/7 Generator' },
      { icon: 'water_drop', text: 'Treated Water' },
      { icon: 'local_library', text: 'Reading/Work Lounge' },
      { icon: 'security', text: '24h Security Guard' },
      { icon: 'wifi', text: 'Fiber Internet' }
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHrve7CQLF8KtRoAQRwAXV5gAr-BpFX2tbq_RKDir6ECZaNGlxQD21wgYQ6PN3OaRt1-jIedeHrfSzrcUAzqF2RDI6Xz1gq0NDlCwP_JlAtG5izlwjDuIg6iBbcMLMz720lDfD5NMA7nr-zolWxDUfgwjn4twmBof8DuEAsOFnfBmBGZ3oV0cLhE7NO-4H_k-XhaofgoxMjTofEKHFdwv7xkFB7DkjuXRPnhF-BVYePAG-FmW4jqmn',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBHrve7CQLF8KtRoAQRwAXV5gAr-BpFX2tbq_RKDir6ECZaNGlxQD21wgYQ6PN3OaRt1-jIedeHrfSzrcUAzqF2RDI6Xz1gq0NDlCwP_JlAtG5izlwjDuIg6iBbcMLMz720lDfD5NMA7nr-zolWxDUfgwjn4twmBof8DuEAsOFnfBmBGZ3oV0cLhE7NO-4H_k-XhaofgoxMjTofEKHFdwv7xkFB7DkjuXRPnhF-BVYePAG-FmW4jqmn',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDba_OrmCCw7vexWloTJQiMk3PE7z9rciIH8HIvYqY2ve2fw0-8zGsuvY2W70wYn-aCJ2hnQMe8xJKTgpASeP-XmJiX_0epcfl9f5sjAmXxKbgQHivzqByT_rVSQds8tMd_ckQEXDP8TbIlWGbkXm9mNotxcrhuXT130_geq6Bs_8ZC1yhQ7xp1f1Q7mHfz8KU1iqYuVnz7_3OlHjLI5yU6EHWQfk2QBVwoDdPq72wjfltjjgnQ0rPZWOLzFbiYru-YQQ'
    ],
    location: 'Off Oba Akinjobi Way, Ikeja GRA, Lagos',
    verifiedLandlord: 'Chief Babatunde K. (Vetted Property Manager)',
    depositEscrow: true,
    inspectionFeeNotice: '₦5,000 agency pairing fee paid directly on WhatsApp before physical inspection'
  },
  {
    id: 'ikeja-medics-residency',
    public_id: 'd9e03d15-5d98-4c6e-82d2-8b4b7321a002',
    agent_id: 14,
    area_id: 102, // Hospital Axis
    title: 'Ikeja Executive Co-Living Residency',
    category: 'Co-living',
    accommodation_type: 'co_living',
    unit_type: 'one_bed',
    total_spaces: 3,
    available_spaces: 1,
    status: 'active',
    distance: 10,
    distanceText: '10 mins walk to Ikeja Teaching Hospital & Commercial Hub',
    rent_kobo: 52000000,
    price: 520000,
    priceFormatted: '₦520,000',
    rent_period: 'annual',
    billingCycle: 'Annual rate · Power & utilities included',
    agencyFee_kobo: 500000,
    agencyFee: 5000,
    agencyFeeFormatted: '₦5,000',
    listerType: 'individual', // Listed by an individual tenant looking for a flatmate
    listerName: 'Dr. Chisom Okonkwo',
    listerRole: 'Current Tenant / Lead Flatmate (Medical Resident)',
    listerPhoneMasked: '+234 803 ••• ••12',
    listerRating: 5.0,
    rating: 5.0,
    reviewCount: 41,
    targetAudience: 'Young Professionals & Clinical Students',
    description: 'Private bedroom in a curated 3-person co-living home with shared study & workstation suite.',
    fullDescription: 'High-end co-living apartment curated for working professionals, tech remote staff, and final-year medical scholars. Features high-speed fiber broadband, digital smart lock entries, common laundry machines, weekly professional housekeeping, and an acoustic sound-managed environment.',
    amenities: [
      { icon: 'wifi', text: 'High-Speed WiFi' },
      { icon: 'security', text: 'Biometric Access' },
      { icon: 'local_laundry_service', text: 'Wash & Fold' },
      { icon: 'kitchen', text: 'Fully Equipped Kitchen' },
      { icon: 'ac_unit', text: 'Air Conditioned' }
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDorwPD2BIIay2AZkQwUQIZT0WJFZbhvnmS2PrZ7kCYtQGRXsPZ2ByOSFL8YWAWXpBrszk6D8p1N4vyrYmR-ubzuk1vnfCg8kyc5cODPqgSJQWcO9XYjFKizM6SsI4W4GsFBCDaCeZeKfCFez095JDQlHLqQKqLkMQ2AoteozMg9YZaXLHmR_jU4acVd0xCRWiaHyKjX4uX4Tx7-SnKefmkwkxtu624zAQ0CQjT6zma5DK9sCR3lNW5',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDorwPD2BIIay2AZkQwUQIZT0WJFZbhvnmS2PrZ7kCYtQGRXsPZ2ByOSFL8YWAWXpBrszk6D8p1N4vyrYmR-ubzuk1vnfCg8kyc5cODPqgSJQWcO9XYjFKizM6SsI4W4GsFBCDaCeZeKfCFez095JDQlHLqQKqLkMQ2AoteozMg9YZaXLHmR_jU4acVd0xCRWiaHyKjX4uX4Tx7-SnKefmkwkxtu624zAQ0CQjT6zma5DK9sCR3lNW5',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCl44Q7d-KMWz1THu2TlNdrmyjUBztWVl7akLz5cQ2aE6FetXDpFf1_YDmEmj560Q7dCj9WLetrFM_py_FMXYtSa8kkPQBuXiKhIjJwUuPXTPRuD7TD0ZA2o1JjPcxLLXd0sjJ5i77vBnnA-OF9opYH6ycZAtpyGi2cAbtN2mwtAnk_MIdD8w_VRJ9C3fuHLm_rI3pKKbWomAyZyaO1efAdXUenMVs8u6u2DgNXOLURGhEEp5JGI3b4'
    ],
    location: 'Near Lagos State University Teaching Hospital, Ikeja',
    verifiedLandlord: 'Medics Haven Enclave Operators',
    depositEscrow: true,
    inspectionFeeNotice: '₦5,000 agency pairing fee paid directly on WhatsApp before physical inspection'
  },
  {
    id: 'greenwood-student-suites',
    public_id: 'd9e03d15-5d98-4c6e-82d2-8b4b7321a003',
    agent_id: 15,
    area_id: 101, // GRA Ikeja
    title: 'Greenwood Executive Flatshare',
    category: 'Flatshare',
    accommodation_type: 'flatshare',
    unit_type: 'two_bed',
    total_spaces: 2,
    available_spaces: 1,
    status: 'active',
    distance: 8,
    distanceText: '8 mins walk to Ikeja GRA Library & Transit',
    rent_kobo: 38000000,
    price: 380000,
    priceFormatted: '₦380,000',
    rent_period: 'annual',
    billingCycle: 'Annual share · Split utilities',
    agencyFee_kobo: 500000,
    agencyFee: 5000,
    agencyFeeFormatted: '₦5,000',
    listerType: 'individual',
    listerName: 'Babatunde Adeleke',
    listerRole: 'Current Tenant (Finance Analyst & Dental Scholar)',
    listerPhoneMasked: '+234 812 ••• ••45',
    listerRating: 4.8,
    rating: 4.8,
    reviewCount: 19,
    targetAudience: 'Young Professionals & University Students',
    description: '2-person shared flat in GRA Ikeja perimeter with dedicated parking & quiet zone.',
    fullDescription: 'Two-bedroom apartment shared with one verified peer. Situated in a tranquil and secure gated street inside the GRA boundary, offering maximum privacy for career professionals and students preparing for professional exams.',
    amenities: [
      { icon: 'desk', text: 'Ergonomic Desk' },
      { icon: 'kitchen', text: 'Fitted Kitchen' },
      { icon: 'videocam', text: 'CCTV Monitored' },
      { icon: 'local_parking', text: 'Vehicle Parking' },
      { icon: 'water_drop', text: 'Continuous Water' }
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtVasEjMvbYBYsaIGSbh92jME8Hq-IDYbtkPlQcIrr9_b2TvJX2Wvf0SASTXLD6YeGCah7fUJo50axADQnMRLgwzKS2AOE5JHPVKfl2aDmyjvDfdf0A_gCG7rX6laIR1ue4px7mUIz4aODO-ndfnEs9Bsfyedjq8rP0s2dDoc7Wt6kdMXU_T5VGJHaXXXoH0DFFryNPVRfdRBMqg-IJRYjfkN2MkNfiH63eG7fPUwlHhy4-yc10WeG',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCtVasEjMvbYBYsaIGSbh92jME8Hq-IDYbtkPlQcIrr9_b2TvJX2Wvf0SASTXLD6YeGCah7fUJo50axADQnMRLgwzKS2AOE5JHPVKfl2aDmyjvDfdf0A_gCG7rX6laIR1ue4px7mUIz4aODO-ndfnEs9Bsfyedjq8rP0s2dDoc7Wt6kdMXU_T5VGJHaXXXoH0DFFryNPVRfdRBMqg-IJRYjfkN2MkNfiH63eG7fPUwlHhy4-yc10WeG'
    ],
    location: 'GRA Ikeja Perimeter, Ikeja, Lagos',
    verifiedLandlord: 'Mrs. Folashade Adeyemi',
    depositEscrow: true,
    inspectionFeeNotice: '₦5,000 agency pairing fee paid directly on WhatsApp before physical inspection'
  },
  {
    id: 'alhaji-jakande-villa-flatshare',
    public_id: 'd9e03d15-5d98-4c6e-82d2-8b4b7321a004',
    agent_id: 16,
    area_id: 104, // Main Gate
    title: 'Jakande Villa Shared Apartment',
    category: 'Flatshare',
    accommodation_type: 'flatshare',
    unit_type: 'two_bed',
    total_spaces: 2,
    available_spaces: 1,
    status: 'active',
    distance: 12,
    distanceText: '12 mins to Ikeja Bus Terminal',
    rent_kobo: 32000000,
    price: 320000,
    priceFormatted: '₦320,000',
    rent_period: 'annual',
    billingCycle: 'Annual share · Verified landlord',
    agencyFee_kobo: 500000,
    agencyFee: 5000,
    agencyFeeFormatted: '₦5,000',
    listerType: 'agent',
    listerName: 'Jakande Real Estate Services',
    listerRole: 'Authorized Leasing Agency',
    listerPhoneMasked: '+234 802 ••• ••16',
    listerRating: 4.7,
    rating: 4.7,
    reviewCount: 15,
    targetAudience: 'Budget-Conscious Students & Workers',
    description: 'Affordable, spacious shared twin space with friendly young professionals and students.',
    fullDescription: 'Affordable, spacious shared apartment located within walking proximity to major transport nodes and commercial eateries. Features a large ventilated balcony, twin beds with individual lockers, clean borehole water supply, and friendly neighborhood estate security.',
    amenities: [
      { icon: 'water_drop', text: 'Clean Borehole' },
      { icon: 'local_police', text: 'Gated Estate' },
      { icon: 'balcony', text: 'Balcony View' },
      { icon: 'electric_meter', text: 'Prepaid Meter' }
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdu7g9jILV7o8ackEkoFYFOb4k7tGucjWIbtpTNVMYASIfOY6CwB4gObH3P5kioqnmgZf2iZCdRmPja9afhmiF6YuACTB1HFV7C-dV17CoQ_Pav61xUJwGU5XuJAZF-Zydyei6J6b3DQrt9QEOnnKhwol4AyI2VxH2qucRHxz_FWb2t1g4bpWhNO0rDVS6qvrl3A-CzgI86PBcMfsIjcjSGlQWppjtIKU16km-VGOqr-uYcSWPlyP_',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBdu7g9jILV7o8ackEkoFYFOb4k7tGucjWIbtpTNVMYASIfOY6CwB4gObH3P5kioqnmgZf2iZCdRmPja9afhmiF6YuACTB1HFV7C-dV17CoQ_Pav61xUJwGU5XuJAZF-Zydyei6J6b3DQrt9QEOnnKhwol4AyI2VxH2qucRHxz_FWb2t1g4bpWhNO0rDVS6qvrl3A-CzgI86PBcMfsIjcjSGlQWppjtIKU16km-VGOqr-uYcSWPlyP_'
    ],
    location: 'Near College Main Gate & Transport Link, Ikeja',
    verifiedLandlord: 'Alhaji Jakande Family Estate',
    depositEscrow: true,
    inspectionFeeNotice: '₦5,000 agency pairing fee paid directly on WhatsApp before physical inspection'
  },
  {
    id: 'prestige-coliving-hall',
    public_id: 'd9e03d15-5d98-4c6e-82d2-8b4b7321a005',
    agent_id: 17,
    area_id: 103, // Campus Axis
    title: 'Prestige Serviced Studio Residence',
    category: 'Serviced',
    accommodation_type: 'serviced',
    unit_type: 'self_contain',
    total_spaces: 1,
    available_spaces: 1,
    status: 'active',
    distance: 5,
    distanceText: '5 mins to Central Axis & Co-working hubs',
    rent_kobo: 65000000,
    price: 650000,
    priceFormatted: '₦650,000',
    rent_period: 'annual',
    billingCycle: 'All-inclusive · Inverter 24/7',
    agencyFee_kobo: 500000,
    agencyFee: 5000,
    agencyFeeFormatted: '₦5,000',
    listerType: 'agent',
    listerName: 'Prestige Living Nigeria Ltd',
    listerRole: 'Vetted Corporate Property Manager',
    listerPhoneMasked: '+234 802 ••• ••17',
    listerRating: 4.9,
    rating: 4.9,
    reviewCount: 33,
    targetAudience: 'Tech Workers, Analysts & Postgrad Scholars',
    description: 'Fully serviced studio with inverter backup, daily cleaning, and on-site quiet work pods.',
    fullDescription: 'Premium all-inclusive living with uninterrupted 24/7 inverter air conditioning, high-speed fiber WiFi, on-demand barista coffee corner, and private soundproofed online work booths for remote meetings, virtual seminars, and focused project sprints.',
    amenities: [
      { icon: 'ac_unit', text: 'Inverter Air-Con' },
      { icon: 'cleaning_services', text: 'Daily Housekeeping' },
      { icon: 'local_cafe', text: 'Coffee Bar' },
      { icon: 'bolt', text: 'Zero Power Cuts' },
      { icon: 'wifi', text: 'Unlimited Fiber' }
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCl44Q7d-KMWz1THu2TlNdrmyjUBztWVl7akLz5cQ2aE6FetXDpFf1_YDmEmj560Q7dCj9WLetrFM_py_FMXYtSa8kkPQBuXiKhIjJwUuPXTPRuD7TD0ZA2o1JjPcxLLXd0sjJ5i77vBnnA-OF9opYH6ycZAtpyGi2cAbtN2mwtAnk_MIdD8w_VRJ9C3fuHLm_rI3pKKbWomAyZyaO1efAdXUenMVs8u6u2DgNXOLURGhEEp5JGI3b4',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCl44Q7d-KMWz1THu2TlNdrmyjUBztWVl7akLz5cQ2aE6FetXDpFf1_YDmEmj560Q7dCj9WLetrFM_py_FMXYtSa8kkPQBuXiKhIjJwUuPXTPRuD7TD0ZA2o1JjPcxLLXd0sjJ5i77vBnnA-OF9opYH6ycZAtpyGi2cAbtN2mwtAnk_MIdD8w_VRJ9C3fuHLm_rI3pKKbWomAyZyaO1efAdXUenMVs8u6u2DgNXOLURGhEEp5JGI3b4'
    ],
    location: 'Auditorium Way, Ikeja Central Axis',
    verifiedLandlord: 'Prestige Living Nigeria Ltd',
    depositEscrow: true,
    inspectionFeeNotice: '₦5,000 agency pairing fee paid directly on WhatsApp before physical inspection'
  },
  {
    id: 'sterling-ensuite-hostel',
    public_id: 'd9e03d15-5d98-4c6e-82d2-8b4b7321a006',
    agent_id: 18,
    area_id: 104, // Main Gate
    title: 'Sterling En-suite Living Quarters',
    category: 'Hostel',
    accommodation_type: 'hostel',
    unit_type: 'self_contain',
    total_spaces: 1,
    available_spaces: 1,
    status: 'active',
    distance: 7,
    distanceText: '7 mins to Ikeja Commercial Belt',
    rent_kobo: 41000000,
    price: 410000,
    priceFormatted: '₦410,000',
    rent_period: 'annual',
    billingCycle: 'Annual rent · Direct landlord verified',
    agencyFee_kobo: 500000,
    agencyFee: 5000,
    agencyFeeFormatted: '₦5,000',
    listerType: 'agent',
    listerName: 'Sterling Estates Ltd',
    listerRole: 'Vetted Property Agency',
    listerPhoneMasked: '+234 802 ••• ••18',
    listerRating: 4.6,
    rating: 4.6,
    reviewCount: 22,
    targetAudience: 'Students & Working Adults',
    description: 'Self-contained room block with water treatment station and dedicated night security.',
    fullDescription: 'Modern self-contained units with private bathrooms and individual kitchenettes. Well-maintained perimeter fencing, industrial borehole water treatment plant, and guarded vehicle parking area.',
    amenities: [
      { icon: 'bolt', text: 'Backup Generator' },
      { icon: 'local_parking', text: 'Motorcycle / Car Park' },
      { icon: 'kitchen', text: 'Personal Cooking Bay' },
      { icon: 'security', text: 'Gated Access' }
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqD8JJda_a8Q2jAp-bptGiC8cic1BDQJhZAfwJdEj9ATv_kTXCyk5AZkEZS5JNZJc1AokEa6uEc0iWCkLSrE47kfvb6FE4eu6dhtnms7EDC2qt7Ercwb8VFSwlfem1g6dICDZ4tf3qp0ovbcAYTEtZKDM0fcyLpGMVAyVDazuT971veBzjgFZVB1iq9xPay28e5wo0dwIqq5ala9ooYHg66P_4N7oA7q7PSRGeDTNKxz0VDOMJ0pIQ',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAqD8JJda_a8Q2jAp-bptGiC8cic1BDQJhZAfwJdEj9ATv_kTXCyk5AZkEZS5JNZJc1AokEa6uEc0iWCkLSrE47kfvb6FE4eu6dhtnms7EDC2qt7Ercwb8VFSwlfem1g6dICDZ4tf3qp0ovbcAYTEtZKDM0fcyLpGMVAyVDazuT971veBzjgFZVB1iq9xPay28e5wo0dwIqq5ala9ooYHg66P_4N7oA7q7PSRGeDTNKxz0VDOMJ0pIQ'
    ],
    location: 'Perimeter Road, Ikeja Central',
    verifiedLandlord: 'Engr. Sterling Okafor',
    depositEscrow: true,
    inspectionFeeNotice: '₦5,000 agency pairing fee paid directly on WhatsApp before physical inspection'
  }
]

export const CATEGORIES = [
  { id: 'All', label: 'All Stays' },
  { id: 'flatshare', label: 'Flatshares' },
  { id: 'co_living', label: 'Co-Living' },
  { id: 'serviced', label: 'Serviced Studios' },
  { id: 'hostel', label: 'Hostels / Self-Contain' }
]

export const CAMPUS_HUBS = [
  {
    area_id: 101,
    title: 'GRA Ikeja Quarters',
    sub: 'Quiet, secure residential gated estates for professionals & scholars',
    badge: 'High Security'
  },
  {
    area_id: 102,
    title: 'Ikeja Commercial & Medical Axis',
    sub: '3-7 mins walk to clinics, corporate offices, and transit hubs',
    badge: 'Central Ikeja'
  },
  {
    area_id: 103,
    title: 'Academic & Tech Innovation Corridor',
    sub: '4-6 mins walk to digital libraries, lecture pods, and co-working spots',
    badge: 'Student & Tech Hub'
  },
  {
    area_id: 104,
    title: 'Main Transit Hub & Commercial Belt',
    sub: 'Affordable flatshares and studios with direct Lagos transit lines',
    badge: 'Budget Friendly'
  }
]
