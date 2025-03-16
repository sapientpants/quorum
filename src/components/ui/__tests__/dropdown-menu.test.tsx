import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '../dropdown-menu'

// Define types for the mock components
type DropdownComponentProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode
  className?: string
  open?: boolean
  sideOffset?: number
  inset?: boolean
  variant?: 'default' | 'destructive'
}

// Mock Radix UI DropdownMenu components
vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children, ...props }: DropdownComponentProps) => (
    <div data-testid="dropdown-root" {...props}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: DropdownComponentProps) => (
    <button data-testid="dropdown-trigger" {...props}>
      {children}
    </button>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-portal">{children}</div>
  ),
  Content: ({ className, children, ...props }: DropdownComponentProps) => (
    <div data-testid="dropdown-content" className={className} {...props}>
      {children}
    </div>
  ),
  Item: ({ className, children, ...props }: DropdownComponentProps) => (
    <div data-testid="dropdown-item" className={className} {...props}>
      {children}
    </div>
  )
}))

// Mock the cn utility function
vi.mock('../../../lib/utils', () => ({
  cn: (...inputs: (string | undefined | null | false | Record<string, boolean>)[]) => 
    inputs.filter(Boolean).join(' ')
}))

describe('DropdownMenu Components', () => {
  describe('DropdownMenu', () => {
    it('renders the root component with props', () => {
      render(<DropdownMenu open={true} />)
      
      const dropdownRoot = screen.getByTestId('dropdown-root')
      expect(dropdownRoot).toBeInTheDocument()
      expect(dropdownRoot).toHaveAttribute('data-slot', 'dropdown-menu')
    })
  })

  describe('DropdownMenuTrigger', () => {
    it('renders the trigger component with props', () => {
      render(<DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>)
      
      const trigger = screen.getByTestId('dropdown-trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('data-slot', 'dropdown-menu-trigger')
      expect(trigger).toHaveTextContent('Open Menu')
    })
  })

  describe('DropdownMenuContent', () => {
    it('renders content with default classes and sideOffset', () => {
      render(
        <DropdownMenuContent>
          <div data-testid="dropdown-children">Content</div>
        </DropdownMenuContent>
      )
      
      const content = screen.getByTestId('dropdown-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveAttribute('data-slot', 'dropdown-menu-content')
      expect(content).toHaveClass('bg-popover')
      expect(content).toHaveClass('rounded-md')
      expect(content).toHaveAttribute('sideOffset', '4') // Default sideOffset
      
      // Check that children are rendered
      expect(screen.getByTestId('dropdown-children')).toBeInTheDocument()
    })
    
    it('applies custom sideOffset', () => {
      render(
        <DropdownMenuContent sideOffset={8}>
          Content
        </DropdownMenuContent>
      )
      
      const content = screen.getByTestId('dropdown-content')
      expect(content).toHaveAttribute('sideOffset', '8')
    })
    
    it('applies additional className to content', () => {
      render(
        <DropdownMenuContent className="custom-class">
          Content
        </DropdownMenuContent>
      )
      
      const content = screen.getByTestId('dropdown-content')
      expect(content).toHaveClass('custom-class')
    })
  })

  describe('DropdownMenuItem', () => {
    it('renders menu item with default classes', () => {
      render(<DropdownMenuItem>Menu Item</DropdownMenuItem>)
      
      const item = screen.getByTestId('dropdown-item')
      expect(item).toBeInTheDocument()
      expect(item).toHaveAttribute('data-slot', 'dropdown-menu-item')
      expect(item).toHaveAttribute('data-variant', 'default')
      expect(item).toHaveClass('flex')
      expect(item).toHaveClass('cursor-default')
      expect(item).toHaveTextContent('Menu Item')
    })
    
    it('applies inset prop', () => {
      render(<DropdownMenuItem inset>Inset Item</DropdownMenuItem>)
      
      const item = screen.getByTestId('dropdown-item')
      expect(item).toHaveAttribute('data-inset', 'true')
    })
    
    it('applies destructive variant', () => {
      render(<DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>)
      
      const item = screen.getByTestId('dropdown-item')
      expect(item).toHaveAttribute('data-variant', 'destructive')
    })
    
    it('applies additional className to item', () => {
      render(
        <DropdownMenuItem className="custom-item">
          Custom Item
        </DropdownMenuItem>
      )
      
      const item = screen.getByTestId('dropdown-item')
      expect(item).toHaveClass('custom-item')
    })
  })

  describe('DropdownMenu Integration', () => {
    it('renders a complete dropdown menu with all components', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
      
      // Check that all components are rendered
      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument()
      
      // Check for menu items
      const items = screen.getAllByTestId('dropdown-item')
      expect(items).toHaveLength(3)
      expect(items[0]).toHaveTextContent('Item 1')
      expect(items[1]).toHaveTextContent('Item 2')
      expect(items[2]).toHaveTextContent('Delete')
      expect(items[2]).toHaveAttribute('data-variant', 'destructive')
    })
  })
})
