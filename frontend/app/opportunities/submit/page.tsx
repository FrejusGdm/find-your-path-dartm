"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { useUser } from "@clerk/nextjs"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

const CATEGORIES = [
  { value: "research", label: "Research" },
  { value: "internship", label: "Internships" },
  { value: "grant", label: "Grants" },
  { value: "program", label: "Programs" },
  { value: "fellowship", label: "Fellowships" },
  { value: "competition", label: "Competitions" },
]

const ELIGIBLE_YEARS = [
  { value: "first-year", label: "First Year" },
  { value: "sophomore", label: "Sophomore" },
  { value: "junior", label: "Junior" },
  { value: "senior", label: "Senior" },
]

export default function SubmitOpportunityPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const createOpportunity = useMutation(api.opportunities.create)
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    category: "",
    eligibleYears: [] as string[],
    eligibleMajors: [] as string[],
    internationalEligible: true,
    gpaRequirement: undefined as number | undefined,
    isPaid: false,
    estimatedHours: "",
    timeCommitment: "",
    officialUrl: "",
    applicationUrl: "",
    contactEmail: "",
    contactName: "",
    contactRole: "",
    nextSteps: [] as string[],
    tags: [] as string[],
  })
  
  const [newTag, setNewTag] = useState("")
  const [newNextStep, setNewNextStep] = useState("")
  const [newMajor, setNewMajor] = useState("")

  // Redirect if not logged in
  if (isLoaded && !user) {
    router.push("/sign-in")
    return null
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }))
  }

  const addNextStep = () => {
    if (newNextStep.trim()) {
      setFormData(prev => ({ ...prev, nextSteps: [...prev.nextSteps, newNextStep.trim()] }))
      setNewNextStep("")
    }
  }

  const removeNextStep = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      nextSteps: prev.nextSteps.filter((_, i) => i !== index) 
    }))
  }

  const addMajor = () => {
    if (newMajor.trim() && !formData.eligibleMajors.includes(newMajor.trim())) {
      setFormData(prev => ({ ...prev, eligibleMajors: [...prev.eligibleMajors, newMajor.trim()] }))
      setNewMajor("")
    }
  }

  const removeMajor = (majorToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      eligibleMajors: prev.eligibleMajors.filter(major => major !== majorToRemove) 
    }))
  }

  const toggleEligibleYear = (year: string) => {
    setFormData(prev => ({
      ...prev,
      eligibleYears: prev.eligibleYears.includes(year)
        ? prev.eligibleYears.filter(y => y !== year)
        : [...prev.eligibleYears, year]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.department.trim() || 
        !formData.category || !formData.officialUrl.trim() || formData.eligibleYears.length === 0) {
      setMessage("Please fill in all required fields.")
      return
    }

    try {
      setLoading(true)
      setMessage("")
      
      await createOpportunity({
        ...formData,
        gpaRequirement: formData.gpaRequirement || undefined,
        applicationUrl: formData.applicationUrl || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactName: formData.contactName || undefined,
        contactRole: formData.contactRole || undefined,
      })
      
      setMessage("Opportunity submitted successfully! It will be reviewed before being published.")
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        department: "",
        category: "",
        eligibleYears: [],
        eligibleMajors: [],
        internationalEligible: true,
        gpaRequirement: undefined,
        isPaid: false,
        estimatedHours: "",
        timeCommitment: "",
        officialUrl: "",
        applicationUrl: "",
        contactEmail: "",
        contactName: "",
        contactRole: "",
        nextSteps: [],
        tags: [],
      })
      
      // Redirect to opportunities page after a delay
      setTimeout(() => {
        router.push("/opportunities")
      }, 2000)
      
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          
          {/* Header */}
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Submit an Opportunity
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Help other students discover amazing opportunities at Dartmouth
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Details</CardTitle>
              <CardDescription>
                All fields marked with * are required. Your submission will be reviewed before being published.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="e.g. Undergraduate Research Program"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange("department", e.target.value)}
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Provide a detailed description of the opportunity..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="officialUrl">Official URL *</Label>
                      <Input
                        id="officialUrl"
                        type="url"
                        value={formData.officialUrl}
                        onChange={(e) => handleInputChange("officialUrl", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                {/* Eligibility */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Eligibility</h3>
                  
                  <div className="space-y-2">
                    <Label>Eligible Years *</Label>
                    <div className="flex flex-wrap gap-3">
                      {ELIGIBLE_YEARS.map((year) => (
                        <div key={year.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={year.value}
                            checked={formData.eligibleYears.includes(year.value)}
                            onCheckedChange={() => toggleEligibleYear(year.value)}
                          />
                          <Label htmlFor={year.value} className="text-sm font-normal">
                            {year.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="internationalEligible"
                        checked={formData.internationalEligible}
                        onCheckedChange={(checked) => handleInputChange("internationalEligible", checked)}
                      />
                      <Label htmlFor="internationalEligible">Open to International Students</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPaid"
                        checked={formData.isPaid}
                        onCheckedChange={(checked) => handleInputChange("isPaid", checked)}
                      />
                      <Label htmlFor="isPaid">Paid Opportunity</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gpaRequirement">GPA Requirement (optional)</Label>
                    <Input
                      id="gpaRequirement"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      value={formData.gpaRequirement || ""}
                      onChange={(e) => handleInputChange("gpaRequirement", e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="e.g. 3.0"
                    />
                  </div>
                </div>

                {/* Time Commitment */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Time Commitment</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedHours">Estimated Hours</Label>
                      <Input
                        id="estimatedHours"
                        value={formData.estimatedHours}
                        onChange={(e) => handleInputChange("estimatedHours", e.target.value)}
                        placeholder="e.g. 10 hours/week"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeCommitment">Time Commitment</Label>
                      <Input
                        id="timeCommitment"
                        value={formData.timeCommitment}
                        onChange={(e) => handleInputChange("timeCommitment", e.target.value)}
                        placeholder="e.g. semester, summer"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange("contactName", e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactRole">Contact Role</Label>
                      <Input
                        id="contactRole"
                        value={formData.contactRole}
                        onChange={(e) => handleInputChange("contactRole", e.target.value)}
                        placeholder="e.g. Professor, Program Director"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                        placeholder="email@dartmouth.edu"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="applicationUrl">Application URL</Label>
                    <Input
                      id="applicationUrl"
                      type="url"
                      value={formData.applicationUrl}
                      onChange={(e) => handleInputChange("applicationUrl", e.target.value)}
                      placeholder="Direct link to application form (if different from official URL)"
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Details</h3>
                  
                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Next Steps */}
                  <div className="space-y-2">
                    <Label>Next Steps</Label>
                    <div className="space-y-2 mb-2">
                      {formData.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                          <span className="text-sm">{index + 1}. {step}</span>
                          <button
                            type="button"
                            onClick={() => removeNextStep(index)}
                            className="ml-auto hover:bg-muted-foreground/20 rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newNextStep}
                        onChange={(e) => setNewNextStep(e.target.value)}
                        placeholder="Add a next step..."
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNextStep())}
                      />
                      <Button type="button" onClick={addNextStep} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Eligible Majors */}
                  <div className="space-y-2">
                    <Label>Eligible Majors (optional)</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.eligibleMajors.map((major) => (
                        <Badge key={major} variant="secondary" className="flex items-center gap-1">
                          {major}
                          <button
                            type="button"
                            onClick={() => removeMajor(major)}
                            className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newMajor}
                        onChange={(e) => setNewMajor(e.target.value)}
                        placeholder="Add an eligible major..."
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMajor())}
                      />
                      <Button type="button" onClick={addMajor} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                {message && (
                  <div className={`p-3 rounded-md ${
                    message.includes('Error') 
                      ? 'bg-red-100 text-red-800 border border-red-200' 
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                    {loading ? "Submitting..." : "Submit Opportunity"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push("/opportunities")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}