import { useEffect, useRef } from 'react'

export function ChatScrollAnchor() {
  const anchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (anchorRef.current && typeof anchorRef.current.scrollIntoView === 'function') {
      anchorRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  })

  return <div ref={anchorRef} />
}
