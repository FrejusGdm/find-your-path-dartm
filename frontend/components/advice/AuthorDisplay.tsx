"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AuthorDisplayProps } from "./types"
import { cn } from "@/lib/utils"

export function AuthorDisplay({ 
  post, 
  variant = "card", 
  showAvatar = true 
}: AuthorDisplayProps) {
  const getAvatarFallback = () => {
    if (post.isAnonymous) {
      return "?"
    }
    return post.authorFirstName?.[0]?.toUpperCase() || "S"
  }

  const getDisplayName = () => {
    return post.isAnonymous ? "Anonymous Student" : post.authorFirstName
  }

  const getSubtitle = () => {
    const parts = []
    if (post.authorYear) parts.push(post.authorYear)
    if (post.authorMajor && !post.isAnonymous) parts.push(post.authorMajor)
    return parts.join(" • ")
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {showAvatar && (
          <Avatar className="w-5 h-5">
            <AvatarFallback className="text-xs bg-muted">
              {getAvatarFallback()}
            </AvatarFallback>
          </Avatar>
        )}
        <span className="font-medium">{getDisplayName()}</span>
        {getSubtitle() && (
          <>
            <span>•</span>
            <span>{getSubtitle()}</span>
          </>
        )}
      </div>
    )
  }

  if (variant === "detail") {
    return (
      <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
        {showAvatar && (
          <Avatar className="w-12 h-12">
            <AvatarFallback className={cn(
              "text-lg font-semibold",
              post.isAnonymous 
                ? "bg-gray-100 text-gray-600" 
                : "bg-primary/10 text-primary"
            )}>
              {getAvatarFallback()}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1 space-y-2">
          <div>
            <h4 className="font-semibold text-lg">{getDisplayName()}</h4>
            {getSubtitle() && (
              <p className="text-muted-foreground">{getSubtitle()}</p>
            )}
          </div>
          {post.isAnonymous && (
            <Badge variant="secondary" className="text-xs">
              Anonymous Post
            </Badge>
          )}
        </div>
      </div>
    )
  }

  // Default "card" variant
  return (
    <div className="flex items-center gap-3">
      {showAvatar && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className={cn(
            "text-sm font-medium",
            post.isAnonymous 
              ? "bg-gray-100 text-gray-600" 
              : "bg-primary/10 text-primary"
          )}>
            {getAvatarFallback()}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{getDisplayName()}</p>
        {getSubtitle() && (
          <p className="text-xs text-muted-foreground truncate">
            {getSubtitle()}
          </p>
        )}
      </div>
    </div>
  )
}
