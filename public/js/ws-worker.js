let socket;
const ports = [];

onconnect = function (e) {
  const port = e.ports[0];
  ports.push(port);

  port.start(); // Important to allow postMessage to work properly

  port.onmessage = (event) => {
    // Handle messages sent from tab to worker
    // Example: socket.send(JSON.stringify(event.data))let socket;

onconnect = function (e) {
    const port = e.ports[0];

    if (!socket) {
        socket = new WebSocket("ws://localhost:8080/ws");

        socket.onopen = () => {
            console.log("WebSocket connected");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);


            // Broadcast to all connected ports
            ports.forEach(p => {
                try {
                    p.postMessage(data);
                } catch (err) {
                    console.error("Failed to send to a port:", err);
                }
            });
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

  };

  if (!socket) {
    socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Broadcast to all connected ports
      ports.forEach(p => {
        try {
          p.postMessage(data);
        } catch (err) {
          console.error("Failed to send to a port:", err);
        }
      });
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };
  }
};
