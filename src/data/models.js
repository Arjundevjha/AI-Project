// Mock list of free models from OpenRouter and HuggingFace
export const AVAILABLE_MODELS = [
  // OpenRouter Free Models
  { id: 'or-mistral-7b', name: 'Mistral 7B', provider: 'OpenRouter', icon: '🌀', openRouterId: 'mistralai/mistral-7b-instruct:free' },
  { id: 'or-llama3-8b', name: 'Llama 3 8B', provider: 'OpenRouter', icon: '🦙', openRouterId: 'meta-llama/llama-3-8b-instruct:free' },
  { id: 'or-gemma-2b', name: 'Gemma 2B', provider: 'OpenRouter', icon: '💎', openRouterId: 'google/gemma-2-9b-it:free' },
  { id: 'or-phi3-mini', name: 'Phi-3 Mini', provider: 'OpenRouter', icon: '🔬', openRouterId: 'microsoft/phi-3-mini-128k-instruct:free' },
  { id: 'or-qwen2-7b', name: 'Qwen2 7B', provider: 'OpenRouter', icon: '🐲', openRouterId: 'qwen/qwen-2-7b-instruct:free' },
  { id: 'or-gemma-7b', name: 'Gemma 7B', provider: 'OpenRouter', icon: '💠', openRouterId: 'google/gemma-7b-it:free' },
  { id: 'or-openchat-7b', name: 'OpenChat 7B', provider: 'OpenRouter', icon: '💬', openRouterId: 'openchat/openchat-7b:free' },
  { id: 'or-zephyr-7b', name: 'Zephyr 7B', provider: 'OpenRouter', icon: '🌬️', openRouterId: 'huggingfaceh4/zephyr-7b-beta:free' },
  { id: 'or-nous-hermes', name: 'Nous Hermes', provider: 'OpenRouter', icon: '🧠', openRouterId: 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo' },
  { id: 'or-deepseek-7b', name: 'DeepSeek 7B', provider: 'OpenRouter', icon: '🔍', openRouterId: 'deepseek/deepseek-chat:free' },
  { id: 'or-yi-6b', name: 'Yi 6B', provider: 'OpenRouter', icon: '🏔️', openRouterId: 'zero-one-ai/yi-34b-chat' },
  { id: 'or-solar-10b', name: 'Solar 10.7B', provider: 'OpenRouter', icon: '☀️', openRouterId: 'upstage/solar-10.7b-instruct-v1.0' },
  { id: 'or-mythomax', name: 'MythoMax 13B', provider: 'OpenRouter', icon: '⚡', openRouterId: 'gryphe/mythomax-l2-13b:free' },
  { id: 'or-toppy-7b', name: 'Toppy M 7B', provider: 'OpenRouter', icon: '🎩', openRouterId: 'undi95/toppy-m-7b:free' },
  { id: 'or-cinematika', name: 'Cinematika 7B', provider: 'OpenRouter', icon: '🎬', openRouterId: 'openrouter/cinematika-7b:free' },
  { id: 'or-bagel-7b', name: 'Bagel 7B', provider: 'OpenRouter', icon: '🥯', openRouterId: 'jondurbin/bagel-34b-v0.2' },
  { id: 'or-llama3-70b', name: 'Llama 3 70B', provider: 'OpenRouter', icon: '🦙', openRouterId: 'meta-llama/llama-3-70b-instruct:free' },
  { id: 'or-mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'OpenRouter', icon: '🎛️', openRouterId: 'mistralai/mixtral-8x7b-instruct:free' },

  // HuggingFace Free Models (fallback to default OpenRouter model)
  { id: 'hf-bloom-560m', name: 'BLOOM 560M', provider: 'HuggingFace', icon: '🌸', openRouterId: null },
  { id: 'hf-falcon-7b', name: 'Falcon 7B', provider: 'HuggingFace', icon: '🦅', openRouterId: null },
  { id: 'hf-starcoder', name: 'StarCoder', provider: 'HuggingFace', icon: '⭐', openRouterId: null },
  { id: 'hf-flan-t5', name: 'Flan-T5 XL', provider: 'HuggingFace', icon: '🧪', openRouterId: null },
  { id: 'hf-opt-6.7b', name: 'OPT 6.7B', provider: 'HuggingFace', icon: '🔮', openRouterId: null },
  { id: 'hf-gpt2-xl', name: 'GPT-2 XL', provider: 'HuggingFace', icon: '🤖', openRouterId: null },
  { id: 'hf-pythia-6.9b', name: 'Pythia 6.9B', provider: 'HuggingFace', icon: '🐍', openRouterId: null },
  { id: 'hf-mpt-7b', name: 'MPT 7B', provider: 'HuggingFace', icon: '🏗️', openRouterId: null },
  { id: 'hf-redpajama', name: 'RedPajama 7B', provider: 'HuggingFace', icon: '🔴', openRouterId: null },
  { id: 'hf-dolly-v2', name: 'Dolly v2 7B', provider: 'HuggingFace', icon: '🐑', openRouterId: null },
  { id: 'hf-stablelm', name: 'StableLM 7B', provider: 'HuggingFace', icon: '⚖️', openRouterId: null },
  { id: 'hf-cerebras', name: 'Cerebras GPT', provider: 'HuggingFace', icon: '🧩', openRouterId: null },
  { id: 'hf-santacoder', name: 'SantaCoder', provider: 'HuggingFace', icon: '🎅', openRouterId: null },
  { id: 'hf-codegen', name: 'CodeGen 6B', provider: 'HuggingFace', icon: '💻', openRouterId: null },
  { id: 'hf-opt-1.3b', name: 'OPT 1.3B', provider: 'HuggingFace', icon: '🔹', openRouterId: null },
  { id: 'hf-gpt-neo', name: 'GPT-Neo 2.7B', provider: 'HuggingFace', icon: '🌐', openRouterId: null },
  { id: 'hf-bloomz', name: 'BLOOMZ 7B', provider: 'HuggingFace', icon: '🌻', openRouterId: null },
];

// Slot configuration
export const SLOT_CONFIG = {
  debaters: 16,
  judges: 3,
  spares: 12,
  get total() { return this.debaters + this.judges + this.spares; }
};

// Sample motions for quick start
export const SAMPLE_MOTIONS = [
  "This house believes that artificial intelligence will do more harm than good to humanity.",
  "This house would ban all social media platforms.",
  "This house believes that space exploration is a waste of resources.",
  "This house would implement universal basic income.",
  "This house believes that privacy is more important than national security.",
  "This house would abolish the death penalty worldwide.",
  "This house believes that climate change is the greatest threat to civilization.",
  "This house would make voting compulsory.",
];
