const ports = [];
let ws = null;
let reconnectTimeout = null;

// Broadcast message to all connected ports
function broadcast(message, excludePort = null) {
  console.log("[Worker] Broadcasting:", message);
  ports.forEach((port) => {
    if (port !== excludePort) {
      try {
        port.postMessage(message);
      } catch (err) {
        console.error("[Worker] Error sending to port:", err);
      }
    }
  });
}

// Establish WebSocket connection
function connectWebSocket() {
  if (ws) {
    console.log("[Worker] Closing existing WebSocket...");
    ws.onopen = null;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
    ws.close();
  }

  console.log("[Worker] Connecting WebSocket...");
  ws = new WebSocket("ws://localhost:8080/ws");

  ws.onopen = () => {
    console.log("[Worker] WebSocket connected");
    broadcast({ type: "status", status: "connected" });
  };

  ws.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (err) {
      console.error("[Worker] Invalid JSON:", event.data);
      return;
    }
    broadcast(data);
  };

  ws.onclose = (event) => {
    console.warn(`[Worker] WebSocket closed (${event.code}). Reconnecting in 3s...`);
    broadcast({ type: "status", status: "disconnected" });
    reconnectTimeout = setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = (err) => {
    console.error("[Worker] WebSocket error:", err);
    if (ws) ws.close();
  };
}

// Handle new tab connection
onconnect = (e) => {
  const port = e.ports[0];
  ports.push(port);
  port.start();

  // Send current connection status
  port.postMessage({
    type: "status",
    status: ws && ws.readyState === WebSocket.OPEN ? "connected" : "disconnected",
  });

  port.onmessage = (event) => {
    const { type, ...payload } = event.data;

    switch (type) {
      case "login":
        connectWebSocket();
        break;

      case "logout":
        if (ws) ws.close();
        break;

      case "message":
      case "start_typing":
      case "stop_typing":
      case "typing":
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type, ...payload }));
        } else {
          console.warn("[Worker] Cannot send message, WebSocket not open");
        }
        break;

      case "read":
        broadcast(event.data); // Intra-tab communication
        break;

      default:
        console.warn("[Worker] Unknown message type:", type);
    }
  };

  port.onclose = () => {
    const idx = ports.indexOf(port);
    if (idx !== -1) ports.splice(idx, 1);
    console.log("[Worker] Tab closed, remaining ports:", ports.length);
  };

  port.onmessageerror = (err) => {
    console.error("[Worker] Port message error:", err);
  };

  // Initialize WebSocket if it's not already connected
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    connectWebSocket();
  }
};
