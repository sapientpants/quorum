import * as React from 'react'
import { Button } from '../components/ui/button'
import ApiKeyManager from '../components/ApiKeyManager'
import { ParticipantList } from '../components/ParticipantList'
import { Icon } from '@iconify/react'

export function Settings() {
  const [activeTab, setActiveTab] = React.useState('api-keys')
  const [displayName, setDisplayName] = React.useState<string>(localStorage.getItem('displayName') || '')
  const [autoAdvance, setAutoAdvance] = React.useState<boolean>(localStorage.getItem('autoAdvance') !== 'false')
  const [showThinking, setShowThinking] = React.useState<boolean>(localStorage.getItem('showThinking') !== 'false')
  const [autoSummarize, setAutoSummarize] = React.useState<boolean>(localStorage.getItem('autoSummarize') === 'true')
  
  function handleDisplayNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplayName(e.target.value)
    localStorage.setItem('displayName', e.target.value)
  }
  
  function handleAutoAdvanceChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAutoAdvance(e.target.checked)
    localStorage.setItem('autoAdvance', e.target.checked.toString())
  }
  
  function handleShowThinkingChange(e: React.ChangeEvent<HTMLInputElement>) {
    setShowThinking(e.target.checked)
    localStorage.setItem('showThinking', e.target.checked.toString())
  }
  
  function handleAutoSummarizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAutoSummarize(e.target.checked)
    localStorage.setItem('autoSummarize', e.target.checked.toString())
  }
  
  function handleApiKeyChange(provider: string, key: string) {
    // Store in localStorage
    if (key) {
      localStorage.setItem(`${provider}_api_key`, key)
    } else {
      localStorage.removeItem(`${provider}_api_key`)
    }
  }
  
  function handleResetDefaults() {
    // Reset to default settings
    setDisplayName('')
    setAutoAdvance(true)
    setShowThinking(true)
    setAutoSummarize(false)
    
    // Update localStorage
    localStorage.setItem('displayName', '')
    localStorage.setItem('autoAdvance', 'true')
    localStorage.setItem('showThinking', 'true')
    localStorage.setItem('autoSummarize', 'false')
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <div className="flex flex-col gap-2 sticky top-20">
            <Button 
              variant={activeTab === 'api-keys' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('api-keys')}
              className="justify-start"
            >
              API Keys
            </Button>
            <Button 
              variant={activeTab === 'participants' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('participants')}
              className="justify-start"
            >
              <Icon icon="solar:users-group-rounded-linear" className="mr-2 h-4 w-4" />
              Participants
            </Button>
            <Button 
              variant={activeTab === 'appearance' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('appearance')}
              className="justify-start"
            >
              Appearance
            </Button>
            <Button 
              variant={activeTab === 'privacy' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('privacy')}
              className="justify-start"
            >
              Privacy
            </Button>
            <Button 
              variant={activeTab === 'about' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('about')}
              className="justify-start"
            >
              About
            </Button>
          </div>
        </div>
        
        <div className="w-full md:w-3/4">
          {activeTab === 'api-keys' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">API Keys</h2>
              <p className="mb-6">
                Enter your API keys for the language model providers you want to use. Your keys are stored locally in your browser and are never sent to our servers.
              </p>
              
              <ApiKeyManager onApiKeyChange={handleApiKeyChange} />
            </div>
          )}
          
          {activeTab === 'participants' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Participants</h2>
              <p className="mb-6">
                Manage AI participants for your round table discussions. Create, edit, and organize participants with different roles and personalities.
              </p>
              
              <ParticipantList />
            </div>
          )}
          
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Appearance</h2>
              <p className="mb-6">
                Customize the appearance of the application.
              </p>
              
              <div className="form-control w-full max-w-md mb-6">
                <label className="label">
                  <span className="label-text">Display Name</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  value={displayName}
                  onChange={handleDisplayNameChange}
                  placeholder="Enter your display name"
                />
              </div>
              
              {/* Theme selector removed */}
              
              <div className="mb-6">
                <h4 className="font-bold mb-2">Round Table Behavior</h4>
                
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input 
                      type="checkbox" 
                      className="checkbox" 
                      checked={autoAdvance}
                      onChange={handleAutoAdvanceChange}
                    />
                    <span className="label-text">Auto-advance to next LLM</span>
                  </label>
                </div>
                
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input 
                      type="checkbox" 
                      className="checkbox" 
                      checked={showThinking}
                      onChange={handleShowThinkingChange}
                    />
                    <span className="label-text">Show thinking indicators</span>
                  </label>
                </div>
                
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input 
                      type="checkbox" 
                      className="checkbox" 
                      checked={autoSummarize}
                      onChange={handleAutoSummarizeChange}
                    />
                    <span className="label-text">Auto-summarize after 10 exchanges</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Privacy</h2>
              <p className="mb-6">
                Manage your privacy settings and data.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Data Storage</h3>
                  <p className="mb-2">
                    Your data is stored locally in your browser. You can clear all data at any time.
                  </p>
                  <Button variant="error">Clear All Data</Button>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">API Key Storage</h3>
                  <p className="mb-2">
                    Choose how you want to store your API keys.
                  </p>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="localStorage" name="keyStorage" defaultChecked />
                    <label htmlFor="localStorage">Local Storage (persists between sessions)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="sessionOnly" name="keyStorage" />
                    <label htmlFor="sessionOnly">Session Only (cleared when browser is closed)</label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'about' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">About Quorum</h2>
              <p className="mb-4">
                Quorum is an open-source application that allows you to chat with multiple AI models simultaneously in a round-table format.
              </p>
              <p className="mb-4">
                Version: 0.1.0
              </p>
              <p className="mb-4">
                Created by: Your Name
              </p>
              <p className="mb-4">
                <a href="https://github.com/yourusername/quorum" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                  GitHub Repository
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
      
      {activeTab === 'appearance' && (
        <div className="flex justify-end mt-6">
          <button 
            className="btn btn-outline mr-2"
            onClick={handleResetDefaults}
          >
            Reset to Defaults
          </button>
          <button className="btn btn-primary">
            Save Changes
          </button>
        </div>
      )}
    </div>
  )
} 