export interface Message {
  id: string
  senderId: string // 'user' or LLM identifier
  text: string
  timestamp: number
  provider?: string // 'openai', 'anthropic', etc.
  model?: string // 'gpt-4o', 'claude-3.7-sonnet', etc.
  role?: string // Optional role description for the LLM
}

export interface ChatProps {
  initialMessages?: Message[]
  id?: string
} 