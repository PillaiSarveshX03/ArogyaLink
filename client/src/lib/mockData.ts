import { MedicationCourse, DoseEvent, AdherenceMetrics, HealthInsight, CaregiverConsent, ActivityLog, Medicine } from './types';

export const initialMedicines: Medicine[] = [
  {
    id: 'med-1',
    name: 'Metformin Hydrochloride',
    genericName: 'Metformin',
    dosage: '500mg',
    form: 'tablet',
    frequency: 'Twice daily',
    mealRelation: 'after_meal',
    instructions: 'Take immediately after breakfast and dinner to minimize GI discomfort.',
    category: 'Antidiabetic',
    sideEffects: ['Mild nausea', 'Diarrhea', 'Stomach upset in initial days'],
    warnings: ['Avoid excess alcohol consumption', 'Notify doctor before radiological scans with contrast']
  },
  {
    id: 'med-2',
    name: 'Amlodipine Besylate',
    genericName: 'Amlodipine',
    dosage: '5mg',
    form: 'tablet',
    frequency: 'Once daily',
    mealRelation: 'after_meal',
    instructions: 'Take in the morning with a glass of water. Can be taken with or without food.',
    category: 'Antihypertensive / Calcium Channel Blocker',
    sideEffects: ['Peripheral ankle swelling', 'Flushing', 'Dizziness when standing quickly'],
    warnings: ['Do not stop abruptly without consulting your cardiologist']
  },
  {
    id: 'med-3',
    name: 'Atorvastatin Calcium',
    genericName: 'Atorvastatin',
    dosage: '10mg',
    form: 'tablet',
    frequency: 'Once daily at bedtime',
    mealRelation: 'after_meal',
    instructions: 'Take at night after dinner for optimal lipid synthesis regulation.',
    category: 'Statin / Lipid Lowering',
    sideEffects: ['Occasional muscle aches', 'Headache'],
    warnings: ['Avoid grapefruit or grapefruit juice in large quantities']
  },
  {
    id: 'med-4',
    name: 'Cilnidipine 10mg',
    genericName: 'Cilnidipine',
    dosage: '10 mg',
    form: 'tablet',
    frequency: 'Once daily',
    mealRelation: 'with_meal',
    instructions: 'Take in the evening with meal.',
    category: 'Antihypertensive / Dual L/N-type Calcium Channel Blocker',
    sideEffects: ['Headache', 'Dizziness', 'Flushing', 'Mild peripheral ankle swelling'],
    warnings: ['Avoid grapefruit or grapefruit juice', 'Do not alter dose without doctor consultation']
  }
];

export const initialCourses: MedicationCourse[] = [
  {
    id: 'course-1',
    patientId: 'patient-rahul',
    medicineId: 'med-1',
    medicineName: 'Metformin 500mg',
    dosage: '500mg',
    frequency: 'Twice daily',
    doseQuantity: 1,
    timesOfDay: ['08:00 AM', '08:00 PM'],
    mealRelation: 'after_meal',
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    prescribedBy: 'Dr. Alok Verma (Endocrinology)',
    status: 'active',
    notes: 'Prescribed for Type 2 Diabetes Glycemic Control'
  },
  {
    id: 'course-2',
    patientId: 'patient-rahul',
    medicineId: 'med-2',
    medicineName: 'Amlodipine 5mg',
    dosage: '5mg',
    frequency: 'Once daily',
    doseQuantity: 1,
    timesOfDay: ['08:00 AM'],
    mealRelation: 'after_meal',
    startDate: '2026-09-10',
    endDate: '2026-12-10',
    prescribedBy: 'Dr. Sunita Rao (Cardiology)',
    status: 'active',
    notes: 'Prescribed for Stage 1 Essential Hypertension'
  },
  {
    id: 'course-3',
    patientId: 'patient-rahul',
    medicineId: 'med-4',
    medicineName: 'Cilnidipine',
    dosage: '10 mg',
    frequency: 'Once daily',
    doseQuantity: 1,
    timesOfDay: ['08:00 PM'],
    mealRelation: 'with_meal',
    startDate: '2026-09-26',
    endDate: '2026-10-26',
    prescribedBy: 'Dr. Sunita Rao (Cardiology)',
    status: 'active',
    notes: 'Prescribed for Essential Hypertension'
  }
];

