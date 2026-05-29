const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

/* SIGNUP */
if(signupForm){

    signupForm.addEventListener("submit", (e) => {

        e.preventDefault();

        alert("Account created successfully ✅ Please login now.");

        window.location.href = "login.html";

    });

}

/* LOGIN */
if(loginForm){

    loginForm.addEventListener("submit", (e) => {

        e.preventDefault();

        if(localStorage.getItem("onboardingDone") === "true"){

            window.location.href = "dashboard.html";

        }
        else{

            window.location.href = "onboarding.html";

        }

    });

}

console.log("PocketPilot Auth Loaded");