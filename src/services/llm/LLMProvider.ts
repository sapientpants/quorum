import type { Message } from '../../types/chat'
import type { LLMProvider as ProviderType, LLMSettings } from '../../types/llm'
import type { StreamingOptions } from '../../types/llm'
import { createLLMProvider } from './createLLMProvider'
import { ApiKeyManager } from './ApiKeyManager'
import { 
  getAvailableModels as getModels, 
  getDefaultModel as getModel,
  getSupportedProviders as getProviders,
  supportsStreaming as checkStreaming
} from './index'

/**
 * @deprecated Use createLLMProvider instead
 */
export class LLMProvider {
  private provider = createLLMProvider()
  private apiKeyManager = new ApiKeyManager()
  
  async sendMessage(
    messages: Message[],
    provider: ProviderType,
    apiKey: string,
    model: string,
    systemPrompt: string = '',
    settings?: LLMSettings,
    options?: { streaming?: StreamingOptions }
  ): Promise<Message> {
    // Set the API key
    this.apiKeyManager.setKey(provider, apiKey)
    
    // Send the message
    const response = await this.provider.sendMessage(
      messages,
      {
        id: 'temp',
        name: provider,
        type: 'llm',
        provider,
        model,
        systemPrompt,
        settings: {
          temperature: settings?.temperature ?? 0.7,
          maxTokens: settings?.maxTokens ?? 1000
        }
      },
      options
    )
    
    if (response.success) {
      return response.data
    } else {
      throw response.error
    }
  }
  
  getAvailableModels(provider: ProviderType): string[] {
    // Use the exported function directly
    return getModels(provider)
  }
  
  getDefaultModel(provider: ProviderType): string {
    // Use the exported function directly
    return getModel(provider)
  }
  
  getSupportedProviders(): ProviderType[] {
    // Use the exported function directly
    return getProviders()
  }
  
  isProviderConfigured(provider: ProviderType): boolean {
    return this.provider.isProviderConfigured(provider)
  }
  
  supportsStreaming(provider: ProviderType): boolean {
    // Use the exported function directly
    return checkStreaming(provider)
  }
  
  validateApiKey(provider: ProviderType, apiKey: string): Promise<boolean> {
    return this.provider.validateApiKey(provider, apiKey).then(result => {
      if (result.success) {
        return result.data
      } else {
        console.error(result.error)
        return false
      }
    }).catch(error => {
      console.error(error)
      return false
    })
  }
  
  getApiKeyManager(): ApiKeyManager {
    return this.apiKeyManager
  }
}