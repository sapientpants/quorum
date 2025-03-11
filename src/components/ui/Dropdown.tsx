import * as React from 'react'
import { cn } from '@/lib/utils'

interface DropdownProps {
  children: React.ReactNode
  className?: string
}

interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
}

interface DropdownItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Dropdown({ children, className }: DropdownProps) {
  return (
    <div className={cn('relative inline-block text-left', className)}>
      {children}
    </div>
  )
}

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  return (
    <div
      className={cn(
        'absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
        className
      )}
    >
      <div className="py-1">{children}</div>
    </div>
  )
}

export function DropdownItem({ children, className, onClick }: DropdownItemProps) {
  return (
    <button
      className={cn(
        'block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
} 