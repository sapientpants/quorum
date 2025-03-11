import { createContext, useContext, useCallback, ReactNode } from 'react'
import type { Message } from '../types/chat'
import type { LLMProvider, LLMModel, LLMSettings } from '../types/llm'
import { useChatState } from '../hooks/useChatState'
import { useProviderSelection } from '../hooks/useProviderSelection'
import { useSettings } from '../hooks/useSettings'
import { useStreamingLLM } from '../hooks/useStreamingLLM'
import { LLMError } from '../services/llm/LLMError'

/**
 * Chat context value interface
 */
interface ChatContextValue {
  // Messages
  messages: Message[]
  isLoading: boolean
  error: string | null
  
  // Provider and model selection
  activeProvider: LLMProvider | null
  setActiveProvider: (provider: LLMProvider | null) => void
  activeModel: LLMModel | null
  setActiveModel: (model: LLMModel | null) => void
  availableModels: string[]
  apiKeys: Record<string, string>
  handleApiKeyChange: (provider: string, apiKey: string) => void
  isProviderConfigured: (provider: LLMProvider) => boolean
  isStreamingSupported: () => boolean
  supportedProviders: LLMProvider[]
  
  // Settings
  settings: LLMSettings
  setSettings: (settings: LLMSettings) => void
  useStreaming: boolean
  setUseStreaming: (useStreaming: boolean) => void
  
  // Actions
  addUserMessage: (text: string) => Message | null
  sendMessage: (text: string) => Promise<void>
  handleRetry: (messageId: string) => void
  clearError: () => void
  abortStream: () => void
}

// Create the context with a default undefined value
const ChatContext = createContext<ChatContextValue | undefined>(undefined)

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
    if (!apiKeys[activeProvider]) {
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
          activeProvider,
          apiKeys[activeProvider],
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
            provider: activeProvider,
            apiKey: apiKeys[activeProvider],
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
      console.error(`Error calling ${activeProvider}:`, err)
      
      // Update the AI message with error
      updateAIMessage(aiMessageId, {
        text: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        status: 'error',
        error: err instanceof Error ? err : new Error('Unknown error')
      })
      
      setError(err instanceof Error ? err.message : `An error occurred while calling the ${activeProvider} API`)
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

/**
 * Hook to use the chat context
 */
export function useChat() {
  const context = useContext(ChatContext)
  
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  
  return context
}