import * as React from 'react'
import { cn } from '@/lib/utils'

interface DropdownProps {
  children: React.ReactNode
  className?: string
}

interface DropdownTriggerProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
  isOpen: boolean
}

interface DropdownItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Dropdown({ children, className }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const toggleDropdown = () => setIsOpen(!isOpen)
  const closeDropdown = () => setIsOpen(false)
  
  React.useEffect(() => {
    document.addEventListener('click', closeDropdown)
    return () => document.removeEventListener('click', closeDropdown)
  }, [])
  
  return (
    <div className={cn('relative inline-block', className)} onClick={(e) => e.stopPropagation()}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === DropdownTrigger) {
            return React.cloneElement(child as React.ReactElement<DropdownTriggerProps>, {
              onClick: toggleDropdown
            })
          }
          if (child.type === DropdownMenu) {
            return React.cloneElement(child as React.ReactElement<DropdownMenuProps>, {
              isOpen
            })
          }
          return child
        }
        return child
      })}
    </div>
  )
}

export function DropdownTrigger({ children, className, onClick }: DropdownTriggerProps) {
  return (
    <div 
      className={cn('cursor-pointer', className)} 
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function DropdownMenu({ children, className, isOpen }: DropdownMenuProps) {
  if (!isOpen) return null
  
  return (
    <div 
      className={cn(
        'absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50',
        className
      )}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  )
}

export function DropdownItem({ children, className, onClick }: DropdownItemProps) {
  return (
    <div
      className={cn(
        'block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
} 