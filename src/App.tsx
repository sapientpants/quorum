import * as React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { useTheme } from '@/hooks/useTheme'

export function App() {
  const { theme } = useTheme()

  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return (
    <RouterProvider router={router} />
  )
}
