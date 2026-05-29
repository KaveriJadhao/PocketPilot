const moods = document.querySelectorAll(".mood");
const form = document.getElementById("expenseForm");
const expenseContainer = document.getElementById("expenseContainer");

let selectedMood = "";

moods.forEach((mood) => {
    mood.addEventListener("click", () => {
        moods.forEach((item) => {
            item.style.background = "#f3f4f6";
            item.style.color = "#111827";
        });

        mood.style.background = "#6c63ff";
        mood.style.color = "white";
        selectedMood = mood.innerText;
    });
});

async function fetchExpenses() {
    const response = await fetch("http://localhost:5000/api/expenses");
    const expenses = await response.json();

    expenseContainer.innerHTML = "";

    expenses.reverse().forEach((expense) => {
        expenseContainer.innerHTML += `
            <div class="expense-card">
                <div>
                    <h3>${expense.title}</h3>
                    <p>${expense.category} • ${expense.mood || "No mood"}</p>
                </div>
                <div class="amount">₹${expense.amount}</div>
            </div>
        `;
    });
}

function showToast() {
    const toast = document.getElementById("toast");

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const expenseData = {
        title: document.getElementById("title").value,
        amount: Number(document.getElementById("amount").value),
        category: document.getElementById("category").value,
        mood: selectedMood
    };

    const response = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(expenseData)
    });

    if (response.ok) {
        showToast();
        form.reset();
        selectedMood = "";
        fetchExpenses();
    }
});

fetchExpenses();
