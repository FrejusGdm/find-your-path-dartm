"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"

interface OpportunityFilters {
  isActive?: boolean
  category?: string
  department?: string
  urlStatus?: string
}

export default function AdminOpportunities() {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<OpportunityFilters>({})
  const [selectedIds, setSelectedIds] = useState<Id<"opportunities">[]>([])

  // Get initial filter from URL params
  const urlFilter = searchParams?.get("filter")
  const initialFilters: OpportunityFilters = {}

  if (urlFilter === "broken-urls") {
    initialFilters.urlStatus = "broken"
  } else if (urlFilter === "inactive") {
    initialFilters.isActive = false
  } else if (urlFilter === "unchecked-urls") {
    initialFilters.urlStatus = "unchecked"
  }

  const opportunities = useQuery(api.opportunities.adminGetAll, {
    search: search || undefined,
    filters: { ...filters, ...initialFilters },
    limit: 100
  })

  const bulkUpdate = useMutation(api.opportunities.adminBulkUpdate)
  const updateUrlStatus = useMutation(api.opportunities.adminUpdateUrlStatus)
  const deleteOpportunity = useMutation(api.opportunities.adminDelete)

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return

    try {
      switch (action) {
        case "activate":
          await bulkUpdate({ ids: selectedIds, updates: { isActive: true } })
          break
        case "deactivate":
          await bulkUpdate({ ids: selectedIds, updates: { isActive: false } })
          break
        case "delete":
          if (confirm(`Delete ${selectedIds.length} opportunities? This cannot be undone.`)) {
            for (const id of selectedIds) {
              await deleteOpportunity({ id })
            }
          }
          break
      }
      setSelectedIds([])
    } catch (error) {
      console.error("Bulk action failed:", error)
    }
  }

  const handleCheckUrl = async (id: Id<"opportunities">, url: string) => {
    try {
      const response = await fetch('/api/admin/check-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()

      if (response.ok) {
        // Update the status in Convex
        await updateUrlStatus({
          id,
          status: result.status,
          statusCode: result.statusCode,
          ...(result.error && { error: result.error }),
        })
      } else {
        console.error("URL check failed:", result.error)
      }
    } catch (error) {
      console.error("URL check failed:", error)
    }
  }

  const getUrlStatusBadge = (status?: string) => {
    switch (status) {
      case "working":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Working</Badge>
      case "broken":
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Broken</Badge>
      case "redirect":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><ExternalLink className="w-3 h-3 mr-1" />Redirect</Badge>
      default:
        return <Badge variant="outline" className="text-gray-600 border-gray-600"><Clock className="w-3 h-3 mr-1" />Unchecked</Badge>
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      research: "bg-blue-100 text-blue-800",
      internship: "bg-green-100 text-green-800",
      grant: "bg-purple-100 text-purple-800",
      program: "bg-orange-100 text-orange-800",
      fellowship: "bg-indigo-100 text-indigo-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (opportunities === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Opportunities Management</h1>
        </div>
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Opportunities Management</h1>
          <p className="text-muted-foreground">
            {opportunities.length} opportunities found
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/opportunities/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Opportunity
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search opportunities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.isActive?.toString() || "all"} onValueChange={(value) =>
              setFilters(f => ({ ...f, isActive: value === "all" ? undefined : value === "true" }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.category || "all"} onValueChange={(value) =>
              setFilters(f => ({ ...f, category: value === "all" ? undefined : value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="grant">Grant</SelectItem>
                <SelectItem value="program">Program</SelectItem>
                <SelectItem value="fellowship">Fellowship</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.urlStatus || "all"} onValueChange={(value) =>
              setFilters(f => ({ ...f, urlStatus: value === "all" ? undefined : value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="URL Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All URLs</SelectItem>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="broken">Broken</SelectItem>
                <SelectItem value="unchecked">Unchecked</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("")
                setFilters({})
              }}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {selectedIds.length} selected
              </span>
              <Button size="sm" onClick={() => handleBulkAction("activate")}>
                Activate
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("deactivate")}>
                Deactivate
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === opportunities.length && opportunities.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds(opportunities.map(o => o._id))
                      } else {
                        setSelectedIds([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>URL Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow key={opportunity._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(opportunity._id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds([...selectedIds, opportunity._id])
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== opportunity._id))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{opportunity.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {opportunity.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(opportunity.category)}>
                      {opportunity.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{opportunity.department}</TableCell>
                  <TableCell>
                    <Badge variant={opportunity.isActive ? "default" : "secondary"}>
                      {opportunity.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getUrlStatusBadge(opportunity.urlStatus)}
                      {opportunity.officialUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCheckUrl(opportunity._id, opportunity.officialUrl)}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(opportunity.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/opportunities/${opportunity._id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {opportunity.officialUrl && (
                          <DropdownMenuItem asChild>
                            <a href={opportunity.officialUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4 mr-2" />
                              View Original
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Delete this opportunity? This cannot be undone.")) {
                              deleteOpportunity({ id: opportunity._id })
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {opportunities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No opportunities found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}