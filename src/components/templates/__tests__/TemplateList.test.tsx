import { render, screen, fireEvent } from '@testing-library/react'
import { vi, type MockInstance } from 'vitest'
import TemplateList from '../TemplateList'
import { useTemplatesStore } from '../../../store/templatesStore'

// Mock the store
vi.mock('../../../store/templatesStore', () => ({
  useTemplatesStore: vi.fn()
}))

// Mock the TemplateCard component
vi.mock('../TemplateCard', () => ({
  __esModule: true,
  default: ({ template, onUse, onEdit, onDelete }: { 
    template: { id: string; name: string; description?: string }; 
    onUse: (id: string) => void; 
    onEdit: (id: string) => void; 
    onDelete: (id: string) => void 
  }) => (
    <div data-testid={`template-card-${template.id}`}>
      <h3>{template.name}</h3>
      <p>{template.description}</p>
      <button 
        data-testid={`use-template-${template.id}`} 
        onClick={() => onUse(template.id)}
      >
        Use Template
      </button>
      <button 
        data-testid={`edit-template-${template.id}`} 
        onClick={() => onEdit(template.id)}
      >
        Edit
      </button>
      <button 
        data-testid={`delete-template-${template.id}`} 
        onClick={() => onDelete(template.id)}
      >
        Delete
      </button>
    </div>
  )
}))

// Mock the DeleteConfirmationModal component
vi.mock('../../ui/DeleteConfirmationModal', () => ({
  __esModule: true,
  default: ({ onConfirm, onCancel }: { 
    onConfirm: () => void; 
    onCancel: () => void 
  }) => (
    <div data-testid="delete-modal">
      <button data-testid="confirm-delete" onClick={onConfirm}>Confirm</button>
      <button data-testid="cancel-delete" onClick={onCancel}>Cancel</button>
    </div>
  )
}))

// Mock the TemplateForm component
vi.mock('../TemplateForm', () => ({
  __esModule: true,
  default: ({ initialData, onCancel }: { 
    initialData?: { id: string; name: string; description?: string; participantIds: string[] } | undefined; 
    onCancel: () => void 
  }) => (
    <div data-testid="template-form">
      <p>Template Form {initialData ? 'Edit' : 'Create'}</p>
      <button onClick={onCancel}>Cancel</button>
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
      name: 'Test Template 1',
      description: 'This is test template 1',
      participantIds: ['user1', 'ai1'],
      defaultConversationStarter: 'Hello, let\'s start a conversation',
      createdAt: Date.now() - 86400000, // 1 day ago
      updatedAt: Date.now()
    },
    {
      id: '2',
      name: 'Test Template 2',
      description: 'This is test template 2',
      participantIds: ['user1', 'ai2'],
      defaultConversationStarter: 'Another conversation starter',
      createdAt: Date.now() - 172800000, // 2 days ago
      updatedAt: Date.now() - 86400000 // 1 day ago
    }
  ]
  
  const mockRemoveTemplate = vi.fn()
  const mockOnUseTemplate = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup the mock store with templates for most tests
    ;(useTemplatesStore as unknown as MockInstance).mockImplementation(selector => {
      if (typeof selector === 'function') {
        return selector({ 
          templates: mockTemplates,
          removeTemplate: mockRemoveTemplate
        })
      }
      return { 
        templates: mockTemplates,
        removeTemplate: mockRemoveTemplate
      }
    })
  })
  
  it('renders the templates list', () => {
    render(<TemplateList onUseTemplate={mockOnUseTemplate} />)
    
    // Check if template cards are rendered
    expect(screen.getByTestId('template-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('template-card-2')).toBeInTheDocument()
  })
  
  it('calls onUseTemplate when a template is used', () => {
    render(<TemplateList onUseTemplate={mockOnUseTemplate} />)
    
    // Click the use button on the first template
    fireEvent.click(screen.getByTestId('use-template-1'))
    
    // Check if onUseTemplate was called with the correct template ID
    expect(mockOnUseTemplate).toHaveBeenCalledWith('1')
  })
  
  it('opens the edit modal when edit is clicked', () => {
    render(<TemplateList onUseTemplate={mockOnUseTemplate} />)
    
    // Click the edit button on the first template
    fireEvent.click(screen.getByTestId('edit-template-1'))
    
    // Now the form should be visible
    expect(screen.getByTestId('template-form')).toBeInTheDocument()
    expect(screen.getByText('Template Form Edit')).toBeInTheDocument()
  })
  
  it('opens the delete confirmation modal when delete is clicked', () => {
    render(<TemplateList onUseTemplate={mockOnUseTemplate} />)
    
    // Click the delete button on the first template
    fireEvent.click(screen.getByTestId('delete-template-1'))
    
    // Now the delete modal should be visible
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument()
  })
  
  it('deletes a template when confirmed', () => {
    render(<TemplateList onUseTemplate={mockOnUseTemplate} />)
    
    // Click the delete button on the first template
    fireEvent.click(screen.getByTestId('delete-template-1'))
    
    // Confirm deletion
    fireEvent.click(screen.getByTestId('confirm-delete'))
    
    // Check if removeTemplate was called with the correct template ID
    expect(mockRemoveTemplate).toHaveBeenCalledWith('1')
  })
  
  it('shows empty state when no templates exist', () => {
    // Override the mock to return empty templates array
    ;(useTemplatesStore as unknown as MockInstance).mockImplementation(selector => {
      if (typeof selector === 'function') {
        return selector({ 
          templates: [],
          removeTemplate: mockRemoveTemplate
        })
      }
      return { 
        templates: [],
        removeTemplate: mockRemoveTemplate
      }
    })
    
    render(<TemplateList onUseTemplate={mockOnUseTemplate} />)
    
    // Check if empty state is shown
    expect(screen.getByText('No Templates Yet')).toBeInTheDocument()
    expect(screen.getByText('Create your first template to save your favorite round table configurations.')).toBeInTheDocument()
  })
}) 