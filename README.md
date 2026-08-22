# 🧭 PocketPilot

**PocketPilot** is a simple, smart, and gamified expense tracker designed for college students. It helps you track daily spends hands-free using Voice AI, stay within your monthly budget, detect emotional spending habits, and earn rewards for saving.

---

## ✨ Key Features

- 🎙️ **Voice AI Logging**: Speak naturally (e.g., *"Spent ₹60 for canteen lunch"*) to log expenses in 2 seconds.
- 📊 **Smart Budget Cockpit**: Real-time tracking of your monthly allowance, total spent, and safe daily limits.
- 😊 **Mood Spending Habits**: Tag expenses with moods (*Happy, Stressed, Bored, Sad*) to curb impulse shopping.
- 🎮 **Streaks & Student Rewards**: Maintain daily logging streaks, earn gems, and unlock student food discount coupons.
- 🧠 **AI Financial Advice**: Daily personalized tips in ₹ to help you save more money.
- 🔐 **Secure & Private**: JWT authentication, password encryption, and a 1-tap Guest Demo mode.
- 🌓 **Dark & Light Mode**: Seamless Swiss Sapphire design with full theme toggle across all devices.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 Variables, Vanilla JavaScript (ES6+), Chart.js, Web Speech API, FontAwesome.
- **Backend**: Node.js, Express.js (v5), JSON Web Tokens (JWT), bcryptjs.
- **Database / AI**: MongoDB Atlas (with zero-failure offline JSON fallback) & Groq Llama 3.3 AI.

---

## 🚀 Quick Start (Run Locally)

### 1. Clone the Repository
```bash
git clone https://github.com/KaveriJadhao/PocketPilot.git
cd PocketPilot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Application
```bash
# Start server
node Backend/server.js
```

Open **[http://localhost:5000](http://localhost:5000)** in your browser! 🎉

---

## 🧭 Application Pages

| Page | URL | Purpose |
| :--- | :--- | :--- |
| **🏠 Landing Page** | `/` | Overview, features & demo introduction |
| **🔐 Sign In** | `/login` | Access your student account |
| **✍️ Create Account** | `/signup` | Register a new profile |
| **🧭 Setup Profile** | `/onboarding` | Choose avatar & set monthly budget |
| **📊 Dashboard** | `/dashboard` | Central budget cockpit & recent transactions |
| **💸 Add Expense** | `/add-expense` | Log and manage daily expenses |
| **📈 Analytics** | `/analytics` | Category breakdowns & weekly spending trends |
| **🎙️ Voice AI** | `/voice` | Hands-free voice speech recognition logger |
| **🎁 Rewards** | `/rewards` | Streaks, gems & student discount vouchers |
| **💓 Mood Tracker** | `/mood` | Emotional impulse spending insights |
| **⚙️ Settings** | `/settings` | Profile preferences, budget limits & theme |

---

## 👩‍💻 Author

Developed with ❤️ by **Kaveri Jadhao**  
- **GitHub**: [@KaveriJadhao](https://github.com/KaveriJadhao)  
- **Repository**: [https://github.com/KaveriJadhao/PocketPilot](https://github.com/KaveriJadhao/PocketPilot)

---

## 📄 License

This project is licensed under the **ISC License**. Open-source and free for students.
