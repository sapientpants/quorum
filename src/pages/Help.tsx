import * as React from 'react'
import { Button } from '../components/ui/button'

export function Help() {
  const [activeSection, setActiveSection] = React.useState('getting-started')
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Help Center</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <div className="flex flex-col gap-2 sticky top-20">
            <Button 
              variant={activeSection === 'getting-started' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('getting-started')}
              className="justify-start"
            >
              Getting Started
            </Button>
            <Button 
              variant={activeSection === 'api-keys' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('api-keys')}
              className="justify-start"
            >
              Managing API Keys
            </Button>
            <Button 
              variant={activeSection === 'features' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('features')}
              className="justify-start"
            >
              Features Overview
            </Button>
            <Button 
              variant={activeSection === 'faq' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('faq')}
              className="justify-start"
            >
              FAQ
            </Button>
          </div>
        </div>
        
        <div className="w-full md:w-3/4">
          {activeSection === 'getting-started' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
              <p className="mb-4">
                Welcome to Quorum! This application allows you to chat with multiple AI models simultaneously in a round-table format.
              </p>
              <h3 className="text-xl font-semibold mb-2">Quick Start Guide</h3>
              <ol className="list-decimal pl-5 space-y-2 mb-4">
                <li>Sign in or create an account</li>
                <li>Add your API keys in the Settings page</li>
                <li>Create a new chat or use a template</li>
                <li>Add AI participants to your conversation</li>
                <li>Start chatting with multiple models</li>
              </ol>
              <p>
                For more detailed instructions, please check the sections below.
              </p>
            </div>
          )}
          
          {activeSection === 'api-keys' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Managing API Keys</h2>
              <p className="mb-4">
                Quorum requires API keys from language model providers to function. Here's how to manage your keys:
              </p>
              <h3 className="text-xl font-semibold mb-2">Adding API Keys</h3>
              <ol className="list-decimal pl-5 space-y-2 mb-4">
                <li>Go to the Settings page</li>
                <li>Find the API Keys section</li>
                <li>Enter your API key for each provider</li>
                <li>Choose whether to store keys in localStorage or session only</li>
                <li>Click Save to store your keys</li>
              </ol>
              <h3 className="text-xl font-semibold mb-2">Security Considerations</h3>
              <p className="mb-4">
                Your API keys are stored locally in your browser and are never sent to our servers. However, please be aware of the following:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Keys stored in localStorage persist between sessions</li>
                <li>Session-only storage is wiped when you close your browser</li>
                <li>Anyone with access to your device could potentially access your stored keys</li>
                <li>Your API usage is governed by your provider's terms and billing</li>
              </ul>
            </div>
          )}
          
          {activeSection === 'features' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Features Overview</h2>
              <h3 className="text-xl font-semibold mb-2">Multi-Model Chat</h3>
              <p className="mb-4">
                Chat with multiple AI models simultaneously and compare their responses side-by-side.
              </p>
              <h3 className="text-xl font-semibold mb-2">Expert Panels</h3>
              <p className="mb-4">
                Create specialized panels of AI models with different roles and expertise areas.
              </p>
              <h3 className="text-xl font-semibold mb-2">Templates</h3>
              <p className="mb-4">
                Save and reuse your favorite panel configurations for different use cases.
              </p>
              <h3 className="text-xl font-semibold mb-2">Customization</h3>
              <p className="mb-4">
                Customize the appearance and behavior of the application to suit your preferences.
              </p>
            </div>
          )}
          
          {activeSection === 'faq' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">Is my data secure?</h3>
                  <p>
                    Your conversations and API keys are stored locally in your browser and are never sent to our servers. However, your prompts and conversations are sent to the respective AI providers according to their APIs.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">How am I billed for API usage?</h3>
                  <p>
                    You are billed directly by the AI providers based on your API usage. Quorum does not handle any billing or payments.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Can I export my conversations?</h3>
                  <p>
                    Yes, you can export your conversations as JSON or text files for future reference.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Which AI models are supported?</h3>
                  <p>
                    Quorum supports OpenAI (GPT models), Anthropic (Claude models), and other providers. The specific models available depend on your API access.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 