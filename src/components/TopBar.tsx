import { useState, useEffect } from 'react'
import ThemeSelector from './ThemeSelector'

interface TopBarProps {
  title: string
}

function TopBar({ title }: TopBarProps) {
  const [theme, setTheme] = useState<string>('business')
  
  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])
  
  // Handle theme change
  function handleThemeChange(newTheme: string) {
    setTheme(newTheme)
  }
  
  return (
    <header className="bg-primary text-primary-content p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <ThemeSelector 
          currentTheme={theme} 
          onThemeChange={handleThemeChange} 
        />
      </div>
    </header>
  )
}

export default TopBar 