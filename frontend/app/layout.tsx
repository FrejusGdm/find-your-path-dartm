import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ConvexClientProvider } from "@/providers/convex-provider"
import { Toaster } from 'sonner'
import "./globals.css"
import { Suspense } from "react"
import { ConditionalNavbar } from "@/components/conditional-navbar"

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

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link key="fonts-preconnect" rel="preconnect" href="https://fonts.googleapis.com" />
        <link key="fonts-preconnect-static" rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link key="rouge-script-font" href="https://fonts.googleapis.com/css2?family=Rouge+Script:wght@400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <ConvexClientProvider>
          <ConditionalNavbar />
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
          <Analytics />
          <Toaster position="top-center" richColors />
        </ConvexClientProvider>
      </body>
    </html>
  )
}
