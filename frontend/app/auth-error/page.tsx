"use client"

import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { AlertTriangle, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useClerk } from '@clerk/nextjs'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const { signOut } = useClerk()
  
  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        
        {/* Error Icon */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="mt-6 text-3xl font-display font-semibold text-foreground">
            Authentication Error
          </h1>
        </div>

        {/* Error Content */}
        <div className="space-y-6">
          {error === 'invalid_email_domain' ? (
            <>
              <div className="text-center space-y-2">
                <Mail className="mx-auto w-12 h-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold text-foreground">
                  Dartmouth Email Required
                </h2>
                <p className="text-muted-foreground">
                  This platform is exclusively for Dartmouth College students, faculty, and staff.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Email Requirements:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Must end with @dartmouth.edu</li>
                  <li>• Student, faculty, or staff accounts only</li>
                  <li>• Personal email addresses are not accepted</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
                <p className="text-sm text-blue-700">
                  If you're a Dartmouth community member having trouble:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Check your email address spelling</li>
                  <li>• Contact <a href="mailto:josue.godeme.25@dartmouth.edu" className="underline">josue.godeme.25@dartmouth.edu</a> for support</li>
                  <li>• Visit <a href="https://dartmouth.edu/comp/" className="underline" target="_blank" rel="noopener noreferrer">Dartmouth Computing</a> for account issues</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Something went wrong
              </h2>
              <p className="text-muted-foreground">
                An unexpected authentication error occurred. Please try again.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={handleSignOut} 
              className="w-full bg-primary hover:bg-primary/90"
            >
              Sign Out & Try Again
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Find Your Path is designed to help Dartmouth students discover 
              research, internships, and academic opportunities on campus.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}