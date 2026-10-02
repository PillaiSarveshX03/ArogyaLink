import { supabase } from '../config/supabase.js';
import { query } from '../db/pool.js';

export class MedicineService {
  async getAllMedicines() {
    // 1. Try Supabase Client from existing 'medications' table
    if (supabase) {
      try {
        const { data: medsData, error: medsError } = await supabase
          .from('medications')
          .select('*')
          .order('medicine_name', { ascending: true })
          .limit(100);

        if (!medsError && medsData && medsData.length > 0) {
          // Normalize schema fields to frontend expectations
          return medsData.map((m) => ({
            id: m.id || m.medicine_id,
            name: m.medicine_name || m.name,
            genericName: m.generic_name || m.name,
            dosage: Array.isArray(m.compositions) && m.compositions.length > 0 ? m.compositions[0] : (m.dosage || 'Standard'),
            form: 'tablet',
            category: m.therapeutic_class || m.category || 'General',
            instructions: m.common_indications || 'Take as prescribed by doctor',
            mealRelation: 'after_meal',
            sideEffects: m.common_or_important_adverse_effects ? m.common_or_important_adverse_effects.split(';') : ['Mild headache'],
            warnings: m.do_not_use_or_major_contraindications ? m.do_not_use_or_major_contraindications.split(';') : ['Avoid alcohol']
          }));
        }
      } catch (err) {
        console.warn('Error reading from Supabase medications:', err.message);
      }

      // Try 'medicines' table fallback
      try {
        const { data, error } = await supabase.from('medicines').select('*');
        if (!error && data && data.length > 0) return data;
      } catch {}
    }

    // 2. Try direct PostgreSQL pool if configured
    try {
      const res = await query('SELECT * FROM medicines ORDER BY name ASC');
      return res.rows;
    } catch {
      // 3. Fallback mock list
      return [
        {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Metformin Hydrochloride',
          genericName: 'Metformin',
          dosage: '500mg',
          form: 'tablet',
          category: 'Antidiabetic',
          instructions: 'Take immediately after food.',
          mealRelation: 'after_meal'
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Amlodipine Besylate',
          genericName: 'Amlodipine',
          dosage: '5mg',
          form: 'tablet',
          category: 'Antihypertensive',
          instructions: 'Take in morning with water.',
          mealRelation: 'after_meal'
        }
      ];
    }
  }

  async getMedicineById(id) {
    const all = await this.getAllMedicines();
    return all.find(m => m.id === id) || null;
  }
}
