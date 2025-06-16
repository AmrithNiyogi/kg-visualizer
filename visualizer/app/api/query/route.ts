import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.input) {
      return NextResponse.json({ detail: "Input not provided" }, { status: 400 })
    }

    // Forward the request to your FastAPI backend
    const backendUrl = process.env.API_BASE_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/v1/visualizer/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: body.input }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        {
          detail: errorData.detail || "Failed to process query",
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Try to read the generated HTML file from your actual location
    let htmlContent = null
    try {
      const htmlPath = "/media/nakula/Studies/DotKonnekt/PoCs/kg-visualizer/tmp/output.html"
      if (existsSync(htmlPath)) {
        htmlContent = await readFile(htmlPath, "utf-8")
        console.log("Successfully read HTML file from", htmlPath)
      } else {
        console.log("HTML file not found at", htmlPath)
      }
    } catch (error) {
      console.log("Could not read HTML file:", error)
      // HTML file reading is optional - continue without it
    }

    return NextResponse.json({
      ...data,
      htmlContent,
    })
  } catch (error) {
    console.error("Error processing query:", error)
    return NextResponse.json(
      {
        detail: "Internal server error",
      },
      { status: 500 },
    )
  }
}
