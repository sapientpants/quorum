import { useEffect, useRef } from 'react'

function ChatScrollAnchor() {
  const anchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (anchorRef.current && typeof anchorRef.current.scrollIntoView === 'function') {
      anchorRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  })

  return <div ref={anchorRef} />
}

export default ChatScrollAnchor 