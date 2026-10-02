# ArogyaLink Implementation Plan (v1.1.0 Phase-1)

## 📌 Overview
This document tracks the architectural specification and implementation steps for **ArogyaLink v1.1.0 Phase-1**. It serves as the single source of truth for features, bug fixes, data schemas, API contracts, and task progress.

---

## 🚦 Phase-1 Task Checklist

- [x] **0. Version Bump & Environment Sync**
  - [x] Bump root `package.json` and `package-lock.json` to `1.1.0`
  - [x] Bump `client/package.json` to `1.1.0`
  - [x] Bump `server/package.json` to `1.1.0`
  - [x] Update `server/src/app.js` root info to `1.1.0`

- [x] **1. Authentication & Onboarding Flow**
  - [x] **Login UI Polish**: Refactor `client/src/app/auth/page.tsx` with dedicated focus on Patient experience and clean validation.
  - [x] **Clean Default State**: Eradicate hardcoded mock fallbacks (`'Dr. Alok Verma'`, `'1984-06-15'`, `'+91 98765 43210'`) in `UserProfileModal.tsx` and `store.tsx`. Ensure newly created accounts start with zero courses, zero doses, and empty profiles.
  - [x] **Dedicated First-Time Onboarding Page**: Create `client/src/app/onboarding/page.tsx` for new patients.
  - [x] **Abandonment Rule Enforcement**: Update `client/src/components/auth/AuthGuard.tsx` to force redirection to `/onboarding` if `user.role === 'patient'` and `!user.onboardingCompleted`.
  - [x] **Mandatory Field Validation**: Block onboarding completion until Full Name and Date of Birth are provided.

- [x] **2. Patient Identity & Profile Data**
  - [x] **ABHA Formats & Validation**:
    - [x] ABHA Record ID: 14-digit numeric identifier formatted as `XX-XXXX-XXXX-XXXX` with live input formatting and regex `^\d{2}-\d{4}-\d{4}-\d{4}$`.
    - [x] ABHA Address: string identifier formatted as `username@abdm` with regex `^[a-zA-Z0-9._]+@abdm$`.
  - [x] **Medical History Collection**:
    - [x] Option A: *"Fetch automatically from ABHA"* (simulated ABDM gateway demo modal retrieving mock health records).
    - [x] Option B: Manual input for conditions, allergies, and surgical history chips.
  - [x] **Core Patient Profile Fields**: Capture and store Full Name (Required), Date of Birth (Required), Blood Group, Phone, and Medical History.

- [x] **3. Emergency Contact & Family Doctor Details**
  - [x] **Dynamic Doctor Profile Management**:
    - [x] Doctor Name (Required)
    - [x] Doctor ID / Registration Number (Optional, e.g. MCI / State Council ID)
    - [x] Hospital / Clinic Address (Required)
    - [x] Email ID (Required for emergency alerts)
    - [x] Phone Number (Required with country code, e.g., `+91 98765 43210`)
  - [x] Dynamic persistence across PostgreSQL / Supabase, server API, and client state.

- [x] **4. Multi-Caregiver Support & Escalation System (Foundation for Phase 2)**
  - [x] **Multi-Caregiver Registration**: Allow patients to add, edit, and remove one or more caregivers.
  - [x] **Caregiver Fields**: Name, Relationship, Phone (+91), Email, Consent Status, Notification Triggers (Missed-dose delay, Low-stock).
  - [x] **UI Refactor**: Rebuild `client/src/app/caregivers/page.tsx` and `UserProfileModal.tsx` Caregivers Tab with full CRUD modals (Add, Edit, Delete, Toggle Consent).
  - [x] **Backend Endpoints**: Caregiver CRUD API routes in `server/src/routes/patients.js`.

---

## 🗂️ 1. Repository Mapping & Affected Files

