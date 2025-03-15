import { useCallback, ReactNode } from 'react'
import { useChatState } from '../hooks/useChatState'
import { useProviderSelection } from '../hooks/useProviderSelection'
import { useSettings } from '../hooks/useSettings'
import { useStreamingLLM } from '../hooks/useStreamingLLM'
import { LLMError } from '../services/llm/LLMError'
import { ChatContext, ChatContextValue } from './ChatContextValue'

/**
 * Chat context provider component
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  // Use our custom hooks for state management
  const {
    messages,
    isLoading,
    setIsLoading,
    error,
    setError,
    addUserMessage,
    addAIMessage,
    updateAIMessage,
    handleRetry: handleMessageRetry,
    clearError
  } = useChatState()

  const {
    activeProvider,
    setActiveProvider,
    activeModel,
    setActiveModel,
    availableModels,
    apiKeys,
    handleApiKeyChange,
    isProviderConfigured,
    isStreamingSupported,
    getSupportedProvidersList
  } = useProviderSelection()

  const {
    settings,
    setSettings,
    useStreaming,
    setUseStreaming
  } = useSettings()
  
  const {
    streamMessage,
    abortStream
  } = useStreamingLLM()
  
  // Get all supported providers
  const supportedProviders = getSupportedProvidersList()
  
  // Handle sending a message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return
    
    // Clear any previous errors
    clearError()

    // Check if a provider is selected
    if (!activeProvider) {
      setError('Please select a provider to continue')
      return
    }

    // Check if API key is provided for the active provider
    if (activeProvider && !apiKeys[activeProvider.id]) {
      setError(`Please enter your ${activeProvider} API key to continue`)
      return
    }

    // Check if a model is selected
    if (!activeModel) {
      setError('Please select a model to continue')
      return
    }

    // Add user message
    const userMessage = addUserMessage(text)
    if (!userMessage) return
    
    // Add a placeholder for the AI response
    const aiMessageId = addAIMessage(activeProvider, activeModel)
    setIsLoading(true)
    
    try {
      // Check if streaming is supported and enabled
      const canStream = useStreaming && isStreamingSupported()
      
      if (canStream) {
        // Use streaming API with async iterables
        await streamMessage(
          [...messages, userMessage],
          activeProvider!.id,
          apiKeys[activeProvider!.id],
          activeModel,
          settings,
          {
            onToken: (token: string) => {
              updateAIMessage(aiMessageId, {
                text: messages.find(m => m.id === aiMessageId)?.text + token || token
              })
            },
            onComplete: () => {
              updateAIMessage(aiMessageId, {
                status: 'sent'
              })
              setIsLoading(false)
            },
            onError: (err: LLMError) => {
              updateAIMessage(aiMessageId, {
                text: `Error: ${err.message}`,
                status: 'error',
                error: err
              })
              setError(err.message)
              setIsLoading(false)
            }
          }
        )
      } else {
        // Use standard API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            provider: activeProvider.id,
            apiKey: apiKeys[activeProvider.id],
            model: activeModel,
            settings
          })
        })
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        
        // Update the AI response
        updateAIMessage(aiMessageId, {
          text: data.text,
          status: 'sent'
        })
        setIsLoading(false)
      }
    } catch (err) {
      console.error(`Error calling ${activeProvider?.id}:`, err)
      
      // Update the AI message with error
      updateAIMessage(aiMessageId, {
        text: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        status: 'error',
        error: err instanceof Error ? err : new Error('Unknown error')
      })
      
      setError(err instanceof Error ? err.message : `An error occurred while calling the ${activeProvider?.id} API`)
      setIsLoading(false)
    }
  }, [
    activeProvider,
    activeModel,
    apiKeys,
    messages,
    settings,
    useStreaming,
    isStreamingSupported,
    addUserMessage,
    addAIMessage,
    updateAIMessage,
    setIsLoading,
    setError,
    clearError,
    streamMessage
  ])
  
  // Handle retry for failed messages
  const handleRetry = useCallback((messageId: string) => {
    handleMessageRetry(messageId, sendMessage)
  }, [handleMessageRetry, sendMessage])
  
  // Create the context value
  const value: ChatContextValue = {
    // Messages
    messages,
    isLoading,
    error,
    
    // Provider and model selection
    activeProvider,
    setActiveProvider,
    activeModel,
    setActiveModel,
    availableModels,
    apiKeys,
    handleApiKeyChange,
    isProviderConfigured,
    isStreamingSupported,
    supportedProviders,
    
    // Settings
    settings,
    setSettings,
    useStreaming,
    setUseStreaming,
    
    // Actions
    addUserMessage,
    sendMessage,
    handleRetry,
    clearError,
    abortStream
  }
  
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