export const initialDoseEvents: DoseEvent[] = [
  {
    id: 'dose-1',
    courseId: 'course-1',
    medicineName: 'Metformin 500mg',
    dosage: '500mg',
    scheduledTime: '08:00 AM',
    scheduledDate: '2026-09-26',
    mealRelation: 'After breakfast',
    status: 'taken',
    takenAt: '08:14 AM'
  },
  {
    id: 'dose-2',
    courseId: 'course-2',
    medicineName: 'Amlodipine 5mg',
    dosage: '5mg',
    scheduledTime: '08:00 AM',
    scheduledDate: '2026-09-26',
    mealRelation: 'After breakfast',
    status: 'taken',
    takenAt: '08:15 AM'
  },
  {
    id: 'dose-3',
    courseId: 'course-1',
    medicineName: 'Metformin 500mg',
    dosage: '500mg',
    scheduledTime: '08:00 PM',
    scheduledDate: '2026-09-26',
    mealRelation: 'After dinner',
    status: 'pending',
    isNext: true
  }
];

export const initialMetrics: AdherenceMetrics = {
  adherencePercentage: 92,
  lastWeekDelta: 2,
  dosesTakenToday: 2,
  dosesTotalToday: 3,
  activeMedicationsCount: 2,
  streakDays: 6,
  weeklyTrend: [
    { day: 'Mon', date: '09-20', rate: 85 },
    { day: 'Tue', date: '09-21', rate: 88 },
    { day: 'Wed', date: '09-22', rate: 90 },
    { day: 'Thu', date: '09-23', rate: 92 },
    { day: 'Fri', date: '09-24', rate: 90 },
    { day: 'Sat', date: '09-25', rate: 95 },
    { day: 'Sun', date: '09-26', rate: 92 }
  ]
};

export const initialInsights: HealthInsight[] = [
  {
    id: 'insight-1',
    type: 'interaction',
    severity: 'moderate',
    title: 'Possible Mild Interaction Detected',
    description: 'Metformin + Amlodipine: Amlodipine may mildly influence blood glucose control when adjusting dosages.',
    medicinesInvolved: ['Metformin 500mg', 'Amlodipine 5mg'],
    recommendation: 'Monitor fasting blood sugar regularly during initial dose titration. No immediate schedule changes required without doctor consent.',
    aiGenerated: true,
    disclaimer: 'AI is an assistant, not a clinical prescriber. Never alter prescribed dosages or stop therapy without consulting your doctor or pharmacist.'
  },
  {
    id: 'insight-2',
    type: 'dietary',
    severity: 'low',
    title: 'Meal Consideration Note',
    description: 'Always take Metformin immediately after food to reduce common gastrointestinal side effects like nausea or cramping.',
    medicinesInvolved: ['Metformin 500mg'],
    recommendation: 'Pair the 8:00 PM dose with a balanced evening meal.',
    aiGenerated: true,
    disclaimer: 'For educational assistance only. Follow your physician\'s exact prescription orders.'
  }
];

export const initialCaregivers: CaregiverConsent[] = [
  {
    id: 'caregiver-1',
    name: 'Priya Sharma',
    relation: 'Daughter / Primary Caregiver',
    phone: '+91 98765 43210',
    email: 'priya.sharma@example.com',
    consentGranted: true,
    grantedAt: '2026-09-12 10:30 AM',
    notifyOnMissedDose: true,
    notifyAfterMinutes: 45,
    notifyOnLowStock: true,
    lastNotified: 'Yesterday, 8:45 PM (Dose Confirmation)'
  }
];

export const initialActivities: ActivityLog[] = [
  {
    id: 'act-1',
    timestamp: '2 hours ago',
    type: 'dose_taken',
    title: 'Morning Dose Confirmed',
    description: 'Metformin 500mg & Amlodipine 5mg logged as taken at 8:15 AM',
    status: 'success'
  },
  {
    id: 'act-2',
    timestamp: '5 hours ago',
    type: 'schedule_created',
    title: 'Reminder Dispatched',
    description: 'Morning medication notification sent to patient device',
    status: 'info'
  },
  {
    id: 'act-3',
    timestamp: 'Yesterday, 8:05 PM',
    type: 'dose_taken',
    title: 'Evening Dose Completed',
    description: 'Metformin 500mg logged on schedule after dinner',
    status: 'success'
  },
  {
    id: 'act-4',
    timestamp: '3 days ago',
    type: 'prescription_uploaded',
    title: 'Prescription OCR Verified',
    description: 'Prescription by Dr. Sunita Rao extracted and verified by patient',
    status: 'info'
  }
];
