import type { Message } from '../types/chat'
import ChatMessage from './ChatMessage'
import ChatScrollAnchor from './ChatScrollAnchor'

interface ChatListProps {
  messages: Message[]
  isLoading?: boolean
}

function ChatList({ messages, isLoading = false }: ChatListProps) {
  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map(message => (
        <ChatMessage key={message.id} message={message} />
      ))}
      <ChatScrollAnchor trackVisibility={isLoading} />
    </div>
  )
}

export default ChatList 