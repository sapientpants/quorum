import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import ChatComponent from '../components/Chat'
import { usePreferencesStore } from '../store/preferencesStore'

export function Chat() {
  const navigate = useNavigate()
  const { hasConsented } = usePreferencesStore()
  
  React.useEffect(() => {
    // Check if user has consented
    if (!hasConsented) {
      navigate('/')
      return
    }
    
    // Check if API keys are set
    const hasApiKeys = localStorage.getItem('hasApiKeys')
    if (hasApiKeys !== 'true') {
      navigate('/')
      return
    }
  }, [navigate, hasConsented])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Round Table Chat</h2>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm">
            New Chat
          </button>
          <button className="btn btn-outline btn-sm">
            Export
          </button>
          <button className="btn btn-outline btn-sm">
            Clear
          </button>
        </div>
      </div>
      
      <div className="flex-grow">
        <ChatComponent />
      </div>
    </div>
  )
} 