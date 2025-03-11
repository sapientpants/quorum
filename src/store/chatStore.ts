import { create } from 'zustand'
import type { Message } from '../types/chat'
import type { LLMProvider, LLMModel, LLMSettings } from '../types/llm'
import { nanoid } from 'nanoid'

interface ChatState {
  // Messages
  messages: Message[]
  isLoading: boolean
  error: string | null
  
  // Provider and model selection
  activeProvider: LLMProvider | null
  activeModel: LLMModel | null
  availableModels: string[]
  apiKeys: Record<string, string>
  
  // Settings
  settings: LLMSettings
  useStreaming: boolean
  
  // Actions
  setActiveProvider: (provider: LLMProvider | null) => void
  setActiveModel: (model: LLMModel | null) => void
  setAvailableModels: (models: string[]) => void
  setApiKey: (provider: string, apiKey: string) => void
  setSettings: (settings: LLMSettings) => void
  setUseStreaming: (useStreaming: boolean) => void
  
  addUserMessage: (text: string) => Message | null
  addAIMessage: (provider: LLMProvider, model: string) => string
  updateAIMessage: (messageId: string, updates: Partial<Message>) => void
  removeMessage: (messageId: string) => void
  
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  reset: () => void
}

/**
 * Create a Zustand store for chat state
 */
export const useChatStore = create<ChatState>((set) => ({
  // Messages
  messages: [
    {
      id: '1',
      senderId: 'system',
      text: 'Welcome to Quorum! Please select a provider and add an API key to start chatting.',
      timestamp: Date.now()
    }
  ],
  isLoading: false,
  error: null,
  
  // Provider and model selection
  activeProvider: null,
  activeModel: null,
  availableModels: [],
  apiKeys: {},
  
  // Settings
  settings: {
    temperature: 0.7,
    maxTokens: 1000
  },
  useStreaming: true,
  
  // Actions
  setActiveProvider: (provider) => set({ activeProvider: provider }),
  setActiveModel: (model) => set({ activeModel: model }),
  setAvailableModels: (models) => set({ availableModels: models }),
  setApiKey: (provider, apiKey) => set((state) => ({
    apiKeys: { ...state.apiKeys, [provider]: apiKey }
  })),
  setSettings: (settings) => set({ settings }),
  setUseStreaming: (useStreaming) => set({ useStreaming }),
  
  addUserMessage: (text) => {
    if (!text.trim()) return null
    
    const userMessage: Message = {
      id: nanoid(),
      senderId: 'user',
      text,
      timestamp: Date.now()
    }
    
    set((state) => ({
      messages: [...state.messages, userMessage]
    }))
    
    return userMessage
  },
  
  addAIMessage: (provider, model) => {
    const aiMessageId = nanoid()
    const aiPlaceholder: Message = {
      id: aiMessageId,
      senderId: 'assistant',
      text: '',
      timestamp: Date.now(),
      provider,
      model,
      status: 'sending'
    }
    
    set((state) => ({
      messages: [...state.messages, aiPlaceholder]
    }))
    
    return aiMessageId
  },
  
  updateAIMessage: (messageId, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    }))
  },
  
  removeMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId)
    }))
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  reset: () => set({
    messages: [
      {
        id: '1',
        senderId: 'system',
        text: 'Welcome to Quorum! Please select a provider and add an API key to start chatting.',
        timestamp: Date.now()
      }
    ],
    isLoading: false,
    error: null,
    activeProvider: null,
    activeModel: null,
    availableModels: []
  })
}))

/**
 * Create a hook for chat actions that use the store
 */
export function useChatActions() {
  const {
    messages,
    activeProvider,
    activeModel,
    apiKeys,
    settings,
    useStreaming,
    addUserMessage,
    addAIMessage,
    updateAIMessage,
    setLoading,
    setError,
    clearError
  } = useChatStore()
  
  /**
   * Handle retrying a failed message
   */
  const handleRetry = (messageId: string, sendMessageFn: (text: string) => void) => {
    // Find the message to retry
    const messageToRetry = messages.find((msg) => msg.id === messageId)
    if (!messageToRetry || messageToRetry.status !== 'error') return
    
    // Find the last user message before this one
    const userMessages = messages.filter((msg) => msg.senderId === 'user')
    const lastUserMessage = userMessages[userMessages.length - 1]
    
    if (lastUserMessage) {
      // Remove the error message
      useChatStore.getState().removeMessage(messageId)
      
      // Resend the last user message
      sendMessageFn(lastUserMessage.text)
    }
  }
  
  return {
    handleRetry,
    
    // Re-export store values and actions for convenience
    messages,
    activeProvider,
    activeModel,
    apiKeys,
    settings,
    useStreaming,
    addUserMessage,
    addAIMessage,
    updateAIMessage,
    setLoading,
    setError,
    clearError
  }
}