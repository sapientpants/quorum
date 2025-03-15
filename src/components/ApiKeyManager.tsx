import { useState, useEffect } from 'react'
import type { ApiKey, ApiKeyStorageOptions } from '../types/api'
import type { LLMProviderId } from '../types/llm'
import { 
  saveApiKeys, 
  loadApiKeys, 
  clearApiKeys, 
  createApiKey, 
  validateApiKey 
} from '../services/apiKeyService'
import { Icon } from '@iconify/react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys)
  const [selectedProvider, setSelectedProvider] = useState<LLMProviderId>('openai')
  const [newKeyValue, setNewKeyValue] = useState<string>('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [storageType] = useState<'local' | 'session' | 'none'>(
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
    if (!newKeyValue) {
      setValidationError(t('settings.apiKeyManager.apiKeyRequired'))
      return
    }
    
    // Validate the key
    const validationResult = validateApiKey(selectedProvider, newKeyValue)
    if (!validationResult.isValid) {
      setValidationError(validationResult.message || t('settings.apiKeyManager.invalidApiKey'))
      return
    }
    
    // Create and add the new key
    const newKey = createApiKey(
      selectedProvider as LLMProviderId, 
      newKeyValue
    )
    
    setApiKeys(prev => [...prev, newKey])
    
    // Notify parent about the new key
    onApiKeyChange(selectedProvider, newKeyValue)
    
    // Reset form
    setNewKeyValue('')
    setIsAddingNew(false)
  }

  // Select an API key as active
  function selectApiKey(provider: string, key: string) {
    onApiKeyChange(provider, key)
  }

  // Clear all API keys
  function handleClearAllKeys() {
    if (confirm(t('settings.apiKeyManager.clearConfirmation'))) {
      clearApiKeys({ storage: storageType })
      setApiKeys([])
      
      // Notify parent that all keys are gone
      const providers = new Set(apiKeys.map(key => key.provider))
      providers.forEach(provider => {
        onApiKeyChange(provider, '')
      })
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
    <div className="space-y-6">
      {/* API Key Management */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.apiKeyManager.title')}</CardTitle>
          <CardDescription>{t('settings.apiKeyManager.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Existing API keys */}
          {Object.entries(keysByProvider).length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium text-base">{t('settings.apiKeyManager.yourApiKeys')}</h3>
              <div className="space-y-4">
                {Object.entries(keysByProvider).map(([provider, keys]) => (
                  <div key={provider} className="border border-border rounded-lg bg-background/50">
                    <div className="px-4 py-3 border-b border-border">
                      <h4 className="text-base font-medium capitalize">{provider}</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {keys.map(key => (
                        <div key={key.id} className="flex items-center justify-between bg-muted/40 p-3">
                          <div className="flex-1 overflow-hidden">
                            <div className="text-sm text-muted-foreground font-mono mt-1 overflow-hidden overflow-ellipsis">
                              {key.isVisible 
                                ? key.key 
                                : key.key.substring(0, 4) + '•'.repeat(Math.min(10, key.key.length - 8)) + key.key.substring(key.key.length - 4)
                              }
                            </div>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleKeyVisibility(key.id)}
                            >
                              <Icon 
                                icon={key.isVisible ? "solar:eye-closed-linear" : "solar:eye-linear"} 
                                className="h-4 w-4" 
                              />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => selectApiKey(key.provider, key.key)}
                              className="text-primary"
                            >
                              <Icon icon="solar:check-circle-linear" className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteApiKey(key.id)}
                              className="text-destructive"
                            >
                              <Icon icon="solar:trash-bin-trash-linear" className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            
              <div className="pt-2">
                <Button
                  variant="error"
                  size="sm"
                  onClick={handleClearAllKeys}
                >
                  <Icon icon="solar:trash-bin-trash-linear" className="mr-1.5 h-4 w-4" />
                  {t('settings.apiKeyManager.clearAllKeys')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 border border-border/30 rounded-lg p-4 flex items-center space-x-3">
              <Icon icon="solar:info-circle-linear" className="text-muted-foreground h-5 w-5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{t('settings.apiKeyManager.noKeysConfigured')}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add new API key */}
      {isAddingNew ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.apiKeyManager.addNewApiKey')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider-select">{t('settings.apiKeyManager.provider')}</Label>
                <div className="relative">
                  <select
                    id="provider-select"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as LLMProviderId)}
                  >
                    <option value="anthropic">Anthropic</option>
                    <option value="cohere">Cohere</option>
                    <option value="google">Google</option>
                    <option value="grok">Grok</option>
                    <option value="openai">OpenAI</option>
                    <option value="other">Other</option>
                  </select>
                  <Icon 
                    icon="solar:alt-arrow-down-linear" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none opacity-70" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-key">{t('settings.apiKeyManager.apiKey')}</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder={`Enter your ${selectedProvider} API key`}
                />
                {validationError && (
                  <p className="text-sm text-destructive mt-1">{validationError}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingNew(false)
                    setValidationError(null)
                  }}
                >
                  {t('settings.cancel')}
                </Button>
                <Button 
                  variant="primary"
                  onClick={addApiKey}
                >
                  {t('settings.apiKeyManager.addKey')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="primary"
          onClick={() => setIsAddingNew(true)}
          className="w-full"
        >
          <Icon icon="solar:add-circle-linear" className="mr-1.5 h-4 w-4" />
          {t('settings.apiKeyManager.addNewApiKey')}
        </Button>
      )}
    </div>
  )
}

// Add default export
export default ApiKeyManager
