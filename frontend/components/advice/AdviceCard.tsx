"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Bookmark, Eye, MessageCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthorDisplay } from "./AuthorDisplay"
import { AdviceCardProps, getCategoryColor, getTagColor, formatAdviceDate } from "./types"
import { cn } from "@/lib/utils"

export function AdviceCard({ 
  post, 
  interactions,
  onLike,
  onBookmark,
  onView,
  variant = "default"
}: AdviceCardProps) {
  const [isLiking, setIsLiking] = useState(false)
  const [isBookmarking, setIsBookmarking] = useState(false)

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLiking || !onLike) return
    
    setIsLiking(true)
    try {
      await onLike(post._id)
    } finally {
      setIsLiking(false)
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isBookmarking || !onBookmark) return
    
    setIsBookmarking(true)
    try {
      await onBookmark(post._id)
    } finally {
      setIsBookmarking(false)
    }
  }

  const handleCardClick = () => {
    if (onView) {
      onView(post._id)
    }
  }

  const isLiked = interactions?.liked || false
  const isBookmarked = interactions?.bookmarked || false

  if (variant === "compact") {
    return (
      <Link href={`/advice/${post._id}`} onClick={handleCardClick}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                  {post.title}
                </h3>
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs shrink-0", getCategoryColor(post.category))}
                >
                  {post.category}
                </Badge>
              </div>
              
              <AuthorDisplay post={post} variant="compact" />
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.views}
                </span>
                <span>{formatAdviceDate(post.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  if (variant === "featured") {
    return (
      <Link href={`/advice/${post._id}`} onClick={handleCardClick}>
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border-primary/20">
                  ⭐ Featured
                </Badge>
                <h3 className="font-semibold text-lg line-clamp-2">
                  {post.title}
                </h3>
              </div>
              <Badge 
                variant="secondary" 
                className={cn("shrink-0", getCategoryColor(post.category))}
              >
                {post.category}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm line-clamp-3">
                {post.excerpt || post.content}
              </p>
              
              <AuthorDisplay post={post} variant="card" />
              
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className={cn("text-xs", getTagColor(tag))}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="pt-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.views}
                </span>
                <span className="flex items-center gap-1">
                  <Bookmark className="w-4 h-4" />
                  {post.bookmarks}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatAdviceDate(post.createdAt)}
              </span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    )
  }

  // Default variant
  return (
    <Link href={`/advice/${post._id}`} onClick={handleCardClick}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold line-clamp-2 flex-1">
              {post.title}
            </h3>
            <Badge 
              variant="secondary" 
              className={cn("shrink-0", getCategoryColor(post.category))}
            >
              {post.category}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 flex-1">
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm line-clamp-3">
              {post.excerpt || post.content}
            </p>
            
            <AuthorDisplay post={post} variant="card" />
            
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className={cn("text-xs", getTagColor(tag))}
                  >
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{post.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 text-muted-foreground hover:text-foreground",
                  isLiked && "text-red-500 hover:text-red-600"
                )}
                onClick={handleLike}
                disabled={isLiking}
              >
                <Heart className={cn("w-4 h-4 mr-1", isLiked && "fill-current")} />
                {post.likes}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 text-muted-foreground hover:text-foreground",
                  isBookmarked && "text-blue-500 hover:text-blue-600"
                )}
                onClick={handleBookmark}
                disabled={isBookmarking}
              >
                <Bookmark className={cn("w-4 h-4 mr-1", isBookmarked && "fill-current")} />
                {post.bookmarks}
              </Button>
              
              <span className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
                <Eye className="w-4 h-4" />
                {post.views}
              </span>
            </div>
            
            <span className="text-sm text-muted-foreground">
              {formatAdviceDate(post.createdAt)}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
