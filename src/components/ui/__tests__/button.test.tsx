import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '../button'

// Mock the cn utility function
vi.mock('../../../lib/utils', () => ({
  cn: (...inputs: (string | undefined | null | false | Record<string, boolean>)[]) => 
    inputs.filter(Boolean).join(' ')
}))

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    
    // Check default classes
    expect(button).toHaveClass('bg-secondary')
    expect(button).toHaveClass('text-secondary-foreground')
    expect(button).toHaveClass('h-10')
  })

  it('renders with primary variant', () => {
    render(<Button variant="primary">Primary</Button>)
    
    const button = screen.getByRole('button', { name: 'Primary' })
    expect(button).toHaveClass('bg-primary')
    expect(button).toHaveClass('text-white')
  })

  it('renders with outline variant', () => {
    render(<Button variant="outline">Outline</Button>)
    
    const button = screen.getByRole('button', { name: 'Outline' })
    expect(button).toHaveClass('border')
    expect(button).toHaveClass('border-input')
  })

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    
    const button = screen.getByRole('button', { name: 'Ghost' })
    expect(button).toHaveClass('hover:bg-accent')
  })

  it('renders with error variant', () => {
    render(<Button variant="error">Error</Button>)
    
    const button = screen.getByRole('button', { name: 'Error' })
    expect(button).toHaveClass('bg-destructive')
    expect(button).toHaveClass('text-destructive-foreground')
  })

  it('renders with small size', () => {
    render(<Button size="sm">Small</Button>)
    
    const button = screen.getByRole('button', { name: 'Small' })
    expect(button).toHaveClass('h-9')
    expect(button).toHaveClass('px-3')
  })

  it('renders with large size', () => {
    render(<Button size="lg">Large</Button>)
    
    const button = screen.getByRole('button', { name: 'Large' })
    expect(button).toHaveClass('h-11')
    expect(button).toHaveClass('px-8')
  })

  it('applies additional className prop', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByRole('button', { name: 'Custom' })
    expect(button).toHaveClass('custom-class')
  })

  it('passes through HTML button attributes', () => {
    render(
      <Button 
        type="submit" 
        disabled 
        aria-label="Submit form"
      >
        Submit
      </Button>
    )
    
    // When aria-label is provided, it overrides the text content for accessibility
    const button = screen.getByRole('button', { name: 'Submit form' })
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })

  it('applies disabled styles when disabled', () => {
    render(<Button disabled>Disabled</Button>)
    
    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toHaveClass('disabled:opacity-50')
    expect(button).toHaveClass('disabled:pointer-events-none')
  })
})
