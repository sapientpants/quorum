import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import TemplateForm from '../TemplateForm'
import { useParticipantsStore } from '../../../store/participants'
import { useTemplatesStore } from '../../../store/templatesStore'

// Mock the stores
vi.mock('../../../store/participants', () => ({
  useParticipantsStore: vi.fn()
}))

vi.mock('../../../store/templatesStore', () => ({
  useTemplatesStore: vi.fn()
}))

// Mock react-hook-form
vi.mock('react-hook-form', () => {
  const originalModule = vi.importActual('react-hook-form')
  return {
    ...originalModule,
    // We're not mocking the entire useForm implementation, just augmenting it
  }
})

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

describe('TemplateForm', () => {
  const mockParticipants = [
    {
      id: 'user1',
      name: 'User 1',
      type: 'human'
    },
    {
      id: 'ai1',
      name: 'AI 1',
      type: 'llm',
      provider: 'openai',
      model: 'gpt-4o',
      systemPrompt: 'You are a helpful assistant',
      settings: {
        temperature: 0.7,
        maxTokens: 1000
      }
    }
  ]
  
  const mockAddTemplate = vi.fn()
  const mockUpdateTemplate = vi.fn()
  const mockOnCancel = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup the mock stores
    ;(useParticipantsStore as jest.Mock).mockReturnValue({
      participants: mockParticipants
    })
    
    ;(useTemplatesStore as jest.Mock).mockReturnValue({
      addTemplate: mockAddTemplate,
      updateTemplate: mockUpdateTemplate
    })
  })
  
  it('renders the form with empty values for new template', () => {
    render(<TemplateForm onCancel={mockOnCancel} />)
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/Template Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Select Participants/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Default Conversation Starter/i)).toBeInTheDocument()
    
    // Check if participant options are rendered
    expect(screen.getByText('User 1')).toBeInTheDocument()
    expect(screen.getByText('AI 1')).toBeInTheDocument()
    
    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Template/i })).toBeInTheDocument()
  })
  
  it('renders the form with initial values for editing', () => {
    const initialData = {
      id: 'template1',
      name: 'Test Template',
      description: 'Test Description',
      participantIds: ['user1'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    render(<TemplateForm initialData={initialData} onCancel={mockOnCancel} />)
    
    // Check if form elements have initial values
    expect(screen.getByDisplayValue('Test Template')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
    
    // Check if the correct participant is selected
    const user1Checkbox = screen.getByRole('checkbox', { name: '' })
    expect(user1Checkbox).toBeChecked()
    
    // Check if the update button is rendered
    expect(screen.getByRole('button', { name: /Update Template/i })).toBeInTheDocument()
  })
  
  it('calls onCancel when cancel button is clicked', () => {
    render(<TemplateForm onCancel={mockOnCancel} />)
    
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    
    expect(mockOnCancel).toHaveBeenCalled()
  })
  
  it('validates required fields', async () => {
    render(<TemplateForm onCancel={mockOnCancel} />)
    
    // Submit the form without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /Create Template/i }))
    
    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument()
    })
  })
  
  it('toggles participant selection when clicked', () => {
    render(<TemplateForm onCancel={mockOnCancel} />)
    
    // Initially, no participants should be selected
    const checkbox = screen.getAllByRole('checkbox')[0]
    expect(checkbox).not.toBeChecked()
    
    // Click on the participant card
    fireEvent.click(screen.getByText('User 1'))
    
    // Now the checkbox should be checked
    expect(checkbox).toBeChecked()
    
    // Click again to deselect
    fireEvent.click(screen.getByText('User 1'))
    
    // Now the checkbox should be unchecked again
    expect(checkbox).not.toBeChecked()
  })
}) 