// File: public/js/createPost.js

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
      alert("Post submission failed");
    }
  } catch (error) {
    alert("Unexpected error occurred");
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
      console.error("Failed to fetch posts.");
      return;
    }

    const posts = await response.json();

    if (posts.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.textContent = "No posts yet.";
      mainContent.appendChild(emptyMsg);
      return;
    }

    posts.forEach((post) => {
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

      // Like span
      const likeSpan = document.createElement("span");
      likeSpan.className = "like";
      const likeIcon = document.createElement("i");
      likeIcon.className = "fa-solid fa-thumbs-up";
      likeSpan.appendChild(likeIcon);
      likeSpan.appendChild(document.createTextNode(` ${post.likeCount}`));

      // Dislike span
      const dislikeSpan = document.createElement("span");
      dislikeSpan.className = "dislike";
      const dislikeIcon = document.createElement("i");
      dislikeIcon.className = "fa-solid fa-thumbs-down";
      dislikeSpan.appendChild(dislikeIcon);
      dislikeSpan.appendChild(document.createTextNode(` ${post.dislikeCount}`));

      // Comment span
      const commentSpan = document.createElement("span");
      commentSpan.className = "comment";
      const commentIcon = document.createElement("i");
      commentIcon.className = "fa-solid fa-comment";
      commentSpan.appendChild(commentIcon);


      // Append all spans to reactions container
      reactions.appendChild(likeSpan);
      reactions.appendChild(dislikeSpan);
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
    console.error("An error occurred while fetching posts:", error);
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