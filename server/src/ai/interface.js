/**
 * Abstract AI Provider Interface
 * All provider adapters (Google, OpenAI, Anthropic, etc.) must implement this contract.
 */
export class AIProviderInterface {
  constructor(config = {}) {
    if (new.target === AIProviderInterface) {
      throw new TypeError('Cannot construct AIProviderInterface instances directly.');
    }
    this.apiKey = config.apiKey || '';
    this.model = config.model || '';
    this.agentName = config.agentName || 'unspecified';
  }

  getProviderName() {
    throw new Error('Method getProviderName() must be implemented.');
  }

  getMetadata() {
    return {
      provider: this.getProviderName(),
      model: this.model,
      agent: this.agentName,
      hasKeyConfigured: Boolean(this.apiKey)
    };
  }

  async extractPrescriptionOcr(imageBuffer, mimeType) {
    throw new Error('Method extractPrescriptionOcr() must be implemented.');
  }

  async analyzeMedicationInteractions(medicationName, currentMedications, patientConditions) {
    throw new Error('Method analyzeMedicationInteractions() must be implemented.');
  }

  async analyzeMedicationStructured(medicationName, patientConditions) {
    throw new Error('Method analyzeMedicationStructured() must be implemented.');
  }

  async generateConversationalResponse(query, context) {
    throw new Error('Method generateConversationalResponse() must be implemented.');
  }
}
