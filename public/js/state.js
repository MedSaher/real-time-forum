import { CreatePostDOM, FetchPosts } from "/public/js/post.js";
import { FetchUsers, BuildProfile } from "/public/js/users.js";
let worker;
let port;
document.addEventListener("DOMContentLoaded", async () => {
  async function checkIfLoggedIn() {
    const res = await fetch('/api/session', {
      method: 'GET',
      credentials: 'include' // Include cookies
    });

    if (res.ok) {
      const user = await res.json();
      return user;
    } else {
      return null;
    }
  }

  FetchPosts()

  const user = await checkIfLoggedIn();


  if (!user) return;

  BuildProfile(user)


  connectWebSocketWithSharedWorker();


  CreatePostDOM();

  FetchUsers();


  function connectWebSocketWithSharedWorker() {
    try {
      if (worker && port) {
        console.warn("WebSocket SharedWorker already initialized.");
        return; // Prevent double initialization
      }

      // Initialize SharedWorker
      worker = new SharedWorker("/public/js/ws-worker.js");
      port = worker.port;

      // Start the port communication
      port.start();

      console.log("[WS] SharedWorker initialized.");

      // Handle incoming messages from the SharedWorker
      port.onmessage = (e) => {
        const message = e.data;

        if (!message || !message.type) return;

        switch (message.type) {
          case "online_users":
            console.log("[WS] Updating online users");
            FetchUsers();  // <== Every tab does this individually
            break;

          case "new_post":
            FetchPosts();
            break;
        }
      };


      port.onerror = (err) => {
        console.error("[WS] SharedWorker port error:", err);
      };

    } catch (error) {
      console.error("[WS] Failed to connect with SharedWorker:", error);
    }
  }



});

