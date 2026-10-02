-- ==========================================================
-- MEDICATION MANAGEMENT & ADHERENCE SYSTEM (SUPABASE SCHEMA)
-- Run this script in the Supabase SQL Editor
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(30),
    date_of_birth DATE,
    conditions TEXT[],
    abha_id VARCHAR(19),
    abha_address VARCHAR(100),
    medical_history TEXT[] DEFAULT '{}',
    doctor_name VARCHAR(200),
    doctor_id VARCHAR(100),
    doctor_hospital TEXT,
    doctor_email VARCHAR(255),
    doctor_phone VARCHAR(30),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MEDICINES MASTER DATABASE
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    form VARCHAR(50) DEFAULT 'tablet',
    category VARCHAR(100),
    instructions TEXT,
    meal_relation VARCHAR(50) DEFAULT 'after_meal',
    side_effects TEXT[],
    warnings TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PRESCRIPTIONS (OCR & RAW STORAGE)
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    image_url TEXT,
    doctor_name VARCHAR(200),
    clinic_name VARCHAR(255),
    raw_ocr_text TEXT,
    extracted_json JSONB,
    verification_status VARCHAR(50) DEFAULT 'pending_review', -- pending_review, verified, rejected
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MEDICATION COURSES
CREATE TABLE IF NOT EXISTS medication_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicines(id) ON DELETE SET NULL,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    dose_quantity NUMERIC(4, 2) DEFAULT 1.0,
    times_of_day TEXT[] NOT NULL, -- e.g. ARRAY['08:00 AM', '08:00 PM']
    meal_relation VARCHAR(50) DEFAULT 'after_meal', -- before_meal, with_meal, after_meal
    start_date DATE NOT NULL,
    end_date DATE,
    prescribed_by VARCHAR(200),
    status VARCHAR(50) DEFAULT 'active', -- active, completed, paused
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. DOSE SCHEDULES & TRACKING (DETERMINISTIC)
CREATE TABLE IF NOT EXISTS dose_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES medication_courses(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    scheduled_time VARCHAR(20) NOT NULL, -- e.g. '08:00 AM'
    scheduled_date DATE NOT NULL,
    meal_relation VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending', -- pending, taken, missed, skipped
    taken_at TIMESTAMP WITH TIME ZONE,
    missed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CAREGIVER CONSENTS (SOVEREIGN PATIENT CONSENT)
CREATE TABLE IF NOT EXISTS caregiver_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    caregiver_name VARCHAR(200) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    consent_granted BOOLEAN DEFAULT FALSE,
    consent_granted_at TIMESTAMP WITH TIME ZONE,
    notify_on_missed_dose BOOLEAN DEFAULT TRUE,
    notify_after_minutes INT DEFAULT 45,
    notify_on_low_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. AUDIT & ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- dose_taken, dose_missed, prescription_uploaded, caregiver_alert, schedule_created
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'info', -- success, warning, info
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEED INITIAL CLINICAL DATA (FOR DEMO PATIENT RAHUL SHARMA)
INSERT INTO patients (id, first_name, last_name, email, conditions)
VALUES ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Rahul', 'Sharma', 'rahul.sharma@example.com', ARRAY['Type 2 Diabetes', 'Essential Hypertension'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO medicines (id, name, generic_name, dosage, form, category, instructions, meal_relation, side_effects, warnings)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Metformin Hydrochloride', 'Metformin', '500mg', 'tablet', 'Antidiabetic', 'Take immediately after food.', 'after_meal', ARRAY['Mild nausea', 'Diarrhea'], ARRAY['Avoid excess alcohol']),
('22222222-2222-2222-2222-222222222222', 'Amlodipine Besylate', 'Amlodipine', '5mg', 'tablet', 'Antihypertensive', 'Take in morning with water.', 'after_meal', ARRAY['Ankle swelling', 'Flushing'], ARRAY['Do not stop abruptly'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO medication_courses (id, patient_id, medicine_id, medicine_name, dosage, frequency, times_of_day, meal_relation, start_date, end_date, prescribed_by)
VALUES 
('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '11111111-1111-1111-1111-111111111111', 'Metformin 500mg', '500mg', 'Twice daily', ARRAY['08:00 AM', '08:00 PM'], 'after_meal', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', 'Dr. Alok Verma'),
('44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '22222222-2222-2222-2222-222222222222', 'Amlodipine 5mg', '5mg', 'Once daily', ARRAY['08:00 AM'], 'after_meal', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', 'Dr. Sunita Rao')
ON CONFLICT (id) DO NOTHING;
