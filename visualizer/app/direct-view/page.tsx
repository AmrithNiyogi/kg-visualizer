import { HtmlFileDisplay } from "@/components/html-file-display"
import { ClientThemeProvider } from "@/components/client-theme-provider"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function DirectViewPage() {
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

        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Direct HTML File View</h1>
            <p className="text-gray-600">
              View the generated HTML file directly from:
              /media/nakula/Studies/DotKonnekt/PoCs/kg-visualizer/tmp/output.html
            </p>
          </div>

          <div className="h-[600px]">
            <HtmlFileDisplay autoRefresh={true} refreshInterval={5000} />
          </div>
        </div>
      </div>
    </ClientThemeProvider>
  )
}
