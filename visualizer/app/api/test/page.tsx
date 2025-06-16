import { ConnectionTest } from "@/components/connection-test"
import { ClientThemeProvider } from "@/components/client-theme-provider"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TestPage() {
  return (
    <ClientThemeProvider>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Visualizer
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Backend Connection Test</h1>
            <p className="text-gray-600">
              Test the connection to your FastAPI backend and verify it's working correctly.
            </p>
          </div>

          <div className="flex justify-center">
            <ConnectionTest />
          </div>
        </div>
      </div>
    </ClientThemeProvider>
  )
}
