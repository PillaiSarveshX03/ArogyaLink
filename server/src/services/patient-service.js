import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../db/data');

export class PatientService {
  constructor() {
    // In-memory fallbacks if database is offline
    this.memoryCourses = new Map();
    this.memoryProfiles = new Map();
    this.memoryCaregivers = new Map();
    this.memoryUsers = new Map();

    // Ensure data directory exists for persistent local backup
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      this.loadDataFromDisk();
    } catch (err) {
      console.warn('Could not initialize local data directory:', err.message);
    }

    // Demo Caregiver for Rahul
    if (!this.memoryCaregivers.has('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')) {
      this.memoryCaregivers.set('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', [
        {
          id: 'cg-demo-1',
          patient_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          name: 'Priya Sharma',
          relation: 'Daughter / Primary Caregiver',
          phone: '+91 98765 43211',
          email: 'priya.sharma@example.com',
          consentGranted: true,
          grantedAt: '2026-09-20 10:30 AM',
          notifyOnMissedDose: true,
          notifyAfterMinutes: 45,
          notifyOnLowStock: true,
        }
      ]);
    }
  }

  loadDataFromDisk() {
    try {
      const profilesFile = path.join(DATA_DIR, 'patients.json');
      if (fs.existsSync(profilesFile)) {
        const raw = fs.readFileSync(profilesFile, 'utf8');
        const parsed = JSON.parse(raw);
        for (const [id, prof] of Object.entries(parsed)) {
          this.memoryProfiles.set(id, prof);
        }
      }

      const usersFile = path.join(DATA_DIR, 'users.json');
      if (fs.existsSync(usersFile)) {
        const raw = fs.readFileSync(usersFile, 'utf8');
        const parsed = JSON.parse(raw);
        for (const [email, usr] of Object.entries(parsed)) {
          this.memoryUsers.set(email.toLowerCase(), usr);
        }
      }
    } catch (err) {
      console.warn('Could not load data from disk:', err.message);
    }
  }

  saveProfilesToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const obj = {};
      for (const [id, prof] of this.memoryProfiles.entries()) {
        obj[id] = prof;
      }
      fs.writeFileSync(path.join(DATA_DIR, 'patients.json'), JSON.stringify(obj, null, 2), 'utf8');
    } catch (err) {
      console.warn('Could not save patients to file:', err.message);
    }
  }

  saveUserAccount(user) {
    if (!user || !user.email) return;
    this.memoryUsers.set(user.email.toLowerCase(), user);
    this.memoryProfiles.set(user.id, {
      ...this.memoryProfiles.get(user.id),
      ...user
    });
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const obj = {};
      for (const [em, u] of this.memoryUsers.entries()) {
        obj[em] = u;
      }
      fs.writeFileSync(path.join(DATA_DIR, 'users.json'), JSON.stringify(obj, null, 2), 'utf8');
    } catch (err) {
      console.warn('Could not save users to file:', err.message);
    }
    this.saveProfilesToFile();
  }

  findUserByEmail(email) {
    if (!email) return null;
    return this.memoryUsers.get(email.toLowerCase()) || null;
  }

  async getPatientProfile(patientId) {
    let localProfile = this.memoryProfiles.get(patientId);

    if (supabase && patientId && !patientId.startsWith('user-')) {
      try {
        const { data: pData } = await supabase.from('patients').select('*').eq('id', patientId).single();
        let uData = null;
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(patientId);
          uData = userData?.user;
        } catch {}

        const meta = uData?.user_metadata || {};

        const merged = {
          id: patientId,
          first_name: pData?.first_name || meta.first_name || localProfile?.first_name || '',
          last_name: pData?.last_name || meta.last_name || localProfile?.last_name || '',
          name: meta.name || meta.full_name || `${pData?.first_name || ''} ${pData?.last_name || ''}`.trim() || localProfile?.name || 'Patient',
          email: pData?.email || uData?.email || localProfile?.email || '',
          phone: pData?.phone || meta.phone || localProfile?.phone || '',
          dateOfBirth: pData?.date_of_birth || meta.dateOfBirth || localProfile?.dateOfBirth || '',
          conditions: pData?.conditions || meta.conditions || localProfile?.conditions || [],
          medicalHistory: meta.medicalHistory || pData?.medical_history || localProfile?.medicalHistory || [],
          abhaId: meta.abhaId || pData?.abha_id || localProfile?.abhaId || '',
          abhaAddress: meta.abhaAddress || pData?.abha_address || localProfile?.abhaAddress || '',
          doctorName: meta.doctorName || pData?.doctor_name || localProfile?.doctorName || meta.doctor?.name || '',
          doctorId: meta.doctorId || pData?.doctor_id || localProfile?.doctorId || meta.doctor?.registrationId || '',
          doctorHospital: meta.doctorHospital || pData?.doctor_hospital || localProfile?.doctorHospital || meta.doctor?.hospitalAddress || '',
          doctorEmail: meta.doctorEmail || pData?.doctor_email || localProfile?.doctorEmail || meta.doctor?.email || '',
          doctorPhone: meta.doctorPhone || pData?.doctor_phone || localProfile?.doctorPhone || meta.doctor?.phone || '',
          doctor: meta.doctor || localProfile?.doctor || (meta.doctorName ? {
            name: meta.doctorName,
            registrationId: meta.doctorId,
            hospitalAddress: meta.doctorHospital,
            email: meta.doctorEmail,
            phone: meta.doctorPhone
          } : undefined),
          avatarUrl: meta.avatarUrl || meta.avatar_url || localProfile?.avatarUrl || '',
          onboardingCompleted: meta.onboardingCompleted ?? localProfile?.onboardingCompleted ?? false,
          adherenceRate: localProfile?.adherenceRate || 92
        };

        this.memoryProfiles.set(patientId, merged);
        this.saveProfilesToFile();
        return merged;
      } catch (err) {
        console.warn('[getPatientProfile] Supabase retrieval warning:', err.message);
      }
    }

    if (localProfile) {
      return localProfile;
    }

    if (patientId === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' || patientId === 'demo-rahul') {
      return {
        id: patientId,
        first_name: 'Rahul',
        last_name: 'Sharma',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        dateOfBirth: '1984-06-15',
        conditions: ['Type 2 Diabetes', 'Essential Hypertension'],
        medicalHistory: [
          'Type 2 Diabetes Mellitus (Diagnosed 2021)',
          'Essential Hypertension (Diagnosed 2019)'
        ],
        abhaId: '91-4452-9812-4301',
        abhaAddress: 'rahul.sharma@abdm',
        doctorName: 'Dr. Alok Verma',
        doctorId: 'DMC-24981',
        doctorHospital: 'Apollo Health City, New Delhi',
        doctorEmail: 'dr.verma@apollohospitals.example',
        doctorPhone: '+91 98110 55432',
        onboardingCompleted: true,
        adherenceRate: 92,
      };
    }

    return {
      id: patientId,
      first_name: 'Patient',
      last_name: '',
      name: 'Patient',
      email: '',
      phone: '',
      dateOfBirth: '',
      conditions: [],
      medicalHistory: [],
      abhaId: '',
      abhaAddress: '',
      doctorName: '',
      doctorId: '',
      doctorHospital: '',
      doctorEmail: '',
      doctorPhone: '',
      avatarUrl: '',
      onboardingCompleted: false,
    };
  }

  async updatePatientProfile(patientId, profileData) {
    const existing = await this.getPatientProfile(patientId);
    const updated = {
      ...existing,
      ...profileData,
      id: patientId,
      updated_at: new Date().toISOString()
    };

    if (profileData.name) {
      const parts = profileData.name.trim().split(' ');
      updated.first_name = parts[0] || '';
      updated.last_name = parts.slice(1).join(' ') || '';
    }

    this.memoryProfiles.set(patientId, updated);
    this.saveProfilesToFile();

    // If patient email is known, update user cache too
    if (updated.email) {
      const cachedUser = this.memoryUsers.get(updated.email.toLowerCase());
      if (cachedUser) {
        this.memoryUsers.set(updated.email.toLowerCase(), {
          ...cachedUser,
          ...updated
        });
      }
    }

    if (supabase && patientId && !patientId.startsWith('user-')) {
      try {
        // 1. Update patients table with supported columns only
        await supabase.from('patients').upsert({
          id: patientId,
          first_name: updated.first_name,
          last_name: updated.last_name,
          email: updated.email,
          phone: updated.phone || null,
          date_of_birth: updated.dateOfBirth || null,
          conditions: updated.conditions || [],
          updated_at: new Date().toISOString()
        });

        // 2. Persist extended profile to auth.users raw_user_meta_data in Supabase Database
        let existingMeta = {};
        try {
          const { data: uData } = await supabase.auth.admin.getUserById(patientId);
          existingMeta = uData?.user?.user_metadata || {};
        } catch {}

        await supabase.auth.admin.updateUserById(patientId, {
          user_metadata: {
            ...existingMeta,
            full_name: updated.name,
            name: updated.name,
            first_name: updated.first_name,
            last_name: updated.last_name,
            phone: updated.phone,
            dateOfBirth: updated.dateOfBirth,
            bloodGroup: updated.bloodGroup,
            abhaId: updated.abhaId,
            abhaAddress: updated.abhaAddress,
            medicalHistory: updated.medicalHistory,
            doctorName: updated.doctorName,
            doctorId: updated.doctorId,
            doctorHospital: updated.doctorHospital,
            doctorEmail: updated.doctorEmail,
            doctorPhone: updated.doctorPhone,
            doctor: updated.doctor,
            avatarUrl: updated.avatarUrl,
            avatar_url: updated.avatarUrl,
            onboardingCompleted: updated.onboardingCompleted ?? true,
          }
        });
      } catch (err) {
        console.warn('⚠️ [PatientService] Supabase profile upsert warning:', err.message);
      }
    }

    return updated;
  }

  async uploadAvatar(patientId, fileBuffer, mimeType = 'image/png', originalName = 'avatar.png') {
    let avatarUrl = '';
    const ext = originalName.split('.').pop() || 'png';
    const fileName = `${patientId}-${Date.now()}.${ext}`;

    if (supabase) {
      try {
        const { data, error } = await supabase.storage.from('avatars').upload(fileName, fileBuffer, {
          contentType: mimeType,
          upsert: true
        });

        if (!error && data) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
          avatarUrl = urlData.publicUrl;
        } else {
          console.warn('⚠️ [uploadAvatar] Supabase storage error:', error?.message);
        }
      } catch (err) {
        console.warn('⚠️ [uploadAvatar] Supabase storage exception:', err.message);
      }
    }

    // Fallback: If storage upload failed or not configured, use base64 data URL
    if (!avatarUrl) {
      avatarUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    }

    // Persist to user profile and database
    await this.updatePatientProfile(patientId, { avatarUrl });

    return {
      success: true,
      avatarUrl,
      fileName
    };
  }

  async getCourses(patientId) {
    if (supabase && patientId && !patientId.startsWith('user-')) {
      const { data, error } = await supabase
        .from('medication_courses')
        .select('*')
        .eq('patient_id', patientId);
      if (!error && data && data.length > 0) return data;
    }

    // Check memory courses
    if (this.memoryCourses.has(patientId)) {
      return this.memoryCourses.get(patientId);
    }

    if (patientId === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' || patientId === 'demo-rahul') {
      return [
        {
          id: '33333333-3333-3333-3333-333333333333',
          patient_id: patientId,
          medicine_name: 'Metformin 500mg',
          dosage: '500mg',
          frequency: 'Twice daily',
          times_of_day: ['08:00 AM', '08:00 PM'],
          meal_relation: 'after_meal',
          start_date: '2026-09-26',
          end_date: '2026-12-25',
          status: 'active'
        },
        {
          id: '44444444-4444-4444-4444-444444444444',
          patient_id: patientId,
          medicine_name: 'Amlodipine 5mg',
          dosage: '5mg',
          frequency: 'Once daily',
          times_of_day: ['08:00 AM'],
          meal_relation: 'after_meal',
          start_date: '2026-09-26',
          end_date: '2026-12-25',
          status: 'active'
        }
      ];
    }

    return [];
  }

  /**
   * Add a new medication course for a patient
   */
  async createCourse(patientId, courseData) {
    const newCourse = {
      patient_id: patientId,
      medicine_name: courseData.medicineName || courseData.medicine_name,
      dosage: courseData.dosage,
      frequency: courseData.frequency,
      times_of_day: courseData.timesOfDay || courseData.times_of_day || ['08:00 AM'],
      meal_relation: courseData.mealRelation || courseData.meal_relation || 'after_meal',
      start_date: courseData.startDate || courseData.start_date || new Date().toISOString().split('T')[0],
      end_date: courseData.endDate || courseData.end_date || null,
      prescribed_by: courseData.prescribedBy || courseData.prescribed_by || null,
      status: courseData.status || 'active',
      notes: courseData.notes || null,
    };

    if (supabase && patientId && !patientId.startsWith('user-')) {
      try {
        const { data, error } = await supabase
          .from('medication_courses')
          .insert(newCourse)
          .select();
        if (!error && data && data.length > 0) {
          return data[0];
        }
        if (error) {
          console.warn('⚠️ [PatientService] Supabase insert course error:', error.message);
        }
      } catch (err) {
        console.warn('⚠️ [PatientService] Could not persist course to Supabase:', err.message);
      }
    }

    // Fallback in-memory
    const memoryRecord = {
      id: `course-${Date.now()}`,
      ...newCourse,
      created_at: new Date().toISOString(),
    };
    const existing = this.memoryCourses.get(patientId) || [];
    this.memoryCourses.set(patientId, [...existing, memoryRecord]);
    return memoryRecord;
  }

  /**
   * Remove/delete a medication course
   */
  async deleteCourse(patientId, courseId) {
    if (supabase && !courseId.startsWith('course-')) {
      try {
        await supabase
          .from('medication_courses')
          .delete()
          .eq('id', courseId);
      } catch (err) {
        console.warn('⚠️ [PatientService] Could not delete course from Supabase:', err.message);
      }
    }

    if (this.memoryCourses.has(patientId)) {
      const remaining = this.memoryCourses.get(patientId).filter(c => c.id !== courseId);
      this.memoryCourses.set(patientId, remaining);
    }

    return { success: true, courseId };
  }

  /**
   * Retrieve all active medication courses across all patients for the reminder scheduler
   */
  async getAllActiveCourses() {
    const activeCourses = [];

    // 1. Fetch from Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('medication_courses')
          .select('*, patients(id, first_name, last_name, email, phone)')
          .eq('status', 'active');

        if (!error && data) {
          for (const item of data) {
            activeCourses.push({
              id: item.id,
              patient_id: item.patient_id,
              medicine_name: item.medicine_name,
              dosage: item.dosage,
              frequency: item.frequency,
              times_of_day: item.times_of_day,
              meal_relation: item.meal_relation,
              start_date: item.start_date,
              end_date: item.end_date,
              prescribed_by: item.prescribed_by,
              status: item.status,
              notes: item.notes,
              patient: item.patients || null,
            });
          }
        }
      } catch (err) {
        console.warn('⚠️ [PatientService] Supabase getAllActiveCourses error:', err.message);
      }
    }

    // 2. Include in-memory active courses
    for (const [patientId, courses] of this.memoryCourses.entries()) {
      const patientProfile = await this.getPatientProfile(patientId);
      for (const c of courses) {
        if (c.status === 'active' && !activeCourses.some(ac => ac.id === c.id)) {
          activeCourses.push({
            ...c,
            patient: patientProfile,
          });
        }
      }
    }

    return activeCourses;
  }

  async logDoseAction(doseId, action) {
    const timestamp = new Date().toISOString();
    if (supabase) {
      await supabase.from('dose_schedules').update({
        status: action,
        taken_at: action === 'taken' ? timestamp : null,
        missed_at: action === 'missed' ? timestamp : null
      }).eq('id', doseId);
    }
    return {
      success: true,
      doseId,
      status: action,
      timestamp
    };
  }

  // Caregiver Management Methods
  async getCaregivers(patientId) {
    if (supabase && patientId && !patientId.startsWith('user-')) {
      try {
        const { data, error } = await supabase
          .from('caregiver_consents')
          .select('*')
          .eq('patient_id', patientId);

        if (!error && data) {
          return data.map(cg => ({
            id: cg.id,
            patientId: cg.patient_id,
            name: cg.caregiver_name,
            relation: cg.relationship,
            phone: cg.phone,
            email: cg.email,
            consentGranted: cg.consent_granted,
            grantedAt: cg.consent_granted_at,
            notifyOnMissedDose: cg.notify_on_missed_dose,
            notifyAfterMinutes: cg.notify_after_minutes || 45,
            notifyOnLowStock: cg.notify_on_low_stock,
          }));
        }
      } catch (err) {
        console.warn('⚠️ [PatientService] Supabase getCaregivers error:', err.message);
      }
    }

    if (this.memoryCaregivers.has(patientId)) {
      return this.memoryCaregivers.get(patientId);
    }

    return [];
  }

  async addCaregiver(patientId, caregiverData) {
    const newCaregiver = {
      id: caregiverData.id || `cg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patientId,
      name: caregiverData.name,
      relation: caregiverData.relation,
      phone: caregiverData.phone,
      email: caregiverData.email,
      consentGranted: caregiverData.consentGranted || false,
      grantedAt: caregiverData.consentGranted ? new Date().toISOString() : null,
      notifyOnMissedDose: caregiverData.notifyOnMissedDose ?? true,
      notifyAfterMinutes: caregiverData.notifyAfterMinutes || 45,
      notifyOnLowStock: caregiverData.notifyOnLowStock ?? true,
    };

    if (supabase && patientId && !patientId.startsWith('user-')) {
      try {
        await supabase.from('caregiver_consents').insert({
          id: newCaregiver.id.includes('-') && newCaregiver.id.length > 30 ? newCaregiver.id : undefined,
          patient_id: patientId,
          caregiver_name: newCaregiver.name,
          relationship: newCaregiver.relation,
          phone: newCaregiver.phone,
          email: newCaregiver.email,
          consent_granted: newCaregiver.consentGranted,
          consent_granted_at: newCaregiver.grantedAt,
          notify_on_missed_dose: newCaregiver.notifyOnMissedDose,
          notify_after_minutes: newCaregiver.notifyAfterMinutes,
          notify_on_low_stock: newCaregiver.notifyOnLowStock,
        });
      } catch (err) {
        console.warn('⚠️ [PatientService] Supabase addCaregiver warning:', err.message);
      }
    }

    const current = this.memoryCaregivers.get(patientId) || [];
    this.memoryCaregivers.set(patientId, [...current, newCaregiver]);
    return newCaregiver;
  }

  async updateCaregiver(patientId, caregiverId, updates) {
    let current = this.memoryCaregivers.get(patientId) || [];
    let updatedCaregiver = null;

    current = current.map(cg => {
      if (cg.id === caregiverId) {
        updatedCaregiver = {
          ...cg,
          ...updates,
          grantedAt: updates.consentGranted ? (cg.grantedAt || new Date().toISOString()) : (updates.consentGranted === false ? null : cg.grantedAt)
        };
        return updatedCaregiver;
      }
      return cg;
    });

    this.memoryCaregivers.set(patientId, current);

    if (supabase && patientId && !patientId.startsWith('user-')) {
      try {
        const payload = {};
        if (updates.name) payload.caregiver_name = updates.name;
        if (updates.relation) payload.relationship = updates.relation;
        if (updates.phone) payload.phone = updates.phone;
        if (updates.email) payload.email = updates.email;
        if (updates.consentGranted !== undefined) {
          payload.consent_granted = updates.consentGranted;
          payload.consent_granted_at = updates.consentGranted ? new Date().toISOString() : null;
        }
        if (updates.notifyOnMissedDose !== undefined) payload.notify_on_missed_dose = updates.notifyOnMissedDose;
        if (updates.notifyAfterMinutes !== undefined) payload.notify_after_minutes = updates.notifyAfterMinutes;
        if (updates.notifyOnLowStock !== undefined) payload.notify_on_low_stock = updates.notifyOnLowStock;

        await supabase.from('caregiver_consents').update(payload).eq('id', caregiverId);
      } catch (err) {
        console.warn('⚠️ [PatientService] Supabase updateCaregiver warning:', err.message);
      }
    }

    return updatedCaregiver || { id: caregiverId, ...updates };
  }

  async deleteCaregiver(patientId, caregiverId) {
    const current = this.memoryCaregivers.get(patientId) || [];
    this.memoryCaregivers.set(patientId, current.filter(cg => cg.id !== caregiverId));

    if (supabase && patientId && !patientId.startsWith('user-')) {
      try {
        await supabase.from('caregiver_consents').delete().eq('id', caregiverId);
      } catch (err) {
        console.warn('⚠️ [PatientService] Supabase deleteCaregiver warning:', err.message);
      }
    }

    return { success: true, caregiverId };
  }

  // Simulated ABHA Demonstration Gateway
  async simulateAbhaFetch(abhaId, abhaAddress) {
    return {
      success: true,
      verifiedStatus: 'ABDM_VERIFIED_SANDBOX',
      gatewayTransactionId: `ABDM-TX-${Date.now()}`,
      abhaId: abhaId || '91-4452-9812-4301',
      abhaAddress: abhaAddress || 'rahul.sharma@abdm',
      patientName: 'Rahul Sharma',
      dateOfBirth: '1984-06-15',
      gender: 'Male',
      bloodGroup: 'B+',
      medicalHistory: [
        'Type 2 Diabetes Mellitus (ICD-10 E11, Diagnosed 2021)',
        'Essential Hypertension (ICD-10 I10, Diagnosed 2019)',
        'Severe Penicillin Drug Allergy (Documented 2018)',
        'Appendectomy (Surgical History, 2015)'
      ],
      primaryDoctor: {
        name: 'Dr. Alok Verma',
        registrationId: 'DMC-24981',
        hospitalAddress: 'Apollo Health City, Sarita Vihar, New Delhi',
        email: 'dr.verma@apollohospitals.example',
        phone: '+91 98110 55432'
      }
    };
  }
}

export const patientService = new PatientService();
export default patientService;
