import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatList } from '../ChatList'
import type { Message } from '../../types/chat'

// Mock the ChatMessage component
vi.mock('../ChatMessage', () => ({
  ChatMessage: vi.fn(({ message, onRetry }) => (
    <div data-testid={`chat-message-${message.id}`}>
      <span>{message.text}</span>
      {message.status === 'error' && onRetry && (
        <button 
          data-testid={`retry-button-${message.id}`}
          onClick={() => onRetry(message.id)}
        >
          Retry
        </button>
      )}
    </div>
  ))
}))

// Mock the ChatScrollAnchor component
vi.mock('../ChatScrollAnchor', () => ({
  ChatScrollAnchor: vi.fn(() => <div data-testid="chat-scroll-anchor" />)
}))

describe('ChatList', () => {
  // Sample messages for testing
  const sampleMessages: Message[] = [
    {
      id: '1',
      senderId: 'user',
      text: 'Hello, how are you?',
      timestamp: Date.now() - 5000
    },
    {
      id: '2',
      senderId: 'openai',
      text: 'I am doing well, thank you for asking!',
      timestamp: Date.now() - 3000,
      provider: 'openai',
      model: 'gpt-4'
    },
    {
      id: '3',
      senderId: 'user',
      text: 'What can you help me with today?',
      timestamp: Date.now() - 1000
    }
  ]
  
  it('renders a list of messages', () => {
    render(<ChatList messages={sampleMessages} />)
    
    // Check that each message is rendered
    expect(screen.getByTestId('chat-message-1')).toBeInTheDocument()
    expect(screen.getByTestId('chat-message-2')).toBeInTheDocument()
    expect(screen.getByTestId('chat-message-3')).toBeInTheDocument()
    
    // Check that the scroll anchor is rendered
    expect(screen.getByTestId('chat-scroll-anchor')).toBeInTheDocument()
  })
  
  it('renders a loading indicator when isLoading is true', () => {
    render(<ChatList messages={sampleMessages} isLoading={true} />)
    
    // Check that the loading indicator is rendered
    expect(screen.getByText('', { selector: '.loading-dots' })).toBeInTheDocument()
  })
  
  it('does not render a loading indicator when isLoading is false', () => {
    render(<ChatList messages={sampleMessages} isLoading={false} />)
    
    // Check that the loading indicator is not rendered
    expect(screen.queryByText('', { selector: '.loading-dots' })).not.toBeInTheDocument()
  })
  
  it('passes the onRetry function to ChatMessage', async () => {
    const onRetryMock = vi.fn()
    
    // Create a message with error status
    const messagesWithError: Message[] = [
      ...sampleMessages,
      {
        id: '4',
        senderId: 'user',
        text: 'This message failed to send',
        timestamp: Date.now(),
        status: 'error',
        error: new Error('Failed to send message')
      }
    ]
    
    render(<ChatList messages={messagesWithError} onRetry={onRetryMock} />)
    
    // Find the retry button and click it
    const retryButton = screen.getByTestId('retry-button-4')
    await userEvent.click(retryButton)
    
    // Check that onRetry was called with the correct message ID
    expect(onRetryMock).toHaveBeenCalledWith('4')
  })
  
  it('renders correctly with empty messages array', () => {
    render(<ChatList messages={[]} />)
    
    // Only the scroll anchor should be rendered
    expect(screen.getByTestId('chat-scroll-anchor')).toBeInTheDocument()
    expect(screen.queryByTestId(/chat-message-/)).not.toBeInTheDocument()
  })
  
  it('renders messages in the correct order', () => {
    const { container } = render(<ChatList messages={sampleMessages} />)
    
    // Get all message elements
    const messageElements = container.querySelectorAll('[data-testid^="chat-message-"]')
    
    // Check that they are in the correct order
    expect(messageElements[0]).toHaveAttribute('data-testid', 'chat-message-1')
    expect(messageElements[1]).toHaveAttribute('data-testid', 'chat-message-2')
    expect(messageElements[2]).toHaveAttribute('data-testid', 'chat-message-3')
  })
})
