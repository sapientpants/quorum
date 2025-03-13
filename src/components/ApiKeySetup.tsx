import { useState, useEffect } from 'react'
import type { ApiKey, ApiKeyStorageOptions } from '../types/api'
import type { LLMProvider } from '../types/llm'
import { validateApiKey } from '../services/apiKeyService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@iconify/react'

export interface ApiKeySetupProps {
  onComplete: () => void
  initialKeys?: ApiKey[]
  storageType?: ApiKeyStorageOptions['storage']
}

export function ApiKeySetup({ onComplete, initialKeys = [], storageType = 'session' }: ApiKeySetupProps) {
  const [apiKeys, setApiKeys] = useState<Record<LLMProvider, string>>({
    openai: '',
    anthropic: '',
    grok: '',
    google: ''
  })
  const [errors, setErrors] = useState<Record<LLMProvider, string | null>>({
    openai: null,
    anthropic: null,
    grok: null,
    google: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load initial keys if provided
  useEffect(() => {
    if (initialKeys.length > 0) {
      const keyMap = initialKeys.reduce((acc, key) => {
        acc[key.provider] = key.key
        return acc
      }, {} as Record<LLMProvider, string>)
      setApiKeys(keyMap)
    }
  }, [initialKeys])

  function handleKeyChange(provider: LLMProvider, value: string) {
    setApiKeys(prev => ({ ...prev, [provider]: value }))
    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [provider]: null }))
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    const newErrors: Record<LLMProvider, string | null> = {
      openai: null,
      anthropic: null,
      grok: null,
      google: null
    }

    // Validate at least one key is provided
    if (!apiKeys.openai && !apiKeys.anthropic && !apiKeys.grok && !apiKeys.google) {
      setErrors({
        openai: 'At least one API key is required',
        anthropic: null,
        grok: null,
        google: null
      })
      setIsSubmitting(false)
      return
    }

    // Validate each provided key
    for (const [provider, key] of Object.entries(apiKeys)) {
      if (key) {
        const validation = validateApiKey(provider, key)
        if (!validation.isValid) {
          newErrors[provider as LLMProvider] = validation.message || 'Invalid API key'
        }
      }
    }

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== null)) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    // Store keys based on storage preference
    if (storageType !== 'none') {
      const storage = storageType === 'local' ? localStorage : sessionStorage
      Object.entries(apiKeys).forEach(([provider, key]) => {
        if (key) {
          storage.setItem(`${provider}_api_key`, key)
        }
      })
    }

    setIsSubmitting(false)
    onComplete()
  }

  return (
    <div className="relative bg-card p-8 rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-xl -z-10"></div>
      
      <h2 className="text-2xl font-bold mb-4 text-foreground">Setup Your API Keys</h2>
      <p className="text-foreground/70 mb-8">
        At least one API key is required from any provider below to use Quorum.
      </p>

      {/* OpenAI API Key */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="openai" className="text-base">OpenAI API Key</Label>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Icon icon="solar:info-circle-linear" className="w-4 h-4" />
              How to get an OpenAI API key
            </a>
          </div>
          <Input
            id="openai"
            type="password"
            value={apiKeys.openai}
            onChange={(e) => handleKeyChange('openai', e.target.value)}
            placeholder="sk-..."
            className={errors.openai ? 'border-error' : ''}
          />
          {errors.openai && (
            <p className="text-sm text-error">{errors.openai}</p>
          )}
        </div>

        {/* Anthropic API Key */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="anthropic" className="text-base">Anthropic API Key</Label>
            <a
              href="https://console.anthropic.com/account/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Icon icon="solar:info-circle-linear" className="w-4 h-4" />
              How to get an Anthropic API key
            </a>
          </div>
          <Input
            id="anthropic"
            type="password"
            value={apiKeys.anthropic}
            onChange={(e) => handleKeyChange('anthropic', e.target.value)}
            placeholder="sk-ant-..."
            className={errors.anthropic ? 'border-error' : ''}
          />
          {errors.anthropic && (
            <p className="text-sm text-error">{errors.anthropic}</p>
          )}
        </div>

        {/* Grok API Key */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="grok" className="text-base">Grok API Key</Label>
            <a
              href="https://grok.x.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Icon icon="solar:info-circle-linear" className="w-4 h-4" />
              How to get a Grok API key
            </a>
          </div>
          <Input
            id="grok"
            type="password"
            value={apiKeys.grok}
            onChange={(e) => handleKeyChange('grok', e.target.value)}
            placeholder="grok-..."
            className={errors.grok ? 'border-error' : ''}
          />
          {errors.grok && (
            <p className="text-sm text-error">{errors.grok}</p>
          )}
        </div>

        {/* Google AI API Key */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="google" className="text-base">Google AI (Gemini) API Key</Label>
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Icon icon="solar:info-circle-linear" className="w-4 h-4" />
              How to get a Google AI API key
            </a>
          </div>
          <Input
            id="google"
            type="password"
            value={apiKeys.google}
            onChange={(e) => handleKeyChange('google', e.target.value)}
            placeholder="Enter your Google AI API key"
            className={errors.google ? 'border-error' : ''}
          />
          {errors.google && (
            <p className="text-sm text-error">{errors.google}</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:shadow-lg hover:shadow-purple-600/20 min-w-[120px]"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <Icon icon="solar:spinner-line-duotone" className="w-5 h-5 animate-spin" />
          ) : (
            'Continue'
          )}
        </Button>
      </div>

      <p className="mt-6 text-sm text-foreground/70">
        Your API keys are {storageType === 'none' ? 'not stored' : 'stored locally in your browser'} and never sent to our servers.
        We recommend using environment variables for production applications.
      </p>
    </div>
  )
}

export default ApiKeySetup 