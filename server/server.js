import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { chatCompletion, resolveModelId } from './openrouter.js';
import {
  buildSenatorPrompt,
  buildPointOfOrderPrompt,
  buildUnparliamentaryAnalysisPrompt,
  buildRequestToSpeakPrompt,
} from './prompts.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security: disable X-Powered-By header
app.disable('x-powered-by');

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// POST /api/speak
// Generate a senator's parliamentary speech
// ─────────────────────────────────────────────
app.post('/api/speak', async (req, res) => {
  try {
    const { senator, motion, context = [], shouldBeUnparliamentary = false } = req.body;

    if (!senator || !motion) {
      return res.status(400).json({ error: 'senator and motion are required' });
    }

    const systemPrompt = buildSenatorPrompt({
      senatorName: senator.name,
      role: senator.role,
      side: senator.side,
      motion,
      shouldBeUnparliamentary,
    });

    // Build conversation messages from context (previous speeches)
    const messages = context.slice(-6).map(entry => ({
      role: 'user',
      content: `[${entry.speakerName} — ${entry.role}]: ${entry.text}`,
    }));

    // Add a final user message to prompt the senator
    messages.push({
      role: 'user',
      content: 'The Speaker has granted you the floor. Please deliver your speech.',
    });

    const openRouterModel = resolveModelId(senator.modelId);

    const speech = await chatCompletion({
      model: openRouterModel,
      systemPrompt,
      messages,
      maxTokens: 600,
      temperature: 0.85,
    });

    return res.json({ speech, senatorId: senator.id });
  } catch (error) {
    console.error('[/api/speak] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/request-to-speak
// Senator requests the floor — generates a request line
// ─────────────────────────────────────────────
app.post('/api/request-to-speak', async (req, res) => {
  try {
    const { senator, motion, previousSpeeches = [] } = req.body;

    if (!senator || !motion) {
      return res.status(400).json({ error: 'senator and motion are required' });
    }

    const systemPrompt = buildRequestToSpeakPrompt({
      senatorName: senator.name,
      side: senator.side,
      motion,
      previousSpeeches,
    });

    const openRouterModel = resolveModelId(senator.modelId);

    const request = await chatCompletion({
      model: openRouterModel,
      systemPrompt,
      messages: [{ role: 'user', content: 'Please make your request to speak.' }],
      maxTokens: 100,
      temperature: 0.7,
    });

    return res.json({
      request,
      senatorId: senator.id,
      senatorName: senator.name,
      side: senator.side,
    });
  } catch (error) {
    console.error('[/api/request-to-speak] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/challenge
// Raise a point of order about unparliamentary language
// ─────────────────────────────────────────────
app.post('/api/challenge', async (req, res) => {
  try {
    const { objector, challengedSpeech, challengedSenatorName, transcriptEntryId } = req.body;

    if (!objector || !challengedSpeech) {
      return res.status(400).json({ error: 'objector and challengedSpeech are required' });
    }

    // 1. Generate the objector's point of order speech
    const pointOfOrderPrompt = buildPointOfOrderPrompt({
      objectorName: objector.name,
      challengedSpeech,
      challengedSenatorName,
    });

    const openRouterModel = resolveModelId(objector.modelId);

    const pointOfOrder = await chatCompletion({
      model: openRouterModel,
      systemPrompt: pointOfOrderPrompt,
      messages: [{ role: 'user', content: 'Rise on your point of order now.' }],
      maxTokens: 200,
      temperature: 0.7,
    });

    // 2. Analyze the challenged speech for unparliamentary content
    const analysisPrompt = buildUnparliamentaryAnalysisPrompt({ speech: challengedSpeech });

    const analysisRaw = await chatCompletion({
      model: 'meta-llama/llama-3-8b-instruct:free', // Use a reliable model for analysis
      systemPrompt: analysisPrompt,
      messages: [{ role: 'user', content: 'Analyze this speech now.' }],
      maxTokens: 300,
      temperature: 0.3,
    });

    // Try to parse the analysis as JSON
    let analysis;
    try {
      // Extract JSON from the response (model might wrap it in markdown/text)
      const jsonMatch = analysisRaw.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { isUnparliamentary: false, severity: 'none', offendingPhrases: [], explanation: 'Could not analyze.' };
    } catch {
      analysis = { isUnparliamentary: false, severity: 'none', offendingPhrases: [], explanation: analysisRaw };
    }

    return res.json({
      pointOfOrder,
      analysis,
      objectorId: objector.id,
      objectorName: objector.name,
      transcriptEntryId,
    });
  } catch (error) {
    console.error('[/api/challenge] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/strike-from-record
// Mark a transcript entry as stricken
// ─────────────────────────────────────────────
app.post('/api/strike-from-record', async (req, res) => {
  try {
    const { transcriptEntryId, reason } = req.body;

    if (!transcriptEntryId) {
      return res.status(400).json({ error: 'transcriptEntryId is required' });
    }

    // This is mostly a frontend concern — the backend just acknowledges it
    // and returns confirmation. The actual state change happens in the reducer.
    return res.json({
      stricken: true,
      transcriptEntryId,
      reason: reason || 'Unparliamentary language — stricken by order of the Speaker.',
    });
  } catch (error) {
    console.error('[/api/strike-from-record] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🏛️  Senate Backend running on http://localhost:${PORT}`);
  console.log(`   API Key: ${process.env.OPENROUTER_API_KEY ? '✅ Loaded' : '❌ Missing — set OPENROUTER_API_KEY in .env'}`);
});
