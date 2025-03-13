import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { HeroUIProvider } from '@heroui/react'
import { App } from './App'
import './index.css'
import './feature-cards.css'
import './light-theme.css'

// Get initial theme from localStorage or default to light
const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme
    }
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  } catch (error) {
    console.error('Error getting initial theme:', error)
    return 'light'
  }
}

// Create root and render app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <div className={`${getInitialTheme()} text-foreground bg-background min-h-screen`}>
        <App />
      </div>
    </HeroUIProvider>
  </React.StrictMode>,
)
