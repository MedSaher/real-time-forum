import { CreatePostDOM, FetchPosts } from "/public/js/post.js";
import { FetchUsers } from "/public/js/users.js";
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


  connectWebSocketWithSharedWorker();


  CreatePostDOM();
  

  function connectWebSocketWithSharedWorker() {
    worker = new SharedWorker("/public/js/ws-worker.js");
    port = worker.port;
    port.start();

    port.onmessage = (e) => {
      const message = e.data;

      if (message.type === "new_post") {
        const post = message.data;
        FetchPosts();
      } else if (message.type === "online_users") {
        FetchUsers();
      }
    };
  }


});

