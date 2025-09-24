"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Database,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  FileText
} from "lucide-react"

export default function AdminDashboard() {
  const stats = useQuery(api.opportunities.adminGetStats)
  const [isCheckingUrls, setIsCheckingUrls] = useState(false)
  const [checkingProgress, setCheckingProgress] = useState<string>("")

  const bulkCheckUrls = useMutation(api.opportunities.adminBulkCheckUrls)
  const updateUrlStatus = useMutation(api.opportunities.adminUpdateUrlStatus)

  const handleBulkCheckUrls = async () => {
    if (isCheckingUrls) return

    setIsCheckingUrls(true)
    setCheckingProgress("Getting URLs to check...")

    try {
      // Get unchecked URLs
      const urlsToCheck = await bulkCheckUrls({ limit: 20 })

      if (urlsToCheck.length === 0) {
        setCheckingProgress("No URLs need checking")
        setTimeout(() => setCheckingProgress(""), 2000)
        return
      }

      setCheckingProgress(`Checking ${urlsToCheck.length} URLs...`)

      // Check each URL
      let completed = 0
      for (const opportunity of urlsToCheck) {
        try {
          const response = await fetch('/api/admin/check-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: opportunity.url }),
          })

          if (response.ok) {
            const result = await response.json()
            await updateUrlStatus({
              id: opportunity.id,
              status: result.status,
              statusCode: result.statusCode,
              ...(result.error && { error: result.error }),
            })
          }

          completed++
          setCheckingProgress(`Checked ${completed}/${urlsToCheck.length} URLs...`)
        } catch (error) {
          console.error(`Failed to check URL for ${opportunity.title}:`, error)
        }
      }

      setCheckingProgress(`✅ Checked ${completed} URLs successfully!`)
      setTimeout(() => setCheckingProgress(""), 3000)
    } catch (error) {
      console.error('Bulk URL check failed:', error)
      setCheckingProgress("❌ URL checking failed")
      setTimeout(() => setCheckingProgress(""), 3000)
    } finally {
      setIsCheckingUrls(false)
    }
  }

  if (stats === undefined) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Loading dashboard statistics...
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const urlHealthPercentage = stats.total > 0
    ? Math.round((stats.urlStatus.working / stats.total) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of opportunities and system health
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/admin/opportunities">
              <Database className="w-4 h-4 mr-2" />
              Manage Opportunities
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active, {stats.inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">URL Health</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urlHealthPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.urlStatus.working} working, {stats.urlStatus.broken} broken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentlyUpdated}</div>
            <p className="text-xs text-muted-foreground">
              In the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</div>
            <p className="text-xs text-muted-foreground">
              Different opportunity types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/opportunities?filter=broken-urls">
                <AlertCircle className="w-4 h-4 mr-2" />
                Fix Broken URLs ({stats.urlStatus.broken})
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/opportunities?filter=inactive">
                <Database className="w-4 h-4 mr-2" />
                Review Inactive ({stats.inactive})
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleBulkCheckUrls}
              disabled={isCheckingUrls}
            >
              <Clock className="w-4 h-4 mr-2" />
              {isCheckingUrls ? checkingProgress : `Check URLs (${stats.urlStatus.unchecked})`}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>
              Opportunities by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.byCategory)
                .sort(([,a], [,b]) => b - a)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">
                        {category}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Alerts */}
      {(stats.urlStatus.broken > 0 || stats.urlStatus.unchecked > 10) && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span>System Health Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.urlStatus.broken > 0 && (
              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Broken URLs detected</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.urlStatus.broken} opportunities have broken links
                  </p>
                </div>
                <Button asChild size="sm" variant="destructive">
                  <Link href="/admin/opportunities?filter=broken-urls">
                    Fix Now
                  </Link>
                </Button>
              </div>
            )}
            {stats.urlStatus.unchecked > 10 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">URLs need checking</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.urlStatus.unchecked} opportunities haven't been URL checked
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkCheckUrls}
                  disabled={isCheckingUrls}
                >
                  {isCheckingUrls ? "Checking..." : "Check URLs"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}