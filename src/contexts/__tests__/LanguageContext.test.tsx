import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LanguageProvider } from '../LanguageContext'
import { LanguageContext, availableLanguages } from '../contexts/LanguageContextDefinition'
import { useContext } from 'react'

// Define the type for our mock i18n
interface MockI18n {
  language: string;
  changeLanguage: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  listeners: {
    [key: string]: Array<(lang: string) => void>;
  };
}

// Mock i18n
vi.mock('../../lib/i18n', () => {
  const mockI18n: MockI18n = {
    language: 'en',
    changeLanguage: vi.fn((lang: string) => {
      mockI18n.language = lang;
      // Simulate the languageChanged event
      if (mockI18n.listeners.languageChanged) {
        mockI18n.listeners.languageChanged.forEach((listener) => listener(lang));
      }
      return Promise.resolve();
    }),
    on: vi.fn((event: string, callback: (lang: string) => void) => {
      if (!mockI18n.listeners[event]) {
        mockI18n.listeners[event] = [];
      }
      mockI18n.listeners[event].push(callback);
    }),
    off: vi.fn((event: string, callback: (lang: string) => void) => {
      if (mockI18n.listeners[event]) {
        mockI18n.listeners[event] = mockI18n.listeners[event].filter(
          (listener) => listener !== callback
        );
      }
    }),
    listeners: {
      languageChanged: []
    }
  };
  return {
    default: mockI18n
  };
});

// Import the mocked module
import i18n from '../../lib/i18n';

// Simple test component that consumes the context
function TestComponent() {
  const context = useContext(LanguageContext)
  
  if (!context) {
    return <div>Context not available</div>
  }
  
  return (
    <div>
      <div data-testid="language">{context.language}</div>
      <button 
        data-testid="change-language" 
        onClick={() => context.changeLanguage('de')}
      >
        Change Language
      </button>
      <div data-testid="available-languages">
        {context.availableLanguages.map(lang => lang.code).join(',')}
      </div>
    </div>
  )
}

describe('LanguageProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset i18n language to English
    (i18n as unknown as MockI18n).language = 'en';
    // Clear event listeners
    (i18n as unknown as MockI18n).listeners.languageChanged = [];
  })
  
  it('renders children correctly', () => {
    render(
      <LanguageProvider>
        <div data-testid="child">Child Component</div>
      </LanguageProvider>
    )
    
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
  
  it('provides the context value to children', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )
    
    expect(screen.getByTestId('language')).toHaveTextContent('en')
    expect(screen.getByTestId('available-languages')).toHaveTextContent('en,de')
  })
  
  it('changes language when changeLanguage is called', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )
    
    // Initial language is English
    expect(screen.getByTestId('language')).toHaveTextContent('en')
    
    // Change language to German
    act(() => {
      screen.getByTestId('change-language').click()
    })
    
    // Verify i18n.changeLanguage was called
    expect(i18n.changeLanguage).toHaveBeenCalledWith('de')
    
    // Verify the language was updated in the context
    expect(screen.getByTestId('language')).toHaveTextContent('de')
  })
  
  it('updates language when i18n emits languageChanged event', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )
    
    // Initial language is English
    expect(screen.getByTestId('language')).toHaveTextContent('en')
    
    // Simulate i18n language change event
    act(() => {
      // Find the registered listener and call it
      const listeners = (i18n as unknown as MockI18n).listeners.languageChanged
      if (listeners && listeners.length > 0) {
        listeners[0]('fr')
      }
    })
    
    // Verify the language was updated in the context
    expect(screen.getByTestId('language')).toHaveTextContent('fr')
  })
  
  it('provides all required context properties', () => {
    let contextValue: typeof LanguageContext extends React.Context<infer T> ? T | undefined : never
    
    function ContextCapture() {
      contextValue = useContext(LanguageContext)
      return null
    }
    
    render(
      <LanguageProvider>
        <ContextCapture />
      </LanguageProvider>
    )
    
    // Check that all required properties are present
    expect(contextValue).toHaveProperty('language')
    expect(contextValue).toHaveProperty('changeLanguage')
    expect(contextValue).toHaveProperty('availableLanguages')
    
    // Check that availableLanguages matches the expected value
    expect(contextValue?.availableLanguages).toEqual(availableLanguages)
  })
  
  it('registers and unregisters i18n event listeners', () => {
    const { unmount } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )
    
    // Verify that the event listener was registered
    expect(i18n.on).toHaveBeenCalledWith('languageChanged', expect.any(Function))
    
    // Unmount the component
    unmount()
    
    // Verify that the event listener was unregistered
    expect(i18n.off).toHaveBeenCalledWith('languageChanged', expect.any(Function))
  })
})
