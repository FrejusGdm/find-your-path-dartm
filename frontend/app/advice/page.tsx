"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation } from "convex/react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdviceGrid } from "@/components/advice/AdviceGrid"
import { AdviceFilters } from "@/components/advice/AdviceFilters"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { Id } from "@/convex/_generated/dataModel"

export default function AdvicePage() {
  const { user } = useUser()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFeatured, setShowFeatured] = useState(false)

  // Fetch advice posts
  const posts = useQuery(api.advice.getAdvicePosts, {
    category: selectedCategory,
    featured: showFeatured || undefined,
    limit: 50,
  })

  // Fetch user interactions for posts
  const postIds = posts?.map(post => post._id) || []
  const interactions = useQuery(
    api.advice.getUserInteractions,
    postIds.length > 0 ? { postIds } : "skip"
  )

  // Mutations
  const toggleLike = useMutation(api.advice.toggleLike)
  const toggleBookmark = useMutation(api.advice.toggleBookmark)
  const incrementView = useMutation(api.advice.incrementView)

  const handleLike = useCallback(async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to like posts")
      return
    }

    try {
      await toggleLike({ postId: postId as Id<"advicePosts"> })
    } catch (error) {
      toast.error("Failed to like post")
      console.error("Error liking post:", error)
    }
  }, [user, toggleLike])

  const handleBookmark = useCallback(async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to bookmark posts")
      return
    }

    try {
      await toggleBookmark({ postId: postId as Id<"advicePosts"> })
      toast.success("Bookmark updated")
    } catch (error) {
      toast.error("Failed to bookmark post")
      console.error("Error bookmarking post:", error)
    }
  }, [user, toggleBookmark])

  const handleView = useCallback(async (postId: string) => {
    try {
      await incrementView({ postId: postId as Id<"advicePosts"> })
    } catch (error) {
      console.error("Error incrementing view:", error)
    }
  }, [incrementView])

  // Filter posts by tags (client-side filtering for now)
  const filteredPosts = posts?.filter(post => {
    if (selectedTags.length === 0) return true
    return selectedTags.some(tag => post.tags.includes(tag))
  }) || []

  const isLoading = posts === undefined

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-primary" />
                Wall of Advice
              </h1>
              <p className="text-muted-foreground mt-2">
                Real experiences and insights from Dartmouth students
              </p>
            </div>
            
            {user && (
              <Link href="/advice/submit">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Share Your Advice
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <AdviceFilters
              selectedCategory={selectedCategory}
              selectedTags={selectedTags}
              onCategoryChange={setSelectedCategory}
              onTagsChange={setSelectedTags}
              onFeaturedToggle={setShowFeatured}
              showFeatured={showFeatured}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats */}
            {!isLoading && (
              <div className="mb-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {filteredPosts.length === 1 
                    ? "1 advice post" 
                    : `${filteredPosts.length} advice posts`}
                  {selectedCategory && (
                    <span> in {selectedCategory}</span>
                  )}
                  {selectedTags.length > 0 && (
                    <span> with {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}</span>
                  )}
                </div>
                
                {showFeatured && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Sparkles className="w-4 h-4" />
                    Showing featured posts only
                  </div>
                )}
              </div>
            )}

            {/* Advice Grid */}
            <AdviceGrid
              posts={filteredPosts}
              interactions={interactions}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onView={handleView}
              loading={isLoading}
            />

            {/* Empty State for No Results */}
            {!isLoading && filteredPosts.length === 0 && posts && posts.length > 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No posts match your filters</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your category or tag selections to see more advice posts.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory(undefined)
                      setSelectedTags([])
                      setShowFeatured(false)
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Call to Action for Empty State */}
            {!isLoading && posts && posts.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Be the first to share!</h3>
                  <p className="text-muted-foreground mb-6">
                    The Wall of Advice is just getting started. Share your experiences and help build 
                    a community of support for fellow Dartmouth students.
                  </p>
                  {user ? (
                    <Link href="/advice/submit">
                      <Button size="lg" className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Share Your First Advice
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/sign-in">
                      <Button size="lg">
                        Sign In to Share Advice
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


