"use client"

import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Send, Loader2, Sparkles, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageList } from './message-list'
import { OpportunityCard } from './opportunity-card'
import { WelcomeMessage } from './welcome-message'
import { cn } from '@/lib/utils'
import { generateId } from 'ai'

interface ChatInterfaceProps {
  initialMessage?: string | null
}

export function ChatInterface({ initialMessage }: ChatInterfaceProps = {}) {
  const { user } = useUser()
  const [isInitialized, setIsInitialized] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    sendMessage,
    isLoading,
    error,
    stop,
    reload
  } = useChat({
    api: '/api/chat',
    id: user?.id ? `chat-${user.id}` : undefined
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage({ text: input })
      setInput('')
    }
  }

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
    <div className="flex flex-col min-h-screen bg-background pt-16">
      {/* Main Chat Area */}
      <div className="flex-1 flex">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
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
                <div className="flex items-center gap-2 py-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Finding opportunities for you...</span>
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
                      onClick={() => reload()}
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

          {/* Input Area */}
          <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me about research, internships, grants, or anything else..."
                    className="pr-12 py-3 text-base rounded-2xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 bg-input"
                    disabled={isLoading}
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
                        disabled={!input?.trim() || isLoading}
                        className={cn(
                          "h-8 w-8 p-0 rounded-full transition-all duration-200",
                          input?.trim() && !isLoading
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
      </div>
    </div>
  )
}