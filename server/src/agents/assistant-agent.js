import { AIFactory } from '../ai/factory.js';

export class AssistantAgent {
  constructor() {
    // Resolve AI provider configured independently for the Conversational Assistant
    this.provider = AIFactory.getProvider('assistant');
  }

  /**
   * Answer patient queries about food timing, instructions, and side effects.
   * Data Minimization: receives only the query and relevant active medication names.
   */
  async handleQuery(query, context = {}) {
    if (!query || typeof query !== 'string') {
      throw new Error('Valid query string is required.');
    }

    // Extract only necessary medication context
    const sanitizedContext = {
      activeMeds: Array.isArray(context.activeMeds)
        ? context.activeMeds.map(m => (typeof m === 'string' ? m : m.medicineName || m.name))
        : []
    };

    const startTime = Date.now();
    const result = await this.provider.generateConversationalResponse(query, sanitizedContext);
    const durationMs = Date.now() - startTime;

    return {
      agent: 'assistant',
      aiMetadata: this.provider.getMetadata(),
      executionDurationMs: durationMs,
      timestamp: new Date().toISOString(),
      reply: result.reply,
      disclaimer: result.disclaimer || 'AI Assistant: Educational guidance only. Does not replace physician consultation.'
    };
  }
}
