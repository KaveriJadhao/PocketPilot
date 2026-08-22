let pieChart = null;
let lineChart = null;
let quickModalMood = "Happy";
let allDashboardExpenses = [];
let dashboardSearchQuery = "";

function formatCurrency(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

function formatDate(dateString) {
  if (!dateString) return "Recent";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "Recent";
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function getCategoryBadge(category) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("food")) return `<span class="badge badge-sapphire">Food & Dining</span>`;
  if (cat.includes("travel")) return `<span class="badge badge-emerald">Transit</span>`;
  if (cat.includes("shopping")) return `<span class="badge badge-amber">Shopping</span>`;
  if (cat.includes("education") || cat.includes("book")) return `<span class="badge badge-sapphire">Education</span>`;
  if (cat.includes("bill") || cat.includes("recharge")) return `<span class="badge badge-rose">Utilities</span>`;
  return `<span class="badge badge-neutral">${escapeHtml(category || "Other")}</span>`;
}

function getMoodBadge(mood) {
  const m = (mood || "").toLowerCase();
  if (m.includes("happy") || m.includes("positive")) return `<span class="badge badge-emerald">Positive</span>`;
  if (m.includes("stressed") || m.includes("stress")) return `<span class="badge badge-rose">Stress</span>`;
  if (m.includes("bored")) return `<span class="badge badge-amber">Boredom</span>`;
  if (m.includes("sad") || m.includes("low")) return `<span class="badge badge-sapphire">Low</span>`;
  return `<span class="badge badge-neutral">${escapeHtml(mood || "Neutral")}</span>`;
}

function getGreeting(name) {
  const hour = new Date().getHours();
  let timeGreeting = "Welcome back";
  if (hour < 12) timeGreeting = "Good morning";
  else if (hour < 17) timeGreeting = "Good afternoon";
  else timeGreeting = "Good evening";

  return name && name !== "Student" ? `${timeGreeting}, ${name}` : timeGreeting;
}

async function loadUserData() {
  const cachedUser = api.getUserData() || {};
  let user = await api.getUser();

  // Prioritize the actual authenticated user's name and budget
  const userName = (user && user.name && user.name !== "Student" && user.name !== "Guest Student" && user.name !== "Kaveri")
    ? user.name
    : (cachedUser.name || localStorage.getItem("userName") || (user ? user.name : "Student"));

  const email = (user && user.email && user.email !== "student@university.edu" && user.email !== "guest@university.edu")
    ? user.email
    : (cachedUser.email || localStorage.getItem("userEmail") || (user && user.email ? user.email : "Student Account"));

  const budget = Number(user && user.monthlyBudget) || Number(cachedUser.monthlyBudget) || Number(localStorage.getItem("monthlyBudget")) || 15000;
  const savingsGoal = Number(user && user.savingsGoal) || Number(cachedUser.savingsGoal) || Number(localStorage.getItem("savingsGoal")) || 5000;

  user = {
    ...user,
    name: userName,
    email: email,
    monthlyBudget: budget,
    savingsGoal: savingsGoal,
  };

  const greetingEl = document.getElementById("dashboardGreeting");
  if (greetingEl) greetingEl.innerText = getGreeting(userName);

  const sidebarNameEl = document.getElementById("sidebarUserName");
  if (sidebarNameEl) sidebarNameEl.innerText = userName;

  const sidebarEmailEl = document.getElementById("sidebarUserEmail");
  if (sidebarEmailEl) sidebarEmailEl.innerText = email;

  const streakEl = document.getElementById("streakDays");
  if (streakEl) streakEl.innerText = user.streak === 1 ? "1 Day" : `${user.streak || 1} Days`;

  const levelValEl = document.getElementById("levelValue");
  if (levelValEl) levelValEl.innerText = `Level ${user.level || 1}`;

  const gemsValEl = document.getElementById("gemsValue");
  if (gemsValEl) gemsValEl.innerText = `${user.gems || 0} Gems`;

  return user;
}

