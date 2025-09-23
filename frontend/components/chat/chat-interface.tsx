"use client"

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, UIMessage } from 'ai'
import { useState, useRef, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Send, Loader2, Sparkles, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageList } from './message-list'
import { OpportunityCard } from './opportunity-card'
import { WelcomeMessage } from './welcome-message'
import { cn } from '@/lib/utils'
import { useLoadingMessages } from '@/hooks/use-loading-messages'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Zap, ZapOff } from 'lucide-react'

interface ChatInterfaceProps {
  initialMessage?: string | null
  conversationId?: Id<"conversations"> | null
  userId?: Id<"users"> | null
  onAutoCreateConversation?: () => Promise<Id<"conversations"> | null>
}

export function ChatInterface({
  initialMessage,
  conversationId,
  userId,
  onAutoCreateConversation
}: ChatInterfaceProps = {}) {
  const { user } = useUser()
  const [isInitialized, setIsInitialized] = useState(false)
  const [input, setInput] = useState('')
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<Id<"conversations"> | null>(conversationId || null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get current user and Gen Z mode
  const currentUser = useQuery(api.users.getCurrentUser, {})
  const updateProfile = useMutation(api.users.updateProfile)
  const isGenZMode = currentUser?.genzMode ?? false

  const {
    messages,
    sendMessage,
    status,
    error,
    stop
  } = useChat({
    id: currentConversationId || undefined,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        conversationId: currentConversationId,
        userId: userId
      },
      // Optimize requests - only send current message, not full history
      prepareSendMessagesRequest({ messages, id }) {
        return {
          body: {
            message: messages[messages.length - 1],
            conversationId: currentConversationId,
            userId: userId,
            id
          }
        }
      }
    })
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  // Handle Gen Z mode toggle
  const handleGenZToggle = async () => {
    if (!user) return
    try {
      await updateProfile({
        genzMode: !isGenZMode
      })
    } catch (error) {
      console.error('Failed to update GenZ mode:', error)
    }
  }


  // Get last user message for context - AI SDK v5 uses 'parts' structure
  const lastUserMessage = (() => {
    const lastMsg = messages.filter(m => m.role === 'user').slice(-1)[0]
    if (!lastMsg?.parts?.[0]) return ''
    const firstPart = lastMsg.parts[0] as any
    return firstPart?.text || firstPart?.content || ''
  })()

  // Dynamic loading messages based on context
  const loadingMessage = useLoadingMessages({
    userMessage: lastUserMessage,
    isToolCall: isLoading
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && status === 'ready') {
      // Only auto-create conversation if we don't have one AND no messages exist
      if (!currentConversationId && messages.length === 0 && onAutoCreateConversation) {
        const convId = await onAutoCreateConversation()
        if (convId) {
          setCurrentConversationId(convId)
        }
      }

      sendMessage({ text: input })
      setInput('')
    }
  }

  // Load messages when conversation changes
  useEffect(() => {
    async function loadMessages() {
      if (conversationId && conversationId !== currentConversationId) {
        try {
          const response = await fetch(`/api/conversations/${conversationId}/messages`)
          if (response.ok) {
            const data = await response.json()
            setInitialMessages(data.messages || [])
            setCurrentConversationId(conversationId)
            console.log('Loaded messages for conversation:', conversationId, data.messages?.length || 0)
          }
        } catch (error) {
          console.error('Failed to load messages:', error)
        }
      } else if (!conversationId && currentConversationId) {
        // Clear messages when starting new conversation
        setInitialMessages([])
        setCurrentConversationId(null)
        console.log('Cleared messages for new conversation')
      }
    }

    // Add a small delay to ensure proper state synchronization
    const timeoutId = setTimeout(loadMessages, 100)
    return () => clearTimeout(timeoutId)
  }, [conversationId, currentConversationId])

  // Initialize chat on first load and handle initial message
  useEffect(() => {
    if (!isInitialized && user && initialMessage?.trim()) {
      setIsInitialized(true)
      // Auto-send initial message if provided
      setTimeout(() => {
        sendMessage({ text: initialMessage })
      }, 500)
    }
  }, [user, isInitialized, initialMessage, sendMessage])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Mode Header */}
      <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Chat Mode:</span>
            <div className="flex items-center bg-muted rounded-full p-1">
              <button
                onClick={handleGenZToggle}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full transition-all duration-200",
                  !isGenZMode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Normal
              </button>
              <button
                onClick={handleGenZToggle}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full transition-all duration-200",
                  isGenZMode
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Gen Z 🔥
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <WelcomeMessage onStartChat={(message) => {
              sendMessage({ text: message })
            }} />
          ) : (
            <MessageList messages={messages} />
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 py-4 animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-muted-foreground transition-all duration-300">
                {loadingMessage}
              </span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="py-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-destructive rounded-full" />
                  <span className="text-sm font-medium text-destructive">Something went wrong</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  I had trouble processing your message. Let's try again.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about research, internships, grants, or anything else..."
                className="pr-12 py-3 text-base rounded-2xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 bg-input"
                disabled={status !== 'ready'}
                maxLength={1000}
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isLoading ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={stop}
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <div className="w-3 h-3 bg-muted-foreground rounded-sm" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!input?.trim() || status !== 'ready'}
                    className={cn(
                      "h-8 w-8 p-0 rounded-full transition-all duration-200",
                      input?.trim() && status === 'ready'
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md"
                        : "bg-muted hover:bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="pt-3 text-center">
            <p className="text-xs text-muted-foreground">
              AI can make mistakes. Always check official pages and confirm details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}