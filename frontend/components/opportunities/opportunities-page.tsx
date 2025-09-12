"use client"

import { useState, useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { SearchAndFilters } from "./search-and-filters"
import { OpportunitiesTable } from "./opportunities-table"
import { OpportunityCards } from "./opportunity-cards"
import { Button } from "@/components/ui/button"
import { LayoutGrid, List, Plus } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

type ViewMode = "table" | "cards"

export function OpportunitiesPage() {
  const { user } = useUser()
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  
  // Fetch opportunities from Convex
  const opportunities = useQuery(api.opportunities.getAll) || []
  
  // Filter opportunities based on search and filters
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesSearch = !searchTerm || 
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.department.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === "all" || opp.category === selectedCategory
      const matchesDepartment = selectedDepartment === "all" || opp.department === selectedDepartment
      return matchesSearch && matchesCategory && matchesDepartment
    })
  }, [opportunities, searchTerm, selectedCategory, selectedDepartment])

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="py-8 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">
                Opportunities
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Discover research, internships, grants, and programs at Dartmouth
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="h-8 px-3"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Submit Button - Login Required */}
              {user ? (
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/opportunities/submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Opportunity
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/sign-in">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Opportunity
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="py-6">
          <SearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            opportunities={opportunities}
          />
        </div>

        {/* Results Count */}
        <div className="pb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredOpportunities.length} of {opportunities.length} opportunities
          </p>
        </div>

        {/* Opportunities Display */}
        <div className="pb-12">
          {viewMode === "table" ? (
            <OpportunitiesTable opportunities={filteredOpportunities} />
          ) : (
            <OpportunityCards opportunities={filteredOpportunities} />
          )}
        </div>

        {/* Empty State */}
        {filteredOpportunities.length === 0 && opportunities.length > 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                No opportunities found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters to find more opportunities.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setSelectedDepartment("all")
                }}
                variant="outline"
              >
                Clear all filters
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {opportunities.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Loading opportunities...
              </h3>
              <p className="text-muted-foreground">
                Please wait while we fetch the latest opportunities.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}