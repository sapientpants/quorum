import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { ErrorProvider } from '../ErrorContext'
import { useError } from '../../hooks/useErrorContext'
import { ConnectionQuality } from '../../utils/network'

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock('../../utils/network', () => ({
  getConnectionQuality: vi.fn().mockResolvedValue('good'),
  ConnectionQuality: {
    UNKNOWN: 'unknown',
    EXCELLENT: 'excellent',
    GOOD: 'good',
    FAIR: 'fair',
    POOR: 'poor',
    OFFLINE: 'offline',
  },
}))

// Test component that uses the error context
function TestComponent() {
  const { networkStatus, isOnline, isLowBandwidth, setApiError, apiError, showApiErrorModal, clearError } = useError()
  
  return (
    <div>
      <div data-testid="network-status">{networkStatus}</div>
      <div data-testid="is-online">{isOnline ? 'online' : 'offline'}</div>
      <div data-testid="is-low-bandwidth">{isLowBandwidth ? 'low' : 'high'}</div>
      <div data-testid="api-error">{apiError ? 'error' : 'no-error'}</div>
      <div data-testid="show-modal">{showApiErrorModal ? 'show' : 'hide'}</div>
      <button data-testid="set-error" onClick={() => setApiError(new Error('Test error'))}>Set Error</button>
      <button data-testid="clear-error" onClick={clearError}>Clear Error</button>
    </div>
  )
}

describe('ErrorContext', () => {
  // Mock navigator.onLine
  let originalOnLine: boolean
  
  beforeEach(() => {
    originalOnLine = window.navigator.onLine
    
    // Mock navigator.onLine
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
      writable: true,
    })
    
    // Reset mocks
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    // Restore navigator.onLine
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: originalOnLine,
      writable: true,
    })
    
    // Clear mocks and timers
    vi.restoreAllMocks()
  })
  
  it('provides initial context values', () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    )
    
    expect(screen.getByTestId('network-status')).toHaveTextContent(ConnectionQuality.UNKNOWN)
    expect(screen.getByTestId('is-online')).toHaveTextContent('online')
    expect(screen.getByTestId('is-low-bandwidth')).toHaveTextContent('high')
    expect(screen.getByTestId('api-error')).toHaveTextContent('no-error')
    expect(screen.getByTestId('show-modal')).toHaveTextContent('hide')
  })
  
  it('sets and clears errors', async () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    )
    
    // Initially no error
    expect(screen.getByTestId('api-error')).toHaveTextContent('no-error')
    expect(screen.getByTestId('show-modal')).toHaveTextContent('hide')
    
    // Set error
    await act(async () => {
      screen.getByTestId('set-error').click()
    })
    
    // Error should be set and modal should be shown
    expect(screen.getByTestId('api-error')).toHaveTextContent('error')
    expect(screen.getByTestId('show-modal')).toHaveTextContent('show')
    
    // Clear error
    await act(async () => {
      screen.getByTestId('clear-error').click()
    })
    
    // Error should be cleared and modal should be hidden
    expect(screen.getByTestId('api-error')).toHaveTextContent('no-error')
    expect(screen.getByTestId('show-modal')).toHaveTextContent('hide')
  })
  
  it('handles offline status', async () => {
    // Mock navigator.onLine as false
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
      writable: true,
    })
    
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    )
    
    // Should show offline status
    expect(screen.getByTestId('network-status')).toHaveTextContent(ConnectionQuality.OFFLINE)
    expect(screen.getByTestId('is-online')).toHaveTextContent('offline')
  })
  
  it('handles online event', async () => {
    // Start offline
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
      writable: true,
    })
    
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    )
    
    // Should show offline status
    expect(screen.getByTestId('network-status')).toHaveTextContent(ConnectionQuality.OFFLINE)
    
    // Simulate going online
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
      writable: true,
    })
    
    // Trigger online event
    await act(async () => {
      window.dispatchEvent(new Event('online'))
    })
    
    // Should show online status
    expect(screen.getByTestId('network-status')).not.toHaveTextContent(ConnectionQuality.OFFLINE)
  })
  
  it('handles offline event', async () => {
    // Mock navigator.onLine to be true initially
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true
    })
    
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    )
    
    // Initially online
    expect(screen.getByTestId('is-online')).toHaveTextContent('online')
    
    // Mock navigator.onLine to be false
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: false
    })
    
    // Simulate offline event
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    
    // Should show offline status with waitFor
    await waitFor(() => {
      expect(screen.getByTestId('is-online')).toHaveTextContent('offline')
    }, { timeout: 3000 })
  })
  
  it('detects low bandwidth', async () => {
    // Mock getConnectionQuality to return POOR
    const { getConnectionQuality } = await import('../../utils/network')
    vi.mocked(getConnectionQuality).mockResolvedValue(ConnectionQuality.POOR)
    
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    )
    
    // Wait for connection quality check
    await act(async () => {
      // Fast-forward timers
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    // Should detect low bandwidth
    expect(screen.getByTestId('is-low-bandwidth')).toHaveTextContent('low')
  })
})
