export async function FetchUsers() {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      credentials: "include", // Correct placement of credentials
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data); // You can remove this in production
      renderUserList(data); // Update the DOM
    } else {
      console.log("Something went wrong fetching users.");
    }
  } catch (error) {
    console.log("Network error or server failure.");
  }
}


function renderUserList(users) {
  const userList = document.querySelector(".user-list");
  userList.innerHTML = ""; // Clear existing content

  users.forEach(user => {
    const li = document.createElement("li");
    

    // Create the icon + name container
    const userInfo = document.createElement("div");
    userInfo.className = "users-info";

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-circle-user";

    const name = document.createTextNode(user.Nickname);

    userInfo.appendChild(icon);
    userInfo.appendChild(name);

    // Create the status dot
    const statusDot = document.createElement("span");
    statusDot.className = `status-dot ${user.Status ? "status-online" : "status-offline"}`;
    statusDot.title = user.Status ? "Online" : "Offline";

    // Assemble the <li>
    li.appendChild(userInfo);
    li.appendChild(statusDot);

    userList.appendChild(li);
  });
}

export async function BuildProfile(user) {
  
    const nickname = document.getElementById("nickname");
    const actionBtn = document.getElementById("authenticate");
    nickname.innerHTML = `<i class="fa-solid fa-user"></i> ${user.nickname}`

    actionBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`
    actionBtn.href = ""
    actionBtn.addEventListener("click", async ()=>{
      const response = await fetch("/api/logout", {
        method: "post",
        headers: {
          "credntials": "include"
        },
      })
      if (response.ok){
        window.location.href = "/"
        
      } else {
        console.log(response.body);
      }
    })
}