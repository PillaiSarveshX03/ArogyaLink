import { Router } from 'express';
import { MedicationAgent } from '../agents/medication-agent.js';
import { AdherenceAgent } from '../agents/adherence-agent.js';
import { AssistantAgent } from '../agents/assistant-agent.js';
import { getSanitizedAgentSummary } from '../config/ai-config.js';

const router = Router();
const medicationAgent = new MedicationAgent();
const adherenceAgent = new AdherenceAgent();
const assistantAgent = new AssistantAgent();

// 1. Non-sensitive status endpoint for administrative audit (NEVER exposes API keys)
router.get('/status', (req, res) => {
  try {
    const summary = getSanitizedAgentSummary();
    res.json({
      success: true,
      agents: summary,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve AI configuration summary.' });
  }
});

// 2. Medication Interaction Analysis (Medication Agent)
router.post('/medication-agent/analyze', async (req, res) => {
  try {
    const { medicationName, currentCourses, patientConditions } = req.body;
    if (!medicationName) {
      return res.status(400).json({ error: 'medicationName is required' });
    }

    const result = await medicationAgent.checkInteractions(
      medicationName,
      currentCourses || [],
      patientConditions || []
    );
    res.json(result);
  } catch (err) {
    console.error('[Route Error - /api/ai/medication-agent/analyze]:', err.message);
    res.status(500).json({
      error: 'Unable to complete the medication analysis right now. Your saved medication schedule is unchanged. Please try again shortly.',
      safeMessage: 'Unable to complete the medication analysis right now. Your saved medication schedule is unchanged. Please try again shortly.'
    });
  }
});

// 3. Conversational Assistant (Assistant Agent)
router.post('/chat', async (req, res) => {
  try {
    const { query, context } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query string is required' });
    }

    const result = await assistantAgent.handleQuery(query, context || {});
    res.json(result);
  } catch (err) {
    console.error('[Route Error - /api/ai/chat]:', err.message);
    res.status(500).json({
      error: 'Assistant service temporarily unavailable.',
      reply: 'MedBuddy is currently offline. Please refer to your verified schedule on the dashboard.',
      disclaimer: 'In emergencies, contact your healthcare provider or emergency hotline.'
    });
  }
});

// 4. Adherence Calculation (Strictly Deterministic Logic - No LLM)
router.post('/adherence-agent/calculate', (req, res) => {
  try {
    const { doses } = req.body;
    const stats = adherenceAgent.calculateAdherence(doses);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute adherence statistics.' });
  }
});

export default router;
