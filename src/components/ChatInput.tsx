import React, { useState, FormEvent } from 'react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
  placeholder?: string
}

function ChatInput({ 
  onSendMessage, 
  isLoading = false, 
  placeholder = "Type your message here..." 
}: ChatInputProps) {
  const [input, setInput] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    
    if (!input.trim()) return
    
    onSendMessage(input)
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="input input-bordered flex-grow"
        disabled={isLoading}
      />
      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={isLoading || !input.trim()}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          'Send'
        )}
      </button>
    </form>
  )
}

export default ChatInput 