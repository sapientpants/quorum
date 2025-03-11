import type { LLMClient, ProviderCapabilities } from './types'
import { OpenAIClient } from './openaiClient'
import { AnthropicClient } from './anthropicClient'
import { GrokClient } from './grokClient'
import { GoogleClient } from './googleClient'
import type { LLMProvider } from '../../types/llm'

// Cache clients to avoid creating new instances for each request
const clientCache: Record<string, LLMClient> = {}

/**
 * Factory function to get the appropriate LLM client based on the provider
 */
export function getLLMClient(provider: LLMProvider): LLMClient {
  // Return cached client if available
  if (clientCache[provider]) {
    return clientCache[provider]
  }
  
  // Create a new client based on the provider
  let baseClient;
  
  switch (provider.toLowerCase()) {
    case 'openai':
      baseClient = new OpenAIClient()
      break
    case 'anthropic':
      baseClient = new AnthropicClient()
      break
    case 'grok':
      baseClient = new GrokClient()
      break
    case 'google':
      baseClient = new GoogleClient()
      break
    default:
      throw new Error(`LLM client for provider ${provider} not implemented`)
  }
  
  // Enhance the client with the missing methods
  const client = {
    ...baseClient,
    
    // Add validateApiKey method if it doesn't exist
    validateApiKey: (baseClient as Partial<LLMClient>).validateApiKey || (async (apiKey: string) => {
      try {
        // Try to send a minimal message as validation
        await baseClient.sendMessage(
          [{ id: '1', senderId: 'user', text: 'test', timestamp: Date.now() }],
          apiKey,
          baseClient.getDefaultModel(),
          { maxTokens: 1 }
        )
        return true
      } catch (error) {
        console.error(`Error validating API key for ${provider}:`, error)
        return false
      }
    }),
    
    // Add getCapabilities method if it doesn't exist
    getCapabilities: (baseClient as Partial<LLMClient>).getCapabilities || (() => {
      const capabilities: ProviderCapabilities = {
        supportsStreaming: baseClient.supportsStreaming(),
        supportsSystemMessages: true,
        maxContextLength: 4000,
        supportsFunctionCalling: provider === 'openai',
        supportsVision: provider === 'openai' || provider === 'anthropic',
        supportsTool: provider === 'openai'
      }
      return capabilities
    })
  } as LLMClient
  
  // Cache the enhanced client for future use
  clientCache[provider] = client
  
  return client
}

/**
 * Register a custom LLM client for a provider
 * This allows for extending the system with new providers without modifying existing code
 */
export function registerLLMClient(provider: string, client: LLMClient): void {
  clientCache[provider.toLowerCase()] = client
}