"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface BackendStatus {
  status: string
  services?: {
    backend: string
  }
  error?: string
}

export function BackendStatus() {
  const [status, setStatus] = useState<BackendStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const checkHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        status: "error",
        services: { backend: "unreachable" },
        error: "Failed to connect to backend",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500"
      case "unhealthy":
      case "unavailable":
        return "bg-red-500"
      case "error":
      case "unreachable":
        return "bg-red-600"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return "Backend Connected"
      case "unhealthy":
        return "Backend Unhealthy"
      case "unavailable":
        return "Backend Unavailable"
      case "error":
      case "unreachable":
        return "Backend Error"
      default:
        return "Unknown Status"
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor(status?.services?.backend || "unknown")}`} />
        <Badge variant="outline" className="text-xs">
          {loading ? "Checking..." : getStatusText(status?.services?.backend || "unknown")}
        </Badge>
      </div>
      <Button variant="ghost" size="sm" onClick={checkHealth} disabled={loading} className="h-6 w-6 p-0">
        <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
      </Button>
      {status?.error && (
        <span className="text-xs text-red-600" title={status.error}>
          ⚠️
        </span>
      )}
    </div>
  )
}
