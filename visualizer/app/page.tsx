import { GraphVisualizer } from "@/components/graph-visualizer"
import { ClientThemeProvider } from "@/components/client-theme-provider"
import { BackendStatus } from "@/components/backend-status"

export default function Home() {
  return (
    <ClientThemeProvider>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Neo4j Graph Visualizer</h1>
            <p className="text-gray-600">
              Enter a natural language query to generate a Cypher query and visualize the graph data.
            </p>
          </div>
          <BackendStatus />
        </div>
        <GraphVisualizer />
      </div>
    </ClientThemeProvider>
  )
}
