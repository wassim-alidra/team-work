import asyncio
import json
import logging
import websockets

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Global dict of active connections: { websocket: {"user_id": ..., "role": ...} }
CONNECTIONS = {}

async def register(websocket):
    CONNECTIONS[websocket] = {"user_id": None, "role": None}
    logging.info(f"New client connected from {websocket.remote_address}")

async def unregister(websocket):
    if websocket in CONNECTIONS:
        del CONNECTIONS[websocket]
        logging.info(f"Client disconnected: {websocket.remote_address}")

async def broadcast(message_dict, sender_ws=None):
    """
    Broadcast a message to matching clients based on role or user_id target if specified.
    """
    payload = json.dumps(message_dict)
    target_role = message_dict.get("target_role")
    target_user_id = message_dict.get("target_user_id")

    # Clean target parameters from the payload sent to clients
    client_payload = json.dumps({
        "event": message_dict.get("event"),
        "data": message_dict.get("data")
    })

    closed_sockets = []
    for ws, client_info in CONNECTIONS.items():
        if ws == sender_ws:
            continue
        
        # Filter by role or user_id if specified
        if target_role and client_info.get("role") != target_role:
            continue
        if target_user_id and str(client_info.get("user_id")) != str(target_user_id):
            continue

        try:
            await ws.send(client_payload)
        except websockets.exceptions.ConnectionClosed:
            closed_sockets.append(ws)

    for ws in closed_sockets:
        await unregister(ws)

async def handler(websocket):
    await register(websocket)
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                event = data.get("event")
                payload = data.get("data", {})

                logging.info(f"Received event '{event}' with payload: {payload}")

                if event == "register_client":
                    # Register user identity
                    CONNECTIONS[websocket]["user_id"] = payload.get("user_id")
                    CONNECTIONS[websocket]["role"] = payload.get("role")
                    logging.info(f"Client {websocket.remote_address} registered as {payload.get('role')} (ID: {payload.get('user_id')})")
                    await websocket.send(json.dumps({
                        "event": "registered",
                        "data": {"status": "success", "message": f"Successfully registered as {payload.get('role')}"}
                    }))

                elif event == "broadcast_event":
                    # Broadcast event triggered by Django backend or admin
                    await broadcast(payload, sender_ws=websocket)

            except json.JSONDecodeError:
                logging.warning(f"Malformed JSON received from {websocket.remote_address}: {message}")
            except Exception as e:
                logging.error(f"Error handling message: {e}")
    except websockets.exceptions.ConnectionClosedOK:
        pass
    finally:
        await unregister(websocket)

async def main():
    # Allow connections from any origin
    async with websockets.serve(handler, "0.0.0.0", 8765):
        logging.info("WebSocket Server running on ws://0.0.0.0:8765")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
