loginForm = document.getElementById("login-form")

loginForm.addEventListener("submit", async (e)=>{

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
            const data = await response.json();

            // Store token in localStorage
            localStorage.setItem("session_token", data.session_token);
            console.log(data);
            
            // Redirect to home page
            // window.location.href = "/";
        } else {
            const error = await response.text();
            alert("Login failed: " + error);
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Network error.");
    }
}
