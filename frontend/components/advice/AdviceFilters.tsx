"use client"

import { useState } from "react"
import { X, Filter, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  AdviceFiltersProps,
  ADVICE_CATEGORIES,
  getCategoryColor,
  getTagColor
} from "./types"
import { cn } from "@/lib/utils"

export function AdviceFilters({
  selectedCategory,
  selectedTags = [],
  onCategoryChange,
  onTagsChange,
  onFeaturedToggle,
  showFeatured = false
}: AdviceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    onTagsChange(newTags)
  }

  const clearAllFilters = () => {
    onCategoryChange(undefined)
    onTagsChange([])
    if (onFeaturedToggle) {
      onFeaturedToggle(false)
    }
  }

  const hasActiveFilters = selectedCategory || selectedTags.length > 0 || showFeatured

  // Group tags by type for better organization
  const tagGroups = {
    "Academic Status": ["first-year", "sophomore", "junior", "senior", "graduate"],
    "Demographics": ["international", "first-gen", "transfer"],
    "Academic Areas": ["STEM", "humanities", "social-sciences", "engineering", "arts"],
    "Topics": ["networking", "applications", "interviews", "time-management", "imposter-syndrome", "work-life-balance", "mental-health", "financial", "housing", "social", "clubs", "leadership"]
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Featured Toggle */}
      {onFeaturedToggle && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Special</h4>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={showFeatured}
              onCheckedChange={(checked) => onFeaturedToggle(!!checked)}
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
            >
              <Star className="w-4 h-4 text-yellow-500" />
              Featured Posts Only
            </label>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Category</h4>
        <Select value={selectedCategory || "all"} onValueChange={(value) => onCategoryChange(value === "all" ? undefined : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {ADVICE_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", getCategoryColor(category.value).split(' ')[0])} />
                  {category.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tag Filters */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Tags</h4>
        {Object.entries(tagGroups).map(([groupName, tags]) => (
          <div key={groupName} className="space-y-2">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {groupName}
            </h5>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors text-xs",
                    selectedTags.includes(tag) 
                      ? "bg-primary text-primary-foreground" 
                      : getTagColor(tag)
                  )}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearAllFilters}
          className="w-full"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Mobile Filter Button */}
      <div className="flex items-center justify-between lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {(selectedCategory ? 1 : 0) + selectedTags.length + (showFeatured ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filter Advice Posts</SheetTitle>
              <SheetDescription>
                Find advice posts that match your interests and situation.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <Card className="hidden lg:block">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>
          <FilterContent />
        </CardContent>
      </Card>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {showFeatured && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              Featured
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onFeaturedToggle && onFeaturedToggle(false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          
          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {ADVICE_CATEGORIES.find(c => c.value === selectedCategory)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onCategoryChange(undefined)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => handleTagToggle(tag)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
