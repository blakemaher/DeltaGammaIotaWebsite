// =========================
// AUTH0 INITIALIZATION
// =========================
const auth0Client = await createAuth0Client({
    domain: "dev-hu8eek57hiyfzcts.us.auth0.com",
    clientId: "xjYAzMY8g40A6QiRUcJpeIyWGxMqzA2V",
    authorizationParams: {
        redirect_uri: window.location.origin + "/dashboard.html"
    }
});

// =========================
// LOGIN BUTTON
// =========================
document.getElementById("loginBtn")?.addEventListener("click", async () => {
    await auth0Client.loginWithRedirect();
});

// =========================
// CHECK ROLES ON DASHBOARD
// =========================
async function checkRoles() {
    const isAuthenticated = await auth0Client.isAuthenticated();
    if (!isAuthenticated) {
        window.location.href = "login.html";
        return;
    }

    const user = await auth0Client.getUser();

    const roles = user["https://deltagammaiota.org/roles"] || [];

    // Allowed roles
    const allowed = ["Active Member", "DGI Alumni"];

    const isAllowed = roles.some(role => allowed.includes(role));

    if (!isAllowed) {
        document.body.innerHTML = `
            <h1>Access Denied</h1>
            <p>You do not have the correct member permissions.</p>
        `;
        return;
    }

    document.getElementById("memberName").innerText = user.name;
}

if (window.location.pathname.includes("dashboard.html")) {
    checkRoles();
}
