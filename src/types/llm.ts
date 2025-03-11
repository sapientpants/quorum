/**
 * LLM provider and model type definitions
 */

// Provider types
export type LLMProvider = 'openai' | 'anthropic' | 'grok' | 'google'

// Model types by provider
export type OpenAIModel = 'gpt-4.5' | 'o3-mini' | 'gpt-4o' | 'gpt-4o-mini' | string
export type AnthropicModel = 'claude-3.7-sonnet' | 'claude-3.5-sonnet' | 'claude-3.5-haiku' | string
export type GrokModel = 'grok-2' | 'grok-3' | string
export type GoogleModel = 'gemini-2.0-pro' | 'gemini-2.0-flash' | string

// Combined model type
export type LLMModel = OpenAIModel | AnthropicModel | GrokModel | GoogleModel

// Provider-specific constants
export const OPENAI_MODELS: OpenAIModel[] = ['gpt-4.5', 'o3-mini', 'gpt-4o', 'gpt-4o-mini']
export const ANTHROPIC_MODELS: AnthropicModel[] = ['claude-3.7-sonnet', 'claude-3.5-sonnet', 'claude-3.5-haiku']
export const GROK_MODELS: GrokModel[] = ['grok-2', 'grok-3']
export const GOOGLE_MODELS: GoogleModel[] = ['gemini-2.0-pro', 'gemini-2.0-flash']

// All supported providers
export const SUPPORTED_PROVIDERS: LLMProvider[] = ['openai', 'anthropic', 'grok', 'google']

// Provider to models mapping
export const PROVIDER_MODELS: Record<LLMProvider, string[]> = {
  openai: OPENAI_MODELS,
  anthropic: ANTHROPIC_MODELS,
  grok: GROK_MODELS,
  google: GOOGLE_MODELS
}

// LLM settings interface
export interface LLMSettings {
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

// Streaming options
export interface StreamingOptions {
  onToken?: (token: string) => void
  onComplete?: (fullText: string) => void
  onError?: (error: Error) => void
}

// Provider capabilities
export interface ProviderCapabilities {
  supportsStreaming: boolean
  supportsSystemMessages: boolean
  maxContextLength: number
  supportsFunctionCalling?: boolean
  supportsVision?: boolean
  supportsTool?: boolean
}

// Import streaming types
import { StreamingResponse } from './streaming'
import type { Message } from './chat'

// LLM Client interface
export interface LLMClient {
  /**
   * Send a message to the LLM and get a response
   */
  sendMessage(
    messages: Message[],
    apiKey: string,
    model: string,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions,
    abortSignal?: AbortSignal
  ): Promise<string>
  
  /**
   * Stream a message to the LLM and get a response as an async iterable
   */
  streamMessage?(
    messages: Message[],
    apiKey: string,
    model: string,
    settings?: LLMSettings,
    abortSignal?: AbortSignal
  ): AsyncIterable<StreamingResponse>
  
  /**
   * Get the available models for this provider
   */
  getAvailableModels(): string[]
  
  /**
   * Get the default model for this provider
   */
  getDefaultModel(): string
  
  /**
   * Get the provider name
   */
  getProviderName(): string
  
  /**
   * Check if this provider supports streaming
   */
  supportsStreaming(): boolean
  
  /**
   * Validate an API key
   */
  validateApiKey(apiKey: string): Promise<boolean>
  
  /**
   * Get provider capabilities
   */
  getCapabilities(): ProviderCapabilities
}