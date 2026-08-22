const form = document.getElementById("onboardingForm");
const avatarItems = document.querySelectorAll(".avatar-item");
const presetPills = document.querySelectorAll(".preset-pill");

let selectedSeed = "KaveriPilot";

// Avatar Picker Selection
avatarItems.forEach((item) => {
  item.addEventListener("click", () => {
    avatarItems.forEach((el) => el.classList.remove("active"));
    item.classList.add("active");
    selectedSeed = item.getAttribute("data-seed") || "KaveriPilot";
    localStorage.setItem("userAvatarSeed", selectedSeed);
  });
});

// Preset Pills Handler
presetPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    const targetId = pill.getAttribute("data-target");
    const val = pill.getAttribute("data-val");
    const input = document.getElementById(targetId);
    if (input && val) {
      input.value = val;
      input.focus();
    }
  });
});

// Pre-fill user data on load
document.addEventListener("DOMContentLoaded", () => {
  const userData = api.getUserData() || {};
  const currentName = userData.name || localStorage.getItem("userName") || "";
  const nameInput = document.getElementById("name");
  if (nameInput && currentName) {
    nameInput.value = currentName;
  }
  const currentBudget = userData.monthlyBudget || localStorage.getItem("monthlyBudget") || "";
  const budgetInput = document.getElementById("budget");
  if (budgetInput && currentBudget) {
    budgetInput.value = currentBudget;
  }
  const currentGoal = userData.savingsGoal || localStorage.getItem("savingsGoal") || "";
  const goalInput = document.getElementById("goal");
  if (goalInput && currentGoal) {
    goalInput.value = currentGoal;
  }
});

// Form Submission
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userData = api.getUserData() || {};
    const name = document.getElementById("name").value.trim() || userData.name || localStorage.getItem("userName") || "Student";
    const budget = Number(document.getElementById("budget").value) || 15000;
    const goal = Number(document.getElementById("goal").value) || 5000;
    const submitBtn = document.getElementById("submitBtn");

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Saving your profile...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
      }

      // Save locally
      localStorage.setItem("userName", name);
      localStorage.setItem("monthlyBudget", budget);
      localStorage.setItem("savingsGoal", goal);
      localStorage.setItem("userAvatarSeed", selectedSeed);
      localStorage.setItem("onboardingDone", "true");

      // Sync to backend API
      try {
        await api.updateProfile({
          name,
          monthlyBudget: budget,
          savingsGoal: goal,
        });
      } catch (err) {
        console.warn("Backend updateProfile sync fallback:", err);
      }

      api.showToast(`Welcome aboard, ${name}! 🚀`, "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    } catch (error) {
      window.location.href = "dashboard.html";
    }
  });
}