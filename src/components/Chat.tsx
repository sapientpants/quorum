import React, { useState } from 'react'
import ChatList from './ChatList'
import ChatInput from './ChatInput'
import type { Message } from '../types/chat'
import { nanoid } from 'nanoid'

function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'system',
      text: 'Welcome to Quorum! This is where your conversation will appear.',
      timestamp: Date.now()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)

  // This function will be replaced with actual API calls in future iterations
  function handleSendMessage(text: string) {
    if (!text.trim()) return

    // Add user message
    const userMessage: Message = {
      id: nanoid(),
      senderId: 'user',
      text,
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    
    // Simulate AI response (will be replaced with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: nanoid(),
        senderId: 'assistant',
        text: `This is a simulated response to: "${text}"`,
        timestamp: Date.now(),
        provider: 'openai',
        model: 'gpt-4o',
        role: 'Assistant'
      }
      
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-grow bg-base-200 rounded-lg p-4 mb-4 overflow-y-auto">
        <ChatList messages={messages} isLoading={isLoading} />
      </div>
      
      <div className="bg-base-100 rounded-lg p-4 shadow-md">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  )
}

export default Chat 