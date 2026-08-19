/**
 * Lightweight Confetti Particle Canvas Burst
 */
function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#2563eb", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.alpha -= 0.015;
      p.rotation += p.vRot;

      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive) {
      requestAnimationFrame(render);
    } else {
      canvas.remove();
    }
  }

  render();
}

async function loadRewards() {
  const user = await api.getUser();
  const gems = user.gems || 0;
  const level = user.level || 1;
  const name = user.name || "Student";

  const gemsEl = document.getElementById("gemsValue");
  if (gemsEl) gemsEl.innerText = `${gems} Gems`;

  const cardNameEl = document.getElementById("cardUserName");
  if (cardNameEl) cardNameEl.innerText = name;

  const levelEl = document.getElementById("levelValue");
  if (levelEl) levelEl.innerText = `Level ${level} Scholar`;

  // Progress to next tier
  const nextTierPoints = level * 50;
  const currentTierBase = (level - 1) * 50;
  const progressInTier = Math.max(0, gems - currentTierBase);
  const remainingToNext = Math.max(0, 50 - progressInTier);
  const pct = Math.min(Math.round((progressInTier / 50) * 100), 100);

  const nextLevelBadge = document.getElementById("nextLevelBadge");
  if (nextLevelBadge) {
    nextLevelBadge.innerText = `Level ${level + 1} in ${remainingToNext} Gems`;
  }

  const progressBar = document.getElementById("rewardProgress");
  if (progressBar) {
    progressBar.style.width = `${pct}%`;
  }

  // Check milestones
  const milestones = [
    { id: "milestone50", cost: 50 },
    { id: "milestone100", cost: 100 },
    { id: "milestone200", cost: 200 },
    { id: "milestone500", cost: 500 },
  ];

  milestones.forEach((m) => {
    const el = document.getElementById(m.id);
    if (el) {
      if (gems >= m.cost) {
        el.classList.add("achieved");
      } else {
        el.classList.remove("achieved");
      }
    }
  });

  // Setup voucher redemption
  const redeemBtns = document.querySelectorAll(".redeem-btn");
  redeemBtns.forEach((btn) => {
    btn.onclick = async () => {
      const cost = Number(btn.getAttribute("data-cost"));
      const voucherName = btn.getAttribute("data-name");

      if (gems < cost) {
        api.showToast(`Requires ${cost} Gems (You currently have ${gems})`, "error");
        return;
      }

      const promoCode = "PILOT-" + Math.floor(1000 + Math.random() * 9000);
      try {
        await api.updateProfile({ gems: gems - cost });
        api.playSound("success");
        fireConfetti();
        api.showToast(`Unlocked "${voucherName}"! Code: ${promoCode}`, "success");

        const card = btn.closest(".reward-voucher-card");
        if (card) {
          const codeBox = document.createElement("div");
          codeBox.className = "voucher-code-reveal";
          codeBox.innerHTML = `
            <span>${promoCode}</span>
            <button class="btn btn-subtle" style="padding: 3px 8px; font-size: 0.75rem;" onclick="navigator.clipboard.writeText('${promoCode}'); api.playSound('click'); api.showToast('Copied code to clipboard!', 'success');">Copy</button>
          `;
          btn.replaceWith(codeBox);
        }

        loadRewards();
      } catch (err) {
        api.showToast("Failed to redeem perk", "error");
      }
    };
  });
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

  loadRewards();
});