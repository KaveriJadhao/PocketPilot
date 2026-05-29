async function loadAnalytics(){

    const response = await fetch("http://localhost:5000/api/expenses");
    const expenses = await response.json();

    let total = 0;
    let food = 0;
    let travel = 0;
    let shopping = 0;
    let other = 0;

    expenses.forEach((expense) => {
        total += expense.amount;

        const category = expense.category.toLowerCase();

        if(category === "food"){
            food += expense.amount;
        } else if(category === "travel"){
            travel += expense.amount;
        } else if(category === "shopping"){
            shopping += expense.amount;
        } else {
            other += expense.amount;
        }
    });

    document.getElementById("totalSpending").innerText = "₹" + total;
    document.getElementById("foodSpending").innerText = "₹" + food;
    document.getElementById("travelSpending").innerText = "₹" + travel;

    const categoryTotals = {
        Food: food,
        Travel: travel,
        Shopping: shopping,
        Other: other
    };

    const highest = Object.keys(categoryTotals).reduce((a, b) =>
        categoryTotals[a] > categoryTotals[b] ? a : b
    );

    document.getElementById("highestCategory").innerText = highest;

    createCategoryChart(food, travel, shopping, other);
    createWeeklyChart(expenses);
}

function createCategoryChart(food, travel, shopping, other){

    const ctx = document.getElementById("categoryChart");

    new Chart(ctx, {
        type:"doughnut",
        data:{
            labels:["Food", "Travel", "Shopping", "Other"],
            datasets:[{
                data:[food, travel, shopping, other],
                backgroundColor:["#6c63ff", "#22c55e", "#f59e0b", "#ef4444"],
                borderWidth:0
            }]
        },
        options:{
            plugins:{
                legend:{
                    position:"bottom"
                }
            }
        }
    });
}

function createWeeklyChart(expenses){

    const weeklyData = [0,0,0,0,0,0,0];

    expenses.forEach((expense, index) => {
        const dayIndex = index % 7;
        weeklyData[dayIndex] += expense.amount;
    });

    const ctx = document.getElementById("weeklyChart");

    new Chart(ctx, {
        type:"line",
        data:{
            labels:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets:[{
                data:weeklyData,
                borderColor:"#6c63ff",
                backgroundColor:"rgba(108,99,255,0.12)",
                fill:true,
                tension:0.4
            }]
        },
        options:{
            plugins:{
                legend:{
                    display:false
                }
            }
        }
    });
}

loadAnalytics();