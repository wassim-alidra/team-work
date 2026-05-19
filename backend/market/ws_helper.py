import json
import threading
import asyncio
import websockets

def broadcast_ws_event(event, data, target_role=None, target_user_id=None):
    """
    Broadcasts an event to the standalone Python WebSocket server.
    Runs asynchronously in a separate thread so it never blocks Django's main request-response cycle.
    """
    async def send():
        uri = "ws://localhost:8765"
        try:
            async with websockets.connect(uri) as websocket:
                message = {
                    "event": "broadcast_event",
                    "data": {
                        "event": event,
                        "data": data,
                        "target_role": target_role,
                        "target_user_id": target_user_id
                    }
                }
                await websocket.send(json.dumps(message))
        except Exception as e:
            # Silent fallback if the WS server is down or not started
            print(f"[WebSocket Broadcast Failed] {e}")

    # Launch in a background thread to prevent Django view blockages
    thread = threading.Thread(target=lambda: asyncio.run(send()))
    thread.daemon = True
    thread.start()
