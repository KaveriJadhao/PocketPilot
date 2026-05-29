let pieChart = null;
let lineChart = null;

async function getExpenses(){
    const response = await fetch("http://localhost:5000/api/expenses");
    return await response.json();
}

async function getUser(){
    const response = await fetch("http://localhost:5000/api/user");
    return await response.json();
}

function loadSettingsData(){
    const savedName = localStorage.getItem("userName") || "User";

    document.getElementById("dashboardUserName").innerText =
        "Hello, " + savedName + " 👋";
}

async function loadDashboardData(){

    const expenses = await getExpenses();

    const starterGuide = document.getElementById("starterGuide");
    starterGuide.style.display = "flex";

    const welcomeState = document.getElementById("welcomeState");

    if(expenses.length === 0){
        welcomeState.style.display = "flex";
    }
    else{
        welcomeState.style.display = "none";
    }

    let totalExpenses = 0;

    expenses.forEach((expense)=>{
        totalExpenses += Number(expense.amount);
    });

    const totalBalance =
        Number(localStorage.getItem("monthlyBudget")) || 15000;

    const savings = totalBalance - totalExpenses;

    document.getElementById("monthlyExpenses").innerText =
        `₹ ${totalExpenses}`;

    document.getElementById("totalBalance").innerText =
        `₹ ${totalBalance}`;

    document.getElementById("totalSavings").innerText =
        `₹ ${savings}`;
}

async function loadUserData(){

    const user = await getUser();

    document.getElementById("streakDays").innerText =
        user.streak === 1 ? "1 Day" : user.streak + " Days";

    document.getElementById("levelValue").innerText =
        "Level " + user.level;

    document.getElementById("gemsValue").innerText =
        user.gems + " 💎";

    document.getElementById("levelDisplay").innerText =
        "Level " + user.level + " 🎮";

    document.querySelector(".next-level-text").innerText =
        "Progress to Level " + (user.level + 1);

    const progress = user.gems % 50;

    document.getElementById("rewardProgress").style.width =
        (progress / 50) * 100 + "%";
}

async function loadChart(){

    const expenses = await getExpenses();

    let food = 0;
    let travel = 0;
    let shopping = 0;
    let other = 0;

    expenses.forEach((exp)=>{
        const category = exp.category.toLowerCase();

        if(category === "food"){
            food += Number(exp.amount);
        }
        else if(category === "travel"){
            travel += Number(exp.amount);
        }
        else if(category === "shopping"){
            shopping += Number(exp.amount);
        }
        else{
            other += Number(exp.amount);
        }
    });

    if(expenses.length === 0){
        food = 1;
        travel = 1;
        shopping = 1;
        other = 1;
    }

    const ctx = document.getElementById("expenseChart");

    if(pieChart){
        pieChart.destroy();
    }

    pieChart = new Chart(ctx, {
        type:"doughnut",
        data:{
            labels:["Food", "Travel", "Shopping", "Other"],
            datasets:[{
                data:[food, travel, shopping, other],
                backgroundColor:[
                    "#6c63ff",
                    "#22c55e",
                    "#f59e0b",
                    "#ef4444"
                ],
                borderWidth:0
            }]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{
                    display:false
                }
            }
        }
    });
}

async function loadTransactions(){

    const expenses = await getExpenses();

    const container =
        document.getElementById("transactionsContainer");

    container.innerHTML = "";

    if(expenses.length === 0){
        container.innerHTML = `
            <div class="transaction">
                <div class="transaction-left">
                    <h3>No transactions yet</h3>
                    <p>Your recent expenses will appear here.</p>
                </div>
                <div class="transaction-amount">₹0</div>
            </div>
        `;
        return;
    }

    expenses.slice(0,5).forEach((expense)=>{
        container.innerHTML += `
            <div class="transaction">
                <div class="transaction-left">
                    <h3>${expense.title}</h3>
                    <p>${expense.category} • ${expense.mood || "No mood"}</p>
                </div>

                <div class="transaction-amount">
                    ₹${expense.amount}
                </div>
            </div>
        `;
    });
}

