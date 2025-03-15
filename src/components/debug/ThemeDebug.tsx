import { useState } from 'react'
import { useThemeContext } from '../../hooks/useThemeContext'
import { Button } from '@heroui/react'

export function ThemeDebug() {
  const { theme, effectiveTheme, setTheme } = useThemeContext()
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('light')
  
  const handleThemeChange = () => {
    console.log('Setting theme to:', selectedTheme)
    setTheme(selectedTheme)
  }
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTheme(e.target.value as 'light' | 'dark' | 'system')
  }
  
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-medium mb-2">Theme Debug</h2>
      <div className="mb-2">
        <p>Current theme: {theme}</p>
        <p>Effective theme: {effectiveTheme}</p>
      </div>
      
      <div className="flex gap-2 items-center">
        <select 
          value={selectedTheme}
          onChange={handleSelectChange}
          className="p-2 border rounded-md"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        
        <Button onClick={handleThemeChange}>
          Apply Theme
        </Button>
      </div>
    </div>
  )
} 