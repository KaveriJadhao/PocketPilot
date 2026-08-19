let selectedAvatarSeed = "KaveriPilot";

async function loadSettings() {
  const user = await api.getUser();

  const nameInput = document.getElementById("userName");
  const budgetInput = document.getElementById("budget");
  const goalInput = document.getElementById("goal");
  const darkToggle = document.getElementById("darkToggle");

  if (nameInput) nameInput.value = user.name || localStorage.getItem("userName") || "";
  if (budgetInput) budgetInput.value = user.monthlyBudget || localStorage.getItem("monthlyBudget") || 15000;
  if (goalInput) goalInput.value = user.savingsGoal || localStorage.getItem("savingsGoal") || 5000;

  if (darkToggle) {
    darkToggle.checked = document.body.classList.contains("dark") || localStorage.getItem("theme") === "dark";
  }

  // Load avatar seed if stored
  const savedAvatar = localStorage.getItem("userAvatarSeed");
  if (savedAvatar) {
    selectedAvatarSeed = savedAvatar;
    updateAvatarSelection(savedAvatar);
  }
}

function getAvatarPath(seed) {
  const map = {
    "KaveriPilot": "../assets/avatars/avatar-1.svg",
    "ScholarAlex": "../assets/avatars/avatar-2.svg",
    "FinanceGenius": "../assets/avatars/avatar-3.svg",
    "PilotNova": "../assets/avatars/avatar-4.svg",
  };
  return map[seed] || "../assets/avatars/avatar-1.svg";
}

function updateAvatarSelection(seed) {
  const options = document.querySelectorAll(".avatar-option");
  options.forEach((opt) => {
    if (opt.getAttribute("data-seed") === seed) {
      opt.classList.add("active");
    } else {
      opt.classList.remove("active");
    }
  });

  const sidebarImg = document.getElementById("userAvatar");
  if (sidebarImg) {
    sidebarImg.src = getAvatarPath(seed);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadSettings();

  // Tab Switching
  const navBtns = document.querySelectorAll(".settings-nav-btn");
  const panes = document.querySelectorAll(".settings-pane");

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      navBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const targetTabId = btn.getAttribute("data-tab");
      panes.forEach((pane) => {
        if (pane.id === targetTabId) {
          pane.style.display = "block";
        } else {
          pane.style.display = "none";
        }
      });
    });
  });

  // Default: show first tab
  if (panes.length > 0) {
    panes.forEach((p, idx) => {
      p.style.display = idx === 0 ? "block" : "none";
    });
  }

  // Avatar Picker
  const avatarOptions = document.querySelectorAll(".avatar-option");
  avatarOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      selectedAvatarSeed = opt.getAttribute("data-seed");
      localStorage.setItem("userAvatarSeed", selectedAvatarSeed);
      updateAvatarSelection(selectedAvatarSeed);
      api.showToast("Avatar updated", "success");
    });
  });

  // Dark mode switch
  const darkToggle = document.getElementById("darkToggle");
  if (darkToggle) {
    darkToggle.addEventListener("change", () => {
      api.toggleTheme();
      const isDark = document.body.classList.contains("dark");
      const themeIcon = document.getElementById("themeIcon");
      if (themeIcon) themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    });
  }

  // Topbar theme button
  const themeBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isDark = api.toggleTheme();
      if (darkToggle) darkToggle.checked = isDark;
      if (themeIcon) themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    });
    const isDark = localStorage.getItem("theme") === "dark";
    if (themeIcon) themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }

  // Save Settings
  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const name = document.getElementById("userName").value.trim();
      const budget = Number(document.getElementById("budget").value);
      const goal = Number(document.getElementById("goal").value);

      try {
        saveBtn.disabled = true;
        saveBtn.innerText = "Saving...";

        await api.updateProfile({
          name: name || "Student",
          monthlyBudget: budget || 15000,
          savingsGoal: goal || 5000,
        });

        localStorage.setItem("userName", name);
        localStorage.setItem("monthlyBudget", budget);
        localStorage.setItem("savingsGoal", goal);

        const sidebarName = document.getElementById("sidebarUserName");
        if (sidebarName) sidebarName.innerText = name || "Student";

        api.showToast("Settings updated successfully", "success");
      } catch (err) {
        api.showToast(err.message || "Failed to update settings", "error");
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="fa-solid fa-check"></i> Save Changes`;
      }
    });
  }

  // Export JSON Backup
  const exportJsonBtn = document.getElementById("exportJsonBtn");
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener("click", async () => {
      const expenses = await api.getExpenses();
      const user = await api.getUser();
      const backupData = {
        user,
        expenses,
        exportDate: new Date().toISOString(),
        version: "2.4.0",
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `PocketPilot_Backup_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      api.showToast("JSON Backup downloaded", "success");
    });
  }

  // Export CSV
  const exportCsvBtn = document.getElementById("exportCsvSettingsBtn");
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", async () => {
      const expenses = await api.getExpenses();
      if (!expenses || expenses.length === 0) {
        api.showToast("No transaction records available", "error");
        return;
      }

      const headers = ["Title,Category,Mood,Amount,Date"];
      const rows = expenses.map(
        (e) => `"${e.title}","${e.category}","${e.mood || 'Neutral'}",${e.amount},"${e.date || e.createdAt}"`
      );
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `PocketPilot_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      api.showToast("CSV Spreadsheet downloaded", "success");
    });
  }

  // Reset Data
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      if (confirm("⚠️ Are you sure you want to erase ALL transaction records? This action is permanent.")) {
        try {
          await api.resetData();
          api.showToast("All data records erased", "success");
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 800);
        } catch (err) {
          api.showToast("Failed to reset data", "error");
        }
      }
    });
  }

  // Sign out
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      api.setToken("");
      localStorage.clear();
      api.showToast("Signed out successfully", "success");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 500);
    });
  }
});