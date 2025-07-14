import { BuildErrorPage } from "/public/js/post.js";
import { sendMessage } from "/public/js/state.js";
let messageOffset = 0;
let loadingOldMessages = false;
let allMessagesLoaded = false;
export let openedChatId
export let userOpened
let isTyping = false
let time_out

export async function FetchUsers() {
  try {
    const [usersResponse, notificationsResponse] = await Promise.all([
      fetch("/api/users", {
        method: "POST",
        credentials: "include",
      }),
      fetchUnreadNotifications().catch(() => []) // Return empty array if fails
    ]);

    if (usersResponse.ok) {
      const users = await usersResponse.json();
      
      // Ensure notificationsResponse is an array before filtering
      const notifications = Array.isArray(notificationsResponse) ? notificationsResponse : [];

      // Add unread counts to each user
      const usersWithUnreadCounts = users.map(user => ({
        ...user,
        unreadCount: notifications.filter(n =>
          n.SenderId === user.UserId && !n.is_read
        ).length
      }));
      renderUserList(usersWithUnreadCounts);
    } else {
      console.log("Something went wrong fetching users.");
    }
  } catch (error) {
    console.log("Network error or server failure.", error);
    // Render users without notification counts if there's an error
    const usersResponse = await fetch("/api/users", {
      method: "POST",
      credentials: "include",
    });
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      const usersWithUnreadCounts = users.map(user => ({
        ...user,
        unreadCount: 0 // Default to 0 if we can't get notifications
      }));
      renderUserList(usersWithUnreadCounts);
    }
  }
}

function renderUserList(users) {
  
  const userList = document.querySelector(".user-list");
  userList.innerHTML = ""; // Clear existing content

  users.forEach(user => {
    const li = document.createElement("li");

    // Create the icon + name container
    const userInfo = document.createElement("div");
    userInfo.className = "users-info";
    userInfo.style.cursor = "pointer";
    userInfo.style.display = "flex";
    userInfo.style.alignItems = "center";
    userInfo.style.gap = "8px";

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-circle-user";

    const name = document.createElement("span");
    name.textContent = user.Nickname;

    // Create unread count badge
    if (user.unreadCount > 0) {
      const unreadBadge = document.createElement("span");
      unreadBadge.className = "unread-badge";
      unreadBadge.textContent = user.unreadCount;
      unreadBadge.style.backgroundColor = "#4a90e2";
      unreadBadge.style.color = "white";
      unreadBadge.style.borderRadius = "50%";
      unreadBadge.style.fontSize = "12px";
      unreadBadge.style.width = "25px";
      unreadBadge.style.height = "25px";
      unreadBadge.style.display = "flex";
      unreadBadge.style.alignItems = "center";
      unreadBadge.style.justifyContent = "center";
      userInfo.appendChild(unreadBadge);
    }

    userInfo.appendChild(icon);
    userInfo.appendChild(name);

    // Create the status dot
    const statusDot = document.createElement("span");
    statusDot.className = `status-dot ${user.Status ? "status-online" : "status-offline"}`;
    statusDot.title = user.Status ? "Online" : "Offline";

    // Assemble the <li>
    li.appendChild(userInfo);
    li.appendChild(statusDot);

    // Add click listener to open chat box
    li.addEventListener("click", () => {
      openedChatId = user.UserId;
      openChatBox(user);
      // Here you would typically mark messages as read
    });

    userList.appendChild(li);
  });
}

export async function BuildProfile(user) {

  const nickname = document.getElementById("nickname");
  const actionBtn = document.getElementById("authenticate");
  nickname.innerHTML = `<i class="fa-solid fa-user"></i> ${user.nickname}`

  actionBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`
  actionBtn.href = ""
  actionBtn.addEventListener("click", async () => {
    const response = await fetch("/api/logout", {
      method: "post",
      headers: {
        "credntials": "include"
      },
    })
    if (response.ok) {
      window.location.href = "/"

    } else {
      console.log(response.body);
    }
  })
}

async function fetchChatHistory(userId, offset = 0, limit = 10) {
  try {
    const response = await fetch(`/api/get_history?user_id=${userId}&offset=${offset}&limit=${limit}`, {
      method: "GET",
      credentials: "include" // to send cookies like session_token
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chat history: ${response.status}`);
    }

    const messages = await response.json();
    return messages;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}

