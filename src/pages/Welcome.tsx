import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/ui/Button'

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

  function handleNavigation(path: string) {
    navigate(path)
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-gradient-to-br from-gray-950 to-gray-900 text-white">
      <div 
        className={`container mx-auto px-4 py-20 flex flex-col items-center text-center transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="inline-block mb-4">
            <div className="bg-purple-600 text-white rounded-full px-4 py-2 font-medium">
              <div className="flex items-center gap-1">
                <Icon icon="solar:magic-stick-linear" width="20" height="20" />
                <span>AI-Powered Conversations</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400 leading-tight">
            Quorum Chat
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Chat with multiple LLMs in a round-table format. Compare responses, create expert panels, and facilitate model-to-model conversations.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 font-medium px-8 h-12 rounded-md shadow-lg hover:shadow-purple-600/30 transition-all inline-flex items-center justify-center gap-2"
              onClick={handleGetStarted}
            >
              <Icon icon="solar:rocket-linear" width="20" height="20" />
              <span>Get Started</span>
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="border-white/20 text-white font-medium px-8 h-12 backdrop-blur-sm bg-white/5 rounded-md shadow-lg hover:shadow-blue-600/20 transition-all inline-flex items-center justify-center gap-2"
              onClick={() => handleNavigation('/help')}
            >
              <Icon icon="solar:info-circle-linear" width="20" height="20" />
              <span>Learn More</span>
            </Button>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24">
          <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 shadow-xl rounded-xl p-6">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <Icon icon="solar:chart-linear" width="24" height="24" className="text-purple-400" />
            </div>
            <div className="bg-purple-600/20 text-purple-200 text-sm font-medium px-2 py-1 rounded-full inline-block mb-2">Compare</div>
            <h3 className="text-xl font-bold text-white mb-2">Compare Models</h3>
            <p className="text-gray-300">
              Compare responses from different models side-by-side to identify strengths and weaknesses.
            </p>
          </div>
          
          <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 shadow-xl rounded-xl p-6">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <Icon icon="solar:users-group-rounded-linear" width="24" height="24" className="text-blue-400" />
            </div>
            <div className="bg-blue-600/20 text-blue-200 text-sm font-medium px-2 py-1 rounded-full inline-block mb-2">Create</div>
            <h3 className="text-xl font-bold text-white mb-2">Expert Panels</h3>
            <p className="text-gray-300">
              Create panels of AI experts with different specialties to tackle complex problems.
            </p>
          </div>
          
          <div className="bg-gray-800/40 backdrop-blur-sm border border-white/10 shadow-xl rounded-xl p-6">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
              <Icon icon="solar:chat-round-dots-linear" width="24" height="24" className="text-amber-400" />
            </div>
            <div className="bg-amber-600/20 text-amber-200 text-sm font-medium px-2 py-1 rounded-full inline-block mb-2">Facilitate</div>
            <h3 className="text-xl font-bold text-white mb-2">Model Conversations</h3>
            <p className="text-gray-300">
              Let models talk to each other, debate topics, and generate diverse perspectives.
            </p>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold mb-12 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-6">
                <Icon icon="solar:key-linear" width="24" height="24" className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Add Your API Keys</h3>
              <p className="text-gray-300">
                Connect your OpenAI, Anthropic, and other LLM provider API keys.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-6">
                <Icon icon="solar:user-plus-linear" width="24" height="24" className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Create Your Panel</h3>
              <p className="text-gray-300">
                Select models and assign roles or specialties to each participant.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-6">
                <Icon icon="solar:chat-round-linear" width="24" height="24" className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Start Chatting</h3>
              <p className="text-gray-300">
                Ask questions and watch as multiple models collaborate on answers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Modal */}
      {showConsent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-white">Privacy & Consent</h2>
            
            <p className="mb-4 text-gray-300">
              Your API keys will be stored in your browser's localStorage unless you choose 
              session-only storage. Keys never leave your device or get sent to our servers.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-white">Security implications:</h3>
                <ul className="space-y-1 list-disc pl-4 text-gray-300">
                  <li>Keys in localStorage persist between sessions</li>
                  <li>Session-only storage is wiped when you close your browser</li>
                  <li>Your API usage is governed by provider terms</li>
                </ul>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="consent" 
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="consent"
                  className="text-sm font-medium text-white"
                >
                  I understand and agree to these terms
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                className="border-white/20 text-white"
                onClick={() => setShowConsent(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0"
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