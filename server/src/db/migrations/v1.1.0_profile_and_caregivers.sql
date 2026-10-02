-- ==========================================================
-- AROGYALINK v1.1.0 PHASE-1 MIGRATION:
-- PATIENT IDENTITY, ABHA, DOCTOR DETAILS & MULTI-CAREGIVER
-- ==========================================================

-- 1. Extend patients table
ALTER TABLE patients 
  ADD COLUMN IF NOT EXISTS abha_id VARCHAR(19),
  ADD COLUMN IF NOT EXISTS abha_address VARCHAR(100),
  ADD COLUMN IF NOT EXISTS medical_history TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS doctor_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS doctor_hospital TEXT,
  ADD COLUMN IF NOT EXISTS doctor_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS doctor_phone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 2. Ensure caregiver_consents table has proper schema
CREATE TABLE IF NOT EXISTS caregiver_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    caregiver_name VARCHAR(200) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,
    consent_granted BOOLEAN DEFAULT FALSE,
    consent_granted_at TIMESTAMP WITH TIME ZONE,
    notify_on_missed_dose BOOLEAN DEFAULT TRUE,
    notify_after_minutes INT DEFAULT 45,
    notify_on_low_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient lookup of caregivers by patient
CREATE INDEX IF NOT EXISTS idx_caregivers_patient_id ON caregiver_consents(patient_id);
