import { AIFactory } from '../ai/factory.js';

export class OCRAgent {
  constructor() {
    // Resolve AI provider configured independently for the OCR agent
    this.provider = AIFactory.getProvider('ocr');
  }

  /**
   * Process prescription or medicine packaging image.
   * Data Minimization: receives ONLY image buffer and mimeType.
   */
  async processPrescriptionImage(buffer, mimeType = 'image/jpeg') {
    if (!buffer || buffer.length === 0) {
      throw new Error('Image buffer is required for prescription OCR processing.');
    }

    const startTime = Date.now();
    const result = await this.provider.extractPrescriptionOcr(buffer, mimeType);
    const durationMs = Date.now() - startTime;

    // Return structured OCR output with non-sensitive audit metadata
    return {
      agent: 'ocr',
      aiMetadata: this.provider.getMetadata(),
      executionDurationMs: durationMs,
      timestamp: new Date().toISOString(),
      rawText: result.rawText || '',
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.9,
      extractedMedicines: Array.isArray(result.extractedMedicines) ? result.extractedMedicines : [],
      doctorName: result.doctorName || null,
      clinicName: result.clinicName || null,
      prescriptionDate: result.date || new Date().toISOString().split('T')[0],
      guardrailNotice: 'Information is AI-extracted for patient review and confirmation.'
    };
  }
}
