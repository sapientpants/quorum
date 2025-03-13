import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/ui/button'
import { Checkbox } from '../components/ui/checkbox'

export function Welcome() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = React.useState(false)
  const [showConsent, setShowConsent] = React.useState(false)
  const [isChecked, setIsChecked] = React.useState(false)
  
  React.useEffect(() => {
    setIsVisible(true)
  }, [])

  function handleGetStarted() {
    const hasConsented = localStorage.getItem('hasConsented')
    
    if (hasConsented === 'true') {
      const hasApiKeys = localStorage.getItem('hasApiKeys')
      navigate(hasApiKeys === 'true' ? '/chat' : '/settings')
    } else {
      setShowConsent(true)
    }
  }
  
  function handleConsent() {
    localStorage.setItem('hasConsented', 'true')
    const hasApiKeys = localStorage.getItem('hasApiKeys')
    navigate(hasApiKeys === 'true' ? '/chat' : '/settings')
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-app text-app transition-colors duration-300 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full filter blur-3xl opacity-70 animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-64 h-64 bg-indigo-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
      </div>
      
      <div
        className={`container mx-auto px-4 py-16 md:py-20 flex flex-col items-center text-center transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="relative z-10">
          <div className="inline-block mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-4 py-2 font-medium shadow-lg shadow-purple-600/20">
              <div className="flex items-center gap-1">
                <Icon icon="solar:magic-stick-linear" width="20" height="20" />
                <span>AI-Powered Conversations</span>
              </div>
            </div>
          </div>
          
          <p className="text-lg md:text-xl text-gray-300 mx-auto mb-8 leading-relaxed">
            Chat with multiple LLMs in a round-table format
          </p>
          
          {/* Bullet points from the mockup */}
          <ul className="text-left max-w-lg mx-auto mb-8 space-y-3">
            <li className="flex items-start">
              <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-purple-400 mt-1 mr-2 flex-shrink-0" />
              <span className="text-gray-300">Create custom AI participants with specific roles</span>
            </li>
            <li className="flex items-start">
              <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-purple-400 mt-1 mr-2 flex-shrink-0" />
              <span className="text-gray-300">Facilitate natural multi-model conversations</span>
            </li>
            <li className="flex items-start">
              <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-purple-400 mt-1 mr-2 flex-shrink-0" />
              <span className="text-gray-300">Save and share your favorite configurations</span>
            </li>
            <li className="flex items-start">
              <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-purple-400 mt-1 mr-2 flex-shrink-0" />
              <span className="text-gray-300">Analyze conversation patterns and insights</span>
            </li>
          </ul>
          
          {/* API key note */}
          <div className="bg-card/30 backdrop-blur-sm rounded-lg p-4 mb-8 border border-white/10 max-w-md mx-auto">
            <p className="text-sm text-gray-400">
              <Icon icon="solar:info-circle-linear" className="inline-block w-4 h-4 mr-1" />
              Requires API keys from LLM providers.
              Usage may incur costs based on provider pricing.
            </p>
          </div>
          
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 font-medium px-8 h-12 rounded-md shadow-lg hover:shadow-purple-600/30 transition-all inline-flex items-center justify-center gap-2 w-64 mx-auto"
            onClick={handleGetStarted}
          >
            <span>Get Started</span>
          </Button>
        </div>
      </div>

      {/* Consent Modal */}
      {showConsent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-card p-6 rounded-xl shadow-xl max-w-md w-full border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl -z-10"></div>
            <h2 className="text-xl font-bold mb-4 text-white">API Keys & Privacy Notice</h2>
            
            <p className="mb-4 text-gray-300">
              Quorum requires API keys to function. Please note:
            </p>
            
            <div className="space-y-4">
              <ul className="space-y-2 list-disc pl-5 text-gray-300">
                <li>Your API keys can be stored in your browser based on your preference</li>
                <li>All processing happens in your browser - your conversations never leave your device</li>
                <li>We don't have access to your API keys or data</li>
                <li>You can choose how your keys are stored:
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>Local Storage (persists between sessions)</li>
                    <li>Session Storage (cleared when browser closes)</li>
                    <li>No Storage (must re-enter each time)</li>
                  </ul>
                </li>
              </ul>
              
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="consent"
                  checked={isChecked}
                  onCheckedChange={(checked) => setIsChecked(checked === true)}
                />
                <label
                  htmlFor="consent"
                  className="text-sm font-medium text-white cursor-pointer"
                >
                  I understand and agree to these terms
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => setShowConsent(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:shadow-lg hover:shadow-purple-600/20"
                onClick={handleConsent}
                disabled={!isChecked}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}