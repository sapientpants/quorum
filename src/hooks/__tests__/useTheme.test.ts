import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme, isThemeDark } from '../useTheme'
import type { Theme } from '../../types/preferences'

// Mock the preferencesStore
vi.mock('../../store/preferencesStore', () => ({
  usePreferencesStore: vi.fn()
}))

// Import the mocked module
import { usePreferencesStore } from '../../store/preferencesStore'

// Define the mock store type
interface MockPreferencesStore {
  preferences: {
    theme: Theme
  }
  setTheme: (theme: Theme) => void
}

// Define a more complete type for the mocked store
type MockedPreferencesStore = ReturnType<typeof usePreferencesStore>

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    })
  }
})()

// Mock window.matchMedia
const matchMediaMock = (matches: boolean) => {
  return () => ({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })
}

describe('useTheme', () => {
  // Mock DOM elements and methods
  const mockClassList = {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn()
  }

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    
    // Mock document.documentElement.classList
    // Instead of redefining the property, we'll mock the methods
    document.documentElement.classList.add = mockClassList.add
    document.documentElement.classList.remove = mockClassList.remove
    document.documentElement.classList.contains = mockClassList.contains
    
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  it('should use system preference when theme is set to system', () => {
    // Mock system preference as dark
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock(true) // true = dark mode
    })
    
    // Mock preferences store with 'system' theme
    const mockSetTheme = vi.fn()
    const mockStore: MockPreferencesStore = {
      preferences: { theme: 'system' },
      setTheme: mockSetTheme
    }
    
    // Set up the mock return value
    vi.mocked(usePreferencesStore).mockReturnValue(mockStore as unknown as MockedPreferencesStore)
    
    const { result } = renderHook(() => useTheme())
    
    // Check that the effective theme is dark (from system preference)
    expect(result.current.theme).toBe('system')
    expect(result.current.effectiveTheme).toBe('dark')
    expect(result.current.isDark).toBe(true)
    expect(result.current.isLight).toBe(false)
    
    // Check that the dark class was added to the document
    expect(mockClassList.add).toHaveBeenCalledWith('dark')
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('should use light theme when explicitly set', () => {
    // Mock system preference as dark
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock(true) // true = dark mode
    })
    
    // Mock preferences store with 'light' theme
    const mockSetTheme = vi.fn()
    const mockStore: MockPreferencesStore = {
      preferences: { theme: 'light' },
      setTheme: mockSetTheme
    }
    
    // Set up the mock return value
    vi.mocked(usePreferencesStore).mockReturnValue(mockStore as unknown as MockedPreferencesStore)
    
    const { result } = renderHook(() => useTheme())
    
    // Check that the effective theme is light (overriding system preference)
    expect(result.current.theme).toBe('light')
    expect(result.current.effectiveTheme).toBe('light')
    expect(result.current.isDark).toBe(false)
    expect(result.current.isLight).toBe(true)
    
    // Check that the light class was added to the document
    expect(mockClassList.add).toHaveBeenCalledWith('light')
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('should toggle theme correctly', () => {
    // Mock preferences store with 'light' theme
    const mockSetTheme = vi.fn()
    const mockStore: MockPreferencesStore = {
      preferences: { theme: 'light' },
      setTheme: mockSetTheme
    }
    
    // Set up the mock return value
    vi.mocked(usePreferencesStore).mockReturnValue(mockStore as unknown as MockedPreferencesStore)
    
    const { result } = renderHook(() => useTheme())
    
    // Toggle theme from light to dark
    act(() => {
      result.current.toggleTheme()
    })
    
    // Check that setTheme was called with 'dark'
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should toggle theme from system preference', () => {
    // Mock system preference as dark
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock(true) // true = dark mode
    })
    
    // Mock preferences store with 'system' theme
    const mockSetTheme = vi.fn()
    const mockStore: MockPreferencesStore = {
      preferences: { theme: 'system' },
      setTheme: mockSetTheme
    }
    
    // Set up the mock return value
    vi.mocked(usePreferencesStore).mockReturnValue(mockStore as unknown as MockedPreferencesStore)
    
    const { result } = renderHook(() => useTheme())
    
    // Toggle theme from system (dark) to light
    act(() => {
      result.current.toggleTheme()
    })
    
    // Check that setTheme was called with 'light'
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('should set theme correctly', () => {
    // Mock preferences store
    const mockSetTheme = vi.fn()
    const mockStore: MockPreferencesStore = {
      preferences: { theme: 'light' },
      setTheme: mockSetTheme
    }
    
    // Set up the mock return value
    vi.mocked(usePreferencesStore).mockReturnValue(mockStore as unknown as MockedPreferencesStore)
    
    const { result } = renderHook(() => useTheme())
    
    // Set theme to dark
    act(() => {
      result.current.setTheme('dark')
    })
    
    // Check that setTheme was called with 'dark'
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should handle errors when toggling theme', () => {
    // Mock console.error to capture the error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock preferences store to throw an error on first call, then succeed on second call
    const mockSetTheme = vi.fn()
      .mockImplementationOnce(() => {
        throw new Error('Test error')
      })
      .mockImplementation(() => {})
    
    const mockStore: MockPreferencesStore = {
      preferences: { theme: 'light' },
      setTheme: mockSetTheme
    }
    
    // Set up the mock return value
    vi.mocked(usePreferencesStore).mockReturnValue(mockStore as unknown as MockedPreferencesStore)
    
    const { result } = renderHook(() => useTheme())
    
    // Toggle theme (which will throw an error on first call)
    act(() => {
      result.current.toggleTheme()
    })
    
    // Check that console.error was called with the error
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Error toggling theme')
    
    // Check that setTheme was called with 'light' as fallback
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})

describe('isThemeDark', () => {
  it('should correctly identify dark themes', () => {
    expect(isThemeDark('dark')).toBe(true)
    expect(isThemeDark('synthwave')).toBe(true)
    expect(isThemeDark('dracula')).toBe(true)
  })
  
  it('should correctly identify light themes', () => {
    expect(isThemeDark('light')).toBe(false)
    expect(isThemeDark('cupcake')).toBe(false)
    expect(isThemeDark('corporate')).toBe(false)
  })
})
