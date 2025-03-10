import * as React from 'react'
import { Button } from '@/components/ui/Button'
import ApiKeyManager from '../components/ApiKeyManager'
import ThemeSelector from '../components/ThemeSelector'

export function Settings() {
  const [activeTab, setActiveTab] = React.useState('api-keys')
  const [theme, setTheme] = React.useState<string>(localStorage.getItem('theme') || 'business')
  const [displayName, setDisplayName] = React.useState<string>(localStorage.getItem('displayName') || '')
  const [autoAdvance, setAutoAdvance] = React.useState<boolean>(localStorage.getItem('autoAdvance') !== 'false')
  const [showThinking, setShowThinking] = React.useState<boolean>(localStorage.getItem('showThinking') !== 'false')
  const [autoSummarize, setAutoSummarize] = React.useState<boolean>(localStorage.getItem('autoSummarize') === 'true')
  
  function handleThemeChange(newTheme: string) {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }
  
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
  
  function handleResetDefaults() {
    // Reset to default settings
    setTheme('business')
    setDisplayName('')
    setAutoAdvance(true)
    setShowThinking(true)
    setAutoSummarize(false)
    
    // Update localStorage
    localStorage.setItem('theme', 'business')
    localStorage.setItem('displayName', '')
    localStorage.setItem('autoAdvance', 'true')
    localStorage.setItem('showThinking', 'true')
    localStorage.setItem('autoSummarize', 'false')
  }
  
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'api-keys' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('api-keys')}
        >
          API Keys
        </Button>
        <Button
          variant={activeTab === 'preferences' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </Button>
        <Button
          variant={activeTab === 'appearance' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('appearance')}
        >
          Appearance
        </Button>
      </div>
      
      <div className="p-4 bg-[hsl(var(--card))] rounded-lg">
        {activeTab === 'api-keys' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">API Keys</h2>
            <ApiKeyManager />
          </div>
        )}
        
        {activeTab === 'preferences' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            {/* Preferences settings will go here */}
          </div>
        )}
        
        {activeTab === 'appearance' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            
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
            
            <div className="mb-6">
              <label className="label">
                <span className="label-text">Theme</span>
              </label>
              <ThemeSelector 
                currentTheme={theme} 
                onThemeChange={handleThemeChange} 
              />
            </div>
            
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