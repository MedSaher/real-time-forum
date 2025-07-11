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

  // Build hierarchy
  content.appendChild(closeBtn);
  content.appendChild(title);
  content.appendChild(author);
  content.appendChild(body);
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
