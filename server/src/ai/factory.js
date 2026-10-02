import { getAgentAIConfig } from '../config/ai-config.js';
import { GoogleGeminiProvider } from './providers/google-gemini.js';
import { OpenAIProvider } from './providers/openai.js';
import { AnthropicProvider } from './providers/anthropic.js';

export class AIFactory {
  /**
   * Resolves the AI provider configured specifically for the requesting agent.
   * 
   * @param {string} agentName - 'ocr', 'medication', 'assistant', etc.
   * @returns {import('./interface.js').AIProviderInterface}
   */
  static getProvider(agentName) {
    if (!agentName) {
      throw new Error('[AIFactory Error] Agent name must be explicitly specified (e.g. "ocr", "medication", "assistant").');
    }

    // 1. Load agent-specific configuration
    const config = getAgentAIConfig(agentName);
    const providerType = (config.provider || 'google').toLowerCase().trim();

    // 2. Instantiate the corresponding provider adapter with agent-specific credentials
    switch (providerType) {
      case 'google':
      case 'gemini':
        return new GoogleGeminiProvider(config);

      case 'openai':
        return new OpenAIProvider(config);

      case 'anthropic':
      case 'claude':
        return new AnthropicProvider(config);

      default:
        throw new Error(
          `[AIFactory Error] Unsupported AI provider "${providerType}" for agent "${agentName}". Supported providers: google, openai, anthropic.`
        );
    }
  }
}

/**
 * Convenient standalone resolver helper
 */
export const getAIProvider = (agentName) => AIFactory.getProvider(agentName);
