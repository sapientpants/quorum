import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../components/ui/button'
import { FeatureCard } from '../components/FeatureCard'
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

  function handleNavigation(path: string) {
    navigate(path)
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
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400 leading-tight">
            Quorum Chat
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20 md:mt-24">
          <FeatureCard
            icon="solar:chart-linear"
            iconColor="#9333ea"
            badgeText="Compare"
            badgeColor="#9333ea"
            title="Compare Models"
            description="Compare responses from different models side-by-side to identify strengths and weaknesses."
          />
          
          <FeatureCard
            icon="solar:users-group-rounded-linear"
            iconColor="#2563eb"
            badgeText="Create"
            badgeColor="#2563eb"
            title="Expert Panels"
            description="Create panels of AI experts with different specialties to tackle complex problems."
          />
          
          <FeatureCard
            icon="solar:chat-round-dots-linear"
            iconColor="#d97706"
            badgeText="Facilitate"
            badgeColor="#d97706"
            title="Model Conversations"
            description="Let models talk to each other, debate topics, and generate diverse perspectives."
          />
        </div>
        
        {/* How It Works Section */}
        <div className="w-full px-4 py-16 md:py-20 mt-8">
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
              How It Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
              {/* Connection lines for desktop */}
              <div className="hidden md:block absolute top-24 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"></div>
              <div className="hidden md:block absolute top-24 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-blue-500 to-green-500"></div>
              
              <div className="relative bg-card/30 backdrop-blur-sm rounded-xl p-8 border border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/10">
                <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-6">
                  <Icon icon="solar:key-linear" width="24" height="24" className="text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">1. Add Your API Keys</h3>
                <p className="text-gray-300">
                  Connect your OpenAI, Anthropic, and other LLM provider API keys.
                </p>
              </div>
              
              <div className="relative bg-card/30 backdrop-blur-sm rounded-xl p-8 border border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10">
                <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-6">
                  <Icon icon="solar:user-plus-linear" width="24" height="24" className="text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">2. Create Your Panel</h3>
                <p className="text-gray-300">
                  Select models and assign roles or specialties to each participant.
                </p>
              </div>
              
              <div className="relative bg-card/30 backdrop-blur-sm rounded-xl p-8 border border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-green-600/10">
                <div className="w-16 h-16 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-6">
                  <Icon icon="solar:chat-round-linear" width="24" height="24" className="text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">3. Start Chatting</h3>
                <p className="text-gray-300">
                  Ask questions and watch as multiple models collaborate on answers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Modal */}
      {showConsent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-card p-6 rounded-xl shadow-xl max-w-md w-full border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl -z-10"></div>
            <h2 className="text-xl font-bold mb-4 text-white">Privacy & Consent</h2>
            
            <p className="mb-4 text-gray-300">
              Your API keys will be stored in your browser's localStorage unless you choose
              session-only storage. Keys never leave your device or get sent to our servers.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-white">Security implications:</h3>
                <ul className="space-y-2 list-disc pl-5 text-gray-300">
                  <li>Keys in localStorage persist between sessions</li>
                  <li>Session-only storage is wiped when you close your browser</li>
                  <li>Your API usage is governed by provider terms</li>
                </ul>
              </div>
              
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