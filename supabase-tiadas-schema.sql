-- ============================================================
-- CONNECT-DAET.ph — Subsystem 10: TIA-DAS
-- Tourism Impact Assessment and Data Analytics System
-- Complete Database Schema
--
-- Team 10: Lerum, Andrei S. & Perillo, Jerold C.
-- Municipal Tourism Office of Daet, Camarines Norte
--
-- Instructions:
--   1. Open your Supabase project → SQL Editor
--   2. Paste this entire script and click "Run"
--   3. All TIA-DAS tables, indexes, and RLS policies will be created
-- ============================================================

-- ─── Enable UUID extension ───────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: analytics_destinations
-- Master list of tourism destinations in Daet
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_destinations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_name TEXT NOT NULL UNIQUE,
  description     TEXT,
  barangay        TEXT,
  category        TEXT,          -- e.g. 'Beach', 'Heritage', 'Commercial'
  capacity        INTEGER,       -- Estimated max daily visitor capacity
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: analytics_tourism_statistics
-- Core table for tourist arrival records
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_tourism_statistics (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporting_date        DATE NOT NULL,
  destination           TEXT NOT NULL,
  local_tourist_count   INTEGER NOT NULL DEFAULT 0 CHECK (local_tourist_count >= 0),
  foreign_tourist_count INTEGER NOT NULL DEFAULT 0 CHECK (foreign_tourist_count >= 0),
  total_tourist_count   INTEGER NOT NULL DEFAULT 0,  -- set by app as local + foreign
  visitor_category      TEXT NOT NULL,       -- e.g. 'Domestic Tourist', 'Foreign Tourist'
  data_source           TEXT NOT NULL,       -- e.g. 'Manual Entry', 'BIR Records'
  remarks               TEXT,
  is_archived           BOOLEAN NOT NULL DEFAULT FALSE,
  created_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stats_reporting_date ON analytics_tourism_statistics(reporting_date DESC);
CREATE INDEX IF NOT EXISTS idx_stats_destination ON analytics_tourism_statistics(destination);
CREATE INDEX IF NOT EXISTS idx_stats_archived ON analytics_tourism_statistics(is_archived);
CREATE INDEX IF NOT EXISTS idx_stats_created_by ON analytics_tourism_statistics(created_by);

-- ============================================================
-- TABLE: analytics_economic_records
-- Tourism-related economic data and estimates
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_economic_records (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_date      DATE NOT NULL,
  category         TEXT NOT NULL,
  estimated_amount NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (estimated_amount >= 0),
  employment_count INTEGER DEFAULT 0 CHECK (employment_count >= 0),
  description      TEXT,
  data_source      TEXT NOT NULL,
  is_verified      BOOLEAN NOT NULL DEFAULT FALSE,   -- TRUE = verified record, FALSE = estimate
  is_archived      BOOLEAN NOT NULL DEFAULT FALSE,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_econ_record_date ON analytics_economic_records(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_econ_category ON analytics_economic_records(category);
CREATE INDEX IF NOT EXISTS idx_econ_archived ON analytics_economic_records(is_archived);

-- ============================================================
-- TABLE: analytics_sustainability_records
-- Environmental, economic, social, and governance indicators
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_sustainability_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_date     DATE NOT NULL,
  category        TEXT NOT NULL,          -- 'Environmental', 'Economic', 'Social', 'Governance'
  indicator_name  TEXT NOT NULL,          -- e.g. 'Visitor Concentration (%)'
  indicator_value NUMERIC(18, 4),         -- NULL allowed if only narrative note
  unit            TEXT,                   -- e.g. '%', 'kWh', 'm³'
  destination     TEXT,                   -- Optional: specific destination
  notes           TEXT,
  is_archived     BOOLEAN NOT NULL DEFAULT FALSE,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sustain_record_date ON analytics_sustainability_records(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_sustain_category ON analytics_sustainability_records(category);

-- ============================================================
-- TABLE: analytics_data_sources
-- Registry of data sources and integration status
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_data_sources (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_name         TEXT NOT NULL UNIQUE,
  source_description  TEXT,
  source_category     TEXT NOT NULL DEFAULT 'Manual Entry',
  integration_status  TEXT NOT NULL DEFAULT 'not_connected'
                        CHECK (integration_status IN ('connected','pending','not_connected','error')),
  last_sync_at        TIMESTAMPTZ,
  record_count        INTEGER DEFAULT 0,
  error_message       TEXT,
  created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: analytics_import_logs
-- History of data import operations
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_import_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_name   TEXT NOT NULL,
  source_id     UUID REFERENCES analytics_data_sources(id) ON DELETE SET NULL,
  imported_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  record_count  INTEGER DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','failed','partial')),
  notes         TEXT,
  imported_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_import_imported_at ON analytics_import_logs(imported_at DESC);

-- ============================================================
-- TABLE: analytics_insights
-- Saved analytics insights (rule-based and AI-generated)
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_insights (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  insight_type  TEXT NOT NULL DEFAULT 'rule_based'
                  CHECK (insight_type IN ('rule_based','ai_gemini','manual')),
  content       TEXT NOT NULL,          -- JSON string or plain text
  data_period   TEXT,                   -- e.g. '2025', '2025-Q1'
  generated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_generated_at ON analytics_insights(generated_at DESC);

-- ============================================================
-- TABLE: analytics_reports
-- History of generated reports
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_reports (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  report_type      TEXT NOT NULL,
  period_label     TEXT,
  period_type      TEXT DEFAULT 'monthly',
  status           TEXT NOT NULL DEFAULT 'generated'
                     CHECK (status IN ('generated','pending','failed')),
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_created_at ON analytics_reports(created_at DESC);

-- ============================================================
-- TABLE: analytics_admin_roles
-- Administrator accounts and their roles within TIA-DAS
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_admin_roles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  role             TEXT NOT NULL DEFAULT 'tourism_admin'
                     CHECK (role IN ('super_admin','tourism_admin','data_analyst','report_viewer')),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_roles_email ON analytics_admin_roles(email);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON analytics_admin_roles(role);

-- ============================================================
-- TABLE: analytics_admin_permissions
-- Fine-grained permissions per admin (optional override table)
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_admin_permissions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id     UUID NOT NULL REFERENCES analytics_admin_roles(id) ON DELETE CASCADE,
  permission   TEXT NOT NULL,
  granted      BOOLEAN NOT NULL DEFAULT TRUE,
  granted_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (admin_id, permission)
);

-- ============================================================
-- TABLE: analytics_audit_logs
-- Immutable record of all administrative actions
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email  TEXT,         -- Denormalized for readability; captured at time of action
  action       TEXT NOT NULL,
  table_name   TEXT,
  record_id    UUID,
  details      JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created_at ON analytics_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON analytics_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON analytics_audit_logs(admin_id);

-- ============================================================
-- FUNCTION: auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'analytics_destinations',
    'analytics_tourism_statistics',
    'analytics_economic_records',
    'analytics_sustainability_records',
    'analytics_data_sources',
    'analytics_admin_roles'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %s;
       CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      t, t, t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- FUNCTION: capture admin email in audit log
-- ============================================================
CREATE OR REPLACE FUNCTION capture_audit_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.admin_id IS NOT NULL AND NEW.admin_email IS NULL THEN
    SELECT email INTO NEW.admin_email
    FROM auth.users
    WHERE id = NEW.admin_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_audit_capture_email
  BEFORE INSERT ON analytics_audit_logs
  FOR EACH ROW EXECUTE FUNCTION capture_audit_email();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE analytics_destinations              ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_tourism_statistics        ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_economic_records          ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sustainability_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data_sources              ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_import_logs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_insights                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_admin_roles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_admin_permissions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_audit_logs                ENABLE ROW LEVEL SECURITY;

-- ─── Helper function to check if the caller is a TIA-DAS admin ───

CREATE OR REPLACE FUNCTION is_tiadas_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM analytics_admin_roles
    WHERE supabase_user_id = auth.uid()
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Policies: analytics_tourism_statistics ──────────────────

CREATE POLICY "tiadas_stats_select" ON analytics_tourism_statistics
  FOR SELECT TO authenticated
  USING (is_tiadas_admin());

CREATE POLICY "tiadas_stats_insert" ON analytics_tourism_statistics
  FOR INSERT TO authenticated
  WITH CHECK (is_tiadas_admin());

CREATE POLICY "tiadas_stats_update" ON analytics_tourism_statistics
  FOR UPDATE TO authenticated
  USING (is_tiadas_admin())
  WITH CHECK (is_tiadas_admin());

-- ─── Policies: analytics_economic_records ────────────────────

CREATE POLICY "tiadas_econ_select" ON analytics_economic_records
  FOR SELECT TO authenticated USING (is_tiadas_admin());

CREATE POLICY "tiadas_econ_insert" ON analytics_economic_records
  FOR INSERT TO authenticated WITH CHECK (is_tiadas_admin());

CREATE POLICY "tiadas_econ_update" ON analytics_economic_records
  FOR UPDATE TO authenticated USING (is_tiadas_admin()) WITH CHECK (is_tiadas_admin());

-- ─── Policies: analytics_sustainability_records ──────────────

CREATE POLICY "tiadas_sustain_select" ON analytics_sustainability_records
  FOR SELECT TO authenticated USING (is_tiadas_admin());

CREATE POLICY "tiadas_sustain_insert" ON analytics_sustainability_records
  FOR INSERT TO authenticated WITH CHECK (is_tiadas_admin());

CREATE POLICY "tiadas_sustain_update" ON analytics_sustainability_records
  FOR UPDATE TO authenticated USING (is_tiadas_admin()) WITH CHECK (is_tiadas_admin());

-- ─── Policies: analytics_data_sources ────────────────────────

CREATE POLICY "tiadas_sources_select" ON analytics_data_sources
  FOR SELECT TO authenticated USING (is_tiadas_admin());

CREATE POLICY "tiadas_sources_insert" ON analytics_data_sources
  FOR INSERT TO authenticated WITH CHECK (is_tiadas_admin());

CREATE POLICY "tiadas_sources_update" ON analytics_data_sources
  FOR UPDATE TO authenticated USING (is_tiadas_admin()) WITH CHECK (is_tiadas_admin());

-- ─── Policies: analytics_import_logs ─────────────────────────

CREATE POLICY "tiadas_import_select" ON analytics_import_logs
  FOR SELECT TO authenticated USING (is_tiadas_admin());

CREATE POLICY "tiadas_import_insert" ON analytics_import_logs
  FOR INSERT TO authenticated WITH CHECK (is_tiadas_admin());

-- ─── Policies: analytics_insights ────────────────────────────

CREATE POLICY "tiadas_insights_select" ON analytics_insights
  FOR SELECT TO authenticated USING (is_tiadas_admin());

CREATE POLICY "tiadas_insights_insert" ON analytics_insights
  FOR INSERT TO authenticated WITH CHECK (is_tiadas_admin());

-- ─── Policies: analytics_reports ─────────────────────────────

CREATE POLICY "tiadas_reports_select" ON analytics_reports
  FOR SELECT TO authenticated USING (is_tiadas_admin());

CREATE POLICY "tiadas_reports_insert" ON analytics_reports
  FOR INSERT TO authenticated WITH CHECK (is_tiadas_admin());

-- ─── Policies: analytics_admin_roles ─────────────────────────

-- Admins can see all admin records
CREATE POLICY "tiadas_admins_select" ON analytics_admin_roles
  FOR SELECT TO authenticated USING (is_tiadas_admin());

-- Only existing admins can create/update admin records
CREATE POLICY "tiadas_admins_insert" ON analytics_admin_roles
  FOR INSERT TO authenticated WITH CHECK (is_tiadas_admin());

CREATE POLICY "tiadas_admins_update" ON analytics_admin_roles
  FOR UPDATE TO authenticated USING (is_tiadas_admin()) WITH CHECK (is_tiadas_admin());

-- ─── Policies: analytics_audit_logs ──────────────────────────

-- Read-only for admins — no update/delete allowed
CREATE POLICY "tiadas_audit_select" ON analytics_audit_logs
  FOR SELECT TO authenticated USING (is_tiadas_admin());

CREATE POLICY "tiadas_audit_insert" ON analytics_audit_logs
  FOR INSERT TO authenticated WITH CHECK (is_tiadas_admin());

-- NO UPDATE or DELETE policy — audit logs are immutable

-- ─── Policies: analytics_admin_permissions ───────────────────

CREATE POLICY "tiadas_perms_select" ON analytics_admin_permissions
  FOR SELECT TO authenticated USING (is_tiadas_admin());

CREATE POLICY "tiadas_perms_insert" ON analytics_admin_permissions
  FOR INSERT TO authenticated WITH CHECK (is_tiadas_admin());

CREATE POLICY "tiadas_perms_update" ON analytics_admin_permissions
  FOR UPDATE TO authenticated USING (is_tiadas_admin()) WITH CHECK (is_tiadas_admin());

-- ─── Policies: analytics_destinations ────────────────────────

CREATE POLICY "tiadas_dest_select" ON analytics_destinations
  FOR SELECT TO authenticated USING (is_tiadas_admin());

CREATE POLICY "tiadas_dest_insert" ON analytics_destinations
  FOR INSERT TO authenticated WITH CHECK (is_tiadas_admin());

CREATE POLICY "tiadas_dest_update" ON analytics_destinations
  FOR UPDATE TO authenticated USING (is_tiadas_admin()) WITH CHECK (is_tiadas_admin());

-- ============================================================
-- SEED: Register the main admin user in analytics_admin_roles
-- Replace 'c89843cd-b551-4925-b777-6c5c5cd3cb65' with the
-- actual Supabase Auth UID of your admin account.
-- Also replace the email below.
-- ============================================================

INSERT INTO analytics_admin_roles (supabase_user_id, full_name, email, role, is_active)
VALUES (
  'c89843cd-b551-4925-b777-6c5c5cd3cb65',  -- Replace with actual admin UID from adminAccess.ts
  'System Administrator',
  'admin@connect-daet.ph',                  -- Replace with actual admin email
  'super_admin',
  TRUE
)
ON CONFLICT (supabase_user_id) DO NOTHING;

-- ============================================================
-- SEED: Default data sources (manual entry + LGU)
-- ============================================================

INSERT INTO analytics_data_sources (source_name, source_description, source_category, integration_status)
VALUES
  ('LGU Tourism Office', 'Manual records from the Municipal Tourism Office of Daet', 'Manual Entry', 'connected'),
  ('BIR Regional Office', 'Revenue and employment data from BIR records', 'Government Report', 'pending'),
  ('DOT Region V', 'Department of Tourism regional statistical reports', 'Government Report', 'pending'),
  ('Hotel & Accommodation Register', 'Monthly visitor register from accredited accommodations', 'Manual Entry', 'not_connected'),
  ('BHERT Survey', 'Barangay-level household economic and tourism survey', 'Survey Data', 'not_connected'),
  ('CSV Import', 'Uploaded CSV data files', 'CSV Import', 'connected')
ON CONFLICT (source_name) DO NOTHING;

-- ============================================================
-- SEED: Default destinations
-- ============================================================

INSERT INTO analytics_destinations (destination_name, category, barangay)
VALUES
  ('Bagasbas Beach', 'Beach / Recreation', 'Bagasbas'),
  ('Daet Town Proper', 'Commercial / Urban', 'Poblacion'),
  ('Rizal Monument Area', 'Heritage / Cultural', 'Poblacion'),
  ('Daet Public Market', 'Commercial', 'Poblacion'),
  ('Daet Surf Area', 'Sports / Recreation', 'Bagasbas'),
  ('Mercedes Fish Port', 'Agri-Tourism / Industrial', 'Mercedes'),
  ('Capalonga', 'Eco-Tourism', 'Capalonga'),
  ('Vinzons', 'Rural / Eco-Tourism', 'Vinzons'),
  ('Paracale', 'Mining / Beach Tourism', 'Paracale'),
  ('Jose Panganiban', 'Industrial / Beach', 'Jose Panganiban')
ON CONFLICT (destination_name) DO NOTHING;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
-- After running this script:
--   1. Verify tables in Table Editor
--   2. Confirm RLS policies in Authentication > Policies
--   3. Update the supabase_user_id seed above with your actual admin UID
--   4. Test by signing in with your admin account at /analytics
-- ============================================================
