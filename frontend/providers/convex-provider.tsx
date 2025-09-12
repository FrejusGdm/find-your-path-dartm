"use client"

import { ReactNode } from "react"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { ClerkProvider, useAuth } from "@clerk/nextjs"
import { ConvexProviderWithClerk } from "convex/react-clerk"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined, // Use light theme by default
        variables: {
          colorPrimary: '#00693e', // Dartmouth green
          colorText: '#0b0f0e',
          fontFamily: 'Inter, ui-sans-serif, system-ui',
        },
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
          card: 'bg-card border border-border',
          headerTitle: 'text-foreground font-display',
          headerSubtitle: 'text-muted-foreground',
        }
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}