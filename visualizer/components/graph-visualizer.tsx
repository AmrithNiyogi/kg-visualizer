"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { CypherDisplay } from "./cypher-display"
import { GraphDisplay } from "./graph-display"
import { AdvancedGraphDisplay } from "./advanced-graph-display"
import { ExampleQueries } from "./example-queries"
import { EmptyState } from "./ui/empty-state"

export function GraphVisualizer() {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    query: string
    data: any
    htmlContent?: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState("graph")
  const [useAdvancedView, setUseAdvancedView] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    setError(null)

    // Clear previous result to show loading state
    setResult(null)

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to process query")
      }

      const data = await response.json()
      setResult(data)
      setActiveTab("graph") // Switch to graph tab after successful query
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleExampleSelect = (query: string) => {
    setInput(query)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your query in natural language (e.g., 'Show me all users and their posts')"
          className="flex-1"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Visualize"}
        </Button>
      </form>

      <div className="flex items-center space-x-2">
        <Switch id="advanced-view" checked={useAdvancedView} onCheckedChange={setUseAdvancedView} />
        <Label htmlFor="advanced-view">Use advanced graph view</Label>
      </div>

      <ExampleQueries onSelectQuery={handleExampleSelect} />

      {loading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Processing your query and generating visualization...</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && result.status === "success" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Query processed successfully! {result.htmlContent ? "Visualization loaded." : "Data received."}
          </AlertDescription>
        </Alert>
      )}

      {result ? (
        useAdvancedView ? (
          <AdvancedGraphDisplay data={result.data} query={result.query} htmlContent={result.htmlContent} />
        ) : (
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="graph">Graph Visualization</TabsTrigger>
                <TabsTrigger value="cypher">Cypher Query</TabsTrigger>
              </TabsList>
              <TabsContent value="graph" className="p-0">
                <CardContent className="pt-6">
                  <GraphDisplay data={result.data} htmlContent={result.htmlContent} />
                </CardContent>
              </TabsContent>
              <TabsContent value="cypher" className="p-0">
                <CardContent className="pt-6">
                  <CypherDisplay query={result.query} />
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        )
      ) : (
        !loading &&
        !error && (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                title="No visualization yet"
                description="Enter a natural language query above to generate a graph visualization"
                action={{
                  label: "Try an example",
                  onClick: () => handleExampleSelect("Show me all users and their posts"),
                }}
              />
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}
