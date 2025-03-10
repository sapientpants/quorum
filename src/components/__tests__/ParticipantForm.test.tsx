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
    expect(screen.getByLabelText(/role description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/system prompt/i)).toBeInTheDocument()
    expect(screen.getByText(/advanced settings/i)).toBeInTheDocument()
  })

  it('shows validation errors for required fields', async () => {
    render(<ParticipantForm {...defaultProps} />)

    fireEvent.click(screen.getByText(/save participant/i))

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/role description is required/i)).toBeInTheDocument()
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

  it('updates model options when provider changes', async () => {
    render(<ParticipantForm {...defaultProps} />)

    const providerSelect = screen.getByLabelText(/provider/i)
    const modelSelect = screen.getByLabelText(/model/i)

    // Check OpenAI models
    expect(modelSelect).toHaveValue('gpt-4')
    expect(screen.getByText('gpt-4-turbo')).toBeInTheDocument()

    // Change to Anthropic
    await userEvent.selectOptions(providerSelect, 'anthropic')
    expect(screen.getByText('claude-3-opus')).toBeInTheDocument()
    expect(screen.queryByText('gpt-4')).not.toBeInTheDocument()

    // Change to Grok
    await userEvent.selectOptions(providerSelect, 'grok')
    expect(screen.getByText('grok-1')).toBeInTheDocument()
    expect(screen.queryByText('claude-3-opus')).not.toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    render(<ParticipantForm {...defaultProps} />)

    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/name/i), 'Test Participant')
    await userEvent.type(screen.getByLabelText(/role description/i), 'Test Role')
    await userEvent.type(screen.getByLabelText(/system prompt/i), 'Test Prompt')

    // Fill in advanced settings
    await userEvent.click(screen.getByText(/advanced settings/i))
    const temperatureInput = screen.getByLabelText(/temperature/i)
    const maxTokensInput = screen.getByLabelText(/max tokens/i)

    await userEvent.clear(temperatureInput)
    await userEvent.type(temperatureInput, '0.8')
    await userEvent.clear(maxTokensInput)
    await userEvent.type(maxTokensInput, '2000')

    // Submit form
    const submitButton = screen.getByText(/save participant/i)
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Participant',
        provider: 'openai',
        model: 'gpt-4',
        roleDescription: 'Test Role',
        systemPrompt: 'Test Prompt',
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

  it('loads initial data correctly', () => {
    const initialData: Partial<Participant> = {
      name: 'Initial Name',
      provider: 'anthropic',
      model: 'claude-3-opus',
      roleDescription: 'Initial Role',
      systemPrompt: 'Initial Prompt',
      settings: {
        temperature: 0.5,
        maxTokens: 1500
      }
    }

    render(<ParticipantForm {...defaultProps} initialData={initialData} />)

    expect(screen.getByLabelText(/name/i)).toHaveValue('Initial Name')
    expect(screen.getByLabelText(/provider/i)).toHaveValue('anthropic')
    expect(screen.getByLabelText(/model/i)).toHaveValue('claude-3-opus')
    expect(screen.getByLabelText(/role description/i)).toHaveValue('Initial Role')
    expect(screen.getByLabelText(/system prompt/i)).toHaveValue('Initial Prompt')
  })
}) 