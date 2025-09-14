"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const filterChips = ["First-years", "Paid", "STEM", "Humanities", "International"]

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const { isSignedIn } = useUser()
  const router = useRouter()

  const handleSearch = () => {
    const query = searchQuery.trim()
    if (!query) return

    if (isSignedIn) {
      // Redirect to chat with query parameter
      router.push(`/chat?q=${encodeURIComponent(query)}`)
    } else {
      // Store query in sessionStorage and redirect to sign-in
      sessionStorage.setItem('pendingChatQuery', query)
      router.push('/sign-in')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-stone-25 to-transparent flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[640px] text-left space-y-8">
        <h1 className="font-display font-semibold h1-clamp text-balance">
          Find your <span className="font-accent">Path</span>.
        </h1>

        <p className="font-sans text-lg md:text-xl text-muted-foreground text-pretty">
          Tell us who you are and what you're into—we'll point you to the right campus programs and where to go next.
        </p>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="I'm a class of '29 interested in biology. Are there any opportunities available to me?"
            className="pl-12 pr-4 py-4 text-base rounded-2xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 bg-input shadow-sm"
            data-focus-chat // Added data attribute for focus targeting from how-it-works CTA
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filterChips.map((chip) => (
            <Button
              key={chip}
              variant="outline"
              size="sm"
              className="px-4 py-2 text-sm font-medium rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 bg-transparent"
            >
              {chip}
            </Button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            size="lg"
            onClick={handleSearch}
            className="px-8 py-3 text-base font-medium rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Start searching
          </Button>
          <Button
            variant="link"
            size="lg"
            onClick={() => router.push('/chat')}
            className="text-muted-foreground hover:text-foreground underline-offset-4 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
          >
            Not sure? Take the 20‑sec quiz
          </Button>
        </div>
      </div>
    </section>
  )
}
