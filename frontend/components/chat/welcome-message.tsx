"use client"

import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Sparkles, Search, BookOpen, DollarSign, Globe } from 'lucide-react'

interface WelcomeMessageProps {
  onStartChat: (message: string) => void
}

export function WelcomeMessage({ onStartChat }: WelcomeMessageProps) {
  const { user } = useUser()

  const quickStarters = [
    {
      icon: Search,
      title: "I'm exploring my options",
      subtitle: "Not sure where to start? Let's discover together.",
      message: "I'm not sure what opportunities are available to me. Can you help me explore?"
    },
    {
      icon: BookOpen,
      title: "I want to do research",
      subtitle: "Find labs, professors, and research programs.",
      message: "I'm interested in doing research but don't know how to get started."
    },
    {
      icon: DollarSign,
      title: "I need paid opportunities",
      subtitle: "Discover grants, stipends, and paid positions.",
      message: "I'm looking for paid research or internship opportunities."
    },
    {
      icon: Globe,
      title: "International student options",
      subtitle: "Find programs that welcome international students.",
      message: "I'm an international student. What opportunities are available to me?"
    }
  ]

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">
            {user?.firstName ? (
              <>Hey {user.firstName}! Ready to find your <span className="font-accent text-primary">Path</span>?</>
            ) : (
              <>Welcome! Let's find your <span className="font-accent text-primary">Path</span></>
            )}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            I'm your AI guide to discovering opportunities at Dartmouth. 
            Tell me about yourself, and I'll help you find programs, research, grants, and more.
          </p>
        </div>
      </div>

      {/* Quick Starters */}
      <div className="space-y-4">
        <h2 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Quick ways to get started
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickStarters.map((starter) => (
            <Button
              key={starter.title}
              variant="outline"
              className="h-auto p-6 text-left justify-start border border-border hover:border-primary/50 hover:bg-primary/5 group transition-all duration-200"
              onClick={() => onStartChat(starter.message)}
            >
              <div className="flex items-start gap-4 w-full">
                <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <starter.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {starter.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {starter.subtitle}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground bg-muted/50 rounded-xl px-4 py-3 inline-block">
          <strong className="text-foreground">💡 Pro tip:</strong> The more specific you are about your interests and year, 
          the better I can help you find relevant opportunities!
        </p>
      </div>
    </div>
  )
}