const form = document.getElementById("onboardingForm");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const budget = document.getElementById("budget").value;
    const goal = document.getElementById("goal").value;

    localStorage.setItem("userName", name);
    localStorage.setItem("monthlyBudget", budget);
    localStorage.setItem("savingsGoal", goal);
    localStorage.setItem("onboardingDone", "true");

    window.location.href = "dashboard.html";
});