from typing import List, Dict, Any
from dotenv import load_dotenv
import os
import json
import logging

from fastapi import HTTPException

from neo4j import GraphDatabase
from neo4jvis.model.styled_graph import StyledGraph

from pyvis.network import Network

from langchain_openai import AzureChatOpenAI
from langchain.schema import SystemMessage, HumanMessage

import aiohttp

load_dotenv()

logger = logging.getLogger(__name__)

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
AZURE_OPENAI_API_KEY  = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_API_BASE = os.getenv("AZURE_OPENAI_API_BASE")
AZURE_DEPLOYMENT_NAME = os.getenv("AZURE_DEPLOYMENT_NAME")


neo4j_driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(NEO4J_USERNAME, NEO4J_PASSWORD)
)

graph = StyledGraph(neo4j_driver)

llm = AzureChatOpenAI(
    azure_deployment=AZURE_DEPLOYMENT_NAME,
    api_version="2025-01-01-preview",
    temperature=0.7,
    azure_endpoint=AZURE_OPENAI_API_BASE,
    api_key=AZURE_OPENAI_API_KEY,
)

system_prompt = """
You are a Neo4j Cypher expert.
Convert the following natural language request into a Neo4j Cypher query.

Requirements:
- Always match **nodes or relationships or paths** with p.
- p can be a **path**, a **relationship**, or a **node**.
- Always RETURN p or n or r at the end of your query.
- The Cypher should be syntactically correct.
- The Cypher should be read-only (using MATCH).
- The output should ONLY be the Cypher, with NO additional text or explanations.
- Do not wrap the Cypher in code fences or backticks.
- If a cypher is given, do not modify it, just return it as is.
Examples:

Input: "Who interacts with who in the graph?"
Output: "MATCH p = (:Character)-[r:INTERACTS]->(:Character) RETURN p LIMIT 10"

Input: "List all nodes labeled Person."
Output: "MATCH (n:Person) RETURN n LIMIT 10"

Input: "List all relationships of IS_FRIEND_OF."
Output: "MATCH ()-[r:IS_FRIEND_OF]->() RETURN r LIMIT 10"

Input: "Retrieve nodes labeled Risk."
Output: "MATCH (n:Risk) RETURN n"

Input: "Retrieve 2 nodes labeled Risk."
Output: "MATCH (n:Risk) RETURN n LIMIT 2"


Start now:

{input}
""" 

