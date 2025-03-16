import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { Label } from '../label'

// Define types for the mock components
type LabelComponentProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  children?: React.ReactNode
  className?: string
}

// Mock Radix UI Label components
vi.mock('@radix-ui/react-label', () => ({
  Root: React.forwardRef(({ className, children, ...props }: LabelComponentProps, ref: React.Ref<HTMLLabelElement>) => (
    <label 
      data-testid="label-root" 
      className={className} 
      ref={ref}
      {...props}
    >
      {children}
    </label>
  ))
}))

// Mock class-variance-authority
vi.mock('class-variance-authority', () => ({
  cva: (baseClasses: string) => () => baseClasses
}))

// Mock the cn utility function
vi.mock('../../../lib/utils', () => ({
  cn: (...inputs: (string | undefined | null | false | Record<string, boolean>)[]) => 
    inputs.filter(Boolean).join(' ')
}))

describe('Label', () => {
  it('renders with default props', () => {
    render(<Label>Email</Label>)
    
    const label = screen.getByTestId('label-root')
    expect(label).toBeInTheDocument()
    expect(label).toHaveTextContent('Email')
    
    // Check default classes
    expect(label).toHaveClass('text-sm')
    expect(label).toHaveClass('font-medium')
    expect(label).toHaveClass('leading-none')
  })
  
  it('applies additional className', () => {
    render(<Label className="custom-class">Username</Label>)
    
    const label = screen.getByTestId('label-root')
    expect(label).toHaveClass('custom-class')
  })
  
  it('passes through HTML attributes', () => {
    render(
      <Label 
        htmlFor="email"
        id="email-label"
        aria-required="true"
      >
        Email Address
      </Label>
    )
    
    const label = screen.getByTestId('label-root')
    expect(label).toHaveAttribute('for', 'email')
    expect(label).toHaveAttribute('id', 'email-label')
    expect(label).toHaveAttribute('aria-required', 'true')
  })
  
  it('forwards ref to the label element', () => {
    const refCallback = vi.fn()
    
    render(<Label ref={refCallback}>Password</Label>)
    
    expect(refCallback).toHaveBeenCalled()
  })
  
  it('works with form controls', () => {
    render(
      <div>
        <Label htmlFor="username">Username</Label>
        <input id="username" data-testid="username-input" />
      </div>
    )
    
    const label = screen.getByTestId('label-root')
    const input = screen.getByTestId('username-input')
    
    expect(label).toHaveAttribute('for', 'username')
    expect(input).toHaveAttribute('id', 'username')
  })
})
