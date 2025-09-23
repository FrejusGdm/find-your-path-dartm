"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldCheck, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function AdminSetupPage() {
  const [email, setEmail] = useState("f006g5b@dartmouth.edu")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const bootstrapFirstAdmin = useMutation(api.users.bootstrapFirstAdmin)

  const handleSetupAdmin = async () => {
    setStatus("loading")
    setMessage("")

    try {
      const result = await bootstrapFirstAdmin({ email })
      setStatus("success")
      setMessage(result.message || `Successfully made ${email} an admin!`)
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "Failed to set up admin")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Setup</CardTitle>
          <CardDescription>
            This is a one-time setup to create the first admin user.
            Once an admin exists, this function won't work anymore.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@dartmouth.edu"
              disabled={status === "loading"}
            />
            <p className="text-xs text-muted-foreground">
              Enter the email of the user who should become the first admin.
              They must have already signed up.
            </p>
          </div>

          {status === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button
              onClick={handleSetupAdmin}
              disabled={!email || status === "loading"}
              className="w-full"
            >
              {status === "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Setting up admin...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Make Admin
                </>
              )}
            </Button>

            {status === "success" && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin">
                  Go to Admin Dashboard
                </Link>
              </Button>
            )}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              After setup, this page can be deleted for security.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}