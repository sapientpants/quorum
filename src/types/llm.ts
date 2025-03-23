/**
 * LLM provider and model type definitions
 */

// Provider ID type (for backward compatibility)
export type LLMProviderId = "openai" | "anthropic" | "grok" | "google";

// LLM Provider interface
export interface LLMProvider {
  id: LLMProviderId;
  displayName: string;
  models: LLMModel[];
}

// Model types by provider
export type OpenAIModel = 
  | `gpt-4${string}` 
  | `gpt-3.5-turbo${string}` 
  | "gpt-4" 
  | "gpt-3.5-turbo" 
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4.5"
  | "o3-mini";

export type AnthropicModel = 
  | `claude-${number}.${number}-${string}` 
  | "claude-3-opus" 
  | "claude-3-sonnet"
  | "claude-3.5-sonnet"
  | "claude-3.5-haiku"
  | "claude-3.7-sonnet";

export type GoogleModel = 
  | `gemini-${number}.${number}-${string}` 
  | "gemini-pro"
  | "gemini-2.0-pro"
  | "gemini-2.0-flash";

export type GrokModel = 
  | `grok-${number}` 
  | "grok-2" 
  | "grok-3";

// Combined model type
export type LLMModel = OpenAIModel | AnthropicModel | GoogleModel | GrokModel;

// Provider-specific model constants
const OPENAI_MODELS: OpenAIModel[] = [
  "gpt-4.5",
  "o3-mini",
  "gpt-4o",
  "gpt-4o-mini",
];
const ANTHROPIC_MODELS: AnthropicModel[] = [
  "claude-3.7-sonnet",
  "claude-3.5-sonnet",
  "claude-3.5-haiku",
];
const GROK_MODELS: GrokModel[] = ["grok-2", "grok-3"];
export const GOOGLE_MODELS: GoogleModel[] = [
  "gemini-2.0-pro",
  "gemini-2.0-flash",
];

// LLM Provider definitions
export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: "openai",
    displayName: "OpenAI",
    models: OPENAI_MODELS,
  },
  {
    id: "anthropic",
    displayName: "Anthropic",
    models: ANTHROPIC_MODELS,
  },
  {
    id: "grok",
    displayName: "Grok",
    models: GROK_MODELS,
  },
  {
    id: "google",
    displayName: "Google",
    models: GOOGLE_MODELS,
  },
];

// LLM settings interface
export interface LLMSettings {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// Streaming options
export interface StreamingOptions {
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

// Provider capabilities
export interface ProviderCapabilities {
  supportsStreaming: boolean;
  supportsSystemMessages: boolean;
  maxContextLength: number;
  supportsFunctionCalling?: boolean;
  supportsVision?: boolean;
  supportsTool?: boolean;
}

// Import streaming types
import { StreamingResponse } from "./streaming";
import type { Message } from "./chat";

// LLM Client interface
export interface LLMClient {
  /**
   * Send a message to the LLM and get a response
   */
  sendMessage(
    messages: Message[],
    apiKey: string,
    model: LLMModel,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions,
    abortSignal?: AbortSignal,
  ): Promise<string>;

  /**
   * Stream a message to the LLM and get a response as an async iterable
   */
  streamMessage?(
    messages: Message[],
    apiKey: string,
    model: LLMModel,
    settings?: LLMSettings,
    abortSignal?: AbortSignal,
  ): AsyncIterable<StreamingResponse>;

  /**
   * Get the available models for this provider
   */
  getAvailableModels(): LLMModel[];

  /**
   * Get the default model for this provider
   */
  getDefaultModel(): LLMModel;

  /**
   * Get the provider name
   */
  getProviderName(): string;

  /**
   * Check if this provider supports streaming
   */
  supportsStreaming(): boolean;

  /**
   * Validate an API key
   */
  validateApiKey(apiKey: string): Promise<boolean>;

  /**
   * Get provider capabilities
   */
  getCapabilities(): ProviderCapabilities;
}
