let categoryChartInstance = null;
let weeklyChartInstance = null;
let currentRange = "all";
let allExpenses = [];

async function loadAnalytics() {
  allExpenses = await api.getExpenses();
  const user = await api.getUser();
  renderFilteredAnalytics(user);
}

function filterExpensesByRange(expenses, range) {
  if (range === "all") return expenses;

  const now = new Date();
  if (range === "week") {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return expenses.filter((e) => {
      const d = new Date(e.date || e.createdAt);
      return d >= sevenDaysAgo;
    });
  }

  if (range === "month") {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return expenses.filter((e) => {
      const d = new Date(e.date || e.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }

  return expenses;
}

function renderFilteredAnalytics(user) {
  const filtered = filterExpensesByRange(allExpenses, currentRange);
  const monthlyBudget = Number(user.monthlyBudget) || 15000;

  let total = 0;
  const catMap = {
    "Food & Dining": { amount: 0, count: 0, color: "#2563eb" },
    "Transit & Travel": { amount: 0, count: 0, color: "#059669" },
    "Shopping": { amount: 0, count: 0, color: "#d97706" },
    "Education & Books": { amount: 0, count: 0, color: "#0284c7" },
    "Utilities & Bills": { amount: 0, count: 0, color: "#e11d48" },
    "Other": { amount: 0, count: 0, color: "#64748b" },
  };

  filtered.forEach((expense) => {
    const amount = Number(expense.amount || 0);
    total += amount;

    const cat = (expense.category || "").toLowerCase();
    if (cat.includes("food")) {
      catMap["Food & Dining"].amount += amount;
      catMap["Food & Dining"].count += 1;
    } else if (cat.includes("travel")) {
      catMap["Transit & Travel"].amount += amount;
      catMap["Transit & Travel"].count += 1;
    } else if (cat.includes("shopping")) {
      catMap["Shopping"].amount += amount;
      catMap["Shopping"].count += 1;
    } else if (cat.includes("education") || cat.includes("book")) {
      catMap["Education & Books"].amount += amount;
      catMap["Education & Books"].count += 1;
    } else if (cat.includes("bill") || cat.includes("recharge")) {
      catMap["Utilities & Bills"].amount += amount;
      catMap["Utilities & Bills"].count += 1;
    } else {
      catMap["Other"].amount += amount;
      catMap["Other"].count += 1;
    }
  });

  // KPI Calculations
  const totalEl = document.getElementById("totalSpending");
  if (totalEl) totalEl.innerText = "₹" + total.toLocaleString("en-IN");

  const daysPassed = Math.max(1, new Date().getDate());
  const dailyBurn = Math.round(total / (currentRange === "week" ? 7 : daysPassed));
  const dailyBurnEl = document.getElementById("dailyBurnFooter");
  if (dailyBurnEl) dailyBurnEl.innerText = `₹${dailyBurn.toLocaleString("en-IN")} / day average burn`;

  // Budget Variance
  const remaining = Math.max(0, monthlyBudget - total);
  const variancePct = monthlyBudget > 0 ? Math.max(0, Math.round((remaining / monthlyBudget) * 100)) : 100;
  const varianceEl = document.getElementById("budgetVariance");
  if (varianceEl) varianceEl.innerText = `${variancePct}%`;

  const remainingEl = document.getElementById("remainingBudgetFooter");
  if (remainingEl) remainingEl.innerText = `₹${remaining.toLocaleString("en-IN")} allowance remaining`;

  // Projected Month-End Spend
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const projected = dailyBurn * daysInMonth;
  const projectedEl = document.getElementById("projectedSpend");
  if (projectedEl) projectedEl.innerText = "₹" + (total > 0 ? projected.toLocaleString("en-IN") : "0");

  // Primary Category
  let topCat = "None";
  let topAmount = 0;
  Object.entries(catMap).forEach(([name, data]) => {
    if (data.amount > topAmount) {
      topAmount = data.amount;
      topCat = name;
    }
  });

  const topCatEl = document.getElementById("highestCategory");
  if (topCatEl) topCatEl.innerText = topCat;

  const topCatPct = total > 0 ? Math.round((topAmount / total) * 100) : 0;
  const topCatPctEl = document.getElementById("highestCategoryPct");
  if (topCatPctEl) topCatPctEl.innerText = `${topCatPct}% of total allocation`;

  renderCategoryBars(catMap, total);
  renderCategoryTable(catMap, total, monthlyBudget);
  createCategoryChart(catMap);
  createWeeklyChart(filtered);
}

function renderCategoryBars(catMap, total) {
  const container = document.getElementById("categoryListContainer");
  if (!container) return;
  container.innerHTML = "";

  Object.entries(catMap).forEach(([name, data]) => {
    const pct = total > 0 ? Math.round((data.amount / total) * 100) : 0;

    const row = document.createElement("div");
    row.className = "category-bar-row";
    row.innerHTML = `
      <div class="category-bar-header">
        <span class="cat-name">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: ${data.color}; display: inline-block;"></span>
          ${name}
        </span>
        <span class="cat-amount">₹${data.amount.toLocaleString("en-IN")} <small style="color: var(--text-muted); font-weight: 500;">(${pct}%)</small></span>
      </div>
      <div class="progress-track" style="height: 5px;">
        <div class="progress-fill" style="width: ${pct}%; background-color: ${data.color};"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderCategoryTable(catMap, total, monthlyBudget) {
  const wrapper = document.getElementById("categoryTableWrapper");
  if (!wrapper) return;

  let tableRowsHtml = "";
  let mobileCardsHtml = "";

  Object.entries(catMap).forEach(([name, data]) => {
    const pct = total > 0 ? Math.round((data.amount / total) * 100) : 0;
    const avg = data.count > 0 ? Math.round(data.amount / data.count) : 0;
    const statusBadge =
      pct > 40
        ? `<span class="badge badge-rose">High Spend</span>`
        : pct > 20
        ? `<span class="badge badge-amber">Moderate</span>`
        : `<span class="badge badge-emerald">Within Budget</span>`;

    // Desktop Table Row
    tableRowsHtml += `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${data.color};"></span>
            ${name}
          </div>
        </td>
        <td>${data.count} transaction${data.count === 1 ? '' : 's'}</td>
        <td class="text-right amount">₹${avg.toLocaleString("en-IN")}</td>
        <td class="text-right amount">₹${data.amount.toLocaleString("en-IN")} <small style="color: var(--text-muted);">(${pct}%)</small></td>
        <td class="text-right">${statusBadge}</td>
      </tr>
    `;

    // Mobile Card View
    mobileCardsHtml += `
      <div class="mobile-category-card">
        <div class="mobile-category-left">
          <div class="mobile-category-title">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: ${data.color}; flex-shrink: 0;"></span>
            <span>${name}</span>
          </div>
          <div class="mobile-category-meta">
            <span>${data.count} txns</span>
            <span>•</span>
            <span>Avg ₹${avg.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <div class="mobile-category-right">
          <div class="amount text-primary">₹${data.amount.toLocaleString("en-IN")} <small style="color: var(--text-muted);">(${pct}%)</small></div>
          <div style="margin-top: 2px;">${statusBadge}</div>
        </div>
      </div>
    `;
  });

  wrapper.innerHTML = `
    <table class="ledger-table desktop-table-view">
      <thead>
        <tr>
          <th>Category</th>
          <th>Transactions</th>
          <th class="text-right">Avg Spend</th>
          <th class="text-right">Total Spent</th>
          <th class="text-right">Status</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
      </tbody>
    </table>

    <div class="mobile-category-feed">
      ${mobileCardsHtml}
    </div>
  `;
}

function createCategoryChart(catMap) {
  const ctx = document.getElementById("categoryChart");
  if (!ctx) return;

  const labels = Object.keys(catMap);
  const values = Object.values(catMap).map((d) => d.amount);
  const colors = Object.values(catMap).map((d) => d.color);

  const hasData = values.some((v) => v > 0);
  const chartData = hasData ? values : [20, 20, 20, 20, 10, 10];
  const chartColors = hasData
    ? colors
    : ["rgba(37, 99, 235, 0.15)", "rgba(5, 150, 105, 0.15)", "rgba(217, 119, 6, 0.15)", "rgba(2, 132, 199, 0.15)", "rgba(225, 29, 72, 0.15)", "rgba(100, 116, 139, 0.15)"];

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  categoryChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: chartData,
          backgroundColor: chartColors,
          borderWidth: 0,
          cutout: "75%",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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

function createWeeklyChart(expenses) {
  const isDark = document.body.classList.contains("dark");
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyData = [0, 0, 0, 0, 0, 0, 0];

  expenses.forEach((expense) => {
    const expenseDate = expense.date ? new Date(expense.date) : new Date(expense.createdAt || Date.now());
    let jsDay = expenseDate.getDay();
    let dayIndex = jsDay === 0 ? 6 : jsDay - 1;
    weeklyData[dayIndex] += Number(expense.amount || 0);
  });

  const ctx = document.getElementById("weeklyChart");
  if (!ctx) return;

  if (weeklyChartInstance) {
    weeklyChartInstance.destroy();
  }

  weeklyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: daysOfWeek,
      datasets: [
        {
          label: "Expenditure",
          data: weeklyData,
          borderColor: "#2563eb",
          backgroundColor: isDark ? "rgba(37, 99, 235, 0.2)" : "rgba(37, 99, 235, 0.05)",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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

document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isDark = api.toggleTheme();
      if (themeIcon) themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
      loadAnalytics();
    });
    const isDark = localStorage.getItem("theme") === "dark";
    if (themeIcon) themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }

  // Timeframe switcher pills
  const timeframeBtns = document.querySelectorAll(".timeframe-btn");
  timeframeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      timeframeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentRange = btn.getAttribute("data-range");
      api.getUser().then((user) => renderFilteredAnalytics(user));
    });
  });

  loadAnalytics();
});