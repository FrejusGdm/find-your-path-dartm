"use client"

import { useEffect, useState, useCallback } from "react"
import { useQuery, useMutation } from "convex/react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Heart, Bookmark, Eye, Share2, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AuthorDisplay } from "@/components/advice/AuthorDisplay"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { Id } from "@/convex/_generated/dataModel"
import { getCategoryColor, getTagColor, formatAdviceDate } from "@/components/advice/types"
import { cn } from "@/lib/utils"

interface AdvicePostPageProps {
  params: Promise<{
    id: string
  }>
}

export default function AdvicePostPage({ params }: AdvicePostPageProps) {
  const { user } = useUser()
  const [hasViewed, setHasViewed] = useState(false)
  const [postId, setPostId] = useState<string | null>(null)

  // Extract params on mount
  useEffect(() => {
    params.then((resolvedParams) => {
      setPostId(resolvedParams.id)
    })
  }, [params])

  // Fetch the advice post
  const post = useQuery(
    api.advice.getAdvicePost,
    postId ? { id: postId as Id<"advicePosts"> } : "skip"
  )

  // Fetch user interactions
  const interactions = useQuery(
    api.advice.getUserInteractions,
    post ? { postIds: [post._id] } : "skip"
  )

  // Mutations
  const toggleLike = useMutation(api.advice.toggleLike)
  const toggleBookmark = useMutation(api.advice.toggleBookmark)
  const incrementView = useMutation(api.advice.incrementView)

  // Increment view count on first load
  useEffect(() => {
    if (post && !hasViewed) {
      incrementView({ postId: post._id })
      setHasViewed(true)
    }
  }, [post, hasViewed, incrementView])

  const handleLike = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to like posts")
      return
    }

    if (!post) return

    try {
      await toggleLike({ postId: post._id })
    } catch (error) {
      toast.error("Failed to like post")
      console.error("Error liking post:", error)
    }
  }, [user, post, toggleLike])

  const handleBookmark = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to bookmark posts")
      return
    }

    if (!post) return

    try {
      await toggleBookmark({ postId: post._id })
      toast.success("Bookmark updated")
    } catch (error) {
      toast.error("Failed to bookmark post")
      console.error("Error bookmarking post:", error)
    }
  }, [user, post, toggleBookmark])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: `Check out this advice from a Dartmouth student: ${post?.title}`,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  // Loading state
  if (post === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-12 bg-muted rounded w-3/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Post not found
  if (post === null) {
    notFound()
  }

  const userInteraction = interactions?.[post._id]
  const isLiked = userInteraction?.liked || false
  const isBookmarked = userInteraction?.bookmarked || false

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/advice">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Wall of Advice
              </Button>
            </Link>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground"
              >
                <Flag className="w-4 h-4" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="space-y-8">
          {/* Post Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight flex-1">
                {post.title}
              </h1>
              <Badge 
                variant="secondary" 
                className={cn("shrink-0", getCategoryColor(post.category))}
              >
                {post.category}
              </Badge>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className={cn("text-sm", getTagColor(tag))}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Meta info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.views} views
                </span>
                <span>{formatAdviceDate(post.createdAt)}</span>
              </div>
              
              {post.featured && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  ⭐ Featured
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Author Info */}
          <AuthorDisplay post={post} variant="detail" />

          {/* Post Content */}
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-gray max-w-none">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {post.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLike}
                    className={cn(
                      "flex items-center gap-2",
                      isLiked && "bg-red-500 hover:bg-red-600 text-white"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                    {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
                  </Button>
                  
                  <Button
                    variant={isBookmarked ? "default" : "outline"}
                    size="sm"
                    onClick={handleBookmark}
                    className={cn(
                      "flex items-center gap-2",
                      isBookmarked && "bg-blue-500 hover:bg-blue-600 text-white"
                    )}
                  >
                    <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                    {post.bookmarks} {post.bookmarks === 1 ? 'Bookmark' : 'Bookmarks'}
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  Found this helpful? Give it a like!
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Have advice to share?</h3>
              <p className="text-muted-foreground mb-4">
                Help other Dartmouth students by sharing your own experiences and insights.
              </p>
              <Link href="/advice/submit">
                <Button>Share Your Advice</Button>
              </Link>
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  )
}


