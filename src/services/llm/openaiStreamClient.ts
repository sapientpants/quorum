import type { Message } from '../../types/chat'
import type { LLMSettings, StreamingOptions } from '../../types/llm'
import type { StreamingResponse } from '../../types/streaming'
import { BaseClient } from './clients/BaseClient'
import { LLMError, ErrorType } from './LLMError'

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

/**
 * OpenAI client with efficient streaming implementation
 */
export class OpenAIStreamClient extends BaseClient {
  protected readonly providerName = 'openai'
  protected readonly defaultModelName = 'gpt-4o'
  protected readonly availableModels = [
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-3.5-turbo'
  ]
  protected readonly capabilities = {
    supportsStreaming: true,
    supportsSystemMessages: true,
    maxContextLength: 8192,
    supportsFunctionCalling: true,
    supportsVision: true,
    supportsTool: true
  }

  constructor(config: Record<string, unknown> = {}) {
    super({ ...config });
  }

  protected getDefaultBaseUrl(): string {
    return 'https://api.openai.com/v1'
  }

  /**
   * Convert our app's message format to OpenAI's format
   */
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

  /**
   * Send a message to the LLM and get a response
   */
  async sendMessage(
    messages: Message[],
    apiKey: string,
    model: string = this.defaultModelName,
    settings?: LLMSettings,
    _streamingOptions?: StreamingOptions, // Renamed with underscore to indicate it's not used
    abortSignal?: AbortSignal
  ): Promise<string> {
    if (!apiKey) {
      throw new LLMError(ErrorType.MISSING_API_KEY, 'OpenAI API key is required')
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
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: abortSignal
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new LLMError(
        ErrorType.API_ERROR,
        `OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      )
    }
    
    const data = await response.json()
    
    if (!data.choices || data.choices.length === 0) {
      throw new LLMError(ErrorType.API_ERROR, 'No response from OpenAI')
    }
    
    return data.choices[0].message.content
  }

  /**
   * Validate an API key
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) {
      return false
    }
    
    try {
      // Make a minimal API call to check if the key is valid
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })
      
      return response.ok
    } catch (error) {
      console.error('Error validating OpenAI API key:', error)
      return false
    }
  }

  /**
   * Stream a message to the LLM and get a response as an async iterable
   */
  async *streamMessage(
    messages: Message[],
    apiKey: string,
    model: string = this.defaultModelName,
    settings?: LLMSettings,
    abortSignal?: AbortSignal
  ): AsyncIterable<StreamingResponse> {
    if (!apiKey) {
      yield {
        done: true,
        error: new LLMError(ErrorType.MISSING_API_KEY, 'OpenAI API key is required')
      }
      return
    }
    
    const openAIMessages = this.convertToOpenAIMessages(messages)
    
    const requestBody: OpenAIRequest = {
      model,
      messages: openAIMessages,
      temperature: settings?.temperature,
      max_tokens: settings?.maxTokens,
      top_p: settings?.topP,
      frequency_penalty: settings?.frequencyPenalty,
      presence_penalty: settings?.presencePenalty,
      stream: true // Always stream
    }
    
    try {
      // Check if streaming is supported in the browser
      const isStreamingSupported = typeof ReadableStream !== 'undefined' && 
                                  typeof TextDecoder !== 'undefined'
      
      if (!isStreamingSupported) {
        // Fall back to regular sendMessage if streaming is not supported
        const response = await this.sendMessage(messages, apiKey, model, settings)
        yield { done: false, token: response }
        yield { done: true }
        return
      }
      
      // Make the streaming request
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: abortSignal
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new LLMError(
          ErrorType.API_ERROR,
          `OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        )
      }
      
      if (!response.body) {
        throw new LLMError(ErrorType.API_ERROR, 'Response body is null')
      }
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            yield { done: true }
            return
          }
          
          const chunk = decoder.decode(value, { stream: true })
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
                  yield { done: false, token }
                }
              } catch (e) {
                console.warn('Error parsing JSON from stream:', e)
              }
            }
          }
        }
      } catch (error) {
        const typedError = error as Error
        if (typedError.name === 'AbortError') {
          yield { done: true, error: new LLMError(ErrorType.TIMEOUT, 'Request was aborted') }
        } else {
          yield { 
            done: true, 
            error: error instanceof Error 
              ? new LLMError(ErrorType.API_ERROR, error.message)
              : new LLMError(ErrorType.UNKNOWN, String(error))
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      yield { 
        done: true, 
        error: error instanceof Error 
          ? new LLMError(ErrorType.API_ERROR, error.message)
          : new LLMError(ErrorType.UNKNOWN, String(error))
      }
    }
  }

  async chat(
    messages: import('./types').LLMChatMessage[],
    config?: Partial<import('./types').LLMConfig>
  ): Promise<import('./types').LLMResponse> {
    const apiKey = config?.apiKey as string || this.apiKey;
    const model = config?.model as string || this.defaultModelName;
    const settings = config as import('../../types/llm').LLMSettings;
    const abortSignal = undefined;
    
    const content = await this.sendMessage(
      this.convertToMessages(messages), 
      apiKey, 
      model, 
      settings, 
      undefined, 
      abortSignal
    );
    
    return {
      content,
      model,
      provider: this.providerName
    };
  }

  async chatStream(
    messages: import('./types').LLMChatMessage[],
    onChunk: (chunk: string) => void,
    config?: Partial<import('./types').LLMConfig>
  ): Promise<import('./types').LLMResponse> {
    const apiKey = config?.apiKey as string || this.apiKey;
    const model = config?.model as string || this.defaultModelName;
    const settings = config as import('../../types/llm').LLMSettings;
    const abortSignal = undefined;
    
    let fullContent = '';
    
    const streamingOptions: import('../../types/llm').StreamingOptions = {
      onToken: (token) => {
        onChunk(token);
        fullContent += token;
      }
    };
    
    await this.sendMessage(
      this.convertToMessages(messages), 
      apiKey, 
      model, 
      settings, 
      streamingOptions, 
      abortSignal
    );
    
    return {
      content: fullContent,
      model,
      provider: this.providerName
    };
  }
  
  // Helper method to convert LLMChatMessage[] to Message[]
  private convertToMessages(messages: import('./types').LLMChatMessage[]): import('../../types/chat').Message[] {
    return messages.map((msg, index) => ({
      id: `msg-${index}`,
      senderId: msg.role,
      text: msg.content,
      timestamp: Date.now(),
      role: msg.role
    }));
  }
}