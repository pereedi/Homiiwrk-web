-- =====================================================================
-- HOMIIWRK MARKETPLACE: Initial Seed Data for Supabase PostgreSQL
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- =====================================================================

-- 0. ENSURE EXTENDED COLUMNS EXIST (Safe if schema.sql was already run)
ALTER TABLE areas
  ADD COLUMN IF NOT EXISTS short_name VARCHAR(60) NULL,
  ADD COLUMN IF NOT EXISTS badge VARCHAR(60) NULL,
  ADD COLUMN IF NOT EXISTS desc_text TEXT NULL;

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) NULL DEFAULT 4.8,
  ADD COLUMN IF NOT EXISTS distance_mins SMALLINT NULL,
  ADD COLUMN IF NOT EXISTS distance_text VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS amenities TEXT[] NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS image_url TEXT NULL;

ALTER TABLE tenant_profiles
  ADD COLUMN IF NOT EXISTS occupation_or_study VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS institution VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS level VARCHAR(60) NULL,
  ADD COLUMN IF NOT EXISTS compatibility SMALLINT NULL DEFAULT 90,
  ADD COLUMN IF NOT EXISTS area_id INT NULL REFERENCES areas(id),
  ADD COLUMN IF NOT EXISTS area_name VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS budget_formatted VARCHAR(60) NULL,
  ADD COLUMN IF NOT EXISTS study_rhythm VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS quiet_hours VARCHAR(120) NULL,
  ADD COLUMN IF NOT EXISTS phone_masked VARCHAR(30) NULL,
  ADD COLUMN IF NOT EXISTS avatar TEXT NULL,
  ADD COLUMN IF NOT EXISTS bio TEXT NULL,
  ADD COLUMN IF NOT EXISTS badges TEXT[] NULL DEFAULT '{}';

