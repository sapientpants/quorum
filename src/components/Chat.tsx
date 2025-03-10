import { useState, useEffect } from 'react'
import ChatList from './ChatList'
import ChatInput from './ChatInput'
import ApiKeyManager from './ApiKeyManager'
import type { Message } from '../types/chat'
import type { LLMSettings, LLMProvider, LLMModel } from '../types/api'
import { nanoid } from 'nanoid'
import { 
  sendMessageToLLM, 
  getAvailableModels, 
  getDefaultModel, 
  getSupportedProviders,
  supportsStreaming
} from '../services/llm'

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'system',
      text: 'Welcome to Quorum! Please select a provider and add an API key to start chatting.',
      timestamp: Date.now()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [activeProvider, setActiveProvider] = useState<LLMProvider | null>(null)
  const [activeModel, setActiveModel] = useState<LLMModel | null>(null)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [settings, setSettings] = useState<LLMSettings>({
    temperature: 0.7,
    maxTokens: 1000
  })
  const [useStreaming, setUseStreaming] = useState<boolean>(true)

  // Update available models when provider changes
  useEffect(() => {
    if (activeProvider) {
      const models = getAvailableModels(activeProvider)
      setAvailableModels(models)
      
      // Set default model for the provider
      const defaultModel = getDefaultModel(activeProvider)
      setActiveModel(defaultModel)
    } else {
      setAvailableModels([])
      setActiveModel(null)
    }
  }, [activeProvider])

  async function handleSendMessage(text: string) {
    if (!text.trim()) return
    
    // Clear any previous errors
    setError(null)

    // Check if a provider is selected
    if (!activeProvider) {
      setError('Please select a provider to continue')
      return
    }

    // Check if API key is provided for the active provider
    if (!apiKeys[activeProvider]) {
      setError(`Please enter your ${activeProvider} API key to continue`)
      return
    }

    // Check if a model is selected
    if (!activeModel) {
      setError('Please select a model to continue')
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
    
    // Add a placeholder for the AI response
    const aiMessageId = nanoid()
    const aiPlaceholder: Message = {
      id: aiMessageId,
      senderId: 'assistant',
      text: '',
      timestamp: Date.now(),
      provider: activeProvider,
      model: activeModel,
      status: 'sending'
    }
    
    setMessages(prev => [...prev, aiPlaceholder])
    setIsLoading(true)
    
    try {
      // Check if streaming is supported and enabled
      const canStream = useStreaming && supportsStreaming(activeProvider)
      
      if (canStream) {
        // Use streaming API
        await sendMessageToLLM(
          [...messages, userMessage], 
          activeProvider,
          apiKeys[activeProvider],
          activeModel,
          settings,
          {
            onToken: (token) => {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, text: msg.text + token } 
                    : msg
                )
              )
            },
            onComplete: (fullText) => {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, text: fullText, status: 'sent' } 
                    : msg
                )
              )
              setIsLoading(false)
            },
            onError: (err) => {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { 
                        ...msg, 
                        text: `Error: ${err.message}`, 
                        status: 'error',
                        error: err
                      } 
                    : msg
                )
              )
              setError(err.message)
              setIsLoading(false)
            }
          }
        )
      } else {
        // Use standard API
        const responseText = await sendMessageToLLM(
          [...messages, userMessage], 
          activeProvider,
          apiKeys[activeProvider],
          activeModel,
          settings
        )
        
        // Update the AI response
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: responseText, status: 'sent' } 
              : msg
          )
        )
        setIsLoading(false)
      }
    } catch (err) {
      console.error(`Error calling ${activeProvider}:`, err)
      
      // Update the AI message with error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { 
                ...msg, 
                text: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`, 
                status: 'error',
                error: err instanceof Error ? err : new Error('Unknown error')
              } 
            : msg
        )
      )
      
      setError(err instanceof Error ? err.message : `An error occurred while calling the ${activeProvider} API`)
      setIsLoading(false)
    }
  }

  function handleApiKeyChange(provider: string, apiKey: string) {
    setApiKeys(prev => ({
      ...prev,
      [provider]: apiKey
    }))
    
    setError(null) // Clear any API key related errors
  }

  function handleRetry(messageId: string) {
    // Find the message to retry
    const messageToRetry = messages.find(msg => msg.id === messageId)
    if (!messageToRetry || messageToRetry.status !== 'error') return
    
    // Find the last user message before this one
    const userMessages = messages.filter(msg => msg.senderId === 'user')
    const lastUserMessage = userMessages[userMessages.length - 1]
    
    if (lastUserMessage) {
      // Remove the error message
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      
      // Resend the last user message
      handleSendMessage(lastUserMessage.text)
    }
  }

  // Get all supported providers
  const supportedProviders = getSupportedProviders()

  // Check if the active provider supports streaming
  const isStreamingSupported = activeProvider ? supportsStreaming(activeProvider) : false

  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-64px)]">
      <div className="mb-4">
        <ApiKeyManager onApiKeyChange={handleApiKeyChange} />
      </div>
      
      {/* Provider and Model Selection */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Provider selector */}
        <div>
          <label className="label">
            <span className="label-text">Select Provider</span>
          </label>
          <div className="btn-group">
            {supportedProviders.map(provider => (
              <button
                key={provider}
                className={`btn btn-sm ${provider === activeProvider ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveProvider(provider)}
                disabled={!apiKeys[provider]}
              >
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
                {!apiKeys[provider] && ' (No API Key)'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Model selector (only show if provider is selected) */}
        {activeProvider && availableModels.length > 0 && (
          <div>
            <label className="label">
              <span className="label-text">Select Model</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={activeModel || ''}
              onChange={(e) => setActiveModel(e.target.value)}
            >
              <option value="" disabled>Select a model</option>
              {availableModels.map(model => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Settings */}
      <div className="mb-4 collapse collapse-arrow bg-base-200">
        <input type="checkbox" /> 
        <div className="collapse-title font-medium">
          Advanced Settings
        </div>
        <div className="collapse-content grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Temperature */}
          <div>
            <label className="label">
              <span className="label-text">Temperature</span>
              <span className="label-text-alt">{settings.temperature}</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              className="range range-sm" 
              value={settings.temperature}
              onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
            />
            <div className="flex justify-between text-xs px-2">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
          
          {/* Max Tokens */}
          <div>
            <label className="label">
              <span className="label-text">Max Tokens</span>
              <span className="label-text-alt">{settings.maxTokens}</span>
            </label>
            <input 
              type="range" 
              min="100" 
              max="4000" 
              step="100" 
              className="range range-sm" 
              value={settings.maxTokens}
              onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
            />
            <div className="flex justify-between text-xs px-2">
              <span>Short</span>
              <span>Long</span>
            </div>
          </div>
          
          {/* Streaming toggle (only show if supported) */}
          {isStreamingSupported && (
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Enable streaming</span>
                <input 
                  type="checkbox" 
                  className="toggle toggle-primary" 
                  checked={useStreaming}
                  onChange={(e) => setUseStreaming(e.target.checked)}
                />
              </label>
              <span className="text-xs opacity-70">
                Streaming shows responses as they are generated
              </span>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      <div className="flex-grow bg-base-200 rounded-lg p-4 mb-4 overflow-y-auto">
        <ChatList 
          messages={messages} 
          isLoading={isLoading} 
          onRetry={handleRetry}
        />
      </div>
      
      <div className="bg-base-100 rounded-lg p-4 shadow-md">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
          placeholder={!activeProvider 
            ? "Please select a provider to start chatting..." 
            : !apiKeys[activeProvider] 
              ? `Please add a ${activeProvider} API key to start chatting...` 
              : !activeModel
                ? "Please select a model to start chatting..."
                : "Type your message here..."
          }
          disabled={!activeProvider || !apiKeys[activeProvider] || !activeModel}
        />
      </div>
    </div>
  )
}

// Add default export
export default Chat 