"use client"

import { Message } from 'ai'
import { UserMessage } from './user-message'
import { AssistantMessage } from './assistant-message'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === 'user' ? (
            <UserMessage content={message.content} />
          ) : (
            <AssistantMessage content={message.content} />
          )}
        </div>
      ))}
    </div>
  )
}