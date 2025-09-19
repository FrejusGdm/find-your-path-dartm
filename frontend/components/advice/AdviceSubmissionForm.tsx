"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Eye, EyeOff, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { 
  AdviceSubmissionFormProps, 
  AdviceSubmissionData,
  ADVICE_CATEGORIES,
  ADVICE_TAGS,
  getCategoryColor,
  getTagColor
} from "./types"
import { cn } from "@/lib/utils"

// Form validation schema
const adviceSubmissionSchema = z.object({
  title: z.string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must be less than 100 characters"),
  content: z.string()
    .min(50, "Content must be at least 50 characters")
    .max(5000, "Content must be less than 5000 characters"),
  category: z.string().min(1, "Please select a category"),
  tags: z.array(z.string()).min(1, "Please select at least one tag"),
  isAnonymous: z.boolean(),
})

type FormData = z.infer<typeof adviceSubmissionSchema>

export function AdviceSubmissionForm({ 
  onSubmit, 
  loading = false,
  initialData 
}: AdviceSubmissionFormProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [customTag, setCustomTag] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(adviceSubmissionSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      category: initialData?.category || "",
      tags: initialData?.tags || [],
      isAnonymous: initialData?.isAnonymous || false,
    },
  })

  const watchedValues = form.watch()
  const selectedTags = form.watch("tags")

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      console.error("Error submitting advice:", error)
    }
  }

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      const newTags = [...selectedTags, customTag.trim()]
      form.setValue("tags", newTags)
      setCustomTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove)
    form.setValue("tags", newTags)
  }

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    form.setValue("tags", newTags)
  }

  if (isPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Preview Your Post</h2>
          <Button
            variant="outline"
            onClick={() => setIsPreview(false)}
            className="flex items-center gap-2"
          >
            <EyeOff className="w-4 h-4" />
            Edit
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-xl">{watchedValues.title}</CardTitle>
              <Badge 
                variant="secondary" 
                className={cn(getCategoryColor(watchedValues.category))}
              >
                {ADVICE_CATEGORIES.find(c => c.value === watchedValues.category)?.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="whitespace-pre-wrap text-muted-foreground">
              {watchedValues.content}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">
                {watchedValues.isAnonymous ? "Anonymous Student" : "Your Name"}
              </span>
              <span>•</span>
              <span>Just now</span>
            </div>

            {watchedValues.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedValues.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className={cn("text-xs", getTagColor(tag))}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={() => handleSubmit(watchedValues)}
            disabled={loading}
            className="flex-1"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Share Your Advice
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsPreview(false)}
          >
            Back to Edit
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Share Your Advice</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreview(true)}
            disabled={!form.formState.isValid}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., How I got my first research position"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Write a clear, descriptive title that summarizes your advice.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Advice</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your experience, tips, and insights that could help other students..."
                  className="min-h-[200px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Be specific and actionable. What would you tell your past self?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ADVICE_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", getCategoryColor(category.value).split(' ')[0])} />
                          <div>
                            <div className="font-medium">{category.label}</div>
                            <div className="text-xs text-muted-foreground">{category.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isAnonymous"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Post anonymously
                  </FormLabel>
                  <FormDescription>
                    Your name won't be shown. Only "Anonymous Student" will appear.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormDescription>
                Select tags that describe your advice or situation.
              </FormDescription>
              
              {/* Custom tag input */}
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Add custom tag..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomTag}
                  disabled={!customTag.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Selected tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Available tags */}
              <div className="space-y-3">
                {Object.entries({
                  "Academic Status": ["first-year", "sophomore", "junior", "senior", "graduate"],
                  "Demographics": ["international", "first-gen", "transfer"],
                  "Academic Areas": ["STEM", "humanities", "social-sciences", "engineering", "arts"],
                  "Common Topics": ["networking", "applications", "interviews", "time-management", "imposter-syndrome"]
                }).map(([groupName, tags]) => (
                  <div key={groupName}>
                    <h4 className="text-sm font-medium mb-2">{groupName}</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-colors",
                            selectedTags.includes(tag) 
                              ? "bg-primary text-primary-foreground" 
                              : getTagColor(tag)
                          )}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading || !form.formState.isValid}
            className="flex-1"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Share Your Advice
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreview(true)}
            disabled={!form.formState.isValid}
          >
            Preview
          </Button>
        </div>
      </form>
    </Form>
  )
}
