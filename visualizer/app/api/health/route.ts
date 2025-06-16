import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if we can connect to your FastAPI backend
    const backendUrl = process.env.API_BASE_URL || "http://localhost:8000"
    const backendResponse = await fetch(`${backendUrl}/v1/visualizer/health`, {
      cache: "no-store",
    })

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          status: "unhealthy",
          services: {
            backend: "unavailable",
          },
        },
        { status: 503 },
      )
    }

    const backendData = await backendResponse.json()

    return NextResponse.json({
      status: "healthy",
      services: {
        backend: backendData.status || "healthy",
      },
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        services: {
          backend: "error",
        },
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
