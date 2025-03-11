import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

// Mock the react-router-dom components
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="router-provider">{children}</div>
  ),
  Routes: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="routes">{children}</div>
  ),
  Route: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="route">{children}</div>
  )
}))

// Mock the ChatProvider
vi.mock('./contexts/ChatContext', () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chat-provider">{children}</div>
  )
}))

// Mock the page components
vi.mock('./components/layouts/AppLayout', () => ({
  AppLayout: () => <div data-testid="app-layout">App Layout</div>
}))

vi.mock('./pages/Welcome', () => ({
  Welcome: () => <div data-testid="welcome">Welcome</div>
}))

vi.mock('./pages/Settings', () => ({
  Settings: () => <div data-testid="settings">Settings</div>
}))

vi.mock('./pages/Templates', () => ({
  Templates: () => <div data-testid="templates">Templates</div>
}))

vi.mock('./pages/Help', () => ({
  Help: () => <div data-testid="help">Help</div>
}))

vi.mock('./pages/NotFound', () => ({
  NotFound: () => <div data-testid="not-found">Not Found</div>
}))

vi.mock('./components/Chat', () => ({
  default: () => <div data-testid="chat">Chat</div>
}))

describe('App', () => {
  it('renders the router provider', () => {
    render(<App />)
    expect(screen.getByTestId('router-provider')).toBeInTheDocument()
    expect(screen.getByTestId('chat-provider')).toBeInTheDocument()
  })
})