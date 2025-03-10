import * as React from 'react'
import { Button } from '@/components/ui/Button'

export function Help() {
  const [activeSection, setActiveSection] = React.useState('getting-started')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Help Center</h1>
      
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeSection === 'getting-started' ? 'primary' : 'ghost'}
          onClick={() => setActiveSection('getting-started')}
        >
          Getting Started
        </Button>
        <Button
          variant={activeSection === 'api-keys' ? 'primary' : 'ghost'}
          onClick={() => setActiveSection('api-keys')}
        >
          API Keys
        </Button>
        <Button
          variant={activeSection === 'features' ? 'primary' : 'ghost'}
          onClick={() => setActiveSection('features')}
        >
          Features
        </Button>
        <Button
          variant={activeSection === 'faq' ? 'primary' : 'ghost'}
          onClick={() => setActiveSection('faq')}
        >
          FAQ
        </Button>
      </div>

      <div className="prose max-w-none">
        {activeSection === 'getting-started' && (
          <div>
            <h2>Getting Started with Quorum</h2>
            <p>Welcome to Quorum! This guide will help you get started with our multi-LLM chat platform.</p>
            {/* Add more getting started content */}
          </div>
        )}
        
        {activeSection === 'api-keys' && (
          <div>
            <h2>Managing API Keys</h2>
            <p>Learn how to set up and manage your API keys for different LLM providers.</p>
            {/* Add more API keys content */}
          </div>
        )}
        
        {activeSection === 'features' && (
          <div>
            <h2>Features Overview</h2>
            <p>Discover all the powerful features Quorum has to offer.</p>
            {/* Add more features content */}
          </div>
        )}
        
        {activeSection === 'faq' && (
          <div>
            <h2>Frequently Asked Questions</h2>
            <p>Find answers to common questions about using Quorum.</p>
            {/* Add more FAQ content */}
          </div>
        )}
      </div>
    </div>
  )
} 