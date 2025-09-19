"use client"

import { useState } from 'react'
import { Zap, ZapOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { cn } from '@/lib/utils'

interface GenZToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function GenZToggle({ className, size = 'md', showLabel = true }: GenZToggleProps) {
  const { user: clerkUser } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  // Get current user from Convex
  const user = useQuery(api.users.getCurrentUser, {})
  const updateProfile = useMutation(api.users.updateProfile)

  // Get current GenZ mode state
  const isGenZMode = user?.genzMode ?? false

  const handleToggle = async () => {
    if (!clerkUser || isLoading) return

    setIsLoading(true)
    try {
      await updateProfile({
        genzMode: !isGenZMode
      })
    } catch (error) {
      console.error('Failed to update GenZ mode:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  if (!clerkUser) {
    return null // Don't show toggle if not logged in
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        onClick={handleToggle}
        disabled={isLoading}
        variant={isGenZMode ? "default" : "outline"}
        size="sm"
        className={cn(
          "transition-all duration-200 rounded-full border-2",
          sizeClasses[size],
          isGenZMode
            ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-orange-500 shadow-md text-white"
            : "border-gray-300 hover:border-orange-400 bg-white hover:bg-orange-50"
        )}
        title={isGenZMode ? "Disable GenZ Mode" : "Enable GenZ Mode"}
      >
        {isGenZMode ? (
          <Zap className={cn(iconSizes[size], "text-white")} />
        ) : (
          <ZapOff className={cn(iconSizes[size], "text-gray-600")} />
        )}
      </Button>

      {showLabel && (
        <div className="flex flex-col">
          <span className={cn(
            "font-medium transition-colors duration-200",
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base',
            isGenZMode ? "text-orange-600" : "text-gray-700"
          )}>
            {isGenZMode ? "🔥 GenZ Mode" : "GenZ Mode"}
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-gray-500">
              {isGenZMode ? "Casual vibes active" : "Click to activate"}
            </span>
          )}
        </div>
      )}
    </div>
  )
}