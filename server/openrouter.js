/**
 * OpenRouter API integration for the AI Senate.
 * Wraps chat completions and maps internal model IDs to OpenRouter slugs.
 */

// Map internal model IDs → real OpenRouter model slugs (free tier)
const MODEL_MAP = {
  'or-mistral-7b':   'mistralai/mistral-7b-instruct:free',
  'or-llama3-8b':    'meta-llama/llama-3-8b-instruct:free',
  'or-gemma-2b':     'google/gemma-2-9b-it:free',
  'or-phi3-mini':    'microsoft/phi-3-mini-128k-instruct:free',
  'or-qwen2-7b':     'qwen/qwen-2-7b-instruct:free',
  'or-gemma-7b':     'google/gemma-7b-it:free',
  'or-openchat-7b':  'openchat/openchat-7b:free',
  'or-zephyr-7b':    'huggingfaceh4/zephyr-7b-beta:free',
  'or-nous-hermes':  'nousresearch/nous-hermes-2-mixtral-8x7b-dpo',
  'or-deepseek-7b':  'deepseek/deepseek-chat:free',
  'or-yi-6b':        'zero-one-ai/yi-34b-chat',
  'or-solar-10b':    'upstage/solar-10.7b-instruct-v1.0',
  'or-mythomax':     'gryphe/mythomax-l2-13b:free',
  'or-toppy-7b':     'undi95/toppy-m-7b:free',
  'or-cinematika':   'openrouter/cinematika-7b:free',
  'or-bagel-7b':     'jondurbin/bagel-34b-v0.2',
  'or-llama3-70b':   'meta-llama/llama-3-70b-instruct:free',
  'or-mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct:free',
};

// Default fallback model when a model ID isn't in the map
const DEFAULT_MODEL = 'meta-llama/llama-3-8b-instruct:free';

/**
 * Resolve an internal model ID to an OpenRouter model slug.
 */
export function resolveModelId(internalId) {
  return MODEL_MAP[internalId] || DEFAULT_MODEL;
}

/**
 * Call the OpenRouter chat completions API.
 *
 * @param {Object} options
 * @param {string} options.model - OpenRouter model slug
 * @param {string} options.systemPrompt - System instruction
 * @param {Array}  options.messages - Conversation messages [{role, content}]
 * @param {number} [options.maxTokens=512] - Max tokens to generate
 * @param {number} [options.temperature=0.8] - Sampling temperature
 * @returns {Promise<string>} The generated text
 */
export async function chatCompletion({ model, systemPrompt, messages = [], maxTokens = 512, temperature = 0.8 }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set. Please add it to your .env file.');
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
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'AI Senate Chamber',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('OpenRouter returned no choices');
  }

  return data.choices[0].message.content.trim();
}
