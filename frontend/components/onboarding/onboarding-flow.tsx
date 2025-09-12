"use client"

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface OnboardingData {
  year: string
  major: string
  interests: string[]
  goals: string
  isInternational: boolean
  isFirstGen: boolean
}

const YEARS = [
  { value: 'first-year', label: "First-year (Class of '28)" },
  { value: 'sophomore', label: "Sophomore (Class of '27)" },
  { value: 'junior', label: "Junior (Class of '26)" },
  { value: 'senior', label: "Senior (Class of '25)" },
  { value: 'graduate', label: 'Graduate student' },
  { value: 'other', label: 'Other' },
]

const INTEREST_OPTIONS = [
  'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Computer Science',
  'Engineering', 'Psychology', 'Neuroscience', 'Economics', 'Government',
  'History', 'English', 'Philosophy', 'Anthropology', 'Sociology',
  'Environmental Studies', 'Art', 'Music', 'Theater', 'Film',
  'Medicine', 'Law', 'Business', 'Education', 'Public Policy'
]

export function OnboardingFlow() {
  const { user } = useUser()
  const completeOnboarding = useMutation(api.users.completeOnboarding)
  
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    year: '',
    major: '',
    interests: [],
    goals: '',
    isInternational: false,
    isFirstGen: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => {
    if (step < 5) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleInterestToggle = (interest: string) => {
    setData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await completeOnboarding({
        year: data.year as any,
        major: data.major || undefined,
        interests: data.interests,
        goals: data.goals || undefined,
        isInternational: data.isInternational || undefined,
        isFirstGen: data.isFirstGen || undefined,
      })
      
      toast.success("Welcome aboard! Let's find your path 🚀")
      
      // Redirect to chat after a brief delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return data.year !== ''
      case 2: return true // Major is optional
      case 3: return data.interests.length > 0
      case 4: return true // Goals are optional
      case 5: return true // Status questions are optional
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-25 to-transparent flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 5</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / 5) * 100)}% complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          {/* Step 1: Year */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="font-display text-3xl font-semibold">
                  Welcome, {user?.firstName}! 
                </h1>
                <p className="text-muted-foreground">
                  Let's get to know you so we can find the perfect opportunities.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">What year are you?</label>
                <div className="grid grid-cols-1 gap-2">
                  {YEARS.map((year) => (
                    <button
                      key={year.value}
                      onClick={() => setData(prev => ({ ...prev, year: year.value }))}
                      className={cn(
                        "p-4 text-left rounded-xl border transition-all",
                        data.year === year.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      {year.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Major */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold">What's your major?</h2>
                <p className="text-muted-foreground">
                  Don't worry if you're undeclared or thinking about switching!
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="e.g., Biology, Computer Science, or 'Undeclared'"
                  value={data.major}
                  onChange={(e) => setData(prev => ({ ...prev, major: e.target.value }))}
                  className="text-base py-3"
                />
                <p className="text-xs text-muted-foreground">
                  This helps us recommend opportunities in your field and related areas.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold">What interests you?</h2>
                <p className="text-muted-foreground">
                  Select any areas you're curious about. You can choose as many as you like!
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-full border transition-all",
                        data.interests.includes(interest)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                
                {data.interests.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Selected {data.interests.length} interest{data.interests.length === 1 ? '' : 's'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Goals */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold">What are your goals?</h2>
                <p className="text-muted-foreground">
                  What do you hope to achieve or explore? This could be career goals, academic interests, or personal growth.
                </p>
              </div>

              <div className="space-y-3">
                <Textarea
                  placeholder="e.g., 'I want to get research experience for grad school' or 'I'm interested in tech but don't know where to start' or just 'I'm exploring my options'"
                  value={data.goals}
                  onChange={(e) => setData(prev => ({ ...prev, goals: e.target.value }))}
                  className="min-h-[100px] text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Optional, but helps us give you more personalized recommendations.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Status */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold">A couple quick questions</h2>
                <p className="text-muted-foreground">
                  This helps us highlight opportunities that might be especially relevant to you.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border border-border rounded-xl">
                  <Checkbox
                    id="international"
                    checked={data.isInternational}
                    onCheckedChange={(checked) => 
                      setData(prev => ({ ...prev, isInternational: checked as boolean }))
                    }
                  />
                  <div className="space-y-1">
                    <label htmlFor="international" className="text-sm font-medium">
                      I'm an international student
                    </label>
                    <p className="text-xs text-muted-foreground">
                      We'll prioritize opportunities that are open to international students
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border border-border rounded-xl">
                  <Checkbox
                    id="firstgen"
                    checked={data.isFirstGen}
                    onCheckedChange={(checked) => 
                      setData(prev => ({ ...prev, isFirstGen: checked as boolean }))
                    }
                  />
                  <div className="space-y-1">
                    <label htmlFor="firstgen" className="text-sm font-medium">
                      I'm a first-generation college student
                    </label>
                    <p className="text-xs text-muted-foreground">
                      We'll highlight resources designed to support first-gen students
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {step < 5 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            You can always update this information later in your profile settings.
          </p>
        </div>
      </div>
    </div>
  )
}