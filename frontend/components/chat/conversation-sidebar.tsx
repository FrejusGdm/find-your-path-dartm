"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { MessageSquarePlus, Menu, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

interface ConversationSidebarProps {
  userId: Id<"users">
  activeConversationId?: Id<"conversations"> | null
  onSelectConversation: (id: Id<"conversations"> | null) => void
  onNewConversation: () => void
  className?: string
  isMobile?: boolean
}

function ConversationList({
  userId,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: Omit<ConversationSidebarProps, "className" | "isMobile">) {
  const conversations = useQuery(api.conversations.getUserConversations, {
    userId,
    limit: 50,
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button
          onClick={onNewConversation}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <MessageSquarePlus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!conversations ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No conversations yet.
            <br />
            Start a new chat to begin!
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => {
              const isActive = conversation._id === activeConversationId
              const title = conversation.title || "New conversation"
              const timeAgo = formatDistanceToNow(conversation.lastMessageAt, {
                addSuffix: true,
              })

              return (
                <button
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation._id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                >
                  <div className="font-medium text-sm truncate">{title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {conversation.messageCount} messages · {timeAgo}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          {conversations?.length || 0} conversations
        </div>
      </div>
    </div>
  )
}

export function ConversationSidebar({
  userId,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  className,
  isMobile = false,
}: ConversationSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const content = (
    <ConversationList
      userId={userId}
      activeConversationId={activeConversationId}
      onSelectConversation={(id) => {
        onSelectConversation(id)
        if (isMobile) setIsOpen(false)
      }}
      onNewConversation={() => {
        onNewConversation()
        if (isMobile) setIsOpen(false)
      }}
    />
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle conversations"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Conversations</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {content}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className={cn(
        "hidden md:flex flex-col bg-background border-r",
        className
      )}
    >
      {content}
    </div>
  )
}