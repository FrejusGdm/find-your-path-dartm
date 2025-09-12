"use client"

import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

export function AuthDebugInfo() {
  const { isLoaded: authLoaded, userId } = useAuth()
  const { isLoaded: userLoaded, user } = useUser()

  useEffect(() => {
    console.log('🔐 Auth Debug Info:', {
      authLoaded,
      userLoaded,
      userId: userId ? 'present' : 'null',
      userEmail: user?.emailAddresses?.[0]?.emailAddress,
      clerk: typeof window !== 'undefined' ? !!window.Clerk : 'server',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  }, [authLoaded, userLoaded, userId, user])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white text-xs p-2 rounded max-w-xs z-50">
      <div>Auth: {authLoaded ? '✅' : '⏳'}</div>
      <div>User: {userLoaded ? '✅' : '⏳'}</div>
      <div>ID: {userId ? '✅' : '❌'}</div>
      <div>Email: {user?.emailAddresses?.[0]?.emailAddress || 'none'}</div>
    </div>
  )
}