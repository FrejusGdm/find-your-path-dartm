"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, User, GraduationCap, Target, ArrowRight } from "lucide-react"

const ACADEMIC_YEARS = [
  { value: "first-year", label: "First Year" },
  { value: "sophomore", label: "Sophomore" },
  { value: "junior", label: "Junior" },
  { value: "senior", label: "Senior" },
  { value: "graduate", label: "Graduate Student" },
  { value: "faculty", label: "Faculty" },
  { value: "staff", label: "Staff" },
]

const COMMON_MAJORS = [
  "Computer Science", "Economics", "Government", "Psychology", "History",
  "English", "Biology", "Mathematics", "Engineering", "Physics",
  "Chemistry", "Anthropology", "Sociology", "Philosophy", "Art History",
  "Film and Media Studies", "Environmental Studies", "Neuroscience",
  "International Studies", "Linguistics", "Theater", "Music"
]

const INTERESTS = [
  "Research", "Internships", "Study Abroad", "Community Service",
  "Leadership", "Entrepreneurship", "Arts & Culture", "Athletics",
  "Writing & Publishing", "Technology", "Policy & Government",
  "Healthcare", "Education", "Environmental Issues", "Social Justice"
]

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    year: '',
    major: '',
    interests: [] as string[],
    goals: '',
    experience: '',
  })

  // Redirect if not logged in
  if (isLoaded && !user) {
    router.push('/sign-in')
    return null
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    // Here you would typically save to your database
    // For now, we'll just simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redirect to main application
    router.push('/chat')
  }

  const isStep1Valid = formData.year && formData.major
  const isStep2Valid = formData.interests.length > 0
  const isStep3Valid = formData.goals.trim().length > 0

  if (!isLoaded) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Welcome to Find Your Path!
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Let's personalize your experience to help you discover the best opportunities at Dartmouth.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step > stepNumber ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 ${
                    step > stepNumber ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {step === 1 && <User className="w-5 h-5 text-primary" />}
              {step === 2 && <Target className="w-5 h-5 text-primary" />}
              {step === 3 && <GraduationCap className="w-5 h-5 text-primary" />}
              <div>
                <CardTitle>
                  {step === 1 && "Tell us about yourself"}
                  {step === 2 && "What interests you?"}
                  {step === 3 && "Your goals & experience"}
                </CardTitle>
                <CardDescription>
                  {step === 1 && "Basic information to get started"}
                  {step === 2 && "Select areas you'd like to explore"}
                  {step === 3 && "Help us understand your aspirations"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Academic Status</Label>
                  <Select value={formData.year} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, year: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your academic status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_YEARS.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="major">Major / Department</Label>
                  <Input
                    id="major"
                    value={formData.major}
                    onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                    placeholder="e.g. Computer Science, Economics, Undeclared"
                    list="majors"
                  />
                  <datalist id="majors">
                    {COMMON_MAJORS.map((major) => (
                      <option key={major} value={major} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}

            {/* Step 2: Interests */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select all areas that interest you (choose at least one):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          formData.interests.includes(interest)
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-background border-border hover:bg-muted'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
                
                {formData.interests.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Selected interests:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Goals & Experience */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goals">What are your main goals at Dartmouth?</Label>
                  <Textarea
                    id="goals"
                    value={formData.goals}
                    onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                    placeholder="e.g. Find research opportunities, build leadership skills, explore career paths..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">Any relevant experience or background? (Optional)</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="e.g. Previous internships, projects, leadership roles, specific skills..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              {step > 1 ? (
                <Button 
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              {step < 3 ? (
                <Button 
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !isStep1Valid) ||
                    (step === 2 && !isStep2Valid)
                  }
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!isStep3Valid || loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? "Setting up your profile..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skip Option */}
        {step === 1 && (
          <div className="text-center mt-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/chat')}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}