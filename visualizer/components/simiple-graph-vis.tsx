"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface SimpleGraphVizProps {
  data: any
}

export function SimpleGraphVisualization({ data }: SimpleGraphVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedNode, setSelectedNode] = useState<any>(null)

  useEffect(() => {
    if (canvasRef.current && data) {
      drawGraph()
    }
  }, [data])

  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const nodes = data.nodes || []
    const relationships = data.relationships || []

    if (nodes.length === 0) return

    // Simple layout: arrange nodes in a circle
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) * 0.3

    // Position nodes
    const nodePositions = new Map()
    nodes.forEach((node: any, index: number) => {
      const angle = (index / nodes.length) * 2 * Math.PI
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      nodePositions.set(node.id, { x, y, node })
    })

    // Draw relationships first (so they appear behind nodes)
    ctx.strokeStyle = "#999"
    ctx.lineWidth = 2
    relationships.forEach((rel: any) => {
      const fromPos = nodePositions.get(rel.fromId || rel.startNode)
      const toPos = nodePositions.get(rel.toId || rel.endNode)

      if (fromPos && toPos) {
        ctx.beginPath()
        ctx.moveTo(fromPos.x, fromPos.y)
        ctx.lineTo(toPos.x, toPos.y)
        ctx.stroke()

        // Draw arrow
        const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x)
        const arrowLength = 10
        ctx.beginPath()
        ctx.moveTo(toPos.x, toPos.y)
        ctx.lineTo(
          toPos.x - arrowLength * Math.cos(angle - Math.PI / 6),
          toPos.y - arrowLength * Math.sin(angle - Math.PI / 6),
        )
        ctx.moveTo(toPos.x, toPos.y)
        ctx.lineTo(
          toPos.x - arrowLength * Math.cos(angle + Math.PI / 6),
          toPos.y - arrowLength * Math.sin(angle + Math.PI / 6),
        )
        ctx.stroke()

        // Draw relationship label
        const midX = (fromPos.x + toPos.x) / 2
        const midY = (fromPos.y + toPos.y) / 2
        ctx.fillStyle = "#666"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.fillText(rel.type, midX, midY - 5)
      }
    })

    // Draw nodes
    nodePositions.forEach(({ x, y, node }) => {
      // Draw node circle
      ctx.fillStyle = "#4A90E2"
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, 2 * Math.PI)
      ctx.fill()

      // Draw node border
      ctx.strokeStyle = "#2E5C8A"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw node label
      ctx.fillStyle = "#000"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      const label = node.properties?.name || node.properties?.title || node.id
      const displayLabel = label.length > 10 ? label.substring(0, 10) + "..." : label
      ctx.fillText(displayLabel, x, y + 35)
    })
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if click is on a node
    const nodes = data.nodes || []
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) * 0.3

    nodes.forEach((node: any, index: number) => {
      const angle = (index / nodes.length) * 2 * Math.PI
      const nodeX = centerX + radius * Math.cos(angle)
      const nodeY = centerY + radius * Math.sin(angle)

      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2)
      if (distance <= 20) {
        setSelectedNode(node)
      }
    })
  }

  return (
    <div className="w-full h-full min-h-[500px] border rounded-md bg-white relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
        style={{ minHeight: "500px" }}
      />

      {selectedNode && (
        <div className="absolute top-4 right-4 bg-white p-4 border rounded-md shadow-lg max-w-xs z-10">
          <h4 className="font-medium mb-2">Selected Node</h4>
          <div className="space-y-1 text-sm">
            <div>
              <strong>ID:</strong> {selectedNode.id}
            </div>
            {selectedNode.labels && selectedNode.labels.length > 0 && (
              <div>
                <strong>Labels:</strong> {selectedNode.labels.join(", ")}
              </div>
            )}
            {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
              <div>
                <strong>Properties:</strong>
                <pre className="text-xs mt-1 bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                  {JSON.stringify(selectedNode.properties, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <button onClick={() => setSelectedNode(null)} className="mt-2 text-xs text-blue-600 hover:underline">
            Close
          </button>
        </div>
      )}
    </div>
  )
}
