import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedPath = searchParams.get("path")

    // Use your actual file location as the default
    const htmlPath = "/media/nakula/Studies/DotKonnekt/PoCs/kg-visualizer/tmp/output.html"

    if (!existsSync(htmlPath)) {
      console.log("HTML file not found at:", htmlPath)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const htmlContent = await readFile(htmlPath, "utf-8")
    console.log("Successfully served HTML file from:", htmlPath)

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error reading HTML file:", error)
    return NextResponse.json({ error: "Failed to read HTML file" }, { status: 500 })
  }
}
