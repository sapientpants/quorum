import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layouts/AppLayout'
import Chat from './components/Chat'
import { Settings } from './pages/Settings'
import { Templates } from './pages/Templates'
import { Welcome } from './pages/Welcome'
import { Help } from './pages/Help'
import { NotFound } from './pages/NotFound'
import { ChatProvider } from './contexts/ChatContext'

export function App() {
  return (
    <ChatProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Welcome />} />
            <Route path="chat" element={<Chat />} />
            <Route path="settings" element={<Settings />} />
            <Route path="templates" element={<Templates />} />
            <Route path="help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ChatProvider>
  )
}

export default App
