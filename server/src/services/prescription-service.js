import { supabase } from '../config/supabase.js';
import { OCRAgent } from '../agents/ocr-agent.js';

export class PrescriptionService {
  constructor() {
    this.ocrAgent = new OCRAgent();
  }

  async processUpload(fileBuffer, mimeType, patientId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d') {
    const ocrResult = await this.ocrAgent.processPrescriptionImage(fileBuffer, mimeType);

    // Save record to Supabase if connected
    if (supabase) {
      try {
        const { data, error } = await supabase.from('prescriptions').insert({
          patient_id: patientId,
          doctor_name: ocrResult.doctorName,
          clinic_name: ocrResult.clinicName,
          raw_ocr_text: ocrResult.rawText,
          extracted_json: ocrResult.extractedMedicines,
          verification_status: 'pending_review'
        }).select().single();

        if (!error && data) {
          return { ...ocrResult, prescriptionId: data.id };
        }
      } catch (err) {
        console.error('Supabase prescription save error:', err.message);
      }
    }

    return {
      ...ocrResult,
      prescriptionId: `rx-${Date.now()}`
    };
  }
}
