import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { RoundTable } from '../RoundTable'
import type { Participant } from '../../types/participant'

// Mock the Icon component
vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`}>{icon}</span>
}))

// Sample participants data
const participants: Participant[] = [
  { 
    id: 'user', 
    name: 'You', 
    type: 'human' 
  },
  { 
    id: 'assistant', 
    name: 'AI Assistant', 
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
    id: 'expert', 
    name: 'Domain Expert', 
    type: 'llm',
    provider: 'anthropic',
    model: 'claude-3-opus',
    roleDescription: 'Technical expert who provides in-depth analysis',
    systemPrompt: 'You are a technical domain expert',
    settings: {
      temperature: 0.5,
      maxTokens: 2000
    }
  }
]

describe('RoundTable', () => {
  test('renders all participants in a circular layout', () => {
    const handleClick = vi.fn()
    
    render(
      <RoundTable
        participants={participants}
        activeParticipantId={null}
        onParticipantClick={handleClick}
      />
    )
    
    // Check for the title
    expect(screen.getByText('Round Table')).toBeInTheDocument()
    
    // Check for all participant names
    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
    expect(screen.getByText('Domain Expert')).toBeInTheDocument()
    
    // Verify we have the right number of participant nodes
    const userIcon = screen.getByTestId('icon-solar:user-rounded-linear')
    const robotIcons = screen.getAllByTestId('icon-solar:robot-linear')
    
    expect(userIcon).toBeInTheDocument()
    expect(robotIcons).toHaveLength(2) // Two AI participants
  })
  
  test('highlights the active participant', () => {
    const handleClick = vi.fn()
    
    render(
      <RoundTable
        participants={participants}
        activeParticipantId="assistant"
        onParticipantClick={handleClick}
      />
    )
    
    // Check that the active participant details are shown
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
    expect(screen.getByText('openai')).toBeInTheDocument()
    expect(screen.getByText('gpt-4o')).toBeInTheDocument()
  })
  
  test('calls onParticipantClick when a participant is clicked', () => {
    const handleClick = vi.fn()
    
    render(
      <RoundTable
        participants={participants}
        activeParticipantId={null}
        onParticipantClick={handleClick}
      />
    )
    
    // Find all participant nodes by their names and click one
    const participantNodes = [
      screen.getByText('You'),
      screen.getByText('AI Assistant'),
      screen.getByText('Domain Expert')
    ]
    
    // Click the second participant (AI Assistant)
    fireEvent.click(participantNodes[1])
    
    // Verify the click handler was called with the correct ID
    expect(handleClick).toHaveBeenCalledWith('assistant')
  })
  
  test('displays participant details when active', () => {
    const handleClick = vi.fn()
    
    // Test with the third participant active (has role description)
    render(
      <RoundTable
        participants={participants}
        activeParticipantId="expert"
        onParticipantClick={handleClick}
      />
    )
    
    // Check that the active participant details are shown with role description
    expect(screen.getByText('Domain Expert')).toBeInTheDocument()
    expect(screen.getByText('anthropic')).toBeInTheDocument()
    expect(screen.getByText('claude-3-opus')).toBeInTheDocument()
    expect(screen.getByText('Technical expert who provides in-depth analysis')).toBeInTheDocument()
  })
}) 