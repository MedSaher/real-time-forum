import {ShowCommentModal} from "/public/js/comment.js";

export async function createPostFunc() {
  try {
    const form = document.getElementById("post-form");
    const title = document.getElementById("post-title").value.trim();
    const content = document.getElementById("post-content").value.trim();
    const category = document.getElementById("post-category").value.trim();

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
    });

    if (response.ok) {
      form.reset();
    } else {
      window.location.href = "/"
    }
  } catch (error) {
    BuildErrorPage(500, "Cannot connect to server.");
  }
}

export async function FetchPosts() {
  try {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) {
      console.error("Main content element not found.");
      return;
    }

    const existingPosts = mainContent.querySelectorAll(".post");
    existingPosts.forEach(post => post.remove());


    const response = await fetch("/api/fetch_posts", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      BuildErrorPage(401, "Unauthorized access");
      return;
    }
    
    const posts = await response.json();
    console.log(posts);
    
    if (posts === null) {
      const emptyMsg = document.createElement("p");
      emptyMsg.textContent = "No posts yet.";
      mainContent.appendChild(emptyMsg);
      return;
    }
    
    posts.forEach((post) => {
      // console.log(post.id);
      
      const postDiv = document.createElement("div");
      postDiv.className = "post";

      // Post title
      const postTitle = document.createElement("h3");
      postTitle.className = "post-title";
      postTitle.textContent = post.title;

      // Author name
      const author = document.createElement("p");
      author.className = "post-author";
      author.textContent = `By ${post.nickname} (${post.authorFirstName} ${post.authorLastName})`;

      // Timestamp
      const time = document.createElement("span");
      time.className = "post-timestamp";
      const ts = new Date(post.time);
      time.textContent = ts.toLocaleString();

      // Post content
      const content = document.createElement("p");
      content.className = "post-content";
      content.textContent = post.content;

      // Categories
      const category = document.createElement("div");
      category.className = "post-category";
      category.textContent = post.category_name || "Uncategorized";

      // Like span
      const reactions = document.createElement("div");
      reactions.className = "post-reactions";

      // Comment span
      const commentSpan = document.createElement("span");
      commentSpan.className = "comment";
      const commentIcon = document.createElement("i");
      commentIcon.className = "fa-solid fa-comment";
      commentSpan.appendChild(commentIcon);

      commentIcon.addEventListener("click", () => {
        ShowCommentModal(post);
      });


      // Append all spans to reactions container
      reactions.appendChild(commentSpan);


      postDiv.appendChild(postTitle);
      postDiv.appendChild(author);
      postDiv.appendChild(time);
      postDiv.appendChild(category);
      postDiv.appendChild(content);
      postDiv.appendChild(reactions);

      mainContent.appendChild(postDiv);
    });
  } catch (error) {
    console.log("fucking shit")
    BuildErrorPage(500, "Cannot connect to server.");
  }
}



export async function CreatePostDOM() {
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
}

export function BuildMainPage() {
  const body = document.body;

  const links = document.querySelectorAll('link[rel="stylesheet"]');
  for (const link of links) {
    if (link.href.includes("register.css")) {
      link.parentNode.removeChild(link);
    }
  }

  // ===== NAVBAR =====
  const navbar = document.createElement("div");
  navbar.className = "navbar";

  const brand = document.createElement("div");
  brand.className = "brand";
  brand.innerHTML = `<i class="fa-solid fa-comments"></i> Weroom`;

  const userInfo = document.createElement("div");
  userInfo.className = "user-info";

  const nickname = document.createElement("span");
  nickname.id = "nickname";

  const authLink = document.createElement("a");
  authLink.href = "/auth";
  authLink.id = "authenticate";
  authLink.className = "navbar-button";
  authLink.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Login`;

  userInfo.append(nickname, authLink);
  navbar.append(brand, userInfo);
  body.appendChild(navbar);

  // ===== LAYOUT WRAPPER (wraps sidebar + main-content) =====
  const layout = document.createElement("div");
  layout.className = "layout";

  // ===== SIDEBAR =====
  const sidebar = document.createElement("div");
  sidebar.className = "sidebar";

  const sidebarTitle = document.createElement("h3");
  sidebarTitle.textContent = "Users";

  const userList = document.createElement("ul");
  userList.className = "user-list";

  sidebar.append(sidebarTitle, userList);

  // ===== MAIN CONTENT =====
  const mainContent = document.createElement("div");
  mainContent.className = "main-content";
  mainContent.id = "main-content";
  // You can add placeholder if you want
  mainContent.innerHTML = "<!-- Data will be filled here incha'allah -->";

  layout.append(sidebar, mainContent);
  body.appendChild(layout); // Append layout after navbar
}


export function BuildErrorPage(code = 404, message = "Page Not Found") {
  // 1. Clear the body
  document.body.innerHTML = "";

  // 2. Set background color manually if CSS is not loaded
  document.body.style.backgroundColor = "var(--light)";
  document.body.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  document.body.style.margin = "0";

  // 3. Create container
  const container = document.createElement("div");
  container.style.height = "100vh";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.textAlign = "center";
  container.style.padding = "40px";

  // 4. Error Icon
  const icon = document.createElement("div");
  icon.innerHTML = "🚫";
  icon.style.fontSize = "80px";
  icon.style.marginBottom = "20px";

  // 5. Error Code
  const codeEl = document.createElement("h1");
  codeEl.textContent = `${code} Error`;
  codeEl.style.color = "var(--primary)";
  codeEl.style.fontSize = "36px";
  codeEl.style.margin = "0";

  // 6. Message
  const msg = document.createElement("p");
  msg.textContent = message || "Something went wrong.";
  msg.style.color = "#333";
  msg.style.margin = "16px 0";
  msg.style.fontSize = "18px";

  // 7. Home Button
  const button = document.createElement("a");
  button.href = "/";
  button.textContent = "Go back to home";
  button.style.padding = "10px 16px";
  button.style.borderRadius = "6px";
  button.style.backgroundColor = "var(--primary)";
  button.style.color = "white";
  button.style.textDecoration = "none";
  button.style.marginTop = "12px";
  button.style.fontWeight = "600";
  button.style.transition = "background-color 0.3s ease";
  button.onmouseenter = () => button.style.backgroundColor = "#7a372b";
  button.onmouseleave = () => button.style.backgroundColor = "var(--primary)";

  // 8. Assemble
  container.append(icon, codeEl, msg, button);
  document.body.appendChild(container);
}

