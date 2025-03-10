import { render, screen, fireEvent } from '@testing-library/react'
import { RoundTable } from './RoundTable'
import type { Participant } from '@/types/participants'

const mockParticipants: Participant[] = [
  {
    id: '1',
    name: 'User',
    type: 'human'
  },
  {
    id: '2',
    name: 'Assistant',
    type: 'llm',
    provider: 'openai',
    model: 'gpt-4',
    roleDescription: 'Helpful AI assistant',
    systemPrompt: 'You are a helpful AI assistant',
    settings: {
      temperature: 0.7,
      maxTokens: 1000
    }
  }
]

describe('RoundTable', () => {
  const mockOnReorder = vi.fn()
  const mockOnParticipantClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all participants', () => {
    render(
      <RoundTable
        participants={mockParticipants}
        activeParticipantId={null}
        onReorder={mockOnReorder}
        onParticipantClick={mockOnParticipantClick}
      />
    )

    expect(screen.getByText('User')).toBeInTheDocument()
    expect(screen.getByText('Assistant')).toBeInTheDocument()
  })

  it('highlights active participant', () => {
    render(
      <RoundTable
        participants={mockParticipants}
        activeParticipantId="1"
        onReorder={mockOnReorder}
        onParticipantClick={mockOnParticipantClick}
      />
    )

    const activeParticipant = screen.getByText('User').closest('div')
    expect(activeParticipant).toHaveClass('z-10')
  })

  it('calls onParticipantClick when participant is clicked', () => {
    render(
      <RoundTable
        participants={mockParticipants}
        activeParticipantId={null}
        onReorder={mockOnReorder}
        onParticipantClick={mockOnParticipantClick}
      />
    )

    fireEvent.click(screen.getByText('User'))
    expect(mockOnParticipantClick).toHaveBeenCalledWith('1')
  })
}) 