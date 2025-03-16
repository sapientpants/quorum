import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotFound } from '../NotFound'

// Mock the react-router-dom useNavigate hook
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}))

// Mock the Button component
vi.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => (
    <button data-testid="button" onClick={onClick}>
      {children}
    </button>
  )
}))

describe('NotFound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the 404 page with correct title and message', () => {
    render(<NotFound />)
    
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
    expect(screen.getByText("The page you're looking for doesn't exist.")).toBeInTheDocument()
  })

  it('renders a button to return home', () => {
    render(<NotFound />)
    
    expect(screen.getByText('Return Home')).toBeInTheDocument()
  })

  it('navigates to home page when button is clicked', () => {
    render(<NotFound />)
    
    fireEvent.click(screen.getByText('Return Home'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('has the correct layout structure', () => {
    render(<NotFound />)
    
    // Check that the container has the correct classes
    const container = screen.getByText('404 - Page Not Found').parentElement
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen')
    
    // Check that the title has the correct classes
    const title = screen.getByText('404 - Page Not Found')
    expect(title).toHaveClass('text-4xl', 'font-bold', 'mb-4')
    
    // Check that the message has the correct classes
    const message = screen.getByText("The page you're looking for doesn't exist.")
    expect(message).toHaveClass('text-lg', 'mb-8')
  })
})
