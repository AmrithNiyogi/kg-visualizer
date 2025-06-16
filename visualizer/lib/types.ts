export interface Node {
  id: string
  labels: string[]
  properties: Record<string, any>
  style?: {
    color?: string
    size?: number
  }
}

export interface Relationship {
  id: string
  type: string
  fromId: string
  toId: string
  properties: Record<string, any>
  style?: {
    color?: string
    width?: number
  }
}

export interface GraphData {
  nodes: Node[]
  relationships: Relationship[]
}

export interface QueryResult {
  status: string
  query: string
  data: GraphData
}
