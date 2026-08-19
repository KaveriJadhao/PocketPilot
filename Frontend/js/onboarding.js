const form = document.getElementById("onboardingForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const budget = Number(document.getElementById("budget").value) || 15000;
  const goal = Number(document.getElementById("goal").value) || 5000;
  const submitBtn = document.getElementById("submitBtn");

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Setting up your cockpit...";
    }

    // Save to local storage
    localStorage.setItem("userName", name);
    localStorage.setItem("monthlyBudget", budget);
    localStorage.setItem("savingsGoal", goal);
    localStorage.setItem("onboardingDone", "true");

    // Sync to backend
    await api.updateProfile({
      name,
      monthlyBudget: budget,
      savingsGoal: goal,
    });

    api.showToast("Profile configured successfully! 🚀", "success");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 600);
  } catch (error) {
    // Fallback redirect even if backend is offline
    window.location.href = "dashboard.html";
  }
});