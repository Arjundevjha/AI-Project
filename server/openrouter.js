/**
 * Unified chat-completion module.
 *
 * Routes requests to either the OpenRouter API (for free-tier `:free` models)
 * or the HuggingFace Inference API (for HuggingFace-hosted models).
 */

import { AVAILABLE_MODELS } from '../src/data/models.js';
import { huggingFaceCompletion } from './huggingface.js';

// ── Quick-lookup map for well-known OpenRouter slugs ──────────────────────
const MODEL_MAP = {
  'or-mistral-7b':     'mistralai/mistral-7b-instruct:free',
  'or-llama3-8b':      'meta-llama/llama-3-8b-instruct:free',
  'or-gemma-9b':       'google/gemma-2-9b-it:free',
  'or-phi3-mini':      'microsoft/phi-3-mini-128k-instruct:free',
  'or-qwen2-7b':       'qwen/qwen-2-7b-instruct:free',
  'or-gemma-7b':       'google/gemma-7b-it:free',
  'or-openchat-7b':    'openchat/openchat-7b:free',
  'or-zephyr-7b':      'huggingfaceh4/zephyr-7b-beta:free',
  'or-deepseek-7b':    'deepseek/deepseek-chat:free',
  'or-mythomax':       'gryphe/mythomax-l2-13b:free',
  'or-toppy-7b':       'undi95/toppy-m-7b:free',
  'or-cinematika':     'openrouter/cinematika-7b:free',
  'or-llama3-70b':     'meta-llama/llama-3-70b-instruct:free',
  'or-mixtral-8x7b':   'mistralai/mixtral-8x7b-instruct:free',
  'or-llama33-70b':    'meta-llama/llama-3.3-70b-instruct:free',
  'or-nemotron-super': 'nvidia/nemotron-3-super:free',
  'or-step-flash':     'stepfun/step-3.5-flash:free',
  'or-phi3-med':       'microsoft/phi-3-medium-128k-instruct:free',
  'or-nous-capybara':  'nousresearch/nous-capybara-7b:free',
};

const DEFAULT_MODEL = 'meta-llama/llama-3-8b-instruct:free';

// ── Resolve an internal model ID to a provider-specific slug ──────────────
/**
 * Maps an internal model ID (e.g. "or-llama3-8b" or "hf-bloom-560m") to the
 * provider-specific identifier needed for the API call.
 *
 * Priority:
 *   1. Fast lookup in MODEL_MAP → returns the OpenRouter slug.
 *   2. Look up in AVAILABLE_MODELS → return openRouterId or huggingFaceId.
 *   3. Fall back to DEFAULT_MODEL.
 *
 * @param {string} internalId
 * @returns {string}
 */
export function resolveModelId(internalId) {
  // 1. Direct map hit (OpenRouter free models)
  if (MODEL_MAP[internalId]) {
    return MODEL_MAP[internalId];
  }

  // 2. Dynamic lookup from the shared models list
  const entry = AVAILABLE_MODELS.find((m) => m.id === internalId);
  if (entry) {
    return entry.openRouterId || entry.huggingFaceId || DEFAULT_MODEL;
  }

  // 3. If the caller already passed a full slug (e.g. from analysis endpoint),
  //    return it as-is.
  if (internalId && internalId.includes('/')) {
    return internalId;
  }

  return DEFAULT_MODEL;
}

// ── OpenRouter API call ───────────────────────────────────────────────────
/**
 * @private
 */
async function openRouterCompletion({ model, systemPrompt, messages, maxTokens = 512, temperature = 0.7 }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set. Add it to your .env file.');
  }

  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    max_tokens: maxTokens,
    temperature,
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'AI Senate Simulation',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${bodyText}`);
  }

  const data = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('OpenRouter returned no choices.');
  }

  return data.choices[0].message.content.trim();
}

// ── Public API ────────────────────────────────────────────────────────────
/**
 * Dispatch a chat completion to the appropriate provider.
 *
 * - If the resolved model slug ends with `:free` → OpenRouter.
 * - Otherwise → HuggingFace Inference API.
 *
 * @param {Object}  opts
 * @param {string}  opts.model        – Resolved model slug (from resolveModelId)
 * @param {string}  opts.systemPrompt
 * @param {Array}   opts.messages     – [{ role, content }]
 * @param {number}  [opts.maxTokens]
 * @param {number}  [opts.temperature]
 * @returns {Promise<string>}
 */
export async function chatCompletion({ model, systemPrompt, messages, maxTokens, temperature }) {
  if (model.endsWith(':free')) {
    return openRouterCompletion({ model, systemPrompt, messages, maxTokens, temperature });
  }

  return huggingFaceCompletion({ model, systemPrompt, messages, maxTokens, temperature });
}