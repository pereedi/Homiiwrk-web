# Homiiwrk Marketplace & Lydia AI Concierge

Fullstack off-campus housing & roommate matching network designed specifically for scholars and staff around **LASUCOM Medical Campus, Ikeja**.

---

## 📁 Project Architecture

The project is structured into clean, decoupled directories:

```
homiework-codes/
├── frontend/                     # React 18 + Vite Frontend Application
│   ├── public/                   # Fonts and static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── lydia/
│   │   │   │   ├── LydiaChat.jsx       # AI Concierge conversational interface
│   │   │   │   └── ProfilePanel.jsx    # Real-time search & context inspector
│   │   │   ├── MatchCard.jsx           # Peer match card with mutual WhatsApp handoff
│   │   │   ├── Hero.jsx                # Responsive hero with location filter
│   │   │   ├── FilterBar.jsx           # Sticky campus hub & budget filters
│   │   │   ├── ListingsSection.jsx     # Active properties grid
│   │   │   ├── RoommateBanner.jsx      # Lydia AI teaser & CTA
│   │   │   └── ...
│   │   ├── data/
│   │   │   ├── properties.js           # Verified student housing data & areas
│   │   │   └── peerProfiles.js         # LASUCOM student roommate candidates
│   │   ├── lib/
│   │   │   └── lydiaApi.js             # SSE streaming client & WhatsApp intro protocol
│   │   ├── pages/
│   │   │   └── MatchPage.jsx           # Redesigned 3-tab Match & Concierge workspace
│   │   ├── styles/
│   │   │   ├── lydia.css               # Luxury concierge & chat styling
│   │   │   └── ...
│   │   ├── App.jsx                     # Global routing & floating Lydia trigger
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                  # Port 3000 with /api proxy to backend (3001)
│
├── backend/                      # Node.js + Express + Supabase Postgres + OpenAI
│   ├── lydia/
│   │   ├── prompt.js                   # Formal senior concierge system prompt
│   │   ├── tools.js                    # OpenAI tool definitions & SQL executors
│   │   ├── llm.js                      # OpenAI streaming & tool-calling loop + fallback
│   │   └── budget.js                   # Natural language budget parser ("450k" -> kobo)
│   ├── routes/
│   │   ├── chat.js                     # POST /api/chat (SSE Stream), GET /api/chat/areas
│   │   └── matches.js                  # GET /api/roommates, POST /api/roommates/intro
│   ├── sql/
│   │   └── schema.sql                  # Complete PostgreSQL schema for Supabase
│   ├── db.js                           # Dual-mode DB adapter (PostgreSQL / In-memory seed)
│   ├── index.js                        # Express server entry point (Port 3001)
│   ├── .env                            # Local environment configuration
│   ├── .env.example                    # Template environment variables
│   └── package.json
│
├── package.json                  # Root monorepo workspace runner scripts
└── README.md
```

---

## 🚀 Quick Start

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Or install individually inside `cd frontend && npm install` and `cd backend && npm install`)*

### 2. Start Development Servers

- **Frontend only** (Port 3000):
  ```bash
  npm run dev
  # or
  npm run dev:frontend
  ```

- **Backend only** (Port 3001):
  ```bash
  npm run dev:backend
  ```

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Open your project dashboard at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor**.
3. Copy and run the entire script from [`backend/sql/schema.sql`](backend/sql/schema.sql).
4. Retrieve your Postgres connection URI from **Project Settings > Database > Connection String (URI)**.
5. In `backend/.env`, set:
   ```env
   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

> **Zero Blocker Note:** If `DATABASE_URL` is not set, `backend/db.js` automatically activates the built-in seed store with LASUCOM campus hubs, listings, and peer profiles so the entire app works immediately out of the box!

---

## 🤖 Lydia AI Concierge & OpenAI Setup

1. In `backend/.env`, set your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini
   ```
2. When configured, Lydia uses OpenAI function calling to query verified listings, brief campus areas, suggest tier upgrades, and find roommates.
3. If no key is provided, the backend falls back to an intelligent formal concierge engine without crashing.

---

## 🤝 WhatsApp Roommate Introduction Protocol

Homiiwrk strictly protects student privacy:
- Phone numbers and matric details are kept confidential.
- On the **Verified Peer Matches** tab or inside **Lydia Chat**, students can click **"Request Mutual Introduction"**.
- Once mutual consent is recorded via `POST /api/roommates/intro`, a secure prefilled WhatsApp button is unlocked (`https://wa.me/...?text=...`) for the students to continue their discussion.
