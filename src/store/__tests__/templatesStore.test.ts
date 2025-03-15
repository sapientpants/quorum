import { act } from '@testing-library/react'
import { vi } from 'vitest'
import { useTemplatesStore } from '../templatesStore'
import type { LLMProviderId } from '../../types/llm'

// Mock crypto.randomUUID
const mockRandomUUID = vi.fn().mockReturnValue('test-uuid')
Object.defineProperty(crypto, 'randomUUID', { value: mockRandomUUID })

// Mock Date.now
const mockDate = 1615554000000 // March 12, 2021
vi.spyOn(Date, 'now').mockImplementation(() => mockDate)

describe('templatesStore', () => {
  // Get a reference to the store
  const store = useTemplatesStore.getState()
  
  beforeEach(() => {
    // Reset the store state before each test
    act(() => {
      // First get the current state
      const currentState = useTemplatesStore.getState();
      // Then use a partial update to only reset the templates array
      useTemplatesStore.setState({ ...currentState, templates: [] });
    })
  })
  
  test('should add a template', () => {
    act(() => {
      store.addTemplate({
        name: 'Test Template',
        description: 'Test Description',
        participantIds: ['1', '2'],
        defaultConversationStarter: 'Hello'
      })
    })
    
    expect(useTemplatesStore.getState().templates).toHaveLength(1)
    expect(useTemplatesStore.getState().templates[0]).toEqual({
      id: 'test-uuid',
      name: 'Test Template',
      description: 'Test Description',
      participantIds: ['1', '2'],
      defaultConversationStarter: 'Hello',
      createdAt: mockDate,
      updatedAt: mockDate
    })
  })
  
  test('should update a template', () => {
    const templateId = 'test-uuid'
    
    // First add a template
    act(() => {
      store.addTemplate({
        name: 'Test Template',
        description: 'Test Description',
        participantIds: ['1', '2'],
        defaultConversationStarter: 'Hello'
      })
    })
    
    expect(useTemplatesStore.getState().templates).toHaveLength(1)
    
    // Then update it
    act(() => {
      store.updateTemplate(templateId, {
        name: 'Updated Template',
        description: 'Updated Description'
      })
    })
    
    expect(useTemplatesStore.getState().templates).toHaveLength(1)
    expect(useTemplatesStore.getState().templates[0]).toEqual({
      id: templateId,
      name: 'Updated Template',
      description: 'Updated Description',
      participantIds: ['1', '2'],
      defaultConversationStarter: 'Hello',
      createdAt: mockDate,
      updatedAt: mockDate
    })
  })
  
  test('should remove a template', () => {
    const templateId = 'test-uuid'
    
    // First add a template
    act(() => {
      store.addTemplate({
        name: 'Test Template',
        description: 'Test Description',
        participantIds: [],
        defaultConversationStarter: ''
      })
    })
    
    expect(useTemplatesStore.getState().templates).toHaveLength(1)
    
    // Then remove it
    act(() => {
      store.removeTemplate(templateId)
    })
    
    expect(useTemplatesStore.getState().templates).toHaveLength(0)
  })
  
  test('should get a template by ID', () => {
    const templateId = 'test-uuid'
    
    // Add a template
    act(() => {
      store.addTemplate({
        name: 'Test Template',
        description: 'Test Description',
        participantIds: [],
        defaultConversationStarter: ''
      })
    })
    
    const template = store.getTemplateById(templateId)
    expect(template).toBeDefined()
    expect(template?.name).toBe('Test Template')
    
    // Test with non-existent ID
    const nonExistentTemplate = store.getTemplateById('non-existent')
    expect(nonExistentTemplate).toBeUndefined()
  })
  
  test('should return template with associated participants', () => {
    const templateId = 'test-uuid'
    const participants = [
      { 
        id: '1', 
        name: 'Participant 1', 
        type: 'llm' as const,
        provider: 'openai' as LLMProviderId,
        model: 'gpt-4o',
        systemPrompt: 'System 1', 
        roleDescription: '',
        settings: { temperature: 0.7, maxTokens: 1000 }
      },
      { 
        id: '2', 
        name: 'Participant 2', 
        type: 'llm' as const,
        provider: 'openai' as LLMProviderId,
        model: 'gpt-4o',
        systemPrompt: 'System 2', 
        roleDescription: '',
        settings: { temperature: 0.7, maxTokens: 1000 }
      },
      { 
        id: '3', 
        name: 'Participant 3', 
        type: 'llm' as const,
        provider: 'openai' as LLMProviderId,
        model: 'gpt-4o',
        systemPrompt: 'System 3', 
        roleDescription: '',
        settings: { temperature: 0.7, maxTokens: 1000 }
      }
    ]
    
    // Add a template with participant IDs
    act(() => {
      store.addTemplate({
        name: 'Test Template',
        description: 'Test Description',
        participantIds: ['1', '2'],
        defaultConversationStarter: ''
      })
    })
    
    const { template, participants: templateParticipants } = store.getTemplateWithParticipants(templateId, participants)
    
    expect(template).toBeDefined()
    expect(templateParticipants).toHaveLength(2)
    expect(templateParticipants[0].id).toBe('1')
    expect(templateParticipants[1].id).toBe('2')
  })
  
  test('should return empty results for non-existent template ID', () => {
    const participants = [
      { 
        id: '1', 
        name: 'Participant 1', 
        type: 'llm' as const,
        provider: 'openai' as LLMProviderId,
        model: 'gpt-4o',
        systemPrompt: 'System 1', 
        roleDescription: '',
        settings: { temperature: 0.7, maxTokens: 1000 }
      }
    ]
    
    const { template, participants: templateParticipants } = store.getTemplateWithParticipants('non-existent', participants)
    
    expect(template).toBeUndefined()
    expect(templateParticipants).toHaveLength(0)
  })
})
