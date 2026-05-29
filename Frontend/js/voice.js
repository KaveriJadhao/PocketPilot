const voiceBtn = document.getElementById("voiceBtn");
const spokenText = document.getElementById("spokenText");
const detectedData = document.getElementById("detectedData");

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    spokenText.innerText =
        "Speech recognition is not supported in this browser. Please use Chrome.";
} else {
    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    voiceBtn.addEventListener("click", () => {
        recognition.start();
        voiceBtn.classList.add("listening");
        spokenText.innerText = "Listening...";
    });

    recognition.onresult = async (event) => {
        const command = event.results[0][0].transcript;

        spokenText.innerText = command;
        voiceBtn.classList.remove("listening");

        processVoiceCommand(command);
    };

    recognition.onerror = () => {
        voiceBtn.classList.remove("listening");
        spokenText.innerText = "Could not hear clearly. Try again.";
    };
}

async function processVoiceCommand(command){

    const lowerCommand = command.toLowerCase();

    const amountMatch = lowerCommand.match(/\d+/);
    const amount = amountMatch ? Number(amountMatch[0]) : null;

    let category = "Other";
    let title = "Voice Expense";

    if(lowerCommand.includes("pizza")){
        category = "Food";
        title = "Pizza";
    }
    else if(lowerCommand.includes("coffee")){
        category = "Food";
        title = "Coffee";
    }
    else if(lowerCommand.includes("food")){
        category = "Food";
        title = "Food";
    }
    else if(lowerCommand.includes("bus")){
        category = "Travel";
        title = "Bus";
    }
    else if(lowerCommand.includes("ticket")){
        category = "Travel";
        title = "Ticket";
    }
    else if(lowerCommand.includes("book")){
        category = "Education";
        title = "Book";
    }
    else if(lowerCommand.includes("pen")){
        category = "Education";
        title = "Pen";
    }
    else if(lowerCommand.includes("shopping")){
        category = "Shopping";
        title = "Shopping";
    }

    if(!amount){
        detectedData.innerText = "Could not detect amount.";
        return;
    }

    const expenseData = {
        title: title,
        amount: amount,
        category: category,
        mood: "Voice Added"
    };

    const response = await fetch("http://localhost:5000/api/expenses", {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(expenseData)
    });

    if(response.ok){
        detectedData.innerText =
            `✅ Added: ${title} | ₹${amount} | ${category}`;
    }
}