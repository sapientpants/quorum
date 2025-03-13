import React, { useState } from 'react'
import { ApiKeyTestModal, ApiKeyTestResult } from './api-key-test-modal'

interface Provider {
  id: string
  name: string
  description: string
  helpUrl: string
}

const providers: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Access GPT-4, GPT-3.5 and other OpenAI models',
    helpUrl: 'https://platform.openai.com/account/api-keys'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Access Claude and other Anthropic models',
    helpUrl: 'https://console.anthropic.com/account/keys'
  },
  {
    id: 'grok',
    name: 'Grok',
    description: 'Access Grok models',
    helpUrl: 'https://grok.x.ai'
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Access Gemini and other Google AI models',
    helpUrl: 'https://makersuite.google.com/app/apikey'
  }
]

interface ApiKeyManagementProps {
  apiKeys: Record<string, string>
  onClearKey: (providerId: string) => void
  onTestKey: (providerId: string) => Promise<ApiKeyTestResult>
}

export function ApiKeyManagement({ apiKeys, onClearKey, onTestKey }: ApiKeyManagementProps) {
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [testResult, setTestResult] = useState<ApiKeyTestResult>({
    success: false,
    message: '',
    models: []
  })
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})

  const handleTestKey = async (providerId: string) => {
    setIsLoading(prev => ({ ...prev, [providerId]: true }))
    try {
      const result = await onTestKey(providerId)
      setTestResult(result)
      setTestModalOpen(true)
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred while testing the API key',
        models: []
      })
      setTestModalOpen(true)
    } finally {
      setIsLoading(prev => ({ ...prev, [providerId]: false }))
    }
  }

  const maskApiKey = (key: string) => {
    if (!key) return ''
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold mb-6">API Key Management</h1>
      
      <div className="grid gap-6">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="bg-white rounded-lg shadow p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{provider.name}</h2>
                <p className="text-gray-600">{provider.description}</p>
              </div>
              <a
                href={provider.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Get API Key
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-grow">
                <div className="bg-gray-100 p-3 rounded">
                  {apiKeys[provider.id] ? (
                    <code>{maskApiKey(apiKeys[provider.id])}</code>
                  ) : (
                    <span className="text-gray-500">No API key set</span>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTestKey(provider.id)}
                  disabled={!apiKeys[provider.id] || isLoading[provider.id]}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading[provider.id] ? 'Testing...' : 'Test Key'}
                </button>
                
                <button
                  onClick={() => onClearKey(provider.id)}
                  disabled={!apiKeys[provider.id]}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ApiKeyTestModal
        isOpen={testModalOpen}
        testResult={testResult}
        onClose={() => setTestModalOpen(false)}
      />
    </div>
  )
} 