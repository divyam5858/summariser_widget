
const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({ apiKey });

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function generateSummary(text) {
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Summarize the following text clearly.
Preserve the main ideas and important facts.
Do not add information that is not in the text.

TEXT:
${text}`,
      });

      const summary = response.text?.trim();

      if (!summary) {
        throw new Error("The AI returned an empty summary.");
      }

      return summary;
    } catch (error) {
      const status = error.status ?? error.code;
      const isTemporary = status === 503 || status === 429;

      if (!isTemporary || attempt === maxRetries) {
        console.error("Gemini request failed:", status, error.message);
        throw error;
      }

      const delay = 1000 * 2 ** attempt;

      console.log(
        `Gemini temporarily unavailable. Retrying in ${delay / 1000}s...`
      );

      await sleep(delay);
    }
  }
}

module.exports = { generateSummary };
