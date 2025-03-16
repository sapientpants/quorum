import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScrollArea } from '../scroll-area'

describe('ScrollArea', () => {
  it('renders with default props', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div>Scroll content</div>
      </ScrollArea>
    )
    
    const scrollArea = screen.getByTestId('scroll-area')
    expect(scrollArea).toBeInTheDocument()
    expect(scrollArea).toHaveClass('relative')
    expect(scrollArea).toHaveClass('overflow-auto')
    expect(scrollArea).toHaveTextContent('Scroll content')
  })
  
  it('applies additional className', () => {
    render(
      <ScrollArea className="custom-class" data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    )
    
    const scrollArea = screen.getByTestId('scroll-area')
    expect(scrollArea).toHaveClass('custom-class')
    expect(scrollArea).toHaveClass('relative')
    expect(scrollArea).toHaveClass('overflow-auto')
  })
  
  it('passes through HTML attributes', () => {
    render(
      <ScrollArea 
        id="main-scroll"
        aria-label="Scrollable content"
        tabIndex={0}
        data-testid="scroll-area"
      >
        <div>Content</div>
      </ScrollArea>
    )
    
    const scrollArea = screen.getByTestId('scroll-area')
    expect(scrollArea).toHaveAttribute('id', 'main-scroll')
    expect(scrollArea).toHaveAttribute('aria-label', 'Scrollable content')
    expect(scrollArea).toHaveAttribute('tabindex', '0')
  })
  
  it('renders children correctly', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div data-testid="child-1">First child</div>
        <div data-testid="child-2">Second child</div>
      </ScrollArea>
    )
    
    const scrollArea = screen.getByTestId('scroll-area')
    expect(scrollArea).toContainElement(screen.getByTestId('child-1'))
    expect(scrollArea).toContainElement(screen.getByTestId('child-2'))
    expect(screen.getByText('First child')).toBeInTheDocument()
    expect(screen.getByText('Second child')).toBeInTheDocument()
  })
  
  it('handles nested content', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div>
          <h2>Heading</h2>
          <p>Paragraph text</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      </ScrollArea>
    )
    
    const scrollArea = screen.getByTestId('scroll-area')
    expect(scrollArea).toHaveTextContent('Heading')
    expect(scrollArea).toHaveTextContent('Paragraph text')
    expect(scrollArea).toHaveTextContent('Item 1')
    expect(scrollArea).toHaveTextContent('Item 2')
  })
})
