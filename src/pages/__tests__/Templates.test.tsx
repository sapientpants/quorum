import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Templates } from '../Templates'
import { useNavigate } from 'react-router-dom'
import { useTemplatesStore } from '../../store/templatesStore'
import { useParticipantsStore } from '../../store/participants'
import type { Template } from '../../types/template'

// Mock the dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}))

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn()
}))

vi.mock('../../store/templatesStore', () => ({
  useTemplatesStore: vi.fn()
}))

vi.mock('../../store/participants', () => ({
  useParticipantsStore: vi.fn()
}))

vi.mock('../../components/templates/TemplateList', () => ({
  default: ({ onUseTemplate }: { onUseTemplate: (id: string) => void }) => (
    <div data-testid="template-list">
      <button 
        data-testid="use-template-button" 
        onClick={() => onUseTemplate('template-1')}
      >
        Use Template
      </button>
    </div>
  )
}))

// Mock console.error to prevent it from cluttering the test output
vi.spyOn(console, 'error').mockImplementation(() => {})

describe('Templates', () => {
  const mockNavigate = vi.fn()
  const mockGetTemplateById = vi.fn()
  const mockSetActiveParticipant = vi.fn()
  
  const mockTemplate: Template = {
    id: 'template-1',
    name: 'Test Template',
    description: 'A test template',
    participantIds: ['participant-1', 'participant-2'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set up the mocks
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(useTemplatesStore).mockReturnValue({
      getTemplateById: mockGetTemplateById,
      // Add other properties as needed
      templates: [mockTemplate]
    } as unknown as ReturnType<typeof useTemplatesStore>)
    
    vi.mocked(useParticipantsStore).mockReturnValue({
      setActiveParticipant: mockSetActiveParticipant,
      // Add other properties as needed
      participants: []
    } as unknown as ReturnType<typeof useParticipantsStore>)
    
    // Mock getTemplateById to return the mock template
    mockGetTemplateById.mockReturnValue(mockTemplate)
  })
  
  it('renders the templates page', () => {
    render(<Templates />)
    
    // Check that the template list is rendered
    expect(screen.getByTestId('template-list')).toBeInTheDocument()
  })
  
  it('handles using a template', () => {
    render(<Templates />)
    
    // Click the use template button
    fireEvent.click(screen.getByTestId('use-template-button'))
    
    // Check that getTemplateById was called with the correct template ID
    expect(mockGetTemplateById).toHaveBeenCalledWith('template-1')
    
    // Check that setActiveParticipant was called with the first participant ID
    expect(mockSetActiveParticipant).toHaveBeenCalledWith('participant-1')
    
    // Check that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/chat')
  })
  
  it('handles template not found error', () => {
    // Mock getTemplateById to return null (template not found)
    mockGetTemplateById.mockReturnValue(null)
    
    render(<Templates />)
    
    // Click the use template button
    fireEvent.click(screen.getByTestId('use-template-button'))
    
    // Check that getTemplateById was called with the correct template ID
    expect(mockGetTemplateById).toHaveBeenCalledWith('template-1')
    
    // Check that console.error was called
    expect(console.error).toHaveBeenCalledWith('Template not found:', 'template-1')
    
    // Check that setActiveParticipant was not called
    expect(mockSetActiveParticipant).not.toHaveBeenCalled()
    
    // Check that navigate was not called
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
