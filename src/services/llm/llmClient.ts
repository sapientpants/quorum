import type { Message } from '../../types/chat'
import type { LLMSettings } from '../../types/api'
import { OpenAIClient } from './openaiClient'
import { AnthropicClient } from './anthropicClient'
import { GrokClient } from './grokClient'

export interface StreamingOptions {
  onToken?: (token: string) => void
  onComplete?: (fullText: string) => void
  onError?: (error: Error) => void
}

export interface LLMClient {
  /**
   * Send a message to the LLM and get a response
   * @param messages The conversation history
   * @param apiKey The API key for the provider
   * @param model The model to use
   * @param settings Additional settings for the request
   * @param streamingOptions Options for streaming responses
   * @returns The LLM's response text
   */
  sendMessage(
    messages: Message[],
    apiKey: string,
    model: string,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions
  ): Promise<string>

  /**
   * Get the available models for this provider
   * @returns An array of model identifiers
   */
  getAvailableModels(): string[]

  /**
   * Get the default model for this provider
   * @returns The default model identifier
   */
  getDefaultModel(): string

  /**
   * Get the provider name
   * @returns The provider name
   */
  getProviderName(): string

  /**
   * Check if this provider supports streaming
   * @returns Whether streaming is supported
   */
  supportsStreaming(): boolean
}

// Cache clients to avoid creating new instances for each request
const clientCache: Record<string, LLMClient> = {}

/**
 * Factory function to get the appropriate LLM client based on the provider
 * @param provider The LLM provider
 * @returns The LLM client for the provider
 */
export function getLLMClient(provider: string): LLMClient {
  // Return cached client if available
  if (clientCache[provider]) {
    return clientCache[provider]
  }

  // Create a new client based on the provider
  let client: LLMClient
  
  switch (provider.toLowerCase()) {
    case 'openai':
      client = new OpenAIClient()
      break
    case 'anthropic':
      client = new AnthropicClient()
      break
    case 'grok':
      client = new GrokClient()
      break
    default:
      throw new Error(`LLM client for provider ${provider} not implemented`)
  }
  
  // Cache the client for future use
  clientCache[provider] = client
  
  return client
} 