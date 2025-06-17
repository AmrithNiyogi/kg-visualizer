
import aiohttp
import logging
from neo4j import GraphDatabase

logger = logging.getLogger(__name__)

URI = f"{settings.NEO4J_URL}/db/{settings.NEO4J_DB}/tx/commit"

session = None

async def start_session():
    global session
    auth = aiohttp.BasicAuth(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
    session = aiohttp.ClientSession(auth=auth)

async def send_request(cypher):
        global session
        query = {"statements": [{"statement": cypher}]}
        if session is None:
            await start_session()
        try:
            async with session.post(URI, json=query) as response:
                return await response.json()
        except aiohttp.ClientError as e:
            print("error:",e)
            return None

async def execute_cypher(cypher, parameters=None):
    """
    Execute a Cypher query with optional parameters.
    """
    if parameters is None:
        parameters = {}
    response = await send_request_with_params(cypher, parameters)
    if response:
        return await process_response(response)
    else:
        return {'status': 'Connection Error', 'response': 'No response due to connection failure.'}

async def process_response(response):
    """
    Process the response from the Neo4j database.
    """
    try:
        # Ensure the response structure is as expected
        if 'results' in response and len(response['results']) > 0 and 'data' in response['results'][0]:
            result = []
            for data in response['results'][0]['data']:
                row = data['row'][0]
                if isinstance(row, dict) and 'embedding' in row:
                    row.pop('embedding')  # Remove the embedding field
                result.append(row)
            return result
        else:
            logger.error(f"Unexpected response structure: {response}")
            return {"details": response}
    except (KeyError, TypeError, IndexError) as e:
        logger.error(f"Error processing response: {e}, Response: {response}")
        return {"details": str(e)}

async def send_request_with_params(cypher, parameters):
    """
    Send a Cypher query with parameters to the Neo4j database.
    """
    global session
    query = {"statements": [{"statement": cypher, "parameters": parameters}]}
    if session is None:
        await start_session()
    try:
        async with session.post(URI, json=query) as response:
            response_data = await response.json()
            return await process_response(response_data)
    except aiohttp.ClientError as e:
        logger.error(f"Neo4j connection error: {e}")
        return None