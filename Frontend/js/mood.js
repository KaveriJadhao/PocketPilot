async function loadMoodData(){

    const response = await fetch("http://localhost:5000/api/expenses");
    const expenses = await response.json();

    let happy = 0;
    let stressed = 0;
    let bored = 0;
    let sad = 0;

    const container = document.getElementById("moodTransactions");
    container.innerHTML = "";

    expenses.forEach((expense) => {
        const mood = expense.mood || "";

        if(mood.includes("Happy")){
            happy += expense.amount;
        }

        if(mood.includes("Stressed")){
            stressed += expense.amount;
        }

        if(mood.includes("Bored")){
            bored += expense.amount;
        }

        if(mood.includes("Sad")){
            sad += expense.amount;
        }

        container.innerHTML += `
            <div class="transaction">
                <div>
                    <h3>${expense.title}</h3>
                    <p>${expense.category} • ${expense.mood || "No mood"}</p>
                </div>

                <div class="amount">₹${expense.amount}</div>
            </div>
        `;
    });

    document.getElementById("happyAmount").innerText = "₹" + happy;
    document.getElementById("stressedAmount").innerText = "₹" + stressed;
    document.getElementById("boredAmount").innerText = "₹" + bored;
    document.getElementById("sadAmount").innerText = "₹" + sad;
}

loadMoodData();