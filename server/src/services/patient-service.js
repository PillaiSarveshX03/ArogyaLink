import { supabase } from '../config/supabase.js';

export class PatientService {
  constructor() {
    // In-memory fallback for local demo courses if database is offline
    this.memoryCourses = new Map();
  }

  async getPatientProfile(patientId) {
    if (supabase && patientId && !patientId.startsWith('user-')) {
      const { data } = await supabase.from('patients').select('*').eq('id', patientId).single();
      if (data) return data;
    }
    if (patientId === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' || patientId === 'demo-rahul') {
      return {
        id: patientId,
        first_name: 'Rahul',
        last_name: 'Sharma',
        email: 'rahul.sharma@example.com',
        conditions: ['Type 2 Diabetes', 'Essential Hypertension']
      };
    }
    return {
      id: patientId,
      first_name: 'Patient',
      last_name: '',
      email: '',
      conditions: []
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
}

export const patientService = new PatientService();
export default patientService;
