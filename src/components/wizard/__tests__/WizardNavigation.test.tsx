import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WizardNavigation } from '../WizardNavigation'

// Mock the react-i18next hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'wizard.navigation.back': 'Back',
        'wizard.navigation.next': 'Next',
        'wizard.navigation.complete': 'Complete'
      }
      return translations[key] || key
    }
  })
}))

// Mock the Button component
vi.mock('../../ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
  }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-variant={variant}
      data-testid="button"
    >
      {children}
    </button>
  )
}))

describe('WizardNavigation', () => {
  const defaultProps = {
    currentStep: 1,
    totalSteps: 3,
    onNext: vi.fn(),
    onBack: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders back and next buttons', () => {
    render(<WizardNavigation {...defaultProps} />)
    
    const buttons = screen.getAllByTestId('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toHaveTextContent('Back')
    expect(buttons[1]).toHaveTextContent('Next')
  })

  it('disables back button on first step', () => {
    render(
      <WizardNavigation 
        {...defaultProps} 
        currentStep={0} 
      />
    )
    
    const buttons = screen.getAllByTestId('button')
    expect(buttons[0]).toBeDisabled()
  })

  it('enables back button when not on first step', () => {
    render(
      <WizardNavigation 
        {...defaultProps} 
        currentStep={1} 
      />
    )
    
    const buttons = screen.getAllByTestId('button')
    expect(buttons[0]).not.toBeDisabled()
  })

  it('shows "Complete" text on last step instead of "Next"', () => {
    render(
      <WizardNavigation 
        {...defaultProps} 
        currentStep={2} 
        totalSteps={3} 
      />
    )
    
    const buttons = screen.getAllByTestId('button')
    expect(buttons[1]).toHaveTextContent('Complete')
  })

  it('calls onNext when next button is clicked', () => {
    render(<WizardNavigation {...defaultProps} />)
    
    const buttons = screen.getAllByTestId('button')
    fireEvent.click(buttons[1])
    
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1)
  })

  it('calls onBack when back button is clicked', () => {
    render(
      <WizardNavigation 
        {...defaultProps} 
        currentStep={1} 
      />
    )
    
    const buttons = screen.getAllByTestId('button')
    fireEvent.click(buttons[0])
    
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1)
  })

  it('disables next button when nextDisabled is true', () => {
    render(
      <WizardNavigation 
        {...defaultProps} 
        nextDisabled={true} 
      />
    )
    
    const buttons = screen.getAllByTestId('button')
    expect(buttons[1]).toBeDisabled()
  })

  it('enables next button when nextDisabled is false', () => {
    render(
      <WizardNavigation 
        {...defaultProps} 
        nextDisabled={false} 
      />
    )
    
    const buttons = screen.getAllByTestId('button')
    expect(buttons[1]).not.toBeDisabled()
  })
})
