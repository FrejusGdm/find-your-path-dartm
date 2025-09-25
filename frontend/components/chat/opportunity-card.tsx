"use client"

import { useState } from 'react'
import { ExternalLink, Bookmark, BookmarkCheck, Clock, MapPin, DollarSign, Users, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { SaveOpportunityButton } from '@/components/save-opportunity-button'

interface Opportunity {
  _id: string
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
  contactRole?: string
  nextSteps: string[]
  tags: string[]
  viewCount: number
  saveCount: number
}

interface OpportunityCardProps {
  opportunity: Opportunity
  variant?: 'default' | 'compact' | 'featured'
  className?: string
}

export function OpportunityCard({
  opportunity,
  variant = 'default',
  className
}: OpportunityCardProps) {
  const { user } = useUser()

  const trackLinkClick = useMutation(api.analytics.trackLinkClick)
  const incrementClick = useMutation(api.opportunities.incrementClick)

  const handleLinkClick = async (url: string) => {
    // Track analytics
    if (user) {
      await trackLinkClick({ 
        userId: user.id as any,
        opportunityId: opportunity._id as any
      })
      await incrementClick({ opportunityId: opportunity._id as any })
    }
    
    // Open link
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'research': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'internship': return 'bg-green-100 text-green-800 border-green-200'
      case 'grant': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'program': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatYears = (years: string[]) => {
    if (years.length === 0) return 'All years'
    if (years.length === 1) return years[0].replace('-', ' ')
    return `${years[0].replace('-', ' ')}+`
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        "bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all duration-200 group",
        className
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn("text-xs font-medium border", getCategoryColor(opportunity.category))}>
                {opportunity.category}
              </Badge>
              {opportunity.isPaid && (
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  <DollarSign className="w-3 h-3 mr-1" />
                  Paid
                </Badge>
              )}
            </div>
            
            <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {opportunity.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{opportunity.department}</p>
          </div>
          
          <SaveOpportunityButton
            opportunityId={opportunity._id as any}
            opportunityTitle={opportunity.title}
            size="icon"
            className="flex-shrink-0 h-8 w-8 p-0"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-200 group",
      variant === 'featured' && "ring-2 ring-primary/10 border-primary/30",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn("text-xs font-medium border", getCategoryColor(opportunity.category))}>
              {opportunity.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {opportunity.department}
            </Badge>
          </div>
          
          <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
            {opportunity.title}
          </h3>
        </div>
        
        <SaveOpportunityButton
          opportunityId={opportunity._id as any}
          opportunityTitle={opportunity.title}
          size="sm"
          className="flex-shrink-0"
        />
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {opportunity.description}
      </p>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {formatYears(opportunity.eligibleYears)}
        </div>
        
        {opportunity.estimatedHours && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {opportunity.estimatedHours}
          </div>
        )}
        
        {opportunity.isPaid && (
          <div className="flex items-center gap-1 text-green-600">
            <DollarSign className="w-3 h-3" />
            Paid
          </div>
        )}
        
        {opportunity.internationalEligible && (
          <div className="flex items-center gap-1 text-blue-600">
            <Globe className="w-3 h-3" />
            International OK
          </div>
        )}
      </div>

      {/* Next Steps */}
      {opportunity.nextSteps.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Next steps:</h4>
          <ul className="space-y-1">
            {opportunity.nextSteps.slice(0, 3).map((step, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {opportunity.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {opportunity.tags.slice(0, 4).map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-xs px-2 py-0.5 bg-muted hover:bg-muted/80"
            >
              {tag}
            </Badge>
          ))}
          {opportunity.tags.length > 4 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-muted">
              +{opportunity.tags.length - 4} more
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Button
          onClick={() => handleLinkClick(opportunity.officialUrl)}
          className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Visit Page
        </Button>
        
        {opportunity.contactEmail && (
          <Button
            variant="outline"
            onClick={() => handleLinkClick(`mailto:${opportunity.contactEmail}`)}
            className="flex-1 sm:flex-initial"
          >
            Contact
            {opportunity.contactName && (
              <span className="ml-1 text-muted-foreground">
                {opportunity.contactName.split(' ')[0]}
              </span>
            )}
          </Button>
        )}
        
        <div className="ml-auto text-xs text-muted-foreground">
          {opportunity.saveCount > 0 && `${opportunity.saveCount} saved`}
        </div>
      </div>
    </div>
  )
}