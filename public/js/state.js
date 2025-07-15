// views.js
import { BuildLoginPage } from "/public/js/login.js";
import { BuildMainPage, CreatePostDOM, FetchPosts } from "/public/js/post.js";
import { FetchUsers, BuildProfile, openedChatId, RebuildMsgContainer, userOpened } from "/public/js/users.js";
import { InitCommentModal } from "/public/js/comment.js";

let worker = null;
let port = null;
// let userId

export function sendMessage(message) {
  worker.port.postMessage(message);
}

export async function renderHome() {
  document.body.innerHTML = ""; // Clear old page content

  const user = await checkIfLoggedIn();
  

  if (!user) {
    BuildLoginPage();
    return;
  }


  BuildMainPage();            // Layout
  FetchPosts();               // Load forum posts
  BuildProfile(user);         // Show user in navbar
  CreatePostDOM();            // Add post form
  FetchUsers();               // Sidebar user list
  InitCommentModal();         // init comment modal
  connectWebSocketSharedWorker();  // Real-time sync
}

async function checkIfLoggedIn() {
  try {
    const res = await fetch('/api/session', {
      method: 'POST',
      credentials: 'include'
    });

    if (res.ok) {
      const user = await res.json();
      return user;
    } else {
      if (res.status === 405) {
        BuildErrorPage(405, "This API does not accept GET requests.");
      }
      return null;
    }
  } catch (err) {
    BuildErrorPage(500, "Server error while checking session.");
    return null;
  }
}

function connectWebSocketSharedWorker() {
  try {
    if (worker && port) {
      console.warn("WebSocket SharedWorker already initialized.");
      return;
    }

    worker = new SharedWorker("/public/js/ws-worker.js");
    port = worker.port;
    port.start();

    console.log("[WS] SharedWorker initialized.");

    port.onmessage = (e) => {
      const message = e.data;
      if (!message || !message.type) return;

      switch (message.type) {
        case "online_users":
          console.log("[WS] Updating online users");
          FetchUsers(); // live update
          break;

        case "new_post":
          console.log("[WS] New post received");
          FetchPosts(); // refresh posts
          break;
        case "new_message":
          console.log("new message");
          
          if (openedChatId == message.data){
            RebuildMsgContainer(userOpened)
          } else {
            FetchUsers()
          }
        case "start_typing":
        case "stop_typing":
          console.log(message.type);
      }
    };

    port.onerror = (err) => {
      console.error("[WS] SharedWorker port error:", err);
    };

  } catch (error) {
    console.error("[WS] SharedWorker setup failed:", error);
  }
}
