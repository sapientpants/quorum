import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText(/Quorum - Multi-LLM Chat/i)).toBeInTheDocument()
  })

  it('renders the welcome message', () => {
    render(<App />)
    expect(screen.getByText(/Welcome to Quorum! This is where your conversation will appear./i)).toBeInTheDocument()
  })

  it('renders the chat input', () => {
    render(<App />)
    expect(screen.getByPlaceholderText(/Enter your OpenAI API key above to start chatting.../i)).toBeInTheDocument()
    expect(screen.getByText(/Send/i)).toBeInTheDocument()
  })

  it('renders the API key input', () => {
    render(<App />)
    const apiKeyInput = screen.getByPlaceholderText('Enter your OpenAI API key')
    expect(apiKeyInput).toBeInTheDocument()
    expect(apiKeyInput.getAttribute('type')).toBe('password')
    expect(screen.getByText(/OpenAI API Key/i)).toBeInTheDocument()
  })
}) 