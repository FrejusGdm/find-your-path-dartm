"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, DollarSign, ChevronUp, ChevronDown } from "lucide-react"
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
  eligibleYears?: string[]
  createdAt: number
}

interface OpportunitiesTableProps {
  opportunities: Opportunity[]
}

type SortField = 'title' | 'department' | 'category' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export function OpportunitiesTable({ opportunities }: OpportunitiesTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedOpportunities = [...opportunities].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortField) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'department':
        aValue = a.department.toLowerCase()
        bValue = b.department.toLowerCase()
        break
      case 'category':
        aValue = a.category.toLowerCase()
        bValue = b.category.toLowerCase()
        break
      case 'createdAt':
        aValue = a.createdAt
        bValue = b.createdAt
        break
      default:
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const SortButton = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-primary transition-colors group"
    >
      {children}
      {sortField === field ? (
        sortDirection === 'asc' ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )
      ) : (
        <div className="w-4 h-4 opacity-0 group-hover:opacity-50">
          <ChevronUp className="w-4 h-4" />
        </div>
      )}
    </button>
  )

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No opportunities found.</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left p-4 font-medium text-foreground">
                <SortButton field="title">Title</SortButton>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <SortButton field="department">Department</SortButton>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <SortButton field="category">Category</SortButton>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                Details
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <SortButton field="createdAt">Added</SortButton>
              </th>
              <th className="text-right p-4 font-medium text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedOpportunities.map((opportunity, index) => (
              <tr 
                key={opportunity._id}
                className={`border-b border-border hover:bg-muted/20 transition-colors ${
                  index === sortedOpportunities.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <td className="p-4">
                  <div className="space-y-1">
                    {opportunity.externalLink ? (
                      <Link
                        href={opportunity.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2 cursor-pointer">
                          {opportunity.title}
                        </h3>
                      </Link>
                    ) : (
                      <h3 className="font-medium text-foreground line-clamp-2">
                        {opportunity.title}
                      </h3>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {opportunity.description}
                    </p>
                  </div>
                </td>
                
                <td className="p-4">
                  <Badge variant="outline" className="text-xs">
                    {opportunity.department}
                  </Badge>
                </td>
                
                <td className="p-4">
                  <Badge className={getCategoryColor(opportunity.category)}>
                    {opportunity.category}
                  </Badge>
                </td>
                
                <td className="p-4">
                  <div className="space-y-1">
                    {opportunity.eligibleYears && opportunity.eligibleYears.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {opportunity.eligibleYears.slice(0, 2).join(', ')}
                        {opportunity.eligibleYears.length > 2 && ` +${opportunity.eligibleYears.length - 2}`}
                      </div>
                    )}
                    {opportunity.tags && opportunity.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {opportunity.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {opportunity.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{opportunity.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="p-4">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(opportunity.createdAt)}
                  </span>
                </td>
                
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    {opportunity.contactEmail && (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`mailto:${opportunity.contactEmail}`}>
                          Contact
                        </Link>
                      </Button>
                    )}
                    
                    {opportunity.externalLink && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={opportunity.externalLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Link>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}