import { useContext } from 'react'
import { ErrorContext } from '../contexts/contexts/ErrorContextDefinition'

/**
 * Custom hook to use the error context
 */
export function useError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
} 