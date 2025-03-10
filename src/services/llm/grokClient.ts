import type { Message } from '../../types/chat'
import type { LLMClient, StreamingOptions } from './llmClient'
import type { LLMSettings, GrokModel } from '../../types/api'

interface GrokMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GrokRequest {
  model: string
  messages: GrokMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  stream?: boolean
}

interface GrokResponse {
  id: string
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class GrokClient implements LLMClient {
  private readonly availableModels: GrokModel[] = [
    'grok-1',
    'grok-1-mini'
  ]

  private readonly defaultModel: GrokModel = 'grok-1'

  // Convert our app's message format to Grok's format
  private convertToGrokMessages(messages: Message[]): GrokMessage[] {
    return messages.map(message => {
      // Determine the role based on senderId
      let role: 'system' | 'user' | 'assistant'
      
      if (message.senderId === 'user') {
        role = 'user'
      } else if (message.senderId === 'system') {
        role = 'system'
      } else {
        role = 'assistant'
      }
      
      return {
        role,
        content: message.text
      }
    })
  }

  async sendMessage(
    messages: Message[],
    apiKey: string,
    model: string = this.defaultModel,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions
  ): Promise<string> {
    if (!apiKey) {
      throw new Error('Grok API key is required')
    }
    
    const grokMessages = this.convertToGrokMessages(messages)
    
    const requestBody: GrokRequest = {
      model,
      messages: grokMessages,
      temperature: settings?.temperature,
      max_tokens: settings?.maxTokens,
      top_p: settings?.topP
    }
    
    try {
      // Grok streaming is not implemented yet
      return await this.standardResponse(requestBody, apiKey)
    } catch (error) {
      if (streamingOptions?.onError && error instanceof Error) {
        streamingOptions.onError(error)
      }
      console.error('Error calling Grok API:', error)
      throw error
    }
  }

  private async standardResponse(requestBody: GrokRequest, apiKey: string): Promise<string> {
    const response = await fetch('https://api.grok.x/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Grok API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
    }
    
    const data: GrokResponse = await response.json()
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Grok')
    }
    
    return data.choices[0].message.content
  }

  getAvailableModels(): string[] {
    return this.availableModels
  }

  getDefaultModel(): string {
    return this.defaultModel
  }

  getProviderName(): string {
    return 'grok'
  }

  supportsStreaming(): boolean {
    return false // Grok streaming not implemented yet
  }
} 