import { AIProviderInterface } from '../interface.js';

export class OpenAIProvider extends AIProviderInterface {
  constructor(config = {}) {
    super(config);
    this.name = 'openai';
    this.model = this.model || 'gpt-4o-mini';
  }

  getProviderName() {
    return 'openai';
  }

  async extractPrescriptionOcr(imageBuffer, mimeType = 'image/jpeg') {
    if (!this.apiKey) {
      throw new Error(`[OpenAIProvider - ${this.agentName}] Missing OpenAI API key. Configure via OCR_AI_API_KEY or OPENAI_API_KEY.`);
    }

    try {
      const base64Data = imageBuffer.toString('base64');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "You are an OCR extraction assistant for prescriptions. Extract medications into JSON with rawText, confidence, doctorName, clinicName, and extractedMedicines."
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Extract medication names, dosages, instructions, frequency, and meal relations from this prescription image." },
                { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI error (${response.status}): ${err}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (err) {
      console.error(`[OpenAIProvider - ${this.agentName}] Error:`, err.message);
      throw err;
    }
  }

  async analyzeMedicationInteractions(medicationName, currentMedications = [], patientConditions = []) {
    if (!this.apiKey) {
      throw new Error(`[OpenAIProvider - ${this.agentName}] Missing OpenAI API key.`);
    }

    const medList = currentMedications.map(m => m.medicineName || m.name || m).join(', ');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are a clinical interaction analysis assistant. Return JSON with title, severity ('low'|'moderate'|'high'), description, recommendation, aiGenerated (true), disclaimer."
          },
          {
            role: "user",
            content: `Analyze potential interactions for ${medicationName}. Current medicines: ${medList || 'None'}. Patient conditions: ${patientConditions.join(', ') || 'None'}.`
          }
        ]
      })
    });

    if (!response.ok) throw new Error(`OpenAI status ${response.status}`);
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  async analyzeMedicationStructured(medicationName, patientConditions = []) {
    if (!this.apiKey) return null;
    try {
      const conditionsList = Array.isArray(patientConditions) && patientConditions.length > 0
        ? patientConditions.join(', ')
        : 'None specified';

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "You are a clinical pharmacology medication analysis engine. Return valid JSON matching schema: medicationName, genericName, whatIsIt, uses, howItWorks, adultDosing (usualRange, frequency, maximumDose, importantNotes, disclaimer), pediatricInformation (status, summary, notes), bloodPressureGoals (adultSummary, pediatricSummary, clinicalFactors, note), precautionsAndInteractions (medicationInteractions, foodBeverageInteractions, medicalConditions, alcohol), commonSideEffects, whenToSeekMedicalAttention, sources. Do not invent pediatric doses or single universal BP targets."
            },
            {
              role: "user",
              content: `Analyze medication: "${medicationName}". Conditions: ${conditionsList}.`
            }
          ]
        })
      });

      if (!response.ok) return null;
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch {
      return null;
    }
  }

  async generateConversationalResponse(query, context = {}) {
    if (!this.apiKey) {
      throw new Error(`[OpenAIProvider - ${this.agentName}] Missing OpenAI API key.`);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are MedBuddy, a medication management assistant. Answer patient questions about food timing and adherence. Do not alter prescriptions."
          },
          { role: "user", content: query }
        ]
      })
    });

    if (!response.ok) throw new Error(`OpenAI status ${response.status}`);
    const data = await response.json();
    return {
      reply: data.choices[0].message.content,
      disclaimer: "AI Assistant Guidance: Educational support only."
    };
  }
}
