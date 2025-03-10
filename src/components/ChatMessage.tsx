import type { Message } from '../types/chat'

interface ChatMessageProps {
  message: Message
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.senderId === 'user'
  
  return (
    <div className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          {isUser ? (
            <div className="bg-primary text-primary-content rounded-full w-full h-full flex items-center justify-center">
              <span className="text-xs font-bold">You</span>
            </div>
          ) : (
            <div className="bg-secondary text-secondary-content rounded-full w-full h-full flex items-center justify-center">
              <span className="text-xs font-bold">{message.senderId.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="chat-header">
        {isUser ? 'You' : message.senderId}
        {message.role && <span className="text-xs opacity-70 ml-2">({message.role})</span>}
        <time className="text-xs opacity-50 ml-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </time>
      </div>
      
      <div className={`chat-bubble ${isUser ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}>
        {message.text}
      </div>
      
      {message.model && (
        <div className="chat-footer opacity-50 text-xs">
          {message.provider} | {message.model}
        </div>
      )}
    </div>
  )
}

export default ChatMessage 