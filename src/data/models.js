// Mock list of free models from OpenRouter and HuggingFace
export const AVAILABLE_MODELS = [
  // OpenRouter Free Models
  { id: 'or-mistral-7b', name: 'Mistral 7B', provider: 'OpenRouter', icon: '🌀' },
  { id: 'or-llama3-8b', name: 'Llama 3 8B', provider: 'OpenRouter', icon: '🦙' },
  { id: 'or-gemma-2b', name: 'Gemma 2B', provider: 'OpenRouter', icon: '💎' },
  { id: 'or-phi3-mini', name: 'Phi-3 Mini', provider: 'OpenRouter', icon: '🔬' },
  { id: 'or-qwen2-7b', name: 'Qwen2 7B', provider: 'OpenRouter', icon: '🐲' },
  { id: 'or-gemma-7b', name: 'Gemma 7B', provider: 'OpenRouter', icon: '💠' },
  { id: 'or-openchat-7b', name: 'OpenChat 7B', provider: 'OpenRouter', icon: '💬' },
  { id: 'or-zephyr-7b', name: 'Zephyr 7B', provider: 'OpenRouter', icon: '🌬️' },
  { id: 'or-nous-hermes', name: 'Nous Hermes', provider: 'OpenRouter', icon: '🧠' },
  { id: 'or-deepseek-7b', name: 'DeepSeek 7B', provider: 'OpenRouter', icon: '🔍' },
  { id: 'or-yi-6b', name: 'Yi 6B', provider: 'OpenRouter', icon: '🏔️' },
  { id: 'or-solar-10b', name: 'Solar 10.7B', provider: 'OpenRouter', icon: '☀️' },
  { id: 'or-mythomax', name: 'MythoMax 13B', provider: 'OpenRouter', icon: '⚡' },
  { id: 'or-toppy-7b', name: 'Toppy M 7B', provider: 'OpenRouter', icon: '🎩' },
  { id: 'or-cinematika', name: 'Cinematika 7B', provider: 'OpenRouter', icon: '🎬' },
  { id: 'or-bagel-7b', name: 'Bagel 7B', provider: 'OpenRouter', icon: '🥯' },
  { id: 'or-llama3-70b', name: 'Llama 3 70B', provider: 'OpenRouter', icon: '🦙' },
  { id: 'or-mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'OpenRouter', icon: '🎛️' },

  // HuggingFace Free Models
  { id: 'hf-bloom-560m', name: 'BLOOM 560M', provider: 'HuggingFace', icon: '🌸' },
  { id: 'hf-falcon-7b', name: 'Falcon 7B', provider: 'HuggingFace', icon: '🦅' },
  { id: 'hf-starcoder', name: 'StarCoder', provider: 'HuggingFace', icon: '⭐' },
  { id: 'hf-flan-t5', name: 'Flan-T5 XL', provider: 'HuggingFace', icon: '🧪' },
  { id: 'hf-opt-6.7b', name: 'OPT 6.7B', provider: 'HuggingFace', icon: '🔮' },
  { id: 'hf-gpt2-xl', name: 'GPT-2 XL', provider: 'HuggingFace', icon: '🤖' },
  { id: 'hf-pythia-6.9b', name: 'Pythia 6.9B', provider: 'HuggingFace', icon: '🐍' },
  { id: 'hf-mpt-7b', name: 'MPT 7B', provider: 'HuggingFace', icon: '🏗️' },
  { id: 'hf-redpajama', name: 'RedPajama 7B', provider: 'HuggingFace', icon: '🔴' },
  { id: 'hf-dolly-v2', name: 'Dolly v2 7B', provider: 'HuggingFace', icon: '🐑' },
  { id: 'hf-stablelm', name: 'StableLM 7B', provider: 'HuggingFace', icon: '⚖️' },
  { id: 'hf-cerebras', name: 'Cerebras GPT', provider: 'HuggingFace', icon: '🧩' },
  { id: 'hf-santacoder', name: 'SantaCoder', provider: 'HuggingFace', icon: '🎅' },
  { id: 'hf-codegen', name: 'CodeGen 6B', provider: 'HuggingFace', icon: '💻' },
  { id: 'hf-opt-1.3b', name: 'OPT 1.3B', provider: 'HuggingFace', icon: '🔹' },
  { id: 'hf-gpt-neo', name: 'GPT-Neo 2.7B', provider: 'HuggingFace', icon: '🌐' },
  { id: 'hf-bloomz', name: 'BLOOMZ 7B', provider: 'HuggingFace', icon: '🌻' },
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
