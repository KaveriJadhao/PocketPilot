const userName = document.getElementById("userName");
const budget = document.getElementById("budget");
const goal = document.getElementById("goal");
const darkToggle = document.getElementById("darkToggle");
const notifyToggle = document.getElementById("notifyToggle");
const saveBtn = document.getElementById("saveBtn");

window.addEventListener("load", () => {
    userName.value = localStorage.getItem("userName") || "";
    budget.value = localStorage.getItem("monthlyBudget") || "";
    goal.value = localStorage.getItem("savingsGoal") || "";

    darkToggle.checked = localStorage.getItem("theme") === "dark";
    notifyToggle.checked = localStorage.getItem("notifications") === "on";
});

saveBtn.addEventListener("click", () => {
    localStorage.setItem("userName", userName.value);
    localStorage.setItem("monthlyBudget", budget.value);
    localStorage.setItem("savingsGoal", goal.value);

    localStorage.setItem(
        "theme",
        darkToggle.checked ? "dark" : "light"
    );

    localStorage.setItem(
        "notifications",
        notifyToggle.checked ? "on" : "off"
    );

    alert("Settings saved successfully ✅");
});
const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", async () => {

    const confirmReset = confirm(
        "Are you sure? This will delete all expenses, gems, streaks, and settings."
    );

    if(!confirmReset){
        return;
    }

    await fetch("http://localhost:5000/api/user/reset", {
        method: "DELETE"
    });

    localStorage.clear();

    alert("All data has been reset ✅");

    window.location.href = "dashboard.html";
});