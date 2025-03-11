import type { Message } from '../../../types/chat'
import type { LLMSettings } from '../../../types/llm'
import type { LLMClient, StreamingOptions } from '../../../types/llm'
import type { ProviderCapabilities } from '../../../types/llm'
import type { StreamingResponse } from '../../../types/streaming'

export abstract class BaseClient implements LLMClient {
  protected abstract readonly providerName: string
  protected abstract readonly defaultModelName: string
  protected abstract readonly availableModels: string[]
  protected abstract readonly capabilities: ProviderCapabilities
  
  abstract sendMessage(
    messages: Message[],
    apiKey: string,
    model: string,
    settings?: LLMSettings,
    streamingOptions?: StreamingOptions,
    abortSignal?: AbortSignal
  ): Promise<string>
  
  abstract validateApiKey(apiKey: string): Promise<boolean>
  
  /**
   * Stream a message to the LLM and get a response as an async iterable
   * This is the new streaming method that uses AsyncIterable
   * 
   * Default implementation that uses the callback-based streaming
   * Subclasses should override this with a more efficient implementation
   */
  async *streamMessage(
    messages: Message[],
    apiKey: string,
    model: string,
    settings?: LLMSettings,
    abortSignal?: AbortSignal
  ): AsyncIterable<StreamingResponse> {
    try {
      // Create a promise that will be resolved when streaming is complete
      let resolveComplete: (value: string) => void
      let rejectComplete: (reason: Error) => void
      
      const completionPromise = new Promise<string>((resolve, reject) => {
        resolveComplete = resolve
        rejectComplete = reject
      })
      
      // Set up streaming options with callbacks that yield tokens
      const streamingOptions: StreamingOptions = {
        onToken: (token: string) => {
          // Yield the token
          this.yieldToken({ done: false, token })
        },
        onComplete: () => {
          // Resolve the completion promise with an empty string
          // The actual full text isn't needed here since we're streaming tokens
          resolveComplete('')
        },
        onError: (error: Error) => {
          // Reject the completion promise
          rejectComplete(error)
        }
      }
      
      // Start the streaming request
      this.sendMessage(
        messages,
        apiKey,
        model,
        settings,
        streamingOptions,
        abortSignal
      ).catch((error) => {
        if (rejectComplete) {
          rejectComplete(error instanceof Error ? error : new Error(String(error)))
        }
      })
      
      // Use a custom async iterator to yield tokens as they arrive
      let yieldResolve: ((value: IteratorResult<StreamingResponse>) => void) | null = null
      let yieldValue: StreamingResponse | null = null
      
      const iterator = {
        [Symbol.asyncIterator]() {
          return {
            next: async (): Promise<IteratorResult<StreamingResponse>> => {
              // If we have a value to yield, return it and clear it
              if (yieldValue) {
                const value = yieldValue
                yieldValue = null
                return { done: value.done, value }
              }
              
              // Otherwise, wait for the next value or completion
              try {
                // Create a promise that will be resolved when a new token arrives
                const nextValuePromise = new Promise<IteratorResult<StreamingResponse>>((resolve) => {
                  yieldResolve = resolve
                })
                
                // Race between the completion promise and the next value promise
                const result = await Promise.race([
                  completionPromise.then(() => ({ done: true, value: { done: true } })),
                  nextValuePromise
                ])
                
                return result
              } catch (error) {
                // If there's an error, yield it and mark as done
                return {
                  done: true,
                  value: {
                    done: true,
                    error: error instanceof Error ? error : new Error(String(error))
                  }
                }
              }
            }
          }
        }
      }
      
      // Helper method to yield tokens
      this.yieldToken = (value: StreamingResponse) => {
        if (yieldResolve) {
          yieldResolve({ done: value.done, value })
          yieldResolve = null
        } else {
          yieldValue = value
        }
      }
      
      // Yield tokens from the iterator
      yield* iterator
      
    } catch (error) {
      // If there's an error, yield it and mark as done
      yield {
        done: true,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }
  
  getAvailableModels(): string[] {
    return this.availableModels
  }
  
  getDefaultModel(): string {
    return this.defaultModelName
  }
  
  getProviderName(): string {
    return this.providerName
  }
  
  supportsStreaming(): boolean {
    return this.capabilities.supportsStreaming && 
           typeof ReadableStream !== 'undefined' && 
           typeof TextDecoder !== 'undefined'
  }
  
  getCapabilities(): ProviderCapabilities {
    return this.capabilities
  }
  
  /**
   * Helper method to handle API errors
   */
  protected handleApiError(error: unknown, provider: string): Error {
    if (error instanceof Error) {
      return error
    }
    
    return new Error(`${provider} API error: ${JSON.stringify(error)}`)
  }
  
  // Helper method for the streaming implementation
  private yieldToken: (value: StreamingResponse) => void = () => {}
}