function renderMessages(messages, chatMessagesContainer, user, { prepend = false } = {}) {
  // Clear existing messages if we're not prepending (initial load or rebuild)
  if (!prepend) {
    chatMessagesContainer.innerHTML = "";
  }

  // Always sort by ID ascending for consistent order
  messages.sort((a, b) => a.id - b.id);

  if (prepend){
    messages.sort((a, b) => b.id - a.id);
  }
  

  messages.forEach(msg => {
    const isSentByGuestUser = msg.SenderId === user.UserId;

    // Create message wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper";
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = isSentByGuestUser ? "flex-start" : "flex-end";
    wrapper.style.margin = "6px 0";
    wrapper.dataset.messageId = msg.id;

    // Create message bubble
    const msgBubble = document.createElement("div");
    msgBubble.className = "msg-bubble";
    msgBubble.style.backgroundColor = isSentByGuestUser ? "#ffffff" : "#dcf8c6";
    msgBubble.style.color = "#333";
    msgBubble.style.padding = "10px 14px";
    msgBubble.style.borderRadius = "12px";
    msgBubble.style.maxWidth = "70%";
    msgBubble.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
    msgBubble.style.wordWrap = "break-word";

    // Sender and content
    msgBubble.innerHTML = `
      <div style="font-weight: bold; font-size: 13px; color: #444;">${isSentByGuestUser ? user.Nickname : "You"}</div>
      <div style="margin-top: 4px; font-size: 14px;">${msg.content}</div>
    `;

    // Create timestamp
    const timeElem = document.createElement("div");
    timeElem.className = "msg-time";
    const date = new Date(msg.created_at);
    const formattedTime = date.toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    timeElem.textContent = formattedTime;
    timeElem.style.fontSize = "11px";
    timeElem.style.color = "#888";
    timeElem.style.marginTop = "4px";

    // Assemble message
    wrapper.appendChild(msgBubble);
    wrapper.appendChild(timeElem);

    // Append or prepend to chat container
    if (prepend) {
      chatMessagesContainer.prepend(wrapper);
    } else {
      chatMessagesContainer.appendChild(wrapper);
    }
  });
  FetchUsers();
}

function handle_typing() {
  let input_field = document.getElementById("chat-input");
  input_field.addEventListener("input", () => {
    if (!userOpened) {
      return;
    }

    if (!isTyping) {
      sendMessage({
        type: "start_typing",
        receiver: userOpened, 
        content: "typing_status",
      });
      isTyping = true;
    }

    clearTimeout(time_out);

    time_out = setTimeout(() => {
      if (isTyping) {
        sendMessage({
          type: "stop_typing",
          receiver: userOpened, 
          content: "typing_status",
        });
        isTyping = false;
      }
    }, 1500);
  });
}


