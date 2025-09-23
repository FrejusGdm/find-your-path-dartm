"use client"

import { UIMessage } from '@ai-sdk/react'
import { UserMessage } from './user-message'
import { AssistantMessage } from './assistant-message'

interface MessageListProps {
  messages: UIMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === 'user' ? (
            <UserMessage
              message={message}
              parts={message.parts || []}
            />
          ) : (
            <AssistantMessage
              message={message}
              parts={message.parts || []}
            />
          )}
        </div>
      ))}
    </div>
  )
}