"use client"

import { Loader2 } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-25 to-transparent flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Logo/Brand */}
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Find your <span className="font-accent text-primary">Path</span>
          </h1>
          <p className="text-muted-foreground text-sm">Getting everything ready...</p>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center py-8">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            
            {/* Subtle pulse background */}
            <div className="absolute inset-0 w-8 h-8 bg-primary/20 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <div className="w-48 h-2 bg-muted rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
          <p className="text-xs text-muted-foreground">
            Setting up your personalized experience
          </p>
        </div>
      </div>
    </div>
  )
}