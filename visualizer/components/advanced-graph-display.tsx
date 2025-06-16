"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, RefreshCw, ExternalLink } from "lucide-react"
import { GraphDisplay } from "./graph-display"

interface AdvancedGraphDisplayProps {
  data: any
  query?: string
  htmlContent?: string
}

export function AdvancedGraphDisplay({ data, query, htmlContent }: AdvancedGraphDisplayProps) {
  const [stats, setStats] = useState({ nodes: 0, relationships: 0 })

  useEffect(() => {
    if (data) {
      setStats({
        nodes: data.nodes?.length || 0,
        relationships: data.relationships?.length || 0,
      })
    }
  }, [data])

  const handleRefresh = () => {
    // Trigger a refresh of the visualization
    window.location.reload()
  }

  const handleDownload = () => {
    if (htmlContent) {
      // Create a blob with the HTML content and download it
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "neo4j-graph-visualization.html"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleOpenInNewTab = () => {
    if (htmlContent) {
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const newWindow = window.open(url, "_blank")
      if (newWindow) {
        // Clean up the URL after the window loads
        newWindow.onload = () => {
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Graph Statistics and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <Badge variant="secondary">
            {stats.nodes} {stats.nodes === 1 ? "Node" : "Nodes"}
          </Badge>
          <Badge variant="secondary">
            {stats.relationships} {stats.relationships === 1 ? "Relationship" : "Relationships"}
          </Badge>
          {htmlContent && (
            <Badge variant="outline" className="text-green-600">
              Visualization Ready
            </Badge>
          )}
        </div>

        {/* Graph Controls */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenInNewTab} disabled={!htmlContent}>
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!htmlContent}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Graph Visualization */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <GraphDisplay data={data} htmlContent={htmlContent} />
            </CardContent>
          </Card>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Graph Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Nodes:</span>
                        <span>{stats.nodes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Relationships:</span>
                        <span>{stats.relationships}</span>
                      </div>
                    </div>
                  </div>

                  {query && (
                    <div>
                      <h4 className="font-medium mb-2">Generated Query</h4>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap max-h-32">
                        {query}
                      </pre>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Visualization Features</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Interactive node selection</li>
                      <li>• Drag and zoom support</li>
                      <li>• Click nodes for details</li>
                      <li>• Physics-based layout</li>
                      <li>• Loading progress indicator</li>
                    </ul>
                  </div>

                  {htmlContent && (
                    <div>
                      <h4 className="font-medium mb-2">Actions</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" onClick={handleOpenInNewTab} className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in New Tab
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload} className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download HTML
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
