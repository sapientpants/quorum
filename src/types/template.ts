import { z } from 'zod'
import type { Participant } from './participant'

/**
 * Template interface for storing round table configurations
 */
export interface Template {
  id: string
  name: string
  description: string
  participantIds: string[] // IDs of participants in order
  defaultConversationStarter?: string // Optional initial message to start the conversation
  createdAt: number
  updatedAt: number
}

/**
 * Template with expanded participant data
 */
export interface TemplateWithParticipants extends Omit<Template, 'participantIds'> {
  participants: Participant[]
}

/**
 * Zod schema for template validation
 */
export const templateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  participantIds: z.array(z.string()).min(1, 'At least one participant is required'),
  defaultConversationStarter: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number()
})

/**
 * Type for template creation form data
 */
export type TemplateFormData = Omit<Template, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Helper function to create a new template
 */
export function createTemplate(data: Partial<Template> & Pick<Template, 'name'>): Template {
  const now = Date.now()
  
  return {
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description || '',
    participantIds: data.participantIds || [],
    defaultConversationStarter: data.defaultConversationStarter,
    createdAt: now,
    updatedAt: now
  }
} 