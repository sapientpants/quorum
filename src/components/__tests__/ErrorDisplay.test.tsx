import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorDisplay from '../ErrorDisplay'

describe('ErrorDisplay', () => {
  it('renders nothing when error is null', () => {
    const { container } = render(<ErrorDisplay error={null} />)
    expect(container.firstChild).toBeNull()
  })
  
  it('renders the error message when provided', () => {
    const errorMessage = 'Something went wrong!'
    render(<ErrorDisplay error={errorMessage} />)
    
    // Check that the error message is rendered
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    
    // Check that the alert has the error class
    const alert = screen.getByText(errorMessage).closest('.alert')
    expect(alert).toHaveClass('alert-error')
  })
  
  it('renders the dismiss button when onDismiss is provided', () => {
    const onDismissMock = vi.fn()
    render(<ErrorDisplay error="Error message" onDismiss={onDismissMock} />)
    
    // Check that the dismiss button is rendered
    const dismissButton = screen.getByText('Dismiss')
    expect(dismissButton).toBeInTheDocument()
    
    // Check that the button has the correct classes
    expect(dismissButton).toHaveClass('btn')
    expect(dismissButton).toHaveClass('btn-ghost')
  })
  
  it('does not render the dismiss button when onDismiss is not provided', () => {
    render(<ErrorDisplay error="Error message" />)
    
    // Check that the dismiss button is not rendered
    expect(screen.queryByText('Dismiss')).not.toBeInTheDocument()
  })
  
  it('calls onDismiss when the dismiss button is clicked', () => {
    const onDismissMock = vi.fn()
    render(<ErrorDisplay error="Error message" onDismiss={onDismissMock} />)
    
    // Click the dismiss button
    fireEvent.click(screen.getByText('Dismiss'))
    
    // Check that onDismiss was called
    expect(onDismissMock).toHaveBeenCalledTimes(1)
  })
  
  it('renders the error icon', () => {
    render(<ErrorDisplay error="Error message" />)
    
    // Check that the SVG icon is rendered
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('stroke-current')
    
    // Check that the path is rendered
    const path = document.querySelector('path')
    expect(path).toBeInTheDocument()
    expect(path).toHaveAttribute('d')
  })
})
