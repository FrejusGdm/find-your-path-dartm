"use client"

import { useState, useEffect } from "react"
import { Search, Menu, X, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'

export function Navbar() {
  const { user, isLoaded } = useUser()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const publicNavLinks = [
    { label: "Opportunities", href: "/opportunities" },
    { label: "Wall of Advice", href: "#advice" },
    { label: "Why this", href: "/why" },
  ]

  const loggedInNavLinks = [
    { label: "Opportunities", href: "/opportunities" },
    { label: "Wall of Advice", href: "#advice" },
    { label: "Why this", href: "/why" },
    { label: "Browse", href: "/browse", icon: Search },
    { label: "Saved", href: "/saved", icon: Bookmark },
  ]

  const currentNavLinks = user ? loggedInNavLinks : publicNavLinks

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled ? "backdrop-blur-md bg-white/80 border-b border-gray-200" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-4">
          {/* Left: Wordmark */}
          <div className="flex-shrink-0 min-w-0">
            <a href="/" className="flex items-center">
              <span className="font-display text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                Find your <span className="font-accent text-green-600">Path</span>
              </span>
            </a>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {currentNavLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md px-2 py-1 whitespace-nowrap"
              >
                {link.icon && <link.icon className="w-4 h-4 flex-shrink-0" />}
                <span className="hidden xl:inline">{link.label}</span>
                <span className="xl:hidden">{link.label.split(' ')[0]}</span>
              </a>
            ))}
          </div>

          {/* Tablet Navigation (md-lg) */}
          <div className="hidden md:flex lg:hidden items-center space-x-4">
            {currentNavLinks.slice(0, 3).map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 px-1 whitespace-nowrap"
              >
                {link.label.split(' ')[0]}
              </a>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {user ? (
              <>
                {/* User Greeting (Desktop) */}
                <div className="hidden lg:block">
                  <span className="text-sm text-gray-600">
                    Hey, <span className="font-medium text-gray-900">{user.firstName || 'there'}</span>
                  </span>
                </div>

                {/* User Button */}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8 sm:w-9 sm:h-9',
                      userButtonPopoverCard: 'bg-white border-gray-200',
                      userButtonPopoverActionButton: 'hover:bg-gray-100',
                    }
                  }}
                  userProfileProps={{
                    appearance: {
                      variables: {
                        colorPrimary: '#16a34a',
                      }
                    }
                  }}
                />
              </>
            ) : (
              <>
                {/* Search Icon (Desktop) */}
                <button
                  className="hidden lg:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>

                <Button 
                  onClick={() => window.location.href = '/chat'}
                  className="hidden sm:inline-flex px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base font-medium rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 whitespace-nowrap"
                >
                  <span className="hidden lg:inline">Start searching</span>
                  <span className="lg:hidden">Search</span>
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-gray-200">
                    <span className="font-display text-lg sm:text-xl font-semibold text-gray-900">
                      Find your <span className="font-accent text-green-600">Path</span>
                    </span>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors duration-200"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex-1 py-4 sm:py-6">
                    <nav className="space-y-2 sm:space-y-3">
                      {currentNavLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 text-base sm:text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md px-3 py-2.5 sm:py-3 hover:bg-gray-50"
                        >
                          {link.icon && <link.icon className="w-5 h-5 flex-shrink-0 text-gray-500" />}
                          <span className="truncate">{link.label}</span>
                        </a>
                      ))}
                    </nav>
                  </div>

                  {/* Bottom Actions */}
                  <div className="border-t border-gray-200 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                    {user ? (
                      <div className="text-center space-y-2">
                        <p className="text-xs sm:text-sm text-gray-600">Logged in as</p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 truncate px-2">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    ) : (
                      <>
                        <button className="flex items-center w-full text-left text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md px-3 py-2.5 hover:bg-gray-50">
                          <Search className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span>Search</span>
                        </button>
                        <Button
                          className="w-full px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                          onClick={() => {
                            setIsMobileMenuOpen(false)
                            window.location.href = '/chat'
                          }}
                        >
                          Start searching
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