async function loadDashboardData(expenses, user) {
  let totalExpenses = 0;
  expenses.forEach((expense) => {
    totalExpenses += Number(expense.amount || 0);
  });

  const totalBalance = Number(user.monthlyBudget) || Number(localStorage.getItem("monthlyBudget")) || 15000;
  const savings = Math.max(0, totalBalance - totalExpenses);
  const spentPct = totalBalance > 0 ? Math.min(Math.round((totalExpenses / totalBalance) * 100), 100) : 0;

  // Fluid Counter Animations
  const monthlyExpEl = document.getElementById("monthlyExpenses");
  if (monthlyExpEl) api.animateValue(monthlyExpEl, 0, totalExpenses, 700, "₹");

  const totalBalEl = document.getElementById("totalBalance");
  if (totalBalEl) api.animateValue(totalBalEl, 0, totalBalance, 700, "₹");

  const totalSavEl = document.getElementById("totalSavings");
  if (totalSavEl) api.animateValue(totalSavEl, 0, savings, 700, "₹");

  const spentPctEl = document.getElementById("spentPercentageFooter");
  if (spentPctEl) spentPctEl.innerText = `${spentPct}% of allocation used`;
}

function loadCategoryChart(expenses) {
  let food = 0;
  let travel = 0;
  let shopping = 0;
  let other = 0;

  expenses.forEach((exp) => {
    const category = (exp.category || "").toLowerCase();
    const amount = Number(exp.amount || 0);
    if (category.includes("food")) food += amount;
    else if (category.includes("travel")) travel += amount;
    else if (category.includes("shopping")) shopping += amount;
    else other += amount;
  });

  const hasData = food > 0 || travel > 0 || shopping > 0 || other > 0;
  const chartData = hasData ? [food, travel, shopping, other] : [25, 25, 25, 25];
  const chartColors = hasData
    ? ["#2563eb", "#059669", "#d97706", "#e11d48"]
    : ["rgba(37, 99, 235, 0.15)", "rgba(5, 150, 105, 0.15)", "rgba(217, 119, 6, 0.15)", "rgba(225, 29, 72, 0.15)"];

  const ctx = document.getElementById("expenseChart");
  if (!ctx) return;

  if (pieChart) {
    pieChart.destroy();
  }

  pieChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Food & Dining", "Travel & Transit", "Shopping", "Other"],
      datasets: [
        {
          data: chartData,
          backgroundColor: chartColors,
          borderWidth: 0,
          hoverOffset: hasData ? 3 : 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "75%",
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 750,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: hasData,
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleFont: { family: "Plus Jakarta Sans", size: 12 },
          bodyFont: { family: "Plus Jakarta Sans", size: 12, weight: "600" },
          padding: 8,
          cornerRadius: 6,
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ₹${ctx.raw.toLocaleString("en-IN")}`,
          },
        },
      },
    },
  });
}

function loadWeeklyTrendChart(expenses) {
  const isDark = document.body.classList.contains("dark");
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];

  expenses.forEach((expense) => {
    const expenseDate = expense.date ? new Date(expense.date) : new Date(expense.createdAt || Date.now());
    let jsDay = expenseDate.getDay();
    let dayIndex = jsDay === 0 ? 6 : jsDay - 1;
    dayTotals[dayIndex] += Number(expense.amount || 0);
  });

  const ctx = document.getElementById("lineChart");
  if (!ctx) return;

  if (lineChart) {
    lineChart.destroy();
  }

  lineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: daysOfWeek,
      datasets: [
        {
          label: "Expenditure",
          data: dayTotals,
          borderColor: "#2563eb",
          backgroundColor: isDark ? "rgba(37, 99, 235, 0.2)" : "rgba(37, 99, 235, 0.05)",
          fill: true,
          tension: 0.3,
          pointRadius: 3.5,
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 1.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 750,
        easing: "easeOutQuart",
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleFont: { family: "Plus Jakarta Sans" },
          bodyFont: { family: "Plus Jakarta Sans", weight: "600" },
          padding: 8,
          cornerRadius: 6,
          callbacks: {
            label: (ctx) => ` ₹${ctx.raw.toLocaleString("en-IN")}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)",
          },
          ticks: {
            color: isDark ? "#94a3b8" : "#64748b",
            font: { family: "Plus Jakarta Sans", size: 10 },
            callback: (v) => "₹" + v,
          },
        },
        x: {
          grid: { display: false },
          ticks: {
            color: isDark ? "#94a3b8" : "#64748b",
            font: { family: "Plus Jakarta Sans", size: 10 },
          },
        },
      },
    },
  });
}

let activeDashboardCat = "all";

