const moodBtns = document.querySelectorAll(".mood-btn");
const form = document.getElementById("expenseForm");
const expenseContainer = document.getElementById("expenseContainer");
const expenseDateInput = document.getElementById("expenseDate");
const expenseCountText = document.getElementById("expenseCountText");
const searchInput = document.getElementById("expenseSearchInput");
const sortSelect = document.getElementById("expenseSortSelect");

let selectedMood = "Happy";
let allExpenses = [];
let searchQuery = "";
let currentSort = "newest";

if (expenseDateInput) {
  expenseDateInput.value = new Date().toISOString().split("T")[0];
}

moodBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    moodBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMood = btn.getAttribute("data-mood") || "Happy";
  });
});

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
  if (m.includes("happy") || m.includes("positive")) return `<span class="badge badge-emerald">Happy</span>`;
  if (m.includes("stressed") || m.includes("stress")) return `<span class="badge badge-rose">Stressed</span>`;
  if (m.includes("bored")) return `<span class="badge badge-amber">Bored</span>`;
  if (m.includes("sad") || m.includes("low")) return `<span class="badge badge-sapphire">Sad</span>`;
  return `<span class="badge badge-neutral">${escapeHtml(mood || "Happy")}</span>`;
}

function formatDate(dateString) {
  if (!dateString) return "Recent";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "Recent";
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
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

function setFormValues(title, amount, category, mood) {
  const titleInput = document.getElementById("title");
  const amountInput = document.getElementById("amount");
  const catSelect = document.getElementById("category");

  if (titleInput) titleInput.value = title;
  if (amountInput) {
    amountInput.value = amount;
    amountInput.focus();
  }
  if (catSelect) catSelect.value = category;

  moodBtns.forEach((b) => {
    if (b.getAttribute("data-mood") === mood) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });
  selectedMood = mood;
}

async function fetchExpenses() {
  allExpenses = await api.getExpenses();
  renderExpenseList();
}

function renderExpenseList() {
  expenseContainer.innerHTML = "";

  let filtered = [...allExpenses];

  // Apply search filter
  if (searchQuery) {
    filtered = filtered.filter((e) => {
      const title = (e.title || "").toLowerCase();
      const cat = (e.category || "").toLowerCase();
      const mood = (e.mood || "").toLowerCase();
      const amt = String(e.amount || "");
      return title.includes(searchQuery) || cat.includes(searchQuery) || mood.includes(searchQuery) || amt.includes(searchQuery);
    });
  }

  // Apply sorting
  if (currentSort === "highest") {
    filtered.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
  } else if (currentSort === "lowest") {
    filtered.sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0));
  } else {
    filtered.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }

  if (expenseCountText) {
    expenseCountText.innerText = `${filtered.length} expense${filtered.length === 1 ? '' : 's'}`;
  }

  if (!allExpenses || allExpenses.length === 0) {
    expenseContainer.innerHTML = `
      <div style="padding: 28px 18px; background: var(--bg-subtle); border: 1px dashed var(--border-strong); border-radius: var(--radius-md); text-align: center;">
        <div style="width: 42px; height: 42px; border-radius: var(--radius-xs); background: var(--surface); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.15rem; margin: 0 auto 10px; border: 1px solid var(--border);">
          <i class="fa-solid fa-receipt"></i>
        </div>
        <h4 style="font-size: 0.95rem; margin-bottom: 4px; color: var(--text-primary);">No expenses recorded yet</h4>
        <p style="font-size: 0.8125rem; color: var(--text-muted); max-width: 360px; margin: 0 auto 16px;">
          Tap a shortcut below to fill the form quickly, or enter your expense on the left.
        </p>

        <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; letter-spacing: 0.05em;">
          Quick Shortcuts
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-bottom: 16px;">
          <button class="expense-template-chip" data-title="Canteen Lunch" data-amount="120" data-cat="Food" data-mood="Happy">🍔 Lunch ₹120</button>
          <button class="expense-template-chip" data-title="Campus Coffee" data-amount="40" data-cat="Food" data-mood="Happy">☕ Coffee ₹40</button>
          <button class="expense-template-chip" data-title="Metro Pass" data-amount="200" data-cat="Travel" data-mood="Happy">🚌 Metro ₹200</button>
          <button class="expense-template-chip" data-title="Study Books" data-amount="350" data-cat="Education" data-mood="Happy">📚 Books ₹350</button>
          <button class="expense-template-chip" data-title="Mobile Recharge" data-amount="299" data-cat="Bills" data-mood="Happy">⚡ Recharge ₹299</button>
        </div>

        <div style="font-size: 0.75rem; color: var(--text-dim);">
          Tap any button to fill the details automatically.
        </div>
      </div>
    `;

    const chips = expenseContainer.querySelectorAll(".expense-template-chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const title = chip.getAttribute("data-title");
        const amount = chip.getAttribute("data-amount");
        const category = chip.getAttribute("data-cat");
        const mood = chip.getAttribute("data-mood");
        setFormValues(title, amount, category, mood);
        api.showToast(`Selected "${title}" shortcut`, "info");
      });
    });

    return;
  }

  if (filtered.length === 0) {
    expenseContainer.innerHTML = `
      <div style="padding: 24px 16px; text-align: center; color: var(--text-muted); font-size: 0.8125rem;">
        No expenses found matching "${escapeHtml(searchQuery)}".
      </div>
    `;
    return;
  }

  // Render Swiss Financial Ledger Table & Mobile Native Feed for Expenses Page
  const tableWrapper = document.createElement("div");
  tableWrapper.className = "ledger-table-wrapper";

  let tableRowsHtml = "";
  let mobileCardsHtml = "";

  filtered.forEach((expense) => {
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
          <button class="delete-action-btn" title="Delete Expense" data-id="${expense._id}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;

    // Mobile Transaction Card
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
          <button class="delete-action-btn" title="Delete Expense" data-id="${expense._id}">
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
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Delete this expense?")) {
        try {
          await api.deleteExpense(id);
          api.showToast("Expense deleted", "success");
          fetchExpenses();
        } catch (err) {
          api.showToast("Failed to delete", "error");
        }
      }
    });
  });

  expenseContainer.appendChild(tableWrapper);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titleVal = document.getElementById("title").value;
  const amountVal = document.getElementById("amount").value;
  const categoryVal = document.getElementById("category").value;
  const dateVal = expenseDateInput ? expenseDateInput.value : new Date();
  const submitBtn = document.getElementById("submitBtn");

  const expenseData = {
    title: titleVal,
    amount: Number(amountVal),
    category: categoryVal,
    mood: selectedMood,
    date: dateVal,
  };

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Saving...";
    }

    await api.addExpense(expenseData);
    api.showToast(`Recorded ₹${amountVal} for ${titleVal}`, "success");

    form.reset();
    if (expenseDateInput) {
      expenseDateInput.value = new Date().toISOString().split("T")[0];
    }
    moodBtns.forEach((b) => b.classList.remove("active"));
    if (moodBtns[0]) moodBtns[0].classList.add("active");
    selectedMood = "Happy";

    await fetchExpenses();
  } catch (error) {
    api.showToast(error.message || "Failed to save expense", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Save Entry`;
    }
  }
});

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

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderExpenseList();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderExpenseList();
    });
  }

  fetchExpenses();
});
