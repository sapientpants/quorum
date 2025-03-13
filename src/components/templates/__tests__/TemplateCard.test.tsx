import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import TemplateCard from '../TemplateCard'
import { useParticipantsStore } from '../../../store/participants'

// Mock the participants store
vi.mock('../../../store/participants', () => ({
  useParticipantsStore: vi.fn()
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

describe('TemplateCard', () => {
  const mockTemplate = {
    id: 'template1',
    name: 'Test Template',
    description: 'This is a test template',
    participantIds: ['user1', 'ai1'],
    defaultConversationStarter: 'Hello, let\'s start a conversation',
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now()
  }
  
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
    },
    {
      id: 'ai2',
      name: 'AI 2',
      type: 'llm',
      provider: 'anthropic',
      model: 'claude-3.5-sonnet',
      systemPrompt: 'You are Claude',
      settings: {
        temperature: 0.7,
        maxTokens: 1000
      }
    }
  ]
  
  const mockOnUse = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnShare = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup the mock store
    ;(useParticipantsStore as jest.Mock).mockReturnValue({
      participants: mockParticipants
    })
  })
  
  it('renders the template card with correct information', () => {
    render(
      <TemplateCard
        template={mockTemplate}
        onUse={mockOnUse}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    // Check if template information is displayed
    expect(screen.getByText('Test Template')).toBeInTheDocument()
    expect(screen.getByText('This is a test template')).toBeInTheDocument()
    
    // Check if participants are displayed
    expect(screen.getByText('Participants:')).toBeInTheDocument()
    
    // Check if conversation starter is displayed
    expect(screen.getByText('"Hello, let\'s start a conversation"')).toBeInTheDocument()
    
    // Check if date is displayed
    expect(screen.getByText(/Updated:/)).toBeInTheDocument()
    
    // Check if use button is displayed
    expect(screen.getByRole('button', { name: 'Use Template' })).toBeInTheDocument()
  })
  
  it('calls onUse when use button is clicked', () => {
    render(
      <TemplateCard
        template={mockTemplate}
        onUse={mockOnUse}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    fireEvent.click(screen.getByRole('button', { name: 'Use Template' }))
    
    expect(mockOnUse).toHaveBeenCalledWith(mockTemplate.id)
  })
  
  it('opens the dropdown menu when menu button is clicked', () => {
    render(
      <TemplateCard
        template={mockTemplate}
        onUse={mockOnUse}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    // Initially, dropdown items should not be visible
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    
    // Click the menu button
    fireEvent.click(screen.getByRole('button', { name: '' }))
    
    // Now dropdown items should be visible
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })
  
  it('calls appropriate handlers when dropdown items are clicked', () => {
    render(
      <TemplateCard
        template={mockTemplate}
        onUse={mockOnUse}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onShare={mockOnShare}
      />
    )
    
    // Open the dropdown menu
    fireEvent.click(screen.getByRole('button', { name: '' }))
    
    // Click the Edit option
    fireEvent.click(screen.getByText('Edit'))
    expect(mockOnEdit).toHaveBeenCalledWith(mockTemplate.id)
    
    // Open the dropdown menu again
    fireEvent.click(screen.getByRole('button', { name: '' }))
    
    // Click the Delete option
    fireEvent.click(screen.getByText('Delete'))
    expect(mockOnDelete).toHaveBeenCalledWith(mockTemplate.id)
    
    // Open the dropdown menu again
    fireEvent.click(screen.getByRole('button', { name: '' }))
    
    // Click the Share option
    fireEvent.click(screen.getByText('Share'))
    expect(mockOnShare).toHaveBeenCalledWith(mockTemplate.id)
  })
  
  it('displays multiple participants correctly', () => {
    // Create a template with many participants
    const templateWithManyParticipants = {
      ...mockTemplate,
      participantIds: ['user1', 'ai1', 'ai2', 'user1', 'ai1', 'ai2']
    }
    
    render(
      <TemplateCard
        template={templateWithManyParticipants}
        onUse={mockOnUse}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    
    // Should show a +1 indicator for participants beyond the first 5
    expect(screen.getByText('+1')).toBeInTheDocument()
  })
}) 