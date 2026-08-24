-- ==============================================================================
-- RAKSHA CORE & CAP DATABASE SCHEMA (PostgreSQL / Supabase)
-- Version: raksha/0.1
-- ==============================================================================

-- 1. Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY,
    protocol_version VARCHAR(32) NOT NULL DEFAULT 'raksha/0.1',
    type VARCHAR(64) NOT NULL DEFAULT 'FINANCIAL_CYBER_FRAUD',
    state VARCHAR(64) NOT NULL DEFAULT 'INTAKE',
    narrative_text TEXT NOT NULL,
    narrative_source VARCHAR(32) NOT NULL DEFAULT 'web',
    reporter_mobile VARCHAR(32),
    reporter_name VARCHAR(128),
    reporter_language VARCHAR(16) DEFAULT 'en',
    reporter_state VARCHAR(64),
    reporter_district VARCHAR(64),
    transaction_amount NUMERIC(15, 2),
    transaction_currency VARCHAR(8) DEFAULT 'INR',
    transaction_id VARCHAR(128), -- 12-digit UTR / RRN
    transaction_timestamp TIMESTAMPTZ,
    debit_institution VARCHAR(128),
    beneficiary_identifier VARCHAR(128),
    beneficiary_institution VARCHAR(128),
    transaction_channel VARCHAR(32),
    validation_status VARCHAR(32) DEFAULT 'PENDING',
    validation_missing_fields JSONB DEFAULT '[]'::jsonb,
    validation_conflicts JSONB DEFAULT '[]'::jsonb,
    validation_next_question TEXT,
    handoff_target VARCHAR(64) DEFAULT 'portal-a',
    handoff_status VARCHAR(32) DEFAULT 'NOT_STARTED',
    handoff_external_reference VARCHAR(128),
    handoff_submitted_at TIMESTAMPTZ,
    handoff_acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Evidence Records
CREATE TABLE IF NOT EXISTS evidence (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    uri TEXT NOT NULL,
    sha256 VARCHAR(64) NOT NULL,
    mime_type VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CAP Cases Table
CREATE TABLE IF NOT EXISTS cap_cases (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
    external_reference VARCHAR(128),
    target_service VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CAP & Incident Events Table
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    case_id VARCHAR(64) NOT NULL,
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE SET NULL,
    source VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CAP Actions Audit & Registry Table
CREATE TABLE IF NOT EXISTS cap_actions (
    id VARCHAR(64) PRIMARY KEY,
    action_name VARCHAR(64) NOT NULL,
    case_id VARCHAR(64),
    incident_id VARCHAR(64),
    status VARCHAR(32) NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE,
    request_payload JSONB,
    response_payload JSONB,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rapid lookup during emergency retrieval
CREATE INDEX IF NOT EXISTS idx_incidents_state ON incidents(state);
CREATE INDEX IF NOT EXISTS idx_incidents_transaction_id ON incidents(transaction_id);
CREATE INDEX IF NOT EXISTS idx_evidence_incident_id ON evidence(incident_id);
CREATE INDEX IF NOT EXISTS idx_cap_cases_incident_id ON cap_cases(incident_id);
CREATE INDEX IF NOT EXISTS idx_events_case_id ON events(case_id);
CREATE INDEX IF NOT EXISTS idx_events_incident_id ON events(incident_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
