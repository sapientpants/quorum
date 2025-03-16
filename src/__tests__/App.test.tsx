import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from '../App'

// Mock window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

// Mock the react-router-dom components
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="router-provider">{children}</div>
  )
}))

// Mock the routes
vi.mock('../routes', () => ({
  AppRoutes: () => <div data-testid="app-routes">App Routes</div>
}))

// Mock the ThemeProvider
vi.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  )
}))

// Mock the ErrorProvider
vi.mock('../contexts/ErrorContext', () => ({
  ErrorProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-provider">{children}</div>
  )
}))

// Mock Toaster
vi.mock('sonner', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>
}))

describe('App', () => {
  it('renders the providers and router', () => {
    render(<App />)
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
    expect(screen.getByTestId('error-provider')).toBeInTheDocument()
    expect(screen.getByTestId('router-provider')).toBeInTheDocument()
    expect(screen.getByTestId('app-routes')).toBeInTheDocument()
    expect(screen.getByTestId('toaster')).toBeInTheDocument()
  })
})
