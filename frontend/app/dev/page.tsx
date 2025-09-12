"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DevPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  
  const addTestOpportunities = useMutation(api.opportunities.addTestOpportunities)
  
  const handleAddTestData = async () => {
    try {
      setLoading(true)
      setMessage("")
      
      const result = await addTestOpportunities()
      
      setMessage(`Successfully added ${result.length} test opportunities!`)
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Developer Utilities
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Development tools for testing and seeding data
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Test Opportunities</CardTitle>
              <CardDescription>
                Add 5 sample test opportunities to the database for testing purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleAddTestData}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Adding Test Data..." : "Add Test Opportunities"}
              </Button>
              
              {message && (
                <div className={`p-3 rounded-md ${
                  message.includes('Error') 
                    ? 'bg-red-100 text-red-800 border border-red-200' 
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  {message}
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                <p><strong>This will add:</strong></p>
                <ul className="mt-2 space-y-1 list-disc pl-4">
                  <li>Test Opportunity 1 (Research)</li>
                  <li>Test Opportunity 2 (Internship)</li>
                  <li>Test Program 3 (Program)</li>
                  <li>Test Grant 4 (Grant)</li>
                  <li>Test Fellowship 5 (Fellowship)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}