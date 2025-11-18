// js/main.js
// Simple Netlify Identity setup + passcode-protected signup

const PASSCODE = "1965";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Netlify Identity if present
  if (window.netlifyIdentity) {
    window.netlifyIdentity.init();
  }

  // If we're on the login page, wire the buttons/forms
  const widgetBtn = document.getElementById("btn-netlify");
  if (widgetBtn && window.netlifyIdentity) {
    widgetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.netlifyIdentity.open("login");
    });
  }

  const signupForm = document.getElementById("signup-form");
  if (signupForm && window.netlifyIdentity) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value;
      const passcode = document.getElementById("signup-passcode").value.trim();
      const msg = document.getElementById("signup-msg");

      if (passcode !== PASSCODE) {
        msg.textContent = "Incorrect passcode. Please contact an officer.";
        return;
      }

      try {
        await window.netlifyIdentity.signup({
          email,
          password
        });
        msg.textContent =
          "Account created. Check your email to confirm. You can then log in.";
      } catch (err) {
        console.error(err);
        msg.textContent = err && err.message ? err.message : "Sign-up error.";
      }
    });
  }
});

// Called from the members dashboard to require login
window.requireLogin = function () {
  if (!window.netlifyIdentity) {
    alert("Login service not loaded.");
    window.location.href = "/login.html";
    return;
  }

  window.netlifyIdentity.on("init", (user) => {
    if (!user) {
      window.netlifyIdentity.open("login");
      // After login, Netlify can redirect back if configured; otherwise user can navigate back.
    }
  });

  window.netlifyIdentity.init();
};
