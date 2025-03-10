import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Button asChild>
        <Link to="/">Return to Home</Link>
      </Button>
    </div>
  )
} 