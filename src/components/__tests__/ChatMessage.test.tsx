import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatMessage } from '../ChatMessage'
import type { Message } from '../../types/chat'
import type { LLMProviderId } from '../../types/llm'

describe('ChatMessage', () => {
  // Mock date for consistent testing
  const mockTimestamp = new Date('2025-03-16T12:30:00').getTime()
  
  // Sample user message
  const userMessage: Message = {
    id: '1',
    senderId: 'user',
    text: 'Hello, how are you?',
    timestamp: mockTimestamp
  }
  
  // Sample AI message
  const aiMessage: Message = {
    id: '2',
    senderId: 'openai',
    text: 'I am doing well, thank you for asking!',
    timestamp: mockTimestamp,
    provider: 'openai' as LLMProviderId,
    model: 'gpt-4'
  }
  
  // Sample system message
  const systemMessage: Message = {
    id: '3',
    senderId: 'system',
    text: 'This is a system message',
    timestamp: mockTimestamp
  }
  
  // Sample error message
  const errorMessage: Message = {
    id: '4',
    senderId: 'openai',
    text: 'This message failed to send',
    timestamp: mockTimestamp,
    provider: 'openai' as LLMProviderId,
    model: 'gpt-4',
    status: 'error',
    error: new Error('Failed to send message')
  }
  
  // Sample sending message
  const sendingMessage: Message = {
    id: '5',
    senderId: 'user',
    text: 'This message is being sent',
    timestamp: mockTimestamp,
    status: 'sending'
  }
  
  it('renders a user message correctly', () => {
    render(<ChatMessage message={userMessage} />)
    
    // Check that the message text is rendered
    expect(screen.getByText(userMessage.text)).toBeInTheDocument()
    
    // Check that the message has the user message styling
    const messageBubble = screen.getByText(userMessage.text).closest('.chat-bubble')
    expect(messageBubble).toHaveClass('chat-bubble-primary')
    
    // Check that the parent chat container has the correct alignment
    const chatContainer = screen.getByText(userMessage.text).closest('.chat')
    expect(chatContainer).toHaveClass('chat-end')
    
    // Check that the timestamp is rendered
    const formattedTime = new Date(mockTimestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
    expect(screen.getByText(formattedTime)).toBeInTheDocument()
  })
  
  it('renders an AI message correctly', () => {
    render(<ChatMessage message={aiMessage} />)
    
    // Check that the message text is rendered
    expect(screen.getByText(aiMessage.text)).toBeInTheDocument()
    
    // Check that the message has the AI message styling
    const messageBubble = screen.getByText(aiMessage.text).closest('.chat-bubble')
    expect(messageBubble).toHaveClass('chat-bubble')
    expect(messageBubble).not.toHaveClass('chat-bubble-primary')
    
    // Check that the parent chat container has the correct alignment
    const chatContainer = screen.getByText(aiMessage.text).closest('.chat')
    expect(chatContainer).toHaveClass('chat-start')
    
    // Check that the provider and model are rendered
    expect(screen.getByText('openai')).toBeInTheDocument()
    expect(screen.getByText('gpt-4')).toBeInTheDocument()
  })
  
  it('renders a system message correctly', () => {
    render(<ChatMessage message={systemMessage} />)
    
    // Check that the message text is rendered
    expect(screen.getByText(systemMessage.text)).toBeInTheDocument()
    
    // Check that the message has the system message styling
    const messageBubble = screen.getByText(systemMessage.text).closest('.chat-bubble')
    expect(messageBubble).toHaveClass('bg-base-300')
    
    // Check that the parent chat container has the correct alignment and opacity
    const chatContainer = screen.getByText(systemMessage.text).closest('.chat')
    expect(chatContainer).toHaveClass('chat-start')
    expect(chatContainer).toHaveClass('opacity-70')
  })
  
  it('renders an error message with retry button', () => {
    const onRetryMock = vi.fn()
    render(<ChatMessage message={errorMessage} onRetry={onRetryMock} />)
    
    // Check that the message text is rendered
    expect(screen.getByText(errorMessage.text)).toBeInTheDocument()
    
    // Check that the message has the error styling
    const messageBubble = screen.getByText(errorMessage.text).closest('.chat-bubble')
    expect(messageBubble).toHaveClass('bg-error')
    
    // Check that the retry button is rendered
    const retryButton = screen.getByText('Retry')
    expect(retryButton).toBeInTheDocument()
    
    // Check that the error message is rendered
    expect(screen.getByText('Failed to send message')).toBeInTheDocument()
    
    // Check that clicking the retry button calls onRetry with the message ID
    fireEvent.click(retryButton)
    expect(onRetryMock).toHaveBeenCalledWith(errorMessage.id)
  })
  
  it('does not render retry button when onRetry is not provided', () => {
    render(<ChatMessage message={errorMessage} />)
    
    // Check that the retry button is not rendered
    expect(screen.queryByText('Retry')).not.toBeInTheDocument()
  })
  
  it('renders a sending message with loading indicator', () => {
    render(<ChatMessage message={sendingMessage} />)
    
    // Check that the loading indicator is rendered
    expect(screen.getByText('', { selector: '.loading-dots' })).toBeInTheDocument()
    
    // Check that the message text is not rendered
    expect(screen.queryByText(sendingMessage.text)).not.toBeInTheDocument()
  })
  
  it('renders different provider icons correctly', () => {
    // Test OpenAI icon
    const openaiMessage = { ...aiMessage, provider: 'openai' as LLMProviderId }
    const { rerender } = render(<ChatMessage message={openaiMessage} />)
    
    // Check that the OpenAI icon is rendered (we can't easily check the SVG content,
    // but we can check that the provider name is rendered)
    expect(screen.getByText('openai')).toBeInTheDocument()
    
    // Test Anthropic icon
    const anthropicMessage = { ...aiMessage, provider: 'anthropic' as LLMProviderId }
    rerender(<ChatMessage message={anthropicMessage} />)
    
    // Check that the Anthropic provider name is rendered
    expect(screen.getByText('anthropic')).toBeInTheDocument()
    
    // Test Grok icon
    const grokMessage = { ...aiMessage, provider: 'grok' as LLMProviderId }
    rerender(<ChatMessage message={grokMessage} />)
    
    // Check that the Grok provider name is rendered
    expect(screen.getByText('grok')).toBeInTheDocument()
  })
})
