"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, DollarSign, Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"

interface Opportunity {
  _id: string
  title: string
  description: string
  department: string
  category: string
  isPaid: boolean
  tags: string[]
  contactEmail?: string
  externalLink?: string
  officialUrl: string
  eligibleYears?: string[]
  createdAt: number
}

interface OpportunityCardsProps {
  opportunities: Opportunity[]
}

export function OpportunityCards({ opportunities }: OpportunityCardsProps) {
  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No opportunities found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {opportunities.map((opportunity) => (
        <OpportunityCard key={opportunity._id} opportunity={opportunity} />
      ))}
    </div>
  )
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      research: 'bg-blue-100 text-blue-800 border-blue-200',
      internship: 'bg-green-100 text-green-800 border-green-200',
      grant: 'bg-purple-100 text-purple-800 border-purple-200',
      program: 'bg-orange-100 text-orange-800 border-orange-200',
      fellowship: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      competition: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow duration-200 group">
      {/* Header */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {opportunity.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getCategoryColor(opportunity.category)}>
            {opportunity.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {opportunity.department}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
        {opportunity.description}
      </p>

      {/* Tags */}
      {opportunity.tags && opportunity.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {opportunity.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {opportunity.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{opportunity.tags.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* Eligible Years */}
      {opportunity.eligibleYears && opportunity.eligibleYears.length > 0 && (
        <div className="flex items-center gap-1 mb-4">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {opportunity.eligibleYears.join(', ')}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {formatDate(opportunity.createdAt)}
        </div>
        
        <div className="flex items-center gap-2">
          {(opportunity.externalLink || opportunity.officialUrl) ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={opportunity.externalLink || opportunity.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Learn More
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              No Link Available
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}