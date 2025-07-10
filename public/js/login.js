import { showLogin, showRegister } from "/public/js/switch.js";
import { BuildErrorPage } from "/public/js/post.js";
async function login(identifier, password) {
    try {
        const response = await fetch("/api/login", {
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
        BuildErrorPage(500, "Cannot connect to server.");
    }
}

async function register(nickname, age, gender, firstname, lastname, email, password) {
    try {
        
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                nickname: nickname,
                age: String(age),
                gender: gender,
                first_name: firstname,
                last_name: lastname,
                email: email,
                password: password
            })
        });

        // console.log(resp);
        

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

export function BuildLoginPage() {
    const body = document.body;

    // ----- LOGIN CONTAINER -----
    const loginContainer = document.createElement("div");
    loginContainer.className = "container";
    loginContainer.id = "login-container";

    const loginTitle = document.createElement("h1");
    loginTitle.textContent = "Weroom Login";

    const loginForm = document.createElement("form");
    loginForm.id = "login-form";

    // --- login identifier ---
    const loginGroup1 = document.createElement("div");
    loginGroup1.className = "form-group";

    const loginLabel1 = document.createElement("label");
    loginLabel1.setAttribute("for", "login-identifier");
    loginLabel1.textContent = "Email or Nickname";

    const loginInput1 = document.createElement("input");
    loginInput1.type = "text";
    loginInput1.id = "login-identifier";
    loginInput1.name = "identifier";
    loginInput1.placeholder = "Email or Nickname";
    loginInput1.required = true;

    const loginIcon1 = document.createElement("i");
    loginIcon1.className = "fa-solid fa-user icon";

    loginGroup1.append(loginLabel1, loginInput1, loginIcon1);

    // --- login password ---
    const loginGroup2 = document.createElement("div");
    loginGroup2.className = "form-group";

    const loginLabel2 = document.createElement("label");
    loginLabel2.setAttribute("for", "login-password");
    loginLabel2.textContent = "Password";

    const loginInput2 = document.createElement("input");
    loginInput2.type = "password";
    loginInput2.id = "login-password";
    loginInput2.name = "password";
    loginInput2.placeholder = "Password";
    loginInput2.required = true;

    const loginIcon2 = document.createElement("i");
    loginIcon2.className = "fa-solid fa-lock icon";

    loginGroup2.append(loginLabel2, loginInput2, loginIcon2);

    // --- login button ---
    const loginBtn = document.createElement("button");
    loginBtn.type = "submit";
    loginBtn.id = "loginBtn";
    loginBtn.textContent = "Login";

    loginForm.append(loginGroup1, loginGroup2, loginBtn);

    // Form Event 
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault()

        const identifier = document.getElementById("login-identifier").value.trim()
        const password = document.getElementById("login-password").value.trim()

        login(identifier, password)
    })

    // --- switch to register ---
    const loginSwitch = document.createElement("p");
    loginSwitch.className = "switch";
    loginSwitch.innerHTML = `Don't have an account? `;

    const switchToRegisterBtn = document.createElement("button");
    switchToRegisterBtn.type = "button";
    switchToRegisterBtn.textContent = "Register here";
    switchToRegisterBtn.onclick = showRegister;

    loginSwitch.appendChild(switchToRegisterBtn);

    loginContainer.append(loginTitle, loginForm, loginSwitch);
    body.appendChild(loginContainer);

    // ----- REGISTER CONTAINER -----
    const registerContainer = document.createElement("div");
    registerContainer.className = "container";
    registerContainer.id = "register-container";
    registerContainer.style.display = "none";

    const registerTitle = document.createElement("h1");
    registerTitle.textContent = "Weroom Register";

    const registerForm = document.createElement("form");
    registerForm.id = "register-form";

    // Utility to generate register form fields
    function createInputGroup(labelText, id, type, name, placeholder, icon) {
        const group = document.createElement("div");
        group.className = "form-group";

        const label = document.createElement("label");
        label.setAttribute("for", id);
        label.textContent = labelText;

        const input = document.createElement("input");
        input.type = type;
        input.id = id;
        input.name = name;
        input.placeholder = placeholder;
        input.required = true;

        const iconEl = document.createElement("i");
        iconEl.className = `fa-solid ${icon} icon`;

        group.append(label, input, iconEl);
        return group;
    }

    // Fields
    const fields = [
        ["Nickname", "register-nickname", "text", "nickname", "Choose a nickname", "fa-user"],
        ["Age", "register-age", "number", "age", "Your age", "fa-calendar"],
        ["First Name", "register-firstname", "text", "first_name", "Your first name", "fa-id-card"],
        ["Last Name", "register-lastname", "text", "last_name", "Your last name", "fa-id-card"],
        ["Email", "register-email", "email", "email", "Your email", "fa-envelope"],
        ["Password", "register-password", "password", "password", "Choose a password", "fa-lock"]
    ];

    fields.forEach(([label, id, type, name, placeholder, icon]) => {
        registerForm.appendChild(createInputGroup(label, id, type, name, placeholder, icon));
    });

    // Gender Select
    const genderGroup = document.createElement("div");
    genderGroup.className = "form-group";

    const genderLabel = document.createElement("label");
    genderLabel.setAttribute("for", "register-gender");
    genderLabel.textContent = "Gender";

    const genderSelect = document.createElement("select");
    genderSelect.id = "register-gender";
    genderSelect.name = "gender";
    genderSelect.required = true;

    const defaultOption = document.createElement("option");
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.value = "";
    defaultOption.textContent = "Select your gender";

    genderSelect.appendChild(defaultOption);
    ["male", "female", "other"].forEach(value => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = value.charAt(0).toUpperCase() + value.slice(1);
        genderSelect.appendChild(opt);
    });

    genderGroup.append(genderLabel, genderSelect);
    registerForm.appendChild(genderGroup);

    // Register button
    const registerBtn = document.createElement("button");
    registerBtn.type = "submit";
    registerBtn.textContent = "Register";
    registerForm.appendChild(registerBtn);

    registerForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Collect form values
    const nickname = document.getElementById("register-nickname").value.trim();
    const age = parseInt(document.getElementById("register-age").value.trim());
    const gender = document.getElementById("register-gender").value;
    const firstname = document.getElementById("register-firstname").value.trim();
    const lastname = document.getElementById("register-lastname").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;

    // Call the async register function
    await register(nickname, age, gender, firstname, lastname, email, password);
});

    // Switch to login
    const registerSwitch = document.createElement("p");
    registerSwitch.className = "switch";
    registerSwitch.innerHTML = `Already have an account? `;

    const switchToLoginBtn = document.createElement("button");
    switchToLoginBtn.type = "button";
    switchToLoginBtn.textContent = "Login here";
    switchToLoginBtn.onclick = showLogin;

    registerSwitch.appendChild(switchToLoginBtn);

    registerContainer.append(registerTitle, registerForm, registerSwitch);
    body.appendChild(registerContainer);

    // ----- MODAL -----
    const modal = document.createElement("div");
    modal.id = "popup-modal";
    modal.className = "modal";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    const modalClose = document.createElement("button");
    modalClose.className = "modal-close";
    modalClose.innerHTML = "&times;";
    modalClose.onclick = closeModal;

    const modalIcon = document.createElement("i");
    modalIcon.className = "fa-solid";
    modalIcon.id = "modal-icon";

    const modalMessage = document.createElement("div");
    modalMessage.className = "modal-message";
    modalMessage.id = "modal-message";
    modalMessage.textContent = "Message goes here";

    modalContent.append(modalClose, modalIcon, modalMessage);
    modal.appendChild(modalContent);
    body.appendChild(modal);
}
