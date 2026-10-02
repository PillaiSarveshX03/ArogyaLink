import { AIProviderInterface } from '../interface.js';

export class AnthropicProvider extends AIProviderInterface {
  constructor(config = {}) {
    super(config);
    this.name = 'anthropic';
    this.model = this.model || 'claude-3-5-sonnet-20240620';
  }

  getProviderName() {
    return 'anthropic';
  }

  async extractPrescriptionOcr(imageBuffer, mimeType = 'image/jpeg') {
    if (!this.apiKey) {
      throw new Error(`[AnthropicProvider - ${this.agentName}] Missing Anthropic API key.`);
    }

    const base64Data = imageBuffer.toString('base64');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: base64Data }
            },
            {
              type: 'text',
              text: 'Extract all medications from this prescription. Output ONLY valid JSON containing rawText, confidence, doctorName, clinicName, and extractedMedicines.'
            }
          ]
        }]
      })
    });

    if (!response.ok) throw new Error(`Anthropic error ${response.status}`);
    const data = await response.json();
    const rawText = data.content[0].text;
    const cleanJson = rawText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  }

  async analyzeMedicationInteractions(medicationName, currentMedications = [], patientConditions = []) {
    if (!this.apiKey) {
      throw new Error(`[AnthropicProvider - ${this.agentName}] Missing Anthropic API key.`);
    }

    const medList = currentMedications.map(m => m.medicineName || m.name || m).join(', ');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a clinical interaction checker. Check interactions for ${medicationName} with current meds: ${medList || 'None'}. Return ONLY valid JSON with keys: title, severity ('low'|'moderate'|'high'), description, recommendation, aiGenerated (true), disclaimer.`
        }]
      })
    });

    if (!response.ok) throw new Error(`Anthropic status ${response.status}`);
    const data = await response.json();
    const cleanJson = data.content[0].text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  }

  async analyzeMedicationStructured(medicationName, patientConditions = []) {
    if (!this.apiKey) return null;
    try {
      const conditionsList = Array.isArray(patientConditions) && patientConditions.length > 0
        ? patientConditions.join(', ')
        : 'None specified';

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `You are a clinical pharmacology medication analysis engine. Return ONLY valid JSON matching schema: medicationName, genericName, whatIsIt, uses, howItWorks, adultDosing (usualRange, frequency, maximumDose, importantNotes, disclaimer), pediatricInformation (status, summary, notes), bloodPressureGoals (adultSummary, pediatricSummary, clinicalFactors, note), precautionsAndInteractions (medicationInteractions, foodBeverageInteractions, medicalConditions, alcohol), commonSideEffects, whenToSeekMedicalAttention, sources. Do not invent pediatric doses or single universal BP targets. Analyze medication: "${medicationName}". Conditions: ${conditionsList}.`
          }]
        })
      });

      if (!response.ok) return null;
      const data = await response.json();
      const cleanJson = data.content[0].text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      return null;
    }
  }

  async generateConversationalResponse(query, context = {}) {
    if (!this.apiKey) {
      throw new Error(`[AnthropicProvider - ${this.agentName}] Missing Anthropic API key.`);
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 800,
        messages: [{ role: 'user', content: query }]
      })
    });

    if (!response.ok) throw new Error(`Anthropic status ${response.status}`);
    const data = await response.json();
    return {
      reply: data.content[0].text,
      disclaimer: "AI Assistant Guidance: Educational support only."
    };
  }
}
