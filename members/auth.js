// members/auth.js

// === CONFIG (keep in sync with login.html) ===
const AUTH0_DOMAIN    = "dev-vrv7ebflsu4wba1z.us.auth0.com";
const AUTH0_CLIENT_ID = "oh3uJuWWaU7CMQYLLtY0I9lDxIQyRKRu";

// Where to send people if they are NOT logged in (for protected pages)
const LOGIN_PAGE_URL  = "../login.html";

// === TOKEN STORAGE HELPERS ===

// Parse the URL hash fragment: #access_token=...&expires_in=...
function parseHash(hash) {
  const trimmed = hash.charAt(0) === "#" ? hash.substring(1) : hash;
  const params = {};
  trimmed.split("&").forEach((kv) => {
    if (!kv) return;
    const [key, val] = kv.split("=");
    params[decodeURIComponent(key)] = decodeURIComponent(val || "");
  });
  return params;
}

// Save token + expiration in sessionStorage
function saveSession(params) {
  if (!params.access_token) return;

  const expiresInSec = Number(params.expires_in || "3600");
  const expiresAtMs  = Date.now() + expiresInSec * 1000;

  sessionStorage.setItem("dgi_access_token", params.access_token);
  sessionStorage.setItem("dgi_expires_at",  String(expiresAtMs));

  // Clean up the URL so we don't keep the token in the hash
  if (window.history && window.history.replaceState) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

function getAccessToken() {
  const token = sessionStorage.getItem("dgi_access_token");
  const expiresAt = Number(sessionStorage.getItem("dgi_expires_at") || "0");

  if (!token || !expiresAt || Date.now() > expiresAt) {
    // Token missing or expired
    sessionStorage.removeItem("dgi_access_token");
    sessionStorage.removeItem("dgi_expires_at");
    return null;
  }
  return token;
}

// Central function to enforce login for any members page
function requireAuth() {
  // 1) If we just came from Auth0 with a token in the hash, store it
  if (window.location.hash && window.location.hash.includes("access_token")) {
    const params = parseHash(window.location.hash);
    saveSession(params);
  }

  // 2) Check if we have a valid token
  const token = getAccessToken();
  if (!token) {
    // Not logged in → go to login page
    window.location.href = LOGIN_PAGE_URL;
    return;
  }

  // 3) Optionally load profile + show name
  loadUserProfile(token);
}

// === OPTIONAL: Show welcome name from Auth0 ===
function loadUserProfile(token) {
  const nameSpan = document.getElementById("member-name");
  if (!nameSpan) return; // no place to show it, no problem

  fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    })
    .then((profile) => {
      const displayName =
        profile.name ||
        profile.nickname ||
        profile.email ||
        "Member";
      nameSpan.textContent = displayName;
    })
    .catch((err) => {
      console.error("Profile load error:", err);
      nameSpan.textContent = "Member";
    });
}

// === LOGOUT HELPER (used by navbar Logout link) ===
function logout() {
  // Clear local session
  sessionStorage.removeItem("dgi_access_token");
  sessionStorage.removeItem("dgi_expires_at");

  // Also log out of Auth0 and then return to the public site
  const returnTo = encodeURIComponent(window.location.origin + "/"); // homepage

  const logoutUrl =
    `https://${AUTH0_DOMAIN}/v2/logout?client_id=${encodeURIComponent(AUTH0_CLIENT_ID)}` +
    `&returnTo=${returnTo}`;

  window.location.href = logoutUrl;
}
