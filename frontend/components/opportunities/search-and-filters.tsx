"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebounce } from "@/hooks/use-debounce"
import { useEffect } from "react"

interface Opportunity {
  _id: string
  title: string
  description: string
  department: string
  category: string
  isPaid: boolean
  tags: string[]
}

interface SearchAndFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (value: string) => void
  selectedDepartment: string
  onDepartmentChange: (value: string) => void
  opportunities: Opportunity[]
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "research", label: "Research" },
  { value: "internship", label: "Internships" },
  { value: "grant", label: "Grants" },
  { value: "program", label: "Programs" },
  { value: "fellowship", label: "Fellowships" },
  { value: "competition", label: "Competitions" },
]

export function SearchAndFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDepartment,
  onDepartmentChange,
  opportunities
}: SearchAndFiltersProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const [showFilters, setShowFilters] = useState(false)
  
  // Debounce search input to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300)
  
  // Update parent when debounced value changes
  useEffect(() => {
    onSearchChange(debouncedSearchTerm)
  }, [debouncedSearchTerm, onSearchChange])

  // Extract unique departments from opportunities
  const departments = Array.from(new Set(opportunities.map(opp => opp.department))).sort()

  const activeFiltersCount = [
    selectedCategory !== "all",
    selectedDepartment !== "all"
  ].filter(Boolean).length

  const clearAllFilters = () => {
    onCategoryChange("all")
    onDepartmentChange("all")
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search opportunities by title, description, or department..."
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          className="pl-10 pr-4 h-12 text-base bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
      </div>

      {/* Quick Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 h-9"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* Active Filter Tags */}
        {selectedCategory !== "all" && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {CATEGORIES.find(cat => cat.value === selectedCategory)?.label}
            <button
              onClick={() => onCategoryChange("all")}
              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {selectedDepartment !== "all" && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {selectedDepartment}
            <button
              onClick={() => onDepartmentChange("all")}
              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {/* Clear All */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground h-9"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
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

            {/* Department Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Department</label>
              <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}