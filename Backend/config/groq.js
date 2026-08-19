require("dotenv").config();
const Groq = require("groq-sdk");

const apiKey = process.env.GROQ_API_KEY || "gsk_placeholder_key_for_offline_mode";

let groq;
try {
  groq = new Groq({ apiKey });
} catch (error) {
  console.warn("Groq Client init warning:", error.message);
  groq = {
    chat: {
      completions: {
        create: async () => {
          throw new Error("Groq API key not configured");
        },
      },
    },
  };
}

module.exports = groq;