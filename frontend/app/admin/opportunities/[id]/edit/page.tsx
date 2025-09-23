"use client"

import React, { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"

interface EditOpportunityPageProps {
  params: Promise<{ id: string }>
}

export default function EditOpportunityPage({ params }: EditOpportunityPageProps) {
  const router = useRouter()
  const resolvedParams = React.use(params)
  const opportunityId = resolvedParams.id as Id<"opportunities">

  const opportunity = useQuery(api.opportunities.getById, { id: opportunityId })
  const updateOpportunity = useMutation(api.opportunities.adminUpdate)
  const updateUrlStatus = useMutation(api.opportunities.adminUpdateUrlStatus)

  const [formData, setFormData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [newStep, setNewStep] = useState("")

  // Initialize form data when opportunity loads
  React.useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || "",
        description: opportunity.description || "",
        department: opportunity.department || "",
        category: opportunity.category || "",
        eligibleYears: opportunity.eligibleYears || [],
        eligibleMajors: opportunity.eligibleMajors || [],
        internationalEligible: opportunity.internationalEligible || false,
        gpaRequirement: opportunity.gpaRequirement || "",
        isPaid: opportunity.isPaid || false,
        estimatedHours: opportunity.estimatedHours || "",
        timeCommitment: opportunity.timeCommitment || "",
        officialUrl: opportunity.officialUrl || "",
        applicationUrl: opportunity.applicationUrl || "",
        contactEmail: opportunity.contactEmail || "",
        contactName: opportunity.contactName || "",
        contactRole: opportunity.contactRole || "",
        nextSteps: opportunity.nextSteps || [],
        tags: opportunity.tags || [],
        isActive: opportunity.isActive ?? true,
      })
    }
  }, [opportunity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateOpportunity({
        id: opportunityId,
        ...formData,
        gpaRequirement: formData.gpaRequirement ? parseFloat(formData.gpaRequirement) : undefined,
      })

      router.push("/admin/opportunities")
    } catch (error) {
      console.error("Failed to update opportunity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleYearToggle = (year: string) => {
    const years = formData.eligibleYears || []
    if (years.includes(year)) {
      setFormData({
        ...formData,
        eligibleYears: years.filter((y: string) => y !== year)
      })
    } else {
      setFormData({
        ...formData,
        eligibleYears: [...years, year]
      })
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag: string) => tag !== tagToRemove) || []
    })
  }

  const addNextStep = () => {
    if (newStep.trim()) {
      setFormData({
        ...formData,
        nextSteps: [...(formData.nextSteps || []), newStep.trim()]
      })
      setNewStep("")
    }
  }

  const removeNextStep = (index: number) => {
    setFormData({
      ...formData,
      nextSteps: formData.nextSteps?.filter((_: any, i: number) => i !== index) || []
    })
  }

  const handleCheckUrl = async () => {
    if (formData.officialUrl) {
      try {
        const response = await fetch('/api/admin/check-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: formData.officialUrl }),
        })

        const result = await response.json()

        if (response.ok) {
          // Update the status in Convex
          await updateUrlStatus({
            id: opportunityId,
            status: result.status,
            statusCode: result.statusCode,
            ...(result.error && { error: result.error }),
          })
        } else {
          console.error("URL check failed:", result.error)
        }
      } catch (error) {
        console.error("URL check failed:", error)
      }
    }
  }

  const getUrlStatusBadge = (status?: string) => {
    switch (status) {
      case "working":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Working</Badge>
      case "broken":
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Broken</Badge>
      case "redirect":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><ExternalLink className="w-3 h-3 mr-1" />Redirect</Badge>
      default:
        return <Badge variant="outline" className="text-gray-600 border-gray-600"><Clock className="w-3 h-3 mr-1" />Unchecked</Badge>
    }
  }

  if (opportunity === undefined) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (opportunity === null) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Opportunity Not Found</h1>
        <Button asChild>
          <Link href="/admin/opportunities">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Opportunities
          </Link>
        </Button>
      </div>
    )
  }

  const years = ["first-year", "sophomore", "junior", "senior", "graduate", "other"]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/opportunities">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Opportunity</h1>
            <p className="text-muted-foreground">
              {opportunity.title}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {opportunity.urlStatus && getUrlStatusBadge(opportunity.urlStatus)}
          <Badge variant={opportunity.isActive ? "default" : "secondary"}>
            {opportunity.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="grant">Grant</SelectItem>
                    <SelectItem value="program">Program</SelectItem>
                    <SelectItem value="fellowship">Fellowship</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeCommitment">Time Commitment</Label>
                <Input
                  id="timeCommitment"
                  value={formData.timeCommitment || ""}
                  onChange={(e) => setFormData({ ...formData, timeCommitment: e.target.value })}
                  placeholder="e.g., semester, summer, year-long"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  value={formData.estimatedHours || ""}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  placeholder="e.g., 10-15 hours/week"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPaid"
                  checked={formData.isPaid || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })}
                />
                <Label htmlFor="isPaid">Paid opportunity</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="internationalEligible"
                  checked={formData.internationalEligible || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, internationalEligible: checked })}
                />
                <Label htmlFor="internationalEligible">International students eligible</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card>
          <CardHeader>
            <CardTitle>Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Eligible Years</Label>
              <div className="flex flex-wrap gap-2">
                {years.map((year) => (
                  <div key={year} className="flex items-center space-x-2">
                    <Checkbox
                      id={year}
                      checked={formData.eligibleYears?.includes(year) || false}
                      onCheckedChange={() => handleYearToggle(year)}
                    />
                    <Label htmlFor={year} className="text-sm capitalize">
                      {year.replace("-", " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpaRequirement">GPA Requirement</Label>
              <Input
                id="gpaRequirement"
                type="number"
                step="0.1"
                min="0"
                max="4.0"
                value={formData.gpaRequirement || ""}
                onChange={(e) => setFormData({ ...formData, gpaRequirement: e.target.value })}
                placeholder="e.g., 3.0"
              />
            </div>
          </CardContent>
        </Card>

        {/* URLs and Contact */}
        <Card>
          <CardHeader>
            <CardTitle>URLs and Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="officialUrl">Official URL *</Label>
              <div className="flex space-x-2">
                <Input
                  id="officialUrl"
                  type="url"
                  value={formData.officialUrl || ""}
                  onChange={(e) => setFormData({ ...formData, officialUrl: e.target.value })}
                  required
                />
                <Button type="button" variant="outline" onClick={handleCheckUrl}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationUrl">Application URL</Label>
              <Input
                id="applicationUrl"
                type="url"
                value={formData.applicationUrl || ""}
                onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={formData.contactName || ""}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactRole">Contact Role</Label>
                <Input
                  id="contactRole"
                  value={formData.contactRole || ""}
                  onChange={(e) => setFormData({ ...formData, contactRole: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail || ""}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {formData.nextSteps?.map((step: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm flex-1">{index + 1}. {step}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNextStep(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Input
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                placeholder="Add a next step..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addNextStep()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addNextStep}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/opportunities">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}