import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/ui/button'
import { useTranslation } from 'react-i18next'
import { ApiKeySetup } from '../components/ApiKeySetup'
import type { ApiKeyStorageOptions } from '../types/api'
import { useState } from 'react'
import { API_KEY_STORAGE_KEY } from '../types/api'

export function Welcome() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = React.useState(false)
  const [showApiKeySetup, setShowApiKeySetup] = React.useState(false)
  const storageType: ApiKeyStorageOptions['storage'] = 'session'
  const { t } = useTranslation()
  const [consentChecked, setConsentChecked] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  
  React.useEffect(() => {
    setIsVisible(true)
  }, [])

  // Check if any API keys exist in local or session storage
  const hasApiKeys = (): boolean => {
    // Check localStorage
    const localKeys = localStorage.getItem(API_KEY_STORAGE_KEY)
    if (localKeys) {
      try {
        const parsedKeys = JSON.parse(localKeys)
        if (Object.keys(parsedKeys).length > 0) return true
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Invalid JSON, ignore
      }
    }
    
    // Check sessionStorage
    const sessionKeys = sessionStorage.getItem(API_KEY_STORAGE_KEY)
    if (sessionKeys) {
      try {
        const parsedKeys = JSON.parse(sessionKeys)
        if (Object.keys(parsedKeys).length > 0) return true
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Invalid JSON, ignore
      }
    }
    
    // Check individual provider keys
    const providers = ['openai', 'anthropic', 'grok', 'google']
    for (const provider of providers) {
      if (localStorage.getItem(`${provider}_api_key`) || sessionStorage.getItem(`${provider}_api_key`)) {
        return true
      }
    }
    
    return false
  }

  const handleGetStarted = () => {
    if (localStorage.getItem('hasConsented') && hasApiKeys()) {
      navigate('/participants')
    } else if (localStorage.getItem('hasConsented')) {
      setShowApiKeySetup(true)
    } else {
      setShowConsentModal(true)
    }
  }
  
  const handleConsentContinue = () => {
    localStorage.setItem('hasConsented', 'true')
    setShowConsentModal(false)
    setConsentChecked(false)
    setShowApiKeySetup(true)
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-app text-app transition-colors duration-300 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full filter blur-3xl opacity-70 animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-64 h-64 bg-indigo-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
      </div>
      
      {!showApiKeySetup && (
        <div
          className={`container mx-auto px-4 py-16 md:py-20 flex flex-col items-center text-center transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="relative z-10">
            <div className="inline-block mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-4 py-2 font-medium shadow-lg shadow-purple-600/20">
                <div className="flex items-center gap-1">
                  <Icon icon="solar:magic-stick-linear" width="20" height="20" />
                  <span>{t('welcome.title')}</span>
                </div>
              </div>
            </div>
            
            <p className="text-lg md:text-xl text-foreground mx-auto mb-8 leading-relaxed">
              {t('welcome.subtitle')}
            </p>
            
            {/* Bullet points from the mockup */}
            <ul className="text-left max-w-lg mx-auto mb-8 space-y-3">
              <li className="flex items-start">
                <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-purple-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-foreground">{t('welcome.features.customParticipants')}</span>
              </li>
              <li className="flex items-start">
                <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-purple-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-foreground">{t('welcome.features.multiModel')}</span>
              </li>
              <li className="flex items-start">
                <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-purple-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-foreground">{t('welcome.features.saveConfigs')}</span>
              </li>
              <li className="flex items-start">
                <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-purple-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-foreground">{t('welcome.features.analyze')}</span>
              </li>
            </ul>
            
            {/* API key note */}
            <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 mb-8 border border-border/40 max-w-md mx-auto">
              <p className="text-sm text-foreground/70">
                <Icon icon="solar:info-circle-linear" className="inline-block w-4 h-4 mr-1" />
                {t('welcome.apiNote.text')}
              </p>
            </div>
            
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 font-medium px-8 h-12 rounded-md shadow-lg hover:shadow-purple-600/30 transition-all inline-flex items-center justify-center gap-2 w-64 mx-auto"
              onClick={handleGetStarted}
            >
              <span>{t('welcome.getStarted')}</span>
            </Button>
          </div>
        </div>
      )}

      {showConsentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-card p-6 rounded-xl shadow-xl max-w-md w-full border border-border/30 overflow-y-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-xl -z-10"></div>
            
            <h2 className="text-xl font-semibold mb-4 text-foreground">API Keys & Privacy Notice</h2>
            
            <div className="prose prose-sm text-foreground/80 mb-6">
              <p>Your API keys are stored securely in your browser and are never sent to our servers.</p>
              <p className="mt-2">These keys will be used to connect to the language models you choose to use in Quorum.</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      type="checkbox"
                      id="consent-checkbox"
                      checked={consentChecked}
                      onChange={() => setConsentChecked(!consentChecked)}
                      className="h-4 w-4 rounded border-border text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <label htmlFor="consent-checkbox" className="font-medium text-foreground">
                      I understand and agree to these terms
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConsentModal(false)}
                className="border-border/60 hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                disabled={!consentChecked}
                onClick={handleConsentContinue}
                className={`bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 ${!consentChecked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-purple-600/30'}`}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {showApiKeySetup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-card p-6 rounded-xl shadow-xl max-w-4xl w-full border border-border/30 overflow-y-auto max-h-[90vh]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-xl -z-10"></div>
            <ApiKeySetup
              onComplete={() => {
                navigate('/participants')
              }}
              storageType={storageType}
            />
          </div>
        </div>
      )}
    </div>
  )
}