
const inputText = document.getElementById("inputText");
const characterCount = document.getElementById("characterCount");
const summarizeBtn = document.getElementById("summarizeBtn");
const statusElement = document.getElementById("status");
const summarySection = document.getElementById("summarySection");
const summaryResult = document.getElementById("summaryResult");

const API_URL = "http://localhost:3000/api/summarize";

// Update the character count as the user types or pastes text.
inputText.addEventListener("input", () => {
  characterCount.textContent =
    `${inputText.value.length} / 30000 characters`;
});

summarizeBtn.addEventListener("click", async () => {
  const text = inputText.value.trim();

  // Validate the input before calling the API.
  if (!text) {
    statusElement.textContent = "Please enter some text first.";
    summarySection.hidden = true;
    return;
  }

  if (text.length > 30000) {
    statusElement.textContent =
      "Text must not exceed 30,000 characters.";
    summarySection.hidden = true;
    return;
  }

  summarizeBtn.disabled = true;
  summarizeBtn.textContent = "Summarizing...";
  statusElement.textContent = "Sending text to the AI service...";
  summaryResult.textContent = "";
  summarySection.hidden = true;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed (${response.status}).`
      );
    }

    if (!data.summary) {
      throw new Error("The API returned an empty summary.");
    }

    summaryResult.textContent = data.summary;
    summarySection.hidden = false;
    statusElement.textContent = "Summary generated successfully!";
  } catch (error) {
    console.error("Widget summarization error:", error);

    if (error instanceof TypeError) {
      statusElement.textContent =
        "Could not connect to the backend. Check that your server is running.";
    } else {
      statusElement.textContent =
        error.message || "Something went wrong.";
    }
  } finally {
    summarizeBtn.disabled = false;
    summarizeBtn.textContent = "Summarize Text";
  }
});
