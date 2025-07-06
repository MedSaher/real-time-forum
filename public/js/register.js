const registerForm = document.getElementById("register-form")

registerForm.addEventListener("submit", async (e) => {

    e.preventDefault()

    const nickname = document.getElementById("register-nickname").value.trim()
    const age = document.getElementById("register-age").value.trim()
    const gender = document.getElementById("register-gender").value.trim()
    const firstname = document.getElementById("register-firstname").value.trim()
    const lastname = document.getElementById("register-lastname").value.trim()
    const email = document.getElementById("register-email").value.trim()
    const password = document.getElementById("register-password").value.trim()

    console.log(nickname);
    
    

    register(nickname, age, gender, firstname, lastname, email, password)

})

async function register(nickname, age, gender, firstname, lastname, email, password) {
    try {
        const response = await fetch("http://localhost:8080/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                nickname: nickname,
                age: age,
                gender: gender,
                first_name: firstname,
                last_name: lastname,
                email: email,
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