import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { ParticipantAdvancedSettings } from '../ParticipantAdvancedSettings'

// Mock react-hook-form
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form')
  return {
    ...actual,
    useForm: () => ({
      register: vi.fn(),
      handleSubmit: vi.fn(cb => (e: React.FormEvent<HTMLFormElement> | undefined) => {
        e?.preventDefault?.()
        cb({
          temperature: 0.7,
          maxTokens: 2000,
          topP: 0.9,
          presencePenalty: 0,
          frequencyPenalty: 0
        })
        return false
      }),
      formState: { errors: {} },
      watch: vi.fn().mockReturnValue(0.7),
      reset: vi.fn()
    })
  }
})

// Mock the Icon component
vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`}>{icon}</span>
}))

describe('ParticipantAdvancedSettings', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()
  
  const initialSettings = {
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.9,
    presencePenalty: 0,
    frequencyPenalty: 0
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  test('does not render when isOpen is false', () => {
    render(
      <ParticipantAdvancedSettings
        isOpen={false}
        onClose={mockOnClose}
        initialSettings={initialSettings}
        onSave={mockOnSave}
      />
    )
    
    // Verify the component doesn't render anything
    expect(screen.queryByText('Advanced Settings')).not.toBeInTheDocument()
  })
  
  test('renders when isOpen is true', () => {
    render(
      <ParticipantAdvancedSettings
        isOpen={true}
        onClose={mockOnClose}
        initialSettings={initialSettings}
        onSave={mockOnSave}
      />
    )
    
    // Verify title is displayed
    expect(screen.getByText('Advanced Settings')).toBeInTheDocument()
    
    // Check for the basic tab content - using regex to match "Temperature: 0.7"
    expect(screen.getByText(/Temperature:/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Temperature:/i)).toBeInTheDocument()
    expect(screen.getByText('Max Tokens')).toBeInTheDocument()
    
    // Check tab buttons
    expect(screen.getByText('Basic')).toBeInTheDocument()
    expect(screen.getByText('Experimental')).toBeInTheDocument()
  })
  
  test('switches between basic and experimental tabs', () => {
    render(
      <ParticipantAdvancedSettings
        isOpen={true}
        onClose={mockOnClose}
        initialSettings={initialSettings}
        onSave={mockOnSave}
      />
    )
    
    // Initially, basic tab is active and we should see Temperature
    expect(screen.getByText(/Temperature:/i)).toBeInTheDocument()
    
    // Click on Experimental tab
    fireEvent.click(screen.getByText('Experimental'))
    
    // Now we should see Top P
    expect(screen.getByText(/Top P:/i)).toBeInTheDocument()
    expect(screen.getByText(/Presence Penalty:/i)).toBeInTheDocument()
    expect(screen.getByText(/Frequency Penalty:/i)).toBeInTheDocument()
  })
  
  test('calls onSave with updated settings when form is submitted', () => {
    // Render the component
    render(
      <ParticipantAdvancedSettings
        isOpen={true}
        onClose={mockOnClose}
        initialSettings={initialSettings}
        onSave={mockOnSave}
      />
    )
    
    // Get the save button
    const saveButton = screen.getByText('Save Changes')
    
    // Simulate clicking the save button
    fireEvent.click(saveButton)
    
    // Verify onSave was called with the correct data
    expect(mockOnSave).toHaveBeenCalled()
    expect(mockOnSave).toHaveBeenCalledWith({
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9,
      presencePenalty: 0,
      frequencyPenalty: 0
    })
    
    // Check that onClose was called after saving
    expect(mockOnClose).toHaveBeenCalled()
  })
  
  test('calls onClose when cancel button is clicked', () => {
    render(
      <ParticipantAdvancedSettings
        isOpen={true}
        onClose={mockOnClose}
        initialSettings={initialSettings}
        onSave={mockOnSave}
      />
    )
    
    // Click cancel without submitting the form
    fireEvent.click(screen.getByText('Cancel'))
    
    // Verify onClose was called
    expect(mockOnClose).toHaveBeenCalled()
    
    // Verify onSave was NOT called
    expect(mockOnSave).not.toHaveBeenCalled()
  })
}) 