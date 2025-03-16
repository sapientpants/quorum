import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeatureCard } from '../FeatureCard'

// Mock the @iconify/react module
vi.mock('@iconify/react', () => ({
  Icon: vi.fn(({ icon, width, height, style }) => (
    <span 
      data-testid="mocked-icon" 
      data-icon={icon}
      data-width={width}
      data-height={height}
      style={style}
    />
  ))
}))

describe('FeatureCard', () => {
  const defaultProps = {
    title: 'Feature Title',
    description: 'This is a feature description'
  }
  
  it('renders with required props', () => {
    render(<FeatureCard {...defaultProps} />)
    
    // Check that the title and description are rendered
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument()
    
    // Check that the card has the correct classes
    const card = screen.getByText(defaultProps.title).closest('.feature-card')
    expect(card).toHaveClass('card-glow')
    expect(card).toHaveClass('bg-card')
    expect(card).toHaveClass('rounded-xl')
  })
  
  it('renders with a string icon', () => {
    const iconName = 'mdi:star'
    render(<FeatureCard {...defaultProps} icon={iconName} />)
    
    // Check that the icon is rendered
    const icon = screen.getByTestId('mocked-icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('data-icon', iconName)
    expect(icon).toHaveAttribute('data-width', '24')
    expect(icon).toHaveAttribute('data-height', '24')
  })
  
  it('renders with a ReactNode icon', () => {
    const customIcon = <div data-testid="custom-icon">Custom Icon</div>
    render(<FeatureCard {...defaultProps} icon={customIcon} />)
    
    // Check that the custom icon is rendered
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    expect(screen.getByText('Custom Icon')).toBeInTheDocument()
  })
  
  it('renders with a badge', () => {
    const badgeText = 'New'
    render(<FeatureCard {...defaultProps} badgeText={badgeText} />)
    
    // Check that the badge is rendered
    expect(screen.getByText(badgeText)).toBeInTheDocument()
    expect(screen.getByText(badgeText)).toHaveClass('feature-badge')
  })
  
  it('applies custom icon color', () => {
    const iconColor = '#ff0000'
    render(<FeatureCard {...defaultProps} icon="mdi:star" iconColor={iconColor} />)
    
    // Check that the icon has the correct color
    const icon = screen.getByTestId('mocked-icon')
    expect(icon).toHaveStyle({ color: iconColor })
  })
  
  it('applies custom badge color', () => {
    const badgeColor = '#ff0000'
    render(<FeatureCard {...defaultProps} badgeText="New" badgeColor={badgeColor} />)
    
    // Check that the badge has the correct background color
    const badge = screen.getByText('New')
    expect(badge).toHaveStyle({ backgroundColor: badgeColor })
  })
  
  it('applies additional className', () => {
    const className = 'custom-class'
    render(<FeatureCard {...defaultProps} className={className} />)
    
    // Check that the card has the additional class
    const card = screen.getByText(defaultProps.title).closest('.feature-card')
    expect(card).toHaveClass(className)
  })
  
  it('does not render icon when not provided', () => {
    render(<FeatureCard {...defaultProps} />)
    
    // Check that no icon is rendered
    expect(screen.queryByTestId('mocked-icon')).not.toBeInTheDocument()
    expect(document.querySelector('.feature-icon')).not.toBeInTheDocument()
  })
  
  it('does not render badge when not provided', () => {
    render(<FeatureCard {...defaultProps} />)
    
    // Check that no badge is rendered
    expect(document.querySelector('.feature-badge')).not.toBeInTheDocument()
  })
})
