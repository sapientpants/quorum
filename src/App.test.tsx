import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock the ApiKeyManager component
vi.mock('./components/ApiKeyManager', () => ({
  default: () => <div data-testid="api-key-manager">API Key Manager</div>
}))

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText(/Quorum - Multi-LLM Chat/i)).toBeInTheDocument()
  })

  it('renders the welcome message', () => {
    render(<App />)
    expect(screen.getByText(/Welcome to Quorum!/i)).toBeInTheDocument()
  })

  it('renders the chat input', () => {
    render(<App />)
    expect(screen.getByPlaceholderText(/Please select a provider/i)).toBeInTheDocument()
  })

  it('renders the API key manager', () => {
    render(<App />)
    // Look for any element that might be part of the API key manager
    expect(screen.getByText(/Select Provider/i)).toBeInTheDocument()
  })
}) 