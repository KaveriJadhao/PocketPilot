const voiceBtn = document.getElementById("voiceBtn");
const spokenText = document.getElementById("spokenText");
const voiceHeroCard = document.getElementById("voiceHeroCard");
const voiceStatusBadge = document.getElementById("voiceStatusBadge");
const hudTitle = document.getElementById("hudTitle");
const hudAmount = document.getElementById("hudAmount");
const hudCategory = document.getElementById("hudCategory");
const hudMood = document.getElementById("hudMood");
const confirmBtn = document.getElementById("confirmVoiceEntryBtn");
const recentVoiceList = document.getElementById("recentVoiceList");

let pendingTransaction = null;
let recentLogs = [];

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function parseVoiceCommand(text) {
  let title = "Expense";
  let amount = 0;
  let category = "Other";
  let mood = "Happy";

  // Match numbers (e.g. 150, 1500, etc.)
  const amountMatch = text.match(/(\d+)/);
  if (amountMatch) {
    amount = Number(amountMatch[1]);
  }

  const lower = text.toLowerCase();

  // Category determination
  if (lower.includes("lunch") || lower.includes("food") || lower.includes("dinner") || lower.includes("canteen") || lower.includes("coffee") || lower.includes("burger") || lower.includes("pizza")) {
    category = "Food";
    title = lower.includes("coffee") ? "Coffee" : lower.includes("lunch") ? "Canteen Lunch" : "Food Order";
  } else if (lower.includes("metro") || lower.includes("travel") || lower.includes("bus") || lower.includes("cab") || lower.includes("uber") || lower.includes("auto") || lower.includes("ticket")) {
    category = "Travel";
    title = lower.includes("metro") ? "Metro Pass" : "Transit Ticket";
  } else if (lower.includes("book") || lower.includes("study") || lower.includes("pen") || lower.includes("tuition") || lower.includes("exam")) {
    category = "Education";
    title = lower.includes("book") ? "Academic Books" : "Study Supplies";
  } else if (lower.includes("movie") || lower.includes("cinema") || lower.includes("netflix") || lower.includes("game")) {
    category = "Entertainment";
    title = lower.includes("movie") ? "Cinema Ticket" : "Entertainment";
  } else if (lower.includes("shopping") || lower.includes("cloth") || lower.includes("shoe")) {
    category = "Shopping";
    title = "Shopping";
  } else if (lower.includes("recharge") || lower.includes("bill") || lower.includes("electricity")) {
    category = "Bills";
    title = "Utility Bill";
  } else {
    title = "Voice Expense";
  }

  // Mood determination
  if (lower.includes("stress") || lower.includes("hurry") || lower.includes("rush") || lower.includes("late")) {
    mood = "Stressed";
  } else if (lower.includes("bore") || lower.includes("idle")) {
    mood = "Bored";
  } else if (lower.includes("sad") || lower.includes("tired")) {
    mood = "Sad";
  } else {
    mood = "Happy";
  }

  return { title, amount, category, mood };
}

