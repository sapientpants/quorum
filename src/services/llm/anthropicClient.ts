import type { Message } from '../../types/chat'
import type { LLMClient, StreamingOptions } from './llmClient'
import type { LLMSettings, AnthropicModel } from '../../types/api'

interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AnthropicRequest {
  model: string
  messages: AnthropicMessage[]
  system?: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  stream?: boolean
}

interface AnthropicResponse {
  id: string
  type: string
  model: string
  content: {
    type: string
    text: string
  }[]
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export class AnthropicClient implements LLMClient {
  private readonly availableModels: AnthropicModel[] = [
    'claude-3-opus',
    'claude-3-sonnet',
    'claude-3-haiku'
  ]

  private readonly defaultModel: AnthropicModel = 'claude-3-sonnet'

  // Convert our app's message format to Anthropic's format
  private convertToAnthropicMessages(messages: Message[]): { 
    messages: AnthropicMessage[], 
    system?: string 
  } {
    // Extract system message if present
    const systemMessage = messages.find(m => m.senderId === 'system')
    const systemPrompt = systemMessage?.text

    // Filter out system messages and convert the rest
    const anthropicMessages = messages
      .filter(m => m.senderId !== 'system')
      .map(message => {
        const role = message.senderId === 'user' ? 'user' : 'assistant'
        return {
          role,
          content: message.text
        }
      })

    return {
      messages: anthropicMessages,
      system: systemPrompt
    }
  }

  async sendMessage(
    messages: Message[],
    apiKey: string,
    model: string = this.defaultModel,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions
  ): Promise<string> {
    if (!apiKey) {
      throw new Error('Anthropic API key is required')
    }
    
    const { messages: anthropicMessages, system } = this.convertToAnthropicMessages(messages)
    
    const requestBody: AnthropicRequest = {
      model,
      messages: anthropicMessages,
      system,
      max_tokens: settings?.maxTokens || 1000,
      temperature: settings?.temperature,
      top_p: settings?.topP
    }
    
    try {
      // Anthropic streaming is not implemented yet
      return await this.standardResponse(requestBody, apiKey)
    } catch (error) {
      if (streamingOptions?.onError && error instanceof Error) {
        streamingOptions.onError(error)
      }
      console.error('Error calling Anthropic API:', error)
      throw error
    }
  }

  private async standardResponse(requestBody: AnthropicRequest, apiKey: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
    }
    
    const data: AnthropicResponse = await response.json()
    
    if (!data.content || data.content.length === 0) {
      throw new Error('No response from Anthropic')
    }
    
    return data.content[0].text
  }

  getAvailableModels(): string[] {
    return this.availableModels
  }

  getDefaultModel(): string {
    return this.defaultModel
  }

  getProviderName(): string {
    return 'anthropic'
  }

  supportsStreaming(): boolean {
    return false // Anthropic streaming not implemented yet
  }
} 