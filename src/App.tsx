import { BrowserRouter as Router } from 'react-router-dom'
import { Suspense } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { ErrorProvider } from './contexts/ErrorContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ChatProvider } from './contexts/ChatContext'
import { Toaster } from 'sonner'
import './lib/i18n' // Initialize i18n
import { AppRoutes } from './routes'
import { KeyboardShortcutsOverlay } from './components/KeyboardShortcutsOverlay'
import { PageLoader } from './components/ui/PageLoader'

export function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ThemeProvider>
        <ErrorProvider>
          <LanguageProvider>
            <ChatProvider>
              <Router>
                <AppRoutes />
                <Toaster richColors position="top-right" />
                <KeyboardShortcutsOverlay />
              </Router>
            </ChatProvider>
          </LanguageProvider>
        </ErrorProvider>
      </ThemeProvider>
    </Suspense>
  )
}
