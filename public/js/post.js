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
