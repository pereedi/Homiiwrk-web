# Homiiwrk (Homiework) — Product & Domain Guidelines

Always adhere to these core product rules when writing copy, designing UI, building backend logic, or configuring the Lydia AI chatbot:

## 1. Target Audience
- **Students & Young Professionals**: Homiiwrk is built broadly for students and young professionals seeking housing or flatshares—**not** exclusively for LASUCOM scholars. Avoid locking features, copy, or personas strictly to a single university or medical school unless scoped as one of many locations.

## 2. Core Marketplace Features (Two-Sided Platform)
- **Apartment Listing**: Both individuals (e.g., current tenants looking for a flatmate/sublet) and real estate agents can list apartments on the platform.
- **Renting & Sharing**: Users can browse and rent full apartments, join flatshares, book co-living spaces, or find hostels.

## 3. Dedicated Accommodation Detail Page (No Modals)
- Clicking an accommodation card (`PropertyCard`) or a Lydia listing card must navigate the user to a **full dedicated Property Detail Page** (`#property/<id>`), **not** open a popup modal.

## 4. Connection, Pairing & Agency Fee Workflow
- **Agency Fee (₦5,000)**: The agency/pairing fee is **₦5,000**. It is paid **directly on WhatsApp** to the lister/agent after chatting with them to confirm inspection details.
- **Annual Rent via Payment Gateway**: The full annual rent or flatshare rent is paid securely through the **Homiiwrk Payment Gateway** (Card / Paystack / Bank Transfer Escrow) on the dedicated property page.
- Do **not** describe the platform as having "zero agency/inspection fees".

## 5. Location Handling & Coverage
- When a user inputs an unlisted location (e.g. *Ikorodu*, *Epe*, *Badagry*, etc.), immediately return that **no houses/accommodations are currently listed in that location** without wasting time or keeping the request pending, and offer our active registered hubs (Ikeja GRA, Hospital Axis, Campus Corridor, Main Gate, Allen/Opebi).

## 6. Lydia AI Chatbot Role
- Lydia is the AI housing concierge that guides users to find suitable apartments and flatshares based on:
  1. **Location** (preferred neighborhood, campus hub, or work corridor)
  2. **Budget** (parsed in Naira / Kobo)
  3. **Apartment Type** (flatshare, self-contain, studio/one-bed, serviced apartment, hostel, etc.)
- Once a user selects a property or match via Lydia, guide them to the property detail page where they connect with the lister on WhatsApp to pay the ₦5,000 fee and schedule physical inspection.
