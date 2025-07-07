let socket;

onconnect = function (e) {
  const port = e.ports[0];

  if (!socket) {
    socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      port.postMessage(data); // Broadcast to connected page
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };
  }

  port.onmessage = (event) => {
    // You can optionally send data from page to WS
    // socket.send(JSON.stringify(event.data));
  };
};