-- 1. BASE SYSTEM USERS (Includes required password_hash)
INSERT INTO users (id, public_id, role, full_name, email, phone, whatsapp_number, password_hash, status, email_verified_at)
OVERRIDING SYSTEM VALUE
VALUES
  (1,  'a1000000-0000-0000-0000-000000000001', 'admin', 'System Administrator',  'admin@homiiwrk.ng',           '+2348000000001', '2348000000001', '$2b$10$HomiiwrkSeedPasswordHashPlaceholder000000000000000001', 'active', NOW()),
  (12, 'a1000000-0000-0000-0000-000000000012', 'agent', 'Apex Prime Properties', 'agent.apex@homiiwrk.ng',      '+2348020000012', '2348020000012', '$2b$10$HomiiwrkSeedPasswordHashPlaceholder000000000000000012', 'active', NOW()),
  (14, 'a1000000-0000-0000-0000-000000000014', 'agent', 'Medics Haven Enclave',  'agent.medics@homiiwrk.ng',    '+2348020000014', '2348020000014', '$2b$10$HomiiwrkSeedPasswordHashPlaceholder000000000000000014', 'active', NOW()),
  (15, 'a1000000-0000-0000-0000-000000000015', 'agent', 'Greenwood Living Ltd',  'agent.greenwood@homiiwrk.ng', '+2348020000015', '2348020000015', '$2b$10$HomiiwrkSeedPasswordHashPlaceholder000000000000000015', 'active', NOW()),
  (16, 'a1000000-0000-0000-0000-000000000016', 'agent', 'Jakande Real Estate',   'agent.jakande@homiiwrk.ng',   '+2348020000016', '2348020000016', '$2b$10$HomiiwrkSeedPasswordHashPlaceholder000000000000000016', 'active', NOW()),
  (17, 'a1000000-0000-0000-0000-000000000017', 'agent', 'Prestige Living Hubs',  'agent.prestige@homiiwrk.ng',  '+2348020000017', '2348020000017', '$2b$10$HomiiwrkSeedPasswordHashPlaceholder000000000000000017', 'active', NOW()),
  (18, 'a1000000-0000-0000-0000-000000000018', 'agent', 'Sterling Estates Ltd',  'agent.sterling@homiiwrk.ng',  '+2348020000018', '2348020000018', '$2b$10$HomiiwrkSeedPasswordHashPlaceholder000000000000000018', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. AGENT PROFILES (Matches schema.sql columns: user_id, agency_name, agent_type, verification_status, verified_at)
INSERT INTO agent_profiles (user_id, agency_name, agent_type, verification_status, verified_at)
VALUES
  (12, 'Apex Prime Properties', 'agent',             'verified', NOW()),
  (14, 'Medics Haven Enclave',  'property_operator', 'verified', NOW()),
  (15, 'Greenwood Living Ltd',  'agent',             'verified', NOW()),
  (16, 'Jakande Real Estate',   'agent',             'verified', NOW()),
  (17, 'Prestige Living Hubs',  'property_operator', 'verified', NOW()),
  (18, 'Sterling Estates Ltd',  'agent',             'verified', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- 3. CAMPUS & NEIGHBORHOOD AREAS
INSERT INTO areas (id, parent_id, type, name, short_name, slug, badge, desc_text, is_active)
OVERRIDING SYSTEM VALUE
VALUES
  (100, NULL, 'area', 'All Areas (Around LASUCOM)',      'All Areas',     'all',           'All 6 Hubs',        'All vetted student & young professional hubs around Ikeja.', TRUE),
  (101, NULL, 'area', 'GRA Ikeja Perimeter',             'GRA Ikeja',     'gra-ikeja',     '6-8 mins walk',     'Tranquil gated residential enclave with private security patrols and uninterrupted study zones.', TRUE),
  (102, NULL, 'area', 'Ikeja Teaching Hospital Axis',    'Hospital Axis', 'hospital-axis', '3-7 mins walk',     'Direct walking proximity to LASUTH clinical wards, pediatric clinics, and call duty quarters.', TRUE),
  (103, NULL, 'area', 'LASUCOM Campus & Auditorium Axis','Campus Axis',   'campus-axis',   '4-6 mins walk',     'Immediate access to lecture halls, Anatomy complex, and college digital library.', TRUE),
  (104, NULL, 'area', 'College Main Gate & Perimeter',   'Main Gate',     'main-gate',     '10-12 mins walk',   'Vibrant neighborhood with affordable flatshares, supermarkets, and commercial bus links.', TRUE),
  (105, NULL, 'area', 'Allen & Opebi Link',              'Allen & Opebi', 'allen-opebi',   '12-15 mins shuttle','Direct shuttle corridor with modern dining, banks, and shopping facilities.', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. VERIFIED ACCOMMODATION LISTINGS
INSERT INTO listings (
  id, public_id, agent_id, area_id, title, description, accommodation_type, unit_type,
  address_line, rent_kobo, rent_period, total_spaces, available_spaces, furnished, status,
  rating, distance_mins, distance_text, amenities, image_url
)
OVERRIDING SYSTEM VALUE
VALUES
  (
    1, 'd9e03d15-5d98-4c6e-82d2-8b4b7321a001', 12, 101,
    'Apex Scholars Haven',
    'Single En-suite room tailored for students & young professionals. Sound-insulated walls and 24/7 dedicated generator changeover during municipal load shedding.',
    'hostel', 'self_contain',
    'Off Oba Akinjobi Way, Ikeja GRA, Lagos',
    45000000, 'annual', 1, 1, TRUE, 'active', 4.9, 6, '6 mins walk to Anatomy Block',
    ARRAY['24/7 Generator', 'Treated Water', 'Reading Hall', '24h Security Guard', 'Fiber Internet'],
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBHrve7CQLF8KtRoAQRwAXV5gAr-BpFX2tbq_RKDir6ECZaNGlxQD21wgYQ6PN3OaRt1-jIedeHrfSzrcUAzqF2RDI6Xz1gq0NDlCwP_JlAtG5izlwjDuIg6iBbcMLMz720lDfD5NMA7nr-zolWxDUfgwjn4twmBof8DuEAsOFnfBmBGZ3oV0cLhE7NO-4H_k-XhaofgoxMjTofEKHFdwv7xkFB7DkjuXRPnhF-BVYePAG-FmW4jqmn'
  ),
  (
    2, 'd9e03d15-5d98-4c6e-82d2-8b4b7321a002', 14, 102,
    'Ikeja Medics Residency',
    'High-end co-living apartment curated for young professionals and final-year students. Digital smart lock entries, common laundry, and weekly housekeeping.',
    'co_living', 'one_bed',
    'Near Lagos State University Teaching Hospital, Ikeja',
    52000000, 'annual', 3, 1, TRUE, 'active', 5.0, 10, '10 mins walk to Ikeja Teaching Hospital',
    ARRAY['High-Speed WiFi', 'Biometric Access', 'Wash & Fold', 'Fully Equipped Kitchen', 'Air Conditioned'],
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDorwPD2BIIay2AZkQwUQIZT0WJFZbhvnmS2PrZ7kCYtQGRXsPZ2ByOSFL8YWAWXpBrszk6D8p1N4vyrYmR-ubzuk1vnfCg8kyc5cODPqgSJQWcO9XYjFKizM6SsI4W4GsFBCDaCeZeKfCFez095JDQlHLqQKqLkMQ2AoteozMg9YZaXLHmR_jU4acVd0xCRWiaHyKjX4uX4Tx7-SnKefmkwkxtu624zAQ0CQjT6zma5DK9sCR3lNW5'
  ),
  (
    3, 'd9e03d15-5d98-4c6e-82d2-8b4b7321a003', 15, 101,
    'Greenwood Student Suites',
    'Two-bedroom apartment shared with one verified peer. Situated in a tranquil and secure gated street inside the GRA boundary, offering maximum privacy.',
    'flatshare', 'two_bed',
    'GRA Ikeja Perimeter, Ikeja, Lagos',
    38000000, 'annual', 2, 1, TRUE, 'active', 4.8, 8, '8 mins walk to College Library',
    ARRAY['Ergonomic Study', 'Fitted Kitchen', 'CCTV Monitored', 'Vehicle Parking', 'Continuous Water'],
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCtVasEjMvbYBYsaIGSbh92jME8Hq-IDYbtkPlQcIrr9_b2TvJX2Wvf0SASTXLD6YeGCah7fUJo50axADQnMRLgwzKS2AOE5JHPVKfl2aDmyjvDfdf0A_gCG7rX6laIR1ue4px7mUIz4aODO-ndfnEs9Bsfyedjq8rP0s2dDoc7Wt6kdMXU_T5VGJHaXXXoH0DFFryNPVRfdRBMqg-IJRYjfkN2MkNfiH63eG7fPUwlHhy4-yc10WeG'
  ),
  (
    4, 'd9e03d15-5d98-4c6e-82d2-8b4b7321a004', 16, 104,
    'Alhaji Jakande Villa Flatshare',
    'Affordable, spacious shared apartment within walking proximity to the main gates. Large ventilated balcony, twin beds with individual lockers, clean borehole water supply.',
    'flatshare', 'two_bed',
    'Near College Main Gate, Ikeja',
    32000000, 'annual', 2, 1, FALSE, 'active', 4.7, 12, '12 mins to Main Gate',
    ARRAY['Clean Borehole', 'Gated Estate', 'Balcony View', 'Prepaid Meter'],
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBdu7g9jILV7o8ackEkoFYFOb4k7tGucjWIbtpTNVMYASIfOY6CwB4gObH3P5kioqnmgZf2iZCdRmPja9afhmiF6YuACTB1HFV7C-dV17CoQ_Pav61xUJwGU5XuJAZF-Zydyei6J6b3DQrt9QEOnnKhwol4AyI2VxH2qucRHxz_FWb2t1g4bpWhNO0rDVS6qvrl3A-CzgI86PBcMfsIjcjSGlQWppjtIKU16km-VGOqr-uYcSWPlyP_'
  ),
  (
    5, 'd9e03d15-5d98-4c6e-82d2-8b4b7321a005', 17, 103,
    'Prestige Co-living Hall',
    'Premium all-inclusive co-living with uninterrupted 24/7 inverter air conditioning, fiber WiFi, on-demand barista coffee corner, and private soundproofed work/study booths.',
    'serviced', 'self_contain',
    'Auditorium Way, Ikeja Axis',
    65000000, 'annual', 1, 1, TRUE, 'active', 4.9, 5, '5 mins to LASUCOM Auditorium',
    ARRAY['Inverter Air-Con', 'Daily Housekeeping', 'Coffee Bar', 'Zero Power Cuts', 'Unlimited Fiber'],
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCl44Q7d-KMWz1THu2TlNdrmyjUBztWVl7akLz5cQ2aE6FetXDpFf1_YDmEmj560Q7dCj9WLetrFM_py_FMXYtSa8kkPQBuXiKhIjJwUuPXTPRuD7TD0ZA2o1JjPcxLLXd0sjJ5i77vBnnA-OF9opYH6ycZAtpyGi2cAbtN2mwtAnk_MIdD8w_VRJ9C3fuHLm_rI3pKKbWomAyZyaO1efAdXUenMVs8u6u2DgNXOLURGhEEp5JGI3b4'
  ),
  (
    6, 'd9e03d15-5d98-4c6e-82d2-8b4b7321a006', 18, 104,
    'Sterling En-suite Hostel',
    'Modern self-contained units with private bathrooms and individual kitchenettes. Well-maintained perimeter fencing, industrial borehole water treatment plant, and night security guard.',
    'hostel', 'self_contain',
    'Campus Perimeter Road, Ikeja',
    41000000, 'annual', 1, 1, FALSE, 'active', 4.6, 7, '7 mins to Campus Gate',
    ARRAY['Backup Generator', 'Motorcycle Park', 'Personal Cooking Bay', 'Gated Access'],
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAqD8JJda_a8Q2jAp-bptGiC8cic1BDQJhZAfwJdEj9ATv_kTXCyk5AZkEZS5JNZJc1AokEa6uEc0iWCkLSrE47kfvb6FE4eu6dhtnms7EDC2qt7Ercwb8VFSwlfem1g6dICDZ4tf3qp0ovbcAYTEtZKDM0fcyLpGMVAyVDazuT971veBzjgFZVB1iq9xPay28e5wo0dwIqq5ala9ooYHg66P_4N7oA7q7PSRGeDTNKxz0VDOMJ0pIQ'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. VERIFIED PEER FLATMATE & TENANT PROFILES
INSERT INTO users (id, public_id, role, full_name, email, phone, whatsapp_number, password_hash, status, email_verified_at)
OVERRIDING SYSTEM VALUE
VALUES
  (21, 'b1000000-0000-0000-0000-000000000021', 'tenant', 'Dr. Chisom Okonkwo', 'chisom.okonkwo@homiiwrk.ng',   '+2348030000012', '2348030000012', '$2b$10$HomiiwrkSeedPasswordHashPlaceholder000000000000000021', 'active', NOW()),
  (22, 'b1000000-0000-0000-0000-000000000022', 'tenant', 'Babatunde Adeleke',  'babatunde.adeleke@homiiwrk.ng','+2348120000045', '2348120000045', '$2b$10$HomiiwrkSeedPasswordHashPlaceholder000000000000000022', 'active', NOW()),
  (23, 'b1000000-0000-0000-0000-000000000023', 'tenant', 'Zainab Danjuma',     'zainab.danjuma@homiiwrk.ng',   '+2349010000078', '2349010000078', '$2b$10$HomiiwrkSeedPasswordHashPlaceholder000000000000000023', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO tenant_profiles (
  user_id, user_type, occupation_or_study, institution, level, compatibility,
  area_id, area_name, budget_min_kobo, budget_max_kobo, budget_formatted,
  study_rhythm, quiet_hours, phone_masked, avatar, bio, badges
)
VALUES
  (
    21, 'young_professional', 'Medicine & Surgery (Clinicals)', 'LASUTH / LASUCOM', '500L / House Officer', 94,
    101, 'GRA Ikeja Perimeter', 40000000, 50000000, '₦400k - ₦500k',
    'Night Owl (Revision till 2:30 AM)', 'Strict 10:30 PM quiet time', '+234 803 ••• ••12',
    'https://images.unsplash.com/photo-1594824813583-09439c3a388a?w=150&h=150&fit=crop&crop=face',
    'Seeking a quiet, hygiene-conscious flatmate who respects nocturnal work/study hours.',
    ARRAY['Quiet Hours Vetted', 'Cleanliness A+', 'Non-Smoker']
  ),
  (
    22, 'student', 'BDS Dentistry', 'LASUCOM', '400L Clinicals', 89,
    102, 'Ikeja Teaching Hospital Axis', 35000000, 45000000, '₦350k - ₦450k',
    'Early Bird (4:30 AM morning study)', 'Moderate after 11 PM', '+234 812 ••• ••45',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    'Looking for a flatmate around Ikeja Hospital axis to split a 2-bedroom serviced apartment with reliable generator.',
    ARRAY['Early Riser', 'Generator Split', 'Study Pod']
  ),
  (
    23, 'student', 'Nursing Sciences', 'LASUCOM', '300L Clinicals', 86,
    103, 'LASUCOM Campus & Auditorium Axis', 30000000, 40000000, '₦300k - ₦400k',
    'Library Only', 'Shift duty flexible', '+234 901 ••• ••78',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    'On 8-hour shift rotations. Looking for a neat flatmate who values cleanliness and peace.',
    ARRAY['Shift Respect', 'Borehole Water', 'Tidy']
  )
ON CONFLICT (user_id) DO NOTHING;

-- Reset table identity sequences so subsequent manual or API inserts succeed cleanly
SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('areas', 'id'), coalesce(max(id), 1)) FROM areas;
SELECT setval(pg_get_serial_sequence('listings', 'id'), coalesce(max(id), 1)) FROM listings;
