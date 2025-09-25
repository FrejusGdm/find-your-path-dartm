"use client"

import { useState } from "react"
import { Heart, HeartHandshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

interface SaveOpportunityButtonProps {
  opportunityId: Id<"opportunities">
  opportunityTitle?: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  showLabel?: boolean
  className?: string
}

export function SaveOpportunityButton({
  opportunityId,
  opportunityTitle,
  variant = "ghost",
  size = "sm",
  showLabel = false,
  className
}: SaveOpportunityButtonProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  // Check if opportunity is saved
  const isSaved = useQuery(
    api.savedOpportunities.isOpportunitySaved,
    user ? { opportunityId } : "skip"
  )

  // Mutations
  const saveOpportunity = useMutation(api.savedOpportunities.saveOpportunity)
  const unsaveOpportunity = useMutation(api.savedOpportunities.unsaveOpportunity)

  const handleToggleSave = async () => {
    if (!user) {
      toast.error("Please log in to save opportunities")
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      if (isSaved) {
        await unsaveOpportunity({ opportunityId })
        toast.success("Removed from saved opportunities")
      } else {
        await saveOpportunity({
          opportunityId,
          savedReason: "Saved from opportunity card"
        })
        toast.success(`Saved ${opportunityTitle || "opportunity"}!`)
      }
    } catch (error) {
      console.error("Error toggling save:", error)
      toast.error(isSaved ? "Failed to remove from saved" : "Failed to save opportunity")
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render if user is not logged in
  if (!user) {
    return null
  }

  const HeartIcon = isSaved ? HeartHandshake : Heart

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleSave}
      disabled={isLoading}
      className={className}
      aria-label={isSaved ? "Remove from saved" : "Save opportunity"}
    >
      <HeartIcon
        className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'} ${isLoading ? 'animate-pulse' : ''}`}
      />
      {showLabel && (
        <span className="ml-2">
          {isSaved ? "Saved" : "Save"}
        </span>
      )}
    </Button>
  )
}