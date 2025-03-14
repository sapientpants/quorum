// This file is kept for backward compatibility
// All types have been moved to src/types/llm.ts

import type { 
  LLMClient, 
  StreamingOptions, 
  ProviderCapabilities 
} from '../../types/llm'

export type { 
  LLMClient, 
  StreamingOptions, 
  ProviderCapabilities 
}

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

export interface StreamingResponse {
  content: string;
  done: boolean;
}