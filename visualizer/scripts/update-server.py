from typing import List, Dict, Any
from dotenv import load_dotenv
import os
from fastapi import HTTPException

from neo4j import GraphDatabase
from neo4jvis.model.styled_graph import StyledGraph

from langchain_openai import AzureChatOpenAI
from langchain.schema import SystemMessage, HumanMessage

load_dotenv()

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

system_prompt="""
    Convert the following natural language request into a Neo4j Cypher query:

{input}

- The Cypher should be syntactically correct.
- The Cypher should be a read-only MATCH or RETURN, not a write or delete.
- Always aim for a clear, efficient, and accurate Cypher query."
"""

class Server:
    async def generate_cypher_query(text: str) -> str:
        """
        Generates a Cypher Query from a natural language query
        """

        prompt="""
            "{text}"
        """
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=prompt)
        ])
        return response.content.strip()

    async def execute_cypher_query(driver, query: str) -> List[dict]:
        """Execute a Cypher query"""
        try:
            with driver.session() as session:
                result = session.run(query)
                return [record.data() for record in result]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to execute query: {str(e)}")
        

    async def generate_viz_data(cypher: str) -> Dict[str, Any]:
        graph.add_from_query(cypher)
        graph.draw("output.html")