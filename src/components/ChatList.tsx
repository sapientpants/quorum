import { ChatMessage } from "./ChatMessage";
import { ChatScrollAnchor } from "./ChatScrollAnchor";
import type { Message } from "../types/chat";

interface ChatListProps {
  readonly messages: Message[];
  readonly isLoading?: boolean;
  readonly onRetry?: (messageId: string) => void;
}

export function ChatList({
  messages,
  isLoading = false,
  onRetry,
}: ChatListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} onRetry={onRetry} />
      ))}

      {isLoading && (
        <div className="flex justify-center my-4">
          <span className="loading loading-dots loading-md"></span>
        </div>
      )}

      <ChatScrollAnchor />
    </div>
  );
}
