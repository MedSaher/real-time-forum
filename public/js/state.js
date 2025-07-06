async function checkIfLoggedIn() {
    const res = await fetch('/api/session', {
        method: 'GET',
        credentials: 'include' // Important: include cookies in request
    });

    if (res.ok) {
        const user = await res.json();
        console.log("Logged in as:", user.nickname);
        return user;
    } else {
        console.log("Not logged in");
        return null;
    }
}

let logged = false