class Server:
    async def check_neo4j_health(self):
        """Verifies Neo4j connection by sending a simple query."""
        try:
            async with self.neo4j_driver.session() as sess:
                result = await sess.run("RETURN 1 LIMIT 1")
                record = await result.single()
                return record is not None and record[0] == 1
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False



    async def generate_cypher_query(self, text: str) -> str:
        """
        Generates a Cypher Query from a natural language query
        """

        prompt=f"""
            {text}
        """
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=prompt)
        ])
        print(response.content.strip())
        return response.content.strip()
    
    async def sanitize_cypher_response(self, text: str) -> str:
        """Remove code fences and trim whitespaces."""
        cleaned = text.strip()
        cleaned = cleaned.strip("`")  # Strip backticks
        cleaned = cleaned.strip()
        cleaned = cleaned.removeprefix("cypher").strip()
        return cleaned

    async def execute_cypher_query(self, cls, driver, query: str) -> List[dict]:
        """Sanitize and execute a Cypher query against Neo4j and return parsed results."""
        try:
            cleaned_query = await cls.sanitize_cypher_response(query)
            async with driver.async_session() as session:
                result = await session.run(cleaned_query)
                print(result)
                return [record.data() for record in result]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to execute query: {str(e)}")

    async def generate_viz_data(self, cypher: str) -> Dict[str, Any]:
        output_file = "tmp/output.html"

        # Ensure directory exists
        os.makedirs("tmp", exist_ok=True)

        # Remove the file if it already exists
        if os.path.exists(output_file):
            os.remove(output_file)

        # Generate and save the visualization
        graph.add_from_query(cypher)
        graph.draw(output_file)

        # Read back the rendered output
        with open(output_file, "r") as f:
            rendered = f.read()

        return {"html": rendered}

    async def fetch_nodes_and_edges(self, cypher: str):
        """
        Execute the Cypher query and extract nodes and edges.
        """
        nodes = {}
        edges = []

        with neo4j_driver.session() as sess:
            result = sess.run(cypher)

            for record in result:
                for item in record.values():
                    if item is None:
                        continue

                    if item.__class__.__name__ == "Node":
                        node = item
                        nodes[node.id] = {
                            "id": node.id,
                            "label": list(node.labels)[0] if node.labels else "Unknown",
                            "properties": dict(node)
                        }
                    elif item.__class__.__name__ == "Relationship":
                        rel = item
                        edges.append({"start": rel.start_node.id, "end": rel.end_node.id})

                    # If it's a path, we can extract both:
                    elif item.__class__.__name__ == "Path":
                        path = item
                        for node in path.nodes:
                            nodes[node.id] = {
                                "id": node.id,
                                "label": list(node.labels)[0] if node.labels else "Unknown",
                                "properties": dict(node)
                            }
                        for rel in path.relationships:
                            edges.append({"start": rel.start_node.id, "end": rel.end_node.id})

        return list(nodes.values()), edges

    async def generate_pyvis_data(self, cypher: str) -> Dict[str, Any]:
        with open("/media/nakula/Studies/DotKonnekt/PoCs/kg-visualizer/app/template.html", "r") as f:
            HTML_TEMPLATE = f.read()
        output_file = "tmp/output.html"
        # Ensure directory exists
        os.makedirs("tmp", exist_ok=True)
        # Remove the file if it already exists
        if os.path.exists(output_file):
            os.remove(output_file)
        # Initialize PyVis network
        net = Network(height='500px', width='1000px', notebook=False)
        # Retrieve nodes and edges
        nodes, edges = await self.fetch_nodes_and_edges(cypher)
        # Store node details for later use in click event
        node_data = {
            n['id']: {
                "label": n['label'], 
                "properties": n['properties']
            }
            for n in nodes
        }
        # Add nodes with IDs
        for n in nodes:
            net.add_node(
                n['id'], 
                label=n['label'], 
                title='Click for details'
            )
        # Add edges
        for e in edges:
            net.add_edge(e['start'], e['end'])

        # Generate HTML
        net.save_graph(output_file)
        # Now inject custom JavaScript for click event
        with open(output_file, "r") as f:
            rendered = f.read()
        # Prepare the details to be injected
        node_json = json.dumps(node_data)

        custom_script = f""" 
            <script>
                var network = network; // The network instance

                var nodeData = {node_json};

                var detailsVisible = false;

                var detailsBox = document.createElement('div'); 
                detailsBox.style.position = 'fixed';
                detailsBox.style.top = '10px';
                detailsBox.style.right = '10px';
                detailsBox.style.padding = '20px';
                detailsBox.style.background = '#fff';
                detailsBox.style.border = '1px solid #ccc';
                detailsBox.style.zIndex = 1000;
                detailsBox.style.maxWidth = '300px';
                detailsBox.style.maxHeight = '90vh';
                detailsBox.style.overflow = 'auto';
                detailsBox.innerHTML = "<h3>Click a node to view details</h3>";
                document.body.appendChild(detailsBox);

                network.on("click", function (params) {{
                    if (params.nodes.length > 0) {{
                        var nodeId = params.nodes[0];
                        if (detailsVisible && detailsBox.dataset.activeId == nodeId) {{
                            // Hide details if clicking the same node again
                            detailsBox.innerHTML = "<h3>Click a node to view details</h3>";
                            detailsBox.dataset.activeId = '';
                            detailsVisible = false;
                        }} else {{
                            // Display details
                            var data = nodeData[nodeId];
                            var properties = '';
                            for (const [key, value] of Object.entries(data.properties)) {{
                                properties += "<strong>" + key + "</strong>: " + value + "<br>";
                            }}
                            detailsBox.innerHTML = "<h3>" + data.label + "</h3>" + properties;
                            detailsBox.dataset.activeId = nodeId;
                            detailsVisible = true;
                        }}
                    }} 
                }});
            </script>"""    

        rendered = rendered.replace('</body>', custom_script + '</body>')

        with open(output_file, "w") as f:
            f.write(rendered)

        return {"html": rendered}