| Component | File Path | Action | Description |
| :--- | :--- | :--- | :--- |
| **Root** | `package.json` | Edit | Version bump to `1.1.0` |
| **Root** | `package-lock.json` | Edit | Version bump to `1.1.0` |
| **Client** | `client/package.json` | Edit | Version bump to `1.1.0` |
| **Client** | `client/src/lib/types.ts` | Edit | Add ABHA fields, DoctorProfile, Onboarding status, multi-caregiver types |
| **Client** | `client/src/lib/store.tsx` | Edit | Remove hardcoded mock fallbacks, add Caregiver CRUD actions, onboarding action |
| **Client** | `client/src/components/auth/AuthGuard.tsx` | Edit | Enforce Abandonment Rule (redirect un-onboarded patients to `/onboarding`) |
| **Client** | `client/src/app/auth/page.tsx` | Edit | Patient-focused Login UI fixes, redirect new users to `/onboarding` |
| **Client** | `client/src/app/onboarding/page.tsx` | **Create** | Dedicated First-Time Onboarding multi-step wizard |
| **Client** | `client/src/components/profile/UserProfileModal.tsx` | Edit | Clean empty states, ABHA fields, Doctor details, Multi-caregiver CRUD |
| **Client** | `client/src/app/caregivers/page.tsx` | Edit | Complete Multi-Caregiver CRUD management UI |
| **Client** | `client/src/lib/api.ts` | Edit | Client API functions for profile update, onboarding, caregivers, and ABHA demo fetch |
| **Server** | `server/package.json` | Edit | Version bump to `1.1.0` |
| **Server** | `server/src/app.js` | Edit | Version bump in root endpoint |
| **Server** | `server/src/db/schema.sql` | Edit | Schema definitions for new patient profile columns and caregiver relations |
| **Server** | `server/src/db/migrations/v1.1.0_profile_and_caregivers.sql` | **Create** | Standalone SQL migration script |
| **Server** | `server/src/routes/patients.js` | Edit | Add profile PATCH, ABHA simulation endpoint, and Caregiver CRUD routes |
| **Server** | `server/src/services/patient-service.js` | Edit | Implement storage handlers for profile and caregivers (Supabase + memory fallback) |

---

## 💾 2. Data Schema & State Management Changes

### A. Database Schema Migration (`PostgreSQL / Supabase`)
```sql
-- Migration: v1.1.0 Patient Identity, ABHA, Doctor & Caregivers
ALTER TABLE patients 
  ADD COLUMN IF NOT EXISTS abha_id VARCHAR(19),
  ADD COLUMN IF NOT EXISTS abha_address VARCHAR(100),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS medical_history TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS doctor_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS doctor_hospital TEXT,
  ADD COLUMN IF NOT EXISTS doctor_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS doctor_phone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Ensure caregiver_consents table has proper indices and columns
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

CREATE INDEX IF NOT EXISTS idx_caregiver_patient ON caregiver_consents(patient_id);
```

### B. TypeScript State Definitions (`client/src/lib/types.ts`)
```typescript
export interface DoctorProfile {
  name: string;             // Required
  registrationId?: string;  // Optional (e.g. State Medical Council ID)
  hospitalAddress: string;  // Required
  email: string;            // Required (for alerts)
  phone: string;            // Required (e.g. +91 98765 43210)
}

export interface UserProfile {
  id: string;
  name: string;             // Required
  email: string;
  role: 'patient' | 'caregiver';
  phone?: string;
  dateOfBirth?: string;     // Required (YYYY-MM-DD)
  onboardingCompleted: boolean;
  
  // ABHA Credentials
  abhaId?: string;          // Format: XX-XXXX-XXXX-XXXX (14 digits)
  abhaAddress?: string;     // Format: username@abdm
  
  // Medical History
  medicalHistory?: string[];
  conditions?: string[];
  allergies?: string[];
  bloodGroup?: string;

  // Family Doctor Details
  doctor?: DoctorProfile;
  doctorName?: string;
  doctorSpecialty?: string;
  doctorId?: string;
  doctorHospital?: string;
  doctorEmail?: string;
  doctorPhone?: string;

  emergencyContact?: string;
  adherenceRate?: number;
}

export interface CaregiverConsent {
  id: string;
  patientId?: string;
  name: string;             // Required
  relation: string;         // Required (Spouse, Child, Parent, Nurse, etc.)
  phone: string;            // Required with country code (+91)
  email: string;            // Required
  consentGranted: boolean;  // Sovereign consent flag
  grantedAt?: string;
  notifyOnMissedDose: boolean;
  notifyAfterMinutes: number;
  notifyOnLowStock: boolean;
  lastNotified?: string;
}
```

