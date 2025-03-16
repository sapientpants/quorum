import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RoundTablePage } from '../RoundTablePage'
import { usePreferencesStore } from '../../store/preferencesStore'
import { useParticipantsStore } from '../../store/participants'
import type { Participant } from '../../types/participant'

// Mock the dependencies
vi.mock('../../store/preferencesStore', () => ({
  usePreferencesStore: vi.fn()
}))

vi.mock('../../store/participants', () => ({
  useParticipantsStore: vi.fn()
}))

vi.mock('../../components/TopBar', () => ({
  TopBar: () => <div data-testid="top-bar">Top Bar</div>
}))

vi.mock('../../components/RoundTable', () => ({
  RoundTable: ({ 
    participants, 
    activeParticipantId, 
    onParticipantClick 
  }: { 
    participants: Participant[]; 
    activeParticipantId: string | null; 
    onParticipantClick: (id: string) => void 
  }) => (
    <div data-testid="round-table">
      <div>Active Participant: {activeParticipantId}</div>
      <ul>
        {participants.map(p => (
          <li key={p.id} data-testid={`participant-${p.id}`}>
            <button onClick={() => onParticipantClick(p.id)}>{p.name}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}))

describe('RoundTablePage', () => {
  const mockSetWizardCompleted = vi.fn()
  
  const mockParticipants: Participant[] = [
    { 
      id: 'p1', 
      name: 'Participant 1', 
      type: 'llm',
      provider: 'openai', 
      model: 'gpt-4', 
      systemPrompt: '',
      settings: {
        temperature: 0.7,
        maxTokens: 1000
      }
    },
    { 
      id: 'p2', 
      name: 'Participant 2', 
      type: 'llm',
      provider: 'anthropic', 
      model: 'claude-3', 
      systemPrompt: '',
      settings: {
        temperature: 0.7,
        maxTokens: 1000
      }
    }
  ]
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set up the mocks
    vi.mocked(usePreferencesStore).mockReturnValue({
      setWizardCompleted: mockSetWizardCompleted,
      // Add other properties as needed
      preferences: { theme: 'light' }
    } as unknown as ReturnType<typeof usePreferencesStore>)
  })
  
  it('renders the page with participants', () => {
    // Mock participants store with participants
    vi.mocked(useParticipantsStore).mockReturnValue({
      participants: mockParticipants
    } as unknown as ReturnType<typeof useParticipantsStore>)
    
    render(<RoundTablePage />)
    
    // Check that the components are rendered
    expect(screen.getByTestId('top-bar')).toBeInTheDocument()
    expect(screen.getByTestId('round-table')).toBeInTheDocument()
    
    // Check that the first participant is active by default
    expect(screen.getByText('Active Participant: p1')).toBeInTheDocument()
    
    // Check that both participants are rendered
    expect(screen.getByTestId('participant-p1')).toBeInTheDocument()
    expect(screen.getByTestId('participant-p2')).toBeInTheDocument()
  })
  
  it('renders a message when no participants are configured', () => {
    // Mock participants store with no participants
    vi.mocked(useParticipantsStore).mockReturnValue({
      participants: []
    } as unknown as ReturnType<typeof useParticipantsStore>)
    
    render(<RoundTablePage />)
    
    // Check that the message is rendered
    expect(screen.getByText('No participants configured yet.')).toBeInTheDocument()
    expect(screen.getByText('Go to the Settings page to add participants.')).toBeInTheDocument()
    
    // Check that the RoundTable is not rendered
    expect(screen.queryByTestId('round-table')).not.toBeInTheDocument()
  })
  
  it('sets the wizard as completed on mount', () => {
    // Mock participants store with participants
    vi.mocked(useParticipantsStore).mockReturnValue({
      participants: mockParticipants
    } as unknown as ReturnType<typeof useParticipantsStore>)
    
    render(<RoundTablePage />)
    
    // Check that setWizardCompleted was called with true
    expect(mockSetWizardCompleted).toHaveBeenCalledWith(true)
  })
  
  it('allows changing the active participant', () => {
    // Mock participants store with participants
    vi.mocked(useParticipantsStore).mockReturnValue({
      participants: mockParticipants
    } as unknown as ReturnType<typeof useParticipantsStore>)
    
    render(<RoundTablePage />)
    
    // Initially, the first participant should be active
    expect(screen.getByText('Active Participant: p1')).toBeInTheDocument()
    
    // Click on the second participant
    fireEvent.click(screen.getByText('Participant 2'))
    
    // Now the second participant should be active
    expect(screen.getByText('Active Participant: p2')).toBeInTheDocument()
  })
})
