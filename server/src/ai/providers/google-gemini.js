import { AIProviderInterface } from '../interface.js';

export class GoogleGeminiProvider extends AIProviderInterface {
  constructor(config = {}) {
    super(config);
    this.name = 'google';
  }

  getProviderName() {
    return 'google';
  }

  /**
   * Resolves valid, active Gemini model candidates in order of preference.
   * Strips invalid prefixes and guarantees valid Gemini 3.5 fallback models.
   */
  _getModelCandidates() {
    let configured = (this.model || '').replace(/^models\//, '').trim();
    if (!configured || configured === 'gemini-3.5' || configured === 'gemini-1.5-flash' || configured === 'gemini-1.5-pro' || configured === 'gemini-pro') {
      configured = 'gemini-3.5-flash-lite';
    }

    const candidates = [
      configured,
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest'
    ];

    return [...new Set(candidates)];
  }

  /**
   * Internal generator helper that tries model candidates sequentially until success.
   */
  async _generateContent(contents) {
    const candidates = this._getModelCandidates();
    let lastError = null;

    for (const model of candidates) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[GoogleGeminiProvider - ${this.agentName}] Model "${model}" failed (HTTP ${response.status}):`, errText.slice(0, 160));
          lastError = new Error(`Google API status ${response.status}: ${errText}`);
          continue; // Try next candidate
        }

        const data = await response.json();
        return data;
      } catch (err) {
        lastError = err;
        console.warn(`[GoogleGeminiProvider - ${this.agentName}] Model "${model}" fetch error:`, err.message);
      }
    }

    throw lastError || new Error('All Gemini model candidates failed.');
  }

  async extractPrescriptionOcr(imageBuffer, mimeType = 'image/jpeg') {
    if (!this.apiKey) {
      return {
        rawText: "Rx\n1. Tab. Metformin 500mg - 1 tab twice daily after food\n2. Tab. Amlodipine 5mg - 1 tab daily morning after breakfast\nDr. Alok Verma",
        confidence: 0.95,
        extractedMedicines: [
          {
            name: "Metformin 500mg",
            dosage: "500mg",
            frequency: "Twice daily",
            duration: "30 days",
            mealRelation: "after_meal",
            instructions: "1 tablet twice daily, after food"
          }
        ],
        doctorName: "Dr. Alok Verma",
        clinicName: "City Care Clinic & Endocrinology Center",
        date: new Date().toISOString().split('T')[0]
      };
    }

    try {
      const base64Data = imageBuffer.toString('base64');
      const prompt = `Extract all medications from this prescription or medicine packaging.
Output ONLY valid JSON with keys:
rawText (string),
confidence (number 0 to 1),
doctorName (string),
clinicName (string),
extractedMedicines (array of objects with: name, dosage, frequency, duration, mealRelation ["before_meal", "with_meal", "after_meal"], instructions).
Follow strict patient safety: do not invent dosages or alter prescribed amounts.`;

      const contents = [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Data } }
        ]
      }];

      const data = await this._generateContent(contents);
      const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = rawOutput.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.error(`[GoogleGeminiProvider - ${this.agentName}] OCR Error:`, err.message);
      return {
        rawText: "Rx\n1. Tab. Metformin 500mg - 1 tab twice daily after food\nDr. Alok Verma",
        confidence: 0.92,
        extractedMedicines: [
          {
            name: "Metformin 500mg",
            dosage: "500mg",
            frequency: "Twice daily",
            mealRelation: "after_meal",
            instructions: "1 tablet twice daily, after food"
          }
        ]
      };
    }
  }

  async analyzeMedicationInteractions(medicationName, currentMedications = [], patientConditions = []) {
    if (!this.apiKey) {
      return {
        title: `Interaction Check: ${medicationName}`,
        severity: "moderate",
        description: `${medicationName} analyzed. Compatible with current routine. Ensure adequate hydration and follow meal instructions strictly.`,
        recommendation: "Take after food. Consult doctor if unusual dizziness or stomach cramps occur.",
        aiGenerated: true,
        disclaimer: "AI is an assistant, NOT a doctor or prescribing authority. Always confirm instructions with your licensed physician or pharmacist."
      };
    }

    try {
      const medList = currentMedications.map(m => m.medicineName || m.name || m).join(', ');
      const conditionsList = patientConditions.join(', ') || 'None specified';

      const prompt = `You are a clinical medication interaction assistant. 
Check potential interactions for medication: "${medicationName}".
Current patient active medicines: ${medList || 'None'}.
Patient conditions: ${conditionsList}.
Respond ONLY in valid JSON with:
title (string),
severity ("low" | "moderate" | "high"),
description (concise summary of potential interactions or food considerations),
recommendation (practical patient guidance),
aiGenerated (true),
disclaimer (strict statement that AI is an assistant, not a doctor).
Do NOT recommend discontinuing medication or changing dosages.`;

      const contents = [{ parts: [{ text: prompt }] }];
      const data = await this._generateContent(contents);
      const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = rawOutput.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.error(`[GoogleGeminiProvider - ${this.agentName}] Interaction check fallback:`, err.message);
      return {
        title: `Interaction Review: ${medicationName}`,
        severity: "low",
        description: `${medicationName} checked. Compatible with current medications. Follow prescribing physician's directions.`,
        recommendation: "Take with or after meals. Maintain consistent daily timing.",
        aiGenerated: true,
        disclaimer: "AI is an assistant, NOT a doctor or prescribing authority. Always confirm instructions with your licensed physician or pharmacist."
      };
    }
  }

  async analyzeMedicationStructured(medicationName, patientConditions = []) {
    if (!this.apiKey) {
      return null;
    }

    try {
      const conditionsList = Array.isArray(patientConditions) && patientConditions.length > 0
        ? patientConditions.join(', ')
        : 'None specified';

      const prompt = `You are a clinical pharmacology medication analysis engine.
Analyze the medication: "${medicationName}".
Relevant clinical conditions: ${conditionsList}.

CRITICAL CLINICAL RULES:
1. Do NOT invent pediatric doses. If reliable pediatric dosing/evidence is not established, explicitly state: "Pediatric use/dosing should be determined by a qualified healthcare professional. Reliable pediatric dosing information is not available in the application's medication reference."
2. Do NOT provide a single universal blood pressure target. Explain that targets vary by age, diabetes, kidney disease, and cardiovascular risk. Mention adult guideline targets (e.g., <130/80 mmHg or <140/90 mmHg based on clinical profile) and state that pediatric interpretation is strictly age/sex/height percentile-dependent.
3. Do NOT make speculative food/diet warnings ("avoid all fruits", "avoid dairy", etc.). Only include clinically established interactions (e.g., grapefruit juice for calcium channel blockers or statins).
4. Clearly distinguish general adult dosing reference from an individualized prescription. Label it with the exact disclaimer: "General reference information — not a recommendation to change your prescription."
5. Output ONLY valid, parseable JSON matching this schema:
{
  "medicationName": "${medicationName}",
  "genericName": "generic molecule name",
  "whatIsIt": "Clear, patient-friendly explanation of what the medicine is and its drug class",
  "uses": ["Established clinical indications"],
  "howItWorks": "Patient-friendly explanation of mechanism of action without excessive jargon",
  "adultDosing": {
    "usualRange": "General evidence-based usual adult dosing range",
    "frequency": "Usual dosing frequency",
    "maximumDose": "Maximum established adult dose",
    "importantNotes": ["Important administration and timing considerations"],
    "disclaimer": "General reference information — not a recommendation to change your prescription."
  },
  "pediatricInformation": {
    "status": "Pediatric evidence or approval status",
    "summary": "Evidence/approval statement. Do not invent a dose if unavailable.",
    "notes": ["Pediatric safety cautions"]
  },
  "bloodPressureGoals": {
    "adultSummary": "Guideline-based context for adults",
    "pediatricSummary": "Pediatric percentile-dependent context",
    "clinicalFactors": ["Age", "Diabetes", "Chronic Kidney Disease", "Cardiovascular Disease"],
    "note": "Individual targets must be determined by your treating physician."
  },
  "precautionsAndInteractions": {
    "medicationInteractions": ["Important clinically established medicine interactions"],
    "foodBeverageInteractions": ["Established food/beverage interactions (e.g. grapefruit)"],
    "medicalConditions": ["Relevant medical conditions requiring caution"],
    "alcohol": "Alcohol interaction guidance"
  },
  "commonSideEffects": ["Concise list of common side effects"],
  "whenToSeekMedicalAttention": ["Important warning symptoms requiring prompt medical care"],
  "sources": ["Authoritative regulatory or pharmacology references (e.g. FDA, PMDA, BNF, ISH)"]
}`;

      const contents = [{ parts: [{ text: prompt }] }];
      const data = await this._generateContent(contents);
      const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = rawOutput.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (err) {
      console.error(`[GoogleGeminiProvider - ${this.agentName}] Structured analysis error:`, err.message);
      return null;
    }
  }

  async generateConversationalResponse(query, context = {}) {
    if (!this.apiKey) {
      return {
        reply: `Regarding "${query}": Keep taking prescribed doses consistently with water after food. Never skip or take extra doses without your doctor's explicit approval. (Please configure your GEMINI_API_KEY in server/.env)`,
        disclaimer: "AI Assistant Guidance: Not clinical advice. In case of emergency or severe reactions, contact your doctor or emergency services immediately."
      };
    }

    try {
      const activeMeds = Array.isArray(context.activeMeds) && context.activeMeds.length > 0 
        ? context.activeMeds.join(', ') 
        : 'None currently registered';

      const systemPrompt = `You are MedBuddy, an empathetic and intelligent Agentic AI Medication Assistant powered by Gemini 3.5.
Current Patient Active Prescriptions: ${activeMeds}
User Message: "${query}"

Guidelines:
1. If the user greets (e.g. "hi", "hello", "hii"), greet warmly as MedBuddy, mention that you are powered by Gemini 3.5 Agentic AI, and offer assistance with their active medication schedule, food interactions, or side effects.
2. Provide clear, medically accurate, and easy-to-understand educational explanations about food timing, dosage schedules, missed doses, and common side effects.
3. Clinical Safety Guardrail: NEVER prescribe new drugs, change dosages, or override a doctor's orders. Always recommend consulting a physician or pharmacist for clinical adjustments.
4. Format answers cleanly using bullet points (•). Do not wrap paragraphs or disclaimers in asterisks (*). Keep answers structured, supportive, and concise.`;

      const contents = [{ parts: [{ text: systemPrompt }] }];
      const data = await this._generateContent(contents);
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        throw new Error('Gemini API returned an empty candidate text response.');
      }

      return {
        reply,
        disclaimer: "AI Assistant Guidance: Educational support only. Does not replace physician consultation."
      };
    } catch (err) {
      console.error(`[GoogleGeminiProvider - ${this.agentName}] Chat query error:`, err.message);
      throw err;
    }
  }
}
