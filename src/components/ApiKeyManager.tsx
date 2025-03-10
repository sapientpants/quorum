import { useState, useEffect } from 'react'
import type { ApiKey, ApiKeyStorageOptions } from '../types/api'
import { 
  validateApiKey, 
  saveApiKeys, 
  loadApiKeys, 
  createApiKey, 
  clearApiKeys 
} from '../services/apiKeyService'

interface ApiKeyManagerProps {
  onApiKeyChange: (provider: string, apiKey: string) => void
  initialApiKeys?: ApiKey[]
  storageOption?: ApiKeyStorageOptions
}

export function ApiKeyManager({ 
  onApiKeyChange, 
  initialApiKeys = [], 
  storageOption = { storage: 'local' } 
}: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys)
  const [selectedProvider, setSelectedProvider] = useState<string>('openai')
  const [newKeyValue, setNewKeyValue] = useState<string>('')
  const [newKeyLabel, setNewKeyLabel] = useState<string>('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [storageType, setStorageType] = useState<'local' | 'session' | 'none'>(
    storageOption.storage
  )

  // Load API keys from storage on component mount
  useEffect(() => {
    const savedKeys = loadApiKeys({ storage: storageType })
    if (savedKeys.length > 0) {
      setApiKeys(savedKeys)
      
      // Notify parent about the first key of each provider
      const providerMap = new Map<string, string>()
      savedKeys.forEach(key => {
        if (!providerMap.has(key.provider)) {
          providerMap.set(key.provider, key.key)
          onApiKeyChange(key.provider, key.key)
        }
      })
    }
  }, [onApiKeyChange, storageType])

  // Save API keys to storage when they change
  useEffect(() => {
    if (apiKeys.length > 0) {
      saveApiKeys(apiKeys, { storage: storageType })
    }
  }, [apiKeys, storageType])

  // Toggle visibility of an API key
  function toggleKeyVisibility(id: string) {
    setApiKeys(prev => 
      prev.map(key => 
        key.id === id ? { ...key, isVisible: !key.isVisible } : key
      )
    )
  }

  // Delete an API key
  function deleteApiKey(id: string) {
    setApiKeys(prev => {
      const updatedKeys = prev.filter(key => key.id !== id)
      
      // If we deleted the last key for a provider, notify parent
      const deletedKey = prev.find(key => key.id === id)
      if (deletedKey) {
        const remainingKeysForProvider = updatedKeys.filter(
          key => key.provider === deletedKey.provider
        )
        
        if (remainingKeysForProvider.length === 0) {
          // No keys left for this provider
          onApiKeyChange(deletedKey.provider, '')
        } else {
          // Use the first remaining key
          onApiKeyChange(deletedKey.provider, remainingKeysForProvider[0].key)
        }
      }
      
      return updatedKeys
    })
  }

  // Add a new API key
  function addApiKey() {
    setValidationError(null)
    
    // Validate the key
    const validation = validateApiKey(selectedProvider, newKeyValue)
    if (!validation.isValid) {
      setValidationError(validation.message || 'Invalid API key')
      return
    }
    
    // Create and add the new key
    const newKey = createApiKey(
      selectedProvider, 
      newKeyValue, 
      newKeyLabel || undefined
    )
    
    setApiKeys(prev => [...prev, newKey])
    
    // Notify parent about the new key
    onApiKeyChange(selectedProvider, newKeyValue)
    
    // Reset form
    setNewKeyValue('')
    setNewKeyLabel('')
    setIsAddingNew(false)
  }

  // Select an API key as active
  function selectApiKey(provider: string, key: string) {
    onApiKeyChange(provider, key)
  }

  // Clear all API keys
  function handleClearAllKeys() {
    if (confirm('Are you sure you want to remove all API keys? This cannot be undone.')) {
      clearApiKeys({ storage: storageType })
      setApiKeys([])
      
      // Notify parent that all keys are gone
      const providers = new Set(apiKeys.map(key => key.provider))
      providers.forEach(provider => {
        onApiKeyChange(provider, '')
      })
    }
  }

  // Change storage type
  function handleStorageTypeChange(type: 'local' | 'session' | 'none') {
    if (type !== storageType) {
      // Clear keys from the old storage
      clearApiKeys({ storage: storageType })
      
      // Set new storage type
      setStorageType(type)
      
      // If switching to 'none', clear the keys from state too
      if (type === 'none') {
        setApiKeys([])
      } else {
        // Save current keys to the new storage
        saveApiKeys(apiKeys, { storage: type })
      }
    }
  }

  // Group API keys by provider
  const keysByProvider: Record<string, ApiKey[]> = {}
  apiKeys.forEach(key => {
    if (!keysByProvider[key.provider]) {
      keysByProvider[key.provider] = []
    }
    keysByProvider[key.provider].push(key)
  })

  return (
    <div className="bg-base-200 rounded-lg p-4 mb-4">
      <h2 className="text-lg font-semibold mb-4">API Key Management</h2>
      
      {/* Storage options */}
      <div className="mb-4">
        <label className="label">
          <span className="label-text">Storage Preference</span>
        </label>
        <div className="btn-group">
          <button 
            className={`btn btn-sm ${storageType === 'local' ? 'bg-base-300' : ''}`}
            onClick={() => handleStorageTypeChange('local')}
          >
            Local Storage
          </button>
          <button 
            className={`btn btn-sm ${storageType === 'session' ? 'bg-base-300' : ''}`}
            onClick={() => handleStorageTypeChange('session')}
          >
            Session Only
          </button>
          <button 
            className={`btn btn-sm ${storageType === 'none' ? 'bg-base-300' : ''}`}
            onClick={() => handleStorageTypeChange('none')}
          >
            No Storage
          </button>
        </div>
        <label className="label">
          <span className="label-text-alt">
            {storageType === 'local' && 'Keys will be saved in your browser and persist between sessions'}
            {storageType === 'session' && 'Keys will be saved only for this session and cleared when you close the browser'}
            {storageType === 'none' && 'Keys will not be saved and will be lost when you refresh the page'}
          </span>
        </label>
      </div>
      
      {/* Existing API keys */}
      {Object.entries(keysByProvider).length > 0 ? (
        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Your API Keys</h3>
          <div className="space-y-4">
            {Object.entries(keysByProvider).map(([provider, keys]) => (
              <div key={provider} className="bg-base-100 p-3 rounded-md">
                <h4 className="font-medium capitalize mb-2">{provider}</h4>
                <div className="space-y-2">
                  {keys.map(key => (
                    <div key={key.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{key.label}</div>
                        <div className="text-sm">
                          {key.isVisible 
                            ? key.key 
                            : key.key.substring(0, 4) + '•'.repeat(Math.min(10, key.key.length - 8)) + key.key.substring(key.key.length - 4)
                          }
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="btn btn-sm btn-ghost"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          {key.isVisible ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                        <button 
                          className="btn btn-sm btn-ghost text-success"
                          onClick={() => selectApiKey(key.provider, key.key)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button 
                          className="btn btn-sm btn-ghost text-error"
                          onClick={() => deleteApiKey(key.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-2">
            <button 
              className="btn btn-sm btn-outline btn-error"
              onClick={handleClearAllKeys}
            >
              Clear All Keys
            </button>
          </div>
        </div>
      ) : (
        <div className="alert mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>No API keys configured. Add a key to get started.</span>
        </div>
      )}
      
      {/* Add new API key */}
      {isAddingNew ? (
        <div className="bg-base-100 p-4 rounded-lg">
          <h3 className="text-md font-medium mb-2">Add New API Key</h3>
          
          <div className="form-control w-full mb-2">
            <label className="label">
              <span className="label-text">Provider</span>
            </label>
            <select 
              className="select select-bordered w-full"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="cohere">Cohere</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-control w-full mb-2">
            <label className="label">
              <span className="label-text">API Key</span>
            </label>
            <input
              type="password"
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              placeholder={`Enter your ${selectedProvider} API key`}
              className="input input-bordered w-full"
            />
          </div>
          
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Label (Optional)</span>
            </label>
            <input
              type="text"
              value={newKeyLabel}
              onChange={(e) => setNewKeyLabel(e.target.value)}
              placeholder="My API Key"
              className="input input-bordered w-full"
            />
          </div>
          
          {validationError && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{validationError}</span>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <button 
              className="btn btn-ghost"
              onClick={() => {
                setIsAddingNew(false)
                setValidationError(null)
                setNewKeyValue('')
                setNewKeyLabel('')
              }}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={addApiKey}
              disabled={!newKeyValue}
            >
              Add Key
            </button>
          </div>
        </div>
      ) : (
        <button 
          className="btn btn-primary"
          onClick={() => setIsAddingNew(true)}
        >
          Add New API Key
        </button>
      )}
      
      <div className="mt-4">
        <p className="text-sm text-base-content/70">
          Your API keys are {storageType === 'none' ? 'not stored' : 'stored locally in your browser'} and never sent to our servers.
          We recommend using environment variables for production applications.
        </p>
      </div>
    </div>
  )
}

// Add default export
export default ApiKeyManager 