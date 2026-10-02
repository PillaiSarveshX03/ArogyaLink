export type DoseStatus = 'pending' | 'taken' | 'missed' | 'skipped';

export interface DoctorProfile {
  name: string;             // Required
  registrationId?: string;  // Optional (e.g. State Medical Council ID)
  hospitalAddress: string;  // Required
  email: string;            // Required for emergency alerts
  phone: string;            // Required with country code (+91)
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'caregiver';
  phone?: string;
  dateOfBirth?: string;
  onboardingCompleted?: boolean;
  avatarUrl?: string;

  // ABHA National Health Authority Credentials
  abhaId?: string;          // 14-digit identifier: XX-XXXX-XXXX-XXXX
  abhaAddress?: string;     // String identifier: username@abdm

  // Family Doctor Details
  doctorName?: string;
  doctorId?: string;        // Registration number
  doctorSpecialty?: string;
  doctorHospital?: string;
  doctorEmail?: string;
  doctorPhone?: string;
  doctor?: DoctorProfile;

  emergencyContact?: string;
  bloodGroup?: string;
  conditions?: string[];
  allergies?: string[];
  medicalHistory?: string[];
  adherenceRate?: number;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'inhaler' | 'drops';
  frequency: string;
  instructions: string;
  mealRelation: 'before_meal' | 'with_meal' | 'after_meal' | 'empty_stomach' | 'anytime';
  category?: string;
  sideEffects?: string[];
  warnings?: string[];
}

export interface MedicationCourse {
  id: string;
  patientId: string;
  medicineId?: string;
  medicineName: string;
  dosage: string;
  frequency: string; // e.g. "Twice Daily", "Once Daily"
  doseQuantity: number;
  timesOfDay: string[]; // e.g. ["08:00 AM", "08:00 PM"]
  mealRelation: 'before_meal' | 'with_meal' | 'after_meal' | 'empty_stomach';
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  status: 'active' | 'completed' | 'paused';
  notes?: string;
}

export interface DoseEvent {
  id: string;
  courseId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string; // e.g. "08:00 AM"
  scheduledDate: string; // YYYY-MM-DD
  mealRelation: string;
  status: DoseStatus;
  takenAt?: string;
  missedAt?: string;
  isNext?: boolean;
}

export interface AdherenceMetrics {
  adherencePercentage: number;
  lastWeekDelta: number;
  dosesTakenToday: number;
  dosesTotalToday: number;
  activeMedicationsCount: number;
  streakDays: number;
  weeklyTrend: {
    day: string;
    date: string;
    rate: number;
  }[];
}

export interface HealthInsight {
  id: string;
  type: 'interaction' | 'advisory' | 'schedule_gap' | 'dietary';
  severity: 'low' | 'moderate' | 'high';
  title: string;
  description: string;
  medicinesInvolved: string[];
  recommendation: string;
  aiGenerated: boolean;
  disclaimer: string;
}

export interface StructuredMedicationAnalysis {
  id?: string;
  medicationName: string;
  genericName?: string;
  brandNames?: string[];
  title: string;

  // Section 5: What is it?
  whatIsIt: string;

  // Section 6: What is it used for?
  uses: string[];

  // Section 7: How does it work?
  howItWorks: string;

  // Section 8 & 4: Your Prescribed Dose (Deterministic from MedBuddy)
  prescribedDose: {
    dosage: string;
    frequency: string;
    scheduledTimes: string[];
    mealRelation: string;
    duration?: string;
    prescribedBy?: string | null;
    notes?: string | null;
  };

  // Section 9: Adult Dosing Information (General Reference)
  adultDosing: {
    usualRange: string;
    frequency: string;
    maximumDose: string;
    importantNotes: string[];
    disclaimer: string;
  };

  // Section 10: Children / Adolescents (Pediatric Information)
  pediatricInformation: {
    status: string;
    summary: string;
    notes: string[];
  };

  // Section 11: Blood-Pressure Goals
  bloodPressureGoals: {
    adultSummary: string;
    pediatricSummary: string;
    clinicalFactors: string[];
    note: string;
  };

  // Section 12 & 13: Precautions & Interactions
  precautionsAndInteractions: {
    medicationInteractions: string[];
    foodBeverageInteractions: string[];
    medicalConditions: string[];
    alcohol: string;
  };

  // Section 14: Common Side Effects
  commonSideEffects: string[];

  // Section 15: Serious Warning Signs
  whenToSeekMedicalAttention: string[];

  // Section 16: Google Search Link
  googleSearch: {
    query: string;
    url: string;
    label: string;
  };

  // Section 17: Reference Sources
  sources: string[];

  // Section 20 & 21: Clinical Safety Guardrail
  safetyDisclaimer: string;

  // Metadata
  sourceType?: 'verified_reference' | 'ai_synthesized';
  executionDurationMs?: number;
  aiMetadata?: any;
  timestamp?: string;

  // Backward compatibility fields
  description?: string;
  recommendation?: string;
  disclaimer?: string;
  severity?: 'low' | 'moderate' | 'high';
  aiGenerated?: boolean;
}

export interface CaregiverConsent {
  id: string;
  patientId?: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  consentGranted: boolean;
  grantedAt?: string;
  notifyOnMissedDose: boolean;
  notifyAfterMinutes: number;
  notifyOnLowStock: boolean;
  lastNotified?: string;
}

export interface OcrExtractionResult {
  rawText: string;
  confidence: number;
  extractedMedicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    mealRelation: 'before_meal' | 'with_meal' | 'after_meal';
    identifiedMatch?: Medicine;
  }[];
  doctorName?: string;
  hospitalOrClinic?: string;
  prescriptionDate?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'prescription_uploaded' | 'medication_confirmed' | 'dose_taken' | 'dose_missed' | 'caregiver_alert' | 'schedule_created';
  title: string;
  description: string;
  status?: 'success' | 'warning' | 'info';
}
