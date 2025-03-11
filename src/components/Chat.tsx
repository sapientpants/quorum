import ChatList from './ChatList'
import ChatInput from './ChatInput'
import ApiKeyManager from './ApiKeyManager'
import ProviderSelector from './ProviderSelector'
import ModelSelector from './ModelSelector'
import SettingsPanel from './SettingsPanel'
import ErrorDisplay from './ErrorDisplay'
import { useChat } from '../contexts/ChatContext'

/**
 * Chat component that uses the ChatContext for state management
 */
export function Chat() {
  // Use the chat context for state and actions
  const {
    // Messages
    messages,
    isLoading,
    error,
    
    // Provider and model selection
    activeProvider,
    setActiveProvider,
    activeModel,
    setActiveModel,
    availableModels,
    apiKeys,
    handleApiKeyChange,
    supportedProviders,
    isStreamingSupported,
    
    // Settings
    settings,
    setSettings,
    useStreaming,
    setUseStreaming,
    
    // Actions
    sendMessage,
    handleRetry,
    clearError
  } = useChat()

  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-64px)]">
      <div className="mb-4">
        <ApiKeyManager onApiKeyChange={handleApiKeyChange} />
      </div>
      
      {/* Provider and Model Selection */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProviderSelector
          providers={supportedProviders}
          activeProvider={activeProvider}
          onSelect={setActiveProvider}
          apiKeys={apiKeys}
        />
        
        {activeProvider && (
          <ModelSelector
            models={availableModels}
            activeModel={activeModel}
            onSelect={setActiveModel}
          />
        )}
      </div>
      
      {/* Settings Panel */}
      <SettingsPanel
        settings={settings}
        onSettingsChange={setSettings}
        useStreaming={useStreaming}
        onStreamingChange={setUseStreaming}
        isStreamingSupported={isStreamingSupported()}
      />
      
      {/* Error Display */}
      <ErrorDisplay error={error} onDismiss={clearError} />
      
      {/* Chat Messages */}
      <div className="flex-grow bg-base-200 rounded-lg p-4 mb-4 overflow-y-auto border border-gray-700 shadow-md">
        <ChatList 
          messages={messages} 
          isLoading={isLoading} 
          onRetry={handleRetry}
        />
      </div>
      
      {/* Chat Input */}
      <div className="bg-base-100 rounded-lg p-4 shadow-md card-enhanced">
        <ChatInput 
          onSendMessage={sendMessage} 
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

export default Chat