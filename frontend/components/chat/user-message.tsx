"use client"

import { useUser } from '@clerk/nextjs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UIMessage } from '@ai-sdk/react'

interface UserMessageProps {
  message: UIMessage
  parts: any[]
}

export function UserMessage({ message, parts }: UserMessageProps) {
  const { user } = useUser()

  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="flex-1 flex justify-end">
        <div className="max-w-[80%] sm:max-w-[70%]">
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3">
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return <span key={`${message.id}-${i}`}>{part.text}</span>
                  default:
                    return null
                }
              })}
            </div>
          </div>
        </div>
      </div>

      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary/20">
        <AvatarImage src={user?.imageUrl} alt={user?.fullName || 'User'} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
          {user?.firstName?.[0] || user?.fullName?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}