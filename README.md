# 🧭 PocketPilot — Intelligent Student Finance OS

<div align="center">

  <h3>Simple, Smart & Gamified Expense Tracker for College Students</h3>

  <p>
    Track daily spends hands-free using Voice AI, manage monthly allowances, curb emotional impulse shopping, and earn real student rewards with AI coaching.
  </p>

  <p>
    <a href="https://pocket-pilot-three.vercel.app/"><img src="https://img.shields.io/badge/🚀_Live_Demo-pocket--pilot--three.vercel.app-2563eb?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo on Vercel" /></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/Backend-Node.js_%7C_Express-059669?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Backend" /></a>
    <a href="#-tech-stack"><img src="https://img.shields.io/badge/AI-Groq_Llama_3.3-d97706?style=for-the-badge&logo=meta&logoColor=white" alt="AI Groq" /></a>
    <a href="#-license"><img src="https://img.shields.io/badge/License-ISC-64748b?style=for-the-badge" alt="License" /></a>
  </p>

</div>

---

## 🌐 Live Application Link

Experience the live application deployed on Vercel:  
👉 **[https://pocket-pilot-three.vercel.app/](https://pocket-pilot-three.vercel.app/)**

---

## 📸 Visual Tour & Screenshots

### 🧭 1. Overview Dashboard
> *Your central student budget cockpit with live allowance gauges, daily safe spend limits, AI insights, and recent transactions.*

<div align="center">
  <img src="Screenshots/Dashboard1.png" alt="PocketPilot Dashboard" width="850" />
</div>

<br />

### 🎙️ 2. Voice AI Assistant & 📈 Category Analytics

| 🎙️ Hands-Free Voice AI Logger | 📈 Spending Analytics & Category Share |
| :---: | :---: |
| <img src="Screenshots/VoiceAI.png" alt="Voice AI Assistant" width="420" /> | <img src="Screenshots/Analytics.png" alt="Spending Analytics" width="420" /> |
| *Real-time speech recognition, detected HUD, and 1-tap logging.* | *Doughnut category share, weekly trends, and daily burn rate.* |

<br />

### 🎁 3. Rewards Hub & 💓 Mood Spending Tracker

| 🎁 Streaks, Gems & Student Coupons | 💓 Mood-Based Spending Habits |
| :---: | :---: |
| <img src="Screenshots/Rewards.png" alt="Rewards & Coupons Hub" width="420" /> | <img src="Screenshots/Mood%20Tracker.png" alt="Mood Tracker" width="420" /> |
| *Maintain daily logging streaks, earn gems, and unlock food perks.* | *Track emotional triggers (Happy, Stressed, Bored, Sad) to curb impulse buys.* |

<br />

### 🔐 4. Authentication & ⚙️ Profile Settings

| 🔐 Clean Student Sign In | ⚙️ Profile & Budget Settings |
| :---: | :---: |
| <img src="Screenshots/Login.png" alt="Sign In Page" width="420" /> | <img src="Screenshots/Setting.png" alt="Settings Page" width="420" /> |
| *Secure JWT authentication, password toggle, and instant demo access.* | *Custom avatar picker, monthly allowance limits, and data export.* |

---

## ✨ Key Features

- 🎙️ **Voice AI Logging**: Speak naturally (e.g., *"Spent ₹60 on canteen sandwich"*) to log expenses in 2 seconds without typing.
- 📊 **Live Student Budgeting**: Real-time tracking of monthly allowance, total spent, and safe daily velocity limits.
- 😊 **Mood & Behavioral Analytics**: Understand emotional spending triggers to reduce impulse shopping during exams or stress.
- 🎮 **Gamification & Rewards**: Earn gems for daily logging, level up from Bronze to Gold Scholar, and claim student food discounts.
- 🧠 **AI Financial Advice**: Smart 3-point daily coaching generated from your spending habits with rupee savings tips.
- 🔐 **Privacy & Multi-User Isolation**: Encrypted passwords with bcrypt, stateless JWT security tokens, and 100% private expense ledgers.
- 🌓 **Swiss Sapphire Dark Mode**: Modern, clean design with seamless theme switching and full mobile responsiveness.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 Custom Tokens, Vanilla JavaScript (ES6+), Chart.js, Web Speech API, FontAwesome.
- **Backend**: Node.js, Express.js (v5), JSON Web Tokens (JWT), bcryptjs, CORS.
- **Database & AI**: MongoDB Atlas & Groq Llama 3.3 AI *(with zero-failure offline fallback mode)*.
- **Deployment**: Vercel Serverless Platform.

---

## 🚀 Quickstart & Local Installation

### 1. Clone the Repository
```bash
git clone https://github.com/KaveriJadhao/PocketPilot.git
cd PocketPilot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
# Start backend server
node Backend/server.js
```

Open **[http://localhost:5000](http://localhost:5000)** in your browser! 🎉

---

## 🧭 Page Map

| Page | Route | Description |
| :--- | :--- | :--- |
| **🏠 Landing Page** | `/` | Hero, live app preview, feature guides & FAQ |
| **🔐 Sign In** | `/login` | Access your student account |
| **✍️ Create Account** | `/signup` | Register a new student profile |
| **🧭 Setup Profile** | `/onboarding` | Select avatar & configure monthly budget |
| **📊 Dashboard** | `/dashboard` | Central allowance cockpit & transaction feed |
| **💸 Add Expense** | `/add-expense` | Log and manage daily expenses |
| **📈 Analytics** | `/analytics` | Category breakdowns & weekly trend graphs |
| **🎙️ Voice AI** | `/voice` | Speech recognition hands-free logger |
| **🎁 Rewards Hub** | `/rewards` | Streaks, gems & unlockable student perks |
| **💓 Mood Tracker** | `/mood` | Emotional spending triggers & habit index |
| **⚙️ Settings** | `/settings` | Profile preferences, budget targets & export |

---

## 👩‍💻 Author & Credits

Developed with ❤️ by **Kaveri Jadhao**  
*Computer Science & Engineering Student*

- 🐙 **GitHub**: [@KaveriJadhao](https://github.com/KaveriJadhao)
- 📁 **Repository**: [https://github.com/KaveriJadhao/PocketPilot](https://github.com/KaveriJadhao/PocketPilot)
- 🌐 **Live Demo**: [https://pocket-pilot-three.vercel.app/](https://pocket-pilot-three.vercel.app/)

---

## 📄 License

This project is licensed under the **ISC License**. Open-source and free for all students.
