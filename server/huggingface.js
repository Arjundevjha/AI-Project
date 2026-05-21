/**
 * HuggingFace Inference API client for text generation.
 *
 * Reads HUGGINGFACE_API_KEY from the environment and calls the
 * HuggingFace Inference API to generate chat-style completions.
 */

/**
 * Generate a completion via the HuggingFace Inference API.
 *
 * @param {Object}   opts
 * @param {string}   opts.model        – HuggingFace model ID (e.g. "bigscience/bloom-560m")
 * @param {string}   opts.systemPrompt – System-level instructions
 * @param {Array}    opts.messages      – Conversation turns [{ role, content }]
 * @param {number}   [opts.maxTokens=512]
 * @param {number}   [opts.temperature=0.7]
 * @returns {Promise<string>} The generated assistant text.
 */
export async function huggingFaceCompletion({
  model,
  systemPrompt,
  messages,
  maxTokens = 512,
  temperature = 0.7,
}) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error(
      'HUGGINGFACE_API_KEY is not set. Add it to your .env file.',
    );
  }

  // ── Build a single prompt string from system + conversation ──
  let prompt = `<system>\n${systemPrompt}\n</system>\n\n`;

  for (const msg of messages) {
    const tag = msg.role === 'assistant' ? 'assistant' : 'user';
    prompt += `<${tag}>\n${msg.content}\n</${tag}>\n`;
  }

  // Signal the model to begin its reply
  prompt += '<assistant>\n';

  // ── Call the HuggingFace Inference API ──
  const url = `https://api-inference.huggingface.co/models/${model}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: maxTokens,
        temperature,
      },
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(
      `HuggingFace API error ${response.status}: ${bodyText}`,
    );
  }

  const data = await response.json();

  // The API returns an array of objects with a `generated_text` field.
  // Strip the original prompt so we return only the new content.
  let generatedText =
    Array.isArray(data) && data[0]?.generated_text
      ? data[0].generated_text
      : typeof data === 'string'
        ? data
        : JSON.stringify(data);

  // Remove the prompt prefix if the model echoed it back
  if (generatedText.startsWith(prompt)) {
    generatedText = generatedText.slice(prompt.length);
  }

  // Strip a trailing </assistant> tag if present
  generatedText = generatedText.replace(/<\/assistant>\s*$/, '');

  return generatedText.trim();
}
