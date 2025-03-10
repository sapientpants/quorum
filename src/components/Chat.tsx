import { useState } from 'react'
import ChatList from './ChatList'
import ChatInput from './ChatInput'
import ApiKeyManager from './ApiKeyManager'
import type { Message } from '../types/chat'
import { nanoid } from 'nanoid'
import { callOpenAI } from '../services/openai'

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
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [activeProvider, setActiveProvider] = useState<string>('openai')

  async function handleSendMessage(text: string) {
    if (!text.trim()) return
    
    // Clear any previous errors
    setError(null)

    // Check if API key is provided for the active provider
    if (!apiKeys[activeProvider]) {
      setError(`Please enter your ${activeProvider} API key to continue`)
      return
    }

    // Add user message
    const userMessage: Message = {
      id: nanoid(),
      senderId: 'user',
      text,
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    
    try {
      // Call OpenAI API (for now, we'll expand this in the next iteration)
      const responseText = await callOpenAI(
        [...messages, userMessage], 
        apiKeys[activeProvider],
        'gpt-4o',
        0.7,
        1000
      )
      
      // Add AI response
      const aiMessage: Message = {
        id: nanoid(),
        senderId: 'assistant',
        text: responseText,
        timestamp: Date.now(),
        provider: activeProvider,
        model: 'gpt-4o',
        role: 'Assistant'
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.error(`Error calling ${activeProvider}:`, err)
      setError(err instanceof Error ? err.message : `An error occurred while calling the ${activeProvider} API`)
    } finally {
      setIsLoading(false)
    }
  }

  function handleApiKeyChange(provider: string, apiKey: string) {
    setApiKeys(prev => ({
      ...prev,
      [provider]: apiKey
    }))
    
    // If this is the first key being added, set it as active
    if (Object.keys(apiKeys).length === 0) {
      setActiveProvider(provider)
    }
    
    setError(null) // Clear any API key related errors
  }

  // Get available providers (those with API keys)
  const availableProviders = Object.keys(apiKeys).filter(provider => apiKeys[provider])

  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-64px)]">
      <div className="mb-4">
        <ApiKeyManager onApiKeyChange={handleApiKeyChange} />
      </div>
      
      {/* Provider selector (only show if we have multiple providers) */}
      {availableProviders.length > 1 && (
        <div className="mb-4">
          <label className="label">
            <span className="label-text">Active Provider</span>
          </label>
          <div className="btn-group">
            {availableProviders.map(provider => (
              <button
                key={provider}
                className={`btn btn-sm ${provider === activeProvider ? 'bg-base-300' : ''}`}
                onClick={() => setActiveProvider(provider)}
              >
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      <div className="flex-grow bg-base-200 rounded-lg p-4 mb-4 overflow-y-auto">
        <ChatList messages={messages} isLoading={isLoading} />
      </div>
      
      <div className="bg-base-100 rounded-lg p-4 shadow-md">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
          placeholder={!apiKeys[activeProvider] 
            ? `Please add a ${activeProvider} API key to start chatting...` 
            : "Type your message here..."
          }
        />
      </div>
    </div>
  )
}

export default Chat 