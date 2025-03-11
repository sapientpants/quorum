import { useState, useCallback } from 'react'
import { llmProvider } from '../services/llm/LLMProvider'
import type { LLMProvider } from '../types/llm'
import type { Message } from '../types/chat'
import type { Participant } from '../types/participant'
import { LLMError, ErrorType } from '../services/llm/LLMError'

export function useLLM() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<LLMError | null>(null)
  
  const sendMessage = useCallback(async (
    messages: Message[],
    participant: Participant,
    options?: {
      onStart?: () => void
      onToken?: (token: string) => void
      onComplete?: (message: Message) => void
      onError?: (error: LLMError) => void
      abortSignal?: AbortSignal
    }
  ) => {
    if (participant.type !== 'llm') {
      const error = new LLMError(
        ErrorType.INVALID_PROVIDER,
        'Participant must be an LLM'
      )
      setError(error)
      options?.onError?.(error)
      return null
    }
    
    setIsLoading(true)
    setError(null)
    options?.onStart?.()
    
    try {
      const response = await llmProvider.sendMessage(
        messages,
        participant,
        {
          streaming: options?.onToken ? {
            onToken: options.onToken,
            onComplete: () => {},
            onError: (err) => {
              const llmError = err instanceof LLMError 
                ? err 
                : new LLMError(ErrorType.API_ERROR, err.message)
              setError(llmError)
              options?.onError?.(llmError)
            }
          } : undefined,
          abortSignal: options?.abortSignal
        }
      )
      
      options?.onComplete?.(response)
      return response
    } catch (err) {
      const llmError = err instanceof LLMError 
        ? err 
        : new LLMError(ErrorType.API_ERROR, err instanceof Error ? err.message : 'Unknown error')
      
      setError(llmError)
      options?.onError?.(llmError)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const validateApiKey = useCallback(async (
    provider: LLMProvider,
    apiKey: string
  ) => {
    try {
      return await llmProvider.validateApiKey(provider, apiKey)
    } catch (error) {
      console.error('Error validating API key:', error)
      return false
    }
  }, [])
  
  return {
    isLoading,
    error,
    sendMessage,
    validateApiKey,
    getAvailableModels: useCallback((provider: LLMProvider) => 
      llmProvider.getAvailableModels(provider), []),
    getSupportedProviders: useCallback(() => 
      llmProvider.getSupportedProviders(), []),
    supportsStreaming: useCallback((provider: LLMProvider) => 
      llmProvider.supportsStreaming(provider), []),
    apiKeyManager: llmProvider.getApiKeyManager()
  }
}