import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeleteConfirmationModal } from '../DeleteConfirmationModal'

describe('DeleteConfirmationModal', () => {
  const mockProps = {
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    onConfirm: vi.fn(),
    onCancel: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with the correct title and message', () => {
    render(<DeleteConfirmationModal {...mockProps} />)
    
    expect(screen.getByText('Delete Item')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument()
  })

  it('renders buttons with correct labels', () => {
    render(<DeleteConfirmationModal {...mockProps} />)
    
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    render(<DeleteConfirmationModal {...mockProps} />)
    
    fireEvent.click(screen.getByText('Delete'))
    expect(mockProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<DeleteConfirmationModal {...mockProps} />)
    
    fireEvent.click(screen.getByText('Cancel'))
    expect(mockProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when backdrop is clicked', () => {
    render(<DeleteConfirmationModal {...mockProps} />)
    
    // Find the backdrop element and click it
    const backdrop = screen.getByTestId('modal-backdrop')
    fireEvent.click(backdrop)
    
    expect(mockProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('applies the correct CSS classes to buttons', () => {
    render(<DeleteConfirmationModal {...mockProps} />)
    
    const confirmButton = screen.getByText('Delete')
    const cancelButton = screen.getByText('Cancel')
    
    expect(confirmButton).toHaveClass('btn', 'btn-error')
    expect(cancelButton).toHaveClass('btn', 'btn-ghost')
  })
})