async function loadBudgetProgress(){

    const expenses = await getExpenses();

    let foodTotal = 0;
    let travelTotal = 0;

    expenses.forEach((expense)=>{
        const category = expense.category.toLowerCase();

        if(category === "food"){
            foodTotal += Number(expense.amount);
        }

        if(category === "travel"){
            travelTotal += Number(expense.amount);
        }
    });

    const foodLimit = 5000;
    const travelLimit = 10000;

    const foodPercent = Math.min((foodTotal / foodLimit) * 100, 100);
    const travelPercent = Math.min((travelTotal / travelLimit) * 100, 100);

    document.querySelector(".food-progress").style.width =
        `${foodPercent}%`;

    document.querySelector(".travel-progress").style.width =
        `${travelPercent}%`;

    document.getElementById("foodBudgetText").innerText =
        `₹${foodTotal} / ₹${foodLimit}`;

    document.getElementById("travelBudgetText").innerText =
        `₹${travelTotal} / ₹${travelLimit}`;
}

async function loadLineChart(){

    const expenses = await getExpenses();

    const weeklyData = [0,0,0,0,0,0,0];

    expenses.forEach((expense,index)=>{
        const weekIndex = index % 7;
        weeklyData[weekIndex] += Number(expense.amount);
    });

    const ctx = document.getElementById("lineChart");

    if(lineChart){
        lineChart.destroy();
    }

    lineChart = new Chart(ctx, {
        type:"line",
        data:{
            labels:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets:[{
                data:weeklyData,
                borderColor:"#6c63ff",
                backgroundColor:"rgba(108,99,255,0.1)",
                fill:true,
                tension:0.4
            }]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{
                    display:false
                }
            },
            scales:{
                y:{
                    beginAtZero:true
                }
            }
        }
    });
}

async function loadAIInsights(){

    try{
        const response =
            await fetch("http://localhost:5000/api/ai/insights");

        const data = await response.json();

        document.getElementById("aiInsightCard").innerText =
            data.insight;
    }
    catch(error){
        document.getElementById("aiInsightCard").innerText =
            "Unable to load AI insights.";
    }
}

async function loadSmartAlerts(){

    const expenses = await getExpenses();

    const alertsBox = document.getElementById("alertsBox");

    let food = 0;
    let total = 0;

    expenses.forEach((expense)=>{
        total += Number(expense.amount);

        if(expense.category.toLowerCase() === "food"){
            food += Number(expense.amount);
        }
    });

    if(expenses.length === 0){
        alertsBox.innerText =
            "Add your first expense to receive smart alerts.";
        return;
    }

    let alerts = "";

    if(food > 4000){
        alerts += "⚠️ Food budget is close to limit.\n";
    }

    if(total > 10000){
        alerts += "🚨 Monthly spending is getting high.\n";
    }

    if(expenses.length >= 5){
        alerts += "🔥 Great! You are tracking expenses regularly.\n";
    }

    if(alerts === ""){
        alerts = "✅ Your spending looks under control.";
    }

    alertsBox.innerText = alerts;
}

function setupDarkMode(){

    const darkModeToggle =
        document.getElementById("darkModeToggle");

    if(localStorage.getItem("theme") === "dark"){
        document.body.classList.add("dark");
    }

    darkModeToggle.addEventListener("click", ()=>{
        document.body.classList.toggle("dark");

        if(document.body.classList.contains("dark")){
            localStorage.setItem("theme","dark");
        }
        else{
            localStorage.setItem("theme","light");
        }
    });
}

async function initDashboard(){

    loadSettingsData();
    setupDarkMode();

    await loadDashboardData();
    await loadUserData();
    await loadChart();
    await loadTransactions();
    await loadBudgetProgress();
    await loadLineChart();
    await loadAIInsights();
    await loadSmartAlerts();
}

initDashboard();