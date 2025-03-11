import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { HeroUIProvider } from '@heroui/react'
import { App } from './App'
import './index.css'
import './feature-cards.css'
import './light-theme.css'

// Create root and render app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </React.StrictMode>,
)
