import type { Message } from '../../types/chat'
import type { LLMClient, StreamingOptions } from './llmClient'
import type { LLMSettings, OpenAIModel } from '../../types/api'

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIRequest {
  model: string
  messages: OpenAIMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stream?: boolean
}

interface OpenAIResponse {
  id: string
  object: string
  created: number
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

interface OpenAIStreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    delta: {
      content?: string
    }
    finish_reason: string | null
  }[]
}

export class OpenAIClient implements LLMClient {
  private readonly availableModels: OpenAIModel[] = [
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-3.5-turbo'
  ]

  private readonly defaultModel: OpenAIModel = 'gpt-4o'

  // Convert our app's message format to OpenAI's format
  private convertToOpenAIMessages(messages: Message[]): OpenAIMessage[] {
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
      throw new Error('OpenAI API key is required')
    }
    
    const openAIMessages = this.convertToOpenAIMessages(messages)
    
    const requestBody: OpenAIRequest = {
      model,
      messages: openAIMessages,
      temperature: settings?.temperature,
      max_tokens: settings?.maxTokens,
      top_p: settings?.topP,
      frequency_penalty: settings?.frequencyPenalty,
      presence_penalty: settings?.presencePenalty
    }
    
    try {
      // Check if streaming is supported in the browser and streaming options are provided
      const isStreamingSupported = typeof ReadableStream !== 'undefined' && 
                                  typeof TextDecoder !== 'undefined'
      
      if (isStreamingSupported && streamingOptions) {
        return await this.streamResponse(requestBody, apiKey, streamingOptions)
      } else {
        return await this.standardResponse(requestBody, apiKey)
      }
    } catch (error) {
      if (streamingOptions?.onError && error instanceof Error) {
        streamingOptions.onError(error)
      }
      console.error('Error calling OpenAI API:', error)
      throw error
    }
  }

  private async standardResponse(requestBody: OpenAIRequest, apiKey: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
    }
    
    const data: OpenAIResponse = await response.json()
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenAI')
    }
    
    return data.choices[0].message.content
  }

  private async streamResponse(
    requestBody: OpenAIRequest, 
    apiKey: string,
    streamingOptions: StreamingOptions
  ): Promise<string> {
    // Set streaming to true for the request
    requestBody.stream = true
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
    }
    
    if (!response.body) {
      throw new Error('Response body is null')
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let result = ''
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk
          .split('\n')
          .filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6) // Remove 'data: ' prefix
              const json: OpenAIStreamChunk = JSON.parse(jsonStr)
              
              if (json.choices && json.choices.length > 0 && json.choices[0].delta.content) {
                const token = json.choices[0].delta.content
                result += token
                
                // Call the onToken callback if provided
                if (streamingOptions.onToken) {
                  streamingOptions.onToken(token)
                }
              }
            } catch (e) {
              console.warn('Error parsing JSON from stream:', e)
            }
          }
        }
      }
      
      // Call the onComplete callback if provided
      if (streamingOptions.onComplete) {
        streamingOptions.onComplete(result)
      }
      
      return result
    } catch (error) {
      console.error('Error reading stream:', error)
      throw error
    } finally {
      reader.releaseLock()
    }
  }

  getAvailableModels(): string[] {
    return this.availableModels
  }

  getDefaultModel(): string {
    return this.defaultModel
  }

  getProviderName(): string {
    return 'openai'
  }

  supportsStreaming(): boolean {
    return typeof ReadableStream !== 'undefined' && typeof TextDecoder !== 'undefined'
  }
} 