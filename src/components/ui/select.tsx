import * as React from "react"
import { IconCaretDown } from "@tabler/icons-react"
import { cn } from "../../lib/utils"

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

export interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

export function Select({
  children,
  value,
  onValueChange,
  // We'll keep the disabled prop for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  disabled = false,
  ...props
}: SelectProps) {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div {...props}>{children}</div>
    </SelectContext.Provider>
  )
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string
}

export function SelectTrigger({ 
  className, 
  children, 
  placeholder,
  ...props 
}: SelectTriggerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  // Not using context in this component for now
  const ref = React.useRef<HTMLButtonElement>(null)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // When opening, ensure dropdown is displayed on next render
      setTimeout(() => {
        document.addEventListener('click', handleOutsideClick)
      }, 0)
    }
  }

  const handleOutsideClick = React.useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setIsOpen(false)
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [])

  React.useEffect(() => {
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [handleOutsideClick])

  return (
    <button
      type="button"
      ref={ref}
      onClick={toggleDropdown}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <div className="flex-1 text-left truncate">
        {children || placeholder || "Select option"}
      </div>
      <IconCaretDown className="h-4 w-4 opacity-50" />
      {isOpen && (
        <div className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95" style={{ top: '100%' }}>
          <SelectContent />
        </div>
      )}
    </button>
  )
}

export function SelectContent({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("py-1", className)}>
      {/* This will be replaced with actual content at runtime */}
    </div>
  )
}

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function SelectItem({ className, children, value, ...props }: SelectItemProps) {
  const { value: selectedValue, onValueChange } = React.useContext(SelectContext)
  const isSelected = selectedValue === value
  
  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
      onClick={() => onValueChange?.(value)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext)
  return <span>{value || placeholder}</span>
} 