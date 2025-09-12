import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from '@clerk/nextjs'
import { ConvexClientProvider } from "@/providers/convex-provider"
import { Toaster } from 'sonner'
import { dark } from '@clerk/themes'
import "./globals.css"
import { Suspense } from "react"
import { Navbar } from "@/components/navbar"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
})

// Note: Ancizar Serif and Rouge Script would be loaded from Google Fonts in production
// For this demo, we'll use fallbacks but include the proper CSS classes

export const metadata: Metadata = {
  title: "Find your Path - Dartmouth Opportunities",
  description: "Discover paid research, grants, and labs — fast, with real deadlines and official links.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
      <html lang="en" className={`${inter.variable}`}>
        <head>
          <link key="fonts-preconnect" rel="preconnect" href="https://fonts.googleapis.com" />
          <link key="fonts-preconnect-static" rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link key="rouge-script-font" href="https://fonts.googleapis.com/css2?family=Rouge+Script:wght@400&display=swap" rel="stylesheet" />
        </head>
        <body className="font-sans antialiased">
          <ConvexClientProvider>
            <Navbar />
            <Suspense fallback={null}>{children}</Suspense>
            <Analytics />
            <Toaster position="top-center" richColors />
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
