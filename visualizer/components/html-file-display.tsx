"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, ExternalLink } from "lucide-react"

interface HtmlFileDisplayProps {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function HtmlFileDisplay({ autoRefresh = false, refreshInterval = 5000 }: HtmlFileDisplayProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const clearVisualization = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(`
          <html>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
              <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: #666;">
                <div style="text-align: center;">
                  <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
                  <div>Loading new visualization...</div>
                </div>
              </div>
              <style>
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              </style>
            </body>
          </html>
        `)
        doc.close()
      }
    }
  }

  const loadHtmlFile = async () => {
    setLoading(true)
    setError(null)

    // Clear the visualization first
    clearVisualization()

    try {
      // Fetch the HTML file from your actual location
      const response = await fetch("/api/html-file", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to load HTML file: ${response.statusText}`)
      }

      const htmlContent = await response.text()

      // Wait a moment before loading new content
      setTimeout(() => {
        if (iframeRef.current) {
          const iframe = iframeRef.current
          const doc = iframe.contentDocument || iframe.contentWindow?.document
          if (doc) {
            doc.open()
            doc.write(htmlContent)
            doc.close()
            setLastUpdated(new Date())
          }
        }
        setLoading(false)
      }, 300)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load HTML file")
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHtmlFile()
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(loadHtmlFile, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const handleRefresh = () => {
    loadHtmlFile()
  }

  const handleOpenInNewTab = async () => {
    try {
      const response = await fetch("/api/html-file")
      if (response.ok) {
        const htmlContent = await response.text()
        const blob = new Blob([htmlContent], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        window.open(url, "_blank")
        // Clean up the URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    } catch (err) {
      console.error("Failed to open in new tab:", err)
    }
  }

  return (
    <div className="w-full h-full min-h-[500px] border rounded-md bg-white relative">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
        <Button variant="outline" size="sm" onClick={handleOpenInNewTab} disabled={loading || !!error}>
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* Status */}
      {lastUpdated && !loading && (
        <div className="absolute top-2 left-2 z-10">
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="absolute top-12 left-2 z-10">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Auto-refresh: {refreshInterval / 1000}s
          </span>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Loading...</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute inset-4 z-10">
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-2">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* HTML Content */}
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        style={{ minHeight: "500px", border: "none" }}
        title="Neo4j Graph Visualization"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}
