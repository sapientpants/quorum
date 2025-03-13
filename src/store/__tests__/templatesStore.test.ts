import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useTemplatesStore } from '../templatesStore'
import { act } from '@testing-library/react'

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid'
})

// Mock Date.now
const mockNow = 1625097600000 // July 1, 2021
vi.spyOn(Date, 'now').mockImplementation(() => mockNow)

// Reset the module between tests
beforeEach(() => {
  vi.resetModules()
})

describe('templatesStore', () => {
  beforeEach(() => {
    // Initialize the store with an empty templates array
    const store = useTemplatesStore.getState()
    act(() => {
      // Ensure templates is an array
      if (!Array.isArray(store.templates)) {
        Object.defineProperty(store, 'templates', {
          value: [],
          writable: true
        })
      } else {
        // Clear existing templates
        store.templates.forEach(template => {
          store.removeTemplate(template.id)
        })
      }
    })
  })
  
  it('should add a template', () => {
    const store = useTemplatesStore.getState()
    
    act(() => {
      store.addTemplate({
        name: 'Test Template',
        description: 'Test Description',
        participantIds: ['user1', 'user2'],
        defaultConversationStarter: 'Hello'
      })
    })
    
    expect(store.templates).toHaveLength(1)
    expect(store.templates[0]).toEqual({
      id: 'test-uuid',
      name: 'Test Template',
      description: 'Test Description',
      participantIds: ['user1', 'user2'],
      defaultConversationStarter: 'Hello',
      createdAt: mockNow,
      updatedAt: mockNow
    })
  })
  
  it('should update a template', () => {
    const store = useTemplatesStore.getState()
    
    // Add a template first
    const templateId = store.addTemplate({
      name: 'Test Template',
      description: 'Test Description',
      participantIds: ['user1', 'user2']
    })
    
    // Update the template
    act(() => {
      store.updateTemplate(templateId, {
        name: 'Updated Template',
        description: 'Updated Description'
      })
    })
    
    expect(store.templates).toHaveLength(1)
    expect(store.templates[0]).toEqual({
      id: templateId,
      name: 'Updated Template',
      description: 'Updated Description',
      participantIds: ['user1', 'user2'],
      createdAt: mockNow,
      updatedAt: mockNow
    })
  })
  
  it('should remove a template', () => {
    const store = useTemplatesStore.getState()
    
    // Add a template first
    const templateId = store.addTemplate({
      name: 'Test Template',
      description: 'Test Description',
      participantIds: ['user1', 'user2']
    })
    
    expect(store.templates).toHaveLength(1)
    
    // Remove the template
    act(() => {
      store.removeTemplate(templateId)
    })
    
    expect(store.templates).toHaveLength(0)
  })
  
  it('should get a template by ID', () => {
    const store = useTemplatesStore.getState()
    
    // Add a template first
    const templateId = store.addTemplate({
      name: 'Test Template',
      description: 'Test Description',
      participantIds: ['user1', 'user2']
    })
    
    const template = store.getTemplateById(templateId)
    
    expect(template).toEqual({
      id: templateId,
      name: 'Test Template',
      description: 'Test Description',
      participantIds: ['user1', 'user2'],
      createdAt: mockNow,
      updatedAt: mockNow
    })
  })
  
  it('should get a template with participants', () => {
    const store = useTemplatesStore.getState()
    
    // Add a template first
    const templateId = store.addTemplate({
      name: 'Test Template',
      description: 'Test Description',
      participantIds: ['user1', 'user2']
    })
    
    const mockParticipants = [
      { id: 'user1', name: 'User 1', type: 'human' as const },
      { id: 'user2', name: 'User 2', type: 'human' as const },
      { id: 'user3', name: 'User 3', type: 'human' as const }
    ]
    
    const { template, participants } = store.getTemplateWithParticipants(templateId, mockParticipants)
    
    expect(template).toEqual({
      id: templateId,
      name: 'Test Template',
      description: 'Test Description',
      participantIds: ['user1', 'user2'],
      createdAt: mockNow,
      updatedAt: mockNow
    })
    
    expect(participants).toHaveLength(2)
    expect(participants[0]).toEqual(mockParticipants[0])
    expect(participants[1]).toEqual(mockParticipants[1])
  })
  
  it('should return empty results for non-existent template ID', () => {
    const store = useTemplatesStore.getState()
    
    const template = store.getTemplateById('non-existent')
    expect(template).toBeUndefined()
    
    const mockParticipants = [
      { id: 'user1', name: 'User 1', type: 'human' as const }
    ]
    
    const result = store.getTemplateWithParticipants('non-existent', mockParticipants)
    expect(result.template).toBeUndefined()
    expect(result.participants).toEqual([])
  })
}) 