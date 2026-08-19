let allMoodExpenses = [];
let activeMoodFilter = "all";

function getCategoryBadge(category) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("food")) return `<span class="badge badge-sapphire">Food & Dining</span>`;
  if (cat.includes("travel")) return `<span class="badge badge-emerald">Transit</span>`;
  if (cat.includes("shopping")) return `<span class="badge badge-amber">Shopping</span>`;
  if (cat.includes("education") || cat.includes("book")) return `<span class="badge badge-sapphire">Education</span>`;
  if (cat.includes("bill") || cat.includes("recharge")) return `<span class="badge badge-rose">Utilities</span>`;
  return `<span class="badge badge-neutral">${category || "Other"}</span>`;
}

function getMoodBadge(mood) {
  const m = (mood || "").toLowerCase();
  if (m.includes("happy") || m.includes("positive")) return `<span class="badge badge-emerald">Positive & Planned</span>`;
  if (m.includes("stressed") || m.includes("stress")) return `<span class="badge badge-rose">Stress-Induced</span>`;
  if (m.includes("bored")) return `<span class="badge badge-amber">Boredom Scrolling</span>`;
  if (m.includes("sad") || m.includes("low")) return `<span class="badge badge-sapphire">Low Energy</span>`;
  return `<span class="badge badge-neutral">${mood || "Neutral"}</span>`;
}

function formatDate(dateString) {
  if (!dateString) return "Recent";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "Recent";
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

async function loadMoodData() {
  allMoodExpenses = await api.getExpenses();

  let total = 0;
  let happy = 0;
  let stressed = 0;
  let bored = 0;
  let sad = 0;

  allMoodExpenses.forEach((expense) => {
    const amount = Number(expense.amount || 0);
    total += amount;
    const mood = (expense.mood || "").toLowerCase();

    if (mood.includes("happy") || mood.includes("positive")) {
      happy += amount;
    } else if (mood.includes("stressed") || mood.includes("stress")) {
      stressed += amount;
    } else if (mood.includes("bored")) {
      bored += amount;
    } else if (mood.includes("sad") || mood.includes("low")) {
      sad += amount;
    } else {
      happy += amount;
    }
  });

  const happyEl = document.getElementById("happyAmount");
  if (happyEl) happyEl.innerText = "₹" + happy.toLocaleString("en-IN");

  const stressedEl = document.getElementById("stressedAmount");
  if (stressedEl) stressedEl.innerText = "₹" + stressed.toLocaleString("en-IN");

  const boredEl = document.getElementById("boredAmount");
  if (boredEl) boredEl.innerText = "₹" + bored.toLocaleString("en-IN");

  const sadEl = document.getElementById("sadAmount");
  if (sadEl) sadEl.innerText = "₹" + sad.toLocaleString("en-IN");

  const happyPct = total > 0 ? Math.round((happy / total) * 100) : 0;
  const stressedPct = total > 0 ? Math.round((stressed / total) * 100) : 0;
  const boredPct = total > 0 ? Math.round((bored / total) * 100) : 0;
  const sadPct = total > 0 ? Math.round((sad / total) * 100) : 0;

  const happySub = document.getElementById("happySub");
  if (happySub) happySub.innerText = `${happyPct}% of total outflow`;

  const stressedSub = document.getElementById("stressedSub");
  if (stressedSub) stressedSub.innerText = `${stressedPct}% of total outflow`;

  const boredSub = document.getElementById("boredSub");
  if (boredSub) boredSub.innerText = `${boredPct}% of total outflow`;

  const sadSub = document.getElementById("sadSub");
  if (sadSub) sadSub.innerText = `${sadPct}% of total outflow`;

  // Spending Control Index calculation
  const iqScore = total > 0 ? Math.max(10, Math.min(100, Math.round(100 - (stressedPct * 0.7 + boredPct * 0.5)))) : 100;
  const iqEl = document.getElementById("iqNumber");
  if (iqEl) iqEl.innerText = `${iqScore}%`;

  const iqBadge = document.getElementById("iqBadge");
  const iqLabel = document.getElementById("iqLabel");
  const iqSubtext = document.getElementById("iqSubtext");

  if (iqScore >= 80) {
    if (iqBadge) { iqBadge.className = "badge badge-emerald"; iqBadge.innerText = "High Discipline"; }
    if (iqLabel) iqLabel.innerText = "Controlled Habit Profile";
    if (iqSubtext) iqSubtext.innerText = `${happyPct}% of spending occurred under planned mindsets.`;
  } else if (iqScore >= 50) {
    if (iqBadge) { iqBadge.className = "badge badge-amber"; iqBadge.innerText = "Moderate Impulse"; }
    if (iqLabel) iqLabel.innerText = "Mixed Spending Discipline";
    if (iqSubtext) iqSubtext.innerText = `${stressedPct + boredPct}% of spending driven by stress/boredom.`;
  } else {
    if (iqBadge) { iqBadge.className = "badge badge-rose"; iqBadge.innerText = "Impulse Risk"; }
    if (iqLabel) iqLabel.innerText = "High Emotional Outflow";
    if (iqSubtext) iqSubtext.innerText = `Significant outflows recorded under stress triggers.`;
  }

  renderMoodTransactions();
}

function renderMoodTransactions() {
  const container = document.getElementById("moodTransactions");
  if (!container) return;

  container.innerHTML = "";

  let filtered = allMoodExpenses;
  if (activeMoodFilter !== "all") {
    filtered = allMoodExpenses.filter((e) => {
      const m = (e.mood || "").toLowerCase();
      if (activeMoodFilter === "happy") return m.includes("happy") || m.includes("positive");
      if (activeMoodFilter === "stressed") return m.includes("stressed") || m.includes("stress");
      if (activeMoodFilter === "bored") return m.includes("bored");
      if (activeMoodFilter === "sad") return m.includes("sad") || m.includes("low");
      return true;
    });
  }

  if (!filtered || filtered.length === 0) {
    container.innerHTML = `
      <div style="padding: 28px 16px; background: var(--bg-subtle); border: 1px dashed var(--border-strong); border-radius: var(--radius-sm); text-align: center;">
        <h4 style="font-size: 0.9375rem; color: var(--text-primary); margin-bottom: 4px;">No records under this filter</h4>
        <p style="font-size: 0.8125rem; color: var(--text-muted);">
          No transactions match the selected psychological state filter.
        </p>
      </div>
    `;
    return;
  }

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "ledger-table-wrapper";

  let rowsHtml = "";
  filtered.forEach((expense) => {
    const catBadge = getCategoryBadge(expense.category);
    const moodBadge = getMoodBadge(expense.mood);
    const dateFormatted = formatDate(expense.date || expense.createdAt);

    rowsHtml += `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--text-primary); font-size: 0.875rem;">${expense.title}</div>
          <small>${dateFormatted}</small>
        </td>
        <td>${catBadge}</td>
        <td>${moodBadge}</td>
        <td class="text-right amount">₹${Number(expense.amount).toLocaleString("en-IN")}</td>
      </tr>
    `;
  });

  tableWrapper.innerHTML = `
    <table class="ledger-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Category</th>
          <th>Behavioral Tag</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;

  container.appendChild(tableWrapper);
}

document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isDark = api.toggleTheme();
      if (themeIcon) themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    });
    const isDark = localStorage.getItem("theme") === "dark";
    if (themeIcon) themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }

  // Mood filter buttons
  const tabs = document.querySelectorAll(".mood-tab-btn");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeMoodFilter = tab.getAttribute("data-mood");
      renderMoodTransactions();
    });
  });

  loadMoodData();
});