export async function openChatBox(user) {
  userOpened = user;
  messageOffset = 0; // Reset offset
  allMessagesLoaded = false; // Reset loaded flag
  loadingOldMessages = false; // Reset loading flag

  // Remove any existing chat box
  const existingChat = document.querySelector(".chat-box");
  if (existingChat) {
    messageOffset = 0
    existingChat.remove()
  };

  markAsRead(user);
  FetchUsers();

  // Create chat container (your existing code) ...
  const chatBox = document.createElement("div");
  chatBox.className = "chat-box";
  chatBox.style.position = "fixed";
  chatBox.style.bottom = "20px";
  chatBox.style.right = "20px";
  chatBox.style.width = "320px";
  chatBox.style.height = "480px";
  chatBox.style.background = "#fff";
  chatBox.style.borderRadius = "10px";
  chatBox.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.2)";
  chatBox.style.display = "flex";
  chatBox.style.flexDirection = "column";
  chatBox.style.overflow = "hidden";
  chatBox.style.fontFamily = "sans-serif";
  chatBox.style.zIndex = "1000";

  // Chat header (your existing code) ...
  const chatHeader = document.createElement("div");
  chatHeader.className = "chat-header";
  chatHeader.style.backgroundColor = "var(--primary, #4a90e2)";
  chatHeader.style.color = "white";
  chatHeader.style.padding = "12px 16px";
  chatHeader.style.fontWeight = "bold";
  chatHeader.style.position = "relative";

  const title = document.createElement("span");
  title.innerHTML = `<i class="fa-solid fa-comment-dots"></i> Chat with ${user.Nickname}`;

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
  closeBtn.title = "Close chat";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "10px";
  closeBtn.style.right = "12px";
  closeBtn.style.fontSize = "24px";
  closeBtn.style.background = "none";
  closeBtn.style.border = "none";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.color = "white";
  closeBtn.onclick = () => {
    chatBox.remove();
    openedChatId = 0; // Reset the openedChatId when closing the chat
  };

  chatHeader.appendChild(title);
  chatHeader.appendChild(closeBtn);

  const chatMessages = document.createElement("div");
  chatMessages.className = "chat-messages";
  chatMessages.style.padding = "10px 16px";
  chatMessages.style.height = "180px";
  chatMessages.style.overflowY = "auto";
  chatMessages.style.backgroundColor = "#fafafa";
  chatMessages.style.borderTop = "1px solid #eee";
  chatMessages.style.borderBottom = "1px solid #eee";

  // Initial load
  const messages = await fetchChatHistory(user.UserId, messageOffset, 10);
  messageOffset += messages.length;
  renderMessages(messages, chatMessages, user);

  // Scroll to bottom initially
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  const throttledScrollHandler = throttle(async function () {
    if (chatMessages.scrollTop === 0 && !loadingOldMessages && !allMessagesLoaded) {
      loadingOldMessages = true;

      const previousHeight = chatMessages.scrollHeight;

      const moreMessages = await fetchChatHistory(user.UserId, messageOffset, 10);



      if (moreMessages.length === 0) {
        allMessagesLoaded = true;
        return;
      }

      messageOffset += moreMessages.length;
      renderMessages(moreMessages, chatMessages, user, { prepend: true });

      // Maintain scroll position
      requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight - previousHeight;
      });

      loadingOldMessages = false;
    }
  }, 400);

  chatMessages.addEventListener("scroll", throttledScrollHandler);



  const chatInput = document.createElement("div");
  chatInput.id = "chat-input"
  chatInput.className = "chat-input";
  chatInput.style.display = "flex";
  chatInput.style.padding = "10px";
  chatInput.style.gap = "6px";
  chatInput.style.background = "#fff";

  const chatInputField = document.createElement("input");
  chatInputField.id = "chatInput"
  chatInputField.type = "text";
  chatInputField.placeholder = "Type a message...";
  chatInputField.style.flex = "1";
  chatInputField.style.padding = "8px 10px";
  chatInputField.style.border = "1px solid #ccc";
  chatInputField.style.borderRadius = "6px";
  chatInputField.style.fontSize = "14px";

  const chatSendBtn = document.createElement("button");
  chatSendBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i>`;
  chatSendBtn.style.backgroundColor = "var(--primary, #4a90e2)";
  chatSendBtn.style.color = "white";
  chatSendBtn.style.border = "none";
  chatSendBtn.style.padding = "8px 12px";
  chatSendBtn.style.borderRadius = "6px";
  chatSendBtn.style.cursor = "pointer";
  chatSendBtn.style.fontSize = "14px";

  chatSendBtn.addEventListener("click", SendMsg)

  
  // You can add your sending message handler here if needed
  
  chatInput.append(chatInputField, chatSendBtn);
  
  // Assemble chat box
  chatBox.append(chatHeader, chatMessages, chatInput);
  document.body.appendChild(chatBox);
  handle_typing();
}

function throttle(fn, limit) {
  let inThrottle = false;
  let lastArgs = null;

  return async function throttled(...args) {
    if (inThrottle) {
      lastArgs = args; // Save latest args to run after throttle period
      return;
    }

    inThrottle = true;
    await fn.apply(this, args);

    setTimeout(async () => {
      inThrottle = false;
      if (lastArgs) {
        await throttled.apply(this, lastArgs);
        lastArgs = null;
      }
    }, limit);
  };
}

export async function RebuildMsgContainer(user) {
  const chatMessages = document.querySelector(".chat-messages"); // Added dot before class name

  userOpened = user;
  messageOffset = 0; // Reset offset
  allMessagesLoaded = false; // Reset loaded flag
  loadingOldMessages = false; // Reset loading flag

  if (!chatMessages) return; // Add a check to prevent errors if element doesn't exist

    markAsRead(user);

  // Initial load
  messageOffset = 0;
  const messages = await fetchChatHistory(user.UserId, messageOffset, 10);
  messageOffset += messages.length;
  

  renderMessages(messages, chatMessages, user);

  // Rest of the function remains the same...
  // Scroll to bottom initially
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  const throttledScrollHandler = throttle(async function () {
  if (chatMessages.scrollTop === 0 && !loadingOldMessages && !allMessagesLoaded) {
    loadingOldMessages = true;

    const previousHeight = chatMessages.scrollHeight;

    const moreMessages = await fetchChatHistory(user.UserId, messageOffset, 10);

    if (moreMessages.length === 0) {
      allMessagesLoaded = true;
      loadingOldMessages = false;
      return;
    }

    // Check if we already have these messages
    const existingIds = Array.from(chatMessages.querySelectorAll('.msg-wrapper'))
      .map(el => el.dataset.messageId);
    const newMessages = moreMessages.filter(msg => 
      !existingIds.includes(String(msg.id))
    );

    if (newMessages.length === 0) {
      allMessagesLoaded = true;
      loadingOldMessages = false;
      return;
    }

    messageOffset += newMessages.length;
    renderMessages(newMessages, chatMessages, user, { prepend: true });

    // Maintain scroll position
    requestAnimationFrame(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight - previousHeight;
    });

    loadingOldMessages = false;
  }
}, 400);
  chatMessages.addEventListener("scroll", throttledScrollHandler);
}

export async function SendMsg() {
  try {
    const msgContent = document.getElementById("chatInput").value.trim()
    console.log("user : ", userOpened.UserId);

    const response = await fetch("/api/send_message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "credentials": "include",
      },
      body: JSON.stringify({
        content: msgContent,
        receiver_id: String(userOpened.UserId)
      }),
    })
    if (!response.ok) {
      BuildErrorPage(500, "Can't connect to server")
    }
    document.getElementById("chatInput").value = "";
    RebuildMsgContainer(userOpened)

  } catch (error) {
    console.log("error", error);
    BuildErrorPage(500, "Can't connect to server")
  }

}

export async function FetchNotifications(user) {
  try {

  } catch (error) {

  }
}

export async function fetchUnreadNotifications() {
  try {
    const response = await fetch("/api/get_notifs", {
      method: "POST",
      credentials: "include"
    });

    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : []; // Ensure we always return an array
    }
    return [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return []; // Return empty array on error
  }
}

async function markAsRead(user) {
  try {
    const response = await fetch(`/api/mark_read?from_id=${user.UserId}`, {
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) {
      BuildErrorPage(500, "Internal Server Error")
    }
  } catch (error) {
    BuildErrorPage(500, "Internal Server Error")
    console.error("Error marking messages as read:", error);
  }
}