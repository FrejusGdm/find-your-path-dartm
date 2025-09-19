"use client"

import { useEffect, useState } from "react"
import Masonry from "react-masonry-css"
import { AdviceCard } from "./AdviceCard"
import { AdviceGridProps } from "./types"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Masonry breakpoints for responsive design
const breakpointColumnsObj = {
  default: 3,
  1100: 2,
  700: 1
}

// Loading skeleton component
function AdviceCardSkeleton() {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          
          <div className="flex gap-1">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdviceGrid({ 
  posts, 
  interactions,
  onLike,
  onBookmark,
  onView,
  loading = false
}: AdviceGridProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render masonry on server to avoid hydration issues
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <AdviceCardSkeleton key={i} />
          ))
        ) : (
          posts.map((post) => (
            <AdviceCard
              key={post._id}
              post={post}
              interactions={interactions?.[post._id]}
              onLike={onLike}
              onBookmark={onBookmark}
              onView={onView}
            />
          ))
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto -ml-6"
        columnClassName="pl-6 bg-clip-padding"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <AdviceCardSkeleton key={i} />
        ))}
      </Masonry>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No advice posts found</h3>
          <p className="text-muted-foreground">
            Be the first to share your experience and help fellow students!
          </p>
        </div>
      </div>
    )
  }

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex w-auto -ml-6"
      columnClassName="pl-6 bg-clip-padding"
    >
      {posts.map((post) => {
        // Determine card variant based on post properties
        let variant: "default" | "compact" | "featured" = "default"
        
        if (post.featured) {
          variant = "featured"
        }
        
        return (
          <div key={post._id} className="mb-6">
            <AdviceCard
              post={post}
              interactions={interactions?.[post._id]}
              onLike={onLike}
              onBookmark={onBookmark}
              onView={onView}
              variant={variant}
            />
          </div>
        )
      })}
    </Masonry>
  )
}
