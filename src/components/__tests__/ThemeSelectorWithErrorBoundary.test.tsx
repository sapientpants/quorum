import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeSelectorWithErrorBoundary } from '../ThemeSelectorWithErrorBoundary'
import { ThemeContext, ThemeContextType } from '../../contexts/contexts/ThemeContextDefinition'
import type { Theme } from '../../types/preferences'

// Mock the ThemeSelector component
vi.mock('../ThemeSelector', () => ({
  ThemeSelector: () => <div data-testid="theme-selector">Theme Selector</div>
}))

// Mock the ErrorBoundary component
vi.mock('../ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children, fallback, onError }: { 
    children: React.ReactNode, 
    fallback?: React.ReactNode,
    onError?: (error: Error) => void 
  }) => {
    // Store the onError callback for testing
    if (onError) {
      (vi.mocked(ErrorBoundaryMock).onError as unknown) = onError
    }
    
    return (
      <div data-testid="error-boundary">
        {children}
        <div data-testid="fallback" style={{ display: 'none' }}>{fallback}</div>
      </div>
    )
  }
}))

// Mock the Iconify Icon component
vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => (
    <div data-testid="icon" data-icon={icon}></div>
  )
}))

// Mock the HeroUI Button component
vi.mock('@heroui/react', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <button data-testid="button" onClick={onClick}>{children}</button>
  )
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'theme.toggle': 'Toggle Theme'
      }
      return translations[key] || key
    }
  })
}))

// Create a mock for the ErrorBoundary for testing
const ErrorBoundaryMock = {
  onError: null
}

describe('ThemeSelectorWithErrorBoundary', () => {
  // Mock theme context
  const mockToggleTheme = vi.fn()
  const mockThemeContext: ThemeContextType = {
    theme: 'light' as Theme,
    effectiveTheme: 'light' as Theme,
    systemPreference: 'light',
    isDark: false,
    isLight: true,
    toggleTheme: mockToggleTheme,
    setTheme: vi.fn()
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
    ErrorBoundaryMock.onError = null
  })
  
  it('renders the ThemeSelector inside an ErrorBoundary', () => {
    render(
      <ThemeContext.Provider value={mockThemeContext}>
        <ThemeSelectorWithErrorBoundary />
      </ThemeContext.Provider>
    )
    
    // Check that the ErrorBoundary is rendered
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
    
    // Check that the ThemeSelector is rendered
    expect(screen.getByTestId('theme-selector')).toBeInTheDocument()
  })
  
  it('provides a fallback component to the ErrorBoundary', () => {
    render(
      <ThemeContext.Provider value={mockThemeContext}>
        <ThemeSelectorWithErrorBoundary />
      </ThemeContext.Provider>
    )
    
    // Check that the fallback is provided
    const fallback = screen.getByTestId('fallback')
    expect(fallback).toBeInTheDocument()
    
    // The fallback should contain a button
    expect(fallback.querySelector('[data-testid="button"]')).toBeInTheDocument()
  })
  
  it('provides an onError callback to the ErrorBoundary', () => {
    render(
      <ThemeContext.Provider value={mockThemeContext}>
        <ThemeSelectorWithErrorBoundary />
      </ThemeContext.Provider>
    )
    
    // Check that the onError callback is provided
    expect(ErrorBoundaryMock.onError).toBeDefined()
    
    // Mock console.error for testing the error callback
    const originalConsoleError = console.error
    console.error = vi.fn()
    
    // Call the onError callback
    const error = new Error('Test error')
    const onErrorFn = ErrorBoundaryMock.onError as unknown as (error: Error) => void
    onErrorFn(error)
    
    // Check that console.error was called with the error
    expect(console.error).toHaveBeenCalledWith('ThemeSelector error:', error)
    
    // Restore console.error
    console.error = originalConsoleError
  })
  
  it('renders a fallback with correct theme icon', () => {
    // Test with dark theme
    const darkThemeContext: ThemeContextType = {
      ...mockThemeContext,
      theme: 'dark' as Theme,
      effectiveTheme: 'dark' as Theme,
      isDark: true,
      isLight: false
    }
    
    render(
      <ThemeContext.Provider value={darkThemeContext}>
        <ThemeSelectorWithErrorBoundary />
      </ThemeContext.Provider>
    )
    
    // Get the fallback component
    const fallback = screen.getByTestId('fallback')
    
    // Check that the icon in the fallback has the moon icon for dark theme
    const icon = fallback.querySelector('[data-testid="icon"]')
    expect(icon).toHaveAttribute('data-icon', 'solar:moon-linear')
  })
})
