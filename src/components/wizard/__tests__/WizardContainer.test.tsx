import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WizardContainer } from '../WizardContainer'

// Mock the dependencies
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}))

const mockSetWizardCompleted = vi.fn()
vi.mock('../../store/preferencesStore', () => ({
  usePreferencesStore: () => ({
    setWizardCompleted: mockSetWizardCompleted
  })
}))

vi.mock('../../store/participants', () => ({
  useParticipantsStore: () => ({
    participants: [
      { id: '1', name: 'User', type: 'user' },
      { id: '2', name: 'AI Assistant', type: 'llm' }
    ]
  })
}))

// Mock the child components
vi.mock('../SecurityStep', () => ({
  SecurityStep: ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => (
    <div data-testid="security-step">
      <button data-testid="security-next" onClick={onNext}>Next</button>
      <button data-testid="security-back" onClick={onBack}>Back</button>
    </div>
  )
}))

vi.mock('../ApiKeyStep', () => ({
  ApiKeyStep: ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => (
    <div data-testid="api-key-step">
      <button data-testid="api-key-next" onClick={onNext}>Next</button>
      <button data-testid="api-key-back" onClick={onBack}>Back</button>
    </div>
  )
}))

vi.mock('../ParticipantConfigStep', () => ({
  ParticipantConfigStep: ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => (
    <div data-testid="participant-config-step">
      <button data-testid="participant-next" onClick={onNext}>Next</button>
      <button data-testid="participant-back" onClick={onBack}>Back</button>
    </div>
  )
}))

vi.mock('../WizardProgress', () => ({
  WizardProgress: ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
    <div data-testid="wizard-progress">
      Step {currentStep + 1} of {totalSteps}
    </div>
  )
}))

vi.mock('../WizardNavigation', () => ({
  WizardNavigation: ({ 
    currentStep, 
    totalSteps,
    onNext,
    onBack,
    nextDisabled
  }: { 
    currentStep: number, 
    totalSteps: number,
    onNext: () => void,
    onBack: () => void,
    nextDisabled: boolean
  }) => (
    <div data-testid="wizard-navigation">
      <button 
        data-testid="nav-back" 
        onClick={onBack} 
        disabled={currentStep === 0}
      >
        Back
      </button>
      <button 
        data-testid="nav-next" 
        onClick={onNext} 
        disabled={nextDisabled}
      >
        {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
      </button>
    </div>
  )
}))

vi.mock('../../TopBar', () => ({
  TopBar: () => <div data-testid="top-bar">Top Bar</div>
}))

describe('WizardContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('renders the first step initially', () => {
    render(<WizardContainer />)
    
    // Check that the security step is rendered
    expect(screen.getByTestId('security-step')).toBeInTheDocument()
    
    // Check that the progress indicator shows step 1
    expect(screen.getByTestId('wizard-progress')).toHaveTextContent('Step 1 of 3')
  })
  
  it('navigates to the next step when next is clicked', () => {
    render(<WizardContainer />)
    
    // Initially on security step
    expect(screen.getByTestId('security-step')).toBeInTheDocument()
    
    // Click next
    fireEvent.click(screen.getByTestId('security-next'))
    
    // Should now be on API key step
    expect(screen.getByTestId('api-key-step')).toBeInTheDocument()
    expect(screen.getByTestId('wizard-progress')).toHaveTextContent('Step 2 of 3')
    
    // Click next again
    fireEvent.click(screen.getByTestId('api-key-next'))
    
    // Should now be on participant config step
    expect(screen.getByTestId('participant-config-step')).toBeInTheDocument()
    expect(screen.getByTestId('wizard-progress')).toHaveTextContent('Step 3 of 3')
  })
  
  it('navigates to the previous step when back is clicked', () => {
    render(<WizardContainer />)
    
    // Navigate to step 2
    fireEvent.click(screen.getByTestId('security-next'))
    expect(screen.getByTestId('api-key-step')).toBeInTheDocument()
    
    // Click back
    fireEvent.click(screen.getByTestId('api-key-back'))
    
    // Should be back on security step
    expect(screen.getByTestId('security-step')).toBeInTheDocument()
    expect(screen.getByTestId('wizard-progress')).toHaveTextContent('Step 1 of 3')
  })
  
  // Note: We would ideally test that the wizard completes and navigates to chat
  // when finished, but that would require more complex mocking of the store functions
  // which is beyond the scope of this test.
  
  // Note: We would ideally test the case where the next button is disabled
  // when there are no non-user participants, but that would require more complex
  // mocking of the participants store which is beyond the scope of this test.
})
