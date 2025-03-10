import { useState, useEffect } from 'react'

// List of all available DaisyUI themes
const themes = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
  'caramellatte',
  'abyss',
  'silk'
]

interface ThemeSelectorProps {
  currentTheme?: string
  onThemeChange?: (theme: string) => void
}

export function ThemeSelector({ 
  currentTheme = 'business', 
  onThemeChange 
}: ThemeSelectorProps) {
  const [theme, setTheme] = useState(currentTheme)
  
  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && themes.includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [])
  
  // Apply theme when it changes
  function handleThemeChange(newTheme: string) {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (onThemeChange) {
      onThemeChange(newTheme)
    }
  }
  
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost m-1">
        <span className="mr-2">Theme</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" 
          />
        </svg>
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52 max-h-96 overflow-y-auto">
        {themes.map((themeName) => (
          <li key={themeName}>
            <button
              className={`${theme === themeName ? 'active' : ''}`}
              onClick={() => handleThemeChange(themeName)}
            >
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 mr-2 rounded-full border border-base-content/20" 
                  style={{ 
                    backgroundColor: `hsl(var(--p))`,
                    boxShadow: theme === themeName ? '0 0 0 2px hsl(var(--p))' : 'none'
                  }}
                  data-theme={themeName}
                ></div>
                <span className="capitalize">{themeName}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Add default export
export default ThemeSelector 