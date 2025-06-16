import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Forward the request to the FastAPI backend health endpoint
    const response = await fetch(`${process.env.API_BASE_URL || "http://localhost:8000"}/v1/visualizer/health`)

    if (!response.ok) {
      return NextResponse.json({ status: "Backend service unavailable" }, { status: 503 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json({ status: "error", message: "Failed to connect to backend service" }, { status: 500 })
  }
}
