import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProviderSelector from '../ProviderSelector'
import type { LLMProvider } from '../../types/llm'

describe('ProviderSelector', () => {
  // Mock providers for testing
  const mockProviders: LLMProvider[] = [
    { id: 'openai', displayName: 'OpenAI', models: ['gpt-4', 'gpt-3.5-turbo'] },
    { id: 'anthropic', displayName: 'Anthropic', models: ['claude-3-opus', 'claude-3-sonnet'] },
    { id: 'google', displayName: 'Google', models: ['gemini-pro'] }
  ]
  
  const mockOnSelect = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('renders all providers as buttons', () => {
    const apiKeys = { openai: 'key1', anthropic: 'key2', google: 'key3' }
    
    render(
      <ProviderSelector 
        providers={mockProviders} 
        activeProvider={null} 
        onSelect={mockOnSelect} 
        apiKeys={apiKeys}
      />
    )
    
    // Check that the label is rendered
    expect(screen.getByText('Select Provider')).toBeInTheDocument()
    
    // Check that all provider buttons are rendered
    mockProviders.forEach(provider => {
      expect(screen.getByText(provider.displayName)).toBeInTheDocument()
    })
    
    // Check that no buttons are disabled
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).not.toBeDisabled()
    })
  })
  
  it('highlights the active provider', () => {
    const apiKeys = { openai: 'key1', anthropic: 'key2', google: 'key3' }
    const activeProvider = mockProviders[1] // Anthropic
    
    render(
      <ProviderSelector 
        providers={mockProviders} 
        activeProvider={activeProvider} 
        onSelect={mockOnSelect} 
        apiKeys={apiKeys}
      />
    )
    
    // Get all buttons
    const buttons = screen.getAllByRole('button')
    
    // Check that the active provider button has the primary class
    const activeButton = screen.getByText('Anthropic')
    expect(activeButton).toHaveClass('btn-primary')
    
    // Check that other buttons don't have the primary class
    const inactiveButtons = buttons.filter(button => button !== activeButton)
    inactiveButtons.forEach(button => {
      expect(button).toHaveClass('btn-outline')
      expect(button).not.toHaveClass('btn-primary')
    })
  })
  
  it('disables providers without API keys', () => {
    // Only OpenAI has an API key
    const apiKeys = { openai: 'key1' }
    
    render(
      <ProviderSelector 
        providers={mockProviders} 
        activeProvider={null} 
        onSelect={mockOnSelect} 
        apiKeys={apiKeys}
      />
    )
    
    // Check that OpenAI button is enabled
    const openaiButton = screen.getByText('OpenAI')
    expect(openaiButton).not.toBeDisabled()
    
    // Check that other buttons are disabled and show "No API Key" text
    expect(screen.getByText('Anthropic (No API Key)')).toBeDisabled()
    expect(screen.getByText('Google (No API Key)')).toBeDisabled()
  })
  
  it('calls onSelect when a provider is clicked', () => {
    const apiKeys = { openai: 'key1', anthropic: 'key2', google: 'key3' }
    
    render(
      <ProviderSelector 
        providers={mockProviders} 
        activeProvider={null} 
        onSelect={mockOnSelect} 
        apiKeys={apiKeys}
      />
    )
    
    // Click on the Anthropic button
    const anthropicButton = screen.getByText('Anthropic')
    fireEvent.click(anthropicButton)
    
    // Check that onSelect was called with the correct provider
    expect(mockOnSelect).toHaveBeenCalledTimes(1)
    expect(mockOnSelect).toHaveBeenCalledWith(mockProviders[1])
  })
  
  it('does not call onSelect when a disabled provider is clicked', () => {
    // Only OpenAI has an API key
    const apiKeys = { openai: 'key1' }
    
    render(
      <ProviderSelector 
        providers={mockProviders} 
        activeProvider={null} 
        onSelect={mockOnSelect} 
        apiKeys={apiKeys}
      />
    )
    
    // Try to click on the disabled Anthropic button
    const anthropicButton = screen.getByText('Anthropic (No API Key)')
    fireEvent.click(anthropicButton)
    
    // Check that onSelect was not called
    expect(mockOnSelect).not.toHaveBeenCalled()
  })
})
