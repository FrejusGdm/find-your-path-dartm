"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdviceSubmissionForm } from "@/components/advice/AdviceSubmissionForm"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { AdviceSubmissionData } from "@/components/advice/types"

export default function SubmitAdvicePage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const submitAdvice = useMutation(api.advice.submitAdvicePost)

  // Redirect if not authenticated
  if (isLoaded && !user) {
    router.push("/sign-in?redirect=/advice/submit")
    return null
  }

  const handleSubmit = async (data: AdviceSubmissionData) => {
    setIsSubmitting(true)
    
    try {
      await submitAdvice({
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        isAnonymous: data.isAnonymous,
      })

      setIsSubmitted(true)
      toast.success("Your advice has been shared! 🎉")
      
      // Redirect to advice page after a short delay
      setTimeout(() => {
        router.push("/advice")
      }, 2000)
      
    } catch (error) {
      console.error("Error submitting advice:", error)
      toast.error("Failed to submit advice. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold mb-4">Advice Shared Successfully! 🎉</h1>
              
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Thank you for sharing your experience! Your advice is now live and will help other 
                Dartmouth students on their journey.
              </p>
              
              <div className="flex gap-3 justify-center">
                <Link href="/advice">
                  <Button>View Wall of Advice</Button>
                </Link>
                <Link href="/advice/submit">
                  <Button variant="outline">Share More Advice</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/advice">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Wall of Advice
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Guidelines Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sharing Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">✅ Great to share:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Personal experiences and lessons learned</li>
                    <li>• Specific tips and actionable advice</li>
                    <li>• Honest reflections on challenges</li>
                    <li>• Resources that helped you succeed</li>
                    <li>• Relationship and personal growth insights</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-red-700 mb-2">❌ Please avoid:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Political content or controversial topics</li>
                    <li>• Personal attacks or negative comments about others</li>
                    <li>• Spam or promotional content</li>
                    <li>• Identifying others without permission</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Privacy Options</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div>
                  <h4 className="font-medium mb-1">🙋‍♀️ With Your Name</h4>
                  <p className="text-muted-foreground">
                    Shows your first name, class year, and major. Great for building credibility 
                    and connecting with others.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">🕶️ Anonymous</h4>
                  <p className="text-muted-foreground">
                    Shows only "Anonymous Student" with your class year. Perfect for sensitive 
                    topics or personal struggles.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for Great Advice</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>• Be specific - concrete examples are more helpful than general statements</p>
                <p>• Share what you wish you'd known earlier</p>
                <p>• Include both successes and failures</p>
                <p>• Mention resources, people, or tools that helped</p>
                <p>• Write like you're talking to a friend</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <AdviceSubmissionForm
                  onSubmit={handleSubmit}
                  loading={isSubmitting}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


