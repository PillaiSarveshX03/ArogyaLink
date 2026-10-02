import { config as envConfig } from './env.js';

/**
 * Centralized Multi-Agent AI Configuration
 * 
 * Each agent is independently configured with:
 * - its own provider ('google', 'openai', 'anthropic', etc.)
 * - its own model
 * - its own dedicated API key
 * 
 * Changing one agent's provider or key NEVER changes another agent's setup.
 */
export const getAgentAIConfig = (agentName) => {
  const normalizedAgent = String(agentName || '').toLowerCase().trim();

  // Helper to resolve API keys with agent-specific precedence
  const resolveKey = (specificKey, genericProviderKey) => {
    return specificKey || genericProviderKey || '';
  };

  const configs = {
    ocr: {
      agentName: 'ocr',
      provider: process.env.OCR_AI_PROVIDER || 'google',
      model: process.env.OCR_AI_MODEL || 'gemini-3.5-flash-lite',
      apiKey: resolveKey(process.env.OCR_AI_API_KEY, envConfig.gemini.apiKey),
    },

    medication: {
      agentName: 'medication',
      provider: process.env.MEDICATION_AI_PROVIDER || 'google',
      model: process.env.MEDICATION_AI_MODEL || 'gemini-3.5-flash-lite',
      apiKey: resolveKey(process.env.MEDICATION_AI_API_KEY, envConfig.gemini.apiKey),
    },

    assistant: {
      agentName: 'assistant',
      provider: process.env.ASSISTANT_AI_PROVIDER || 'google',
      model: process.env.ASSISTANT_AI_MODEL || 'gemini-3.5-flash-lite',
      apiKey: resolveKey(process.env.ASSISTANT_AI_API_KEY, envConfig.gemini.apiKey),
    }
  };

  const agentConfig = configs[normalizedAgent];

  if (!agentConfig) {
    throw new Error(`[AI Config Error] Unknown agent "${agentName}". Supported agents: ${Object.keys(configs).join(', ')}`);
  }

  return agentConfig;
};

/**
 * Sanitized configuration inspector for audits & status checks.
 * NEVER exposes the secret API key.
 */
export const getSanitizedAgentSummary = () => {
  const agents = ['ocr', 'medication', 'assistant'];
  return agents.map((agent) => {
    const cfg = getAgentAIConfig(agent);
    return {
      agent: cfg.agentName,
      provider: cfg.provider,
      model: cfg.model,
      hasKeyConfigured: Boolean(cfg.apiKey),
    };
  });
};