---

## 🧠 3. Detailed Logic & Feature Breakdown

### 1. Authentication & Onboarding Flow
- **Patient-Centric Login UI**: Clear patient sign-in vs caregiver options, responsive layout, intuitive error messages.
- **Dedicated First-Time Onboarding (`/onboarding`)**:
  - Step 1: Patient Identity (Full Name [Required], DOB [Required], Phone, Blood Group).
  - Step 2: ABHA Integration & Medical History (ABHA ID, ABHA Address, Fetch from ABHA demo button or Manual Entry tags).
  - Step 3: Family Doctor & Emergency (Doctor Name [Req], Doctor Reg ID [Opt], Hospital Address [Req], Email & Phone [Req]).
  - Step 4: Caregiver Registration (Option to add 1 or more initial caregivers).
- **Abandonment Rule**: `AuthGuard.tsx` forces redirection to `/onboarding` if the user is a `patient` and `!user.onboardingCompleted`. Navigation to other pages is blocked until mandatory fields (Full Name, Date of Birth) are saved.
- **Clean Default State**: Remove all fallback mock defaults (`'Dr. Alok Verma'`, `'1984-06-15'`, `'+91 98765 43210'`). New accounts start with empty states unless they log in using the demo account (`rahul.sharma@example.com`).

### 2. Patient Identity & Profile Data
- **ABHA Validation**:
  - ABHA ID: Input mask `XX-XXXX-XXXX-XXXX` with 14-digit regex validation `^\d{2}-\d{4}-\d{4}-\d{4}$`.
  - ABHA Address: Format validation `^[a-zA-Z0-9._]+@abdm$`.
- **ABHA Simulated Fetch**:
  - Interactive demonstration modal simulating ABDM gateway authorization and fetching realistic health history (e.g. chronic conditions, prior hospital records, verified allergies).
- **Manual Input**:
  - Add/remove tags for past conditions and allergies.

### 3. Emergency Contact & Family Doctor Details
- Dynamic fields in user profile:
  - Doctor Name (Required)
  - Registration ID (Optional)
  - Hospital / Clinic Address (Required)
  - Email (Required for alert dispatches)
  - Phone Number (Required with +91 country code formatting)
- Synchronized across backend and client state.

### 4. Multi-Caregiver Support (Phase 1)
- Full CRUD operations:
  - **Add Caregiver**: Collect Name, Relation, Phone (+91), Email.
  - **Edit Caregiver**: Modify existing caregiver details.
  - **Delete Caregiver**: Confirmation dialog before removal.
  - **Sovereign Consent Toggle**: Instant toggle with timestamp tracking.
  - **Alert Preferences**: Configurable missed-dose delay (default 45 mins) and refill warnings.
- Backend synchronization via REST endpoints.

---

## ⚠️ 4. Edge Cases & Assumptions
1. **Offline & Fallback Support**: Full compatibility with both Supabase cloud DB and in-memory/localStorage fallback mode.
2. **Demo Account Isolation**: Rahul Sharma (`rahul.sharma@example.com`) retains demo seed data so existing showcases remain intact, while all new user signups start 100% clean.
3. **Phone Number Country Code Format**: Enforced `+91` (or international E.164 standard).
4. **Draft Persistence**: If a patient accidentally refreshes during onboarding, draft entries are preserved in session storage so they don't lose progress.
