const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const guestBtn = document.getElementById("guestBtn");
const guestLoginBtn = document.getElementById("guestLoginBtn");

/* SIGNUP */
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const submitBtn = document.getElementById("signupBtn");

    try {
      submitBtn.disabled = true;
      submitBtn.innerText = "Creating account...";

      await api.register(name, email, password);
      api.showToast("Account created successfully ✅ Redirecting...", "success");

      setTimeout(() => {
        if (localStorage.getItem("onboardingDone") === "true") {
          window.location.href = "dashboard.html";
        } else {
          window.location.href = "onboarding.html";
        }
      }, 1000);
    } catch (error) {
      api.showToast(error.message || "Registration failed. Please try again.", "error");
      submitBtn.disabled = false;
      submitBtn.innerText = "Create Account";
    }
  });
}

/* LOGIN */
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const submitBtn = document.getElementById("loginBtn");

    try {
      submitBtn.disabled = true;
      submitBtn.innerText = "Logging in...";

      await api.login(email, password);
      api.showToast("Welcome back! ✅", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 800);
    } catch (error) {
      api.showToast(error.message || "Invalid credentials. Please check and retry.", "error");
      submitBtn.disabled = false;
      submitBtn.innerText = "Login";
    }
  });
}

/* GUEST / DEMO LOGIN */
function setupGuestLogin(btn) {
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      btn.disabled = true;
      btn.innerText = "Loading Demo...";
      await api.guestLogin();
      api.showToast("Demo Mode Activated! 🚀", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 600);
    } catch (error) {
      // Fallback to local guest mode
      localStorage.setItem("userName", "Kaveri (Demo)");
      localStorage.setItem("monthlyBudget", "15000");
      window.location.href = "dashboard.html";
    }
  });
}

setupGuestLogin(guestBtn);
setupGuestLogin(guestLoginBtn);