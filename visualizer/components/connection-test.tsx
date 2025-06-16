"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function ConnectionTest() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const testConnection = async () => {
    setTesting(true)
    setResult(null)

    try {
      // Test health endpoint
      const healthResponse = await fetch("/api/health")
      const healthData = await healthResponse.json()

      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthData.error || "Unknown error"}`)
      }

      // Test a simple query
      const queryResponse = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: "MATCH (n) RETURN n LIMIT 1",
        }),
      })

      const queryData = await queryResponse.json()

      if (queryResponse.ok) {
        setResult({
          success: true,
          message: "Successfully connected to backend and executed test query",
          details: {
            health: healthData,
            query: queryData.query,
            dataNodes: queryData.data?.nodes?.length || 0,
            dataRelationships: queryData.data?.relationships?.length || 0,
          },
        })
      } else {
        setResult({
          success: false,
          message: `Query test failed: ${queryData.detail}`,
          details: { health: healthData },
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Connection test failed",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Backend Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={testing} className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            "Test Backend Connection"
          )}
        </Button>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertDescription>
              <div className="space-y-2">
                <p>{result.message}</p>
                {result.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer">Details</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
