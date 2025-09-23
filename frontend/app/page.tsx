"use client"

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"
import { LoadingScreen } from "@/components/ui/loading-screen"

function AuthenticatedHomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to chat
    router.push("/chat")
  }, [router])

  return <LoadingScreen />
}

export default function HomePage() {
  return (
    <>
      <AuthLoading>
        <LoadingScreen />
      </AuthLoading>
      <Authenticated>
        <AuthenticatedHomePage />
      </Authenticated>
      <Unauthenticated>
        <main className="min-h-screen">
          <HeroSection />
        </main>
        <Footer />
      </Unauthenticated>
    </>
  )
}
