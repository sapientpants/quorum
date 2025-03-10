import { z } from 'zod'

export type ParticipantType = 'human' | 'llm'
export type LLMProvider = 'openai' | 'anthropic' | 'grok'

export interface BaseParticipant {
  id: string
  name: string
  type: ParticipantType
}

export interface HumanParticipant extends BaseParticipant {
  type: 'human'
}

export interface LLMParticipant extends BaseParticipant {
  type: 'llm'
  provider: LLMProvider
  model: string
  roleDescription: string
  systemPrompt: string
  settings: {
    temperature: number
    maxTokens: number
  }
}

export type Participant = HumanParticipant | LLMParticipant

// Zod schemas for validation
export const baseParticipantSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(['human', 'llm'])
})

export const humanParticipantSchema = baseParticipantSchema.extend({
  type: z.literal('human')
})

export const llmParticipantSchema = baseParticipantSchema.extend({
  type: z.literal('llm'),
  provider: z.enum(['openai', 'anthropic', 'grok']),
  model: z.string(),
  roleDescription: z.string(),
  systemPrompt: z.string(),
  settings: z.object({
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().positive()
  })
})

export const participantSchema = z.discriminatedUnion('type', [
  humanParticipantSchema,
  llmParticipantSchema
])

// Helper function to create a new participant
export function createParticipant(data: Partial<Participant> & Pick<Participant, 'id' | 'name' | 'type'>): Participant {
  if (data.type === 'human') {
    return {
      id: data.id,
      name: data.name,
      type: 'human'
    }
  }

  return {
    id: data.id,
    name: data.name,
    type: 'llm',
    provider: data.provider || 'openai',
    model: data.model || 'gpt-4',
    roleDescription: data.roleDescription || '',
    systemPrompt: data.systemPrompt || '',
    settings: {
      temperature: data.settings?.temperature || 0.7,
      maxTokens: data.settings?.maxTokens || 1000
    }
  }
} 