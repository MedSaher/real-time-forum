export async function FetchUsers() {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      credentials: "include", // Correct placement of credentials
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data); // You can remove this in production
      renderUserList(data); // Update the DOM
    } else {
      console.log("Something went wrong fetching users.");
    }
  } catch (error) {
    console.log("Network error or server failure.");
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

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-circle-user";

    const name = document.createTextNode(user.Nickname);

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
    userInfo.addEventListener("click", () => {
      openChatBox(user);
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

function renderMessages(messages, chatMessagesContainer, user) {
  chatMessagesContainer.innerHTML = ""; // Clear previous messages

  messages.reverse().forEach(msg => {
    const msgElem = document.createElement("p");
    

    // Style differently depending on sender (assuming currentUserId is your user ID)
    const isSentByGuesttUser = msg.SenderId === user.UserId;

    console.log(user.UserId);
    

    msgElem.innerHTML = `<strong>${isSentByGuesttUser ? user.Nickname : "You"}:</strong> ${msg.content}`;
    msgElem.style.textAlign = isSentByGuesttUser ? "right" : "left";
    msgElem.style.background = isSentByGuesttUser ? "#dcf8c6" : "#fff";
    msgElem.style.padding = "6px 10px";
    msgElem.style.borderRadius = "10px";
    msgElem.style.margin = "4px 0";
    msgElem.style.maxWidth = "70%";
    msgElem.style.marginLeft = isSentByGuesttUser ? "auto" : "0";
    msgElem.style.marginRight = isSentByGuesttUser ? "0" : "auto";

    chatMessagesContainer.appendChild(msgElem);
  });

  // Scroll to bottom so latest messages are visible
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

async function openChatBox(user) {
  console.log("fucking user ", user);
  
  // Remove any existing chat box
  const existingChat = document.querySelector(".chat-box");
  if (existingChat) existingChat.remove();

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
  closeBtn.onclick = () => chatBox.remove();

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

  // Fetch and render messages here:
  const messages = await fetchChatHistory(user.UserId, 0, 10);
  renderMessages(messages, chatMessages, user);

  const chatInput = document.createElement("div");
  chatInput.className = "chat-input";
  chatInput.style.display = "flex";
  chatInput.style.padding = "10px";
  chatInput.style.gap = "6px";
  chatInput.style.background = "#fff";

  const chatInputField = document.createElement("input");
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

  // You can add your sending message handler here if needed

  chatInput.append(chatInputField, chatSendBtn);

  // Assemble chat box
  chatBox.append(chatHeader, chatMessages, chatInput);
  document.body.appendChild(chatBox);
}
