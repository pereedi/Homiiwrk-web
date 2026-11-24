-- =====================================================================
-- HOMIIWRK MARKETPLACE: PostgreSQL Schema for Supabase
-- Backend: Node + Express + OpenAI
-- Storage: Supabase Storage buckets ('listings', 'receipts', 'verification_docs')
-- Money: Integer KOBO (e.g., ₦5,000 = 500000 kobo, ₦450,000 = 45000000 kobo)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('tenant', 'agent', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE agent_type_enum AS ENUM ('agent', 'property_operator');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status_enum AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE tenant_user_type AS ENUM ('student', 'young_professional', 'middle_income', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE gender_enum AS ENUM ('male', 'female', 'prefer_not_to_say');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE accommodation_type_enum AS ENUM ('hostel', 'flatshare', 'co_living', 'serviced');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE unit_type_enum AS ENUM ('self_contain', 'mini_flat', 'one_bed', 'two_bed', 'three_bed', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE area_type_enum AS ENUM ('state', 'lga', 'area');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE rent_period_enum AS ENUM ('monthly', 'quarterly', 'biannual', 'annual');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE listing_status_enum AS ENUM ('draft', 'pending_review', 'active', 'rented', 'rejected', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE review_decision_enum AS ENUM ('approved', 'rejected', 'changes_requested');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE match_status_enum AS ENUM ('suggested', 'viewed', 'saved', 'dismissed', 'inspection_booked', 'converted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE inspection_status_enum AS ENUM ('requested', 'confirmed', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE tenancy_status_enum AS ENUM ('pending', 'active', 'ended', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_type_enum AS ENUM ('service_fee', 'rent', 'deposit', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_enum AS ENUM ('paystack', 'direct_agent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM ('pending', 'awaiting_confirmation', 'successful', 'failed', 'disputed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE notification_channel_enum AS ENUM ('in_app', 'whatsapp', 'email');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE message_role_enum AS ENUM ('user', 'assistant', 'system', 'tool');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE intro_status_enum AS ENUM ('requested', 'accepted', 'declined', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ---------------------------------------------------------------------
-- HELPER: trigger function for updated_at
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- 1. USERS & PROFILES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_id         UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  role              user_role NOT NULL,
  full_name         VARCHAR(150) NOT NULL,
  email             VARCHAR(190) NOT NULL UNIQUE,
  phone             VARCHAR(20) NULL,
  whatsapp_number   VARCHAR(20) NULL,
  password_hash     VARCHAR(255) NOT NULL,
  email_verified_at TIMESTAMPTZ NULL,
  status            user_status NOT NULL DEFAULT 'active',
  last_login_at     TIMESTAMPTZ NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS agent_profiles (
  user_id                  BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  agency_name              VARCHAR(150) NULL,
  agent_type               agent_type_enum NOT NULL DEFAULT 'agent',
  verification_status      verification_status_enum NOT NULL DEFAULT 'unverified',
  verification_doc_path    VARCHAR(500) NULL,
  verified_at              TIMESTAMPTZ NULL,
  verified_by              BIGINT NULL REFERENCES users(id),
  listing_quota            SMALLINT NOT NULL DEFAULT 1,
  paystack_subaccount_code VARCHAR(60) NULL,
  payout_bank_name         VARCHAR(100) NULL,
  payout_account_last4     CHAR(4) NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_profiles (
  user_id                  BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  user_type                tenant_user_type NULL,
  gender                   gender_enum NULL,
  preferred_accommodation  accommodation_type_enum NULL,
  occupation_or_study      VARCHAR(150) NULL,
  institution              VARCHAR(150) NULL,
  level                    VARCHAR(60) NULL,
  compatibility            SMALLINT NULL DEFAULT 90,
  area_id                  INT NULL,
  area_name                VARCHAR(120) NULL,
  budget_min_kobo          BIGINT NULL,
  budget_max_kobo          BIGINT NULL,
  budget_formatted         VARCHAR(60) NULL,
  study_rhythm             VARCHAR(120) NULL,
  quiet_hours              VARCHAR(120) NULL,
  phone_masked             VARCHAR(30) NULL,
  avatar                   TEXT NULL,
  bio                      TEXT NULL,
  badges                   TEXT[] NULL DEFAULT '{}',
  move_in_date             DATE NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 2. LOCATIONS (Areas & Neighborhoods)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS areas (
  id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id  INT NULL REFERENCES areas(id),
  type       area_type_enum NOT NULL,
  name       VARCHAR(120) NOT NULL,
  short_name VARCHAR(60) NULL,
  slug       VARCHAR(140) NOT NULL UNIQUE,
  badge      VARCHAR(60) NULL,
  desc_text  TEXT NULL,
  latitude   DECIMAL(9,6) NULL,
  longitude  DECIMAL(9,6) NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_areas_parent ON areas(parent_id);

CREATE TABLE IF NOT EXISTS tenant_preferred_areas (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  area_id INT NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, area_id)
);

-- ---------------------------------------------------------------------
-- 3. LISTINGS (Apartments)
-- In Postgres, "ONE LIVE LISTING PER AGENT" is enforced using a clean
-- PARTIAL UNIQUE INDEX. No stored generated columns needed!
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listings (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_id          UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  agent_id           BIGINT NOT NULL REFERENCES users(id),
  area_id            INT NOT NULL REFERENCES areas(id),
  title              VARCHAR(180) NOT NULL,
  description        TEXT NULL,
  accommodation_type accommodation_type_enum NOT NULL,
  unit_type          unit_type_enum NOT NULL,
  address_line       VARCHAR(255) NOT NULL,
  latitude           DECIMAL(9,6) NULL,
  longitude          DECIMAL(9,6) NULL,
  rent_kobo          BIGINT NOT NULL,
  rent_period        rent_period_enum NOT NULL DEFAULT 'annual',
  total_spaces       SMALLINT NOT NULL DEFAULT 1,
  available_spaces   SMALLINT NOT NULL DEFAULT 1,
  furnished          BOOLEAN NOT NULL DEFAULT FALSE,
  available_from     DATE NULL,
  status             listing_status_enum NOT NULL DEFAULT 'draft',
  rating             DECIMAL(3,2) NULL DEFAULT 4.8,
  distance_mins      SMALLINT NULL,
  distance_text      VARCHAR(120) NULL,
  amenities          TEXT[] NULL DEFAULT '{}',
  image_url          TEXT NULL,
  approved_at        TIMESTAMPTZ NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_spaces CHECK (available_spaces <= total_spaces)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_one_live_listing_per_agent 
  ON listings (agent_id) 
  WHERE status IN ('draft', 'pending_review', 'active');

CREATE INDEX IF NOT EXISTS idx_listings_search 
  ON listings (status, area_id, accommodation_type, rent_kobo);

CREATE TABLE IF NOT EXISTS amenities (
  id   SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  icon VARCHAR(60) NULL
);

CREATE TABLE IF NOT EXISTS listing_amenities (
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  amenity_id SMALLINT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, amenity_id)
);

CREATE TABLE IF NOT EXISTS listing_media (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  listing_id     BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  media_type     VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
  storage_bucket VARCHAR(60) NOT NULL DEFAULT 'listings',
  storage_path   VARCHAR(500) NOT NULL,
  sort_order     SMALLINT NOT NULL DEFAULT 0,
  is_cover       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_media_listing ON listing_media(listing_id, sort_order);

CREATE TABLE IF NOT EXISTS listing_reviews (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  listing_id  BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reviewer_id BIGINT NOT NULL REFERENCES users(id),
  decision    review_decision_enum NOT NULL,
  note        VARCHAR(500) NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 4. QUESTIONNAIRE & MATCHING
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questionnaires (
  id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  version    SMALLINT NOT NULL UNIQUE,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id               INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  questionnaire_id INT NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  dimension        VARCHAR(50) NOT NULL,
  prompt           VARCHAR(300) NOT NULL,
  listing_prompt   VARCHAR(300) NULL,
  weight           SMALLINT NOT NULL DEFAULT 1,
  allow_multiple   BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order       SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS question_options (
  id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  label       VARCHAR(150) NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tenant_responses (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  questionnaire_id INT NOT NULL REFERENCES questionnaires(id),
  is_current       BOOLEAN NOT NULL DEFAULT TRUE,
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tr_user ON tenant_responses(user_id, is_current);

CREATE TABLE IF NOT EXISTS tenant_answers (
  response_id BIGINT NOT NULL REFERENCES tenant_responses(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES questions(id),
  option_id   INT NOT NULL REFERENCES question_options(id),
  PRIMARY KEY (response_id, question_id, option_id)
);

CREATE TABLE IF NOT EXISTS listing_preferences (
  listing_id     BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  question_id    INT NOT NULL REFERENCES questions(id),
  option_id      INT NOT NULL REFERENCES question_options(id),
  is_dealbreaker BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (listing_id, question_id, option_id)
);

CREATE TABLE IF NOT EXISTS matches (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  score      DECIMAL(5,2) NOT NULL,
  status     match_status_enum NOT NULL DEFAULT 'suggested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tenant_id, listing_id)
);
CREATE INDEX IF NOT EXISTS idx_match_tenant_score ON matches(tenant_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_match_listing ON matches(listing_id);

-- ---------------------------------------------------------------------
-- 5. ROOMMATE (PEER-TO-PEER) MATCHING & INTRODUCTIONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roommate_matches (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_low_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_high_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score         DECIMAL(5,2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_ordered_pair CHECK (user_low_id < user_high_id),
  UNIQUE (user_low_id, user_high_id)
);

CREATE TABLE IF NOT EXISTS roommate_intros (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  match_id     BIGINT NOT NULL REFERENCES roommate_matches(id) ON DELETE CASCADE,
  requester_id BIGINT NOT NULL REFERENCES users(id),
  status       intro_status_enum NOT NULL DEFAULT 'requested',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMPTZ NULL
);

-- ---------------------------------------------------------------------
-- 6. LYDIA CONVERSATIONAL CONCIERGE TABLES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_id  UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  user_id    BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  state      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            message_role_enum NOT NULL,
  body            TEXT NOT NULL,
  payload         JSONB NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id, created_at);

-- ---------------------------------------------------------------------
-- 7. INSPECTIONS & TENANCIES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspections (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id    BIGINT NOT NULL REFERENCES users(id),
  listing_id   BIGINT NOT NULL REFERENCES listings(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status       inspection_status_enum NOT NULL DEFAULT 'requested',
  notes        VARCHAR(500) NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_insp_listing ON inspections(listing_id, scheduled_at);

CREATE TABLE IF NOT EXISTS tenancies (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id   BIGINT NOT NULL REFERENCES users(id),
  listing_id  BIGINT NOT NULL REFERENCES listings(id),
  agent_id    BIGINT NOT NULL REFERENCES users(id),
  rent_kobo   BIGINT NOT NULL,
  rent_period rent_period_enum NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NULL,
  status      tenancy_status_enum NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ten_tenant ON tenancies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ten_agent ON tenancies(agent_id);

-- ---------------------------------------------------------------------
-- 8. PAYMENTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id                     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_id              UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  payer_id               BIGINT NOT NULL REFERENCES users(id),
  payee_id               BIGINT NULL REFERENCES users(id),
  listing_id             BIGINT NULL REFERENCES listings(id),
  tenancy_id             BIGINT NULL REFERENCES tenancies(id),
  payment_type           payment_type_enum NOT NULL,
  method                 payment_method_enum NOT NULL,
  amount_kobo            BIGINT NOT NULL,
  currency               CHAR(3) NOT NULL DEFAULT 'NGN',
  period_start           DATE NULL,
  period_end             DATE NULL,
  status                 payment_status_enum NOT NULL DEFAULT 'pending',

  paystack_reference      VARCHAR(100) NULL UNIQUE,
  paystack_access_code    VARCHAR(100) NULL,
  paystack_transaction_id BIGINT NULL,
  paystack_channel        VARCHAR(30) NULL,
  gateway_response        VARCHAR(255) NULL,

  paid_on                DATE NULL,
  proof_bucket           VARCHAR(60) NULL,
  proof_path             VARCHAR(500) NULL,
  recorded_by            BIGINT NULL REFERENCES users(id),
  confirmed_by           BIGINT NULL REFERENCES users(id),
  confirmed_at           TIMESTAMPTZ NULL,

  paid_at                TIMESTAMPTZ NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pay_payer ON payments(payer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pay_payee ON payments(payee_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pay_tenancy ON payments(tenancy_id);

CREATE TABLE IF NOT EXISTS paystack_events (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type   VARCHAR(60) NOT NULL,
  reference    VARCHAR(100) NULL,
  event_key    VARCHAR(150) NOT NULL UNIQUE,
  payload      JSONB NOT NULL,
  processed_at TIMESTAMPTZ NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pe_reference ON paystack_events(reference);

-- ---------------------------------------------------------------------
-- 9. NOTIFICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel    notification_channel_enum NOT NULL,
  type       VARCHAR(50) NOT NULL,
  body       VARCHAR(500) NOT NULL,
  read_at    TIMESTAMPTZ NULL,
  sent_at    TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, read_at);
