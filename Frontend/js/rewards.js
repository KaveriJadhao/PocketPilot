async function loadRewardsPage(){

    const response = await fetch("http://localhost:5000/api/user");
    const user = await response.json();

    document.getElementById("gemsValue").innerText =
        user.gems + " 💎";

    document.getElementById("levelValue").innerText =
        "Level " + user.level + " 🎮";

    document.getElementById("nextLevelText").innerText =
        "Progress to Level " + (user.level + 1);

    const progress = user.gems % 50;

    document.getElementById("rewardProgress").style.width =
        (progress / 50) * 100 + "%";

    checkMilestone(user.gems, 50, "milestone50");
    checkMilestone(user.gems, 100, "milestone100");
    checkMilestone(user.gems, 200, "milestone200");
    checkMilestone(user.gems, 500, "milestone500");
}

function checkMilestone(gems, required, id){
    if(gems >= required){
        document.getElementById(id).classList.add("achieved");
    }
}

loadRewardsPage();