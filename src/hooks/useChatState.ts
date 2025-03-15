import { useState, useCallback } from 'react'
import type { Message } from '../types/chat'
import type { LLMProvider } from '../types/llm'
import { nanoid } from 'nanoid'

export function useChatState(initialMessages: Message[] = []) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0
      ? initialMessages
      : [
          {
            id: '1',
            senderId: 'system',
            text: 'Welcome to Quorum! Please select a provider and add an API key to start chatting.',
            timestamp: Date.now()
          }
        ]
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addUserMessage = useCallback((text: string) => {
    if (!text.trim()) return null

    const userMessage: Message = {
      id: nanoid(),
      senderId: 'user',
      text,
      timestamp: Date.now()
    }

    setMessages((prev) => [...prev, userMessage])
    return userMessage
  }, [])

  const addAIMessage = useCallback(
    (
      provider: LLMProvider,
      model: string,
      status: 'sending' | 'sent' | 'error' = 'sending'
    ) => {
      const aiMessageId = nanoid()
      const aiPlaceholder: Message = {
        id: aiMessageId,
        senderId: 'assistant',
        text: '',
        timestamp: Date.now(),
        provider: provider.id,
        model,
        status
      }

      setMessages((prev) => [...prev, aiPlaceholder])
      return aiMessageId
    },
    []
  )

  const updateAIMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    )
  }, [])

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
  }, [])

  const handleRetry = useCallback(
    (messageId: string, sendMessageFn: (text: string) => void) => {
      // Find the message to retry
      const messageToRetry = messages.find((msg) => msg.id === messageId)
      if (!messageToRetry || messageToRetry.status !== 'error') return

      // Find the last user message before this one
      const userMessages = messages.filter((msg) => msg.senderId === 'user')
      const lastUserMessage = userMessages[userMessages.length - 1]

      if (lastUserMessage) {
        // Remove the error message
        removeMessage(messageId)

        // Resend the last user message
        sendMessageFn(lastUserMessage.text)
      }
    },
    [messages, removeMessage]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    setIsLoading,
    error,
    setError,
    addUserMessage,
    addAIMessage,
    updateAIMessage,
    removeMessage,
    handleRetry,
    clearError
  }
}
