import { Outlet } from 'react-router-dom'
import { TopBar } from '../TopBar'

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <TopBar />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
} 