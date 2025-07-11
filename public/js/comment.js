import { BuildErrorPage } from "/public/js/post.js";

export function InitCommentModal() {
  const modal = document.createElement("div");
  modal.id = "comment-modal";
  modal.classList.add("modal");
  modal.style.display = "none";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.5)";
  modal.style.display = "none";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "9999";

  const content = document.createElement("div");
  content.classList.add("modal-content");
  content.style.background = "white";
  content.style.borderRadius = "10px";
  content.style.padding = "20px";
  content.style.maxWidth = "600px";
  content.style.width = "90%";
  content.style.position = "relative";
  content.style.maxHeight = "80vh";
  content.style.overflow = "hidden";
  content.style.display = "flex";
  content.style.flexDirection = "column";

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "10px";
  closeBtn.style.right = "12px";
  closeBtn.style.fontSize = "24px";
  closeBtn.style.background = "none";
  closeBtn.style.border = "none";
  closeBtn.style.cursor = "pointer";
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  const title = document.createElement("h2");
  title.id = "modal-post-title";

  const author = document.createElement("small");
  author.id = "modal-post-author";
  author.style.display = "block";
  author.style.marginBottom = "10px";
  author.style.color = "#777";

  const body = document.createElement("p");
  body.id = "modal-post-content";
  body.style.marginTop = "8px";

  // Create comments container
  const commentsContainer = document.createElement("div");
  commentsContainer.id = "comments-container";
  commentsContainer.style.flex = "1";
  commentsContainer.style.overflowY = "auto";
  commentsContainer.style.margin = "10px 0";
  commentsContainer.style.padding = "5px";
  commentsContainer.style.borderTop = "1px solid #eee";
  commentsContainer.style.borderBottom = "1px solid #eee";

  const textarea = document.createElement("textarea");
  textarea.id = "comment-textarea";
  textarea.placeholder = "Write a comment...";
  textarea.rows = 4;
  textarea.style.width = "100%";
  textarea.style.padding = "10px";
  textarea.style.marginTop = "14px";
  textarea.style.borderRadius = "6px";
  textarea.style.border = "1px solid #ccc";

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "Send Comment";
  sendBtn.id = "submit-comment";
  sendBtn.style.marginTop = "12px";
  sendBtn.style.backgroundColor = "var(--primary)";
  sendBtn.style.color = "white";
  sendBtn.style.border = "none";
  sendBtn.style.padding = "8px 14px";
  sendBtn.style.borderRadius = "6px";
  sendBtn.style.cursor = "pointer";

  // Build hierarchy - IMPORTANT: Add commentsContainer before textarea
  content.appendChild(closeBtn);
  content.appendChild(title);
  content.appendChild(author);
  content.appendChild(body);
  content.appendChild(commentsContainer); // Add this line
  content.appendChild(textarea);
  content.appendChild(sendBtn);

  modal.appendChild(content);
  document.body.appendChild(modal);
}

export function ShowCommentModal(post) {
    
  const modal = document.getElementById("comment-modal");
  if (!modal) return console.error("Comment modal not initialized");
  

  const titleEl = modal.querySelector("#modal-post-title");
  const authorEl = modal.querySelector("#modal-post-author");
  const bodyEl = modal.querySelector("#modal-post-content");
  const textarea = modal.querySelector("#comment-textarea");
  const sendBtn = modal.querySelector("#submit-comment");

  titleEl.textContent = post.title;
  authorEl.textContent = `By ${post.nickname}`;
  bodyEl.textContent = post.content;
  textarea.value = "";

  sendBtn.onclick = () => {
    const text = textarea.value.trim();
    if (text.length < 1) return;
    postComment(post.id, text);
    modal.style.display = "none";
  };

  fetchAndDisplayComments(post.id);

  modal.style.display = "flex";
}

async function postComment(postId, comment){
    try {
        
        const response = fetch("/api/add_comment", {
            method: "POST",
            "credentials": "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                post_id: String(postId),
                comment: comment,
            })
        })
    } catch (error) {
        BuildErrorPage(500, "Can't connect to server")
    }
}

export async function fetchAndDisplayComments(postId) {
  try {
    const response = await fetch(`/api/fetch_comments?id=${postId}`, {
      method: "GET",
      credentials: "include"
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const comments = await response.json();
    console.log(comments);
    
    displayComments(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    // Display error message to user
    const commentsContainer = document.getElementById("comments-container");
    if (commentsContainer) {
      commentsContainer.innerHTML = "<p>Error loading comments. Please try again.</p>";
    }
  }
}

function displayComments(comments) {
  const commentsContainer = document.getElementById("comments-container");
  if (!commentsContainer) return;

  // Clear existing comments
  commentsContainer.innerHTML = "";

  if (!comments || comments.length === 0) {
    commentsContainer.innerHTML = `
      <div class="no-comments">
        <i class="fa-regular fa-comment-dots"></i>
        <p>No comments yet. Be the first to comment!</p>
      </div>
    `;
    return;
  }

  // Create and append each comment
  comments.forEach(comment => {
    const commentElement = document.createElement("div");
    commentElement.className = "comment";
    
    // Format the date
    const commentDate = new Date(comment.created_at);
    const formattedDate = commentDate.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    commentElement.innerHTML = `
      <div class="comment-header">
        <div class="comment-author">
          <i class="fa-solid fa-user"></i>
          <strong>${comment.nick_name}</strong>
        </div>
        <span class="comment-time">${formattedDate}</span>
      </div>
      <div class="comment-body">${comment.comment}</div>
      <div class="comment-divider"></div>
    `;
    commentsContainer.appendChild(commentElement);
  });
}