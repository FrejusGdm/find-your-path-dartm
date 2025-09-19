import { Doc } from "@/convex/_generated/dataModel"

// Type for advice post from database
export type AdvicePost = Doc<"advicePosts">

// Type for advice post interactions
export type AdviceInteraction = Doc<"adviceInteractions">

// Type for user interactions with posts
export interface UserInteractions {
  [postId: string]: {
    liked: boolean
    bookmarked: boolean
  }
}

// Type for advice submission form
export interface AdviceSubmissionData {
  title: string
  content: string
  category: string
  tags: string[]
  isAnonymous: boolean
}

// Available advice categories
export const ADVICE_CATEGORIES = [
  { value: "research", label: "Research", description: "Research positions, lab work, academic projects" },
  { value: "internships", label: "Internships", description: "Summer internships, co-ops, work experience" },
  { value: "study-abroad", label: "Study Abroad", description: "International programs, exchanges, travel" },
  { value: "academics", label: "Academics", description: "Course selection, majors, academic planning" },
  { value: "career", label: "Career", description: "Job search, networking, career planning" },
  { value: "life", label: "Life & Wellness", description: "Personal growth, relationships, mental health" },
  { value: "general", label: "General", description: "Other advice and experiences" },
] as const

export type AdviceCategory = typeof ADVICE_CATEGORIES[number]["value"]

// Common advice tags
export const ADVICE_TAGS = [
  // Academic status
  "first-year", "sophomore", "junior", "senior", "graduate",
  
  // Demographics
  "international", "first-gen", "transfer",
  
  // Academic areas
  "STEM", "humanities", "social-sciences", "engineering", "arts",
  
  // Experience level
  "beginner", "experienced", "advanced",
  
  // Specific topics
  "networking", "applications", "interviews", "time-management",
  "imposter-syndrome", "work-life-balance", "mental-health",
  "financial", "housing", "social", "clubs", "leadership",
] as const

export type AdviceTag = typeof ADVICE_TAGS[number]

// Props for advice components
export interface AdviceCardProps {
  post: AdvicePost
  interactions?: UserInteractions[string]
  onLike?: (postId: string) => void
  onBookmark?: (postId: string) => void
  onView?: (postId: string) => void
  variant?: "default" | "compact" | "featured"
}

export interface AdviceGridProps {
  posts: AdvicePost[]
  interactions?: UserInteractions
  onLike?: (postId: string) => void
  onBookmark?: (postId: string) => void
  onView?: (postId: string) => void
  loading?: boolean
}

export interface AdviceFiltersProps {
  selectedCategory?: string
  selectedTags?: string[]
  onCategoryChange: (category: string | undefined) => void
  onTagsChange: (tags: string[]) => void
  onFeaturedToggle?: (featured: boolean) => void
  showFeatured?: boolean
}

export interface AuthorDisplayProps {
  post: AdvicePost
  variant?: "card" | "detail" | "compact"
  showAvatar?: boolean
}

export interface AdviceSubmissionFormProps {
  onSubmit: (data: AdviceSubmissionData) => Promise<void>
  loading?: boolean
  initialData?: Partial<AdviceSubmissionData>
}

// Utility functions for advice posts
export const getAdvicePostUrl = (postId: string) => `/advice/${postId}`

export const formatAdviceDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return "Just now"
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

export const getCategoryColor = (category: string) => {
  const colors = {
    research: "bg-blue-100 text-blue-800 border-blue-200",
    internships: "bg-green-100 text-green-800 border-green-200",
    "study-abroad": "bg-purple-100 text-purple-800 border-purple-200",
    academics: "bg-orange-100 text-orange-800 border-orange-200",
    career: "bg-indigo-100 text-indigo-800 border-indigo-200",
    life: "bg-pink-100 text-pink-800 border-pink-200",
    general: "bg-gray-100 text-gray-800 border-gray-200",
  }
  return colors[category as keyof typeof colors] || colors.general
}

export const getTagColor = (tag: string) => {
  // Different color schemes for different tag types
  const demographicTags = ["international", "first-gen", "transfer"]
  const yearTags = ["first-year", "sophomore", "junior", "senior", "graduate"]
  const fieldTags = ["STEM", "humanities", "social-sciences", "engineering", "arts"]
  
  if (demographicTags.includes(tag)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200"
  } else if (yearTags.includes(tag)) {
    return "bg-amber-50 text-amber-700 border-amber-200"
  } else if (fieldTags.includes(tag)) {
    return "bg-violet-50 text-violet-700 border-violet-200"
  } else {
    return "bg-slate-50 text-slate-700 border-slate-200"
  }
}
