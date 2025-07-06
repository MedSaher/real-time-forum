loginForm = document.getElementById("login-form")

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault()

    const identifier = document.getElementById("login-identifier").value.trim()
    const password = document.getElementById("login-password").value.trim()

    login(identifier, password)

})

async function login(identifier, password) {
    try {
        const response = await fetch("http://localhost:8080/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                identifier: identifier,
                password: password
            })
        });

        if (response.ok) {
            // Redirect to home page
            window.location.href = "/";
        } else {
            const modal = document.getElementById('popup-modal');
            const icon = document.getElementById('modal-icon');
            const text = document.getElementById('modal-message');

            const error = await response.json();

            modal.className = 'modal error'
            icon.className = 'fa-solid fa-triangle-exclamation'
            text.textContent = error.error

            modal.style.display = 'flex';

            console.log(error.error)

            setTimeout(() => {
                closeModal();
            }, 3000); // auto-close after 3 seconds
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Network error.");
    }
}

function closeModal() {
    document.getElementById('popup-modal').style.display = 'none';
  }