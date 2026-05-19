import { useEffect, useRef } from "react";

export const useWebSocket = (user, onMessageReceived) => {
    const wsRef = useRef(null);

    useEffect(() => {
        if (!user || !user.id || !user.role) return;

        let socket = null;
        let reconnectTimeout = null;

        const connect = () => {
            console.log("[WS] Connecting to WebSocket Server...");
            socket = new WebSocket("ws://localhost:8765");
            wsRef.current = socket;

            socket.onopen = () => {
                console.log("[WS] Connected successfully!");
                // Register the current user identity
                socket.send(JSON.stringify({
                    event: "register_client",
                    data: {
                        user_id: user.id,
                        role: user.role
                    }
                }));
            };

            socket.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    console.log("[WS] Event received:", payload.event, payload.data);
                    if (onMessageReceived) {
                        onMessageReceived(payload.event, payload.data);
                    }
                } catch (err) {
                    console.error("[WS] Error parsing message:", err);
                }
            };

            socket.onclose = () => {
                console.log("[WS] Connection closed. Attempting reconnect in 3s...");
                reconnectTimeout = setTimeout(connect, 3000);
            };

            socket.onerror = (err) => {
                console.error("[WS] Connection error:", err);
                socket.close();
            };
        };

        connect();

        return () => {
            if (socket) {
                socket.close();
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, [user?.id, user?.role]);

    const sendEvent = (event, data) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ event, data }));
        } else {
            console.warn("[WS] Socket not open. Cannot send event:", event);
        }
    };

    return { sendEvent };
};