function setupCategoryFilterPills() {
  const pills = document.querySelectorAll(".cat-filter-btn");
  pills.forEach((btn) => {
    btn.addEventListener("click", () => {
      pills.forEach((p) => {
        p.style.borderColor = "var(--border)";
        p.style.background = "var(--surface)";
        p.style.color = "var(--text-secondary)";
      });
      btn.style.borderColor = "var(--primary)";
      btn.style.background = "var(--primary-light)";
      btn.style.color = "var(--primary)";
      activeDashboardCat = btn.getAttribute("data-cat") || "all";
      api.playSound("click");
      loadTransactionsList();
    });
  });
}

function loadTransactionsList() {
  const container = document.getElementById("transactionsContainer");
  if (!container) return;

  container.innerHTML = "";

  let filtered = allDashboardExpenses;

  // Filter by category pill
  if (activeDashboardCat && activeDashboardCat !== "all") {
    filtered = filtered.filter((e) => {
      const cat = (e.category || "").toLowerCase();
      if (activeDashboardCat === "food") return cat.includes("food");
      if (activeDashboardCat === "travel") return cat.includes("travel") || cat.includes("transit");
      if (activeDashboardCat === "shopping") return cat.includes("shopping");
      if (activeDashboardCat === "education") return cat.includes("education") || cat.includes("book");
      if (activeDashboardCat === "other") return !cat.includes("food") && !cat.includes("travel") && !cat.includes("shopping") && !cat.includes("education");
      return true;
    });
  }

  // Filter by search query
  if (dashboardSearchQuery) {
    filtered = filtered.filter((e) => {
      const title = (e.title || "").toLowerCase();
      const cat = (e.category || "").toLowerCase();
      const mood = (e.mood || "").toLowerCase();
      const amt = String(e.amount || "");
      return title.includes(dashboardSearchQuery) || cat.includes(dashboardSearchQuery) || mood.includes(dashboardSearchQuery) || amt.includes(dashboardSearchQuery);
    });
  }

  if (!allDashboardExpenses || allDashboardExpenses.length === 0) {
    container.innerHTML = `
      <div style="padding: 20px 14px; background: var(--bg-subtle); border: 1px dashed var(--border-strong); border-radius: var(--radius-md); text-align: center; width: 100%; box-sizing: border-box; overflow: hidden;">
        <h4 style="font-size: 0.95rem; margin-bottom: 4px; color: var(--text-primary);">No expenses recorded yet</h4>
        <p style="font-size: 0.8125rem; color: var(--text-muted); max-width: 380px; margin: 0 auto 16px;">
          Add your first expense or tap a quick shortcut below to start tracking!
        </p>

        <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-bottom: 14px; width: 100%;">
          <button class="starter-chip" data-title="Canteen Lunch" data-amount="120" data-cat="Food" data-mood="Happy">🍔 Lunch ₹120</button>
          <button class="starter-chip" data-title="Coffee" data-amount="40" data-cat="Food" data-mood="Happy">☕ Coffee ₹40</button>
          <button class="starter-chip" data-title="Metro Pass" data-amount="200" data-cat="Travel" data-mood="Happy">🚌 Metro ₹200</button>
          <button class="starter-chip" data-title="Study Books" data-amount="350" data-cat="Education" data-mood="Happy">📚 Books ₹350</button>
        </div>

        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; width: 100%;">
          <button class="btn btn-primary" onclick="openQuickAddModal()" style="font-size: 0.8125rem; padding: 8px 14px; min-width: 130px;">
            <i class="fa-solid fa-plus"></i> Add Expense
          </button>
          <a href="voice.html" class="btn btn-secondary" style="font-size: 0.8125rem; padding: 8px 14px; min-width: 110px;">
            <i class="fa-solid fa-microphone"></i> Voice Add
          </a>
        </div>
      </div>
    `;

    const starterChips = container.querySelectorAll(".starter-chip");
    starterChips.forEach((chip) => {
      chip.addEventListener("click", async () => {
        const title = chip.getAttribute("data-title");
        const amount = Number(chip.getAttribute("data-amount"));
        const category = chip.getAttribute("data-cat");
        const mood = chip.getAttribute("data-mood") || "Happy";

        chip.disabled = true;
        chip.innerText = "Adding...";

        try {
          await api.addExpense({
            title,
            amount,
            category,
            mood,
            date: new Date().toISOString().split("T")[0],
          });
          api.showToast(`Added ₹${amount} for ${title}`, "success");
          await initDashboard();
        } catch (err) {
          api.showToast("Failed to add expense", "error");
          chip.disabled = false;
        }
      });
    });

    return;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="padding: 24px 16px; text-align: center; color: var(--text-muted); font-size: 0.8125rem;">
        No expenses found for this filter.
      </div>
    `;
    return;
  }

  // Render Swiss Financial Ledger Table & Mobile Native Feed
  const tableWrapper = document.createElement("div");
  tableWrapper.className = "ledger-table-wrapper";

  let tableRowsHtml = "";
  let mobileCardsHtml = "";

  filtered.slice(0, 6).forEach((expense) => {
    const catBadge = getCategoryBadge(expense.category);
    const moodBadge = getMoodBadge(expense.mood);
    const dateFormatted = formatDate(expense.date || expense.createdAt);
    const formattedAmount = Number(expense.amount).toLocaleString("en-IN");

    // Desktop Table Row
    tableRowsHtml += `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(expense.title)}</div>
          <small>${dateFormatted}</small>
        </td>
        <td>${catBadge}</td>
        <td>${moodBadge}</td>
        <td class="text-right amount">₹${formattedAmount}</td>
        <td class="text-right" style="width: 40px;">
          <button class="delete-action-btn" title="Delete" data-id="${expense._id}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;

    // Mobile Transaction Feed Card
    mobileCardsHtml += `
      <div class="mobile-tx-card">
        <div class="mobile-tx-left">
          <div class="mobile-tx-title">${escapeHtml(expense.title)}</div>
          <div class="mobile-tx-meta">
            <span>${dateFormatted}</span>
            <span>•</span>
            ${catBadge}
          </div>
        </div>
        <div class="mobile-tx-right">
          <span class="amount text-rose">₹${formattedAmount}</span>
          <button class="delete-action-btn" title="Delete" data-id="${expense._id}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  });

  tableWrapper.innerHTML = `
    <table class="ledger-table desktop-table-view">
      <thead>
        <tr>
          <th>Item Name</th>
          <th>Category</th>
          <th>Mood</th>
          <th class="text-right">Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
      </tbody>
    </table>

    <div class="mobile-tx-feed">
      ${mobileCardsHtml}
    </div>
  `;

  const deleteBtns = tableWrapper.querySelectorAll(".delete-action-btn");
  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      if (confirm("Delete this expense?")) {
        try {
          await api.deleteExpense(id);
          api.showToast("Expense deleted", "success");
          await initDashboard();
        } catch (err) {
          api.showToast("Failed to delete expense", "error");
          console.error(err);
        }
      }
    });
  });

  container.appendChild(tableWrapper);
}

function openQuickAddModal() {
  const modal = document.getElementById("quickAddModal");
  if (modal) {
    modal.classList.add("active");
    const input = document.getElementById("quickTitle");
    if (input) setTimeout(() => input.focus(), 50);
  }
}

function closeQuickAddModal() {
  const modal = document.getElementById("quickAddModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

window.openQuickAddModal = openQuickAddModal;
window.closeQuickAddModal = closeQuickAddModal;

function setupQuickAddModal() {
  const openBtn = document.getElementById("openQuickAddBtn");
  if (openBtn) openBtn.addEventListener("click", openQuickAddModal);

  // Preset addition buttons
  const presetBtns = document.querySelectorAll(".preset-amt-btn");
  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const addVal = Number(btn.getAttribute("data-add") || 0);
      const amtInput = document.getElementById("quickAmount");
      if (amtInput) {
        const cur = Number(amtInput.value || 0);
        amtInput.value = cur + addVal;
        api.playSound("click");
      }
    });
  });

  const moodPills = document.querySelectorAll(".mood-pill-btn");
  moodPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      moodPills.forEach((p) => {
        p.style.borderColor = "var(--border)";
        p.style.background = "var(--surface)";
        p.style.color = "var(--text-primary)";
      });
      pill.style.borderColor = "var(--primary)";
      pill.style.background = "var(--primary-light)";
      pill.style.color = "var(--primary)";
      quickModalMood = pill.getAttribute("data-mood") || "Happy";
      api.playSound("click");
    });
  });

  const form = document.getElementById("quickAddForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("quickTitle").value;
      const amount = Number(document.getElementById("quickAmount").value);
      const category = document.getElementById("quickCategory").value;
      const saveBtn = document.getElementById("saveQuickExpenseBtn");

      try {
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.innerText = "Recording...";
        }

        await api.addExpense({
          title,
          amount,
          category,
          mood: quickModalMood,
          date: new Date().toISOString().split("T")[0],
        });

        api.showToast(`Recorded ₹${amount} for ${title}`, "success");
        closeQuickAddModal();
        await initDashboard();
      } catch (err) {
        api.showToast(err.message || "Failed to record expense", "error");
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerText = "Record Transaction";
        }
      }
    });
  }
}

function setupExportCSV(expenses) {
  const exportBtn = document.getElementById("exportCsvBtn");
  if (!exportBtn) return;

  exportBtn.addEventListener("click", () => {
    if (!expenses || expenses.length === 0) {
      api.showToast("No transaction records available to export", "error");
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
    document.body.removeChild(link);
    api.showToast("CSV Ledger exported successfully", "success");
  });
}

function setupSearchFilter() {
  const searchInput = document.getElementById("dashboardSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      dashboardSearchQuery = e.target.value.toLowerCase().trim();
      loadTransactionsList();
    });
  }
}

function setupThemeToggle() {
  const themeBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isDark = api.toggleTheme();
      if (themeIcon) {
        themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
      }
      api.getExpenses().then(loadWeeklyTrendChart);
    });

    const isDark = localStorage.getItem("theme") === "dark";
    if (themeIcon) {
      themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadAIInsights() {
  const container = document.getElementById("aiInsightCard");
  if (!container) return;

  try {
    const data = await api.getAIInsights();
    const insightText = (data && (data.insight || data.advice)) || "📊 Spending: Tracking active.\n\n😊 Mood: Keep logging your daily expenses.\n\n💡 Tip: Keep daily streaks going to unlock student rewards!";
    container.innerHTML = escapeHtml(insightText).replace(/\n/g, "<br>");
  } catch (error) {
    container.innerHTML = "📊 Spending: Tracking active.<br><br>😊 Mood: Keep logging your daily expenses.<br><br>💡 Tip: Setting a 10% cap on discretionary snacks saves money.";
  }
}

function loadSmartAlerts(expenses) {
  const alertsBox = document.getElementById("alertsBox");
  if (!alertsBox) return;

  if (!expenses || expenses.length === 0) {
    alertsBox.innerHTML = `<span style="color: var(--accent-emerald);"><i class="fa-solid fa-circle-check"></i> Budget healthy. No threshold breaches detected.</span>`;
    return;
  }

  let foodSpent = 0;
  let totalSpent = 0;
  expenses.forEach((e) => {
    totalSpent += Number(e.amount || 0);
    if ((e.category || "").toLowerCase().includes("food")) {
      foodSpent += Number(e.amount || 0);
    }
  });

  if (foodSpent > 3000) {
    alertsBox.innerHTML = `<span style="color: var(--accent-rose);"><i class="fa-solid fa-triangle-exclamation"></i> Food spending (₹${foodSpent.toLocaleString("en-IN")}) is high this month.</span>`;
  } else {
    alertsBox.innerHTML = `<span style="color: var(--accent-emerald);"><i class="fa-solid fa-circle-check"></i> All category spending is currently within safe limits.</span>`;
  }
}

async function initDashboard() {
  try { setupThemeToggle(); } catch (e) { console.warn("Theme toggle init:", e); }
  try { setupQuickAddModal(); } catch (e) { console.warn("Quick add init:", e); }
  try { setupSearchFilter(); } catch (e) { console.warn("Search filter init:", e); }
  try { setupCategoryFilterPills(); } catch (e) { console.warn("Category pills init:", e); }

  let user = { monthlyBudget: 15000, name: "Student" };
  try { user = await loadUserData(); } catch (e) { console.warn("User load:", e); }

  try { allDashboardExpenses = await api.getExpenses(); } catch (e) { console.warn("Expenses load:", e); }

  try { await loadDashboardData(allDashboardExpenses, user); } catch (e) { console.warn("Dashboard data load:", e); }
  try { loadTransactionsList(); } catch (e) { console.warn("Transactions load:", e); }
  try { loadCategoryChart(allDashboardExpenses); } catch (e) { console.warn("Category chart load:", e); }
  try { loadWeeklyTrendChart(allDashboardExpenses); } catch (e) { console.warn("Weekly chart load:", e); }
  try { loadSmartAlerts(allDashboardExpenses); } catch (e) { console.warn("Alerts load:", e); }
  try { await loadAIInsights(); } catch (e) { console.warn("AI insights load:", e); }
  try { setupExportCSV(allDashboardExpenses); } catch (e) { console.warn("Export CSV init:", e); }
}

document.addEventListener("DOMContentLoaded", initDashboard);