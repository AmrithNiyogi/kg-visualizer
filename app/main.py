from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
# from server import generate_cypher_query, generate_viz_data
import uvicorn
from .server_aiohttp import Server
# from .server_driver import Server Use when using Neo4j driver directly

app = FastAPI()

server = Server()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def sanitize_input(input_txt: str) -> str:
    """Remove backticks and trim whitespaces from the input."""
    cleaned = input_txt.strip()
    cleaned = cleaned.strip("`")  # Strip backticks at start and end
    cleaned = cleaned.strip()
    return cleaned


@app.get("/v1/visualizer/health")
async def health():
    """Health endpoint that checks Neo4j connection first."""
    is_healthy = await server.check_neo4j_health()
    if is_healthy:
        return {"status": "healthy"}
    else:
        raise HTTPException(
            status_code=503,
            detail={"status": "unhealthy"}
        )

@app.post("/v1/visualizer/query")
async def query_graph(payload: Dict[str, str] = Body(...)):
    """
    API endpoint to perform semantic search -> Cypher -> Neo4jVis or PyVis
    """
    if "input" not in payload:
        raise HTTPException(400, "input not provided.")
    input_txt = sanitize_input(payload["input"])

    if not input_txt:
        raise HTTPException(400, "input is empty after sanitization")

    try:
        cypher = await server.generate_cypher_query(input_txt)
        print(cypher)
        RELATIONSHIP_KEYWORDS = [
            "relationship",
            "relationships",
            "-[",
            "]->",
            "(:",
            "with",
            "attached to",
            "is related to",
            "follows",
            "depends on",
            "linked to",
            "and their",
            "belongs to",
            "connected to",
            "connected with",
            "connected by",
            "connected through",
            "connected via",
            "connected in",
            "connected from",
            "connected at",
            "connected on",
            "connected for",
            ""
        ]

        # Determine whether we should use Neo4jVis or PyVis
        # if any(keyword in input_txt.lower() for keyword in RELATIONSHIP_KEYWORDS):
        #     # Neo4jVis
        #     data = await server.generate_viz_data(cypher)
        #     print(data)

        # else:
        #     # PyVis
        #     data = await server.generate_pyvis_data(cypher)
        #     print(data)

        data = await server.generate_pyvis_data(cypher)
        # print(data)

        return {"status": "success", "query": cypher, "data": data}

    except Exception as e:
        raise HTTPException(500, str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)