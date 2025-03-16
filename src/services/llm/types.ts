// This file is kept for backward compatibility
// All types have been moved to src/types/llm.ts
export interface LLMChatMessage {
  role: string;
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
}

export interface LLMConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  [key: string]: unknown;
}
