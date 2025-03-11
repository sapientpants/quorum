import type { LLMClient, ProviderCapabilities } from '../../types/llm'
import { OpenAIClient } from './openaiClient'
import { AnthropicClient } from './anthropicClient'
import { GrokClient } from './grokClient'
import { GoogleClient } from './googleClient'
import type { LLMProvider } from '../../types/llm'
import { LLMError, ErrorType } from './LLMError'
import type { Message } from '../../types/chat'

// Registry for LLM clients
const clientRegistry = new Map<string, () => Partial<LLMClient>>()
const clientCache: Record<string, LLMClient> = {}

/**
 * Register an LLM client factory for a provider
 * This allows for extending the system with new providers without modifying existing code
 */
export function registerLLMClient(
  provider: string, 
  factory: () => Partial<LLMClient>
): void {
  clientRegistry.set(provider.toLowerCase(), factory)
  
  // Clear cache for this provider if it exists
  if (clientCache[provider.toLowerCase()]) {
    delete clientCache[provider.toLowerCase()]
  }
}

/**
 * Get the appropriate LLM client based on the provider
 */
export function getLLMClient(provider: LLMProvider): LLMClient {
  const providerKey = provider.toLowerCase()
  
  // Return cached client if available
  if (clientCache[providerKey]) {
    return clientCache[providerKey]
  }
  
  // Check if client is registered
  const factory = clientRegistry.get(providerKey)
  
  if (factory) {
    // Create and enhance the client
    const baseClient = factory()
    const enhancedClient = createEnhancedClient(baseClient, provider)
    
    // Cache the enhanced client
    clientCache[providerKey] = enhancedClient
    
    return enhancedClient
  }
  
  throw new LLMError(
    ErrorType.INVALID_PROVIDER,
    `LLM client for provider ${provider} not implemented`
  )
}

/**
 * Create a client with enhanced capabilities
 * This is a helper function to create clients with consistent behavior
 */
export function createEnhancedClient(
  baseClient: Partial<LLMClient>,
  provider: LLMProvider
): LLMClient {
  // Ensure the base client has the required methods
  if (!baseClient.sendMessage || 
      !baseClient.getAvailableModels || 
      !baseClient.getDefaultModel || 
      !baseClient.getProviderName || 
      !baseClient.supportsStreaming) {
    throw new LLMError(
      ErrorType.INVALID_PROVIDER,
      `Invalid client implementation for provider ${provider}`
    )
  }
  
  // We've already checked that these methods exist, so we can safely use them
  const sendMessage = baseClient.sendMessage
  const getAvailableModels = baseClient.getAvailableModels
  const getDefaultModel = baseClient.getDefaultModel
  const getProviderName = baseClient.getProviderName
  const supportsStreaming = baseClient.supportsStreaming
  
  // Create the enhanced client
  const enhancedClient: LLMClient = {
    // Required methods from the base client
    sendMessage,
    getAvailableModels,
    getDefaultModel,
    getProviderName,
    supportsStreaming,
    
    // Add validateApiKey method if it doesn't exist
    validateApiKey: baseClient.validateApiKey || (async (apiKey: string) => {
      try {
        // Try to send a minimal message as validation
        const testMessage: Message = { 
          id: '1', 
          senderId: 'user', 
          text: 'test', 
          timestamp: Date.now() 
        }
        
        await sendMessage(
          [testMessage],
          apiKey,
          getDefaultModel(),
          { maxTokens: 1 }
        )
        return true
      } catch (error) {
        console.error(`Error validating API key for ${provider}:`, error)
        return false
      }
    }),
    
    // Add getCapabilities method if it doesn't exist
    getCapabilities: baseClient.getCapabilities || (() => {
      const capabilities: ProviderCapabilities = {
        supportsStreaming: supportsStreaming(),
        supportsSystemMessages: true,
        maxContextLength: 4000,
        supportsFunctionCalling: provider === 'openai',
        supportsVision: provider === 'openai' || provider === 'anthropic',
        supportsTool: provider === 'openai'
      }
      return capabilities
    })
  }
  
  return enhancedClient
}

// Register built-in clients
registerLLMClient('openai', () => new OpenAIClient())
registerLLMClient('anthropic', () => new AnthropicClient())
registerLLMClient('grok', () => new GrokClient())
registerLLMClient('google', () => new GoogleClient())