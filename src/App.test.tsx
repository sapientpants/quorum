import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

// Mock the RouterProvider and createBrowserRouter
vi.mock('react-router-dom', () => ({
  RouterProvider: () => <div data-testid="router-provider">Router Provider</div>,
  createBrowserRouter: vi.fn(() => ({})),
}))

describe('App', () => {
  it('renders the router provider', () => {
    render(<App />)
    expect(screen.getByTestId('router-provider')).toBeInTheDocument()
  })
})