import type { LLMProviderId, LLMModel } from './llm'

export interface Message {
  id: string
  senderId: string // 'user' or LLM identifier
  text: string
  timestamp: number
  provider?: LLMProviderId
  model?: LLMModel
  role?: string // Optional role description for the LLM
  status?: 'sending' | 'sent' | 'error'
  error?: Error
}
