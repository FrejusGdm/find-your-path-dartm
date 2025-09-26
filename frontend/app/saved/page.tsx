"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, FileText, Heart, Calendar, MapPin, DollarSign, Users, Globe, Edit3, Save, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Id } from "@/convex/_generated/dataModel"

type SavedStatus = "interested" | "applied" | "contacted" | "archived"

interface SavedOpportunity {
  _id: Id<"savedOpportunities">
  opportunityId: Id<"opportunities">
  userId: Id<"users">
  status: SavedStatus
  notes?: string
  savedFromConversation?: Id<"conversations">
  savedReason?: string
  createdAt: number
  updatedAt: number
  opportunity: {
    _id: Id<"opportunities">
    title: string
    description: string
    department: string
    category: string
    eligibleYears: string[]
    internationalEligible: boolean
    isPaid: boolean
    estimatedHours?: string
    timeCommitment?: string
    officialUrl: string
    contactEmail?: string
    contactName?: string
    nextSteps: string[]
    tags: string[]
    saveCount: number
  }
}

export default function SavedOpportunitiesPage() {
  const { user, isLoaded } = useUser()
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [editingNotesValue, setEditingNotesValue] = useState("")

  // Queries
  const savedOpportunities = useQuery(
    api.savedOpportunities.getUserSavedOpportunities,
    user ? { limit: 50 } : "skip"
  ) as SavedOpportunity[]

  // Mutations
  const updateNotes = useMutation(api.savedOpportunities.updateSavedOpportunityNotes)
  const unsaveOpportunity = useMutation(api.savedOpportunities.unsaveOpportunity)

  const handleNotesEdit = (savedOpportunity: SavedOpportunity) => {
    setEditingNotes(savedOpportunity._id)
    setEditingNotesValue(savedOpportunity.notes || "")
  }

  const handleNotesSave = async (opportunityId: Id<"opportunities">) => {
    try {
      await updateNotes({ opportunityId, notes: editingNotesValue })
      setEditingNotes(null)
      toast.success("Notes saved")
    } catch (error) {
      toast.error("Failed to save notes")
      console.error(error)
    }
  }

  const handleNotesCancel = () => {
    setEditingNotes(null)
    setEditingNotesValue("")
  }

  const handleUnsave = async (opportunityId: Id<"opportunities">, title: string) => {
    try {
      await unsaveOpportunity({ opportunityId })
      toast.success(`Removed ${title} from saved opportunities`)
    } catch (error) {
      toast.error("Failed to remove from saved opportunities")
      console.error(error)
    }
  }


  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'research': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'internship': return 'bg-green-100 text-green-800 border-green-200'
      case 'grant': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'program': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'fellowship': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading saved opportunities...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center space-y-4">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Saved Opportunities</h1>
          <p className="text-muted-foreground">
            Please sign in to view your saved opportunities.
          </p>
          <Button onClick={() => window.location.href = '/sign-in'}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Saved Opportunities
        </h1>
        <p className="text-muted-foreground">
          {savedOpportunities ? `You have ${savedOpportunities.length} saved opportunities.` : "Loading your saved opportunities..."}
        </p>
      </div>


      {/* Opportunities List */}
      {!savedOpportunities ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading opportunities...</p>
        </div>
      ) : savedOpportunities.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No saved opportunities</h3>
          <p className="text-muted-foreground mb-4">
            You haven't saved any opportunities yet. Start exploring to find opportunities that interest you!
          </p>
          <Button asChild>
            <a href="/opportunities">Browse Opportunities</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {savedOpportunities.map((saved) => (
            <Card key={saved._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn("text-xs border", getCategoryColor(saved.opportunity.category))}>
                        {saved.opportunity.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {saved.opportunity.department}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {saved.opportunity.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {saved.opportunity.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnsave(saved.opportunityId, saved.opportunity.title)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {saved.opportunity.eligibleYears.length > 0 ? saved.opportunity.eligibleYears.join(", ") : "All years"}
                  </div>

                  {saved.opportunity.estimatedHours && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {saved.opportunity.estimatedHours}
                    </div>
                  )}

                  {saved.opportunity.isPaid && (
                    <div className="flex items-center gap-1 text-green-600">
                      <DollarSign className="w-3 h-3" />
                      Paid
                    </div>
                  )}

                  {saved.opportunity.internationalEligible && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Globe className="w-3 h-3" />
                      International OK
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Saved {new Date(saved.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-4">
                  {editingNotes === saved._id ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Notes:</label>
                      <Textarea
                        value={editingNotesValue}
                        onChange={(e) => setEditingNotesValue(e.target.value)}
                        placeholder="Add notes about this opportunity..."
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleNotesSave(saved.opportunityId)}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleNotesCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Notes</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleNotesEdit(saved)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        {saved.notes || "No notes yet. Click the edit icon to add notes."}
                      </p>
                    </div>
                  )}
                </div>

                <Separator className="mb-4" />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => window.open(saved.opportunity.officialUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Visit Page
                    </Button>

                    {saved.opportunity.contactEmail && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`mailto:${saved.opportunity.contactEmail}`, '_blank')}
                      >
                        Contact
                      </Button>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last updated {new Date(saved.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}