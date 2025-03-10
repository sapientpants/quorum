import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        Hello daisyUI + Tailwind!
      </h1>
      
      <div className="flex gap-4 mb-4">
        <button className="btn btn-primary">Primary Button</button>
        <button className="btn btn-secondary">Secondary Button</button>
        <button className="btn btn-accent">Accent Button</button>
      </div>
      
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Card Title</h2>
          <p>This is a daisyUI card component with some content.</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={() => setCount((count) => count + 1)}>
              Count is {count}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
