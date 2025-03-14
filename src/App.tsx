import { BrowserRouter as Router } from 'react-router-dom'
import { Suspense } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { ErrorProvider } from './contexts/ErrorContext'
import { Toaster } from 'sonner'
import './lib/i18n' // Initialize i18n
import { AppRoutes } from './routes'
import { KeyboardShortcutsOverlay } from './components/KeyboardShortcutsOverlay'

const Loading = () => <div>Loading...</div>

export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <ThemeProvider>
        <ErrorProvider>
          <Router>
            <AppRoutes />
            <Toaster richColors position="top-right" />
            <KeyboardShortcutsOverlay />
          </Router>
        </ErrorProvider>
      </ThemeProvider>
    </Suspense>
  )
}

export default App
