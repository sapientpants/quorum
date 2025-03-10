import * as React from 'react'
import { useState, KeyboardEvent } from 'react'

interface ChatInputProps {
  onSendMessage: (text: string) => void
  isLoading?: boolean
  placeholder?: string
  disabled?: boolean
}

export function ChatInput({ 
  onSendMessage, 
  isLoading = false, 
  placeholder = "Type your message here...",
  disabled = false
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  function handleSend() {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message)
      setMessage('')
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2">
      <textarea
        className="textarea textarea-bordered flex-grow resize-none"
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        disabled={isLoading || disabled}
      />
      <button 
        className="btn btn-primary" 
        onClick={handleSend}
        disabled={!message.trim() || isLoading || disabled}
      >
        {isLoading ? (
          <span className="loading loading-spinner"></span>
        ) : (
          'Send'
        )}
      </button>
    </div>
  )
}

// Add default export
export default ChatInput 