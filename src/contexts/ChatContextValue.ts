import { createContext } from 'react'
import type { Message } from '../types/chat'
import type { LLMProvider, LLMModel, LLMSettings } from '../types/llm'

/**
 * Chat context value interface
 */
export interface ChatContextValue {
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
export const ChatContext = createContext<ChatContextValue | undefined>(undefined)