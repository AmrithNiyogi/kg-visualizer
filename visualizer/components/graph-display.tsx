"use client"

import { useEffect, useRef, useState } from "react"

interface GraphDisplayProps {
  data: any
  htmlContent?: string
}

export function GraphDisplay({ data, htmlContent }: GraphDisplayProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && iframeRef.current) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document

      if (doc) {
        // Clear the iframe first
        setLoading(true)
        doc.open()
        doc.write(
          '<html><body><div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; color: #666;">Loading visualization...</div></body></html>',
        )
        doc.close()

        // If we have HTML content, load it after a brief delay
        if (htmlContent) {
          setTimeout(() => {
            try {
              doc.open()
              doc.write(htmlContent)
              doc.close()
              setError(null)
              setLoading(false)
            } catch (err) {
              console.error("Error loading HTML content:", err)
              setError("Failed to load visualization")
              setLoading(false)
            }
          }, 100)
        } else {
          // Show empty state if no HTML content
          setTimeout(() => {
            doc.open()
            doc.write(
              '<html><body><div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; color: #666;">No visualization available</div></body></html>',
            )
            doc.close()
            setLoading(false)
          }, 100)
        }
      }
    }
  }, [htmlContent, mounted])

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[500px] border rounded-md bg-white">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full min-h-[500px] border rounded-md bg-white">
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[500px] border rounded-md bg-white relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading visualization...</span>
          </div>
        </div>
      )}

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
