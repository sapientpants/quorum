import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { ParticipantAdvancedSettings } from '../ParticipantAdvancedSettings'

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
  
  afterEach(() => {
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
    
    // Check for the basic tab content
    expect(screen.getByText('Temperature:')).toBeInTheDocument()
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
    expect(screen.getByText('Temperature:')).toBeInTheDocument()
    
    // Click on Experimental tab
    fireEvent.click(screen.getByText('Experimental'))
    
    // Now we should see Top P
    expect(screen.getByText('Top P:')).toBeInTheDocument()
    expect(screen.getByText('Presence Penalty:')).toBeInTheDocument()
    expect(screen.getByText('Frequency Penalty:')).toBeInTheDocument()
  })
  
  test('calls onSave with updated settings when form is submitted', () => {
    render(
      <ParticipantAdvancedSettings
        isOpen={true}
        onClose={mockOnClose}
        initialSettings={initialSettings}
        onSave={mockOnSave}
      />
    )
    
    // Change a setting
    const maxTokensInput = screen.getByLabelText('Max Tokens') as HTMLInputElement
    fireEvent.change(maxTokensInput, { target: { value: '2000' } })
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'))
    
    // Verify onSave was called with updated settings
    expect(mockOnSave).toHaveBeenCalled()
    expect(mockOnSave.mock.calls[0][0]).toHaveProperty('maxTokens', 2000)
    
    // Verify onClose was called
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
    
    // Change a setting
    const maxTokensInput = screen.getByLabelText('Max Tokens') as HTMLInputElement
    fireEvent.change(maxTokensInput, { target: { value: '2000' } })
    
    // Click cancel
    fireEvent.click(screen.getByText('Cancel'))
    
    // Verify onClose was called
    expect(mockOnClose).toHaveBeenCalled()
    
    // Verify onSave was NOT called
    expect(mockOnSave).not.toHaveBeenCalled()
  })
}) 