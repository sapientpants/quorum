import type { Message } from '../../types/chat'
import type { LLMClient, StreamingOptions } from './llmClient'
import type { LLMSettings, GrokModel } from '../../types/llm'

// Provider-specific error types
export class GrokError extends Error {
  constructor(message: string, public code?: string, public details?: unknown) {
    super(message)
    this.name = 'GrokError'
  }
}

class GrokAuthError extends GrokError {
  constructor(message = 'Invalid or missing API key') {
    super(message, 'auth_error')
    this.name = 'GrokAuthError'
  }
}

class GrokRateLimitError extends GrokError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 'rate_limit_error')
    this.name = 'GrokRateLimitError'
  }
}

class GrokModelError extends GrokError {
  constructor(message = 'Invalid model or model not available') {
    super(message, 'model_error')
    this.name = 'GrokModelError'
  }
}

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
  private readonly supportedModels: GrokModel[] = [
    'grok-3',
    'grok-2'
  ]

  private readonly defaultModel: GrokModel = 'grok-3'

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
      throw new GrokAuthError()
    }

    if (!this.supportedModels.includes(model as GrokModel)) {
      throw new GrokModelError(`Model ${model} is not available. Available models: ${this.supportedModels.join(', ')}`)
    }
    
    const grokMessages = this.convertToGrokMessages(messages)
    
    const requestBody: GrokRequest = {
      model,
      messages: grokMessages,
      temperature: settings?.temperature,
      max_tokens: settings?.maxTokens,
      top_p: settings?.topP,
      stream: !!streamingOptions
    }
    
    try {
      if (this.supportsStreaming() && streamingOptions) {
        return await this.streamResponse(requestBody, apiKey, streamingOptions)
      } else {
        return await this.standardResponse(requestBody, apiKey)
      }
    } catch (error) {
      // Convert generic errors to Grok-specific errors
      const grokError = this.handleError(error)
      
      if (streamingOptions?.onError) {
        streamingOptions.onError(grokError)
      }
      
      throw grokError
    }
  }

  private handleError(error: unknown): GrokError {
    if (error instanceof GrokError) {
      return error
    }

    const errorMessage = error instanceof Error ? error.message : String(error)

    // Handle common error cases
    if (errorMessage.includes('401') || errorMessage.includes('403')) {
      return new GrokAuthError('Invalid or expired API key')
    }
    if (errorMessage.includes('429')) {
      return new GrokRateLimitError('Too many requests. Please try again later')
    }
    if (errorMessage.includes('404')) {
      return new GrokModelError('The requested model is not available')
    }

    // Generic error case
    return new GrokError(
      'An error occurred while calling the Grok API: ' + errorMessage,
      'unknown_error',
      error
    )
  }

  private async streamResponse(
    requestBody: GrokRequest,
    apiKey: string,
    streamingOptions: StreamingOptions
  ): Promise<string> {
    let response: Response
    try {
      response = await fetch('https://api.grok.x/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ ...requestBody, stream: true })
      })
    } catch (error) {
      throw this.handleError(error)
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw this.handleError(new Error(`${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`))
    }

    if (!response.body) {
      throw new GrokError('No response body from Grok')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim() !== '')

        for (const line of lines) {
          if (!line.startsWith('data:') || line.includes('[DONE]')) continue

          try {
            const data = JSON.parse(line.slice(5))
            const content = data.choices[0]?.delta?.content || ''

            if (content) {
              fullText += content
              if (streamingOptions.onToken) {
                streamingOptions.onToken(content)
              }
            }
          } catch (e) {
            console.warn('Error parsing streaming response line:', e)
          }
        }
      }
    } catch (error) {
      throw this.handleError(error)
    } finally {
      reader.releaseLock()
    }

    if (streamingOptions.onComplete) {
      streamingOptions.onComplete(fullText)
    }

    return fullText
  }

  private async standardResponse(requestBody: GrokRequest, apiKey: string): Promise<string> {
    let response: Response
    try {
      response = await fetch('https://api.grok.x/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      })
    } catch (error) {
      throw this.handleError(error)
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw this.handleError(new Error(`${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`))
    }

    const data: GrokResponse = await response.json()

    if (!data.choices || data.choices.length === 0) {
      throw new GrokError('No response from Grok')
    }

    return data.choices[0].message.content
  }

  getAvailableModels(): string[] {
    return this.supportedModels
  }

  getDefaultModel(): string {
    return this.defaultModel
  }

  getProviderName(): string {
    return 'grok'
  }

  supportsStreaming(): boolean {
    return typeof ReadableStream !== 'undefined' && typeof TextDecoder !== 'undefined'
  }
} 