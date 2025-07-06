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

  const user = await checkIfLoggedIn();

  if (!user) return;

  connectWebSocket();

  const mainContent = document.querySelector(".main-content"); // or add id="main-content" and use getElementById
  if (!mainContent) {
    console.error("Main content not found");
    return;
  }

  // CREATE THE SECTION
  const createPost = document.createElement("div");
  createPost.className = "create-post";

  // HEADLINE
  const title = document.createElement("h3");
  const icon = document.createElement("i");
  icon.className = "fa-solid fa-pen-to-square";
  title.appendChild(icon);
  title.appendChild(document.createTextNode(" Create a Post"));

  // FORM
  const form = document.createElement("form");
  form.id = "post-form";

  const inputTitle = document.createElement("input");
  inputTitle.type = "text";
  inputTitle.id = "post-title";
  inputTitle.name = "title";
  inputTitle.placeholder = "Post Title";
  inputTitle.required = true;

  const select = document.createElement("select");
  select.id = "post-category";
  select.name = "category";
  select.required = true;

  const categories = ["Select a category", "General", "Development", "Security", "GoLang", "Projects"];
  categories.forEach((cat, index) => {
    const option = document.createElement("option");
    option.value = index === 0 ? "" : cat;
    option.textContent = cat;
    if (index === 0) {
      option.disabled = true;
      option.selected = true;
    }
    select.appendChild(option);
  });

  const contentArea = document.createElement("textarea");
  contentArea.id = "post-content";
  contentArea.name = "content";
  contentArea.placeholder = "What's on your mind?";
  contentArea.rows = 4;
  contentArea.required = true;

  const button = document.createElement("button");
  button.type = "submit";
  button.id = "add-post";
  const btnIcon = document.createElement("i");
  btnIcon.className = "fa-solid fa-paper-plane";
  button.appendChild(btnIcon);
  button.appendChild(document.createTextNode(" Post"));

  form.appendChild(inputTitle);
  form.appendChild(select);
  form.appendChild(contentArea);
  form.appendChild(button);

  createPost.appendChild(title);
  createPost.appendChild(form);

  mainContent.prepend(createPost);

  // Submit handler
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    createPostFunc();
  });
  function connectWebSocket() {
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = () => {
        console.log("WebSocket connected");
        // You can now send or receive messages
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received WS message:", data);
    };

    socket.onerror = (err) => {
        console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
        console.log("WebSocket closed");
    };
}

});

async function createPostFunc() {
  try {

    const title = document.getElementById("post-title").value.trim()
    const content = document.getElementById("post-content").value.trim()
    const category = document.getElementById("post-category").value.trim()
    const response = await fetch("/api/add_post", {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        title: title,
        content: content,
        categories: category,
      })
    })
    if (response.ok) {
    } else {
      alert("not good")
    }
  } catch (error) {
    alert("big not good")
  }
}