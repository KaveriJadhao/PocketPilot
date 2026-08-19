/**
 * PocketPilot Central API & State Management Client
 */
const API_BASE_URL = window.API_BASE_URL || (window.location.origin && window.location.origin.startsWith("http") ? window.location.origin : "http://localhost:5000");

let audioCtx = null;
function getAudioContext() {
  if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioCtx();
  }
  return audioCtx;
}

const api = {
  getToken() {
    return localStorage.getItem("pocketpilot_token") || "";
  },

  setToken(token) {
    if (token) {
      localStorage.setItem("pocketpilot_token", token);
    } else {
      localStorage.removeItem("pocketpilot_token");
    }
  },

  getUserData() {
    try {
      return JSON.parse(localStorage.getItem("pocketpilot_user") || "{}");
    } catch (e) {
      return {};
    }
  },

  setUserData(user) {
    if (user) {
      localStorage.setItem("pocketpilot_user", JSON.stringify(user));
      if (user.name) localStorage.setItem("userName", user.name);
      if (user.monthlyBudget) localStorage.setItem("monthlyBudget", user.monthlyBudget);
      if (user.savingsGoal) localStorage.setItem("savingsGoal", user.savingsGoal);
    } else {
      localStorage.removeItem("pocketpilot_user");
    }
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.warn(`API [${endpoint}] failed:`, error.message);
      throw error;
    }
  },

  // Auth Methods
  async register(name, email, password, monthlyBudget, savingsGoal) {
    const data = await this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, monthlyBudget, savingsGoal }),
    });
    if (data.token) this.setToken(data.token);
    if (data.user) this.setUserData(data.user);
    return data;
  },

  async login(email, password) {
    const data = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.token) this.setToken(data.token);
    if (data.user) this.setUserData(data.user);
    return data;
  },

  async guestLogin() {
    const data = await this.request("/api/auth/guest", {
      method: "POST",
    });
    if (data.token) this.setToken(data.token);
    if (data.user) this.setUserData(data.user);
    return data;
  },

  async getMe() {
    return await this.request("/api/auth/me");
  },

  // Expense Methods
  async getExpenses() {
    try {
      return await this.request("/api/expenses");
    } catch (error) {
      return [];
    }
  },

  async addExpense(expenseData) {
    this.playSound("success");
    return await this.request("/api/expenses", {
      method: "POST",
      body: JSON.stringify(expenseData),
    });
  },

  async deleteExpense(id) {
    this.playSound("delete");
    return await this.request(`/api/expenses/${id}`, {
      method: "DELETE",
    });
  },

  // User & Profile Methods
  async getUser() {
    try {
      return await this.request("/api/user");
    } catch (error) {
      const cached = this.getUserData();
      return {
        name: cached.name || localStorage.getItem("userName") || "Kaveri",
        streak: 1,
        gems: 0,
        level: 1,
        monthlyBudget: Number(localStorage.getItem("monthlyBudget")) || 15000,
        savingsGoal: Number(localStorage.getItem("savingsGoal")) || 5000,
      };
    }
  },

  async updateProfile(profileData) {
    const data = await this.request("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    if (data.user) this.setUserData(data.user);
    return data;
  },

  async resetData() {
    const data = await this.request("/api/user/reset", {
      method: "DELETE",
    });
    localStorage.clear();
    return data;
  },

  // AI Methods
  async getAIInsights() {
    try {
      return await this.request("/api/ai/insights");
    } catch (error) {
      return {
        insight: "📊 Spending: Tracking active.\n😊 Mood: Positive habit consistency.\n💡 Advisory: All accounts operating within parameters.",
      };
    }
  },

  // Web Audio Synthesizer
  playSound(type = "click") {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "delete") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "voice") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {}
  },

  // Text-To-Speech
  speak(text) {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  },

  // Smooth Numeric Counter Animation
  animateValue(element, start, end, duration = 600, prefix = "₹", suffix = "") {
    if (!element) return;
    const startTime = performance.now();
    const isCurrency = prefix === "₹";

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + (end - start) * easeProgress);

      if (isCurrency) {
        element.innerText = `${prefix}${currentVal.toLocaleString("en-IN")}${suffix}`;
      } else {
        element.innerText = `${prefix}${currentVal}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }

    requestAnimationFrame(updateCounter);
  },

  // Theme Management
  initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  },

  toggleTheme() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    this.playSound("click");
    return isDark;
  },

  showToast(message, type = "success") {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  },

  // Mobile Sidebar Drawer Setup
  setupMobileNav() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    let backdrop = document.querySelector(".sidebar-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "sidebar-backdrop";
      document.body.appendChild(backdrop);
    }

    const toggles = document.querySelectorAll(".mobile-menu-toggle");
    toggles.forEach((btn) => {
      btn.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
        backdrop.classList.toggle("active");
        api.playSound("click");
      });
    });

    backdrop.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open");
      backdrop.classList.remove("active");
    });
  },

  // Global Command Palette (Ctrl+K / Cmd+K)
  setupGlobalCommandPalette() {
    let modal = document.getElementById("commandPaletteModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "commandPaletteModal";
      modal.className = "modal-overlay";
      modal.innerHTML = `
        <div class="command-palette-dialog">
          <div class="palette-input-wrapper">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="paletteSearchInput" class="palette-input" placeholder="Type a command or jump to page... (ESC to close)" autocomplete="off">
          </div>
          <div class="palette-results" id="paletteResultsContainer">
            <a href="dashboard.html" class="palette-item">
              <div class="palette-item-left"><i class="fa-solid fa-chart-pie"></i> Overview Dashboard</div>
              <span class="palette-badge">G D</span>
            </a>
            <a href="add-expense.html" class="palette-item">
              <div class="palette-item-left"><i class="fa-solid fa-plus-circle"></i> Record New Expense</div>
              <span class="palette-badge">G E</span>
            </a>
            <a href="analytics.html" class="palette-item">
              <div class="palette-item-left"><i class="fa-solid fa-chart-line"></i> Analytics & Cash Flow</div>
              <span class="palette-badge">G A</span>
            </a>
            <a href="voice.html" class="palette-item">
              <div class="palette-item-left"><i class="fa-solid fa-microphone"></i> Voice Assistant</div>
              <span class="palette-badge">G V</span>
            </a>
            <a href="rewards.html" class="palette-item">
              <div class="palette-item-left"><i class="fa-solid fa-award"></i> Rewards & Perks Hub</div>
              <span class="palette-badge">G R</span>
            </a>
            <a href="mood.html" class="palette-item">
              <div class="palette-item-left"><i class="fa-solid fa-heart-pulse"></i> Mood Patterns</div>
              <span class="palette-badge">G M</span>
            </a>
            <a href="settings.html" class="palette-item">
              <div class="palette-item-left"><i class="fa-solid fa-sliders"></i> Settings & Preferences</div>
              <span class="palette-badge">G S</span>
            </a>
            <div class="palette-item" id="paletteThemeToggle">
              <div class="palette-item-left"><i class="fa-solid fa-moon"></i> Toggle Dark / Light Theme</div>
              <span class="palette-badge">T</span>
            </div>
            <div class="palette-item" id="palettePrintStatement">
              <div class="palette-item-left"><i class="fa-solid fa-print"></i> Print Financial Statement</div>
              <span class="palette-badge">P</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
        }
      });

      const themeToggle = document.getElementById("paletteThemeToggle");
      if (themeToggle) {
        themeToggle.addEventListener("click", () => {
          api.toggleTheme();
          modal.classList.remove("active");
          api.showToast("Theme toggled", "success");
        });
      }

      const printBtn = document.getElementById("palettePrintStatement");
      if (printBtn) {
        printBtn.addEventListener("click", () => {
          modal.classList.remove("active");
          window.print();
        });
      }

      const searchInput = document.getElementById("paletteSearchInput");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          const query = e.target.value.toLowerCase().trim();
          const items = modal.querySelectorAll(".palette-item");
          items.forEach((item) => {
            const text = item.innerText.toLowerCase();
            item.style.display = text.includes(query) ? "flex" : "none";
          });
        });
      }
    }

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        modal.classList.toggle("active");
        if (modal.classList.contains("active")) {
          const input = document.getElementById("paletteSearchInput");
          if (input) {
            input.value = "";
            input.focus();
            const items = modal.querySelectorAll(".palette-item");
            items.forEach((it) => (it.style.display = "flex"));
          }
        }
      }
      if (e.key === "Escape" && modal.classList.contains("active")) {
        modal.classList.remove("active");
      }
    });
  },

  // Avatar Management
  initAvatar() {
    const seed = localStorage.getItem("userAvatarSeed") || "KaveriPilot";
    const map = {
      "KaveriPilot": "../assets/avatars/avatar-1.svg",
      "ScholarAlex": "../assets/avatars/avatar-2.svg",
      "FinanceGenius": "../assets/avatars/avatar-3.svg",
      "PilotNova": "../assets/avatars/avatar-4.svg",
    };
    const avatarPath = map[seed] || "../assets/avatars/avatar-1.svg";
    const avatarImgs = document.querySelectorAll("#userAvatar, .sidebar-user img");
    avatarImgs.forEach((img) => {
      img.src = avatarPath;
      img.onerror = () => {
        img.src = "../assets/avatar.png";
      };
    });
  },
};

// Initialize theme, responsive mobile nav, global command palette, and user avatar on load
document.addEventListener("DOMContentLoaded", () => {
  api.initTheme();
  api.initAvatar();
  api.setupMobileNav();
  api.setupGlobalCommandPalette();
});
