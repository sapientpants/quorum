import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the heading', () => {
    render(<App />)
    expect(screen.getByText(/Hello daisyUI \+ Tailwind!/i)).toBeInTheDocument()
  })

  it('renders the buttons', () => {
    render(<App />)
    expect(screen.getByText(/Primary Button/i)).toBeInTheDocument()
    expect(screen.getByText(/Secondary Button/i)).toBeInTheDocument()
    expect(screen.getByText(/Accent Button/i)).toBeInTheDocument()
  })

  it('renders the card', () => {
    render(<App />)
    expect(screen.getByText(/Card Title/i)).toBeInTheDocument()
    expect(screen.getByText(/This is a daisyUI card component with some content./i)).toBeInTheDocument()
  })
}) 