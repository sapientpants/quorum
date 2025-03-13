import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import TemplateList from '../TemplateList'
import { useTemplatesStore } from '../../../store/templatesStore'

// Mock the store
vi.mock('../../../store/templatesStore', () => ({
  useTemplatesStore: vi.fn()
}))

// Mock the DeleteConfirmationModal component
vi.mock('../../ui/DeleteConfirmationModal', () => ({
  __esModule: true,
  default: ({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) => (
    <div data-testid="delete-modal">
      <button data-testid="confirm-delete" onClick={onConfirm}>Confirm</button>
      <button data-testid="cancel-delete" onClick={onCancel}>Cancel</button>
    </div>
  )
}))

// Mock the TemplateForm component
vi.mock('../TemplateForm', () => ({
  __esModule: true,
  default: ({ onCancel }: { onCancel: () => void }) => (
    <div data-testid="template-form">
      <button data-testid="cancel-form" onClick={onCancel}>Cancel</button>
    </div>
  )
}))

// Mock the TemplateCard component
vi.mock('../TemplateCard', () => ({
  __esModule: true,
  default: ({ template, onUse, onEdit, onDelete }: { 
    template: { id: string, name: string },
    onUse: (id: string) => void,
    onEdit: (id: string) => void,
    onDelete: (id: string) => void
  }) => (
    <div data-testid={`template-card-${template.id}`}>
      <span>{template.name}</span>
      <button data-testid={`use-template-${template.id}`} onClick={() => onUse(template.id)}>Use</button>
      <button data-testid={`edit-template-${template.id}`} onClick={() => onEdit(template.id)}>Edit</button>
      <button data-testid={`delete-template-${template.id}`} onClick={() => onDelete(template.id)}>Delete</button>
    </div>
  )
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

describe('TemplateList', () => {
  const mockTemplates = [
    {
      id: '1',
      name: 'Template 1',
      description: 'Description 1',
      participantIds: ['user1', 'user2'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: '2',
      name: 'Template 2',
      description: 'Description 2',
      participantIds: ['user1', 'user3'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ]
  
  const mockRemoveTemplate = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup the mock store
    ;(useTemplatesStore as jest.Mock).mockReturnValue({
      templates: mockTemplates,
      removeTemplate: mockRemoveTemplate
    })
  })
  
  it('renders the templates list', () => {
    const onUseTemplate = vi.fn()
    render(<TemplateList onUseTemplate={onUseTemplate} />)
    
    // Check if template cards are rendered
    expect(screen.getByTestId('template-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('template-card-2')).toBeInTheDocument()
  })
  
  it('calls onUseTemplate when a template is used', () => {
    const onUseTemplate = vi.fn()
    render(<TemplateList onUseTemplate={onUseTemplate} />)
    
    // Click the use button on the first template
    fireEvent.click(screen.getByTestId('use-template-1'))
    
    // Check if onUseTemplate was called with the correct template ID
    expect(onUseTemplate).toHaveBeenCalledWith('1')
  })
  
  it('opens the edit modal when edit is clicked', () => {
    const onUseTemplate = vi.fn()
    render(<TemplateList onUseTemplate={onUseTemplate} />)
    
    // Initially, the form should not be visible
    expect(screen.queryByTestId('template-form')).not.toBeInTheDocument()
    
    // Click the edit button on the first template
    fireEvent.click(screen.getByTestId('edit-template-1'))
    
    // Now the form should be visible
    expect(screen.getByTestId('template-form')).toBeInTheDocument()
  })
  
  it('opens the delete confirmation modal when delete is clicked', () => {
    const onUseTemplate = vi.fn()
    render(<TemplateList onUseTemplate={onUseTemplate} />)
    
    // Initially, the delete modal should not be visible
    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument()
    
    // Click the delete button on the first template
    fireEvent.click(screen.getByTestId('delete-template-1'))
    
    // Now the delete modal should be visible
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument()
  })
  
  it('deletes a template when confirmed', () => {
    const onUseTemplate = vi.fn()
    render(<TemplateList onUseTemplate={onUseTemplate} />)
    
    // Click the delete button on the first template
    fireEvent.click(screen.getByTestId('delete-template-1'))
    
    // Confirm deletion
    fireEvent.click(screen.getByTestId('confirm-delete'))
    
    // Check if removeTemplate was called with the correct template ID
    expect(mockRemoveTemplate).toHaveBeenCalledWith('1')
  })
  
  it('shows empty state when no templates exist', () => {
    // Setup the mock store with empty templates array
    ;(useTemplatesStore as jest.Mock).mockReturnValue({
      templates: [],
      removeTemplate: mockRemoveTemplate
    })
    
    const onUseTemplate = vi.fn()
    render(<TemplateList onUseTemplate={onUseTemplate} />)
    
    // Check if the empty state message is displayed
    expect(screen.getByText('No Templates Yet')).toBeInTheDocument()
  })
}) 