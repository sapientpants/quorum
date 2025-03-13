import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ParticipantForm } from '../ParticipantForm'
import type { Participant } from '../../types/participant'

describe('ParticipantForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default values', () => {
    render(<ParticipantForm {...defaultProps} />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/provider/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/system prompt/i)).toBeInTheDocument()
    expect(screen.getByText(/advanced settings/i)).toBeInTheDocument()
  })

  it('shows validation errors for required fields', async () => {
    render(<ParticipantForm {...defaultProps} />)

    fireEvent.click(screen.getByText(/save participant/i))

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/system prompt is required/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('toggles advanced settings visibility', async () => {
    render(<ParticipantForm {...defaultProps} />)

    const advancedButton = screen.getByText(/advanced settings/i)
    expect(screen.queryByLabelText(/temperature/i)).not.toBeInTheDocument()

    await userEvent.click(advancedButton)
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/max tokens/i)).toBeInTheDocument()

    await userEvent.click(advancedButton)
    expect(screen.queryByLabelText(/temperature/i)).not.toBeInTheDocument()
  })

  it('changes available models when provider changes', async () => {
    render(<ParticipantForm {...defaultProps} />)
    
    // Default provider is OpenAI, should show OpenAI models
    expect(screen.getByText('gpt-4o')).toBeInTheDocument()
    
    // Change provider to Anthropic
    await userEvent.selectOptions(screen.getByLabelText(/provider/i), 'anthropic')
    
    // Should now show Anthropic models
    expect(screen.getByText('claude-3.7-sonnet')).toBeInTheDocument()
    
    // Change provider to Grok
    await userEvent.selectOptions(screen.getByLabelText(/provider/i), 'grok')
    
    // Should now show Grok models
    expect(screen.getByText('grok-2')).toBeInTheDocument()
    expect(screen.queryByText('claude-3.7-sonnet')).not.toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    render(<ParticipantForm {...defaultProps} />)

    // Fill in required fields
    const nameInput = screen.getByLabelText(/name/i)
    const systemPromptInput = screen.getByLabelText(/system prompt/i)
    
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Test Participant')
    await userEvent.clear(systemPromptInput)
    await userEvent.type(systemPromptInput, 'Test Prompt')
    
    // Show advanced settings
    const advancedButton = screen.getByText(/advanced settings/i)
    await userEvent.click(advancedButton)
    
    // Fill in advanced settings
    const temperatureInput = screen.getByLabelText(/temperature/i)
    const maxTokensInput = screen.getByLabelText(/max tokens/i)
    
    // Don't try to clear a range input, just set its value directly
    fireEvent.change(temperatureInput, { target: { value: '0.8' } })
    
    await userEvent.clear(maxTokensInput)
    await userEvent.type(maxTokensInput, '2000')

    // Submit form
    const submitButton = screen.getByText(/save participant/i)
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Participant',
        provider: 'openai',
        model: 'gpt-4o',
        systemPrompt: 'Test Prompt',
        roleDescription: '',
        type: 'llm',
        settings: {
          temperature: 0.8,
          maxTokens: 2000
        }
      })
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    render(<ParticipantForm {...defaultProps} />)

    await userEvent.click(screen.getByText(/cancel/i))
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('initializes with provided data', () => {
    const initialData: Partial<Participant> = {
      name: 'Initial Name',
      provider: 'anthropic',
      model: 'claude-3.7-sonnet',
      systemPrompt: 'Initial Prompt',
      settings: {
        temperature: 1.0,
        maxTokens: 2000
      }
    }

    render(<ParticipantForm {...defaultProps} initialData={initialData} />)

    expect(screen.getByLabelText(/name/i)).toHaveValue('Initial Name')
    expect(screen.getByLabelText(/provider/i)).toHaveValue('anthropic')
    expect(screen.getByLabelText(/model/i)).toHaveValue('claude-3.7-sonnet')
    expect(screen.getByLabelText(/system prompt/i)).toHaveValue('Initial Prompt')
  })
}) 