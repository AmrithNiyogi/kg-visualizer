"use server"

// Update the backend server.py to return proper neo4jvis compatible data
export async function updateBackendForNeo4jVis() {
  // This is a placeholder for backend modifications
  // The actual changes need to be made in your Python server.py file

  const updatedServerCode = `
# Add this to your server.py file to return neo4jvis compatible data

async def generate_viz_data(cypher: str) -> Dict[str, Any]:
    """
    Generate visualization data compatible with neo4jvis.js
    """
    try:
        # Execute the cypher query to get raw data
        with neo4j_driver.session() as session:
            result = session.run(cypher)
            records = [record.data() for record in result]
        
        # Create StyledGraph and add data
        graph = StyledGraph(neo4j_driver)
        graph.add_from_query(cypher)
        
        # Extract nodes and relationships in neo4jvis format
        nodes = []
        relationships = []
        
        # Get nodes from the graph
        for node_id, node_data in graph.nodes.items():
            nodes.append({
                "id": node_id,
                "labels": node_data.get("labels", []),
                "properties": node_data.get("properties", {}),
                "style": node_data.get("style", {})
            })
        
        # Get relationships from the graph
        for rel_id, rel_data in graph.relationships.items():
            relationships.append({
                "id": rel_id,
                "type": rel_data.get("type", ""),
                "fromId": rel_data.get("startNode", ""),
                "toId": rel_data.get("endNode", ""),
                "properties": rel_data.get("properties", {}),
                "style": rel_data.get("style", {})
            })
        
        return {
            "nodes": nodes,
            "relationships": relationships,
            "raw_data": records
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate visualization data: {str(e)}")
  `

  return updatedServerCode
}
