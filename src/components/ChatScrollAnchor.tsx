import { useEffect, useRef } from 'react'

interface ChatScrollAnchorProps {
  trackVisibility?: boolean
}

function ChatScrollAnchor({ trackVisibility = true }: ChatScrollAnchorProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (trackVisibility && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [trackVisibility])

  return <div ref={ref} />
}

export default ChatScrollAnchor 