"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Users,
  BarChart3,
  Settings2,
  AlertCircle,
  CheckCircle,
  Activity,
  Zap,
  Shield
} from "lucide-react"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState<string | null>(null)

  // Queries
  const featureFlags = useQuery(api.admin.getFeatureFlags)
  const searchUsageStats = useQuery(api.admin.getFeatureUsageStats, {
    featureName: "search_enabled",
    days: 7
  })

  // Mutations
  const toggleFeature = useMutation(api.admin.toggleFeature)
  const upsertFeatureFlag = useMutation(api.admin.upsertFeatureFlag)
  const initializeFeatures = useMutation(api.admin.initializeDefaultFeatures)

  const searchFlag = featureFlags?.find(flag => flag.name === "search_enabled")

  const handleToggleSearch = async (enabled: boolean) => {
    if (!searchFlag) return

    setLoading("search_toggle")
    try {
      await toggleFeature({
        name: "search_enabled",
        enabled
      })
      toast.success(`Search ${enabled ? 'enabled' : 'disabled'} successfully`)
    } catch (error) {
      toast.error("Failed to update search setting")
      console.error(error)
    } finally {
      setLoading(null)
    }
  }

  const handleInitializeFeatures = async () => {
    setLoading("initialize")
    try {
      const results = await initializeFeatures()
      const newFeatures = results.filter(r => r.created).length
      toast.success(`Initialized ${newFeatures} new feature flags`)
    } catch (error) {
      toast.error("Failed to initialize features")
      console.error(error)
    } finally {
      setLoading(null)
    }
  }

  if (featureFlags === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Admin Settings</h1>
            <p className="text-muted-foreground mt-1">Loading configuration...</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground">Loading settings...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure application features and permissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {featureFlags.length === 0 && (
            <Button
              onClick={handleInitializeFeatures}
              disabled={loading === "initialize"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading === "initialize" && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              )}
              Initialize Features
            </Button>
          )}
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Shield className="w-3 h-3 mr-1" />
            Admin Mode
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="features" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Control
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Feature Flags Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Feature Flags
              </CardTitle>
              <CardDescription>
                Control which features are available to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featureFlags.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-muted-foreground">No feature flags configured</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Initialize default features to get started
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {featureFlags.map((flag) => (
                    <div key={flag._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">{flag.name.replace(/_/g, ' ').toUpperCase()}</Label>
                          {flag.enabled ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                          {flag.enabledForAdmins && (
                            <Badge variant="outline" className="text-xs">Admin Only</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{flag.description}</p>
                        {flag.config?.maxUsagePerDay && (
                          <p className="text-xs text-muted-foreground">
                            Max usage: {flag.config.maxUsagePerDay}/day
                          </p>
                        )}
                      </div>
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={(enabled) => {
                          if (flag.name === "search_enabled") {
                            handleToggleSearch(enabled)
                          }
                        }}
                        disabled={loading !== null}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Control Tab */}
        <TabsContent value="search" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Search Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Status
                </CardTitle>
                <CardDescription>
                  Current search functionality status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Global Search</Label>
                    {searchFlag?.enabled ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Admin Access</Label>
                    {searchFlag?.enabledForAdmins ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Tavily API</Label>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="search-toggle">Enable Search for All Users</Label>
                    <Switch
                      id="search-toggle"
                      checked={searchFlag?.enabled || false}
                      onCheckedChange={handleToggleSearch}
                      disabled={loading === "search_toggle" || !searchFlag}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {searchFlag?.enabled
                      ? "Search is available to all users"
                      : "Search is only available to admins"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Usage Limits Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Usage Configuration
                </CardTitle>
                <CardDescription>
                  Control search usage limits and restrictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="max-usage">Max Searches per Day</Label>
                    <Input
                      id="max-usage"
                      type="number"
                      value={searchFlag?.config?.maxUsagePerDay || 20}
                      className="mt-1"
                      min="1"
                      max="100"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Default: 20 searches per user per day
                    </p>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Search limits help manage API costs and prevent abuse. Admins have unlimited access.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common search administration tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleToggleSearch(!searchFlag?.enabled)}
                  disabled={loading !== null || !searchFlag}
                  className="flex items-center gap-2"
                >
                  {searchFlag?.enabled ? "Disable" : "Enable"} Search
                </Button>

                <Button variant="outline" disabled className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Manage User Access
                  <Badge variant="outline" className="ml-2 text-xs">Coming Soon</Badge>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Searches</p>
                    <p className="text-2xl font-bold">{searchUsageStats?.totalUsage || 0}</p>
                  </div>
                  <Activity className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                    <p className="text-2xl font-bold">{searchUsageStats?.uniqueUsers || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Active searchers</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{Math.round(searchUsageStats?.successRate || 0)}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Successful queries</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-sm font-bold text-green-600">Operational</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Search system</p>
              </CardContent>
            </Card>
          </div>

          {searchUsageStats && searchUsageStats.usage.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Search Activity</CardTitle>
                <CardDescription>Latest search queries and results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {searchUsageStats.usage.slice(-5).reverse().map((usage, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {usage.metadata?.query || 'Search query'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          User: {usage.userId.substring(0, 8)}... • {new Date(usage.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={usage.metadata?.success !== false ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {usage.metadata?.success !== false ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No search activity to display</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Search usage will appear here once users start searching
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}