function updateHUD(parsed, rawText) {
  pendingTransaction = parsed;

  if (spokenText) spokenText.innerText = `"${rawText}"`;
  if (hudTitle) hudTitle.innerText = parsed.title;
  if (hudAmount) hudAmount.innerText = `₹${parsed.amount.toLocaleString("en-IN")}`;

  if (hudCategory) {
    hudCategory.innerHTML = `<span class="badge badge-sapphire">${parsed.category}</span>`;
  }

  if (hudMood) {
    hudMood.innerHTML = `<span class="badge badge-emerald">${parsed.mood}</span>`;
  }

  if (confirmBtn) {
    if (parsed.amount > 0) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = `<i class="fa-solid fa-check"></i> Save ₹${parsed.amount} for ${parsed.title}`;
      api.playSound("success");
      api.speak(`Got ${parsed.title} for ${parsed.amount} rupees.`);
    } else {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Amount not heard`;
    }
  }
}

async function confirmAndLog() {
  if (!pendingTransaction || pendingTransaction.amount <= 0) return;

  try {
    confirmBtn.disabled = true;
    confirmBtn.innerText = "Saving...";

    await api.addExpense({
      title: pendingTransaction.title,
      amount: pendingTransaction.amount,
      category: pendingTransaction.category,
      mood: pendingTransaction.mood,
      date: new Date().toISOString().split("T")[0],
    });

    api.showToast(`Saved ₹${pendingTransaction.amount} for ${pendingTransaction.title}`, "success");
    api.speak(`Saved ${pendingTransaction.title}.`);

    // Add to recent logs
    recentLogs.unshift({ ...pendingTransaction, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    renderRecentLogs();

    confirmBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Saved Successfully!`;
    setTimeout(() => {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<i class="fa-solid fa-check"></i> Save This Expense`;
    }, 2000);
  } catch (error) {
    api.showToast("Failed to save expense", "error");
    confirmBtn.disabled = false;
  }
}

function renderRecentLogs() {
  if (!recentVoiceList) return;

  if (recentLogs.length === 0) {
    recentVoiceList.innerHTML = `<div style="font-size: 0.8125rem; color: var(--text-muted); text-align: center; padding: 12px;">No voice expenses added yet today.</div>`;
    return;
  }

  recentVoiceList.innerHTML = recentLogs
    .slice(0, 4)
    .map(
      (log) => `
      <div class="recent-voice-item">
        <div>
          <strong style="color: var(--text-primary);">${log.title}</strong>
          <small style="color: var(--text-muted); margin-left: 6px;">${log.time}</small>
        </div>
        <span class="amount text-rose" style="font-weight: 700;">₹${log.amount.toLocaleString("en-IN")}</span>
      </div>
    `
    )
    .join("");
}

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceBtn.addEventListener("click", () => {
    try {
      api.playSound("voice");
      recognition.start();
      if (voiceHeroCard) voiceHeroCard.classList.add("listening");
      if (voiceStatusBadge) {
        voiceStatusBadge.className = "badge badge-rose";
        voiceStatusBadge.innerText = "Listening...";
      }
      if (spokenText) spokenText.innerText = "Listening... please speak now";
    } catch (e) {
      console.warn("Recognition already active");
    }
  });

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    if (voiceHeroCard) voiceHeroCard.classList.remove("listening");
    if (voiceStatusBadge) {
      voiceStatusBadge.className = "badge badge-emerald";
      voiceStatusBadge.innerText = "Detected";
    }

    const parsed = parseVoiceCommand(speechResult);
    updateHUD(parsed, speechResult);
  };

  recognition.onerror = () => {
    if (voiceHeroCard) voiceHeroCard.classList.remove("listening");
    if (voiceStatusBadge) {
      voiceStatusBadge.className = "badge badge-amber";
      voiceStatusBadge.innerText = "Ready";
    }
    if (spokenText) spokenText.innerText = "No audio detected. Try again or tap a sample prompt.";
  };

  recognition.onend = () => {
    if (voiceHeroCard) voiceHeroCard.classList.remove("listening");
    if (voiceStatusBadge && voiceStatusBadge.innerText === "Listening...") {
      voiceStatusBadge.className = "badge badge-sapphire";
      voiceStatusBadge.innerText = "Awaiting Input";
    }
  };
} else {
  if (spokenText) spokenText.innerText = "Speech recognition is not supported in this browser. Use sample prompts below.";
}

// Sample prompt chips click handler
const promptChips = document.querySelectorAll(".prompt-chip");
promptChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    api.playSound("click");
    const text = chip.getAttribute("data-cmd");
    const parsed = parseVoiceCommand(text);
    if (voiceStatusBadge) {
      voiceStatusBadge.className = "badge badge-emerald";
      voiceStatusBadge.innerText = "Simulated";
    }
    updateHUD(parsed, text);
  });
});

if (confirmBtn) {
  confirmBtn.addEventListener("click", confirmAndLog);
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
});