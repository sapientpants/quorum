import './App.css'
import TopBar from './components/TopBar'
import Chat from './components/Chat'

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      <TopBar title="Quorum - Multi-LLM Chat" />
      <main className="flex-grow">
        <Chat />
      </main>
    </div>
  )
}

export default App
