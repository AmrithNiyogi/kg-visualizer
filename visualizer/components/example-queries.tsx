"use client"

import { Button } from "@/components/ui/button"

interface ExampleQueriesProps {
  onSelectQuery: (query: string) => void
}

const EXAMPLE_QUERIES = [
  "Show me all nodes and their relationships",
  "Find all products and their risks",
  "What are the different types of relationships?",
  "Show me nodes with the most connections",
  "Display the complete graph structure",
  "Find all nodes with specific properties",
]

export function ExampleQueries({ onSelectQuery }: ExampleQueriesProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Example queries:</h3>
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_QUERIES.map((query, index) => (
          <Button key={index} variant="outline" size="sm" onClick={() => onSelectQuery(query)} className="text-xs">
            {query}
          </Button>
        ))}
      </div>
    </div>
  )
}
