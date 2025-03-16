import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLanguageContext } from '../useLanguageContext'
import { LanguageContext, availableLanguages } from '../../contexts/contexts/LanguageContextDefinition'
import { ReactNode } from 'react'

// Mock wrapper component
function Wrapper({ children }: { children: ReactNode }) {
  const mockLanguageContext = {
    language: 'en',
    changeLanguage: vi.fn(),
    availableLanguages: availableLanguages
  }
  
  return (
    <LanguageContext.Provider value={mockLanguageContext}>
      {children}
    </LanguageContext.Provider>
  )
}

// Mock wrapper without context
function EmptyWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>
}

describe('useLanguageContext', () => {
  it('returns the language context when used within a LanguageProvider', () => {
    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: Wrapper
    })
    
    // Check that the hook returns the context
    expect(result.current).toBeDefined()
    expect(result.current.language).toBe('en')
    expect(result.current.availableLanguages).toBe(availableLanguages)
    expect(typeof result.current.changeLanguage).toBe('function')
  })
  
  it('throws an error when used outside of a LanguageProvider', () => {
    // Suppress console.error for this test
    const originalConsoleError = console.error
    console.error = vi.fn()
    
    // Expect the hook to throw an error
    expect(() => {
      renderHook(() => useLanguageContext(), {
        wrapper: EmptyWrapper
      })
    }).toThrow('useLanguageContext must be used within a LanguageProvider')
    
    // Restore console.error
    console.error = originalConsoleError
  })
  
  it('allows changing the language', () => {
    const changeLanguageMock = vi.fn()
    
    // Create a custom wrapper with a mock changeLanguage function
    function CustomWrapper({ children }: { children: ReactNode }) {
      const mockLanguageContext = {
        language: 'en',
        changeLanguage: changeLanguageMock,
        availableLanguages: availableLanguages
      }
      
      return (
        <LanguageContext.Provider value={mockLanguageContext}>
          {children}
        </LanguageContext.Provider>
      )
    }
    
    const { result } = renderHook(() => useLanguageContext(), {
      wrapper: CustomWrapper
    })
    
    // Call the changeLanguage function
    result.current.changeLanguage('de')
    
    // Check that the mock function was called with the correct argument
    expect(changeLanguageMock).toHaveBeenCalledWith('de')
  })
})
