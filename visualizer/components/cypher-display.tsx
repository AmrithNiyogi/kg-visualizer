"use client"

import { Button } from "@/components/ui/button"
import { ClipboardCopy } from "lucide-react"
import { useState } from "react"

interface CypherDisplayProps {
  query: string
}

export function CypherDisplay({ query }: CypherDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(query)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
        <code>{query}</code>
      </pre>
      <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={copyToClipboard}>
        {copied ? "Copied!" : <ClipboardCopy className="h-4 w-4" />}
      </Button>
    </div>
  )
}
